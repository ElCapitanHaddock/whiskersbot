

const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./server.js');
Manager.spawn(1); // This example will spawn 2 shards (5,000 guilds);