
/* jshint undef: true, unused: true, asi : true, esversion: 6 */
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
    
    Fetching last 70 messages from feedback channel as well (DONE)
    
    Commands for setting mod vote and pleb vote channels (IN PROGRESS)
*/

process.env.NODE_ENV = 'production'


//TODO: start databasing. Right now, it is for bruhmoment only
var configs = [
    {//BRUH MOMENT CONFIG   
    
        name: "/r/BruhMoment",
        id: "483122820843307008",
    },
    
    { //OKBR CONFIG
        name: "r/okbuddyretard",
        id: "398241776327983104",
    }
]

var Datastore = require('nedb')
  , db = new Datastore({ filename: './db', autoload: true })


const Discord = require('discord.js');
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START']
});

 
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    var guilds = client.guilds.array()
    for (var i = 0; i < guilds.length; i++) {
        db.findOne({id: guilds[i].id}, (err, config) => {
            if (err) {
                if (config == undefined) {
                    var server = {
                        id: guilds[i].id,
                        name: guilds[i].name,
                        reportable: ["general"],
                        mod: { upvoteThresh: 5, downvoteThresh: 5 },
                        pleb: { upvoteThresh: 5, reportThresh: 5 }
                    }
                    db.insert(server, function(err) {console.error(err)} )
                }
            }
            else if (config) {
                
                var guild = client.guilds.find("id", config.id);
                
                if (guild) {
                    
                    //get history
                    getChannel(guild.channels, config.modvoting).fetchMessages({limit: config.fetch})
                    getChannel(guild.channels, config.feedback).fetchMessages({limit: config.fetch})
                }
            }
        })
    }
})


client.on('message', msg => {
    db.findOne({id: msg.guild.id}, function(err, config) {
        if (err) console.error(err)
        else if (config) {
            request({
              url: 'https://capt-picard-sbojevets.c9users.io/from/',
              method: 'POST',
              json: {
                  content: (msg.attachments.size > 0) ? msg.content + " " + msg.attachments.array()[0].url : msg.content, 
                  username: msg.author.username, 
                  channel: msg.channel.name, 
                  guild: msg.guild.id, 
                  guildname: msg.guild.name}
                  
            }, function(error, response, body){ if (error) console.error(error) }); // no response needed atm...
            if (config.id == "483122820843307008") {
                console.log(msg.author.username + " [" + msg.guild.name + "]" + "[" + msg.channel.name + "]: " + msg.content)
            }
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
                    
                    if (msg.attachments.size > 0) { //append attachments to message
                        ctx += " " + msg.attachments.array()[0].url
                    }
                    
                    if (ctx.trim().length == 0 || cmd.trim().length == 0) { //if empty mention or single param
                        msg.channel.send(config.helpMessage)
                    }
                    else if (helper.func[cmd.toLowerCase()] == null) //if command and context exist, but incorrect command
                        msg.channel.send(msg.author.toString() + " that command doesn't exist <:time:483141458027610123>")
                    else {
                        helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
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
        }
    })
});

client.on('messageReactionAdd', function(reaction, user) {
    db.findOne({id: reaction.message.guild.id}, function(err, config) {
        if (err) console.error(err)
        else if (config && !reaction.message.deleted && !reaction.message.bot) {
            var already = checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //MOD-VOTING CHANNEL
            if (reaction.message.channel.name == config.channels.modvoting && reaction.message.embeds.length >= 1 && !already) {
                
                //upvote
                if (reaction._emoji.name == config.upvote) {
                    
                    var activity_log = getChannel(reaction.message.guild.channels,config.channels.modactivity);
                    if (activity_log) {
                        activity_log.send(user.toString() + " just endorsed *" + reaction.message.embeds[0].footer.text + "*")
                    }
                    
                    if (reaction.count == config.mod.upvoteThresh) { //all thresh comparisons changed to == to prevent double posting
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
                        else {
                            reaction.message.reply(
                                "**The modannounce channel could not be found. Follow this syntax:**"
                                +"```@Ohtred config modannounce channel_name```"
                            )
                        }
                    }
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote) {
                    
                    
                    var activity_log = getChannel(reaction.message.guild.channels,config.channels.modactivity);
                    if (activity_log) {
                        activity_log.send(user.toString() + " just opposed *" + reaction.message.embeds[0].footer.text + "*")
                    }
                    
                    if (reaction.count == config.mod.downvoteThresh) {
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
                        else {
                            reaction.message.reply(
                                "**The modannounce channel could not be found. Follow this syntax:**"
                                +"```@Ohtred config modannounce channel_name```"
                            )
                        }
                    }
                }
            }
            
            //FEEDBACK CHANNEL
            else if (reaction.message.channel.name == config.channels.feedback && !already) {
                var content = reaction.message.content;
                
                if (reaction._emoji.name == config.upvote && reaction.count == config.pleb.upvoteThresh) {
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
                    else {
                        reaction.message.reply(
                            "The modvoting channel could not be found. Follow this syntax:"
                            +"```@Ohtred config modvoting channel_name```"
                        )
                    }
                }
                
            }
            
            //REPORTABLE CHANNELS
            else if (!already && config.reportable.indexOf(reaction.message.channel.name) != -1) { 
                var content = reaction.message.content;
                if (reaction._emoji.name == config.report && reaction.count >= config.pleb.reportThresh) {
                    
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
                                
                                reaction.message.channel.send(reaction.message.author.toString() + " just got kekked for posting illegal message")
                                //reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                            })
                        })
                    }
                }
            }
        }
    })
})

