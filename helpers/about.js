
var About = function(Discord, client) {
    this.setup = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Setting up Ohtred")
        embed.addField("prefix [prefix]", "to set the server prefix")
        embed.addField("channel [channel_type] [channel_mention]", "to link one of the features to a channel.\nTypes: **modvoting,modannounce,modactivity,feedback,reportlog,verifylog**")
        embed.addField("emote [upvote|downvote|report] [emote]", "to set the emote to its corresponding mechanic.")
        embed.addField("permit [role]", "to permit a rolename to interact with me. If the role is unmentionable, use its ID instead")
        embed.addField("unpermit [role]", "to remove a role from interacting with me")
        embed.addField("reportable [channel]", "to add a channel to the list where messages are reportable")
        embed.addField("unreportable [channel]", "to remove a channel from the reportable list")
        embed.addField("blacklist [channel]", "to blacklist a channel")
        embed.addField("unblacklist [channel]", "to unblacklist a channel")
        embed.addField("config [mod_upvote|mod_downvote|mod_upvote2|mod_downvote2|petition_upvote|report_vote] [count]", "to set a voting threshold")
        embed.addField("password [reset|set|get] [password (set only)]", "resets, sets, or gets the password. Reset it to disable the feature. Set it to enable password verification to remove autorole upon join. For it to work, autorole must be enabled as well.")
        embed.addField("lockdown [number 0-2]", "to lockdown the server against raiders (0: none, 1: autokick, 2: autoban)")
        embed.addField("mutedrole [role]", "to set a muted role (for use with the mute command)")
        embed.addField("autorole [role]", "to set a **verification** autorole")
        embed.addField("verification [0-4]", "to set anti-alt connection verification. Learn more with @Ohtred about verification")
        embed.addField("verify_age [time (e.g. 5 days)]", "to only autorole accounts younger than the set age.")
        embed.addField("report_time [time]", "to set the amount of time a user gets muted for a report")
        embed.addField("counter [number 1-50]", "to set the change in # of users online in order to update the counter.\nIncrease if it's flooding your audits, decrease if it's not updating fast enough.")
        embed.addField("about usage", "learn how to use Ohtred after you set everything up\n......\n")
        embed.addField("**Join the support server if you need help**", "https://discord.gg/46KN5s8")
        cb(null, embed)
    }
    
    this.usage = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("@Ohtred")
        embed.addField("propose [description]", "to put your idea to vote", true)
        embed.addField("motion [threshold] [description]", "for a custom admin vote",true)
        embed.addField("alert [severity 1-4]", "to troll ping mods")
        embed.addField("analyze [text]", "to predict toxicity")
        embed.addField("translate [language] [text]", "to translate to that language", true)
        embed.addField("describe [image url]", "to analyze and caption an image")
        embed.addField("identify [image url]", "to guess what an image is", true)
        embed.addField("locate [image url]", "to find wherever the image is found online")
        embed.addField("read [image url]", "to grab text from an image",true)
        embed.addField("similar [image url]", "to find a similar image online")
        embed.addField("meme [url] [cap|tion]", "to make a meme")
        embed.addField("about","get a list of help commands", true)
        embed.addField("**OTHER**", "Report messages with your server's :report: emote\n"
        + "Name a category 🔺 and it will turn it into an online users counter",true)
        cb(null, embed)
    }
    
    this.verification = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Verification")
        embed.addField("IMPORTANT",
            "For there to be any verification at all, autorole must be set. For alt verification to be logged, the report-channel must be set.")
        embed.addField("Verification Modes", "@Ohtred verification [0-4]")
        embed.addField("0", "all new joiners will be added to the autorole (if set) and must be manually verified.")
    	embed.addField("1,2,3,4", "all new joiners will need to visit an external verification page to be allowed in, which requires that they have specified # of **connected account.**")
        embed.addField("Passwords", "In case the mods want to bypass verification, you can set a bypass password. To set it, use *@Ohtred password set [password]*. To remove the password use *@Ohtred password reset*, and to have it DM'd to you use *@Ohtred password get* (mod only).")
        embed.addField("Using Password", "DM Ohtred with *@Ohtred bypass [guild ID] [password]*")
        embed.addField("Account Age", "Use *@Ohtred verify_age [time]* to allow accounts past the [time] age to bypass verification.")
        cb(null, embed)
    }
    
    this.management = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Management Commands")
        embed.addField("mute [user] [time]", "to mute a user", true)
        embed.addField("unmute [user]", "to unmute a user",true)
        embed.addField("kick [user]", "to kick a user")
        embed.addField("ban [user]", "to ban a user",true)
        embed.addField("unban [user]", "to unban a user", true)
        embed.addField("role [user] [role]", "to add/remove a role from a user", true)
        embed.addField("warn [user] [text]", "to send a user a warning DM", true)
        embed.addField("wash [1-100]", "to purge messages from the channel", true)
        embed.addField("autorole [role]", "to set an autorole", true)
        embed.addField("Automod","@Ohtred about automod")
        cb(null, embed)
    }
    
    this.server = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle(config.name + " | Prefix: " + config.prefix)
        var permits = ""
        for (var i = 0; i < config.permissible.length; i++) {
            permits += "• <@&" + config.permissible[i] + ">\n"
        }
        embed.addField("Permitted Roles", (permits.length != 0) ? permits : "None set")
        embed.addField("Muted role", (config.mutedRole) ? "<@&"+config.mutedRole+">" : "None set", true)
        embed.addField("Auto-role", (config.autorole) ?  "<@&"+config.autorole+">" : "None set")
        embed.addField(
            "Channels",
            "• modvoting: <#"+config.channels.modvoting+">\n"+
            "• modannounce: <#"+config.channels.modannounce+">\n"+
            "• modactivity: <#"+config.channels.modactivity+">\n"+
            "• feedback: <#"+config.channels.feedback+">\n"+
            "• verifylog: <#"+config.channels.verifylog+">\n"+
            "• reportlog: <#"+config.channels.reportlog+">")
        embed.addField(
            "Vote Thresholds",
            "• Mod votes need "+config.thresh.mod_upvote+" "+config.upvote+" to pass\n"+
            "• Mod votes need "+config.thresh.mod_downvote+" "+config.downvote+" to fail\n"+
            "• Petitions need " +config.thresh.petition_upvote+" "+config.upvote+" to progress\n"+
            "• Messages need "+config.thresh.report_vote+" "+config.report+" to be reported", true)
        embed.addField(    
            "Intervals",
            "• The # online counter display is updated with changes of " + config.counter + "\n"+
            "• Users are muted for " + config.report_time + " seconds as a report punishment")
        
        var reports = ""
        for (var i = 0; i < config.reportable.length; i++) {
            reports += "• <#" + config.reportable[i] + ">\n"
        }
        embed.addField("Reportable Channels", (reports.length != 0) ? reports : "None set")
        
        var blacklist = ""
        for (var i = 0; i < config.blacklist.length; i++) {
            blacklist += "• <#" + config.blacklist[i] + ">\n"
        }
        embed.addField("Blacklisted Channels", (blacklist.length != 0) ? blacklist : "None set", true)
        embed.addField("Lockdown Level", (config.lockdown) ? config.lockdown : "0")
        embed.addField("Verification Mode", (config.verification) ? config.verification : "0")
        embed.setThumbnail(msg.guild.iconURL)
        embed.setFooter("🆔 "+msg.guild.id)
        cb(null, embed)
    }
    
    this.automod = (msg, config, cb) => {
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
        cb(null, embed)
    }
    
    this.invite = (msg, config, cb) => {
        cb(null, "https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot")
    }
    
    this.docs = (msg, config, cb) => {
        cb(null, "https://github.com/ElCapitanHaddock/capt-picard/blob/master/README.md")
    }
    
    this.stats = (msg, config, cb) => {
        cb(null, "```"+
                 "# Guilds: " + client.guilds.size + "\n"+
                 "# Users: " + client.users.size + "\n"+
                 "Ping: " + Math.round(client.ping) + "ms\n"+
                 "Uptime: " + (client.uptime / 1000) + "s```"
        )
    }
        
    this.channels = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Channels")
        embed.addField("modvoting", "where proposals are sent to be voted/reacted to")
        embed.addField("modannounce", "where succesful proposals are archived/announced")
        embed.addField("modactivity", "where moderator voting activity is logged")
        embed.addField("feedback", "where users upvote popular ideas, send to modvoting as 'petitions'")
        embed.addField("reportlog", "where automod reports and manual user reports are logged")
        embed.addField("To set a channel, use @Ohtred channel [type] [channel]","Good luck!")
        cb(embed)
    }
        
    this.voting = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Democracy")
        embed.addField("PROPOSALS",
         "Proposals are mod-votes sent to the mod-voting channel.\n"+
         "To propose a vote, use @Ohtred propose [description]. Only permitted roles can use propose.\n"+
         "To have it include a @here ping, include ❗ in the description. For @everyone, include ❗❗\n"+
         "To not have it announce for privacy reasons, include 🙈 in the description\n"+
         "To up/downvote, react to the proposal with whatever your up/downvote emote is (default: 👍)")
         
        embed.addField("MOTIONS",
         "Motions are the same as proposals, except they take an extra parameter for a custom threshold.\n"+
         "To send a motion, use @Ohtred motion [thresh] [description]. Only admins can send motions.\n"+
         "The minimum threshold is 2 votes. Use motions for whatever require a unique voting threshold.")
         
         embed.addField("PETITIONS", 
         "Petitions require no commands, they are drawn from messages in the #feedback channel.\n"+
         "Server-wide discourse goes in #feedback.\n"+
         "When any message hits the upvote threshold, it auto-passes into #mod-voting")
         embed.addField("@Ohtred about setup", "to find out how to set all this up")
        cb(embed)
    }
    
    this.embassy = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Embassy")
        embed.setDescription(
            "Your embassy is the channel that you share with other servers. Any messages you send on your own embassy, goes to currently defined target embassy, and vice versa."
            +" They are similar to other bot's wormholes and speakerphones, but instead of using plain ugly messages,"
            +" Ohtred uses sexy webhooks to make it looks super similar to an actual inter-server channel."
            )
        embed.addField("@Ohtred embassy [channel]", "This command sets your official embassy channel")
        embed.addField("Connecting to the other server", "Ohtred makes it really simple. All you have to do is **edit the channel description** to be the **ID** of the other server (and nothing else). To get your server's ID and send it to the other server, type in *@Ohtred about server*. It's at the bottom.")
        embed.addField("Don't forget!","In order to hook up two embassies, both servers need to have Ohtred, and both servers have to be mutually set (with the ID as channel description)")
        embed.addField("Just like embassies in real life, you can only operate **one** per other server", "Good luck!")
        cb(embed)
    }
    
    this.credits = (msg, config, cb) => {
        cb(null, "```This bot was envisioned and entirely programmed by me, but I couldn't have done it entirely myself.\n"
        + "Thanks to the meticulous testing and input of the people of /r/okbuddyretard and /r/bruhmoment.\n"
        + "Thanks to Yandex and PerspectiveAPI for their generously APIs.\n"
        + "Thanks to Jamie Hewlett for his amazing artwork that is Ohtred's PFP.\n"
        + "Thanks to LunarShadows for helping with the PFP and setting up the support server!\n...\n"
        + "And most of all, thanks to YOU, for choosing my bot. I hope it works out for you.```\nIf you're feeling generous, please give my bot an upvote: https://discordbots.org/bot/511672691028131872")
    }
    
    this.support = (msg, config, cb) => {
        cb(null, "Join the badass support server here https://discord.gg/46KN5s8\nJust spam ping/dm me until you get my attention.")
    }
}
module.exports = About