
var express = require('express')
var app = express();
var http = require('http').Server(app);
var path = require('path')
var io = require('socket.io')(http);
var messages = [];

app.use('/chat', express.static(path.join(__dirname, 'public')))

app.get('/to', function(req, res){
  res.send(JSON.stringify(messages));
  messages = []
});

app.post('/from', function(req, res){
    io.sockets.emit('latest', JSON.parse(req.body).mess);
    res.end()
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    messages.push(msg)
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});