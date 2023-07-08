const request = require('request-promise-native');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const { default: axios } = require('axios');
const Bottleneck = require('bottleneck');

// Initialize the rate limiter
const limiter = new Bottleneck({
  minTime: 500, // minimum time between job starts is 500ms
});

async function formatContact(id, firstName, lastName, accessToken) {
  const newName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.substr(1).toLowerCase()
    : '';
  const newLastName = lastName
    ? lastName.charAt(0).toUpperCase() + lastName.substr(1).toLowerCase()
    : '';

  try {
    await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
      {
        properties: {
          firstname: newName,
          lastname: newLastName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Failed to update contact: ', error.message);
  }
}

async function getContact(accessToken, after = '') {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const results = await request.get(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&after=${after}`,
      { headers: headers }
    );
    return JSON.parse(results);
  } catch (e) {
    console.error('Unable to retrieve contact: ', e.message);
  }
}

async function fetchAllContacts(accessToken) {
  let after = '';
  let allContacts = [];

  while (true) {
    const response = await getContact(accessToken, after);
    allContacts = allContacts.concat(response.results);

    if (response.paging && response.paging.next) {
      after = response.paging.next.after;
    } else {
      break;
    }
  }

  return allContacts;
}

const nameFormatter = async (userId, portalId, req, isWebhook) => {
  const authorized = await isAuthorized(userId, portalId);

  if (!authorized) {
    console.log('User is not authorized.');
    return;
  }

  try {
    const accessToken = await getAccessToken(userId, portalId);
    const contactId = req.body && req.body[0].objectId ? req.body[0].objectId : null;

    if (isWebhook) {
      const { firstname, lastname } = req.body;
      formatContact(contactId, firstname, lastname, accessToken);
    } else {
      // Fetch all contacts with pagination
      const allContacts = await fetchAllContacts(accessToken);

      // Use the rate limiter to update the contacts
      allContacts.forEach((element) => {
        limiter.schedule(() =>
          formatContact(
            element.id,
            element.properties.firstname,
            element.properties.lastname,
            accessToken
          )
        );
      });
    }
  } catch (error) {
    console.log('nameFormatter error: ', error.message);
  }
};

module.exports = nameFormatter;
