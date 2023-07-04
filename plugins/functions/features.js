const { getUserFeatures } = require('../../firebase/features');
const { fetchHubSpotContacts } = require('../fetchContacts');

// Import the feature functions

const featuresList = {
  contacts: {
    name: 'Fetch Hubspot Contacts',
    function: fetchHubSpotContacts,
    description: "Fetches contacts from a user's HubSpot account",
    featureId: 'contacts',
  },
  contactFormatter: {
    name: 'Hubspot Contact Formatter',
    function: fetchHubSpotContacts,
    description: "Formats contacts from a user's HubSpot account",
    featureId: 'contactFormatter',
  },
  deals: {
    name: 'Deals Explorer',
    function: fetchHubSpotContacts,
    description: "Fetches deals from a user's HubSpot account",
    featureId: 'deals',
  },
  lists: {
    name: 'List View',
    function: fetchHubSpotContacts,
    description: "Fetches lists from a user's HubSpot account",
    featureId: 'lists',
  },
  // Add other feature-function mappings here...
};

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
      name: feature.name,
      description: feature.description,
      featureId: featureKey,
    };
  });

  return enabledFeatures;
};
