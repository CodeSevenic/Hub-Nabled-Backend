const { executeFeatureAction } = require('../plugins/functions/executer');

exports.pluginExecution = async (req, res) => {
  const { userId, hubspotId, featureName } = req.params;

  try {
    // Use the `executeFeatureAction` function to execute the feature
    const result = await executeFeatureAction(userId, hubspotId, featureName);

    // Send a response based on the result
    switch (result) {
      case 'success':
        res.json({
          message: `Executed feature ${featureName} for user ${userId} in hubspot account ${hubspotId}`,
        });
        break;
      case 'notEnabled':
        res.status(400).json({
          message: `Feature ${featureName} is not enabled for user ${userId} in hubspot account ${hubspotId}`,
        });
        break;
      case 'noAction':
        res.status(400).json({
          message: `No action associated with feature ${featureName} for user ${userId} in hubspot account ${hubspotId}`,
        });
        break;
      default:
        throw new Error('Unexpected result from executeFeatureAction function');
    }
  } catch (error) {
    // If there's an error, send an error message
    res.status(500).json({
      message: `Failed to execute feature ${featureName} for user ${userId} in hubspot account ${hubspotId}: ${error.message}`,
    });
  }
};
