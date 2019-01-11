
var request = require('request')
var ctx = "obama"
var short = ctx.replace(" ", "+")

var key = "AIzaSyAzRVDxtRfo3EqTEbritKiZ93GLDOV4o0o"
var loc = `https://kgsearch.googleapis.com/v1/entities:search?query=${short}&key=${key}&limit=1&indent=True`
request.get({ url: loc },
function(req, res, body) {
    body = JSON.parse(body)
    if (body.error) return
    var data = body.itemListElement[0].result
    console.log(data.name)
    //console.log(data)
    if (data.detailedDescription) {
        console.log(data.detailedDescription.articleBody )
    }
    else console.log(data.description)
    console.log(data.image.contentUrl)
    console.log(data["@type"])
})