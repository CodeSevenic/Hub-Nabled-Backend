const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS options
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Set CORS headers
app.use(cors(corsOptions));

// Routes
const callbackRoute = require('./routes/callback');
const hsAuth = require('./routes/hs-auth');

// app.use(express.json());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Use a session to keep track of client ID
app.use(
  session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true,
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
