const request = require('request-promise-native');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const { default: axios } = require('axios');
const Bottleneck = require('bottleneck');

// Initialize the rate limiter
const limiter = new Bottleneck({
  minTime: 500, // minimum time between job starts is 500ms
});

function formatName(name) {
  if (typeof name === 'string' && name.length > 0) {
    // Remove special characters and extra white spaces
    name = name.replace(/[^a-zA-Z ]/g, '').replace(/\s+/g, ' ');
    let splitName = name.split(' ');
    // If multiple names are present, consider the first one as the first name
    // and join the rest as the last name
    if (splitName.length > 1) {
      return {
        firstName: splitName[0].charAt(0).toUpperCase() + splitName[0].slice(1).toLowerCase(),
        lastName: splitName
          .slice(1)
          .join(' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' '),
      };
    }
    return {
      firstName: splitName[0].charAt(0).toUpperCase() + splitName[0].slice(1).toLowerCase(),
    };
  }
  return { firstName: 'Unknown' };
}

async function formatContact(id, firstName, lastName, accessToken) {
  const newName = formatName(firstName);
  const newLastName = formatName(lastName);

  try {
    await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
      {
        properties: {
          firstname: newName.firstName,
          lastname: newLastName.lastName || newName.lastName || '',
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

const contactNameFormatterLimiterToList = async (userId, portalId, req, isWebhook) => {
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
        let firstName = null;
        let lastName = null;

        if (event.propertyName === 'firstname') {
          firstName = event.propertyValue;
        } else if (event.propertyName === 'lastname') {
          lastName = event.propertyValue;
        }

        await formatContact(contactId, firstName, lastName, accessToken);
      }
    } else {
      // Fetch all contacts with pagination
      const allContacts = await fetchAllContacts(accessToken);

      // Use the rate limiter to update the contacts
      allContacts.forEach((element) => {
        const firstName = element.properties ? element.properties.firstname : null;
        const lastName = element.properties ? element.properties.lastname : null;
        limiter.schedule(() => formatContact(element.id, firstName, lastName, accessToken));
      });
    }
  } catch (error) {
    console.log('contactNameFormatter error: ', error.message);
  }
};

module.exports = contactNameFormatterLimiterToList;
