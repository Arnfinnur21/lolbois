"use client";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import verdicts from "@/data/verdicts.json";
import { championSplashUrl, profileIconUrl } from "@/lib/ddragon";
import { buildProfiles } from "@/lib/profiles";
import { formatStat } from "@/lib/utils";
import { sectionNumber } from "./CategorySection";

const pct = (v) => formatStat("percent", v);
const GOLD = "#c8aa6e";
// Cons, losing records and sour bonds: ash grey, so no player's accent (two are red) reads as bad
const ASH = "#8d8f98";
const ROLES = { TOP: "Top", JUNGLE: "Jungle", MIDDLE: "Mid", BOTTOM: "Bot", UTILITY: "Support" };
const mix = (color, amount) => `color-mix(in srgb, ${color} ${amount}%, transparent)`;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const accentOf = (player) => verdicts[player.name]?.accent ?? GOLD;

// One full-screen panel per player over their main's splash art, washed in their colour.
// The splashes sit in one sticky layer behind the panels and crossfade as you scroll.
export default function ProfileSection({ site, mode }) {
	const { profiles, unranked } = useMemo(() => buildProfiles(site, mode), [site, mode]);
	// Each panel portals its background in here, so they all stack in the same place
	const [backdrop, setBackdrop] = useState(null);
	if (!profiles.length) return null;

	return (
		<section id="profiles" className="relative scroll-mt-28">
			<div ref={setBackdrop} className="sticky top-0 -mb-[100svh] h-[100svh] overflow-hidden bg-abyss" aria-hidden />
			{profiles.map((profile, i) => (
				<VerdictPanel
					key={profile.player.puuid}
					site={site}
					profile={profile}
					index={i}
					total={profiles.length}
					backdrop={backdrop}
				/>
			))}
			{unranked.length > 0 && (
				<p className="relative px-6 pb-16 text-center text-sm text-muted">
					Too few games to judge: {unranked.join(", ")}. Suspicious.
				</p>
			)}
		</section>
	);
}

