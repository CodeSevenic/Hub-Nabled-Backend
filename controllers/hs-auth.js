exports.hsAuth = (req, res) => {
  const clientId = process.env.APP1_CLIENT_ID;
  const scope = process.env.APP1_SCOPES;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  const authUrl = `https://app-eu1.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}`;
  console.log('Client ID: ', clientId);
  res.json({ authUrl });
};
