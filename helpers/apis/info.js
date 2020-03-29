
var Discord = require('discord.js')
var request = require('request')
const googleTrends = require('google-trends-api')
const scrapeIt = require("scrape-it")

const nodeyourmeme = require('nodeyourmeme')
const shindan = require('shindan')
const dogeify = require('dogeify-js');

const sanitize = require('sanitize-html')

const engine_key = "AIzaSyAer13xr6YsLYpepwJBMTfEx5wZPRe-NT0"
const engine_id = "012876205547583362754:l8kfgeti3cg"

var Info = function(client, translate, perspective) {
    
    var self = this
    self.translate_fancy = (msg, ctx, config, cb) => { //todo: add link to Yandex here
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            params[1] = params[1].replace(/@/g, "").replace(/`/g,"")
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("Yandex Error: " + err)
              else if (res.text) {
                  var embed = new Discord.MessageEmbed()
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
            params[1] = params[1].replace(/@/g, "").replace(/`/g,"")
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
                    msg.reply("Is that a number? Sorry I'm stupid") 
                    return
                }
                var embed = new Discord.MessageEmbed()
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
    
/*
 ______     ______     ______     ______     ______   ______    
/\  ___\   /\  ___\   /\  == \   /\  __ \   /\  == \ /\  ___\   
\ \___  \  \ \ \____  \ \  __<   \ \  __ \  \ \  _-/ \ \  __\   
 \/\_____\  \ \_____\  \ \_\ \_\  \ \_\ \_\  \ \_\    \ \_____\ 
  \/_____/   \/_____/   \/_/ /_/   \/_/\/_/   \/_/     \/_____/ 
                                                                
*/
    
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
            
            var embed = new Discord.MessageEmbed()
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
        	
        	var embed = new Discord.MessageEmbed()
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
                var embed = new Discord.MessageEmbed()
                embed.setTitle(res.name)
                embed.setDescription(res.about)
                msg.channel.send(embed).catch(console.error)
            }).catch(console.error);
            return
        }
        nodeyourmeme.search(ctx).then(res=> {
            var embed = new Discord.MessageEmbed()
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
          	selector: ".lh-17.fz-m",
          	attr: "href"
          }
        })
        .then(({ data, response }) => {
        	if (!data || !data.link) return
        	var link = data.link
        	return scrapeIt(data.link, {
        			question: ".Question__title___3_bQf",
        	    	answer: {
        	    	    listItem: ".AnswersList__answersList___1GjcP > li",
        	    	    data: {
            	    	    text: {
                                listItem: "p"
                            }
        	    	    }
        	    	},
        	    }).then(({ data, response }) => {
        	        console.log(data)
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
        	var embed = new Discord.MessageEmbed()
        	embed.setTitle(res.question.slice(0, 500))
        	
        	var ans = res.answer[0].text.filter(p => p.___raw == undefined).join('\n').slice(0,2047)
        	
        	if (ans.length < res.answer.length) {
        	    ans += "..."
        	}
        	embed.setDescription(ans)
        	//embed.setFooter("by "+res.author)
            embed.setFooter('"'+ctx+'"')
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
        	
        	var embed = new Discord.MessageEmbed()
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
    		var embed = new Discord.MessageEmbed()
            embed.setTitle(`/u/${data.username}`)
            embed.setURL(`http://reddit.com/u/${data.username}`)
    		
    		//submissions
    		var submissions = data.summary.submissions
    		
    		if (submissions.count != 0) {
        		var posts_on = submissions.type_domain_breakdown.children[0].children
        		var posts_on_str = posts_on.map(s => s.name)
        	    embed.addField("Top Subreddits", "```"+posts_on_str.slice(0,30)+"```")
        	    
        	    embed.addField(`Submissions (${submissions.count})`,
        	        `${submissions.computed_karma} karma total, ${submissions.average_karma} average\n`+
        		    `\` Best:\` [${submissions.best.title.slice(0,256)}](${submissions.best.permalink.slice(0,256)})\n`+
        		    `\`Worst:\` [${submissions.worst.title.slice(0,256)}](${sanitize(submissions.worst.permalink.slice(0,256))})\n...`
        	    )
    		}
    		
    		//comments
    		var comments = data.summary.comments
    		if (comments.count != 0) {
        		embed.addField(`Comments (${comments.count})`,
        		    `${comments.computed_karma} karma total, ${comments.average_karma} average\n`+
        		    `${comments.count} comments written over ${comments.hours_typed} hours\n`+
        		    `${comments.total_word_count} total words, each worth ${comments.karma_per_word} karma\n`+
        		    `\` Best:\` [${comments.best.text.slice(0,256).replace(/<p>/g,"").replace(/<\/p>/g,"")}](${comments.best.permalink.slice(0,256)})\n`+
        		    `\`Worst:\` [${comments.worst.text.slice(0,256).replace(/<p>/g,"").replace(/<\/p>/g,"")}](${comments.worst.permalink.slice(0,256)})\n...`
                )
    		}
            
    		//misc
    		var t = new Date(0)
            t.setUTCSeconds(data.summary.signup_date)
            embed.setFooter(`Cake Day: ${t.toUTCString()}`)//"Reddit Shekels: ${submissions.gilded+comments.gilded}`)
            
            //INFERENCES
            var syn = data.synopsis
            
            var gender,spouse,childhood,lived,education,family,pets,ideology,lifestyle,interests,music,favorites,entertainment,games,recreation,attributes,possessions
            
            if (syn.gender) {
                if (syn.gender.data) gender = syn.gender.data[0].value
                else if (syn.gender.data_derived) gender = syn.gender.data_derived[0].value;
            }
            if (syn.relationship_partner) spouse = syn.relationship_partner.data.map(s => s.value).toString()
            if (syn.places_grew_up) {
                if (syn.places_grew_up.data) childhood = syn.places_grew_up.data.map(s => s.value).toString()
                else if (syn.places_grew_up.data_extra) childhood = syn.places_grew_up.data_extra.map(s => s.value).toString()
            }
            if (syn.places_lived) {
                if (syn.places_lived.data) lived = syn.places_lived.data.map(s => s.value)
                else if (syn.places_lived.data_extra) lived = syn.places_lived.data_extra.map(s => s.value)
            }
            
            if (syn.locations) {
                if (lived) {
                    lived = lived.concat(syn.locations.data.map(s => s.value))
                }
                else lived = syn.locations.data.map(s => s.value)
            }
            if (lived) lived = lived.toString()
            
            if (syn.education) education = syn.education.data.map(s => s.value).toString()
            
            if (syn.family_members) family = syn.family_members.data.map(s => s.value).toString()
            if (syn.pets) pets = syn.pets.data.map(s => s.value).toString()
            
            if (syn.political_view) ideology = syn.political_view.data_derived[0].value
            if (syn.lifestyle) lifestyle = syn.lifestyle.data.map(s => s.value).toString()
            
            if (syn.other || syn["hobbies and interests"]) {
                if (syn.other) {
                    
                    interests = syn.other.data.map(s => s.value)
                    if (syn["hobbies and interests"]) interests = interests.concat(syn["hobbies and interests"].data.map(s => s.value)).toString()
                    else interests = interests.toString()
                }
                else interests = syn["hobbies and interests"].data.map(s => s.value).toString()
            }
            
            if (syn.entertainment) entertainment = syn.entertainment.data.map(s => s.value)
            if (syn.gaming) games = syn.gaming.data.map(s => s.value)
            if (syn.entertainment && syn.gaming) recreation = entertainment.concat(games)
            else recreation = entertainment || games
            
            if (syn.television) {
                if (recreation) {
                    recreation = recreation.concat(syn.television.data.map(s => s.value))
                }
                else recreation = syn.television.data.map(s => s.value)
            }
            if (recreation) recreation = recreation.toString()
            
            if (syn.music) music = syn.music.data.map(s => s.value).toString()
            
            //var tech = syn.technology.data.map(s => s.value).toString()
            if (syn.favorites) favorites = syn.favorites.data.map(s => s.value).toString()
            
            if (syn.attributes) {
                if (syn.attributes.data) attributes = syn.attributes.data.map(s => s.value).toString()
                else if (syn.attributes.data_extra) attributes = syn.attributes.data_extra.map(s => s.value).toString()
            }
            
            if (syn.possessions) {
                if (syn.possessions.data) possessions = syn.possessions.data.map(s => s.value).slice(0,40).toString()
                possessions = syn.possessions.data_extra.map(s => s.value).slice(0,40).toString()
            }
            //hello
            
            if (gender) embed.addField("Gender",`\`\`\`${gender}\`\`\``)
            if (spouse) embed.addField("Spouse",`\`\`\`${spouse}\`\`\``)
            if (childhood) embed.addField("Home",`\`\`\`${childhood}\`\`\``)
            if (lived) embed.addField("Locations",`\`\`\`${lived}\`\`\``)
            if (education) embed.addField("Education",`\`\`\`${education}\`\`\``)
            if (family) embed.addField("Family",`\`\`\`${family}\`\`\``)
            if (pets) embed.addField("Pets",`\`\`\`${pets}\`\`\``)
            
            if (ideology) embed.addField("Ideology",`\`\`\`${ideology}\`\`\``)
            if (lifestyle) embed.addField("Lifestyle",`\`\`\`${lifestyle}\`\`\``)
            
            if (interests) embed.addField("Interested in",`\`\`\`${interests}\`\`\``)
            if (favorites) embed.addField("Enjoys",`\`\`\`${favorites}\`\`\``)
            if (recreation) embed.addField("Fandoms",`\`\`\`${recreation}\`\`\``)
            if (music) embed.addField("Music",`\`\`\`${music}\`\`\``)
            
            if (possessions) embed.addField("Possessions",`\`\`\`${possessions}\`\`\``)
            if (attributes) embed.addField("Attributes",`\`\`\`${attributes}\`\`\``)
            
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
            var embed = new Discord.MessageEmbed()
            
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
    
    self.google = (msg, ctx, config, cb) => {
        var query = ctx.slice(0,128)
        if (!query) return
        
        var opts = { 
            q: query, 
            key: engine_key,
            cx: engine_id,
            num: 10
        }
        request.get({url: "https://www.googleapis.com/customsearch/v1/", qs: opts}, function(err, req, res) {
            if (err) {
                cb("Something went wrong!")
                return
            }
            var body = JSON.parse(res)
            
            if (body.error) {
                cb("Something went wrong!")
                return
            }
            var embed = new Discord.MessageEmbed()
            embed.setTitle("Search Results")
            
            if (body.items || body.items.length == 0) {
                var desc = ""
                body.items.forEach(i => {
                    
                    desc += "["+ i.title +"]("+ i.link +")\n"
                })
                embed.setDescription(desc)
            }
            else embed.setTitle("No results!")
            
            embed.setFooter("'" + query + "'", "https://media.discordapp.net/attachments/528927344690200576/532826301141221376/imgingest-3373723052395279554.png")
            
            msg.channel.send(embed).catch(function(error){console.error(error)})
        })
    }
    
/*
 ______     ______     __   __     _____     ______     __    __    
/\  == \   /\  __ \   /\ "-.\ \   /\  __-.  /\  __ \   /\ "-./  \   
\ \  __<   \ \  __ \  \ \ \-.  \  \ \ \/\ \ \ \ \/\ \  \ \ \-./\ \  
 \ \_\ \_\  \ \_\ \_\  \ \_\\"\_\  \ \____-  \ \_____\  \ \_\ \ \_\ 
  \/_/ /_/   \/_/\/_/   \/_/ \/_/   \/____/   \/_____/   \/_/  \/_/ 
                                                                    
*/
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
    
    self.paterico = (msg, ctx, config, cb) => {
        var paterico_guild = client.guilds.cache.find(function(g) { return g.id == 509166690060337174 })
        if (paterico_guild) {
            var patericos = paterico_guild.emojis.cache.array()
            var emote = patericos[Math.floor(Math.random()*patericos.length)]
            msg.channel.send(emote.toString()).catch(console.error)
        } else msg.reply("cut the powerlines")
    }

    self.doge = (msg, ctx, config, cb) => {
        cb(null,"<:doge:522630325990457344> " + dogeify(ctx.toLowerCase().replace(/@everyone/g,"").replace(/@here/g,"").replace(/@/g,"")))
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
            var embed = new Discord.MessageEmbed()
            
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
    
    self.nickname = (msg, ctx, config, cb) => {
        if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            var user
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== client.user.id) user = users[i]
            }
            if (user) ctx = user.displayAvatarURL({format:'png', size:2048, dynamic:true})
            else ctx = msg.author.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        scrapeIt("http://www.robietherobot.com/insult-generator.htm", {
          nickname: "h1"
        })
        .then(({ data, response }) => {
        	if (!data || !data.nickname) cb("Sorry I'm doing my taxes rn")
        	else { 
        	    
        	    var title = data.nickname.split('\t').pop()
        	    
        	    var embed = new Discord.MessageEmbed()
                embed.setThumbnail(ctx)
                embed.setTitle(title)
                msg.channel.send(embed).then().catch(function(error){console.error(error)})
        	}
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
            img = msg.author.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            if (users.length > 0) {
                ctx = users[0].username
                img = users[0].displayAvatarURL({format:'png', size:2048, dynamic:true})
            }
        }
        
        shindan
          .diagnose(619296, ctx)
          .then(res => {
              var embed = new Discord.MessageEmbed()
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
            img = msg.author.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            if (users.length > 0) {
                ctx = users[0].username
                img = users[0].displayAvatarURL({format:'png', size:2048, dynamic:true})
            }
        }
        
        shindan
          .diagnose(671644, ctx)
          .then(res => {
              var embed = new Discord.MessageEmbed()
              embed.setTitle(ctx)
              embed.setDescription(res.result)
              if (img) embed.setThumbnail(img)
              msg.channel.send(embed)
          })
    }
    
    self.name = (msg, ctx, config, cb) => {
        
        //user avatar
        var img
        
        //if no provided context, use the message author as the seed
        if (ctx.trim().length == 0) {
            ctx = msg.author.username
            img = msg.author.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        
        //otherwise, regex the message for user mentions
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            if (users.length > 0) {
                ctx = users[0].username
                img = users[0].displayAvatarURL({format:'png', size:2048, dynamic:true})
            }
        }
        //if there are no mentions, the text provided is used as the seed
        
        
        shindan
          .diagnose(671644, ctx)
          .then(res => {
              
              var embed = new Discord.MessageEmbed()
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
              
              var elements = res.result.split("\n")
              var desc = elements[0] + "\n\n" 
              
              desc += "Aspect: " + elements[3].slice(9) + "\n"
              desc += "Domain: " + elements[2].slice(10) + "\n"
              embed.setDescription(desc)
              
              embed.setFooter(elements[4].slice(7))
              
              if (img) embed.setThumbnail(img)
              msg.channel.send(embed)
          })
    }
    
    self.vibe = (msg, ctx, config, cb) => {
        
        var img
        if (ctx.trim().length == 0) {
            ctx = msg.author.username
            img = msg.author.displayAvatarURL({format:'png', size:2048, dynamic:true})
        }
        else if (msg.mentions && msg.mentions.users) {
            var users = msg.mentions.users.array()
            if (users.length > 0) {
                ctx = users[0].username
                img = users[0].displayAvatarURL({format:'png', size:2048, dynamic:true})
            }
        }
        
        shindan
          .diagnose(937709, ctx)
          .then(res => {
              var embed = new Discord.MessageEmbed()
              embed.setTitle(ctx)
              
              var check = res.result.split("\n")[1]
              
              if (check.includes('passed')) embed.setColor('GREEN')
              else if (check.includes('failed')) embed.setColor('RED')
              
              embed.setDescription(check)
              if (img) embed.setThumbnail(img)
              msg.channel.send(embed)
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
    
/*
 ______     __  __     ______     ______     __  __    
/\  __ \   /\ \/\ \   /\  ___\   /\  == \   /\ \_\ \   
\ \ \/\_\  \ \ \_\ \  \ \  __\   \ \  __<   \ \____ \  
 \ \___\_\  \ \_____\  \ \_____\  \ \_\ \_\  \/\_____\ 
  \/___/_/   \/_____/   \/_____/   \/_/ /_/   \/_____/ 
                                                       
*/

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
        	var embed = new Discord.MessageEmbed()
            embed.setTitle(data.name)
            embed.setURL(url)
            embed.setImage(data.img)
            embed.setFooter(a + "/" + b, "https://www.freeiconspng.com/uploads/pokeball-icon-23.png")
            
            msg.channel.send(embed).catch(console.error)
        })
        .catch(console.error)
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
                
                if (   select.data.url.includes(".jpg") 
                    || select.data.url.includes(".jpeg") 
                    || select.data.url.includes(".gif") 
                    || select.data.url.includes(".png")
                    || select.data.url.includes('youtu.be')) 
                {
                    reply += "\n" + select.data.url
                }
                
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
                    const embed = new Discord.MessageEmbed()
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
            
            var embed = new Discord.MessageEmbed()
            embed.setTitle("🔹️ "+ctx)
            embed.setImage(gifs[0].media[0].gif.url)
            embed.setFooter("1")
            embed.setURL(gifs[0].url)
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({format:'png', size:2048, dynamic:true}))
            
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
    
/*
 ______     ______     ______     __         ______  
/\  __ \   /\  == \   /\  ___\   /\ \       /\__  _\ 
\ \ \/\ \  \ \  __<   \ \___  \  \ \ \____  \/_/\ \/ 
 \ \_____\  \ \_____\  \/\_____\  \ \_____\    \ \_\ 
  \/_____/   \/_____/   \/_____/   \/_____/     \/_/ 
                                                     
*/

    self.scan = (msg, ctx, config, cb) => {
        msg.reply("Sorry, this command is temporarily disabled while whiskers finds a new service to scan websites.")
        
    }
    
    self.geo = (msg, ctx, config, cb) => {
        msg.reply("Sorry, this command has been deprecated. Go to https://trends.google.com/trends/ instead.")
    }
    
}

module.exports = Info