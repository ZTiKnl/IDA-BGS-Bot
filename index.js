// program keepalive
setInterval(() => {}, 1 << 30);

const name = 'IDA-BGS-Bot';

const db = require('../private/db.inc.js');
let val = db.connect();

const discordkeys = require('../private/BGSkeys.inc.js');
let disctoken = discordkeys.token();

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
  console.log(name + ' connected!');
});




// 5 min timer

	// send daily report
	// check if new file exists in /home/ztik.nl/domains/ida-bgs/public_html/tickprocessor.log with file from today
		// connect to SQL DB, fetch overview



client.on('message', message => {
  if (message.content === '!report') {
    message.channel.send('<daily report>');
  }
  if (message.content === '!system') {
    message.channel.send('<system report>');
  }
  if (message.content === '!objective') {
    message.channel.send('<objectives overview>');
  }
  if (message.content === '!influence') {
    message.channel.send('<influence overview>');
  }
  if (message.content === '!security') {
    message.channel.send('<security report>');
  }
  if (message.content === '!test') {
    const exampleEmbed = new Discord.RichEmbed().setTitle('Test title');
    if (message.author.bot) {
      exampleEmbed.setColor('#7289da');
    }
    message.channel.send(exampleEmbed);
  }
});



client.login(disctoken);
