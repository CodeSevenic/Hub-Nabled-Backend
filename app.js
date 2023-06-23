const express = require('express');
const session = require('express-session');
const opn = require('open');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { default: axios } = require('axios');

const app = express();
const { PORT } = require('./config');

// Set CORS headers
app.use(
  cors({
    origin: ['http://localhost:3000'], // Replace with your frontend origin
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// Use a session to keep track of client ID
app.use(
  session({
    secret: process.env.SESSION_SECRET, // This should be a long and complex string
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// API routes
const apps = require('./routes/apps');
const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
// const { getUserById } = require('./firebase/firebaseAdmin');

app.use('/api/', authRoutes);
app.use('/api/', apps);
app.use('/api/', contactsRoutes);

app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));
// opn(`http://localhost:${PORT}/api/`);
