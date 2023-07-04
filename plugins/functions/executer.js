const { getUserFeatures } = require('../../firebase/features');
const { featuresList } = require('./featureList');

exports.executeFeatureAction = async (userId, hubspotId, featureId) => {
  try {
    // Check if the feature is enabled for the user
    const userFeatures = await getUserFeatures(userId, hubspotId);
    const feature = featuresList[featureId];
    if (!userFeatures[featureId]) {
      console.log(
        `Feature ${featureId} is not enabled for user ${userId} in hubspot account ${hubspotId}`
      );
      return 'notEnabled';
    }

    // Execute the associated action
    const result = await feature.function(userId, hubspotId);
    console.log(`Executed feature ${featureId} for user ${userId} in hubspot account ${hubspotId}`);
    return 'success';
  } catch (error) {
    console.error(
      `Failed to execute feature ${featureId} for user ${userId} in hubspot account ${hubspotId}: `,
      error.message
    );
    throw error; // Re-throw the error so it can be caught by the route handler
  }
};
