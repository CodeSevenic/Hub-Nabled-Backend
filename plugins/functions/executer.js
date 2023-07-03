const { getUserFeatures } = require('../../firebase/features');
const { fetchHubSpotContacts } = require('../fetchContacts');

exports.executeFeatureAction = async (userId, hubspotId, featureName) => {
  try {
    // Check if the feature is enabled for the user
    const features = await getUserFeatures(userId, hubspotId);
    const feature = features[featureName];
    if (!feature) {
      console.log(
        `Feature ${featureName} is not enabled for user ${userId} in hubspot account ${hubspotId}`
      );
      return 'notEnabled';
    }

    // Execute the associated action
    switch (featureName) {
      case 'contacts':
        const contacts = await fetchHubSpotContacts(userId, hubspotId);
        console.log(
          `Fetched ${contacts.length} contacts for user ${userId} in hubspot account ${hubspotId}`
        );
        return 'success';

      // Add other case statements for other features here...

      default:
        console.log(
          `No action associated with feature ${featureName} for user ${userId} in hubspot account ${hubspotId}`
        );
        return 'noAction';
    }
  } catch (error) {
    console.error(
      `Failed to execute feature ${featureName} for user ${userId} in hubspot account ${hubspotId}: `,
      error.message
    );
    throw error; // Re-throw the error so it can be caught by the route handler
  }
};
