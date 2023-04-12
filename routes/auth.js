const express = require('express');
const router = express.Router();
const { authUrl, handleInstall, handleOauthCallback } = require('../services/hubspot');

router.get('/install', handleInstall(authUrl));
router.get('/oauth-callback', handleOauthCallback);

module.exports = router;
