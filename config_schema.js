//default config

module.exports = function(guild) {
    this.id = guild.id,
    this.name = guild.name,
    this.lastUpdated = new Date().getTime() / 1000;
    
    this.reportable = ["general"],
    this.permissible = [],
    this.thresh = {
        mod_upvote: 6,
        mod_downvote: 6,
        petition_upvote: 6,
        report_vote: 7
    },
    this.upvote = "upvote",
    this.downvote = "downvote",
    this.report = "report",
    this.channels = {
        reportlog: "report-log",
        feedback: "feedback",
        modvoting: "mod-voting",
        modannounce: "mod-announcements",
        modactivity: "mod-activity",
    }
}