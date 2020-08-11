const functions = require('firebase-functions');
const admin = require('firebase-admin')
const log = require('./log')
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const {Storage} = require('@google-cloud/storage');

// can only call this once globally and we already do that in index.js
//admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// firebase deploy --only functions:generateThumbnail


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
    // Exit if the image is already a thumbnail.
    if (fileName.startsWith('thumb_')) {
      return console.log('Already a Thumbnail.');
    }


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
    await spawn('convert', [pngPath, '-thumbnail', '200x200>', pngPath]);
    await spawn('convert', [pngPath, '-gravity', 'center', '-extent', '150x150', pngPath]);
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
    // Once the thumbnail has been uploaded delete the local file to free up disk space.
    return fs.unlinkSync(tempFilePath);
  }

  // after resizing, get the url
  else if(object.name.startsWith('thumb_profile-pic-')) {

    let uid = object.name.substring('thumb_profile-pic-'.length);

    // TODO not sure if this is right
    // admin.storage().bucket(object.bucket).file(object.name).get


    return admin.storage().bucket(object.bucket).file(object.name).getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    })
    .then(signedUrls => {
      console.log('signed URL', signedUrls[0]); // this will contain the picture's url
      return db.collection('user').doc(uid).update({photoURL: signedUrls[0]});
    })
    .catch(err => console.error(err));

  }

  else return false;
});
