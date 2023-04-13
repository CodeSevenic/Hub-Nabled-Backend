const express = require('express');
const session = require('express-session');
const opn = require('open');
const app = express();
const { PORT } = require('./config');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');

// Use a session to keep track of client ID
app.use(
  session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true,
  })
);

// API route for user registration
app.post('/api/register', async (req, res) => {
  // Implement user registration logic here
  // For example, you can store user information in Firebase
  res.status(200).json({ message: 'User registered successfully' });
});

// API route for user login
app.post('/api/login', async (req, res) => {
  // Implement user login logic here
  // For example, you can retrieve user information from Firebase and validate the credentials
  res.status(200).json({ message: 'User logged in successfully' });
});

// API route for installing an app
app.get('/api/install', hubspot.handleInstall(hubspot.authUrl));

// API route for handling OAuth callback
app.get('/api/oauth-callback', hubspot.handleOauthCallback);

// API route for checking user authorization
app.get('/api/authorized', async (req, res) => {
  const userId = req.query.userId;
  const authorized = await hubspot.isAuthorized(userId);
  res.status(200).json({ authorized });
});

app.use('/', indexRoutes);
app.use('/', authRoutes);

app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));
opn(`http://localhost:${PORT}`);
