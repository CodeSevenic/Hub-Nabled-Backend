const express = require('express');
const router = express.Router();

const { retrieveApps } = require('../controllers/retrieveApps');

router.get('/apps', retrieveApps);

module.exports = router;
