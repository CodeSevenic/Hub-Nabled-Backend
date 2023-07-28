const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 8080;

const config = {
  HUBSPOT_API_KEY: process.env.HUBSPOT_API_KEY,
  HUBSPOT_API_BASE_URL: process.env.HUBSPOT_API_BASE_URL,
  PORT: PORT,
  REDIRECT_URI:
    process.env.NODE_ENV === 'DEV'
      ? `http://localhost:${PORT}/api/oauth-callback`
      : 'https://seahorse-app-847hs.ondigitalocean.app/api/oauth-callback',
  NODE_ENV: process.env.NODE_ENV || 'PROD',
};

module.exports = config;
