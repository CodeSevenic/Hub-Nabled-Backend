const express = require('express');
const { createObjectSchema } = require('../controllers/hubspot');
const router = express.Router();

router.post('/create-schema', createObjectSchema);

module.exports = router;
