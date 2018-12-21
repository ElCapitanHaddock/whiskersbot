
/*
// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
 
// Creates a client
const client = new vision.ImageAnnotatorClient();
 
// Performs label detection on the image file
client
  .labelDetection('https://media.discordapp.net/attachments/398241776327983106/525477509291048984/ok_.png')
  .then(results => {
    const labels = results[0].labelAnnotations;
 
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
*/
  
var request = require('request');

var opts = {
    "requests": [{
       "image": {
        "source": {
         "imageUri": "https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Original_Doge_meme.jpg/300px-Original_Doge_meme.jpg"
        }
       },
       "features": [
            {
             "type": "TEXT_DETECTION"
            }
        ]
    }]
}
request.post({
    url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBQ5Vo2WCfd_NeasjbcJ76IgohlkIA90rM",
    body: JSON.stringify(opts)
}, function(err, response, body){
    if (err) {
        console.error(err)
        return
    }
  var labels = JSON.parse(body).responses[0].textAnnotations
  for (var i = 0; i < labels.length; i++) {
    console.log(labels[i])   
  }
});