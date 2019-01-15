

var Discord = require('discord.js')
const googleTrends = require('google-trends-api');

var query = "Barack Obama"

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

var key = "AIzaSyAzRVDxtRfo3EqTEbritKiZ93GLDOV4o0o"

import {GoogleCharts} from 'google-charts';
 
//Load the charts library with a callback
GoogleCharts.load(drawChart);
 
function drawChart() {
 
    // Standard google charts functionality is available as GoogleCharts.api after load
    const data = GoogleCharts.api.visualization.arrayToDataTable([
        ['Chart thing', 'Chart amount'],
        ['Lorem ipsum', 60],
        ['Dolor sit', 22],
        ['Sit amet', 18]
    ]);
    const pie_1_chart = new GoogleCharts.api.visualization.PieChart(document.getElementById('chart1'));
    pie_1_chart.draw(data);
}