const { fetchHubSpotContacts } = require('../fetchContacts');

exports.featuresList = {
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
