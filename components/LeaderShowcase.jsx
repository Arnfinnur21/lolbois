import ShapeFrame from "./ShapeFrame";
import { championCenteredUrl, profileIconUrl } from "@/lib/ddragon";
import { displayValue, secondaryText } from "@/lib/utils";

// `compact` is the smaller version used in paired sections
export default function LeaderShowcase({ site, descriptor, entry, shape, compact = false }) {
	const { player, stat } = entry;
	const champ = stat.topChamps[0];

	return (
		<div className={`relative mx-auto w-full pb-12 ${compact ? "max-w-[300px]" : "max-w-[420px]"}`}>
			<ShapeFrame shape={shape} src={champ?.id && championCenteredUrl(champ.id)} alt={champ?.name} />
			<div className="absolute bottom-0 left-1/2 flex w-max -translate-x-1/2 items-center gap-4 whitespace-nowrap border border-gold/40 bg-abyss/90 px-5 py-3 backdrop-blur">
				<img
					src={profileIconUrl(site.ddragonVersion, player.iconId)}
					alt=""
					className="size-12 rounded-full ring-1 ring-gold"
				/>
				<div>
					<p className="eyebrow text-[0.65rem] text-gold">#1{champ ? ` · ${champ.name}` : ""}</p>
					<p className="font-semibold text-gold-pale">{player.name}</p>
				</div>
				<div className="border-l border-gold/30 pl-4 text-right">
					<p className="title-display text-3xl normal-case text-gold">
						{displayValue(descriptor, stat)}
					</p>
					<p className="text-xs text-muted">{secondaryText(descriptor, stat)}</p>
				</div>
			</div>
		</div>
	);
}
