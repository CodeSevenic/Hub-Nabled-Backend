﻿var admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.ADMIN_TYPE,
    projectId: process.env.ADMIN_PROJECT_ID,
    privateKeyId: process.env.ADMIN_PRIVATE_KEY_ID,
    privateKey: process.env.ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.ADMIN_CLIENT_EMAIL,
    clientId: process.env.ADMIN_CLIENT_ID,
    authUri: process.env.ADMIN_AUTH_URI,
    tokenUri: process.env.ADMIN_TOKEN_URI,
    authProviderX509CertUrl: process.env.ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    clientC509CertUrl: process.env.ADMIN_CLIENT_X509_CERT_URL,
  }),
});

const db = admin.firestore();

// Function to create user in Firebase
const createUserInFirebase = async (email, password) => {
  const userRecord = await admin.auth().createUser({
    email: email,
    password: password,
  });
  return userRecord;
};

// Function to create custom token in Firebase
const createCustomTokenInFirebase = async (uid) => {
  const customToken = await admin.auth().createCustomToken(uid);
  return customToken;
};

// Verify the Firebase ID token in the request
const verifyIdTokenInFirebase = async (idToken) => {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  return (uid = decodedToken.uid); // The Firebase user ID
};

// Store authentications under a user account
const storeUserAppAuth = async (
  userId,
  portalId,
  tokens,
  issuedAt,
  additionalFields = {},
  appPortalInfo = {}
) => {
  console.log('storeUserAppAuth Running...');
  // Convert portalId to string
  portalId = String(portalId);

  try {
    // Get the user document reference
    const userDoc = db.doc(`users/${userId}`);

    // Fetch the document and check if it exists
    const docSnapshot = await userDoc.get();
    if (docSnapshot.exists) {
      const userData = docSnapshot.data();

      // Create or update 'appAuths' object
      let appAuths = userData.appAuths || {};

      // Update the 'appAuths' object with new or existing portalId
      appAuths[portalId] = {
        ...additionalFields,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        issuedAt: issuedAt,
        ...appPortalInfo,
      };

      // If the document exists, update it with the 'appAuths' object.
      await userDoc.set({ appAuths }, { merge: true });

      if (userData.appAuths && userData.appAuths[portalId]) {
        console.log(`       > App ${portalId} updated for user ${userId}`);
      } else {
        console.log(`       > App ${portalId} added to user ${userId}`);
      }

      // Additionally, update the portal-to-user mapping
      const portalUserMapping = db.collection('portalUserMappings').doc(portalId);
      await portalUserMapping.set({ userId }, { merge: true });
      console.log(`       > PortalUserMapping for portal ${portalId} updated`);
    } else {
      throw new Error(`User ${userId} does not exist`);
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Error storing app auth for user ${userId} and portal ${portalId}`);
  }
};

// Delete authentications under a user account
const deleteUserAppAuth = async (userId, portalId) => {
  console.log('deleteUserAppAuth Running...');
  try {
    // Get the user document reference
    const userDoc = db.doc(`users/${userId}`);

    // Fetch the document and check if it exists
    const docSnapshot = await userDoc.get();
    if (docSnapshot.exists) {
      const userData = docSnapshot.data();

      // Check if 'appAuths' object exists
      let appAuths = userData.appAuths || {};

      if (appAuths && appAuths[portalId]) {
        // Delete the appAuth object with the provided portalId
        delete appAuths[portalId];

        // If the document exists, update it with the 'appAuths' object.
        await userDoc.update({ appAuths });

        console.log(`       > App ${portalId} deleted from user ${userId}`);

        // Additionally, delete the portal-to-user mapping
        const portalUserMapping = db.collection('portalUserMappings').doc(portalId);
        await portalUserMapping.delete();
        console.log(`       > PortalUserMapping for portal ${portalId} deleted`);
      } else {
        console.log(`       > App ${portalId} does not exist in user ${userId}`);
      }
    } else {
      throw new Error(`User ${userId} does not exist`);
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Error deleting app auth for user ${userId} and portal ${portalId}`);
  }
};

// Get app by name
const getAppByName = async (appName) => {
  try {
    const doc = await db.collection('apps').doc(appName).get();

    if (!doc.exists) {
      console.log('No such document!');
    } else {
      // console.log('Document data:', doc.data());
      return doc.data();
    }
  } catch (error) {
    // In case of any other errors, return a server error status
    console.error(error);
  }
};

