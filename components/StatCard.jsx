import { formatStat } from "@/lib/utils";

const RANK_CLASSES = {
	0: {
		ring: "ring-2 ring-gold-600 shadow-rank-gold",
		gradient: "bg-gradient-to-r from-gold-400 to-gold-600",
		labelBadge: "text-amber-800 bg-amber-50",
	},
	1: {
		ring: "ring-2 ring-silver-500 shadow-rank-silver",
		gradient: "bg-gradient-to-r from-silver-300 to-silver-500",
		labelBadge: "text-gray-700 bg-gray-50",
	},
	2: {
		ring: "ring-2 ring-bronze-700 shadow-rank-bronze",
		gradient: "bg-gradient-to-r from-bronze-300 to-bronze-700",
		labelBadge: "text-orange-800 bg-orange-50",
	},
};

export default function StatCard({
	name,
	iconUrl,
	value,
	valueKey,
	size = "sm",
	idx,
}) {
	const sizeClasses = size === "lg" ? "p-10 text-lg w-48" : "p-2 text-sm w-28";
	const { ring, gradient, labelBadge } = RANK_CLASSES[idx] ?? {
		ring: "",
		gradient: "",
		labelBadge: "",
	};
	const values = formatStat(valueKey, value);

	return (
		<div className={`rounded-2xl p-[2px] ${gradient}`}>
			<div
				className={`rounded-2xl bg-gray-900/90 ${ring} flex flex-col items-center ${sizeClasses}`}
			>
				{/* <div
					className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mb-1 ${labelBadge}`}
				>
					{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "—"}
				</div> */}
				<img src={iconUrl} alt={name} className="w-12 h-12 rounded-full mb-2" />
				<div className="font-bold text-center">{name}</div>
				<div className="text-yellow-400 font-extrabold text-center">
					{values.value}
				</div>
			</div>
		</div>
	);
}
