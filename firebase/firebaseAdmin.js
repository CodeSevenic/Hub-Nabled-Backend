var admin = require('firebase-admin');

var serviceAccount = require('../env/hub-nabled-firebase-adminsdk-z9tzu-4de95eb8bc.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
  }
};

// Delete authentications under a user account
const deleteUserAppAuth = async (userId, portalId) => {
  console.log('deleteUserAppAuth Running...');
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
};
