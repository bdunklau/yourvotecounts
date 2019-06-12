const functions = require('firebase-functions');
const admin = require('firebase-admin')
const log = require('./log')

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:logNewUser,functions:recordNewUser,functions:deleteUser,functions:logDeleteUser,functions:initiateDeleteUser,functions:createCustomToken


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

// pass phoneNumber request parameter without country code and get an auth token
exports.createCustomToken = functions.https.onRequest(async (req, res) => {
  // export YOURVOTECOUNTS_AUTH_KEY=/config/docId/auth_key in firestore

  // No auth_key req parm?  quit early
  if(!req.query.auth_key) {
    return res.status(200).send('<h3>error</h3><br/><h2>not authorized (code 1)</h2>')
  }

  db.collection('config').where('auth_key', '==', req.query.auth_key).limit(1).get().then(snap => {
    // auth_key not in the database?  quit early
    if(snap.size === 0) {
      return res.status(200).send('<h3>error</h3><br/><h2>not authorized (code 2)</h2>')
    }
    return snap.forEach(function(doc1) {
      var auth_key = doc1.data().auth_key;

      // auth_key parm not correct?  quit early
      if(req.query.auth_key !== auth_key) {
        return res.status(200).send('<h3>error</h3><br/><h2>not authorized (code 3)</h2>')
      }

      // if we get this far, then the auth_key req parm is correct and we can generate a token
      try {
        var query = '+1'+req.query.phoneNumber;
        db.collection('user').where('phoneNumber','==', query).limit(1).get().then( querySnapshot => {
          console.log('querySnapshot.size: ', querySnapshot.size);
          if(querySnapshot.size === 0) {
            return res.status(200).send('<h3>error</h3><br/><h2>Phone not found: '+query+' (code 4)</h2>')
          }

          return querySnapshot.forEach(function(doc) {
            var user = doc.data();
            console.log('user: ', user);
            admin.auth().createCustomToken(user.uid)
            .then(function(customToken) {
              // Send token back to client
              return res.status(200).send('<h3>token</h3><br/><h4>'+customToken+'</h4><br/>Phone: '+req.query.phoneNumber+'<br/>uid: '+user.uid)
            })
            .catch(function(error) {
              return res.status(401).send('<h3>error</h3><br/><h2>'+error+' (code 5)</h2>')
            });
          })
        })
        .catch(function(error) {
          return res.status(401).send('<h3>error</h3><br/><h2>'+error+' (code 6)</h2>')
        });

      } catch(err) {
        return res.status(401).send('<h3>error</h3><br/><h2>'+err+' (code 7)</h2>')
      }

    })
  })
  .catch(function(err3) {
    return res.status(401).send('<h3>error</h3><br/><h2>'+err+' (code 8)</h2>');
  })


})
