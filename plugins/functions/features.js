const { getUserFeatures } = require('../../firebase/features');

const featuresList = {
  contacts: {
    function: fetchHubSpotContacts,
    description: "Fetches contacts from a user's Hubspot account",
  },
  // Add other feature-function mappings here...
};

exports.getAllFeatures = () => {
  const featureKeys = Object.keys(featuresList);
  const featureDescriptions = featureKeys.map((feature) => ({
    name: feature,
    description: featuresList[feature].description,
  }));

  return featureDescriptions;
};

exports.getEnabledFeatures = async (userId, hubspotId) => {
  const userFeatures = await getUserFeatures(userId, hubspotId);
  const enabledFeatureKeys = Object.keys(userFeatures).filter((feature) => userFeatures[feature]);

  const enabledFeatureDescriptions = enabledFeatureKeys.map((feature) => ({
    name: feature,
    description: featuresList[feature].description,
  }));

  return enabledFeatureDescriptions;
};
