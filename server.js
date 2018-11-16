/*
   dBBBBBb  dBP dBBBP dBBBBBb   dBBBBBb    dBBBBb
       dB'                 BB       dBP       dB'
   dBBBP' dBP dBP      dBP BB   dBBBBK'  dBP dB' 
  dBP    dBP dBP      dBP  BB  dBP  BB  dBP dB'  
 dBP    dBP dBBBBP   dBBBBBBB dBP  dB' dBBBBB'   2018 - Jeremy Yang
*/

/*---------------------------------------------------------------------------------
Picard is a Discord bot that promotes democracy in a server...

Current features:
    Proposing ideas to the #mod-vote channel
    Upon reaching 5 upvotes it is "passed" and moved to the announcements page
    Upon reaching 5 downvotes it is "rejected" and also moved
    
    Alerting moderators based on severity
    
    Suggestions in #feedback that go up to 5 upvotes are proposed as "petitions" 
---------------------------------------------------------------------------------*/
/*

Picard is hosted on Heroku. If you wish to host your own version of Picard, here is a good tutorial:
https://shiffman.net/a2z/bot-heroku/

*/
/*TODO
    Currently the bot is very childish... in its final iteration it will be more professional
    
    Lower tribunal for distinguished users, 6 votes advances it into mod tribunal (DONE)
    Success/fail message is sent to both #announcements (DONE)
    
    Info/help message pertaining to vote threshold, syntax, etc. (DONE)
    
    Thumbnail for proposal/alert (DONE)
    
    Fetching last 50 messages from feedback channel as well
    
    Commands for setting mod vote and pleb vote channels
*/

process.env.NODE_ENV = 'production'

const Discord = require('discord.js');
const client = new Discord.Client(
    {
        autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
        disabledEvents: ['TYPING_START']
    });
 
client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}!`);
    var guild = client.guilds.find("id", "483122820843307008"); //touches last 50 messagees to add to event listener cache
    //tbd: find by name. currently that does not work because i'd need to loop through every guild
    if (guild) {
        await guild.channels.find("id", "494662256668311562").fetchMessages({limit: 50}) //modvote channel
        await guild.channels.find("id", "498157555416039454").fetchMessages({limit: 50}) //suggestion channel
    }
});


client.on('message', msg => {
  if (msg.content.includes(client.user.toString()) && !msg.author.bot) { //use msg.member.roles
    var m = msg.member.roles.find('name', 'modera') || msg.member.roles.find('name', 'admib')
    if (m) { //if moderator or admin
        var inp = msg.content.trim().substr(client.user.toString().length+1);
        var cmd = inp.substr(0,inp.indexOf(' '))
        var ctx = inp.substr(inp.indexOf(' '), inp.length).trim()
        if (inp.length == 0) {
            msg.channel.send(
                "Hey **noob**, here are some **noob** tips for your **noob** face \n"
                + "...@ me with *propose [description]* to put your cringe idea to vote\n"
                + "...You can also @ me with *alert [severity 1-4]* to troll ping mods lol\n"
            )
        }
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
    if (reaction.message.channel.name == "epic-mod-voting" && reaction.message.embeds.length >= 1) {
        if (reaction._emoji.name == "updoge") {
            var upvotes = reaction.count;
            console.log("Proposal '"+reaction.message.embeds[0].description+"' upvoted: " + upvotes)
            if (upvotes >= 5) {
                console.log("Proposal passed")
                reaction.message.react('✅');
                var ch = getChannel(reaction.message.guild.channels,"mod-announcemet-what-wa");
                if (ch !== null) {
                    var old = reaction.message.embeds[0];
                    
                    var embed = new Discord.RichEmbed()
                    embed.setAuthor(old.author.name, old.author.iconURL)
                    embed.setDescription(old.description)
                    embed.setFooter(old.footer.text)
                    embed.setTimestamp(new Date(old.timestamp).toString())
                    embed.setTitle("✅ **PASSED** ✅")
                    ch.send({embed})
                    
                    reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                }
            }
        }
        else if (reaction._emoji.name == "downdoge") {
            var downvotes = reaction.count;
            console.log("Proposal '"+reaction.message.embds[0].description+"' downvoted: " + downvotes)
            if (downvotes >= 5) {
                console.log("Proposal rejected")
                reaction.message.react('❌');
                var ch = getChannel(reaction.message.guild.channels,"mod-announcemet-what-wa");
                if (ch !== null) {
                    var old = reaction.message.embeds[0];
                    var embed = new Discord.RichEmbed()
                    
                    embed.setTitle("❌ **FAILED** ❌")
                    embed.setAuthor(old.author.name, old.author.iconURL)
                    embed.setDescription(old.description)
                    embed.setFooter(old.footer.text)
                    embed.setTimestamp(new Date(old.timestamp).toString())
                    ch.send({embed})
                    
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
                    const embed = new Discord.RichEmbed()
                    
                    embed.setTitle(".:: 𝐏𝐄𝐓𝐈𝐓𝐈𝐎𝐍")
                    embed.setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
                    embed.setDescription(content);
                    embed.setFooter(prop_id)
                    embed.setTimestamp()
                    ch.send({embed});
                    
                    reaction.message.channel.send("By popular request, this petition was sent to the council:\n```" + content + "```")
                    reaction.message.delete().then(msg=>console.log("Succesfully deleted")).catch(console.error);
                }
            }
        }
    }
})

function getChannel(channels, query) {
    return channels.find(function(channel) {
      if (channel.name == query) {
        return channel
      } else return null
    });
}

client.login(process.env.BOT_TOKEN)

var Helper = function() {
    var self = this;
    
    self.func = {}; //for commands, input
    
    //PROPOSE COMMAND, MEDIUM IMPORTANCE
    self.func.propose = function(msg, ctx, cb) {
        var ch = getChannel(msg.guild.channels, "epic-mod-voting");
        if (ch == null) {
            cb("add a channel called #epic-mod-voting bruh", null)
        }
        else {
            console.log(msg.author.toString() + " proposed: " + msg.content)
            var prop_id = Math.random().toString(36).substring(4);
            const embed = new Discord.RichEmbed()
            embed.setTitle(".:: 𝐏𝐑𝐎𝐏𝐎𝐒𝐀𝐋")
            embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
            embed.setDescription(ctx.trim())
            embed.setFooter(prop_id)
            embed.setTimestamp()
            ch.send({embed})
            
            cb(null, msg.author.toString() + "\n *" + prop_id + "*")
        }
    }
    self.func.alert = function(msg, ctx, cb) {
        var ch = getChannel(msg.guild.channels,"mod-announcemet-what-wa");
        switch(ctx) {
            case "1":
                ch.send("@here Calling all moderators.")
                break;
            case "2":
                ch.send("@everyone Important - moderators adjourn.")
                break;
            case "3":
                ch.send("@everyone EMERGENCY - PLEASE COME ONLINE.")
                break;
            case "4":
                ch.send("@everyone OH GOD OH F*CK PLEASE COME BRUH")
                break;
            default:
                ch.send("Bruh moment")
        }
    }
}

var helper = new Helper();
