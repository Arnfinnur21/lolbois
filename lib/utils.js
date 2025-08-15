//lib/utils.js

export const STAT_DESCRIPTORS =
{
    killers:
    {
        key: "killers",
        title: "Killers",
        subtitle: "Total Kills",
        selector: "kills",
        order: "max",
    },
    biggestInters:
    {
        key: "biggestInters",
        title: "Biggest Inters",
        subtitle: "Total Deaths",
        selector: "deaths",
        order: "max",
    },
    killstealers:
    {
        key: "killstealers",
        title: "Killstealers",
        subtitle: "Least Damage per kill",
        selector: "dmgPerKill",
        order: "min",
    },
    visionAndies:
    {
        key: "visionAndies",
        title: "Vision Andies",
        subtitle: "Wards Placed",
        selector: "vision",
        order: "max",
    },
    mentalWarfare:
    {
        key: "mentalWarfare",
        title: "Mental Warfare Specialists",
        subtitle: "CC Time Inflicted on enemies",
        selector: "ccTime",
        order: "max",
    },
    greyScreenEnjoyers:
    {
        key: "greyScreen",
        title: "Grey Screen Enjoyers",
        subtitle: "Time Spent Dead",
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


export function maxBy(arr, key) {
    return arr.reduce((best, cur) => cur[key] > best[key] ? cur : best, arr[0]);
}

export function rankBy(players, descriptor) {
    let sorted = descriptor.order === "max" ? [...players].sort((a, b) => b[descriptor.selector] - a[descriptor.selector]) : descriptor.order === "min" ? [...players].sort((a, b) => a[descriptor.selector] - b[descriptor.selector]) : ""
    return sorted
}


export const formatStat = (valueKey, value) => {
    const formattingMap = {
        dmgPerKill: {
            label: "Damage Per Kill",
            format: (val) => (val / 1000).toFixed(1) + "k",
        },
        kills: {
            label: "Kills",
            format: (val) => val,
        },
        deaths: {
            label: "Deaths",
            format: (val) => val,
        },
        vision: {
            label: "Wards Placed",
            format: (val) => val,
        },
        dmgDealt: {
            label: "Damage Dealt",
            format: (val) => val.toLocaleString(),
        },
        ccTime: {
            label: "Seconds of CC inflicted",
            format: (val) => val,
        },
        timeSpentDead: {
            label: "",
            format: (val) => convertNumberToTime(val)
        },

        // Add more as needed
    };

    const formatter = formattingMap[valueKey];

    if (!formatter) {
        return { value, label: valueKey }; // fallback
    }

    return {
        value: formatter.format(value),
        label: formatter.label,
    };
};



export const convertNumberToTime = (seconds) => {
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${minutes}m ${secs}s`;
}
