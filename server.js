const Discord = require('discord.js');
const client = new Discord.Client();
 
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on('message', msg => {
  if (msg.content.includes(client.user.toString())) {
    // Send acknowledgement message
    console.log("hello");
    msg.channel.send("Message received from " +
        msg.author.toString() + ": " + msg.content)
  }
});

var bot_secret_token = "NTExNjcyNjkxMDI4MTMxODcy.DsuUfQ.knMgnXhf2FOTWau5wi6yB9n0tVo"

client.login(bot_secret_token)