
/* jshint undef: true, unused: true, asi : true, esversion: 6 */

var ms = require('ms')
var util = require('./util')
var schema = require('./config_schema')
var Auth = require('./auth')
var oauth = new Auth();


var Handler = function(API, Discord,client,intercom,helper,perspective) {
    var self = this
    
    self.react = helper.react
    
    self.message = function(msg) {
        var human = (!msg.author.bot || msg.author.id == client.user.id)
        if (!human) return
        //human includes ohtred himself
        
        if (msg.guild && msg.guild.name != "MKV Syndicate") {
            API.get(msg.guild.id || "none", function(err, config) {
                if (err) {
                    if (err != 404) {
                        console.error(err)
                        return
                    }
                    var proto_newG = new schema(msg.guild)
                    var newG = Object.assign({}, proto_newG)
                    API.set(newG.id, newG, function(erro, res) {
                    if (erro) console.error("Guild renew error: " + erro) })
                    return
                }
                if (!config) return
                
                if (msg.member && (msg.author.bot || msg.member.permissions.has('MANAGE_ROLES') || msg.member.permissions.has('ADMINISTRATOR')))
                { }
                else if (!msg.author.bot && (!config.blacklist || config.blacklist.includes(msg.channel.id)))
                { return }
                self.partitionMessage(msg, config)
            })
        }
        else if (msg.guild === null && msg.content.startsWith("$verify ")) {
            self.verify(msg)
        }
        else if (msg.guild === null && msg.content.startsWith("$bypass ")) {
            self.bypass(msg)
        }
    }
    
    //message ->
    self.verify = function(msg) {
        var params = msg.content.replace("$verify ", "").split(" ")
        if (!params[0] || !params[1] || isNaN(params[0])) return
        
        var gd = client.guilds.find(function(g) { return g.id == params[0] })
        if (!gd) return
        
        var mem = gd.members.find(m => m.id == msg.author.id)
        if (!mem) return
        
        API.get(params[0].trim() || "none", function(err, config) {
            if (err) console.error(err)
            else if (config && config.autorole && config.verification != 0 && config.verification !== undefined) {
                var check_role = mem.roles.find(r => r.id == config.autorole) //check if user has it
                //already
                if (!check_role) {
                    msg.reply("<:doge:522630325990457344> You're already verified!")
                    return
                }
                else {
                    oauth.authenticate(msg.author.id, params[1], config.verification, function(err, res) {
                        if (err) {
                            console.log(err)
                            if (err == 500) msg.reply("<:red_x:520403429835800576> Internal server error!")
                            if (err == 406) msg.reply("<:red_x:520403429835800576> Have a little honesty.")
                            if (err == 404) msg.reply("<:red_x:520403429835800576> You need **" + config.verification + "** connected account(s)! Connect accounts in your settings, then retry.\nhttps://cdn.discordapp.com/attachments/442217150623776768/510016019020906497/unknown-40.png").catch(console.error)
                            if (err == 401) msg.reply("<:red_x:520403429835800576> Incorrect token!\nTry authenticating again at " + oauth.url).catch(console.error)
                            return
                        }
                        //res == 200
                        console.log(res)
                        mem.removeRole(config.autorole, "Alt authentication verified").catch(console.error)
                        msg.reply("<:green_check:520403429479153674> You're in. Never share your token.").catch(console.error)
                        
                        var verify_log = util.getChannel(gd.channels, config.channels.verifylog)
                        if (!verify_log) return
                        var embed = new Discord.RichEmbed()
                        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
                        embed.setThumbnail(msg.author.displayAvatarURL)
                        embed.setDescription(msg.author.toString())
                        embed.setTitle("Alt Verified")
                        embed.setColor("GREEN")
                        embed.setTimestamp()
                        for (var i = 0; i < res.length; i++) {
                            embed.addField(res[i].type, "Name: `"+res[i].name+"`\nID: `"+res[i].id+"`\nVerified: `"+res[i].verified+"`")
                        }
                        verify_log.send(embed).catch(console.error)
                    })
                }
            }
        })
    }
    
    //message ->
    self.bypass = function(msg) {
        var params = msg.content.replace("$bypass ", "").split(" ")
        if (!params[0] || !params[1] || isNaN(params[0])) return
        
        var gd = client.guilds.find(function(g) { return g.id == params[0] })
        if (!gd) return
        
        var mem = gd.members.find(m => m.id == msg.author.id)
        if (!mem) return
        
        API.get(params[0].trim() || "none", function(err, config) {
            if (err) console.error(err)
            else if (config && config.password && config.autorole) {
                var check_role = mem.roles.find(r => r.id == config.autorole) //check if user has it
                //already
                if (!check_role) {
                    msg.reply("<:doge:522630325990457344> You're already verified!")
                    return
                }
                //fail
                if (msg.content != "$bypass " + config.id + " " + config.password) {
                    msg.reply("<:red_x:520403429835800576> Nice try.").catch(console.error)
                    return
                }
                //success
                mem.removeRole(config.autorole, "Password verified").catch(console.error)
                msg.reply("<:green_check:520403429479153674> You're in.").catch(console.error)
                
                var verify_log = util.getChannel(gd.channels, config.channels.verifylog)
                if (!verify_log) return
                var embed = new Discord.RichEmbed()
                embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
                embed.setThumbnail(msg.author.displayAvatarURL)
                embed.setDescription(msg.author.toString())
                embed.setTitle("Alt Verified (Password)")
                embed.setColor("GREEN")
                embed.setTimestamp()
                verify_log.send(embed).catch(console.error)
            }
        })
    }
    
    //message ->
    self.partitionMessage = function(msg, config) {
        if (!msg.author.bot || msg.author.id == client.user.id) intercom.update(msg)
        //console.log(msg.author.username + " [" + msg.guild.name + "]" + "[" + msg.channel.name + "]: " + msg.content)
        
        var gottem = ( msg.isMentioned(client.user) || (config.prefix && msg.content.startsWith(config.prefix)) )
        
        /* R E G U L A R  C O N T E N T */
        if ( gottem && !msg.author.bot ) { //use msg.member.roles
            
            var perm = false
            for (var i = 0; i < config.permissible.length; i++) {
                if (msg.member.roles.find(function(role) { return role.id == config.permissible[i] }) ) perm = true
            }
            
            var ments = ["<@511672691028131872>", "<@!511672691028131872>"]
            
            
            var inp = msg.content.trim();
            
            if (!msg.isMentioned(client.user) && config.prefix) inp = inp.replace(config.prefix, "").trim()
            
            if (inp.startsWith(ments[0])) inp = inp.replace(ments[0], "").trim()
            
            if (inp.startsWith(ments[1])) inp = inp.replace(ments[1], "").trim()
            
            /*var cmd = (inp.indexOf(' ') !== 0) ? inp.slice(0, inp.indexOf(' ')).trim() : inp.slice(inp.length).trim()
            var ctx = (inp.indexOf(' ') !== 0) ? inp.slice(inp.indexOf(' ')).trim() : ""*/
            var spl = inp.split(" ")
            var params = [spl[0], spl.slice(1).join(' ')]
            console.log("["+msg.guild.name+"] " + params[0] + " " + params[1])
            var cmd = params[0].toString()
            var ctx = params[1].toString()
            self.parseMessage(msg, cmd, ctx, perm, config)
        }
        
        /* T E S T I N G */
        else if (msg.content.startsWith("!") && msg.author.id == client.user.id && !msg.isMentioned(client.user)) { //self-sent commands, for testing
            let inp = msg.content.slice(1)
            let cmd = inp.substr(0,inp.indexOf(' '))
            let ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
            
            if (helper.cosmetic[cmd.toLowerCase()]) {
                helper.cosmetic[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                    if (error) msg.channel.send(error).catch( function(error) { console.error(error.message) } )
                    else {
                        msg.channel.send(res).catch( function(error) { console.error(error.message) } )
                    }
                })
            }
            else self.parseMessage(msg, cmd, ctx, true, config)
        }
        
        /* E M B A S S Y */
        else if (!msg.author.bot && config.embassy && config.embassy[msg.channel.id] && msg.channel.topic) {
            API.get(msg.channel.topic.trim(), function(err, other) {
                if (err) {
                    if (err == 404) {
                        //msg.channel.send("Couldn't find the server ID from the description! Please re-embassy this channel.")
                    }
                }
                else if (other && other.embassy) {
                    var otherG = client.guilds.find(function(g) { return g.id == other.id })
                    if (otherG) {
                        var ch = util.getChannelByTopic(otherG.channels, config.id);
                        //ch = util.getChannel(otherG.channels, other.embassy.channel)
                        if (ch && other.embassy[ch.id]) { //check if channel exists and if it is mutually set
                            var cont = msg.cleanContent
                            if (msg.attachments.size > 0) { //append attachments to message
                                var arr = msg.attachments.array()
                                for (var i = 0; i < arr.length; i++) {
                                    cont += " " + arr[i].url
                                }
                            }
                            if (cont && cont.trim()) {
                                new Discord.WebhookClient(other.embassy[ch.id].id, other.embassy[ch.id].token)
                                .edit(msg.author.username, msg.author.avatarURL)
                                .then(function(wh) {
                                    wh.send(cont).catch(console.error);
                                }).catch(console.error)
                            }
                        }
                        else msg.reply("Couldn't connect to that server! Make sure it is mutual, and check my webhook perms")
                    }
                }
            })
        }
        else if (msg.author.id == 301164188070576128 && (msg.content.toLowerCase().includes("joy") || msg.content.includes("😂")) ) {
            msg.reply("😂") //joy
        }
        else if (msg.channel.topic && !msg.author.bot) {
            helper.monitor(msg, config)
        }
    }
    
    //message -> partitionMessage ->
    self.parseMessage = function(msg, cmd, ctx, perm, config) {
        if (msg.attachments.size > 0) { //append attachments to message
            ctx += " " + msg.attachments.array()[0].url
        }
        if (cmd && cmd.trim()) {
            
            if (helper.cosmetic[cmd.toLowerCase()]) { //ANYONE CAN USE
                helper.cosmetic[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                    if (error) msg.channel.send(error).catch( function(error) { console.error(error.message) } )
                    else {
                        msg.channel.send(res).catch( function(error) { console.error(error.message) } )
                    }
                })
            }
            
            else if (helper.func[cmd.toLowerCase()] != null) { //CERTAIN PERMITTED ROLES
                if (!ctx || !ctx.trim()) msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " give context!").catch( function(error) { console.error(error.message) } )
                else if (perm || msg.member.permissions.has('ADMINISTRATOR')) {
                    helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        
                        if (error) msg.channel.send(error).catch( function(error) { console.error(error.message) } )
                        else msg.channel.send(res).catch( function(error) { console.error(error.message) } )
                    })
                } else  msg.channel.send("<:red_x:520403429835800576> " +  msg.author.toString() + " you aren't permitted to do that.").catch( function(error) { console.error(error.message) } )
            }
            
            else if (helper.manage[cmd.toLowerCase()] != null) { //MODERATORS
                //execute settings command
                if (!ctx || !ctx.trim()) msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " give context!").catch( function(error) { console.error(error.message) } )
                else if (msg.member.permissions.has('MANAGE_ROLES')  || msg.member.permissions.has('ADMINISTRATOR')) {
                    helper.manage[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        
                        if (error) msg.channel.send("<:red_x:520403429835800576> " +error).catch( function(error) { console.error(error.message) } )
                        else msg.channel.send("<:green_check:520403429479153674> "+res).catch( function(error) { console.error(error.message) } )
                    })
                } else msg.channel.send("<:red_x:520403429835800576> " +  msg.author.toString() + " you need to be a role manager to do that.").catch( function(error) { console.error(error.message) } )
            }
            else if (helper.set[cmd.toLowerCase()] != null) {
                //execute settings command
                if (!ctx || !ctx.trim()) msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " give context!").catch( function(error) { console.error(error.message) } )
                else if (msg.member.permissions.has('ADMINISTRATOR')) { //ADMIN ONLY
                    helper.set[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        
                        if (error) msg.channel.send("<:red_x:520403429835800576> " +error).catch( function(error) { console.error(error.message) } )
                        else msg.channel.send("<:green_check:520403429479153674> "+res).catch( function(error) { console.error(error.message) } )
                    })
                } else msg.channel.send("<:red_x:520403429835800576> " +  msg.author.toString() + " ask an admin to do that.").catch( function(error) { console.error(error.message) } )
            }
            else if (cmd && ctx && msg.guild.id !== 264445053596991498) {
                console.log(msg.guild.id)
                msg.react("❔");
            }
            else if (msg.content.toLowerCase().includes("help")) {
                helper.help(msg)
            }
            else if (!ctx && msg.guild.id != 264445053596991498) {
                console.log(msg.guild.id)
                msg.react("❔");
            }
        }
        else if (msg.content.toLowerCase().includes("help")) {
            helper.help(msg)
        }
    }
    
    self.reactionRemove = function(reaction, user) {
        if (!user.bot && reaction.message.guild) {
            API.get(reaction.message.guild.id, function(err, config) {
                if (err) {
                    if (err) console.error("reactionRemove err: "+err)
                }
                else if (config) {
                    if (!reaction.message.deleted && !reaction.message.bot&& reaction.message.embeds && reaction.message.embeds[0]) {
                        
                        var already = util.checkConcluded(reaction.message.embeds[0])
                        //util.checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
                        
                        //MOD-VOTING CHANNEL
                        if (reaction.message.channel.id == config.channels.modvoting && reaction.message.embeds.length >= 1 && !already) {
                            
                            var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity)
                            //upvote
                            if ( (reaction._emoji.name == config.upvote || reaction._emoji.toString() == config.upvote) && activity_log ) {
                                activity_log.send(user.toString() + " just withdrew endorsement for *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                            }
                            
                            //downvote
                            else if ( (reaction._emoji.name == config.downvote || reaction._emoji.toString() == config.upvote) && activity_log ) {
                                activity_log.send(user.toString() + " just withdrew opposition for *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                            }
                        }
                    }
                }
            })
        }
    }
    
    self.reactionAdd = function(reaction, user) {
        if (!(!reaction.message.deleted && !user.bot && reaction.message.guild)) return
        
        API.get(reaction.message.guild.id, function(err, config) {
            if (err) {
                if (err) console.error("reactionAdd err: "+err)
            }
            else if (config) {
                self.parseReaction(reaction, user, config)
            }
        })
    }
    
    self.parseReaction = function(reaction, user, config) { //just for added reactions
        if (reaction.message.embeds && reaction.message.embeds[0] && reaction.message.author.id == "511672691028131872") {
            var already = util.checkConcluded(reaction.message.embeds[0])//util.checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //GIF KIOSK
            if (reaction.message.embeds[0].title.startsWith("🔹️ ")) {
                self.react.gif(reaction, user, config)
            }
            
            //MOD-VOTING CHANNEL
            if (!already && reaction.message.channel.id == config.channels.modvoting) {
                
                //activity log channel
                var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity)
                
                //get the proper threshold
                var upvote = config.thresh.mod_upvote;
                var downvote = config.thresh.mod_downvote;
                if (reaction.message.embeds[0].title.includes("MOTION")) {
                    var thresh = Number(reaction.message.embeds[0].title.replace(/\*/g, "").split(" | ")[1])
                    upvote = Number(thresh);
                    downvote = Number(thresh);
                }
                
                //upvote
                if (reaction._emoji.name == config.upvote || reaction._emoji.toString() == config.upvote) {
                    if (reaction.count >= upvote) {
                        helper.react.upvote(reaction, user, config);
                    }
                    if (activity_log) {
                        activity_log.send(user.toString() + " just endorsed *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                    }
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote || reaction._emoji.toString() == config.downvote) {
                    if (reaction.count >= downvote) {
                        helper.react.downvote(reaction, user, config);
                    }
                    if (activity_log) {
                        activity_log.send(user.toString() + " just opposed *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                    }
                }
            }   
        }
        //FEEDBACK CHANNEL
        else if ((reaction._emoji.name == config.upvote || reaction._emoji.toString() == config.upvote) && reaction.message.channel.id == config.channels.feedback && !util.checkReact(reaction.message.reactions.array())) {
            if (reaction.count >= config.thresh.petition_upvote) self.react.plebvote(reaction, user, config)
        }
        //REPORTABLE CHANNELS
        else if (config.reportable.indexOf(reaction.message.channel.id) != -1) { 
            if (!config.report_time) config.report_time = 60
            if ((reaction._emoji.name == config.report || reaction._emoji.toString() == config.report) && reaction.count == config.thresh.report_vote) {
                self.react.report(reaction, user, config)
            }
        }
    }
    
    self.guildCreate = function(guild) { //invited to new guild
        console.log("Added to new server: "+guild.name)
        var proto_newG = new schema(guild)
        var newG = Object.assign({}, proto_newG)
        API.set(newG.id, newG, function(err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    }
    
    self.guildRemove = function(guild) { //removed from a guild
        console.log("Removed from a server: "+guild.name)
        //TBD::: REMOVE FROM DATABASE
        /*db[guild.id] = null*/
    }
    
    self.presenceUpdate = function(oldMember, newMember) {
        if (oldMember.user.bot) return
        API.get(oldMember.guild.id, function(err, config) {
            if (err) return
            if (!config || !config.counter) return
            
            var channel = newMember.guild.channels.array().find(function(ch) {
                return ch.name.startsWith("🔺") || ch.name.startsWith("🔻") 
            })
            if (!channel) return
            
            var old = parseInt(channel.name.replace(/\D/g,''))
            var len = newMember.guild.members.filter(m => m.presence.status === 'online' && !m.user.bot).size
            var diff = Math.abs(old - len)
            var emo = (old < len) ? "🔺  " : "🔻  "
            if (diff >= config.counter)  channel.setName(emo + len + " online")
            
            else if (!(/\d/.test(channel.name))) channel.setName("🔺  " + len + " online") //if no numbers found
        })
        //ch.setTopic(len + " users online")
    }
    
    self.guildMemberAdd = function(member) {
        if (!member.user.bot) {
            API.get(member.guild.id, function(err, config) {
                if (err) {
                    console.error(err)
                    return
                }
                if (config.lockdown && config.lockdown != 0) {
                    var lockdown = Number(config.lockdown)
                    switch(lockdown) {
                        case 1:
                            console.log("Lockdown auto-action: " + config.lockdown)
                            member.kick("Autokicked by lockdown mode").catch(console.error)
                            break;
                        case 2:
                            console.log("Lockdown auto-action: " + config.lockdown)
                            member.ban({reason:"Autobanned by lockdown mode"}).catch(console.error)
                            break;
                    }
                }
                else if (config.autorole) {
                    if (config.verify_age) {
                        var now = Date.now()
                        var then = ms(member.user.createdTimestamp)
                        var min = ms(config.verify_age)
                            
                        console.log("Then: " + then)
                        console.log("Now: " + now)
                        console.log("Min: " + min)
                        console.log("Now - then = " + (now - then))
                        console.log((now - then >= min))
                        if (now - then >= min) {
                            var verify_log = util.getChannel(member.guild.channels, config.channels.verifylog)
                            if (verify_log) {
                                var embed = new Discord.RichEmbed()
                                embed.setDescription(member.toString())
                                embed.setAuthor(member.user.tag, member.user.avatarURL)
                                embed.setThumbnail(member.user.avatarURL)
                                embed.setTimestamp()
                                embed.setTitle("Alt Verified (Account Age)")
                                embed.setColor("GREEN")
                                embed.setTimestamp()
                                
                                verify_log.send(embed).catch(console.error)
                                return
                                //verify_log.send("User " + member.toString() + " bypassed verification, older than " + config.verify_age).catch(console.error)                                return
                            }
                            else return
                        }
                    }
                    member.setRoles([config.autorole]).then(function() {
                        if (!config.verification || config.verification == 0) return
                        member.createDM().then(channel => {
                            channel.send(`**${config.name}** has anti-alt protection! You must connect to **${config.verification}** external accounts** to be verified.`).catch(console.error)
                            channel.send(`If you have **${config.verification}** connections, DM me with *$verify ${config.id} [token]*.`).catch(console.error)
                            channel.send(`To get your token, follow this link: ${oauth.url}`).catch(console.error)
                        }).catch(console.error)
                        
                        var verify_log = util.getChannel(member.guild.channels, config.channels.verifylog)
                        if (!verify_log) return
                        
                        var embed = new Discord.RichEmbed()
                        embed.setTitle("Verification Begin")
                        embed.setDescription(member.toString())
                        embed.setAuthor(member.user.tag, member.user.avatarURL)
                        embed.setThumbnail(member.user.avatarURL)
                        embed.addField("Created At", member.user.createdAt)
                        embed.setColor("RED")
                        embed.setTimestamp()
                        
                        verify_log.send(embed).catch(console.error)
                        
                    }).catch(console.error);
                }
            })
        }
    }
}

module.exports = Handler