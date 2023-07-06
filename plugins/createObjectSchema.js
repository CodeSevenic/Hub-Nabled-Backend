const { default: axios } = require('axios');
const { isAuthorized, getAccessToken } = require('../services/hubspot');

const createObjectSchema = async (userId, portalId, request) => {
  const ObjectSchemaEgg = request.body;
  try {
    const authorized = await isAuthorized(userId, portalId);
    if (authorized) {
      const accessToken = 'pat-eu1-9b9c5964-c226-4c3b-9d85-f6ee952b44d7';
      const response = await axios({
        method: 'post',
        url: `https://api.hubapi.com/crm/v3/schemas`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: ObjectSchemaEgg,
      });

      console.log('Create Schema response:', response.data);
      return response.data;
    } else {
      console.log('User is not authorized or has not installed an app');
    }
  } catch (error) {
    if (error.response) {
      console.log('Create Schema error:', error.response.data);
      return error.response.data;
    } else {
      console.log('Create Schema error II:', error.message);
      return error.message;
    }
  }
};

module.exports = {
  createObjectSchema,
};
