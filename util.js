const {
  sourcecred,
} = require("../sourcecred/packages/sourcecred/dist/server/api");
const fs = require("fs");
const path = require("path");
const { Ledger } = sourcecred.ledger.ledger;
const createLedgerDiskStorage = (ledgerFilePath) => ({
  read: async () => {
    return Ledger.parse(fs.readFileSync(ledgerFilePath).toString());
  },
  write: async (ledger) => {
    fs.writeFileSync(ledgerFilePath, ledger.serialize());
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
