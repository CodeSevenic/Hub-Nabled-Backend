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

module.exports = { db, storeUserAppAuth };
