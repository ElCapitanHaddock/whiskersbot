
var Discord = require('discord.js')
var request = require('request')
const googleTrends = require('google-trends-api');
const scrapeIt = require("scrape-it")
const nodeyourmeme = require('nodeyourmeme');
const sanitize = require('sanitize-html');

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
            if (res.startsWith("<!DOCTYPE")) return embed
        	res = JSON.parse(res)
        	var topics = res.default.rankedList[0].rankedKeyword
        	
        	topics = topics.map(e => e.query).slice(0,5)
        	topics = topics.filter((item,index,self) => item !== query.toLowerCase() && self.indexOf(item)==index);
        	
        	var embed = new Discord.RichEmbed()
        	embed.setTitle(query)
        	embed.setThumbnail("https://media.discordapp.net/attachments/528927344690200576/532826301141221376/imgingest-3373723052395279554.png")
        	return embed.setDescription(topics.join(", "))
        }).then(embed => {
        	
        	
        	return googleTrends.interestOverTime({keyword: query}).then(function(res) {
        	    if (res.startsWith("<!DOCTYPE")) return embed
        	    
    	        var base = "https://image-charts.com/chart?chs=900x500&chf=bg,s,36393f&chma=10,30,30,20&cht=lc&chco=FFFFFF&chxt=x,y&chm=B,4286f4,0,0,0&chxs=0,FFFFFF,15|1,FFFFFF" //0,FF00FF,13|1,FF0000
                
        		res = JSON.parse(res)
            	
            	if (res) {
            		
            		var times = res.default.timelineData
            		
            		if (times && times.length != 0) {
            		
                		var peak = times.reduce(function(prev, current) {
                            return (prev.value[0] > current.value[0]) ? prev : current
                        })
                		
                		var chg = "&chg="+times.length/12+",10"
                		var chd = "&chd=t:"
                		var chxl = "&chxl=0:|"
                		var chtt = "&chts=FFFFFF,26,r&chtt="+query
                		
                		var trigger = false
                		var base_month = times[0].formattedTime.split(" ")[0]
                		
                		for (var i = 0; i < times.length-1; i++) {
                            
                		    var date = times[i].formattedTime
                		    var val = times[i].value[0]
                		    
                		    if (val !== 0 || trigger) {
                		        
                		        if (!trigger) trigger = true
                		        chd += val + ","
                		        if (date.startsWith(base_month)) {
                		            chxl += date.split(" ")[1] + "|"
                		        }
                		    }
                		}
                		chd += times[times.length-1].value[0]
                		var url = base + chg + chd + chxl + chtt
                		url = url.replace(/ /g,"%20")
                    	embed = embed.setImage(url)
                    	return embed.addField("Peak", peak ? peak.formattedAxisTime : "n/a")
        	        }
        	    }
        	    return embed
        	})
        }).then(function(embed) {
        	return googleTrends.interestByRegion({keyword: query})
        	.then(function(res) {
        	    if (res.startsWith("<!DOCTYPE")) return embed
        	    
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
    
    self.redditor = (msg, ctx, config, cb, count) => {
        if (!ctx) {
            return;
        }
        ctx = ctx.replace(/\s/g,'')
        request("https://snoopsnoo.com/u/"+ctx, function(err, req, res) {
            if (err) return
            var starter = "var results = JSON.stringify("
            var stopper = 'var g_user_averages'
            
            var start = res.indexOf(starter) + starter.length
            var stop = res.indexOf(stopper)
            var json = res.substring(start,stop).trim()
            json = json.slice(0,json.length-2)
            //console.log(json)
            
            var data
            try {
                data = JSON.parse(json);
            }
            catch(e) {
                cb("Redditor not found!")
                return
            }
            
            //STATISTICS
            
    		//general
    		var embed = new Discord.RichEmbed()
            embed.setTitle(`/u/${data.username}`)
            embed.setURL(`http://reddit.com/u/${data.username}`)
    		
    		//submissions
    		var submissions = data.summary.submissions
    		
    		var posts_on = submissions.type_domain_breakdown.children[0].children
    		var posts_on_str = posts_on.map(s => s.name)
    	    embed.addField("Top Subreddits", "```"+posts_on_str.slice(0,30)+"```")
    	    
    	    embed.addField(`Submissions (${submissions.count})`,
    	        `*${submissions.computed_karma} karma* total, *${submissions.average_karma}* average\n`+
    		    `\` Best:\` [${sanitize(submissions.best.title.slice(0,256))}](${sanitize(submissions.best.permalink.slice(0,256))})\n`+
    		    `\`Worst:\` [${sanitize(submissions.worst.title.slice(0,256))}](${sanitize(submissions.worst.permalink.slice(0,256))})\n...`
    	    )
    		
    		//comments
    		var comments = data.summary.comments
    		embed.addField(`Comments (${comments.count})`,
    		    `*${comments.computed_karma} karma* total, *${comments.average_karma}* average\n`+
    		    `*${comments.count}* comments written over *${comments.hours_typed}* hours\n`+
    		    `*${comments.total_word_count}* total words, each worth *${comments.karma_per_word}* karma\n`+
    		    `\` Best:\` [${sanitize(comments.best.text.slice(0,256))}](${sanitize(comments.best.permalink.slice(0,256))})\n`+
    		    `\`Worst:\` [${sanitize(comments.worst.text.slice(0,256))}](${sanitize(comments.worst.permalink.slice(0,256))})\n...`
            )
            
    		//misc
    		var t = new Date(0)
            t.setUTCSeconds(data.summary.signup_date)
            embed.setFooter(`Cake Day: ${t.toUTCString()}`)//"Reddit Shekels: ${submissions.gilded+comments.gilded}`)
            
            //INFERENCES
            var syn = data.synopsis
            
            var gender,spouse,childhood,family,ideology,lifestyle,interests,entertainment,games,recreation,attributes,possessions
            
            if (syn.gender) gender = syn.gender.data_derived[0].value
            if (syn.relationship_partner) spouse = syn.relationship_partner.data.map(s => s.value).toString()
            if (syn.places_grew_up) childhood = syn.places_grew_up.data.map(s => s.value).toString()
            if (syn.family_members) family = syn.family_members.data.map(s => s.value).toString()
            
            if (syn.political_view) ideology = syn.political_view.data_derived[0].value
            if (syn.lifestyle) lifestyle = syn.lifestyle.data.map(s => s.value).toString()
            
            if (syn.other) interests = syn.other.data.map(s => s.value).toString()
            
            if (syn.entertainment) entertainment = syn.entertainment.data.map(s => s.value)
            if (syn.gaming) games = syn.gaming.data.map(s => s.value)
            if (syn.entertainment && syn.gaming) recreation = entertainment.concat(games).toString()
            else recreation = entertainment || games
            
            //var tech = syn.technology.data.map(s => s.value).toString()
            //var favorites = syn.favorites.data.map(s => s.value).toString()
            
            if (syn.attributes) attributes = syn.attributes.data_extra.map(s => s.value).toString()
            if (syn.possessions) possessions = syn.possessions.data_extra.map(s => s.value).slice(0,30).toString()
            //hello
            console.log(syn)
            if (gender) embed.addField("Gender",`\`${gender}\``)
            if (spouse) embed.addField("Spouse",`\`${spouse}\``)
            if (childhood) embed.addField("Childhood",`\`${childhood}\``)
            if (family) embed.addField("Family",`\`${family}\``)
            
            if (ideology) embed.addField("Ideology",`\`${ideology}\``)
            if (lifestyle) embed.addField("Lifestyle",`\`${lifestyle}\``)
            
            if (interests) embed.addField("Interests",`\`${interests}\``)
            if (recreation) embed.addField("Recreation",`\`${recreation}\``)
            
            if (possessions) embed.addField("Possessions",`\`${possessions}\``)
            if (attributes) embed.addField("Attributes",`\`${attributes}\``)
            
            msg.channel.send(embed).catch(console.error)
        })
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