

var Handler = function(db,intercom,client,helper) {

    this.message = function(msg) {
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
}