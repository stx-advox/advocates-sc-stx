const fs = require("fs");
const stringify = require("json-stable-stringify");

const db = require("better-sqlite3")(
  "cache/sourcecred/discord/discordMirror-621759717756370964.db"
);

const aggregate = db
  .prepare(
    "select mem.username, r.emoji, count(r.emoji) as count from message_reactions r left join messages m on m.id = r.message_id left join members mem on m.author_id = mem.user_id where mem.bot = 0 and (r.emoji like :wolf or r.emoji like :bear or r.emoji like :turtle) group by mem.user_id, r.emoji"
  )
  .all({ wolf: "%🐺%", bear: "%🧸%", turtle: "%🐢%" });

fs.writeFileSync(
  "output/wtb-aggregate.json",
  stringify(aggregate, { space: 2 })
);

const perChannel = db
  .prepare(
    "select mem.username, r.emoji, m.channel_id, count(m.channel_id) as count from message_reactions r left join messages m on m.id = r.message_id left join members mem on m.author_id = mem.user_id where mem.bot = 0 and (r.emoji like :wolf or r.emoji like :bear or r.emoji like :turtle) group by mem.user_id, r.emoji, m.channel_id"
  )
  .all({ wolf: "%🐺%", bear: "%🧸%", turtle: "%🐢%" });

fs.writeFileSync(
  "output/wtb-per-channel.json",
  stringify(perChannel, { space: 2 })
);
