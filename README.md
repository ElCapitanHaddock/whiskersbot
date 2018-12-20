   
# CAPT.PICARD/OHTRED
### By Jeremy Yang

#### Ohtred was born out of my experience moderating very active Discord servers.
#### We all know that when the users start arguing, the mods step in.
#### But when the mods starts arguing, who steps in?
#### If you're a mod, you know my pain. And so does Ohtred.
#### With Ohtred, you can prevent this situation from ever happening. 
#### He prevents drama, builds consensus, and gives the mods peace of mind.

## Democracy! ✋
* Propose ideas to the #mod-vote channel with a simple command  
* Upon reaching the upvote threshold it is announced as a "Success"
* Upon reaching the downvote threshold it is announced as a "Failure"
* Suggestions in #feedback (for non-mods) that reach the upvote threshold progress to #mod-vote as "petitions"  
* From my experience, even combative mods will accept a result that is automatically posted
* Due process means everything - hold the mod team accountable
 
## Damage Control 🔥
* Messages with X :report: reactions are automatically deleted and archived in #report-log (with image retention)
* Auto-mute reported users for a customizable number of seconds
* Auto-moderate channels with the Perspective API, along customizable metrics such as NSFW
* Turn on lockdown mode to auto-kick or auto-ban raiders
* Enable autorole, and optionally require new members to input a password 
  
## The Embassy (NEW!) 🌿
* The embassy is a chat channel shared between two servers.
* Once you set up the embassy channel, set its description to the ID of the foreign server
* If both server embassy descriptions are set to the other server's ID...
* ...Then any messages sent on either embassy will be sent to the other one.
* Use it for diplomacy, inter-server events, or even just plain fun!
* It is secure, as the IDs have to be mutually set
  
## Metrics 🔎
* Auto-display the number of online users with a simple 🔺 prefix on a channel or category name  
* Analyze the chance of an announcement to be negatively percieved before sending it 
* Translate messages in dozens of languages from Welsh to Arabic to Yiddish to Tagalog
* Give distinguished users a command to ping mods with a canned alert

## And More 📋
* Generate meme captions for images
* Kick, ban, unban, role, and timed mute commands 
* Custom prefixes!
* A super sexy bot page
* A support server manned by my bro LunarShadows

## Coming soon!
- natural.js machine-learning word censorship
- Auto-generated external IP verification pages for banned users making an appeal
- Auto-translator-to-English in channels where it is enabled


## Commands
```
Anyone

    @Ohtred analyze [metric] [text] to predict if a message follows the metric (15 metrics to choose from)
    
    NEW! @Ohtred translate [language] [text] to translate a message to the specified language
    
    NEW! @Ohtred meme [url] [caption] to auto-scale and generate a fresh meme
    
    NEW! @Ohtred paterico to generate a random anarchist patrick emote
    
    NEW! @Ohtred doge [text] to generate dogeified text
	
Approved Roles

    @Ohtred propose [text] to send a proposal to the modvoting channel
    
    @Ohtred alert [severity 1-4] to alert mods to an altercation (my server bans pinging mods but allows approved users to alert)

Moderators

    @Ohtred mute/unmute/ban/unban/kick/role/warn [user/role]
    
    @Ohtred autorole [role] - sets up an autorole, typically for verification
    
    @Ohtred wash [1-100] - purges the specified number of messages

Admin Only

    NEW! @Ohtred lockdown [0-2] - locks down the server (0: none, 1: autokick, 2: autoban)
    
    NEW! @Ohtred embassy [channel] sets up an embassy webook in a channel

    NEW! @Ohtred motion [threshold] [description] - an admin only command that sends a proposal with a custom vote threshold

    @Ohtred prefix [prefix] self explanatory
   
    @Ohtred channel [modvoting|modannounce|modactivity|feedback|reportlog] [channel] to link one of the features to a channel
    
    @Ohtred emote [upvote|downvote|report] [emote_name] to set the name of the emote to its corresponding mechanic
    
    @Ohtred permit [rolename] to permit a rolename to interact with me
    
    @Ohtred unpermit [rolename] to remove a role from interacting with me
    
    @Ohtred reportable [channel] to add a channel to the list where messages are reportable

    @Ohtred unreportable [channel] to remove a channel from the reportable list

    @Ohtred config [mod_upvote|mod_downvote|petition_upvote|report_vote] [count] to set a voting threshold

    @Ohtred counter [interval 1-50] to set the change in # of users online in order to update the counter
    
    @Ohtred report_time [number 10+] to set the amount of time a user gets muted for a report (default 60s)
```

[![Discord Bots](https://discordbots.org/api/widget/511672691028131872.svg?usernamecolor=FFFFFF&topcolor=000000&datacolor=FFFFFF&middlecolor=000000&highlightcolor=000000&labelcolor=ff9c00)](https://discordbots.org/bot/511672691028131872)

##### Special thanks to [Yandex](http://translate.yandex.com/) and [PerspectiveAPI](https://perspectiveapi.com) for their fantastic APIs 🍻
##### Thanks to the Discord servers of /r/okbuddyretard and /r/bruhmoment for testing and using my bot!
