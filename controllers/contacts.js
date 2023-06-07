const { getAccessToken, getContact, isAuthorized } = require('../services/hubspot');

exports.contacts = async (req, res) => {
  // console.log('userId: ', req.session.userId);
  console.log('Contact userId: ', userId);

  const authorized = await isAuthorized(userId);

  if (authorized) {
    const accessToken = await getAccessToken(userId);

    const contacts = await getContact(accessToken);

    console.log('Contact: ', contacts);
    res.json(contacts);
  } else {
    console.log('User is not authorized');
    res.status(401).json({
      message: 'You are not authorized',
    });
  }
};
