

var natural = require('natural');
var fs = require('fs')

const version = "0"
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

function train(ctx) { //train to TALK
    if (ctx.length == 0) return
    if (brain[ctx[0]] == undefined) {  //creates new node if not found
        brain[ctx[0]] = ( new Neuron(ctx[0]) )
    }
    if (ctx.length == 1) return
    brain[ctx[0]].learn(ctx.slice(1))
}

function match_reply(ctx) {
    if (ctx.length == 0) return
    
    if (brain[ctx[0]] == undefined) train(ctx[0])
    
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
    
    var reply = match.path[match.path.length-1]
    if (ctx[ctx.length-1] == match.path[match.path.length-1]) match.max = 0
    if (match.max == 0) reply = random_reply()
    
    return { score: match.max, reply }
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

const prefix = ","
const max_ctx_length = 6

var context = ["hello"] //context for local testing

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
    if (d == "save") {
        var obj = Object.keys(brain).map(k => brain[k])
        var res = ""
        for (var i = 0; i < obj.length; i++) {
            for (var j = 0; j < obj[i].edges.length; j++) {
                res += "\""+obj[i].node + "\" -> \"" + obj[i].edges[j] + "\"\n"
            }
        }
        console.log(res)
        
        fs.writeFile(`./graphs/special-graph.txt`, res, function(err) {
            if(err) {
                return console.log(err);
            }
        
            console.log("The file was saved!");
        }); 
        return
    }
        
    context.push(d)
    //var save = context.clone()
    //if (context.length > max_ctx_length) context.shift()
    
    var match = match_reply(context.clone())
    var reply = match.reply.replace(/@/g,"")
    var score = match.score

    train(context.clone())
    
    if (Math.random() <= score+0.15) {
        console.log(reply)
        context = [reply]
    }
});

const request = require('request')

const gen_max = 75

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

function genRan(data,n,min,max) {
    const nums = new Set();
    while(nums.size !== n) {
        var num = Math.floor(Math.random() * max) + min
        var score = data[num].eval_score || data[num].evaluation_score
        if (typeof score == "number" && score >= 3) nums.add(num);
        //nums.add(num);
    }
    
   return [...nums];
}


Array.prototype.clone = function(){
  return this.map(e => Array.isArray(e) ? e.clone() : e);
};