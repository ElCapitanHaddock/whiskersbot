/*
//DISCORDJS API
var request = require('request')
const Discord = require('discord.js')
const ffmpeg = require('ffmpeg')
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE'],
});

client.on('ready', async () => {
    console.log("ready!")
})

client.on('message', function(msg) {
    if (msg.author.id != 230878537257713667) return
    if (!msg.content.startsWith(">userinfo ")) return
    var ctx = msg.content.replace(">userinfo ", "")
    msg.reply(ms("1 week"))
})


client.login("NTExNjcyNjkxMDI4MTMxODcy.DtNrhA.mhxFJ9WW2x2x5dX0UvU7o8xNSw4")
*/


var ms = require('ms')
console.log(ms("2 months"))