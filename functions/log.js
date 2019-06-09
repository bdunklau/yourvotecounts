const functions = require('firebase-functions');
const admin = require('firebase-admin')

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


exports.i = function(keyvals) {
  return logit(keyvals, 'info')
}

exports.d = function(keyvals) {
  return logit(keyvals, 'debug')
}

exports.e = function(keyvals) {
  return logit(keyvals, 'error')
}

logit = function(keyvals, level) {
  return db.collection('log').add({level: level, event: keyvals.event, uid: keyvals.uid, phoneNumber: keyvals.phoneNumber, date: admin.firestore.Timestamp.now(), date_ms: admin.firestore.Timestamp.now().toMillis()})
}
