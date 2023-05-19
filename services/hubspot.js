const request = require('request-promise-native');
const NodeCache = require('node-cache');
const { getDoc, doc, setDoc } = require('firebase/firestore');
const { db } = require('../firebase/firebaseAdmin');

const { CLIENT_ID, CLIENT_SECRET, SCOPES, PORT, REDIRECT_URI } = require('../config');

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });

//================================//
//   Running the OAuth 2.0 Flow   //
//================================//

// Step 1

// Build the authorization URL to redirect a user
// to when they choose to install the app

const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

const getAppById = async (appId) => {
  try {
    const doc = await db.collection('apps').doc(appId).get();

    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
      return doc.data().clientSecret;
    }
  } catch (error) {
    // In case of any other errors, return a server error status
    console.error(error);
  }
};

// Redirect the user from the installation page to
// the authorization URL
const handleInstall = (authUrl) => async (req, res) => {
  const appId = req.query.app_id;
  const clientSecret = await getAppById(appId);
  console.log('clientSecret: ', clientSecret);

  console.log('=== Initiating OAuth 2.0 flow with HubSpot ===');
  console.log("===>Step 1: Redirecting user to your app's OAuth URL");
  const userId = req.query.userId; // Get the userId from the query parameter
  const authUrlWithUserId = `${authUrl}&state=${encodeURIComponent(userId)}`;
  res.redirect(authUrlWithUserId);
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

    // Exchange the authorization code for an access token and refresh token
    console.log('===> Step 4: Exchanging authorization code for an access token and refresh token');
    const tokens = await exchangeForTokens(authCodeProof);

    if (tokens.message) {
      return res.redirect(`/error?msg=${tokens.message}`);
    }

    // Get the userId and appName from the query param
    const userId = req.query.userId;
    const appName = req.query.appName;

    // Check if the app exists in the user's appAuths subcollection
    const appSnapshot = await getDocs(
      query(collection(db, `users/${userId}/appAuths`), where('appName', '==', appName))
    );

    if (!appSnapshot.empty) {
      // If the app exists, update the OAuth info
      const appId = appSnapshot.docs[0].id;
      await updateDoc(doc(db, `users/${userId}/appAuths`, appId), {
        tokens: tokens,
      });
    } else {
      // If the app doesn't exist, create a new app entry in the user's appAuths subcollection
      const appId = generateUniqueID();
      await setDoc(doc(db, `users/${userId}/appAuths`, appId), {
        appName: appName,
        tokens: tokens,
      });
    }

    // Once the tokens have been retrieved, use them to make a query
    // to the HubSpot API
    res.redirect(`/`);
  }
};

// Exchanging Proof for an Access Token
const exchangeForTokens = async (userId, exchangeProof) => {
  try {
    const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
      form: exchangeProof,
    });

    const tokens = JSON.parse(responseBody);

    // Store tokens in Firestore
    await setDoc(doc(db, 'users', userId), { tokens });

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
  const userDoc = await getDoc(doc(db, 'users', userId));

  return userDoc.exists();
};

module.exports = {
  authUrl,
  handleInstall,
  handleOauthCallback,
  getAccessToken,
  getContact,
  isAuthorized,
  refreshTokenStore,
};
