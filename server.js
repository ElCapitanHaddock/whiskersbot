/*
   dBBBBBb  dBP dBBBP dBBBBBb   dBBBBBb    dBBBBb
       dB'                 BB       dBP       dB'
   dBBBP' dBP dBP      dBP BB   dBBBBK'  dBP dB' 
  dBP    dBP dBP      dBP  BB  dBP  BB  dBP dB'  
 dBP    dBP dBBBBP   dBBBBBBB dBP  dB' dBBBBB'   2018 - Jeremy Yang
*/

/*---------------------------------------------------------------------------------
Picard is a Discord bot that promotes democracy in a server...

Current features:
    Proposing ideas to the #mod-vote channel
    Upon reaching 5 upvotes it is "passed" and moved to the announcements page
    Upon reaching 5 downvotes it is "rejected" and also moved
    
    Alerting moderators based on severity
    
    Suggestions in #feedback that go up to 5 upvotes are proposed as "petitions" 
    
    Messages with 5 :report: reactions are deleted and archived in #report-log
    
    The official Picard API is now called Ohtred after my Discord uname
---------------------------------------------------------------------------------*/
/*

Picard is hosted on Heroku. If you wish to host your own version of Picard, here is a good tutorial:
https://shiffman.net/a2z/bot-heroku/

*/
/*TODO
    Currently the bot is very childish... in its final iteration it will be more professional
    
    Lower tribunal for distinguished users, 6 votes advances it into mod tribunal (DONE)
    Success/fail message is sent to both #announcements (DONE)
    
    Info/help message pertaining to vote threshold, syntax, etc. (DONE)
    
    Thumbnail for proposal/alert (DONE)
    
    Fetching last 70 messages from feedback channel as well
    
    Commands for setting mod vote and pleb vote channels
*/

process.env.NODE_ENV = 'production'

const Discord = require('discord.js');
const client = new Discord.Client(
    {
        autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
        disabledEvents: ['TYPING_START']
    });
 
