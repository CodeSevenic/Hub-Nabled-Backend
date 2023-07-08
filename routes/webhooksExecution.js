const express = require('express');
const { webhookEvents } = require('../services/hubspot/wehookEvents');
const router = express.Router();

router.post('/hubspot-portal/event', webhookEvents);

module.exports = router;
