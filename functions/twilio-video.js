'use strict'
const corsModule = require('cors')
const cors = corsModule({origin:true})

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const twilio = require('twilio');
const _ = require('lodash')
const request = require('request')
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);


// firebase deploy --only functions:downloadComplete,functions:generateTwilioToken,functions:compose,functions:twilioCallback,functions:cutVideoComplete,functions:uploadToFirebaseStorageComplete,functions:deleteVideoComplete



exports.generateTwilioToken = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        /************** 
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
        ************************/
        let token = await createToken(req)
        return res.status(200).send({token: token})

    })


})


var createToken = async function(req) {
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
    return token.toJwt();
}


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
            statusCallback: `https://${req.query.firebase_functions_host}/twilioCallback?room_name=${req.query.room_name}&firebase_functions_host=${req.query.firebase_functions_host}&website_domain_name=${req.query.website_domain_name}&cloud_host=${req.query.cloud_host}`,
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
    var db = admin.firestore();

    if(req.body.RoomSid
        && req.body.PercentageDone
        && req.body.SecondsRemaining
        && req.body.StatusCallbackEvent
        && req.body.StatusCallbackEvent === 'composition-progress') {
            let compositionProgress = []
            compositionProgress.push(`Creating composition: ${req.body.PercentageDone}% (${req.body.SecondsRemaining} secs remaining...)`)
            db.collection('room').doc(req.body.RoomSid).update({compositionProgress: compositionProgress})
            return res.status(200).send(JSON.stringify({PercentageDone: req.body.PercentageDone, SecondsRemaining: req.body.SecondsRemaining}));
    }
    else if(req.body.RoomSid && req.body.StatusCallbackEvent && req.body.StatusCallbackEvent === 'composition-available') {
        // the composition is ready!
        // THIS IS WHERE WE CALL THE VM TO HAVE IT DOWNLOAD THE VIDEO AND THEN DO THE FFMPEG SLICE/CONCATENATE
        // "cloud_host" is part of statusCallback in exports.compose just above this function
        // and "cloud_host" is passed to exports.compose from video-call.component.ts:compose()
        // "cloud_host" is in the 'config' > 'settings'
        let compositionProgress = ['Creating composition: complete']
        db.collection('room').doc(req.body.RoomSid).update({compositionProgress: compositionProgress})


        let cloudUrl = `http://${req.query.cloud_host}/downloadComposition`
        
        var keys = await db.collection('config').doc('keys').get()
        const twilioAccountSid = keys.data().twilio_account_sid;   
        const twilioAuthToken = createToken() 

        var formData = {
            RoomSid: req.body.RoomSid,
            twilio_account_sid: twilioAccountSid,
            twilio_auth_token: twilioAuthToken,
            domain: 'video.twilio.com',
            MediaUri: "",
            CompositionSid: req.body.CompositionSid,
            Ttl: 3600,
            firebase_functions_host: req.query.firebase_functions_host,
            firebase_function: '/downloadComplete'
         };


         request.post(
            {
                url: cloudUrl,
                form: formData
            },
            function (err, httpResponse, body) {
                console.log(cloudUrl+":  ", err, body);
                if(err) {
                    return res.status(500).send({error: err});
                }
                else return res.status(200).send('ok');
            }
        );

    }
    
    //return res.status(200).send('ok');
    
})



/**
 * Called from the cloud vm: nodejs/index.js:downloadComposition()
 * This url /downloadComplete is passed to the cloud vm below in /twilioCallback
 * 
 * Now starts the back and forth.  The cloud vm has called this function.  And this function will
 * make a call to the cloud vm:  /cutVideo
 */
exports.downloadComplete = functions.https.onRequest((req, res) => {
    /**
     * POST data passed in from 
     * vm: index.js: /downloadComposition
     * 
     {compositionFile: compositionFile,
      CompositionSid:  CompositionSid,
      RoomSid: req.body.RoomSid,
	  tempEditFolder:  `/home/bdunklau/videos/${req.body.CompositionSid}`,
      downloadComplete: true,}
     */


    cors(req, res, async () => {
        var db = admin.firestore();
        let roomDoc = await db.collection('room').doc(req.body.RoomSid).get()   
        roomDoc.data()['compositionProgress'].push("Download complete")
        db.collection('room').doc(req.body.RoomSid).update({compositionProgress: roomDoc.data()['compositionProgress']})

        let settingsObj = await db.collection('config').doc('settings').get()
        
        let formData = {
            compositionFile: req.body.compositionFile,
            tempEditFolder: req.body.tempEditFolder,
            CompositionSid:  req.body.CompositionSid,
            roomObj: roomDoc.data(),
            firebase_functions_host: settingsObj.data().firebase_functions_host,
            cloud_host: settingsObj.data().cloud_host,
            callbackUrl: `https://${settingsObj.data().firebase_functions_host}/cutVideoComplete`, // just below this function
            compositionProgress: roomDoc.data()['compositionProgress']
        }
        let vmUrl = `http://${settingsObj.data().cloud_host}/cutVideo`
        request.post(
            {
                url: vmUrl,  // cut the video into pieces
                json: formData // 'json' attr name is KEY HERE, don't use 'form'
            },
            function (err, httpResponse, body) {
                if(err) {
                    return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
                }
                //console.log(err, body);
                else return res.status(200).send(JSON.stringify({"result": "ok"}));
            }
        );
    })

})


