'use strict';
const corsModule = require('cors');
const cors = corsModule({origin:true});

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);


// firebase deploy --only functions:generateTwilioToken,functions:compose,functions:twilioCallback

exports.generateTwilioToken = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        var db = admin.firestore();
        var keys = await db.collection('config').doc('keys').get()
        const twilioAccountSid = keys.data().twilio_account_sid;    
        // create API key:  https://www.twilio.com/console/project/api-keys
        const twilioApiKey = keys.data().twilio_api_key
        const twilioApiSecret = keys.data().twilio_secret
        // Create Video Grant
        const videoGrant = new VideoGrant({
            room: req.query.room_name,  // room name, not RoomSid   (optional?)
        });
        // Create an access token which we will sign and return to the client,
        // containing the grant we just created
        const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret)
        token.addGrant(videoGrant)
        token.identity = req.query.name

        return res.status(200).send({token: token.toJwt()})

    })


})

// call from invitation-details.component.ts: compose()
exports.compose = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        var db = admin.firestore();
        var keys = await db.collection('config').doc('keys').get()
        const twilioAccountSid = keys.data().twilio_account_sid;    
        // create API key:  https://www.twilio.com/console/project/api-keys
        const twilioApiKey = keys.data().twilio_api_key
        const twilioApiSecret = keys.data().twilio_secret
        const client = twilio(twilioApiKey, twilioApiSecret, {accountSid: twilioAccountSid})
        return client.video.compositions.create({
            roomSid: req.query.RoomSid,
            audioSources: '*',
            videoLayout: {
              grid : {
                video_sources: ['*']
              }
            },
            statusCallback: 'https://'+req.query.host+'/twilioCallback?room_name='+req.query.room_name,
            resolution: '1280x720',
            format: 'mp4'
        })
        .then(composition => {
            // Not sure what we need to pass back 
            //return callback({})
            console.log('composition = ', composition)
            return res.status(200).send({result: 'ok'});
        });
    })

})


// see compose() above
exports.twilioCallback = functions.https.onRequest(async (req, res) => {
    if(req.body.RoomSid
        && req.body.PercentageDone
        && req.body.SecondsRemaining
        && req.body.StatusCallbackEvent
        && req.body.StatusCallbackEvent === 'composition-progress') {
            // do something during progress if you want
    }
    else if(req.body.RoomSid && req.body.StatusCallbackEvent && req.body.StatusCallbackEvent === 'composition-available') {
        // the composition is ready!
        var db = admin.firestore();
        await db.collection('composition').add({
            RoomSid: req.body.RoomSid,
            CompositionSid: req.body.CompositionSid,
            CompositionUri: req.body.CompositionUri,
            composition_Size: parseInt(req.body.Size), // Number.MAX_SAFE_INTEGER = 9007199254740992  so we're safe
            composition_MediaUri: req.body.MediaUri,
            date: new Date(),
            date_ms: new Date().getTime()
        })
    }
    return res.status(200).send('ok');
})
