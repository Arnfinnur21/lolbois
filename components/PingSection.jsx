"use client";
import { useState } from "react";
import DiamondRoster from "./DiamondRoster";
import { profileIconUrl } from "@/lib/ddragon";
import { pingBreakdown } from "@/lib/pings";
import { formatStat } from "@/lib/utils";

function PingBadge({ type }) {
	return (
		<span className="flex aspect-square w-full items-center justify-center rounded-full bg-abyss ring-2 ring-gold">
			<img src={type.iconUrl} alt={type.label} className="w-3/4" />
		</span>
	);
}

function Breakdown({ site, entry, rank }) {
	const { player, stat, pings } = entry;
	const most = pings[0].count || 1;

	return (
		<div className="border border-gold/20 bg-navy/60 p-6">
			<div className="flex items-center gap-4">
				<img
					src={profileIconUrl(site.ddragonVersion, player.iconId)}
					alt=""
					className="size-14 rounded-full ring-1 ring-gold"
				/>
				<div className="min-w-0 flex-1">
					<p className="eyebrow text-[0.65rem] text-gold">#{rank} pinger</p>
					<p className="truncate text-lg font-semibold">{player.name}</p>
				</div>
				<div className="text-right">
					<p className="title-display text-3xl normal-case text-gold">
						{formatStat("integer", stat.totals.pings)}
					</p>
					<p className="text-xs text-muted">{formatStat("decimal", stat.pings)} per game</p>
				</div>
			</div>

			<ol className="mt-6 space-y-2.5">
				{pings.map((type) => (
					<li key={type.key} className={`flex items-center gap-3 ${type.count ? "" : "opacity-35"}`}>
						<img src={type.iconUrl} alt="" className="size-6 shrink-0" />
						<div className="min-w-0 flex-1">
							<div className="flex items-baseline justify-between gap-2 text-sm">
								<span className="truncate">{type.label}</span>
								<span className="shrink-0 tabular-nums">
									<span className="font-semibold text-gold-pale">{formatStat("integer", type.count)}</span>
									<span className="ml-2 text-xs text-muted">
										{formatStat("decimal", type.count / stat.games)}/g
									</span>
								</span>
							</div>
							<div className="mt-1 h-1 bg-gold/15">
								<div className="h-full bg-gold" style={{ width: `${(type.count / most) * 100}%` }} />
							</div>
						</div>
					</li>
				))}
			</ol>
		</div>
	);
}

// Every player ordered by total pings, their most used ping on the tip; pick one for the breakdown
export default function PingSection({ site, mode }) {
	const { stats } = site.modes[mode];
	const entries = site.players
		.filter((player) => stats[player.puuid]?.games)
		.map((player) => ({ player, stat: stats[player.puuid], pings: pingBreakdown(stats[player.puuid]) }))
		.sort((a, b) => b.stat.totals.pings - a.stat.totals.pings);
	const [selected, setSelected] = useState(entries[0]?.player.puuid);
	const index = Math.max(0, entries.findIndex((e) => e.player.puuid === selected));

	if (!entries.length) return null;

	return (
		<section id="pings" className="scroll-mt-28 border-t border-gold/10 py-20 md:py-28">
			<div className="mx-auto max-w-6xl px-6">
				<div className="text-center">
					<p className="eyebrow text-gold-pale">Most pings this season</p>
					<h2 className="title-display mt-3 text-5xl md:text-6xl">Ping Spammers</h2>
					<p className="mt-4 text-muted">? ? ? ? ? Tap a player for their full breakdown.</p>
				</div>

				<div className="mt-16 grid items-start gap-14 md:grid-cols-[1.2fr_1fr]">
					<DiamondRoster
						className="md:pt-6"
						items={entries.map(({ player, stat, pings }) => ({
							key: player.puuid,
							src: profileIconUrl(site.ddragonVersion, player.iconId),
							alt: player.name,
							title: `${player.name} · ${formatStat("integer", stat.totals.pings)} pings · mostly ${pings[0].label}`,
							badge: <PingBadge type={pings[0]} />,
							onSelect: () => setSelected(player.puuid),
							active: player.puuid === entries[index].player.puuid,
						}))}
					/>
					<Breakdown site={site} entry={entries[index]} rank={index + 1} />
				</div>

				<p className="mt-10 text-center text-xs text-muted">
					Riot only counts ping-wheel pings. Scoreboard and HUD pings (summoner timers, items) and chat aren&apos;t
					tracked.
				</p>
			</div>
		</section>
	);
}
