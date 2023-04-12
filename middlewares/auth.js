const { isAuthorized } = require('../services/hubspot');

const authMiddleware = (req, res, next) => {
  if (isAuthorized(req.sessionID)) {
    // Use the imported isAuthorized function here
    next();
  } else {
    res.redirect('/install');
  }
};

module.exports = authMiddleware;
