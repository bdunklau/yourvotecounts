

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail')

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:sendEmail



var getKeys = function() {
  return new Promise((resolve, reject) => {
    return db.collection('config').doc('twilio').get().then(doc => {
      var keys = doc.data();
      resolve(keys);
      return;
    })

  })

}


exports.sendEmail = functions.firestore.document('email/{id}').onCreate(async (snap, context) => {
    let keys = await getKeys();
  
    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    sgMail.setApiKey(keys.sendgrid_api_key)
    const msg = {
        to: snap.data().to, // Change to your recipient
        from: snap.data().from, // Change to your verified sender
        subject: snap.data().subject,
        text: snap.data().text,
        html: snap.data().html
    }
    
    return sgMail.send(msg)
    .then(() => {
        console.log('Email sent')
        return true
    })
    .catch((error) => {
        console.error(error)
    })
  
})