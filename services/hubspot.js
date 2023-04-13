const request = require('request-promise-native');
const NodeCache = require('node-cache');
const { CLIENT_ID, CLIENT_SECRET, SCOPES, PORT, REDIRECT_URI } = require('../config');

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });

const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

const handleInstall = (authUrl) => (req, res) => {
  console.log('=== Initiating OAuth 2.0 flow with HubSpot ===');
  console.log("===> Step 1: Redirecting user to your app's OAuth URL");
  res.redirect(authUrl);
  console.log('===> Step 2: User is being prompted for consent by HubSpot');
};

// Step 2
// The user is prompted to give the app access to the requested
// resources. This is all done by HubSpot, so no work is necessary
// on the app's end

// Step 3
// Receive the authorization code from the OAuth 2.0 Server,
// and process it based on the query parameters that are passed
const handleOauthCallback = async (req, res) => {
  console.log('===> Step 3: Handling the request sent by the server');
  // Received a user authorization code, so now combine that with the other
  // required values and exchange both for an access token and a refresh token
  if (req.query.code) {
    console.log('       > Received an authorization token');

    const authCodeProof = {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: req.query.code,
    };
    // Step 4
    // Exchange the authorization code for an access token and refresh token
    console.log('===> Step 4: Exchanging authorization code for an access token and refresh token');
    const token = await exchangeForTokens(req.sessionID, authCodeProof);
    if (token.message) {
      return res.redirect(`/error?msg=${token.message}`);
    }
    // Once the tokens have been retrieved, use them to make a query
    // to the HubSpot API
    res.redirect(`/`);
  }
};

const exchangeForTokens = async (userId, exchangeProof) => {
  try {
    const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
      form: exchangeProof,
    });

    const tokens = JSON.parse(responseBody);
    refreshTokenStore[userId] = tokens.refresh_token;
    accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));

    console.log('       > Received an access token and refresh token');
    return tokens.access_token;
  } catch (e) {
    console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token`);
    return JSON.parse(e.response.body);
  }
};

const refreshAccessToken = async (userId) => {
  const refreshTokenProof = {
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    refresh_token: refreshTokenStore[userId],
  };
  return await exchangeForTokens(userId, refreshTokenProof);
};

const getAccessToken = async (userId) => {
  if (!accessTokenCache.get(userId)) {
    console.log('Refreshing expired access token');
    await refreshAccessToken(userId);
  }
  return accessTokenCache.get(userId);
};

const getContact = async (accessToken) => {
  console.log('=== Retrieving a contact from HubSpot using the access token ===');
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    const result = await request.get(
      'https://api.hubapi.com/contacts/v1/lists/all/contacts/all?count=1',
      {
        headers: headers,
      }
    );

    return JSON.parse(result).contacts[0];
  } catch (e) {
    console.error('  >Unable to retrieve contact');
    return JSON.parse(e.response.body);
  }
};
const isAuthorized = (userId) => {
  if (!userId) {
    console.error('Error: userId is undefined');
    return false;
  }
  return refreshTokenStore[userId] ? true : false;
};

const displayContactName = (contact) => {
  if (contact.status === 'error') {
    return `<p>Unable to retrieve contact! Error Message: ${contact.message}</p>`;
  }
  const { firstname, lastname } = contact.properties;
  return `<p>
      Contact name: ${firstname.value} ${lastname.value}
    </p>`;
};

module.exports = {
  authUrl,
  handleInstall,
  handleOauthCallback,
  getAccessToken,
  getContact,
  isAuthorized,
  displayContactName,
  refreshTokenStore,
};
