import { profileIconUrl } from "@/lib/ddragon";
import { displayValue, roleNoteFor, secondaryText } from "@/lib/utils";
import ValueIcon from "./ValueIcon";

// A player's name, slightly greyed with a note after it when the category flags their role
export function PlayerName({ name, note, className = "" }) {
	if (!note) return <p className={className}>{name}</p>;
	return (
		<p className={`${className.replace(/\btruncate\b/, "")} opacity-60`}>
			{name} <span className="text-xs font-normal italic text-muted">{note}</span>
		</p>
	);
}

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
						<PlayerName name={player.name} note={roleNoteFor(descriptor, stat)} className="truncate font-semibold" />
						<p className="truncate text-xs text-muted">
							{qualified
								? `${stat.games} games${stat.topChamps[0] ? ` · ${stat.topChamps[0].name}` : ""}`
								: (descriptor.unrankedNote ?? `${stat.games} games, not enough to rank`)}
						</p>
					</div>
					{qualified && (
						<div className="shrink-0 text-right">
							<p className="font-bold tabular-nums text-gold-pale">
								<ValueIcon icon={descriptor.valueIcon} className="mr-1.5" />
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
