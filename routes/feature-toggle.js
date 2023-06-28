const express = require('express');
const router = express.Router();
const { featureToggle } = require('../controllers/feature-toggle');

router.get('/feature-toggle', featureToggle);

module.exports = router;
