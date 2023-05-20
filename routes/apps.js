const express = require('express');
const { addApp, getApp } = require('../controllers/apps');
const { get } = require('request');

const router = express.Router();

// API route to Add HubSpot apps to Firebase
router.post('/apps', addApp);
// API route to get HubSpot app by appName from Firebase
router.get('/apps/:appName', getApp);

module.exports = router;
