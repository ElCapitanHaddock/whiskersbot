
var request = require('request')
var Auth = function() {
    var self = this
    
    self.url = "https://discordapp.com/api/oauth2/authorize?client_id=511672691028131872&redirect_uri=https%3A%2F%2Fprism-word.glitch.me%2Fauth&response_type=code&scope=identify%20connections"
    
    self.authenticate = function(token, cb) { //return and delete the token
        request.get(
            {
                url: "https://discordapp.com/api/v6/users/@me/connections",
                headers: {
                    Authorization: "Bearer " + token
                }
            },
            function(err, res, body) {
                if (err) {
                    cb(404)
                    return
                }
                var connections = body
                if (body.length >= 1) {
                    cb(null, body)
                }
                else cb(401)
            }
        )
    }
}

module.exports = Auth