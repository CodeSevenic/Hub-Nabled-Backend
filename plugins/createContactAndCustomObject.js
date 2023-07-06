const axios = require('axios');
const { isAuthorized } = require('../services/hubspot');

// const createObjectSchema = async (accessToken) => {
//   const ObjectSchemaEgg = {
//     labels: {
//       singular: 'Trading Account',
//       plural: 'Trading Accounts',
//     },
//     requiredProperties: ['account', 'balance', 'platform', 'type'],
//     searchableProperties: [null],
//     primaryDisplayProperty: 'account',
//     secondaryDisplayProperties: [null],
//     properties: [
//       { name: 'account', label: 'Account', isPrimaryDisplayLabel: true },
//       { name: 'balance', label: 'Balance', isPrimaryDisplayLabel: false },
//       { name: 'platform', label: 'Platform', isPrimaryDisplayLabel: false },
//       { name: 'type', label: 'Type', isPrimaryDisplayLabel: false },
//     ],
//     associatedObjects: ['CONTACT'],
//     name: 'trading-accounts',
//   };

//   try {
//     const response = await axios({
//       method: 'post',
//       url: `https://api.hubapi.com/crm/v3/schemas`,
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${accessToken}`,
//       },
//       data: ObjectSchemaEgg,
//     });

//     console.log(JSON.stringify(response.data, null, 2));
//   } catch (error) {
//     if (error.response) {
//       console.error(JSON.stringify(error.response.data, null, 2));
//     } else {
//       console.error(error.message);
//     }
//   }
// };

async function createContact(accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const apiUrl = `https://api.hubapi.com/crm/v3/objects/contacts`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        properties: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'johndoe@example.com',
        },
      },
      {
        headers: headers,
      }
    );

    return response.data.id;
  } catch (error) {
    console.error('Error creating contact:', error);
  }
}

async function createCustomObject(customObjectName, accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const apiUrl = `https://api.hubapi.com/crm/v3/objects/${customObjectName}`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        properties: {
          account: '15942',
          balance: '372',
          platform: 'MT5',
          type: 'live',
        },
      },
      {
        headers: headers,
      }
    );

    return response.data.id;
  } catch (error) {
    console.error('Error creating custom object:', error);
  }
}

async function associateObjects(customObjectName, customObjectId, contactId, accessToken) {
  const apiUrl = `https://api.hubapi.com/crm/v3/objects/${customObjectName}/${customObjectId}/associations/contacts/${contactId}`;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(apiUrl, {}, { headers });

    console.log('Association created successfully:', response.data);
  } catch (error) {
    console.error('Error associating objects:', error);
  }
}

const createContactAndCustomObject = async (userId, portalId) => {
  const customObjectName = 'trading-accounts'; // Replace with your actual custom object name

  try {
    const authorized = await isAuthorized(userId, portalId);
    if (authorized) {
      const contactId = await createContact(accessToken);
      const customObjectId = await createCustomObject(customObjectName, accessToken);

      await associateObjects(customObjectName, customObjectId, contactId, accessToken);
    } else {
      console.log('User is not authorized or has not installed an app');

      // Throw an error if the user is not authorized
      throw new Error('You are not authorized or have not installed an app');
    }
  } catch (error) {
    console.error('Error creating contact and custom object:', error);
  }
};

module.exports = { createContactAndCustomObject };
