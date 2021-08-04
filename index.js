const Discord = require("discord.js");
const client = new Discord.Client();

const fetch = require("node-fetch");
const prefix = require('discord-prefix');

const config = require("./config.json");
const { version } = require("./package.json");


const Blackjack = require("./blackjack");

const blackjackGames = {};

let defaultPrefix = config.defaultPrefix;

// Invite: https://discordapp.com/oauth2/authorize?client_id=700026092718915626&scope=bot&permissions=8

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user
    .setPresence({ activity: { name: "-> +help <-" }, status: "online" })
    .catch(console.error);
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.guild) {
    //msg.reply("Sorry, but this bot only works in servers.")
    return;
  }

  let guildPrefix = prefix.getPrefix(msg.guild.id);
  if (!guildPrefix) guildPrefix = defaultPrefix;

  if (!msg.content.startsWith(guildPrefix)) return;
  // Blacklist
  if (config.blacklist.includes(msg.author.id)) {
    msg.author.send("You ain't doing that!");
    return;
  }
  const args = msg.content.substr(guildPrefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  switch (cmd) {
    case "ping":
      msg.reply("Pong!");
      break;
    case "changepresence":
      if (config.owner === msg.author.id) {
        if (!args[0]) return;
        const status = args.shift().toLowerCase();
        client.user
          .setPresence({ activity: { name: args.join(" ") }, status: status })
          .catch(console.error);
      } else {
        msg.author.send("You ain't doing that!");
      }
      break;
    case "changeprefix":
      if (!msg.member.hasPermission("MANAGE_GUILD")) {
        msg.author.send("You ain't doing that!");
      }
      else if (!args[0] || args[0] === "help") {
        msg.reply(`Correct usage: ${guildPrefix}changeprefix <desired prefix>`)
      }
      else if (args[0].length > 3) {
        msg.reply("Your prefix can't be longer than 3 characters!")
      }
      else {
        prefix.setPrefix(args[0], msg.guild.id);
        guildPrefix = prefix.getPrefix(msg.guild.id);
        msg.reply(`Prefix changed to ${guildPrefix}`);
      }
      break;
    case "cat":
      const catObj = await (await fetch("http://aws.random.cat/meow")).json();
      const embed = new Discord.MessageEmbed()
        .setColor(randomColor())
        .setTitle("Cat")
        .setImage(catObj.file)
        .setURL(catObj.file)
        .setFooter("Powered by random.cat");
      msg.reply(embed);
      break;
    case "about":
      msg.reply(
        `Hello! I'm a useful bot created by the developer and discord user emeraldingg#2697. My prefix is ${guildPrefix}. You can use me for getting a cat picture, creating random stuff and playing blackjack.\nI hope you have fun! Version: ${version}\nInvite: ${config.invite}`
      );
      break;
    case "randomnumber":
      if (!args[0] || isNaN(args[0])) {
        msg.reply(
          `Correct usage: ${guildPrefix}randomnumber <highest number> or ${guildPrefix}randomnumber <lowest number> <highest number>`
        );
      } else if (!args[1] || isNaN(args[1])) {
        msg.reply(randomNumber(0, Math.round(args[0])));
      } else {
        msg.reply(randomNumber(Math.round(args[0]), Math.round(args[1])));
      }
      break;
    case "help":
      msg.reply("Sent you a DM!");
      const help = new Discord.MessageEmbed()
        .setColor(randomColor())
        .setTitle("Help for emeraldinator:")
        .setThumbnail(client.user.avatarURL())
        .setDescription(
          `Invite this bot to your server with this link: ${config.invite}`
        )
        .addField(
          `${guildPrefix}blackjack`,
          `Play Blackjack for free with the bot as a dealer!`
        )
        .addField(`${guildPrefix}help`, `Loads this page.`)
        .addField(`${guildPrefix}about`, `Shows informations about the bot.`)
        .addField(`${guildPrefix}changeprefix`, `Changes the prefix for this server. Requires the Manage Server Permission.`)
        .addField(
          `${guildPrefix}randomnumber`,
          `Creates a random number. Correct usage: ${guildPrefix}randomnumber <highest number> or ${guildPrefix}randomnumber <lowest number> <highest number>`
        )
        .addField(
          `${guildPrefix}cat`,
          `Displays a random cat from www.random.cat.`
        )
        .addField(`${guildPrefix}ping`, `The bot responds with Pong.`)
        .addField(
          `${guildPrefix}invite`,
          `Shows the invite link for this bot.`
        )
        .addField(`${guildPrefix}serverinvite`, `Creates a server invite.`)
        .addField(`${guildPrefix}stats`, `Shows some stats about this bot.`);
      msg.author.send("", { embed: help });
      break;
    case "invite":
      const invite = new Discord.MessageEmbed()
        .setColor(randomColor())
        .setTitle("Invite this bot to your server with this link:")
        .addField("Bot invite:", `${config.invite}`);
      msg.reply("", { embed: invite });
      break;
    case "serverinvite":
      if (msg.guild && msg.member.hasPermission("CREATE_INSTANT_INVITE")) {
        serverInvite(msg);
        msg.reply("Sent you a DM!");
      } else {
        msg.reply("Sorry, but you don't have the permission to do that.");
      }
      break;
    case "stats":
      var seconds = process.uptime();
      days = Math.floor(seconds / 86400);
      seconds %= 86400;
      hrs = Math.floor(seconds / 3600);
      seconds %= 3600;
      mins = Math.floor(seconds / 60);
      secs = seconds % 60;
      var uptime =
        days +
        " Days, " +
        hrs +
        " Hours, " +
        mins +
        " Minutes and " +
        Math.round(secs) +
        " Seconds";

      const stats = new Discord.MessageEmbed()
        .setColor(randomColor())
        .setTitle("Stats of emeraldinator:")
        .setDescription(
          `Hello! I'm a useful bot created by the developer and discord user emeraldingg#2697. My prefix is ${guildPrefix}. You can use me for getting a cat picture, creating random stuff and playing blackjack.\nI hope you have fun! Version: ${version}\nInvite: ${config.invite}`
        )
        .setThumbnail(client.user.avatarURL())
        .addField("Author:", "emeraldingg#2697")
        .addField("Invite:", `[Click Here](${config.invite})`)
        .addField("Servers", client.guilds.cache.size)
        .addField("Channels", client.channels.cache.size)
        .addField("Cached Users", client.users.cache.size)
        .addField("Uptime", uptime)
        .addField(
          "RAM Usage",
          Math.round(process.memoryUsage().rss / 1024 / 1024) + " MB"
        );
      msg.reply("", { embed: stats });
      break;
    case "announce":
      if (config.owner === msg.author.id) {
        if (!args[0]) return;
        const text = args.join(" ");
        let errorGuilds = [];
        client.guilds.cache.forEach((guild) => {
          const channel = findGoodChannel(guild);
          if (channel) {
            channel.send(text).catch(console.error);
          } else {
            errorGuilds.push(guild.name);
          }
        });
        if (errorGuilds.length > 0) {
          msg.reply(
            `Could not announce to the following servers ${errorGuilds.join(
              ", "
            )}`
          );
        }
      } else {
        msg.author.send("You ain't doing that!");
      }
      break;
    case "reboot":
      if (msg.author.id === config.owner) {
        msg.reply("Restarting!").then(function () {
          console.log("Restarted by " + msg.author.username);
          process.exit(0);
        });
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
        if (!args[0]) {
          blackjackGames[msg.author.id] = new Blackjack(msg, () => {
          delete blackjackGames[msg.author.id];
        });
        blackjackGames[msg.author.id].start();
        } else {
          msg.reply("Wrong usage!");
        }
      }
      break;
  }
});

client.on("guildCreate", async (guild) => {
  const channel = findGoodChannel(guild);
  let guildPrefix = prefix.getPrefix(guild.id);
  if (!guildPrefix) guildPrefix = defaultPrefix;
  if (channel) {
    channel.send(
      `Hello! I'm a useful bot created by the developer and discord user emeraldingg#2697. My prefix is ${guildPrefix}. You can use me for getting a cat picture, creating random stuff and playing blackjack.\nI hope you have fun! Version: ${version}\nInvite: ${config.invite}`
    );
  }
});

client.login(config.token);

function findGoodChannel(guild) {
  return guild.channels.cache
    .filter((channel) => {
      if (channel.type !== "text") return false;
      return channel
        .permissionsFor(guild.me)
        .has(Discord.Permissions.FLAGS.SEND_MESSAGES);
    })
    .first();
}

function randomColor() {
  return Math.floor(Math.random() * 16777215);
}
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function serverInvite(msg) {
  let invite = await msg.channel.createInvite(
    {
      maxAge: 1800 * 1,
      maxUses: 1,
    },
    `Requested by ${msg.author.tag}`
  );
  msg.author.send(invite ? `Here's your server invite: ${invite}` : "Error!");
}
