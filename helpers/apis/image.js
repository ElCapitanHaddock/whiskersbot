var Discord = require('discord.js')
var request = require('request')
var fs = require('fs')
const base64_request = require('request-promise-native').defaults({
  encoding: 'base64'
})

const engine_key = "AIzaSyAer13xr6YsLYpepwJBMTfEx5wZPRe-NT0"
const engine_id = "012876205547583362754:l8kfgeti3cg"

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
                    "imageContext": {
                        "webDetectionParams": {
                          "includeGeoResults": true
                         }
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
    //self.mirror = self.similar
    
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
    
    self.soy = (msg, ctx, config, cb) => {
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
        var metrics = [
            ["Face", "Head"],
            ["Forehead", "Nose", "Chin", "Eyebrow", "Tooth", "Jaw", "Mouth"],
            ["Product", "Design"],
            ["Electronics", "Electronic device"],
            ["Photography", "Selfie"],
            ["Facial expression"], 
            ["Beard","Facial hair", "Moustache"],
            ["Happy", "Fun", "Smile"], 
            ["Glasses", "Eyewear"]
        ] //ranked by index
        
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
                url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAer13xr6YsLYpepwJBMTfEx5wZPRe-NT0",
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
                    
                    var score = 0;
            
                    if (labels.find(l => l.description.includes("Soy"))) score = "TOO MUCH SOY";
                    else {
                        for (var i = 0; i < metrics.length; i++) {
                            var match = labels.find(l => metrics[i].indexOf(l.description) !== -1)
                            
                            if (match) {
                                if (score == 0) score = 1
                                score *= i + match.score
                            }
                        }
                        score = (score + 0.5) << 0
                        score += "g of soy"
                    }
                    
                    embed.setTitle(score)
                    msg.channel.send(embed)
                });
            }).catch(error => { 
                cb(msg.author.toString() + " Invalid image url!") 
            })
    }
    
    self.mood = (msg, ctx, config, cb) => {
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
                         "type": "FACE_DETECTION"
                        },
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+"AIzaSyAer13xr6YsLYpepwJBMTfEx5wZPRe-NT0",
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                
                var embed = new Discord.RichEmbed()
                embed.setThumbnail(ctx)
                
                var res = JSON.parse(body)
                
                var labels = JSON.parse(body).responses[0].faceAnnotations
                
                if (!labels) {
                    
                    cb(msg.author.toString() + " I couldn't recognize a human face from that!")
                    return
                }
                
                labels = labels[0]
                
                var emotions = ["joyLikelihood", "sorrowLikelihood", "angerLikelihood", "surpriseLikelihood"]
                var emotion_emojis = ["😄","😔","😠","😲"]
                
                var title = ""
                for (var i = 0; i < emotions.length; i++) {
                    if (labels[emotions[i]] == 'VERY_LIKELY' || labels[emotions[i]] == 'LIKELY' || labels[emotions[i]] == 'POSSIBLE') {
                        title += emotion_emojis[i] + " "
                    }
                }
                embed.setTitle(title ? title : "Just vibin'")
                
                msg.channel.send(embed).then().catch(function(error){console.error(error)})
            })
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
    self.img = (msg, ctx, config, cb) => {
        var query = ctx.slice(0,128)
        if (!query) return
        var opts = { 
            q: query, 
            key: engine_key,
            cx: engine_id,
            searchType: "image",
            num: 10
        }
        request.get({url: "https://www.googleapis.com/customsearch/v1/", qs: opts}, function(err, req, res) {
            if (err) {
                cb("Something went wrong!")
                return
            }
            var body = JSON.parse(res)
            
            if (body.error) {
                cb("Something went wrong!")
                return
            }
            var items = body.items
            
            var embed = new Discord.RichEmbed()
            if (!items || items.length == 0) {
                embed.setTitle("No results!")
            }
            else {
                var pick = items[Math.floor(Math.random()*items.length)]
                embed.setTitle(pick.title)
                embed.setURL(pick.image.contextLink)
                embed.setImage(pick.link)
            }
            embed.setFooter("'" + query + "'", "https://media.discordapp.net/attachments/528927344690200576/532826301141221376/imgingest-3373723052395279554.png")
            
            msg.channel.send(embed).catch(function(error){console.error(error)})
        })
    }
    
    self.inspire = (msg, ctx, config, cb) => {
        
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        
        if (!ctx.trim()) return
        
        var top,bottom
        
        base64_request(ctx).then(function(data) { //get image identification
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
                url: "https://vision.googleapis.com/v1/images:annotate?key="+"AIzaSyAer13xr6YsLYpepwJBMTfEx5wZPRe-NT0",
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
                    
                    top = pa.responses[0].webDetection.bestGuessLabels[0].label.toUpperCase()
                    
                    request.get({
                        url: "https://inspirobot.me/api?generateFlow=1" //get random inspirational quote
                        }, function(err, response, body) {
                        if (err) {
                            cb("InspiroBot down :(")
                            return
                        }
                        var res = JSON.parse(body)
                        bottom = res.data[1].text
                        
                        var rand_id = Math.random().toString(36).substring(4)
                    
                        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
                          function(result) { 
                            
                            var fontSize =  (80*25) / top.length
                            if (fontSize > 120) fontSize = 100
                            
                            var fontSize2 = (97*30) / bottom.length
                            if (fontSize2 > 45) fontSize2 = 45
                            
                            
                            bottom = encodeURI(bottom.replace(/\?/g,"").replace(/'/g,"").replace(/,/g,""))
                            top = encodeURI(top.replace(/\?/g,"").replace(/'/g,"").replace(/,/g,""))
                            
                            var url = `https://res.cloudinary.com/dvgdmkszs/image/upload/c_scale,h_1000,q_100,w_1300/l_demotivational_poster/c_fit,l_text:Times_${fontSize}_letter_spacing_5:${top},y_320,co_rgb:FFFFFF/c_fit,l_text:Times_${fontSize2}:${bottom},y_400,co_rgb:FFFFFF/${rand_id}`
                            
                            download(url, './'+rand_id+'.png', function() { //download image locally
                                
                                msg.channel.send({files: ['./'+rand_id+'.png']}).then(function() { //upload local image to discord
                                    fs.unlinkSync('./'+rand_id+'.png'); //delete local image
                                    cloudinary.uploader.destroy(rand_id, function(result) {  }); //delete cloudinary image
                                })
                            });
                          },
                          {public_id: rand_id}
                        )
                        
                        
                    });
                    
                } else cb("I couldn't understand that image!")
            });
        
        }).catch(error => { 
            cb(msg.author.toString() + " Invalid image url!") 
        })
    }
}

var download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  })
}

module.exports = ImageUtils