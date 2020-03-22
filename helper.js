/*SERVER.JS HELPER API
    Parses reactions and commands
    Lazy APIs and async
*/
/* jshint undef: true, unused: true, asi : true, esversion: 6 */

//util
var util = require('./util')
var Discord = require('discord.js')

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

const base64_request = require('request-promise-native').defaults({
  encoding: 'base64',
  gzip: true
})

var path = require('path')

const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g


//Q: why is it here instead of in cosmetic.js or knowledge.js?
//A: i may implement auto-translate later.
var translate = require('yandex-translate')(process.env.YANDEX_KEY);

var Helper = function(API, client, perspective, dbl) {
    
    var self = this
    
    self.cosmetic = new Cosmetic(API, perspective, translate, client, cloudinary, dbl) //anyone can use
    self.func = new Func(API) //approved users can use (proposing etc)
    self.manage = new Manage(API, client) //management commands like muting etc
    self.set = new Set(API, client) //admin commands for the democracy system
    
    self.help = function(msg) {
        var embed = new Discord.MessageEmbed()
        
        embed.setTitle("Help")
        
        //embed.setThumbnail("https://cdn.discordapp.com/avatars/528809041032511498/b2ca30fc7ba1b3a94c3427e99aac33ff.png?size=2048")
        embed.setThumbnail("https://cdn.discordapp.com/attachments/457776625975689229/682380304098394112/danieldan_whiskers.png")
        
        embed.addField("@whiskers about setup", "for all set-up/config commands")
        embed.addField("@whiskers about text", "for all text-based commands")
        embed.addField("@whiskers about image", "for all image-based commands")
        embed.addField("@whiskers about management", "for all management commands (kick/ban/mute etc.)")
        embed.addField("@whiskers about voting", "to learn about how whiskers's voting system works")
        embed.addField("@whiskers about verification", "to learn how to set up lockdown and verification")
        embed.addField("@whiskers about embassy", "to learn how to set up inter-server channels")
        embed.addField("@whiskers about [automod|stats|invite|support]", "other miscellaneous options")
        embed.addField("@whiskers settings", "to see the current server settings")
        embed.addField("Support Server", "https://discord.gg/HnGmt3T")
        //embed.addField("If whiskers's been helpful, please give him an upvote!", "https://discordbots.org/bot/528809041032511498")
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
        
        var embed = new Discord.MessageEmbed()
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
    
    self.react.passProposal = function(reaction, user, config) { //called when passed. TODO: move #vote comparison to here
        console.log(reaction.message.embeds[0].title+" '"+reaction.message.embeds[0].description+"' was passed")
        reaction.message.react('✅');
        
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (!ch) {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@whiskers channel modannounce [channel]```"
            )
            return
        }
        var old = reaction.message.embeds[0];
        var embed = new Discord.MessageEmbed()
        
        embed.setTitle("**PASSED**")
        embed.setThumbnail("https://cdn.discordapp.com/emojis/520403429479153674.png?v=1")
        
        embed.setAuthor(old.author.name, old.author.iconURL)
        embed.setDescription(old.description)
        embed.setFooter(old.footer.text)
        embed.setColor('GREEN')
        //embed.setURL(reaction.message.url)
        
        embed.setTimestamp(new Date(old.timestamp).toString())
        if (!old.description.includes("🙈")) {
            ch.send(embed)
            .then(function(em) {
                embed.setTitle(old.title + " | **CONCLUDED**")
                //embed.setURL(em.url)
                reaction.message.edit(embed)
            })
            .catch( function(error) { console.error(error) } )
        }
        else {
            embed.setTitle(old.title + " | **CONCLUDED**")
            reaction.message.edit(embed)
        }
    }
    
    self.react.rejectProposal = function(reaction, user, config) {
        console.log(reaction.message.embeds[0].title+" '"+reaction.message.embeds[0].description+"' was rejected")
        reaction.message.react('❌');
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (!ch) {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@whiskers config modannounce [channel]```"
            )
            return
        }
        var old = reaction.message.embeds[0];
        var embed = new Discord.MessageEmbed()
        
        embed.setTitle("**FAILED**")
        embed.setThumbnail("https://cdn.discordapp.com/emojis/520403429835800576.png?v=1")
        
        embed.setAuthor(old.author.name, old.author.iconURL)
        embed.setDescription(old.description)
        embed.setFooter(old.footer.text)
        embed.setColor('RED')
        embed.setTimestamp(new Date(old.timestamp).toString())
        if (!old.description.includes("🙈")) {
            ch.send(embed)
            .then(function(em) {
                embed.setTitle(old.title + " | **CONCLUDED**")
                //embed.setURL(em.url)
                reaction.message.edit(embed)
            })
            .catch( function(error) { console.error(error) } )
        }
        else {
            embed.setTitle(old.title + " | **CONCLUDED**")
            reaction.message.edit(embed)
        }
    }
    
    self.react.progressPetition = function(reaction, user, config) {
        
        var content = reaction.message.content;
        var upvotes = reaction.count;
        console.log("Petition passed: "+content);
        var ch = util.getChannel(reaction.message.guild.channels, config.channels.modvoting);
        if (ch == null) {
            reaction.message.reply(
                "The modvoting channel could not be found. Follow this syntax:"
                +"```@whiskers config modvoting [channel]```"
            )
            return
        }
        reaction.message.delete().then(msg => {
            var embed = new Discord.MessageEmbed()
            embed.setTitle("Petition Progressed")
            
            //embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({format:'png', size:2048, dynamic:true}))
            embed.setDescription(msg.content.slice(0,2056))
            embed.setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/233/ballot-box-with-ballot_1f5f3.png")
            
            embed.setFooter(msg.author.tag)
            
            //embed.setTimestamp()
            
            msg.channel.send(embed)
            
        }).catch(console.error)
        //reaction.message.react('✅');
        var prop_id = Math.random().toString(36).substring(5);
        const embed = new Discord.MessageEmbed()
        
        embed.setTitle(".:: **PETITION**")
        embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL({format:'png', size:2048, dynamic:true}))
        
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
    
    self.react.report = function(reaction, user, config) {
        var content = reaction.message.content;
        reaction.message.react('❌');
        var report_channel = util.getChannel(reaction.message.guild.channels, config.channels.reportlog)
        
        if (!report_channel) return
        
        const embed = new Discord.MessageEmbed()
        embed.setTitle("**User Report**")
        embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL({format:'png', size:2048, dynamic:true}))
        embed.setDescription(content)
        embed.setTimestamp()
        
        var request = require('request');
                
        reaction.users.fetch().then(function(val) {
            var users = val.array()
            var replist = "**Reporters: **"
            for (var i = 0; i < users.length; i++) {
                console.log(users[i].id)
                replist += "<@" + users[i].id + ">" + " "
            }
            
            if (reaction.message.attachments.size == 0) { //no image attach
                self.report(reaction,embed,replist,null,report_channel,config)
                return;
            }
            //image attach
            //var rand_id = Math.random().toString(36).substring(4)
            
            //cloudinary.uploader.upload(reaction.message.attachments.array()[0].url, //upload the image to cloudinary 
            //  function(result) { 
            //      console.log(result)
            
            var url = reaction.message.attachments.array()[0].url
            
            embed.setDescription(content + '\n*-- message attachment below --*')
            
            self.report(reaction,embed,replist,url,report_channel,config)
            //  },
            //  {public_id: rand_id}
            //)
        })
    }
    
    self.react.poll = function(reaction, user, config) {
        
        var options = reaction.message.embeds[0].fields[0].value.split(" ")
        
        var allReactions = reaction.message.reactions.cache.array()
        
        var voteReact
        var existingVote = options.find( (o) => {
            
            //checks if it isnt the newest vote
            if (o == reaction.emoji.name || o == reaction.emoji.toString()) return false
            
            //equivalent emote in reactions from among possible options
            var equiv = allReactions.find( (r) => {
                return r.emoji.name == o || r.emoji.toString() == o
            })
            if (equiv && equiv.users.array().find(u => u.id == user.id)) {
                voteReact = equiv
                return true
            }
            return false
        })
        
        if (existingVote) {
            //console.log(voteReact)
            voteReact.remove(user.id)
        }
        
        if (reaction.emoji.toString() !== "➡️") return
        
        var results = options.map( (o) => {
            var equiv = allReactions.find( (r) => {
                return r.emoji.name == o || r.emoji.toString() == o
            })
            return {emote: o, count: equiv.count-1}
        }).sort( (a, b) => b.count - a.count )
    
        var old = reaction.message.embeds[0];
        var embed = new Discord.MessageEmbed()
        
        embed.setTitle(old.title.replace("**POLL :: **", "**CONCLUDED :: **"))
        embed.setDescription(old.description)
        
        for (var i = 0; i < results.length; i++) {
            embed.addField(`${results[i].count} votes`, results[i].emote)
        }
        embed.setColor('BLUE')
        
        //base image for chart
        var chartURL = "https://image-charts.com/chart?chs=300x300&cht=p&chf=bg,s,36393f" //0,FF00FF,13|1,FF0000
        
        var resNames = results.map( (r) => {
            if (!r.emote.match(emojiRegex) && r.emote.split(":").length - 1 == 2) {
                return r.emote.slice(r.emote.indexOf(":")+1,r.emote.lastIndexOf(":"))
            }
            return r.emote
            
        }).join("|")
        
        chartURL += "&chl=" + resNames
        chartURL += "&chd=t:" + results.map(r => r.count).join(",")
        
        embed.setImage(chartURL)
        
        embed.setColor('BLUE')
        embed.setTimestamp(new Date(old.timestamp).toString())
        //embed.setURL(reaction.message.url)
        reaction.message.edit(embed)
    }
    
    
    
    self.report = function(reaction, embed, replist, url, report_channel, config) {
        report_channel.send(embed).then(function() { 
            
            if (url) { //attachment
                
                report_channel.send({
                   files: [{
                      attachment: url,
                      name: "SPOILER_FILE" + path.extname(url)
                   }]
                }).then(function() {
                    report_channel.send(replist).catch( function(error) { console.error(error) } )
                    report_channel.send("@here check " + reaction.message.channel.toString()).catch( function(error) { console.error(error) } )
                    
                    if (!reaction.message.member.mute) { //if he's already muted don't remute... keep timer integrity
                        reaction.message.channel.send("!mute <@"+reaction.message.member.id+"> "+config.report_time)
                    }
                    
                    //reaction.message.channel.send(reaction.message.author.toString() + " just got report-muted for " + (config.report_time) + " seconds").catch( function(error) { console.error(error) } )
                    reaction.message.delete().then(msg=>console.log("Democracy-report succesfully deleted")).catch( function(error) { console.error(error) } )
                })
            }
            else {
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
            }
        }).catch( function(error) { console.error(error) } )
    }
    
    self.monitor = function(msg, config) {
         /*"❗ makes whiskers ping the mods alongside auto-report"+
           ❌ makes whiskers auto-delete the message as well
           👮 makes whiskers warn the user when reported*/
        
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
                
                const embed = new Discord.MessageEmbed()
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