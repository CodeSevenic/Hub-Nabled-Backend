const request = require('request-promise-native');
const {
  db,
  storeUserAppAuth,
  getAppByName,
  getUserById,
  getAppTokens,
} = require('../../firebase/firebaseAdmin');

const { CLIENT_ID, CLIENT_SECRET, SCOPES, PORT, REDIRECT_URI } = require('../../config');
const { generateExpiryTimestamp, isTokenExpired } = require('../../utils/time-stamps');

//================================//
//   Running the OAuth 2.0 Flow   //
//================================//

// Step 1

// Build the authorization URL to redirect a user
// to when they choose to install the app

// Redirect the user from the installation page to
// the authorization URL
const handleInstall = async (req, res) => {
  // get the app name from the query parameter
  const appName = req.query.appName;
  console.log('appName: ', appName);
  // save the app name to the session
  req.session.appName = appName;
  // get the app by name from Firebase
  const app = await getAppByName(appName);
  // save the app id to the session
  req.session.appId = app.appId;

  console.log('=== Initiating OAuth 2.0 flow with HubSpot ===');
  console.log("===>Step 1: Redirecting user to your app's OAuth URL");
  // Get the userId from the query parameter
  const userId = req.query.userId;

  console.log('userId: ', userId);

  const authUrl =
    'https://app.hubspot.com/oauth/authorize' +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${encodeURIComponent(userId)}`;
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
  // Get the userId from the query parameter state
  const userId = req.query.state;
  const appName = req.session.appName;
  const appId = req.session.appId;

  if (appName && appId) {
    console.log('appId from session: ', appName);
    console.log('appName from session: ', appId);
  } else {
    console.log('appId is undefined');
  }

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

    // Exchange the authorization code for an access token and refresh token
    console.log('===> Step 4: Exchanging authorization code for an access token and refresh token');
    const tokens = await exchangeForTokens(userId, authCodeProof, appId);

    if (tokens.message) {
      return res.redirect(`/error?msg=${tokens.message}`);
    }

    // Get the userId and appName from the query param
    console.log('userId: ', userId);

    // Once the tokens have been retrieved, use them to make a query
    // to the HubSpot API
    // redirect to the frontend
    res.redirect(`http://localhost:3000/oauth-complete`);
  }
};

// Exchanging Proof for an Access Token and Refresh Token
const exchangeForTokens = async (userId, exchangeProof, appId = '') => {
  try {
    const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
      form: exchangeProof,
    });

    const tokens = JSON.parse(responseBody);

    const issuedAt = generateExpiryTimestamp(tokens.expires_in);

    // store user app auth by updating the user document in Firebase
    await storeUserAppAuth(userId, appId, tokens, issuedAt);

    console.log('       > Received an access token and refresh token');
    return tokens.access_token;
  } catch (e) {
    console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token`);
    return JSON.parse(e.response.body);
  }
};

const refreshAccessToken = async (userId) => {
  const user = await getUserById(userId);
  // get the app names from the user document
  let appNames = Object.keys(user.appAuths);
  // get the first app name
  const appToken = getAppTokens(user.appAuths, appNames[0]);

  console.log('Refresh token: ', appToken.refreshToken);

  const refreshTokenProof = {
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    refresh_token: appToken.refreshToken,
  };
  const newAccessToken = await exchangeForTokens(userId, refreshTokenProof, appNames[0]);
  return newAccessToken;
};

const getAccessToken = async (userId) => {
  try {
    const user = await getUserById(userId);
    // get the app names from the user document
    let appNames = Object.keys(user.appAuths);
    // get the first app name
    const appToken = getAppTokens(user.appAuths, appNames[0]);
    // If the access token has expired, retrieve
    // a new one using the refresh token
    if (isTokenExpired(appToken.issuedAt)) {
      console.log('Refreshing expired access token');
      const newAccessToken = await refreshAccessToken(userId);
      return newAccessToken;
    }
    console.log('Token has not expired');
    return appToken.accessToken;
  } catch (e) {
    console.error('Error getting accessToken: ', e);
  }
};

// check if the user is authorized and has an app
const isAuthorized = async (userId, hasApp) => {
  if (!userId) {
    console.error('No user id found');
    return false;
  }
  try {
    // Check if the user is authorized by querying Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (userDoc.exists && hasApp) {
      console.log(`Document with id ${userDoc.id} exists`);
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error('Error checking if user is authorized: ', e);
  }
};

module.exports = {
  handleInstall,
  handleOauthCallback,
  getAccessToken,
  isAuthorized,
};
