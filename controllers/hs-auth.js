exports.hsAuth = (req, res) => {
  const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${process.env.HUBSPOT_CLIENT_ID}&scope=contacts%20timeline&redirect_uri=${process.env.HUBSPOT_REDIRECT_URI}`;
  res.redirect(authUrl);
};
