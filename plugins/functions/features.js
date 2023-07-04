const { getUserFeatures } = require('../../firebase/features');
const { featuresList } = require('./featureList');

// Import the feature functions

exports.getAllFeatures = () => {
  return Object.values(featuresList);
};

exports.getEnabledFeatures = async (userId, hubspotId) => {
  const userFeatures = await getUserFeatures(userId, hubspotId);

  // If user does not have any features, return an empty array
  if (!userFeatures) {
    return [];
  }

  const enabledFeatureKeys = Object.keys(userFeatures).filter((feature) => userFeatures[feature]);

  const enabledFeatures = enabledFeatureKeys.map((featureKey) => {
    const feature = featuresList[featureKey];
    return {
      name: feature?.name,
      description: feature?.description,
      featureId: featureKey,
    };
  });

  return enabledFeatures;
};
