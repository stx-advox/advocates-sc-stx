const path = require("path");
const fs = require("fs");
const process = require("process");
const { addWeeks, parseISO, isEqual, isBefore } = require("date-fns");

const rework = {};

process.env.ATTRIBUTIONS.split("\n").map((item) => {
  const [name, percentage, weeks, recipient] = item.split(",");
  rework[name] = {
    percentage: Number(percentage),
    until: addWeeks(parseISO("2021-08-22T00:00:00.000Z"), Number(weeks)),
    recipient,
  };
});

// console.log(rework);
const output = fs.readFileSync(path.resolve("./grain_output.txt")).toString();
let currentDistDate = output.match(
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/gm
)[0];
currentDistDate = parseISO(currentDistDate);
let csv = output
  .match(/\|\s+\w+-\w+\s+\|([\s\S]+)\nRECENT/gm)[0]
  .replace(/\nRECENT/gm, "")
  .replace(/^\|\s+/gm, "")
  .split("\n")
  .map((a) => a.replace(/ +/g, "").split("|").slice(0, 2));

let increase = 0;

csv = csv.map((dist) => {
  const reworkItem = rework[dist[0]];
  if (
    reworkItem &&
    (isBefore(currentDistDate, reworkItem.until) ||
      isEqual(currentDistDate, reworkItem.until))
  ) {
    const grainAmount = Number(dist[1]);
    const increment = grainAmount * reworkItem.percentage;
    increase += increment;
    const remaining = grainAmount - increment;
    if (remaining) {
      return [dist[0], remaining];
    }
    return;
  }
  return dist;
});

csv = csv.filter(Boolean).map((dist) => {
  if (dist[0] === process.env.ATTRIBUTIONS_RECIPIENT) {
    return [dist[0], Number(dist[1]) + increase];
  }
  return dist;
});
csv = csv.join("\n");

fs.writeFileSync(path.resolve("./distribution.csv"), csv);
