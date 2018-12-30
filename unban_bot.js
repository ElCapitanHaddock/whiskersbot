
const Discord = require('discord.js')
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
});

client.on('ready', async () => {
    console.log("ready to go")
})

client.on('message', function(msg) {
    if (msg.author.id != 230878537257713667) return
    if (!msg.content.startsWith(">ban_revert")) return
    var ctx = msg.content.replace(">ban_revert", "")
    
    
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var time = date.getTime()
    msg.guild.fetchAuditLogs({
        "after":time,
        "user":528841561719701524,
        "type":"MEMBER_BAN_ADD"
    }).then(async logs => {
        var entries = logs.entries.array()
        for (var i = 0; i < Number(ctx); i++) {
            if (entries[i] && entries[i].target && entries[i].executor.id == "511672691028131872") {
                await msg.guild.unban(entries[i].target.id, "Revert unbanned").then(console.log("!!!success!!!\n!!!success!!!\n!!!success!!!\n")).catch(console.error)
            }
        }
    })
    
    /*
    msg.guild.fetchBans().then(list => {
        list = list.array()
        for (var i = 0; i < 5; i++) {
            console.log(list[i])
            if (list[i].lastMessage) {
                msg.reply("<@"+list[i].id+"> last sent at " + list[i].lastMessage.createdAt)
            }
        }
    })
    */
})

client.login("NTI4ODQxNTYxNzE5NzAxNTI0.DwoMzg.gbRPuheMU4pliI_0c31qfvMJitA")