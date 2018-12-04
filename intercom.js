/*IRRELEVANT TO THE CHATBOT*/
/*-------------------------*/
/*This is for personal use sending messages through the bot*/

const request = require('request');

//util
var util = require('./util')
    
var Chat = function(configs, client) {
    this.update = function(msg) {
        request({
          url: 'https://capt-picard-sbojevets.c9users.io/from/',
          method: 'POST',
          json: {
              content: (msg.attachments.size > 0) ? msg.content + " " + msg.attachments.array()[0].url : msg.content, 
              username: msg.author.username, 
              channel: msg.channel.name, 
              guild: msg.guild.id, 
              guildname: msg.guild.name}
              
        }, function(error, response, body){ if (error) console.error(error) }); // no response needed atm...
    }
    
    var timeout = 1000
    var liveTimeout = 500 //live and chatting -> check every 1/2 sec
    var sleepTimeout = 5000 //30 seconds inactivity -> check every 5 secs
    var hibernateTimeout = 120000 //the chat API is literally timed out, -> check every 2 minutes 
    var emptyBeat = 0
    var maxEmpty = 120
    
    //after inactivity for 30 seconds, the timeout interval switches to sleepTimeout
    
    function heartbeat() {
        setTimeout(function() { //TBD set guild and channel on webapp
            //if (!guild) guild = client.guilds.find("id", "398241776327983104");
            
            request("https://capt-picard-sbojevets.c9users.io/to", function(err, res, body) { //messy heartbeat, fix later
                if (err) console.error("error: " + err)
                if (body && body.charAt(0) !== '<') {
                    var messages = JSON.parse(body)
                    if (messages.constructor === Array) {
                        for (var i = 0; i < messages.length; i++) {
                            var con = configs.find(function(g) {  return g.name == messages[i].guild })
                            if (con) {
                                var guild = client.guilds.find("id", con.id)
                                //client.guilds.find("id", messages[i].guild)
                                if (guild) {
                                    let channel = util.getChannel(guild.channels, messages[i].channel)
                                    if (channel) channel.send(messages[i].content)
                                }
                            }
                        }
                        if (messages.length >= 1) {
                            emptyBeat = 0;
                            timeout = liveTimeout
                            heartbeat()
                        }
                        else {
                            if (emptyBeat >= maxEmpty) {
                                //console.log("Chat API inactive, sleeping...")
                                timeout = sleepTimeout
                                heartbeat()
                            }
                            else {
                                emptyBeat++
                                heartbeat()
                            }
                        }
                    }
                } //chat API is no longer responding, timed out on C9
                //check for timeout html view, starts with <
                if (body.charAt(0) == '<') {
                    //console.log("Chat API not responding, hibernating...")
                    timeout = hibernateTimeout
                    heartbeat()
                }
            });
        }, timeout)
    }
    heartbeat()
    
    function getAppeals() {
        setTimeout(function() {
            request("https://capt-picard-sbojevets.c9users.io/to", function(err, res, body) {
                if (err) console.error(err)
                console.log(JSON.parse(body))
            })
        },5000) //5s for now
    }
    getAppeals();
}

module.exports = Chat;
