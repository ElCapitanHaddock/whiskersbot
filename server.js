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

//TODO: start databasing. Right now, it is for bruhmoment only
var config = {
    
    /*temporary*/
    id: "483122820843307008",
    modvote: "494662256668311562",
    suggestions: "498157555416039454",
    /*temporary*/ 
    
    helpMessage: "<:intj:505855665059921951> Hey dude, here are some tips \n"
                    + "...@ me with *propose [description]* to put your cringe idea to vote\n"
                    + "...You can also @ me with *alert [severity 1-4]* to troll ping mods\n",
    specialReplies: [
        //nv
        {id: "<@223948083271172096>", reply: "needs to COPE"},
        
        //the turk
        {id: "<@244424870002163712>", reply: "https://media.discordapp.net/attachments/483123424601047081/513584457744384000/greece.jpg"},
        
        //hyperion
        {id: "<@161939643636383753>", reply: "https://cdn.discordapp.com/attachments/442214776660164631/513840477359964161/video.mov"},
        
        //ethovoid
        {id: "<@229337636265787402>", reply: "https://media.discordapp.net/attachments/483123424601047081/513758412342034442/unknown-42.png"},
        
        //me
        //{id: "<@!230878537257713667>", reply: "<:intj:505855665059921951>"} 
    ],
    
    fetch: 70, //message history to fetch on initiation
    
    //emotes
    upvote: "updoge",
    downvote: "downdoge",
    
    //roles that can interact with the bot
    permissible: ['modera', 'admib'],
    
    //channels
    channels: {
        reportlog: "report-log",
        feedback: "feedback",
        modvoting: "mod-voting",
        modannounce: "mod-announcements",
        modactivity: "mod-activity",
    },
    
    //whitelist of channels where users can report messages
    reportable: ["general", "serious"],
    
    //voting threshold
    mod: {
        upvoteThresh: 6,
        downvoteThresh: 6,
    },
    pleb: {
        upvoteThresh: 5,
        reportThresh: 5
    }
}

const Discord = require('discord.js');
const client = new Discord.Client(
    {
        autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
        disabledEvents: ['TYPING_START']
    });
 
