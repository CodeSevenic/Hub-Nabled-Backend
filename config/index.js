const dotenv = require('dotenv');

dotenv.config();

const PORT = 4000;

const config = {
  HUBSPOT_API_KEY: process.env.HUBSPOT_API_KEY,
  HUBSPOT_API_BASE_URL: process.env.HUBSPOT_API_BASE_URL,
  PORT: PORT,
  REDIRECT_URI: `http://localhost:${PORT}/api/oauth-callback`,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

module.exports = config;
