//default config

module.exports = function(guild) {
    this.id = guild.id,
    this.name = guild.name,
    
    //reportable channels
    this.reportable = [],
    this.permissible = [], //people who can talk to bot
    this.mutedRole = ""
    
    //voting thresholds
    this.thresh = {
        mod_upvote: 6,
        mod_downvote: 6,
        petition_upvote: 6,
        report_vote: 7
    },
    
    this.counter = 10, //for user count
    this.report_time = 60, //60 second default mute for report
    
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
        feedback: "",
        modvoting: "",
        modannounce: "",
        modactivity: "",
    }
}