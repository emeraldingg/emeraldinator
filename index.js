const Discord = require("discord.js");
const client = new Discord.Client();

const fetch = require("node-fetch");

const config = require("./config.json");

const Blackjack = require("./blackjack");

const blackjackGames = {};

// Invite: https://discordapp.com/oauth2/authorize?client_id=700026092718915626&scope=bot&permissions=8

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user
    .setPresence({ activity: { name: "-> +help <-" }, status: "online" })
    .catch(console.error);
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  // Blacklist
  if (config.blacklist.includes(msg.author.id)) {
    msg.author.send("You ain't doing that!");
    return;
  }
  if (!msg.content.startsWith(config.prefix)) return;
  const args = msg.content.substr(config.prefix.length).split(/ +/);
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
      msg.reply(
        `Hello! I'm a useful bot created by the developer and discord user emeraldingg#2697. My prefix is ${config.prefix}. You can use me for getting a cat picture, creating random stuff and playing blackjack.\nI hope you have fun! Version: 1.0.0\nInvite: ${config.invite}`
      );
      break;
    case "randomnumber":
      if (!args[0] || isNaN(args[0])) {
        msg.reply(
          `Correct usage: ${config.prefix}randomnumber <highest number>`
        );
      } else {
        msg.reply(randomNumber(args[0]));
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
          `${config.prefix}blackjack`,
          `Play Blackjack for free with the bot as a dealer!`
        )
        .addField(`${config.prefix}help`, `Loads this page.`)
        .addField(`${config.prefix}about`, `Shows informations about the bot.`)
        .addField(
          `${config.prefix}randomnumber`,
          `Creates a random number. Correct usage: ${config.prefix}randomnumber <highest number>`
        )
        .addField(
          `${config.prefix}cat`,
          `Displays a random cat from www.random.cat.`
        )
        .addField(`${config.prefix}ping`, `The bot responds with Pong.`)
        .addField(
          `${config.prefix}invite`,
          `Shows the invite link for this bot.`
        )
        .addField(`${config.prefix}serverinvite`, `Creates a server invite.`)
        .addField(`${config.prefix}stats`, `Shows some stats about this bot.`);
      msg.author.send("", { embed: help });
      break;
    case "invite":
      msg.reply("Sent you a DM!");
      const invite = new Discord.MessageEmbed()
        .setColor(randomColor())
        .setTitle("Invite this bot to your server with this link:")
        .addField("Bot invite:", `${config.invite}`);
      msg.author.send("", { embed: invite });
      break;
    case "serverinvite":
      if (msg.member.hasPermission("CREATE_INSTANT_INVITE")) {
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
          `Hello! I'm a useful bot created by the developer and discord user emeraldingg#2697. My prefix is ${config.prefix}. You can use me for getting a cat picture, creating random stuff and playing blackjack.\nI hope you have fun! Version: 1.0.0\nInvite: ${config.invite}`
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
            channel.send(text)
            .catch(console.error);
          } else {
           errorGuilds.push(guild.name);
          }
        });
        if (errorGuilds.length > 0) {
          msg.reply(`Could not announce to the following servers ${errorGuilds.join(", ")}`);
        }
      } else {
        msg.author.send("You ain't doing that!");
      }
      break;
    case "reboot":
      if (message.author.id === config.owner) {
        message.reply("Restarting!").then(function () {
          console.log("Restarted by " + message.author.username);
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
        blackjackGames[msg.author.id] = new Blackjack(msg, () => {
          delete blackjackGames[msg.author.id];
        });
        blackjackGames[msg.author.id].start();
      }
      break;
  }
});

client.on("guildCreate", async (guild) => {
  const channel = findGoodChannel(guild);
  if (channel) {
    channel.send(
      `Hello! I'm a useful bot created by the developer and discord user emeraldingg#2697. My prefix is ${config.prefix}. You can use me for getting a cat picture, creating random stuff and playing blackjack.\nI hope you have fun! Version: 1.0.0\nInvite: ${config.invite}`
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
function randomNumber(max) {
  return Math.floor(Math.random() * max);
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
