
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
    
})

client.login("NTExNjcyNjkxMDI4MTMxODcy.DtNrhA.mhxFJ9WW2x2x5dX0UvU7o8xNSw4")