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

app.use('/', indexRoutes);
app.use('/', authRoutes);

app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));
opn(`http://localhost:${PORT}`);
