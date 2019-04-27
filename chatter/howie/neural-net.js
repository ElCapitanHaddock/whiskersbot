

var natural = require('natural');
var fs = require('fs')

const version = "13"
var brain = {}

function similarity(a,b) {
    return natural.JaroWinklerDistance(a, b, undefined, true)
}

var Neuron = function(text,insert_edges) {
    var self = this
    
    var node = self.node = text
    
    //stores names of forward-connecting nodes, e.g. ["good, you?", "good thanks"]
    var edges = self.edges = insert_edges || []
    
    /*
        ctx - input array, scoring critera
        max - cumulative score, builds down the path
        path - path collection so that when the best score is selected,.
        
        returns - { score, path taken }
    */
    self.mapOptimal = function(ctx,max=0,path=[]) { //cascading path scoring
        path.push(node)
        if (edges.length == 0 || ctx.length == 0) {
            return {max,path}
        }
        
        var scores = []
        for (var i = 0; i < edges.length; i++) {
            var edge = brain[edges[i]]
            var score = brain[edges[i]].mapOptimal(
                ctx.clone().slice(1), //ctx, scoring criteria
                max + self.compareTo(ctx[0]) / Math.pow(ctx.length+1,2), //cumulative score, builds down the path
                path.clone() ) //path collection, tracks path
           // console.log(edges[i] + " : " + console.log(score))
            scores.push(score)
        }
        //finds the VALUE of the max among the paths
        var total_max = Math.max.apply(Math, scores.map(function(o) { return o.max; })) //finds value maximum
        
        //scenarios:
        //max = 0 (no matches) -> selects random anyways
        //max = maxes (multiple matches) -> select randomly from matches
        //max = max (one match) -> the one match is selected
        var res = scores.filter(score => score.max == total_max)
        return res[Math.floor(Math.random() * res.length)]
    }
    
    self.connectTo = function(newEdge, previous) {
        if (newEdge == node) return
        
        if (brain[newEdge] == undefined) train([newEdge]) //creates new node if not found
        
        if (edges.indexOf(newEdge) == -1) edges.push(newEdge)
    }
    
    //cascading
    self.learn = function(newEdges, previous) {
        if (newEdges.length == 0) return
        if (typeof newEdges == "string") {
            self.connectTo(newEdges)
            return
        }
        self.connectTo(newEdges[0],previous)
        brain[newEdges[0]].learn(newEdges.slice(1), node)
    }
    
    self.compareTo = function(input) { //input node
        //console.log(node+" "+similarity(node,input, undefined, true))
        return similarity(node,input, undefined, true)
    }
    
    self.getReply = function(path) { //gets a reply
        return path[path.length-2]
    }
}

var obj
try {
    obj = JSON.parse(fs.readFileSync(`./versions/v${version}.json`, 'utf8'));
}
catch(err) { console.error(err) }

if (obj) {
    obj = Object.keys(obj).map(k => obj[k])
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].node.length == 1) continue
        brain[obj[i].node] = new Neuron(obj[i].node, obj[i].edges)
    }
}
else {
    train(["hi", "hello", "how are you"])
    train(["hello", "how are you", "good", "sweet"])
    train(["hello", "how are you", "i'm bad", "aww sorry"])
    train(["hello", "how are you", "good, you?", "good"])
    train(["hello", "hi", "how are you", "good, you?", "fine"])
    train(["fuck you", "shut up"])
}

setInterval(function() {
    var save = JSON.stringify(brain)
    fs.writeFile(`./versions/v${version}.json`, save, 'utf8', function(err) {
        if (err) console.error(err)
        else console.log("SAVE SUCCESS")
    });
},60000)

function train(ctx) { //train to TALK
    if (ctx.length == 0) return
    if (brain[ctx[0]] == undefined) {  //creates new node if not found
        brain[ctx[0]] = ( new Neuron(ctx[0]) )
    }
    if (ctx.length == 1) return
    brain[ctx[0]].learn(ctx.slice(1))
}

function match_reply(ctx, trainable) {
    if (ctx.length == 0) return
    
  //  if (trainable) {
        if (typeof ctx == "object" && brain[ctx[0]] == undefined) train(ctx[0])
        else if (typeof ctx == "string" && brain[ctx] == undefined) train(ctx)
//    }
    
    //first element in context
    var neuron = brain[ctx[0]]
    
    if (neuron == undefined) neuron = findNeuron(ctx[0])
    
    /*ABOVE^^^ determine optimal accuracy case
        1. finding nearest and starting there
        2. picking random one
        3. trying a start from every single one and determining yet another max from there
    */
    console.log(ctx)
    var match = neuron.mapOptimal(ctx)
    console.log(match)
    
    var stub = false
    var reply = match.path[match.path.length-1]
    
    if (match.path.length == 1) stub = true
    if (ctx[ctx.length-1] == match.path[match.path.length-1] || stub) {
        match.max = 0
    }
    
    if (match.max == 0) reply = random_reply()
    
    
    return { score: match.max, reply, stub}
}

function findNeuron(input) { //finds nearest neuron
    var neurons = Object.keys(brain)
    var n = neurons.reduce(function (prev, current) {
       return (brain[prev].compareTo(input) > brain[current].compareTo(input)) ? prev : current
    });
    return brain[n]
}

