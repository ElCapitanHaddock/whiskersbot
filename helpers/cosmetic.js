

//const memeLib = require('nodejs-meme-generator');
//const memeGenerator = new memeLib();
var fs = require("fs")
const dogeify = require('dogeify-js');
var request = require('request');
var Discord = require('discord.js')
const scrapeIt = require('scrape-it')
//const puppeteer = require('puppeteer');
var countries = require('i18n-iso-countries')
const shindan = require('shindan')

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
    
    //image utils
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
    
    //info utils
    var InfoUtils = require('./apis/info.js')
    var info_utils = new InfoUtils(translate)
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
        "google"
    ]
    info_cmds.forEach(c => {
        self[c] = info_utils[c]
    })
    
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
    
    self.poke = (msg, ctx, config, cb) => {
        var params = ctx.split(" ")
        var a = isNaN(parseInt(params[0])) ? Math.floor(Math.random() * 152) + 1 : params[0];
        var b = isNaN(parseInt(params[1])) ? Math.floor(Math.random() * 152) + 1 : params[1];
        var url = "http://pokemon.alexonsager.net/"+a+"/"+b
        scrapeIt(url, {
          img:{
              selector:"#pk_img",
              attr:"src"
          },
          name:"#pk_name"
        })
        .then(({ data, response }) => {
        	var embed = new Discord.RichEmbed()
            embed.setTitle(data.name)
            embed.setURL(url)
            embed.setImage(data.img)
            embed.setFooter(a + "/" + b, "https://upload.wikimedia.org/wikipedia/en/3/39/Pokeball.PNG")
            
            msg.channel.send(embed).catch(console.error)
        })
        .catch(console.error)
    }
    
    self.fakeid = (msg, ctx, config, cb) => {
        request.get({
            url: "http://api.namefake.com/",
        	rejectUnauthorized: false
        }, function(err, response, body) {
            if (err) {
                console.error(err)
                cb("Something went wrong!")
                return
            }
            var d = JSON.parse(body)
            var embed = new Discord.RichEmbed()
            
            embed.setTitle(d.name)
            embed.addField('Birthdate', d.birth_data, true)
            embed.addField('Height', `${d.height} cm`, true)
            embed.addField('Weight', `${d.weight} kg`, true)
            embed.addField('Blood Type', d.blood, true)
            embed.addField('Eye Color', d.eye, true)
            embed.addField('Hair', d.hair + "\n\u200b\n", true)
            
            embed.addField('Address', d.address)
            embed.addField('Coords', `${d.latitude}° ${d.longitude}°`)
            embed.addField('Workplace', d.company + "\n\u200b\n")
            
            embed.addField('Credit Card', `${d.plasticcard} exp. ${d.cardexpir}`)
            embed.addField('Maiden Name', d.maiden_name)
            embed.addField('Favorite Sport', d.sport + "\n\u200b\n")
            
            embed.addField('Phone', d.phone_w)
            embed.addField('Email', `${d.email_u}@${d.email_d}`)
            //embed.addField('Username', d.username)
            //embed.addField('Password', d.password)
            embed.addField('IP Address', d.ipv4 + "\n\u200b\n")
            
            msg.channel.send(embed)
        })
    }
    
    self.paterico = (msg, ctx, config, cb) => {
        var paterico_guild = client.guilds.find(function(g) { return g.id == 509166690060337174 })
        if (paterico_guild) {
            var patericos = paterico_guild.emojis.array()
            var emote = patericos[Math.floor(Math.random()*patericos.length)]
            msg.channel.send(emote.toString()).catch(console.error)
        } else msg.reply("cut the powerlines")
    }

    self.doge = (msg, ctx, config, cb) => {
        cb(null,"<:doge:522630325990457344> " + dogeify(ctx.toLowerCase().replace(/@everyone/g,"").replace(/@here/g,"").replace(/@/g,"")))
    }
    
    self.nickname = (msg, ctx, config, cb) => {
        if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.avatarURL
            else ctx = msg.author.avatarURL
        }
        scrapeIt("http://www.robietherobot.com/insult-generator.htm", {
          nickname: "h1"
        })
        .then(({ data, response }) => {
        	if (!data || !data.nickname) cb("Sorry I'm doing my taxes rn")
        	else { 
        	    
        	    var title = data.nickname.split('\t').pop()
        	    
        	    var embed = new Discord.RichEmbed()
                embed.setThumbnail(ctx)
                embed.setTitle(title)
                msg.channel.send(embed).then().catch(function(error){console.error(error)})
        	}
        })
    }
    
    self.inspiro = (msg, ctx, config, cb) => {
        request.get({
            url: "http://inspirobot.me/api?generate=true&oy=vey"
        }, function(err, response, body) {
            if (err) {
                cb("InspiroBot down :(")
                return
            }
            msg.channel.send(body)
        })
    }
    
    self.cute = (msg, ctx, config, cb) => {
        
        var img
        if (ctx.trim().length == 0) {
            ctx = msg.author.username
            img = msg.author.displayAvatarURL
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            if (users.length > 0) {
                ctx = users[0].username
                img = users[0].displayAvatarURL
            }
        }
        
        shindan
          .diagnose(619296, ctx)
          .then(res => {
              var embed = new Discord.RichEmbed()
              embed.setTitle(ctx)
              embed.setDescription(res.result)
              if (img) embed.setThumbnail(img)
              msg.channel.send(embed)
          })
    }
    
    self.boss = (msg, ctx, config, cb) => {
        
        var img
        if (ctx.trim().length == 0) {
            ctx = msg.author.username
            img = msg.author.displayAvatarURL
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            if (users.length > 0) {
                ctx = users[0].username
                img = users[0].displayAvatarURL
            }
        }
        
        shindan
          .diagnose(671644, ctx)
          .then(res => {
              var embed = new Discord.RichEmbed()
              embed.setTitle(ctx)
              embed.setDescription(res.result)
              if (img) embed.setThumbnail(img)
              msg.channel.send(embed)
          })
    }
    
    
    //Practical Guide To Evil
    self.name = (msg, ctx, config, cb) => {
        
        var img
        if (ctx.trim().length == 0) {
            ctx = msg.author.username
            img = msg.author.displayAvatarURL
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            if (users.length > 0) {
                ctx = users[0].username
                img = users[0].displayAvatarURL
            }
        }
        
        shindan
          .diagnose(671644, ctx)
          .then(res => {
              
              var embed = new Discord.RichEmbed()
              embed.setTitle(res.result.slice(0,res.result.lastIndexOf(",")))
              
              res.result = res.result
                .replace(/boss/gi, 'villain')
                .replace(/fight/gi, 'duel')
                .replace(/Pokemon/gi, 'sidekick')
                .replace(/the dev team/gi, 'erraticerrata')
                .replace(/developed/gi, 'written')
                .replace(/programmed/gi, 'destined')
                .replace(/raid groups/gi, 'bands of 5')
                .replace(/boss fight/gi, 'final battle')
                .replace(/Bad Ending/gi, 'villainous ending')
                .replace(/cutscene/gi, 'interlude')
                .replace(/higher difficulties/gi, 'more complicated stories')
                .replace(/difficulty/gi, 'story')
                .replace(/learning curve/gi, 'sorcerous aptitude')
                .replace(/healer mains/gi, 'priests')
                .replace(/tank mains/gi, 'crusaders')
                .replace(/streamer/gi, 'reader')
                .replace(/bonus dungeon/gi, 'Tower of Praes')
                .replace(/dungeon/gi, 'Tower')
                .replace(/Story Mode/gi, 'the main story')
                .replace(/HP Bars/gi, 'ressurrections')
                .replace(/beta/gi, 'prequel')
                .replace(/tutorial/gi, 'prequel')
                .replace(/strategy guide/gi, 'Story')
                .replace(/Ultimate attack/gi, 'best aspect')
                .replace(/Easy mode/gi, ' rule of 3 Stories')
                .replace(/game/gi, 'Story')
                .replace(/crashes/gi, 'resets')
                .replace(/EA/g, 'erraticerrata')
                .replace(/players/gi, "characters")
                .replace(/player/gi,'protagonist')
                .replace(/playable character/gi, 'protagonist')
              
              var elements = res.split("\n")
              var desc = elements[0] + "\n\n" 
              
              desc += "Aspect: " + elements[2].slice(9) + "\n"
              desc += "Domain: " + elements[1].slice(10) + "\n"
              embed.setDescription(desc)
              
              embed.setFooter(`*${elements[3].slice(7)}*`)
              
              if (img) embed.setThumbnail(img)
              msg.channel.send(embed)
          })
    }
    
    self.vibe = (msg, ctx, config, cb) => {
        
        var img
        if (ctx.trim().length == 0) {
            ctx = msg.author.username
            img = msg.author.displayAvatarURL
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            if (users.length > 0) {
                ctx = users[0].username
                img = users[0].displayAvatarURL
            }
        }
        
        shindan
          .diagnose(937709, ctx)
          .then(res => {
              var embed = new Discord.RichEmbed()
              embed.setTitle(ctx)
              
              var check = res.result.split("\n")[1]
              
              if (check.includes('passed')) embed.setColor('GREEN')
              else if (check.includes('failed')) embed.setColor('RED')
              
              embed.setDescription(check)
              if (img) embed.setThumbnail(img)
              msg.channel.send(embed)
          })
    }
    
    self.wutang = (msg, ctx, config, cb) => {
        if (ctx.trim().length == 0) {
            ctx = msg.author.username
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            if (users.length > 0) ctx = users[0].username
        }
        ctx = ctx.replace(/@/g, "").replace(/`/g,"")
        
        request.post({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            url:'https://www.mess.be/inickgenwuname.php',
            body:"realname="+ctx
        }, 
            function (err, res, body) {
                if (err) {
                    cb("sorry I'm doing my taxes rn")
                    return
                }
                console.log(body)
                var start = body.indexOf("you will also be known as </center><center><b><font size=2>") + 59
                var end = body.indexOf("</b></font></center><center><br />")
                var wuName = body.slice(start, end).replace('\n', '').replace(/\s+/g,' ').trim()
                
                msg.channel.send("From this day forward, `" + ctx + "` will also be known as **" + wuName + "**").catch(console.error)
            }
        )
    }
    
    self.curse = (msg, ctx, config, cb) => {
        scrapeIt("https://autoinsult.com/index.php?style=0", {
         insult: "#insult"
        })
        
        .then(({ data, response }) => {
        	if (!data || !data.insult) {
                cb("sorry I'm doing my taxes rn")
        	    return
        	}
        	msg.channel.send(data.insult).catch(console.error)
        })
    }
    
    self.whatdo = (msg, ctx, config, cb) => {
        request.get("https://api.chucknorris.io/jokes/search?query=sex", function(err, req, res) {
            if (err) {
                cb("<:incel:560243171225894912> Incel error")
                return
            }
            
            var data
            try {
                data = JSON.parse(res)
            }
            catch(e) {
                cb("<:incel:560243171225894912> Incel error")
                return
            }
            
            var arr = data.result
            if (!arr) return
            var joke = arr[Math.floor(Math.random()*arr.length)].value
            msg.channel.send("<:incel:560243171225894912> " + joke.replace(/Chuck Norris/g,"Incel Fox")).catch(console.error)
        })
    }
    
    self.talkabout = (msg, ctx, config, cb) => {
        if (ctx.trim().length == 0) {
            ctx = null
        }
        var tar = `https://www.reddit.com/r/copypasta/search.json?q=title:${ctx}&sort=new&restrict_sr=on`
        if (ctx === null) tar = `https://www.reddit.com/r/copypasta/new.json`
        
        request.get({
            url:tar
        }, 
            function (err, res, body) {
                if (err) {
                    cb("sorry I'm doing my taxes rn")
                    return
                }
                var data 
                try {
                    data = JSON.parse(body)
                }
                catch(error) { 
                    cb("Looks like teenagers don't care about that.")
                    return
                }
                var children = data.data.children
                if ( children.length==0 ) {
                    cb("I refuse to talk about that.")
                    return;
                }
                var select = children[Math.floor(Math.random()*children.length)]
                msg.reply(select.data.selftext.replace(/@/g, "").slice(0,1000))
            }
        )
    }
    
    self.teenagers = (msg, ctx, config, cb) => {
        if (ctx.trim().length == 0) {
            ctx = null
        }
        var tar = `https://www.reddit.com/r/teenagers/search.json?q=title:${ctx}&sort=new&restrict_sr=on`
        if (ctx === null) tar = `https://www.reddit.com/r/teenagers/new.json`
        
        request.get({
            url:tar
        }, 
            function (err, res, body) {
                if (err) {
                    cb("Sorry I'm doing my taxes rn")
                    return
                }
                
                var data 
                try {
                    data = JSON.parse(body)
                }
                catch(error) { 
                    cb("Looks like teenagers don't care about that.")
                    return
                }
                var children = data.data.children
                if ( children.length==0 ) {
                    cb("Looks like teenagers don't care about that.")
                    return;
                }
                
                var select = children[Math.floor(Math.random()*children.length)]
                
                var reply = "" + select.data.title
                if (select.data.selftext) reply += "\n" + select.data.selftext
                if (util.isImageURL(select.data.url) || select.data.url.includes('youtu.be')) reply += "\n" + select.data.url
                
                msg.reply(reply.replace(/@/g, "").slice(0,1000))
            }
        )
    }
    
    self.ouija = (msg, ctx, config, cb) => { //pasta
        if (ctx == null || ctx.trim().length == 0) return
        
        var tar = `https://www.reddit.com/r/askouija/search.json?q=title:${ctx}&sort=top&restrict_sr=on`
        
        request.get({
            url:tar
        }, 
            function (err, res, body) {
                if (err) {
                    cb("sorry I'm doing my taxes rn")
                    return
                }
                var data = JSON.parse(body)
                var children = data.data.children
                if ( children.length==0 ) {
                    msg.channel.send("Ouija says: ?")
                    return;
                }
                var select = children[0]//Math.floor(Math.random()*children.length)]
                var text = select.data.link_flair_text
                
                if ( text == "unanswered" || text === null) {
                    msg.channel.send("Ouija says: IDK")
                    return;
                }
                msg.channel.send(text.replace(/@/g, ""))
            }
        )
    }
    
    
    
    self.scan = (msg, ctx, config, cb) => {
        msg.reply("Sorry, this command is temporarily disabled while whiskers finds a new service to scan websites.")
        
    }
    
    self.geo = (msg, ctx, config, cb) => {
        msg.reply("Sorry, this command has been deprecated. Go to https://trends.google.com/trends/ instead.")
    }
    
    self.analyze = (msg, ctx, config, cb) => {
        var metrics = ["TOXICITY",
        "SEVERE_TOXICITY",	
        "IDENTITY_ATTACK",
        "INSULT",
        "PROFANITY",
        "SEXUALLY_EXPLICIT",
        "THREAT",
        "FLIRTATION",
        "ATTACK_ON_AUTHOR",
        "ATTACK_ON_COMMENTER",
        "INCOHERENT",
        "INFLAMMATORY",
        "LIKELY_TO_REJECT",
        "OBSCENE",
        "SPAM",
        "UNSUBSTANTIAL"]
        var params = ctx.trim().split(" ")
        if (params[0] && metrics.indexOf(params[0].toUpperCase()) !== -1 && params[1]) {
            params = [params[0].toUpperCase(), params.slice(1).join(" ")];
            var met = params[0];
            var text = params[1];
            (async function() {
                try {
                    const result = await perspective.analyze(text, {attributes: [met]});
                    var score = Math.round(result.attributeScores[met].summaryScore.value * 100)
                    const embed = new Discord.RichEmbed()
                    var emote = "🗿"
                        embed.setColor("PURPLE")
                    if (score < 10) { emote = "😂"
                        embed.setColor("GREEN")
                    }
                    else if (score < 30) { emote = "😤"
                        embed.setColor("#ffd000")
                    }
                    else if (score < 70) { emote = "😡"
                        embed.setColor("ORANGE")
                    }
                    else if (score < 99) { emote = "👺"
                        embed.setColor("RED")
                    }
                    embed.setDescription(emote + " " + text)
                    embed.setTitle(met + " || " + score + "%")
                    cb(null, embed);
                }
                catch(error) { cb("Sorry " + msg.author.toString() + ", I couldn't understand that message") }
            })()
        }
        else cb(msg.author.toString() + ", please pick a metric: ```" + metrics + "```")
    }
    
    self.gif = (msg, ctx, config, cb) => {
        if (!ctx) {
            cb("Please include a gif to search for!")
            return
        }
        request.get(
        {
            url: "https://api.tenor.com/v1/search?q="+ctx+"&key="+process.env.TENOR_KEY+"&pos=0&limit=1"
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
            embed.setTitle("🔹️ "+ctx)
            embed.setImage(gifs[0].media[0].gif.url)
            embed.setFooter("1")
            embed.setURL(gifs[0].url)
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
            
            msg.channel.send(embed).then(function(emb) {
                emb.react("⏹").then(function() {
                    emb.react("⬅").then(function() {
                        emb.react("➡").then(function() {
                        })
                    })
                })
            })
            
        })
    }
    
    self.yomama = (msg, ctx, config, cb) => {
        request.get(
        {
            url: "https://jokes.guyliangilsing.me/retrieveJokes.php?type=yomama"
        },
        function (err, res, body) {
            if (err) {
                cb("Brody Foxx is not available at this moment!")
                return
            }
            var data = JSON.parse(body)
            if (!data.joke) {
                cb("Brody Foxx is not available at this moment!")
                return
            }
            cb(null, data.joke)
        })
    }
    
    /*minor utilites*/
    self.check_guild = (msg, ctx, config, cb) => {
        if (!ctx || !ctx.trim()) return
        var found = client.guilds.find(function(g) { return g.id == ctx })
        var embed = new Discord.RichEmbed()
        if (found) {
            embed.setTitle(found.name + " **found!**")
            embed.setColor('GREEN')
            embed.setThumbnail(found.iconURL)
            embed.setFooter(ctx)
            msg.channel.send(embed)
        }
        else {
            embed.setTitle('**Not found!**')
            embed.setColor('RED')
            embed.setThumbnail('https://cdn.discordapp.com/emojis/520403429835800576.png?v=1')
            embed.setFooter(ctx.slice(0,100))
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
        g.members.tap( (user) => numOnline += user.presence.status !== 'offline' ? 1 : 0 );
        
        embed.addField("Roles", g.roles.size, true)
        embed.addField("Channels", g.channels.size, true)
        
        embed.addField("Emojis", g.emojis.size, true)
        
        embed.addField("Members", g.members.size, true)
        embed.addField("Currently Online", numOnline, true)
        
        embed.addField("Created", g.createdAt.toLocaleDateString("en-US", options), true)
    
        embed.setThumbnail(msg.guild.iconURL)
        embed.setFooter("🆔 "+msg.guild.id)
        
        msg.channel.send(embed)
    }
    
    self.userinfo = (msg, ctx, config, cb) => {
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
            embed.setDescription(m.toString())
            embed.setAuthor(m.user.tag, m.user.avatarURL)
            embed.setThumbnail(m.user.avatarURL)
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