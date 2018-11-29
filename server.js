
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
    
    about/help message pertaining to vote threshold, syntax, etc. (DONE)
    
    Thumbnail for proposal/alert (DONE)
    
    Fetching last 70 messages from feedback channel as well (DONE)
    
    Commands for setting mod vote and pleb vote channels (IN PROGRESS)
*/

process.env.NODE_ENV = 'production'


//____________FIREBASE
//For persistent db.json

var admin = require("firebase-admin");

var serviceAccount = require("./_key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://capt-picard.appspot.com"
});

var bucket = admin.storage().bucket();

// Listen for process termination, upload latest db.json to be accessed on reboot
process.on('SIGTERM', async function() {    
    await bucket.upload("db.json", {
      gzip: true,
    });
    process.exit(2);
});

// Downloads the file to db.json, to be accessed by nedb
(async() => await bucket.file("db.json").download("./db.json"))();


//____________NeDB
//Local memory cache/storage
var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db.json', autoload: true })
  
db.loadDatabase(function (err) { if (err) console.error(err) })

const Discord = require('discord.js');
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START']
});



//PERSPECTIVE API
const Perspective = require('perspective-api-client');
const perspective = new Perspective({apiKey: process.env.PERSPECTIVE_API_KEY});
//--------------------------------------------

//UTIL
var Util = require('./util')
var util = new Util()
//--------------------------------------------

//CUSTOM CHAT API
var configs = [
    {name: "/r/BruhMoment",
        id: "483122820843307008",},
    {name: "r/okbuddyretard",
        id: "398241776327983104",}
]
var Intercom = require('./intercom.js')
var intercom = new Intercom(configs, client, util)
//--------------------------------------------

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    var guilds = client.guilds.array()
    for (var i = 0; i < guilds.length; i++) {
        db.findOne({id: guilds[i].id}, (err, config) => {
            if (err) {
                if (config == undefined) {
                    
                    //default server config
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
                        channels: {
                            reportlog: "report-log",
                            feedback: "feedback",
                            modvoting: "mod-voting",
                            modannounce: "mod-announcements",
                            modactivity: "mod-activity",
                        }
                    }
                    db.insert(server, function(err) {console.error(err)} )
                }
                else console.log(err)
            }
            else if (config) {
                
                var guild = client.guilds.find("id", config.id);
                if (guild) {
                    //get history
                    util.getChannel(guild.channels, config.channels.modvoting).fetchMessages({limit: config.fetch})
                    util.getChannel(guild.channels, config.channels.feedback).fetchMessages({limit: config.fetch})
                }
            }
        })
    }
})


client.on('message', msg => {
    db.loadDatabase(function (err) { if (err) console.error(err) })
    db.findOne({id: msg.guild.id}, function(err, config) {
        if (err) console.error(err)
        else if (config) {
            
            intercom.update(msg)
            
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
                
                if (perm || msg.member.permissions.has('ADMINISTRATOR')) { //if user is permitted to talk to bot
                    var inp = msg.content.replace(/\s+/g, ' ').trim().substr(msg.content.indexOf(' ')+1);
                    var cmd = inp.substr(0,inp.indexOf(' '))
                    var ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
                    
                    if (msg.attachments.size > 0) { //append attachments to message
                        ctx += " " + msg.attachments.array()[0].url
                    }
                    
                    if (ctx.trim().length == 0 || cmd.trim().length == 0) { //if empty mention or single param
                        
                        //msg.channel.send(config.helpMessage) //no more custom help messages for now
                        msg.channel.send("```Hey dude, here are some tips \n"
                            + "...@ me with propose [description] to put your idea to vote\n"
                            + "...You can also @ me with alert [severity 1-4] to troll ping mods\n"
                            + "...Report messages with your server's :report: emote```"
                            + "If it's your first time, type in @Ohtred *about commands*\n"
                            + "To get information about the current config, @Ohtred *about server*"
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
            else if (msg.author.id == client.user.id) { //personal commands, for testing
                if (msg.content.startsWith("!")) {
                    var tx = msg.content.slice(1)
                    var cmd = tx.substr(0,tx.indexOf(' '))
                    var ctx = tx.substr(tx.indexOf(' '), tx.length).trim() 
                    
                    if (ctx.trim().length == 0 || cmd.trim().length == 0) {}
                    else if (helper.func[cmd.toLowerCase()] == null) //if command and context exist, but incorrect command
                        msg.channel.send("That command doesn't exist <:time:483141458027610123>")
                    else {
                        helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                            if (error) msg.channel.send(error)
                            else {
                                msg.channel.send(res)
                            }
                        })
                    }
                    
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
            var already = util.checkReact(reaction.message.reactions.array()) //see if bot already checked this off (e.g. already reported, passed, rejected etc)
            
            //MOD-VOTING CHANNEL
            if (reaction.message.channel.name == config.channels.modvoting && reaction.message.embeds.length >= 1 && !already) {
                
                //upvote
                if (reaction._emoji.name == config.upvote) {
                    
                    var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity);
                    if (activity_log) {
                        activity_log.send(user.toString() + " just withdrew endorsement for *" + reaction.message.embeds[0].footer.text + "*")
                    }
                }
                
                //downvote
                else if (reaction._emoji.name == config.downvote) {
                    var activity_log = util.getChannel(reaction.message.guild.channels,config.channels.modactivity);
                    if (activity_log) {
                        activity_log.send(user.toString() + " just withdrew opposition for *" + reaction.message.embeds[0].footer.text + "*")
                    }
                }
            }
        }
    })
})

client.login(process.env.BOT_TOKEN)

var Helper = require('./helper.js')
var helper = new Helper(db, Discord, perspective, util);