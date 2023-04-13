const { isAuthorized } = require('../services/hubspot');

const authMiddleware = (req, res, next) => {
  console.log(isAuthorized(req.sessionID));
  if (isAuthorized(req.sessionID)) {
    // Use the imported isAuthorized function here
    next();
  } else {
    // Send an HTML response with an Install button
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Not Authorized</title>
      </head>
      <body>
          <h1>You are not authorized</h1>
          <p>
              <a href="/install">
                  <button>Install</button>
              </a>
          </p>
      </body>
      </html>
    `);
  }
};

module.exports = authMiddleware;
