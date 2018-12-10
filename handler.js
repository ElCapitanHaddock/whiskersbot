
/* jshint undef: true, unused: true, asi : true, esversion: 6 */

var util = require('./util')
var schema = require('./config_schema')
var roast = require('shakespeare-insult')

var Handler = function(db,intercom,client,helper,perspective) {
    var self = this
    
    self.message = function(msg) {
        if (msg.guild && msg.guild.name != "MKV Syndicate" && db[msg.guild.id]) {
            var config = db[msg.guild.id]
            
            if (!msg.author.bot || msg.author.id == client.user.id) intercom.update(msg)
            //console.log(msg.author.username + " [" + msg.guild.name + "]" + "[" + msg.channel.name + "]: " + msg.content)
            
            var gottem = ( msg.isMentioned(client.user) || (config.prefix && msg.content.startsWith(config.prefix)) )
            if ( gottem && !msg.author.bot ) { //use msg.member.roles
                var perm = false
                for (var i = 0; i < config.permissible.length; i++) {
                    if (msg.member.roles.find(function(role) { return role.id == config.permissible[i] }) ) perm = true
                }
                
                var inp;
                  //non-prefix
                if (msg.isMentioned(client.user)) {
                    inp = msg.content.replace(/\s+/g, ' ').trim().substr(msg.content.indexOf(' ')+1)
                } //prefix
                else inp = msg.content.trim().slice(config.prefix.length)
                
                var cmd = inp.substr(0,inp.indexOf(' '))
                var ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
                
                if (helper.cosmetic[cmd.toLowerCase()]) { //COSMETIC COMMANDS: everyone can use
                    helper.cosmetic[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        if (error) msg.channel.send(error).catch( function(error) { console.error(error) } )
                        else {
                            msg.channel.send(res).catch( function(error) { console.error(error) } )
                        }
                    })
                }
                
                else if (perm || msg.member.permissions.has('ADMINISTRATOR') || msg.author.id == 230878537257713667) { //if user is permitted to talk to bot
                    self.parseMessage(msg, cmd, ctx, config)
                }
                else if (config.permissible.length == 0) {
                    msg.reply(
                        "**No roles are set to allow interaction with Ohtred. To add a role:**"
                        +"```@Ohtred permit [role name]```"
                    )
                }
                else {  //roast the user
                    msg.channel.send( msg.author.toString() + " I'm can't hear you, ya " + roast.random() ).catch( function(error) { console.error(error) } ) //" <:retard:505942082280488971>")
                }
            }
            else if (msg.content.startsWith("!") && msg.author.id == client.user.id && !msg.isMentioned(client.user)) { //self-sent commands, for testing
                let inp = msg.content.slice(1)
                let cmd = inp.substr(0,inp.indexOf(' '))
                let ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
                
                if (helper.cosmetic[cmd.toLowerCase()]) {
                    helper.cosmetic[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        if (error) msg.channel.send(error).catch( function(error) { console.error(error) } )
                        else {
                            msg.channel.send(res).catch( function(error) { console.error(error) } )
                        }
                    })
                }
                else self.parseMessage(msg, cmd, ctx, config)
            }
            else if (msg.channel.topic && !msg.author.bot) {
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
            msg.channel.send("```To get started, type in @Ohtred about setup\n"
                + "For help, type in @Ohtred about [topic]\nTopics: [setup|usage|server|voting|automod|stats|invite|credits|support]```"
            )
            
        }
        else if (helper.func[cmd.toLowerCase()] != null) {
            //execute functional command
            helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                if (error) msg.channel.send(error).catch( function(error) { console.error(error) } )
                else {
                    msg.channel.send(res).catch( function(error) { console.error(error) } )
                }
            })
        }
        else if (helper.set[cmd.toLowerCase()] != null) {
            //execute settings command
            if (msg.member.permissions.has('ADMINISTRATOR')) { //ADMIN ONLY
                helper.set[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                    if (error) msg.channel.send("<:red_x:520403429835800576> " +error).catch( function(error) { console.error(error) } )
                    else {
                        msg.channel.send("<:green_check:520403429479153674> "+res).catch( function(error) { console.error(error) } )
                    }
                })
            } else msg.channel.send("<:red_x:520403429835800576> " +  msg.author.toString() + " ask an admin to do that.").catch( function(error) { console.error(error) } )
        }
        else {
            if (msg.guild.id != 264445053596991498) {
                console.log(msg.guild.id)
                msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " that command doesn't exist").catch( function(error) { console.error(error) } )
            }
        }
    }
    
    self.reactionRemove = function(reaction, user) {
        var config = db[reaction.message.guild.id]
        if (!reaction.message.deleted && !reaction.message.bot && config && reaction.message.embeds && reaction.message.embeds[0]) {
            
            var already = util.checkConcluded(reaction.message.embeds[0])
            //util.checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //MOD-VOTING CHANNEL
            if (reaction.message.channel.id == config.channels.modvoting && reaction.message.embeds.length >= 1 && !already) {
                
                var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity)
                //upvote
                if (reaction._emoji.name == config.upvote && activity_log) {
                    activity_log.send(user.toString() + " just withdrew endorsement for *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error) } )
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote && activity_log) {
                    activity_log.send(user.toString() + " just withdrew opposition for *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error) } )
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
    
    self.parseReaction = function(reaction, user, config) { //just for added reactions
        if (!reaction.message.deleted && !reaction.message.bot && reaction.message.embeds && reaction.message.embeds[0]) {
            var already = util.checkConcluded(reaction.message.embeds[0])//util.checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //MOD-VOTING CHANNEL
            if (!already && reaction.message.channel.id == config.channels.modvoting && reaction.message.embeds.length >= 1) {
                
                //activity log channel
                var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity)
                
                //get the proper threshold
                var upvote = config.thresh.mod_upvote
                var downvote = config.thresh.mod_downvote
                if (reaction.message.embeds[0].title.includes("MOTION")) {
                    var thresh = Number(reaction.message.embeds[0].title.replace(/\*/g, "").split(" | ")[1])
                    upvote = Number(thresh)
                    downvote = Number(thresh)
                }
                
                //upvote
                if (reaction._emoji.name == config.upvote) {
                    if (reaction.count == upvote) {
                        helper.react.upvote(reaction, user, config)
                    }
                    if (activity_log) {
                        activity_log.send(user.toString() + " just endorsed *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error) } )
                    }
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote) {
                    if (reaction.count == downvote) {
                        helper.react.downvote(reaction, user, config)
                    }
                    if (activity_log) {
                        activity_log.send(user.toString() + " just opposed *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error) } )
                    }
                }
            }
            
        }
        //FEEDBACK CHANNEL
        else if (reaction._emoji.name == config.upvote && reaction.message.channel.id == config.channels.feedback && !util.checkReact(reaction.message.reactions.array())) {
            if (reaction.count == config.thresh.petition_upvote) self.react.plebvote(reaction, user, config)
        }
        //REPORTABLE CHANNELS
        else if (config.reportable.indexOf(reaction.message.channel.id) != -1) { 
            if (!config.report_time) config.report_time = 60
            if (reaction._emoji.name == config.report && reaction.count == config.thresh.report_vote) {
                self.react.report(reaction, user, config)
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
    
    self.guildRemove = function(guild) { //removed from a guild
        console.log("Removed from a server: "+guild.name)
        db[guild.id] = null
    }
    
    self.presenceUpdate = function(oldMember, newMember) {
        var config = db[oldMember.guild.id]
        if (config && config.counter) {
            var channel = newMember.guild.channels.array().find(function(ch) {
                return ch.name.startsWith("🔺") || ch.name.startsWith("🔻") 
            })
            if (channel) {
                var old = parseInt(channel.name.replace(/\D/g,''))
                var len = newMember.guild.members.filter(m => m.presence.status === 'online' && !m.user.bot).size
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