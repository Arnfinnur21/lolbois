import { playerById } from "@/lib/categories";
import { profileIconUrl } from "@/lib/ddragon";
import { formatStat } from "@/lib/utils";

const LIMIT = 5;

function DuoList({ site, title, duos, tone }) {
	return (
		<div>
			<h3 className="eyebrow text-gold">{title}</h3>
			{duos.length === 0 ? (
				<p className="mt-6 text-sm text-muted">Nobody yet.</p>
			) : (
				<ol className="mt-4 border-t border-gold/20">
					{duos.map((duo) => {
						const [a, b] = duo.players.map((id) => playerById(site, id));
						return (
							<li key={duo.players.join("|")} className="flex items-center gap-4 border-b border-gold/15 py-4">
								<div className="flex shrink-0 -space-x-3">
									{[a, b].map((p) => (
										<img
											key={p.puuid}
											src={profileIconUrl(site.ddragonVersion, p.iconId)}
											alt=""
											loading="lazy"
											className="size-10 rounded-full ring-2 ring-abyss"
										/>
									))}
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-semibold">
										{a.name} <span className="text-muted">&amp;</span> {b.name}
									</p>
									<div className="mt-2 h-1 bg-gold/15">
										<div className={`h-full ${tone}`} style={{ width: `${duo.winRate * 100}%` }} />
									</div>
								</div>
								<div className="shrink-0 text-right">
									<p className="font-bold tabular-nums">{formatStat("percent", duo.winRate)}</p>
									<p className="text-xs text-muted">{duo.games} games</p>
								</div>
							</li>
						);
					})}
				</ol>
			)}
		</div>
	);
}

export default function DuoSection({ site, mode }) {
	const duos = site.modes[mode].duos;
	const best = duos.filter((d) => d.winRate >= 0.5).slice(0, LIMIT);
	const cursed = duos
		.filter((d) => d.winRate < 0.5)
		.reverse()
		.slice(0, LIMIT);

	return (
		<section className="border-t border-gold/10 py-20 md:py-28">
			<div className="mx-auto max-w-6xl px-6">
				<div className="text-center">
					<p className="eyebrow text-gold-pale">Better together?</p>
					<h2 className="title-display mt-3 text-5xl md:text-6xl">Duos</h2>
					<p className="mt-4 text-muted">
						Win rate when two of the squad are on the same team ({site.minDuoGames}+ games together).
					</p>
				</div>
				<div className="mt-14 grid gap-14 md:grid-cols-2">
					<DuoList site={site} title="Dream teams" duos={best} tone="bg-hextech" />
					<DuoList site={site} title="Cursed pairings" duos={cursed} tone="bg-gold-dark" />
				</div>
			</div>
		</section>
	);
}
