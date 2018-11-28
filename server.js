
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

var Datastore = require('nedb')
  , db = new Datastore({ filename: 'configs.json' })
  
db.loadDatabase(function (err) { if (err) console.error(err) })

const Discord = require('discord.js');
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START']
});

 
client.on('ready', async () => {
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
                        permissible: [],
                        thresh: {
                            mod_upvote: 6,
                            mod_downvote: 6,
                            petition_upvote: 6,
                            report_vote: 7
                        },
                        upvote: "upvote",
                        downvote: "downvote",
                        report: "report",
                        channels: {},
                    }
                    db.insert(server, function(err) {console.error(err)} )
                }
                console.log(err)
            }
            else if (config) {
                
                var guild = client.guilds.find("id", config.id);
                if (config.thresh == undefined) {
                    db.update(
                        { id: config.id },
                        {thresh: {
                            mod_upvote: 6,
                            mod_downvote: 6,
                            petition_upvote: 6,
                            report_vote: 7
                        }},
                        { upsert: true },
                        function (err, numReplaced, upsert) { if (err) console.error(err) });
                }
                if (guild) {
                    //get history
                    getChannel(guild.channels, config.channels.modvoting).fetchMessages({limit: config.fetch})
                    getChannel(guild.channels, config.channels.feedback).fetchMessages({limit: config.fetch})
                }
            }
        })
    }
})

//TODO: IMPORTANT
//First require an admin to set the permissible roles

client.on('message', msg => {
    db.loadDatabase(function (err) { if (err) console.error(err) })
    db.findOne({id: msg.guild.id}, function(err, config) {
        if (err) console.error(err)
        else if (config) {
            
            updateChatAPI(msg)
            
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
                        
                        //msg.channel.send(config.helpMessage) //no more custom help messages for now
                        msg.channel.send("```Hey dude, here are some tips \n"
                            + "...@ me with *propose [description]* to put your idea to vote\n"
                            + "...You can also @ me with *alert [severity 1-4]* to troll ping mods\n"
                            + "...Report messages with your server's :report: emote```"
                            + "To get detailed help about how to do config, @Ohtred *info commands*\n"
                            + "To get information about the current config, @Ohtred *info server*"
                        )
                        
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
    if (!reaction.message.deleted && !reaction.message.bot) {
        db.loadDatabase(function (err) { if (err) console.error(err) })
        db.findOne({id: reaction.message.guild.id}, function(err, config) {
            if (err) console.error(err)
            else if (config) helper.parseReaction(reaction, user, config)
        })
    }
})

client.on('messageReactionRemove', function(reaction, user) {
    db.loadDatabase(function (err) { if (err) console.error(err) })
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

//UTIL

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

var Helper = require('./helper.js')
var helper = new Helper(db, Discord);





/*IRRELEVANT TO THE CHATBOT*/
/*-------------------------*/
/*This is for personal use sending messages through the bot*/


function updateChatAPI(msg) {
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
}

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
                            //console.log("Chat API inactive, sleeping...")
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
                //console.log("Chat API not responding, hibernating...")
                timeout = hibernateTimeout
                heartbeat()
            }
        });
    }, timeout)
}
heartbeat()
