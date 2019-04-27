//sentience parrot

var natural = require('natural');

var Neuron = function(opts) {

    var Convo = function(n) {
        var self = this
        self.ctx = n || []
        console.log(self.ctx)
        var ctx = self.ctx

        self.compare = function(tar) {
            if (tar[tar.length - 1] == ctx[ctx.length - 1] || tar[tar.length - 2] == ctx[ctx.length - 1]) return 0
            let res = 0
            for (var i = 0; i < tar.length; i++) {
                res -= natural.JaroWinklerDistance(tar[i], ctx[i], undefined, true) * (i + 1) //*(Math.pow(i,3))
            }
            return res
        }
    }

    this.node = new Convo(opts.ctx)
}

const version = 6

var fs = require('fs')
var obj
try {
    obj = JSON.parse(fs.readFileSync(`v${version}.json`, 'utf8'));
}
catch (err) { console.error(err) }

var convos = []
if (obj) {
    for (var i = 0; i < obj.length; i++) {
        train(obj[i].node.ctx)
    }
}
else {
    convos = [ //placeholder convos structure
        new Neuron({
            ctx: [
                "hey sexy",
                "sup ;)",
                "howie",
                "hello",
                "i love you",
                "i love you too",
                "💖"
            ]
        }),
        new Neuron({
            ctx: [
                "hi",
                "hello",
                "I love you",
                "I love you too",
                "💖",
                "win!",
                ":)"
            ]
        }),
        new Neuron({
            ctx: [
                "hello",
                "I love you",
                "I love you too",
                "💖",
                "let's have sex",
                "okay!",
                "😳"
            ]
        }),
        new Neuron({
            ctx: [
                "i love you",
                "i love you too",
                "💖",
                "let's have sex",
                "okay!",
                "😳",
                "uhtred"
            ]
        }),
        new Neuron({
            ctx: [
                "i love you too",
                "💖",
                "let's have sex",
                "okay!",
                "😳",
                "uhtred",
                "rape",
            ]
        }),
        new Neuron({
            ctx: [
                "meow",
                "howie",
                "purr",
                "meooow",
                "fuck",
                "fuck you",
                "no you"
            ]
        }),
        new Neuron({
            ctx: [
                "hello",
                "how are you?",
                "good you?",
                "nice",
                "ayup",
                "howie!",
                "howie :)"
            ]
        }),
        new Neuron({
            ctx: [
                "hello",
                "how are you?",
                "good you?",
                "nice",
                "ayup",
                "hello.",
                "howie say hi"
            ]
        })
    ]
}

setInterval(function() {
    var save = JSON.stringify(convos)
    fs.writeFile(`v${version}.json`, save, 'utf8', function(err) {
        if (err) console.error(err)
        else console.log("SAVE SUCCESS")
    });
}, 120000)


function train(inp) { //train to TALK
    convos.push(new Neuron({ ctx: inp }))
}

function match_reply(ctx) { //finds best reply from closest convo. reply matching TBD
    var other = match_convo(ctx)
    return other !== undefined ? other.node.ctx[ctx.length] : "ok"
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
    return picks[Math.floor(Math.random() * picks.length)]
}

const Discord = require('discord.js')

const client = new Discord.Client({
    autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
    disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE'],
});

client.on('ready', function() {
    console.log("ready!")
})


//var context = ["howie", "howie", "howie", "howie", "hello!", "HI"]
var prefix = ","

var guild_ctx = {}
var litterboxes = ["501310750074077215", "457776625975689227"]

client.on('message', function(msg) {
    if (!msg.channel || !msg.guild) return
    var d = msg.cleanContent.toString().trim() //.toLowerCase()

    if (!d) return

    if (guild_ctx[msg.guild.id] == undefined) {
        guild_ctx[msg.guild.id] = ["howie", "howie", "howie", "say hi", "hello!", "HI"]
    }

    if (d == guild_ctx[msg.guild.id][guild_ctx[msg.guild.id].length - 1] || d.length > 128) return

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
    if (msg.channel.name !== "litterbox") return //(msg.channel.id != litterbox) return
    if (msg.author.bot && msg.author.id != 528809041032511498) return

    if (d.startsWith(prefix)) {
        msg.channel.startTyping();
        d = d.replace(prefix, "").trim()
        if (!d) return

        guild_ctx[msg.guild.id].push(d)
        if (litterboxes.indexOf(msg.guild.id) !== -1) train(guild_ctx[msg.guild.id].clone())
        guild_ctx[msg.guild.id].shift()

        var reply = match_reply(guild_ctx[msg.guild.id].clone()).replace(/@/g, "")
        let name = msg.member.displayName || msg.author.username
        msg.channel.send(reply).catch(console.error)

        guild_ctx[msg.guild.id].push(reply)
        guild_ctx[msg.guild.id].shift()

        msg.channel.stopTyping();

        if (convos.length > 5000) convos.shift()
        return
    }
    if (!d) return

    guild_ctx[msg.guild.id].push(d)
    if (litterboxes.indexOf(msg.guild.id) !== -1) train(guild_ctx[msg.guild.id].clone())
    guild_ctx[msg.guild.id].shift()

    if (convos.length > 5000) convos.shift()
    /*
    if (d.startsWith(prefix)) {
        msg.channel.startTyping();
        d = d.replace(prefix, "").trim()
        if (!d) return

        context.push(d)
        train(context.clone())
        context.shift()

        var reply = match_reply(context.clone()).replace(/@/g, "")
        msg.channel.send(reply)

        //var mutation = false
        //if (context.indexOf(reply) == -1) mutation = true
        context.push(reply)
        //if (mutation) train(context.clone())
        context.shift()

        msg.channel.stopTyping();

        if (convos.length > 5000) convos.shift()
        return
    }
    if (!d) return

    context.push(d)
    train(context.clone())
    context.shift()

    if (convos.length > 5000) convos.shift()*/
})


//https://discordapp.com/oauth2/authorize?client_id=535499942970785793&permissions=3072&scope=bot

client.login("NTM1NDk5OTQyOTcwNzg1Nzkz.DyJDDw.OrwwKAdUK2NreEgmuDcYP65iKoI")

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    d = d.toString().trim()
    if (!d) return
    if (d == "debug") {
        console.log("LENGTH: " + convos.length)
        console.log("Version: " + version)
    }
    else if (d.startsWith("search ")) {
        var ctx = d.replace("search ","")
        if (!ctx || ctx.length < 6) return
        let num = 0
        for (var i = 0; i < convos.length; i++) {
            var found = false
            for (var j = 0; j < convos[i].node.ctx.length; j++) {
                if (convos[i].node.ctx[j].includes(ctx)) {
                    found = true
                }
            }
            if (found) num += 1
        }
        console.log(num)
    }
    else if (d.startsWith("purge ")) {
        var ctx = d.replace("purge ","")
        if (!ctx) return
        for(var i = convos.length -1; i >= 0 ; i--){
            var found = false
            for (var j = 0; j < convos[i].node.ctx.length; j++) {
                if (convos[i].node.ctx[j].includes(ctx)) {
                    found = true
                }
            }
            if (found) convos.splice(i,1)
        }
    }
    else if (d.startsWith("snipe ")) {
        var ctx = d.replace("snipe ","")
        if (!ctx) return
        var count = 0
        for(var i = convos.length -1; i >= 0 ; i--){
            if (convos[i].node.ctx.indexOf(ctx) !== -1) {
                convos.splice(i,1)
                count++
            }
        }
    }
});

//<:green_check:520403429479153674>

Array.prototype.clone = function() {
    return this.map(e => Array.isArray(e) ? e.clone() : e);
};
