const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const Discord = require('discord.js');
const client = new Discord.Client();

let disconnected = [];

function updateDC(time) {
    for (let i = 0; i < disconnected.length; i++) {
        let voice = disconnected[i].guildMember.voice;
        if (disconnected[i].msg.deleted || voice.channelID == null) {
            if (!disconnected[i].msg.deleted)
                disconnected[i].msg.delete();
            if (!disconnected[i].reply.deleted)
                disconnected[i].reply.delete();
            console.log("Deleted");
            disconnected.splice(i, 1);
            continue;
        }

        disconnected[i].time -= time;
        if (disconnected[i].time <= 0) {
            console.log("Kicked");
            voice.kick();
        }
    }
}

async function loopDC() {
    let time = 5000;
    while(true) {
        updateDC(time);
        await sleep(time);
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    loopDC();
});

client.on('message', msg => {
    let messageText = msg.content.split(' ');
    if (messageText[0] === '!dc') {
        let time = parseInt(messageText[1]);
        let user = msg.author;
        let guildMember = msg.guild.member(user);

        if (!(time > 0)) {
            msg.reply('Invalid time in minutes');
            return;
        }
        
        msg.reply('You will be kicked in ' + time + ' minute(s)').then(reply => {
            let dc = {
                user: user,
                guildMember: guildMember,
                msg: msg,
                reply: reply,
                time: time * 60000,
            }
    
            disconnected.push(dc);
        });
    }
});

client.login('token');