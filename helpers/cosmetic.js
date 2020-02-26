

//const memeLib = require('nodejs-meme-generator');
//const memeGenerator = new memeLib();
var fs = require("fs")
var request = require('request');
var Discord = require('discord.js')
const scrapeIt = require('scrape-it')
//const puppeteer = require('puppeteer');
var countries = require('i18n-iso-countries')

var util = require('../util')
const si = require('systeminformation')


var Cosmetic = function(API, perspective, translate, client, cloudinary, dbl) {
    /*C O S M E T I C
    usable by anyone*/
    var self = this
    
    const About = require("./about.js")
    const kiosk = new About(client, dbl)
    
    self.about = (msg, ctx, config, cb) => {
        if (kiosk[ctx]) {
            kiosk[ctx](msg, config, cb)
        }
        else cb(msg.author.toString() + " Please include a topic parameter! Use *@whiskers help* to get topics to choose from.")
    }
    
    //misc image processing commands
    var ImageUtils = require('./apis/image.js')
    var img_utils = new ImageUtils(client, cloudinary, translate)
    var img_cmds = [
        "classify",
        "describe",
        "identify",
        "landmark",
        "locate",
        "similar",
        "mirror",
        "read",
        "imgtranslate",
        "funny",
        "soy",
        "nsfw_test",
        "mood",
        "img",
        "inspire",
        "inspire2",
        "demotivate",
        "inspire_quote",
        "meme",
        "fakeperson",
        "aipaint",
        "deepdream",
        "colorize",
        "enhance"
    ]
    img_cmds.forEach(c => {
        self[c] = img_utils[c]
    })
    
    //misc text processing commands
    var InfoUtils = require('./apis/info.js')
    var info_utils = new InfoUtils(client, translate, perspective)
    var info_cmds = [
        "translate_fancy",
        "translate",
        "number",
        "scp",
        "wikipedia",
        "kym",
        "yahoo",
        "query",
        "lookup",
        "redditor",
        "google",
        "fakeid",
        "paterico",
        "doge",
        "nickname",
        "inspiro",
        "cute",
        "boss",
        "name",
        "vibe",
        "poke",
        "wutang",
        "curse",
        "whatdo",
        "talkabout",
        "teenagers",
        "ouija",
        "scan",
        "geo",
        "analyze",
        "gif",
        "yomama"
    ]
    info_cmds.forEach(c => {
        self[c] = info_utils[c]
    })

/*
 __  __     ______   __     __         __     ______   __  __    
/\ \/\ \   /\__  _\ /\ \   /\ \       /\ \   /\__  _\ /\ \_\ \   
\ \ \_\ \  \/_/\ \/ \ \ \  \ \ \____  \ \ \  \/_/\ \/ \ \____ \  
 \ \_____\    \ \_\  \ \_\  \ \_____\  \ \_\    \ \_\  \/\_____\ 
  \/_____/     \/_/   \/_/   \/_____/   \/_/     \/_/   \/_____/ 
                                                                 
*/
    
    self.settings = (msg, ctx, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle(msg.guild.name + " | Prefix: " + config.prefix)
        var permits = ""
        for (var i = 0; i < config.permissible.length; i++) {
            if ( msg.guild.roles.find( r => r.id == config.permissible[i] ) ) permits += "• <@&" + config.permissible[i] + ">\n"
        }
        embed.addField("Permitted Roles", (permits.length != 0) ? permits : "None set")
        embed.addField("Muted role", (config.mutedRole) ? "<@&"+config.mutedRole+">" : "None set", true)
        embed.addField("Auto-role", (config.autorole) ?  "<@&"+config.autorole+">" : "None set")
        
        var channels = ""
        
        if (config.channels.modvoting && util.getChannel(msg.guild.channels,config.channels.modvoting)) channels += "• modvoting: <#"+config.channels.modvoting+">\n"
        if (config.channels.modannounce && util.getChannel(msg.guild.channels,config.channels.modannounce)) channels += "• modannounce: <#"+config.channels.modannounce+">\n"
        if (config.channels.modactivity && util.getChannel(msg.guild.channels,config.channels.modactivity)) channels += "• modactivity: <#"+config.channels.modactivity+">\n"
        if (config.channels.feedback && util.getChannel(msg.guild.channels,config.channels.feedback)) channels += "• feedback: <#"+config.channels.feedback+">\n"
        if (config.channels.verifylog && util.getChannel(msg.guild.channels,config.channels.verifylog)) channels += "• verifylog: <#"+config.channels.verifylog+">\n"
        if (config.channels.reportlog && util.getChannel(msg.guild.channels,config.channels.reportlog)) channels += "• reportlog: <#"+config.channels.reportlog+">"
        
        embed.addField("Channels", channels.trim().length == 0 ? "None set" : channels)
        
        embed.addField(
            "Vote Thresholds",
            "• Mod votes need "+config.thresh.mod_upvote+" "+config.upvote+" to pass\n"+
            "• Mod votes need "+config.thresh.mod_downvote+" "+config.downvote+" to fail\n"+
            "• Petitions need " +config.thresh.petition_upvote+" "+config.upvote+" to progress\n"+
            "• Messages need "+config.thresh.report_vote+" "+config.report+" to be reported", true)
        embed.addField(    
            "Intervals",
            "• The # online counter display is updated with changes of " + config.counter + "\n"+
            "• Users are muted for " + config.report_time + " as a report punishment")
        
        var reports = ""
        for (var i = 0; i < config.reportable.length; i++) {
            if (util.getChannel(msg.guild.channels,config.reportable[i])) reports += "• <#" + config.reportable[i] + ">\n"
        }
        embed.addField("Reportable Channels", (reports.length != 0) ? reports : "None set")
        
        if (config.censors) {
            var censors = "`" + config.censors.join(", ") + "`"
            
            embed.addField("Censored Phrases", censors)
        }
        
        var blacklist = ""
        for (var i = 0; i < config.blacklist.length; i++) {
            if (util.getChannel(msg.guild.channels,config.blacklist[i])) blacklist += "• <#" + config.blacklist[i] + ">\n"
        }
        embed.addField("Blacklisted Channels", (blacklist.length != 0) ? blacklist : "None set", true)
        embed.addField("Lockdown Level", (config.lockdown) ? config.lockdown : "0")
        embed.addField("Verification Level", (config.verification) ? config.verification : "0")
        embed.addField("Verify Age Bypass", (config.verify_age) ? config.verify_age : "None set")
        embed.setThumbnail(msg.guild.iconURL)
        embed.setFooter("🆔 "+msg.guild.id)
        cb(null, embed)
    }
    
    self.gbig = (msg, ctx, config, cb) => {
        
        if (!ctx || !ctx.trim()) return
        if (!Number(ctx)) return
        ctx = Number(ctx)
        if (ctx < 1 || ctx > 50) return
        
        var guilds = client.guilds.array()
    
        guilds = guilds.sort( (a,b) => b.memberCount - a.memberCount ).map( g => { return {name: g.name, size: g.memberCount, date: g.joinedAt } })
        var res = "```" + guilds.slice(0,ctx).map(g => `${g.name} (${g.size})`).join("\n") + "```"
        
        msg.channel.send(res)
    }
    
    self.gsearch = (msg, ctx, config, cb) => {
        
        if (!ctx || !ctx.trim() || ctx.length < 2 || ctx.length > 100) return
        
        var embed = new Discord.RichEmbed()
        
        var g = client.guilds.find(g => g.id == ctx)
        
        if (!g) {
            
            var gs = client.guilds.filter(g => g.name == ctx )
            if (gs.size < 1) gs = client.guilds.filter(g => g.name.startsWith(ctx))
            if (gs.size < 1) gs = client.guilds.filter(g => g.name.includes(ctx))
            if (gs.size < 1) gs = client.guilds.filter( g => g.name.toLowerCase().startsWith(ctx.toLowerCase()) )
            if (gs.size < 1) gs = client.guilds.filter(g => g.name.toLowerCase().includes(ctx.toLowerCase()))
            
            if (gs.size == 1) g = gs.first()
            else if (gs.size > 1) {
                embed.setTitle('Results for ' + ctx)
                
                gs = gs.map(g => `${g.id} : ${g.name}\n${g.region}, ${g.memberCount} members`).slice(0,50)
                
                embed.setDescription('```' + gs.join('\n--------------------\n') + '```')
                msg.channel.send(embed)
                return
            }
        }
        
        if (g) {
            
            //g.fetchMembers().then(() => {
            
            embed.setTimestamp()
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            }
            embed.setTitle(g.name)
            embed.addField("Owner", g.owner.toString(), true)
            
            embed.addField("Region", g.region, true)
            
            var numOnline = 0;
            
            embed.addField("Roles", g.roles.size, true)
            embed.addField("Channels", g.channels.size, true)
            
            embed.addField("Emojis", g.emojis.size, true)
            
            embed.addField("Members", g.memberCount, true)
            g.members.tap( (user) => numOnline += user.presence.status !== 'offline' ? 1 : 0 );
            embed.addField("Currently Online", numOnline, true)
            
            embed.addField("Created", g.createdAt.toLocaleDateString("en-US", options), true)
        
            embed.setThumbnail(g.iconURL)
            embed.setFooter("🆔 "+g.id)
            
            embed.setColor('GREEN')
            
            msg.channel.send(embed)
            
            //})
        }
        else {
            embed.setTitle('**Not found!**')
            embed.setColor('RED')
            //embed.setThumbnail('https://cdn.discordapp.com/emojis/520403429835800576.png?v=1')
            embed.setFooter(`'${ctx}'`)
            msg.channel.send(embed)
        }
    }
    
    self.usearch = (msg, ctx, config, cb) => {
        
        if (!ctx || !ctx.trim() || ctx.length < 2 || ctx.length > 36) return
          
        if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.id
        }
        
        var members = msg.guild.members
        
        var embed = new Discord.RichEmbed()
        
        var m = members.find(m => m.toString() === ctx || m.id === ctx)// || m.user.tag.startsWith(ctx))
        
        var u = client.users.find(u => u.id == ctx)
        if (!u) u = client.users.find( u => u.tag == ctx )
        
        if (!u) {
            
            var us = client.users.filter(u => u.username == ctx)
            if (us.size < 1) us = client.users.filter(u => u.tag.startsWith(ctx) )
            if (us.size < 1) us = client.users.filter(u => u.tag.toLowerCase().startsWith(ctx.toLowerCase()) )
            
            //soft search
            if (us.size == 1) u = us.first()
            else if (us.size > 1) {
                
                embed.setTitle('Results for ' + ctx)
                embed.setDescription('```' + us.map(u => u.tag).slice(0,50).join(', ') + '```')
                //embed.setFooter(`'${ctx.slice(0,100)}'`)
                msg.channel.send(embed)
                return
            }
        
        }
        
        if (u) {
            
            embed.setAuthor(u.tag, u.displayAvatarURL)
            //embed.setImage(u.displayAvatarURL)
            
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            };
            
            embed.setFooter(u.id + ' • ' + u.createdAt.toLocaleDateString("en-US", options))
            
            switch (u.presence.status) {
                case 'online':
                    embed.setColor('GREEN')
                    break;
                case 'idle':
                    embed.setColor('YELLOW')
                    break;
                case 'dnd':
                    embed.setColor('RED')
                    break;
            }
            
            var guilds = client.guilds.filter(g => g.member(u) != undefined)
            
            guilds = guilds.sort( (a, b) => b.memberCount - a.memberCount )
            
            var nicks = guilds.map(g => {
                var n = g.member(u).displayName
                if (n.length > 18) n = n.slice(0,15) + '...'
                return '`'+n+'`'
            }).slice(0, 20)
            
            var seenin = guilds.map(g => {
                var n = g.name
                if (n.length > 18) n = n.slice(0,15) + '...'
                return '`'+n+'`'
            }).slice(0, 20)
            
            if (guilds.size > nicks.length) {
                nicks.push('...')
                seenin.push('...')
            }
            
            embed.setTitle('Seen In ' + guilds.size + ' Servers')
            
            embed.addField('**Aliases**', nicks.join('\n') + '\n\u200b\n', true)
            embed.addField('**Guilds**', seenin.join('\n') + '\n\u200b\n', true)
            
            msg.channel.send(embed)
        }
        else {
            embed.setTitle('**Not found!**')
            //embed.setThumbnail('https://cdn.discordapp.com/emojis/520403429835800576.png?v=1')
            embed.setFooter(`'${ctx.slice(0,100)}'`)
            msg.channel.send(embed)
        }
    }
    
    self.check_shard = (msg, ctx, config, cb) => {
        msg.reply(`Shard #${client.shard.id}`)
    }
    
    self.emote = (msg, ctx, config, cb) => {
        var emotes = client.emojis.array()
    
        if (!ctx || !ctx.trim()) {
            msg.channel.send(emotes[Math.floor(Math.random()*emotes.length)].url)
            return
        }
        
        ctx = ctx.trim().replace(/ /g, '_')
        
        if (ctx.startsWith("<:") && ctx.endsWith(">")) {
            var id = ctx.slice(-19,-1)
            if (!isNaN(id)) { 
                msg.channel.send(`https://cdn.discordapp.com/emojis/${id}.png`)
                return
            }
        } 
        
        var emotelist = []//list of matches
        
        //exact match - local emotes
        emotelist = msg.guild.emojis.array().filter(e => ctx == e.toString() || ctx == e.name || ctx == e.id)
        
        //exact match - global emotes
        if (emotelist.length < 1) emotelist = emotes.filter(e => ctx == e.toString() || ctx == e.name || ctx == e.id)
        
        //search query - global emotes
        if (emotelist.length < 1) {
            ctx = ctx.toLowerCase()
            emotelist = emotes.filter(e => e.name.toLowerCase().startsWith(ctx))
        }
        
        if (emotelist.length > 0) {
            var select = emotelist[Math.floor(Math.random()*emotelist.length)]
            msg.channel.send(`\`:${select.name}:\`\n${select.url}`)
        }
        else cb("Emote not found.")
    }
    
    self.e = self.emoji = self.emote
    
    self.roleinfo = (msg, ctx, config, cb) => {
        var members = msg.guild.roles
        var r = members.find(r => r.toString() === ctx || r.id === ctx || r.name.startsWith(ctx))
        if (!r) r = members.find(r => r.toString() === ctx || r.id === ctx || r.name.toLowerCase().startsWith(ctx.toLowerCase()))
        if (r) {
            var embed = new Discord.RichEmbed()
            embed.setDescription(r.toString())
            embed.setColor(r.hexColor)
            embed.setTimestamp()
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            };
            embed.addField("Position", r.position)
            embed.addField("Members", r.members.size, true)
            
            embed.addField("Mention", "`"+r.toString()+"`")
            embed.addField("Mentionable", r.mentionable, true)
            
            embed.addField("Hoisted", r.hoist)
            
            embed.addField("Created", r.createdAt.toLocaleDateString("en-US", options))
            embed.setFooter("ID: " + r.id)
            msg.channel.send(embed)
        }
        else cb("Couldn't find that role!")
    }

    self.serverinfo = (msg, ctx, config, cb) => {
        
        
        var g = msg.guild
        
        g.fetchMembers().then(() => {
            var embed = new Discord.RichEmbed()
            embed.setTimestamp()
            var options = {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            };
            embed.setTitle(g.name)
            embed.addField("Owner", g.owner.toString(), true)
            
            embed.addField("Region", g.region, true)
            
            var numOnline = 0;
            
            embed.addField("Roles", g.roles.size, true)
            embed.addField("Channels", g.channels.size, true)
            
            embed.addField("Emojis", g.emojis.size, true)
            
            embed.addField("Members", g.members.size, true)
            g.members.tap( (user) => numOnline += user.presence.status !== 'offline' ? 1 : 0 );
            embed.addField("Currently Online", numOnline, true)
            
            embed.addField("Created", g.createdAt.toLocaleDateString("en-US", options), true)
        
            embed.setThumbnail(msg.guild.iconURL)
            embed.setFooter("🆔 "+msg.guild.id)
            
            msg.channel.send(embed)
        })
    }
    
    self.userinfo = (msg, ctx, config, cb) => {
        
        if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.id
        }
            
        if (!ctx || !ctx.trim()) {
            ctx = msg.member.toString()
        }
        var members = msg.guild.members
        
        var m = members.find(m => m.toString() === ctx || m.id === ctx)// || m.user.tag.startsWith(ctx))
        
        if (!m) m = members.find(m => m.user.tag === ctx)
        if (!m) m = members.find(m => m.user.tag.toLowerCase() === ctx.toLowerCase())
        if (!m) m = members.find(m => m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        
        if (!m) m = members.find(m => m.user.username && m.user.username == ctx)
        if (!m) m = members.find(m => m.user.username && m.user.username.toLowerCase() == ctx.toLowerCase())
        if (!m) m = members.find(m => m.user.username && m.user.username.toLowerCase().startsWith(ctx.toLowerCase()) )
        
        if (!m) m = members.find(m => m.nickname && m.nickname == ctx)
        if (!m) m = members.find(m => m.nickname && m.nickname.toLowerCase() == ctx.toLowerCase())
        
        if (!m) m = members.find(m => m.nickname && m.nickname.toLowerCase().startsWith(ctx.toLowerCase()) )
        if (m) {
            var embed = new Discord.RichEmbed()
            embed.setDescription(m.toString())
            embed.setAuthor(m.user.tag, m.user.displayAvatarURL)
            embed.setThumbnail(m.user.displayAvatarURL)
            embed.setColor(m.displayColor)
            embed.setTimestamp()
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
            
            if (m.highestRole) embed.setColor(m.highestRole.color)
            
            embed.addField("Roles", role_list ? role_list : "None")
            embed.setFooter("ID: " + m.id)
            msg.channel.send(embed)
        }
        else cb("Couldn't find that user!")
    }
    
    self.avatar = (msg, ctx, config, cb) => {
        if (!ctx || !ctx.trim()) ctx = msg.member.toString()
        var members = msg.guild.members
        
        var m = members.find(m => m.toString() === ctx || m.id === ctx)// || m.user.tag.startsWith(ctx))
        
        if (!m) m = members.find(m => m.user.tag === ctx)
        if (!m) m = members.find(m => m.user.tag.toLowerCase() === ctx.toLowerCase())
        if (!m) m = members.find(m => m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        
        if (!m) m = members.find(m => m.user.username && m.user.username == ctx)
        if (!m) m = members.find(m => m.user.username && m.user.username.toLowerCase() == ctx.toLowerCase())
        if (!m) m = members.find(m => m.user.username && m.user.username.toLowerCase().startsWith(ctx.toLowerCase()) )
        
        if (!m) m = members.find(m => m.nickname && m.nickname == ctx)
        if (!m) m = members.find(m => m.nickname && m.nickname.toLowerCase() == ctx.toLowerCase())
        if (!m) m = members.find(m => m.nickname && m.nickname.toLowerCase().startsWith(ctx.toLowerCase()) )
        
        if (m) {
            var embed = new Discord.RichEmbed()
            embed.setAuthor(m.user.tag, m.user.avatarURL)
            embed.setImage(m.user.avatarURL)
            embed.setTitle("Link")
            embed.setURL(m.user.avatarURL)
            if (m.highestRole) embed.setColor(m.highestRole.color)
            msg.channel.send(embed).catch(console.error)
        }
        else cb("Couldn't find that user!")
    }
    
    self.info = (msg, ctx, config, cb) => {
        var embed = new Discord.RichEmbed()
        embed.setTitle("Whiskers")
        embed.setColor('ORANGE')
        embed.addField("Help Command", "@whiskers help")
        embed.addField("Set Prefix", "@whiskers prefix [prefix]")
        embed.addField("Framework", "discord.js")
        embed.addField("Owner", "Uhtred#9007")
        msg.channel.send(embed).catch(console.error)
    }
    
    self.sysinfo = (msg, ctx, config, cb) => {
        
        si.cpu(function(data) {
            var embed = new Discord.RichEmbed()
            
            embed.setTitle('System Information')
            embed.setColor('BLUE')
            embed.addField('Manufucturer', data.manufacturer, true)
            embed.addField('Brand', data.brand, true)
            embed.addField('Speed', data.speed, true)
            embed.addField('Cores', data.cores, true)
            embed.addBlankField()
            
            si.currentLoad().then(data2 => {
                embed.addField('Load', data2.avgload, true)
                
                si.mem().then(data3 => {
                    embed.addField('Total Mem', `${util.bytesToSize(data3.total)}`, true)
                    embed.addField('Free Mem', `${util.bytesToSize(data3.free)}`, true)
                    embed.addField('Used Mem', `${util.bytesToSize(data3.used)}`, true)
                    embed.addField('Active Mem', `${util.bytesToSize(data3.active)}`, true)
                    embed.addField('Available', `${util.bytesToSize(data3.available)}`, true)
                    
                    msg.channel.send(embed).catch(console.error)
                })
            })
        })
    }
    
    self.ping = (msg, ctx, config, cb) => {
        
        if (!ctx.trim()) ctx = "http://discordapp.com"
        
        si.inetChecksite(ctx).then(data => {
            var embed = new Discord.RichEmbed()
            
            embed.setTitle(data.url)
            if (data.ok) embed.setURL(data.url)
            
            embed.addField("Status", data.status, true)
            embed.addField("Ping", data.ms, true)
            
            embed.setColor(data.ok ? 'GREEN' : 'RED')
            msg.channel.send(embed).catch(console.error)
        })
        
    }
    
    self.cache = (msg, ctx, config, cb) => {
        cb(null, API.mem())
    }
    
    self.feedback = (msg, ctx, config, cb) => {
        if (!ctx.trim()) return
        
        var whiskers_support = client.guilds.find(function(g) { return g.id == 518265245697835009 })
        if (!whiskers_support) return
            
        var ch = util.getChannel(whiskers_support.channels, 638610127137538048);
        if (!ch) return
        
        var embed = new Discord.RichEmbed()
        
        embed.setTimestamp()
        
        embed.setAuthor(msg.author.tag, msg.author.avatarURL)
        embed.setThumbnail(msg.author.avatarURL)
        
        embed.setDescription(ctx)
        embed.setFooter("ID: " + msg.author.id + "|" + msg.guild.id)
        
        ch.send(embed)
        
        msg.reply("<:green_check:520403429479153674> Feedback sent!")
    }
    
    self.patrons = (msg, ctx, config, cb) => {
        
        var whiskers_support = client.guilds.find(function(g) { return g.id == 518265245697835009 })
        
        if (!whiskers_support) return
            
        var roles = whiskers_support.roles
        var patreon = roles.find(m => m.name == "PATRON!")
        
        if (!patreon) return
        
        var patrons = patreon.members.array().map(p => "⭐ " + p.user.username + "#" + p.user.discriminator)
        
        var embed = new Discord.RichEmbed()
        embed.setTitle("❤️ PATRONS ❤️")
        embed.setDescription("\u200b \nWhiskers owes his existence to these fine people.\nThank you!\n \u200b \n`" + patrons.join("\n") + "`\n \u200b \n")
        embed.setTimestamp()
        embed.setFooter("THANK YOU")
        embed.setColor('YELLOW')
        embed.setThumbnail("https://images-ext-1.discordapp.net/external/V15BDAGEOEHT6kaNz86zibFLtL5vaSEUyFSblKTBXtw/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/528809041032511498/b2ca30fc7ba1b3a94c3427e99aac33ff.png")
        embed.setImage('https://media.discordapp.net/attachments/457776625975689229/639209153176403968/howiewhiskers.png')
        msg.channel.send(embed)
    }
    
    self.wall = self.swag = self.patrons
}

module.exports = Cosmetic