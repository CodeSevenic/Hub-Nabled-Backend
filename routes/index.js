const express = require('express');
const router = express.Router();
const { getAccessToken, getContact } = require('../services/hubspot');
const isAuthorized = require('../middlewares/auth');

router.get('/', isAuthorized, async (req, res) => {
  const accessToken = await getAccessToken(req.sessionID);
  const contact = await getContact(accessToken);
  const { firstname, lastname } = contact.properties;
  console.log(firstname, lastname);
  res.write(`<p>Contact name: ${firstname.value} ${lastname.value}</p>`);
});

router.get('/error', (req, res) => {
  res.render('error', { msg: req.query.msg });
});

module.exports = router;
