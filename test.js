
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
var url = "asdf"


var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: "dvgdmkszs", 
  api_key: 877129391552993, 
  api_secret: "lAV6kacB9gHXhaJPY6NJPCzuEcw"
});

cloudinary.uploader.upload(url, //upload the image to cloudinary 
  function(result) { 
        var opts = {
            "requests": [{
               "image": {
                "source": {
                 "imageUri": result.secure_url
                }
               },
               "features": [
                    {
                     "type": "LABEL_DETECTION"
                    }
                ]
            }]
        }
        console.log("cont")
        console.log(result.error)
        console.log("cont2")
        request.post({
            headers: {'Content-Type': 'application/json'},
            url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAzRVDxtRfo3EqTEbritKiZ93GLDOV4o0o",
            body: JSON.stringify(opts)
        }, function(err, response, body){
            if (err) {
                console.error(err)
                return
            }
          var labels = JSON.parse(body)//.responses[0]
          console.log(labels)
          for (var i = 0; i < labels.length; i++) {
            console.log(labels[i])   
          }
        });     
  },
  {public_id: Math.random().toString(36).substring(4)}
).catch(function(err) {
    console.log(err.message)
})