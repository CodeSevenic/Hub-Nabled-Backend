const createObjectSchema = async (req, res) => {
  const accessToken = req.body.accessToken;
  const ObjectSchemaEgg = req.body.schema;

  try {
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
    res.status(200).send(response.data);
  } catch (error) {
    if (error.response) {
      console.log('Create Schema error:', error.response.data);
      res.status(500).send(error.response.data);
    } else {
      console.log('Create Schema error II:', error.message);
      res.status(500).send({ error: error.message });
    }
  }
};

module.exports = {
  createObjectSchema,
};
