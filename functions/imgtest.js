

//var url = "https://cdn.discordapp.com/attachments/398241776327983106/525579274183376896/emote.png"
//var url = "https://files.guidedanmark.org/files/420/189370_Cozy_-_Burger_-_DSC02659_-_1024x_576_pixels.jpg?qfix"
//var url = "https://es.discoverlosangeles.com/sites/default/files/styles/poi_detail/public/poi_images/cafe_gratitude_venice/h_2000crmlacg-venice-03_798dd6d6-5056-a36f-23efa2d114b8cb72.jpg"
//var url = "https://www.responsiveclassroom.org/wp-content/uploads/2016/04/DSC_2388-1024x682.jpg"
//var url = "https://cdn.jamieoliver.com/news-and-features/features/wp-content/uploads/sites/2/2015/10/masterplan_featured.jpg"

var url = "wkbgnw"

const base64_request = require('request-promise-native').defaults({
  encoding: 'base64'
})
var request = require('request')

base64_request(url).then(function(data) {
    console.log(data)
    var opts = {
        "requests": [{
            "image":{
                "content":data
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
        url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAer13xr6YsLYpepwJBMTfEx5wZPRe-NT0",
        body: JSON.stringify(opts)
    }, function(err, response, body){
        if (err) {
            console.error(err)
            return
        }
        
        var res = JSON.parse(body).responses[0]
        console.log(res)
        
        //destroy the temporary inbetween one
        
        //console.log(res)
    });
}).catch(error => { console.error(error) })