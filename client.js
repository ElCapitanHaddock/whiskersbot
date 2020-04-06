
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


//FIREBASE
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

//DISCORDJS API
const Discord = require('discord.js')

const client = new Discord.Client({
  
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  
  disabledEvents: 
    ['TYPING_START', 
     'USER_UPDATE', 
     'USER_NOTE_UPDATE', 
     'VOICE_SERVER_UPDATE', 
     'MESSAGE_UPDATE',
     'MESSAGE_DELETE',
     'GUILD_INTEGRATIONS_UPDATE'],
});
    
//PERSPECTIVE API
const Perspective = require('perspective-api-client')
const perspective = new Perspective({apiKey: process.env.PERSPECTIVE_API_KEY})
//--------------------------------------------


var util = require('./util')
var schema = require('./config_schema')

client.on('ready', async () => {
    console.log('______________________')
    console.log('𝖜𝖍𝖎𝖘𝖐𝖊𝖗𝖘 init')
    console.log('----------------------')
    console.log(`Shard #${client.shard.ids} is online.`)
    console.log('----------------------')
    var guilds = client.guilds.cache.array()
    for (var i = 0; i < guilds.length; i++) {
        
        let curr = guilds[i] //for sync
        API.get(guilds[i].id, function(err, config) {
            if (err) {
                //TEMP
                if (err == 404 && curr) {
                    var proto_newG = new schema(curr)
                    var newG = Object.assign({}, proto_newG)
                    API.set(newG.id, newG, function(err, res) {
                        if (err) console.error(err)
                        else console.log("New guild added: (from bootup): " + curr.name)
                    })
                }
                else console.error("Get Error: "+curr.name + " | " + curr.id)
            }
            else if (config) {
                var guild = client.guilds.cache.find(function(g) { return g.id == config.id })
                if (guild) {
                    if (config.name !== guild.name) {
                        API.update(guild.id,{name:guild.name},function(err, res) {
                            if (err) console.error("Update Error:"+err)
                        })
                    }
                    //fetch history
                    var mv = util.getChannel(guild.channels, config.channels.modvoting)
                    var fb = util.getChannel(guild.channels, config.channels.feedback) //config.fetch
                    if (mv) mv.messages.fetch({limit: 100}).catch( function(error) { console.error(error.message) } )
                    if (fb) fb.messages.fetch({limit: 100}).catch( function(error) { console.error(error.message) } )
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

function checkMutes() {
    API.getFinishedMutes(function(err, mutes) {
        if (err) {
            console.error(err)
            return
        }
        mutes.forEach(function(mute) {
            var data = mute.data()
            
            API.removeMute(mute.id, function(err, res) {
                if (err) console.error(err)
                else console.log("Success.")
            })
            
            var guild, member, role
            
            var guild = client.guilds.cache.find(g => g.id == data.guild)
            
            if (guild) {
                var member = guild.members.cache.find(m => m.id == data.member)
                var role = guild.roles.cache.find(r => r.id == data.role)
            }
            
            if (!guild || !member || !role) return

            member.removeRole(role).then(function() {
                console.log("Per schedule, removed muted role from user")
            })
        })
    })
}

const muteCheckInterval = 2 //in minutes

setInterval(checkMutes, muteCheckInterval * 60 * 1000)
checkMutes()


const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBL_KEY, client);

var Helper = require('./helper.js')
var helper = new Helper(API, client, perspective, dbl);

var Handler = require('./handler.js')
var handler = new Handler(API, client, helper, perspective)

client.on('message', handler.message);
client.on('messageReactionAdd', handler.reactionAdd)
client.on('messageReactionRemove', handler.reactionRemove)
client.on('guildCreate', handler.guildCreate)
client.on('guildDelete', handler.guildDelete)
client.on('presenceUpdate', handler.presenceUpdate)
client.on('guildMemberAdd', handler.guildMemberAdd)
client.on('guildMemberRemove', handler.guildMemberRemove)
client.on('error', console.error);

//for sending aross shards
client.embassySend = function(req) {
    if (req.shard.id == client.shard.ids) return
    
    var guilds = this.guilds
    var other = guilds.find(g => g.id == req.to)
    
    if (other) {
    
        var embassy = other.channels.cache.find(function(channel) {
          if (channel.topic == req.from) {
            return channel
          } else return null
        })
        
        if (embassy) {
        
            new Discord.WebhookClient(req.webhooks[embassy.id].id, req.webhooks[embassy.id].token)
            .edit({name: req.username, avatar: req.avatar})
            .then(function(wh) {
                wh.send(req.text).catch(console.error);
            }).catch(console.error)
        }
    }
}

const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.AUDIT_KEY);


/*ANTI NUKE
    checks whiskers' latest audit entry
    if it does not contain security code, leave the guild
*/
function security_check(guild, code) {
    guild.fetchAuditLogs({
        type: code,
        limit: 1,
    }).then(logs => {
        
        //latest audit entry
        var latest = logs.entries.first()
        
        //if it has nothing to do with whiskers, return
        if (latest.executor.id != client.user.id) return
        
        var reason = latest.reason
        
        //if no reason provided for whiskers action, leave guild
        if (!reason) {
            leaveGuild(guild, reason)
            return
        }
        
        var delim = reason.split("|")
        if (delim.length <= 1) {
            leaveGuild(guild, reason)
            return
        }
        
        //decrypts to guild ID
        var magic = cryptr.decrypt(delim[delim.length-1])
        
        //if NOT guild ID, leave guild
        if (magic !== guild.id) {
            leaveGuild(guild, reason)
            return
        }
        
        /*
        Examole output:
        Sanctioned action: Sanctioned ban by <@230878537257713667>, 
        antinuke ID|a51893469e5a31376e00a1262cd5e9c7fa5f35b43a45d750bc49a17ef7c8a694e769
        */
        console.log("Sanctioned action: " + reason)
        console.log("Code: " + magic) //guild ID
    })
}

//leave guild if compromise detected
function leaveGuild(guild, reason) {
    console.log("Faulty action: " + reason)
    console.log("TERMINATING")
    //guild.channels.find(c => c.name == "general")send("COMPROMISE DETECTED, LEAVING GUILD. CONTACT ME ASAP AT https://discord.gg/HnGmt3T").then(function() {
    guild.leave()  
    //})
}

//CHECKING FOR COMPROMISE

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
