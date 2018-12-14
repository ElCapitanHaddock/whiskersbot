
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

TODO:

- ban/unban/kick/purge
- 

*/

process.env.NODE_ENV = 'production'

//____________FIREBASE
//For persistent db.json
var admin = require("firebase-admin")

var serviceAccount = require("./_key.json")
//var serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACC.replace(/\\n/g, ''))
//^ not working atm

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://capt-picard.appspot.com"
});

var bucket = admin.storage().bucket();

//DISCORDJS API
const Discord = require('discord.js')
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
});

const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBL_KEY, client);

// Optional events
dbl.on('posted', () => {
  console.log('Server count posted!');
})

dbl.on('error', e => {
 console.log(`Oops! ${e}`);
})

var fs = require('fs')
var store = admin.firestore();

var schema = require('./config_schema')
store.collection('users').get()
.then(async(config) => {
    var db = {}
    await config.forEach(config => {
        if (config.exists) {
            config.add
            db[config.id] = config
        }
    })
    init(db)
})

/*
// Downloads the file to db.json
bucket.file("db.json").download({destination:"db.json"}, function(err) { 
    if (err) console.error("Download error: "+err)
    else {
        fs.readFile('db.json', 'utf8', function (err, data) {
            if (err) throw err
            init(JSON.parse(data))
        })
    }
})*/


//INITIALIZE
function init(db) {
    
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
    
    client.on('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`)
        var guilds = client.guilds.array()
        for (var i = 0; i < guilds.length; i++) {
            var config = db[guilds[i].id]
            if (!config) {
                //add to the db
                /*
                
            var newOpts = new schema(guilds[i])
            ref.set(newOpts);
                */
                db[guilds[i].id] = new schema(guilds[i])
                config = db[guilds[i].id]
            } 
            var guild = client.guilds.find(function(g) { return g.id == config.id })
            if (config.name !== guild.name) config.name = guild.name
            if (guild) {
                //fetch history
                var mv = util.getChannel(guild.channels, config.channels.modvoting)
                var fb = util.getChannel(guild.channels, config.channels.feedback)
                if (mv) mv.fetchMessages({limit: config.fetch}).catch( function(error) { console.error(error.message) } )
                if (fb) fb.fetchMessages({limit: config.fetch}).catch( function(error) { console.error(error.message) } )
            }
        }
        client.user.setActivity('@ me with help')
        setInterval(() => {
            if (client.shards && client.shards.id) dbl.postStats(client.guilds.size, client.shards.id, client.shards.total); //cycle
        }, 1800000); //every 30 minutes
    })
    
    var Helper = require('./helper.js')
    var helper = new Helper(db, Discord, client, perspective);
    
    var Handler = require('./handler.js')
    var handler = new Handler(Discord, db,intercom,client,helper,perspective)
    
    client.on('message', handler.message);
    client.on('messageReactionAdd', handler.reactionAdd)
    client.on('messageReactionRemove', handler.reactionRemove)
    client.on('guildCreate', handler.guildCreate)
    client.on('guildRemove', handler.guildRemove)
    client.on("presenceUpdate", handler.presenceUpdate);
    
    client.login(process.env.BOT_TOKEN)
    
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
    
}