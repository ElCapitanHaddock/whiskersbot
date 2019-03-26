

var Discord = require('discord.js')
const googleTrends = require('google-trends-api');

/*
function runQuery() {
    googleTrends.autoComplete({keyword: query})
    .then(function(res) {
    	var embed = new Discord.RichEmbed()
    	res = JSON.parse(res)
    	var ctx = res.default.topics
    	
    	//flatten and remove duplicates
    	ctx = ctx.map(e => e.title)
    	ctx = ctx.filter((item,index,self) => item !== query.toLowerCase() && self.indexOf(item)==index);
    	
    	//autocomplete
    	return embed.addField("Autocomplete", ctx.join(", "))
    }).then(function(embed) {
    	return googleTrends.relatedQueries({keyword: query})
    	.then(function(res) {
    		res = JSON.parse(res)
    		var topics = res.default.rankedList[0].rankedKeyword
    		
    		topics = topics.map(e => e.query).slice(0,5)
    		topics = topics.filter((item,index,self) => item !== query.toLowerCase() && self.indexOf(item)==index);
    		
    		var embed = new Discord.RichEmbed()
    		embed.setTitle(query)
    		return embed.setDescription(topics.join(", "))
    	})
    }).then(function(embed) {
    	return googleTrends.interestByRegion({keyword: query})
    	.then(function(res) {
    		res = JSON.parse(res)
    		var regions = res.default.geoMapData
    		
    		regions = regions.sort(function(a, b) {
    			return b.value[0]- a.value[0]
    		}).slice(0,5)
    		regions = regions.map(e => `**${e.value[0]}%** ${e.geoName}` ).slice(0,5)
    		
    		return embed.addField("Interest", regions.join("\n"))
    	})
    }).then(embed => {
    	return googleTrends.interestOverTime({keyword: query})
    	.then(function(res) {
    		res = JSON.parse(res)
    		var times = res.default.timelineData
    		var peak = times.find(t => t.value[0] == 100)
    		return embed.addField("Peak", peak ? peak.formattedAxisTime : "n/a")
    	})
    }).then(embed => {
    	console.log(embed)
    })
    .catch(function(err){
      console.error(err);
    });
}
*/


var query = "Obama"

var base = "https://image-charts.com/chart?chs=900x500&chf=bg,s,36393f&chma=10,30,30,20&cht=lc&chco=FFFFFF&chxt=x,y&chm=B,4286f4,0,0,0&chxs=0,FFFFFF,15|1,FFFFFF" //0,FF00FF,13|1,FF0000

function runQuery() {
    googleTrends.interestOverTime({keyword: query})
	.then(function(res) {
		res = JSON.parse(res)
		
		if (!res) return
		
		var times = res.default.timelineData
		
		if (times.length == 0) return
		
		var peak = times.reduce(function(prev, current) {
            return (prev.value[0] > current.value[0]) ? prev : current
        })
        
        var peak_index = times.indexOf(peak)
		
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
		
		console.log(url)
		//var peak = times.find(t => t.value[0] == 100)
		//console.log(times.length)
		console.log(times[times.length-1])
	})
}
runQuery(query)

//var key = "AIzaSyAzRVDxtRfo3EqTEbritKiZ93GLDOV4o0o"
