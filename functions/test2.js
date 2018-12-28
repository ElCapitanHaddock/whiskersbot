
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
    if (!msg.content.startsWith(">gif ")) return
    var ctx = msg.content.replace(">gif ","")
    var key = "54JUS0JV3APJ"
    
    request.get(
        {
            url: "https://api.tenor.com/v1/search?q="+ctx+"&key="+key+"&pos=2&limit=1"
        },
        function (err, res, body) {
            if (err) {
                console.error(err)
                return
            }
            var content = JSON.parse(body)
            var gifs = content.results
            //console.log(gifs)
            
            var embed = new Discord.RichEmbed()
            embed.setTitle(ctx)
            embed.setImage(gifs[0].url)
            embed.setFooter("1/"+gifs.length)
            
            var reactions = ["⏹","⬅","➡"]
            msg.channel.send({embed}).then(function(emb) {
                emb.react("⏹").then(function() {
                    emb.react("⬅").then(function() {
                        emb.react("➡").then(function() {
                        })
                    })
                })
                var collector = emb.createReactionCollector((reaction, user) => user.id === msg.author.id, {max: 20, time: 120*1000, errors: ['time'] });
                collector.on('collect', reaction => {
                    var i = reactions.indexOf(reaction.emoji.name)
                    if (i == -1) return
                    if (i == 0) {
                        collector.stop()
                        return
                    }
                    var old = collector.message.embeds[0]
                    var params = old.footer.text.split("/")
                    console.log("Index: " + i)
                    
                    var newEdit = new Discord.RichEmbed()
                    newEdit.setTitle(old.title)
                    var current = Number(params[0])
                    var total = Number(params[1])
                    if (i == 1) {
                        current -= 1
                    }
                    if (i == 2) {
                        current += 1
                    }
                    if (current <= 0) {
                        current = total
                    }
                    if (current > total) {
                        current = 1
                    }
                    console.log("Current: " + current)
                    console.log("Total: " + total)
                    newEdit.setImage(gifs[current-1].url)
                    newEdit.setFooter(current + "/" + total)
                    collector.message.edit({newEdit}).then(msg => console.log(msg.embeds[0])).catch(console.error);
                })
                collector.on('end', function() {
                    console.log("End")
                    emb.clearReactions();
                });
            })
        }
    )
    
    /*
    if (msg.member.voiceChannel) {
        msg.member.voiceChannel.join().then(
            connection => {
                console.log('Connected!')
            })
          .catch(console.error);
    }
    */
})

client.login("NTExNjcyNjkxMDI4MTMxODcy.DtNrhA.mhxFJ9WW2x2x5dX0UvU7o8xNSw4")