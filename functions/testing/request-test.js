const puppeteer = require('puppeteer');
var fs = require('fs');
var Discord = require('discord.js');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://google.com').catch(error => console.log(error));
  await page.screenshot({path: 'example.png'});
  const title = await page.title()
  const url = await page.url()
  await browser.close();
  var embed = new Discord.RichEmbed()
            embed.setTitle(title)
            embed.setURL(url)
  await fs.unlink('./example.png', (err) => {
      if (err) throw err;
      console.log('Cached meme was deleted');
    });
    console.log(embed)
})();