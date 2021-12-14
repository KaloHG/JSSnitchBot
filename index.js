const { Client, Intents } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const mineflayer = require('mineflayer');
const tpsPlug = require('mineflayer-tps')(mineflayer);	

const ip = "mc.civserver.xyz"; //Server IP
const snitchChannel = ""; //Discord Channel ID for the Snitch Channel (http://img.kayla.moe/Discord_2z7NFHdNJw.png)
const globalChannel = ""; //Same as above
const skynetChannel = ""; //Join and leave channel
const token = "token"; //Make an application on Discord and copy the bot token (https://canary.discord.com/developers/applications)

//Do nto touch
const snitchReg = /^(Login|Enter|Logout|Leave)  ([A-Za-z0-9_]{2,16})  (\S*)  \[(\S*\s)?(-?[0-9]+) (-?[0-9]+) (-?[0-9]+)\](?:  \[([0-9]+)m ((?:North|South|East|West)(?: North| South| East| West)?)\])?/

const globalReg = /\[([\S]+)\] ([\S:]+) (.+)$/

var regExample = "Enter  Xdddd3314  Ur_mum_gay  [-213 2 643]  [100m North]";

var regResult = snitchReg.exec(regExample);

var options = {
	host: ip, // minecraft server ip
  username: '', // minecraft username
  password: '', // minecraft password, comment out if you want to log into online-mode=false servers
  // port: 25565,                // only set if you need a port that isn't 25565
   version: "1.16.5"             // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  // auth: 'mojang'              // only set if you need microsoft auth, then set this to 'microsoft'
}

console.log(regResult);
console.log('Type: ' + regResult[1] + '\nPlayer: ' + regResult[2] + '\nName: ' + regResult[3] + '\nX: ' + regResult[5] + '\nY: ' + regResult[6] + '\nZ: ' + regResult[7] + '\nDistance: ' + regResult[8] + '\nDirection: ' + regResult[9]);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}.`);
	client.user.setActivity('Snitches', { type: 'WATCHING' });
	client.user.setStatus('idle');
	sendSnitchMessage('**Initializing...**');
});

function setPlayerCount() {
	const channel = client.channels.cache.get(skynetChannel);
	channel.setTopic('Players logged in ' + Object.keys(bot.players).length);
	setTimeout(setPlayerCount, 600000);
}

function setTPS() {
	const channel = client.channels.cache.get(globalChannel);
	channel.setTopic('Server TPS: ' + bot.getTps());
	setTimeout(setTPS, 600000);
}

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

var bot = mineflayer.createBot(options);
bot.loadPlugin(tpsPlug);
bindEvents(bot);

function sendConnectedMessage() {
	const username = bot.player.displayName;
	const loginMsg = new MessageEmbed()
			.setColor('#bd6ce2')
			.setTitle('Logged In')
			.addField('Connected to ' + ip, 'With account, ' + bot.player.displayName)
			.setTimestamp()
			.setFooter('Created by Laika');
	sendSnitchMessage({embeds: [loginMsg]});
}

function bindEvents(bot) {
	bot.on('spawn', () => {
		setTimeout(sendConnectedMessage, 5000);
		setTimeout(setPlayerCount, 300000);
		setTimeout(setTPS, 300000);
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

	bot.on('playerJoined', (player) => {
		const channel = client.channels.cache.get(skynetChannel);
		channel.send('**' + player.displayName +'** JOINED.').catch(console.error,() => {
			console.log("Cannot send messages to SKYNET channel! Fix please");
			return;
		});
	});

	bot.on('playerLeft', (player) => {
		const channel = client.channels.cache.get(skynetChannel);
		channel.send('**' + player.displayName +'** LEFT.').catch(console.error,() => {
			console.log("Cannot send messages to SKYNET channel! Fix please");
			return;
		});
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
    bot.loadPlugin(tpsPlug);		
    bindEvents(bot);
}
