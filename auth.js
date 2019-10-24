
var request = require('request')
var Auth = function() {
    var self = this
    
    self.url = "https://discordapp.com/api/oauth2/authorize?client_id=528809041032511498&redirect_uri=https%3A%2F%2Fprism-word.glitch.me%2Fauth&response_type=code&scope=identify%20connections"
    
    self.authenticate = function(id, token, level, cb) { //return and delete the token
        request.get(
            {
                url: "https://discordapp.com/api/v6/users/@me",
                headers: {
                    Authorization: "Bearer " + token
                }
            },
            function(err, res, body) {
                if (err) {
                    cb(500) //internal error
                    return
                }
                if (body.code === 0) {
                    cb(401) //unauthorized
                    return
                }
                body = JSON.parse(body)
                if (body.id !== id) { //CHECK IF ID MATCHES UP
                    cb(406) 
                    return
                }
                
                //continue on to check connections
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
                        body = JSON.parse(body)
                        if (body.code === 0 || !Array.isArray(body)) {
                            cb(401)
                            return
                        }
                        if (body.length >= 1) {
                            var connections = 0
                            for (var i = 0; i < body.length; i++) {
                                if (body[i].verified == true) {
                                    connections += 1
                                }
                            }
                            if (connections >= level) {
                                cb(null, body)
                            }
                            else cb(404)
                        }
                        else cb(404)
                    }
                )
            }
        )
    }
}

module.exports = Auth