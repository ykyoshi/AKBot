/**
* akbot.js
*
* Discord bot for various idols-related things.
*
* @author: yky - https://github.com/ykyoshi
* @version: 0.4
*/

// Variables
const fs = require ('fs');				// File system module.
const Discord = require('discord.js');	// discord.js module.
const bot = new Discord.Client();		// Create new Discord bot.
const {prefix, token} = require('./auth.json');

// Collection of commands from 'commands' directory.
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}

// Run this code once bot is ready.
bot.once('ready', () => {
	console.log('yky bot ready.');
});

// Login to Discord with token.
bot.login(token);

// Bot message listener.
bot.on('message', message => {
	// React only on message from users with defined prefix.
	// if (!message.content.startsWith(prefix) || message.author.bot) return; // Bot doesn't listen to self.
	if (!message.content.startsWith(prefix)) return;
	// Arguments are separated by a space.
	const args = message.content.slice(prefix.length).split(/ +/);
	// Take first argument and define it as command.
	const commandName = args.shift().toLowerCase();
	// Return if command is unknown.
	if (!bot.commands.has(commandName)) return;
	// Dynamic command handler.
	const command = bot.commands.get(commandName);
	if (command.args && !args.length){
		return message.channel.send('You didn\'t provide any arguments.');
	}
	try {
		command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('There was an error executing this command.');
	}
})

function randomIntFromInterval(min,max) // min and max included
{
    return Math.floor(Math.random()*(max-min+1)+min);
}