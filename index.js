const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');

// Load environment variables from .env file
dotenv.config();

// Routes
const callbackRoute = require('./routes/callback');
const hsAuth = require('./routes/hs-auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the HubSpot OAuth Node.js App');
});

// Route to handle OAuth callback
app.use('/api/v1/', callbackRoute);
// Route to initiate OAuth process
app.use('/api/v1/', hsAuth);

// Start server
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
