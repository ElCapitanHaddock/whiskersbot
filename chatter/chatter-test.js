
/*
var admin = require("firebase-admin")

var serviceAccount = require("./firebase_key.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var firestore = admin.firestore();

const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

var databaseAPI = require("./chatter-db.js")
var API = new databaseAPI(firestore)
*/

/*
Knowledge
    Conversation
        Context
        
    Entities
        Is isn't does doesn't likes dislikes
    

    Context
    Tokens
    
    What Who How
    Is Isn't
    Should Shouldn't
    Would Wouldn't
    Can Can't 
*/



var request = require('request')
var key = "AIzaSyAzRVDxtRfo3EqTEbritKiZ93GLDOV4o0o"
var annotate_url = "https://language.googleapis.com/v1/documents:annotateText?key="+key

function annotate(text) {
    var opts = {
      "document": 
      {
        "content": text,
        "type": "PLAIN_TEXT"
      },
      "features": 
      {
        "classifyText": false,
        "extractDocumentSentiment": false,
        "extractEntities": true,
        "extractEntitySentiment": false,
        "extractSyntax": true
      }
    }
    
    return new Promise(function (resolve, reject) {
        request.post({
            headers: {'Content-Type': 'application/json'},
            url: annotate_url,
            body: JSON.stringify(opts),
        }, function(err, response, body) {
                if (err) reject(err)
                else {
                    var json = JSON.parse(body)
                    resolve(json)
                }
            }
        )
    }); 
}

var _ = require('underscore')

/*
    types of inputs:
        queries
        commands 
        teachings
*/
function analyze(q) {
    return annotate(q).then(function(res) {
        var sentences = res.sentences
        var tokens = res.tokens
        
        /*
        console.log(tokens)
        var test = _.groupBy(tokens, 'dependencyEdge.label')
        console.log(test)
        */
        
        var depends = [] //indexes based on dependency edge (what refers to what)
        tokens.forEach(t => {
            if (!depends.includes(t.dependencyEdge.headTokenIndex)) depends.push(t.dependencyEdge.headTokenIndex)
        })
        
        var nodes = []
        console.log(tokens)
        depends.forEach(n => {
            
            var t_subj = tokens.find(t => 
                t.dependencyEdge.label.toLowerCase() == "NSUBJ"
                && t.dependencyEdge.headTokenIndex == n)
            
            //root verb
            var t_root = tokens.find(t =>
                t.dependencyEdge.label.toLowerCase() == "ROOT"
                && t.dependencyEdge.headTokenIndex == n)
            
            //attribute
            var t_attr = tokens.find(t =>
                t.dependencyEdge.label.toLowerCase() == "ATTR"
                || t.dependencyEdge.label.toLowerCase() == "DOBJ"
                && t.dependencyEdge.headTokenIndex == n)
                
            var subj,root,attr
            if (t_subj && t_root && t_attr) {
                subj = t_subj.lemma
                attr = t_attr.lemma
                root = t_root.lemma
            }
            nodes.push({i: n, subj, root, attr})
        })
        return nodes
    })
}

analyze("Uhtred is creator")


var natural = require('natural');
var tokenizer = new natural.WordTokenizer();

/*
Templates to handle/convert:
    me/I -> user
    you -> bot
    him -> ???
    her -> ???
*/

var Neuron = function(opts) {
    
    var neuron = this
    neuron.id = Math.random().toString(36).substring(7);
    neuron.type = opts.type
    neuron.node = null
    
    var Convo = function(n) {
        var self = this
        self.ctx = n || []
        console.log(self.ctx)
        var ctx = self.ctx
        
        self.compare = function(inp) {
            return natural.LevenshteinDistance(inp,ctx[0], {search: true}).distance
        }
    }
    
    //convert "you" and "I" (first/second person) to interactor username and bot itself
    //passes in n, which represents the first piece of knowledge about the entity
    var Entity = function(n) {
        var self = this
        self.name = n.subj
        self.ctx = {}
        
        self.query = function(root) {
            return self.ctx[root] || "I don't know."
        }
        
        self.learn = function(info) {
            if (!self.ctx[info.root]) {
                self.ctx[info.root] = []
            }
            self.ctx[info.root].push(info.attr)
        }
        
        self.learn(n)
    }
    
    switch(neuron.type) {
        case "convo":
            neuron.node = new Convo(opts.ctx)
            break;
        case "entity":
            neuron.node = new Entity(opts.ctx)
            break;
    }
}



