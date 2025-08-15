import { STAT_DESCRIPTORS, rankBy } from "./utils"
import playerData from "../data/players.full.json" assert { type: "json" };

// Filter out the timestamp row
const players = playerData.filter(p => p && typeof p === "object" && p.name);
// const players = playersFiltered.sorted;
export const categories = [
  { title: STAT_DESCRIPTORS.killers.title, subtitle: STAT_DESCRIPTORS.killers.subtitle, items: rankBy(players, STAT_DESCRIPTORS.killers).slice(0, 8), valueKey: STAT_DESCRIPTORS.killers.selector },
  { title: STAT_DESCRIPTORS.biggestInters.title, subtitle: STAT_DESCRIPTORS.biggestInters.subtitle, items: rankBy(players, STAT_DESCRIPTORS.biggestInters).slice(0, 8), valueKey: STAT_DESCRIPTORS.biggestInters.selector },
  { title: STAT_DESCRIPTORS.killstealers.title, subtitle: STAT_DESCRIPTORS.killstealers.subtitle, items: rankBy(players, STAT_DESCRIPTORS.killstealers).slice(0, 8), valueKey: STAT_DESCRIPTORS.killstealers.selector },
  { title: STAT_DESCRIPTORS.visionAndies.title, subtitle: STAT_DESCRIPTORS.visionAndies.subtitle, items: rankBy(players, STAT_DESCRIPTORS.visionAndies).slice(0, 8), valueKey: STAT_DESCRIPTORS.visionAndies.selector },
  { title: STAT_DESCRIPTORS.mentalWarfare.title, subtitle: STAT_DESCRIPTORS.mentalWarfare.subtitle, items: rankBy(players, STAT_DESCRIPTORS.mentalWarfare).slice(0, 8), valueKey: STAT_DESCRIPTORS.mentalWarfare.selector },
  { title: STAT_DESCRIPTORS.greyScreenEnjoyers.title, subtitle: STAT_DESCRIPTORS.greyScreenEnjoyers.subtitle, items: rankBy(players, STAT_DESCRIPTORS.greyScreenEnjoyers).slice(0, 8), valueKey: STAT_DESCRIPTORS.greyScreenEnjoyers.selector },
];

