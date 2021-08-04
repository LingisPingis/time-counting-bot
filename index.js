const Discord = require('discord.js');
const client = new Discord.Client();
const db = require('quick.db');
const config = require('./config.js');
const { join } = require('path');

const settings = {
    prefix: "t!"
};

function generateID() {
    const id = Math.random().toString().slice(2, 11);
    return id;
}

function timeSince(date) {

    let seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

let command;
client.on('message', (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(settings.prefix)) return;

    let count = db.get(`userdata.${message.author.id}.timers.count.allTime`);
    if (!count) db.set(`userdata.${message.author.id}.timers.count.allTime`, 1);

    let timers = db.get(`userdata.${message.author.id}.timers.allTime`);
    if (!timers) db.set(`userdata.${message.author.id}.timers.count.allTime`, []);

    const args = message.content.slice(settings.prefix.length).split(/ +/);
    command = args[0];

    const number = db.get(`users.${message.author.id}.timers.count`);
    if (!number) db.set(`users.${message.author.id}.timers.count`, 1);

    if (command === 'start') {

        const id = generateID();
        db.set(`userdata.${message.author.id}.timers.count.allTime`, parseInt(db.get(`userdata.${message.author.id}.timers.count.allTime`)) + 1)
        db.push(`userdata.${message.author.id}.timers.allTime`, {
            ID: id,
            started: Date.now(),
            startedDate: new Date(),
            timerNr: db.get(`userdata.${message.author.id}.timers.count.allTime`)
        })

        const embed1 = new Discord.MessageEmbed()
            .setTitle('Timer :timer:')
            .setDescription('The timer has been started and assigned the id `' + id + '` Whenever you want to end it, type `t!end ' + id + '`!')
            .setColor('GREEN');

        message.channel.send(embed1);
    }
    if (command === 'end') {
        const correct_ids = new Array();

        if (!args[1]) {
            const embed = new Discord.MessageEmbed()
                .setTitle('Timer :x:')
                .setDescription(`Please specify a timer ID to end!`)
                .setColor('RED')

            return message.channel.send(embed)
        }

        const data = db.get(`userdata.${message.author.id}.timers.allTime`);
        for (i in data) {
            if (data[i].ID == args[1]) {
                correct_ids.push(data[i])
            }
        }

        if (correct_ids.length == 0) {
            const embed = new Discord.MessageEmbed()
                .setTitle('Timer :x:')
                .setDescription(`Please specify a **valid** timer ID to end!`)
                .setColor('RED')

            return message.channel.send(embed)
        } else {

            let data2;
            const toset = data;
            for (i in data) {
                if (data[i].ID == args[1]) {
                    jsoned = db.get(`userdata.${message.author.id}.timers.allTime`);
                    data2 = jsoned[i];
                    toset.splice(i, 1);
                }
            }
            db.set(`userdata.${message.author.id}.timers.allTime`, toset);

            const embed = new Discord.MessageEmbed()
                .setTitle('Timer :timer:')
                .setDescription(`Timer stopped, it was started **${timeSince(data2.started)}** ago!`)
                .setColor('GREEN')

            message.channel.send(embed)
        }
    }
    if (command === 'info') {
        if (timers) {
            const embed = new Discord.MessageEmbed()
                .setTitle('Timer :information_source:')
                .setDescription(`Timer information for ${message.author}!`)
                .setColor('BLUE')

            const data = db.get(`userdata.${message.author.id}.timers.allTime`);
            for (i in data) {
                embed.addField(`Timer ${data[i].timerNr}`.replace('null', '1'), `ID: ${data[i].ID}\nStarted Timestamp: ${data[i].started}\nStarted Date: ${data[i].startedDate.slice(0, 10)}`)
            }

            message.channel.send(embed)
        } else {
            const embed = new Discord.MessageEmbed()
                .setTitle('Timer :information_source:')
                .setDescription("You don't have any timer information to display!")
                .setColor('BLUE')

            return message.channel.send(embed)
        }
    }
})

client.on("ready", () => {
    console.log(`online as ${client.user.tag}\nonline on ${client.guilds.cache.size} servers`)
    client.user.setPresence({ activity: { name: `Netflix`, type: 'WATCHING' }, status: 'dnd' })
})
client.login(config.token);