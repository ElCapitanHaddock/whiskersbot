var request = require('request')
request.get({
    url: "http://numbersapi.com/asdf/trivia?notfound=floor&fragment"
}, function(err, res, body) {
    if (err) {
        console.log(err)
        console.log("Do you seriously not know what a number is?") 
        return
    }
    console.log(body)
})