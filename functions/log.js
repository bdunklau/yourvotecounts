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
  exports.logit2(keyvals, level, admin.firestore.Timestamp.now(), admin.firestore.Timestamp.now().toMillis());
}

exports.logit2 = function(keyvals, level, date, date_ms) {
  var entry = {level: level,
              event: keyvals.event,
              date: date,
              date_ms: date_ms};
  if(keyvals.user) {
    if(keyvals.user.uid) entry.uid = keyvals.user.uid;
    if(keyvals.user.displayName) entry.displayName = keyvals.user.displayName;
    if(keyvals.user.phoneNumber) entry.phoneNumber = keyvals.user.phoneNumber;
  }
  if(level === 'error') {
    db.collection('log_error').add(entry);
    db.collection('log_info').add(entry);
    db.collection('log_debug').add(entry);
  }
  else if(level === 'info') {
    db.collection('log_info').add(entry);
    db.collection('log_debug').add(entry);
  }
  else if(level === 'debug') {
    db.collection('log_debug').add(entry);
  }
  return;
}
