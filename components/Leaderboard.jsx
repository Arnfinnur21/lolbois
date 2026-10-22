"use client";
import { useEffect, useMemo, useState } from "react";
import ModeIntro from "./ModeIntro";
import CategorySection, { sectionId, sectionNumber } from "./CategorySection";
import SectionLegend, { ProgressLine } from "./SectionLegend";
import CategoryPair from "./CategoryPair";
import PingSection from "./PingSection";
import DuoSection from "./DuoSection";
import PlayerRoster from "./PlayerRoster";
import { activeModeKeys, buildCategories, layoutCategories } from "@/lib/categories";

export default function Leaderboard({ site }) {
	const modeKeys = activeModeKeys(site);
	const [mode, setMode] = useState(modeKeys[0]);

	useEffect(() => {
		const fromUrl = new URLSearchParams(window.location.search).get("mode");
		if (modeKeys.includes(fromUrl)) setMode(fromUrl);
	}, [site]); // eslint-disable-line react-hooks/exhaustive-deps

	const choose = (key) => {
		setMode(key);
		const url = new URL(window.location.href);
		url.searchParams.set("mode", key);
		window.history.replaceState(null, "", url);
	};

	const categories = useMemo(() => buildCategories(site, mode), [site, mode]);
	// Page blocks (single or paired), each category numbered in page order
	const blocks = useMemo(() => {
		let next = 1;
		return layoutCategories(categories).map((block) => {
			const number = next;
			next += block.categories.length;
			return { ...block, number };
		});
	}, [categories]);
	// Legend entries in page order: every category, then the closing sections
	const legendItems = useMemo(
		() => [
			...blocks.flatMap((block) =>
				block.categories.map((c, i) => ({
					id: sectionId(c.descriptor.key),
					label: c.descriptor.title,
					number: sectionNumber(block.number + i),
				}))
			),
			{ id: "pings", label: "Ping Spammers" },
			{ id: "duos", label: "Duos" },
			{ id: "squad", label: "Squad" },
		],
		[blocks]
	);

	if (!mode) return null;

	return (
		<div id="stats">
			<ModeIntro site={site} modeKeys={modeKeys} mode={mode} onChoose={choose} />

			<SectionLegend items={legendItems} startId={legendItems[0]?.id} />

			<nav className="sticky top-0 z-40 border-y border-gold/15 bg-abyss/85 backdrop-blur">
				<ProgressLine />
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
					<a href="#top" className="title-display text-lg">
						Lolbois
					</a>
					<div className="flex gap-1">
						{modeKeys.map((key) => (
							<button
								key={key}
								type="button"
								onClick={() => choose(key)}
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
			</nav>

			{categories.length === 0 && (
				<p className="px-6 py-24 text-center text-muted">
					Nobody has {site.minGames}+ games in {site.modes[mode].label} yet.
				</p>
			)}
			{blocks.map(({ categories: group, number }, i) =>
				group.length === 2 ? (
					<CategoryPair
						key={`${mode}-${group.map((c) => c.descriptor.key).join("-")}`}
						site={site}
						categories={group}
						number={number}
					/>
				) : (
					<CategorySection
						key={`${mode}-${group[0].descriptor.key}`}
						site={site}
						category={group[0]}
						number={number}
						index={i}
					/>
				)
			)}
			<PingSection key={`pings-${mode}`} site={site} mode={mode} />
			<DuoSection key={`duos-${mode}`} site={site} mode={mode} />
			<PlayerRoster key={`roster-${mode}`} site={site} mode={mode} />
		</div>
	);
}
