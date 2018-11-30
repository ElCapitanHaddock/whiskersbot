
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
    Upon reaching X upvotes it is "passed" and moved to the announcements page
    Upon reaching X downvotes it is "rejected" and also moved
    
    All channels, emotes, permissible roles, and vote thresholds can be set by an admin
    
    Alerting moderators based on severity
    
    Suggestions in #feedback that go up to X upvotes are proposed as "petitions" 
    
    Messages with X :report: reactions are deleted and archived in #report-log
    
    The official Picard API is now called Ohtred after my Discord uname
---------------------------------------------------------------------------------*/
/*

Picard is hosted on Heroku as my alter-ego, Ohtred
If you wish to host your own version of Picard, here is a good tutorial: https://shiffman.net/a2z/bot-heroku/

Invite:
https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot

*/

process.env.NODE_ENV = 'production'

//____________NeDB
//Local memory cache/storage
var Datastore = require('nedb')

//____________FIREBASE
//For persistent db.json

var admin = require("firebase-admin");

var serviceAccount = require("./_key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://capt-picard.appspot.com"
});

var bucket = admin.storage().bucket();


//DISCORDJS API
const Discord = require('discord.js');
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
});
var fs = require('fs')


// Downloads the file to db.json
bucket.file("db.json").download({destination:"db.json"}, function(err) { 
    if (err) console.error("Download error: "+err)
    else {
        fs.readFile('db.json', 'utf8', function (err, data) {
            if (err) throw err;
            init(JSON.parse(data));
        })
    }
})

//util
var util = require('./util')
    
function init(db) {
    
    //PERSPECTIVE API
    const Perspective = require('perspective-api-client');
    const perspective = new Perspective({apiKey: process.env.PERSPECTIVE_API_KEY});
    //--------------------------------------------
    
    //CUSTOM CHAT API
    var configs = [
        {name: "/r/BruhMoment",
            id: "483122820843307008",},
        {name: "r/okbuddyretard",
            id: "398241776327983104",}
    ]
    var Intercom = require('./intercom.js')
    var intercom = new Intercom(configs, client)
    //--------------------------------------------
    
    client.on('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);
        var guilds = client.guilds.array()
        for (var i = 0; i < guilds.length; i++) {
            var config = db[guilds[i].id]
            if (!config) {
                //default server config
                config = {
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
                db[guilds[i].id] = config
            }   
            var guild = client.guilds.find("id", config.id);
            if (guild) {
                //get history
                util.getChannel(guild.channels, config.channels.modvoting).fetchMessages({limit: config.fetch})
                util.getChannel(guild.channels, config.channels.feedback).fetchMessages({limit: config.fetch})
            }
        }
    })
    
    
    client.on('message', msg => {
        var config = db[msg.guild.id]
        if (config) {
            intercom.update(msg)
            
            if (config.id == "483122820843307008") {
                console.log(msg.author.username + " [" + msg.guild.name + "]" + "[" + msg.channel.name + "]: " + msg.content)
            }
            
            if (msg.isMentioned(client.user) && !msg.author.bot) { //use msg.member.roles
                var perm = false;
                for (var i = 0; i < config.permissible.length; i++) {
                    if (msg.member.roles.find('name', config.permissible[i])) perm = true
                }
                
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
                    else if (helper.func[cmd.toLowerCase()] != null) {//found in main commands
                        helper.func[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                            if (error) msg.channel.send(error)
                            else {
                                msg.channel.send(res)
                            }
                        })
                    }
                    else if (helper.set[cmd.toLowerCase()] != null) {//found in config commands
                        if (msg.member.permissions.has('ADMINISTRATOR')) { //ADMIN ONLY
                            helper.set[cmd.toLowerCase()](msg, ctx, config, function(error, res) {
                                if (error) msg.channel.send(error)
                                else {
                                    msg.channel.send(res)
                                }
                            })
                        } else msg.channel.send(msg.author.toString() + " ask an admin to do that.")
                    }
                    
                    else {
                        msg.channel.send(msg.author.toString() + " that command doesn't exist <:time:483141458027610123>")
                    }
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
            else if (msg.author.id == client.user.id) { //self-sent commands, for testing
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
    });
    
    client.on('messageReactionAdd', function(reaction, user) {
        var config = db[reaction.message.guild.id]
        if (!reaction.message.deleted && !reaction.message.bot && config) {
            helper.parseReaction(reaction, user, config)
        }
    })
    
    client.on('messageReactionRemove', function(reaction, user) {
        var config = db[reaction.message.guild.id]
        if (!reaction.message.deleted && !reaction.message.bot && config) {
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
    
    client.on('guildCreate', function(guild) { //invited to new guild
        var config = db[guild.id]
        if (!config) {
            //default server config
            config = {
                id: guild.id,
                name: guild.name,
                
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
            db[guild.id] = config
        }
    })
    
    client.on("presenceUpdate", (oldMember, newMember) => {
        var channel = newMember.guild.channels.array().find(function(ch) {
            return ch.name.startsWith("🔵") || ch.name.startsWith("🔴") 
        })
        if (channel) {
            var old = parseInt(channel.name.replace(/\D/g,''))
            var len = newMember.guild.members.filter(m => m.presence.status === 'online').array().length
            if (old > len) {
                channel.setName("🔴  " + len + " users online")
            }
            else channel.setName("🔵  " + len + " users online")
        }
        //ch.setTopic(len + " users online")
    });
    
    client.login(process.env.BOT_TOKEN)
    
    var Helper = require('./helper.js')
    var helper = new Helper(db, Discord, perspective);
    
    // Listen for process termination, upload latest db.json to be accessed on reboot
    process.on('SIGTERM', function() {    
        fs.writeFile('db.json', JSON.stringify(db), 'utf8', function(err) {
            if (err) console.error(err)
            bucket.upload("db.json", {
              gzip: true,
              metadata: { cacheControl: 'no-cache', },
            },function(err){
                if (err) console.error("Upload error: "+err)
                process.exit(2);
            });
        })
    });
}