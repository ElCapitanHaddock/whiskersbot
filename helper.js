/*SERVER.JS HELPER API
    Parses reactions and commands
    Lazy APIs and async
*/
/* jshint undef: true, unused: true, asi : true, esversion: 6 */

//util
var util = require('./util')

var Cosmetic = require('./helpers/cosmetic.js')
var Func = require('./helpers/func.js')
var Manage = require('./helpers/manage.js')
var Set = require('./helpers/set.js')

var request = require('request')
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

var translate = require('yandex-translate')(process.env.YANDEX_KEY);

var Helper = function(API, Discord, client, perspective, dbl) {
    
    var self = this
    
    self.cosmetic = new Cosmetic(perspective, translate, client, Discord, cloudinary, dbl) //anyone can use
    self.func = new Func(Discord) //approved users can use (proposing etc)
    self.manage = new Manage(API, client, Discord) //management commands like muting etc
    self.set = new Set(API, client, Discord) //admin commands for the democracy system
    
    self.help = function(msg) {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Help")
        embed.addField("@Ohtred about setup", "to set-up all the components you need before usage")
        embed.addField("@Ohtred about usage", "once you have all the components set up")
        embed.addField("@Ohtred about management", "if you want to use Ohtred as a Dyno clone ;)")
        embed.addField("@Ohtred about voting", "to learn about how Ohtred's voting system works")
        embed.addField("@Ohtred about [automod|verification|embassy|stats|credits|support]", "other miscellaneous options")
        embed.addField("If Ohtred's been helpful, please give him an upvote!", "https://discordbots.org/bot/511672691028131872")
        msg.channel.send(embed)
    }
    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    //R E A C T I O N S
    self.react = {}
    
    self.react.gif = function(reaction, user, config) {
        if (user.tag != reaction.message.embeds[0].author.name) return
        
        var reactions = ["⏹","⬅","➡"]
        var i = reactions.indexOf(reaction.emoji.name)
        
        if (i == -1) {
            return
        }
        var old = reaction.message.embeds[0]
        var current = Number(old.footer.text)
        
        var embed = new Discord.RichEmbed()
        var query = old.title.replace("🔹️ ", "")
        
        if (i == 0) {
            embed.setTitle(query) //prevents further reacting
            reaction.message.clearReactions()
            reaction.message.edit(embed).catch(console.error);
            return
        }
        
        embed.setTitle(old.title)
        embed.setDescription(old.description)
        embed.setAuthor(old.author.name, old.author.iconURL)
        
        if (i == 1) {
            current -= 1
        }
        else if (i == 2) {
            current += 1
        }
        console.log(current)
        if (current <= 0) { 
            return
        }
        
        embed.setFooter(current.toString())
        request.get(
        {
            url: "https://api.tenor.com/v1/search?q="+query+"&key="+process.env.TENOR_KEY+"&pos="+(current-1)+"&limit=1"
        },
        function (err, res, body) {
            if (err) {
                console.error(err)
                return
            }
            var content = JSON.parse(body)
            var gifs = content.results
            embed.setImage(gifs[0].media[0].gif.url)
            embed.setDescription(gifs[0].url)
            reaction.message.edit(embed).catch(console.error);
        })
    }
    
    self.react.upvote = function(reaction, user, config) { //called when passed. TODO: move #vote comparison to here
        console.log(reaction.message.embeds[0].title+" '"+reaction.message.embeds[0].description+"' was passed")
        reaction.message.react('✅');
        
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (!ch) {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@Ohtred config modannounce [channel]```"
            )
            return
        }
        var old = reaction.message.embeds[0];
        var embed = new Discord.RichEmbed()
        
        embed.setTitle("✅ **PASSED** ✅")
        embed.setAuthor(old.author.name, old.author.iconURL)
        embed.setDescription(old.description)
        embed.setFooter(old.footer.text)
        embed.setColor('GREEN')
        embed.setTimestamp(new Date(old.timestamp).toString())
        if (!old.description.includes("🙈")) ch.send(embed).catch( function(error) { console.error(error) } )
        embed.setTitle(old.title + " | **CONCLUDED**")
        reaction.message.edit(embed)
    }
    
    self.react.downvote = function(reaction, user, config) {
        console.log(reaction.message.embeds[0].title+" '"+reaction.message.embeds[0].description+"' was rejected")
        reaction.message.react('❌');
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (!ch) {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@Ohtred config modannounce [channel]```"
            )
            return
        }
        var old = reaction.message.embeds[0];
        var embed = new Discord.RichEmbed()
        
        embed.setTitle("❌ **FAILED** ❌")
        embed.setAuthor(old.author.name, old.author.iconURL)
        embed.setDescription(old.description)
        embed.setFooter(old.footer.text)
        embed.setColor('RED')
        embed.setTimestamp(new Date(old.timestamp).toString())
        if (!old.description.includes("🙈")) ch.send(embed).catch( function(error) { console.error(error) } )
        embed.setTitle(old.title+" | **CONCLUDED**")
        reaction.message.edit(embed)
    }
    
    self.react.report = function(reaction, user, config) {
        var content = reaction.message.content;
        reaction.message.react('❌');
        var report_channel = util.getChannel(reaction.message.guild.channels, config.channels.reportlog)
        
        if (!report_channel) return
        
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
            
            if (reaction.message.attachments.size == 0) { //no image attach
                self.report(reaction,embed,replist,report_channel,config)
                return;
            }
            //image attach
            var rand_id = Math.random().toString(36).substring(4)
            
            cloudinary.uploader.upload(reaction.message.attachments.array()[0].url, //upload the image to cloudinary 
              function(result) { 
                  console.log(result)
                embed.setDescription(content + " " + result.url) 
                self.report(reaction,embed,replist,report_channel,config)
              },
              {public_id: rand_id}
            )
        })
    }
    
    self.react.plebvote = function(reaction, user, config) {
        var content = reaction.message.content;
        var upvotes = reaction.count;
        console.log("Petition passed: "+content);
        var ch = util.getChannel(reaction.message.guild.channels, config.channels.modvoting);
        if (ch == null) {
            reaction.message.reply(
                "The modvoting channel could not be found. Follow this syntax:"
                +"```@Ohtred config modvoting [channel]```"
            )
            return
        }
        reaction.message.react('✅');
        var prop_id = Math.random().toString(36).substring(5);
        const embed = new Discord.RichEmbed()
        
        embed.setTitle(".:: **PETITION**")
        embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
        
        if (reaction.message.attachments.size > 0) {
            embed.setDescription(content + "\n" + reaction.message.attachments.array()[0].url)
        }
        else {
            embed.setDescription(content)
        }
        
        embed.setFooter(prop_id)
        embed.setTimestamp()
        ch.send(embed).catch( function(error) { console.error(error) } )
    }
    
    self.report = function(reaction, embed, replist, report_channel, config) {
        report_channel.send(embed).then(function() { 
            report_channel.send(replist).catch( function(error) { console.error(error) } )
            report_channel.send("@here check " + reaction.message.channel.toString()).catch( function(error) { console.error(error) } )
            
            if (!reaction.message.member.mute) { //if he's already muted don't remute... keep timer integrity
                /*
                reaction.message.member.setMute(true, "Automatically muted by report").then(function() {
                    setTimeout(function(mem) {
                        console.log(mem.nickname + " was auto-unmuted")
                        mem.setMute(false)
                    }, config.report_time * 1000)
                }).catch(console.error)
                */
                reaction.message.channel.send("!mute <@"+reaction.message.member.id+"> "+config.report_time)
            }
            
            //reaction.message.channel.send(reaction.message.author.toString() + " just got report-muted for " + (config.report_time) + " seconds").catch( function(error) { console.error(error) } )
            reaction.message.delete().then(msg=>console.log("Democracy-report succesfully deleted")).catch( function(error) { console.error(error) } )
        }).catch( function(error) { console.error(error) } )
    }
    
    self.monitor = function(msg, config) {
         /*"❗ makes Ohtred ping the mods alongside auto-report"+
           ❌ makes Ohtred auto-delete the message as well
           👮 makes Ohtred warn the user when reported*/
        
        var topic = msg.channel.topic
        topic = topic.replace("📕", ":closed_book:")
        var terms = ["SEVERE_TOXICITY", "INCOHERENT", "SEXUALLY_EXPLICIT", "IDENTITY_ATTACK"]
        var emojis = [":closed_book:",":green_book:",":blue_book:",":orange_book:"]
        
        var req = []
        for (var i = 0; i < emojis.length; i++) {
            if ( topic.includes(emojis[i]) ) req.push( terms[i] )
        }
        
        if (req.length < 0 || !msg.cleanContent.trim()) return;
        
        topic = topic
            .replace("❗",":exclamation:")
            .replace("❌",":x:")
            .replace("👮",":cop:");
        (async function() {
            try {
                //console.log(topic)
                //var thresh = topic.includes(":exclamation:") ? 75 : 95 //two options for threshold, exclamation mark makes it more sensitive
                var thresh = 96
                const result = await perspective.analyze(msg.cleanContent, {attributes: req});
                
                var hit = false //if at least one metric hits the threshold
                var desc = msg.author.toString() + " in " + msg.channel.toString() +  "```" + msg.cleanContent + "```" 
                
                for (var i = 0; i < req.length; i++) {
                    var score = Math.round(result.attributeScores[req[i]].summaryScore.value * 100)
                    if (score >= thresh) hit = true  
                    desc += "\n" + emojis[terms.indexOf(req[i])] + "  **" + score + "%**  " + terms[terms.indexOf(req[i])] + "\n"
                }
                
                const embed = new Discord.RichEmbed()
                embed.setTitle("**Automod Warning** \n" + msg.url)
                embed.setDescription(desc)
                embed.setTimestamp()
                
                if (hit && config) {
                    var ch = util.getChannel(msg.guild.channels, config.channels.reportlog);
                    if (ch) {
                        if (topic.includes(":x:")) {
                            msg.delete().then(msg => {
                                console.log("Automod succesfully deleted")
                                ch.send(embed).catch( function(error) { console.error(error) } )
                            }).catch( function(error) { console.error(error) } )
                        }
                        else {
                            ch.send(embed).catch( function(error) { console.error(error) } )
                        }
                    }
                    else if (topic.includes(":x:")) {
                        msg.delete().then(msg => {
                            console.log("Automod succesfully deleted")
                        }).catch( function(error) { console.error(error) } )
                    }
                    if (topic.includes(":exclamation:")) {
                        ch.send("@here")
                    }
                    if (topic.includes(":cop:")) {
                        msg.author.send("I detected some strong language in " + msg.channel.name + "! Please be sensitive.")
                    }
                }
            }
            catch(error) { error }
        })()
    }
}

module.exports = Helper