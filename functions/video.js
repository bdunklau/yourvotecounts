'use strict'

const admin = require('firebase-admin')
const functions = require('firebase-functions')


// firebase deploy --only functions:getVideoInfo


// called from server.ts
exports.getVideoInfo = functions.https.onRequest(async (req, res) => {

    var db = admin.firestore();
    var keys = await db.collection('room').doc('keys').get()

    const roomRef = db.collection('room');
    const rooms = await roomRef.where('CompositionSid', '==', req.query.compositionSid).limit(1).get();
    if (rooms.empty) {
        console.log('No matching rooms');
        return res.status(200).send({"result": "I don't like that url"})
    }  
    
    let meta;
    rooms.forEach(doc => {
        meta = {
            "image": doc.data().screenshotUrl,
            "description": doc.data().video_description,
            "title": doc.data().video_title,
        }
        //console.log(doc.id, '=>', doc.data());
    });
    //  screenshotUrl, video_description,  video_title

    return res.status(200).send(meta)

})



