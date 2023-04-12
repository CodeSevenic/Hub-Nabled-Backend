const dotenv = require('dotenv');

dotenv.config();

const config = {
  CLIENT_ID: process.env.APP1_CLIENT_ID,
  CLIENT_SECRET: process.env.APP1_CLIENT_SECRET,
  SCOPES: process.env.APP1_SCOPES
    ? process.env.APP1_SCOPES.split(/ |, ?|%20/).join(' ')
    : ['crm.objects.contacts.read'],
  PORT: process.env.PORT || 4000,
  REDIRECT_URI: `http://localhost:${PORT}/api/v1/callback`,
};

if (!config.CLIENT_ID || !config.CLIENT_SECRET) {
  throw new Error('Missing CLIENT_ID or CLIENT_SECRET environment variable.');
}

module.exports = config;
