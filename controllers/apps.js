const { db } = require('../firebase/firebaseAdmin');

// function to add HubSpot app to Firebase
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

// function to get HubSpot by appName from Firebase
exports.getApp = async (req, res) => {
  const { appName } = req.params;

  try {
    const doc = await db.collection('apps').doc(appName).get();
    if (!doc.exists) {
      res.status(404).json({ message: `App with name ${appName} not found` });
    } else {
      res.status(200).json({ id: doc.id, ...doc.data() });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching the app' });
  }
};

// function to get all HubSpot apps from Firebase
exports.getApps = async (req, res) => {
  try {
    const snapshot = await db.collection('apps').get();
    const apps = [];
    snapshot.forEach((doc) => {
      apps.push({ id: doc.id, ...doc.data() });
    });
    console.log('apps: ', apps);
    res.status(200).json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching the apps' });
  }
};