client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}!`);
    var guild = client.guilds.find("id", "483122820843307008"); //touches last 70 messagees to add to event listener cache
    //tbd: find by name. currently that does not work because i'd need to loop through every guild
    if (guild) {
        await guild.channels.find("id", "494662256668311562").fetchMessages({limit: 70}) //modvote channel
        await guild.channels.find("id", "498157555416039454").fetchMessages({limit: 70}) //suggestion channel
        var chat = getChannel(guild.channels, "general")
        if (chat) {
            chat.send("<@418562167143399445> what up bitch")
            /*
            chat.send("Hello, this is Uhtred speaking. My dad just deleted my discord, so I'm talking through the Capt.")
            chat.send("The report feature is now functional in #general and #serious. 5 :report: emojis deletes the message and reports it to a hidden mod-chat.")
            chat.send("It also mutes the poster of the deleted message for 30 seconds")
            chat.send("Abusing this feature will be grounds for punishment. Remember that messages are recorded alongside the users who reported it")
            chat.send("Mods, if it gets out of control just restrict Picard's permissions. If that doesn't work, kick him. He can always be readded")
            chat.send("...\nDon't try anything stupid, I can see every single message on the discord from this terminal :))")
            */
        }
    }
});

var replyMessages = [
    {id: "<@223948083271172096>", reply: "needs to COPE"},
    {id: "<@244424870002163712>", reply: "https://media.discordapp.net/attachments/483123424601047081/513584457744384000/greece.jpg"},
    {id: "<@161939643636383753>", reply: "https://cdn.discordapp.com/attachments/442214776660164631/513840477359964161/video.mov"}
]


client.on('message', msg => {
    console.log(msg.author.username + " [" + msg.channel.name + "]: " + msg.content)
    if (msg.isMentioned(client.user) && !msg.author.bot) { //use msg.member.roles
        var m = msg.member.roles.find('name', 'modera') || msg.member.roles.find('name', 'admib')
        var tempAuthor = msg.author.toString().split('!').join('');
        var special = replyMessages.find(function(val) {
            return val.id == tempAuthor 
        })
        
        if (m) { //if moderator or admin
            var inp = msg.content.trim().substr(msg.content.indexOf(' ')+1);
            var cmd = inp.substr(0,inp.indexOf(' '))
            var ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
            if (msg.attachments.size > 0) {
                if (msg.attachments.every(attachIsImage)){
                    ctx += " " + msg.attachments.array()[0].url
                }
            }
            if (inp.trim().length == 0) {
                msg.channel.send(
                    "<:intj:505855665059921951> Hey dude, here are some tips \n"
                    + "...@ me with *propose [description]* to put your cringe idea to vote\n"
                    + "...You can also @ me with *alert [severity 1-4]* to troll ping mods\n"
                )
            }
            else if (helper.func[cmd.toLowerCase()] == null)
                msg.channel.send(msg.author.toString() + " that command doesn't exist <:time:483141458027610123>")
            else if (ctx == null)
                msg.channel.send(msg.author.toString() + " give context mate")
            else {
                helper.func[cmd.toLowerCase()](msg, ctx, function(error, res) {
                    if (error) msg.channel.send(error)
                    else {
                        msg.channel.send(res)
                    }
                })
            }
        }
        else if (special) { //special reply message, check if exists
            msg.channel.send(msg.author.toString() + " " + special.reply)
        }
        else { //not moderator or admin
            msg.channel.send(msg.author.toString() + " <:retard:505942082280488971>")
        }
  }
});

client.on('messageReactionAdd', reaction => {
    if (!reaction.message.deleted && !reaction.message.bot) {
        if (reaction.message.channel.name == "mod-voting" && reaction.message.embeds.length >= 1) {
            if (reaction._emoji.name == "updoge") {
                var upvotes = reaction.count;
                console.log("Proposal '"+reaction.message.embeds[0].description+"' upvoted: " + upvotes)
                if (upvotes >= 5) {
                    console.log("Proposal passed")
                    reaction.message.react('✅');
                    var ch = getChannel(reaction.message.guild.channels,"mod-announcements");
                    if (ch !== null) {
                        var old = reaction.message.embeds[0];
                        
                        var embed = new Discord.RichEmbed()
                        embed.setAuthor(old.author.name, old.author.iconURL)
                        embed.setDescription(old.description)
                        embed.setFooter(old.footer.text)
                        embed.setTimestamp(new Date(old.timestamp).toString())
                        embed.setTitle("✅ **PASSED** ✅")
                        ch.send({embed})
                        
                        reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                    }
                }
            }
            else if (reaction._emoji.name == "downdoge") {
                var downvotes = reaction.count;
                console.log("Proposal '"+reaction.message.embeds[0].description+"' downvoted: " + downvotes)
                if (downvotes >= 5) {
                    console.log("Proposal rejected")
                    reaction.message.react('❌');
                    var ch = getChannel(reaction.message.guild.channels,"mod-announcements");
                    if (ch !== null) {
                        var old = reaction.message.embeds[0];
                        var embed = new Discord.RichEmbed()
                        
                        embed.setTitle("❌ **FAILED** ❌")
                        embed.setAuthor(old.author.name, old.author.iconURL)
                        embed.setDescription(old.description)
                        embed.setFooter(old.footer.text)
                        embed.setTimestamp(new Date(old.timestamp).toString())
                        ch.send({embed})
                        
                        reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                    }
                }
            }
        }
        else if (reaction.message.channel.name == "feedback") {
            var content = reaction.message.content;
            if (reaction._emoji.name == "updoge") {
                var upvotes = reaction.count;
                console.log("Petition: "+content);
                console.log("Votes: "+upvotes);
                if (upvotes >= 5) {
                    var ch = getChannel(reaction.message.guild.channels, "mod-voting");
                    reaction.message.react('✅');
                    if (ch !== null) {
                        var prop_id = Math.random().toString(36).substring(5);
                        const embed = new Discord.RichEmbed()
                        
                        embed.setTitle(".:: 𝐏𝐄𝐓𝐈𝐓𝐈𝐎𝐍")
                        embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
                        
                        if (reaction.message.attachments.size > 0) {
                            if (reaction.message.attachments.every(attachIsImage)){
                                content += "\n" + reaction.message.attachments.array()[0].url
                            } //turn attachment into link
                        }
                        embed.setDescription(content)
                        
                        embed.setFooter(prop_id)
                        embed.setTimestamp()
                        ch.send({embed})
                        
                        reaction.message.channel.send("By popular request, this petition was sent to the council:\n```" + content + "```")
                        reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                    }
                }
            }
        }
        //reaction.message.channel.name == "bruh") {
        else if (reaction.message.channel.name == "general" || reaction.message.channel.name == "serious") { 
            var content = reaction.message.content;
            if (reaction._emoji.name == "report") {
                var votes = reaction.count;
                console.log("Content: "+content);
                console.log("Votes: "+votes);
                
                if (votes >= 5) { //succesfully reported after reaching 5 votes
                
                    var report_channel = getChannel(reaction.message.guild.channels, "report-log")
                    if (report_channel) { //if report channel exists
                        
                        const embed = new Discord.RichEmbed()
                        embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
                        embed.setDescription(content)
                        embed.setTimestamp()
                        
                        if (reaction.message.attachments.size > 0) {
                            if (reaction.message.attachments.every(attachIsImage)){
                                embed.setDescription(content + "\n" + reaction.message.attachments.array()[0].url)
                            } //it's better to not attach it in case it is nsfw or disgusting, so record is there without being disgusting
                        }

                        reaction.fetchUsers().then(function(val) {
                            var users = val.array()
                            var replist = "**Reporters: **"
                            for (var i = 0; i < users.length; i++) {
                                console.log(users[i].id)
                                replist += "<@" + users[i].id + ">" + " "
                            }
                            
                            report_channel.send({embed}).then(function() { 
                                report_channel.send(replist) 
                                if (!reaction.message.member.mute) { //if he's already muted don't remute...
                                    reaction.message.member.setMute(true, "Automatically muted for 5 reports")
                                        setTimeout(function() {
                                            console.log(reaction.message.member.nickname + " was unmuted after 30 seconds")
                                            reaction.message.member.setMute(false)
                                        }, 30 * 1000) //30 second mute
                                }
                                reaction.message.channel.send(reaction.message.author.toString() + " just got kekked for posting illegal message")
                                reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                            })
                        })
                    }
                }
            }
        }
    }
})

function attachIsImage(msgAttach) {
    var url = msgAttach.url;
    //True if this url is a png image.
    return url.indexOf("png", url.length - "png".length /*or 3*/) !== -1;
}

function getChannel(channels, query) { //get channel by name
    return channels.find(function(channel) {
      if (channel.name == query) {
        return channel
      } else return null
    });
}

client.login(process.env.BOT_TOKEN)

var Helper = function() {
    var self = this;
    
    self.func = {}; //for commands, input
    
    //PROPOSE COMMAND, MEDIUM IMPORTANCE
    self.func.propose = function(msg, ctx, cb) {
        var ch = getChannel(msg.guild.channels, "mod-voting");
        if (ch == null) {
            cb("add a channel called #mod-voting bruh", null)
        }
        else {
            console.log(msg.author.toString() + " proposed: " + msg.content)
            var prop_id = Math.random().toString(36).substring(4);
            const embed = new Discord.RichEmbed()

            embed.setTitle(".:: 𝐏𝐑𝐎𝐏𝐎𝐒𝐀𝐋")
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
            embed.setDescription(ctx)
            
            embed.setFooter(prop_id)
            embed.setTimestamp()
            ch.send({embed})
                .then(message => cb(null, msg.author.toString() + "\n *" + prop_id + `* at ${message.url}`))
                .catch(console.error)
        }
    }
    self.func.alert = function(msg, ctx, cb) {
        var ch = getChannel(msg.guild.channels,"mod-announcements");
        switch(ctx) {
            case "1":
                ch.send("@here Calling all moderators.")
                break;
            case "2":
                ch.send("@everyone Important - moderators adjourn.")
                break;
            case "3":
                ch.send("@everyone EMERGENCY - PLEASE COME ONLINE.")
                break;
            case "4":
                ch.send("@everyone OH GOD OH F*CK PLEASE COME BRUH")
                break;
            default:
                ch.send("Bruh moment")
        }
    }
}

var helper = new Helper();
