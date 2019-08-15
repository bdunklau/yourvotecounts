const functions = require('firebase-functions');
const admin = require('firebase-admin');
const auth = require('../auth');


// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

// firebase deploy --only functions:getUser,functions:setUser

exports.getUser = functions.https.onRequest(async (req, res) => {
  let authKeyValid = await auth.authKeyValidated(req.query.auth_key);
  if(!authKeyValid)
    return res.status(200).send('<h3>error</h3><br/><h2>not authorized (code 4)</h2>')

  return db.collection('user').where('phoneNumber', '==', '+1'+req.query.phoneNumber).get().then(snapshot => {
    if (snapshot.size === 0) {
      return res.status(200).send({'response': 'not found: '+req.query.phoneNumber});
    }
    var xxx = [];
    snapshot.docs.forEach((doc) => {
      xxx.push(doc.data());
    });
    return res.status(200).send(xxx[0]);
  })
})


// "updateUser" already taken by auth.js
exports.setUser = functions.https.onRequest(async (req, res) => {
  let authKeyValid = await auth.authKeyValidated(req.query.auth_key);
  if(!authKeyValid)
    return res.status(200).send('<h3>error</h3><br/><h2>not authorized (code 4)</h2>')

  var updateValues = {};
  updateValues['displayName'] = req.body.displayName;
  updateValues['displayName_lower'] = req.body.displayName.toLowerCase();

  if(req.body.online) {
    updateValues['online'] = req.body.online === 'true' ? true : false;
  }

  if(req.body.tosAccepted) {
    updateValues['tosAccepted'] = req.body.tosAccepted === 'true' ? true : false;
  }

  if(req.body.privacyPolicyRead) {
    updateValues['privacyPolicyRead'] = req.body.privacyPolicyRead === 'true' ? true : false;
  }

  return db.collection('user').doc(req.body.uid).update(updateValues).then(() => {
    return res.status(200).send({'status': 'ok', 'response': 'User updated with: '+updateValues});
  })
})
