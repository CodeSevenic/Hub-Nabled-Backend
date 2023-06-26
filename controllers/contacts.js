const { getAccessToken, isAuthorized, getContacts } = require('../services/hubspot');

exports.contacts = async (req, res) => {
  const userId = req.session.userId;
  const hasApp = req.session.hasApp;

  console.log('User ID: ', userId);
  console.log('Has App: ', hasApp);

  const authorized = await isAuthorized(userId, hasApp);
  console.log('Authorized: ', authorized);

  if (authorized) {
    const accessToken = await getAccessToken(userId);

    const contacts = await getContacts(accessToken);

    // console.log('Contact: ', contacts);

    res.json(contacts);
  } else {
    console.log('User is not authorized or has not installed an app');
    res.status(401).json({
      message: 'You are not authorized or has not installed an app',
    });
  }
};
