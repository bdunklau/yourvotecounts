
const functions = require('firebase-functions');
const admin = require('firebase-admin')

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:sendSms


exports.sendSms = functions.https.onRequest(async (req, res) => {
  let authKeyValid = await twilioAuthKeyValidated(req.query.auth_key);
  if(!authKeyValid)
    return res.status(200).send('<h3>error</h3><br/><h2>not authorized (code 4)</h2>')

  var resp = 'OK - good key';
  res.status(200).send(resp);
})


var twilioAuthKeyValidated = function(auth_key) {

  return new Promise((resolve, reject) => {
    if(!auth_key) {
      resolve(false);
    }

    return db.collection('config').doc('settings').get().then(snap => {
      // auth_key not in the database?  quit early
      if(snap.size === 0) {
        resolve(false);
        return;
      }
      resolve(snap.auth_key === auth_key)
      return;
    })

  })

}
