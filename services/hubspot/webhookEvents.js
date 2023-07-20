// BEGIN: ed8c6549bwf9
const { pluginExecution } = require('../../controllers/pluginExecution');
const { getUserIdByPortalId, doesPortalExist } = require('../../firebase/firebaseAdmin');
const eventToFeatureMap = {
  'contact.creation': ['unknownContactNameCreator'],
  'contact.propertyChange': ['nameFormatter', 'phoneNumberFormatter', 'unknownContactNameCreator'],
  // ...
};

exports.webhookEvents = async (req, res) => {
  try {
    res.status(200).end();
    if (req.body[0]) {
      const portalId = String(req.body[0].portalId);

      if (portalId === '21666725' || portalId === '21520785') {
        console.log('Skipping portalId 21666725 or 21520785');
        return;
      }

      // Check if portalId exists in the database before proceeding
      const isPortalExist = await doesPortalExist(portalId);
      if (!isPortalExist) {
        return false;
      }
      console.log('webhooksEvent', req.body);

      const subscriptionType = req.body[0].subscriptionType; // Assuming subscriptionType is at req.body[0].subscriptionType
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
          const mockReq = { params: { userId, hubspotId: portalId, featureId }, body: req.body }; // Pass req.body here

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
