var admin = require('firebase-admin');

var serviceAccount = require('../env/hub-nabled-firebase-adminsdk-z9tzu-4de95eb8bc.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Store authentications under a user account
const storeUserAppAuth = async (userId, appId, tokens) => {
  // Get the user document reference
  const userDoc = db.doc(`users/${userId}`);

  // Fetch the document and check if it exists
  const docSnapshot = await userDoc.get();
  if (docSnapshot.exists) {
    const userData = docSnapshot.data();

    // If appId already exists, skip the rest of the logic
    if (userData.appAuths && userData.appAuths[appId]) {
      console.log(`       > App ${appId} already exists for user ${userId}`);
      return;
    }

    // Create an 'appAuths' object to store the tokens.
    const appAuths = {
      [appId]: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      },
    };

    // If the document exists, update it with the 'appAuths' object.
    await userDoc.set({ appAuths }, { merge: true });
  }
};

// Get app by name
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

// Get user by document ID
const getUserById = async (userId) => {
  try {
    const doc = await db.collection('users').doc(userId).get();
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

module.exports = { db, storeUserAppAuth, getAppByName, getUserById };
