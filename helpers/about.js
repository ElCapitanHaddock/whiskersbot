
var Discord = require('discord.js')
var About = function(client) {
    this.setup = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Setting up whiskers")
        embed.addField("`prefix [prefix]`", "to set the server prefix\n\u200b")
        embed.addField("`channel [channel_type] [channel_mention]`", "to link/unlink one of the features to a channel.\n```Types: modvoting,modannounce,modactivity,feedback,reportlog,verifylog```")
        embed.addField("`emote [upvote|downvote|report] [emote]`", "to set the emote to its corresponding mechanic.\n\u200b")
        embed.addField("`permit [role]`", "to permit a rolename to interact with me. If the role is unmentionable, use its ID instead")
        embed.addField("`unpermit [role]`", "to remove a role from interacting with me\n\u200b")
        embed.addField("`reportable [channel]`", "to add/remove a channel to the list where messages are reportable")
        embed.addField("`blacklist [channel]`", "to blacklist a channel")
        embed.addField("`unblacklist [channel]`", "to unblacklist a channel\n\u200b")
        embed.addField("`config [mod_upvote|mod_downvote|mod_upvote2|mod_downvote2|petition_upvote|report_vote] [count]`", "to set a voting threshold")
        embed.addField("`report_time [time]`", "to set the amount of time a user gets muted for a report")
        embed.addField("`counter [number 1-50]`", "to set the change in # of users online in order to update the counter.\nIncrease if it's flooding your audits, decrease if it's not updating fast enough.\n\u200b")
        
        embed.addField("`about voting`", "learn how to use whiskers for voting")
        embed.addField("`about verification`", "learn how to setup whiskers verification")
        embed.addField("`about embassy`", "learn how to setup whiskers embassies")
        embed.addField("`about management`", "learn how to use whiskers to moderate")
        embed.addField("`about usage`", "learn how to general whiskers commands")
        embed.addField("`about server`", "to see what the current whiskers settings are\n\u200b")
        embed.addField("**Join the support server if you need help**", "https://discord.gg/HnGmt3T")
        cb(null, embed)
    }
    
    this.usage = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("The default prefix is @whiskers")
        
        embed.addField("`propose [description]`", "to put your idea to vote", true)
        embed.addField("`motion [threshold] [description]`", "for a custom admin vote",true)
        embed.addField("`alert [severity 1-4]`", "to notify the mods to an emergency\n\u200b")
        
        embed.addField("`google [query]`", "to search Google by a search term")
        embed.addField("`img [query]`", "to search Google Images by a search term")
        embed.addField("`talkabout [query]`", "to grab a copypasta from /r/copypasta using the query")
        embed.addField("`wutang [name/username]`", "to use the Wu Tang Name Generator")
        embed.addField("`query [text]`", "to get Google search term popularity + graph")
        embed.addField("`geo [region] [text]`", "to get a Google search-term map")
        embed.addField("`yahoo/wikipedia [question]`", "to scrape YahooAnswers or Wikipedia")
        embed.addField("`kym [meme name]`", "to scrape KnowYourMeme")
        embed.addField("`scp [0000]`", "to scrape for an SCP")
        embed.addField("`inspiro`", "to generate an InspiroBot(TM) poster")
        embed.addField("`redditor [username]`", "to scrape for a redditor")
        embed.addField("`scan [http url]`", "to scan a website and produce a screenshot, good for checking NSFW")
        embed.addField("`analyze [type] [text]`", "to predict toxicity of a text")
        embed.addField("`translate [language] [text]`", "to translate to that language\n\u200b")
        
        embed.addField("`classify [image url]`", "to analyze and caption an image")
        embed.addField("`identify [image url]`", "to guess what an image is", true)
        //embed.addField("`landmark [image url]`", "to put an image (irl) on the map")
        embed.addField("`locate [image url]`", "to find wherever the image is found online")
        embed.addField("`read [image url]`", "to grab text from an image",true)
        embed.addField("`mirror/similar [image url]`", "to find an identical/similar image online")
        embed.addField("`meme [url] [cap|tion]`", "to make a meme\n\u200b")
        embed.addField("**OTHER**","Report messages with your server's :report: emote\n"
        + "Name a category 🔺 and it will turn it into an online users counter",true)
        cb(null, embed)
    }
    
    this.verification = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Verification and Lockdown")
        embed.setDescription(
            "For there to be any verification at all, autorole must be set. For alt verification to be logged, the verifylog must be set. In contrast, lockdown does not require an autorole")

        embed.addField("`lockdown [number 0-2]`", "to lockdown the server against raiders [0: none, 1: autokick (only kicks once!), 2: autoban (permanent)]")
        embed.addField("`autorole [role]`", "to set a **verification** autorole")
        embed.addField("`password [reset|set|get]`", "resets, sets, or gets the password. Reset it to disable the bypass feature. Set it to enable password verification to remove autorole upon join. For it to work, autorole must be enabled as well.")
        embed.addField("`verify_age [time, e.g. 5 days]`", "to only autorole accounts younger than the set age.")
        embed.addField("`verification [0-4]`", "to set anti-alt verification. More about the levels below.\n\u200b")
        
        embed.addField("Level 0", "all new joiners will be added to the autorole (if set) and must be manually verified.")
    	embed.addField("Level 1,2,3,4", "all new joiners will need to visit an external verification page to be allowed in, which requires that they have specified # of **connected account.**")
        embed.addField("Passwords", "In case the mods want to bypass verification, you can set a bypass password. To set it, use *@whiskers password set [password]*. To remove the password use *@whiskers password reset*, and to have it DM'd to you use *@whiskers password get* (mod only).")
        embed.addField("Using Password", "DM whiskers with *@whiskers bypass [guild ID] [password]*")
        cb(null, embed)
    }
    
    this.management = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Management Commands")
        embed.addField("`mute [user] [time]`", "to mute a user", true)
        embed.addField("`unmute [user]`", "to unmute a user",true)
        embed.addField("`kick [user]`", "to kick a user (requires admin)")
        embed.addField("`ban [user]`", "to ban a user (requires admin)",true)
        embed.addField("`unban [user]`", "to unban a user (requires admin)", true)
        embed.addField("`role [user] [role]`", "to add/remove a role from a user", true)
        embed.addField("`warn [user] [text]`", "to send a user a warning DM", true)
        embed.addField("`wash/purge [1-100]`", "to purge messages from the channel", true)
        embed.addField("`autorole [role]`", "to set the verification autorole", true)
        embed.addField("`mutedrole [role]`", "to set a muted role (for use with the mute command)")
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
            "• Users are muted for " + config.report_time + " as a report punishment")
        
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
        embed.addField("Verification Level", (config.verification) ? config.verification : "0")
        embed.addField("Verify Age Bypass", (config.verify_age) ? config.verify_age : "None set")
        embed.setThumbnail(msg.guild.iconURL)
        embed.setFooter("🆔 "+msg.guild.id)
        cb(null, embed)
    }
    
    this.automod = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Automod")
        embed.setDescription(
                 "To enable automod in a channel, include any combination 📕,📗,📘, and 📙 in its **description/topic**. "+
                 "These represent toxicity (📕), incoherence (📗), sexual content (📘), and personal attacks (📙)."
        )
        embed.addField("Other descriptors", 
                 "❗ makes whiskers ping the mods alongside auto-reports\n"+
                 "❌ makes whiskers auto-delete the message as well\n"+
                 "👮 makes whiskers warn the user when reported")
        cb(null, embed)
    }
    
    this.invite = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Invites")
        embed.addField("Zero Permissions", "https://discordapp.com/oauth2/authorize?client_id=528809041032511498&permissions=0&scope=bot")
        embed.addField("Webhooks/Managing Roles (No Ban/Kick/Channels)", "https://discordapp.com/oauth2/authorize?client_id=528809041032511498&permissions=805686464&scope=bot")
        embed.addField("Full Permissions", "https://discordapp.com/oauth2/authorize?client_id=528809041032511498&permissions=8&scope=bot")
        cb(null, embed)
    }
    //k
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
        embed.addField("To set a channel, use @whiskers channel [type] [channel]","Good luck!")
        cb(null,embed)
    }
        
    this.voting = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Democracy")
        embed.addField("PROPOSALS",
         "Proposals are mod-votes sent to the mod-voting channel.\n"+
         "To propose a vote, use @whiskers propose [description]. Only permitted roles can use propose.\n"+
         "To have it include a @here ping, include ❗ in the description. For @everyone, include ❗❗\n"+
         "To not have it announce for privacy reasons, include 🙈 in the description\n"+
         "To up/downvote, react to the proposal with whatever your up/downvote emote is (default: 👍)")
         
        embed.addField("MOTIONS",
         "Motions are the same as proposals, except they take an extra parameter for a custom threshold.\n"+
         "To send a motion, use @whiskers motion [thresh] [description]. Only admins can send motions.\n"+
         "The minimum threshold is 2 votes. Use motions for whatever require a unique voting threshold.")
         
         embed.addField("PETITIONS", 
         "Petitions require no commands, they are drawn from messages in the #feedback channel.\n"+
         "Server-wide discourse goes in #feedback.\n"+
         "When any message hits the upvote threshold, it auto-passes into #mod-voting")
         embed.addField("@whiskers about setup", "to find out how to set all this up")
        cb(null,embed)
    }
    
    this.embassy = (msg, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Embassy")
        embed.setDescription(
            "Your embassy is the channel that you share with other servers. Any messages you send on your own embassy, goes to currently defined target embassy, and vice versa."
            +" They are similar to other bot's wormholes and speakerphones, but instead of using plain ugly messages,"
            +" whiskers uses sexy webhooks (PERMS REQUIRED) to make it looks super similar to an actual inter-server channel."
            )
        embed.addField("@whiskers embassy [channel]", "This command sets your official embassy channel")
        embed.addField("Connecting to the other server", "whiskers makes it really simple. All you have to do is **edit the channel description** to be the **ID** of the other server (and nothing else). To get your server's ID and send it to the other server, type in *@whiskers about server*. It's at the bottom.")
        embed.addField("Don't forget!","In order to hook up two embassies, both servers need to have whiskers, and both servers have to be mutually set (with the ID as channel description)")
        embed.addField("Just like embassies in real life, you can only operate **one** per other server", "Good luck!")
        cb(null,embed)
    }
    
    this.credits = (msg, config, cb) => {
        cb(null, "```This bot was envisioned and entirely programmed by me, but I couldn't have done it entirely myself.\n"
        + "Thanks to the meticulous testing and input of the people of /r/okbuddyretard and /r/bruhmoment.\n"
        + "Thanks to Yandex, Google Cloud, and PerspectiveAPI for their generously APIs.\n...\n"
        + "And most of all, thanks to YOU, for choosing my bot. I hope it works out for you.```\nIf you're feeling generous, please give my bot an upvote: https://discordbots.org/bot/528809041032511498")
    }
    
    this.support = (msg, config, cb) => {
        cb(null, "Join the support server here https://discord.gg/HnGmt3T\nJust spam ping/dm me until you get my attention.")
    }
}
module.exports = About