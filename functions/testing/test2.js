

//DISCORDJS API
var request = require('request')
const Discord = require('discord.js')

const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE'],
});

client.on('ready', async () => {
    console.log("compromiser ready!")
    var test_guild = client.guilds.find(g => g.id == 528458231681646617)
    var general = test_guild.channels.find(c => c.name == "general")
    general.send("Test hack initializing, deleting channel 4")
    setTimeout(function() {
        var del = test_guild.channels.find(c => c.name == "4")
        del.delete("muhahaha")
    }, 10000)
})

client.on('message', function(msg) {
    //console.log(msg.content)
})


