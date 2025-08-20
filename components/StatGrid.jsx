"use client";
import StatCard from "./StatCard";
import { motion } from "framer-motion";

export default function StatGrid({ items, valueKey }) {
	const top3 = items.slice(0, 3);
	const rest5 = items.slice(3, 8);
	const val = (p) => p?.[valueKey] ?? 0;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-4 justify-center">
				{top3.map((p, i) => (
					<motion.div
						key={p.puuid || i}
						initial={{ scale: 0 }}
						animate={{ scale: [0, 1.05, 0.95, 1] }}
						transition={{
							duration: 0.8,
							ease: "easeOut",
							delay: i * 0.1, // 0.1s later for each card
						}}
						style={{ display: "inline-block" }}
					>
						<StatCard
							key={p.puuid || i}
							idx={i}
							name={p.name}
							iconUrl={p.profileIconUrl}
							value={val(p)}
							valueKey={valueKey}
							size="lg"
						/>
					</motion.div>
				))}
			</div>
			<div className="flex gap-2 justify-center flex-wrap">
				{rest5.map((p, i) => (
					<StatCard
						key={p.puuid || i}
						name={p.name}
						iconUrl={p.profileIconUrl}
						value={val(p)}
						valueKey={valueKey}
						size="sm"
					/>
				))}
			</div>
		</div>
	);
}
