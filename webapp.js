
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
var wordnet = new natural.WordNet();

var messages = [];

app.use(require('body-parser').json());
app.use('/stang', express.static(path.join(__dirname, 'public')))

app.get('/to', function(req, res) {
  if (messages.length !== 0) console.log(messages)
  res.json(messages);
  messages = []
});

app.post('/from', function(req, res) {
    if (req.body.guild == "398241776327983104") {
      classifier.addDocument(req.body.content, req.body.username)
      console.log("[" + req.body.guildname + "]"+ req.body.username + ": " + req.body.content)
    }
    io.sockets.emit('latest', req.body);
    res.end()
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    if (msg.content.startsWith("predict ")) {
      classifier.train();
      var content = msg.content.replace("predict ", "").toLowerCase()
      var res = classifier.classify(content)
      console.log(content + " : " + res)
      
      msg.content = "'"+res+"' is most likely to say "+content
      messages.push(msg)
    }
    if (msg.content.startsWith("define ")) {
      wordnet.lookup(msg.content.replace("define ", ""), function(results) {
          results.forEach(function(result) {
              console.log('------------------------------------');
              console.log(result.synsetOffset);
              console.log(result.pos);
              console.log(result.lemma);
              console.log(result.synonyms);
              console.log(result.pos);
              console.log(result.gloss);
          })
      })
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