const { executeFeatureAction } = require('../plugins/functions/executer');

const pluginExecuter = async (req, res) => {
  const { userId, hubspotId, featureName } = req.params;

  try {
    // Use the `executeFeatureAction` function to execute the feature and send a success message
    await executeFeatureAction(userId, hubspotId, featureName);
    res.json({
      message: `Executed feature ${featureName} for user ${userId} in hubspot account ${hubspotId}`,
    });
  } catch (error) {
    // If there's an error, send an error message
    res
      .status(500)
      .json({
        message: `Failed to execute feature ${featureName} for user ${userId} in hubspot account ${hubspotId}: ${error.message}`,
      });
  }
};
