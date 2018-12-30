   
# whiskers

#### whiskers was born out of my experience moderating very active Discord servers.
#### Initially, she was designed to prevent drama and give the moderators a little peace of mind.
#### But her scope has expanded, thanks to the testing and feedback from her dedicated users.
#### As long as she continues to receive feedback, I will continue to update her.

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
* Auto-moderate channels alongside customizable metrics such as NSFW or toxicity
* The intelligent automod learns through Google's PerspectiveAPI
* Turn on one of two lockdown modes to auto-kick or auto-ban raiders
* Enable autorole, and optionally require newly created accounts to input a verification password (anti-alt)
  
## The Embassy (NEW!) 🌿
* The embassy is a chat channel shared between two servers.
* Once you set up the embassy channel, set its description to the ID of the foreign server
* If both server embassy descriptions are set to the other server's ID...
* ...Then any messages sent on either embassy will be sent to the other one.
* Use it for diplomacy, inter-server events, or even just plain fun!
* It is secure, as the IDs have to be mutually set
  
## Utility 🔎
* Auto-display the number of online users with a simple 🔺 prefix on a channel or category name  
* Analyze the chance of an announcement to be negatively percieved before sending it 
* Translate messages in dozens of languages from Welsh to Arabic to Yiddish to Tagalog
* Give distinguished users a command to ping mods with a canned alert
* Uses Google Cloud Vision to analyze the contents of an image, including grabbing text from images
* Want to find out what that strange image is? With a simple command, do a Google reverse-image search

## And More 📋
* Generate meme captions for images
* Kick, ban, unban, role, and timed mute commands 
* Custom prefixes!
* A super sexy bot page
* A support server manned by my bro LunarShadows

## Coming soon!
- Google Cloud Vision anti-nsfw image filtering
- natural.js machine-learning word censorship
- Auto-generated external IP verification pages for banned users making an appeal
- Auto-translator-to-English in channels where it is enabled


## Commands
```
Anyone

    @whiskers analyze [metric] [text] to predict if a message follows the metric (15 metrics to choose from)
    
    @whiskers translate [language] [text] to translate a message to the specified language
    
    @whiskers meme [url] [caption] to auto-scale and generate a fresh meme
    
    @whiskers doge [text] to generate dogeified text
	
    @whiskers describe [image url] to analyze and label the contents of an image
    
    @whiskers identify [image url] to guess what an image represents (reverse-search)
    
    @whiskers read [image url] grabs text from an image and posts it in a copypastable format
    
Approved Roles

    @whiskers propose [text] to send a proposal to the modvoting channel
    
    @whiskers alert [severity 1-4] to alert mods to an altercation (my server bans pinging mods but allows approved users to alert)

Moderators

    @whiskers mute/unmute/ban/unban/kick/role/warn [user/role]
    
    @whiskers autorole [role] - sets up an autorole, typically for verification
    
    @whiskers wash [1-100] - purges the specified number of messages

Admin Only

    NEW! @whiskers lockdown [0-2] - locks down the server (0: none, 1: autokick, 2: autoban)
    
    NEW! @whiskers embassy [channel] sets up an embassy in a channel that can be connected to another server

    NEW! @whiskers motion [threshold] [description] - an admin only command that sends a proposal with a custom vote threshold

    @whiskers prefix [prefix] self explanatory
   
    @whiskers channel [modvoting|modannounce|modactivity|feedback|reportlog] [channel] to link one of the features to a channel
    
    @whiskers emote [upvote|downvote|report] [emote_name] to set the name of the emote to its corresponding mechanic
    
    @whiskers permit [rolename] to permit a rolename to interact with me
    
    @whiskers unpermit [rolename] to remove a role from interacting with me
    
    @whiskers reportable [channel] to add a channel to the list where messages are reportable

    @whiskers unreportable [channel] to remove a channel from the reportable list

    @whiskers config [mod_upvote|mod_downvote|petition_upvote|report_vote] [count] to set a voting threshold

    @whiskers counter [interval 1-50] to set the change in # of users online in order to update the counter
    
    @whiskers report_time [number 10+] to set the amount of time a user gets muted for a report (default 60s)
```

[![Discord Bots](https://discordbots.org/api/widget/528809041032511498.svg?usernamecolor=FFFFFF&topcolor=000000&datacolor=FFFFFF&middlecolor=000000&highlightcolor=000000&labelcolor=ff9c00)](https://discordbots.org/bot/528809041032511498)

##### Special thanks to [Yandex](http://translate.yandex.com/) and [PerspectiveAPI](https://perspectiveapi.com) for their fantastic APIs 🍻
##### Thanks to the Discord servers of /r/okbuddyretard, /r/bruhmoment, /r/comedyheaven, and /r/bonehurtingjuice for testing and using my bot!
