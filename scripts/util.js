const { sourcecred } = require("sourcecred");
const fs = require("fs");
const path = require("path");
const { Ledger } = sourcecred.ledger.ledger;
const createLedgerDiskStorage = (ledgerFilePath) => ({
  get: async () => {
    return fs.readFileSync(ledgerFilePath);
  },
  set: async (path, data) => {
    fs.writeFileSync(path, data);
  },
});
const { LedgerManager } = sourcecred.ledger.manager;

const diskStorage = createLedgerDiskStorage(path.resolve("data/ledger.json"));

const ledgerManager = new LedgerManager({
  storage: diskStorage,
});

module.exports = {
  ledgerManager,
};
