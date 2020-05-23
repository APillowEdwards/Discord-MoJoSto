var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

var rp = require('request-promise');
const url = 'https://cubecobra.com/cube/list/adny';

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info(`Logged in as: ${bot.username} - (${bot.id})`);
});
bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '!') {

        var args = message.substring(1).split(' ');
        var cmd = args[0];

        // Get the cached file
        var cards = require('./data/adny.json');
       
        logger.info('Excecuting ' + message + ' from ' + user);

        switch(cmd) {
            case 'help':

                bot.sendMessage({
                    to: channelID,
                    message: "Hi! The full list for this cube is available here: http://cubecobra.com/cube/list/adny, although it might be more fun if you don't look! The valid commands are `!help`, !mo #`, `!jho [instant|sorcery]`, `!sto #` and `!mosto #`"
                });

                break;

            case 'ms':
            case 'mosto':

            
                if (typeof args[1] == `undefined`) {
                    bot.sendMessage({
                        to: channelID,
                        message: "Please specify the CMC (for example, use `!mosto 2`)"
                    });
                    break;
                }
                
                var cmc = args[1];

                if (cmc > 9) {

                    bot.sendMessage({
                        to: channelID,
                        message: "The CMC is *TOO DAMN HIGH*"
                    });
                    break;
                }

                var moCard = getMo(cards, cmc)
                bot.sendMessage({
                    to: channelID,
                    message: `Here is your ${cmc} CMC creature token! \`${moCard["name"]}\` - ${moCard["image_url"]}`
                });    

                var stoCard = getSto(cards, cmc)
                bot.sendMessage({
                    to: channelID,
                    message: `Here is your equipment with CMC less than ${cmc}! \`${stoCard["name"]}\` - ${stoCard["image_url"]}`
                });

                break;

            case 'm':
            case 'mo':
            case 'mom':
            case 'momi':
            case 'momir':

                if (typeof args[1] == `undefined`) {
                    bot.sendMessage({
                        to: channelID,
                        message: "Please specify the CMC (for example, use `!mo 2`)"
                    });
                    break;
                }
                
                var cmc = args[1];

                if (cmc > 9) {

                    bot.sendMessage({
                        to: channelID,
                        message: "The CMC is *TOO DAMN HIGH*"
                    });
                    break;
                }

                var card = getMo(cards, cmc)

                bot.sendMessage({
                    to: channelID,
                    message: `Here is your ${cmc} CMC creature token! \`${card["name"]}\` - ${card["image_url"]}`
                });
                
                break;

            case 'j':
            case 'jh':
            case 'jho':
            case 'jhoi':
            case 'jhoir':
            case 'jhoira':

                if (typeof args[1] == `undefined`) {
                    bot.sendMessage({
                        to: channelID,
                        message: "Please specify the type (`instant` or `sorcery`)"
                    });
                    break;
                }

                var type = args[1].toLowerCase()
                if (type != 'instant' && type != 'sorcery') {
                    bot.sendMessage({
                        to: channelID,
                        message: "Invalid type (should be `instant` or `sorcery`)"
                    });
                    break;
                }

                var jhoCards = getJho(cards, type)
                bot.sendMessage({
                    to: channelID,
                    message: `Here is your first choice of ${type}! \`${jhoCards[0]["name"]}\` - ${jhoCards[0]["image_url"]}`
                });
                bot.sendMessage({
                    to: channelID,
                    message: `Here is your second choice of ${type}! \`${jhoCards[1]["name"]}\` - ${jhoCards[1]["image_url"]}`
                });
                bot.sendMessage({
                    to: channelID,
                    message: `Here is your third choice of ${type}! \`${jhoCards[2]["name"]}\` - ${jhoCards[2]["image_url"]}`
                });

                break;

            case 's':
            case 'st':
            case 'sto':
            case 'ston':
            case 'stone':
            case 'stoneh':
            case 'stonehe':
            case 'stonehew':
            case 'stonehewe':
            case 'stonehewer':

                if (typeof args[1] == `undefined`) {
                    bot.sendMessage({
                        to: channelID,
                        message: "Please specify the CMC of the creature (for example, use `!sto 2`)"
                    });
                    break;
                }
                
                var cmc = args[1];
                var card = getSto(cards, cmc)

                bot.sendMessage({
                    to: channelID,
                    message: `Here is your equipment with CMC less than ${cmc}! \`${card["name"]}\` - ${card["image_url"]}`
                });
                
                break;

            default:
                bot.sendMessage({
                    to: channelID,
                    message: "Invalid command. The valid commands are `!help`, !mo #`, `!jho [instant|sorcery]`, `!sto #` and `!mosto #`"
                });
                break;
         }
     }
});


function getMo(cards, cmc) {
    var cards_with_cmc = cards.mo[cmc];

    var randomIndex = Math.floor(Math.random() * cards_with_cmc.length);

    return cards_with_cmc[randomIndex];
}

function getJho(cards, type) {
    var returnCards = [];
    var cards_with_type = cards.jho[type];

    if (cards.jho[type].length < 3) {
        logger.info('Failed to find enough cards for Jhoira');
        return returnCards;
    }

    var used_indexes = [];
    while(returnCards.length < 3) {
        var randomIndex = Math.floor(Math.random() * cards_with_type.length);

        if (!used_indexes.includes(randomIndex)) {
            returnCards.push(cards_with_type[randomIndex]);
            used_indexes.push(randomIndex);
        }
    }

    return returnCards;
}

function getSto(cards, cmc) {
    var cards_with_lesser_cmc = []

    for(var i = cmc - 1; i >= 0; i--) {
        var cards_with_cmc = cards.sto[i.toString()]
        if(typeof cards_with_cmc !== `undefined`) {
            cards_with_lesser_cmc = cards_with_lesser_cmc.concat(cards_with_cmc)
        }
    }
    
    var randomIndex = Math.floor(Math.random() * cards_with_lesser_cmc.length);

    logger.info(cards_with_lesser_cmc)
    logger.info(cards_with_lesser_cmc[randomIndex])
    return cards_with_lesser_cmc[randomIndex]
}