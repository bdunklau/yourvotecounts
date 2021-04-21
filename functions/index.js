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
exports.notifyHeapWarning = twilio_sms.notifyHeapWarning

const twilio_video = require('./twilio-video');
exports.generateTwilioToken = twilio_video.generateTwilioToken;
exports.compose = twilio_video.compose
exports.getCompositionSid = twilio_video.getCompositionSid
exports.downloadComposition = twilio_video.downloadComposition
exports.twilioCallback = twilio_video.twilioCallback
exports.downloadComplete = twilio_video.downloadComplete
exports.cutVideo = twilio_video.cutVideo
exports.cutVideoComplete = twilio_video.cutVideoComplete
exports.createHls = twilio_video.createHls
exports.createHlsComplete = twilio_video.createHlsComplete
exports.uploadToFirebaseStorage = twilio_video.uploadToFirebaseStorage
exports.uploadToFirebaseStorageComplete = twilio_video.uploadToFirebaseStorageComplete
exports.uploadScreenshotToStorage = twilio_video.uploadScreenshotToStorage
exports.uploadScreenshotToStorageComplete = twilio_video.uploadScreenshotToStorageComplete
exports.deleteVideo = twilio_video.deleteVideo
exports.deleteVideoComplete = twilio_video.deleteVideoComplete
exports.triggerRecreateVideo = twilio_video.triggerRecreateVideo



const video = require('./video');
exports.getVideoInfo = video.getVideoInfo;

const privacy_policy = require('./api/privacy-policy');
exports.getPrivacyPolicy = privacy_policy.getPrivacyPolicy;

const terms_of_service = require('./api/terms-of-service');
exports.getTermsOfService = terms_of_service.getTermsOfService;

const my_account = require('./my-account');
exports.generateThumbnail = my_account.generateThumbnail;
exports.restoreDefaultPng = my_account.restoreDefaultPng;
exports.updateLicenseeContactIdOnUserCreated = my_account.updateLicenseeContactIdOnUserCreated;


const adminTasks = require('./admin');
exports.pingVm = adminTasks.pingVm
exports.onVmState = adminTasks.onVmState
exports.getIp = adminTasks.getIp
exports.linkPreview = adminTasks.linkPreview
exports.verifyCaptcha = adminTasks.verifyCaptcha


const teamTasks = require('./team');
exports.updateTeamMemberExpiration = teamTasks.updateTeamMemberExpiration

const roomTasks = require('./room');
exports.updateViewsOnRoomCreated = roomTasks.updateViewsOnRoomCreated
exports.updateViewsOnRoomUpdated = roomTasks.updateViewsOnRoomUpdated
exports.updateTotalTimeOnRoomUpdated = roomTasks.updateTotalTimeOnRoomUpdated
