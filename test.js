//____________FIREBASE
//For persistent db.json

var admin = require("firebase-admin");

var serviceAccount = require("./_key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://capt-picard.appspot.com"
});

var bucket = admin.storage().bucket();

/*
process.on('SIGTERM', function() {    
    bucket.upload("db.json", {
      gzip: true,
      metadata: { cacheControl: 'no-cache', },
    },function(err){
        if (err) console.error("Upload error: "+err)
        process.exit(2);
    });
    
});
*/


// Downloads the file to db.json, to be accessed by nedb
bucket.file("db.json").download({destination:"result.json"}, function(err) { 
    if (err) console.error("Download error: "+err)
    else {
        console.log("SUCCESS!")
    }
})