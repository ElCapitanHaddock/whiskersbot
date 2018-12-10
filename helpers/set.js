
var util = require('../util')
var Set = function(db, client, Discord) {
    /*C O N F I G U R A T I O N  A N D  M O D  O N L Y
    emote, config, permit, unpermit, reportable, unreportable, about.*/
    var self = this
    self.defaultError = " Incorrect syntax!\nType in *@Ohtred about commands* to get config commands\nType in *@Ohtred about server* to get the current config"
    
    self.mutedrole = function(msg, ctx, config, cb) {
        if (msg.mentions.roles.size !== 0) {
            var role_id = msg.mentions.roles.first().id
                db[config.id]["mutedRole"] = role_id
                cb(null, "<@&" + role_id + "> succesfully as the muted role.")
        }
    }
    
    self.motion = function(msg, ctx, config, cb) {
        var ch = util.getChannel(msg.guild.channels, config.channels.modvoting);
        if (ch == null) {
            cb("Use the command @Ohtred channel modvoting [name] to assign a designated voting channel", null)
        }
        else {
            var params = ctx.trim().split(" ")
            if (params[0] && !isNaN(params[0]) && params[0] >= 2 && params[1]) {
                params = [params[0], params.slice(1).join(" ")]
                console.log(msg.author.toString() + " motioned: " + msg.content)
                var prop_id = Math.random().toString(36).substring(4);
                const embed = new Discord.RichEmbed()
    
                embed.setTitle(".:: **MOTION** | **"+params[0]+"**")
                embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
                if (msg.attachments.size > 0) {
                    console.log("Image attached")
                    embed.setDescription(params[1] + "\n" + msg.attachments.array()[0].url)
                }
                else {
                    console.log("No image attached")
                    embed.setDescription(params[1])
                }
                
                embed.setFooter(prop_id)
                embed.setTimestamp()
                ch.send({embed})
                    .then(message => cb(null, msg.author.toString() + "\n *" + prop_id + `* at ${message.url}`)).catch( function(error) { console.error(error) } )
            }
            else cb(msg.author.toString() + " sorry, you need to include a threshold parameter greater than 2 before your description!")
        }
    }
    
    /*
    self.prefix = function(msg, ctx, config, cb) {
        if (ctx) {
            db.prefix = ctx
            cb(null, "**" + ctx + "** succesfully set as the server prefix.")
        }
        else cb(msg.author.toString() + self.defaultError)
    }*/
    self.channel = function(msg, ctx, config, cb) {
        var params = ctx.trim().split(" ")
        if (params[0]) {
            var types =
                [
                    "reportlog",
                    "feedback",
                    "modvoting",
                    "modannounce",
                    "modactivity"
                ]
            if (types.indexOf(params[0]) !== -1) {
                if (msg.mentions.channels.size !== 0) {
                    var ch_id = msg.mentions.channels.first().id
                    var type = types[types.indexOf(params[0])]
                    db[config.id]['channels'][type] = ch_id
                    cb(null, "**" + type + "** channel succesfully set to <#" + ch_id +">")
                }
                else cb(msg.author.toString() + " please include a channel mention!")
            }
            else cb(msg.author.toString() + self.defaultError)
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.emote = function(msg, ctx, config, cb) {
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
                cb(null, "**" + type + "** emote succesfully set to **" + params[1] +"**")
            }
            else cb(msg.author.toString() + self.defaultError)
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.prefix = function(msg, ctx, config, cb) {
        if (ctx && ctx.length !== 0) {
            db[config.id]["prefix"] = ctx
            cb(null, "The prefix was succesfully set to **" + ctx +"**")
        } 
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.config = function(msg, ctx, config, cb) {
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            var types =
                [
                    "mod_upvote",
                    "mod_downvote",
                    "petition_upvote",
                    "report_vote"
                ]
            if (types.indexOf(params[0]) !== -1 ) {
                if (!params[1].isNaN && params[1] > 0) {
                    var type = types[types.indexOf(params[0])] //anti injection
                    db[config.id]["thresh"][type] = params[1]
                    cb(null, "**" + type + "** voting threshold succesfully set to **" + params[1] + "**")
                } else cb(msg.author.toString() + " your threshold needs to be a number greater than 0")
            }
            else cb(msg.author.toString() + self.defaultError)
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.permit = function(msg, ctx, config, cb) {
        if (msg.mentions.roles.size !== 0) {
            var role_id = msg.mentions.roles.first().id
            if (config.permissible.indexOf(role_id) !== -1) {
                cb(null, msg.author.toString() + " not to worry! That role is already permitted to talk to me.")
            }
            else {
                db[config.id]["permissible"].push(role_id)
                cb(null, "<@&" + role_id + "> succesfully added to the list of roles that can talk to me.")
            }   
        }
        else if (ctx) {
            if (config.permissible.indexOf(ctx) !== -1) {
                cb(null, msg.author.toString() + " not to worry! That role is already permitted to talk to me.")
            }
            else {
                db[config.id]["permissible"].push(ctx)
                cb(null, "<@&" + ctx + "> succesfully added to the list of roles that can talk to me.")
            }   
        }
        else cb(msg.author.toString() + " please include a role to add!")
    }
    
    self.unpermit = function(msg, ctx, config, cb) {
        if (msg.mentions.roles.size !== 0) {
            var role_id = msg.mentions.roles.first().id
            var index = config.permissible.indexOf(role_id)
            if (index !== -1) {
                db[config.id]["permissible"].splice(index, 1)
                cb(null, "<@&" + role_id + "> succesfully removed from the list of roles that can talk to me.")
            }
            else {
                cb(msg.author.toString() + " couldn't find that role! Double-check roles with @Ohtred *about server*")
            }
        }
        else if (config.permissible.indexOf(ctx) !== -1) {
            db[config.id]["permissible"].splice(config.permissible.indexOf(ctx), 1)
            cb(null, "<@&" + ctx + "> succesfully removed from the list of roles that can talk to me.")
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.reportable = function(msg, ctx, config, cb) {
        if (msg.mentions.channels.size !== 0) {
            var ch_id = msg.mentions.channels.first().id
            if (config.reportable.indexOf(ch_id) !== -1) {
                cb(msg.author.toString() + " not to worry! That channel is already reportable.")
            }
            else {
                db[config.id]["reportable"].push(ch_id)
                cb(null, "<#" + ch_id + "> succesfully added to the list of reportable channels.")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.unreportable = function(msg, ctx, config, cb) {
        if (msg.mentions.channels.size !== 0) {
            var ch_id = msg.mentions.channels.first().id
            var index = config.reportable.indexOf(ch_id)
            if (index !== -1) {
                db[config.id]["reportable"].splice(index,1)
                cb(null, "<#" + ch_id + "> successfully removed from the list of reportable channels.")
            }
            else {
                cb(msg.author.toString() + " couldn't find that channel! Double-check reportable channels with @Ohtred *about server*")
            }
        }
        else if (config.reportable.indexOf(ctx) !== -1) { //for legacy cases
            db[config.id]["reportable"].splice(config.reportable.indexOf(ctx),1)
            cb(null, "<@" + ctx + "> succesfully removed from the list of reportable channels.")
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.counter = function(msg, ctx, config, cb) {
        if (ctx) {
            var num = parseInt(ctx)
            if (!num.isNaN && num >= 1 && num <= 50) {
                config.counter = num
                cb(null, " successfully changed the counter interval to **" + ctx + "**")
            }
            else cb(msg.author.toString() + " sorry, you need to pick a number between 1 and 50!")
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.report_time = function(msg, ctx, config, cb) {
        if (ctx) {
            var num = parseInt(ctx)
            if (!num.isNaN && num >= 10) {
                config.report_time = num
                cb(null, " successfully changed the report mute time to **" + ctx + "**")
            }
            else cb(msg.author.toString() + " sorry, you need to pick a number >= 10!")
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.alert = function(msg, ctx, config, cb) {
        var ch = util.getChannel(msg.guild.channels,config.channels.modannounce);
        if (ch != null) {
            switch(ctx) {
                case "1":
                    ch.send("@here Calling all moderators.").catch( function(error) { console.error(error) } )
                    break;
                case "2":
                    ch.send("@here ❗ Important - moderators adjourn ❗ @here").catch( function(error) { console.error(error) } )
                    break;
                case "3":
                    ch.send("@everyone ❗❗ Urgent sitation - please come online. ❗❗").catch( function(error) { console.error(error) } )
                    break;
                case "4":
                    ch.send("@everyone ❗❗❗ THIS IS NOT A JOKE. THIS IS AN EMERGENCY. CALLING ALL MODS ❗❗❗ @everyone").catch( function(error) { console.error(error) } )
                    break;
                default:
                    msg.reply("Please specify an alert-level of 1-4").catch( function(error) { console.error(error) } )
            }
        }
    }
    
    self.mutes = []
    self.mute = function(msg, ctx, config, cb) {
        var user
        var users = msg.mentions.users.array()
        for (var i = 0; i < users.length; i++) {
            if (users[i].id !== client.user.id) user = users[i]
        }
        if (user) {
            var mem = msg.guild.members.find(m => m.id == user.id)
            if (mem) {
                for (var i = 0; i < self.mutes.length; i++) { //override/cancel previous mutes
                    if (self.mutes[i].member == mem) {
                        clearTimeout(self.mutes[i].timeout)
                        self.mutes.splice(i,1)
                    }
                }
                if (config.mutedRole) {
                    mem.addRole(config.mutedRole)
                    var params = ctx.trim().split(" ")
                    if (params[1] && !isNaN(params[1]) && params[1] >= 1) {
                        self.mutes.push( 
                            {
                                member: mem,
                                timeout: setTimeout(function() {
                                    mem.removeRole(config.mutedRole).then(console.log).catch(console.error);
                                }, params[1] * 1000 * 60)
                            }
                        )
                        cb(null, mem.toString() + " was muted for " + params[1] + "m")
                    } else cb(null, mem.toString() + " was muted.")
                }
                else {
                    cb(
                        "**The muted role could not be found. Follow this syntax:**"
                        +"```@Ohtred mutedrole role```"
                    )
                }
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.unmute = function(msg, ctx, config, cb) {
        var user
        var users = msg.mentions.users.array()
        for (var i = 0; i < users.length; i++) {
            if (users[i].id !== client.user.id) user = users[i]
        }
        if (config.mutedRole && user) {
            var mem = msg.guild.members.find(m => m.id == user.id)
            if (mem) {
                for (var i = 0; i < self.mutes.length; i++) { //override/cancel previous mutes
                    if (self.mutes[i].member == mem) {
                        clearTimeout(self.mutes[i].timeout)
                        self.mutes.splice(i,1)
                    }
                }
                if (mem.roles.find(function(role) { return role.id == config.mutedRole }) ) {
                    mem.removeRole(config.mutedRole).then(console.log).catch(console.error);
                    cb(null, mem.toString() + " was unmuted.")
                }
                else cb(" that user is already unmuted!")
            }
        }
        else if (!config.mutedRole) {
            cb(
                "**The muted role could not be found. Follow this syntax:**"
                +"```@Ohtred mutedrole role```" )
        }
        else cb(msg.author.toString() + self.defaultError)
    }
}

module.exports = Set