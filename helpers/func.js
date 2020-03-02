
//voting commands

var util = require('../util')
var Discord = require('discord.js')

var Func = function(API) {
    var self = this
        
    self.propose = function(msg, ctx, config, cb) {
        var ch = util.getChannel(msg.guild.channels, config.channels.modvoting);
        if (ch == null) {
            cb("Use the command @whiskers channel modvoting [name] to assign a designated voting channel", null)
        }
        else {
            console.log(msg.author.toString() + " proposed: " + msg.content)
            var prop_id = Math.random().toString(36).substring(4);
            const embed = new Discord.RichEmbed()
    
            embed.setTitle(".:: **PROPOSAL**")
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
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
                .then(message => cb(null, "<:green_check:520403429479153674> " + msg.author.toString() + " at " + ch.toString())).catch( function(error) { console.error(error) } )
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
            cb("Use the command @whiskers channel modvoting [name] to assign a designated voting channel", null)
        }
        else {
            var params = ctx.trim().split(" ")
            if (params[0] && !isNaN(params[0]) && params[0] >= 2 && params[1]) {
                params = [params[0], params.slice(1).join(" ")]
                console.log(msg.author.toString() + " motioned: " + msg.content)
                var prop_id = Math.random().toString(36).substring(4);
                const embed = new Discord.RichEmbed()
    
                embed.setTitle(".:: **MOTION** | **"+params[0]+"**")
                embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
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
                    .then(message => cb(null, "<:green_check:520403429479153674> " + msg.author.toString() + " at " + ch.toString())).catch( function(error) { console.error(error.message) } )
            }
            else cb(msg.author.toString() + " sorry, you need to include a threshold parameter greater than 2 before your description!")
        }
    }
    /*
    self.poll = (msg, ctx, config, cb) => { 
        var params = ctx.trim().split(" ") //list, create, delete, spawn
        params = [params[0], params.slice(1).join(" ")]
        
        config.emotes = [ ["👍", "👎", "✋"], ["🐶","🐱","🐦"]  ]//dummy test
        var presets = config.presets
        
        switch(params[0]) {
            case "create":
                break;
            case "delete":
                break;
            case "list":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Poll Presets")
                var res
                presets.forEach(el => {
                    el.forEach(e => {
                        res += e + " "
                    })
                    res += "\n"
                })
                embed.setDescription(res)
                msg.channel.send(embed).catch(console.error)
                break;
            case "spawn": //threshold conclusion
                var embed = new Discord.RichEmbed()
                embed.setTitle("**Poll**")
                var syntax = params[1].split(" ")
                if (syntax.length < 3) {
                    cb("Invalid syntax! You need a preset #, a vote threshold #, and a description.")
                    return
                }
                var preset = syntax[0]
                var thresh = syntax[1]
                var description = syntax.slice(2).join(" ")
                
                if (isNaN(preset) || preset <= 0 || preset >= preset.length) {
                    cb("Invalid preset #!")
                    return
                }
                var pre = presets[preset]
                embed.setDescription(description)
                embed.setFooter(thresh + " votes to win")
                
                msg.channel.send(embed).then(async(emb) => {
                    for (var i = 0; i < pre.length; i++) {
                        await emb.react(pre[i]).catch(console.error)
                    }
                })
                
                break;
            default:
                cb("Invalid syntax!")
                break;
        }
        
        //reaction handling will need:
            /*
            deleting non-poll reactions
            for votes
            
    }
    */
}

module.exports = Func