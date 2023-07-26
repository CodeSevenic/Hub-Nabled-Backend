const express = require('express');
const router = express.Router();
const {
  deleteUserAccountAuth,
  selectCountryCode,
  getCountryCode,
} = require('../controllers/firebase');

// API route for user registration
router.post('/delete-account-auth/:userId/:portalId', deleteUserAccountAuth);
router.post('/select-country', selectCountryCode);
router.get('/select-country/:hubspotId', getCountryCode);

module.exports = router;
