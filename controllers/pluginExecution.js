const { executeFeatureAction } = require('../plugins/functions/executer');

exports.pluginExecution = async (req, res) => {
  const { userId, hubspotId, featureId } = req.params;

  console.log(`Executing feature ${featureId} for user ${userId} in hubspot account ${hubspotId}`);

  try {
    // Use the `executeFeatureAction` function to execute the feature
    const result = await executeFeatureAction(userId, hubspotId, featureId);

    // Send a response based on the result
    switch (result) {
      case 'success':
        res.json({
          message: `Executed feature ${featureId} for user ${userId} in hubspot account ${hubspotId}`,
        });
        break;
      case 'notEnabled':
        res.status(400).json({
          message: `Feature ${featureId} is not enabled for user ${userId} in hubspot account ${hubspotId}`,
        });
        break;
      default:
        throw new Error('Unexpected result from executeFeatureAction function');
    }
  } catch (error) {
    // If there's an error, send an error message
    res.status(500).json({
      message: `Failed to execute feature ${featureId} for user ${userId} in hubspot account ${hubspotId}: ${error.message}`,
    });
  }
};
