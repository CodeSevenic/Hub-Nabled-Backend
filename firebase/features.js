const { db } = require('./firebaseAdmin');

// ======= User Features ======= //

// Enable a feature for a user
exports.enableFeature = async (userId, featureName) => {
  try {
    // Create a document with the feature name in the user's 'features' sub-collection
    await db.collection('users').doc(userId).collection('features').doc(featureName).set({
      isEnabled: true,
    });

    console.log(`Feature ${featureName} enabled for user ${userId}`);
  } catch (error) {
    console.error(`Failed to enable feature ${featureName} for user ${userId}: `, error.message);
  }
};

// Disable a feature for a user
exports.disableFeature = async (userId, featureName) => {
  try {
    // Update the document with the feature name in the user's 'features' sub-collection
    await db.collection('users').doc(userId).collection('features').doc(featureName).set({
      isEnabled: false,
    });

    console.log(`Feature ${featureName} disabled for user ${userId}`);
  } catch (error) {
    console.error(`Failed to disable feature ${featureName} for user ${userId}: `, error.message);
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
