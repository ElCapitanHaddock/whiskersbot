//____________FIREBASE
var admin = require("firebase-admin")
var functions = require("firebase-functions")

var serviceAccount = require("./firebase_key.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var firestore = admin.firestore();

const settings = {timestampsInSnapshots: true};
firestore.settings(settings);


var databaseAPI = require("./dbAPI.js")
var API = new databaseAPI(firestore)

firestore.collection("servers")
.onSnapshot(function(querySnapshot) {
    querySnapshot.docChanges().forEach(function(change) {
        if (change.type === "added") {
            console.log("added: ", change.doc.data());
        }
        if (change.type === "modified") {
            console.log("changed: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("removed: ", change.doc.data());
        }
    });
});
setInterval(function() {
  console.log("...")
}, 10000)