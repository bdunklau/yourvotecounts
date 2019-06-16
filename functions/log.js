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
  var entry = {level: level,
              event: keyvals.event, 
              date: admin.firestore.Timestamp.now(),
              date_ms: admin.firestore.Timestamp.now().toMillis()};
  if(keyvals.user) {
    if(keyvals.user.uid) entry.uid = keyvals.user.uid;
    if(keyvals.user.displayName) entry.displayName = keyvals.user.displayName;
    if(keyvals.user.phoneNumber) entry.phoneNumber = keyvals.user.phoneNumber;
  }
  return db.collection('log').add(entry);
}
