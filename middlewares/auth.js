const { isAuthorized } = require('../services/hubspot');

const authMiddleware = async (req, res, next) => {
  const userId = req.session.userId;
  console.log('Auth Middleware userId: ', userId);
  const hardCodedID = '1685968763573-bff90ed5-087d-479c-a8a8-0f17a3b186e0';
  const authorized = await isAuthorized(hardCodedID);
  console.log(authorized);
  if (authorized) {
    // Use the imported isAuthorized function here
    next();
  } else {
    res.status(401).json({
      message: 'You are not authorized',
    });
    // Send an HTML response with an Install button

    // res.send(`
    //   <!DOCTYPE html>
    //   <html lang="en">
    //   <head>
    //       <meta charset="UTF-8">
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //       <title>Not Authorized</title>
    //   </head>
    //   <body>
    //       <h1>You are not authorized</h1>
    //       <p>
    //           <a href="/api/install">
    //               <button>Install</button>
    //           </a>
    //       </p>
    //   </body>
    //   </html>
    // `);
  }
};

module.exports = authMiddleware;
