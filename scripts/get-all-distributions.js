const { ledgerManager } = require("./util");
const fs = require("fs");

const getAllData = async () => {
  await ledgerManager.reloadLedger();

  const { ledger } = ledgerManager;

  const accountingLog = Array.from(ledger.accounts())
    .filter((a) => +a.paid)
    .map((account) => {
      return {
        name: account.identity.name,
        total_received_in_stx:
          Math.floor((account.paid - account.balance) / 1e12) / 1e6,
      };
    })
    .filter((account) => {
      return account.total_received_in_stx;
    })
    .map((account) => `${account.name},${account.total_received_in_stx}`)
    .join("\n");

  fs.writeFileSync("./accounting-log.csv", accountingLog);
};

getAllData();