function random_reply() {
    var keys = Object.keys(brain)
    return brain[keys[ keys.length * Math.random() << 0]].node;
}

//DISCORD
const prefix = ","

const Discord = require('discord.js')

const client = new Discord.Client({
    autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
    disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE'],
}); 
 
client.on('ready', function() { 
    console.log("ready!") 
}) 
//DISCORD

var channel_ctx = {}
const max_ctx_length = 6
const base_probability = 0.2

var litterboxes = ["501310750074077215", "457776625975689227"] //where he can learn
var blacklist = []

client.on('message', function(msg) {
    if (blacklist.indexOf(msg.author.id) != -1) return
    if (!msg.channel || !msg.guild) return
    var d = msg.cleanContent.toString().replace(/@/g, "")

    if (!d || d.length == 1) return

    if (channel_ctx[msg.channel.id] == undefined) {
        channel_ctx[msg.channel.id] = ["hello"]
    }

    if (d == channel_ctx[msg.channel.id][channel_ctx[msg.channel.id].length - 1] || d.length > 128) return

    if (msg.attachments.size > 0) {
        d += " " + msg.attachments.array()[0].url
    }

    const general = 528927344690200576
    const bots = 528927610630176783
    const litterbox = 567140362380902421
    //whiskers id  52880904103251149
    //OKBR server id: 501310750074077215
    //sentience id: 535499942970785793
    //comedyheaven id: 506983757228671006
    //whiskers disciples id: 457776625975689227
    
    if (!msg.channel) return
    if (msg.channel.name !== "litterbox") return
    if (msg.author.bot && msg.author.id != 528809041032511498) return
    
    if (!d) return

    channel_ctx[msg.channel.id].push(d)
    
    msg.channel.startTyping();
    
    var trainable = false
    if (litterboxes.indexOf(msg.guild.id) !== -1) {
        trainable = true
    }
    
    //if (channel_ctx[msg.channel.id].length > max_ctx_length) channel_ctx[msg.channel.id].shift()
    var search = match_reply(channel_ctx[msg.channel.id].clone(), trainable)
    var reply = search.reply
    var score = search.score
    var stub = search.stub
    //console.log(score)
    
    if (trainable && channel_ctx[msg.channel.id].length > 1) {
        train(channel_ctx[msg.channel.id].clone())
    }
    
    if (Math.random() <= score + base_probability) {//Math.random() <= Math.pow(channel_ctx[msg.channel.id].length,0.5) / Math.pow(max_ctx_length,0.5)) {
        msg.channel.send(reply).catch(console.error)
        channel_ctx[msg.channel.id] = [reply]
    }
    else if (stub && channel_ctx[msg.channel.id].length > 1) {
        channel_ctx[msg.channel.id] = channel_ctx[msg.channel.id].slice(1)
    }

    msg.channel.stopTyping();
})


//https://discordapp.com/oauth2/authorize?client_id=535499942970785793&permissions=3072&scope=bot

client.login("NTM1NDk5OTQyOTcwNzg1Nzkz.DyJDDw.OrwwKAdUK2NreEgmuDcYP65iKoI")





var context = ["hi there"] //context for local testing

const util = require('util')

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    d = d.toString().trim()
    if (!d) return
    if (d == "debug") {
        //console.log(brain)
        console.log("LENGTH: "+Object.keys(brain).length)
        console.log("CURRENT CONTEXT: "+context)
        return
    }
    if (d.startsWith("search,")) {
        var par = d.split(",")
        if (par.length < 2) return
        console.log(brain[par[1]] ? util.inspect(brain[par[1]], false, null, true) : undefined || "not found")
        return
    }
    if (d.startsWith(prefix)) {
        d = d.replace(prefix,"").trim()
        if (!d) return
        
        context.push(d)
        //var save = context.clone()
        //if (context.length > max_ctx_length) context.shift()
        
        var reply = match_reply(context.clone(),true).reply.replace(/@/g,"")
        console.log(reply)
        
        context = [reply]
        //if (context.length > max_ctx_length) context.shift()
        
        return
    }
    if (!d) return
    
    context.push(d)
    train(context.clone())
    //if (context.length > max_ctx_length) context.shift()
});

const request = require('request')
/*
const gen_max = 500

request.get({
    url: "http://convai.io/data/data_tolokers.json"
}, function(err, res, body) {
    if (err) {
        console.error(err)  
        return
    }
    var data = JSON.parse(body)
    var random_in = genRan(data,gen_max,0,data.length);
    for (var i = 0; i < random_in.length; i++) {
        var dg = data[random_in[i]].dialog
        train(dg.map(d => d.text))
    }
})
*/
function genRan(data,n,min,max) {
    const nums = new Set();
    while(nums.size !== n) {
        var num = Math.floor(Math.random() * max) + min
        var score = data[num].eval_score || data[num].evaluation_score
        if (typeof score == "number" && score >= 0) nums.add(num);
        //nums.add(num);
    }
    
   return [...nums];
}


Array.prototype.clone = function(){
  return this.map(e => Array.isArray(e) ? e.clone() : e);
};