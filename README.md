   
# Ohtred

##### By Jeremy Yang

###### Ohtred is a Discord bot that promotes democracy in a server, using proposals, user initiatives, and other features that allow moderator teams to quickly mobilize against poor behavior or suggest changes objectively.
### Current features:
- Proposing ideas to the #mod-vote channel
    - Upon reaching X upvotes it is "passed" and moved to the announcements page
    - Upon reaching X downvotes it is "rejected" and also moved
- All channels, emotes, permissible roles, and vote thresholds can be set by an admin
- Alerting moderators based on severity
- Suggestions in #feedback that go up to X upvotes are proposed as "petitions" 
- Messages with X :report: reactions are deleted and archived in #report-log  
- Analyze messages based on their toxicity and hostility (auto-monitoring TBD)
- If you wish to host your own version of Ohtred, here is a good tutorial: https://shiffman.net/a2z/bot-heroku/

### Documentation
```
Admin Only
    @Ohtred channel [modvoting|modannounce|modactivity|feedback|reportlog] [channel_name] to link one of the features to a channel
    
    @Ohtred emote [upvote|downvote|report] [emote_name] to set the name of the emote to its corresponding mechanic
    
    @Ohtred permit [rolename] to permit a rolename to interact with me
    
    @Ohtred unpermit [rolename] to remove a role from interacting with me
    
    @Ohtred reportable [channel name] to add a channel to the list where messages are reportable

    @Ohtred unreportable [channel name] to remove a channel from the reportable list

    @Ohtred config [mod_upvote|mod_downvote|petition_upvote|report_vote] [count] to set a voting threshold

    @Ohtred counter [interval 1-50] to set the change in # of users online in order to update the counter

    @Ohtred alert [severity 1-4] to alert mods to an altercation
    
    @Ohtred report_time [number 10+] to set the amount of time a user gets muted for a report

Approved Roles
    @Ohtred propose [text] to send a proposal to the modvoting channel

Anyone
    @Ohtred analyze [text] to predict if a message is hostile
```
##### [Bot Invite Link](https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot)
##### [Support Server](https://discord.gg/53THsF)
