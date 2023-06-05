const { getAccessToken, getContact } = require('../services/hubspot');

exports.contacts = async (req, res) => {
  const accessToken = await getAccessToken(req.sessionID);
  //assuming getContacts is a function that gets all contacts
  const contacts = await getContact(accessToken);
  const formattedContacts = contacts.map((contact) => {
    const { firstname, lastname } = contact.properties;
    return { firstname: firstname.value, lastname: lastname.value };
  });
  res.json(formattedContacts);
};
