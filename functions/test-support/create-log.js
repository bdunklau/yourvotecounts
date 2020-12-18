const functions = require('firebase-functions');
const admin = require('firebase-admin');
const log = require('../log');
const auth = require('../auth');
const moment = require('moment');
const _ = require('lodash');

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:createLog,functions:createLogs,functions:deleteLogs

// called by log.e2e-spec.ts
exports.createLog = functions.https.onRequest(async (req, res) => {
  let authKeyValid = await auth.authKeyValidated(req.query.auth_key);
  if(!authKeyValid)
    return res.status(200).send('<h3>error</h3><br/><h2>not authorized (code 4)</h2>')

  if(!req.query.level)
    return res.status(200).send('<h3>error</h3><br/><h2>"level" request parameter required</h2>')
  if(!req.query.event)
    return res.status(200).send('<h3>error</h3><br/><h2>"event" request parameter required</h2>')
  if(!req.query.uid)
    return res.status(200).send('<h3>error</h3><br/><h2>"uid" request parameter required</h2>')
  if(!req.query.displayName)
    return res.status(200).send('<h3>error</h3><br/><h2>"displayName" request parameter required</h2>')
  if(!req.query.phoneNumber)
    return res.status(200).send('<h3>error</h3><br/><h2>"phoneNumber" request parameter required</h2>')
  if(!req.query.date_ms)
    return res.status(200).send('<h3>error</h3><br/><h2>"date_ms" request parameter required</h2>')

  var phoneNumber = req.query.phoneNumber.startsWith('+1') ? req.query.phoneNumber : '+1'+req.query.phoneNumber;

  var keyvals = {event: req.query.event, user: {uid:req.query.uid, displayName:req.query.displayName, phoneNumber:phoneNumber}}
  var date_ms = parseInt(req.query.date_ms)
  var date = admin.firestore.Timestamp.fromDate(moment(date_ms).toDate());
  log.logit2(keyvals, req.query.level, date, date_ms)

  var resp = '<div>test log written</div>'
  resp += '<br/>level: '+req.query.level;
  resp += '<br/>event: '+req.query.event;
  resp += '<br/>uid: '+req.query.uid;
  resp += '<br/>displayName: '+req.query.displayName;
  resp += '<br/>phoneNumber: '+phoneNumber;
  resp += '<br/>date_ms: '+req.query.date_ms;
  resp += '<br/>date: '+date;
  res.status(200).send(resp);
})


// Needs YOURVOTECOUNTS_AUTH_KEY to be passed in
exports.createLogs = functions.https.onRequest(async (req, res) => {
  let authKeyValid = await auth.authKeyValidated(req.query.auth_key);
  if(!authKeyValid)
    return res.status(200).send('<h3>error</h3><br/><h2>not authorized (code 4)</h2>')

  var date = admin.firestore.Timestamp.now();
  var date_ms = date.toMillis();
  if(req.query.millis) {
    date = moment(parseInt(req.query.millis)).toDate();
    date_ms = date.getTime();//'+60000; // add one minute so there's no midnight ambiguity
    console.log('req.query.millis = ', req.query.millis);
    console.log('moment(date_ms).toDate() = ', moment(date_ms).toDate());
    date = admin.firestore.Timestamp.fromDate(moment(date_ms).toDate());
    console.log('date = ', date);
  }

  var levels = ['debug', 'info', 'error'];
  if(req.query.levels) {
    levels = _.split(req.query.levels, ',');
  }

  var count = 1;
  if(req.query.count) count = parseInt(req.query.count);

  var sampleUsers = [
    {uid:'111111', displayName:'User1', phoneNumber:'+11115551111'},
    {uid:'222222', displayName:'User2', phoneNumber:'+11115552222'},
  ];


  for(var i=0; i < count; i++) {
    _.each(levels, (level) => {
      _.each(sampleUsers, (su) => {
        var entry = {level: level, event: 'test event', date: date, date_ms: date_ms, uid: su.uid, displayName: su.displayName, phoneNumber: su.phoneNumber};
        log.logit3(entry);
      })
    })
  }

  // var kv1 = {event: 'test event', user: {uid:'111111', displayName:'User1', phoneNumber:'+11115551111'}}
  // var kv2 = {event: 'test event', user: {uid:'222222', displayName:'User2', phoneNumber:'+11115552222'}}
  // var kv3 = {event: 'test event', user: {uid:'333333', displayName:'User3', phoneNumber:'+11115553333'}}
  // var kv4 = {event: 'test event', user: {uid:'444444', displayName:'User4', phoneNumber:'+11115554444'}}
  // var kv5 = {event: 'test event', user: {uid:'555555', displayName:'User5', phoneNumber:'+11115555555'}}
  // var kv6 = {event: 'test event', user: {uid:'666666', displayName:'User6', phoneNumber:'+11115556666'}}
  // log.logit2(kv1, 'debug', date, date.toMillis()),
  // log.logit2(kv2, 'debug', date, date.toMillis()),
  // log.logit2(kv3, 'info', date, date.toMillis()),
  // log.logit2(kv4, 'info', date, date.toMillis()),
  // log.logit2(kv5, 'error', date, date.toMillis()),
  // log.logit2(kv6, 'error', date, date.toMillis()),
  res.status(200).send('<div>test logs written</div>');

})

/**
Options
by: event, phoneNumber, displayName
**/
exports.deleteLogs = functions.https.onRequest((req, res) => {
  var by = 'event'
  if(req.query.by) by = req.query.by

  var value = 'test event'
  if(req.query.value) value = req.query.value

  if(by === 'phoneNumber' && !value.startsWith('+1'))
    value = '+1'+value;

  let debugQuery = db.collection('log_debug').where(by, '==', value);
  let infoQuery = db.collection('log_info').where(by, '==', value);
  let errorQuery = db.collection('log_error').where(by, '==', value);

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
        batch.delete(doc['ref']);
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
