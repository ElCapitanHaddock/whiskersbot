
/*

>subreddit [subreddit] about/top/new/controversial
>redditor [username]

*/


var Discord = require('discord.js')
var request = require('request')

function redditor(ctx) {
    var query = ctx
    
    var embed = new Discord.RichEmbed()
    
    //checks if it exists and fulfills "about" query
    request.get(`http://reddit.com/u/${query}/about.json`, function(err, req, res) {
        if (err || !res) {
            console.log("Internal error: "+err)
            return
        }
        
        var data = JSON.parse(res);
        
        if (data.error == 404) {
            embed.setTitle("Redditor not found!")
            //msg.channel.send(embed).catch(console.error)
            console.log(embed)
            return
        }
        
        if (data.error) {
            embed.setTitle("Internal Reddit error!")
            //msg.channel.send(embed).catch(console.error)
            console.log(embed)
        }
        
        //todo: get snoo reddit icon and use as thumbnail
        
        data = data.data
        console.log(data)
        
        var embed = new Discord.RichEmbed()
        embed.setTitle(`/u/${data.name}`)
        embed.setURL(`http://reddit.com/u/${data.name}`)
        
        embed.addField("Description",data.subreddit.public_description+"\n")
        
        var utcSeconds = data.created;
        var d = new Date(0);
        d.setUTCSeconds(utcSeconds);
        embed.addField("Created On",d.toLocaleString())
        
        embed.addField("Comment Karma",data.comment_karma)
        embed.addField("Post Karma",data.link_karma+"\n")
        
        embed.addField("Verified",data.verified ? "Yes" : "No")
        embed.addField("Has Gold",data.is_gold ? "Yes" : "No")
        
        //msg.channel.send(embed).catch(console.error)
        console.log(embed)
        return
    })
}

function subreddit(ctx) {
    var params = ctx.split(" ")
    var query = params[0].toLowerCase()
    var type = params[1]
    
    if (!(type=="about" || type=="top" || type=="new" || type=="controversial")) {
        type = "about"
    }
    
    var embed = new Discord.RichEmbed()
    
    //checks if it exists and fulfills "about" query
    request.get(`http://reddit.com/r/${query}/about.json?t=all`, function(err, req, res) {
        if (err || !res) {
            console.log("Internal error: "+err)
            return
        }
        
        var data = JSON.parse(res);
        
        if (data.error == 404) {
            embed.setTitle("Subreddit not found!")
            //msg.channel.send(embed).catch(console.error)
            console.log(embed)
            return
        }
        
        if (data.error) {
            embed.setTitle("Internal Reddit error!")
            //msg.channel.send(embed).catch(console.error)
            console.log(embed)
        }
        
        //todo: get reddit icon and use as thumbnail
        
        var embed = new Discord.RichEmbed()
        embed.setTitle(`/r/${query}`)
        embed.setFooter(type)
        embed.setURL(`http://reddit.com/r/${query}`)
        
        if (type=="about") {
            data = data.data
            
            embed.setThumbnail(data.community_icon)
            if (data.banner_background_image) 
                embed.setImage(data.banner_background_image)
            if (data.primary_color) 
                embed.setColor(data.primary_color)    
                
            if (data.public_description) {
                embed.addField("Description",`${
                    data.public_description.length > 512 
                    ? data.public_description.slice(0,512)+"..."
                    : data.public_description
                }`)
            }
            
            embed.setFooter(data.title)
            
            var utcSeconds = data.created_utc;
            var d = new Date(0);
            d.setUTCSeconds(utcSeconds);
            embed.addField("Created On",d.toLocaleString())
            
            embed.addField("Subscribers",data.subscribers)
            embed.addField("Online",data.accounts_active)
            
            //msg.channel.send(embed).catch(console.error)
            console.log(embed)
            return
        }
        
        //list queries
        request.get(`http://reddit.com/r/${query}/${type}.json?t=all`, function(err, req, res) {
            if (err || !res) return
            var data = JSON.parse(res);
            
            var list = data.data.children
            
            if (!list || list.length == 0) {
                embed.setDescription("Nothing to see here!")
                //msg.channel.send(embed).catch(console.error)
                console.log(embed)
                return
            }
            console.log(list)
            list = list.slice(0,5);
            for (var i = 0; i < list.length; i++) {
                var ele = list[i].data
                var title = `${ele.subreddit_name_prefixed} - ${ele.title}`
                var url = ele.url
                var descript = `⬆️ ${ele.score} ⭐ ${ele.gilded} 💬 ${ele.num_comments}`
                
                embed.addField(`[${title}](${url})`,descript)
            }
            //msg.channel.send(embed).catch(console.error)
            console.log(embed)
        })
    })
}
//redditor("kirbizia")

