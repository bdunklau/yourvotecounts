'use strict';
const corsModule = require('cors');
const cors = corsModule({origin:true});

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const AccessToken = require('twilio').jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);


// firebase deploy --only functions:generateTwilioToken

exports.generateTwilioToken = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        var db = admin.firestore();
        var keys = await db.collection('config').doc('keys').get()
        const twilioAccountSid = keys.data().twilio_account_sid;    
        // create API key:  https://www.twilio.com/console/project/api-keys
        const twilioApiKey = keys.data().twilio_api_key
        const twilioApiSecret = keys.data().twilio_secret
        // Create Video Grant
        const videoGrant = new VideoGrant({
            room: req.query.room_id,  // room name, not RoomSid   (optional?)
        });
        // Create an access token which we will sign and return to the client,
        // containing the grant we just created
        const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret)
        token.addGrant(videoGrant)
        token.identity = req.query.name

        return res.status(200).send({token: token.toJwt()})

    })


})
