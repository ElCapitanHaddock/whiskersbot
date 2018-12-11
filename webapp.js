
//Enables personal use chat-intercom and performs persistence

var express = require('express')
var app = express();
var http = require('http').Server(app);
var path = require('path')
var io = require('socket.io')(http);
var fs = require('fs');

//BAYES CLASSIFIER
var natural = require('natural');
var classifier = new natural.BayesClassifier();

var messages = [];

app.use(require('body-parser').json());
app.use('/stang', express.static(path.join(__dirname, 'public')))

app.get('/to', function(req, res) {
  //console.log(messages)
  res.json(messages);
  messages = []
});

app.post('/from', function(req, res) {
    if (req.body.guildname == "Oklahoma Beagle Rescue") {
      classifier.addDocument(req.body.content, req.body.username)
      console.log("[" + req.body.guildname + "]"+ req.body.username + ": " + req.body.content)
    }
    io.sockets.emit('latest', req.body);
    res.end()
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    if (msg.content.startsWith("test ")) {
      classifier.train();
      var content = msg.content.slice(5).toLowerCase()
      var res = classifier.classify(content)
      console.log(content + " : " + res)
      io.sockets.emit('latest', { guildname:"Brain", channel:"AI", username: content, content: res } )
    }
    else {
      //for restricting bot. sanitization tbd
      msg.content = msg.content.replace(/@everyone/ig, '@ everyone').replace(/@here/ig, '@ here').replace(/@ok retard/ig, '@ ok retard').replace(/@ok buddy/ig, '@ ok buddy').replace(/@head retard/ig, '@ head retard').replace(/@king buddy/ig, '@ king buddy').replace(/@king retard/ig, '@ king retard').replace(/@prince buddy/ig, '@ prince buddy');
      messages.push(msg)
    }
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});