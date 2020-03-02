// program keepalive
setInterval(() => {}, 1 << 30);

const name = 'IDA-BGS-Bot';
var requesturl = 'https://ida-bgs.ztik.nl/api/output-api.php?apikey=';

const BGSkeys = require('../private/BGSkeys.inc.js');

let disctoken = BGSkeys.token();
let testchannelid = BGSkeys.testchannelid();
let factionchatchannelid = BGSkeys.factionchatchannelid();
let factionmissionschannelid = BGSkeys.factionmissionschannelid();
let privatetestchannelid = BGSkeys.privatetestchannelid();

let apikey = BGSkeys.apikey();
requesturl = requesturl + apikey + '&';

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
  console.log(name + ' connected to Discord!');
  client.user.setActivity('!bgs help', { type: 'LISTENING' });
});

const request = require('request');

var tickid;
var allsystemsupdated;
var sendtickupdatemsg = true;
var dailyreportsent;
var tickupdate = setInterval(function() {
  gettick();
}, 60000);


client.on('message', message => {
  var msg = message.content.split(' ');
  if (msg[0] === '!bgs') {
    if (msg[1] === 'systems') {
      request(requesturl + 'request=systemlist', { json: true }, (err, res, body) => {
        if (err) {
          return console.log(err);
        }

        var embed = '**These are the systems we have a presence in**:\n\n';

        var notuptodatesystems;
        body.forEach(result => {
          var systemname = result['systemname'];
          var amountaddunderscores = (30 - systemname.length);
          var i = 0;
          while (i < amountaddunderscores) {
            systemname = systemname + ' ';
            i++;
          }
          var influence = result['influence'] + '%';
          var amountaddunderscores = (15 - influence.toString().length);
          var i = 0;
          while (i < amountaddunderscores) {
            influence = influence + ' ';
            i++;
          }

          if (result['uptodate'] === false) {
            if (notuptodatesystems != null) {
              notuptodatesystems = notuptodatesystems + systemname + influence + result['updatetime'] + '\n';
            } else {
              notuptodatesystems = systemname + influence + result['updatetime'] + '\n';
            }
          }
        });
        if (notuptodatesystems != null) {
          embed = embed + '`OUT OF DATE systems`\n```Name:                         Influence:     Last update:\n' + notuptodatesystems + '```\n\n';
        }
        var uptodatesystems;
        body.forEach(result => {
          var systemname = result['systemname'];
          var amountaddunderscores = (30 - systemname.length);
          var i = 0;
          while (i < amountaddunderscores) {
            systemname = systemname + ' ';
            i++;
          }
          var influence = result['influence'] + '%';
          var amountaddunderscores = (15 - influence.toString().length);
          var i = 0;
          while (i < amountaddunderscores) {
            influence = influence + ' ';
            i++;
          }

          if (result['uptodate'] === true) {
            if (uptodatesystems != null) {
              uptodatesystems = uptodatesystems + systemname + influence + result['updatetime'] + '\n';
            } else {
              uptodatesystems = systemname + influence + result['updatetime'] + '\n';
            }
          }
        });
        if (uptodatesystems != null) {
          embed = embed + '`Up to date systems`\n```Name:                         Influence:     Last update:\n' + uptodatesystems + '```\n\n';
        }

        message.channel.send(embed);
      });
    }
    if (msg[1] === 'tick') {
      request(requesturl + 'request=tickdata', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        var tickdata = '\n**Tick information**:\n';
        tickdata = tickdata + '```Tick:   ' + body['newtick'] + '\n';
        tickdata = tickdata + 'Tick ID: ' + body['newtickid'] + '```\n';
        message.channel.send(tickdata);
      });
    }
    if (msg[1] === 'tickupdate') {
      if (message.channel.type != 'dm') {
        if(message.member.roles.find(role => role.name === "Council") || message.member.roles.find(role => role.name === "Captain") || message.author.id == '167129642451468288'){
          if (!sendtickupdatemsg) {
            sendtickupdatemsg = true;
            message.channel.send('Tick updates activated');
          } else {
            sendtickupdatemsg = false;
            message.channel.send('Tick updates deactivated');
          }
        } else {
            message.channel.send('You do not have the authority to use this command');
        }
      } else {
            message.channel.send('You can not use this command in a private message');
      }
    }
    if (msg[1] === 'influence') {
      message.channel.send('<influence overview>');
    }
    if (msg[1] === 'security') {
      message.channel.send('<security report>');
    }
    if (msg[1] === 'report') {
//      if (message.author.id == '167129642451468288') {
//        report('embed', message);
//      } else {
        report('reply', message);
//      }
    }
    if (msg[1] === 'objectives') {
      message.channel.send('<objectives overview>');
    }
    if (msg[1] === 'apikey') {
      var userid = message.author['id'];
      var apikey;
      var apikeynew;
      request(requesturl + 'request=apikey&user=' + userid, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        apikey = body['apikey'];
        apikeynew = body['new'];

        if (apikeynew === true) {
          message.author.send('Here is the API key you requested:\n**' + apikey.toString() + '**')
          if (message.channel.type != 'dm') {
            message.channel.send('A new API key has been sent to you in a private message');
          }
        } else {
          message.author.send('You already have an API key:\n**' + apikey.toString() + '**')
          if (message.channel.type != 'dm') {
            message.channel.send('Your API key has been sent to you in a private message');
          }
        }
      });
    }
    if (msg[1] === 'help') {
      var discordembed = new Discord.RichEmbed()
      .setTitle('BGS Bot Help')
      .setColor('#006798')
      .setDescription('IDA-BGS-Bot commands:\n\nCommands need prefix `!bgs` to work.')
      .addField('help', 'Displays this help text\n`!bgs help`', false)
      .addField('apikey', 'Request a new API key, or resend old key (for use in EDMC plugins)\n`!bgs apikey`', false)
      .addField('tick', 'Displays information about the latest tick\n`!bgs tick`', false)
      .addField('tickupdate', 'Enable/Disable #faction-missions message on tick detection\n`!bgs tickupdate`', false)
      .addField('systems', 'Request a new API key, or resend old key\n`!bgs systems`', false)
      .addField('influence', 'Displays stuff about INF%\n`!bgs influence` *(under construction)*', false)
      .addField('security', 'Displays an overview of system security levels\n`!bgs security` *(under construction)*', false)
      .addField('report', 'Displays list of systems with warnings/notices (for example War or INF drop)\n`!bgs report`', false)
      .addField('objectives', 'Displays all objectives and their status\n`!bgs objectives` *(under construction)*', false);
      message.channel.send( { embed: discordembed } );
    }
  }
});

