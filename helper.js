/*SERVER.JS HELPER API
    Parses reactions and commandss
*/

//util
var util = require('./util')

var Helper = function(db, Discord, perspective) {
    
    var self = this
    self.func = {}
    
    /*C O M M A N D S
    propose, analyze, channel*/
        
    self.func.propose = function(msg, ctx, config, cb) {
        var ch = util.getChannel(msg.guild.channels, config.channels.modvoting);
        if (ch == null) {
            cb("Use the command @Ohtred channel modvoting [name] to assign a designated voting channel", null)
        }
        else {
            console.log(msg.author.toString() + " proposed: " + msg.content)
            var prop_id = Math.random().toString(36).substring(4);
            const embed = new Discord.RichEmbed()

            embed.setTitle(".:: 𝐏𝐑𝐎𝐏𝐎𝐒𝐀𝐋")
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
            if (msg.attachments.size > 0) {
                console.log("Image attached")
                embed.setDescription(ctx + "\n" + msg.attachments.array()[0].url)
            }
            else {
                console.log("No image attached")
                embed.setDescription(ctx)
            }
            
            embed.setFooter(prop_id)
            embed.setTimestamp()
            ch.send({embed})
                .then(message => cb(null, msg.author.toString() + "\n *" + prop_id + `* at ${message.url}`))
                .catch(console.error)
        }
    }
    
    self.func.analyze = function(msg, ctx, config, cb) {
        (async function() {
            try {
                const result = await perspective.analyze(ctx);
                var score = Math.round(result.attributeScores.TOXICITY.summaryScore.value * 100)
                const embed = new Discord.RichEmbed()
                embed.setDescription(ctx)
                var emote = "🗿"
                if (score < 10) emote = "😂"
                else if (score < 30) emote = "😤"
                else if (score < 70) emote = "😡"
                else if (score < 99) emote = "👺"
                embed.setTitle(emote + " **" + score + "%**")
                
                cb(null, embed);
            }
            catch(error) { cb("Sorry " + msg.author.toString() + ", I couldn't understand that message") }
        })()
    }
    
    /*C O N F I G U R A T I O N
    emote, config, permit, unpermit, reportable, unreportable, about.*/
    
    self.defaultError = " Incorrect syntax!\nType in *@Ohtred about commands* to get config commands\nType in *@Ohtred about server* to get the current config"
    self.set = {}
    self.set.channel = function(msg, ctx, config, cb) {
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            var types =
                [
                    "reportlog",
                    "feedback",
                    "modvoting",
                    "modannounce",
                    "modactivity"
                ]
            if (types.indexOf(params[0]) !== -1) {
                var type = types[types.indexOf(params[0])] //anti injection
                //party rockers in the hou
                db[config.id]['channels'][type] = params[1]
                cb(null, type + " channel succesfully set to *" + params[1] +"*.\nKeep in mind that if a channel with the name does not exist, it will not work")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.set.emote = function(msg, ctx, config, cb) {
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            var types =
                [
                    "upvote",
                    "downvote",
                    "report",
                ]
            if (types.indexOf(params[0]) !== -1) {
                var type = types[types.indexOf(params[0])] //anti injection
                db[config.id][type] = params[1]
                cb(null, type + " emote succesfully set to :" + params[1] +":\nKeep in mind that if the named emote does not exist, it will not work")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.set.config = function(msg, ctx, config, cb) {
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            var types =
                [
                    "mod_upvote",
                    "mod_downvote",
                    "petition_upvote",
                    "report_vote"
                ]
            if (types.indexOf(params[0]) !== -1) {
                var type = types[types.indexOf(params[0])] //anti injection
                db[config.id]["thresh"][type] = params[1]
                cb(null, type + " voting threshold succesfully set to **" + params[1] +"**\nKeep in mind that if the threshold is not a number, it will not work")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.set.permit = function(msg, ctx, config, cb) {
        if (ctx) {
            if (config.permissible.indexOf(ctx) !== -1) {
                cb(null, msg.author.toString() + " not to worry! That role is already permitted to talk to me.")
            }
            else {
                db[config.id]["permissible"].push(ctx)
                cb(null, ctx + " succesfully added to the list of roles that can talk to me.")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.set.unpermit = function(msg, ctx, config, cb) {
        if (ctx) {
            var index = config.permissible.indexOf(ctx)
            if (index !== -1) {
                db[config.id]["permissible"].splice(index)
                cb(null, ctx + " succesfully removed from the list of roles that can talk to me.")
            }
            else {
                cb(msg.author.toString() + " couldn't find that role! Double-check roles with @Ohtred *about server*")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.set.reportable = function(msg, ctx, config, cb) {
        if (ctx) {
            if (config.reportable.indexOf(ctx) !== -1) {
                cb(msg.author.toString() + " not to worry! That channel is already reportable.")
            }
            else {
                db[config.id]["reportable"].push(ctx)
                cb(null, ctx + " succesfully added to the list of reportable channels.")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.set.unreportable = function(msg, ctx, config, cb) {
        if (ctx) {
            var index = config.reportable.indexOf(ctx)
            if (index !== -1) {
                db[config.id]["reportable"].splice(index)
                cb(null, ctx + " succesfully removed from the list of reportable channels.")
            }
            else {
                cb(msg.author.toString() + " couldn't find that channel! Double-check reportable channels with @Ohtred *about server*")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.func.about = function(msg, ctx, config, cb) {
        switch(ctx) {
            case "commands":
                cb(null, 
                "```@Ohtred channel [modvoting|modannounce|modactivity|feedback|reportlog] [channel_name] to link one of the features to a channel"
                + "\n...\n"
                + "@Ohtred emote [upvote|downvote|report] [emote_name] to set the name of the emote to its corresponding mechanic"
                + "\n...\n"
                + "@Ohtred permit [rolename] to permit a rolename to interact with me"
                + "\n...\n"
                + "@Ohtred unpermit [rolename] to remove a role from interacting with me"
                + "\n...\n"
                + "@Ohtred reportable [channel name] to add a channel to the list where messages are reportable"
                + "\n...\n"
                + "@Ohtred unreportable [channel name] to remove a channel from the reportable list"
                + "\n...\n"
                + "@Ohtred config [mod_upvote|mod_downvote|petition_upvote|report_vote] [count] to set a voting threshold```"
                )
                break;
            case "server":
                cb(null, 
                    "```"+
                    "Name: "+config.name+"\n"+
                    "Channels:\n"+
                    "  modvoting: "+config.channels.modvoting+"\n"+
                    "  modannounce: "+config.channels.modannounce+"\n"+
                    "  modactivity: "+config.channels.modactivity+"\n"+
                    "  feedback: "+config.channels.feedback+"\n"+
                    "  reportlog: "+config.channels.reportlog+"\n...\n"+
                    
                    "Vote config:\n"+
                    "   Mod votes need "+config.thresh.mod_upvote+" :" + config.upvote + ": to pass\n"+
                    "   Mod votes need "+config.thresh.mod_downvote+" :" + config.downvote + ": to fail\n"+
                    "   Petitions need " +config.thresh.petition_upvote+" :" + config.upvote + ": to progress\n"+
                    "   Messages need "+config.thresh.report_vote+" :" + config.report + ": to be logged\n...\n"+
                    
                    "Permissible: "+config.permissible+"\n"+
                    "Reportable: "+config.reportable+"```"+
                    "Name a category 🔴 to display # users online. CAUTION: it floods the audit log"
                )
                break;
            default:
                cb(msg.author.toString() + " add a second paramter of *server* or *commands*")
        }
    }
    
    self.set.alert = function(msg, ctx, config, cb) {
        var ch = util.getChannel(msg.guild.channels,config.channels.modannounce);
        if (ch != null) {
            switch(ctx) {
                case "1":
                    ch.send("@here Calling all moderators.")
                    break;
                case "2":
                    ch.send("@everyone Important - moderators adjourn.")
                    break;
                case "3":
                    ch.send("@everyone EMERGENCY - PLEASE COME ONLINE.")
                    break;
                case "4":
                    ch.send("@everyone OH GOD OH F*CK PLEASE COME ONLINE BRUH")
                    break;
                default:
                    ch.send("Bruh moment")
            }
        }
    }
    
    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    //R E A C T I O N S
    self.react = {}
    
    self.react.upvote = function(reaction, user, config) {
        console.log("Proposal '"+reaction.message.embeds[0].description+"' passed")
        console.log("Proposal passed")
        reaction.message.react('✅');
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (ch !== null) {
            var old = reaction.message.embeds[0];
            var embed = new Discord.RichEmbed()
            
            embed.setTitle("✅ **PASSED** ✅")
            embed.setAuthor(old.author.name, old.author.iconURL)
            embed.setDescription(old.description)
            embed.setFooter(old.footer.text)
            embed.setTimestamp(new Date(old.timestamp).toString())
            ch.send({embed})
        }
        else {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@Ohtred config modannounce channel_name```"
            )
        }
    }
    
    self.react.downvote = function(reaction, user, config) {
        console.log("Proposal '"+reaction.message.embeds[0].description+"' was rejected")
        reaction.message.react('❌');
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (ch !== null) {
            var old = reaction.message.embeds[0];
            var embed = new Discord.RichEmbed()
            
            embed.setTitle("❌ **FAILED** ❌")
            embed.setAuthor(old.author.name, old.author.iconURL)
            embed.setDescription(old.description)
            embed.setFooter(old.footer.text)
            embed.setTimestamp(new Date(old.timestamp).toString())
            ch.send({embed})
        }
        else {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@Ohtred config modannounce channel_name```"
            )
        }
    }
    
    self.react.report = function(reaction, user, config) {
        var content = reaction.message.content;
        reaction.message.react('❌');
        var report_channel = util.getChannel(reaction.message.guild.channels, config.channels.reportlog)
        if (report_channel) { //if report channel exists
            
            const embed = new Discord.RichEmbed()
            embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
            embed.setDescription(content)
            embed.setTimestamp()
            
            if (reaction.message.attachments.size > 0) {
                console.log("Image attached")
                embed.setDescription(content + "\n" + reaction.message.attachments.array()[0].url)
            }
            else {
                console.log("No image attached")
                embed.setDescription(content)
            }
            
            reaction.fetchUsers().then(function(val) {
                var users = val.array()
                var replist = "**Reporters: **"
                for (var i = 0; i < users.length; i++) {
                    console.log(users[i].id)
                    replist += "<@" + users[i].id + ">" + " "
                }
                
                report_channel.send({embed}).then(function() { 
                    report_channel.send(replist)
                    report_channel.send("@here " + reaction.message.url)
                    
                    if (!reaction.message.member.mute) { //if he's already muted don't remute... keep timer integrity
                        reaction.message.member.setMute(true, "Automatically muted for 5 reports")
                            setTimeout(function() {
                                console.log(reaction.message.member.nickname + " was unmuted after 60 seconds")
                                reaction.message.member.setMute(false)
                            }, 60 * 1000) //30 second mute
                    }
                    
                    reaction.message.channel.send(reaction.message.author.toString() + " just got report-muted for 1 minute")
                    //reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                })
            })
        }
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
            ch.send({embed})
        }
        else {
            reaction.message.reply(
                "The modvoting channel could not be found. Follow this syntax:"
                +"```@Ohtred config modvoting channel_name```"
            )
        }
    }
    
}

module.exports = Helper