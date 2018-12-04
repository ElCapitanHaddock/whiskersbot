
/* jshint undef: true, unused: true, asi : true, esversion: 6 */

var util = require('./util')
var schema = require('./config_schema')
var roast = require('shakespeare-insult')

var Handler = function(db,intercom,client,helper,perspective) {
    var self = this
    
    self.message = function(msg) {
        var config = db[msg.guild.id]
        if (config) {
            
            intercom.update(msg)
            console.log(msg.author.username + " [" + msg.guild.name + "]" + "[" + msg.channel.name + "]: " + msg.content)
            
            
            if (msg.isMentioned(client.user) && !msg.author.bot) { //use msg.member.roles
                var perm = false
                for (var i = 0; i < config.permissible.length; i++) {
                    if (msg.member.roles.find('name', config.permissible[i])) perm = true
                }
                
                let inp = msg.content.replace(/\s+/g, ' ').trim().substr(msg.content.indexOf(' ')+1)
                let cmd = inp.substr(0,inp.indexOf(' '))
                let ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
                
                if (helper.cosmetic[cmd.toLowerCase()]) { //COSMETIC COMMANDS: everyone can use
                    helper.cosmetic[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        if (error) msg.channel.send(error)
                        else {
                            msg.channel.send(res)
                        }
                    })
                }
                
                else if (perm || msg.member.permissions.has('ADMINISTRATOR')) { //if user is permitted to talk to bot
                    self.parseMessage(msg, cmd, ctx, config)
                    
                }
                else if (config.permissible.length == 0) {
                    msg.reply(
                        "**No roles are set to allow interaction with Ohtred. To add a role:**"
                        +"```@Ohtred config addrole role_name```"
                    )
                }
                else {
                    msg.channel.send( msg.author.toString() + " " + roast.random() ) //" <:retard:505942082280488971>")
                }
            }
            else if (msg.content.startsWith("!") && msg.author.id == client.user.id && !msg.isMentioned(client.user)) { //self-sent commands, for testing
                let inp = msg.content.slice(1)
                let cmd = inp.substr(0,inp.indexOf(' '))
                let ctx = inp.substr(inp.indexOf(' '), inp.length).trim() 
                self.parseMessage(msg, cmd, ctx, config)
            }
            else if (msg.channel.topic && !msg.author.bot && msg.content.trim().length != 0) {
                helper.monitor(msg)
            }
        }
    }
    
    self.parseMessage = function(msg, cmd, ctx, config) { //for non-cosmetic commands
        if (msg.attachments.size > 0) { //append attachments to message
            ctx += " " + msg.attachments.array()[0].url
        }
        
        if (ctx.trim().length == 0 || cmd.trim().length == 0) {
            //help message
            msg.channel.send("```Hey dude, here are some tips \n"
                + "...@ me with propose [description] to put your idea to vote\n"
                + "...@ me with alert [severity 1-4] to troll ping mods\n"
                + "...@ me with analyze [text] to predict toxicity\n"
                + "...Report messages with your server's :report: emote\n"
                + "...Name a category 🔺 and it will turn it into an online users counter\n...```\n"
                + "If it's your first time, type in @Ohtred *about commands*\n"
                + "If you're interested in automod, try @Ohtred *about automod*\n"
                + "To get information about the current config, @Ohtred *about server* \n"
            )
            
        }
        else if (helper.func[cmd.toLowerCase()] != null) {
            //execute functional command
            helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                if (error) msg.channel.send(error)
                else {
                    msg.channel.send(res)
                }
            })
        }
        else if (helper.set[cmd.toLowerCase()] != null) {
            //execute settings command
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
                
                //activity log channel
                var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity)
                
                //upvote
                if (reaction._emoji.name == config.upvote) {
                    if (reaction.count == config.thresh.mod_upvote) {
                        helper.react.upvote(reaction, user, config)
                    }
                    if (activity_log) {
                        activity_log.send(user.toString() + " just endorsed *" + reaction.message.embeds[0].footer.text + "*")
                    }
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote) {
                    if (reaction.count == config.thresh.mod_downvote) {
                        helper.react.downvote(reaction, user, config)
                    }
                    if (activity_log) {
                        activity_log.send(user.toString() + " just opposed *" + reaction.message.embeds[0].footer.text + "*")
                    }
                }
            }
            
            //FEEDBACK CHANNEL
            else if (!already && reaction._emoji.name == config.upvote && reaction.message.channel.name == config.channels.feedback) {
                if (reaction.count == config.thresh.petition_upvote) self.react.plebvote(reaction, user, config)
            }
            
            //REPORTABLE CHANNELS
            else if (!already && config.reportable.indexOf(reaction.message.channel.name) != -1) { 
                if (!config.report_time) config.report_time = 60
                if (reaction._emoji.name == config.report && reaction.count == config.thresh.report_vote) {
                    self.react.report(reaction, user, config)
                }
            }
        }
    }
    self.react = helper.react
    
    self.guildCreate = function(guild) { //invited to new guild
        console.log("Added to new server: "+guild.name)
        var config = db[guild.id]
        if (!config) {
            db[guild.id] = new schema(guild)
        }
    }
    self.presenceUpdate = function(oldMember, newMember) {
        var config = db[oldMember.guild.id]
        if (config && config.counter) {
            var channel = newMember.guild.channels.array().find(function(ch) {
                return ch.name.startsWith("🔺") || ch.name.startsWith("🔻") 
            })
            if (channel) {
                var old = parseInt(channel.name.replace(/\D/g,''))
                var len = newMember.guild.members.filter(m => m.presence.status === 'online').array().length
                var diff = Math.abs(old - len)
                var emo = (old < len) ? "🔺  " : "🔻  "
                if (diff >= config.counter)  channel.setName(emo + len + " online")
                
                else if (!(/\d/.test(channel.name))) channel.setName("🔺  " + len + " online") //if no numbers found
            }
        }
        //ch.setTopic(len + " users online")
    }
}

module.exports = Handler