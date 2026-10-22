"use client";
import { motion } from "framer-motion";
import { sectionNumber } from "./CategorySection";

// Tab row in the sticky bar; the gold underline slides to the active chapter
export function ChapterTabs({ chapters, active, onSelect }) {
	return (
		<div
			role="tablist"
			aria-label="Chapters"
			className="-mx-6 flex gap-1 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			{chapters.map((chapter, i) => {
				const isActive = chapter.key === active;
				return (
					<button
						key={chapter.key}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onSelect(chapter.key)}
						className={`relative shrink-0 px-3 py-3 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors ${
							isActive ? "text-gold-pale" : "text-muted hover:text-gold-pale"
						}`}
					>
						<span className="mr-1.5 text-gold/60">{sectionNumber(i + 1)}</span>
						{chapter.label}
						{isActive && (
							<motion.span
								layoutId="chapter-underline"
								className="absolute inset-x-3 bottom-0 h-0.5 bg-gold"
								transition={{ type: "spring", stiffness: 420, damping: 36 }}
							/>
						)}
					</button>
				);
			})}
		</div>
	);
}

export function ChapterHeader({ chapter, index, total }) {
	return (
		<header id="chapter-top" className="scroll-mt-24 border-t border-gold/10 px-6 pb-6 pt-20 text-center md:pt-24">
			<p className="eyebrow text-gold">
				Chapter {sectionNumber(index + 1)} / {sectionNumber(total)}
			</p>
			<h2 className="title-display mt-3 text-6xl md:text-7xl">{chapter.label}</h2>
			<p className="mx-auto mt-4 max-w-md text-muted">{chapter.blurb}</p>
		</header>
	);
}

// Big link to the next chapter, or back to the start after the last one
export function ChapterFooter({ next, onSelect }) {
	return (
		<div className="border-t border-gold/10 px-6 py-20 text-center md:py-24">
			<button
				type="button"
				onClick={() => onSelect(next.key)}
				className="group inline-flex flex-col items-center"
			>
				<span className="eyebrow text-muted transition-colors group-hover:text-gold">
					{next.first ? "Back to the start" : "Next chapter"}
				</span>
				<span className="title-display mt-3 text-4xl transition-colors group-hover:text-gold md:text-5xl">
					{next.label}
					<span className="ml-3 inline-block transition-transform group-hover:translate-x-2">→</span>
				</span>
			</button>
		</div>
	);
}