client.login(disctoken);




function report(type, message='') {
  request(requesturl + 'request=report', { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    var reports = body.length;
    var i = 0;
    var reportmessage = '';
    while (i < reports) {
      if (body[i]['type'] == 'overview') {
        if (body[i]['systemuptodatecount'] == body[i]['systemcount'] && body[i]['systemcount'] > 0) {
          reportmessage = reportmessage + '```All systems are up to date: ' + body[i]['systemuptodatecount'] + '/' + body[i]['systemcount']  + '```\n';
        } else if(body[i]['systemuptodatecount'] < 1 && body[i]['systemcount'] > 0) {
          reportmessage = reportmessage + '```ALL SYSTEMS ARE OUT OF DATE: ' + body[i]['systemuptodatecount'] + '/' + body[i]['systemcount']  + '```\n';
        } else {
          reportmessage = reportmessage + '```Up to date systems: ' + body[i]['systemuptodatecount'] + '/' + body[i]['systemcount']  + '\nType !bgs \'systems\' for details' +  '```\n';
        }
      } else {
        var updatetext;
        if (body[i]['uptodate'] === true) {
          updatetext = 'Up to date, '
        } else {
          updatetext = 'OUT OF DATE, '
        }

        if (body[i]['type'] == 'influenceraise' || body[i]['type'] == 'influencedrop') {
          if (body[i]['type'] == 'influenceraise') {
            var incdec = 'increase';
          } else if (body[i]['type'] == 'influencedrop') {
            var incdec = 'decrease';
          } else {
            var incdec = 'stable';
          }

          reportmessage = reportmessage + '```' + body[i]['systemname'] + ' ' + body[i]['amount'] +  '% influence ' + incdec + ' (' + body[i]['total'] + '%)\n' + updatetext + 'last update: ' + body[i]['updatetime']  + '```\n';

        } else {
          var updatetext;
          if (body[i]['uptodate'] === true) {
            updatetext = 'Up to date, '
          } else {
            updatetext = '**OUT OF DATE**, '
          }
          if (body[i]['status'] === '') {
            statustext = 'concluded';
          } else if (body[i]['status'] === 'Active') {
            statustext = 'ongoing';
          } else if (body[i]['status'] === 'Pending') {
            statustext = 'pending';
          }

          reportmessage = reportmessage + '```' + body[i]['systemname'] + ' ' + body[i]['type'] +  ' is ' + statustext + '\n' +
          'Factions: ' + body[i]['conflictfaction1'] + ' vs ' + body[i]['conflictfaction2'] + '\n' +
          'Stakes: ' + body[i]['conflictfaction1stake'] + ' - ' + body[i]['conflictfaction2stake'] + '\n' +
          'Score: ' + body[i]['conflictfaction1score'] + ' - ' + body[i]['conflictfaction2score'] + '\n' +
          updatetext + 'last update: ' + body[i]['updatetime']  + '```\n';
        }
      }
      i++;
    }
    if (type == 'reply') {
      message.channel.send(reportmessage);
    } else {
      client.channels.get(factionmissionschannelid).send( reportmessage );
//      client.channels.get(testchannelid).send( reportmessage );
    }
  });
}

function gettick() {
  request(requesturl + 'request=tickdata', { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    if (!tickid) {
      tickid = body['newtickid'];
      allsystemsupdated = false;
      dailyreportsent = true;
    } else {
      if (tickid != body['newtickid']) {
        dailyreportsent = false;
        tickid = body['newtickid'];
        allsystemsupdated = false;

        if (sendtickupdatemsg == true) {
          var discordembed = new Discord.RichEmbed()
          .setTitle('New tick detected')
          .setColor('#7A2F8F')
          .addField('Time', body['newtick'], false)
          .addField('ID #', body['newtickid'], false);
          client.channels.get(factionmissionschannelid).send( { embed: discordembed } );


          var tickdata = '\n**New tick detected**:\n';
          tickdata = tickdata + '```Tick:   ' + body['newtick'] + '\n';
          tickdata = tickdata + 'Tick ID: ' + body['newtickid'] + '```\n';
          message.channel.send(tickdata);

        }
      }
    }

  });

  if (allsystemsupdated == false && dailyreportsent == false) {
    request(requesturl + 'request=uptodate', { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      if (body['uptodate']) {
        allsystemsupdated = true;
      }
    });
  }


  if (allsystemsupdated == true && dailyreportsent == false) {
    report('timegenerated');
    dailyreportsent = true;
  }
}
