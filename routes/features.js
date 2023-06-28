const express = require('express');
const router = express.Router();
const { featureToggle } = require('../controllers/features');

router.get('/feature-toggle', featureToggle);

module.exports = router;
