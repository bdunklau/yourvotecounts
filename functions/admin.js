const functions = require('firebase-functions');
const admin = require('firebase-admin')
const log = require('./log')
const request = require('request')
const corsModule = require('cors')
const cors = require('cors')({ origin: true});
const fetch = require('node-fetch');


// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:pingVm,functions:onVmState


/**
 * ping the vm to make sure it's up
 */
exports.pingVm = functions.https.onRequest((req, res) => {

    cors(req, res, async () => {
        await blahblah()
        return res.status(200).send('ok')

    })


})


exports.onVmState = functions.firestore.document('state/vm_state').onWrite(async (snap, context) => {
    let theData = snap.data ? snap.data() : snap.after.data()
    // let str = JSON.stringify(theData)
    // console.log('onVmState: theData = ', str)

    if(snap.after.data && snap.before.data) {
        let msg = ''
        let justWentDown = snap.before.data()['up'] === true && snap.after.data()['up'] === false
        let justCameUp = snap.before.data()['up'] === false && snap.after.data()['up'] === true
        if(justWentDown) msg = 'The vm just went down'
        if(justCameUp) msg = 'The vm just came back up'
        let needToSendSms = justWentDown || justCameUp
        if(needToSendSms) {
            let settingsDoc = await db.collection('config').doc('settings').get()
            let settings = settingsDoc.data()
            
            // twilio-sms.js : exports.sendSms()
            db.collection('sms').add({
                from: settings.from_sms, 
                to: settings.admin_sms, 
                message: msg,
                date: new Date(),
                date_ms: new Date().getTime(),
            })
        }

    }

    if(!theData['up']) {
        console.log('onVmState: return early because theData["up"] = ', theData['up'])
        return true
    }
    
    setTimeout(async () => {
        await blahblah()
        return true

    }, 10000)
})


blahblah = async () => {
    let settingsDoc = await db.collection('config').doc('settings').get()
    let settings = settingsDoc.data()


    // yourvotecounts-vm : nodejs/index.js
    let cloudUrl = `http://${settings.cloud_host}/ping` // yourvotecounts-vm: nodejs/index.js: /ping
    let up = true

    try {
        const dataBack = await fetch(cloudUrl)
        const html = await dataBack.text();
        let vmResponse = JSON.parse(html)
        console.log('vmResponse: ', vmResponse)
        
        if(vmResponse['up'] === true)
            up = true
        else up = false
    } catch(err) {
        up = false
    }

    let record = {cloudUrl: cloudUrl, date: new Date(), date_ms: new Date().getTime(), up: up}
    await db.collection('state').doc('vm_state').set(record)
}





