// program keepalive
setInterval(() => {}, 1 << 30);

const name = 'IDA-BGS-Bot';
var requesturl = 'https://ida-bgs.ztik.nl/api/output-api.php?apikey=';

const BGSkeys = require('../private/BGSkeys.inc.js');

let disctoken = BGSkeys.token();
let testchannelid = BGSkeys.testchannelid();
let factionchatchannelid = BGSkeys.factionchatchannelid();
let factiontickbgschannelid = BGSkeys.factiontickbgschannelid();
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

          var updatehumanreadable = humanreadabletime(result['updatetime']);
          if (result['uptodate'] === false) {
            if (notuptodatesystems != null) {
              notuptodatesystems = notuptodatesystems + systemname + influence + updatehumanreadable + '\n';
            } else {
              notuptodatesystems = systemname + influence + updatehumanreadable + '\n';
            }
          }
        });
        if (notuptodatesystems != null) {
          embed = embed + '```diff\n-OUT OF DATE systems``````Name:                         Influence:     Last update:\n' + notuptodatesystems + '```\n\n';
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

          var updatehumanreadable = humanreadabletime(result['updatetime']);
          if (result['uptodate'] === true) {
            if (uptodatesystems != null) {
              uptodatesystems = uptodatesystems + systemname + influence + updatehumanreadable + '\n';
            } else {
              uptodatesystems = systemname + influence + updatehumanreadable + '\n';
            }
          }
        });
        if (uptodatesystems != null) {
          embed = embed + '```ml\n"Up to date systems"``````Name:                         Influence:     Last update:\n' + uptodatesystems + '```\n\n';
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
            message.channel.send('```md\n#Tick updates activated```');
          } else {
            sendtickupdatemsg = false;
            message.channel.send('```md\n#Tick updates deactivated```');
          }
        } else {
            message.channel.send('```diff\n-You do not have the authority to use this command```');
        }
      } else {
            message.channel.send('```diff\n-You can not use this command in a private message```');
      }
    }
    if (msg[1] === 'influence') {
      var requesturl2 = requesturl + 'request=influence';
      request(requesturl2, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }

        var influencecount = body.length;
        var influencecounter = 0;
        var influencemessage = '';
        if (influencecount < 1) {
          influencemessage = '```No data```';
        } else {

          influencemessage = influencemessage + '**IDA INF earnings**';

          if (influencecount > 0) {
            influencemessage = influencemessage + '```System                         Faction:                                 INF Rewards:              Trend:\n';
          } else {
            influencemessage = influencemessage + '```No data';
          }
          while (influencecounter < influencecount) {
            var timestamp  = body[influencecounter]['timestamp'];
            var systemname = body[influencecounter]['systemname'];
            var amountaddunderscores = (30 - systemname.length);
            var i = 0;
            while (i < amountaddunderscores) {
              systemname = systemname + ' ';
              i++;
            }

            var factionname = body[influencecounter]['factionname'];
            var amountaddunderscores = (40 - factionname.length);
            var i = 0;
            while (i < amountaddunderscores) {
              factionname = factionname + ' ';
              i++;
            }

            var influence = body[influencecounter]['influence'] + '+';
            var amountaddunderscores = (25 - influence.toString().length);
            var i = 0;
            while (i < amountaddunderscores) {
              influence = influence + ' ';
              i++;
            }
            var direction = body[influencecounter]['direction'];
            influencemessage = influencemessage + systemname + ' ' + factionname + ' ' + influence + ' ' + direction + '\n';
            influencecounter++;
          }
          influencemessage = influencemessage + '```';
          message.channel.send( influencemessage );
        }
      });
    }
    if (msg[1] === 'myinfluence') {
      var userid = message.author['id'];
      var requesturl2 = requesturl + 'request=myinfluence&userid=' + userid;

      request(requesturl2, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }

        var influencecount = body.length;
        var influencecounter = 0;
        var influencemessage = '';
        if (influencecount < 1) {
          influencemessage = '```No data```';
        } else {

          influencemessage = influencemessage + '**Personal INF earnings**';

          if (influencecount > 0) {
            influencemessage = influencemessage + '```System                         Faction:                                 INF Rewards:\n';
          } else {
            influencemessage = influencemessage + '```No data';
          }
          while (influencecounter < influencecount) {
            var timestamp  = body[influencecounter]['timestamp'];
            var systemname = body[influencecounter]['systemname'];
            var amountaddunderscores = (30 - systemname.length);
            var i = 0;
            while (i < amountaddunderscores) {
              systemname = systemname + ' ';
              i++;
            }

            var factionname = body[influencecounter]['factionname'];
            var amountaddunderscores = (40 - factionname.length);
            var i = 0;
            while (i < amountaddunderscores) {
              factionname = factionname + ' ';
              i++;
            }

            var influence = body[influencecounter]['influence'] + '+';
            var amountaddunderscores = (25 - influence.toString().length);
            var i = 0;
            while (i < amountaddunderscores) {
              influence = influence + ' ';
              i++;
            }
            var direction = '';
            influencemessage = influencemessage + systemname + ' ' + factionname + ' ' + influence + direction + '\n';
            influencecounter++;
          }
          influencemessage = influencemessage + '```';

          message.channel.send( 'Check your PMs' );

          message.author.send( influencemessage );
        }
      });
    }
    if (msg[1] === 'security') {
      message.channel.send('<security report>');
    }
    if (msg[1] === 'report') {
      report('reply', message);
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
            message.channel.send('```md\n#A new API key has been sent to you in a private message```');
          }
        } else {
          message.author.send('You already have an API key:\n**' + apikey.toString() + '**')
          if (message.channel.type != 'dm') {
            message.channel.send('```md\n#Your API key has been sent to you in a private message```');
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
      .addField('tickupdate', 'Enable/Disable #faction-tick-bgs message on tick detection\n`!bgs tickupdate`', false)
      .addField('systems', 'Request a new API key, or resend old key\n`!bgs systems`', false)
      .addField('influence', 'Displays a list of IDA INF rewards from missions\n`!bgs influence`', false)
      .addField('myinfluence', 'Displays a list of personal INF rewards from missions\n`!bgs myinfluence`', false)
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
      if (body[i]['reporttype'] == 'overview') {
        if (body[i]['systemuptodatecount'] == body[i]['systemcount'] && body[i]['systemcount'] > 0) {
          reportmessage = reportmessage + '```ml\n"All systems are up to date: ' + body[i]['systemuptodatecount'] + '/' + body[i]['systemcount']  + '"```\n';
        } else if(body[i]['systemuptodatecount'] < 1 && body[i]['systemcount'] > 0) {
          reportmessage = reportmessage + '```diff\n-ALL SYSTEMS ARE OUT OF DATE: ' + body[i]['systemuptodatecount'] + '/' + body[i]['systemcount']  + '```\n';
        } else {
          reportmessage = reportmessage + '```md\n#Up to date systems: ' + body[i]['systemuptodatecount'] + '/' + body[i]['systemcount']  + '\nType !bgs \'systems\' for details' +  '```\n';
        }
      } else if (body[i]['reporttype'] == 'expansion') {
        if (body[i]['status'] == 'Active') {
          reportmessage = reportmessage + '```ml\n"We are experiencing Expansion"```\n';
        }
        if (body[i]['status'] == 'Pending') {
          reportmessage = reportmessage + '```ml\n"We are pending Expansion (trend: ' + body[i]['direction'] + ')"```\n';
        }
        if (body[i]['status'] == 'Recovering') {
          reportmessage = reportmessage + '```ml\n"We are recovering from Expansion (trend: ' + body[i]['direction']  + ')"```\n';
        }
      } else if (body[i]['reporttype'] == 'influence') {
        var updatetext;
        if (body[i]['uptodate'] === true) {
          updatetext = 'Up to date, '
        } else {
          updatetext = 'OUT OF DATE, '
        }
        var updatehumanreadable = humanreadabletime(body[i]['updatetime']);
        if (body[i]['type'] == 'influenceraise') {
          var incdec = 'increase';
        } else if (body[i]['type'] == 'influencedrop') {
          var incdec = 'decrease';
        } else {
          var incdec = 'stable';
        }
        if (body[i]['type'] == 'influencedrop') {
          reportmessage = reportmessage + '```diff\n-' + body[i]['systemname'] + ' ' + body[i]['amount'] + '% influence ' + incdec + ' (' + body[i]['total'] + '%)``````' + updatetext + 'last update: ' + updatehumanreadable  + '```\n';
        } else {
          reportmessage = reportmessage + '```ml\n"' + body[i]['systemname'] + ' ' + body[i]['amount'] +  '% influence ' + incdec + ' (' + body[i]['total'] + '%)"``````' + updatetext + 'last update: ' + updatehumanreadable  + '```\n';
        }
      } else if (body[i]['reporttype'] == 'influenceproximity') {
        var updatetext;
        if (body[i]['uptodate'] === true) {
          updatetext = 'Up to date, ';
        } else {
          updatetext = 'OUT OF DATE, ';
        }
        var updatehumanreadable = humanreadabletime(body[i]['timestamp']);

        if (body[i]['factionproximity'] < 1) {
          var opening = '```diff\n-';
        } else {
          var opening = '```md\n#';
        }
        reportmessage = reportmessage + opening + 'Influence proximity warning: ' + body[i]['factionsystem'] + ' (' + body[i]['factionproximity'] + '%)' + '``````' + body[i]['factionname'] + ': ' + body[i]['factioninfluence'] + '%                    ' + body[i]['faction2name'] + ': ' + body[i]['faction2influence'] + '%```\n';

      } else if (body[i]['reporttype'] == 'conflict') {
        var updatetext;
        if (body[i]['uptodate'] === true) {
          updatetext = 'Up to date, ';
        } else {
          updatetext = 'OUT OF DATE, ';
        }
        var updatehumanreadable = humanreadabletime(body[i]['updatetime']);
        if (body[i]['status'] === '') {
          statustext = 'concluded';
        } else if (body[i]['status'] === 'Active') {
          statustext = 'ongoing';
        } else if (body[i]['status'] === 'Pending') {
          statustext = 'pending';
        }

        if (body[i]['direction'] == 'up') {
          var opening = '```ml\n"';
          var closing = '"';
        }
        if (body[i]['direction'] == 'draw') {
          var opening = '```md\n#';
          var closing = '';
        }
        if (body[i]['direction'] == 'down') {
          var opening = '```diff\n-';
          var closing = '';
        }
        reportmessage = reportmessage + opening + body[i]['systemname'] + ' ' + body[i]['type'] +  ' is ' + statustext + closing + '``````' +
        'Factions: ' + body[i]['conflictfaction1'] + ' vs ' + body[i]['conflictfaction2'] + '\n' +
        'Stakes: ' + body[i]['conflictfaction1stake'] + ' - ' + body[i]['conflictfaction2stake'] + '\n' +
        'Score: ' + body[i]['conflictfaction1score'] + ' - ' + body[i]['conflictfaction2score'] + '\n' +
        updatetext + 'last update: ' + updatehumanreadable + '```\n';

      } else if (body[i]['reporttype'] == 'state') {
        var updatetext;
        if (body[i]['uptodate'] === true) {
          updatetext = 'Up to date, ';
        } else {
          updatetext = 'OUT OF DATE, ';
        }
        var updatehumanreadable = humanreadabletime(body[i]['updatetime']);

        if (body[i]['status'] === 'Recovering') {
          statustext = 'recovering';
        } else if (body[i]['status'] === 'Active') {
          statustext = 'ongoing';
        } else if (body[i]['status'] === 'Pending') {
          statustext = 'pending';
        }

        if (body[i]['status'] === 'Active') {
          reportmessage = reportmessage + '```diff\n-' + body[i]['systemname'] + ' ' + body[i]['type'] +  ' ' + statustext + '``````' + updatetext + 'last update: ' + updatehumanreadable  + '```\n';
        } else {
          reportmessage = reportmessage + '```diff\n-' + body[i]['systemname'] + ' ' + body[i]['type'] +  ' ' + statustext + ' (trend: ' + body[i]['direction'] + ')``````' + updatetext + 'last update: ' + updatehumanreadable  + '```\n';
        }
      }
      i++;
    }
    if (type == 'reply') {
      message.channel.send(reportmessage);
    } else {
      client.channels.get(factiontickbgschannelid).send( reportmessage );
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
          var tickdata = '\n**New tick detected**:\n';
          tickdata = tickdata + '```Tick:   ' + body['newtick'] + '\n';
          tickdata = tickdata + 'Tick ID: ' + body['newtickid'] + '```\n';
          client.channels.get(factiontickbgschannelid).send( tickdata );
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


function humanreadabletime(timestamp) {
  var servertime = new Date(new Date().toUTCString());
  const time = new Date(timestamp + 'Z');
  const diffTime = Math.abs((servertime - time) / 1000);

  var years = Math.floor(
    diffTime /
    (365 * 60 * 60 * 24)
  );

  var months = Math.floor(
    (diffTime - years * 365*60*60*24)
    / (30*60*60*24)
  );

  var days = Math.floor(
    (diffTime - years * 365*60*60*24 - months * 30*60*60*24)
    / (60*60*24)
  );

  var hours = Math.floor(
    (diffTime - years * 365 * 60 * 60 * 24 - months * 30 * 60 * 60 * 24 - days * 60 * 60 * 24)
    /
    (60 * 60)
  );

  var minutes = Math.floor(
    (diffTime - years * 365 * 60 * 60 * 24 - months * 30 * 60 * 60 * 24 - days * 60 * 60 * 24 - hours * 60 * 60)
    / 60
  );

  var result = '';
  if (years > 0) {
    if (result != '') {
      result = result + ', ';
    }
    result = result + years + "Y";
  }
  if (months > 0) {
    if (result != '') {
      result = result + ', ';
    }
    result = result + months + "M";
  }
  if (days > 0) {
    if (result != '') {
      result = result + ', ';
    }
    result = result + days + "d";
  }
  if (hours > 0) {
    if (result != '') {
      result = result + ', ';
    }
    result = result + hours + "h";
  }
  if (minutes > 0) {
    if (result != '') {
      result = result + ', ';
    }
    result = result + minutes + "m";
  }
  if (result == '') {
    if (diffTime < 60) {
      result = '< 1m';
    }
  }

  // Print the result
  return result;
}
