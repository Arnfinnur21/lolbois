import { rankBy, STAT_DESCRIPTORS } from "../lib/utils.js";
import fs from "fs";

// Load static dataset manually
const players = JSON.parse(
  fs.readFileSync(new URL("../data/players.full.json", import.meta.url))
);

// Test Killers
const { top3, rest } = rankBy(players, STAT_DESCRIPTORS.killers);

console.log("Top 3 Killers:");
console.log(top3.map(p => ({ name: p.name, value: p[STAT_DESCRIPTORS.killers.selector] })));
console.log("The Rest:");
console.log(rest.map(p => ({ name: p.name, value: p[STAT_DESCRIPTORS.killers.selector] })));

console.log("\nRest count:", rest.length);
