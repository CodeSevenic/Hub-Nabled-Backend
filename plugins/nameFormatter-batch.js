const request = require('request-promise-native');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const { default: axios } = require('axios');
const Bottleneck = require('bottleneck');

// Initialize the rate limiter
const limiter = new Bottleneck({
  minTime: 500, // minimum time between job starts is 500ms
});

async function formatContact(id, firstName, lastName) {
  const formatName = (name) => {
    if (typeof name === 'string' && name.length > 0) {
      if (/^[A-Z][a-z]*( [A-Z][a-z]*)*$/.test(name)) {
        return name;
      }
      name = name.replace(/[^a-zA-Z ]/g, '');
      let nameParts = name
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
      name = nameParts.join(' ');
    }
    return name;
  };

  const newName = formatName(firstName);
  const newLastName = formatName(lastName);

  // Skip if nothing to change
  if (newName === firstName && newLastName === lastName) {
    return null;
  }

  return {
    id: id,
    properties: {
      firstname: newName,
      lastname: newLastName,
    },
  };
}

const updateContactsBatch = async (contacts, accessToken) => {
  try {
    await axios.post(
      `https://api.hubapi.com/crm/v3/objects/contacts/batch/update`,
      { inputs: contacts },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Failed to update contacts batch: ', error.message);
  }
};

const fetchAllContacts = async (accessToken) => {
  console.log('=== Retrieving all contacts from HubSpot using the access token ===');
  let after = '';
  let allContacts = [];
  let keepGoing = true;

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
      allContacts = [...allContacts, ...data.results];

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
      const contactsToUpdate = [];

      for (const event of webhooksEvent) {
        const contactId = event.objectId;
        let firstname = null;
        let lastname = null;

        if (event.propertyName === 'firstname') {
          firstname = event.propertyValue;
        } else if (event.propertyName === 'lastname') {
          lastname = event.propertyValue;
        }

        const contactUpdate = await formatContact(contactId, firstname, lastname);
        if (contactUpdate) {
          contactsToUpdate.push(contactUpdate);
        }
      }

      // Perform batch update
      if (contactsToUpdate.length > 0) {
        await limiter.schedule(() => updateContactsBatch(contactsToUpdate, accessToken));
      }
    } else {
      const allContacts = await fetchAllContacts(accessToken);
      const contactsToUpdate = [];

      for (const element of allContacts) {
        const firstname = element.properties ? element.properties.firstname : null;
        const lastname = element.properties ? element.properties.lastname : null;
        const contactUpdate = await formatContact(element.id, firstname, lastname);

        if (contactUpdate) {
          contactsToUpdate.push(contactUpdate);
        }
      }

      // Perform batch updates
      while (contactsToUpdate.length > 0) {
        const batch = contactsToUpdate.splice(0, 100);
        await limiter.schedule(() => updateContactsBatch(batch, accessToken));
      }
    }
  } catch (error) {
    console.log('nameFormatter error: ', error.message);
  }
};

// module.exports = nameFormatter;
