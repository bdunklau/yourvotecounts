'use strict';
const corsModule = require('cors');
const cors = corsModule({origin:true});

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');
const _ = require('lodash')
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

// called from video-call.component.ts: compose()
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
            statusCallback: 'https://'+req.query.host+'/twilioCallback?room_name='+req.query.room_name+'&callback_host='+req.query.callback_host,
            resolution: '1280x720',
            format: 'mp4'
        })
        .then(composition => {
            // Not sure what we need to pass back 
            //return callback({})
            console.log('composition = ', composition)

            // This gets sent back to video-call.component.ts:compose()
            // This gets sent back before the composition is actually ready
            // /twilioCallback is how we know when the composition is ready
            // /twilioCallback is just below this function  :)
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
        let compositionNode = {
            RoomSid: req.body.RoomSid,
            CompositionSid: req.body.CompositionSid,
            CompositionUri: req.body.CompositionUri,
            composition_Size: parseInt(req.body.Size), // Number.MAX_SAFE_INTEGER = 9007199254740992  so we're safe
            composition_MediaUri: req.body.MediaUri,
            date: new Date(),
            date_ms: new Date().getTime(),
            room_name: req.query.room_name
        }

        var db = admin.firestore();
        // query room doc for host and guest info and add it to the composition doc
        let room = await db.collection('room').doc(req.body.RoomSid).get()
        let roomNode = room.data()
        compositionNode['hostId'] = roomNode.hostId
        compositionNode['hostName'] = roomNode.hostName
        compositionNode['hostPhone'] = roomNode.hostPhone
        compositionNode['guests'] = roomNode.guests

        await db.collection('composition').add(compositionNode)

        // Now send a text message to all the participants saying the video is ready
        // Have to figure out what url to put in the text message

        // See  sms.service.ts for a client-side example of triggering an sms message by writing to the database
        let recipients = _.map(roomNode.guests, guest => {
            return {displayName: guest['guestName'], phoneNumber: guest['guestPhone']}
        })
        recipients.push({displayName: roomNode.hostName, phoneNumber: roomNode.hostPhone})
        _.each(recipients, recipient => {
            // Write to the sms collection to trigger a text message.  See twilio-sms.js:sendSms()

            // "callback_host" is specified in the compose() function above
            let link = `https://${req.query.callback_host}/view-video/${req.body.CompositionSid}`
            var doc = {}
            doc['from'] = "+12673314843";
            doc['to'] = recipient.phoneNumber;
            //if(args.mediaUrl) doc['mediaUrl'] = args.mediaUrl;
            doc['message'] = `Your SeeSaw video is ready! Click the link below to check it out\n\n${link}\n\nDo not reply to this number.  It is not being monitored.`
            doc['date'] = new Date()
            doc['date_ms'] = new Date().getTime()
            this.afs.collection('sms').add(doc);
        })

        
    }
    return res.status(200).send('ok');
})
