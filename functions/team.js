const functions = require('firebase-functions');
const admin = require('firebase-admin')
const log = require('./log');

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:updateTeamMemberExpiration


/**
 * Triggered by auth.js:updateUser() when a user's access_expiration_ms value is changed
 * 
 * access_expiration_ms is the date that the whole team's access expires, not just a team member's access
 * We are duplicating team/{id}/access_expiration_ms over on team_member/{memberId}/access_expiration_ms
 * so that we can query for all the teams a user belongs to AND get the access expiration date FOR THAT TEAM.
 * 
 * If we only kept access_expiration_ms on the team doc, then we would be stuck doing a nested query, which 
 * isn't even possible on nosql db's
 */
exports.updateTeamMemberExpiration = functions.firestore.document('team/{id}').onUpdate(async (change, context) => {
    console.log('change.after.data().access_expiration_ms = ', change.after.data().access_expiration_ms)
    var team_member_docs = await db.collection('team_member').where('teamDocId','==', context.params.id).get();
    const batch = db.batch();
    team_member_docs.forEach(function(team_member) {
      // triggers team.js:updateTeamMemberExpiration()
      batch.update(team_member.ref, {access_expiration_ms: change.after.data().access_expiration_ms})
    })
    return batch.commit()
})
