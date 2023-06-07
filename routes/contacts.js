const express = require('express');
const router = express.Router();

const { contacts } = require('../controllers/contacts');

router.get('/contacts', contacts);

router.get('/error', (req, res) => {
  res.render('error', { msg: req.query.msg });
});

module.exports = router;