/*
var Sentence = function() {
    this.text
    this.tokens
    this.sentiment
    this.syntax
    this.lemma
}
*/


var convos = [ //placeholder convos structure
    new Neuron({
        type: "convo",
        ctx: [ 
            "hello",
            "hi, how are you",
        ]
    }),
    new Neuron({
        type: "convo",
        ctx: [
            "good",
            "alright then"
        ]
    })
]

var entities = [
]

function train(a, b) { //train to TALK
    convos.push(new Neuron({type: "convo", ctx: [a, b] }))
}

function learn_entity(text) { //learn about entity
    analyze(text).then(function(analysis) {
        var match = entities.find(e => 
            e.name == analysis.subj
        )
        if (!match) {
            //for now, just learns the first sentence
            entities.push(new Neuron({type: "entity", ctx: analysis[0] }))
        }
        else match.learn(analysis[0])
    })
}

function query_entity(text) { //add to existing knowledge about entity
    return analyze(text).then(function(analysis) {
        var match = entities.find(e => 
            e.name == analysis.subj
        )
        return match.query(analysis.root)
    })
}

learn_entity("Uhtred is your creator")

function match_reply(inp) { //finds best reply from closest convo
    var other = match_convo(inp)
    return other.node.ctx[1]
}

function match_convo(ctx) { //finds closest convo
    let mindex = 0
    let min = convos[0].node.compare(ctx)
    for (var i = 0; i < convos.length; i++) {
        
        let dist = convos[i].node.compare(ctx)
        if (dist < min) {
            min = dist
        }
    }
    
    var picks = convos.filter(d => d.node.compare(ctx) == min)
    return picks[Math.floor(Math.random()*picks.length)]
}

const Discord = require('discord.js')

const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE'],
});

client.on('ready', async () => {
    console.log("ready!")
})


var previous = "hello"
var prefix = ","


var prev_author = 0
client.on('message', function(msg) {
    
    var d = msg.cleanContent.toString().trim()
    if (!d) return
    
    if (msg.attachments.size > 0) {
        d += " " + msg.attachments.array()[0].url
    }
    
    //536628108112166921 - sentience 
    //528927344690200576 - general
    if (!msg.channel || (msg.channel.id != 528927344690200576 && msg.channel.id != 536628108112166921) ) return
    if (msg.author.bot) return
    
    if (d.startsWith(prefix) && msg.channel.id == 536628108112166921) {
        d = d.replace(prefix,"")
        //var node = convos[msg.author.id]
        
        var reply = match_reply(d)
        /*while (reply == null) {
            //train(new Convo({ctx: node.ctx}))
            node.forget(1)
            reply = match_reply(node)
        }*/
        msg.channel.send(reply.replace("everyone",""))
    }
    else if (msg.channel.id == 528927344690200576) {
        if (prev_author == msg.author.id) {
            previous +="\n"+d
        }
        else {
            prev_author = msg.author.id
            train(previous, d)
            previous = d
        }
    }
    //process.stdout.write("uhtred: ")
})


//https://discordapp.com/oauth2/authorize?client_id=535499942970785793&permissions=3072&scope=bot

client.login("NTM1NDk5OTQyOTcwNzg1Nzkz.DyJDDw.OrwwKAdUK2NreEgmuDcYP65iKoI")




var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    d = d.toString().trim()
    if (!d) return
    if (d.startsWith(prefix)) {
        d = d.replace(prefix,"")
        var params = d.replace(" ", "")
        //var node = convos[msg.author.id]
        
        var reply = match_reply(d)
        /*while (reply == null) {
            //train(new Convo({ctx: node.ctx}))
            node.forget(1)
            reply = match_reply(node)
        }*/
        console.log(reply)
    }
    else if (d == "debug") {
        console.log(entities)
    }
  });
