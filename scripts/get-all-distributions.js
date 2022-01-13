const { ledgerManager } = require("./util");
const fs = require("fs");
(async () => {
  await ledgerManager.reloadLedger();
  const { ledger } = ledgerManager;

  const getUserBalances = async () => {
    return Array.from(ledger.accounts())
      .filter((a) => +a.paid)
      .map((account) => {
        return {
          name: account.identity.name,
          total_received_in_stx: Math.floor(account.paid / 1e12) / 1e6,
          id: account.identity.id,
        };
      })
      .filter((account) => {
        return account.total_received_in_stx;
      });
  };

  const getAllData = async () => {
    (await getUserBalances())
      .map((account) => `${account.name},${account.total_received_in_stx}`)
      .join("\n");

    fs.writeFileSync("./accounting-log.csv", accountingLog);
  };

  const getDetailedData = async () => {
    const users = await getUserBalances();
    let weeks = [];
    const transfers = ledger
      .eventLog()
      .filter(
        (event) =>
          event.action.type === "TRANSFER_GRAIN" &&
          event.action.memo.startsWith("https")
      )
      .reduce((acc, next) => {
        weeks.push(next.action.memo);
        acc.set(next.action.memo, {
          ...(acc.get(next.action.memo) || {}),
          [next.action.from]: next.action,
        });
        return acc;
      }, new Map());

    weeks = Array.from(new Set(weeks));
    const logsPerWeek = users.map((user) => {
      const userLogs = { ...user };
      weeks.forEach((week, i) => {
        let currentWeekTransfers = transfers.get(week);
        let weekNumber = i;
        // console.log(currentWeekTransfers);
        // if (i < 4) {
        //   weekNumber = 0;

        //   for (let j = 0; j < 4; j++) {
        //     if (!currentWeekTransfers[user.id]) {
        //       currentWeekTransfers = transfers.get(weeks[j]);
        //     }
        //   }
        // } else {
        //   weekNumber -= 3;
        // }

        const userWeekTransfer = currentWeekTransfers[user.id];
        userLogs[`dist_${weekNumber + 1}`] = userWeekTransfer;
      });
      return userLogs;
    });

    const headers = `name,${weeks
      .map((week, i) => `distribution_${i}`)
      .join(",")}`;

    const rows = logsPerWeek
      .map((log) => {
        return [
          log.name,
          ...weeks.map(
            (week, i) =>
              Math.floor(+(log[`dist_${i + 1}`]?.amount || 0) / 1e12) / 1e6
          ),
        ].join(",");
      })
      .join("\n");
    const result = headers + "\n" + rows;
    fs.writeFileSync("./logs.csv", result);
    // console.log();
  };

  await getDetailedData();
})();
