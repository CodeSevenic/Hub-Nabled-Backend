const express = require('express');
const router = express.Router();
const { deleteUserAccountAuth } = require('../controllers/firebase');

// API route for user registration
router.post('/delete-account-auth/:userId/:portalId', deleteUserAccountAuth);

module.exports = router;
