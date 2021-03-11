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


// firebase deploy --only functions:downloadComplete,functions:generateTwilioToken,functions:compose,functions:getCompositionSid,functions:downloadComposition,functions:cutVideo,functions:twilioCallback,functions:cutVideoComplete,functions:uploadToFirebaseStorageComplete,functions:deleteVideoComplete,functions:createHls,functions:createHlsComplete,functions:uploadToFirebaseStorage,functions:uploadToFirebaseStorageComplete,functions:uploadScreenshotToStorage,functions:uploadScreenshotToStorageComplete,functions:deleteVideo,functions:deleteVideoComplete,functions:triggerRecreateVideo



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


// called from video-call-complete.component.ts: compose()
exports.compose = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        var db = admin.firestore();
        var keys = await db.collection('config').doc('twilio').get()
        const twilioAccountSid = keys.data().twilio_account_sid;    
        // create API key:  https://www.twilio.com/console/project/api-keys
        const twilioApiKey = keys.data().twilio_api_key
        const twilioApiSecret = keys.data().twilio_secret
        const client = twilio(twilioApiKey, twilioApiSecret, {accountSid: twilioAccountSid})
        const participantCount = parseInt(req.query.participantCount)

        // layout: if 4 people or less, they all go on one row
        //   If more than 4, then we add a row, allowing for up to 4 people to be on each row
        const maxOn1Row = 4
        const max_rows = participantCount < (maxOn1Row+1) ? 1 : parseInt(participantCount / maxOn1Row) + 1

        /**
         * NOTE: 921,600 is the max number of pixels - you'll get an error if you try to go over
         * 921,600 = 1280x720
         * So you can't do 1:1 aspect ratio and have width = 1280.  That will give you a height of 1280 also
         * which will produce more than 921,600 pixels.
         * So if the aspect ratio is going to be 1:1, then the dims have to be 960x960
         */
        let aspectRatio = 9/16
        let width = 1280
        if(participantCount === 2) {
            aspectRatio = 1
            width = 960
        }
        if(participantCount === 3) aspectRatio = 9/21
        let height = parseInt(width * aspectRatio)
        let resolution = `${width}x${height}`  // 21:9 also 32:9  1280 is max width

        return client.video.compositions.create({
            roomSid: req.query.RoomSid,
            audioSources: '*',
            // videoLayout:  see  https://www.twilio.com/docs/video/api/compositions-resource#specifying-video-layouts
            videoLayout: {
              grid : {
                max_rows: max_rows,
                video_sources: ['*']
              }
            },
            statusCallback: `https://${req.query.firebase_functions_host}/twilioCallback?room_name=${req.query.room_name}&firebase_functions_host=${req.query.firebase_functions_host}&website_domain_name=${req.query.website_domain_name}&cloud_host=${req.query.cloud_host}`,
            resolution: resolution, 
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


/**
 * Created for VideoListComponent (manual intervention for admin)
 * So that we can look up the CompositionSid using the RoomSid
 * https://www.twilio.com/docs/video/api/compositions-resource?code-sample=code-list-all-compositions-for-a-room-sid-16&code-language=PHP&code-sdk-version=5.x
 */
exports.getCompositionSid = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        var keys = await admin.firestore().collection('config').doc('twilio').get()
        const twilioAccountSid = keys.data().twilio_account_sid;   
        const twilio_api_key = keys.data().twilio_api_key;   
        const twilio_secret = keys.data().twilio_secret;   
        const client = twilio(twilio_api_key, twilio_secret, {accountSid: twilioAccountSid});

        return client.video.compositions.list({
            roomSid: req.query.RoomSid
        })
        .then(async compositions => {
            console.log("Found " + compositions.length + " compositions");
            let comps = []
            compositions.forEach(function(composition) {
                console.log('Read composition =' + composition);
                console.log('Read compositionSid=' + composition.sid);
                comps.push(composition)
            });
            let compositionProgress = ['Creating composition: complete']
            // have to await or else this call below will be killed by the return next
            await admin.firestore().collection('room').doc(req.query.RoomSid).update({CompositionSid: comps[0].sid, compositionProgress: compositionProgress})
            return res.status(200).send({"finished": "getCompositionSid", compositions: comps, CompositionSid: comps[0].sid})
        });
    })
})


