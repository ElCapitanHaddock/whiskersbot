
const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./client.js');
Manager.spawn(1);

