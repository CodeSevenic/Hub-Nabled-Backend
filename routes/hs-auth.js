const express = require('express');
const router = express.Router();

const { hsAuth } = require('../controllers/hs-auth');

router.get('/auth', hsAuth);

module.exports = router;
