const createObjectSchema = async (userId, portalId, request) => {
  const ObjectSchemaEgg = request.body.schema;
  try {
    const authorized = await isAuthorized(userId, portalId);
    if (authorized) {
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
