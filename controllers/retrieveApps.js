const axios = require('axios');
const { doc, getDoc } = require('firebase/firestore');
const { firestore } = require('../firebase-db/firebase');

exports.retrieveApps = async (req, res) => {
  // Assuming user_id is passed as a query parameter
  const userId = req.query.user_id;

  // Retrieve access token from Firestore
  const userAuthRef = doc(firestore, 'user_auth', userId);
  const userAuthDoc = await getDoc(userAuthRef);

  if (!userAuthDoc.exists()) {
    res.status(401).send('Not authenticated');
    return;
  }

  const access_token = userAuthDoc.data().access_token;

  const options = {
    url: 'https://api.hubapi.com/developers/v1/apps/installed',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  };

  axios(options)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      if (error.response) {
        const responseBody = error.response.data;
        if (responseBody.status && responseBody.status === 'error') {
          res.send('Error: ' + responseBody.message);
          return;
        }
      } else {
        res.send('Error during installed apps request: ' + error.message);
      }
    });
};
