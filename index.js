const { Client, Intents } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const mineflayer = require('mineflayer');

const ip = "mc.civserver.xyz"; //Server IP
const snitchChannel = ""; //Discord Channel ID for the Snitch Channel (http://img.kayla.moe/Discord_2z7NFHdNJw.png)
const globalChannel = ""; //Same as above
const token = "token"; //Make an application on Discord and copy the bot token (https://canary.discord.com/developers/applications)

//Do not touch these.
const snitchReg = /^(Login|Enter|Logout|Leave)  ([A-Za-z0-9_]{2,16})  (\S*)  \[(-?[0-9]+) (-?[0-9]+) (-?[0-9]+)\]  \[([0-9]+)m ((?:North|South|East|West)(?: North| South| East| West)?)\]/

const globalReg = /\[([\S]+)\] ([\S:]+) (.+)$/

var regExample = "Enter  PlayerName!  SnitchName1234_!  [-213 2 643]  [100m North]";

var regResult = snitchReg.exec(regExample);

var options = {
	host: ip, // minecraft server ip
  username: '', // minecraft username/email
  password: '', // minecraft password, comment out if you want to log into online-mode=false servers
  // port: 25565,                // only set if you need a port that isn't 25565
  //Set below specifically for the latest version on the server. If you set it automatically it may bug out with ViaVersion.
   version: "1.16.5"             // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  // auth: 'mojang'              // only set if you need microsoft auth, then set this to 'microsoft'
}

//Debug check to make sure the regex is working.
console.log(regResult);
console.log('Type: ' + regResult[1] + '\nPlayer: ' + regResult[2] + '\nName: ' + regResult[3] + '\nX: ' + regResult[4] + '\nY: ' + regResult[5] + '\nZ: ' + regResult[6] + '\nDistance: ' + regResult[7] + '\nDirection: ' + regResult[8]);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}.`);
	client.user.setActivity('Snitches', { type: 'WATCHING' });
	client.user.setStatus('idle');
	sendSnitchMessage('**Initializing...**');
});



async function sendSnitchMessage(msg) {
	const channel = client.channels.cache.get(snitchChannel);
	channel.send(msg).catch(console.error, () => {
		console.log('Failed to send a message to snitch channel, lacking permission?')
	});
}

async function sendChatMessage(msg) {
	const channel = client.channels.cache.get(globalChannel);
	channel.send(msg).catch(console.error, () => {
		console.log('Failed to send a message to snitch channel, lacking permission?')
	});
}

client.login(token);

const bot = mineflayer.createBot(options);
bindEvents(bot);

function bindEvents(bot) {
	bot.on('spawn', () => {
	if(bot.player.displayName == undefined) {
		console.log('Failed to retrieve username, combatlogged i think.')
		const loginSmall = new MessageEmbed()
			.setColor('#bd6ce2')
			.setTitle('Logged In')
			.addField('Connected to ' + ip, '')
			.setTimestamp()
			.setFooter('Created by Laika');
		sendSnitchMessage({embeds: [loginSmall]});
		return;
	}
	const username = bot.player.displayName;
	const loginMsg = new MessageEmbed()
			.setColor('#bd6ce2')
			.setTitle('Logged In')
			.addField('Connected to ' + ip, 'With account, ' + bot.player.displayName)
			.setTimestamp()
			.setFooter('Created by Laika');
	sendSnitchMessage({embeds: [loginMsg]});
	});

	bot.on('message', (jsonMsg, position) => {
	var date = new Date();
	if(snitchReg.test(jsonMsg)) {
		var pr = snitchReg.exec(jsonMsg);
		//"`" + now.format(dateFormat) + "` ***" + group + "*** **" + playerName + "**   `" + activity + " " + snitchName + "`   [" + x + ", " + y
        //        + ", " + z + "]";
		sendSnitchMessage('`' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() 
			+ '` **' + pr[2] + '** `' + pr[1] + ' ' + pr[3] + '`  [' + pr[4] + ', ' + pr[5]  + ', ' + pr[6] + ']'
			);
	} else if(globalReg.test(jsonMsg)) {
		var gc = globalReg.exec(jsonMsg);
		if(gc[1] == "!") {
			sendChatMessage('`' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() 
			+ '` GLOBAL: **' + gc[2] + '**: ' + gc[3]);
		}
	}
		console.log(jsonMsg + "\nPosition: " + position);
	});

	bot.on('end', function() {
        console.log("Bot has ended");
        // If set less than 30s you will get an invalid credentials error, which we handle above.
        setTimeout(relog, 30000);  
    });
}

function relog() {
	console.log("Attempting to reconnect...");
    bot = mineflayer.createBot(options);
    bindEvents(bot);
}