// var downComposition = async function(args, res) {
//     cors(req, res, async () => {

//             let cloudUrl = `http://${args.cloud_host}/downloadComposition`
                
//             var keys = await admin.firestore().collection('config').doc('twilio').get()
//             const twilioAccountSid = keys.data().twilio_account_sid;   
//             const twilioAuthToken = keys.data().twilio_auth_key;   

//             var formData = {
//                 stop: args.stop,
//                 RoomSid: args.RoomSid,
//                 twilio_account_sid: twilioAccountSid,
//                 twilio_auth_token: twilioAuthToken,
//                 domain: 'video.twilio.com',
//                 MediaUri: args.MediaUri,  // ex:  /v1/Compositions/CJ9d5565de29fe95105e993e32ce67b05c/Media
//                 CompositionSid: args.CompositionSid,
//                 Ttl: 3600,
//                 firebase_functions_host: args.firebase_functions_host,
//                 firebase_function: '/downloadComplete',
//                 website_domain_name: args.website_domain_name
//             };


//             request.post(
//                 {
//                     url: cloudUrl,
//                     json: formData
//                 },
//                 function (err, httpResponse, body) {
//                     console.log(cloudUrl+":  ", err, body);
//                     /**** TODO FIXME can't send 500's back to twilio - only 200's
//                      * Figure something else out
//                      * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
//                     if(err) {
//                         return res.status(500).send({error: err});
//                     }
//                     *****/
//                     return res.status(200).send(JSON.stringify({body: body}));
//                 }
//             );
//     })
// }




/**
 * Called from VideoListComponent (manual intervention for admin)
 */
