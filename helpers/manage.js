    
var Manage = function(db, client, Discord) {
    var self = this
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
                    if (params[1] && isNaN(params[1])) params[1] = params[1].replace(/[^0-9]/, '')
                    if (params[1] && params[1] && params[1] >= 1 && params <= 1440) {
                        self.mutes.push( 
                            {
                                member: mem,
                                timeout: setTimeout(function() {
                                    mem.removeRole(config.mutedRole).then().catch(console.error);
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
                    mem.removeRole(config.mutedRole).then().catch(console.error);
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
    
    self.ban = function(msg, ctx, config, cb) {
        if (ctx) {
            ctx = ctx.replace(/\D/g,'')
            msg.guild.ban( ctx, "Banned by " + msg.author.toString()).then(function(user) {
                    cb(null, user.toString() + " was banned.")
                })
                .catch(function(error) {
                    if (error) cb(msg.author.toString() + " couldn't ban that user! Check my permissions!")
                })
        }
        else cb(msg.author.toString() + " couldn't find that user!")
    }
    self.unban = function(msg, ctx, config, cb) {
        if (ctx) {
            ctx = ctx.replace(/\D/g,'')
            msg.guild.unban( ctx, "Unbanned by " + msg.author.toString()).then(function(user) {
                cb(null, user.toString() + " was unbanned.")
            })
            .catch(function(error) {
                console.log(error)
                if (error) cb(msg.author.toString() + " I couldn't unban that ID! Double-check your input and my permissions!")
            })
        }
        else cb(msg.author.toString() + " give some context!")
    }
    
    self.kick = function(msg, ctx, config, cb) {
        ctx = ctx.replace(/\D/g,'')
        var mem = msg.guild.members.find(m => m.id == ctx)
        if (mem) {
            mem.kick("Kicked by " + msg.author.toString()).then(function(mem) {
                cb(null, mem.toString() + " was kicked.")
            })
            .catch(function(error) {
                console.log(error)
                if (error) cb(msg.author.toString() + " I couldn't kick that ID! Double-check your input and my permissions!")
            })
        }
        else cb(msg.author.toString() + " can't find that user!")
    }
    /*
    self.role = function(msg, ctx, config, cb) {
        ctx = ctx.replace(/\D/g,'')
        var mem = msg.guild.members.find(m => m.id == ctx)
        if (mem) {
            if (mem.roles.find(r => r.name == 
            mem.kick("Roled by " + msg.author.toString()).then(function(mem) {
                cb(null, mem.toString() + " was kicked.")
            })
            .catch(function(error) {
                console.log(error)
                if (error) cb(msg.author.toString() + " I couldn't kick that ID! Double-check your input and my permissions!")
            })
        }
        else cb(msg.author.toString() + " give some context!")
    }
    */
}
module.exports = Manage