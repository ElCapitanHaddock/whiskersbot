

var request = require('request');
//var url = "https://cdn.discordapp.com/attachments/398241776327983106/525579274183376896/emote.png"
//var url = "https://files.guidedanmark.org/files/420/189370_Cozy_-_Burger_-_DSC02659_-_1024x_576_pixels.jpg?qfix"
//var url = "https://es.discoverlosangeles.com/sites/default/files/styles/poi_detail/public/poi_images/cafe_gratitude_venice/h_2000crmlacg-venice-03_798dd6d6-5056-a36f-23efa2d114b8cb72.jpg"
//var url = "https://www.responsiveclassroom.org/wp-content/uploads/2016/04/DSC_2388-1024x682.jpg"
//var url = "https://cdn.jamieoliver.com/news-and-features/features/wp-content/uploads/sites/2/2015/10/masterplan_featured.jpg"

var url = "http://3.bp.blogspot.com/-tnGFq5OFK5Y/Vmo1NckGvII/AAAAAAAAAB4/NF8DU3v6DYg/s1600/spoof-text-4-638.jpg"

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: "dvgdmkszs", 
  api_key: 877129391552993, 
  api_secret: "lAV6kacB9gHXhaJPY6NJPCzuEcw"
});

var rand = Math.random().toString(36).substring(4)
cloudinary.uploader.upload(url, //upload the image to cloudinary 
  function(result) {
        var w = result.width
        var h = result.height
        var opts = {
            "requests": [{
               "image": {
                "source": {
                 "imageUri": result.secure_url
                }
               },
               "features": [
                    {
                     "type": "SAFE_SEARCH_DETECTION"
                    },
                ]
            }]
        }
        request.post({
            headers: {'Content-Type': 'application/json'},
            url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAzRVDxtRfo3EqTEbritKiZ93GLDOV4o0o",
            body: JSON.stringify(opts)
        }, function(err, response, body){
            if (err) {
                console.error(err)
                return
            }
            
            var res = JSON.parse(body).responses[0]
            console.log(res)
            
            //destroy the temporary inbetween one
            cloudinary.uploader.destroy(rand, function(result) { console.log(result) });
            
            //console.log(res)
        });     
  },
  {public_id: rand}
)