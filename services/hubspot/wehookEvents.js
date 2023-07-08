const { pluginExecution } = require('../../controllers/pluginExecution');
const { getUserIdByPortalId } = require('../../firebase/firebaseAdmin');

exports.webhookEvents = async (req, res) => {
  console.log('webhooksEvent', req.body);
  res.status(200).end();

  if (req.body[0]) {
    const portalId = String(req.body[0].portalId);
    const eventType = req.body[0].eventType; // Assuming eventType is at req.body[0].eventType
    const featureId = eventToFeatureMap[eventType];
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
      await pluginExecution(mockReq, mockRes);
    } else {
      console.log(`No feature mapped for event ${eventType}`);
    }
  }
};
