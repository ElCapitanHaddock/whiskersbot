

//DISCORDJS API
var request = require('request')
const Discord = require('discord.js')

const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE'],
});

client.on('ready', async () => {
    console.log("compromiser ready!")
    var general = client.guilds.first().channels.find(c => c.id == "530519610357973001")
    general.send("Test hack initializing, deleting channel 10")
    setTimeout(function() {
        var del = client.guilds.first().channels.find(c => c.name == "10")
        del.delete()
    }, 10000)
})

client.on('message', function(msg) {
    console.log(msg.content)
})



//TEST BOT TOKEN
client.login("NTE5MDA4ODc1MzI0ODk5MzM4.DxAoCg.0feiEDxnJbkzQ4Zj8ZaHLbyk0lg")
