// The League client's match-history stat icons (CommunityDragon). Each file is a sprite
// with the normal state on top and a greyed state below, so only the top half is shown.
const ICONS = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-match-history/global/default";

const VALUE_ICONS = {
	gold: { url: `${ICONS}/icon_gold.png`, ratio: 56 / 48, label: "gold" },
	cs: { url: `${ICONS}/icon_minions.png`, ratio: 52 / 56, label: "CS" },
};

// Sized to the surrounding text; renders nothing for categories without an icon
export default function ValueIcon({ icon, className = "" }) {
	const meta = VALUE_ICONS[icon];
	if (!meta) return null;
	return (
		<span
			role="img"
			aria-label={meta.label}
			className={`inline-block h-[0.8em] shrink-0 bg-no-repeat align-[-0.05em] ${className}`}
			style={{
				aspectRatio: meta.ratio,
				backgroundImage: `url(${meta.url})`,
				backgroundSize: "100% 200%",
				backgroundPosition: "top",
			}}
		/>
	);
}
