const { pluginExecution } = require('../../controllers/pluginExecution');
const { getUserIdByPortalId } = require('../../firebase/firebaseAdmin');

const eventToFeatureMap = {
  'contact.created': 'feature1',
  'contact.updated': 'feature2',
  // ...
};

exports.webhookEvents = async (req, res) => {
  console.log('webhooksEvent', req.body);
  res.status(200).end();

  if (req.body[0]) {
    const portalId = String(req.body[0].portalId);
    const eventType = req.body[0].subscriptionType; // Assuming subscriptionType is at req.body[0].subscriptionType
    const featureId = eventToFeatureMap[subscriptionType];
    console.log('portalId', portalId);

    // Get userId by portalId
    const userId = await getUserIdByPortalId(portalId);

    if (featureId) {
      // Create a mock request and response object to be used in the pluginExecution function
      const mockReq = { params: { userId, hubspotId: portalId, featureId } };
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

      // Call pluginExecution function
      await pluginExecution(mockReq, mockRes, true);
    } else {
      console.log(`No feature mapped for event ${eventType}`);
    }
  }
};
