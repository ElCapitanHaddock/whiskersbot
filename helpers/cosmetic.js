
var Cosmetic = function(perspective, translate, client, Discord) {
    /*C O S M E T I C
    usable by anyone*/
    var self = this
    
    self.about = function(msg, ctx, config, cb) {
        switch(ctx) {
            case "setup":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Setting up Ohtred")
                embed.addField("prefix [prefix]", "to set the server prefix")
                embed.addField("channel [modvoting|modannounce|modactivity|feedback|reportlog] [channel]", "to link one of the features to a channel")
                embed.addField("emote [upvote|downvote|report] [emote_name]", "to set the name of the emote to its corresponding mechanic.")
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
                embed.addField("alert [severity 1-4]", "to troll ping mods")
                embed.addField("analyze [text]", "to predict toxicity",true)
                embed.addField("translate [language] [text]", "to translate to that language", true)
                embed.addField("about setup","setup your server so that Ohtred can work", true)
                embed.addField("Other", "Report messages with your server's :report: emote\n"
                + "Name a category 🔺 and it will turn it into an online users counter",true)
                cb(null, {embed})
                break;
            case "management":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Management Commands")
                embed.addField("mute [user] [time in minutes]", "to mute a user", true)
                embed.addField("unmute [user]", "to unmute a user",true)
                embed.addField("kick [user]", "to kick a user")
                embed.addField("ban [user]", "to ban a user",true)
                embed.addField("unban [user]", "to unban a user", true)
                embed.addField("Automod","@Ohtred about automod", true)
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
                embed.addField("Muted role", (config.mutedRole) ? config.mutedRole : "None set")
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
                         "To enable automod in a channel, include any combination 📕,📗,📘, and 📙 in its description/topic. "+
                         "These represent toxicity (📕), incoherence (📗), sexual content (📘), and personal attacks (📙)."
                )
                embed.addField("Other descriptors", 
                         "❗ makes Ohtred ping the mods alongside auto-reports\n"+
                         "❌ makes Ohtred auto-delete the message as well\n"+
                         "👮 makes Ohtred warn the user when reported")
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
                cb(null, "Join the badass support server here https://discord.gg/46KN5s8\nJust spam ping/dm me until you get my attention.")
                break;
            default:
                cb(msg.author.toString() + " here are the *about* options.```setup\nusage\nserver\nvoting\nautomod\nstats\ninvite\ncredits\nsupport```")
                break;
        }
    }
    
    self.analyze = function(msg, ctx, config, cb) {
        var metrics = ["TOXICITY",
        "SEVERE_TOXICITY",	
        "IDENTITY_ATTACK",
        "INSULT",
        "PROFANITY",
        "SEXUALLY_EXPLICIT",
        "THREAT",
        "FLIRTATION",
        "ATTACK_ON_AUTHOR",
        "ATTACK_ON_COMMENTER",
        "INCOHERENT",
        "INFLAMMATORY",
        "LIKELY_TO_REJECT",
        "OBSCENE",
        "SPAM",
        "UNSUBSTANTIAL"]
        var params = ctx.trim().split(" ")
        if (params[0] && metrics.indexOf(params[0].toUpperCase()) !== -1 && params[1]) {
            params = [params[0].toUpperCase(), params.slice(1).join(" ")];
            var met = params[0];
            var text = params[1];
            (async function() {
                try {
                    const result = await perspective.analyze(text, {attributes: [met]});
                    var score = Math.round(result.attributeScores[met].summaryScore.value * 100)
                    const embed = new Discord.RichEmbed()
                    var emote = "🗿"
                        embed.setColor("PURPLE")
                    if (score < 10) { emote = "😂"
                        embed.setColor("GREEN")
                    }
                    else if (score < 30) { emote = "😤"
                        embed.setColor("#ffd000")
                    }
                    else if (score < 70) { emote = "😡"
                        embed.setColor("ORANGE")
                    }
                    else if (score < 99) { emote = "👺"
                        embed.setColor("RED")
                    }
                    embed.setDescription(emote + " " + text)
                    embed.setTitle(met + " >> " + score + "%")
                    cb(null, embed);
                }
                catch(error) { cb("<:red_x:520403429835800576> Sorry " + msg.author.toString() + ", I couldn't understand that message") }
            })()
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please pick a metric: ```" + metrics + "```")
    }
    
    self.translate = function(msg, ctx, config, cb) { //todo: add link to Yandex here
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("<:red_x:520403429835800576> Yandex Error: " + err)
              else if (res.text) {
                  var embed = new Discord.RichEmbed()
                  embed.setTitle(params[1] + " >> " + params[0].toUpperCase())
                  embed.setDescription(res.text)
                  msg.channel.send({embed})
              }
              else cb("<:red_x:520403429835800576> " + msg.author.toString() + " language not recognized.\nHere's the full list: https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages")
            });
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please specify a target language and message.")
    }
}
module.exports = Cosmetic