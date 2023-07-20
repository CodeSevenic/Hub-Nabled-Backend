const express = require('express');
const { webhookEvents } = require('../services/hubspot/webhookEvents');
const router = express.Router();

router.post('/hubspot-portal/event', webhookEvents);

module.exports = router;