function VerdictPanel({ site, profile, index, total, backdrop }) {
	const { player, stat, title, headline, pros, cons, partners, records } = profile;
	const verdict = verdicts[player.name] ?? {};
	const accent = verdict.accent ?? GOLD;
	const champId = player.portrait?.id ?? stat.topChamps[0]?.id;
	const main = stat.topChamps[0];

	const ref = useRef(null);
	// 0 → 1 while the panel's top rises up the screen, and while its bottom leaves the top
	const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });
	const { scrollYProgress: leave } = useScroll({ target: ref, offset: ["end end", "end start"] });
	const backdropOpacity = useTransform(enter, [0.3, 0.8], [index === 0 ? 1 : 0, 1]);
	const backdropScale = useTransform(enter, [0, 1], [1.15, 1]);
	const contentOpacity = useTransform(() =>
		Math.min(clamp01((enter.get() - 0.35) / 0.4), 1 - clamp01((leave.get() - 0.45) / 0.45))
	);

	// Later panels stack on top, so scrolling down fades each one in over the last
	const background = (
		<motion.div className="absolute inset-0" style={{ opacity: backdropOpacity, zIndex: index }}>
			{champId && (
				<motion.img
					src={championSplashUrl(champId)}
					alt=""
					decoding="async"
					className="absolute inset-0 size-full object-cover"
					style={{ objectPosition: verdict.focus ?? "50% 25%", scale: backdropScale }}
				/>
			)}
			<div className="absolute inset-0 mix-blend-color" style={{ background: accent, opacity: 0.62 }} />
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(90deg, rgb(1 10 19 / 0.94) 0%, rgb(1 10 19 / 0.7) 45%, rgb(1 10 19 / 0.05) 100%),
						linear-gradient(0deg, rgb(1 10 19 / 0.85) 0%, transparent 45%),
						radial-gradient(ellipse at 0% 100%, ${mix(accent, 35)}, transparent 60%)`,
				}}
			/>
		</motion.div>
	);

	const stats = [
		["Games", stat.games, `${stat.wins}W ${stat.games - stat.wins}L`],
		["Win rate", pct(stat.winRate), null],
		["KDA", formatStat("decimal2", stat.kda), `${formatStat("decimal", stat.kills)} / ${formatStat("decimal", stat.deaths)} / ${formatStat("decimal", stat.assists)}`],
		main && ["Main", main.name, `${main.games} games · ${pct(main.wins / main.games)}`],
	].filter(Boolean);

	return (
		<>
			{backdrop && createPortal(background, backdrop)}
			<article
				ref={ref}
				aria-labelledby={`verdict-${index}`}
				className="relative z-10 flex min-h-[100svh] items-center px-4 pb-20 pt-32 sm:px-6"
				style={{ "--accent": accent, "--accent-soft": mix(accent, 35), "--accent-faint": mix(accent, 14) }}
			>
				<motion.div className="mx-auto w-full max-w-6xl" style={{ opacity: contentOpacity }}>
					<header>
						<p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-[var(--accent)]">
							<span>
								Verdict {sectionNumber(index + 1)} / {sectionNumber(total)}
							</span>
							<span className="h-px w-8 bg-[var(--accent-soft)]" aria-hidden />
							<span>
								{verdict.class ?? "Hero"}
								{stat.mainRole && ` · ${ROLES[stat.mainRole] ?? stat.mainRole}`}
							</span>
						</p>
						<div className="mt-4 flex items-center gap-4 md:gap-6">
							<img
								src={profileIconUrl(site.ddragonVersion, player.iconId)}
								alt=""
								loading="lazy"
								className="size-14 shrink-0 rounded-full ring-2 ring-[var(--accent)] md:size-20"
							/>
							<h3
								id={`verdict-${index}`}
								className="title-display min-w-0 break-words text-5xl text-[var(--accent)] sm:text-7xl lg:text-8xl"
								style={{ textShadow: `0 0 48px ${mix(accent, 50)}` }}
							>
								{player.name}
							</h3>
						</div>
						<p className="title-display mt-6 text-2xl text-gold-pale md:text-3xl">{title}</p>
						<p className="mt-2 max-w-2xl text-sm leading-relaxed text-gold-pale/80">{headline}</p>
					</header>

					<div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
						<div>
							{verdict.lore && (
								<blockquote className="font-fell border-l-2 border-[var(--accent)] pl-5 text-lg italic leading-relaxed text-gold-pale md:text-xl">
									{verdict.lore}
								</blockquote>
							)}
							<dl className="mt-8 grid grid-cols-2 gap-px border border-[var(--accent-soft)] bg-[var(--accent-faint)] sm:grid-cols-[1fr_1fr_1fr_1.4fr]">
								{stats.map(([label, value, sub]) => (
									<div key={label} className="bg-abyss/75 px-4 py-3 backdrop-blur-md">
										<dt className="eyebrow text-[0.6rem] text-muted">{label}</dt>
										<dd className="title-display mt-1.5 truncate text-2xl normal-case text-gold-pale">{value}</dd>
										{sub && <dd className="mt-1 truncate text-[0.65rem] text-muted">{sub}</dd>}
									</div>
								))}
							</dl>
						</div>
						<Card title="Quirks" label="Pros and cons">
							<div className="grid gap-6 sm:grid-cols-2">
								<QuirkList heading="Positive" items={pros} good />
								<QuirkList heading="Negative" items={cons} />
							</div>
						</Card>
					</div>

					<div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
						<Relationships partners={partners} stat={stat} />
						<Card title="Deeds" label="Personal records this season">
							<ul className="grid grid-cols-2 gap-px bg-[var(--accent-faint)] sm:grid-cols-3">
								{records.map((r) => (
									<li key={r.key} className="bg-abyss/80 p-3">
										<p className="eyebrow truncate text-[0.55rem] text-muted">{r.label}</p>
										<p className="title-display mt-1 text-xl normal-case text-[var(--accent)]">{r.value}</p>
										<p className="mt-1 truncate text-[0.65rem] text-muted">
											{[r.note, r.champ?.name, r.win == null ? null : r.win ? "Win" : "Loss"]
												.filter(Boolean)
												.join(" · ")}
										</p>
										{r.squadBest && (
											<p className="mt-1 text-[0.55rem] font-semibold uppercase tracking-wider text-gold">
												★ Squad record
											</p>
										)}
									</li>
								))}
							</ul>
						</Card>
					</div>
				</motion.div>
			</article>
		</>
	);
}

function Card({ title, label, children }) {
	return (
		<div className="border border-[var(--accent-soft)] bg-abyss/65 p-5 backdrop-blur-md md:p-6">
			<p className="eyebrow text-[0.65rem] text-[var(--accent)]">
				{title} <span className="text-muted">· {label}</span>
			</p>
			<div className="mt-4">{children}</div>
		</div>
	);
}

function QuirkList({ heading, items, good = false }) {
	const color = good ? "var(--accent)" : ASH;
	return (
		<div>
			<p className="eyebrow text-[0.6rem]" style={{ color }}>
				{heading}
			</p>
			<ul className="mt-3 space-y-3.5">
				{items.map((q) => (
					<li key={q.name} className="border-l-2 pl-3" style={{ borderColor: color }}>
						<p className="font-fell text-lg leading-tight text-gold-pale">{q.name}</p>
						<p className="mt-1 text-xs leading-relaxed text-muted">{q.line}</p>
					</li>
				))}
			</ul>
		</div>
	);
}

// Everyone they've played enough with, best pairing first, each bar showing the win rate
// together either side of 50%
function Relationships({ partners, stat }) {
	const best = partners[0]?.winRate >= 0.5 ? partners[0] : null;
	const record = (wins, games) => `${wins}–${games - wins}`;

	return (
		<Card title="Relationships" label="Who they play best with">
			{!partners.length && (
				<p className="font-fell text-lg text-gold-pale">Too few games beside anyone. A stranger at every hearth.</p>
			)}
			{best && (
				<p className="font-fell text-lg leading-snug text-gold-pale">
					Fights best beside <span style={{ color: accentOf(best.player) }}>{best.player.name}</span>:{" "}
					{pct(best.winRate)} across {best.games} games together
					{best.withoutRate != null && `, ${pct(best.withoutRate)} apart`}. KDA {formatStat("decimal2", best.kda)}{" "}
					together, {formatStat("decimal2", stat.kda)} overall.
					{best.pure && ` As a lone duo, ${record(best.pure.wins, best.pure.games)}.`}
				</p>
			)}
			{partners.length > 0 && (
				<ol className="mt-5 space-y-2.5">
					{partners.map((p) => {
						const color = accentOf(p.player);
						// ±25 points from 50% fills one half of the bar
						const reach = Math.min(Math.abs(p.winRate - 0.5) / 0.25, 1) * 50;
						const sour = p.bond === "Resentful" || p.bond === "Hateful";
						return (
							<li
								key={p.player.puuid}
								className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.75rem_4.5rem] items-center gap-3 text-xs sm:grid-cols-[5.5rem_minmax(0,1fr)_5.75rem_4rem_4.5rem]"
								title={`${record(p.wins, p.games)} together · KDA ${formatStat("decimal2", p.kda)}${
									p.withoutRate != null ? ` · ${pct(p.withoutRate)} without` : ""
								}${p.pure ? ` · lone duo ${record(p.pure.wins, p.pure.games)}` : ""}`}
							>
								<span className="truncate font-semibold" style={{ color }}>
									{p.player.name}
								</span>
								<span className="relative h-1.5 bg-gold-pale/10">
									<span
										className="absolute inset-y-0"
										style={{
											background: p.winRate >= 0.5 ? color : ASH,
											width: `${reach}%`,
											[p.winRate >= 0.5 ? "left" : "right"]: "50%",
										}}
									/>
									<span className="absolute -inset-y-1 left-1/2 w-px bg-gold-pale/50" />
								</span>
								<span className="text-right tabular-nums text-gold-pale">
									{pct(p.winRate)} <span className="text-muted">· {p.games}</span>
								</span>
								<span className="hidden text-right tabular-nums text-muted sm:inline">
									{formatStat("decimal2", p.kda)} KDA
								</span>
								<span
									className="text-right text-[0.6rem] font-semibold uppercase tracking-wider"
									style={{ color: sour ? ASH : "var(--accent)" }}
								>
									{p.bond}
								</span>
							</li>
						);
					})}
				</ol>
			)}
			{partners.length > 0 && (
				<p className="mt-4 text-[0.65rem] leading-relaxed text-muted">
					Win rate and KDA together, ranked with games played weighed in: a long winning run beats
					a lucky handful.
				</p>
			)}
		</Card>
	);
}
