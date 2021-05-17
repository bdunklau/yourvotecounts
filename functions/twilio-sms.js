
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');
const _ = require('lodash');

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:sendSms,functions:notifyHeapWarning,functions:incomingSms



var getKeys = function() {
  return new Promise((resolve, reject) => {
    return db.collection('config').doc('twilio').get().then(doc => {
      var keys = doc.data();
      resolve(keys);
      return;
    })

  })

}


var addCountryCode = function(phone) {
  if(!phone) return phone
  else if(phone.startsWith("+1")) return phone
  else if(phone.length === 10) return "+1"+phone
  else return phone
}


/**
 * NOT SURE I LIKE DOING IT THIS WAY
 * Pro's: we have a record of the text message that was sent
 * Con's: we now have to deal with these records
 * 
 * WOULD IT BE BETTER TO HAVE AN HTTPS FUNCTION that listens for GETS/POSTS and have those web requests trigger the same code as below?
 * 
 * MAYBE KEEP THIS THE WAY IT IS... At some point, we're going to want to review the messages that were
 * send.  If we trigger by http calls, we won't be able to see what was sent
 */
// triggered from  sms.service.ts
exports.sendSms = functions.firestore.document('sms/{id}').onCreate(async (snap, context) => {
  /**
   * https://headsupvideo.atlassian.net/browse/HEADSUP-118
   * short-circuit and return early if the "to" hasn't opted in
   * 
   * IF YOU CHANGE THIS QUERY HERE, YOU NEED TO CHANGE THE SAME QUERY IN invitation.service.ts:queryOptIn()
   * IT'S THE SAME QUERY
   */
  var checkNumber = snap.data().to
  let isOptIn = await db.collection('sms_opt_in', ref => ref.where("From", "==", checkNumber).orderBy("incoming_sms_date_ms", "asc").limitToLast(1)).get({source: 'server'})
  if(!isOptIn) {
      console.log(`No opt in for ${snap.data().to}`)
      return true // true/false doesn't matter
  }
  
  console.log(`We DO have an opt in for ${snap.data().to} - send the text`)

  let keys = await getKeys();

  var details = {};
  details.to = addCountryCode(snap.data().to);
  details.from = addCountryCode(snap.data().from);
  details.body = snap.data().message;
  if(snap.data().mediaUrl) details.mediaUrl = [snap.data().mediaUrl];

  // require the Twilio module and create a REST client
  const client = twilio(keys.twilio_account_sid, keys.twilio_auth_key);
  return client.messages
    .create(details)
    .then((message) => {
      return db.collection('sms').doc(context.params.id).update({twilio_message_sid: message.sid});
    });

    /******************
    Here's all the elements that come back in 'message'...

    {
      "account_sid": "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "api_version": "2010-04-01",
      "body": "Hi there!",
      "date_created": "Thu, 30 Jul 2015 20:12:31 +0000",
      "date_sent": "Thu, 30 Jul 2015 20:12:33 +0000",
      "date_updated": "Thu, 30 Jul 2015 20:12:33 +0000",
      "direction": "outbound-api",
      "error_code": null,
      "error_message": null,
      "from": "+14155552345",
      "messaging_service_sid": "MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "num_media": "0",
      "num_segments": "1",
      "price": "-0.00750",
      "price_unit": "USD",
      "sid": "MMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "status": "sent",
      "subresource_uris": {
        "media": "/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Media.json"
      },
      "to": "+14155552345",
      "uri": "/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.json"
    }
    ******************/

})


/**
 * Called from yourvotecounts-vm:index.js:notifyHeapWarning()
 * 
 * The purpose of this function is to trigger an SMS message to me letting me know that the
 * heap used by the node server has exceeded config/settings/heapThreshold
 */
exports.notifyHeapWarning = functions.https.onRequest(async (req, res) => {

    /**
     * passed in from index.js: notifyHeapWarning()
     * 
    
        let formData = {
          heapUsed: req.body.heapUsed,
          heapThreshold: req.body.heapThreshold,
          website_domain_name: req.body.website_domain_name
        }
     */
    let twilioDoc = await db.collection('config').doc('twilio').get()
    let twilioKeys = twilioDoc.data()

    let settingsDoc = await db.collection('config').doc('settings').get()
    let settings = settingsDoc.data()

    var details = {};
    details.to = addCountryCode(settings['admin_sms'])
    details.from = addCountryCode(settings['from_sms'])
    details.body = `VM heap use: ${req.body.heapUsed} GB has exceeded the threshold of ${req.body.heapThreshold} GB`

    // require the Twilio module and create a REST client
    const client = twilio(twilioKeys['twilio_account_sid'], twilioKeys['twilio_auth_key'])
    return client.messages
      .create(details)
      .then((message) => {
          return res.status(200).send(JSON.stringify({result: 'ok'}))
      });

})


/************
USAGE:

  let keys = await validateKeys(req.query.auth_key);
  if(!keys.valid)
    return res.status(200).send('<h3>error</h3><br/><h2>not authorized</h2>')

***********/
var validateKeys = function(auth_key) {

  return new Promise((resolve, reject) => {
    if(!auth_key) {
      resolve('no key');
    }

    return db.collection('config').doc('twilio').get().then(doc => {
      var keys = doc.data();
      keys.valid = doc.data().twilio_auth_key === auth_key;
      resolve(keys);
      return;
    })

  })
  

}



/**
 * Prod version called by:
 * https://www.twilio.com/console/sms/services/MG3082c99f0043de1563b9f1ec5bf37d22
 * 
 * Dev version called by:
 * https://www.twilio.com/console/sms/services/MG48435b7534fe7615253a564110dbb93e
 * 
 * Incoming messages are NOT just opt-ins.  They could be STOP's or anything else we decide to support
 * As of 5/15/21, we are only supporing opt-in's and STOP's
 * 
 * In the first half of this function, we record the incoming sms message in the sms collection
 * 
 * In the second half of this fucntion, we check to see if this incoming message is a request to
 * opt in or opt out.  If it's one of those, then we also write to the sms_opt_in collection
 */
exports.incomingSms = functions.https.onRequest(async (req, res) => {
    let doc = req.body
    let d = new Date()
    let ms = d.getTime()
    doc['incoming_sms_date'] = d
    doc['incoming_sms_date_ms'] = ms
    let smsDocId = db.collection('sms').doc().id
    await db.collection('sms').doc(smsDocId).set(doc)
    let optingIn = req.body.Body.trim().toLowerCase() === 'start'
    if(optingIn) {
        doc['opt-in'] = true
    }
    let optingOut = req.body.Body.trim().toLowerCase() === 'stop'
    if(optingOut) {
        doc['opt-in'] = false
    }
    if(optingIn || optingOut) {
        doc['smsDocId'] = smsDocId        
        await db.collection('sms_opt_in').add(doc)
    }
    return res.status(200).send(JSON.stringify({result: 'ok'}))

})
