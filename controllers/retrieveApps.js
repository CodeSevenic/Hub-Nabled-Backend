const axios = require('axios');

app.get('/apps', (req, res) => {
  if (!req.session.access_token) {
    res.status(401).send('Notauthenticated');
    return;
  }

  const options = {
    url: 'https://api.hubapi.com/developers/v1/apps/installed',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${req.session.access_token}`,
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
});
