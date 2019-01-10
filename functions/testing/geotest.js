
/*
var geohash = require('ngeohash');
console.log(geohash.encode(47.608013,-122.335));
*/

var Discord = require('discord.js')
const scrapeIt = require("scrape-it")

var short = "fortnite"

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
		//cb("I couldn't find any matching Q&As")
		return
	}
	var embed = new Discord.RichEmbed()
	embed.setTitle(res.question)
	embed.setDescription(res.answer)
	embed.setFooter("by "+res.author)
	embed.setURL(res.link)
	msg.channel.send(embed)
})
 
 
 //47.608013,-122.335167
var request = require('request')

//whatis command

//https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=47.608013|-122.335167&gsprop=type|name|dim|country|region|globe
//https://en.wikipedia.org/w/api.php?action=query&titles=vostok_2018&prop=description&format=jsonfm
//https://en.wikipedia.org/w/api.php?action=opensearch&search=hello&limit=10&namespace=0&format=jsonfm
//https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=United%20States


//IDEA:
//todo: API Discord Bot. User-friendly request/scrape interface
/*
Features:
	url generator (query params, %20, etc.)
	commands:
		request [url] - replies with raw response
		json [url] - replies with pretty printed JSON response
		web [url] - replies with html-stripped text
		ping [url] - response time
		
	command rate limiting
	
*/
/*
var short = "hello"
short = short.replace(" ","_")
request.get(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${short}&profile=fast-fuzzy&limit=2&namespace=*&format=json`
,function(req, res) {
	var contents = JSON.parse(res.body)
	if (contents[1].length == 0 || contents[2].length == 0 || !contents[2][0]) {
		console.log("404: not found")
		return
	}
	console.log(contents)
	var index = 0
	if (contents[2][0].includes("refer to:") || contents[2][0].includes("refers to:") || !contents[2][0]) {
		index = 1
	}
	var insert = contents[2][index]
	, title = contents[1][index]
	console.log(`${title}: ${insert}`)
})
*/

/*query command
	associations
	most interested regions
	peak interest

/*
var Discord = require('discord.js')
const googleTrends = require('google-trends-api');

var query = "wrbwrowibroni"

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
	return 
	*/
/*
googleTrends.relatedQueries({keyword: query})
.then(function(res) {
	res = JSON.parse(res)
	var topics = res.default.rankedList[0].rankedKeyword
	
	topics = topics.map(e => e.query).slice(0,5)
	topics = topics.filter((item,index,self) => item !== query.toLowerCase() && self.indexOf(item)==index);
	
	var embed = new Discord.RichEmbed()
	embed.setTitle(query)
	return embed.setDescription(topics.join(", "))
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
*/

/*
googleTrends.relatedQueries({keyword: 'Donald Trump'})
.then(function(results){
  console.log('These results are awesome', results);
})
.catch(function(err){
  console.error('Oh no there was an error', err);
});
*/
