
//THIS CODE IS UNRELATED TO CAPT. PICARD
//It is purely for personal convenience, moderating when I do not have access to the discord app

var express = require('express')
var app = express();
var http = require('http').Server(app);
var path = require('path')
var io = require('socket.io')(http);
var messages = [];

app.use(require('body-parser').json());
app.use('/mora', express.static(path.join(__dirname, 'public')))

app.get('/to', function(req, res){
  //console.log(messages)
  res.json(messages);
  messages = []
});

app.post('/from', function(req, res){
    console.log("[" + req.body.guildname + "]"+ req.body.username + ": " + req.body.content)
    io.sockets.emit('latest', req.body);
    res.end()
});

io.on('connection', function(socket){
  
  socket.on('chat message', function(msg) {
    //for restrictin bot
    //msg.channel = "general";
    msg.content = msg.content.replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here').replace(/@ok retard/ig, '@ ok retard').replace(/@ok buddy/ig, '@ ok buddy').replace(/@head retard/ig, '@ head retard').replace(/@king buddy/ig, '@ king buddy').replace(/@king retard/ig, '@ king retard').replace(/@prince buddy/ig, '@ prince buddy');
    messages.push(msg)
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});