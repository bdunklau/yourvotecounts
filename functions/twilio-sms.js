
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio')

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:sendSms


exports.sendSms = functions.https.onRequest(async (req, res) => {
  let settings = await getSettings(req.query.auth_key);
  if(!settings.valid)
    return res.status(200).send('<h3>error</h3><br/><h2>not authorized</h2>')

  // return res.status(200).send('account sid: '+settings.twilio_account_sid);

  // require the Twilio module and create a REST client
  const client = twilio(settings.twilio_account_sid, settings.twilio_auth_key);
  return client.messages
    .create({
      to: '+12146325613',//+req.body.to,
      from: '+18174094501',//+req.body.from,
      body: 'test message', //req.body.message,
      mediaUrl: 'https://www.yahoo.com',
    })
    .then((message) => {
      return res.status(200).send('message sent: '+message.sid)
    });


})


var getSettings = function(auth_key) {

  return new Promise((resolve, reject) => {
    if(!auth_key) {
      resolve('no key');
    }

    return db.collection('config').doc('settings').get().then(doc => {
      var settings = doc.data();
      settings.valid = doc.data().twilio_auth_key === auth_key;
      resolve(settings);
      return;
    })

  })

}
