const { default: axios } = require('axios');
const { getAccessToken, isAuthorized } = require('../services/hubspot');

// Define an async function to get contacts
const fetchContacts = async (accessToken) => {
  console.log('=== Retrieving all contacts from HubSpot using the access token ===');

  let after = '';

  let allContacts = [];

  let keepGoing = true;

  // Keep making requests until all contacts are retrieved
  while (keepGoing) {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      let url = 'https://api.hubapi.com/crm/v3/objects/contacts?limit=100';

      // If there is an 'after' value, append it to the URL
      if (after) {
        url += `&after=${after}`;
      }

      const { data } = await axios.get(url, { headers });

      // Add the retrieved contacts to the 'allContacts' array
      allContacts = [...allContacts, ...data.results];

      if (data.paging) {
        after = data.paging.next.after;
      } else {
        keepGoing = false;
      }
    } catch (e) {
      console.error('Error Unable to retrieve contacts');
      keepGoing = false;
    }
  }

  return allContacts;
};

const fetchHubSpotContacts = async (userId, portalId) => {
  const authorized = await isAuthorized(userId, portalId);
  if (authorized) {
    const accessToken = await getAccessToken(userId, portalId);

    const contacts = await fetchContacts(accessToken);
    console.log('Contacts', contacts);
    return contacts;
  } else {
    console.log('User is not authorized or has not installed an app');

    // Throw an error if the user is not authorized
    throw new Error('You are not authorized or has not installed an app');
  }
};

module.exports = {
  fetchHubSpotContacts,
};
