const { getAccessToken, getContact } = require('../services/hubspot');

exports.contacts = async (req, res) => {
  const userId = req.session.userId;

  console.log('Contacts userId: ', userId);

  const hardCodedID = '1685968763573-bff90ed5-087d-479c-a8a8-0f17a3b186e0';

  const accessToken = await getAccessToken(hardCodedID);
  //assuming getContacts is a function that gets all contacts
  const contacts = await getContact(accessToken);
  const formattedContacts = contacts.map((contact) => {
    const { firstname, lastname } = contact.properties;
    return { firstname: firstname.value, lastname: lastname.value };
  });
  console.log('formattedContacts: ', formattedContacts);
  res.json(formattedContacts);
};
