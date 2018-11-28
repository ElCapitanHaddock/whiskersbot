var Helper = function(db, Discord) {
    var self = this;
    
    self.func = {}; //for commands, input
    
    self.func.set = function(msg, ctx, config, cb) {
        
    }
    
    
    //PROPOSE COMMAND
    self.func.propose = function(msg, ctx, config, cb) {
        var ch = getChannel(msg.guild.channels, config.channels.modvoting);
        if (ch == null) {
            cb("add a channel called #mod-voting please", null)
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
    
    self.defaultError = "Incorrect syntax!\nType in *@Ohtred about commands* to get config commands\nType in *@Ohtred about server* to get the current config"
    self.func.channel = function(msg, ctx, config, cb) {
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
                var se = {} //tonight
                se['channels.'+type] = params[1]
                
                db.loadDatabase(function (err) { if (err) console.error(err) })
                db.update({id: config.id}, { $set: se }, {}, function(err, num) {
                    if (err) console.error(err)
                    console.log(num + " documents changed on db.json")
                    cb(null, type + " channel succesfully set to *" + params[1] +"*.\nKeep in mind that if a channel with the name does not exist, it will not function")
                })
            }
        }
        else cb(null, self.defaultError)
    }
    
    self.func.emote = function(msg, ctx, config, cb) {
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
                var se = {}
                se[type] = params[1]
                
                
                db.loadDatabase(function (err) { if (err) console.error(err) })
                db.update({id: config.id}, { $set: se }, {}, function(err, num) {
                    if (err) console.error(err)
                    console.log(num + " documents changed on db.json")
                    cb(null, type + " emote succesfully set to :" + params[1] +":\nKeep in mind that if the named emote does not exist, it will not work")
                })
            }
        }
        else cb(null, self.defaultError)
    }
    
    self.func.config = function(msg, ctx, config, cb) {
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
                var se = {}
                se["thresh."+type] = params[1]
                
                
                db.loadDatabase(function (err) { if (err) console.error(err) })
                db.update({id: config.id}, { $set: se }, {}, function(err, num) {
                    if (err) console.error(err)
                    cb(null, type + " voting threshold succesfully set to **" + params[1] +"**\nKeep in mind that if the threshold is not a number, it will not work")
                })
            }
        }
        else cb(null, self.defaultError)
    }
    
    self.func.permit = function(msg, ctx, config, cb) {
        if (ctx) {
            if (config.permissible.indexOf(ctx) !== -1) {
                cb(null, "Not to worry! That role is already permitted to talk to me.")
            }
            else {
                var se = {}
                se.permissible = ctx
                
                db.loadDatabase(function (err) { if (err) console.error(err) })
                db.update({id: config.id}, { $push: se }, {}, function(err, num) {
                    if (err) console.error(err)
                    cb(null, ctx + " succesfully added to the list of roles that can talk to me.")
                })
            }
        }
        else cb(null, self.defaultError)
    }
    
    self.func.unpermit = function(msg, ctx, config, cb) {
        if (ctx) {
            var index = config.permissible.indexOf(ctx)
            if (index !== -1) {
                
                var res = config.permissible;
                res.splice(index)
                var se = {}
                se.permissible = res
                
                db.loadDatabase(function (err) { if (err) console.error(err) })
                db.update({id: config.id}, { $set: se }, {}, function(err, num) {
                    if (err) console.error(err)
                    cb(null, ctx + " succesfully removed from the list of roles that can talk to me.")
                })
            }
            else {
                cb(null, "Couldn't find that role! Double-check with @Ohtred about commands")
            }
        }
        else cb(null, self.defaultError)
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
                    "   Message need "+config.thresh.report_vote+" :" + config.report + ": to be logged\n...\n"+
                    
                    "Permissible: "+config.permissible+"\n"+
                    "Reportable: "+config.reportable+"```"
                )
                break;
        }
    }
    
    self.func.alert = function(msg, ctx, config, cb) {
        var ch = getChannel(msg.guild.channels,config.channels.modannounce);
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
    
    self.parseReaction = function(reaction, user, config) {
        if (!reaction.message.deleted && !reaction.message.bot) {
            var already = checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //MOD-VOTING CHANNEL
            if (!already && reaction.message.channel.name == config.channels.modvoting && reaction.message.embeds.length >= 1) {
                
                //upvote
                if (reaction._emoji.name == config.upvote) {
                    if (reaction.count == config.thresh.mod_upvote) {
                        self.react.upvote(reaction, user, config)
                    }
                    var activity_log = getChannel(reaction.message.guild.channels,config.channels.modactivity);
                    if (activity_log) {
                        activity_log.send(user.toString() + " just endorsed *" + reaction.message.embeds[0].footer.text + "*")
                    }
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote) {
                    if (reaction.count == config.thresh.mod_downvote) {
                        self.react.downvote(reaction, user, config)
                    }
                    var activity_log = getChannel(reaction.message.guild.channels,config.channels.modactivity);
                    if (activity_log) {
                        activity_log.send(user.toString() + " just opposed *" + reaction.message.embeds[0].footer.text + "*")
                    }
                }
            }
            
            //FEEDBACK CHANNEL
            else if (!already && reaction._emoji.name == config.upvote && reaction.message.channel.name == config.channels.feedback) {
                if (reaction.count == config.thresh.petition_upvote) self.react.plebvote(reaction, user, config)
            }
        }
        
        //REPORTABLE CHANNELS
        else if (!already && config.reportable.indexOf(reaction.message.channel.name) != -1) { 
            if (reaction._emoji.name == config.report && reaction.count >= config.thresh.report_vote) {
                self.react.report(reaction, user, config)
            }
        }
    }
    
    self.react = {}
    
    self.react.upvote = function(reaction, user, config) {
        console.log("Proposal '"+reaction.message.embeds[0].description+"' passed")
        console.log("Proposal passed")
        reaction.message.react('✅');
        var ch = getChannel(reaction.message.guild.channels,config.channels.modannounce);
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
        var ch = getChannel(reaction.message.guild.channels,config.channels.modannounce);
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
        var report_channel = getChannel(reaction.message.guild.channels, config.channels.reportlog)
        if (report_channel) { //if report channel exists
            
            const embed = new Discord.RichEmbed()
            embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
            embed.setDescription(content)
            //embed.setFooter(reaction.message.url);
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
        var ch = getChannel(reaction.message.guild.channels, config.channels.modvoting);
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

function getChannel(channels, query) { //get channel by name
    return channels.find(function(channel) {
      if (channel.name == query) {
        return channel
      } else return null
    });
}
function checkReact(reactions) {
    var already = false;
    for (var i = 0; i < reactions.length; i++) {
        var users = reactions[i].users.array()
        for (var x = 0; x < users.length; x++) {
            if (users[x].bot == true) {
                already = true;
            }
        }
    }
    return already
}

module.exports = Helper