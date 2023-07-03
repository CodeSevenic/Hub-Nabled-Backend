const express = require('express');
const { pluginExecuter } = require('../controllers/pgnExecuter');
const router = express.Router();

router.post('/execute-feature/:userId/:hubspotId/:featureName', pluginExecuter);

module.exports = router;
