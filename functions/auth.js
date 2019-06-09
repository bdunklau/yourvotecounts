const functions = require('firebase-functions');
const admin = require('firebase-admin')
const log = require('./log')

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:logNewUser,functions:recordNewUser,functions:deleteUser,functions:logDeleteUser,functions:initiateDeleteUser


exports.logNewUser = functions.auth.user().onCreate((user) => {
  return log.i({event: 'user created', uid: user.uid, phoneNumber: user.phoneNumber})
});


exports.recordNewUser = functions.auth.user().onCreate((user) => {
  return db.collection('user').add({uid: user.uid, phoneNumber: user.phoneNumber, date: admin.firestore.Timestamp.now(), date_ms: admin.firestore.Timestamp.now().toMillis()})
});


exports.deleteUser = functions.auth.user().onDelete(async (user) => {
  try {
    var users = await db.collection('user').where('uid','==',user.uid).get();
    const batch = db.batch();
    users.forEach(function(user) {batch.delete(user.ref)})
    return batch.commit()
  } catch(err) {
    return log.e({event: 'error deleting user', uid: user.uid, phoneNumber: user.phoneNumber})
  }
});


exports.logDeleteUser = functions.auth.user().onDelete((user) => {
  return log.i({event: 'user deleted', uid: user.uid, phoneNumber: user.phoneNumber})
});


exports.initiateDeleteUser = functions.https.onRequest(async (req, res) => {
  try {
    await admin.auth().deleteUser(req.query.uid)
    console.log('Successfully deleted user');
  }
  catch(error) {
    console.log('Error deleting user:', error);
  }
  return res.set({ 'Access-Control-Allow-Origin': '*',
                   'Access-Control-Allow-Methods': 'DELETE',
                   'Access-Control-Allow-Headers': ['access-control-allow-origin', 'authorization', 'content-type'] }).status(200).send({text: "ok"});
})
