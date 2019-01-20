


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

/*
    types of inputs:
        queries
        commands 
        teachings
*/
function analyze(q, context) { //query, context (username, server, etc)
    q = q.replace(/^\w/, c => c.toUpperCase());
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
        
        var nodes = [] //for addition, adding info
        depends.forEach(n => {
            
            var t_subj = tokens.find(t => 
                t.dependencyEdge.label == "NSUBJ"
                && t.dependencyEdge.headTokenIndex == n)
            
            //root verb
            var t_root = tokens.find(t =>
                t.dependencyEdge.label == "ROOT"
                && t.dependencyEdge.headTokenIndex == n)
            
            //attribute
            var t_attr = tokens.find(t =>
                t.dependencyEdge.label == "ATTR"
                || t.dependencyEdge.label == "DOBJ"
                || t.dependencyEdge.label == "AUX"
                || t.dependencyEdge.label == "ACOMP"
                && t.dependencyEdge.headTokenIndex == n)
                
            //acomp
            var t_acomp = tokens.find(t =>
                t.dependencyEdge.label == "ACOMP"
                && t.dependencyEdge.headTokenIndex == n)
                
            //negative 
            var t_neg = tokens.find(t =>
                t.dependencyEdge.label == "NEG"
                && t.dependencyEdge.headTokenIndex == n)
                
            //possessive
            var t_poss = tokens.find(t =>
                t.dependencyEdge.label == "POSS")
                
            var subj,root,attr,poss
            if (t_subj && t_root && t_attr) {
                
                subj = t_subj.lemma.toLowerCase()
                if (t_subj.person == "first") {
                    t_subj = context.username
                }
                else if (t_subj.person == "third" && t_acomp) {
                    t_subj = t_attr.lemma
                    t_attr = t_subj.lemma
                }
                attr = t_attr.lemma.toLowerCase()
                root = (t_neg) ? 
                    t_neg.lemma.toLowerCase() +" "+ t_root.lemma.toLowerCase() 
                    : t_root.lemma.toLowerCase()
                if (t_poss) {
                    root = subj +" "+ root
                    subj = t_poss.lemma
                }
                nodes.push({subj, root, attr})
            }
        })
        return nodes
    })
}


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

var entities = [
]

function learn_entity(text) { //learn about entity
    return analyze(text, {username: "Uhtred"}).then(function(analysis) {
        if (!analysis[0]) return "I don't get it."
        var match = entities.find(e => 
            e.node.name == analysis[0].subj
        )
        if (!match) {
            //for now, just learns the first sentence
            entities.push(new Neuron({type: "entity", ctx: analysis[0] }))
        }
        else match.node.learn(analysis[0])
        return 200
    })
}

function query_entity(text) { //add to existing knowledge about entity
    return analyze(text).then(function(analysis) {
        if (!analysis || analysis.length == 0) return "Ok"
        var match = entities.find(e => 
            e.node.name == analysis[0].subj
        )
        if (!match) return "I dunno."
        return match.node.query(analysis[0].root)
    })
}


var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    d = d.toString().trim()
    if (d == "debug") {
        console.log(entities)
        return
    }
    query_entity(d).then(function(res) {
        console.log(res)
    })
  });




learn_entity("Uhtred is creator")

learn_entity("Uhtred is dad")

learn_entity("You are bot")

learn_entity("You are cute cat")

learn_entity("you love memes")

learn_entity("your name is Nelly")





const Discord = require('discord.js')

const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE'],
});

client.on('ready', async () => {
    console.log("ready!")
})


var previous = "hello"
var prefix = "!"


var prev_author = 0
client.on('message', function(msg) {
    
    var d = msg.cleanContent.toString().trim()
    if (!d) return
    
    if (msg.attachments.size > 0) {
        d += " " + msg.attachments.array()[0].url
    }
    
    //536628108112166921 - sentience 
    //528927344690200576 - general
    if (!msg.channel) return
    if (msg.author.bot) return
    
    if (d.startsWith(prefix)) {
        d = d.replace(prefix,"")
        var params = d.split(" ")
        params = [params[0], params.slice(1).join(" ")]
        //var node = convos[msg.author.id]
        
        if (params[0] == "teach") {
            learn_entity(params[1]).then(function(reply) {
                if (reply == 200) return
                else msg.channel.send(reply)
            })
        }
        else if (params[0] == "ask") {
            query_entity(params[1]).then(function(reply) {
                msg.channel.send(reply.toString().replace("everyone",""))
            })
        }
    }
    
    //process.stdout.write("uhtred: ")
})


//https://discordapp.com/oauth2/authorize?client_id=535499942970785793&permissions=3072&scope=bot

client.login("NTM1NDk5OTQyOTcwNzg1Nzkz.DyJDDw.OrwwKAdUK2NreEgmuDcYP65iKoI")
