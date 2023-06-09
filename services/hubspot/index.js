const hubSpotOauth = require('./hubspot-oauth');
const hubSpotContacts = require('./hubspot-contacts');

module.exports = {
  ...hubSpotOauth,
  ...hubSpotContacts,
};
