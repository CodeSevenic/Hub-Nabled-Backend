const express = require('express');
const router = express.Router();
const { authUrl, handleInstall, handleOauthCallback } = require('../services/hubspot');
const { register, login } = require('../controllers/auth');

// API route for user registration
router.post('/register', register);
// API route for user login
router.post('/login', login);
// API route to initiate app install
router.get('/install', handleInstall(authUrl));
// API route to run Oauth function
router.get('/oauth-callback', handleOauthCallback);

module.exports = router;