function snoop(user) {
    request("https://snoopsnoo.com/u/"+user,  
        function(err, req, res) {
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
                console.log("Redditor not found!")
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
    		var posts_on_str = posts_on.map(s => s.name).toString()
    	    //embed.addField("Subreddits", "`"+posts_on_str+"`")
    	    
    	    embed.addField(`Submissions (${submissions.count})`,
    	        `**${submissions.computed_karma} karma** total, **${submissions.average_karma}** average\n`+
    		    `\` Best:\` [${submissions.best.title}](${submissions.best.permalink})\n`+
    		    `\`Worst:\` [${submissions.worst.title}](${submissions.worst.permalink})\n`
    	    )
    		
    		//comments
    		var comments = data.summary.comments
    		embed.addField(`Comments (${comments.count})`,
    		    `**${comments.computed_karma} karma** total, **${comments.average_karma}** average\n`+
    		    `**${comments.count}** comments written over ${comments.hours_typed}\n`+
    		    `**${comments.total_word_count} total words, each worth **${comments.karma_per_word}** karma\n`+
    		    `\` Best:\` [${comments.best.text}](${comments.best.permalink})\n`+
    		    `\`Worst:\` [${comments.worst.text}](${comments.worst.permalink})\n`
            )
            
            
    		//misc
    		var t = new Date(0)
            t.setUTCSeconds(data.summary.signup_date)
            embed.setFooter(`Cake Day: ${t.toUTCString()}`)//"Reddit Shekels: ${submissions.gilded+comments.gilded}`)
            
            //INFERENCES
            var syn = data.synopsis
            console.log(syn)
            
            var gender = syn.gender.data_derived[0].value
            var spouse = syn.relationship_partner.data.map(s => s.value).toString()
            var childhood = syn.places_grew_up.data.map(s => s.value).toString()
            var family = syn.family_members.data.map(s => s.value).toString()
            
            var ideology = syn.political_view.data_derived[0].value
            var lifestyle = syn.lifestyle.data.map(s => s.value).toString()
            
            var interests = syn.other.data.map(s => s.value).toString()
            
            var entertainment = syn.entertainment.data.map(s => s.value)
            var games = syn.gaming.data.map(s => s.value)
            var recreation = entertainment.concat(games).toString()
            
            //var tech = syn.technology.data.map(s => s.value).toString()
            //var favorites = syn.favorites.data.map(s => s.value).toString()
            
            var attributes = syn.attributes.data_extra.map(s => s.value).toString()
            var posessions = syn.possessions.data_extra.map(s => s.value).toString()
            
            
            
            embed.addField("Gender",gender)
            embed.addField("Spouse",spouse)
            embed.addField("Childhood",childhood)
            embed.addField("Family",family)
            
            embed.addField("Ideology",ideology)
            embed.addField("Lifestyle",lifestyle)
            
            embed.addField("Interests",interests)
            embed.addField("Recreation",recreation)
            
            embed.addField("Attributes",attributes)
            
            console.log(embed)
        }
    )
}
snoop("furrypornacount")


        /*
        //karma graph generation
        //console.log(data.metrics)
		var times = data.metrics.date
		
        var base = "https://image-charts.com/chart?chs=900x500&chf=bg,s,36393f&chma=10,30,30,20&cht=lc&chxt=x,y&chm=B,4286f4,0,0,0&chxs=0,FFFFFF,15|1,FFFFFF&chdl=Comments|Submissions&chco=FF0000,00FF00"
        var chg = "&chg="+times.length+",10"
		var chd = "&chd=t:"
		var chxl = "&chxl=0:|"
		var chtt = "&chts=FFFFFF,26,r&chtt="+data.username+"-Karma"
		
		var chrono_com = times[0] ? times[0].comment_karma : "" //chronological comment karma
		var chrono_sub = times[0] ? times[0].submission_karma : "" //chronological submission karma
		for (var i = 1; i < times.length; i++) {
		    chrono_com += `,${times[i].comment_karma}`
		    chrono_sub += `,${times[i].submission_karma}`
		    
		    chxl += `${times[i].date.split("-")[1]}-${times[i].date.split("-")[2]}`
		}
		chd += `-1|${chrono_com}|-1|${chrono_sub}`
		
		var url = base + chg + chd + chxl + chtt
		console.log(url)
		*/