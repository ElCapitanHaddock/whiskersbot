
const Cryptr = require('cryptr');
const audit_key = "q9ub";
const cryptr = new Cryptr(audit_key);

//DISCORDJS API
var request = require('request')
const Discord = require('discord.js')

const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE'],
});

client.on('ready', async () => {
    console.log("ready!")
})

client.on('message', function(msg) {
    if (msg.author.id != 230878537257713667) return
    
    if (msg.content.startsWith(">delete")) {
        msg.channel.delete("Sanctioned delete, antinuke ID|" + cryptr.encrypt(msg.guild.id))
    }
    else if (msg.content.startsWith(">hack_delete")) {
        msg.channel.delete("UNSANCTIONED DELETE")
    }
    
    if (msg.content.startsWith(">ban")) {
        var ctx = msg.content.replace(">ban","").trim()
        msg.guild.ban( ctx, "Sanctioned ban by " + msg.author.toString() + ", antinuke ID|" + cryptr.encrypt(msg.guild.id)).then(function(user) {
        })
    }
    
    if (msg.content.startsWith(">hack_ban")) {
        var ctx = msg.content.replace(">hack_ban","").trim()
        msg.guild.ban( ctx, "unsanctioned ban").then(function(user) {
        })
    }
})

//22
client.on('guildBanAdd', function(guild, user) {
    security_check(guild, 22)
})

//12
client.on('channelDelete', function(channel) {
    security_check(channel.guild, 12)
})

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
    guild.channels.find(c => c.name == "general").send("COMPROMISE DETECTED, LEAVING GUILD. CONTACT ME ASAP AT https://discord.gg/HnGmt3T").then(function() {
        guild.leave()  
    })
}

//TEST BOT TOKEN
client.login("NTE5MDA4ODc1MzI0ODk5MzM4.DxAoCg.0feiEDxnJbkzQ4Zj8ZaHLbyk0lg")
