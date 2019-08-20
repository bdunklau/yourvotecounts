const functions = require('firebase-functions');
const admin = require('firebase-admin');
const auth = require('../auth');


// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

// firebase deploy --only functions:getPrivacyPolicy

exports.getPrivacyPolicy = functions.https.onRequest(async (req, res) => {

  // no auth_key required to view privacy policy

  return db.collection('config').doc('privacy_policy').get().then(snapshot => {
    if (snapshot.size === 0) {
      return res.status(200).send({'response': 'privacy policy not found'});
    }
    var xxx = [];
    snapshot.data().text
    return res.status(200).send({text: snapshot.data().text});
  })
})
