
const Discord = require('discord.js')
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
});


var id = 501310750074077215
//501310750074077215 okbr
//506983757228671006 comedy heaven
//501310750074077215 peepee poopoo
//518265245697835009 //whiskers disciples

var tk = "NTI4ODA5MDQxMDMyNTExNDk4.XKVQ1Q.Z8efF_WP2n9hMPn7JPtAZWTxs6w"
client.login(tk)



client.on('ready', function() {
  /*
  var guild = client.guilds.find(function(g) { return g.id == id })
  var emotes = guild.emojis.array()
  for (var i = 0; i < emotes.length; i++) {
    console.log(emotes[i].toString())
  }
  */
  
  var reduced = client.guilds.map(a => { return {name:a.name, size:a.memberCount} })
  var sorted = reduced.sort(function(a,b) {
    return b.size - a.size
  })
  console.log(sorted)
  process.exit()
})