

var natural = require('natural');

var Neuron = function(opts) {
    
    var Convo = function(n) {
        var self = this
        self.ctx = n || []
        var ctx = self.ctx
        self.compare = function(tar) {
            if (tar[tar.length - 1] == ctx[ctx.length - 1] || tar[tar.length - 2] == ctx[ctx.length - 1]) return 0
            let res = 0
            for (var i = 0; i < tar.length; i++) {
                res -= natural.JaroWinklerDistance(tar[i],ctx[i], undefined, true)*(i+1)
            }
            //console.log(ctx[ctx.length-2] + " - " + ctx[ctx.length-1] + " - " + res)
            return res
        }
    }
    
    this.node = new Convo(opts.ctx)
}

const version = 0

var fs = require('fs')
var obj
try {
    obj = JSON.parse(fs.readFileSync(`v${version}.json`, 'utf8'));
}
catch(err) { console.error(err) }

var convos = []
if (obj) {
    for (var i = 0; i < obj.length; i++) {
        train(obj[i].node.ctx)
    }
}

function train(inp) { //train to TALK
    convos.push(new Neuron({ ctx: inp }))
}

function match_reply(ctx) { //finds best reply from closest convo. reply matching TBD
    var other = match_convo(ctx)
    return other.node.ctx[other.node.ctx.length-1]
}

function match_convo(ctx) { //finds closest convo, minimum distance alg
    let mindex = 0
    let min = convos[0].node.compare(ctx)
    var picks = [min]
    for (var i = 0; i < convos.length; i++) {
        let dist = convos[i].node.compare(ctx)
        if (dist < min) {
            picks = []
            picks.push(convos[i])
            min = dist
        }
        else if (dist == min) {
            picks.push(convos[i])
        }
    }
    /*for (var i = 0; i < picks.length; i++) {
        console.log(picks[i].node.ctx)
    }*/
    return picks[Math.floor(Math.random()*picks.length)]
}

var context = ["我", "我", "我", "我", "我", "anyone there?"]
var prefix = "."

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    d = d.toString().trim()
    if (!d) return
    if (d == "debug") {
        console.log("LENGTH: "+convos.length)
        console.log("CURRENT CONTEXT: "+context)
        return
    }
    if (d.startsWith("test,")) {
        var par = d.split(",")
        if (par.length < 2) return
        console.log(natural.JaroWinklerDistance(par[1],par[2],undefined,true))
        return
    }
    if (d == "trim") {
        console.log("Formerly: " + convos.length)
        convos.shift()
        console.log("Now: " + convos.length)
    }
    if (d.startsWith(prefix)) {
        d = d.replace(prefix,"").trim()
        if (!d) return
        
        context.push(d)
        train(context.clone())
        context.shift()
        
        var reply = match_reply(context.clone()).replace(/@/g,"")
        console.log(reply)
        
        context.push(reply)
        context.shift()
        
        //if (convos.length > 2000) convos.shift()
        return
    }
    if (!d) return
    
    context.push(d)
    train(context.clone())
    context.shift()
});

const request = require('request')
/*

const distance = 7
const gen_max = 2000

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
        
        if (dg.length < 4) continue;
        for (var j = 0; j < dg.length-distance; j++) {
            train(dg.map(d => d.text).slice(j,j+distance))
        }
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