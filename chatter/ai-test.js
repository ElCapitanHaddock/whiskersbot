


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
        var depends = tokens.filter(t => t.dependencyEdge.label == "ROOT")
        
        var nodes = [] //valid roots that have dependencies
        depends.forEach(d => {
            var n = d.dependencyEdge.headTokenIndex //index
            
            var t_subj = tokens.find(t => 
                t.dependencyEdge.label == "NSUBJ"
                && t.dependencyEdge.headTokenIndex == n)
            
            if (!t_subj) return
            
            var t_subj_index = tokens.findIndex(t => 
                t.dependencyEdge.label == "NSUBJ"
                && t.dependencyEdge.headTokenIndex == n)
            
            //subject possessive
            var t_poss = tokens.find(t =>
                t.dependencyEdge.label == "POSS"
                && t.dependencyEdge.headTokenIndex == t_subj_index)
                
            //subject modifier
            var t_amod = tokens.filter(t => (
                t.dependencyEdge.label == "ADVMOD"
                || t.dependencyEdge.label == "AMOD")
                && t.partOfSpeech.tag == "ADJ"
                && (t.dependencyEdge.headTokenIndex == t_subj_index
                || tokens[t.dependencyEdge.headTokenIndex].dependencyEdge.headTokenIndex == t_subj_index)
            )
            
            //root verb
            var t_root = d
            
            //root prep (e.g. "to" from "going to")
            var t_prep = tokens.find(t => 
                t.dependencyEdge.label == "PREP"
                && t.dependencyEdge.headTokenIndex == n)
            
            //root modifier
            var t_rmod = tokens.filter(t => (
                t.dependencyEdge.label == "ADVMOD"
                || t.dependencyEdge.label == "AMOD"
                //|| t.dependencyEdge.label == "AUX"
                )
                && (t.partOfSpeech.tag == "ADV" || t.partOfSpeech.tag == "VERB")
                && (t.dependencyEdge.headTokenIndex == n
                || tokens[t.dependencyEdge.headTokenIndex].dependencyEdge.headTokenIndex == n)
            )
            
            //attribute
            var t_attr = tokens.find(t => (
                t.dependencyEdge.label == "ATTR"
                || t.dependencyEdge.label == "DOBJ"
                || t.dependencyEdge.label == "ACOMP"
                || t.dependencyEdge.label == "POBJ"
                || t.dependencyEdge.label == "XCOMP")
                && t.dependencyEdge.headTokenIndex == n)
            
            if (!t_attr) return
            
            //attribute modifier
            var t_mod = []
            var t_conj = [] //additional attributes
            if (t_attr) {
                var t_attr_index = tokens.findIndex(t => (
                t.dependencyEdge.label == "ATTR"
                || t.dependencyEdge.label == "DOBJ"
                || t.dependencyEdge.label == "ACOMP"
                || t.dependencyEdge.label == "POBJ" )
                && t.dependencyEdge.headTokenIndex == n)
                
                t_mod = tokens.filter(t => ( //find modifiers for the attribute
                    t.dependencyEdge.label == "ADVMOD"
                    || t.dependencyEdge.label == "AMOD" )
                    && t.partOfSpeech.tag == "ADJ"
                    && (t.dependencyEdge.headTokenIndex == t_attr_index
                    || tokens[t.dependencyEdge.headTokenIndex].dependencyEdge.headTokenIndex == t_attr_index)
                )
                t_conj = tokens.filter(t =>
                    t.dependencyEdge.label == "CONJ"
                    && t.dependencyEdge.headTokenIndex == t_attr_index
                )
            }
            
            //acomp
            var t_acomp = tokens.find(t =>
                t.dependencyEdge.label == "ACOMP"
                && t.dependencyEdge.headTokenIndex == n)
            
            //negative 
            var t_neg = tokens.find(t =>
                t.dependencyEdge.label == "NEG"
                && t.dependencyEdge.headTokenIndex == n)
                
            var subj,root,attr,poss
            
            if (t_subj && t_attr) {
                
                subj = t_subj.lemma
                attr = t_attr.lemma
                
                if (t_subj.partOfSpeech.person == "FIRST") {
                    subj = context.username
                }
                else if (t_subj.partOfSpeech.person == "SECOND") {
                    subj = botname
                }
                else if (t_subj.partOfSpeech.person == "THIRD" && t_acomp) {
                    subj = t_attr.lemma
                    attr = t_subj.lemma
                }
                if (t_attr.partOfSpeech.person == "FIRST") {
                    attr = context.username
                }
                else if (t_attr.partOfSpeech.person == "SECOND") {
                    attr = botname
                }
                
                if (t_amod) {
                    t_amod.reverse().forEach(t => subj = t.lemma + " " + subj)
                }
                
                root = (t_neg) ? 
                    t_neg.lemma +" "+ t_root.lemma 
                    : t_root.lemma
                if (t_prep) root += " " + t_prep.lemma
                
                if (t_root.partOfSpeech.tense != "TENSE_UNKNOWN") {
                    root = "in " + t_root.partOfSpeech.tense + " " + root
                }

                if (t_mod) {
                    t_mod.reverse().forEach(t => attr = t.lemma + " " + attr)
                }
                if (t_rmod) {
                    t_rmod.reverse().forEach(t => root = t.lemma + " " + root)
                }
                
                if (t_poss) {
                    root = subj +" "+ root
                    if (t_poss.partOfSpeech.person == "FIRST") {
                        subj = context.username
                    }
                    else if (t_poss.partOfSpeech.person == "SECOND") {
                        subj = botname
                    }
                    else subj = t_poss.lemma
                }
                subj = subj.toLowerCase()
                root = root.toLowerCase()
                attr = attr.toLowerCase()
                
                nodes.push({subj, root, attr})
                
                if (t_conj) {
                    t_conj.forEach(t => nodes.push({subj, root, attr: t_conj.lemma}))
                }
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
            var res = []
            for (var prop in self.ctx) {
                console.log(prop + ", " + root)
                if (prop.includes(root)) {
                    res.push(`${self.name} ${prop} ${self.ctx[prop]}`)
                }
            }
            return res || "I don't know that about "+self.name
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

function learn_entity(text, username) { //learn about entity
    return analyze(text, {username}).then(function(multi_analysis) {
        if (!multi_analysis) return "I don't get it."
        
        multi_analysis.forEach(analysis => {
            var match = entities.find(e => 
                e.node.name == analysis.subj
            )
            if (!match) {
                //for now, just learns the first sentence
                entities.push(new Neuron({type: "entity", ctx: analysis }))
            }
            else match.node.learn(analysis)
        })
        return 200
    })
}

function query_entity(text) { //add to existing knowledge about entity
    return analyze(text, {username}).then(function(multi_analysis) {
        if (!multi_analysis) return "I don't get it."
        
        var res = ""
        multi_analysis.forEach(analysis => {
            var match = entities.find(e => 
                e.node.name == analysis.subj
            )
            if (!match) res += "I don't know anything about " + analysis.subj + ". "
            else res += match.node.query(analysis.root) + "\n"
        })
        return res
    })
}




learn_entity("Uhtred is creator")

learn_entity("Uhtred is dad")

learn_entity("You are a bot")

learn_entity("Your name is swagcat.")

learn_entity("you love memes")




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
var username = "Uhtred"
var botname = "swagcat"


var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    d = d.toString().trim()
    if (!d) return
    if (d.startsWith(prefix)) {
        d = d.replace(prefix,"")
        var params = d.split(" ")
        params = [params[0], params.slice(1).join(" ")]
        //var node = convos[msg.author.id]
        
        if (params[0] == "teach") {
            learn_entity(params[1], username).then(function(reply) {
                if (reply == 200) return
                else console.log("swagcat: "+reply)
            })
        }
        else if (params[0] == "debug") {
            console.log(entities)
        }
    }
    else {
        query_entity(d, username).then(function(reply) {
            console.log(reply.toString())
        })
    }
  });


/*
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
*/


//https://discordapp.com/oauth2/authorize?client_id=535499942970785793&permissions=3072&scope=bot
//client.login("NTM1NDk5OTQyOTcwNzg1Nzkz.DyJDDw.OrwwKAdUK2NreEgmuDcYP65iKoI")
