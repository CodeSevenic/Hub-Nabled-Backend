const request = require('request-promise-native');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const { default: axios } = require('axios');
const Bottleneck = require('bottleneck');

// Initialize the rate limiter
const limiter = new Bottleneck({
  minTime: 500, // minimum time between job starts is 500ms
});

async function formatContact(id, firstName, lastName, email, accessToken) {
  if (!firstName && !lastName && email) {
    let [potentialFirstName, potentialLastName] = email.split('@')[0].split('.');

    if (potentialFirstName) {
      potentialFirstName = potentialFirstName.replace(/[^a-zA-Z]/g, '');
      potentialFirstName = potentialFirstName.charAt(0).toUpperCase() + potentialFirstName.slice(1);
    }

    if (potentialLastName) {
      potentialLastName = potentialLastName.replace(/[^a-zA-Z]/g, '');
      potentialLastName = potentialLastName.charAt(0).toUpperCase() + potentialLastName.slice(1);
    }

    if (!potentialFirstName && !potentialLastName) {
      potentialFirstName = 'Unknown';
    }

    firstName = potentialFirstName;
    lastName = potentialLastName || '';
  }

  try {
    await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
      {
        properties: {
          firstname: firstName,
          lastname: lastName,
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

const fetchAllContacts = async (accessToken) => {
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

      let url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100${
        after ? `&after=${after}` : ''
      }`;

      const { data } = await axios.get(url, { headers });

      // Add the retrieved contacts to the 'allContacts' array
      allContacts = [...allContacts, ...data.results];

      // If there's a next page, prepare to fetch it in the next loop iteration
      if (data.paging && data.paging.next) {
        after = data.paging.next.after;
      } else {
        keepGoing = false;
      }
    } catch (error) {
      console.error('Failed to retrieve contacts: ', error.message);
      keepGoing = false;
    }
  }

  return allContacts;
};

const unknownContactNameCreator = async (userId, portalId, req, isWebhook) => {
  console.log('isWebhook', isWebhook);
  const authorized = await isAuthorized(userId, portalId);

  if (!authorized) {
    console.log('User is not authorized.');
    return;
  }

  try {
    const accessToken = await getAccessToken(userId, portalId);

    if (isWebhook == true) {
      const webhooksEvent = req.body;
      for (const event of webhooksEvent) {
        const contactId = event.objectId;
        let email = null;

        if (event.propertyName === 'email') {
          email = event.propertyValue;
        }

        await formatContact(contactId, null, null, email, accessToken);
      }
    } else {
      // Fetch all contacts with pagination
      const allContacts = await fetchAllContacts(accessToken);

      // Use the rate limiter to update the contacts
      allContacts.forEach((element) => {
        const email = element.properties ? element.properties.email : null;
        limiter.schedule(() => formatContact(element.id, null, null, email, accessToken));
      });
    }
  } catch (error) {
    console.log('unknownContactNameCreator error: ', error.message);
  }
};

module.exports = unknownContactNameCreator;
