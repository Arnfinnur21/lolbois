// lib/pings.js
// Every ping type Riot tracks (API field -> label), with its in-game icon from CommunityDragon
const ICONS = "https://raw.communitydragon.org/latest/game/assets/ux/minimap/pings";

export const PING_TYPES = [
	{ key: "enemyMissingPings", label: "Enemy missing ?", icon: "mia_new" },
	{ key: "onMyWayPings", label: "On my way", icon: "on_my_way_new" },
	{ key: "assistMePings", label: "Assist me", icon: "assist" },
	{ key: "retreatPings", label: "Retreat", icon: "retreat" },
	{ key: "getBackPings", label: "Get back", icon: "get_back_small" },
	{ key: "dangerPings", label: "Danger", icon: "caution" },
	{ key: "pushPings", label: "Push", icon: "push" },
	{ key: "allInPings", label: "All in", icon: "all_in" },
	{ key: "holdPings", label: "Hold", icon: "hold" },
	{ key: "commandPings", label: "Command", icon: "target" },
	{ key: "basicPings", label: "Basic ping", icon: "ping" },
	{ key: "enemyVisionPings", label: "Enemy vision", icon: "enemychampsighted" },
	{ key: "needVisionPings", label: "Need vision", icon: "need_ward" },
	{ key: "visionClearedPings", label: "Vision cleared", icon: "cleared" },
].map((type) => ({ ...type, iconUrl: `${ICONS}/${type.icon}.png` }));

// A player's ping counts for one mode, most used first
export function pingBreakdown(stat) {
	return PING_TYPES.map((type) => ({ ...type, count: stat.totals[type.key] ?? 0 })).sort(
		(a, b) => b.count - a.count
	);
}
