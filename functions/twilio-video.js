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


// firebase deploy --only functions:downloadComplete,functions:generateTwilioToken,functions:compose,functions:twilioCallback,functions:cutVideoComplete,functions:uploadToFirebaseStorageComplete,functions:deleteVideoComplete,functions:createHlsComplete,functions:uploadToFirebaseStorageComplete,functions:deleteVideoComplete,functions:uploadScreenshotToStorageComplete



exports.generateTwilioToken = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        let token = await createToken(req)
        return res.status(200).send({token: token})

    })


})


var createToken = async function(req) {
    var db = admin.firestore();
    var keys = await db.collection('config').doc('twilio').get()
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
        var keys = await db.collection('config').doc('twilio').get()
        const twilioAccountSid = keys.data().twilio_account_sid;    
        // create API key:  https://www.twilio.com/console/project/api-keys
        const twilioApiKey = keys.data().twilio_api_key
        const twilioApiSecret = keys.data().twilio_secret
        const client = twilio(twilioApiKey, twilioApiSecret, {accountSid: twilioAccountSid})
        return client.video.compositions.create({
            roomSid: req.query.RoomSid,
            audioSources: '*',
            // videoLayout:  see  https://www.twilio.com/docs/video/api/compositions-resource#specifying-video-layouts
            videoLayout: {
              grid : {
                max_rows: 1,
                video_sources: ['*']
              }
            },
            statusCallback: `https://${req.query.firebase_functions_host}/twilioCallback?room_name=${req.query.room_name}&firebase_functions_host=${req.query.firebase_functions_host}&website_domain_name=${req.query.website_domain_name}&cloud_host=${req.query.cloud_host}`,
            resolution: '1280x550', // 21:9 also 32:9  1280 is max width
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
            let compositionProgress = []
            compositionProgress.push(`Creating composition: ${req.body.PercentageDone}% (${req.body.SecondsRemaining} secs remaining...)`)
            await admin.firestore().collection('room').doc(req.body.RoomSid).update({compositionProgress: compositionProgress})
            return res.status(200).send(JSON.stringify({PercentageDone: req.body.PercentageDone, SecondsRemaining: req.body.SecondsRemaining}));
    }
    else if(req.body.RoomSid && req.body.StatusCallbackEvent && req.body.StatusCallbackEvent === 'composition-available') {
        // the composition is ready!
        // THIS IS WHERE WE CALL THE VM TO HAVE IT DOWNLOAD THE VIDEO AND THEN DO THE FFMPEG SLICE/CONCATENATE
        // "cloud_host" is part of statusCallback in exports.compose just above this function
        // and "cloud_host" is passed to exports.compose from video-call.component.ts:compose()
        // "cloud_host" is in the 'config' > 'settings'
        let compositionProgress = ['Creating composition: complete']
        await admin.firestore().collection('room').doc(req.body.RoomSid).update({compositionProgress: compositionProgress})


        let cloudUrl = `http://${req.query.cloud_host}/downloadComposition`
        
        var keys = await admin.firestore().collection('config').doc('twilio').get()
        const twilioAccountSid = keys.data().twilio_account_sid;   
        const twilioAuthToken = keys.data().twilio_auth_key;   

        var formData = {
            RoomSid: req.body.RoomSid,
            twilio_account_sid: twilioAccountSid,
            twilio_auth_token: twilioAuthToken,
            domain: 'video.twilio.com',
            MediaUri: req.body.MediaUri,
            CompositionSid: req.body.CompositionSid,
            Ttl: 3600,
            firebase_functions_host: req.query.firebase_functions_host,
            firebase_function: '/downloadComplete',
            website_domain_name: req.query.website_domain_name
        };


        request.post(
            {
                url: cloudUrl,
                json: formData
            },
            function (err, httpResponse, body) {
                console.log(cloudUrl+":  ", err, body);
                /**** TODO FIXME can't send 500's back to twilio - only 200's
                 * Figure something else out
                 * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
                if(err) {
                    return res.status(500).send({error: err});
                }
                *****/
                return res.status(200).send('ok');
            }
        );

    }
    else {
        console.log("got the else condition:  req.body = ", req.body)
        console.log("got the else condition:  req.query = ", req.query)

        // I forget...  Does twilio need a simple 'ok' back, and anything else isn't properly handled?
        return res.status(200).send('ok');

        /********************************
         FYI - here is a post that got captured by this else block

         req.body =  { RoomSid: 'RMd492394235f4202b5de5f89c3f02df76',
  CompositionSid: 'CJ67fdd76b78de2a9ec31700019014f5e8',
  StatusCallbackEvent: 'composition-started',
  Timestamp: '2020-09-02T15:29:19.010Z',
  AccountSid: 'ACce7e5e5cbf309ac4eb81b6579793a1b1',
  CompositionUri: '/v1/Compositions/CJ67fdd76b78de2a9ec31700019014f5e8' } 

        req.query =  { room_name: 'qabiBC09OSbFiT6VWiqT',
  firebase_functions_host: 'us-central1-yourvotecounts-bd737.cloudfunctions.net',
  website_domain_name: 'headsup.video',
  cloud_host: '34.68.114.174:7000' }
  

         ********************************/



    } // end the final else condition
    
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
     {  compositionFile: compositionFile,
        CompositionSid:  CompositionSid,
        RoomSid: req.body.RoomSid,
        tempEditFolder:  `/home/bdunklau/videos/${req.body.CompositionSid}`,
        downloadComplete: true,
        website_domain_name: req.body.website_domain_name
    }
     */


    cors(req, res, async () => {
        var db = admin.firestore();
        let roomDoc = await db.collection('room').doc(req.body.RoomSid).get()   
        roomDoc.data()['compositionProgress'].push("Download complete")
        db.collection('room').doc(req.body.RoomSid).update({compositionProgress: roomDoc.data()['compositionProgress']})
        

        if(req.body.stop) {
            // let's us stop early when testing
            return res.status(200).send(JSON.stringify({"result": "ok", "stopped early": "true"}));
        }

        // capture phone numbers in a list for the very end when we sms everyone in /deleteVideoComplete below
        let phones = _.map(roomDoc.data().guests, guest => {
            return guest['guestPhone']
        })
        phones.push(roomDoc.data()['hostPhone'])

        let settingsObj = await db.collection('config').doc('settings').get()
        
        let formData = {
            compositionFile: req.body.compositionFile,
            tempEditFolder: req.body.tempEditFolder,
            CompositionSid:  req.body.CompositionSid,
            roomObj: roomDoc.data(),
            phones: phones,
            firebase_functions_host: settingsObj.data().firebase_functions_host,
            cloud_host: settingsObj.data().cloud_host,
            callbackUrl: `https://${settingsObj.data().firebase_functions_host}/cutVideoComplete`, // just below this function
            compositionProgress: roomDoc.data()['compositionProgress'],
            website_domain_name: req.body.website_domain_name,
            projectId: settingsObj.data().projectId,
            storage_keyfile: settingsObj.data().storage_keyfile
        }
        let vmUrl = `http://${settingsObj.data().cloud_host}/cutVideo`
        request.post(
            {
                url: vmUrl,  // cut the video into pieces
                json: formData // 'json' attr name is KEY HERE, don't use 'form'
            },
            function (err, httpResponse, body) {
                /**** TODO FIXME can't send 500's back to twilio - only 200's
                 * Figure something else out
                 * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
                if(err) {
                    return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
                }
                **********/
                console.log(err, body);
                return res.status(200).send(JSON.stringify({"result": "ok"}));
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
		    outputFile: outputFile,
            compositionFile: compositionFile,
            CompositionSid:  req.body.CompositionSid,
            RoomSid: req.body.roomObj['RoomSid'],
	     	phones: req.body.phones,
            firebase_functions_host: req.body.firebase_functions_host,
            cloud_host: req.body.cloud_host,  // this host, so we don't have to keep querying config/settings doc
            compositionProgress: compositionProgress,
		    website_domain_name: req.body.website_domain_name,
            projectId: req.body.projectId,
            storage_keyfile: req.body.storage_keyfile
        }
     */
    var db = admin.firestore()
    var compositionProgress = req.body.compositionProgress
    compositionProgress.push('slicing and dicing...')
    db.collection('room').doc(req.body.RoomSid)
        .update({
            compositionProgress: compositionProgress
        })


    if(req.body.stop) {
        // let's us stop early when testing
        return res.status(200).send(JSON.stringify({"result": "ok", "stopped early": "true"}));
    }

    let formData = {
		outputFile: req.body.outputFile,
        compositionFile: req.body.compositionFile,
        CompositionSid:  req.body.CompositionSid,
        RoomSid: req.body.RoomSid,
		tempEditFolder: req.body.tempEditFolder,
		phones: req.body.phones,
        cloud_host: req.body.cloud_host,
        firebase_functions_host: req.body.firebase_functions_host,
        //callbackUrl: `https://${req.body.firebase_functions_host}/uploadToFirebaseStorageComplete`, // just below this function
        callbackUrl: `https://${req.body.firebase_functions_host}/createHlsComplete`, // just below this function
        compositionProgress: compositionProgress,
        website_domain_name: req.body.website_domain_name,
        projectId: req.body.projectId,
        storage_keyfile: req.body.storage_keyfile
    }

	request.post(
		{
			url: `http://${req.body.cloud_host}/createHls`, // `http://${req.body.cloud_host}/uploadToFirebaseStorage`, 
			json: formData // 'json' attr name is KEY HERE, don't use 'form'
		},
		function (err, httpResponse, body) {
            /**** TODO FIXME can't send 500's back to twilio - only 200's
             * Figure something else out
             * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
			if(err) {
				return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
            }
            *****/
			console.log(err, body);
			return res.status(200).send(JSON.stringify({"result": "ok"}));
		}
	);

})


exports.createHlsComplete = functions.https.onRequest(async (req, res) => { 

    /**
        called from /createHls
        
        let formData = {
		    outputFile: req.body.outputFile,
			compositionFile: req.body.compositionFile,
			uploadFiles: uploadFiles,
			CompositionSid:  req.body.CompositionSid,
			RoomSid: req.body.RoomSid,
			tempEditFolder: req.body.tempEditFolder,
			phones: req.body.phones,
			firebase_functions_host: req.body.firebase_functions_host,
			cloud_host: req.body.cloud_host,  // this host, so we don't have to keep querying config/settings doc
			compositionProgress: req.body.compositionProgress,
			website_domain_name: req.body.website_domain_name,
            projectId: req.body.projectId,
            storage_keyfile: req.body.storage_keyfile
		}
		if(req.body.stop) formData['stop'] = true

     */
    

    if(req.body.stop) {
        // let's us stop early when testing
        return res.status(200).send(JSON.stringify({"result": "ok", "stopped early": "true", "video files": req.body.uploadedFiles}));
    }


    let formData = {
        outputFile: req.body.outputFile,
        compositionFile: req.body.compositionFile,
        uploadFiles: req.body.uploadFiles,
        CompositionSid:  req.body.CompositionSid,
        RoomSid: req.body.RoomSid,
        tempEditFolder: req.body.tempEditFolder,
        phones: req.body.phones,
        firebase_functions_host: req.body.firebase_functions_host,
        cloud_host: req.body.cloud_host,  // this host, so we don't have to keep querying config/settings doc
        callbackUrl: `https://${req.body.firebase_functions_host}/uploadToFirebaseStorageComplete`, // just below this function
        compositionProgress: req.body.compositionProgress,
        website_domain_name: req.body.website_domain_name,
        projectId: req.body.projectId,        
        storage_keyfile: req.body.storage_keyfile
    }
    
    
	request.post(
		{
			url: `http://${req.body.cloud_host}/uploadToFirebaseStorage`, 
			json: formData // 'json' attr name is KEY HERE, don't use 'form'
		},
		function (err, httpResponse, body) {
            /**** TODO FIXME can't send 500's back to twilio - only 200's
             * Figure something else out
             * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
			if(err) {
				return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
            }
            *****/
			console.log(err, body);
			return res.status(200).send(JSON.stringify({"result": "ok"}));
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
    //var shortcircuit = true
	//if(shortcircuit) return res.status(200).send(JSON.stringify({"result": "ok"})); // short-circuit this whole function

    /**
     *  passed in from index.js: /uploadToFirebaseStorage
      
      
        let formData = {
            outputFile: req.body.outputFile, 
            uploadFiles: req.body.uploadFiles,
            compositionFile: req.body.compositionFile, 
            CompositionSid:  req.body.CompositionSid,
            RoomSid: req.body.RoomSid,
            phones: req.body.phones,
            //videoUrl: signedUrl,
            firebase_functions_host: req.body.firebase_functions_host,
            cloud_host: req.body.cloud_host,  // this host, so we don't have to keep querying config/settings doc
            compositionProgress: req.body.compositionProgress,
            website_domain_name: req.body.website_domain_name,
            projectId: req.body.projectId,
            storage_keyfile: req.body.storage_keyfile
        }
        if(req.body.stop) formData['stop'] = true


     */

    
    var db = admin.firestore();
    // video-call.component.ts: monitorRoom() and VideoCallCompleteGuard both pick up on this
    var compositionProgress = req.body.compositionProgress
    compositionProgress.push('Uploading to the cloud :)')
    let videoUrl = `https://storage.googleapis.com/${req.body.projectId}.appspot.com/${req.body.CompositionSid}/${req.body.CompositionSid}.m3u8`
    let videoUrlAlt = `https://storage.googleapis.com/${req.body.projectId}.appspot.com/${req.body.CompositionSid}/${req.body.CompositionSid}-output.mp4`
    //let videoUrl = req.body.videoUrl // if it was a signed url
    await db.collection('room').doc(req.body.RoomSid)
            .update({
                compositionProgress: compositionProgress,
                CompositionSid: req.body.CompositionSid, // <- video-call-component.ts redirects the user to /view-video when this is set
                videoUrl: videoUrl,
                videoUrlAlt: videoUrlAlt
            })

    if(req.body.stop) {
        // let's us stop early when testing
        return res.status(200).send(JSON.stringify({"result": "ok", "stopped early": "true", "uploaded files": req.body.uploadFiles}));
    }
    
    let formData = {
        outputFile: req.body.outputFile,
        uploadFiles: req.body.uploadFiles,
		RoomSid: req.body.RoomSid,
        CompositionSid:  req.body.CompositionSid,
        compositionFile: req.body.compositionFile,
        videoUrl: videoUrl,
        videoUrlAlt: videoUrlAlt,
        phones: req.body.phones,
        cloud_host: req.body.cloud_host,
        firebase_functions_host: req.body.firebase_functions_host,
        //callbackUrl: `https://${req.body.firebase_functions_host}/deleteVideoComplete`, // just below this function
        callbackUrl: `https://${req.body.firebase_functions_host}/uploadScreenshotToStorageComplete`, // just below this function
        compositionProgress: compositionProgress,
        website_domain_name: req.body.website_domain_name,
        projectId: req.body.projectId,
        storage_keyfile: req.body.storage_keyfile
    }

	request.post(
		{
			//url: `http://${req.body.cloud_host}/deleteVideo`, 
			url: `http://${req.body.cloud_host}/uploadScreenshotToStorage`, 
			json: formData // 'json' attr name is KEY HERE, don't use 'form'
		},
		function (err, httpResponse, body) {
            /**** TODO FIXME can't send 500's back to twilio - only 200's
             * Figure something else out
             * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
			if(err) {
				return res.status(500).send(JSON.stringify({"error": err, "vm url": `http://${req.body.cloud_host}/deleteVideo`}));
            }
            *********/
			console.log(err, body);
			return res.status(200).send(JSON.stringify({"result": "ok"}));
		}
	);

})



exports.uploadScreenshotToStorageComplete = functions.https.onRequest(async (req, res) => {
    /**
     * passed in from vm /uploadScreenshotToStorage:     
        
        let formData = {
            outputFile: req.body.outputFile,
            uploadFiles: req.body.uploadFiles,
            RoomSid: req.body.RoomSid,
            CompositionSid:  req.body.CompositionSid,
            compositionFile: req.body.compositionFile, 
            screenshot: filename,         <------- THIS IS THE NEW THING
            phones: req.body.phones,
            //videoUrl: signedUrl,
            firebase_functions_host: req.body.firebase_functions_host,
            cloud_host: req.body.cloud_host,  // this host, so we don't have to keep querying config/settings doc
            compositionProgress: req.body.compositionProgress,
            website_domain_name: req.body.website_domain_name,
            projectId: req.body.projectId,
            storage_keyfile: req.body.storage_keyfile
        }
        if(req.body.stop) formData['stop'] = true
     */

     // WRITE SCREENSHOT URL TO THE ROOMSID DOC SO WE CAN DISPLAY THIS VIA SSR AND THE og:image TAG
    var db = admin.firestore();
    let screenshotUrl = `https://storage.googleapis.com/${req.body.projectId}.appspot.com/${req.body.CompositionSid}/${req.body.screenshot}`
    await db.collection('room').doc(req.body.RoomSid)
            .update({ screenshotUrl: screenshotUrl })
     
    if(req.body.stop) {
        // let's us stop early when testing
        return res.status(200).send(JSON.stringify({"result": "ok", "stopped early": "true", "screenshot file": req.body.screenshot}));
    }
    
    let formData = {
        outputFile: req.body.outputFile,
        uploadFiles: req.body.uploadFiles,
		RoomSid: req.body.RoomSid,
        CompositionSid:  req.body.CompositionSid,
        compositionFile: req.body.compositionFile,
        //videoUrl: videoUrl,
        //videoUrlAlt: videoUrlAlt,
        phones: req.body.phones,
        cloud_host: req.body.cloud_host,
        firebase_functions_host: req.body.firebase_functions_host,
        callbackUrl: `https://${req.body.firebase_functions_host}/deleteVideoComplete`, // just below this function
        compositionProgress: compositionProgress,
        website_domain_name: req.body.website_domain_name,
        projectId: req.body.projectId,
        storage_keyfile: req.body.storage_keyfile
    }

	request.post(
		{
			url: `http://${req.body.cloud_host}/deleteVideo`, 
			json: formData // 'json' attr name is KEY HERE, don't use 'form'
		},
		function (err, httpResponse, body) {
            /**** TODO FIXME can't send 500's back to twilio - only 200's
             * Figure something else out
             * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
			if(err) {
				return res.status(500).send(JSON.stringify({"error": err, "vm url": `http://${req.body.cloud_host}/deleteVideo`}));
            }
            *********/
			console.log(err, body);
			return res.status(200).send(JSON.stringify({"result": "ok"}));
		}
	);
})



/**
 * What about deleting the video stored on twilio - we aren't doing that yet
 * ...and delete the individual audiot and video recordings on twilio also
 */
exports.deleteVideoComplete = functions.https.onRequest(async (req, res) => {
    //var shortcircuit = true
	//if(shortcircuit) return res.status(200).send(JSON.stringify({"result": "ok"})); // short-circuit this whole function
    
    /**
     * passed in from /deleteVideo
     * 
     
	let formData = {
		RoomSid: req.body.RoomSid,
		CompositionSid:  req.body.CompositionSid,
		phones: req.body.phones,
		filesDeleted: deleteThese,
		firebase_functions_host: req.body.firebase_functions_host,
		cloud_host: req.body.cloud_host,  // this host, so we don't have to keep querying config/settings doc
		compositionProgress: req.body.compositionProgress,
        website_domain_name: req.body.website_domain_name,
        projectId: req.body.projectId,
        storage_keyfile: req.body.storage_keyfile
	}
     */
    
    var db = admin.firestore();
    var compositionProgress = req.body.compositionProgress
    compositionProgress.push('Video is ready!')
    await db.collection('room').doc(req.body.RoomSid).update({compositionProgress: compositionProgress})

    
    /**
     * Send SMS message to all participants - provide link to /view-video page
     * 
     * write to /sms/{id} - that will trigger twilio-sms.js:sendSms()
     */
    let videoUrl = `https://${req.body.website_domain_name}/view-video/${req.body.CompositionSid}`
    _.each(req.body.phones, phone => {
        // don't need to await, right?
        db.collection('sms').add({
            from: '+12673314843', 
            to: phone, 
            //mediaUrl: string, // do we need this? 
            message: `YeeHaw!! Your video is ready!  Check it out below\n\nPlease don't thank us by replying to this text.  This number is not being monitored.\n\n${videoUrl}`,
            date: new Date(),
            date_ms: new Date().getTime(),
            RoomSid: req.body.RoomSid,              // so we can query/delete later on
            CompositionSid: req.body.CompositionSid
        })
    })

    let filesDeleted = _.join(req.body.filesDeleted, ',')
    let message = `Deleted these video files: ${filesDeleted}`
    return res.status(200).send(JSON.stringify({"result": message}));
})


