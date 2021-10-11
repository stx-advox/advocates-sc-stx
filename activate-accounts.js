require("dotenv").config();
const { ledgerManager } = require("./util");

const { Client, Intents, TextChannel } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", async () => {
  const stacks = await client.guilds.fetch("621759717756370964");
  const priorityChannels = ["872124843225653278", "872124900431769620"];
  await ledgerManager.reloadLedger();
  for (let id of priorityChannels) {
    /**
     * @type {TextChannel}
     */
    const channel = await stacks.channels.fetch(id);
    const messages = await channel.messages.fetch();
    const advocatesMap = messages.reduce((acc, next) => {
      return {
        ...acc,
        [next.author.id]: next.author,
      };
    }, {});

    const advocates = Object.values(advocatesMap);
    for (let advocate of advocates) {
      const discordAccount = ledgerManager.ledger.accountByAddress(
        `N\u0000sourcecred\u0000discord\u0000MEMBER\u0000user\u0000${advocate.id}\u0000`
      );
      if (discordAccount) {
        console.log("activating", advocate.username, "...");
        const discordIdentityId = discordAccount.identity.id;
        ledgerManager.ledger.activate(discordIdentityId);
      }
    }
  }

  ledgerManager.persist();
  client.destroy();
});

client.login(process.env.SOURCECRED_DISCORD_TOKEN);
