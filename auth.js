
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
                    cb(500)
                    return
                }
                if (body.code === 0 || !Array.isArray(body)) {
                    cb(401)
                    return
                }
                if (body.length >= 1) {
                    cb(null, body)
                }
                else cb(404)
            }
        )
    }
}

module.exports = Auth