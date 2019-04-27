
//sentience parrot reactions

var natural = require('natural');


const Discord = require('discord.js')
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE'],
});
client.on('ready', function()  {
    console.log("ready!")
})

//OKBR server id: 501310750074077215
const general = 528927344690200576
const bots = 528927610630176783
const litterbox = 567140362380902421

var fs = require('fs');

var obj
try {
    obj = JSON.parse(fs.readFileSync('classifier.json', 'utf8'));
}
catch(err) { console.error(err) }

var classifier
if (obj) var classifier = natural.BayesClassifier.restore(obj);
else classifier = new natural.BayesClassifier();

setInterval(function() {
    classifier.train()
    classifier.save('classifier.json', function(err, classifier) {
        if (err) console.error(err)
        console.log("SUCCESFULLY SAVED")
    });
}, 120000)


client.on('message', function(msg) {
    if (!msg.channel || !msg.guild || msg.author.bot) return
    if (msg.channel.id == 528927446507061278 || msg.channel.id == 528927396804689921) return
    
    var m = msg.cleanContent.trim()
    
    if (msg.attachments.size > 0) {
        m += " " + msg.attachments.array()[0].url
    }
    if (!m) return
    
    if (!m.startsWith(":3 ")) return// && Math.random() > 0.00005) return
    m = m.replace(":3 ", "")
    
    try {
        var id = classifier.classify(m)
        var em = msg.guild.emojis.get(id)
        if (em == undefined || em == null) em = id
        console.log("Recalled: "+id)
        
        msg.react(em).catch(console.error) //custom emote
    }
    catch (err) {
        console.error(err)
    }
})


client.on('messageReactionAdd', function(reaction, user) {
    if (reaction.message.deleted || user.bot || !reaction.message.guild) return
    //if (reaction.count <= 1)
    
    var m = reaction.message.cleanContent.trim().toLowerCase()
    if (!m) return
    
    if (reaction.message.attachments.size > 0) {
        m += " " + reaction.message.attachments.array()[0].url
    }
    if (m.startsWith(":3 ")) m = m.replace(":3 ", "")
    
    var em = reaction._emoji.id
    if (em == null) {
        em = reaction._emoji.name
    }
    var match = reaction.message.guild.emojis.get(em)
    if (!isEmoji(em) && (match == null || match == undefined)) {
        console.log("Denied, external nitro emote")
        return
    }
    console.log("Trained: "+em)
    classifier.addDocument(m,em)
})

client.login("NTM1NDk5OTQyOTcwNzg1Nzkz.DyJDDw.OrwwKAdUK2NreEgmuDcYP65iKoI")

function isEmoji(str) {
    var ranges = [
        '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
        '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
        '\ud83d[\ude80-\udeff]' // U+1F680 to U+1F6FF
    ];
    if (str.match(ranges.join('|'))) {
        return true;
    } else {
        return false;
    }
}

//BM id: 551522150369198090

/*INVITE*/
//https://discordapp.com/oauth2/authorize?client_id=535499942970785793&permissions=3072&scope=bot