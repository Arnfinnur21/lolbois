"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ModeIntro from "./ModeIntro";
import CategorySection, { sectionId, sectionNumber } from "./CategorySection";
import SectionLegend, { ProgressLine } from "./SectionLegend";
import CategoryPair from "./CategoryPair";
import RecordsWall from "./RecordsWall";
import { ChapterFooter, ChapterHeader, ChapterTabs } from "./Chapters";
import PingSection from "./PingSection";
import DuoSection from "./DuoSection";
import PlayerRoster from "./PlayerRoster";
import ProfileSection from "./ProfileSection";
import { CHAPTERS, activeModeKeys, buildCategories, layoutCategories, pickCategories } from "@/lib/categories";

// Non-category sections a chapter can end with, and their legend labels
const EXTRAS = {
	pings: { label: "Ping Spammers", Component: PingSection },
	duos: { label: "Duos", Component: DuoSection },
	squad: { label: "Squad", Component: PlayerRoster },
	profiles: { label: "Profiles", Component: ProfileSection },
};

const setUrlParam = (key, value) => {
	const url = new URL(window.location.href);
	url.searchParams.set(key, value);
	window.history.replaceState(null, "", url);
};

export default function Leaderboard({ site, seasonSwitch }) {
	const modeKeys = activeModeKeys(site);
	const [mode, setMode] = useState(modeKeys[0]);
	const [chapterKey, setChapterKey] = useState(CHAPTERS[0].key);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (modeKeys.includes(params.get("mode"))) setMode(params.get("mode"));
		if (CHAPTERS.some((c) => c.key === params.get("chapter"))) setChapterKey(params.get("chapter"));
	}, [site]); // eslint-disable-line react-hooks/exhaustive-deps

	const chooseMode = (key) => {
		setMode(key);
		setUrlParam("mode", key);
	};

	// Switch chapter and bring its title up under the sticky bar
	const chooseChapter = (key) => {
		setChapterKey(key);
		setUrlParam("chapter", key);
		document.getElementById("chapter-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const chapterIndex = Math.max(0, CHAPTERS.findIndex((c) => c.key === chapterKey));
	const chapter = CHAPTERS[chapterIndex];
	const nextChapter = CHAPTERS[(chapterIndex + 1) % CHAPTERS.length];

	const categories = useMemo(() => buildCategories(site, mode), [site, mode]);
	// This chapter's blocks (single or paired), numbered within the chapter
	const blocks = useMemo(() => {
		let next = 1;
		return layoutCategories(categories, chapter.layout ?? []).map((block) => {
			const number = next;
			next += block.categories.length;
			return { ...block, number };
		});
	}, [categories, chapter]);
	const records = useMemo(() => pickCategories(categories, chapter.records ?? []), [categories, chapter]);
	const extras = chapter.extras ?? [];

	// Legend entries for this chapter only, in page order
	const legendItems = useMemo(
		() => [
			...blocks.flatMap((block) =>
				block.categories.map((c, i) => ({
					id: sectionId(c.descriptor.key),
					label: c.descriptor.title,
					number: sectionNumber(block.number + i),
				}))
			),
			...records.map((c) => ({ id: sectionId(c.descriptor.key), label: c.descriptor.title })),
			...extras.map((key) => ({ id: key, label: EXTRAS[key].label })),
		],
		[blocks, records, extras]
	);

	if (!mode) return null;

	return (
		<div id="stats">
			<ModeIntro site={site} modeKeys={modeKeys} mode={mode} onChoose={chooseMode} />

			<SectionLegend items={legendItems} startId="chapter-top" />

			<nav className="sticky top-0 z-40 border-y border-gold/15 bg-abyss/85 backdrop-blur">
				<ProgressLine />
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 pt-3">
					<div className="flex items-center gap-3">
						<a href="#top" className="title-display text-lg">
							Lolbois
						</a>
						{seasonSwitch}
					</div>
					<div className="flex flex-wrap justify-end gap-1">
						{modeKeys.map((key) => (
							<button
								key={key}
								type="button"
								onClick={() => chooseMode(key)}
								aria-pressed={key === mode}
								className={`px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors ${
									key === mode ? "bg-gold text-abyss" : "text-muted hover:text-gold-pale"
								}`}
							>
								{site.modes[key].label}
							</button>
						))}
					</div>
				</div>
				<div className="mx-auto max-w-6xl px-6">
					<ChapterTabs chapters={CHAPTERS} active={chapter.key} onSelect={chooseChapter} />
				</div>
			</nav>

			{categories.length === 0 ? (
				<p className="px-6 py-24 text-center text-muted">
					Nobody has {site.minGames}+ games in {site.modes[mode].label} yet.
				</p>
			) : (
				// No initial={false}: it would pass down and skip every entrance animation in the first chapter
				<AnimatePresence mode="wait">
					<motion.div
						key={`${mode}-${chapter.key}`}
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
					>
						<ChapterHeader chapter={chapter} index={chapterIndex} total={CHAPTERS.length} />
						{blocks.map(({ categories: group, number }, i) =>
							group.length === 2 ? (
								<CategoryPair
									key={group.map((c) => c.descriptor.key).join("-")}
									site={site}
									categories={group}
									number={number}
								/>
							) : (
								<CategorySection
									key={group[0].descriptor.key}
									site={site}
									category={group[0]}
									number={number}
									index={i}
								/>
							)
						)}
						{records.length > 0 && <RecordsWall site={site} categories={records} />}
						{extras.map((key) => {
							const { Component } = EXTRAS[key];
							return <Component key={key} site={site} mode={mode} />;
						})}
						<ChapterFooter next={{ ...nextChapter, first: nextChapter === CHAPTERS[0] }} onSelect={chooseChapter} />
					</motion.div>
				</AnimatePresence>
			)}
		</div>
	);
}
