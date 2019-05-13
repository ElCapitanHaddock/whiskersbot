
//Enables personal use chat-intercom and performs persistence

var express = require('express')
var app = express();
var http = require('http').Server(app);
var path = require('path')
var io = require('socket.io')(http);

const Discord = require('discord.js')
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
});

app.use(require('body-parser').json());
app.use('/confucious', express.static(path.join(__dirname, 'public')))

client.on('message', function(msg) {
  if (!msg.guild) return
  if (msg.guild.name == "Discord Bot List") return
    var content = (msg.attachments.size > 0) ? msg.content + " " + msg.attachments.array()[0].url : msg.content 
    var username = msg.author.username 
    ,channel = msg.channel.name 
    ,guild = msg.guild.id
    ,guildname = msg.guild.name
    
    var body = {
      content: (msg.attachments.size > 0) ? msg.content + " " + msg.attachments.array()[0].url : msg.content, 
      username: msg.author.username, 
      channel: msg.channel.name, 
      guild: msg.guild.id, 
      guildname: msg.guild.name
    }
    
    if (msg.embeds && msg.embeds[0]) {
      var em = msg.embeds[0]
      body.content = `<b>${msg.embeds[0].title}</b> ${msg.embeds[0].description}`.replace(/undefined/g,"")
    }
    
    io.sockets.emit('latest',body)
    console.log("("+guild+")[" + guildname + "]"+ username + ": " + content)
})

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
      msg.content = msg.content.replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here').replace(/@ok retard/ig, '@ ok retard').replace(/@ok buddy/ig, '@ ok buddy').replace(/@head retard/ig, '@ head retard').replace(/@king buddy/ig, '@ king buddy').replace(/@king retard/ig, '@ king retard').replace(/@prince buddy/ig, '@ prince buddy');
      var guild = client.guilds.find(g => g.id == msg.guild)
      if (guild) {
          let channel = getChannelByName(guild.channels, msg.channel)
          if (channel) channel.send(msg.content)                        
      }
  });
});

function getChannelByName(channels, query) { //get channel by name
    return channels.find(function(channel) {
      if (channel.name == query) {
        return channel
      } else return null
    });
}

http.listen(8080, function(){
  console.log('listening on *:8080');
});

var tk = "NTI4ODA5MDQxMDMyNTExNDk4.XMf30g.XJnWRGHSMvS2mWXG_1I18gbU8S8"
client.login(tk)