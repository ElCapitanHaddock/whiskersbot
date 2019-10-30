    
var ms = require('ms')
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.AUDIT_KEY);

var Discord = require('discord.js')
var util = require('../util')

const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g


var Manage = function(API, client) {
    var self = this
    
    self.defaultError = " Incorrect syntax!\nTry *@whiskers help*"
    
    self.mutes = []
    self.mute = (msg, ctx, config, cb) => {
        var user
        var users = msg.mentions.users.array()
        for (var i = 0; i < users.length; i++) {
            if (users[i].id !== client.user.id) user = users[i]
        }
        if (!user) {
            cb(msg.author.toString() + self.defaultError)
            return
        }
        
        var mem = msg.guild.members.find(m => m.id == user.id)
        if (!mem) return
        
        for (var i = 0; i < self.mutes.length; i++) { //override/cancel previous mutes
            if (self.mutes[i].member == mem) {
                clearTimeout(self.mutes[i].timeout)
                self.mutes.splice(i,1)
            }
        }
        if (config.mutedRole) {
            var params = ctx.trim().split(" ")
            
            mem.addRole(config.mutedRole, "Muted by " + msg.author.toString())
            .then(function() {
                if (params[1]) {
                    params[1] = params.slice(1).join(" ")
                    try {
                        var time = ms(params[1])
                        if (time === undefined) {
                            cb("Invalid input. Note: the biggest unit is **days**")
                            return
                        }
                        self.mutes.push( 
                            {
                                member: mem,
                                timeout: setTimeout(function() {
                                    mem.removeRole(config.mutedRole).then().catch(console.error);
                                },  time)
                            }
                        )
                        cb(null, mem.toString() + " was muted for " + ms(ms(params[1]), { long: true }) )
                    } catch(error) { cb("Bad input! Muted indefinitely.") }
                } else cb(null, mem.toString() + " was muted.")
            })
            .catch(error => {
                cb("Unable to mute! Make sure I have role manager permissions.")
            })
        }
        else {
            cb(
                "**The muted role could not be found. Follow this syntax:**\n"
                +"`@whiskers mutedrole [role]`"
            )
        }
    }
    self.m = self.mute
    
    self.unmute = (msg, ctx, config, cb) => {
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
                    mem.removeRole(config.mutedRole).then(function() {
                        cb(null, mem.toString() + " was unmuted.")
                    }).catch(error => {
                        cb("Unable to unmute! Make sure I have role manager permissions.")
                    });
                }
                else cb(" that user is already unmuted!")
            }
        }
        else if (!config.mutedRole) {
            cb(
                "**The muted role could not be found. Follow this syntax:**"
                +"```@whiskers mutedrole role```" )
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    self.unm = self.unmute
    
    self.ban = (msg, ctx, config, cb) => {
        if (!msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('BAN_MEMBERS')) {
            cb(msg.author.toString() + " you do not have the ban/unban members permission!")
            return
        }
        if (ctx) {
            ctx = ctx.replace(/\D/g,'')
            msg.guild.ban(ctx, "Sanctioned ban by " + msg.author.toString() + ", antinuke ID|" + cryptr.encrypt(msg.guild.id)).then(function(user) {
                    cb(null, user.toString() + " was banned.")
                })
                .catch(function(error) {
                    if (error) cb(msg.author.toString() + " couldn't ban that user! Check my permissions!")
                })
        }
        else cb(msg.author.toString() + " couldn't find that user!")
    }
    self.unban = (msg, ctx, config, cb) => {
        if (!msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('BAN_MEMBERS')) {
            cb(msg.author.toString() + " you do not have the ban/unban members permission!")
            return
        }
        if (ctx) {
            ctx = ctx.replace(/\D/g,'')
            msg.guild.unban( ctx, "Unbanned by " + msg.author.toString()).then(function(user) {
                cb(null, user.toString() + " was unbanned.")
            })
            .catch(function(error) {
                if (error) cb(msg.author.toString() + " I couldn't unban that ID! Double-check your input and my permissions!")
            })
        }
        else cb(msg.author.toString() + " give some context!")
    }
    
    self.kick = (msg, ctx, config, cb) => {
        if (!msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('KICK_MEMBERS')) {
            cb(msg.author.toString() + " you do not have the kick members permission!")
            return
        }
        ctx = ctx.replace(/\D/g,'')
        var mem = msg.guild.members.find(m => m.id == ctx)
        if (mem) {
            mem.kick("Kicked by " + msg.author.toString()).then(function(mem) {
                cb(null, mem.toString() + " was kicked.")
            })
            .catch(function(error) {
                if (error) cb(msg.author.toString() + " I couldn't kick that ID! Double-check your input and my permissions!")
            })
        }
        else cb(msg.author.toString() + " can't find that user!")
    }
    
    self.role = (msg, ctx, config, cb) => {
        if (!msg.member.permissions.has('ADMINISTRATOR') && !msg.member.permissions.has('MANAGE_ROLES')) {
            cb(msg.author.toString() + " you do not have the manage roles permission!")
            return
        }
        var params = ctx.split(" ")
        if (params.length >= 2) {
            var me = params[0].replace(/\D/g,'');
            var ro = params.slice(1).join(" ");
            
            var mem = msg.guild.members.find(m => m.id == me);
            var diff_role = msg.guild.roles.find( r => r.name.toLowerCase().startsWith(ro.toLowerCase()) || r.id == ro.replace(/\D/g,'') )
            if (mem && diff_role) {
                
                //checks if the role is higher or equal to the command initiator
                if (msg.guild.owner.user.id !== msg.author.id && diff_role.comparePositionTo(msg.member.highestRole) >= 0) {
                    cb(msg.author.toString() + " that role is higher than or equal to your current status!")
                    return
                }
                var check_role = mem.roles.find(r => r.id == diff_role.id) //check if user has it
                if (!check_role) {
                    if (diff_role.hasPermission('ADMINISTRATOR') && msg.guild.owner.user.id !== msg.author.id) {
                        cb(msg.author.toString() + " only the server owner can set admin roles!")
                    }
                    else {
                        mem.addRole(diff_role.id, "Roled by " + msg.author.toString()).then(function(mem) {
                            cb(null, mem.toString() + " was added to " + diff_role.name)
                        })
                        .catch(function(error) {
                            if (error) cb(msg.author.toString() + " I couldn't role that user! Check my perms.")
                        })
                    }
                }
                
                //else if (mem.permissions.has('ADMINISTRATOR') && msg.guild.owner !== msg.author.id) cb(msg.author.toString() + " that user is an admin!")
                
                else { //has the role, remove it
                    if (diff_role.hasPermission('ADMINISTRATOR') && msg.guild.owner.user.id !== msg.author.id) {
                        cb(msg.author.toString() + " only the server owner can set admin roles!")
                    }
                    else {
                        mem.removeRole(diff_role.id, "Unroled by " + msg.author.toString()).then(function(mem) {
                            cb(null, mem.toString() + " was removed from " + check_role.name)
                        })
                        .catch(function(error) {
                            if (error) cb(msg.author.toString() + " I couldn't unrole that user! Check my perms.")
                        })
                    }
                }
            }
            else if (!mem) cb(msg.author.toString() + " couldn't find that user!")
            else cb(msg.author.toString() + " couldn't find that role!")
        } else cb(msg.author.toString() + " give some context!")
    }
    
    self.warn = (msg, ctx, config, cb) => {
        var params = ctx.split(" ")
        if (params.length >= 2) {
            var member = params[0].replace(/\D/g,'');
            var message = params.slice(1).join(" ");
            var mem = msg.guild.members.find(m => m.id == member);
            if (mem) {
                mem.send("⚠️ Warning From **" + msg.guild.name + "**:"  + message)
                msg.react("✅")
            }
            else cb(msg.author.toString() + " couldn't find that user!")
        } else cb(msg.author.toString() + " give some context!")
    }
    
    self.wash = (msg, ctx, config, cb) => {
        if (!isNaN(ctx) && ctx > 0 && ctx <= 100) {
            
            msg.channel.bulkDelete(ctx)
              .then(messages => console.log(`Bulk deleted ${messages.size} messages.`))
              .catch(error => { cb("Error deleting messages. I must have manage message permissions, and the messages must be under 14 days old!") });
        }
        else cb("Please include a valid number 1-100!")
    }
    
    self.purge = self.wash
    
    self.blacklist = (msg, ctx, config, cb) => {
        if (msg.mentions.channels.size !== 0) {
            var ch_id = msg.mentions.channels.first().id
            if (config.blacklist && config.blacklist.indexOf(ch_id) !== -1) {
                cb(msg.author.toString() + " not to worry! That channel is already blacklisted.")
            }
            else {
                if (!config.blacklist) config.blacklist = [];
                config.blacklist.push(ch_id)
                API.update(config.id, {blacklist: config.blacklist}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<#" + ch_id + "> succesfully blacklisted!")
                })
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.unblacklist = (msg, ctx, config, cb) => {
        if (msg.mentions.channels.size !== 0) {
            var ch_id = msg.mentions.channels.first().id
            var index = config.blacklist.indexOf(ch_id)
            if (index !== -1) {
                config.blacklist.splice(config.blacklist.indexOf(ctx),1)
                API.update(config.id, {blacklist: config.blacklist}, function(err,res) {
                    if (err) cb(err)
                    else cb(null, "<#" + ch_id + "> succesfully unblacklisted!")
                })
            }
            else {
                cb(msg.author.toString() + " couldn't find that channel! Double-check blacklisted channels with @whiskers *about server*")
            }
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    
    self.poll = (msg, ctx, config, cb) => {
        const collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 300000 }); //5 min
    
        var params = {
            id: msg.author.id,
            step: 0,
            title:"",
            emotes: [],
            desc: "",
            channel:null,
        }
        
        msg.reply("Please enter poll title `(type exit to cancel at any point)`")
        
        collector.on('collect', message => {
            if (message.author.id == params.id) {
                
                var cont = message.cleanContent.slice(0,256)
        
                if (cont.trim().toLowerCase() == 'exit' || cont.trim().toLowerCase() == '>poll') {
                    collector.stop()
                    return
                }
                
                switch(params.step) {
                    
                    case 0:
                        params.title = cont
                        params.step++
                        message.channel.send("Please enter a space-separated list of emojis to represent each poll option (up to 10).")
                        break;
                    case 1:
                        var splitter = message.content.split(' ')
                        let optEmotes = [...new Set(splitter)]; //removes duplicates
                        
                        if (optEmotes.length == 0 || optEmotes.length > 10) {
                            message.channel.send("Please enter between 1 and 10 emotes!")
                            return
                        }
                        var localEmotes = message.guild.emojis.array().map(e=>e.toString())
                        
                        var found = true
                        for (var i = 0; i < optEmotes.length; i++) {
                            //checks if fulfills default emoji regex, if not checks if it is a local emote
                            if (!optEmotes[i].match(emojiRegex) && !localEmotes.includes(optEmotes[i])) found = false
                        }
                        
                        if (!found) { //if at least one not found
                            message.channel.send("Re-enter using only custom emotes from this server and default emojis!")   
                            return
                        }
                        params.emotes = optEmotes
                        params.step++
                        message.channel.send("Please enter a poll description.")
                        
                        break;
                        
                    case 2:
                        params.desc = cont
                        params.step++
                        message.channel.send("Please enter the channel to send the poll to.")
                        break;
                    case 3:
                        if (message.mentions.channels.size == 0) {
                            message.channel.send("Please enter a valid channel mention using #.")
                            return
                        }
                        
                        params.channel = message.mentions.channels.first().id
                        collector.stop()
                        break;
                }
                
            }
        })
        
        collector.on('end', collected => {
            if (params.channel === null) {
                msg.channel.send("Poll creation cancelled.")
                return
            }
            
            var ch = util.getChannel(msg.guild.channels,params.channel);
            
            var embed = new Discord.RichEmbed()
            embed.setTimestamp()
            
            embed.setTitle(`**POLL :: ** ${params.title}`)
            embed.setDescription(params.desc)
            embed.addField("Options", params.emotes.join(" "))
            
            ch.send(embed).then(function(emb) {
                
                for (var i = 0; i < params.emotes.length; i++) {
                    
                    if (params.emotes[i].match(emojiRegex)) {
                        emb.react(params.emotes[i]).catch(console.error)
                    }
                    else {
                        var id = params.emotes[i].slice(params.emotes[i].lastIndexOf(":")+1,-1)
                        var emote = msg.guild.emojis.get(id)
                        emb.react(emote).catch(console.error)
                    }
                }
            }).catch(console.error)
        });
    }
}
module.exports = Manage