

const memeLib = require('nodejs-meme-generator');
const memeGenerator = new memeLib();
var fs = require("fs")
const dogeify = require('dogeify-js');

var Cosmetic = function(perspective, translate, client, Discord) {
    /*C O S M E T I C
    usable by anyone*/
    var self = this
    
    const About = require("./about.js")
    const kiosk = new About(Discord)
    
    self.about = function(msg, ctx, config, cb) {
        if (kiosk[ctx]) {
            kiosk[ctx](msg, config, cb)
        }
        else cb(msg.author.toString() + " Try *@Ohtred about [topic]*```topics - setup|usage|server|voting|automod|embassy|stats|invite|credits|support```")
    }
    
    self.roleinfo = function(msg, ctx, config, cb) {
        
    }
    
    self.paterico = function(msg, ctx, config, cb) {
        var paterico_guild = client.guilds.find(function(g) { return g.id == 509166690060337174 })
        if (paterico_guild) {
        var patericos = paterico_guild.emojis.array()
        var emote = patericos[Math.floor(Math.random()*patericos.length)];
        msg.channel.send(emote.toString())
        } else msg.reply("cut the powerlines")
    }
    
    self.analyze = function(msg, ctx, config, cb) {
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
    
    self.translate = function(msg, ctx, config, cb) { //todo: add link to Yandex here
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
    
    self.doge = function(msg, ctx, config, cb) {
        cb(null,"<:doge:522630325990457344> " + dogeify(ctx.toLowerCase().replace(/@everyone/g,"").replace(/@here/g,"").replace(/@/g,"")))
    }
    
    self.check_guild = function(msg, ctx, config, cb) {
        var found = client.guilds.find(function(g) { return g.id == ctx })
        if (found) msg.reply("Found!")
        else msg.reply("Not found!")
    }
    
    //mingus whingus
    self.meme = function(msg, ctx, config, cb) {
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
}
module.exports = Cosmetic