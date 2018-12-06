
var Util = {
    //see if message is already checked off by seeing if any reactions belong to the bot itself
    checkReact: function(message, callback) {
        var already = false;
        message.channel.fetchMessage(message.id).then(message => {
            var reactions = message.reactions.array()
            for (var i = 0; i < reactions.length; i++) {
                reactions[i].fetchUsers({limit:50}).then(function(umap) {
                    var users = umap.array()
                    var already = false
                    for (var x = 0; x < users.length; x++) {
                        if (users[x].bot == true) {
                            callback(true)
                        }
                    }
                    callback(false)
                })
            }
        })
        return already
    },
    
    
    getChannel: function(channels, query) { //get channel by name
        return channels.find(function(channel) {
          if (channel.name == query) {
            return channel
          } else return null
        });
    }
}

module.exports = Util