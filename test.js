
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
var url = "https://media.discordapp.net/attachments/398241776327983106/525563924519714843/textify.PNG"

var opts = {
    "requests": [{
       "image": {
        "source": {
         "imageUri": url
        }
       },
       "features": [
            {
             "type": "DOCUMENT_TEXT_DETECTION"
            }
        ]
    }]
}
request.post({
    url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAzRVDxtRfo3EqTEbritKiZ93GLDOV4o0o",
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