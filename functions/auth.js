const functions = require('firebase-functions');

const admin = require('firebase-admin')

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
const db = admin.database();


exports.logNewUser = functions.auth.user().onCreate((user) => {
  return db.child('log').push().set({event: 'user created', uid: user.uid, phoneNumber: user.phoneNumber})
});
