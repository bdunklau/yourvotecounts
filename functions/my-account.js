const functions = require('firebase-functions');
const admin = require('firebase-admin')
const log = require('./log')
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const {Storage} = require('@google-cloud/storage');
const console = require('console');
const { query } = require('express');

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:updateLicenseeContactIdOnUserCreated,functions:generateThumbnail,functions:restoreDefaultPng


exports.restoreDefaultPng = functions.storage.object().onDelete(async (object) => {
  // https://headsupvideo.atlassian.net/browse/HEADSUP-63
  if(object.name === 'thumb_profile-pic-default.png') {

    const tempFilePath = path.join(os.tmpdir(), 'default_bak.png');
    const bucket = admin.storage().bucket(object.bucket);
    await bucket.file('default_bak.png').download({destination: tempFilePath});

    const defaultThumbPath = path.join(path.dirname('thumb_profile-pic-default.png'), 'thumb_profile-pic-default.png');
    await bucket.upload(tempFilePath, {
      destination: defaultThumbPath,
      metadata: {contentType: object.contentType},
    });

    // Once the default thumbnail has been uploaded, delete the local file to free up disk space.
    return fs.unlinkSync(tempFilePath);
    
  }
  else return false
})


exports.generateThumbnail = functions.storage.object().onFinalize(async (object) => {
  // For ref:    https://firebase.google.com/docs/functions/gcp-storage-events


  // On original upload, need to resize
  if(object.name.startsWith('profile-pic-')) {

    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith('image/')) {
      return console.log('This is not an image.');
    }

    // Get the file name.
    const fileName = path.basename(filePath);

    // get the timestamp suffix
    const tstamp = object.name.substring("-ts-".length + object.name.indexOf("-ts-"))


    // Download file from bucket.
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    var pngPath = tempFilePath;
    if(tempFilePath.endsWith('.jpeg')) {
      pngPath = tempFilePath.substring(0, tempFilePath.indexOf('.jpeg')) + '.png';
    }
    const metadata = {
      contentType: contentType,
    };
    await bucket.file(filePath).download({destination: tempFilePath});
    console.log('Image downloaded locally to', tempFilePath);
    // Generate a thumbnail using ImageMagick.
    await spawn('convert', [tempFilePath, '-auto-orient', pngPath]);
    await spawn('convert', [pngPath, '-thumbnail', '200x200', pngPath]);
    await spawn('convert', [pngPath, '-gravity', 'center', '-extent', '125x125', pngPath]);
    await spawn('convert', [pngPath, '-vignette', '0x0+0+0', pngPath]);
    await spawn('convert', [pngPath, '-background', 'transparent', pngPath]);
    console.log('Thumbnail created at', pngPath);
    // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
    const thumbFileName = `thumb_${fileName}`;
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);

    // Uploading the thumbnail.
    await bucket.upload(tempFilePath, {
      destination: thumbFilePath,
      metadata: metadata,
    });

    let uid = fileName.substring('profile-pic-'.length, fileName.indexOf("-ts-"));
    db.collection('user').doc(uid).update({photoURL: "", photoFileName: thumbFileName});

    // Once the thumbnail has been uploaded delete the local file to free up disk space.
    return fs.unlinkSync(tempFilePath);
  }

  else return false;
});


/**
 * query licensee_contact collection for anyone with this user's uid
 * 
 * When the user is created, we know his phoneNumber
 * Query licensee_contact for phoneNumber
 * If the phoneNumber is found, then set licensee_contact.uid = user.uid
 */
exports.updateLicenseeContactIdOnUserCreated = functions.firestore.document('user/{uid}').onCreate(async (snap, context) => {
    var db = admin.firestore();
    var data = snap.data()
    // let dt = await db.collection('licensee_contact').where('phoneNumber', '==', data.phoneNumber).limit(1).get()

    return db.collection('licensee_contact').where('phoneNumber', '==', data.phoneNumber).limit(1).get().then(snap => {
        let licenseeContactId
        // console.log('PAY ATTENTION: === snap = ', snap) // QuerySnapshot
        snap.forEach(function(doc1) { // loop should only fire once
            licenseeContactId = doc1.data().id;
        })
        return db.collection('licensee_contact').doc(licenseeContactId).update({uid: context.params.uid})

    })

})
