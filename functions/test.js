
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
    console.log(ctx)
    var members = msg.guild.members
    var m = members.find(m => m.toString() === ctx || m.id === ctx || m.displayName.startsWith(ctx))
    if (m) {
        var embed = new Discord.RichEmbed()
        embed.setDescription(m.toString())
        embed.setAuthor(m.user.tag, m.user.avatarURL)
        embed.setThumbnail(m.user.avatarURL)
        embed.setColor(m.displayColor)
        var options = {   
            day: 'numeric',
            month: 'long', 
            year: 'numeric'
        };
        embed.addField("Joined", m.joinedAt.toLocaleDateString("en-US", options))
        embed.addField("Created", m.user.createdAt.toLocaleDateString("en-US", options))
        var roles = m.roles.array()
        var role_list = ""
        for (var i = 0; i < roles.length; i++) {
            role_list += roles[i].toString() + " "
        }
        embed.addField("Roles", role_list ? role_list : "None")
        embed.setFooter("ID: " + m.id)
        msg.channel.send(embed)
    }
})


client.login("NTExNjcyNjkxMDI4MTMxODcy.DtNrhA.mhxFJ9WW2x2x5dX0UvU7o8xNSw4")