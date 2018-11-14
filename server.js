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
    var m = msg.member.roles.find('name', 'modera') || msg.member.roles.find('name', 'admib')
    if (m) { //if moderator or admin
        var inp = msg.content.trim().substr(client.user.toString().length+1);
        var cmd = inp.substr(0,inp.indexOf(' '))
        var ctx = inp.substr(inp.indexOf(' '), inp.length)
        if (cmd == null)
            msg.channel.send("lol ping Uhtred for help noob")
        else if (inp.indexOf(' ') == -1) 
            msg.channel.send("epic fail")
        else if (helper.func[cmd.toLowerCase()] == null)
            msg.channel.send(msg.author.toString() + " the command '" + cmd + "' does not exist idiot")
        else if (ctx == null)
            msg.channel.send(msg.author.toString() + " give context you imbecile")
        else {
            helper.func[cmd.toLowerCase()](msg, ctx, function(error, res) {
                if (error) msg.channel.send(error)
                else {
                    msg.channel.send(res)
                }
            })
        }
    }
    else { //not moderator or admin
        msg.channel.send(msg.author.toString() + " is cringe")
    }
  }
});

client.on('messageReactionAdd', reaction => {
    if (reaction.message.channel.name == "epic-mod-voting") {
        if (reaction._emoji.name == "updoge") {
            var upvotes = reaction.count;
            console.log("Proposal '"+reaction.message.content+"' upvoted: " + upvotes)
            if (upvotes >= 5) {
                console.log("Proposal passed")
                reaction.message.react('✅');
                var ch = getChannel(reaction.message.guild.channels,"mod-announcemet-what-wa");
                if (ch !== null) {
                    var text = reaction.message.content
                    ch.send(text+"\n✅passed lol✅") 
                    reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                }
            }
        }
        else if (reaction._emoji.name == "downdoge") {
            var downvotes = reaction.count;
            console.log("Proposal '"+reaction.message.content+"' downvoted: " + downvotes)
            if (downvotes >= 5) {
                console.log("Proposal rejected")
                reaction.message.react('❌');
                var ch = getChannel(reaction.message.guild.channels,"mod-announcemet-what-wa");
                if (ch !== null) {
                    var text = reaction.message.content
                    ch.send(text+"\n❌rejected bitches❌") 
                    reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                }
            }
        }
    }
    else if (reaction.message.channel.name == "feedback") {
        var content = reaction.message.content;
        console.log("content: "+content);
        if (reaction._emoji.name == "updoge") {
            var upvotes = reaction.count;
            if (upvotes >= 5) {
                var ch = getChannel(reaction.message.guild.channels, "epic-mod-voting");
                reaction.message.react('✅');
                if (ch !== null) {
                    var prop_id = Math.random().toString(36).substring(5);
                    ch.send(
                        ".......................\n𝐏𝐄𝐓𝐈𝐓𝐈𝐎𝐍 @here" + "\n" +
                        "ID: *" + prop_id + "*\n" + 
                        "Author: " + reaction.message.author.toString() + "\n" +
                        "```" + content + "```\n"
                    );
                    reaction.message.channel.send("By popular request, this petition was sent to the council:\n```" + content + "```")
                    reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                }
            }
        }
    }
})

function getChannel(channels, query) {
    for (var channel in channels) {
        if (channel.name == query) 
            return channel
    }
    return null
}

client.login(process.env.BOT_TOKEN)

var Helper = function() {
    var self = this;
    
    self.func = {};
    
    
    //PROPOSE COMMAND, MEDIUM IMPORTANCE
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
            console.log(msg.author.toString() + " proposed: " + msg.content)
            var prop_id = Math.random().toString(36).substring(5);
            ch.send(
                ".......................\n𝐏𝐑𝐎𝐏𝐎𝐒𝐀𝐋 @here" + "\n" + 
                "ID: *" + prop_id + "*\n" + 
                "Author: " + msg.author.toString() + "\n" +
                "```" + ctx.trim() + "```\n"
                );
            cb(null, msg.author.toString() + "\n *" + prop_id + "*")
        }
    }
    
    //CRINGE ALERT COMMAND, URGENT
    self.func.alert = function(msg, ctx, cb) {
        var ch = msg.guild.channels.find(function(channel) {
          if (channel.name == "epic-mod-voting") {
            return channel
          } else return null
        });
        if (ch == null) {
            cb("add a channel called #epic-mod-voting dumbass", null)
        }
        else {
            console.log(msg.author.toString() + " proposed: " + msg.content)
            var prop_id = Math.random().toString(36).substring(5);
            ch.send(
                ":::::::: 𝘾𝙍𝙄𝙉𝙂𝙀 𝘼𝙇𝙀𝙍𝙏 ::::::::\n@everyone\n" + 
                "ID: *" + prop_id + "*\n" + 
                "Author: " + msg.author.toString() + "\n" +
                "```" + ctx.trim() + "```\n"
                );
            cb(null, msg.author.toString() + "\n**OMG BRUH CRINGE ALERT CRNIGE ALERT**\n*" + prop_id + "*")
        }
    }
    
    
}

var helper = new Helper();
