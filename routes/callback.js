const express = require('express');
const router = express.Router();

const { handleCallback } = require('../controllers/callbackController');

router.get('/callback', handleCallback);

module.exports = router;
