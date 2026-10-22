"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import LeaderShowcase from "./LeaderShowcase";
import RankList from "./RankList";
import { championCenteredUrl } from "@/lib/ddragon";

// Which ranking a category shows: per game (unless it sets defaultView) or its total/best toggle
export function useCategoryView(category) {
	const [view, setView] = useState(category.descriptor.defaultView ?? "perGame");
	const active = view === "total" && category.total ? category.total : category;
	return { view, setView, descriptor: active.descriptor, ranked: active.ranked };
}

export function ViewToggle({ category, view, setView }) {
	if (!category.total) return null;
	const views = [
		["perGame", "Per game"],
		["total", category.descriptor.total.label ?? "Total"],
	];
	return (
		<div className="mt-6 inline-flex border border-gold/30" role="group" aria-label="Rank by">
			{views.map(([key, label]) => (
				<button
					key={key}
					type="button"
					onClick={() => setView(key)}
					aria-pressed={view === key}
					className={`px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors ${
						view === key ? "bg-gold text-abyss" : "text-muted hover:text-gold-pale"
					}`}
				>
					{label}
				</button>
			))}
		</div>
	);
}

export const sectionNumber = (n) => String(n).padStart(2, "0");

// Anchor id for a category, used by the page legend
export const sectionId = (key) => `cat-${key}`;

export default function CategorySection({ site, category, number, index }) {
	const { view, setView, descriptor, ranked } = useCategoryView(category);
	const [leader, ...rest] = ranked;
	const champ = leader.stat.topChamps[0];
	const reverse = index % 2 === 1;
	const shape = category.descriptor.shape ?? (reverse ? "circle" : "diamond");

	return (
		<section
			id={sectionId(category.descriptor.key)}
			className="relative isolate scroll-mt-14 overflow-hidden border-t border-gold/10 py-20 md:py-28"
		>
			{champ?.id && (
				<img
					src={championCenteredUrl(champ.id)}
					alt=""
					loading="lazy"
					className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.07]"
				/>
			)}
			<div className="absolute inset-0 -z-10 bg-gradient-to-b from-abyss via-abyss/40 to-abyss" />

			<div className="mx-auto grid max-w-6xl items-center gap-14 px-6 md:grid-cols-2 md:gap-20">
				<div className={reverse ? "md:order-2" : ""}>
					<LeaderShowcase site={site} descriptor={descriptor} entry={leader} shape={shape} />
				</div>

				<motion.div
					initial={{ opacity: 0, x: reverse ? -30 : 30 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.7, ease: "easeOut" }}
				>
					<p className="eyebrow text-gold">
						{sectionNumber(number)} — {descriptor.eyebrow}
					</p>
					<h2 className="title-display mt-3 text-5xl md:text-6xl">{category.descriptor.title}</h2>
					<p className="mt-4 text-muted">{category.descriptor.flavor}</p>
					<ViewToggle category={category} view={view} setView={setView} />
					<RankList site={site} descriptor={descriptor} entries={rest} startRank={2} />
				</motion.div>
			</div>
		</section>
	);
}
