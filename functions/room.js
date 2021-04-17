const functions = require('firebase-functions');
const admin = require('firebase-admin')


// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:updateViewsOnRoomCreated,functions:updateViewsOnRoomUpdated,functions:updateTotalTimeOnRoomUpdated


/**
 * update the view count on the team doc
 */
exports.updateViewsOnRoomCreated = functions.firestore.document('room/{xxxxx}').onCreate(async (snap, context) => {
    var db = admin.firestore();
    let room = snap.data()
    if(!room.teamDocId) return true 
    if(!room.views) return true
    if(room.views === 0) return true
    let incr = room.views
    return db.collection('team').doc(room.teamDocId).update({ views: admin.firestore.FieldValue.increment(incr) })
})


/**
 * update the view count on the team doc
 */
exports.updateViewsOnRoomUpdated = functions.firestore.document('room/{xxxxx}').onUpdate(async (snap, context) => {
    var db = admin.firestore();
    let room = snap.after.data()
    if(!room.teamDocId) return true 
    if(snap.before.data().views === room.views) return true 
    let incr = room.views - snap.before.data().views
    return db.collection('team').doc(room.teamDocId).update({ views: admin.firestore.FieldValue.increment(incr) })
})


exports.updateTotalTimeOnRoomUpdated = functions.firestore.document('room/{xxxxx}').onUpdate(async (snap, context) => {
    var db = admin.firestore();
    let room = snap.after.data()
    if(!room.teamDocId) return true 
    if(!room.created_ms) return true 
    if(!room.call_ended_ms) return true 
    if(snap.before.data().call_ended_ms) return true  // don't recalc elapsed time
    let elapsedTime = Math.round((room.call_ended_ms - room.created_ms) / 1000) // secs
    // let elapsedTime = room.call_ended_ms - room.created_ms // millisecs
    return db.collection('team').doc(room.teamDocId).update({ totalTime: admin.firestore.FieldValue.increment(elapsedTime) })
})


/**
 * This works and it's a good example of a delete trigger
 * But I don't want the view count getting decremented if a video is deleted.  That's because people are paying for
 * views.  If the view count can be decremented, then we don't have any idea of how many views a video actually got
 */
// exports.onRoomDeleted = functions.firestore.document('room/{xxxxx}').onDelete(async (snap, context) => {
//     var db = admin.firestore();
//     let room = snap.data()
//     if(!room.teamDocId) return true 
//     if(!room.views) return true
//     if(room.views === 0) return true
//     let decrement = -1 * room.views
//     return db.collection('team').doc(room.teamDocId).update({ views: admin.firestore.FieldValue.increment(decrement) })
// })
