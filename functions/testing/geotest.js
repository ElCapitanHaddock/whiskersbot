
/*
var geohash = require('ngeohash');
console.log(geohash.encode(47.608013,-122.335));
*/

/*
const scrapeIt = require("scrape-it")

var short = "United_States"

scrapeIt("https://en.wikipedia.org/wiki/"+short, {
      meta: ".infobox",
    }).then(({ data, response }) => {
    	console.log(data)
 })
 */
 
 //47.608013,-122.335167
 
var request = require('request')

//whatis command

//https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=47.608013|-122.335167&gsprop=type|name|dim|country|region|globe
//https://en.wikipedia.org/w/api.php?action=query&titles=vostok_2018&prop=description&format=jsonfm
//https://en.wikipedia.org/w/api.php?action=opensearch&search=hello&limit=10&namespace=0&format=jsonfm
//https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=United%20States


var short = "50"
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