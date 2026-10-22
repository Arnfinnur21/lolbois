// lib/modes.js
// Queue ids: https://static.developer.riotgames.com/docs/lol/queues.json

export const SEASON_START = "2026-01-08"; // first day of the 2026 season
export const MIN_GAMES = 10; // games needed in a mode to be ranked on per-game stats
export const MIN_DUO_GAMES = 5; // games together needed for a duo to be ranked
export const MIN_GAME_SECONDS = 300; // shorter games are remakes

export const MODES = {
	sr: {
		label: "Summoner's Rift",
		// draft, ranked solo, blind, ranked flex, swiftplay, quickplay
		queues: [400, 420, 430, 440, 480, 490],
		map: 11,
	},
	mayhem: {
		label: "ARAM: Mayhem",
		queues: [2400],
		map: 12,
	},
	// aram: { label: "ARAM", queues: [450], map: 12 },
};