/**
 * Called by the vm index.js /cutVideo when ffmpeg is done cutting up the video
 */
exports.cutVideoComplete = functions.https.onRequest((req, res) => {
    
    /**
     * /cutVideo passes in this:
     * 
     
        let formData = {
            compositionFile: compositionFile,
            CompositionSid:  req.body.CompositionSid,
            RoomSid: req.body.roomObj['RoomSid'],
            firebase_functions_host: req.body.firebase_functions_host,
            cloud_host: req.body.cloud_host,  // this host, so we don't have to keep querying config/settings doc
            compositionProgress: compositionProgress
        }
     */
    var db = admin.firestore()
    var compositionProgress = req.body.compositionProgress
    compositionProgress.push('Slicing and dicing done')
    db.collection('room').doc(req.body.RoomSid).update({compositionProgress: compositionProgress})

    let formData = {
        compositionFile: req.body.compositionFile,
        CompositionSid:  req.body.CompositionSid,
        RoomSid: req.body.RoomSid,
        cloud_host: req.body.cloud_host,
        callbackUrl: `https://${req.body.firebase_functions_host}/uploadToFirebaseStorageComplete`, // just below this function
        compositionProgress: compositionProgress
    }

	request.post(
		{
			url: `http://${req.body.cloud_host}/uploadToFirebaseStorage`, 
			json: formData // 'json' attr name is KEY HERE, don't use 'form'
		},
		function (err, httpResponse, body) {
			if(err) {
				return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
			}
			//console.log(err, body);
			else return res.status(200).send(JSON.stringify({"result": "ok"}));
		}
	);

})


/**
 * The composition file has now been uploaded to firebase storage
 * So WRITE the CompositionSid to the 'room' doc (keyed by RoomSid)
 * The 'room' doc contains 'invitationId' and now a CompositionSid value
 * 
 * video-call.component.ts: monitorRoom() and VideoCallCompleteGuard both watch for
 * the CompositionSid to be written to the room doc.  Once the CompositionSid value
 * is written, the /video-call screen redirects the user to the /view-video screen
 * 
 * The VideoCallCompleteGuard similarly sends the user to the /view-video screen in cases
 * where the user revisits an old /video-call screen.
 */
exports.uploadToFirebaseStorageComplete = functions.https.onRequest(async (req, res) => {

    /**
     *  passed in from index.js: /uploadToFirebaseStorage
      
      
        let formData = {
            compositionFile: req.body.compositionFile,
            CompositionSid:  req.body.CompositionSid,
            RoomSid: req.body.RoomSid,
            firebase_functions_host: req.body.firebase_functions_host,
            cloud_host: req.body.cloud_host,  // this host, so we don't have to keep querying config/settings doc
		    compositionProgress: req.body.compositionProgress
        }

     */

    
    var db = admin.firestore();
    // video-call.component.ts: monitorRoom() and VideoCallCompleteGuard both pick up on this
    var compositionProgress = req.body.compositionProgress
    compositionProgress.push('Uploading to storage complete')
    await db.collection('room').doc(req.body.RoomSid).update({CompositionSid: req.body.CompositionSid, compositionProgress: compositionProgress})

    
    let formData = {
		RoomSid: req.body.RoomSid,
        compositionFile: req.body.compositionFile,
        cloud_host: req.body.cloud_host,
        callbackUrl: `https://${req.body.firebase_functions_host}/deleteVideoComplete`, // just below this function
        compositionProgress: compositionProgress
    }

	request.post(
		{
			url: `http://${req.body.cloud_host}/deleteVideo`, 
			json: formData // 'json' attr name is KEY HERE, don't use 'form'
		},
		function (err, httpResponse, body) {
			if(err) {
				return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
			}
			//console.log(err, body);
			else return res.status(200).send(JSON.stringify({"result": "ok"}));
		}
	);

})


exports.deleteVideoComplete = functions.https.onRequest((req, res) => {
    /**
     * passed in from /deleteVideo
     * 
     
	let formData = {
		RoomSid: req.body.RoomSid,
		filesDeleted: [req.body.compositionFile, origFile],
		firebase_functions_host: req.body.firebase_functions_host,
		cloud_host: req.body.cloud_host,  // this host, so we don't have to keep querying config/settings doc
        compositionProgress: compositionProgress
	}
     */
    
    var db = admin.firestore();
    var compositionProgress = req.body.compositionProgress
    compositionProgress.push('Video is ready!')
    await db.collection('room').doc(req.body.RoomSid).update({compositionProgress: compositionProgress})


    let filesDeleted = _.join(req.body.filesDeleted, ',')
    let message = `Deleted these video files: ${filesDeleted}`
    return res.status(200).send(JSON.stringify({"result": message}));
})


