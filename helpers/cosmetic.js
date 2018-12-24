

const memeLib = require('nodejs-meme-generator');
const memeGenerator = new memeLib();
var fs = require("fs")
const dogeify = require('dogeify-js');
//const pd = require('paralleldots');
var request = require('request');
//pd.apiKey = process.env.PD_KEY;
var natural = require('natural');
            const scrapeIt = require("scrape-it")

var Cosmetic = function(perspective, translate, client, Discord, cloudinary) {
    /*C O S M E T I C
    usable by anyone*/
    var self = this
    
    const About = require("./about.js")
    const kiosk = new About(Discord, client)
    
    self.about = (msg, ctx, config, cb) => {
        if (kiosk[ctx]) {
            kiosk[ctx](msg, config, cb)
        }
        else cb(msg.author.toString() + " Try *@Ohtred about [topic]*```topics - setup|usage|server|voting|automod|embassy|stats|invite|credits|support```")
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
    
    self.translate = (msg, ctx, config, cb) => { //todo: add link to Yandex here
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("<:red_x:520403429835800576> Yandex Error: " + err)
              else if (res.text) {
                  var embed = new Discord.RichEmbed()
                  embed.setTitle(params[0].toLowerCase()+ " || " + params[1].substring(0,100))
                  embed.setDescription(res.text)
                  msg.channel.send({embed}).then().catch(function(error){console.error(error)})
              }
              else cb("<:red_x:520403429835800576> " + msg.author.toString() + " language not recognized.\nHere's the full list: https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages")
            });
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please specify a target language and message.")
    }
    
    self.translate_raw = (msg, ctx, config, cb) => {
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("<:red_x:520403429835800576> Yandex Error: " + err)
              else if (res.text) {
                  msg.reply("```"+res.text+"```").then().catch(function(error){console.error(error)})
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
            msg.channel.send({embed}).then().catch(function(error){console.error(error)})
        })
        .catch((error) => {
            console.log(error)
            cb("Couldn't process that image!")
        })
    }
    */
    
    //TODO: Modularize and implement interface for Google Cloud Vision
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
                    embed.setTitle("Describe")
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
                    msg.channel.send({embed}).then().catch(function(error){console.error(error)})
                    cloudinary.uploader.destroy(rand, function(result) { console.log(result) });
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
                        msg.channel.send({embed}).then().catch(function(error){console.error(error)})
                    } else cb("I couldn't understand that image!")
                    cloudinary.uploader.destroy(rand, function(result) { console.log(result) });
                });
          },
          {public_id: rand}
        )
    }
    
    self.scrape = (msg, ctx, config, cb) => {
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
                        msg.channel.send({embed}).then().catch(function(error){console.error(error)})
                    } else cb("I couldn't understand that image!")
                    cloudinary.uploader.destroy(rand, function(result) { console.log(result) });
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
                    embed.setTitle("From the Internet")
                    
                    var pa = JSON.parse(body)
                    if (pa && pa.responses && pa.responses[0] && pa.responses[0].webDetection) {
                        var detect = pa.responses[0].webDetection
                        var res = detect.visuallySimilarImages || detect.partialMatchingImages || detect.fullMatchingImages
                        var mirror = res[Math.floor(Math.random()*res.length)].url;
                        embed.setImage(mirror)
                        msg.channel.send({embed}).then().catch(function(error){console.error(error)})
                    } else cb("I couldn't understand that image!")
                    cloudinary.uploader.destroy(rand, function(result) { console.log(result) });
                });
          },
          {public_id: rand}
        )
    }
    
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
                    
                    var desc = labels[0].description
                    /*
                    embed.setDescription(desc)
                    if (!raw) {
                        msg.channel.send({embed}).then().catch(function(error){console.error(error)})
                    }*/
                    msg.reply("```"+desc+"```").then().catch(function(error){console.error(error)})
                    cloudinary.uploader.destroy(rand, function(result) { console.log(result) });
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
                msg.channel.send({embed})
            })
        } else msg.reply("you ok there buddy?")
    }
    
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    self.scp = (msg, ctx, config, cb) => {
        if (isNaN(ctx) || (ctx.length !== 3 && ctx.length !== 4)) {
            msg.reply("Please supply a valid 3-4 digit number!")
            return
        }
        else if (ctx.toLowerCase() === "random") {
            ctx = getRandomInt(0, 4999)
            if (ctx < 10) ctx = "00"+ctx
            else if (ctx < 100) ctx = "0"+ctx
        }
        var short = "scp-"+ctx
     
        // Promise interface
        scrapeIt("http://www.scp-wiki.net/"+short, {
          text: "p",
          image: {
              selector: ".image img",
              attr: "src"
            }
        }).then(({ data, response }) => {
            if ( response.statusCode !== 200) {
                cb("Couldn't find the SCP-"+ctx)
                return
            }
            console.log(`Status Code: ${response.statusCode}`)
            var text = data.text
            
            var title = text.slice(text.indexOf("Item #:")+8,text.indexOf("Object Class:"))
            var classname = text.slice(text.indexOf("Object Class:")+14, text.indexOf("Special Containment Procedures:"))
            var description = text.slice(text.indexOf("Description:")+12, text.indexOf("Reference:"))
            
            var embed = new Discord.RichEmbed()
            embed.setTitle(title)
            embed.setThumbnail(data.image)
            embed.addField("Class",classname)
            embed.addField("Description",description)
            embed.setFooter("[More on "+title+"](http://www.scp-wiki.net/"+short+")")
            msg.channel.send({embed})
        })
    }
}
module.exports = Cosmetic