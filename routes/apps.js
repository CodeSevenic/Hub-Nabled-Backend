const express = require('express');
const { addApp } = require('../controllers/apps');

const router = express.Router();

// API route to Add HubSpot apps to Firebase
router.post('/apps', addApp);

module.exports = router;
