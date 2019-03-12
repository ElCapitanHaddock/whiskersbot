
var Discord = require('discord.js')
var request = require('request')
const googleTrends = require('google-trends-api');
const scrapeIt = require("scrape-it")
const nodeyourmeme = require('nodeyourmeme');

var Knowledge = function(translate) {
    var self = this
    self.translate_fancy = (msg, ctx, config, cb) => { //todo: add link to Yandex here
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("Yandex Error: " + err)
              else if (res.text) {
                  var embed = new Discord.RichEmbed()
                  embed.setTitle(params[0].toLowerCase()+ " || " + params[1].substring(0,100))
                  embed.setDescription(res.text)
                  msg.channel.send(embed).then().catch(function(error){console.error(error)})
              }
              else cb(msg.author.toString() + " language not recognized.\nHere's the full list: https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages")
            });
        }
        else cb(msg.author.toString() + ", please specify a target language and message.")
    }
    
    self.translate = (msg, ctx, config, cb) => {
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("Yandex Error: " + err)
              else if (res.text) {
                  msg.reply("`"+res.text+"`").then().catch(function(error){console.error(error)})
              }
              else cb(msg.author.toString() + " language not recognized.\nHere's the full list: https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages")
            });
        }
        else cb(msg.author.toString() + ", please specify a target language and message.")
    }
    
    self.number = (msg, ctx, config, cb) => {
        if (ctx) {
            request.get({
                url: "http://numbersapi.com/"+ctx+"/trivia?notfound=floor&fragment"
            }, function(err, res, body) {
                if (err || isNaN(ctx) || (body && body.startsWith("<"))) {
                    msg.reply("Imagine not knowing what a number is.") 
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setTitle(ctx)
                embed.setDescription(body)
                msg.channel.send(embed)
            })
        } else msg.reply("you ok there buddy?")
    }
    
    //for scp
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    self.scp = (msg, ctx, config, cb, count) => {
        if (!count) count = 0
        if (!ctx || ctx.toLowerCase() === "random") {
            ctx = getRandomInt(0, 4999)
            if (ctx < 10) ctx = "00"+ctx
            else if (ctx < 100) ctx = "0"+ctx
        }
        var short = "scp-"+ctx
     
        // Promise interface
        scrapeIt("http://www.scp-wiki.net/"+short, {
          text: "p",
          image: {
            selector: ".scp-image-block .image",
            closest: "img",
            attr: "src"
          }
        }).then(({ data, response }) => {
            if ( response.statusCode !== 200) {
                if (count <= 10) self.scp(msg, "random", config, cb, count+1)
                return
            }
            console.log(`Status Code: ${response.statusCode}`)
            var text = data.text
            
            var title = text.slice(text.indexOf("Item #:"),text.indexOf("Object Class:"))
            var classname = text.slice(text.indexOf("Object Class:")+14, text.indexOf("Special Containment Procedures:"))
            var description = text.slice(text.indexOf("Description:")+12, text.indexOf("Reference:"))
            description = description.slice(0,500)
            
            var embed = new Discord.RichEmbed()
            embed.setTitle(title)
            embed.setThumbnail(data.image)
            embed.addField("Class",classname)
            embed.setURL("http://www.scp-wiki.net/"+short)
            if (description.endsWith(".")) {
                embed.addField("Description",description)
            }
            else embed.addField("Description",description+"...")
            msg.channel.send(embed).catch(console.error)
        })
    }
    
    self.wikipedia = (msg, ctx, config, cb, count) => {
        if (!ctx) {
            cb("Please include a search parameter!")
            return
        }
        var short = ctx.replace(" ","_")
        request.get(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${short}&profile=fast-fuzzy&limit=2&namespace=*&format=json`
        ,function(req, res) {
        	var contents = JSON.parse(res.body)
        	if (contents[1].length == 0 || contents[2].length == 0) {
        	    cb("I don't know what that is!")
        		return
        	}
        	console.log(contents)
        	var index = 0
        	if (contents[2][0].includes("refer to:") || contents[2][0].includes("refers to:") || !contents[2][0]) {
        		index = 1
        	}
        	var title = contents[1][index],
        	insert = contents[2][index],
        	url = contents[3][index]
        	
        	var embed = new Discord.RichEmbed()
        	embed.setTitle(title)
        	embed.setDescription(insert)
        	embed.setURL(url)
        	embed.setThumbnail("https://media.discordapp.net/attachments/528927344690200576/532825980243542027/icon_64x64.png")
        	
            msg.channel.send(embed).catch(console.error)
        })
    }
    
    self.kym = (msg, ctx, config, cb, count) => {
        if (!ctx || !ctx.trim()) return
        if (ctx.trim().toLowerCase() === "random") {
            nodeyourmeme.random().then(res=> {
                var embed = new Discord.RichEmbed()
                embed.setTitle(res.name)
                embed.setDescription(res.about)
                msg.channel.send(embed).catch(console.error)
            }).catch(console.error);
            return
        }
        nodeyourmeme.search(ctx).then(res=> {
            var embed = new Discord.RichEmbed()
            embed.setTitle(res.name)
            embed.setDescription(res.about)
            embed.setThumbnail("https://media.discordapp.net/attachments/528927344690200576/532827318809526282/unknown.png")
            msg.channel.send(embed).catch(console.error)
        }).catch(()=> {
            cb("im normie?")
        })
    }
    
    self.yahoo = (msg, ctx, config, cb, count) => {
        
        if (!ctx || !ctx.trim()) return
        var short = ctx.replace(" ", "%20")
        scrapeIt("https://answers.search.yahoo.com/search?p="+short, {
          link: {
          	selector: "a.lh-17.fz-m",
          	attr: "href"
          }
        })
        .then(({ data, response }) => {
        	if (!data || !data.link) return
        	var link = data.link
        	return scrapeIt(data.link, {
        			question: "h1.Fz-24.Fw-300.Mb-10",
        	    	answer: "span.ya-q-full-text",
        	    	author: {
        	    		selector:"a.uname",
        	    		eq:0
        	    	}
        	    }).then(({ data, response }) => {
        	    	if (!data || !data.question || !data.answer) return
        	    	data.link = link
        	    	return data
        	 })
        })
        .then(res => {
        	if (!res) {
        		cb("I couldn't find any matching Q&As")
        		return
        	}
        	var embed = new Discord.RichEmbed()
        	embed.setTitle(res.question.slice(0, 500))
        	var ans = res.answer.slice(0,500).trim()
        	if (ans.length < res.answer.length && !ans.endsWith(".")) {
        	    ans += "..."
        	}
        	embed.setDescription(ans)
        	embed.setFooter("by "+res.author)
        	embed.setURL(res.link)
        	embed.setThumbnail("https://media.discordapp.net/attachments/528927344690200576/532826720185745438/imgingest-270840072173041436.png")
        	msg.channel.send(embed).catch(console.error)
        })
    }
    
    self.query = (msg, ctx, config, cb, count) => {
    
        if (!ctx || !ctx.trim()) return
        var query = ctx
        
        googleTrends.relatedQueries({keyword: query})
        .then(function(res) {
            if (res.startsWith("<!DOCTYPE")) return
        	res = JSON.parse(res)
        	var topics = res.default.rankedList[0].rankedKeyword
        	
        	topics = topics.map(e => e.query).slice(0,5)
        	topics = topics.filter((item,index,self) => item !== query.toLowerCase() && self.indexOf(item)==index);
        	
        	var embed = new Discord.RichEmbed()
        	embed.setTitle(query)
        	embed.setThumbnail("https://media.discordapp.net/attachments/528927344690200576/532826301141221376/imgingest-3373723052395279554.png")
        	return embed.setDescription(topics.join(", "))
        }).then(embed => {
        	return googleTrends.interestOverTime({keyword: query})
        	.then(function(res) {
        		res = JSON.parse(res)
        		var times = res.default.timelineData
        		var peak = times.find(t => t.value[0] == 100)
        		
        		return embed.addField("Peak", peak ? peak.formattedAxisTime : "n/a")
        	})
        }).then(function(embed) {
        	return googleTrends.interestByRegion({keyword: query})
        	.then(function(res) {
        		res = JSON.parse(res)
        		var regions = res.default.geoMapData
        		
        		regions = regions.sort(function(a, b) {
        			return b.value[0]- a.value[0]
        		}).slice(0,5)
        		regions = regions.map(e => (e.value[0] == 0) ? "" : `**${e.value[0]}%** ${e.geoName}` ).slice(0,5)
        		
        		return embed.addField("Interest", regions.join("\n").trim() || "n/a")
        	})
        }).then(embed => {
        	msg.channel.send(embed).catch(console.error)
        })
        .catch(function(err){
          console.error(err);
        });
    }
    
    self.lookup = (msg, ctx, config, cb, count) => {
        if (!ctx || !ctx.trim()) return
        
        var short = ctx.replace(" ", "+")

        var key =  process.env.FIREBASE_KEY2
        var loc = `https://kgsearch.googleapis.com/v1/entities:search?query=${short}&key=${key}&limit=1&indent=True&prefix=True`
        request.get({ url: loc },
        function(req, res, body) {
            body = JSON.parse(body)
            if (body.error || !body.itemListElement || !body.itemListElement[0]) {
                cb("No results found!")
                return
            }
            
            var data = body.itemListElement[0].result
            var embed = new Discord.RichEmbed()
            
            embed.setTitle(data.name)
            
            var descript
            
            if (data.detailedDescription) {
                descript = data.detailedDescription.articleBody
                if (data.detailedDescription.url) {
                    //[title](url)
                    descript += `\n[Article](${data.detailedDescription.url})`
                }
            }
            else descript = data.description
            
            if (data.url) embed.setURL(data.url)
            
            embed.setDescription(descript)
            
            if (data.image) embed.setThumbnail(data.image.contentUrl)
            embed.setFooter(data["@type"].join(", "))
            
            msg.channel.send(embed).catch(console.error)
        })
    }
}

module.exports = Knowledge