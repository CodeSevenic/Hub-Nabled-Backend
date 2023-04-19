const express = require('express');
const session = require('express-session');
const opn = require('open');

const app = express();
const { PORT } = require('./config');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const { isAuthorized } = require('./services/hubspot');

// Use a session to keep track of client ID
app.use(
  session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true,
  })
);

const { setDoc, doc } = require('firebase/firestore');
const { db } = require('./firebase/index');
const { generateUniqueID } = require('../hb-frontend/src/utils/idGenerator');

// API route for user registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Implement user registration logic here
    // For example, you can store user information in Firebase
    const userId = generateUniqueID(); // Generate a unique user ID, e.g., using a UUID library or Firebase Auth

    await setDoc(doc(db, 'users', userId), {
      email: email,
      password: password, // Note: Storing passwords in plain text is not secure. You should hash the password before storing it.
    });

    res.status(200).json({ message: 'User registered successfully', userId });
  } catch (error) {
    res.status(400).json({ message: 'User registration failed', error: error.message });
  }
});
// API route for user login
app.post('/api/login', async (req, res) => {
  // Implement user login logic here
  // For example, you can retrieve user information from Firebase and validate the credentials
  const { email, password } = req.body;
  const userId = ''; // Retrieve the user ID based on the provided email and password

  if (userId) {
    res.status(200).json({ message: 'User logged in successfully', userId });
  } else {
    res.status(400).json({ message: 'User login failed' });
  }
});

// API route for installing an app
app.post('/api/install', async (req, res) => {
  const { appId } = req.body;

  if (appId === 'hubspot') {
    hubspot.handleInstall(authUrl)(req, res);
  } else {
    res.status(400).send('Invalid app ID');
  }
});

// API route for handling OAuth callback
app.get('/api/oauth-callback', hubspot.handleOauthCallback);

// API route for checking user authorization
app.get('/api/authorized', async (req, res) => {
  const userId = req.query.userId;
  const authorized = await isAuthorized(userId);
  res.status(200).json({ authorized });
});

app.use('/', indexRoutes);
app.use('/', authRoutes);

app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));
opn(`http://localhost:${PORT}`);