exports.downloadComposition = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {

        let args = {cloud_host: req.query.cloud_host,
            stop: req.query.stop,
            RoomSid: req.query.RoomSid,
            MediaUri: req.query.MediaUri,
            CompositionSid: req.query.CompositionSid,
            firebase_functions_host: req.query.firebase_functions_host,
            website_domain_name: req.query.website_domain_name
        }

        // return await downComposition(args, res)  // this is what we'd LIKE to do


        /**
         * DUPLICATED CODE - downComposition() WAS THROWING A CORS EXCEPTION
         */
        let cloudUrl = `http://${args.cloud_host}/downloadComposition` // yourvotecounts-vm: nodejs/index.js: downloadComposition()
                
        var keys = await admin.firestore().collection('config').doc('twilio').get()
        const twilioAccountSid = keys.data().twilio_account_sid;   
        const twilioAuthToken = keys.data().twilio_auth_key;   

        var formData = {
            RoomSid: args.RoomSid,
            twilio_account_sid: twilioAccountSid,
            twilio_auth_token: twilioAuthToken,
            domain: 'video.twilio.com',
            MediaUri: args.MediaUri,  // ex:  /v1/Compositions/CJ9d5565de29fe95105e993e32ce67b05c/Media
            CompositionSid: args.CompositionSid,
            Ttl: 3600,
            firebase_functions_host: args.firebase_functions_host,
            firebase_function: '/downloadComplete',
            website_domain_name: args.website_domain_name
        };
        if(req.query.stop === 'true') {
            formData['stop'] = true
        }


        request.post(
            {
                url: cloudUrl,
                json: formData
            },
            async function (err, httpResponse, body) {
                console.log(cloudUrl+":  ", err, body);
                /**** TODO FIXME can't send 500's back to twilio - only 200's
                 * Figure something else out
                 * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
                if(err) {
                    return res.status(500).send({error: err});
                }
                *****/
                // yourvotecounts-vm:index.js:/downloadComposition
                await admin.firestore().collection('room').doc(req.query.RoomSid).update({compositionFile: body.compositionFile, tempEditFolder: body.tempEditFolder})
                return res.status(200).send(JSON.stringify({"finished": "downloadComposition", "body": body}));
            }
        );



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

        // return downComposition({cloud_host: req.query.cloud_host,
        //     stop: false, // do the whole workflow
        //     RoomSid: req.body.RoomSid,
        //     MediaUri: req.body.MediaUri,
        //     CompositionSid: req.body.CompositionSid,
        //     firebase_functions_host: req.query.firebase_functions_host,
        //     website_domain_name: req.query.website_domain_name
        // },
        // res)


        /**
         * DUPLICATED CODE - downComposition() WAS THROWING A CORS EXCEPTION
         */
        let cloudUrl = `http://${req.query.cloud_host}/downloadComposition`
        
        var keys = await admin.firestore().collection('config').doc('twilio').get()
        const twilioAccountSid = keys.data().twilio_account_sid;   
        const twilioAuthToken = keys.data().twilio_auth_key;   

        var formData = {
            RoomSid: req.body.RoomSid,
            twilio_account_sid: twilioAccountSid,
            twilio_auth_token: twilioAuthToken,
            domain: 'video.twilio.com',
            MediaUri: req.body.MediaUri,  // ex:  /v1/Compositions/CJ9d5565de29fe95105e993e32ce67b05c/Media
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
            async function (err, httpResponse, body) {
                console.log(cloudUrl+":  ", err, body);
                /**** TODO FIXME can't send 500's back to twilio - only 200's
                 * Figure something else out
                 * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
                if(err) {
                    return res.status(500).send({error: err});
                }
                *****/
                await admin.firestore().collection('room').doc(req.query.RoomSid).update({compositionFile: body.compositionFile, tempEditFolder: body.tempEditFolder})
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
        console.log('downloadComplete: req.body.RoomSid = ', req.body.RoomSid)
        let roomDoc = await db.collection('room').doc(req.body.RoomSid).get()  
        let compositionProgress = roomDoc.data()['compositionProgress'] ? roomDoc.data()['compositionProgress'] : []
        compositionProgress.push("Download composition: complete")
        await db.collection('room').doc(req.body.RoomSid).update({compositionProgress: compositionProgress})
        

        if(req.body.stop && (req.body.stop === true || req.body.stop === 'true')) {
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
 * Called from VideoListComponent (manual intervention for admin)
 * almost identical to downloadComplete() above except everything here is req.query not req.body
 */
exports.cutVideo = functions.https.onRequest((req, res) => {

    /**
     * passed in from video-list.component.ts: cutVideo()
     */
    // formData.append("compositionFile", `/home/bdunklau/videos/${room.CompositionSid}.mp4`);
    // formData.append("CompositionSid", room.CompositionSid);
    // formData.append("RoomSid", room.RoomSid);
    // formData.append("tempEditFolder", `/home/bdunklau/videos/${room.CompositionSid}`);
    // formData.append("downloadComplete", true);
    // formData.append("website_domain_name", this.settingsDoc.website_domain_name);


    cors(req, res, async () => {
        var db = admin.firestore();
        console.log('cutVideo: req.body.RoomSid = ', req.query.RoomSid)
        let roomDoc = await db.collection('room').doc(req.query.RoomSid).get()  
        

        // if(req.query.stop) {
        //     // let's us stop early when testing
        //     return res.status(200).send(JSON.stringify({"result": "ok", "stopped early": "true"}));
        // }


        // capture phone numbers in a list for the very end when we sms everyone in /deleteVideoComplete below
        let phones = _.map(roomDoc.data().guests, guest => {
            return guest['guestPhone']
        })
        phones.push(roomDoc.data()['hostPhone'])

        let settingsObj = await db.collection('config').doc('settings').get()
        
        let formData = {
            stop: true,
            compositionFile: req.query.compositionFile,
            tempEditFolder: req.query.tempEditFolder,
            CompositionSid:  req.query.CompositionSid,
            roomObj: roomDoc.data(),
            phones: phones,
            firebase_functions_host: settingsObj.data().firebase_functions_host,
            cloud_host: settingsObj.data().cloud_host,
            callbackUrl: `https://${settingsObj.data().firebase_functions_host}/cutVideoComplete`, // just below this function
            compositionProgress: roomDoc.data()['compositionProgress'],
            website_domain_name: req.query.website_domain_name,
            projectId: settingsObj.data().projectId,
            storage_keyfile: settingsObj.data().storage_keyfile
        }
        let vmUrl = `http://${settingsObj.data().cloud_host}/cutVideo`
        request.post(
            {
                url: vmUrl,  // cut the video into pieces
                json: formData // 'json' attr name is KEY HERE, don't use 'form'
            },
            async function (err, httpResponse, body) {
                /**** TODO FIXME can't send 500's back to twilio - only 200's
                 * Figure something else out
                 * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
                if(err) {
                    return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
                }
                **********/
                if(err) {
                    console.log(err);
                    return res.status(200).send(JSON.stringify({"finished": "cutVideo", "err": err}));
                } else {
                    await admin.firestore().collection('room').doc(req.query.RoomSid).update({outputFile: body.outputFile})
                    return res.status(200).send(JSON.stringify({"finished": "cutVideo", "body": body}));
                }
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


    if(req.body.stop && (req.body.stop === true || req.body.stop === 'true')) {
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



/**
 * Called from VideoListComponent (manual intervention for admin)
 * almost identical to cutVideoComplete() above except everything here is req.query not req.body
 */
exports.createHls = functions.https.onRequest(async (req, res) => { 
    cors(req, res, async () => {

        /**
         * req.query needed:  cloud_host, CompositionSid, RoomSid, phones, firebase_functions_host, 
         * compositionProgress, website_domain_name, projectId, storage_keyfile
         */
        let roomDoc = await admin.firestore().collection('room').doc(req.query.RoomSid).get()
        let room = roomDoc.data()

        let formData = {
            stop: true, // make every step manual
            outputFile: `/home/bdunklau/videos/${req.query.CompositionSid}-output.mp4`, // we're about to start storing this in the RoomObj
            compositionFile: `/home/bdunklau/videos/${req.query.CompositionSid}.mp4`,
            CompositionSid:  req.query.CompositionSid,
            RoomSid: req.query.RoomSid,
            tempEditFolder: `/home/bdunklau/videos/${req.query.CompositionSid}`,
            phones: req.query.phones,
            cloud_host: req.query.cloud_host,
            firebase_functions_host: req.query.firebase_functions_host,
            callbackUrl: `https://${req.query.firebase_functions_host}/createHlsComplete`, // just below this function
            compositionProgress: room.compositionProgress,
            website_domain_name: req.query.website_domain_name,
            projectId: req.query.projectId,
            storage_keyfile: req.query.storage_keyfile
        }

        request.post(
            {
                url: `http://${req.query.cloud_host}/createHls`, 
                json: formData // 'json' attr name is KEY HERE, don't use 'form'
            },
            async function (err, httpResponse, body) {
                /**** TODO FIXME can't send 500's back to twilio - only 200's
                 * Figure something else out
                 * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
                if(err) {
                    return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
                }
                *****/
                console.log(err, body);
                // body.uploadFiles: {name: string, path: string}[]  from yourvotecounts-vm:index.js:/createHls
                await admin.firestore().collection('room').doc(req.query.RoomSid).update({uploadFiles: body.uploadFiles})
                return res.status(200).send(JSON.stringify({"finished": "createHls", "body": body}));
            }
        );
    
    })
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
    var compositionProgress = req.body.compositionProgress
    if(!compositionProgress) compositionProgress = []
    compositionProgress.push('Creating HLS files: complete')
    admin.firestore().collection('room').doc(req.body.RoomSid)
        .update({
            compositionProgress: compositionProgress
        })
    

    if(req.body.stop && (req.body.stop === true || req.body.stop === 'true')) {
        // let's us stop early when testing
        return res.status(200).send(JSON.stringify({"result": "ok", "stopped early": "true", "video files": req.body.uploadFiles}));
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
			return res.status(200).send(JSON.stringify({"finished": "createHlsComplete"}));
		}
	);
})


/**
 * Called from VideoListComponent (manual intervention for admin)
 * almost identical to createHlsComplete() 
 */
exports.uploadToFirebaseStorage = functions.firestore.document('upload_requests/{RoomSid}').onCreate(async (snap, context) => {

        var db = admin.firestore();

        let room = snap.data()
        let settingsDoc = await db.collection('config').doc('settings').get()
        let settings = settingsDoc.data()

        let formData = {
            stop:true,
            outputFile: room.outputFile,
            compositionFile: room.compositionFile,
            uploadFiles: room.uploadFiles,
            CompositionSid:  room.CompositionSid,
            RoomSid: room.RoomSid,
            tempEditFolder: room.tempEditFolder, 
            phones: room.phones,
            firebase_functions_host: settings.firebase_functions_host,
            cloud_host: settings.cloud_host,  // this host, so we don't have to keep querying config/settings doc
            callbackUrl: `https://${settings.firebase_functions_host}/uploadToFirebaseStorageComplete`, // just below this function
            compositionProgress: room.compositionProgress,
            website_domain_name: settings.website_domain_name,
            projectId: settings.projectId,        
            storage_keyfile: settings.storage_keyfile
        }
    
        let theUrl = `http://${settings.cloud_host}/uploadToFirebaseStorage`

        request.post(
            {
                url: theUrl, 
                json: formData // 'json' attr name is KEY HERE, don't use 'form'
            },
            async function (err, httpResponse, body) {
                /**** TODO FIXME can't send 500's back to twilio - only 200's
                 * Figure something else out
                 * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
                if(err) {
                    return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
                }
                *****/

                // Not doing anything with this - but have to handle err to get the script to compile
                if(err) {
                    await admin.firestore().collection('room').doc(room.RoomSid).update({upload_error: err})                        
                }
                let batch = db.batch();
                let roomRef = db.collection('room').doc(room.RoomSid)
                batch.update(roomRef, {storageItems: body.storageItems})
                let urRef = db.collection('upload_requests').doc(context.params.RoomSid)
                batch.delete(urRef)
                await batch.commit()
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

    if(req.body.stop && (req.body.stop === true || req.body.stop === 'true')) {
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
        compositionProgress: req.body.compositionProgress,
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



/**
 * Called from VideoListComponent (manual intervention for admin)
 * almost identical to uploadToFirebaseStorageComplete() 
 */
exports.uploadScreenshotToStorage = functions.firestore.document('upload_screenshot_requests/{RoomSid}').onCreate(async (snap, context) => {

    var db = admin.firestore();

    let room = snap.data()
    let settingsDoc = await db.collection('config').doc('settings').get()
    let settings = settingsDoc.data()
    
    let compositionProgress = room.compositionProgress ? room.compositionProgress : []
    compositionProgress.push('Uploading to the cloud :)')
    let videoUrl = `https://storage.googleapis.com/${settings.projectId}.appspot.com/${room.CompositionSid}/${room.CompositionSid}.m3u8`
    let videoUrlAlt = `https://storage.googleapis.com/${settings.projectId}.appspot.com/${room.CompositionSid}/${room.CompositionSid}-output.mp4`
    await db.collection('room').doc(room.RoomSid)
            .update({
                compositionProgress: compositionProgress,
                videoUrl: videoUrl,
                videoUrlAlt: videoUrlAlt
            })

    
    let formData = {
        stop: true,
        outputFile: room.outputFile,
        uploadFiles: room.uploadFiles,
		RoomSid: room.RoomSid,
        CompositionSid:  room.CompositionSid,
        compositionFile: room.compositionFile,
        videoUrl: videoUrl,
        videoUrlAlt: videoUrlAlt,
        phones: room.phones,
        cloud_host: settings.cloud_host,
        firebase_functions_host: settings.firebase_functions_host,
        //callbackUrl: `https://${settings.firebase_functions_host}/deleteVideoComplete`, // just below this function
        callbackUrl: `https://${settings.firebase_functions_host}/uploadScreenshotToStorageComplete`, // just below this function
        compositionProgress: compositionProgress,
        website_domain_name: settings.website_domain_name,
        projectId: settings.projectId,
        storage_keyfile: settings.storage_keyfile
    }
    
    
    let theUrl = `http://${settings.cloud_host}/uploadScreenshotToStorage`

    request.post(
        {
            url: theUrl, 
            json: formData // 'json' attr name is KEY HERE, don't use 'form'
        },
        async function (err, httpResponse, body) {
            /**** TODO FIXME can't send 500's back to twilio - only 200's
             * Figure something else out
             * see:   https://www.twilio.com/console/debugger/NO92750e021280500fc4e1bfd304feac53
            if(err) {
                return res.status(500).send(JSON.stringify({"error": err, "vm url": vmUrl}));
            }
            *****/

            // Not doing anything with this - but have to handle err to get the script to compile
            if(err) {
                console.log('uploadScreenshotToStorage():  err = ', err)
                await admin.firestore().collection('room').doc(room.RoomSid).update({upload_error: err})                        
            }
            let batch = db.batch();
            let roomRef = db.collection('room').doc(room.RoomSid)
            let screenshotDetails = body.screenshotDetails
            let storageItems = room.storageItems ? room.storageItems : []
            storageItems.push({bucketName: screenshotDetails.bucketName, folder: screenshotDetails.folder, filename: screenshotDetails.filename})
            batch.update(roomRef, {storageItems: storageItems})
            let urRef = db.collection('upload_screenshot_requests').doc(context.params.RoomSid)
            batch.delete(urRef)
            await batch.commit()
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
    var compositionProgress = req.body.compositionProgress
    compositionProgress.push('Uploaded screenshot to cloud')
    let screenshotUrl = `https://storage.googleapis.com/${req.body.projectId}.appspot.com/${req.body.CompositionSid}/${req.body.screenshot}`
    await db.collection('room').doc(req.body.RoomSid)
            .update({ compositionProgress: compositionProgress, screenshotUrl: screenshotUrl })
     
    if(req.body.stop && (req.body.stop === true || req.body.stop === 'true')) {
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
		compositionProgress: req.body.compositionProgress,
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
 * Called from VideoListComponent (manual intervention for admin)
 * almost identical to uploadScreenshotToStorageComplete() 
 */
exports.deleteVideo = functions.firestore.document('delete_video_requests/{RoomSid}').onCreate(async (snap, context) => {

    var db = admin.firestore();

    let room = snap.data()
    let settingsDoc = await db.collection('config').doc('settings').get()
    let settings = settingsDoc.data()
    
    let formData = {
        outputFile: room.outputFile,
        uploadFiles: room.uploadFiles,
		RoomSid: room.RoomSid,
        CompositionSid:  room.CompositionSid,
        compositionFile: room.compositionFile,
        phones: room.phones,
        cloud_host: settings.cloud_host,
        firebase_functions_host: settings.firebase_functions_host,
        callbackUrl: `https://${settings.firebase_functions_host}/deleteVideoComplete`, // just below this function
		compositionProgress: room.compositionProgress,
        website_domain_name: settings.website_domain_name,
        projectId: settings.projectId,
        storage_keyfile: settings.storage_keyfile
    }

	request.post(
		{
			url: `http://${settings.cloud_host}/deleteVideo`, 
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
    await db.collection('room').doc(req.body.RoomSid).update({compositionProgress: compositionProgress,
                                    compositionFile: admin.firestore.FieldValue.delete(),
                                    outputFile: admin.firestore.FieldValue.delete(),
                                    tempEditFolder: admin.firestore.FieldValue.delete(),
                                    uploadFiles: admin.firestore.FieldValue.delete()
                                })

    
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
            message: `Heads Up! Your video is ready!  Check it out below\n\nPlease don't thank us by replying to this text.  This number is not being monitored.\n\n${videoUrl}`,
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



/**
 * triggered from room.service:triggerRecreateVideo()
 */
exports.triggerRecreateVideo = functions.firestore.document('recreate_video_requests/{RoomSid}').onCreate(async (snap, context) => {

    var db = admin.firestore();

    let room = snap.data()
    let settingsDoc = await db.collection('config').doc('settings').get()
    let settings = settingsDoc.data()
    
    let formData = {
        RoomSid: room.RoomSid,
        StatusCallbackEvent: 'composition-available',
        MediaUri: `/v1/Compositions/${room.CompositionSid}/Media`,
        CompositionSid:  room.CompositionSid
    }

	request.post(
		{
			url: `http://${settings.firebase_functions_host}/twilioCallback?cloud_host=${settings.cloud_host}&firebase_functions_host=${settings.firebase_functions_host}&website_domain_name=${settings.website_domain_name}`, 
			json: formData // 'json' attr name is KEY HERE, don't use 'form'
		},
		function (err, httpResponse, body) {
            // TODO probably should do something if error
			console.log(err, body);
			return true
		}
	);
})


