const { fetchHubSpotContacts } = require('../fetchContacts');
const nameFormatter = require('../nameFormatter');

exports.featuresList = {
  contacts: {
    name: 'Fetch Hubspot Contacts',
    function: fetchHubSpotContacts,
    description: "Fetches contacts from a user's HubSpot account",
    featureId: 'contacts',
  },
  nameFormatter: {
    name: 'Hubspot name Formatter',
    function: nameFormatter,
    description: "Formats contacts from a user's HubSpot account",
    featureId: 'nameFormatter',
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
