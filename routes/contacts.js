const express = require('express');
const router = express.Router();

const isAuthorized = require('../middlewares/auth');
const { contacts } = require('../controllers/contacts');

router.get('/contacts', isAuthorized, contacts);

router.get('/error', (req, res) => {
  res.render('error', { msg: req.query.msg });
});

module.exports = router;
