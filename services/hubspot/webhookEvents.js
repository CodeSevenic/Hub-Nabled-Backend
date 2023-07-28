const { pluginExecution } = require('../../controllers/pluginExecution');
const { getUserIdByPortalId, doesPortalExist } = require('../../firebase/firebaseAdmin');
const eventToFeatureMap = {
  'contact.creation': ['threeCX'],
  'contact.propertyChange': ['nameFormatter', 'phoneNumberFormatter', 'unknownContactNameCreator'],
  // ...
};

exports.webhookEvents = async (req, res) => {
  try {
    res.status(200).end();
    for (const event of req.body) {
      const portalId = String(event.portalId);

      if (portalId === '21666725' || portalId === '21520785') {
        console.log('Skipping portalId 21666725 or 21520785');
        continue;
      }

      // if changeSource is INTEGRATION skip
      if (event.changeSource === 'INTEGRATION') {
        console.log('Skipping changeSource', event.changeSource);
        continue;
      }

      // Check if portalId exists in the database before proceeding
      const isPortalExist = await doesPortalExist(portalId);
      if (!isPortalExist) {
        continue;
      }

      console.log('webhooksEvent', event);

      const subscriptionType = event.subscriptionType; // Assuming subscriptionType is at event.subscriptionType
      const featureIds = eventToFeatureMap[subscriptionType]; // This is now an array of feature IDs
      console.log('portalId', portalId);

      // Get userId by portalId
      const userId = await getUserIdByPortalId(portalId);

      if (featureIds && featureIds.length) {
        // Create a mock request and response object to be used in the pluginExecution function
        const mockRes = {
          status: function () {
            return this;
          },
          json: function (result) {
            console.log(result);
          },
          end: function () {
            return this;
          },
        };

        // Iterate over featureIds and execute each one
        for (const featureId of featureIds) {
          const propertyName = event.propertyName;
          const subscriptionType = event.subscriptionType;
          if (
            // Check if the featureId is 'unknownContactNameCreator' and the propertyName is not 'email'
            // OR if the featureId is 'nameFormatter' and the propertyName is not 'lastname' or 'firstname'
            // OR if the featureId is 'phoneNumberFormatter' and the propertyName is not 'phone'
            // OR if featureId is 'threeCX' and subscriptionType is not 'contact.creation'
            // OR if subcriptionType is not 'contact.creation' or 'contact.propertyChange'
            (featureId === 'unknownContactNameCreator' && propertyName !== 'email') ||
            (featureId === 'nameFormatter' &&
              propertyName !== 'lastname' &&
              propertyName !== 'firstname') ||
            (featureId === 'phoneNumberFormatter' && propertyName !== 'phone') ||
            (featureId === 'threeCX' && subscriptionType !== 'contact.creation') ||
            (subscriptionType !== 'contact.creation' &&
              subscriptionType !== 'contact.propertyChange')
          ) {
            console.log(`Skipping featureId ${featureId} for propertyName ${propertyName}`);
            continue;
          }

          const mockReq = { params: { userId, hubspotId: portalId, featureId }, body: [event] }; // Pass event here

          // In the webhookEvents function, before calling pluginExecution
          console.log(
            `Executing featureId ${featureId} for userId ${userId} in hubspotId ${portalId}`
          );

          // Call pluginExecution function
          await pluginExecution(mockReq, mockRes, true);
        }
      } else {
        console.log(`No feature mapped for event ${subscriptionType}`);
      }
    }
  } catch (error) {
    console.error('Error in webhookEvents:', error);
    res.status(500).send('Internal Server Error');
  }
};
