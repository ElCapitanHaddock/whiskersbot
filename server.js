process.env.NODE_ENV = 'production'

const Discord = require('discord.js');
const client = new Discord.Client();
 
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
/*TODO
    Lower tribunal for distinguished users, 6 votes advances it into mod tribunal
        Success/fail message is sent to both #announcements
*/
client.on('message', msg => {
  if (msg.content.includes(client.user.toString()) && !msg.author.bot) { //use msg.member.roles
    var m = msg.member.roles.find(function(role) {
        if (role == "modera" || role == "admib") return true
        else return null
    })
    if (m) { //if moderator or admin
        var inp = msg.content.trim().substr(client.user.toString().length+1);
        var cmd = inp.substr(0,inp.indexOf(' '))
        var ctx = inp.substr(inp.indexOf(' '), inp.length)
        if (inp.indexOf(' ') == -1) 
            msg.channel.send("epic fail")
        else if (cmd == null)
            msg.channel.send("lol ping Uhtred for help noob")
        else if (helper.func[cmd] == null)
            msg.channel.send(msg.author.toString() + " the command '" + cmd + "' does not exist idiot")
        else if (ctx == null)
            msg.channel.send(msg.author.toString() + " give context you imbecile")
        else {
            helper.func[cmd](msg, ctx, function(error, res) {
                if (error) msg.channel.send(error)
                else {
                    msg.channel.send(res)
                }
            })
        }
    }
    else { //not moderator or admin
        msg.channel.send(msg.author.toString() + " noob")
    }
  }
});

client.on('messageReactionAdd', reaction => {
    if (reaction.message.channel.name == "epic-mod-voting") {
        if (reaction._emoji.name == "updoge") {
            var upvotes = reaction.count;
            if (upvotes >= 6) {
                reaction.message.react('✅');
                var ch = reaction.message.guild.channels.find(function(channel) {
                  if (channel.name == "mod-announcemet-what-wa") {
                    return channel
                  } else return null
                });
                if (ch !== null) {
                    var text = reaction.message.content
                    ch.send(text+"\n✅passed bitches✅") 
                    reaction.message.delete();
                }
            }
        }
        else if (reaction._emoji.name == "downdoge") {
            var upvotes = reaction.count;
            if (upvotes >= 6) {
                reaction.message.react('❌');
                var ch = reaction.message.guild.channels.find(function(channel) {
                  if (channel.name == "mod-announcemet-what-wa") {
                    return channel
                  } else return null
                });
                if (ch !== null) {
                    var text = reaction.message.content
                    ch.send(text+"\n❌rejected bitches❌") 
                    reaction.message.delete();
                }
            }
        }
    }
    else if (reaction.message.channel.name == "suggestions") {
        if (reaction._emoji.name == "updoge") {
            var upvotes = reaction.count;
            if (upvotes >= 6) {
                var ch = reaction.message.guild.channels.find(function(channel) {
                  if (channel.name == "epic-mod-voting") {
                    return channel
                  } else return null
                });
                reaction.message.react('✅');
                if (ch !== null) {
                    ch.send(".................\n𝐏𝐄𝐓𝐈𝐓𝐈𝐎𝐍 @here" + "\n" + 
                    "Author: " + reaction.message.author.toString() + "\n" +
                    "Description: \n```" + reaction.message.content + "```\n"
                    );
                    reaction.message.channel.send("Petition Sent to Council:\n" + reaction.message.content)
                }
            }
        }
    }
})

client.login(process.env.BOT_TOKEN)

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
            cb("add a channel called #epic-mod-voting dumbass", null)
        }
        else {
            var prop_id = Math.random().toString(36).substring(5);
            ch.send(
                ".................\n𝐏𝐑𝐎𝐏𝐎𝐒𝐀𝐋 @here" + "\n" + 
                "Author: " + msg.author.toString() + "\n" +
                "Description: \n```" + ctx.trim() + "```\n"
                );
            cb(null, msg.author.toString() + " here's your id '" + prop_id + "'")
        }
    }
}

var helper = new Helper();
