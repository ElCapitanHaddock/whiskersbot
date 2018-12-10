    
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
module.exports = Manage