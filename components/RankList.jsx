import { profileIconUrl } from "@/lib/ddragon";
import { displayValue, secondaryText } from "@/lib/utils";

export default function RankList({ site, descriptor, entries, startRank }) {
	if (!entries.length) return null;

	return (
		<ol className="mt-8 border-t border-gold/20">
			{entries.map(({ player, stat, qualified }, i) => (
				<li
					key={player.puuid}
					className={`flex items-center gap-4 border-b border-gold/15 py-3 ${qualified ? "" : "opacity-40"}`}
				>
					<span className="title-display w-7 shrink-0 text-lg normal-case text-gold">
						{qualified ? startRank + i : "–"}
					</span>
					<img
						src={profileIconUrl(site.ddragonVersion, player.iconId)}
						alt=""
						loading="lazy"
						className="size-10 shrink-0 rounded-full ring-1 ring-gold/30"
					/>
					<div className="min-w-0 flex-1">
						<p className="truncate font-semibold">{player.name}</p>
						<p className="truncate text-xs text-muted">
							{qualified
								? `${stat.games} games${stat.topChamps[0] ? ` · ${stat.topChamps[0].name}` : ""}`
								: (descriptor.unrankedNote ?? `${stat.games} games, not enough to rank`)}
						</p>
					</div>
					{qualified && (
						<div className="shrink-0 text-right">
							<p className="font-bold tabular-nums text-gold-pale">
								{displayValue(descriptor, stat)}
							</p>
							<p className="text-xs text-muted">{secondaryText(descriptor, stat)}</p>
						</div>
					)}
				</li>
			))}
		</ol>
	);
}
