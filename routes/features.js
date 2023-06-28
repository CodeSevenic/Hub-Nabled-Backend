const express = require('express');
const router = express.Router();
const { featureToggle } = require('../controllers/features');

router.post('/toggle-feature', featureToggle);

module.exports = router;
