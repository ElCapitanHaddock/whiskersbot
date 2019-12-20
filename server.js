

process.env.NODE_ENV = 'production'
const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./client.js');
Manager.spawn(2);

