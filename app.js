const express = require('express');
const session = require('express-session');
const opn = require('open');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { default: axios } = require('axios');
const { sendWelcomeEmail } = require('./utils/sendgrid');
const path = require('path');
const app = express();
const { PORT, NODE_ENV } = require('./config');

console.log('NODE_ENV: ', NODE_ENV);

// Set CORS headers
if (NODE_ENV === 'DEV') {
  app.use(
    cors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], // Replace with your frontend origin
      methods: ['GET', 'POST'],
      credentials: true,
    })
  );
}

// app.use(express.json({ limit: '50mb' }));

app.use(cookieParser());
// Use a session to keep track of client ID
app.use(
  session({
    secret: process.env.SESSION_SECRET, // This should be a long and complex string
    resave: NODE_ENV === 'PROD', // Secure in PROD, not in DEV
    saveUninitialized: true,
    cookie: {
      secure: NODE_ENV === 'PROD', // Secure in PROD, not in DEV
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// API routes
const apps = require('./routes/apps');
const authRoutes = require('./routes/auth');
const featuresRoutes = require('./routes/features');
const pluginExecutionRoutes = require('./routes/pluginExecution');
const firebase = require('./routes/firebase');
const hubSpotWebhooks = require('./routes/webhooksExecution');

app.use('/api/', authRoutes);
app.use('/api/', apps);
app.use('/api/', featuresRoutes);
app.use('/api/', pluginExecutionRoutes);
app.use('/api/', firebase);
app.use('/api/', hubSpotWebhooks);

// Front End
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', function (_, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));
// opn(`http://localhost:${PORT}/api/`);
