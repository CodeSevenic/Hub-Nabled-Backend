const request = require('request');

exports.handleCallback = (req, res) => {
  const code = req.query.code;

  const options = {
    url: 'https://api.hubapi.com/oauth/v1/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    form: {
      grant_type: 'authorization_code',
      client_id: process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
      redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
      code: code,
    },
  };

  request(options, (error, response, body) => {
    if (error) {
      res.send('Error during token request: ' + error);
      return;
    }

    const responseBody = JSON.parse(body);

    if (responseBody.error) {
      res.send('Error: ' + responseBody.error_description);
      return;
    }

    // Save tokens to session
    req.session.access_token = responseBody.access_token;
    req.session.refresh_token = responseBody.refresh_token;

    res.send('Successfully authenticated! Access Token: ' + req.session.access_token);
  });
};
