const express = require('express');
const router = express.Router();
const {
  featureToggle,
  getAllAvailableFeatures,
  getUserEnabledFeatures,
} = require('../controllers/features');

router.post('/toggle-feature', featureToggle);
router.get('/all-features', getAllAvailableFeatures);
router.get('/enabled-features/:userId/:hubspotId', getUserEnabledFeatures);

module.exports = router;
