/*SERVER.JS HELPER API
    Parses reactions and commandss
*/

//util
var util = require('./util')

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

var translate = require('yandex-translate')(process.env.YANDEX_KEY);

var Helper = function(db, Discord, client, perspective) {
    
    var self = this
    self.func = {}
    
    /*C O M M A N D S
    propose, analyze, channel*/
        
    self.func.propose = function(msg, ctx, config, cb) {
        var ch = util.getChannel(msg.guild.channels, config.channels.modvoting);
        if (ch == null) {
            cb("Use the command @Ohtred channel modvoting [name] to assign a designated voting channel", null)
        }
        else {
            console.log(msg.author.toString() + " proposed: " + msg.content)
            var prop_id = Math.random().toString(36).substring(4);
            const embed = new Discord.RichEmbed()

            embed.setTitle(".:: **PROPOSAL**")
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
            if (msg.attachments.size > 0) {
                console.log("Image attached")
                embed.setDescription(ctx + "\n" + msg.attachments.array()[0].url)
            }
            else {
                console.log("No image attached")
                embed.setDescription(ctx)
            }
            
            embed.setFooter(prop_id)
            embed.setTimestamp()
            ch.send({embed})
                .then(message => cb(null, msg.author.toString() + "\n *" + prop_id + `* at ${message.url}`)).catch( function(error) { console.error(error) } )
        }
    }
    
    /*C O S M E T I C
    usable by anyone: about, analyze*/
    
    self.cosmetic = {}
    
    self.cosmetic.about = function(msg, ctx, config, cb) {
        switch(ctx) {
            case "setup":
                var embed = new Discord.RichEmbed()
                embed.setTitle("@Ohtred")
                embed.addField("channel [modvoting|modannounce|modactivity|feedback|reportlog] [channel]", "to link one of the features to a channel")
                embed.addField("emote [upvote|downvote|report|prefix] [emote_name]", "to set the name of the emote to its corresponding mechanic.")
                embed.addField("permit [role]", "to permit a rolename to interact with me. If the role is unmentionable, use its ID instead")
                embed.addField("unpermit [role]", "to remove a role from interacting with me")
                embed.addField("reportable [channel]", "to add a channel to the list where messages are reportable")
                embed.addField("unreportable [channel]", "to remove a channel from the reportable list")
                embed.addField("config [mod_upvote|mod_downvote|mod_upvote2|mod_downvote2|petition_upvote|report_vote] [count]", "to set a voting threshold")
                embed.addField("report_time [number 10+]", "to set the amount of time a user gets muted for a report")
                embed.addField("counter [number 1-50]", "to set the change in # of users online in order to update the counter.\nIncrease if it's flooding your audits, decrease if it's not updating fast enough.")
                embed.addField("about usage", "learn how to use Ohtred after you set everything up\n......\n")
                embed.addField("**UPDATE**", "All channels and roles are now stored as mentions/ids instead of the old name system. You may have to reconfigure your settings. "
                + "Sorry for any inconveniences! Type in @Ohtred about support if you're still having issues.")
                cb(null, {embed})
                break;
            case "usage":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Main Commands")
                embed.addField("propose [description]", "to put your idea to vote", true)
                embed.addField("motion [threshold] [description]", "for a custom admin vote",true)
                embed.addField("alert [severity 1-4]", "to troll ping mods", true)
                embed.addField("analyze [text]", "to predict toxicity",true)
                embed.addField("translate [language] [text]", "to translate to that language",true)
                embed.addField("about setup","setup your server so that Ohtred can work", true)
                embed.addField("Other", "Report messages with your server's :report: emote\n"
                + "Name a category 🔺 and it will turn it into an online users counter",true)
                cb(null, {embed})
                break;
            case "server":
                var embed = new Discord.RichEmbed()
                embed.setTitle(config.name + " | Prefix: " + config.prefix)
                var permits = ""
                for (var i = 0; i < config.permissible.length; i++) {
                    permits += "<@&" + config.permissible[i] + ">\n"
                }
                embed.addField("Permitted Roles", (permits.length != 0) ? permits : "None set")
                embed.addField(
                    "Channels",
                    "  modvoting : <#"+config.channels.modvoting+">\n"+
                    "  modannounce : <#"+config.channels.modannounce+">\n"+
                    "  modactivity : <#"+config.channels.modactivity+">\n"+
                    "  feedback : <#"+config.channels.feedback+">\n"+
                    "  reportlog : <#"+config.channels.reportlog+">")
                embed.addField(
                    "Vote Thresholds",
                    "  Mod votes need "+config.thresh.mod_upvote+" "+config.upvote+"s to pass\n"+
                    "  Mod votes need "+config.thresh.mod_downvote+" "+config.downvote+"s to fail\n"+
                    "  Petitions need " +config.thresh.petition_upvote+" "+config.upvote+"s to progress\n"+
                    "  Messages need "+config.thresh.report_vote+" "+config.report+"s to be reported")
                embed.addField(    
                    "Intervals",
                    "  The # online counter display is updated with changes of " + config.counter + "\n"+
                    "  Users are muted for " + config.report_time + " seconds as a report punishment")
                var reports = ""
                for (var i = 0; i < config.reportable.length; i++) {
                    reports += "<#" + config.reportable[i] + ">\n"
                }
                embed.addField("Reportable Channels", (reports.length != 0) ? reports : "None set")
                embed.setThumbnail(msg.guild.iconURL)
                cb(null, {embed})
                break;
            case "automod":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Automod")
                embed.setDescription(
                         "To enable automod in a channel, include any combination 📕,📗,📘, and 📙 in its description/topic\n"+
                         "These represent toxicity (📕), incoherence (📗), sexual content (📘), and personal attacks (📙).\n"+
                         "By default, the threshold required for the message to be reported is 96%.\n"+
                         "To make the channel automod more sensitive, include a ❗ in the channel description (75% thresh)")
                cb(null, {embed})
                break;
            case "invite":
                cb(null, "https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot")
                break;
            case "docs":
                cb(null, "https://github.com/ElCapitanHaddock/capt-picard/blob/master/README.md")
                break;
            case "stats":
                cb(null, "```"+
                         "# Guilds: " + client.guilds.size + "\n"+
                         "# Users: " + client.users.size + "\n"+
                         "Uptime: " + (client.uptime / 1000) + " seconds```"
                )
                break;
            case "channels":
                cb(null, "<:ohtred_info:520109255999619072> **Channels**```"+
                         "modvoting - where proposals are sent to be voted/reacted to\n"+
                         "modannounce - where succesful proposals are archived/announced\n"+
                         "modactivity - where moderator voting activity is logged\n"+
                         "feedback - where users upvote popular ideas, send to modvoting as 'petitions'\n"+
                         "reportlog - where automod reports and manual user reports are logged\n"+
                         "...To set a channel, use @Ohtred channel [type] [channel]```")
                break;
            case "voting":
                cb(null, "<:ohtred_info:520109255999619072> **Voting**```"+
                         "Proposals are mod-votes sent to the mod-voting channel.\n"+
                         "...To propose a vote, use @Ohtred propose [description]. Only permitted roles can use propose.\n"+
                         "...To set the modvoting proposal channel, use @Ohtred channel [mod_upvote]\n"+
                         "...To configure proposal vote thresholds, use @Ohtred config [mod_upvote|mod_downvote] [count]"+
                         "\n...\n"+
                         "Motions are the same as proposals, except they take an extra parameter for a custom threshold.\n"+
                         "...To send a motion, use @Ohtred motion [thresh] [description]. Only admins can send motions.\n"+
                         "...The minimum threshold is 2 votes. Use motions for whatever require a unique voting threshold."+
                         "\n...\n"+
                         "Petitions require no commands, they are drawn from messages in the #feedback channel.\n"+
                         "...Server-wide discourse goes in #feedback.\n"+
                         "...When any message hits the upvote threshold, it auto-passes into #mod-voting\n...\nThe default emojis are 👍 for upvote, 👎 for downvote, and 🚫 for report. To set custom emotes check, @Ohtred about commands```"
                )
                break;
            case "credits":
                cb(null, "```This bot was envisioned and entirely programmed by me, but I couldn't have done it entirely myself.\n"
                + "Thanks to the meticulous testing and input of the people of /r/okbuddyretard and /r/bruhmoment.\n"
                + "Thanks to Yandex and PerspectiveAPI for their generously APIs.\n"
                + "Thanks to Jamie Hewlett for his amazing artwork that is Ohtred's PFP.\n"
                + "Thanks to LunarShadows for helping with the PFP and setting up the support server!\n...\n"
                + "And most of all, thanks to YOU, for choosing my bot. I hope it works out for you.```\nIf you're feeling generous, please give my bot an upvote: https://discordbots.org/bot/511672691028131872")
                break;
            case "support":
                cb(null, "Join the lawless support server here https://discord.gg/46KN5s8\nThere are literally no rules on it, just spam ping/dm me until you get my attention.")
                break;
            default:
                cb(msg.author.toString() + " here are the *about* options.```commands\nserver\nvoting\nautomod\nstats\ninvite\ncredits\nsupport```")
                break;
        }
    }
    
    self.cosmetic.analyze = function(msg, ctx, config, cb) {
        (async function() {
            try {
                const result = await perspective.analyze(ctx);
                var score = Math.round(result.attributeScores.TOXICITY.summaryScore.value * 100)
                const embed = new Discord.RichEmbed()
                embed.setDescription(ctx)
                var emote = "🗿"
                if (score < 10) emote = "😂"
                else if (score < 30) emote = "😤"
                else if (score < 70) emote = "😡"
                else if (score < 99) emote = "👺"
                embed.setTitle(emote + " **" + score + "%**")
                
                cb(null, embed);
            }
            catch(error) { cb("<:red_x:520403429835800576> Sorry " + msg.author.toString() + ", I couldn't understand that message") }
        })()
    }
    
    self.cosmetic.translate = function(msg, ctx, config, cb) { //todo: add link to Yandex here
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("<:red_x:520403429835800576> Yandex Error: " + err)
              else if (res.text) msg.reply("```"+res.text+"```")
              else cb("<:red_x:520403429835800576> " + msg.author.toString() + " language not recognized.\nHere's the full list: https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages")
            });
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please specify a target language and message.")
    }
     
    /*C O N F I G U R A T I O N AND M O D  O N L Y
    emote, config, permit, unpermit, reportable, unreportable, about.*/
    
    self.defaultError = " Incorrect syntax!\nType in *@Ohtred about commands* to get config commands\nType in *@Ohtred about server* to get the current config"
    self.set = {}
    
    
    self.set.motion = function(msg, ctx, config, cb) {
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
    self.set.prefix = function(msg, ctx, config, cb) {
        if (ctx) {
            db.prefix = ctx
            cb(null, "**" + ctx + "** succesfully set as the server prefix.")
        }
        else cb(msg.author.toString() + self.defaultError)
    }*/
    self.set.channel = function(msg, ctx, config, cb) {
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
    
    self.set.emote = function(msg, ctx, config, cb) {
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            var types =
                [
                    "upvote",
                    "downvote",
                    "report",
                    "prefix",
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
    
    self.set.config = function(msg, ctx, config, cb) {
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
    
    self.set.permit = function(msg, ctx, config, cb) {
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
    
    self.set.unpermit = function(msg, ctx, config, cb) {
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
    
    self.set.reportable = function(msg, ctx, config, cb) {
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
    
    self.set.unreportable = function(msg, ctx, config, cb) {
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
    
    self.set.counter = function(msg, ctx, config, cb) {
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
    
    self.set.report_time = function(msg, ctx, config, cb) {
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
    
    self.set.alert = function(msg, ctx, config, cb) {
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
    
    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    
    //R E A C T I O N S
    self.react = {}
    
    self.react.upvote = function(reaction, user, config) { //called when passed. TODO: move #vote comparison to here
        console.log(reaction.message.embeds[0].title+" '"+reaction.message.embeds[0].description+"' was passed")
        reaction.message.react('✅');
        
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (ch !== null) {
            var old = reaction.message.embeds[0];
            var embed = new Discord.RichEmbed()
            
            embed.setTitle("✅ **PASSED** ✅")
            embed.setAuthor(old.author.name, old.author.iconURL)
            embed.setDescription(old.description)
            embed.setFooter(old.footer.text)
            embed.setColor('GREEN')
            embed.setTimestamp(new Date(old.timestamp).toString())
            ch.send({embed}).catch( function(error) { console.error(error) } )
            embed.setTitle(old.title + " | **CONCLUDED**")
            reaction.message.edit({embed})
        }
        else {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@Ohtred config modannounce channel_name```"
            )
        }
    }
    
    self.react.downvote = function(reaction, user, config) {
        console.log(reaction.message.embeds[0].title+" '"+reaction.message.embeds[0].description+"' was rejected")
        reaction.message.react('❌');
        var ch = util.getChannel(reaction.message.guild.channels,config.channels.modannounce);
        if (ch !== null) {
            var old = reaction.message.embeds[0];
            var embed = new Discord.RichEmbed()
            
            embed.setTitle("❌ **FAILED** ❌")
            embed.setAuthor(old.author.name, old.author.iconURL)
            embed.setDescription(old.description)
            embed.setFooter(old.footer.text)
            embed.setColor('RED')
            embed.setTimestamp(new Date(old.timestamp).toString())
            ch.send({embed}).catch( function(error) { console.error(error) } )
            embed.setTitle(old.title+" | **CONCLUDED**")
            reaction.message.edit({embed})
        }
        else {
            reaction.message.reply(
                "**The modannounce channel could not be found. Follow this syntax:**"
                +"```@Ohtred config modannounce channel_name```"
            )
        }
    }
    
    self.react.report = function(reaction, user, config) {
        var content = reaction.message.content;
        reaction.message.react('❌');
        var report_channel = util.getChannel(reaction.message.guild.channels, config.channels.reportlog)
        if (report_channel) { //if report channel exists
            
            const embed = new Discord.RichEmbed()
            embed.setTitle("**User Report**")
            embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
            embed.setDescription(content)
            embed.setTimestamp()
            
            var request = require('request');
                    
            reaction.fetchUsers().then(function(val) {
                var users = val.array()
                var replist = "**Reporters: **"
                for (var i = 0; i < users.length; i++) {
                    console.log(users[i].id)
                    replist += "<@" + users[i].id + ">" + " "
                }
                
                 //CHECK IF THERE'S AN IMAGE ATTACHMENT ABOUT TO BE DELETED
                if (reaction.message.attachments.size > 0) {
                    var rand_id = Math.random().toString(36).substring(4)
                    
                    cloudinary.uploader.upload(reaction.message.attachments.array()[0].url, //upload the image to cloudinary 
                      function(result) { 
                          console.log(result)
                        embed.setDescription(content + " " + result.url) 
                        self.report(reaction,embed,replist,report_channel,config)
                      },
                      {public_id: rand_id}
                    )
                }
                
                //NO IMAGE ATTACHMENT
                else {
                    self.report(reaction,embed,replist,report_channel,config)
                }
            })
        }
    }
    
    self.report = function(reaction, embed, replist, report_channel, config) {
        report_channel.send({embed}).then(function() { 
            report_channel.send(replist).catch( function(error) { console.error(error) } )
            report_channel.send("@here check " + reaction.message.channel.toString()).catch( function(error) { console.error(error) } )
            
            if (!reaction.message.member.mute) { //if he's already muted don't remute... keep timer integrity
                reaction.message.member.setMute(true, "Automatically muted by report")
                    setTimeout(function() {
                        console.log(reaction.message.member.nickname + " was auto-unmuted")
                        reaction.message.member.setMute(false)
                    }, config.report_time * 1000)
            }
            
            reaction.message.channel.send(reaction.message.author.toString() + " just got report-muted for " + (config.report_time) + " seconds").catch( function(error) { console.error(error) } )
            reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch( function(error) { console.error(error) } )
        }).catch( function(error) { console.error(error) } )
    }
    
    self.react.plebvote = function(reaction, user, config) {
        var content = reaction.message.content;
        var upvotes = reaction.count;
        console.log("Petition passed: "+content);
        var ch = util.getChannel(reaction.message.guild.channels, config.channels.modvoting);
        reaction.message.react('✅');
        if (ch !== null) {
            var prop_id = Math.random().toString(36).substring(5);
            const embed = new Discord.RichEmbed()
            
            embed.setTitle(".:: 𝐏𝐄𝐓𝐈𝐓𝐈𝐎𝐍")
            embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
            
            if (reaction.message.attachments.size > 0) {
                console.log("Image attached")
                embed.setDescription(content + "\n" + reaction.message.attachments.array()[0].url)
            }
            else {
                console.log("No image attached")
                embed.setDescription(content)
            }
            
            embed.setFooter(prop_id)
            embed.setTimestamp()
            ch.send({embed}).catch( function(error) { console.error(error) } )
        }
        else {
            reaction.message.reply(
                "The modvoting channel could not be found. Follow this syntax:"
                +"```@Ohtred config modvoting channel_name```"
            )
        }
    }
    /*
    self.admin = {}
    
    self.admin.mute = function(msg, ctx, config, cb) {
        var params = ctx.trim().split(" ")
        msg.mentions.users.first().id
        if (params[0]) {
            if (msg.mentions
            cb(null, "**" + params[0] + "** channel succesfully set to **" + params[1] +"**")
        }
        else cb(msg.author.toString() + self.defaultError)
    }
    */
    
    self.monitor = function(msg) {
        var topic = msg.channel.topic
        topic = topic.replace("📕", ":closed_book:")
                     .replace("❗",":exclamation:")
        var terms = ["SEVERE_TOXICITY", "INCOHERENT", "SEXUALLY_EXPLICIT", "IDENTITY_ATTACK"]
        var emojis = [":closed_book:",":green_book:",":blue_book:",":orange_book:"]
        
        var req = []
        for (var i = 0; i < emojis.length; i++) {
            if ( topic.includes(emojis[i]) ) req.push( terms[i] )
        }
        if (req.length > 0) {
            (async function() {
                try {
                    var thresh = topic.includes(":exclamation:") ? 75 : 95 //two options for threshold, exclamation mark makes it more sensitive
                    
                    const result = await perspective.analyze(msg.cleanContent, {attributes: req});
                    
                    var hit = false //if at least one metric hits the threshold
                    var desc = msg.author.toString() + " in " + msg.channel.toString() +  "```" + msg.cleanContent + "```" 
                    
                    for (var i = 0; i < req.length; i++) {
                        var score = Math.round(result.attributeScores[req[i]].summaryScore.value * 100)
                        if (score >= thresh) hit = true  
                        desc += "\n" + emojis[terms.indexOf(req[i])] + "  **" + score + "%**  " + terms[terms.indexOf(req[i])] + "\n"
                    }
                    
                    const embed = new Discord.RichEmbed()
                    embed.setTitle("**Cringe Detected** \n" + msg.url)
                    embed.setDescription(desc)
                    embed.setTimestamp()
                    
                    var config = db[msg.guild.id]
                    if (hit && config) {
                        var ch = util.getChannel(msg.guild.channels, config.channels.reportlog);
                        if (ch) { 
                            ch.send({embed}).catch( function(error) { console.error(error) } )
                        }
                    }
                }
                catch(error) {  }
            })()
        }
    }
    
}

module.exports = Helper