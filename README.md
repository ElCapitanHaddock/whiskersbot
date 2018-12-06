   
# Ohtred

#### Ohtred was born out of my experience moderating very active Discord servers.
#### We all know that when the users start arguing, the mods step in.
#### But when the mods starts arguing, who steps in?
#### If you're a mod, you know my pain. And so does Ohtred.
#### With Ohtred, you can prevent this situation from ever happening. 
#### He promotes discussion, builds consensus, and gives the mods peace of mind.

### Democracy!
* Propose ideas to the #mod-vote channel with a simple command  
* Upon reaching X :upvote:s it is announced as a "Success" on the mod-announcements page
* Upon reaching X :downvote:s it is "rejected" as a "Failure" on the mod-announcements page  
* Suggestions in #feedback (for non-mods) that go up to X upvotes are proposed as "petitions"  
 
### Damage Control
* Messages with X :report: reactions are automatically deleted and archived in #report-log
* Any attachments are externally uploaded to prevent CDN deletion
* The reported message's author is muted for X seconds  
* Auto-moderate channels with the Perspective API, along customizable metrics such as NSFW and personal attacks
  
### Metrics
* Auto-display the number of online users with a simple 🔺 prefix on a channel or category name  
* Analyze the chance of an announcement to be negatively percieved before sending it 
* Translate messages in dozens of languages from Welsh to Arabic to Yiddish to Tagalog
* Give distinguished users a command to ping mods with a canned alert (restrict mod pings to only alerts)  

### Upcoming Features:
- Auto-generated external IP verification pages for banned users making an appeal
- Auto-translators in channels where it is enabled

### Setup and Commands
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
    
    @Ohtred report_time [number 10+] to set the amount of time a user gets muted for a report

Approved Roles
    @Ohtred propose [text] to send a proposal to the modvoting channel
    
    @Ohtred alert [severity 1-4] to alert mods to an altercation

Anyone
    @Ohtred analyze [text] to predict if a message is hostile
    
    @Ohtred translate [language] [text] to translate a message to the specified language
    
If a non-approved, non-admin user pings him, he will reply with a Shakespearean insult. Otherwise, he replies with a help message.
```
##### [Bot Invite Link](https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot)
##### [Support Server](https://discord.gg/53THsF)

#### Special thanks to [Yandex](http://translate.yandex.com/) and [PerspectiveAPI](https://perspectiveapi.com) for their fantastic APIs
