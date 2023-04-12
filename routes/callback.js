const express = require('express');
const router = express.Router();

const { handleCallback } = require('../controllers/callback');

router.get('/callback', handleCallback);

module.exports = router;
