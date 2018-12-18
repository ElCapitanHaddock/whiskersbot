
var util = require('../util')
var Set = function(API, client, Discord) {
    /*C O N F I G U R A T I O N  A N D  M O D  O N L Y
    emote, config, permit, unpermit, reportable, unreportable, embassy*/
    var self = this
    self.defaultError = " Incorrect syntax!\nType in *@Ohtred about setup* to get config commands\nType in *@Ohtred about server* to get the current config"
    
    self.mutedrole = function(msg, ctx, config, cb) {
        if (ctx) {
            var ro = ctx
            
            var diff_role = msg.guild.roles.find( r => r.name.toLowerCase().startsWith(ro.toLowerCase()) || r.id == ro.replace(/\D/g,'') )
            if (diff_role && diff_role.id == config.mutedRole) {
                config.mutedRole = ""
                API.update(config.id, {mutedRole: ""}).then(function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + diff_role.id + "> removed as the muted role.")
                })
            }
            else if (diff_role) {
                config.mutedRole = diff_role.id
                API.update(config.id, {mutedRole: diff_role.id}).then(function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + diff_role.id + "> set as the muted role.")
                })
            }
            else {
                cb(msg.author.toString() + " I couldn't find that role!")
            }
        }
        else cb("Please include a role mention or ID. To reset it to nothing, use its current role/ID as a parameter.")
    }
    
    self.autorole = function(msg, ctx, config, cb) {
        if (ctx) {
            var ro = ctx
            
            var diff_role = msg.guild.roles.find( r => r.name.toLowerCase().startsWith(ro.toLowerCase()) || r.id == ro.replace(/\D/g,'') )
            if (diff_role && diff_role.id == config.autorole) {
                config.autorole = ""
                API.update(config.id, {autorole: ""}).then(function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + diff_role.id + "> removed as the autorole.")
                })
            }
            else if (diff_role) {
                config.autorole = diff_role.id
                API.update(config.id, {autorole: diff_role.id}).then(function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + diff_role.id + "> set as the autorole.")
                })
            }
            else {
                cb(msg.author.toString() + " I couldn't find that role!")
            }
        }
        else cb("Please include a role mention or ID. To reset it to nothing, use its current role/ID as a parameter.")
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
                    .then(message => cb(null, msg.author.toString() + "\n *" + prop_id + `* at ${message.url}`)).catch( function(error) { console.error(error.message) } )
            }
            else cb(msg.author.toString() + " sorry, you need to include a threshold parameter greater than 2 before your description!")
        }
    }
    
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
                    config['channels'][type] = ch_id
                    API.update(config.id, {channels: config.channels}).then(function(err,res) {
                        if (err) cb(err)
                        else cb(null, "**" + type + "** channel succesfully set to <#" + ch_id +">")
                    })
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
                var type = types[types.indexOf(params[0])]
                config[type] = params[1]
                var se = {}
                API.update(config.id, se, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "**" + type + "** emote succesfully set to **" + params[1] +"**")
                })
            }
            else cb(msg.author.toString() + self.defaultError)
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.prefix = function(msg, ctx, config, cb) {
        if (ctx && ctx.trim().length !== 0) {
            ctx = ctx.replace(/\s/g,'')
            config.prefix = ctx
            API.update(config.id, {prefix: ctx}, function(err,res) {
                if (err) cb(err)
                else cb(null, "The prefix was succesfully set to **" + ctx +"**")
            })
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
                    config.thresh[type] = params[1]
                    var se = {}
                    se["thresh."+type] = params[1]
                    
                    API.update(config.id, se, function(err,res) {
                        if (err) cb(err)
                        else cb(null, "**" + type + "** emote succesfully set to **" + params[1] +"**")
                    })
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
                config["permissible"].push(role_id)
                cb(null, "<@&" + role_id + "> succesfully added to the list of roles that can talk to me.")
            }   
        }
        else if (ctx) {
            if (config.permissible.indexOf(ctx) !== -1) {
                cb(null, msg.author.toString() + " not to worry! That role is already permitted to talk to me.")
            }
            else {
                config["permissible"].push(ctx)
                API.update(config.id, {permissible: config.permissible}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + ctx + "> succesfully added to the list of roles that can talk to me.")
                })
            }   
        }
        else cb(msg.author.toString() + " please include a role to add!")
    }
    
    self.unpermit = function(msg, ctx, config, cb) {
        /*
        if (msg.mentions.roles.size !== 0) {
            var role_id = msg.mentions.roles.first().id
            var index = config.permissible.indexOf(role_id)
            if (index !== -1) {
                config["permissible"].splice(index, 1)
                API.update(config.id, {permissible: config.permissible}).then(function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + role_id + "> succesfully removed from the list of roles that can talk to me.")
                })
            }
            else {
                cb(msg.author.toString() + " couldn't find that role! Double-check roles with @Ohtred *about server*")
            }
        }
        */
        var index = config.permissible.indexOf(ctx) 
        if (index !== -1) {
            config["permissible"].splice(index, 1)
            API.update(config.id, {permissible: config.permissible}, function(err,res) {
                if (err) cb(err)
                else cb(null, "<@&" + ctx + "> succesfully removed from the list of roles that can talk to me.")
            })
        }
        else {
            cb(msg.author.toString() + " couldn't find that role! Double-check roles with @Ohtred *about server*")
        }
        //else cb(msg.author.toString() + self.defaultError)
    }
    
    self.reportable = function(msg, ctx, config, cb) {
        if (msg.mentions.channels.size !== 0) {
            var ch_id = msg.mentions.channels.first().id
            if (config.reportable.indexOf(ch_id) !== -1) {
                cb(msg.author.toString() + " not to worry! That channel is already reportable.")
            }
            else {
                config["reportable"].push(ch_id)
                API.update(config.id, {reportable: config.reportable}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<#" + ch_id + "> succesfully added to the list of reportable channels.")
                })
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.unreportable = function(msg, ctx, config, cb) {
        if (config.reportable.indexOf(ctx) !== -1) {
            config["reportable"].splice(config.reportable.indexOf(ctx),1)
            API.update(config.id, {reportable: config.reportable}, function(err,res) {
                if (err) cb(err)
                else cb(null, "<@" + ctx + "> succesfully removed from the list of reportable channels.")
            })
        }
        else {
            cb(msg.author.toString() + " couldn't find that channel in the reportable list! Double-check reportable channels with @Ohtred *about server*")
        }
        //else cb(msg.author.toString() + self.defaultError)
    }
    
    self.counter = function(msg, ctx, config, cb) {
        if (ctx) {
            var num = parseInt(ctx)
            if (!num.isNaN && num >= 1 && num <= 50) {
                config.counter = num
                API.update(config.id, {counter: num}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, " successfully changed the counter interval to **" + ctx + "**")
                })
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
                API.update(config.id, {report_time: num}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, " successfully changed the report mute time to **" + ctx + "**")
                })
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
                    ch.send("@here Calling all moderators.").catch( function(error) { console.error(error.message) } )
                    break;
                case "2":
                    ch.send("@here ❗ Important - moderators adjourn ❗ @here").catch( function(error) { console.error(error.message) } )
                    break;
                case "3":
                    ch.send("@everyone ❗❗ Urgent sitation - please come online. ❗❗").catch( function(error) { console.error(error.message) } )
                    break;
                case "4":
                    ch.send("@everyone ❗❗❗ THIS IS NOT A JOKE. THIS IS AN EMERGENCY. CALLING ALL MODS ❗❗❗ @everyone").catch( function(error) { console.error(error.message) } )
                    break;
                default:
                    msg.reply("Please specify an alert-level of 1-4").catch( function(error) { console.error(error.message) } )
            }
        }
    }
    
    self.embassy = function(msg, ctx, config, cb) {
        if (msg.mentions.channels.size !== 0) {
            var first = msg.mentions.channels.first()
            var ch_id = first.id
            
            first.createWebhook("Ohtred_Embassy", "https://i.imgur.com/RiXAyXF.png")
            .then(function(wb) {
                if (config.embassy == undefined) config.embassy = {}
                config.embassy[ch_id] = {id: wb.id, token: wb.token};
                API.update(config.id, {embassy: config.embassy}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "**Embassy succesfully opened at <#" + ch_id +">**");
                })
            }).catch(function(err) {
                if (err) cb(msg.author.toString() + " I couldn't set the webhook! Check my perms.")
            })
        }
        else cb(msg.author.toString() + " please include a channel mention!")
    }
    
    self.lockdown = function(msg, ctx, config, cb) {
        if (ctx && !isNaN(ctx) && ctx >= 0 && ctx <= 2) {
            API.update(config.id, {lockdown: ctx}, function(err,res) {
                if (err) cb(err)
                else cb(null, " successfully put lockdown on Level **" + ctx + "**")
            })
        }
        else cb(msg.author.toString() + " please include a number between 0 and 2!")
    }
    
    self.password = function(msg, ctx, config, cb) {
        var params = ctx.trim().split(" ")
        if (params[0]) {
            switch(params[0].toLowerCase()) {
                case "reset":
                    API.update(config.id, {password: ""}, function(err,res) {
                        if (err) cb(err)
                        else cb(null, " successfully removed password.")
                    })
                    break;
                case "set":
                    if (params[1]) {
                        var pass = params.slice(1).join(" ")
                        API.update(config.id, {password: pass}, function(err,res) {
                            if (err) cb(err)
                            else cb(null, " successfully set password as **" + pass + "**")
                        })
                    } else cb("Please include the password after *set*!")
                    break;
                case "get":
                    msg.member.createDM().then(channel => {
                        if (config.password) {
                            channel.send("*"+config.password+"*")
                        } else channel.send("No password set!")
                    })
                    break;
                default:
                    cb("Please use *set, get, or reset*")
                    break;
            }
        }
    }
}

module.exports = Set