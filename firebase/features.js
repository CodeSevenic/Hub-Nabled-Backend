const { db } = require('./firebaseAdmin');

// ======= User Features ======= //

// Enable a feature for a user
exports.enableFeature = async (userId, featureName) => {
  try {
    // Update the user document with the enabled feature
    await db
      .collection('users')
      .doc(userId)
      .update({
        [`features.${featureName}`]: true,
      });

    console.log(`Feature ${featureName} enabled for user ${userId}`);
  } catch (error) {
    console.error(`Failed to enable feature ${featureName} for user ${userId}: `, error.message);
  }
};

// Disable a feature for a user
exports.disableFeature = async (userId, featureName) => {
  try {
    // Update the user document with the disabled feature
    await db
      .collection('users')
      .doc(userId)
      .update({
        [`features.${featureName}`]: false,
      });

    console.log(`Feature ${featureName} disabled for user ${userId}`);
  } catch (error) {
    console.error(`Failed to disable feature ${featureName} for user ${userId}: `, error.message);
  }
};
// Get all users with a feature enabled
exports.getUsersWithFeature = async (featureName) => {
  try {
    const snapshot = await db
      .collection('users')
      .where(`features.${featureName}`, '==', true)
      .get();

    const users = [];
    snapshot.forEach((doc) => {
      users.push(doc.id);
    });

    console.log(`Found ${users.length} users with ${featureName} enabled: `, users);
  } catch (error) {
    console.error(`Failed to get users with ${featureName} enabled: `, error.message);
  }
};

// Get a user with a feature enabled
exports.getUserWithFeature = async (userId, featureName) => {
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      console.log(`User ${userId} does not exist.`);
      return;
    }

    const user = doc.data();
    if (user.features && user.features[featureName]) {
      console.log(`User ${userId} has feature ${featureName} enabled.`);
    } else {
      console.log(`User ${userId} does not have feature ${featureName} enabled.`);
    }
  } catch (error) {
    console.error(`Failed to get user ${userId}: `, error.message);
  }
};

// Get all features for a user
exports.getUserFeatures = async (userId) => {
  try {
    const snapshot = await db.collection('users').doc(userId).collection('features').get();
    let features = {};
    snapshot.forEach((doc) => {
      features[doc.id] = doc.data();
    });

    return features;
  } catch (error) {
    console.error(`Failed to get features for user ${userId}: `, error.message);
  }
};
// Get all features for a user
exports.getUserFeatures = async (userId) => {
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      console.log(`User ${userId} does not exist.`);
      return;
    }

    const user = doc.data();
    if (user.features) {
      console.log(`Features for user ${userId}: `, user.features);
    } else {
      console.log(`User ${userId} has no features.`);
    }
  } catch (error) {
    console.error(`Failed to get features for user ${userId}: `, error.message);
  }
};
