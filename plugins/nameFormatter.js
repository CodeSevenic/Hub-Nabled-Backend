const request = require('request-promise-native');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const { default: axios } = require('axios');
const Bottleneck = require('bottleneck');

// Initialize the rate limiter
const limiter = new Bottleneck({
  minTime: 500, // minimum time between job starts is 500ms
});

async function formatContact(id, firstName, lastName, accessToken) {
  const formatName = (name) => {
    if (typeof name === 'string' && name.length > 0) {
      // Handle names inside brackets
      if (/^\(.*\)$/.test(name)) {
        name = name.replace(/[\(\)]/g, ''); // Remove brackets
      }

      // Remove numbers and special characters excluding dot
      name = name.replace(/[0-9]/g, ''); // Remove numbers
      name = name.replace(/[^a-zA-Z .]/g, ''); // Remove special characters

      // Handle prefixes and capitalize each name part
      let nameParts = name.split(' ').map((part) => {
        const lowerCasePart = part.toLowerCase();

        // List of common prefixes
        const prefixes = ['dr.', 'mr.', 'mrs.', 'ms.', 'prof.', 'sir'];

        // If the part is a prefix, preserve the casing
        if (prefixes.includes(lowerCasePart)) {
          return part;
        }

        // Capitalize the first letter and make the rest lowercase
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      });

      // Join the parts back together
      name = nameParts.join(' ');
    }
    return name;
  };

  const newName = formatName(firstName);
  const newLastName = formatName(lastName);

  // Skip if nothing to change
  if (newName === firstName && newLastName === lastName) {
    return;
  }

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

const nameFormatter = async (userId, portalId, req, isWebhook) => {
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
        let firstname = null;
        let lastname = null;

        if (event.propertyName === 'firstname') {
          firstname = event.propertyValue;
        } else if (event.propertyName === 'lastname') {
          lastname = event.propertyValue;
        }

        await formatContact(contactId, firstname, lastname, accessToken);
      }
    } else {
      // Fetch all contacts with pagination
      const allContacts = await fetchAllContacts(accessToken);

      // Use the rate limiter to update the contacts
      allContacts.forEach((element) => {
        const firstname = element.properties ? element.properties.firstname : null;
        const lastname = element.properties ? element.properties.lastname : null;
        limiter.schedule(() => formatContact(element.id, firstname, lastname, accessToken));
      });
    }
  } catch (error) {
    console.log('nameFormatter error: ', error.message);
  }
};

module.exports = nameFormatter;
