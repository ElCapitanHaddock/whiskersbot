var admin = require("firebase-admin");
var fs = require('fs');
var serviceAccount = require("../firebase_key.json");

var collectionName = "servers";

// You should replae databaseURL with your own
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


var db = admin.firestore();

var data = {};
data[collectionName] = {};

var results = db.collection(collectionName)
.get()
.then(snapshot => {
  snapshot.forEach(doc => {
    data[collectionName][doc.id] = doc.data();
  })
  return data;
})
.catch(error => {
  console.log(error);
})

results.then(dt => {
  // Write collection to JSON file
  fs.writeFile("db.json", JSON.stringify(dt), function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
})