/*SERVER.JS HELPER API
    Parses reactions and commandss
*/

//util
var util = require('./util')

var Cosmetic = require('./helpers/cosmetic.js')
var Func = require('./helpers/func.js')
var Manage = require('./helpers/manage.js')
var Set = require('./helpers/set.js')

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

var translate = require('yandex-translate')(process.env.YANDEX_KEY);

var Helper = function(db, Discord, client, perspective) {
    
    var self = this
    
    self.cosmetic = new Cosmetic(perspective, translate, client, Discord) //anyone can use
    self.func = new Func(Discord) //approved users can use (proposing etc)
    self.manage = new Manage(db, client, Discord) //management commands like muting etc
    self.set = new Set(db, client, Discord) //admin commands for the democracy system
    
    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    //R E A C T I O N S
    self.react = {}
    
    self.react.upvote = function(reaction, user, config) { //called when passed. TODO: move #vote comparison to here
        console.log(reaction.message.embeds[0].title+" '"+reaction.message.embeds[0].description+"' was passed")
        reaction.message.react('✅');
        
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (ch !== null) {
            var old = reaction.message.embeds[0];
            var embed = new Discord.RichEmbed()
            
            embed.setTitle("✅ **PASSED** ✅")
            embed.setAuthor(old.author.name, old.author.iconURL)
            embed.setDescription(old.description)
            embed.setFooter(old.footer.text)
            embed.setColor('GREEN')
            embed.setTimestamp(new Date(old.timestamp).toString())
            ch.send({embed}).catch( function(error) { console.error(error) } )
            embed.setTitle(old.title + " | **CONCLUDED**")
            reaction.message.edit({embed})
        }
        else {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@Ohtred config modannounce [channel]```"
            )
        }
    }
    
    self.react.downvote = function(reaction, user, config) {
        console.log(reaction.message.embeds[0].title+" '"+reaction.message.embeds[0].description+"' was rejected")
        reaction.message.react('❌');
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (ch !== null) {
            var old = reaction.message.embeds[0];
            var embed = new Discord.RichEmbed()
            
            embed.setTitle("❌ **FAILED** ❌")
            embed.setAuthor(old.author.name, old.author.iconURL)
            embed.setDescription(old.description)
            embed.setFooter(old.footer.text)
            embed.setColor('RED')
            embed.setTimestamp(new Date(old.timestamp).toString())
            ch.send({embed}).catch( function(error) { console.error(error) } )
            embed.setTitle(old.title+" | **CONCLUDED**")
            reaction.message.edit({embed})
        }
        else {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@Ohtred config modannounce [channel]```"
            )
        }
    }
    
    self.react.report = function(reaction, user, config) {
        var content = reaction.message.content;
        reaction.message.react('❌');
        var report_channel = util.getChannel(reaction.message.guild.channels, config.channels.reportlog)
        if (report_channel) { //if report channel exists
            
            const embed = new Discord.RichEmbed()
            embed.setTitle("**User Report**")
            embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
            embed.setDescription(content)
            embed.setTimestamp()
            
            var request = require('request');
                    
            reaction.fetchUsers().then(function(val) {
                var users = val.array()
                var replist = "**Reporters: **"
                for (var i = 0; i < users.length; i++) {
                    console.log(users[i].id)
                    replist += "<@" + users[i].id + ">" + " "
                }
                
                 //CHECK IF THERE'S AN IMAGE ATTACHMENT ABOUT TO BE DELETED
                if (reaction.message.attachments.size > 0) {
                    var rand_id = Math.random().toString(36).substring(4)
                    
                    cloudinary.uploader.upload(reaction.message.attachments.array()[0].url, //upload the image to cloudinary 
                      function(result) { 
                          console.log(result)
                        embed.setDescription(content + " " + result.url) 
                        self.report(reaction,embed,replist,report_channel,config)
                      },
                      {public_id: rand_id}
                    )
                }
                
                //NO IMAGE ATTACHMENT
                else {
                    self.report(reaction,embed,replist,report_channel,config)
                }
            })
        }
    }
    
    self.report = function(reaction, embed, replist, report_channel, config) {
        report_channel.send({embed}).then(function() { 
            report_channel.send(replist).catch( function(error) { console.error(error) } )
            report_channel.send("@here check " + reaction.message.channel.toString()).catch( function(error) { console.error(error) } )
            
            if (!reaction.message.member.mute) { //if he's already muted don't remute... keep timer integrity
                reaction.message.member.setMute(true, "Automatically muted by report")
                    setTimeout(function() {
                        console.log(reaction.message.member.nickname + " was auto-unmuted")
                        reaction.message.member.setMute(false)
                    }, config.report_time * 1000)
            }
            
            reaction.message.channel.send(reaction.message.author.toString() + " just got report-muted for " + (config.report_time) + " seconds").catch( function(error) { console.error(error) } )
            reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch( function(error) { console.error(error) } )
        }).catch( function(error) { console.error(error) } )
    }
    
    self.react.plebvote = function(reaction, user, config) {
        var content = reaction.message.content;
        var upvotes = reaction.count;
        console.log("Petition passed: "+content);
        var ch = util.getChannel(reaction.message.guild.channels, config.channels.modvoting);
        reaction.message.react('✅');
        if (ch !== null) {
            var prop_id = Math.random().toString(36).substring(5);
            const embed = new Discord.RichEmbed()
            
            embed.setTitle(".:: 𝐏𝐄𝐓𝐈𝐓𝐈𝐎𝐍")
            embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
            
            if (reaction.message.attachments.size > 0) {
                console.log("Image attached")
                embed.setDescription(content + "\n" + reaction.message.attachments.array()[0].url)
            }
            else {
                console.log("No image attached")
                embed.setDescription(content)
            }
            
            embed.setFooter(prop_id)
            embed.setTimestamp()
            ch.send({embed}).catch( function(error) { console.error(error) } )
        }
        else {
            reaction.message.reply(
                "The modvoting channel could not be found. Follow this syntax:"
                +"```@Ohtred config modvoting [channel]```"
            )
        }
    }
    
    self.monitor = function(msg) {
        var topic = msg.channel.topic
        topic = topic.replace("📕", ":closed_book:")
                     .replace("❗",":exclamation:")
        var terms = ["SEVERE_TOXICITY", "INCOHERENT", "SEXUALLY_EXPLICIT", "IDENTITY_ATTACK"]
        var emojis = [":closed_book:",":green_book:",":blue_book:",":orange_book:"]
        
        var req = []
        for (var i = 0; i < emojis.length; i++) {
            if ( topic.includes(emojis[i]) ) req.push( terms[i] )
        }
        if (req.length > 0) {
            (async function() {
                try {
                    //var thresh = topic.includes(":exclamation:") ? 75 : 95 //two options for threshold, exclamation mark makes it more sensitive
                    var thresh = 95
                    const result = await perspective.analyze(msg.cleanContent, {attributes: req});
                    
                    var hit = false //if at least one metric hits the threshold
                    var desc = msg.author.toString() + " in " + msg.channel.toString() +  "```" + msg.cleanContent + "```" 
                    
                    for (var i = 0; i < req.length; i++) {
                        var score = Math.round(result.attributeScores[req[i]].summaryScore.value * 100)
                        if (score >= thresh) hit = true  
                        desc += "\n" + emojis[terms.indexOf(req[i])] + "  **" + score + "%**  " + terms[terms.indexOf(req[i])] + "\n"
                    }
                    
                    const embed = new Discord.RichEmbed()
                    embed.setTitle("**Cringe Detected** \n" + msg.url)
                    embed.setDescription(desc)
                    embed.setTimestamp()
                    
                    var config = db[msg.guild.id]
                    if (hit && config) {
                        var ch = util.getChannel(msg.guild.channels, config.channels.reportlog);
                        if (ch) { 
                            ch.send({embed}).catch( function(error) { console.error(error) } )
                        }
                        if (topic.includes(":exclamation:")) {
                            ch.send("@here")
                        }
                    }
                }
                catch(error) {  }
            })()
        }
    }
    
}

module.exports = Helper