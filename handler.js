
/* jshint undef: true, unused: true, asi : true, esversion: 6 */

var Discord = require('discord.js')
var ms = require('ms')
var util = require('./util')
var schema = require('./config_schema')
var Auth = require('./auth')
var oauth = new Auth();

const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.AUDIT_KEY);

var Handler = function(API,client,helper,perspective) {
    var self = this
    
    self.react = helper.react
    
    self.message = function(msg) {
        
        if (msg.author.bot && msg.author.id != client.user.id) return
        
        if (msg.guild && msg.guild.available && msg.guild.name != "MKV Syndicate") {
            API.get(msg.guild.id || "none", function(err, config) {
                if (err) {
                    if (err !== 404) {
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
                
                var del = false
                
                if (config.censors && config.reportable.indexOf(msg.channel.id) != -1) {
                
                    for (var i = 0; i < config.censors.length; i++) {
                        if (msg.content.toLowerCase().includes(config.censors[i].toLowerCase())) {
                            del = true
                            break
                        }
                    }
                }
                
                if (msg.author.id == 301164188070576128 && (msg.content.toLowerCase().includes("joy") || msg.content.includes("😂")) ) {
                    msg.reply("😂") //joy
                }
                
                if (msg.author.id == 580316928015597589 && msg.content.toLowerCase().includes("shotgun")) {
                    msg.channel.send("https://media.discordapp.net/attachments/528927344690200576/662360769626898432/b1006f5467e8f82d2b49c5a197d91eab-1.mp4")
                }
                
                if (msg.member && (msg.author.bot || msg.member.permissions.has('MANAGE_ROLES') || msg.member.permissions.has('ADMINISTRATOR')))
                { }
                
                else if (del) {
                    msg.delete().then(msg => {
                        //console.log("Automod succesfully deleted.")
                    }).catch( function(error) { console.error(error) } )
                    return
                }
                
                else if (!msg.author.bot && (!config.blacklist || config.blacklist.includes(msg.channel.id))) return
                
                self.partitionMessage(msg, config)
            })
        }
        else if (msg.guild === null && msg.content.startsWith("hello")) {
            msg.reply("Hello!");
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
        
        var gd = client.guilds.cache.find(function(g) { return g.id == params[0] })
        if (!gd) return
        var mem = gd.members.cache.find(m => m.id == msg.author.id)
        if (!mem) return
        
        API.get(params[0].trim() || "none", function(err, config) {
            if (err) console.error("ERROR:::: " + err)
            
            //removed config.verification != 0
            else if (config && config.autorole && config.verification !== undefined) {
                var check_role = mem.roles.cache.find(r => r.id == config.autorole) //check if user has it
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
                            else if (err == 406) msg.reply("<:red_x:520403429835800576> Have a little honesty.")
                            else if (err == 404) msg.reply("<:red_x:520403429835800576> You need **" + config.verification + "** connected account(s)! Connect accounts in your settings, then retry.\nhttps://cdn.discordapp.com/attachments/442217150623776768/510016019020906497/unknown-40.png").catch(console.error)
                            else if (err == 401) msg.reply("<:red_x:520403429835800576> Incorrect token!\nTry authenticating again at " + oauth.url)
                            else msg.reply("Internal error <:red_x:520403429835800576> : `" + err + "`\n Sorry for any inconvenience!")
                            return
                        }
                        //res == 200
                        console.log(res)
                        mem.removeRole(config.autorole, "Alt authentication verified").catch(function(error) {
                            if (error) {
                                msg.reply("<:red_x:520403429835800576> You should be verified, but there was an error removing the verification role from you!\nIf it's a permissions error, try contacting the mods of the server you are trying to verify on to check whiskers' permissions.\nYou can also try joining the support server: https://discord.gg/HnGmt3T\n`Error: " + error + "`")
                            }
                        })
                        msg.reply("<:green_check:520403429479153674> You're in. Never share your token.").catch(error => console.log("Verify success reply error: " + error))
                        
                        var verify_log = util.getChannel(gd.channels, config.channels.verifylog)
                        if (!verify_log) return
                        var embed = new Discord.MessageEmbed()
                        embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
                        embed.setThumbnail(msg.author.displayAvatarURL)
                        embed.setDescription(msg.author.toString())
                        embed.setTitle("Alt Verified")
                        embed.setColor("GREEN")
                        embed.setTimestamp()
                        for (var i = 0; i < res.length; i++) {
                            embed.addField(res[i].type, "Name: `"+res[i].name+"`\nID: `"+res[i].id+"`\nVerified: `"+res[i].verified+"`")
                        }
                        verify_log.send(embed).catch(error => console.log("Verify log send error: " + error))
                    })
                }
            }
        })
    }
    
    //message ->
    self.bypass = function(msg) {
        var params = msg.content.replace("$bypass ", "").split(" ")
        if (!params[0] || !params[1] || isNaN(params[0])) return
        
        var gd = client.guilds.cache.find(function(g) { return g.id == params[0] })
        if (!gd) return
        
        var mem = gd.members.cache.find(m => m.id == msg.author.id)
        if (!mem) return
        
        API.get(params[0].trim() || "none", function(err, config) {
            if (err) console.error(err)
            else if (config && config.password && config.autorole) {
                var check_role = mem.roles.cache.find(r => r.id == config.autorole) //check if user has it
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
                var embed = new Discord.MessageEmbed()
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
        
        //if (!msg.author.bot || msg.author.id == client.user.id) intercom.update(msg)
        //console.log(msg.author.username + " [" + msg.guild.name + "]" + "[" + msg.channel.name + "]: " + msg.content)
        
        //command?
        var gottem = ( msg.mentions.has(client.user) || (config.prefix && msg.content.startsWith(config.prefix)) )
        
        /* R E G U L A R  C O N T E N T */
        if ( gottem && !msg.author.bot ) { //use msg.member.roles
            
            var perm = false
            for (var i = 0; i < config.permissible.length; i++) {
                if (msg.member.roles.cache.find(function(role) { return role.id == config.permissible[i] }) ) perm = true
            }
            
            var ments = ["<@528809041032511498>", "<@!528809041032511498>"]
            
            
            var inp = msg.content.trim();
            
            if (!msg.mentions.has(client.user) && config.prefix) inp = inp.replace(config.prefix, "").trim()
            
            if (inp.startsWith(ments[0])) inp = inp.replace(ments[0], "").trim()
            
            if (inp.startsWith(ments[1])) inp = inp.replace(ments[1], "").trim()
            
            /*var cmd = (inp.indexOf(' ') !== 0) ? inp.slice(0, inp.indexOf(' ')).trim() : inp.slice(inp.length).trim()
            var ctx = (inp.indexOf(' ') !== 0) ? inp.slice(inp.indexOf(' ')).trim() : ""*/
            var spl = inp.split(" ")
            var params = [spl[0], spl.slice(1).join(' ')]
            
            //console.log("Command: ["+msg.guild.name+"] " + params[0] + " " + params[1])
            
            var cmd = params[0].toString()
            var ctx = params[1].toString()
            self.parseMessage(msg, cmd, ctx, perm, config)
        }
        
        /* T E S T I N G */
        else if (msg.content.startsWith("!") && msg.author.id == client.user.id && !msg.mentions.has(client.user)) { //self-sent commands, for testing
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
                    
                    var otherG = client.guilds.cache.find(function(g) { return g.id == other.id })
                    
                    //if guild is not in this shard, broadcast to other shards
                    if (!otherG) {
                        var cont = msg.cleanContent
                        
                        if (msg.attachments.size > 0) { //append attachments to message
                            var arr = msg.attachments.array()
                            for (var i = 0; i < arr.length; i++) {
                                cont += " " + arr[i].url
                            }
                        }
                        
                        if (!cont.trim()) return
                        
                        var opts = {
                            shard: client.shard.id,
                            from: msg.guild.id,
                            to: other.id,
                            text: cont,
                            avatar: msg.author.avatarURL,
                            username: msg.author.username,
                            webhooks: other.embassy
                        }
                        
                        var req = JSON.stringify(opts)
                        
                        client.shard.broadcastEval(`this.embassySend(${req})`)
                        return
                    }
                    
                    //otherwise, send as normal
                    
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
                            .edit({username: msg.author.username, avatar: msg.author.displayAvatarURL()})
                            .then(function(wh) {
                                wh.send(cont).catch(console.error);
                            }).catch(console.error)
                        }
                    }
                    else msg.reply("Couldn't connect to that server! Make sure it is mutual, and check my webhook perms")
                }
            })
        }
        
        //automod shit
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
                    if (error) msg.channel.send("<:red_x:520403429835800576> " + error).catch( function(error) { console.error(error.message) } )
                    else {
                        msg.channel.send(res).catch( function(error) { console.error(error.message) } )
                    }
                })
                
                console.log(`Command: [${msg.guild.name}] ${cmd} ${ctx}`)
            }
            
            else if (helper.func[cmd.toLowerCase()] != null) { //CERTAIN PERMITTED ROLES (voting)
                
                if (!ctx || !ctx.trim()) msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " give context!").catch( function(error) { console.error(error.message) } )
                else if (perm || msg.member.permissions.has('ADMINISTRATOR') || msg.member.role) {
                    
                    helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        
                        if (error) msg.channel.send(error).catch( function(error) { console.error(error.message) } )
                        else msg.channel.send(res).catch( function(error) { console.error(error.message) } )
                    })
                } else  msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " you aren't permitted to do that.").catch( function(error) { console.error(error.message) } )
            
                console.log(`Command: [${msg.guild.name}] ${cmd} ${ctx}`)
            }
            
            else if (helper.manage[cmd.toLowerCase()] != null) { //MODERATORS (ban/kick/mute/role change)
                
                //execute settings command
                if ( cmd.toLowerCase() !== "poll" && (!ctx || !ctx.trim()) ) msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " give context!").catch( function(error) { console.error(error.message) } )
                
                else if (msg.member.permissions.has('MANAGE_ROLES') || msg.member.permissions.has('BAN_MEMBERS') || msg.member.permissions.has('KICK_MEMBERS') || msg.member.permissions.has('ADMINISTRATOR')) {
                    
                    helper.manage[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        
                        if (error) msg.channel.send("<:red_x:520403429835800576> " +error).catch( function(error) { console.error(error.message) } )
                        else msg.channel.send("<:green_check:520403429479153674> "+res).catch( function(error) { console.error(error.message) } )
                    })
                } else msg.channel.send("<:red_x:520403429835800576> " +  msg.author.toString() + " you need to be a mod (kick, ban, or manage roles permissions) to do that.").catch( function(error) { console.error(error.message) } )
            
                console.log(`Command: [${msg.guild.name}] ${cmd} ${ctx}`)
            }
            
            else if (helper.set[cmd.toLowerCase()] != null) { //ADMINISTRATORS (voting)
                
                //execute settings command
                if (!ctx || !ctx.trim()) msg.channel.send("<:red_x:520403429835800576> " + msg.author.toString() + " give context!").catch( function(error) { console.error(error.message) } )
                else if (msg.member.permissions.has('ADMINISTRATOR')) { //ADMIN ONLY
                    helper.set[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                        
                        if (error) msg.channel.send("<:red_x:520403429835800576> " +error).catch( function(error) { console.error(error.message) } )
                        else msg.channel.send("<:green_check:520403429479153674> "+res).catch( function(error) { console.error(error.message) } )
                    })
                } else msg.channel.send("<:red_x:520403429835800576> " +  msg.author.toString() + " ask an admin to do that.").catch( function(error) { console.error(error.message) } )
            
                console.log(`Command: [${msg.guild.name}] ${cmd} ${ctx}`)
            }
            
            else if (cmd && ctx && msg.guild.id !== 264445053596991498) {
                console.log("Unknown command from " + msg.guild.id)
                //msg.react("❔");
            }
            else if (msg.content.toLowerCase().includes("help")) {
                helper.help(msg)
                console.log(`Command: [${msg.guild.name}] ${cmd} ${ctx}`)
            }
            else if (!ctx && msg.guild.id != 264445053596991498) {
                console.log("Unknown command from " + msg.guild.id)
                //msg.react("❔");
            }
        }
        else if (msg.content.toLowerCase().includes("help")) {
            helper.help(msg)
            console.log(`Command: [${msg.guild.name}] ${cmd} ${ctx}`)
        }
    }
    
    self.reactionRemove = function(reaction, user) {
        if (!user.bot && reaction.message.guild && reaction.message.guild.available) {
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
                                activity_log.send(user.id + " just withdrew endorsement for *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                            }
                            
                            //downvote
                            else if ( (reaction._emoji.name == config.downvote || reaction._emoji.toString() == config.upvote) && activity_log ) {
                                activity_log.send(user.id + " just withdrew opposition for *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                            }
                        }
                    }
                }
            })
        }
    }
    
    self.reactionAdd = function(reaction, user) {
        if (!(!reaction.message.deleted && !user.bot && reaction.message.guild && reaction.message.guild.available)) return
        
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
        
        if (reaction.message.embeds && reaction.message.embeds[0] && reaction.message.author.id == "528809041032511498") {
            
            //bool sees if bot already checked this off (e.g. already reported, passed, rejected etc)
            var already = util.checkConcluded(reaction.message.embeds[0])//util.checkReact(reaction.message.reactions.array()) 
            
            //GIF KIOSK
            if (reaction.message.embeds[0].title && reaction.message.embeds[0].title.startsWith("🔹️ ")) {
                self.react.gif(reaction, user, config)
            }
            
            if (already) return
            
            //MOD-VOTING CHANNEL
            if (reaction.message.channel.id == config.channels.modvoting) {
                
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
                        helper.react.passProposal(reaction, user, config);
                    }
                    if (activity_log) {
                        activity_log.send(user.id + " just endorsed *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                    }
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote || reaction._emoji.toString() == config.downvote) {
                    if (reaction.count >= downvote) {
                        helper.react.rejectProposal(reaction, user, config);
                    }
                    if (activity_log) {
                        activity_log.send(user.id + " just opposed *" + reaction.message.embeds[0].footer.text + "*").catch( function(error) { console.error(error.message) } )
                    }
                }
            }   
            
            //POLLING >poll command
            if (reaction.message.embeds[0].title && reaction.message.embeds[0].title.startsWith("**POLL ::")) {
                
                reaction.message.guild.fetchMember(user.id).then(function(member) {
                    if (!member.permissions.has('ADMINISTRATOR') 
                     && !member.permissions.has('MANAGE_ROLES')
                     && !member.permissions.has('KICK_MEMBERS')
                     && !member.permissions.has('BAN_MEMBERS')) 
                    {
                        return
                    }
                    self.react.poll(reaction, user, config)
                
                })
            }
        }
        
        //FEEDBACK CHANNEL
        else if (!reaction.message.author.bot && (reaction._emoji.name == config.upvote || reaction._emoji.toString() == config.upvote) && reaction.message.channel.id == config.channels.feedback) {
            
            if (reaction.count >= config.thresh.petition_upvote) self.react.progressPetition(reaction, user, config)
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
        API.get(guild.id || "none", function(err, config) {
            if (!err || config) return
            var proto_newG = new schema(guild)
            var newG = Object.assign({}, proto_newG)
            API.set(newG.id, newG, function(err, res) {
                if (err) console.error(err)
                else console.log(res)
            })
        })
    }
    
    self.guildDelete = function(guild) { //whiskers removed from a guild
        console.log("Removed from a server: "+guild.name)
        //TBD::: REMOVE FROM DATABASE
        //should I?
        /*db[guild.id] = null*/
    }
    
    self.presenceUpdate = function(oldMember, newMember) {
        
        if (!oldMember || oldMember.user.bot || !newMember.guild.available) return
        
        API.get(oldMember.guild.id, function(err, config) {
            if (err) return
            if (!config || !config.counter) return
            
            var channel = newMember.guild.channels.cache.find(ch => ch.name.startsWith("🔺") || ch.name.startsWith("🔻"))
            if (!channel) return
            
            var old = parseInt(channel.name.replace(/\D/g,''))
            
            var len = newMember.guild.members.cache.filter( (user) => user.presence.status !== 'offline' ).size;

            var diff = Math.abs(old - len)
            var emo = (old < len) ? "🔺  " : "🔻  "
            if (diff >= config.counter)  channel.setName(emo + len.toLocaleString() + " online").catch(function(err) {} )
            
            //if no numbers found (hasnt been set yet)
            else if (!(/\d/.test(channel.name))) channel.setName("🔺  " + len + " online").catch(function(err) {} )
        })
        //ch.setTopic(len + " users online")
    }
    
    self.guildMemberAdd = function(member) {
        
        if (!member.guild.available) return
        
        updateMemberCount(member)
        
        if (member.user.bot) return
            
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
                        member.ban({reason:"Autobanned by lockdown mode|"+cryptr.encrypt(member.guild.id)}).catch(console.error)
                        break;
                }
            }//ok
            else if (config.autorole) {
                if (config.verify_age) {
                    var now = Date.now()
                    var then = member.user.createdAt.getTime()
                    var min = ms(config.verify_age)
                        
                    if (now - then >= min) {
                        var verify_log = util.getChannel(member.guild.channels, config.channels.verifylog)
                        
                        if (!verify_log) return
                        
                        var embed = new Discord.MessageEmbed()
                        embed.setDescription(member.toString())
                        embed.setAuthor(member.user.tag, member.user.avatarURL)
                        embed.setThumbnail(member.user.avatarURL)
                        embed.setTimestamp()
                        embed.setTitle("Alt Verified (Account Age)")
                        embed.addField("Created At", member.user.createdAt)
                        embed.setColor("GREEN")
                        embed.setTimestamp()
                        
                        verify_log.send(embed).catch(console.error)
                        //verify_log.send("User " + member.toString() + " bypassed verification, older than " + config.verify_age).catch(console.error)                                return
                        
                        return
                    }
                }
                //member.setRoles([config.autorole])
                member.roles.add(config.autorole, "Auto-roled").then(function() {
                    if (config.verification && config.verification != 0) {
                        member.createDM().then(channel => {
                            channel.send(`<:whiskers:520460717522944000> \`${config.name}\` has anti-alt protection!\nYou must connect to \`${config.verification} external accounts\` to be verified.\n \u200b \n`).catch(console.error)
                            channel.send(`Follow this link to get your token: \n${oauth.url}`).catch(console.error)
                            channel.send(`Once you get your token, send me this command:`).catch(console.error)
                            channel.send(`$verify ${config.id} TOKEN-GOES-HERE`).catch(console.error)
                        }).catch(console.error)
                    }
                    
                    var verify_log = util.getChannel(member.guild.channels, config.channels.verifylog)
                    if (!verify_log) return
                    
                    var embed = new Discord.MessageEmbed()
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
    
    self.guildMemberRemove = function(member) {
        if (member.guild.available) updateMemberCount(member)
    }
    
    async function updateMemberCount(member) {
        
        var memberCounter = member.guild.channels.cache.find(ch => ch.name.startsWith("🔹"))
        
        if (!memberCounter) return
        
        //if (member.guild.large) await member.guild.members.fetch()
        
        var count = member.guild.memberCount
        
        memberCounter.setName(`🔹 ${count.toLocaleString()} users`).catch(function(err) { console.error(err) })
    }
}

module.exports = Handler