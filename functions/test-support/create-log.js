const functions = require('firebase-functions');
const admin = require('firebase-admin');
const log = require('../log');
const auth = require('../auth');

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:createLogs,functions:deleteLogs


// Needs YOURVOTECOUNTS_AUTH_KEY to be passed in
exports.createLogs = functions.https.onRequest(async (req, res) => {
  let authKeyValid = await auth.authKeyValidated(req.query.auth_key);
  if(!authKeyValid)
    return res.status(200).send('<h3>error</h3><br/><h2>not authorized (code 4)</h2>')

  var kv1 = {event: 'test event', user: {uid:'111111', displayName:'User1', phoneNumber:'1115551111'}}
  var kv2 = {event: 'test event', user: {uid:'222222', displayName:'User2', phoneNumber:'1115552222'}}
  var kv3 = {event: 'test event', user: {uid:'333333', displayName:'User3', phoneNumber:'1115553333'}}
  var kv4 = {event: 'test event', user: {uid:'444444', displayName:'User4', phoneNumber:'1115554444'}}
  var kv5 = {event: 'test event', user: {uid:'555555', displayName:'User5', phoneNumber:'1115555555'}}
  var kv6 = {event: 'test event', user: {uid:'666666', displayName:'User6', phoneNumber:'1115556666'}}
  log.logit2(kv1, 'debug', admin.firestore.Timestamp.now(), admin.firestore.Timestamp.now().toMillis()),
  log.logit2(kv2, 'debug', admin.firestore.Timestamp.now(), admin.firestore.Timestamp.now().toMillis()),
  log.logit2(kv3, 'info', admin.firestore.Timestamp.now(), admin.firestore.Timestamp.now().toMillis()),
  log.logit2(kv4, 'info', admin.firestore.Timestamp.now(), admin.firestore.Timestamp.now().toMillis()),
  log.logit2(kv5, 'error', admin.firestore.Timestamp.now(), admin.firestore.Timestamp.now().toMillis()),
  log.logit2(kv6, 'error', admin.firestore.Timestamp.now(), admin.firestore.Timestamp.now().toMillis()),
  res.status(200).send('<div>test logs written</div>')

})


exports.deleteLogs = functions.https.onRequest((req, res) => {
  let debugQuery = db.collection('log_debug').where('event', '==', 'test event');
  let infoQuery = db.collection('log_info').where('event', '==', 'test event');
  let errorQuery = db.collection('log_error').where('event', '==', 'test event');

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, debugQuery, resolve, reject);
    deleteQueryBatch(db, infoQuery, resolve, reject);
    deleteQueryBatch(db, errorQuery, resolve, reject);
    return res.status(200).send('<div>log entries deleted</div>')
  });
})


// This is insane.  This is how you delete
// ref:   https://firebase.google.com/docs/firestore/manage-data/delete-data
function deleteQueryBatch(db, query, resolve, reject) {
  query.get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0;
      }

      // Delete documents in a batch
      let batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        return snapshot.size;
      });
    }).then((numDeleted) => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, resolve, reject);
      });
      return;
    })
    .catch(reject);
}
