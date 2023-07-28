const request = require('request-promise-native');
const axios = require('axios');
const {
  db,
  storeUserAppAuth,
  getAppByName,
  getUserById,
  getAppTokens,
  validatePortalUserId,
} = require('../../firebase/firebaseAdmin');

const { REDIRECT_URI } = require('../../config');
const { generateExpiryTimestamp, isTokenExpired } = require('../../utils/time-stamps');
const { app } = require('firebase-admin');

//================================//
//   Running the OAuth 2.0 Flow   //
//================================//

// Step 1

// Build the authorization URL to redirect a user
// to when they choose to install the app

// Redirect the user from the installation page to
// the authorization URL
const handleInstall = async (req, res) => {
  try {
    // get the app name from the query parameter
    const appName = req.query.appName;
    if (!appName) {
      throw new Error('App name not found in request');
    }
    // save the app name to the session
    req.session.appName = appName;
    // get the app by name from Firebase
    const app = await getAppByName(appName);
    if (!app) {
      throw new Error('App not found in Firebase');
    }
    // save the app credentials to the session
    const clientId = app.clientId;
    const clientSecret = app.clientSecret;
    const scopes = app.scopes.split(/ |, ?|%20/).join(' ');
    // save the app credentials to the session
    req.session.clientId = clientId;
    req.session.clientSecret = clientSecret;
    req.session.scopes = scopes;

    console.log('app: ', app);
    // save the app id to the session
    req.session.appId = app.appId;

    console.log('=== Initiating OAuth 2.0 flow with HubSpot ===');
    console.log("===>Step 1: Redirecting user to your app's OAuth URL");
    // Get the userId from the query parameter
    const userId = req.query.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    console.log('userId: ', userId);

    const authUrl =
      'https://app.hubspot.com/oauth/authorize' +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${encodeURIComponent(userId)}`;
    res.redirect(authUrl);
    console.log('===> Step 2: User is being prompted for consent by HubSpot');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Step 2
// The user is prompted to give the app access to the requested
// resources. This is all done by HubSpot, so no work is necessary
// on the app's end

// Step 3
// Receive the authorization code from the OAuth 2.0 Server,
// and process it based on the query parameters that are passed
const handleOauthCallback = async (req, res) => {
  try {
    // Get the userId from the query parameter state
    const userId = req.query.state;
    const appName = req.session.appName;
    const appId = req.session.appId;
    // Get the app credentials from the session
    const clientId = req.session.clientId;
    const clientSecret = req.session.clientSecret;

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
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        code: req.query.code,
      };

      const appSecrets = {
        clientId: req.session.clientId,
        clientSecret: req.session.clientSecret,
        scopes: req.session.scopes,
      };

      // Exchange the authorization code for an access token and refresh token
      console.log(
        '===> Step 4: Exchanging authorization code for an access token and refresh token'
      );
      const tokens = await exchangeForTokens(userId, authCodeProof, appSecrets);

      if (tokens === 'Existing portal') {
        return res.redirect(
          process.env.NODE_ENV === 'DEV'
            ? `http://localhost:3000/error-existing-portal`
            : 'https://seahorse-app-847hs.ondigitalocean.app/error-existing-portal'
        );
      }

      if (tokens.message) {
        return res.redirect(`/error?msg=${tokens.message}`);
      }

      // Once the tokens have been retrieved, use them to make a query
      // to the HubSpot API
      // redirect to the frontend
      return res.redirect(
        process.env.NODE_ENV === 'DEV'
          ? `http://localhost:3000/oauth-complete`
          : 'https://seahorse-app-847hs.ondigitalocean.app/oauth-complete'
      );
    } else {
      throw new Error('Authorization code not found in request');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Exchanging Proof for an Access Token and Refresh Token
const exchangeForTokens = async (userId, exchangeProof, additionalFields = {}) => {
  try {
    const responseBody = await axios.post('https://api.hubapi.com/oauth/v1/token', exchangeProof, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokens = responseBody.data;

    const issuedAt = generateExpiryTimestamp(tokens.expires_in);

    // Get HubSpot portal info
    const tokenInfo = await axios.get(
      `https://api.hubapi.com/oauth/v1/access-tokens/${tokens.access_token}`
    );

    const appPortalInfo = {
      portalId: tokenInfo.data.hub_id,
      hubDomain: tokenInfo.data.hub_domain,
      hubUserEmail: tokenInfo.data.user,
    };

    const isNewUserAndPortal = await validatePortalUserId(appPortalInfo.portalId, userId);

    if (isNewUserAndPortal === false) {
      return 'Existing portal';
    }

    // store user app auth by updating the user document in Firebase
    await storeUserAppAuth(
      userId,
      appPortalInfo.portalId,
      tokens,
      issuedAt,
      additionalFields,
      appPortalInfo
    );

    console.log('       > Received an access token and refresh token');
    return tokens.access_token;
  } catch (e) {
    console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token`, e);
    if (e.response && e.response.data) {
      return e.response.data;
    }
    throw e;
  }
};

const refreshAccessToken = async (userId, portalId) => {
  const user = await getUserById(userId);
  // app portalId by accountId or return all app portalIds
  const appToken = getAppTokens(user.appAuths, portalId);

  try {
    const refreshTokenProof = {
      grant_type: 'refresh_token',
      client_id: appToken.clientId,
      client_secret: appToken.clientSecret,
      redirect_uri: REDIRECT_URI,
      refresh_token: appToken.refreshToken,
    };

    const newAccessToken = await exchangeForTokens(userId, refreshTokenProof);

    return newAccessToken;
  } catch (e) {
    console.error('Error refreshing access token: ', e);
  }
};

const getAccessToken = async (userId, portalId) => {
  try {
    const user = await getUserById(userId);

    // app portalId by accountId or return all app portalIds
    const appToken = getAppTokens(user.appAuths, portalId);
    // If the access token has expired, retrieve
    // a new one using the refresh token
    if (isTokenExpired(appToken.issuedAt)) {
      console.log('Refreshing expired access token');
      const newAccessToken = await refreshAccessToken(userId, portalId);
      return newAccessToken;
    }
    console.log('Token has not expired');
    return appToken.accessToken;
  } catch (e) {
    console.error('Error getting accessToken: ', e);
  }
};

// check if the user is authorized and has an app
const isAuthorized = async (userId, portalId) => {
  if (!userId) {
    console.error('No user id found');
    return false;
  }
  try {
    // Check if the user is authorized by querying Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (userDoc.exists && portalId) {
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
