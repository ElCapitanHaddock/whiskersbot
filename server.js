const Discord = require('discord.js');
const client = new Discord.Client();
 
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
/*TODO
    Restrict to mod/admin interaction
    Check for reactions, post passed proposals on announcements
    Delete all reactions that are not updoge/downdoge
*/
client.on('message', msg => {
  if (msg.content.includes(client.user.toString())) {
    var inp = msg.content.trim().substr(client.user.toString().length+1);
    var cmd = inp.substr(0,inp.indexOf(' '))
    var ctx = inp.substr(inp.indexOf(' '), inp.length)
    if (cmd == null || cmd.trim().length == 0)
        msg.channel.send("lol ping Uhtred for help noob");
    else if (helper.func[cmd] == null)
        msg.channel.send(msg.author.toString() + ", the command '" + cmd + "' does not exist.")
    else if (ctx == null)
        msg.channel.send(msg.author.toString() + ", please provide command context.")
    else {
        helper.func[cmd](msg, ctx, function(error, res) {
            if (error) msg.channel.send(error)
            else {
                msg.channel.send(res)
            }
        })
    }
  }
});

client.on('messageReactionAdd', reaction => {
    console.log(reaction.name);
    if (reaction.message.channel.name == "epic-mod-voting") {
        if (reaction.name == "updoge") {
            var upvotes = reaction.count;
            if (upvotes >= 1) {
                reaction.message.react('✅');
                var ch = reaction.message.guild.channels.find(function(channel) {
                  if (channel.name == "mod-announcemet-what-wa") {
                    return channel
                  } else return null
                });
                if (ch !== null) {
                    var text = reaction.message.content
                    ch.send(text+"\n✅passed bitches✅")
                }
            }
        }
    }
})

var bot_secret_token = "NTExNjcyNjkxMDI4MTMxODcy.DsuUfQ.knMgnXhf2FOTWau5wi6yB9n0tVo"
client.login(bot_secret_token)

var Helper = function() {
    var self = this;
    
    self.func = {};
    self.func.propose = function(msg, ctx, cb) {
        var ch = msg.guild.channels.find(function(channel) {
          if (channel.name == "epic-mod-voting") {
            return channel
          } else return null
        });
        if (ch == null) {
            cb("Please add a channel called #epic-mod-voting in order to create a proposal. It is recommended that you restrict #epic-mod-voting so only the bot can post.", null)
        }
        else {
            var prop_id = Math.random().toString(36).substring(5);
            ch.send(
                "ID: " + prop_id + "\n" + 
                "Author: " + msg.author.toString() + "\n" +
                "Description: \n```" + ctx + "```\n"
                );
            cb(null, "Proposal succesfully sent.")
        }
    }
}

var helper = new Helper();