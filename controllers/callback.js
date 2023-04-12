const axios = require('axios');
const { doc, setDoc } = require('firebase/firestore');
const { firestore } = require('../firebase-db/firebase');

exports.handleCallback = async (req, res) => {
  const code = req.query.code;
  const userId = req.query.user_id;
  console.log('Hello World');
  const options = {
    method: 'post',
    url: 'https://api.hubapi.com/oauth/v1/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data: `grant_type=authorization_code&client_id=${process.env.HUBSPOT_CLIENT_ID}&client_secret=${process.env.HUBSPOT_CLIENT_SECRET}&redirect_uri=${process.env.HUBSPOT_REDIRECT_URI}&code=${code}`,
  };

  try {
    const response = await axios(options);
    const responseBody = response.data;
    console.log('callback code: ', code);
    // Save tokens to Firestore
    const userAuthRef = doc(firestore, 'user_auth', userId);
    await setDoc(userAuthRef, {
      access_token: responseBody.access_token,
      refresh_token: responseBody.refresh_token,
    });

    res.send('Successfully authenticated! Access Token: ' + responseBody.access_token);
  } catch (error) {
    if (error.response && error.response.data) {
      res.send('Error: ' + error.response.data.error_description);
    } else {
      res.send('Error during token request: ' + error.message);
    }
  }
};
