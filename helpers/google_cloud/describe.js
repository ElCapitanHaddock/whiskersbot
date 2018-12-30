const Discord = require('discord.js')
const request = require('request')

//DESCRIBE

module.exports =  (msg, ctx, config, cloudinary, cb) => {
    if (msg.attachments.size > 0) {
        ctx = msg.attachments.array()[0].url
    }
    else if (msg.mentions && msg.mentions.users) {
        var users = msg.mentions.users.array()
        var user
        for (var i = 0; i < users.length; i++) {
            if (!users[i].bot/* !== client.user.id*/) user = users[i]
        }
        if (user) ctx = user.avatarURL
    }
    if (!ctx) {
        cb(msg.author.toString() + " Please include an image url!")
        return
    }
    var rand = Math.random().toString(36).substring(4)
    cloudinary.uploader.upload(ctx, //upload the image to cloudinary 
        function(result) { 
            if (result.error) {
                cb("No image found at that url!")
                return
            }
            var opts = {
                "requests": [{
                   "image": {
                    "source": {
                     "imageUri": result.secure_url
                    }
                   },
                   "features": [
                        {
                         "type": "LABEL_DETECTION"
                        }
                    ]
                }]
            }
            request.post({
                headers: {'Content-Type': 'application/json'},
                url: "https://vision.googleapis.com/v1/images:annotate?key="+process.env.FIREBASE_KEY2,
                body: JSON.stringify(opts)
            }, function(err, response, body) {
                if (err) {
                    cb(msg.author.toString() + " Invalid image url!")
                    return
                }
                var embed = new Discord.RichEmbed()
                embed.setTitle("Describe")
                embed.setThumbnail(ctx)
                
                var labels = JSON.parse(body).responses[0].labelAnnotations
                
                if (!labels) {
                    cb(msg.author.toString() + " I couldn't recognize anything from that!")
                    return
                }
                
                var desc = ""
                for (var i = 0; i < labels.length; i++) {
                    desc += Math.round(labels[i].score * 100) + "% **" + labels[i].description + "**\n"
                }
                embed.setDescription(desc)
                msg.channel.send(embed).then().catch(function(error){console.error(error)})
                cloudinary.uploader.destroy(rand, function(result) {  });
            });
      },
      {public_id: rand}
    )
}