client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}!`);
    var guild = client.guilds.find("id", config.id); //touches last 70 messagees to add to event listener cache
    //tbd: find by name. currently that does not work because i'd need to loop through every guild
    if (guild) {
        await guild.channels.find("id", config.modvote).fetchMessages({limit: config.fetch}) //modvote channel
        await guild.channels.find("id", config.suggestions).fetchMessages({limit: config.fetch}) //suggestion channel
        var chat = getChannel(guild.channels, "general")
        if (chat) {
            chat.send("nobody gives a fuck about your anti-jap vendetta bro")
            chat.send("sure cringe weeb but literally nobody cares. you're digging through his fucking steam")
        }
    }
});


client.on('message', msg => {
    console.log(msg.author.username + " [" + msg.channel.name + "]: " + msg.content)
    if (msg.isMentioned(client.user) && !msg.author.bot) { //use msg.member.roles
        var perm = false;
        for (var i = 0; i < config.permissible.length; i++) {
            if (msg.member.roles.find('name', config.permissible[i])) perm = true
        }
        
        var tempAuthor = msg.author.toString().split('!').join(''); //gets rid of the annoying inconsistant ! prefix in ID
        var special = config.specialReplies.find(function(val) {
            return val.id == tempAuthor 
        })
        
        if (perm) { //if moderator or admin
            var inp = msg.content.replace(/\s+/g, ' ').trim().substr(msg.content.indexOf(' ')+1);
            var cmd = inp.substr(0,inp.indexOf(' '))
            var ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
            
            if (msg.attachments.size > 0) {
                ctx += " " + msg.attachments.array()[0].url
            }
            
            if (ctx.trim().length == 0 || cmd.trim().length == 0) { //if empty mention or single param
                msg.channel.send(config.helpMessage)
            }
            else if (helper.func[cmd.toLowerCase()] == null) //if command and context exist, but incorrect command
                msg.channel.send(msg.author.toString() + " that command doesn't exist <:time:483141458027610123>")
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

client.on('messageReactionAdd', function(reaction, user) {
    if (!reaction.message.deleted && !reaction.message.bot) {
        var already = checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
        
        //MOD-VOTING CHANNEL
        if (reaction.message.channel.name == config.channels.modvoting && reaction.message.embeds.length >= 1 && !already) {
            
            //upvote
            if (reaction._emoji.name == config.upvote) {
                
                var activity_log = getChannel(reaction.message.guild.channels,config.channels.modactivity);
                if (activity_log) {
                    activity_log.send(user.toString() + " just endorsed *" + reaction.message.embeds[0].footer.text + "*")
                }
                
                if (reaction.count >= config.mod.upvoteThresh) {
                    console.log("Proposal '"+reaction.message.embeds[0].description+"' passed")
                    console.log("Proposal passed")
                    reaction.message.react('✅');
                    var ch = getChannel(reaction.message.guild.channels,config.channels.modannounce);
                    if (ch !== null) {
                        var old = reaction.message.embeds[0];
                        var embed = new Discord.RichEmbed()
                        
                        embed.setTitle("✅ **PASSED** ✅")
                        embed.setAuthor(old.author.name, old.author.iconURL)
                        embed.setDescription(old.description)
                        embed.setFooter(old.footer.text)
                        embed.setTimestamp(new Date(old.timestamp).toString())
                        ch.send({embed})
                    }
                }
            }
            
            //downvote
            else if (reaction._emoji.name == config.downvote) {
                
                
                var activity_log = getChannel(reaction.message.guild.channels,config.channels.modactivity);
                if (activity_log) {
                    activity_log.send(user.toString() + " just opposed *" + reaction.message.embeds[0].footer.text + "*")
                }
                
                if (reaction.count >= config.mod.downvoteThresh) {
                    console.log("Proposal '"+reaction.message.embeds[0].description+"' was rejected")
                    reaction.message.react('❌');
                    var ch = getChannel(reaction.message.guild.channels,config.channels.modannounce);
                    if (ch !== null) {
                        var old = reaction.message.embeds[0];
                        var embed = new Discord.RichEmbed()
                        
                        embed.setTitle("❌ **FAILED** ❌")
                        embed.setAuthor(old.author.name, old.author.iconURL)
                        embed.setDescription(old.description)
                        embed.setFooter(old.footer.text)
                        embed.setTimestamp(new Date(old.timestamp).toString())
                        ch.send({embed})
                    }
                }
            }
        }
        
        //FEEDBACK CHANNEL
        else if (reaction.message.channel.name == config.channels.feedback && !already) {
            var content = reaction.message.content;
            
            if (reaction._emoji.name == config.upvote && reaction.count >= config.pleb.upvoteThresh) {
                var upvotes = reaction.count;
                console.log("Petition passed: "+content);
                var ch = getChannel(reaction.message.guild.channels, config.channels.modvoting);
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
                    ch.send({embed})
                }
            }
            
        }
        
        //REPORTABLE CHANNELS
        else if (!already && config.reportable.indexOf(reaction.message.channel.name) != -1) { 
            var content = reaction.message.content;
            if (reaction._emoji.name == "report" && reaction.count >= config.pleb.reportThresh) {
                
                reaction.message.react('❌');
                var report_channel = getChannel(reaction.message.guild.channels, config.channels.reportlog)
                if (report_channel) { //if report channel exists
                    
                    const embed = new Discord.RichEmbed()
                    embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
                    embed.setDescription(content)
                    //embed.setFooter(reaction.message.url);
                    embed.setTimestamp()
                    
                    if (reaction.message.attachments.size > 0) {
                        console.log("Image attached")
                        embed.setDescription(content + "\n" + reaction.message.attachments.array()[0].url)
                    }
                    else {
                        console.log("No image attached")
                        embed.setDescription(content)
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
                            report_channel.send("@here " + reaction.message.url)
                            
                            if (!reaction.message.member.mute) { //if he's already muted don't remute... keep timer integrity
                                reaction.message.member.setMute(true, "Automatically muted for 5 reports")
                                    setTimeout(function() {
                                        console.log(reaction.message.member.nickname + " was unmuted after 60 seconds")
                                        reaction.message.member.setMute(false)
                                    }, 60 * 1000) //30 second mute
                            }
                            
                            reaction.message.channel.send(reaction.message.author.toString() + " just got muted for 30s and logged <:s_:511625238296002561>")
                            //reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                        })
                    })
                }
            }
        }
    }
})

client.on('messageReactionRemove', function(reaction, user) {
    if (!reaction.message.deleted && !reaction.message.bot) {
        var already = checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
        
        //MOD-VOTING CHANNEL
        if (reaction.message.channel.name == config.channels.modvoting && reaction.message.embeds.length >= 1 && !already) {
            
            //upvote
            if (reaction._emoji.name == config.upvote) {
                
                var activity_log = getChannel(reaction.message.guild.channels,config.channels.modactivity);
                if (activity_log) {
                    activity_log.send(user.toString() + " just withdrew endorsement for *" + reaction.message.embeds[0].footer.text + "*")
                }
            }
            
            //downvote
            else if (reaction._emoji.name == config.downvote) {
                var activity_log = getChannel(reaction.message.guild.channels,config.channels.modactivity);
                if (activity_log) {
                    activity_log.send(user.toString() + " just withdrew opposition for *" + reaction.message.embeds[0].footer.text + "*")
                }
            }
        }
    }
})

//see if message is already checked off by seeing if any reactions belong to the bot itself
function checkReact(reactions) {
    var already = false;
    for (var i = 0; i < reactions.length; i++) {
        var users = reactions[i].users.array()
        for (var x = 0; x < users.length; x++) {
            if (users[x].bot == true) {
                already = true;
            }
        }
    }
    return already
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
