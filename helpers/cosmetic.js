

//const memeLib = require('nodejs-meme-generator');
//const memeGenerator = new memeLib();
var fs = require("fs")
const dogeify = require('dogeify-js');
var request = require('request');
var Discord = require('discord.js')
const scrapeIt = require('scrape-it')
//const puppeteer = require('puppeteer');
var countries = require('i18n-iso-countries')

var util = require('../util')
const si = require('systeminformation')


var Cosmetic = function(API, perspective, translate, client, cloudinary) {
    /*C O S M E T I C
    usable by anyone*/
    var self = this
    
    const About = require("./about.js")
    const kiosk = new About(client)
    
    self.about = (msg, ctx, config, cb) => {
        if (kiosk[ctx]) {
            kiosk[ctx](msg, config, cb)
        }
        else cb(msg.author.toString() + " Please include a topic parameter! Use *@whiskers help* to get topics to choose from.")
    }
    
    //image utils
    var ImageUtils = require('./apis/image.js')
    var img_utils = new ImageUtils(client, cloudinary)
    var img_cmds = [
        "classify",
        "describe",
        "identify",
        "landmark",
        "locate",
        "similar",
        "mirror",
        "read",
        "funny",
        "soy",
        "nsfw_test",
        "mood",
        "img",
        "inspire"
    ]
    img_cmds.forEach(c => {
        self[c] = img_utils[c]
    })
    
    //knowledge utils
    var InfoUtils = require('./apis/knowledge.js')
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
    
    self.paterico = (msg, ctx, config, cb) => {
        var paterico_guild = client.guilds.find(function(g) { return g.id == 509166690060337174 })
        if (paterico_guild) {
            var patericos = paterico_guild.emojis.array()
            var emote = patericos[Math.floor(Math.random()*patericos.length)];
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
        });
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
                var data = JSON.parse(body)
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
    
    self.meme = (msg, ctx, config, cb) => {
        if (!ctx.trim()) return
        
        var params = ctx.trim().split(" ")
        
        if (!params[0] || !isImageURL(params[0])) {
            cb("Please use a valid image URL!")
            return
        }
        
        if (msg.attachments.size > 0 && isImageURL(params[1])) { //prefer given URL over attached URL
            params.shift()
        }
        
        params = [params[0], params.slice(1).join(" ")]
        
        if (params.length < 2) {
            cb("Please include both an image and caption!\m`@whiskers [image URL] [caption]`")
            return
        }
        
        var img_url = params[0]
        var top_text = params[1]
        var bottom_text = "_"
        
        if (top_text.includes('|')) {
    		var split = top_text.split('|')
    		top_text = split[0]
    		bottom_text = split[1]
        }
        if (!top_text.trim()) top_text = "_"
        if (!bottom_text.trim()) bottom_text = "_"
        
        var rand_id = Math.random().toString(36).substring(4)
        var meme_url = `https://memegen.link/custom/${encodeURI(top_text)}/${encodeURI(bottom_text)}.jpg?alt=${encodeURIComponent(img_url)}&font=impact`
        
        download(meme_url, './'+rand_id+'.png', function() { //download image locally
            
            msg.channel.send({files: ['./'+rand_id+'.png']}).then(function() { //upload local image to discord
                fs.unlinkSync('./'+rand_id+'.png'); //delete local image
            })
        });
        
        var embed = new Discord.RichEmbed()
        
        embed.setTitle("Link")
        embed.setURL(meme_url)
        embed.setImage(meme_url)
        
        msg.channel.send(embed)
    }
    
    
    //old meme command
    
    /*self.meme = (msg, ctx, config, cb) => {
        msg.reply("Sorry, the meme command is temporarily disabled while whiskers looks for a new meme generator.")
        /*
        if (msg.attachments.size > 0) {
            ctx = msg.attachments.array()[0].url+" "+ctx
        }
        var params = ctx.trim().split(" ")
        if (params[1] && params[1].endsWith('svg')) params[1] = null
        if (params[0] && params[1] && params[0].trim() && params[1].trim()) {
            params = [params[0], params.slice(1).join(" ")]
            var opts = {topText:"",bottomText:"",url:params[0]}
            
            if (params[1].includes("|")) {
                var spl = params[1].split("|")
                opts.topText = spl[0]
                opts.bottomText = spl[1]
            }
            else {
                opts.topText = params[1].slice(0, params[1].length/2 || 1)
                opts.bottomText = (params[1].length/2 > 1) ? params[1].slice(params[1].length/2) : ""
            }
            opts.fontOptions = {
                fontFamily: 'impact',
                lineHeight: 2
              }
            try {
                memeGenerator.generateMeme(opts)
                .then(function(data) {
                    var random = Math.random().toString(36).substring(4);
                    fs.writeFile(random+".png", data, 'base64', function(err) {
                        if (err) console.error(err)
                        else {
                            msg.channel.send({
                              files: [{
                                attachment: './'+random+'.png',
                                name: random+'.jpg'
                              }]
                            }).then(function() {
                                fs.unlink('./'+random+'.png', (err) => {
                                  if (err) throw err;
                                  console.log('Cached meme was deleted');
                                });
                            })
                        }
                    });
                }).catch(function(error) { cb("Please include a valid image-url!") })
            }
            catch(error) { cb("Something went wrong!") }
        } else cb("Please include both the caption and image-url!")
        
    }*/
    
    self.scan = (msg, ctx, config, cb) => {
        msg.reply("Sorry, this command is temporarily disabled while whiskers finds a new service to scan websites.")
        /*
        var random = Math.random().toString(36).substring(4);
        (async () => {
            const browser = await puppeteer.launch({'args' : [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]});
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 })
            await page.goto(ctx).catch(err => {
                if (err) cb("404: URL not found!")
            })
            await page.screenshot({path: `${random}.png`, fullPage: true}).catch(console.error);
            const title = await page.title()
            const url = await page.url()
            await browser.close();
            
            const embed = await new Discord.RichEmbed()
            await embed.setTitle(title)
            await embed.setURL(url)
            await embed.setImage('attachment://screenshot.png')
            
            await msg.channel.send({embed,
                  files: [{
                    attachment: './'+random+'.png',
                    name: 'screenshot.png'
                  }]
                }).then(function() {
                    fs.unlink(`./${random}.png`, (err) => {
                        if (err) console.error(err)
                        //else console.log('Cached scan screenshot was deleted');
                    })
                }).catch(console.error)
        })();
        */
    }
    
    self.geo = (msg, ctx, config, cb) => {
        msg.reply("Sorry, this command has been deprecated. Go to https://trends.google.com/trends/ instead.")
        /*
        if (!ctx || !ctx.trim()) return
        var params = ctx.trim().split(" ")
        var geo
        var query
        if (params[0] != "world" && !countries.isValid(params[0])) {
            cb("Invalid country code! Use 'world' for all countries.\nhttps://datahub.io/core/country-list/r/0.html")
            return;
        }
        else {
            geo = params[0]
            query = params.slice(1).join(" ")
        }
        if (!query) {
            cb("No query provided!")
            return
        }
    
        var loc
        if (geo.toLowerCase() == "world") loc = ""
        else loc = "&geo="+geo.toUpperCase()
        query = encodeURIComponent(query.trim());
        
        var random = Math.random().toString(36).substring(4);
        (async () => {
            const browser = await puppeteer.launch({'args' : [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
            ]}).catch(console.error);
            const page = await browser.newPage();
            
            await page.goto(`http://trends.google.com/trends/explore?date=all&q=${query}${loc}`, {
                waitUntil: 'networkidle2',
                
            }).catch(console.error);
            
            await page.setViewport({ width: 1200, height: 1000 })
                
            async function screenshotDOMElement(opts = {}) {
                const padding = 'padding' in opts ? opts.padding : 0;
                const path = 'path' in opts ? opts.path : null;
                const selector = opts.selector;
        
                if (!selector)
                    throw Error('Please provide a selector.');
                    
                const rect = await page.evaluate(selector => {
                    const element = document.querySelector(selector);
                    if (!element)
                        return null;
                    const {x, y, width, height} = element.getBoundingClientRect();
                    return {left: x, top: y, width, height, id: element.id};
                }, selector);
        
                if (!rect)
                    throw Error(`Could not find element that matches selector: ${selector}.`);
        
                return await page.screenshot({
                    path,
                    clip: {
                        x: rect.left - padding,
                        y: rect.top - padding,
                        width: rect.width + padding * 2,
                        height: rect.height + padding * 2
                    }
                });
            }
            
            await page.evaluate(() => {
                var headers = document.querySelectorAll(".fe-atoms-generic-title")//.fe-atoms-generic-header-container")
                for (var i = 0; i < headers.length; i++) {
                    headers[i].parentNode.removeChild(headers[i])
                }
                var icons = document.querySelectorAll(".widget-actions-item-flatten")
                for (var i = 0; i < icons.length; i++) {
                    icons[i].parentNode.removeChild(icons[i])
                }
                
                var vol = document.querySelectorAll(".fe-low-search-volume")
                for (var i = 0; i < vol.length; i++) {
                    vol[i].parentNode.removeChild(vol[i])
                }
             }).catch(console.error);
             
            await screenshotDOMElement({
                path: `${random}.png`,
                selector: '.fe-geo-chart-generated.fe-atoms-generic-container',//'.widget-container-wrapper',
                padding:0
            }).catch(console.error)
            
            await browser.close();
            const embed = await new Discord.RichEmbed()
            if (geo.toLowerCase() == "world") {
                await embed.setTitle(`World - "${query}"`)
            }
            else {
                await embed.setTitle(`${countries.getName(geo.toUpperCase(), "en")} - "${query.replace(/%20/g," ")}"`)
            }
            await embed.setImage('attachment://screenshot.png')
            
            await msg.channel.send({embed,
                  files: [{
                    attachment: './'+random+'.png',
                    name: 'screenshot.png'
                  }]
                }).then(function() {
                    fs.unlink(`./${random}.png`, (err) => {
                        if (err) console.error(err)
                        //else console.log('Cached scan screenshot was deleted');
                    })
                }).catch(console.error)
        })();
        */
    }
    /*
    self.img = (msg, ctx, config, cb) => {
        
        if (!ctx || !ctx.trim()) return
        
        var query = ctx.replace(/\s/g,"%20")
        var random = Math.random().toString(36).substring(4);
        
        (async () => {
            const browser = await puppeteer.launch({'args' : [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
            ]}).catch(console.error);
            const page = await browser.newPage();
            
            await page.goto(`https://www.google.com/search?tbm=isch&q=${query}`, {
                waitUntil: 'networkidle2',
                
            }).catch(console.error);
            
            await page.setViewport({ width: 1200, height: 1000 })
            await page.screenshot({path: `${random}.png`}).catch(console.error);
            
            await browser.close();
            const embed = await new Discord.RichEmbed()
            
            await embed.setTitle(ctx)
            await embed.setImage('attachment://screenshot.png')
            
            await msg.channel.send({embed,
                  files: [{
                    attachment: './'+random+'.png',
                    name: 'screenshot.png'
                  }]
                }).then(function() {
                    fs.unlink(`./${random}.png`, (err) => {
                        if (err) console.error(err)
                        //else console.log('Cached scan screenshot was deleted');
                    })
                }).catch(console.error)
        })();
    }
    */
    
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
        var found = client.guilds.find(function(g) { return g.id == ctx })
        if (found) msg.reply("Found!")
        else msg.reply("Not found!")
    }
    
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
        var m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.startsWith(ctx))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || (m.nickname && m.nickname.toLowerCase().startsWith(m.nickname.toLowerCase())) )
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
            embed.addField("Roles", role_list ? role_list : "None")
            embed.setFooter("ID: " + m.id)
            msg.channel.send(embed)
        }
        else cb("Couldn't find that user!")
    }
    
    self.avatar = (msg, ctx, config, cb) => {
        if (!ctx || !ctx.trim()) ctx = msg.member.toString()
        var members = msg.guild.members
        var m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.startsWith(ctx))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || m.user.tag.toLowerCase().startsWith(ctx.toLowerCase()))
        if (!m) m = members.find(m => m.toString() === ctx || m.id === ctx || (m.nickname && m.nickname.toLowerCase().startsWith(m.nickname.toLowerCase())) )
        if (m) {
            var embed = new Discord.RichEmbed()
            embed.setAuthor(m.user.tag, m.user.avatarURL)
            embed.setImage(m.user.avatarURL)
            embed.setTitle("Link")
            embed.setURL(m.user.avatarURL)
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
                    embed.addField('Total Mem', `${bytesToSize(data3.total)}`, true)
                    embed.addField('Free Mem', `${bytesToSize(data3.free)}`, true)
                    embed.addField('Used Mem', `${bytesToSize(data3.used)}`, true)
                    embed.addField('Active Mem', `${bytesToSize(data3.active)}`, true)
                    embed.addField('Available', `${bytesToSize(data3.available)}`, true)
                    
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

var download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  })
}

function isImageURL(url){
    return ( url.includes(".jpg") || url.includes(".gif") || url.includes(".jpeg") || url.includes(".gif") || url.includes(".png") )
}

function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

module.exports = Cosmetic