import ShapeFrame from "./ShapeFrame";
import { championCenteredUrl, mapIconUrl } from "@/lib/ddragon";

export default function ModeIntro({ site, modeKeys, mode, onChoose }) {
	const current = site.modes[mode];
	const topChamp = current.groupChamps[0];

	return (
		<section className="relative overflow-hidden py-20 md:py-28">
			<div className="mx-auto grid max-w-6xl items-center gap-14 px-6 md:grid-cols-2">
				<div className="text-center">
					<p className="eyebrow text-gold-pale">Multiple ways to</p>
					<h2 className="title-display mt-3 text-6xl md:text-7xl">Lose LP</h2>
					<p className="mx-auto mt-6 max-w-md leading-relaxed text-gold-pale/90">
						{current.totalGames.toLocaleString("en-GB")} games tracked on {current.label} this season.
						Stats are per game, and you need {site.minGames} games in a mode to rank.
					</p>

					<div className="mt-10 flex justify-center gap-6">
						{modeKeys.map((key) => {
							const m = site.modes[key];
							const active = key === mode;
							return (
								<button
									key={key}
									type="button"
									onClick={() => onChoose(key)}
									aria-pressed={active}
									className="group flex w-24 flex-col items-center gap-3"
								>
									<span
										className={`block size-24 overflow-hidden ring-1 transition ${
											active ? "ring-gold" : "opacity-50 ring-transparent group-hover:opacity-80"
										}`}
									>
										<img src={mapIconUrl(site.ddragonVersion, m.map)} alt="" className="h-full w-full object-cover" />
									</span>
									<span
										className={`text-xs font-bold uppercase leading-snug tracking-wide ${
											active ? "text-white" : "text-muted"
										}`}
									>
										{m.label}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				<figure className="mx-auto w-full max-w-[460px]">
					<ShapeFrame
						key={mode}
						shape="circle"
						src={topChamp?.id && championCenteredUrl(topChamp.id)}
						alt={topChamp?.name}
					/>
					{topChamp && (
						<figcaption className="mt-4 text-center text-sm text-muted">
							Most played here: <span className="text-gold-pale">{topChamp.name}</span> · {topChamp.games}{" "}
							games
						</figcaption>
					)}
				</figure>
			</div>
		</section>
	);
}
