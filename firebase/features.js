const { db } = require('./firebaseAdmin');

// ======= User Features ======= //

// Enable a feature for a user
exports.enableFeature = async (userId, hubspotId, featureName) => {
  try {
    // Update the user document with the enabled feature
    await db
      .collection('users')
      .doc(userId)
      .update({
        [`appAuths.${hubspotId}.features.${featureName}`]: true,
      });

    console.log(
      `Feature ${featureName} enabled for user ${userId} in hubspot account ${hubspotId}`
    );
  } catch (error) {
    console.error(
      `Failed to enable feature ${featureName} for user ${userId} in hubspot account ${hubspotId}: `,
      error.message
    );
  }
};

// Disable a feature for a user
exports.disableFeature = async (userId, hubspotId, featureName) => {
  try {
    // Update the user document with the disabled feature
    await db
      .collection('users')
      .doc(userId)
      .update({
        [`appAuths.${hubspotId}.features.${featureName}`]: false,
      });

    console.log(
      `Feature ${featureName} disabled for user ${userId} in hubspot account ${hubspotId}`
    );
  } catch (error) {
    console.error(
      `Failed to disable feature ${featureName} for user ${userId} in hubspot account ${hubspotId}: `,
      error.message
    );
  }
};

// Get all users with a feature enabled
exports.getUsersWithFeatureEnabled = async (hubspotId, featureName) => {
  try {
    // Query all users where the specified feature is enabled
    const usersSnapshot = await db
      .collection('users')
      .where(`appAuths.${hubspotId}.features.${featureName}`, '==', true)
      .get();

    const users = [];
    usersSnapshot.forEach((doc) => users.push(doc.data()));

    console.log(
      `Found ${users.length} user(s) with feature ${featureName} enabled in hubspot account ${hubspotId}`
    );

    return users;
  } catch (error) {
    console.error(
      `Failed to get users with feature ${featureName} enabled in hubspot account ${hubspotId}: `,
      error.message
    );
  }
};

// Get features of a user for a particular Hubspot account
exports.getUserFeatures = async (userId, hubspotId) => {
  try {
    // Get the user document
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();

    if (user && user.appAuths[hubspotId]) {
      const features = user.appAuths[hubspotId].features;
      console.log(
        `User ${userId} has these features enabled in hubspot account ${hubspotId}: `,
        features
      );
      return features;
    } else {
      console.log(`No features found for User ${userId} in hubspot account ${hubspotId}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Failed to get features for user ${userId} in hubspot account ${hubspotId}: `,
      error.message
    );
  }
};

// Get a user with a feature enabled
exports.getUserWithFeatureEnabled = async (userId, hubspotId, featureName) => {
  try {
    // Get the user document where the specified feature is enabled
    const userDoc = await db.collection('users').doc(userId).get();

    const user = userDoc.data();

    if (user && user.appAuths[hubspotId] && user.appAuths[hubspotId].features[featureName]) {
      console.log(
        `User ${userId} has feature ${featureName} enabled in hubspot account ${hubspotId}`
      );
      return user;
    } else {
      console.log(
        `User ${userId} does not have feature ${featureName} enabled in hubspot account ${hubspotId}`
      );
      return null;
    }
  } catch (error) {
    console.error(
      `Failed to get user ${userId} with feature ${featureName} enabled in hubspot account ${hubspotId}: `,
      error.message
    );
  }
};

// Get all features for a user
exports.getAllFeaturesForUser = async (userId, hubspotId) => {
  try {
    // Get the user document
    const userDoc = await db.collection('users').doc(userId).get();

    const user = userDoc.data();

    if (user && user.appAuths[hubspotId]) {
      const features = user.appAuths[hubspotId].features;
      console.log(
        `User ${userId} has the following features in hubspot account ${hubspotId}: `,
        features
      );
      return features;
    } else {
      console.log(`User ${userId} has no features in hubspot account ${hubspotId}`);
      return {};
    }
  } catch (error) {
    console.error(
      `Failed to get features for user ${userId} in hubspot account ${hubspotId}: `,
      error.message
    );
  }
};
