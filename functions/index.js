const functions = require('firebase-functions');
const admin = require('firebase-admin')

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const auth = require('./auth')
exports.logNewUser = auth.logNewUser
exports.recordNewUser = auth.recordNewUser
exports.deleteUser = auth.deleteUser
exports.logDeleteUser = auth.logDeleteUser
exports.initiateDeleteUser = auth.initiateDeleteUser
exports.createCustomToken = auth.createCustomToken
exports.updateUser = auth.updateUser

// test support, not app code
const ts = require('./test-support/create-log');
exports.createLog = ts.createLog
exports.createLogs = ts.createLogs
exports.deleteLogs = ts.deleteLogs

const user = require('./api/user');
exports.getUser = user.getUser;
exports.setUser = user.setUser

const twilio_sms = require('./twilio-sms');
exports.sendSms = twilio_sms.sendSms;

const twilio_video = require('./twilio-video');
exports.generateTwilioToken = twilio_video.generateTwilioToken;
exports.compose = twilio_video.compose
exports.twilioCallback = twilio_video.twilioCallback

const privacy_policy = require('./api/privacy-policy');
exports.getPrivacyPolicy = privacy_policy.getPrivacyPolicy;

const terms_of_service = require('./api/terms-of-service');
exports.getTermsOfService = terms_of_service.getTermsOfService;

const my_account = require('./my-account');
exports.generateThumbnail = my_account.generateThumbnail;
