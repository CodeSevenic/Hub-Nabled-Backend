const dotenv = require('dotenv');

dotenv.config();

const PORT = 4000;

const config = {
  CLIENT_ID: process.env.APP1_CLIENT_ID,
  HUBSPOT_API_KEY: process.env.HUBSPOT_API_KEY,
  HUBSPOT_API_BASE_URL: process.env.HUBSPOT_API_BASE_URL,
  CLIENT_SECRET: process.env.APP1_CLIENT_SECRET,
  SCOPES: process.env.APP1_SCOPES
    ? process.env.APP1_SCOPES.split(/ |, ?|%20/).join(' ')
    : ['crm.objects.contacts.read'],
  PORT: PORT,
  REDIRECT_URI: `http://localhost:${PORT}/api/oauth-callback`,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

if (!config.CLIENT_ID || !config.CLIENT_SECRET) {
  throw new Error('Missing CLIENT_ID or CLIENT_SECRET environment variable.');
}

module.exports = config;