const getUserIdByPortalId = async (portalId) => {
  try {
    const portalUserMappingDoc = await db.collection('portalUserMappings').doc(portalId).get();
    if (portalUserMappingDoc.exists) {
      const data = portalUserMappingDoc.data();
      return data.userId;
    } else {
      throw new Error('No user found for this portalId');
    }
  } catch (error) {
    console.error(`Failed to get userId by portalId: `, error.message);
  }
};

// Get user by document ID
const getUserById = async (userId) => {
  // console.log('getUserById: ', userId);
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      // console.log('Document data:', doc.data());
      return doc.data();
    }
  } catch (error) {
    // In case of any other errors, return a server error status
    console.error(error);
  }
};

// Get user by email
const getUserByEmail = async (email) => {
  console.log('getUserByEmail: ', email);
  try {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();

    // If no user was found, respond with an error
    if (userSnapshot.empty) {
      console.log('Login Failed');
      return res.status(401).json({ message: 'Invalid email or password' });
    } else {
      // Otherwise, retrieve the user document
      const userDoc = userSnapshot.docs[0];
      return userDoc.data();
    }
  } catch (error) {
    // In case of any other errors, return a server error status
    console.error(error);
  }
};

// This function takes in a user's apps object and an optional app name parameter
// If an app name is provided, it returns the tokens for that app
// Otherwise, it returns an array of all the app tokens
const getAppTokens = (userApps, appName = undefined) => {
  let values = [];

  if (appName) {
    // If an app name is provided, return the tokens for that app
    return userApps[appName];
  } else {
    // Otherwise, loop through all the apps and push their tokens to the values array
    for (let key in userApps) {
      if (userApps.hasOwnProperty(key)) {
        values.push(userApps[key]);
      }
    }
    // Return the array of app tokens
    return values;
  }
};

// Validate the portalId and userId
const validatePortalUserId = async (portalId, userId) => {
  portalId = String(portalId);

  console.log('PortalId: ', portalId, 'UserId: ', userId);
  try {
    const portalUserMappingDoc = await db.collection('portalUserMappings').doc(portalId).get();
    if (portalUserMappingDoc.exists) {
      const data = portalUserMappingDoc.data();
      if (data.userId === userId) {
        return true; // The given userId matches the one in the document
      } else {
        return false; // The given userId doesn't match the one in the document
      }
    } else {
      // if portalId doesn't exist in the DB, then it's a new portalId
      // in this case, we allow the userId to be used with this new portalId
      return true;
    }
  } catch (error) {
    console.error(`Failed to validate portalId and userId: `, error.message);
    return false;
  }
};

// Check if portalId exists
const doesPortalExist = async (portalId) => {
  console.log('Checking PortalId: ', portalId);
  try {
    const portalDoc = await db.collection('portalUserMappings').doc(portalId).get();
    if (!portalDoc.exists) {
      console.log(`PortalId does not exist in the database: `, portalId);
      return false;
    } else {
      console.log(`PortalId exists in the database: `, portalId);
      return true;
    }
  } catch (error) {
    console.error(`Failed to check portalId existence: `, error.message);
    return false;
  }
};

// Update or set a new entry in Firestore
// Update or set a new entry in Firestore
const updateSelectedCountry = async (hubspotId, countryCode) => {
  try {
    await db.collection('portalUserMappings').doc(hubspotId).set(
      {
        selectedCountry: countryCode,
      },
      { merge: true }
    );
    console.log(`Successfully updated user ${hubspotId} with country ${countryCode}`);
  } catch (error) {
    console.error(`Error updating user ${hubspotId}: ${error.message}`);
    throw error; // Propagate error so caller can handle it if they want
  }
};

const getSelectedCountry = async (hubspotId) => {
  try {
    const userDoc = await db.collection('portalUserMappings').doc(hubspotId).get();

    if (!userDoc.exists) {
      const error = new Error(`User ${hubspotId} does not exist`);
      console.error(error.message);
      throw error; // Propagate error so caller can handle it if they want
    } else {
      const selectedCountry = userDoc.data().selectedCountry || null;
      return selectedCountry;
    }
  } catch (error) {
    console.error(`Error retrieving user ${hubspotId}: ${error.message}`);
    throw error; // Propagate error so caller can handle it if they want
  }
};

module.exports = {
  db,
  storeUserAppAuth,
  getAppByName,
  getUserById,
  getUserByEmail,
  getAppTokens,
  deleteUserAppAuth,
  getUserIdByPortalId,
  createUserInFirebase,
  createCustomTokenInFirebase,
  verifyIdTokenInFirebase,
  validatePortalUserId,
  doesPortalExist,
  updateSelectedCountry,
  getSelectedCountry,
};
