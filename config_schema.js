//default config

module.exports = function(guild) {
    this.id = guild.id,
    this.name = guild.name,
    
    //reportable channels
    this.reportable = ["general"],
    this.permissible = [], //people who can talk to bot
    
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
    this.upvote = "upvote",
    this.downvote = "downvote",
    this.report = "report",
    
    //channel names
    this.channels = {
        reportlog: "report-log",
        feedback: "feedback",
        modvoting: "mod-voting",
        modannounce: "mod-announcements",
        modactivity: "mod-activity",
    }
}