
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

Picard is hosted on Heroku as my alter-ego, Ohtred
If you wish to host your own version of Picard, here is a good tutorial: https://shiffman.net/a2z/bot-heroku/

Invite:
https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot


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
//These are the servers where I let myself talk through Ohtred
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
                    var newG = new schema({id: guilds[i].id, name: guilds[i].name})
                    API.set(newG, function(err, res) {
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
    setInterval(() => {
        if (client.shards && client.shards.id) dbl.postStats(client.guilds.size, client.shards.id, client.shards.total); //cycle
    }, 1800000); //every 30 minutes
})

var Helper = require('./helper.js')
var helper = new Helper(API, Discord, client, perspective);

var Handler = require('./handler.js')
var handler = new Handler(API, Discord, client, intercom,helper,perspective)

client.on('message', handler.message);
client.on('messageReactionAdd', handler.reactionAdd)
client.on('messageReactionRemove', handler.reactionRemove)
client.on('guildCreate', handler.guildCreate)
client.on('guildRemove', handler.guildRemove)
client.on('presenceUpdate', handler.presenceUpdate)
client.on('guildMemberAdd', handler.guildMemberAdd)

client.login(process.env.BOT_TOKEN)

const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBL_KEY, client);

// Optional events
dbl.on('posted', () => {
  console.log('Server count posted!');
})

dbl.on('error', e => {
 console.log(`Oops! ${e}`);
})

/*
var backup = setInterval(function() {
    fs.writeFile('db.json', JSON.stringify(db), 'utf8', function(err) {
        if (err) console.error(err)
        bucket.upload("db.json", {
          gzip: true,
          metadata: { cacheControl: 'no-cache', },
        },function(err){
            if (err) console.error("Upload error: "+err)
            console.log("::::::::::::::: db.json SAVED")
        });
    })
}, 900000) //backup every 15 minutes

// Listen for process termination, upload latest db.json to be accessed on reboot
process.on('SIGTERM', function() {
    clearInterval(backup)
    fs.writeFile('db.json', JSON.stringify(db), 'utf8', function(err) {
        if (err) console.error(err)
        bucket.upload("db.json", {
          gzip: true,
          metadata: { cacheControl: 'no-cache', },
        },function(err){
            if (err) console.error("Upload error: "+err)
            console.log("Gracefully restarted.")
            process.exit(2);
        });
    })
});
*/

//}