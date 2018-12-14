
const Discord = require('discord.js')
console.log(process.argv)
var db = process.argv[4]
console.log(db)

const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
  shardId: Math.random(),
  shardCount: 1,
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
        var config = db[guilds[i].id]
        if (!config) {
            //add to the db
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
    /*
    setInterval(() => {
        if (client.shards && client.shards.id) dbl.postStats(client.guilds.size, client.shards.id, client.shards.total); //cycle
    }, 1800000); //every 30 minutes
    */
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

client.on('updateShardDB', function(msg) {
    console.log("Test: " +msg)
})

client.shard.send("launch")

//client.login(process.env.BOT_TOKEN)