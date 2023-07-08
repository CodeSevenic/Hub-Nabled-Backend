const { getUserIdByPortalId } = require('../../firebase/firebaseAdmin');

exports.webhookEvents = async (req, res) => {
  console.log('webhooksEvent', req.body);
  res.status(200).end();
  const portalId = req.body.portalId;
  // // Get userId by portalId
  const userId = await getUserIdByPortalId(portalId);

  // if (!userId) {
  //   return res.status(404).json({ message: 'User not found' });
  // }
  // // Get user document
  // const userDoc = await db.doc(`users/${userId}`).get();
  // if (!userDoc.exists) {
  //   return res.status(404).json({ message: 'User not found' });
  // }
  // const userData = userDoc.data();
  // const appAuth = userData.appAuths[portalId];
  // if (!appAuth) {
  //   return res.status(404).json({ message: 'App auth not found for this user' });
  // }
  // // Extract access tokens and enabled features
  // const tokens = {
  //   accessToken: appAuth.accessToken,
  //   refreshToken: appAuth.refreshToken,
  //   expiresIn: appAuth.expiresIn,
  //   issuedAt: appAuth.issuedAt,
  // };
  // // Get the enabled features
  // const enabledFeatures = {};
  // if (appAuth.features) {
  //   for (const featureName in appAuth.features) {
  //     if (appAuth.features[featureName]) {
  //       enabledFeatures[featureName] = true;
  //     }
  //   }
  // }
  // // Respond with the access tokens and enabled features
  // res.json({
  //   tokens,
  //   enabledFeatures,
  // });
};
