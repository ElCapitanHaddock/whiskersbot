var Discord = require('discord.js')
var request = require('request')
const base64_request = require('request-promise-native').defaults({
  encoding: 'base64'
})

//google image apis
var ImageUtils = function(client, cloudinary) {
    var self = this
    
    self.classify = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "LABEL_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                //embed.setTitle("Prediction")
                embed.setThumbnail(ctx)
                
                var labels = JSON.parse(body).responses[0].labelAnnotations
                
                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }
                
                var desc = ""
                for (var i = 0; i < labels.length; i++) {
                    desc += Math.round(labels[i].score * 100) + "% **" + labels[i].description + "**\n"
                }
                embed.setDescription(desc)
                msg.channel.send(embed).then().catch(function(error){console.error(error)})
            });
            
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
    
    self.describe = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                //embed.setTitle("Describe")
                embed.setThumbnail(ctx)
                
                var detect = JSON.parse(body).responses[0].webDetection
                
                if (!detect) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }
                
                var labels = detect.webEntities
                
                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }
                
                var desc = ""
                for (var i = 0; i < labels.length; i++) {
                    if (labels[i].description != undefined) desc += labels[i].description + "\n"
                }
                embed.setDescription(desc)
                msg.channel.send(embed).then().catch(function(error){console.error(error)})
            });
        
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
    
    self.identify = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.first().url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setThumbnail(ctx)
                
                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {
                    var res = pa.responses[0].webDetection.bestGuessLabels[0].label
                    embed.setTitle(res)
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                } else cb("I couldn't understand that image!")
            });
        
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
    
    self.landmark = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "LANDMARK_DETECTION"
                        },
                    ]
                }]
            }
    
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setThumbnail(ctx)
                
                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0]) {
                    var loc = pa.responses[0].landmarkAnnotations
                    if (loc) {
                        embed.addField("Location",loc[0].description)
                        embed.addField("Latitude","`"+loc[0].locations[0].latLng.latitude+"`")
                        embed.addField("Longitude","`"+loc[0].locations[0].latLng.longitude+"`")
                    }
                    
                    if (embed.fields.length == 0) cb("I couldn't put that on the map!")
                    else msg.channel.send(embed).then().catch(function(error){console.error(error)})
                
                } else cb("I couldn't put that on the map!")
            });
        
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
    
    self.locate = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setTitle("Found On")
                embed.setThumbnail(ctx)
                
                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {
                    var detect = pa.responses[0].webDetection
                    if (!detect.pagesWithMatchingImages) {
                        cb("Couldn't find that anywhere online!")
                        return
                    }
                    embed.setFooter(detect.pagesWithMatchingImages.length + "+ reposts")
                    var res = detect.pagesWithMatchingImages.slice(0,10)
                    var desc = ""
                    for (var i = 0; i < res.length; i++) {
                        desc += "["+res[i].pageTitle.replace(/<[^>]+>/g, '')+"]("+res[i].url+")\n"
                    }
                    embed.setDescription(desc)
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                } else cb("I couldn't understand that image!")
            });
            
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
    
    self.similar = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setThumbnail(ctx)
                embed.setTitle("Similar Image")
                
                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {
                    var detect = pa.responses[0].webDetection
                    var res = detect.visuallySimilarImages || detect.partialMatchingImages || detect.fullMatchingImages
                    var mirror = res[Math.floor(Math.random()*res.length)].url;
                    embed.setImage(mirror)
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                } else cb("I couldn't understand that image!")
            });
            
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
    
    self.mirror = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "WEB_DETECTION"
                        },
                    ]
                }]
            }
        
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setThumbnail(ctx)
                embed.setTitle("Nearest Match")
                
                var pa = JSON.parse(body)
                if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {
                    var detect = pa.responses[0].webDetection
                    var res = detect.fullMatchingImages || detect.partialMatchingImages || detect.visuallySimilarImages
                    if (!res || !res[0]) {
                        cb("No matching images!")
                    }
                    
                    var mirror = res[0].url;
                    embed.setImage(mirror)
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                } else cb("I couldn't understand that image!")
            });
            
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
    
    self.read = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
            var opts = {
                "requests": [{
                    "image":{
                        "content":data
                      },
                   "features": [
                        {
                         "type": "DOCUMENT_TEXT_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setTitle("Text Grab")
                embed.setThumbnail(ctx)
                
                var labels = JSON.parse(body).responses[0].textAnnotations
                
                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }
                
                var desc = labels[0].description.slice(0,1000)
                /*
                embed.setDescription(desc)
                if (!raw) {
                    msg.channel.send(embed).then().catch(function(error){console.error(error)})
                }*/
                msg.reply("```"+desc+"```").then().catch(function(error){console.error(error)})
            });
            
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
    
    self.funny = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        base64_request(ctx).then(function(data) {
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
                    url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                    body: JSON.stringify(opts)
                }, function(err, response, body) {
                    if (err) {
                        cb(msg.author.toString() + " Invalid image url!")
                        return
                    }
                    var embed = new Discord.RichEmbed()
                    embed.setThumbnail(ctx)
                    
                    var labels = JSON.parse(body).responses[0].safeSearchAnnotation
                    
                    if (!labels) {
                        cb(msg.author.toString() + " I couldn't recognize anything from that!")
                        return
                    }
                    
                    var spoof = labels.spoof
                    switch(spoof) {
                        case "UNKNOWN":
                            embed.setColor('BLACK')
                            embed.setTitle("??? 🗿")
                            break;
                        case "VERY_UNLIKELY":
                            embed.setColor('RED')
                            embed.setTitle("Gumwaa 😢")
                            break;
                        case "UNLIKELY":
                            embed.setColor('ORANGE')
                            embed.setTitle("Unfunny 😕")
                            break;
                        case "POSSIBLE":
                            embed.setColor('#ffd000')
                            embed.setTitle("Kinda funny 🙂")
                            break;
                        case "LIKELY":
                            embed.setColor('GREEN')
                            embed.setTitle("Funny 😃")
                            break;
                        case "VERY_LIKELY":
                            embed.setColor('BLUE')
                            embed.setTitle("Funwaa 😂")
                            break;
                        default:
                            embed.setColor('BLACK')
                            embed.setTitle("??? 🗿")
                            break;
                    }
                    
                    msg.channel.send(embed).catch(function(error){console.error(error)})
                });
            
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
    
    self.nsfw_test = (msg, ctx, config, cb) => {
        
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        
        base64_request(ctx).then(function(data) {
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
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setThumbnail(ctx)
                
                var labels = JSON.parse(body).responses[0].safeSearchAnnotation
                
                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }
                
                embed.addField("Adult",labels.adult)
                embed.addField("Medical", labels.medical)
                embed.addField("Violence", labels.violence)
                embed.addField("Racy", labels.racy)
                
                msg.channel.send(embed).catch(function(error){console.error(error)})
            });
            
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })

    }
    
    /*
    self.scan = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }//
        
        var rand = Math.random().toString(36).substring(4)
        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
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
                                //ctx.lineWidth = 5;
                                ctx.beginPath()
                                var verts = res[i].boundingPoly.normalizedVertices
                                for (var j = 0; j < verts.length; j++) {
                                    ctx.lineTo(verts[j].x * w, verts[j].y * h)
                                }
                                ctx.lineTo(verts[0].x * w, verts[0].y * h)
                                ctx.stroke()
                                
                                //ctx.lineWidth = 1
                                ctx.font = '30px Courier';
                                var textX = w*(verts[0].x)
                                var textY = h*(verts[0].y)-10
                                ctx.strokeText(res[i].name, textX, textY);
                            }
                            
                            //console.log(res[i].name + ": " + res[i].boundingPoly.normalizedVertices)
                        }
                        //destroy the temporary inbetween one
                        cloudinary.uploader.destroy(rand, function(result) {  });
                        
                        //console.log(res)
                        
                        //console.log(canvas.toDataURL())
                        var base64Data = canvas.toDataURL().replace(/^data:image\/png;base64,/, "");
                        var rand2 = Math.random().toString(36).substring(4)
                        fs.writeFile(rand2+".png", base64Data, 'base64', function(err) {
                            if (err) {
                                console.error(err)
                                cb("Internal error. Spam ping Uhtred!")
                                return
                            }
                            var embed = new Discord.RichEmbed()
                            embed.setTitle("Scan")
                            embed.attachFile(rand2+".png")
                            embed.setImage("attachment://"+rand2+".png")
                            msg.channel.send(embed).then(function() {
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
    }
    */
}

module.exports = ImageUtils