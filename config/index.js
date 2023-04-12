const dotenv = require('dotenv');

dotenv.config();

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  SCOPES: process.env.SCOPE
    ? process.env.SCOPE.split(/ |, ?|%20/).join(' ')
    : ['crm.objects.contacts.read'],
  PORT: process.env.PORT || 3000,
};

if (!config.CLIENT_ID || !config.CLIENT_SECRET) {
  throw new Error('Missing CLIENT_ID or CLIENT_SECRET environment variable.');
}

module.exports = config;
