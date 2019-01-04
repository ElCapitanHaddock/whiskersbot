
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
---------------------------------------------------------------------------------*/
/*

Picard is hosted on Heroku as my alter-ego, whiskers
If you wish to host your own version of Picard, here is a good tutorial: https://shiffman.net/a2z/bot-heroku/

Invite:
https://discordapp.com/oauth2/authorize?client_id=528809041032511498&permissions=8&scope=bot


*/

process.env.NODE_ENV = 'production'


//____________FIREBASE
var admin = require("firebase-admin")

var serviceAccount = require("./firebase_key.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var firestore = admin.firestore();

const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

var databaseAPI = require("./dbAPI.js")
var API = new databaseAPI(firestore)
//--------------------------------------------
//test

//DISCORDJS API
const Discord = require('discord.js')
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
});
    
//PERSPECTIVE API
const Perspective = require('perspective-api-client')
const perspective = new Perspective({apiKey: process.env.PERSPECTIVE_API_KEY})
//--------------------------------------------

/*
bruhmoment : 483122820843307008
okbr : 398241776327983104
*/
//These are the servers where I let myself talk through whiskers
var Intercom = require('./intercom.js')
var intercom = new Intercom(client, Discord)
//--------------------------------------------

var util = require('./util')
var schema = require('./config_schema')

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)
    var guilds = client.guilds.array()
    for (var i = 0; i < guilds.length; i++) {
        API.get(guilds[i].id, function(err, config) {
            if (err) {
                if (err == 404 && guilds[i]) {
                    var proto_newG = new schema(guilds[i])
                    var newG = Object.assign({}, proto_newG)
                    API.set(newG.id, newG, function(err, res) {
                        if (err) console.error(err)
                        else console.log("New guild added: " + guilds[i].name)
                    })
                }
                else console.error(err)
            }
            else if (config) {
                var guild = client.guilds.find(function(g) { return g.id == config.id })
                if (guild) {
                    if (config.name !== guild.name) {
                        API.update(guild.id,{name:guild.name},function(err, res) {
                            if (err) console.error(err)
                        })
                    }
                    //fetch history
                    var mv = util.getChannel(guild.channels, config.channels.modvoting)
                    var fb = util.getChannel(guild.channels, config.channels.feedback) //config.fetch
                    if (mv) mv.fetchMessages({limit: 100}).catch( function(error) { console.error(error.message) } )
                    if (fb) fb.fetchMessages({limit: 100}).catch( function(error) { console.error(error.message) } )
                }
            }
        })
    }
    client.user.setActivity('@ me with help')
    /*
    setInterval(() => {
        console.log("Posting stats: " + client.guilds.size)
        if (client.shards && client.shards.id) dbl.postStats(client.guilds.size, client.shards.id, client.shards.total); //cycle
    }, 1800000); //every 30 minutes
    */
})


const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBL_KEY, client);


var Helper = require('./helper.js')
var helper = new Helper(API, client, perspective);

var Handler = require('./handler.js')
var handler = new Handler(API, client, intercom, helper, perspective)

client.on('message', handler.message);
client.on('messageReactionAdd', handler.reactionAdd)
client.on('messageReactionRemove', handler.reactionRemove)
client.on('guildCreate', handler.guildCreate)
client.on('guildRemove', handler.guildRemove)
client.on('presenceUpdate', handler.presenceUpdate)
client.on('guildMemberAdd', handler.guildMemberAdd)
client.on('error', console.error);

const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.AUDIT_KEY);

function security_check(guild, code) {
    guild.fetchAuditLogs({
        type: code,
        limit: 1,
    }).then(logs => {
        var latest = logs.entries.first()
        if (latest.executor.id != client.user.id) return
        
        var reason = latest.reason
        
        if (!reason) {
            leaveGuild(guild, reason)
            return
        }
        
        var delim = reason.split("|")
        if (delim.length <= 1) {
            leaveGuild(guild, reason)
            return
        }
        
        var magic = cryptr.decrypt(delim[delim.length-1])
        
        if (magic !== guild.id) {
            leaveGuild(guild, reason)
            return
        }
        
        console.log("Sanctioned action: " + reason)
        console.log("Code: " + magic)
    })
}

function leaveGuild(guild, reason) {
    console.log("Faulty action: " + reason)
    console.log("TERMINATING")
    //guild.channels.find(c => c.name == "general")send("COMPROMISE DETECTED, LEAVING GUILD. CONTACT ME ASAP AT https://discord.gg/HnGmt3T").then(function() {
    guild.leave()  
    //})
}

//22
client.on('guildBanAdd', function(guild, user) {
    security_check(guild, 22)
})

//12
client.on('channelDelete', function(channel) {
    security_check(channel.guild, 12)
})

client.login(process.env.BOT_TOKEN)

// Optional events

dbl.on('posted', () => {
  console.log('Server count posted!');
})

dbl.on('error', e => {
 console.log(`Oops! ${e}`);
})
