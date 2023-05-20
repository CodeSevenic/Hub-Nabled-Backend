const { db } = require('../firebase/firebaseAdmin');

// function to add HubSpot apps to Firebase
exports.addApp = async (req, res) => {
  const appData = req.body;

  // Make sure appName is provided
  if (!appData.appName) {
    return res.status(400).json({ message: 'appName is required' });
  }

  try {
    const docRef = db.collection('apps').doc(appData.appName);
    await docRef.set(appData);
    console.log('Document written with ID: ', appData.appName);
    res.status(201).json({ id: appData.appName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while saving the app' });
  }
};
