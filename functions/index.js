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
