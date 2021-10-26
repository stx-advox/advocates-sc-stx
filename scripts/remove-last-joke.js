require("dotenv").config();

const { Client, Intents, TextChannel } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", async () => {
  const stacks = await client.guilds.fetch("621759717756370964");
  const grainDiscussionChannel = "872214986452242462";
  const credBotId = "852550218825596980";
  /**
   * @type {TextChannel}
   */
  const channel = await stacks.channels.fetch(grainDiscussionChannel);

  const messages = await channel.messages.fetch();

  const credBotMsgs = messages.filter((msg) => msg.author.id === credBotId);
  const latestMsg = Array.from(credBotMsgs.values())[0];
  // latestMsg.edit(latestMsg.content.split('\n'))
  await latestMsg.edit(
    latestMsg.content
      .split("\n")
      .slice(0, 2)
      .map((content, index) =>
        index === 1 ? content + " is a bad joke" : content
      )
      .join("\n")
  );

  client.destroy();
});

client.login(process.env.SOURCECRED_DISCORD_TOKEN);
