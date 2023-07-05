﻿const express = require('express');
const router = express.Router();
const { handleInstall, handleOauthCallback } = require('../services/hubspot');
const { register, login, logout, getUserAuths } = require('../controllers/auth');

// API route for user registration
router.post('/register', register);
// API route for user login
router.post('/login', login);
// API route to initiate app install
router.get('/install', handleInstall);
// API route to run Oauth function
router.get('/oauth-callback', handleOauthCallback);
// API route for user logout
router.post('/logout', logout);
// API route to get user auths
router.get('/user-auths/:userId', getUserAuths);

module.exports = router;
