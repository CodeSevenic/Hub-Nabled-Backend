const { enableFeature, disableFeature } = require('../firebase/features');

exports.featureToggle = async (req, res) => {
  const { userId, featureName, isEnabled } = req.body;

  console.log('Request: ', req.body);

  try {
    if (isEnabled) {
      await enableFeature(userId, featureName);
    } else {
      await disableFeature(userId, featureName);
    }

    res.status(200).json({
      status: 'success',
      message: `Feature ${featureName} has been toggled successfully.`,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
