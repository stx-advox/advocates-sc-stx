require("dotenv").config();
const path = require("path");

const { Client, Intents } = require("discord.js");
const { ledgerManager } = require("./util");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", async () => {
  await ledgerManager.reloadLedger();
  const distributions = Array.from(ledgerManager.ledger.distributions());
  const lastDistribution = distributions[distributions.length - 1];

  const channel = client.channels.cache.get("872214986452242462");
  if (channel) {
    await channel.send({
      content: `Distribution ready yo <@392435662420443167>!
**Dist ID**: \`${lastDistribution.id}\`
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
