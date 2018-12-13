
//Enables personal use chat-intercom and performs persistence

var express = require('express')
var app = express();
var http = require('http').Server(app);
var path = require('path')
var io = require('socket.io')(http);
var fs = require('fs');

//BAYES CLASSIFIER
var natural = require('natural');

var messages = [];

app.use(require('body-parser').json());
app.use('/erudite', express.static(path.join(__dirname, 'public')))

app.get('/to', function(req, res) {
  if (messages.length !== 0) console.log(messages)
  res.json(messages);
  messages = []
});

var classifier = new natural.BayesClassifier();

app.post('/from', function(req, res) { //398241776327983104
    if (classifier && req.body.guild == "398241776327983104" && req.body.username !== "Ohtred" && req.body.channel == "general") {
      classifier.addDocument(req.body.username, req.body.content) //user, message
    }
    if (req.body.guildname == "OkBuddyRetard" || req.body.guildname == "/r/BruhMoment") {
      console.log("[" + req.body.guildname + "]"+ req.body.username + ": " + req.body.content)
    }
    io.sockets.emit('latest', req.body);
    res.end()
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    if (classifier && msg.content.startsWith("predict ")) {
      classifier.train();
      var content = msg.content.replace("predict ", "").toLowerCase()
      var res = classifier.classify(content)
      console.log(content + " : " + res)
      
      msg.content = content + " -> '"+res+"'"// is the most likely response to "+content
      messages.push(msg)
    }
    /*else if (classifier && msg.content == "save") {
      classifier.save('classifier.json', function(err, classif) {
          if (err) console.error(err)
          else console.log("Succesfully saved")
      });
    }*/
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