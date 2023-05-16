var admin = require('firebase-admin');

var serviceAccount = require('../env/hub-nabled-firebase-adminsdk-z9tzu-4de95eb8bc.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
