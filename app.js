const express = require('express');
const session = require('express-session');
const opn = require('open');
const cors = require('cors');
const { default: axios } = require('axios');

const app = express();
const { PORT } = require('./config');

const { isAuthorized } = require('./services/hubspot');
// API routes
const apps = require('./routes/apps');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const contactsRoutes = require('./routes/contacts');

// const crypto = require('crypto');
// const secret = crypto.randomBytes(32).toString('hex');
// console.log('SECRET', secret);

// app.use(express.json());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Set CORS headers
app.use(cors());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Use a session to keep track of client ID
app.use(
  session({
    secret: process.env.SESSION_SECRET, // This should be a long and complex string
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }, // Note: secure should be set to true when in production and your site uses HTTPS
  })
);

// API route for checking user authorization
app.get('/api/authorized', async (req, res) => {
  const userId = req.query.userId;
  const authorized = await isAuthorized(userId);
  res.status(200).json({ authorized });
});

app.use('/api/', indexRoutes);
app.use('/api/', authRoutes);
app.use('/api/', apps);
app.use('/api/', contactsRoutes);

app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));
// opn(`http://localhost:${PORT}/api/`);
