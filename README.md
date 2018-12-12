   
# Ohtred

#### Ohtred was born out of my experience moderating very active Discord servers.
#### We all know that when the users start arguing, the mods step in.
#### But when the mods starts arguing, who steps in?
#### If you're a mod, you know my pain. And so does Ohtred.
#### With Ohtred, you can prevent this situation from ever happening. 
#### He prevents drama, builds consensus, and gives the mods peace of mind.

## NEW FEATURE! The Embassy 🏛
* The embassy can be set to any channel in your server. In it's description set the ID of another server with Ohtred
* If that server also sets up an embassy and puts YOUR ID in their description...
* Then any messages sent on either embassy will be sent to the other one.
* Use it for diplomacy, inter-server events, or even just plain fun

## Democracy!
* Propose ideas to the #mod-vote channel with a simple command  
* Upon reaching X :upvote: it is announced as a "Success" on the mod-announcements page
* Upon reaching X :downvote: it is "rejected" as a "Failure" on the mod-announcements page  
* Suggestions in #feedback (for non-mods) that go up to X upvotes are proposed as "petitions"  
* From my experience, even combative mods will accept a result that is automatically posted
 
## Damage Control
* Messages with X :report: reactions are automatically deleted and archived in #report-log
* Any attachments are externally uploaded to prevent CDN deletion
* The reported message's author is muted for X seconds  
* Auto-moderate channels with the Perspective API, along customizable metrics such as NSFW and personal attacks
  
## Metrics
* Auto-display the number of online users with a simple 🔺 prefix on a channel or category name  
* Analyze the chance of an announcement to be negatively percieved before sending it 
* Translate messages in dozens of languages from Welsh to Arabic to Yiddish to Tagalog
* Give distinguished users a command to ping mods with a canned alert (restrict mod pings to only alerts)  

## And More
* Generate meme captions for images
* Kick, ban, unban, role, and timed mute commands 
* Custom prefixes!
* A super sexy bot page
* A support server manned by my bro LunarShadows

## Coming soon!
- natural.js machine-learning for auto-removing near-match banned words (both spelling-wise and phoenetically)\
- Auto-generated external IP verification pages for banned users making an appeal
- Auto-translator-to-English in channels where it is enabled

## Setup and Commands
```
Anyone

    @Ohtred analyze [metric] [text] to predict if a message follows the metric (15 metrics to choose from)
    
    NEW! @Ohtred translate [language] [text] to translate a message to the specified language
    
    NEW! @Ohtred meme [url] [caption] to auto-scale and generate a fresh meme

Moderators

	@Ohtred mute/unmute/ban/unban/kick/role [user/role]
    
Approved Roles

    @Ohtred propose [text] to send a proposal to the modvoting channel
    
    @Ohtred alert [severity 1-4] to alert mods to an altercation (my server bans pinging mods but allows approved users to alert)

Admin Only

    NEW! @Ohtred motion [threshold] [description] - an admin only command that sends a proposal with a custom vote threshold

    @Ohtred channel [modvoting|modannounce|modactivity|feedback|reportlog] [channel] to link one of the features to a channel
    
    @Ohtred emote [upvote|downvote|report|prefix] [emote_name] to set the name of the emote to its corresponding mechanic
    
    @Ohtred permit [rolename] to permit a rolename to interact with me
    
    @Ohtred unpermit [rolename] to remove a role from interacting with me
    
    @Ohtred reportable [channel] to add a channel to the list where messages are reportable

    @Ohtred unreportable [channel] to remove a channel from the reportable list

    @Ohtred config [mod_upvote|mod_downvote|petition_upvote|report_vote] [count] to set a voting threshold

    @Ohtred counter [interval 1-50] to set the change in # of users online in order to update the counter
    
    @Ohtred report_time [number 10+] to set the amount of time a user gets muted for a report
    
    
If a non-approved, non-admin user pings him, he will reply with a Shakespearean insult. Otherwise, he replies with a help message.
```
##### [Bot Invite Link](https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot)
##### [Support Server](https://discord.gg/53THsF)

##### Special thanks to [Yandex](http://translate.yandex.com/) and [PerspectiveAPI](https://perspectiveapi.com) for their fantastic APIs 🍻
