const Discord = require("discord.js");
const client = new Discord.Client();

const fetch = require("node-fetch");

const config = require("./config.json");

const Blackjack = require("./blackjack");

const blackjackGames = {};


// Invite: https://discordapp.com/oauth2/authorize?client_id=700026092718915626&scope=bot&permissions=8


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({ activity: { name: "with +help" }, status: "online" })
    .catch(console.error);
});

client.on("message", async msg => {
  if (msg.author.bot) return;
    // Blacklist
  if (config.blacklist.includes(msg.author.id)) {
    msg.author.send("You ain't doing that!");
    return;
  }
  if (!msg.content.startsWith(config.prefix)) return;
  const args = msg.content.substr(config.prefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  switch(cmd) {
    case "ping":
      msg.reply("Pong!");
      break;
    case "changepresence":
      if (config.owner === msg.author.id) {
        if (!args[0]) return;
        const status = args.shift().toLowerCase();
        client.user.setPresence({ activity: { name: args.join(" ") }, status: status })
          .catch(console.error);
      } else {
        msg.author.send("You ain't doing that!");
      }
      break;
    case "cat":
      const catObj = await (await fetch("http://aws.random.cat/meow")).json();
      const embed = new Discord.MessageEmbed()
        .setColor(randomColor())
        .setTitle("Katze")
        .setImage(catObj.file)
        .setURL(catObj.file);
      msg.reply(embed);
      break;
    case "about":
      msg.reply("Hello! I'm a useful bot created by the developer and discord user emeraldingg#2697. My prefix is +. You can use me for getting a cat picture, creating random stuff and playing blackjack. I hope you have fun! Version: 1.0.0");
      break;
    case "randomnumber":
      if (!args[0] || isNaN(args[0])) {
        msg.reply("Correct usage: +randomnumber [highest number]");
      } else {
        msg.reply(randomNumber(args[0]));
      }
      break;
    case "blackjack":
      if (blackjackGames[msg.author.id]) {
        if (args[0] && args[0] === "end") {
          blackjackGames[msg.author.id].end();
        } else {
          msg.reply("You are already playing blackjack!");
        }
      } else {
        blackjackGames[msg.author.id] = new Blackjack(msg, () => {
          delete blackjackGames[msg.author.id];
        });
        blackjackGames[msg.author.id].start();
      }
      break;
  }
});

client.on("guildCreate", async guild => {
  const channel = guild.channels.cache.filter(channel => {
    if (channel.type !== "text") return false;
    return channel.permissionsFor(guild.me).has(Discord.Permissions.FLAGS.SEND_MESSAGES);
  }).first();
  if (channel) {
    channel.send("Hello! I'm a useful bot created by the developer and discord user emeraldingg#2697. My prefix is +. You can use me for getting a cat picture, creating random stuff and playing blackjack. I hope you have fun! Version: 1.0.0");
  }
});

client.login(config.token);

function randomColor() {
  return Math.floor(Math.random() * 16777215);
}
function randomNumber(max) {
  return Math.floor(Math.random() * max);
}