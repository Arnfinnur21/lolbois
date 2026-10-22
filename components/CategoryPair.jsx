"use client";
import { motion } from "framer-motion";
import LeaderShowcase from "./LeaderShowcase";
import RankList from "./RankList";
import { tint } from "./LeaderShowcase";
import { ViewToggle, sectionId, sectionNumber, useCategoryView } from "./CategorySection";

// One half of a paired section: a smaller leader frame above the text and ranking
function PairHalf({ site, category, number, shape, delay }) {
	const { view, setView, descriptor, ranked } = useCategoryView(category);
	const [leader, ...rest] = ranked;

	return (
		<motion.div
			id={sectionId(category.descriptor.key)}
			className="scroll-mt-32"
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			transition={{ duration: 0.7, ease: "easeOut", delay }}
		>
			<LeaderShowcase site={site} descriptor={descriptor} entry={leader} shape={shape} compact />
			<p className="eyebrow mt-10 text-gold" style={{ color: category.descriptor.accent }}>
				{sectionNumber(number)} — {descriptor.eyebrow}
			</p>
			<h2 className="title-display mt-3 text-4xl md:text-5xl">{category.descriptor.title}</h2>
			<p className="mt-4 text-muted">{category.descriptor.flavor}</p>
			<ViewToggle category={category} view={view} setView={setView} />
			<RankList site={site} descriptor={descriptor} entries={rest} startRank={2} />
		</motion.div>
	);
}

// Two related categories sharing one section, side by side (stacked on phones)
export default function CategoryPair({ site, categories, number }) {
	return (
		<section className="relative isolate overflow-hidden border-t border-gold/10 py-20 md:py-28">
			{/* Each half glows in its own category's colour */}
			<div
				className="absolute inset-0 -z-10"
				style={{
					background: categories
						.map(
							(c, i) =>
								`radial-gradient(ellipse 35% 45% at ${i ? "75%" : "25%"} 30%, ${tint(c.descriptor.accent, 12)}, transparent 70%)`
						)
						.join(", "),
				}}
			/>
			<div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:gap-14">
				{categories.map((category, i) => (
					<PairHalf
						key={category.descriptor.key}
						site={site}
						category={category}
						number={number + i}
						shape={category.descriptor.shape ?? (i ? "circle" : "diamond")}
						delay={i * 0.15}
					/>
				))}
			</div>
		</section>
	);
}
