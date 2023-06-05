const { getAccessToken, getContact } = require('../services/hubspot');

exports.contacts = async (req, res) => {
  const accessToken = await getAccessToken(req.sessionID);
  const contact = await getContact(accessToken);
  const { firstname, lastname } = contact.properties;
  console.log(firstname, lastname);
  res.write(`<p>Contact name: ${firstname.value} ${lastname.value}</p>`);
};
