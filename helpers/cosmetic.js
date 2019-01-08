

const memeLib = require('nodejs-meme-generator');
const memeGenerator = new memeLib();
var fs = require("fs")
const dogeify = require('dogeify-js');
//const pd = require('paralleldots');
var request = require('request');
//pd.apiKey = process.env.PD_KEY;
//var natural = require('natural');
const scrapeIt = require("scrape-it")
const nodeyourmeme = require('nodeyourmeme');
const googleTrends = require('google-trends-api');
var Discord = require('discord.js')


var Cosmetic = function(perspective, translate, client, cloudinary) {
    /*C O S M E T I C
    usable by anyone*/
    var self = this
    
    const About = require("./about.js")
    const kiosk = new About(client)
    
    self.about = (msg, ctx, config, cb) => {
        if (kiosk[ctx]) {
            kiosk[ctx](msg, config, cb)
        }
        else cb(msg.author.toString() + " Use *@whiskers help* to get **about** topics")
    }
    
    self.paterico = (msg, ctx, config, cb) => {
        var paterico_guild = client.guilds.find(function(g) { return g.id == 509166690060337174 })
        if (paterico_guild) {
            var patericos = paterico_guild.emojis.array()
            var emote = patericos[Math.floor(Math.random()*patericos.length)];
            msg.channel.send(emote.toString())
        } else msg.reply("cut the powerlines")
    }
    
    self.analyze = (msg, ctx, config, cb) => {
        var metrics = ["TOXICITY",
        "SEVERE_TOXICITY",	
        "IDENTITY_ATTACK",
        "INSULT",
        "PROFANITY",
        "SEXUALLY_EXPLICIT",
        "THREAT",
        "FLIRTATION",
        "ATTACK_ON_AUTHOR",
        "ATTACK_ON_COMMENTER",
        "INCOHERENT",
        "INFLAMMATORY",
        "LIKELY_TO_REJECT",
        "OBSCENE",
        "SPAM",
        "UNSUBSTANTIAL"]
        var params = ctx.trim().split(" ")
        if (params[0] && metrics.indexOf(params[0].toUpperCase()) !== -1 && params[1]) {
            params = [params[0].toUpperCase(), params.slice(1).join(" ")];
            var met = params[0];
            var text = params[1];
            (async function() {
                try {
                    const result = await perspective.analyze(text, {attributes: [met]});
                    var score = Math.round(result.attributeScores[met].summaryScore.value * 100)
                    const embed = new Discord.RichEmbed()
                    var emote = "🗿"
                        embed.setColor("PURPLE")
                    if (score < 10) { emote = "😂"
                        embed.setColor("GREEN")
                    }
                    else if (score < 30) { emote = "😤"
                        embed.setColor("#ffd000")
                    }
                    else if (score < 70) { emote = "😡"
                        embed.setColor("ORANGE")
                    }
                    else if (score < 99) { emote = "👺"
                        embed.setColor("RED")
                    }
                    embed.setDescription(emote + " " + text)
                    embed.setTitle(met + " || " + score + "%")
                    cb(null, embed);
                }
                catch(error) { cb("<:red_x:520403429835800576> Sorry " + msg.author.toString() + ", I couldn't understand that message") }
            })()
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please pick a metric: ```" + metrics + "```")
    }
    
    self.translate_fancy = (msg, ctx, config, cb) => { //todo: add link to Yandex here
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("<:red_x:520403429835800576> Yandex Error: " + err)
              else if (res.text) {
                  var embed = new Discord.RichEmbed()
                  embed.setTitle(params[0].toLowerCase()+ " || " + params[1].substring(0,100))
                  embed.setDescription(res.text)
                  msg.channel.send(embed).then().catch(function(error){console.error(error)})
              }
              else cb("<:red_x:520403429835800576> " + msg.author.toString() + " language not recognized.\nHere's the full list: https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages")
            });
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please specify a target language and message.")
    }
    
    self.translate = (msg, ctx, config, cb) => {
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("<:red_x:520403429835800576> Yandex Error: " + err)
              else if (res.text) {
                  msg.reply("`"+res.text+"`").then().catch(function(error){console.error(error)})
              }
              else cb("<:red_x:520403429835800576> " + msg.author.toString() + " language not recognized.\nHere's the full list: https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages")
            });
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please specify a target language and message.")
    }
    
    self.doge = (msg, ctx, config, cb) => {
        cb(null,"<:doge:522630325990457344> " + dogeify(ctx.toLowerCase().replace(/@everyone/g,"").replace(/@here/g,"").replace(/@/g,"")))
    }
    
    self.check_guild = (msg, ctx, config, cb) => {
        var found = client.guilds.find(function(g) { return g.id == ctx })
        if (found) msg.reply("Found!")
        else msg.reply("Not found!")
    }
    
    //mingus whingus
    self.meme = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx += " "+msg.attachments.array()[0].url
        }
        var params = ctx.trim().split(" ")
        if (params[0] && params[1] && params[0].trim() && params[1].trim()) {
            params = [params[0], params.slice(1).join(" ")]
            
            var opts = {topText:"",bottomText:"",url:params[0]}
            
            if (params[1].includes("|")) {
                var spl = params[1].split("|")
                opts.topText = spl[0]
                opts.bottomText = spl[1]
            }
            else {
                opts.topText = params[1].slice(0, params[1].length/2 || 1)
                opts.bottomText = (params[1].length/2 > 1) ? params[1].slice(params[1].length/2) : ""
            }
            memeGenerator.generateMeme(opts)
            .then(function(data) {
                var random = Math.random().toString(36).substring(4);
                fs.writeFile(random+".png", data, 'base64', function(err) {
                    if (err) console.error(err)
                    else {
                        msg.channel.send({
                          files: [{
                            attachment: './'+random+'.png',
                            name: random+'.jpg'
                          }]
                        }).then(function() {
                            fs.unlink('./'+random+'.png', (err) => {
                              if (err) throw err;
                              console.log('Cached meme was deleted');
                            });
                        })
                    }
                });
            }).catch(function(error) { cb("Please include a valid image-url!") })
        } else cb("Please include both the caption and image-url!")
    }
    
    /*
    self.describe = (msg, ctx, config, cb) => {
        if (!ctx) return
        pd.objectRecognizer(ctx,'url')
        .then((response) => {
            var embed = new Discord.RichEmbed()
            embed.setTitle("What's this?")
            embed.setThumbnail(ctx)
            
            var res = JSON.parse(response).output
            if (!res) {
                cb("Couldn't recognize anything from that!")
                return
            }
            var desc = ""
            for (var i = 0; i < res.length; i++) {
                desc += Math.round(res[i].score * 100) + "% **" + res[i].tag + "**\n"
            }
            embed.setDescription(desc)
            msg.channel.send(embed).then().catch(function(error){console.error(error)})
        })
        .catch((error) => {
            console.log(error)
            cb("Couldn't process that image!")
        })
    }
    */
    
    //TODO: Modularize and implement interface for Google Cloud Vision
    
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
        var rand = Math.random().toString(36).substring(4)
        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
            function(result) { 
                if (result.error) {
                    cb("No image found at that url!")
                    return
                }
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
                    cloudinary.uploader.destroy(rand, function(result) {  });
                });
          },
          {public_id: rand}
        )
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
        var rand = Math.random().toString(36).substring(4)
        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
            function(result) { 
                if (result.error) {
                    cb("No image found at that url!")
                    return
                }
                var opts = {
                    "requests": [{
                       "image": {
                        "source": {
                         "imageUri": result.secure_url
                        }
                       },
                       "features": [
                            {
                             "type": "WEB_DETECTION"
                            }
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
                    cloudinary.uploader.destroy(rand, function(result) {  });
                });
          },
          {public_id: rand}
        )
    }
    
    self.identify = (msg, ctx, config, cb) => {
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
        var rand = Math.random().toString(36).substring(4)
        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
            function(result) { 
                if (result.error) {
                    cb("No image found at that url!")
                    return
                }
                var opts = {
                    "requests": [{
                       "image": {
                        "source": {
                         "imageUri": result.secure_url
                        }
                       },
                       "features": [
                            {
                             "type": "WEB_DETECTION"
                            }
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
                    cloudinary.uploader.destroy(rand, function(result) {  });
                });
          },
          {public_id: rand}
        )
    }
    
    self.map = (msg, ctx, config, cb) => {
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
        var rand = Math.random().toString(36).substring(4)
        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
            function(result) { 
                if (result.error) {
                    cb("No image found at that url!")
                    return
                }
                var opts = {
                    "requests": [{
                       "image": {
                        "source": {
                         "imageUri": result.secure_url
                        }
                       },
                       "features": [
                           /*
                            {
                             "type": "OBJECT_LOCALIZATION"
                            },
                            {
                             "type": "LOGO_DETECTION"
                            },
                            */
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
                        /*
                        var objs = pa.responses[0].localizedObjectAnnotations
                        if (objs && objs[0]) {
                            var obj_text = ""
                            for (var i = 0; i < objs.length-1; i++) {
                                obj_text += objs[i].name + ", "
                            }
                            if (objs[objs.length-1]) {
                                obj_text += objs[objs.length-1].name
                            }
                            embed.addField("Objects",obj_text)
                        }
                        var logos = pa.responses[0].logoAnnotations
                        if (logos && logos[0]) {
                            var logo_text = ""
                            for (var i = 0; i < logos.length-1; i++) {
                                logo_text += logos[i].description + ", "
                            }
                            logo_text += logos[logos.length-1].description
                            embed.addField("Signs",logo_text)
                        }
                        */
                        if (embed.fields.length == 0) cb("I couldn't put that on the map!")
                        else msg.channel.send(embed).then().catch(function(error){console.error(error)})
                    
                    } else cb("I couldn't put that on the map!")
                    cloudinary.uploader.destroy(rand, function(result) {  });
                });
          },
          {public_id: rand}
        )
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
        var rand = Math.random().toString(36).substring(4)
        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
            function(result) { 
                if (result.error) {
                    cb("No image found at that url!")
                    return
                }
                var opts = {
                    "requests": [{
                       "image": {
                        "source": {
                         "imageUri": result.secure_url
                        }
                       },
                       "features": [
                            {
                             "type": "WEB_DETECTION"
                            }
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
                        var res = detect.pagesWithMatchingImages.slice(0,5)
                        var desc = ""
                        for (var i = 0; i < res.length; i++) {
                            desc += "["+res[i].pageTitle.replace(/<[^>]+>/g, '')+"]("+res[i].url+")\n"
                        }
                        embed.setDescription(desc)
                        msg.channel.send(embed).then().catch(function(error){console.error(error)})
                    } else cb("I couldn't understand that image!")
                    cloudinary.uploader.destroy(rand, function(result) {  });
                });
          },
          {public_id: rand}
        )
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
        var rand = Math.random().toString(36).substring(4)
        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
            function(result) { 
                if (result.error) {
                    cb("No image found at that url!")
                    return
                }
                var opts = {
                    "requests": [{
                       "image": {
                        "source": {
                         "imageUri": result.secure_url
                        }
                       },
                       "features": [
                            {
                             "type": "WEB_DETECTION"
                            }
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
                    cloudinary.uploader.destroy(rand, function(result) {  });
                });
          },
          {public_id: rand}
        )
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
        var rand = Math.random().toString(36).substring(4)
        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
            function(result) { 
                if (result.error) {
                    cb("No image found at that url!")
                    return
                }
                var opts = {
                    "requests": [{
                       "image": {
                        "source": {
                         "imageUri": result.secure_url
                        }
                       },
                       "features": [
                            {
                             "type": "WEB_DETECTION"
                            }
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
                        var mirror = res[0].url;
                        embed.setImage(mirror)
                        msg.channel.send(embed).then().catch(function(error){console.error(error)})
                    } else cb("I couldn't understand that image!")
                    cloudinary.uploader.destroy(rand, function(result) {  });
                });
          },
          {public_id: rand}
        )
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
    
    self.read = (msg, ctx, config, cb) => {
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url
        }
        if (!ctx) {
            cb(msg.author.toString() + " Please include an image url!")
            return
        }
        var rand = Math.random().toString(36).substring(4)
        cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
            function(result) { 
                if (result.error) {
                    cb("No image found at that url!")
                    return
                }
                var opts = {
                    "requests": [{
                       "image": {
                        "source": {
                         "imageUri": result.secure_url
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
                    cloudinary.uploader.destroy(rand, function(result) {  });
                });
          },
          {public_id: rand}
        )
    }
    
    self.number = (msg, ctx, config, cb) => {
        if (ctx) {
            request.get({
                url: "http://numbersapi.com/"+ctx+"/trivia?notfound=floor&fragment"
            }, function(err, res, body) {
                if (err || isNaN(ctx) || (body && body.startsWith("<"))) {
                    msg.reply("Imagine not knowing what a number is.") 
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setTitle(ctx)
                embed.setDescription(body)
                msg.channel.send(embed)
            })
        } else msg.reply("you ok there buddy?")
    }
    
    self.gif = (msg, ctx, config, cb) => {
        if (!ctx) {
            cb("Please include a gif to search for!")
            return
        }
        request.get(
        {
            url: "https://api.tenor.com/v1/search?q="+ctx+"&key="+process.env.TENOR_KEY+"&pos=0&limit=1"
        },
        function (err, res, body) {
            if (err) {
                console.error(err)
                return
            }
            var content = JSON.parse(body)
            var gifs = content.results
            //console.log(gifs)
            
            var embed = new Discord.RichEmbed()
            embed.setTitle("🔹️ "+ctx)
            embed.setImage(gifs[0].media[0].gif.url)
            embed.setFooter("1")
            embed.setURL(gifs[0].url)
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
            
            msg.channel.send(embed).then(function(emb) {
                emb.react("⏹").then(function() {
                    emb.react("⬅").then(function() {
                        emb.react("➡").then(function() {
                        })
                    })
                })
            })
            
        })
    }
    
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    self.scp = (msg, ctx, config, cb, count) => {
        if (!count) count = 0
        if (!ctx || ctx.toLowerCase() === "random") {
            ctx = getRandomInt(0, 4999)
            if (ctx < 10) ctx = "00"+ctx
            else if (ctx < 100) ctx = "0"+ctx
        }
        var short = "scp-"+ctx
     
        // Promise interface
        scrapeIt("http://www.scp-wiki.net/"+short, {
          text: "p",
          image: {
            selector: ".scp-image-block .image",
            closest: "img",
            attr: "src"
          }
        }).then(({ data, response }) => {
            if ( response.statusCode !== 200) {
                if (count <= 10) self.scp(msg, "random", config, cb, count+1)
                return
            }
            console.log(`Status Code: ${response.statusCode}`)
            var text = data.text
            
            var title = text.slice(text.indexOf("Item #:"),text.indexOf("Object Class:"))
            var classname = text.slice(text.indexOf("Object Class:")+14, text.indexOf("Special Containment Procedures:"))
            var description = text.slice(text.indexOf("Description:")+12, text.indexOf("Reference:"))
            description = description.slice(0,500)
            
            var embed = new Discord.RichEmbed()
            embed.setTitle(title)
            embed.setThumbnail(data.image)
            embed.addField("Class",classname)
            embed.setURL("http://www.scp-wiki.net/"+short)
            if (description.endsWith(".")) {
                embed.addField("Description",description)
            }
            else embed.addField("Description",description+"...")
            msg.channel.send(embed).catch(console.error)
        })
    }
    
    self.wikipedia = (msg, ctx, config, cb, count) => {
        if (!ctx) {
            cb("Please include a search parameter!")
            return
        }
        var short = ctx.replace(" ","_")
        request.get(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${short}&profile=fast-fuzzy&limit=2&namespace=*&format=json`
        ,function(req, res) {
        	var contents = JSON.parse(res.body)
        	if (contents[1].length == 0 || contents[2].length == 0) {
        	    cb("I don't know what that is!")
        		return
        	}
        	console.log(contents)
        	var index = 0
        	if (contents[2][0].includes("refer to:") || contents[2][0].includes("refers to:") || !contents[2][0]) {
        		index = 1
        	}
        	var title = contents[1][index],
        	insert = contents[2][index],
        	url = contents[3][index]
        	
        	var embed = new Discord.RichEmbed()
        	embed.setTitle(title)
        	embed.setDescription(insert)
        	embed.setURL(url)
        	
            msg.channel.send(embed).catch(console.error)
        })
    }
    
    self.kym = (msg, ctx, config, cb, count) => {
        if (!ctx || !ctx.trim()) return
        if (ctx.trim().toLowerCase() === "random") {
            nodeyourmeme.random().then(res=> {
                var embed = new Discord.RichEmbed()
                embed.setTitle(res.name)
                embed.setDescription(res.about)
                msg.channel.send(embed).catch(console.error)
            }).catch(console.error);
            return
        }
        nodeyourmeme.search(ctx).then(res=> {
            var embed = new Discord.RichEmbed()
            embed.setTitle(res.name)
            embed.setDescription(res.about)
                msg.channel.send(embed).catch(console.error)
        }).catch(()=> {
            cb("im normie?")
        })
    }
    
    self.query = (msg, ctx, config, cb, count) => {
    
        if (!ctx || !ctx.trim()) {
            cb("Please provide a query parameter!")
            return
        }    
        
        var query = ctx
        
        googleTrends.relatedQueries({keyword: query})
        .then(function(res) {
        	res = JSON.parse(res)
        	var topics = res.default.rankedList[0].rankedKeyword
        	
        	topics = topics.map(e => e.query).slice(0,5)
        	topics = topics.filter((item,index,self) => item !== query.toLowerCase() && self.indexOf(item)==index);
        	
        	var embed = new Discord.RichEmbed()
        	embed.setTitle(query)
        	return embed.setDescription(topics.join(", "))
        }).then(embed => {
        	return googleTrends.interestOverTime({keyword: query})
        	.then(function(res) {
        		res = JSON.parse(res)
        		var times = res.default.timelineData
        		var peak = times.find(t => t.value[0] == 100)
        		
        		return embed.addField("Peak", peak ? peak.formattedAxisTime : "n/a")
        	})
        }).then(function(embed) {
        	return googleTrends.interestByRegion({keyword: query})
        	.then(function(res) {
        		res = JSON.parse(res)
        		var regions = res.default.geoMapData
        		
        		regions = regions.sort(function(a, b) {
        			return b.value[0]- a.value[0]
        		}).slice(0,5)
        		regions = regions.map(e => (e.value[0] == 0) ? "" : `**${e.value[0]}%** ${e.geoName}` ).slice(0,5)
        		
        		return embed.addField("Interest", regions.join("\n").trim() || "n/a")
        	})
        }).then(embed => {
        	msg.channel.send(embed).catch(console.error)
        })
        .catch(function(err){
          console.error(err);
        });
    }
    
    self.userinfo = (msg, ctx, config, cb) => {
        if (!ctx || !ctx.trim()) ctx == msg.member.toString()
        var members = msg.guild.members
        var m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.startsWith(ctx))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || (m.nickname && m.nickname.toLowerCase().startsWith(m.nickname.toLowerCase())) )
        if (m) {
            var embed = new Discord.RichEmbed()
            embed.setDescription(m.toString())
            embed.setAuthor(m.user.tag, m.user.avatarURL)
            embed.setThumbnail(m.user.avatarURL)
            embed.setColor(m.displayColor)
            embed.setTimestamp()
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            };
            embed.addField("Joined", m.joinedAt.toLocaleDateString("en-US", options))
            embed.addField("Created", m.user.createdAt.toLocaleDateString("en-US", options))
            var roles = m.roles.array()
            var role_list = ""
            for (var i = 0; i < roles.length; i++) {
                role_list += roles[i].toString() + " "
            }
            embed.addField("Roles", role_list ? role_list : "None")
            embed.setFooter("ID: " + m.id)
            msg.channel.send(embed)
        }
        else cb("<:red_x:520403429835800576> Couldn't find that user!")
    }
    
    self.roleinfo = (msg, ctx, config, cb) => {
        var members = msg.guild.roles
        var r = members.find(r => r.toString() === ctx || r.id === ctx || r.name.startsWith(ctx))
        if (!r) r = members.find(r => r.toString() === ctx || r.id === ctx || r.name.toLowerCase().startsWith(ctx.toLowerCase()))
        if (r) {
            var embed = new Discord.RichEmbed()
            embed.setDescription(r.toString())
            embed.setColor(r.hexColor)
            embed.setTimestamp()
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            };
            embed.addField("Position", r.position)
            embed.addField("Members", r.members.size, true)
            
            embed.addField("Mention", "`"+r.toString()+"`")
            embed.addField("Mentionable", r.mentionable, true)
            
            embed.addField("Hoisted", r.hoist)
            
            embed.addField("Created", r.createdAt.toLocaleDateString("en-US", options))
            embed.setFooter("ID: " + r.id)
            msg.channel.send(embed)
        }
        else cb("<:red_x:520403429835800576> Couldn't find that role!")
    }
    
    self.userinfo = (msg, ctx, config, cb) => {
        if (!ctx || !ctx.trim()) ctx = msg.member.toString()
        var members = msg.guild.members
        var m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.startsWith(ctx))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || (m.nickname && m.nickname.toLowerCase().startsWith(m.nickname.toLowerCase())) )
        if (m) {
            var embed = new Discord.RichEmbed()
            embed.setDescription(m.toString())
            embed.setAuthor(m.user.tag, m.user.avatarURL)
            embed.setThumbnail(m.user.avatarURL)
            embed.setColor(m.displayColor)
            embed.setTimestamp()
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            };
            embed.addField("Joined", m.joinedAt.toLocaleDateString("en-US", options))
            embed.addField("Created", m.user.createdAt.toLocaleDateString("en-US", options))
            var roles = m.roles.array()
            var role_list = ""
            for (var i = 0; i < roles.length; i++) {
                role_list += roles[i].toString() + " "
            }
            embed.addField("Roles", role_list ? role_list : "None")
            embed.setFooter("ID: " + m.id)
            msg.channel.send(embed)
        }
        else cb("<:red_x:520403429835800576> Couldn't find that user!")
    }
    
    self.avatar = (msg, ctx, config, cb) => {
        if (!ctx || !ctx.trim()) ctx = msg.member.toString()
        var members = msg.guild.members
        var m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.startsWith(ctx))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || (m.nickname && m.nickname.toLowerCase().startsWith(m.nickname.toLowerCase())) )
        if (m) {
            var embed = new Discord.RichEmbed()
            embed.setAuthor(m.user.tag, m.user.avatarURL)
            embed.setImage(m.user.avatarURL)
            embed.setURL(m.user.avatarURL)
            msg.channel.send(embed).catch(console.error)
        }
        else cb("<:red_x:520403429835800576> Couldn't find that user!")
    }
}
module.exports = Cosmetic