client.on('messageReactionRemove', function(reaction, user) {
    db.findOne({id: reaction.message.guild.id}, function(err, config) {
        if (err) console.error(err)
        
        else if (config && !reaction.message.deleted && !reaction.message.bot) {
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
    
    self.func.set = function(msg, ctx, config, cb) {
        
    }
    
    
    //PROPOSE COMMAND
    self.func.propose = function(msg, ctx, config, cb) {
        var ch = getChannel(msg.guild.channels, config.channels.modvoting);
        if (ch == null) {
            cb("add a channel called #mod-voting please", null)
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
    self.func.alert = function(msg, ctx, config, cb) {
        var ch = getChannel(msg.guild.channels,config.channels.modannounce);
        if (ch != null) {
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
                    ch.send("@everyone OH GOD OH F*CK PLEASE COME ONLINE BRUH")
                    break;
                default:
                    ch.send("Bruh moment")
            }
        }
    }
}

var helper = new Helper();




/*IRRELEVANT TO THE CHATBOT*/
/*-------------------------*/
/*This is for personal use sending messages through the bot*/

const request = require('request');

var timeout = 1000
var liveTimeout = 500 //live and chatting -> check every 1/2 sec
var sleepTimeout = 5000 //30 seconds inactivity -> check every 5 secs
var hibernateTimeout = 60000 //the chat API is literally timed out, -> check every 60 secs 
var emptyBeat = 0
var maxEmpty = 120

//after inactivity for 30 seconds, the timeout interval switches to sleepTimeout

function heartbeat() {
    setTimeout(function() { //TBD set guild and channel on webapp
        //if (!guild) guild = client.guilds.find("id", "398241776327983104");
        
        request("https://capt-picard-sbojevets.c9users.io/to", function(err, res, body) { //messy heartbeat, fix later
            if (err) console.error("error: " + err)
            if (body && body.charAt(0) !== '<') {
                var messages = JSON.parse(body)
                if (messages.constructor === Array) {
                    for (var i = 0; i < messages.length; i++) {
                        var guild = client.guilds.find("id", configs.find(function(g) {  return g.name == messages[i].guild }).id)
                        //client.guilds.find("id", messages[i].guild)
                        if (guild) {
                            var channel = getChannel(guild.channels, messages[i].channel)
                            if (channel) channel.send(messages[i].content)
                        }
                    }
                    if (messages.length >= 1) {
                        emptyBeat = 0;
                        timeout = liveTimeout
                        heartbeat()
                    }
                    else {
                        if (emptyBeat >= maxEmpty) {
                            console.log("Chat API inactive, sleeping...")
                            timeout = sleepTimeout
                            heartbeat()
                        }
                        else {
                            emptyBeat++
                            heartbeat()
                        }
                    }
                }
            } //chat API is no longer responding, timed out on C9
            //check for timeout html view, starts with <
            if (body.charAt(0) == '<') {
                console.log("Chat API not responding, hibernating...")
                timeout = hibernateTimeout
                heartbeat()
            }
        });
    }, timeout)
}
heartbeat()
