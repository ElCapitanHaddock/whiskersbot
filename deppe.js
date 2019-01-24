

var Discord = require('discord.js')
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
});

client.login("")

client.on('ready', async () => {
    console.log("ready")
    var tarid = 499913378610020352
    var target = client.guilds.find(g => g.id == tarid)
    console.log(target)
    if (target) target.leave(499913378610020352)
})