const { getUserFeatures } = require('../../firebase/features');

// Import the feature functions
const { fetchHubSpotContacts } = require('./path_to_your_file'); // Replace with the actual path to your file

const featuresList = {
  contacts: {
    name: 'Fetch Hubspot Contacts',
    function: fetchHubSpotContacts,
    description: "Fetches contacts from a user's Hubspot account",
  },
  // Add other feature-function mappings here...
};

exports.getAllFeatures = () => {
  return Object.values(featuresList);
};

exports.getEnabledFeatures = async (userId, hubspotId) => {
  const userFeatures = await getUserFeatures(userId, hubspotId);
  const enabledFeatureKeys = Object.keys(userFeatures).filter((feature) => userFeatures[feature]);

  const enabledFeatures = enabledFeatureKeys.map((featureKey) => {
    const feature = featuresList[featureKey];
    return {
      name: feature.name,
      description: feature.description,
      featureId: featureKey,
    };
  });

  return enabledFeatures;
};
