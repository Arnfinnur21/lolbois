import DiamondRoster from "./DiamondRoster";
import { portraitArt, profileIconUrl } from "@/lib/ddragon";
import { formatDate } from "@/lib/utils";
import { activeModeKeys } from "@/lib/categories";

// Every player's busiest mode decides their games and main champ
function rosterByGames(site, modes) {
	return site.players
		.map((player) => {
			const stat = modes
				.map((m) => m.stats[player.puuid])
				.filter(Boolean)
				.sort((a, b) => b.games - a.games)[0];
			const games = modes.reduce((n, m) => n + (m.stats[player.puuid]?.games ?? 0), 0);
			return { player, games, art: portraitArt(player, stat) };
		})
		.filter((p) => p.games > 0)
		.sort((a, b) => b.games - a.games);
}

export default function Hero({ site }) {
	const modes = activeModeKeys(site).map((key) => site.modes[key]);
	const totalGames = modes.reduce((n, m) => n + m.totalGames, 0);
	const roster = rosterByGames(site, modes);

	return (
		<section id="top" className="relative isolate flex min-h-[min(92vh,960px)] items-center overflow-hidden">
			<img src="/bg.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
			<div className="absolute inset-0 -z-10 bg-gradient-to-r from-abyss via-abyss/85 to-navy/50" />
			<div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-abyss to-transparent" />

			<div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.25fr_1fr] md:gap-16">
				<figure className="mx-auto w-full max-w-[620px]">
					{/* Most games first: each diamond is their main champ, profile icon on the tip */}
					<DiamondRoster
						items={roster.map(({ player, games, art }) => ({
							key: player.puuid,
							src: art.srcs,
							alt: art.name,
							title: `${player.name} · ${games} games${art.name ? ` · ${art.name}` : ""}`,
							badge: (
								<img
									src={profileIconUrl(site.ddragonVersion, player.iconId)}
									alt=""
									className="block w-full rounded-full ring-2 ring-gold"
								/>
							),
						}))}
					/>
					<figcaption className="eyebrow mt-8 text-center text-gold">The squad · most games first</figcaption>
				</figure>

				<div>
					<p className="title-display text-xl md:text-2xl">The season of the</p>
					<h1 className="title-display mt-3 text-7xl lg:text-8xl">Lolbois</h1>
					<p className="mt-6 max-w-md text-base leading-relaxed text-gold-pale/90">
						Every game the squad has played since {formatDate(site.seasonStart)}, crunched into who carries,
						who ints and who just pings.
					</p>
					<a
						href="#stats"
						className="mt-10 inline-block bg-gold px-8 py-4 text-sm font-medium uppercase tracking-wider text-abyss transition-colors hover:bg-gold-pale"
					>
						See the stats
					</a>
					<dl className="mt-12 flex gap-10 border-t border-gold/20 pt-6">
						{[
							["Games", totalGames.toLocaleString("en-GB")],
							["Players", site.players.length],
							["Modes", modes.length],
						].map(([label, value]) => (
							<div key={label}>
								<dt className="eyebrow text-[0.65rem] text-muted">{label}</dt>
								<dd className="title-display mt-1 text-3xl text-gold">{value}</dd>
							</div>
						))}
					</dl>
				</div>
			</div>
		</section>
	);
}
