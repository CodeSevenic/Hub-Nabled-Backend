const axios = require('axios');
const { isAuthorized, getAccessToken } = require('../services/hubspot');

async function createContact(accessToken, properties) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const apiUrl = `https://api.hubapi.com/crm/v3/objects/contacts`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        properties: properties,
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

async function createCustomObject(customObjectName, accessToken, properties) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const apiUrl = `https://api.hubapi.com/crm/v3/objects/${customObjectName}`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        properties: properties,
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

const createContactAndCustomObject = async (userId, portalId, request) => {
  const contactProperties = request.body.contactInfo;
  const customObjectName = request.body.customObjectInfo.customObjectName;
  const customObjectProperties = request.body.customObjectInfo.properties;
  console.log('contactProperties', contactProperties);
  try {
    const authorized = await isAuthorized(userId, portalId);
    if (authorized) {
      const accessToken = await getAccessToken(userId, portalId);
      const contactId = await createContact(accessToken, contactProperties);
      // const customObjectId = await createCustomObject(
      //   customObjectName,
      //   accessToken,
      //   customObjectProperties
      // );

      console.log('Contact created successfully:', contactId);

      // await associateObjects(customObjectName, customObjectId, contactId, accessToken);
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
