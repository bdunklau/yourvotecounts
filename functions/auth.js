const functions = require('firebase-functions');
const admin = require('firebase-admin')
const log = require('./log');
const moment = require('moment');

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:logNewUser,functions:recordNewUser,functions:deleteUser,functions:logDeleteUser,functions:initiateDeleteUser,functions:createCustomToken;functions:updateUser


exports.logNewUser = functions.auth.user().onCreate((user) => {
  return log.i({event: 'user created', user: user})
});


exports.recordNewUser = functions.auth.user().onCreate((user) => {
  let daysOut = 60
  var access_expiration_ms = moment().startOf('day').add(daysOut, 'days').add(1, 'days').subtract(1, 'second').toDate().getTime()

  // start out with no access to create video   https://headsupvideo.atlassian.net/browse/HEADSUP-67?focusedCommentId=10135
  // var access_expiration_ms = new Date().getTime() - 1000
  return db.collection('user').doc(user.uid)
      .set({uid: user.uid,
            access_expiration_ms: access_expiration_ms,
            phoneNumber: user.phoneNumber,
            date: admin.firestore.Timestamp.now(),
            date_ms: admin.firestore.Timestamp.now().toMillis()})
});


exports.deleteUser = functions.auth.user().onDelete(async (user) => {
  try {
    var users = await db.collection('user').where('uid','==',user.uid).get();
    const batch = db.batch();
    users.forEach(function(user) {batch.delete(user.ref)})
    return batch.commit()
  } catch(err) {
    return log.e({event: 'error deleting user', user: user})
  }
});


exports.logDeleteUser = functions.auth.user().onDelete((user) => {
  return log.i({event: 'user deleted', user: user})
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

// Listen for any change on document `id` in collection `users`
exports.updateUser = functions.firestore.document('user/{id}').onUpdate(async (change, context) => {
  const newName = change.after.data().displayName;
  const oldName = change.before.data().displayName;
  const newExpiry = change.after.data().access_expiration_ms;
  const oldExpiry = change.before.data().access_expiration_ms;
  if(newName !== oldName) {
    var values = {};
    if(change.after.data().email) values.email = change.after.data().email;
    if(change.after.data().phoneNumber) values.phoneNumber = change.after.data().phoneNumber;
    if(change.after.data().emailVerified) values.emailVerified = change.after.data().emailVerified;
    if(change.after.data().displayName) values.displayName = change.after.data().displayName;
    if(change.after.data().photoURL) values.photoURL = change.after.data().photoURL;
    if(change.after.data().disabled) values.disabled = change.after.data().disabled;
    return admin.auth().updateUser(change.after.data().uid, values);
  }
  else if(oldExpiry !== newExpiry) {
    // console.log('oldExpiry = ', oldExpiry, '  newExpiry = ', newExpiry);
    await updateExpirationDates({creatorId: context.params.id, access_expiration_ms: newExpiry})
  }
  return false;
});

/**
 * update team docs
 * update team_member docs
 * set access_expiration_ms = args.access_expiration_ms
 * where creatorId = args.creatorId
 */
let updateExpirationDates = async function(args) {
  console.log('args.creatorId = ', args.creatorId, '  args.access_expiration_ms = ', args.access_expiration_ms);
  
  var teams = await db.collection('team').where('creatorId','==', args.creatorId).get();
  const batch = db.batch();
  teams.forEach(function(team) {
    // triggers team.js:updateTeamMemberExpiration()
    batch.update(team.ref, {access_expiration_ms: args.access_expiration_ms})
  })
  return batch.commit()
}

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


exports.authKeyValidated = function(auth_key) {

  return new Promise((resolve, reject) => {
    if(!auth_key) {
      resolve(false);
    }

    return db.collection('config').where('auth_key', '==', auth_key).limit(1).get().then(snap => {
      // auth_key not in the database?  quit early
      if(snap.size === 0) {
        resolve(false);
        return;
      }
      var valid = false
      snap.forEach(function(doc1) {
        var auth_keyReal = doc1.data().auth_key;
        if(auth_key === auth_keyReal) {
          valid = true;
        }
        resolve(valid);
      })
      return;
    })

  })

}
