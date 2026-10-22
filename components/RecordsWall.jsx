"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ShapeFrame from "./ShapeFrame";
import RankList, { PlayerName } from "./RankList";
import ValueIcon from "./ValueIcon";
import { ViewToggle, sectionId, useCategoryView } from "./CategorySection";
import { championCenteredUrl, profileIconUrl } from "@/lib/ddragon";
import { displayValue, roleNoteFor, secondaryText } from "@/lib/utils";

// One record as a card: the holder in a small frame, runners-up below, click for everything
function RecordCard({ site, category, index, onOpen }) {
	const { descriptor, ranked } = category;
	const [leader, ...rest] = ranked;
	const champ = leader.stat.topChamps[0];
	const shape = descriptor.shape ?? (index % 2 ? "circle" : "diamond");

	return (
		<motion.button
			type="button"
			id={sectionId(descriptor.key)}
			onClick={onOpen}
			className="group flex scroll-mt-28 flex-col border border-gold/20 bg-navy/50 p-5 text-left transition-colors hover:border-gold/60 hover:bg-navy/80"
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.2 }}
			transition={{ duration: 0.5, ease: "easeOut", delay: (index % 4) * 0.08 }}
		>
			<p className="eyebrow text-[0.62rem] text-gold">{descriptor.eyebrow}</p>
			<h3 className="title-display mt-2 text-2xl">{descriptor.title}</h3>
			<p className="mt-1 text-xs text-muted">{descriptor.flavor}</p>

			<div className="mx-auto mt-5 w-3/5 transition-transform duration-300 group-hover:scale-105">
				<ShapeFrame shape={shape} src={champ?.id && championCenteredUrl(champ.id)} alt={champ?.name} />
			</div>

			<div className="mt-4 flex items-center gap-3">
				<img
					src={profileIconUrl(site.ddragonVersion, leader.player.iconId)}
					alt=""
					loading="lazy"
					className="size-10 shrink-0 rounded-full ring-1 ring-gold"
				/>
				<div className="min-w-0 flex-1">
					<PlayerName
						name={leader.player.name}
						note={roleNoteFor(descriptor, leader.stat)}
						className="truncate font-semibold"
					/>
					<p className="truncate text-xs text-muted">{secondaryText(descriptor, leader.stat)}</p>
				</div>
				<p className="title-display shrink-0 text-2xl normal-case text-gold">
					<ValueIcon icon={descriptor.valueIcon} className="mr-1.5" />
					{displayValue(descriptor, leader.stat)}
				</p>
			</div>

			<ol className="mt-4 border-t border-gold/15 text-xs">
				{rest
					.filter((e) => e.qualified)
					.slice(0, 2)
					.map((e, i) => (
						<li key={e.player.puuid} className="flex items-center gap-2 border-b border-gold/10 py-1.5">
							<span className="title-display w-4 normal-case text-gold">{i + 2}</span>
							<span className="flex-1 truncate">{e.player.name}</span>
							<span className="tabular-nums text-gold-pale">{displayValue(descriptor, e.stat)}</span>
						</li>
					))}
			</ol>

			<span className="mt-auto pt-4 text-[0.65rem] font-semibold uppercase tracking-wider text-gold/60 transition-colors group-hover:text-gold">
				Full ranking →
			</span>
		</motion.button>
	);
}

// Full ranking for one record, over the page
function RankingDialog({ site, category, onClose }) {
	const { view, setView, descriptor, ranked } = useCategoryView(category);

	useEffect(() => {
		const onKey = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<motion.div
			className="fixed inset-0 z-50 flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-sm"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}
		>
			<motion.div
				role="dialog"
				aria-modal="true"
				aria-labelledby="ranking-title"
				className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto border border-gold/40 bg-navy p-6 md:p-8"
				initial={{ scale: 0.95, y: 12 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.97, y: 6 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="absolute right-4 top-4 text-xl leading-none text-muted transition-colors hover:text-gold"
				>
					✕
				</button>
				<p className="eyebrow text-gold">{descriptor.eyebrow}</p>
				<h3 id="ranking-title" className="title-display mt-2 pr-8 text-4xl">
					{category.descriptor.title}
				</h3>
				<p className="mt-2 text-sm text-muted">{category.descriptor.flavor}</p>
				<ViewToggle category={category} view={view} setView={setView} />
				<RankList site={site} descriptor={descriptor} entries={ranked} startRank={1} />
			</motion.div>
		</motion.div>
	);
}

export default function RecordsWall({ site, categories }) {
	const [openKey, setOpenKey] = useState(null);
	const open = categories.find((c) => c.descriptor.key === openKey);

	return (
		<section className="border-t border-gold/10 py-16 md:py-20">
			<div className="mx-auto grid max-w-6xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-4">
				{categories.map((category, i) => (
					<RecordCard
						key={category.descriptor.key}
						site={site}
						category={category}
						index={i}
						onOpen={() => setOpenKey(category.descriptor.key)}
					/>
				))}
			</div>
			<AnimatePresence>
				{open && <RankingDialog key={openKey} site={site} category={open} onClose={() => setOpenKey(null)} />}
			</AnimatePresence>
		</section>
	);
}
