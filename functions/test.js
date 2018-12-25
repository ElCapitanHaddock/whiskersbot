
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
var nodecanvas = require('canvas')

var request = require('request');
//var url = "https://cdn.discordapp.com/attachments/398241776327983106/525579274183376896/emote.png"
//var url = "https://files.guidedanmark.org/files/420/189370_Cozy_-_Burger_-_DSC02659_-_1024x_576_pixels.jpg?qfix"
//var url = "https://es.discoverlosangeles.com/sites/default/files/styles/poi_detail/public/poi_images/cafe_gratitude_venice/h_2000crmlacg-venice-03_798dd6d6-5056-a36f-23efa2d114b8cb72.jpg"
var url = "https://www.responsiveclassroom.org/wp-content/uploads/2016/04/DSC_2388-1024x682.jpg"
//var url = "https://cdn.jamieoliver.com/news-and-features/features/wp-content/uploads/sites/2/2015/10/masterplan_featured.jpg"

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
                     "type": "OBJECT_LOCALIZATION"
                    }
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
            
            const canvas = nodecanvas.createCanvas(w, h)
            const ctx = canvas.getContext('2d')
            
            nodecanvas.loadImage(result.secure_url).then((image) => {
                ctx.drawImage(image, 0, 0, w, h)
                
                
                var res = JSON.parse(body).responses[0].localizedObjectAnnotations
                var mids = []
                for (var i = 0; i < res.length; i++) {
                    if (mids.indexOf(res[i].mid) == -1) {
                        mids.push(res[i].mid)
                        ctx.strokeStyle = 'red'
                        ctx.lineWidth = 5;
                        ctx.beginPath()
                        var verts = res[i].boundingPoly.normalizedVertices
                        for (var j = 0; j < verts.length; j++) {
                            ctx.lineTo(verts[j].x * w, verts[j].y * h)
                        }
                        ctx.lineTo(verts[0].x * w, verts[0].y * h)
                        ctx.stroke()
                        
                        ctx.lineWidth = 1
                        ctx.font = '30px Courier';
                        var textX = w*(verts[0].x)
                        var textY = h*(verts[0].y)-10
                        ctx.strokeText(res[i].name, textX, textY);
                    }
                    
                    //console.log(res[i].name + ": " + res[i].boundingPoly.normalizedVertices)
                }
                //destroy the temporary inbetween one
                cloudinary.uploader.destroy(rand, function(result) { console.log(result) });
                
                //console.log(res)
                
                //console.log(canvas.toDataURL())
                var base64Data = canvas.toDataURL().replace(/^data:image\/png;base64,/, "");
                var rand2 = Math.random().toString(36).substring(4)
                fs.writeFile(rand2+".png", base64Data, 'base64', function(err) {
                    var embed = new Discord.RichEmbed()
                    embed.setTitle("Scan")
                    embed.attachFile(rand2+".png")
                    embed.setImage("attachment://"+rand2+".png")
                    msg.channel.send({embed}).then(function() {
                        fs.unlink('./'+rand2+'.png', (err) => {
                          if (err) throw err;
                          console.log('Cached meme was deleted');
                        });
                    }).catch(console.error)
                });
            })
        });     
  },
  {public_id: rand}
)