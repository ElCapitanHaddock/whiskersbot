const puppeteer = require('puppeteer');
var fs = require('fs');
var countries = require('i18n-iso-countries')
var Discord = require('discord.js');


function geo(ctx) { 
    if (!ctx || !ctx.trim()) return
    var params = ctx.trim().split(" ")
    var geo
    var query
    if (params[0] != "world" && !countries.isValid(params[0])) {
        console.log("Invalid country code! Use 'world' for all countries.\nhttps://datahub.io/core/country-list/r/0.html")
        return;
    }
    else {
        geo = params[0]
        query = params.slice(1).join(" ")
    }
    if (!query) {
        console.log("No query provided!")
        return
    }

    var loc
    if (geo.toLowerCase() == "world") loc = ""
    else loc = "&geo="+geo.toUpperCase()
    query = encodeURIComponent(query.trim());
    
    var random = Math.random().toString(36).substring(4);
    (async () => {
        const browser = await puppeteer.launch({'args' : [
                '--no-sandbox',
                '--disable-setuid-sandbox'
        ]});
        const page = await browser.newPage();
        
        await page.goto(`http://trends.google.com/trends/explore?date=all&q=${query}${loc}`, {
            waitUntil: 'networkidle2',
            
        }).catch(console.error);
        
        await page.setViewport({ width: 1200, height: 1000 })
            
        async function screenshotDOMElement(opts = {}) {
            const padding = 'padding' in opts ? opts.padding : 0;
            const path = 'path' in opts ? opts.path : null;
            const selector = opts.selector;
    
            if (!selector)
                throw Error('Please provide a selector.');
                
            const rect = await page.evaluate(selector => {
                const element = document.querySelector(selector);
                if (!element)
                    return null;
                const {x, y, width, height} = element.getBoundingClientRect();
                return {left: x, top: y, width, height, id: element.id};
            }, selector);
    
            if (!rect)
                throw Error(`Could not find element that matches selector: ${selector}.`);
    
            return await page.screenshot({
                path,
                clip: {
                    x: rect.left - padding,
                    y: rect.top - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2
                }
            });
        }
        
        await page.evaluate(() => {
            var headers = document.querySelectorAll(".fe-atoms-generic-title")//.fe-atoms-generic-header-container")
            for (var i = 0; i < headers.length; i++) {
                headers[i].parentNode.removeChild(headers[i])
            }
            var icons = document.querySelectorAll(".widget-actions-item-flatten")
            for (var i = 0; i < icons.length; i++) {
                icons[i].parentNode.removeChild(icons[i])
            }
            
            var vol = document.querySelectorAll(".fe-low-search-volume")
            for (var i = 0; i < vol.length; i++) {
                vol[i].parentNode.removeChild(vol[i])
            }
         }).catch(console.error);
         
        await screenshotDOMElement({
            path: `${random}.png`,
            selector: '.fe-geo-chart-generated.fe-atoms-generic-container',//'.widget-container-wrapper',
            padding:0
        }).catch(console.error)
        
        await browser.close();
        const embed = await new Discord.RichEmbed()
        if (geo.toLowerCase() == "world") {
            await embed.setTitle(`World - "${query}"`)
        }
        else {
            await embed.setTitle(`${countries.getName(geo.toUpperCase(), "en")} - "${query}"`)
        }
        await embed.setImage('attachment://screenshot.png')
        
        console.log(embed)
    })();
}

function scan(ctx) {
    (async () => {
        const browser = await puppeteer.launch({'args' : [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]});
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 })
        await page.goto(ctx).catch(err => {
            if (err) console.error("404: URL not found!")
        }, {waitUntil: 'networkidle2'})
        await page.screenshot({path: `screenshot.png`, fullPage: true}).catch(console.error);
        const title = await page.title()
        const url = await page.url()
        await browser.close();
    })();
}

scan("https://www.reddit.com/r/AbusiveMods/comments/9criuy/official_list_of_bad_mods/")

//geo("us hello")

