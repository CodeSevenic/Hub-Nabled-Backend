const dotenv = require('dotenv');
const request = require('request-promise-native');
const NodeCache = require('node-cache');
const { getDoc, doc, setDoc } = require('firebase/firestore');
const { db, storeUserAppAuth } = require('../firebase/firebaseAdmin');

const { CLIENT_ID, CLIENT_SECRET, SCOPES, PORT, REDIRECT_URI } = require('../config');

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });

//================================//
//   Running the OAuth 2.0 Flow   //
//================================//

// Step 1

// Build the authorization URL to redirect a user
// to when they choose to install the app

const getAppByName = async (appName) => {
  try {
    const doc = await db.collection('apps').doc(appName).get();

    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
      return doc.data();
    }
  } catch (error) {
    // In case of any other errors, return a server error status
    console.error(error);
  }
};

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
  req.session.userId = userId;

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
    // store user app auth by updating the user document in Firebase
    storeUserAppAuth(userId, appId, tokens);

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
  // If the access token has expired, retrieve
  // a new one using the refresh token
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
// const isAuthorized = (userId) => {
//   if (!userId) {
//     console.error('Error: userId is undefined');
//     return false;
//   }
//   return refreshTokenStore[userId] ? true : false;
// };

const isAuthorized = async (userId) => {
  if (!userId) {
    console.error('Error: userId is undefined');
    return false;
  }

  // Check if the user is authorized by querying Firestore
  const userDoc = await db.collection('users').doc(userId).get();

  if (userDoc.exists) {
    console.log(`Document with id ${userDoc.id} exists`);
    return true;
  } else {
    return false;
  }
};

module.exports = {
  handleInstall,
  handleOauthCallback,
  getAccessToken,
  getContact,
  isAuthorized,
  refreshTokenStore,
};
