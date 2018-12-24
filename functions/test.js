/*var request = require('request')
request.get({
    url: "http://www.scp-wiki.net/scp-002"
}, function(err, res, body) {
    if (err) {
        console.log(err)
        return
    }
    console.log(body)
})*/
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var rand = getRandomInt(0, 4999)
if (rand < 10) {
    rand = "00"+rand
}
else if (rand < 100) {
    rand = "0"+rand
}
console.log(rand)

const scrapeIt = require("scrape-it")
 
// Promise interface
scrapeIt("http://www.scp-wiki.net/scp-"+rand, {
  text: "p",
  image: {
      selector: ".image img",
      attr: "src"
    }
}).then(({ data, response }) => {
    if ( response.statusCode !== 200) {
        console.log("Not found!")
        return
    }
    console.log(`Status Code: ${response.statusCode}`)
    var text = data.text
    
    var title = text.slice(text.indexOf("Item #:")+8,text.indexOf("Object Class:"))
    var classname = text.slice(text.indexOf("Object Class:")+14, text.indexOf("Special Containment Procedures:"))
    var description = text.slice(text.indexOf("Description:")+12, text.indexOf("Reference:"))
    console.log(title)
    console.log(classname)
    console.log(description)
    console.log(data.image)
})