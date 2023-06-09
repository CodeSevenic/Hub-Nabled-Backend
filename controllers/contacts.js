const { getAccessToken, getContact, isAuthorized } = require('../services/hubspot');

exports.contacts = async (req, res) => {
  const userId = req.session.userId;
  const hasApp = req.session.hasApp;

  const authorized = await isAuthorized(userId, hasApp);

  if (authorized) {
    const accessToken = await getAccessToken(userId);

    const contacts = await getContact(accessToken);

    console.log('Contact: ', contacts.properties);
    res.json(contacts.properties);
  } else {
    console.log('User is not authorized or has not installed an app');
    res.status(401).json({
      message: 'You are not authorized or has not installed an app',
    });
  }
};
