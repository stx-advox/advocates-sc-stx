const process = require("process");
const { sourcecred } = require("sourcecred");
const { Ledger } = sourcecred.ledger.ledger;
const fs = require("fs");
const path = require("path");

const createLedgerDiskStorage = (ledgerFilePath) => ({
  read: async () => {
    return Ledger.parse(fs.readFileSync(ledgerFilePath).toString());
  },
  write: async (ledger) => {
    fs.writeFileSync(ledgerFilePath, ledger.serialize());
  },
});

const [, , txUrl] = process.argv;
const { LedgerManager } = sourcecred.ledger.manager;

const diskStorage = createLedgerDiskStorage(path.resolve("data/ledger.json"));
const ledgerManager = new LedgerManager({
  storage: diskStorage,
});

const treasuryId = "ymd8xn3ZA3CmoAm0DCEmvQ";

const main = async () => {
  const ledgerResult = await ledgerManager.reloadLedger();
  if (ledgerResult.error) {
    return {
      type: "FAILURE",
      error: `Error processing ledger events: ${ledgerResult.error}`,
    };
  }
  const distributions = Array.from(ledgerManager.ledger.distributions());
  const { allocations } = distributions[distributions.length - 1];
  for (let { receipts } of allocations) {
    for (let { id } of receipts) {
      const amount = ledgerManager.ledger.account(id).balance;
      if (Number(amount) > 0 && id !== treasuryId) {
        ledgerManager.ledger.transferGrain({
          from: id,
          to: treasuryId,
          amount,
          memo: txUrl,
        });
      }
    }
  }

  await ledgerManager.persist();
};

main();
