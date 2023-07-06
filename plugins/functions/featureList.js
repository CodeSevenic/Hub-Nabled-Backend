const { createContactAndCustomObject } = require('../createContactAndCustomObject');
const { createObjectSchema } = require('../createObjectSchema');
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
  createObjectSchema: {
    name: 'Object Schema Creator',
    function: createObjectSchema,
    description: 'Create Object Schema in your connected HubSpot portal',
    featureId: 'createObjectSchema',
  },
  createContactAndCustomObject: {
    name: 'Create Contact and Custom Object',
    function: createContactAndCustomObject,
    description:
      'Create a contact and associate it with a custom object in your connected HubSpot portal',
    featureId: 'createContactAndCustomObject',
  },
  createContactAndCustomObject: {
    name: 'Dance',
    function: createContactAndCustomObject,
    description:
      'Create a contact and associate it with a custom object in your connected HubSpot portal',
    featureId: 'dance',
  },
  // Add other feature-function mappings here...
};
