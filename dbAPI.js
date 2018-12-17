var API = function(db) {
    var self = this
    
    self.set = function(id, opts, cb) {
        var docRef = db.collection('servers').doc(id);
        var setter = docRef.set(opts).then(function(ref) {
            cb(null, ref)
        }).catch(function(err) { cb(err) })
    }
    self.update = function(id, opts, cb) {
        var docRef = db.collection('servers').doc(id);
        var update = docRef.update(opts).then(function(ref) {
            cb(null, ref)
        }).catch(function(err) { cb(err) })
    }
    self.get = function(id, cb) {
        var docRef = db.collection('servers').doc(id);
        if (docRef) {
            docRef.get()
            .then(function(doc) {
                if (doc.exists) cb(null, doc.data())
                else cb(404)
            }).catch(function(err) { cb(err) })
        } else cb(404)
    }
}

module.exports = API

/*
//For persistent db.json
var admin = require("firebase-admin")

var serviceAccount = require("./_key.json")
//var serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACC.replace(/\\n/g, ''))
//^ not working atm

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://capt-picard.appspot.com"
});

var firestore = admin.firestore();
var db = new API(firestore)
db.update("499395144634859521", {upvote:"upvote"}, function(err, res) {
    if (err) console.error(err)
    else  console.log(res)
})
*/