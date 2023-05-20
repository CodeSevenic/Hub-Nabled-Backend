const express = require('express');
const { addApp, getApp, getApps, deleteApp } = require('../controllers/apps');

const router = express.Router();

// API route to Add HubSpot apps to Firebase
router.post('/apps', addApp);
// API route to get HubSpot app by appName from Firebase
router.get('/apps/:appName', getApp);
// API route to get all HubSpot apps from Firebase
router.get('/apps', getApps);
// API route to delete app by appName from Firebase
router.delete('/apps/:appName', deleteApp);

module.exports = router;
