require("dotenv").config();
const path = require("path");
const fetch = require("cross-fetch");

const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", async () => {
  const channel = client.channels.cache.get("872214986452242462");
  if (channel) {
    // const jokeOfTheWeek = await fetch("https://api.chucknorris.io/jokes/random")
    //   .then((data) => {
    //     return data.json();
    //   })
    //   .then((json) => {
    //     return json.value;
    //   });

    await channel.send({
      content: `Distribution ready yo <@392435662420443167>!
**Chuck Norris joke of the week**: has been retired lol
`,
      files: [
        {
          attachment: path.resolve("./distribution.csv"),
          name: `distribution-${new Date().toISOString()}.csv`,
        },
      ],
    });
  }
  client.destroy();
});

client.login(process.env.SOURCECRED_DISCORD_TOKEN);
