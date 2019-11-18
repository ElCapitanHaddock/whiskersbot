
//deals mainly with interacting with Firebase

var util = require('../util')
var ms = require('ms')

var Set = function(API, client) {
    /*C O N F I G U R A T I O N  A N D  M O D  O N L Y
    emote, config, permit, unpermit, reportable, unreportable, embassy*/
    var self = this
    self.defaultError = " Incorrect syntax!\nType in *@whiskers about setup* to get config commands\nType in *@whiskers about server* to get the current config"
    
    self.mutedrole = (msg, ctx, config, cb) => {
        if (ctx) {
            var ro = ctx
            
            var diff_role = msg.guild.roles.find( r => r.name.toLowerCase().startsWith(ro.toLowerCase()) || r.id == ro.replace(/\D/g,'') )
            if (diff_role && diff_role.id == config.mutedRole) {
                config.mutedRole = ""
                API.update(config.id, {mutedRole: ""}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + diff_role.id + "> removed as the muted role.")
                })
            }
            else if (diff_role) {
                config.mutedRole = diff_role.id
                API.update(config.id, {mutedRole: diff_role.id}, function(err,res) {
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
    
    self.autorole = (msg, ctx, config, cb) => {
        if (ctx) {
            var ro = ctx
            
            var diff_role = msg.guild.roles.find( r => r.name.toLowerCase().startsWith(ro.toLowerCase()) || r.id == ro.replace(/\D/g,'') )
            if (diff_role && diff_role.id == config.autorole) {
                config.autorole = ""
                API.update(config.id, {autorole: ""}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + diff_role.id + "> removed as the autorole.")
                })
            }
            else if (diff_role) {
                config.autorole = diff_role.id
                API.update(config.id, {autorole: diff_role.id}, function(err,res) {
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
    
    self.channel = (msg, ctx, config, cb) => {
        var params = ctx.trim().split(" ")
        if (params[0]) {
            var types =
                [
                    "reportlog",
                    "verifylog",
                    "feedback",
                    "modvoting",
                    "modannounce",
                    "modactivity"
                ]
            if (types.indexOf(params[0]) !== -1) {
                if (msg.mentions.channels.size !== 0) {
                    var ch_id = msg.mentions.channels.first().id
                    
                    var type = types[types.indexOf(params[0])]
                    if (ch_id == config['channels'][type]) {
                        config['channels'][type] = ""
                        API.update(config.id, {channels: config.channels}, function(err,res) {
                            if (err) cb(err)
                            else cb(null, "**" + type + "** channel successfully cleared.")
                        })
                        return
                    }
                    config['channels'][type] = ch_id
                    API.update(config.id, {channels: config.channels}, function(err,res) {
                        if (err) cb(err)
                        else cb(null, "**" + type + "** channel successfully set to <#" + ch_id +">")
                    })
                }
                else cb(msg.author.toString() + " please include a channel mention!")
            }
            else cb(msg.author.toString() + self.defaultError)
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.emote = (msg, ctx, config, cb) => {
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
                var se = {}
                se[type] = params[1]
                API.update(config.id, se, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "**" + type + "** emote successfully set to **" + params[1] +"**")
                })
            }
            else cb(msg.author.toString() + self.defaultError)
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.prefix = (msg, ctx, config, cb) => {
        if (ctx && ctx.trim().length !== 0) {
            ctx = ctx.replace(/\s/g,'').slice(0,3)
            config.prefix = ctx
            API.update(config.id, {prefix: ctx}, function(err,res) {
                if (err) cb(err)
                else cb(null, "The prefix was successfully set to **" + ctx +"**")
            })
        } 
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.config = (msg, ctx, config, cb) => {
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
                        else cb(null, "**" + type + "** threshold successfully set to **" + params[1] +"**")
                    })
                } else cb(msg.author.toString() + " your threshold needs to be a number greater than 0")
            }
            else cb(msg.author.toString() + self.defaultError)
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.permit = (msg, ctx, config, cb) => {
        if (ctx) {
            for (var i = 0; i < config.permissible.length; i++) {
                if ( !msg.guild.roles.find( r => r.id == config.permissible[i] ) ) {
                    config.permissible.splice(i,1)
                }
            }
            
            var ro = ctx
            var diff_role = msg.guild.roles.find( r => r.name.toLowerCase().startsWith(ro.toLowerCase()) || r.id == ro.replace(/\D/g,'') )
            if (!diff_role) {
                cb("I couldn't find that role!")
            }
            else if (diff_role && config.permissible.indexOf(diff_role.id) !== -1) {
                cb("Not to worry! That role is already permitted to talk to me.")
            }
            else {
                config["permissible"].push(diff_role.id)
                API.update(config.id, {permissible: config.permissible}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + diff_role.id + "> successfully added to the list of roles that can talk to me.")
                })
            }
        }
        else cb("Please include a role to add!")
    }
    
    self.unpermit = (msg, ctx, config, cb) => {
        if (ctx) {
            for (var i = 0; i < config.permissible.length; i++) {
                if ( !msg.guild.roles.find( r => r.id == config.permissible[i] ) ) {
                    config.permissible.splice(i,1)
                }
            }
            
            var ro = ctx
            var diff_role = msg.guild.roles.find( r => r.name.toLowerCase().startsWith(ro.toLowerCase()) || r.id == ro.replace(/\D/g,'') )
            
            if (config.permissible.indexOf(ctx) !== -1) { //just in case they deleted the role
               config["permissible"].splice(config.permissible.indexOf(ctx), 1)
                API.update(config.id, {permissible: config.permissible}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + ctx + "> successfully removed from the list of roles that can talk to me.")
                })
            }
            else if (!diff_role) {
                cb("I couldn't find that role!")
            }
            else if (diff_role && config.permissible.indexOf(diff_role.id) !== -1) {
                config["permissible"].splice(config.permissible.indexOf(diff_role.id), 1)
                API.update(config.id, {permissible: config.permissible}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<@&" + ctx + "> successfully removed from the list of roles that can talk to me.")
                })
            }
            else {
                cb("That role is already not permitted!")
            }
        }
        else cb("Please include a role to add!")
    
        //else cb(msg.author.toString() + self.defaultError)
    }
    
    self.verification = (msg, ctx, config, cb) => {
        if (!ctx || (ctx != 0 && ctx != 1 && ctx != 2 && ctx != 3 && ctx != 4)) {
            cb("Please include a verification level (1 through 4). For more info, use @whiskers about verification")
            return
        }
        config.verification = ctx
        API.update(config.id, {verification: ctx}, function(err,res) {
            if (err) cb(err)
            else cb(null, " verification mode set to **" + ctx + "**")
        })
    }
    
    self.verify_age = (msg, ctx, config, cb) => {
        if (!ctx) {
            cb("Please include a valid time, e.g. 5 days, or 'reset' to remove it.")
            return
        }
        if (ctx.toLowerCase() == 'reset') {
            config.verify_age = ""
            API.update(config.id, {verify_age: ""}, function(err,res) {
                if (err) cb(err)
                else cb(null, " verification age reset.")
            })
            return
        }
        try {
            var time = ms(ctx)
            if (time === undefined) {
                cb("Invalid input. Note: the biggest unit is **days**")
                return
            }
            API.update(config.id, {verify_age: ctx}, function(err,res) {
                if (err) cb(err)
                else cb(null, " verification age set to **" + ctx + "**")
            })
        }
        catch(error) {
            cb("Invalid input!")
        }
    }
    
    self.reportable = (msg, ctx, config, cb) => {
        if (msg.mentions.channels.size !== 0) {
            
            for (var i = 0; i < config.reportable.length; i++) {
                if (!util.getChannel(msg.guild.channels,config.reportable[i])) {
                    config.reportable.splice(i,1)
                }
            }
            
            var ch_id = msg.mentions.channels.first().id
            
            if (config.reportable.indexOf(ch_id) !== -1) {
                config["reportable"].splice(config.reportable.indexOf(ch_id),1)
                API.update(config.id, {reportable: config.reportable}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<#" + ctx + "> removed from the list of reportable channels.")
                })
                //cb(msg.author.toString() + " not to worry! That channel is already reportable.")
            }
            else {
                config.reportable.push(ch_id)
                API.update(config.id, {reportable: config.reportable}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<#" + ch_id + "> successfully added to the list of reportable channels.")
                })
            }
        }
        else cb("To set a reportable channel, please use a mention.")
    }
    
    self.unreportable = (msg, ctx, config, cb) => {
        if (msg.mentions.channels.size !== 0) {
            
            for (var i = 0; i < config.reportable.length; i++) {
                if (!util.getChannel(msg.guild.channels,config.reportable[i])) {
                    config.reportable.splice(i,1)
                }
            }
            
            var ch_id = msg.mentions.channels.first().id
            
            if (config.reportable.indexOf(ch_id) !== -1) {
                config["reportable"].splice(config.reportable.indexOf(ch_id),1)
                API.update(config.id, {reportable: config.reportable}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<#" + ctx + "> removed from the list of reportable channels.")
                })
            }
            else {
                cb("That channel isn't in the reportable list!")
            }
        //else cb(msg.author.toString() + self.defaultError)
        }
        else cb("To set a reportable channel, please use a mention.")
    }
    
    self.counter = (msg, ctx, config, cb) => {
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
    
    self.report_time = (msg, ctx, config, cb) => {
        if (ctx) {
            try {
                var num = ms(ctx)
                if (!num.isNaN && num >= 5000) {
                    config.report_time = ctx
                    API.update(config.id, {report_time: ctx}, function(err,res) {
                        if (err) cb(err)
                        else cb(null, " successfully changed the report mute time to **" + ctx + "**")
                    })
                }
                else cb(msg.author.toString() + " sorry, you need to pick a time longer than 5 seconds!")
            }
            catch(error) {
                cb("Invalid input!")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.alert = (msg, ctx, config, cb) => {
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
    
    self.embassy = (msg, ctx, config, cb) => {
        if (msg.mentions.channels.size !== 0) {
            var first = msg.mentions.channels.first()
            var ch_id = first.id
            
            first.createWebhook("whiskers_Embassy", "https://i.imgur.com/RiXAyXF.png")
            .then(function(wb) {
                if (config.embassy == undefined) config.embassy = {}
                
                var keys = Object.keys(config.embassy)
                for (var i = 0; i < keys.length; i++) {
                    if (!util.getChannel(msg.guild.channels,keys[i])) {
                        config.embassy[keys[i]] == null
                    }
                }
                
                config.embassy[ch_id] = {id: wb.id, token: wb.token}
                
                API.update(config.id, {embassy: config.embassy}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "**Embassy successfully opened at <#" + ch_id +">**");
                })
            }).catch(function(err) {
                if (err) cb(msg.author.toString() + " I couldn't set the webhook! Check my perms.")
            })
        }
        else cb(msg.author.toString() + " please include a channel mention!")
    }
    
    self.lockdown = (msg, ctx, config, cb) => {
        if (ctx && !isNaN(ctx) && ctx == 0 || ctx == 1 || ctx == 2) {
            config.lockdown = ctx
            API.update(config.id, {lockdown: ctx}, function(err,res) {
                if (err) cb(err)
                else cb(null, " successfully put lockdown on Level **" + ctx + "**")
            })
        }
        else cb(msg.author.toString() + " please include a number between 0 and 2!")
    }
    
    self.password = (msg, ctx, config, cb) => {
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