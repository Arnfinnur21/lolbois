//lib/utils.js

export const STAT_DESCRIPTORS = 
{
    killers: 
    {
        key: "killers",
        title: "Killers",
        selector: "kills",
        order: "max",   
    },
    biggestInters:
    {
        key: "biggestInters",
        title: "Biggest Inters",
        selector: "deaths",
        order: "max",
    },
    killstealers:
    {
        key: "killstealers",
        title: "Killstealers",
        selector: "dmgPerKill",
        order: "min",
    },
    visionAndies:
    {
        key: "visionAndies",
        title: "Vision Andies",
        selector: "vision",
        order: "max",
    },
    mentalWarfare:
    {
        key: "mentalWarfare",
        title: "Mental Warfare Specialists",
        selector: "ccTime",
        order: "max",
    },
    greyScreenEnjoyers:
    {
        key: "greyScreen",
        title: "Grey Screen Enjoyers",
        selector: "timeSpentDead",
        order: "max",
    }

}

export const sumPings = (p) => {
    let total = 0
    Object.entries(p).forEach(([stat, value]) => {
        stat.toLowerCase().includes("pings") ? total += value : ""
    })
    return total
};


export function maxBy(arr, key){
    return arr.reduce((best, cur) => cur[key] > best[key] ? cur : best, arr[0]);
}

export function rankBy(players, descriptor){
    let sortedPlayers = descriptor.order === "max" ? [...players].sort((a,b) => b[descriptor.selector] - a[descriptor.selector]) : descriptor.order === "min" ? players.sort((a,b) => a[descriptor.selector] - b[descriptor.selector]) : ""
    let top3 = sortedPlayers.slice(0,3)
    let rest = sortedPlayers.slice(3)
    return {sorted: sortedPlayers, top3, rest}
}

