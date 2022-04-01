const path = require("path");
const fs = require("fs");
const process = require("process");
const { addWeeks, parseISO, isEqual, isBefore } = require("date-fns");
const { ledgerManager } = require("./util");
const { config } = require("dotenv");
config();

const rework = {};

process.env.ATTRIBUTIONS.split("\n").forEach((item) => {
  const [name, percentage, weeks, recipient] = item.split(",");
  rework[name] = {
    percentage: Number(percentage),
    until: addWeeks(parseISO("2021-08-22T00:00:00.000Z"), Number(weeks)),
    recipient,
  };
});

const nameModify = {
  "the-advisor-btc": "the_advisor-btc",
  "nft-huntsman-btc": "nft_huntsman-btc",
};

const main = async () => {
  const ledgerResult = await ledgerManager.reloadLedger();
  if (ledgerResult.error) {
    return {
      type: "FAILURE",
      error: `Error processing ledger events: ${ledgerResult.error}`,
    };
  }
  const distributions = Array.from(ledgerManager.ledger.distributions());
  const lastDistribution = distributions[distributions.length - 1];
  const currentDistDate = new Date(lastDistribution.credTimestamp);
  let allocations = lastDistribution.allocations.reduce(
    (acc, next) => [...acc, ...next.receipts],
    []
  );
  allocations = allocations
    .map((item) => ({
      ...item,
      name: ledgerManager.ledger.account(item.id).identity.name,
      amount: Number(item.amount),
    }))
    .sort((a, b) => Number(b.amount) - Number(a.amount));

  let increase = 0;

  csv = allocations.map((dist) => {
    const reworkItem = rework[dist.name];
    if (
      reworkItem &&
      (isBefore(currentDistDate, reworkItem.until) ||
        isEqual(currentDistDate, reworkItem.until))
    ) {
      const grainAmount = Number(dist.amount);
      // const increment = grainAmount * reworkItem.percentage;
      // increase += increment;
      const remaining = grainAmount;
      if (remaining) {
        return [dist.name, remaining];
      }
      return;
    }
    return [dist.name, dist.amount];
  });

  csv = csv.filter(Boolean).map((dist) => {
    if (dist[0] === process.env.ATTRIBUTIONS_RECIPIENT) {
      return [dist[0], Number(dist[1]) + increase];
    }
    return dist;
  });
  csv = csv.map((item) => [item[0], Math.floor(item[1] / 1e12) / 1e6]);

  csv = csv.map((item) => [nameModify[item[0]] || item[0], item[1]]);

  csv = csv.join("\n");
  fs.writeFileSync(path.resolve("./distribution.csv"), csv);
};

main();
