
var util = require('../util')
var Func = function(Discord) {
    var self = this
        
    self.propose = function(msg, ctx, config, cb) {
        var ch = util.getChannel(msg.guild.channels, config.channels.modvoting);
        if (ch == null) {
            cb("Use the command @Ohtred channel modvoting [name] to assign a designated voting channel", null)
        }
        else {
            console.log(msg.author.toString() + " proposed: " + msg.content)
            var prop_id = Math.random().toString(36).substring(4);
            const embed = new Discord.RichEmbed()
    
            embed.setTitle(".:: **PROPOSAL**")
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
            if (msg.attachments.size > 0) {
                console.log("Image attached")
                embed.setDescription(ctx + "\n" + msg.attachments.array()[0].url)
            }
            else {
                console.log("No image attached")
                embed.setDescription(ctx)
            }
            
            embed.setFooter(prop_id)
            embed.setTimestamp()
            ch.send({embed})
                .then(message => cb(null, msg.author.toString() + "\n *" + prop_id + `* at ${message.url}`)).catch( function(error) { console.error(error) } )
            var alert_level = (ctx.match(/❗/g) || []).length
            if (alert_level >= 2) {
                ch.send("@everyone")
            }
            else if (alert_level == 1) {
                ch.send("@here")
            }
        }
    }
    
    self.motion = (msg, ctx, config, cb) => {
        var ch = util.getChannel(msg.guild.channels, config.channels.modvoting);
        if (ch == null) {
            cb("Use the command @Ohtred channel modvoting [name] to assign a designated voting channel", null)
        }
        else {
            var params = ctx.trim().split(" ")
            if (params[0] && !isNaN(params[0]) && params[0] >= 2 && params[1]) {
                params = [params[0], params.slice(1).join(" ")]
                console.log(msg.author.toString() + " motioned: " + msg.content)
                var prop_id = Math.random().toString(36).substring(4);
                const embed = new Discord.RichEmbed()
    
                embed.setTitle(".:: **MOTION** | **"+params[0]+"**")
                embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
                if (msg.attachments.size > 0) {
                    console.log("Image attached")
                    embed.setDescription(params[1] + "\n" + msg.attachments.array()[0].url)
                }
                else {
                    console.log("No image attached")
                    embed.setDescription(params[1])
                }
                
                embed.setFooter(prop_id)
                embed.setTimestamp()
                ch.send({embed})
                    .then(message => cb(null, msg.author.toString() + "\n *" + prop_id + `* at ${message.url}`)).catch( function(error) { console.error(error.message) } )
            }
            else cb(msg.author.toString() + " sorry, you need to include a threshold parameter greater than 2 before your description!")
        }
    }
}

module.exports = Func