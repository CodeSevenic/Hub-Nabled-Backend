const express = require('express');
const session = require('express-session');
const opn = require('open');
const cors = require('cors');

const app = express();
const { PORT, HUBSPOT_API_BASE_URL, HUBSPOT_API_KEY } = require('./config');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const { isAuthorized } = require('./services/hubspot');
const { default: axios } = require('axios');

const { collection, addDoc } = require('firebase/firestore');

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
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true,
  })
);

// API route to fetch HubSpot apps
app.post('/apps', async (req, res) => {
  const appData = req.body;

  try {
    const docRef = await addDoc(collection(db, 'apps'), appData);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while saving the app' });
  }
});

// API route for checking user authorization
app.get('/api/authorized', async (req, res) => {
  const userId = req.query.userId;
  const authorized = await isAuthorized(userId);
  res.status(200).json({ authorized });
});

app.use('/api/', indexRoutes);
app.use('/api/', authRoutes);

app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));
// opn(`http://localhost:${PORT}/api/`);
