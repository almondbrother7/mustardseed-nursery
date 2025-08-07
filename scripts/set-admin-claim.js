const admin = require('firebase-admin');
const serviceAccount = require('../private/service-account.json');
require('dotenv').config(); //{ path: '../.env' });

const adminEmail = process.env.ADMIN_EMAIL;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin.auth().getUserByEmail(adminEmail)
  .then(user => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`✅ Custom claim 'admin: true' set for ${adminEmail}`);
  })
  .catch(error => {
    console.error('❌ Error setting custom claim:', error);
  });
