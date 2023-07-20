const request = require('request-promise-native');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const { default: axios } = require('axios');
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
  minTime: 500,
});

async function formatContact(id, email, accessToken) {
  try {
    // Fetch contact details
    const { data } = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/contacts/${id}?properties=firstname,lastname`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let firstName = data.properties ? data.properties.firstname : null;
    let lastName = data.properties ? data.properties.lastname : null;

    // Check if both firstName and lastName are non-empty
    if (firstName && firstName !== '' && lastName && lastName !== '') {
      return;
    }

    let updatedFirstName = firstName;
    let updatedLastName = lastName;

    // Split the email local-part on either period, dash or underscore
    const emailParts = email.split('@')[0].split(/[\._-]/);

    // Check for email addresses without any special characters or more than two parts
    if (emailParts.length === 1 || emailParts.length > 2) {
      let potentialFirstName = emailParts.slice(0, -1).join(' '); // join all parts except the last one
      let potentialLastName = emailParts[emailParts.length - 1]; // use the last part as the last name
      if (potentialFirstName) {
        potentialFirstName = potentialFirstName.replace(/[^a-zA-Z]/g, '');
        updatedFirstName = potentialFirstName.charAt(0).toUpperCase() + potentialFirstName.slice(1);
      }
      if (potentialLastName) {
        potentialLastName = potentialLastName.replace(/[^a-zA-Z]/g, '');
        updatedLastName = potentialLastName.charAt(0).toUpperCase() + potentialLastName.slice(1);
      }
    } else {
      if (!firstName || firstName === '') {
        let potentialFirstName = emailParts[0];
        if (potentialFirstName) {
          potentialFirstName = potentialFirstName.replace(/[^a-zA-Z]/g, '');
          updatedFirstName =
            potentialFirstName.charAt(0).toUpperCase() + potentialFirstName.slice(1);
        }
      }

      if (!lastName || lastName === '') {
        let potentialLastName = emailParts[1];
        if (potentialLastName) {
          potentialLastName = potentialLastName.replace(/[^a-zA-Z]/g, '');
          updatedLastName = potentialLastName.charAt(0).toUpperCase() + potentialLastName.slice(1);
        }
      }
    }

    if (!updatedFirstName && !updatedLastName) {
      updatedFirstName = 'Unknown';
      updatedLastName = '';
    }

    // Update contact
    await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
      {
        properties: {
          firstname: updatedFirstName,
          lastname: updatedLastName,
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
    console.error('Failed to process contact: ', error.message);
  }
}

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

      let url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email${
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

const unknownContactNameCreator = async (userId, portalId, req, isWebhook) => {
  console.log('isWebhook', isWebhook);
  const authorized = await isAuthorized(userId, portalId);

  if (!authorized) {
    console.log('User is not authorized.');
    return;
  }

  try {
    // const accessToken = await getAccessToken(userId, portalId);

    if (isWebhook == true) {
      const webhooksEvent = req.body;
      for (const event of webhooksEvent) {
        const contactId = event.objectId;
        let email = null;

        if (event.propertyName === 'email') {
          email = event.propertyValue;
        } else {
          // Fetch the email for the contact from the HubSpot API
          const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          };

          const url = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=email`;

          const { data } = await axios.get(url, { headers });
          email = data.properties ? data.properties.email : null;
        }

        await formatContact(contactId, email, accessToken);
      }
    } else {
      const allContacts = await fetchAllContacts(accessToken);

      allContacts.forEach((element) => {
        const email = element.properties ? element.properties.email : null;

        limiter.schedule(() => formatContact(element.id, email, accessToken));
      });
    }
  } catch (error) {
    console.log('unknownContactNameCreator error: ', error.message);
  }
};

module.exports = unknownContactNameCreator;
