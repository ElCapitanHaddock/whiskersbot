const Discord = require('discord.js');
const client = new Discord.Client();
 
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on('message', msg => {
  if (msg.content.includes(client.user.toString())) {
    var inp = msg.content.split(" ")
    var cmd = inp[1]
    var ctx = inp[2]
    if (helper.func[cmd] == null)
        msg.channel.send(msg.author.toString() + ", the command '" + cmd + "' does not exist.")
    else if (ctx == null)
        msg.channel.send(msg.author.toString() + ", please provide command context.")
    else {
        helper.func[cmd](msg.author.toString(), ctx, function(error, res) {
            if (error) msg.channel.send(error)
            else {
                msg.channel.send(res);
            }
        })
        msg.channel.send(msg.author.toString());
    }
  }
});

var Helper = function() {
    var self = this;
    self.voting_channel = client.channels.find("name","mod-voting");
    
    self.func = {};
    self.func.propose = function(author, ctx, cb) {
        if (self.voting_channel == null) {
            cb("Please add a channel called 'mod-voting' in order to create a proposal", null)
        }
        else {
            var prop_id = Math.random().toString(36).substring(5);
            self.voting_channel.send(
                "Proposal #" + prop_id + "\n" + 
                "Author: " + author + "\n" +
                "Info: " + ctx 
                );
            cb(null, "Proposal succesfully sent.")
        }
    }
}

var helper = new Helper();
var bot_secret_token = "NTExNjcyNjkxMDI4MTMxODcy.DsuUfQ.knMgnXhf2FOTWau5wi6yB9n0tVo"

client.login(bot_secret_token)