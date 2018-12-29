//default config

module.exports = function(guild) {
    this.id = guild.id,
    this.name = guild.name,
    
    //reportable channels
    this.reportable = [],
    this.blacklist = [],
    this.permissible = [], //people who can talk to bot
    this.mutedRole = "",
    this.autorole = "",
    this.password = "",
    this.verification = 0,
    this.verify_age = "",
    this.lockdown = 0,
    
    //voting thresholds
    this.thresh = {
        mod_upvote: 6,
        mod_downvote: 6,
        petition_upvote: 6,
        report_vote: 7
    },
    
    this.counter = 10, //for user count
    this.report_time = "60s", //60 second default mute for report
    
    //emote names
    this.upvote = "👍",
    this.downvote = "👎",
    this.report = "🚫",
    this.prefix = "",
    this.counter = 10,
    
    this.prefix = "",
    
    //channel names
    this.channels = {
        reportlog: "",
        verifylog: "",
        feedback: "",
        modvoting: "",
        modannounce: "",
        modactivity: "",
    }
    this.embassy = {}
}