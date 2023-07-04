const express = require('express');
const { pluginExecution } = require('../controllers/pluginExecution');
const router = express.Router();

router.post('/execute-feature/:userId/:hubspotId/:featureId', pluginExecution);

module.exports = router;
