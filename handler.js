

var Handler = function(db,intercom,client,helper,util) {
    var self = this
    self.message = function(msg) {
        var config = db[msg.guild.id]
        if (config) {
            intercom.update(msg)
            
            if (config.id == "483122820843307008") {
                console.log(msg.author.username + " [" + msg.guild.name + "]" + "[" + msg.channel.name + "]: " + msg.content)
            }
            
            if (msg.isMentioned(client.user) && !msg.author.bot) { //use msg.member.roles
                var perm = false;
                for (var i = 0; i < config.permissible.length; i++) {
                    if (msg.member.roles.find('name', config.permissible[i])) perm = true
                }
                
                if (perm || msg.member.permissions.has('ADMINISTRATOR')) { //if user is permitted to talk to bot
                    var inp = msg.content.replace(/\s+/g, ' ').trim().substr(msg.content.indexOf(' ')+1);
                    var cmd = inp.substr(0,inp.indexOf(' '))
                    var ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
                    
                    if (msg.attachments.size > 0) { //append attachments to message
                        ctx += " " + msg.attachments.array()[0].url
                    }
                    
                    if (ctx.trim().length == 0 || cmd.trim().length == 0) { //if empty mention or single param
                        
                        //msg.channel.send(config.helpMessage) //no more custom help messages for now
                        msg.channel.send("```Hey dude, here are some tips \n"
                            + "...@ me with propose [description] to put your idea to vote\n"
                            + "...You can also @ me with alert [severity 1-4] to troll ping mods\n"
                            + "...Report messages with your server's :report: emote```"
                            + "If it's your first time, type in @Ohtred *about commands*\n"
                            + "To get information about the current config, @Ohtred *about server*"
                        )
                        
                    }
                    else if (helper.func[cmd.toLowerCase()] != null) {//found in main commands
                        helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                            if (error) msg.channel.send(error)
                            else {
                                msg.channel.send(res)
                            }
                        })
                    }
                    else if (helper.set[cmd.toLowerCase()] != null) {//found in config commands
                        if (msg.member.permissions.has('ADMINISTRATOR')) { //ADMIN ONLY
                            helper.set[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                                if (error) msg.channel.send("❌ " +error)
                                else {
                                    msg.channel.send("✅ "+res)
                                }
                            })
                        } else msg.channel.send("❌ " + msg.author.toString() + " ask an admin to do that.")
                    }
                    
                    else {
                        msg.channel.send(msg.author.toString() + " that command doesn't exist <:time:483141458027610123>")
                    }
                }
                else if (config.permissible.length == 0) {
                    msg.reply(
                        "**No roles are set to allow interaction with Ohtred. To add a role:**"
                        +"```@Ohtred config addrole role_name```"
                    )
                }
                else { //not moderator or admin
                    msg.channel.send(msg.author.toString() + " <:retard:505942082280488971>")
                }
            }
            else if (msg.author.id == client.user.id) { //self-sent commands, for testing
                if (msg.content.startsWith("!")) {
                    var tx = msg.content.slice(1)
                    var cmd = tx.substr(0,tx.indexOf(' '))
                    var ctx = tx.substr(tx.indexOf(' '), tx.length).trim() 
                    
                    if (ctx.trim().length == 0 || cmd.trim().length == 0) {}
                    else if (helper.func[cmd.toLowerCase()] != null) {//found in main commands
                        helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                            if (error) msg.channel.send(error)
                            else {
                                msg.channel.send(res)
                            }
                        })
                    }
                    else if (helper.set[cmd.toLowerCase()] != null) {//found in config commands
                        helper.set[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                            if (error) msg.channel.send(error)
                            else {
                                msg.channel.send(res)
                            }
                        })
                    }
                    else {
                        msg.channel.send(msg.author.toString() + " that command doesn't exist <:time:483141458027610123>")
                    }
                }
            }
        }
    }
    
    self.reactionRemove = function(reaction, user) {
        var config = db[reaction.message.guild.id]
        if (!reaction.message.deleted && !reaction.message.bot && config) {
            var already = util.checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //MOD-VOTING CHANNEL
            if (reaction.message.channel.name == config.channels.modvoting && reaction.message.embeds.length >= 1 && !already) {
                
                var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity)
                //upvote
                if (reaction._emoji.name == config.upvote && activity_log) {
                    activity_log.send(user.toString() + " just withdrew endorsement for *" + reaction.message.embeds[0].footer.text + "*")
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote && activity_log) {
                    activity_log.send(user.toString() + " just withdrew opposition for *" + reaction.message.embeds[0].footer.text + "*")
                }
            }
        }
    }
    
    self.reactionAdd = function(reaction, user) {
        var config = db[reaction.message.guild.id]
        if (!reaction.message.deleted && !reaction.message.bot && config) {
            self.parseReaction(reaction, user, config)
        }
    }
    
    self.parseReaction = function(reaction, user, config) {
        if (!reaction.message.deleted && !reaction.message.bot) {
            var already = util.checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //MOD-VOTING CHANNEL
            if (!already && reaction.message.channel.name == config.channels.modvoting && reaction.message.embeds.length >= 1) {
                
                //upvote
                if (reaction._emoji.name == config.upvote) {
                    if (reaction.count == config.thresh.mod_upvote) {
                        self.react.upvote(reaction, user, config)
                    }
                    var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity);
                    if (activity_log) {
                        activity_log.send(user.toString() + " just endorsed *" + reaction.message.embeds[0].footer.text + "*")
                    }
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote) {
                    if (reaction.count == config.thresh.mod_downvote) {
                        self.react.downvote(reaction, user, config)
                    }
                    var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity);
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
    
    self.guildCreate = function(guild) { //invited to new guild
        var config = db[guild.id]
        if (!config) {
            //default server config
            config = {
                id: guild.id,
                name: guild.name,
                
                reportable: ["general"],
                permissible: [],
                thresh: {
                    mod_upvote: 6,
                    mod_downvote: 6,
                    petition_upvote: 6,
                    report_vote: 7
                },
                upvote: "upvote",
                downvote: "downvote",
                report: "report",
                channels: {
                    reportlog: "report-log",
                    feedback: "feedback",
                    modvoting: "mod-voting",
                    modannounce: "mod-announcements",
                    modactivity: "mod-activity",
                }
            }
            db[guild.id] = config
        }
    }
    self.presenceUpdate = function(oldMember, newMember) {
        var channel = newMember.guild.channels.array().find(function(ch) {
            return ch.name.startsWith("🔵") || ch.name.startsWith("🔴") 
        })
        if (channel) {
            var old = parseInt(channel.name.replace(/\D/g,''))
            var len = newMember.guild.members.filter(m => m.presence.status === 'online').array().length
            if (old > len) {
                channel.setName("🔴  " + len + " online")
            }
            else channel.setName("🔵  " + len + " users online")
        }
        //ch.setTopic(len + " users online")
    }
}

module.exports = Handler