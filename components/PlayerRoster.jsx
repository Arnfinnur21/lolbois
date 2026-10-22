import { championIconUrl, itemIconUrl, profileIconUrl } from "@/lib/ddragon";
import { formatStat } from "@/lib/utils";

export default function PlayerRoster({ site, mode }) {
	const { stats, label } = site.modes[mode];
	const v = site.ddragonVersion;
	const players = [...site.players].sort((a, b) => (stats[b.puuid]?.games ?? 0) - (stats[a.puuid]?.games ?? 0));

	return (
		<section className="border-t border-gold/10 py-20 md:py-28">
			<div className="mx-auto max-w-6xl px-6">
				<div className="text-center">
					<p className="eyebrow text-gold-pale">Meet the</p>
					<h2 className="title-display mt-3 text-5xl md:text-6xl">Squad</h2>
					<p className="mt-4 text-muted">Mains and favourite items on {label}.</p>
				</div>

				<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{players.map((player) => {
						const s = stats[player.puuid];
						return (
							<article key={player.puuid} className="border border-gold/20 bg-navy/60 p-6">
								<div className="flex items-center gap-6 pl-2">
									<div className="relative size-14 shrink-0">
										<span
											className="absolute inset-0 translate-x-1 -translate-y-1 rotate-45 scale-110 border border-gold/60"
											aria-hidden
										/>
										<img
											src={profileIconUrl(v, player.iconId)}
											alt=""
											loading="lazy"
											className="relative size-14 rounded-full"
										/>
									</div>
									<div className="min-w-0">
										<h3 className="truncate font-semibold">{player.name}</h3>
										<p className="text-xs text-muted">
											#{player.tag} · Lv {player.level}
										</p>
									</div>
								</div>

								{!s ? (
									<p className="mt-6 text-sm text-muted">No games in this mode.</p>
								) : (
									<>
										<dl className="mt-6 grid grid-cols-3 gap-2 text-center">
											{[
												["Games", s.games],
												["Win", formatStat("percent", s.winRate)],
												["KDA", s.kda.toFixed(2)],
											].map(([k, val]) => (
												<div key={k}>
													<dt className="eyebrow text-[0.6rem] text-muted">{k}</dt>
													<dd className="mt-1 font-bold tabular-nums text-gold-pale">{val}</dd>
												</div>
											))}
										</dl>

										<p className="eyebrow mt-6 text-[0.6rem] text-gold">Mains</p>
										<div className="mt-2 flex gap-3">
											{s.topChamps
												.filter((c) => c.id)
												.map((c) => (
													<div key={c.id} className="text-center" title={`${c.name}: ${c.games} games`}>
														<img
															src={championIconUrl(v, c.id)}
															alt={c.name}
															loading="lazy"
															className="size-11 ring-1 ring-gold/30"
														/>
														<p className="mt-1 text-[0.65rem] text-muted">{c.games}</p>
													</div>
												))}
										</div>

										{s.favItem && (
											<>
												<p className="eyebrow mt-5 text-[0.6rem] text-gold">Fav item</p>
												<div className="mt-2 flex items-center gap-3">
													<img
														src={itemIconUrl(v, s.favItem.id)}
														alt=""
														loading="lazy"
														className="size-9 ring-1 ring-gold/30"
													/>
													<p className="text-sm leading-tight">
														{s.favItem.name}
														<span className="block text-xs text-muted">{s.favItem.games} games</span>
													</p>
												</div>
											</>
										)}
									</>
								)}
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
