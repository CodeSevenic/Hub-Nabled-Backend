const { pluginExecution } = require('../../controllers/pluginExecution');
const { getUserIdByPortalId } = require('../../firebase/firebaseAdmin');

const eventToFeatureMap = {
  'contact.created': ['feature1', 'feature2'],
  'contact.propertyChange': ['nameFormatter'],
  // ...
};

exports.webhookEvents = async (req, res) => {
  console.log('webhooksEvent', req.body);
  res.status(200).end();

  if (req.body[0]) {
    const portalId = String(req.body[0].portalId);
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
};
