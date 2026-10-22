import ShapeFrame from "./ShapeFrame";
import { championCenteredUrl, profileIconUrl } from "@/lib/ddragon";
import { displayValue, roleNoteFor, secondaryText } from "@/lib/utils";
import { PlayerName } from "./RankList";
import ValueIcon from "./ValueIcon";

// The category's accent at some strength, for borders and glows
export const tint = (accent, percent) =>
	accent ? `color-mix(in srgb, ${accent} ${percent}%, transparent)` : undefined;


// `compact` is the smaller version used in paired sections
export default function LeaderShowcase({ site, descriptor, entry, shape, compact = false }) {
	const { player, stat } = entry;
	const champ = stat.topChamps[0];

	return (
		<div className={`relative mx-auto w-full pb-12 ${compact ? "max-w-[300px]" : "max-w-[420px]"}`}>
			<ShapeFrame
				shape={shape}
				src={champ?.id && championCenteredUrl(champ.id)}
				alt={champ?.name}
				accent={descriptor.accent}
				effect={descriptor.effect}
			/>
			<div
				className="absolute bottom-0 left-1/2 z-10 flex w-max -translate-x-1/2 items-center gap-4 whitespace-nowrap border border-gold/40 bg-abyss/90 px-5 py-3 backdrop-blur"
				style={{ borderColor: tint(descriptor.accent, 55) }}
			>
				<img
					src={profileIconUrl(site.ddragonVersion, player.iconId)}
					alt=""
					className="size-12 rounded-full ring-1 ring-gold"
				/>
				<div>
					<p className="eyebrow text-[0.65rem] text-gold" style={{ color: descriptor.accent }}>#1{champ ? ` · ${champ.name}` : ""}</p>
					<PlayerName
						name={player.name}
						note={roleNoteFor(descriptor, stat)}
						className="max-w-[11rem] whitespace-normal font-semibold text-gold-pale"
					/>
				</div>
				<div className="border-l border-gold/30 pl-4 text-right">
					<p className="title-display text-3xl normal-case text-gold">
						<ValueIcon icon={descriptor.valueIcon} className="mr-2" />
						{displayValue(descriptor, stat)}
					</p>
					<p className="text-xs text-muted">{secondaryText(descriptor, stat)}</p>
				</div>
			</div>
		</div>
	);
}
