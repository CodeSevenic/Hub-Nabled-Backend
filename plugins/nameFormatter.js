const request = require('request-promise-native');
const { isAuthorized, getAccessToken } = require('../services/hubspot');
const { default: axios } = require('axios');

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function formatContact(id, firstName, lastName, accessToken) {
  const newName = firstName;
  const newLastName = lastName;
  function checkFirstName() {
    if (newName == null) {
      return '';
    } else {
      return newName.charAt(0).toUpperCase() + newName.substr(1).toLowerCase();
      //return newName.charAt(0).toLowerCase() + newName.substr(1).toLowerCase();
    }
  }
  function checkLastName() {
    if (newLastName == null) {
      return '';
    } else {
      return newLastName.charAt(0).toUpperCase() + newLastName.substr(1).toLowerCase();
      //return newLastName.charAt(0).toLowerCase() + newName.substr(1).toLowerCase();
    }
  }
  //const accessToken = await getAccessToken(req.sessionID);
  try {
    await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
      {
        properties: {
          firstname: checkFirstName(),
          lastname: checkLastName(),
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
    console.log(error);
  }
  //console.log(`Contact with ${id} has been updated.`)
}

const getContact = async (accessToken) => {
  console.log('');
  console.log('=== Retrieving a contact from HubSpot using the access token ===');
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    //   console.log('===> Replace the following request.get() to test other API calls');
    //   console.log('===> request.get(\'https://api.hubapi.com/contacts/v1/lists/all/contacts/all?count=1\')');
    const results = await request.get(`https://api.hubapi.com/crm/v3/objects/contacts?limit=100`, {
      headers: headers,
    });
    //console.log(JSON.parse(results));
    return JSON.parse(results);
  } catch (e) {
    console.error('  > Unable to retrieve contact');
    return e;
  }
};

const nameFormatter = async (userId, portalId, req, isWebhook) => {
  // At the start of the function
  console.log(`Running nameFormatter for userId ${userId} in hubspotId ${portalId}`);

  console.log('Parameters: ', userId, portalId, req.body, isWebhook);

  const authorized = await isAuthorized(userId, portalId);
  try {
    if (authorized) {
      const accessToken = await getAccessToken(userId, portalId);
      const contact = await getContact(accessToken);
      const slowDown = async () => {
        console.log(contact);
        for (const element of contact.results) {
          await sleep(500);
          const id = element.id;
          const firstname = element.properties.firstname;
          const lastname = element.properties.lastname;
          formatContact(id, firstname, lastname, accessToken);
          console.log(id, firstname, lastname);
        }
      };
      slowDown();
      //res.json(contact.results);
    }
  } catch (error) {
    console.log('nameFormatter error: ', error);
  }
};

module.exports = nameFormatter;
