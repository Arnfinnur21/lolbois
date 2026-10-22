"use client";
import { useId } from "react";
import { motion } from "framer-motion";
import ShapeEffect from "./ShapeEffect";

// Closed path through points around (50, 50), radius r(angle), in a 0–100 box
function radialPath(points, radius) {
	const coords = Array.from({ length: points }, (_, i) => {
		const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
		const r = radius(i, angle);
		return `${(50 + r * Math.cos(angle)).toFixed(2)} ${(50 + r * Math.sin(angle)).toFixed(2)}`;
	});
	return `M${coords.join(" L")} Z`;
}

// A teardrop (point up) scaled by s, with its 100×100 box's top-left at (x, y)
function dropPath(x, y, s) {
	const p = (px, py) => `${(x + px * s).toFixed(2)} ${(y + py * s).toFixed(2)}`;
	return `M${p(50, 0)} C${p(50, 0)} ${p(86, 40)} ${p(86, 64)} A${(36 * s).toFixed(2)} ${(36 * s).toFixed(2)} 0 1 1 ${p(14, 64)} C${p(14, 40)} ${p(50, 0)} ${p(50, 0)} Z`;
}

// Uneven spikes so it reads as an explosion rather than a neat star
const BLAST_SPIKES = [50, 43, 49, 41, 50, 45, 48, 42, 50, 44, 47, 43];

// Distance in radians from the nearest axis (up, right, down, left)
const offAxis = (angle) => {
	const quarter = Math.PI / 2;
	const m = (((angle % quarter) + quarter) % quarter);
	return Math.min(m, quarter - m);
};

// Every shape is a path in a 0–100 box: it clips the art (scaled into the art's box)
// and is drawn as the outline around it. `decor` is extra outline-only detail.
const SHAPES = {
	diamond: {
		path: "M50 0 L100 50 L50 100 L0 50 Z",
		artInset: "7%",
		from: { rotate: -12, scale: 0.82 },
	},
	circle: {
		path: "M50 0 A50 50 0 1 1 50 100 A50 50 0 1 1 50 0 Z",
		artInset: "6%",
		from: { rotate: 0, scale: 0.9 },
	},
	blast: {
		path: radialPath(24, (i) => (i % 2 ? 31 : BLAST_SPIKES[i / 2])),
		artInset: "6%",
		from: { rotate: -25, scale: 0.6 },
	},
	shield: {
		path: "M50 2 Q72 10 94 10 L94 42 Q94 78 50 98 Q6 78 6 42 L6 10 Q28 10 50 2 Z",
		artInset: "7%",
		from: { rotate: 0, scale: 0.85 },
	},
	skull: {
		// Cranium and jaw, with eye sockets and nose cut out (evenodd)
		path:
			"M50 3 C76 3 94 21 94 46 C94 60 86 68 79 72 L79 84 C79 91 74 96 67 96 L33 96 C26 96 21 91 21 84 L21 72 C14 68 6 60 6 46 C6 21 24 3 50 3 Z " +
			"M23 50 A12 11 0 1 0 47 50 A12 11 0 1 0 23 50 Z " +
			"M53 50 A12 11 0 1 0 77 50 A12 11 0 1 0 53 50 Z " +
			"M50 62 L44 75 L56 75 Z",
		evenOdd: true,
		artInset: "6%",
		from: { rotate: -8, scale: 0.85 },
	},
	wave: {
		path: radialPath(144, (_, a) => 44 + 4 * Math.sin(a * 6) + 2.5 * Math.sin(a * 11 + 1)),
		artInset: "7%",
		from: { rotate: 20, scale: 0.85 },
		// A faint second outline, knocked slightly out of line
		echo: { rotate: 9, scale: 1.05 },
	},
	crosshair: {
		// A circle that dips inward at the four axes, like a sight
		path: radialPath(160, (_, a) => 46 - 9 * Math.exp(-((offAxis(a) / 0.13) ** 2))),
		decor: "M50 -6 L50 12 M50 88 L50 106 M-6 50 L12 50 M88 50 L106 50",
		artInset: "6%",
		from: { rotate: 45, scale: 0.8 },
	},
	drops: {
		// One big drop, with two small ones either side at different heights
		path: `${dropPath(19, 14, 0.62)} ${dropPath(1, 52, 0.22)} ${dropPath(77, 26, 0.22)}`,
		artInset: "4%",
		from: { rotate: 0, scale: 0.85 },
	},
	wings: {
		path:
			"M50 30 C40 16 22 10 2 12 Q6 28 14 30 Q12 40 22 42 Q20 52 30 54 Q30 62 40 64 Q44 74 50 80 " +
			"Q56 74 60 64 Q70 62 70 54 Q80 52 78 42 Q88 40 86 30 Q94 28 98 12 C78 10 60 16 50 30 Z",
		decor: "M24 22 Q30 30 30 40 M76 22 Q70 30 70 40",
		artInset: "4%",
		from: { rotate: 0, scale: 0.7 },
	},
	speed: {
		// A ball rushing right, trailing three streaks
		path:
			"M62 14 A36 36 0 1 1 62 86 A36 36 0 1 1 62 14 Z " +
			"M8 30 L24 30 Q27 30 27 33 Q27 36 24 36 L8 36 Q5 36 5 33 Q5 30 8 30 Z " +
			"M2 47 L20 47 Q23 47 23 50 Q23 53 20 53 L2 53 Q-1 53 -1 50 Q-1 47 2 47 Z " +
			"M8 64 L24 64 Q27 64 27 67 Q27 70 24 70 L8 70 Q5 70 5 67 Q5 64 8 64 Z",
		artInset: "5%",
		from: { rotate: 0, scale: 0.9, x: "-12%" },
	},
	book: {
		// Open book, pages curving up from the spine
		path: "M50 22 C38 12 18 12 4 18 L4 82 C18 76 38 76 50 86 C62 76 82 76 96 82 L96 18 C82 12 62 12 50 22 Z",
		decor: "M50 22 L50 86 M12 30 C22 27 34 27 42 32 M12 42 C22 39 34 39 42 44 M58 32 C66 27 78 27 88 30 M58 44 C66 39 78 39 88 42",
		artInset: "5%",
		from: { rotate: -6, scale: 0.85 },
	},
	bag: {
		// Money bag tied at the neck
		path: "M38 4 L62 4 L57 22 C80 28 94 52 92 72 C90 92 72 98 50 98 C28 98 10 92 8 72 C6 52 20 28 43 22 Z",
		decor: "M36 25 Q50 32 64 25 M44 22 Q38 14 32 16 M56 22 Q62 14 68 16",
		artInset: "6%",
		from: { rotate: -10, scale: 0.85 },
	},
	trophy: {
		// Cup, stem and base; handles are outline-only
		path: "M22 6 L78 6 L78 30 C78 52 66 62 56 64 L56 76 L70 76 L72 94 L28 94 L30 76 L44 76 L44 64 C34 62 22 52 22 30 Z",
		decor: "M22 14 C4 14 4 44 26 46 M78 14 C96 14 96 44 74 46",
		artInset: "6%",
		from: { rotate: 0, scale: 0.8 },
	},
	anchor: {
		// Kept chunky so the art still reads; all parts wound the same way so overlaps stay filled
		path:
			"M50 1 A13 13 0 1 1 50 27 A13 13 0 1 1 50 1 Z " +
			"M24 26 L76 26 L76 37 L24 37 Z " +
			"M39 20 L61 20 L61 84 L39 84 Z " +
			"M2 56 L20 44 L23 58 C29 72 38 77 50 78 C62 77 71 72 77 58 L80 44 L98 56 C92 80 74 99 50 99 C26 99 8 80 2 56 Z",
		artInset: "4%",
		from: { rotate: -15, scale: 0.85 },
	},
};

// Art clipped into a shape, with a thin outline of the same shape set larger than it
// and centred on it. `accent` colours the outline and glow; `effect` adds particles.
export default function ShapeFrame({
	shape = "diamond",
	src,
	alt = "",
	className = "",
	style,
	delay = 0,
	accent,
	effect,
	children,
}) {
	const s = SHAPES[shape] ?? SHAPES.diamond;
	const clipId = `shape-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
	const fillRule = s.evenOdd ? "evenodd" : undefined;
	const outlineColor = accent ? { color: accent } : undefined;

	return (
		<div className={`relative aspect-square ${className}`} style={style}>
			<svg width="0" height="0" className="absolute" aria-hidden>
				<defs>
					<clipPath id={clipId} clipPathUnits="objectBoundingBox">
						<path d={s.path} transform="scale(0.01)" clipRule={fillRule} />
					</clipPath>
				</defs>
			</svg>
			<div
				className="absolute rounded-full blur-3xl"
				style={{
					inset: "20%",
					background: accent ? `color-mix(in srgb, ${accent} 22%, transparent)` : "rgb(200 170 110 / 0.1)",
				}}
				aria-hidden
			/>
			{effect && <ShapeEffect kind={effect} color={accent} layer="back" />}
			<motion.div
				className="absolute bg-navy"
				style={{ inset: s.artInset, clipPath: `url(#${clipId})` }}
				initial={{ opacity: 0, scale: 0.94 }}
				whileInView={{ opacity: 1, scale: 1 }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 0.7, ease: "easeOut", delay }}
			>
				{src && (
					<img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-abyss/60 via-transparent to-transparent" />
			</motion.div>
			{s.echo && (
				<svg
					viewBox="0 0 100 100"
					className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible opacity-35 ${accent ? "" : "text-gold"}`}
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					aria-hidden
					style={{ ...outlineColor, rotate: `${s.echo.rotate}deg`, scale: s.echo.scale }}
				>
					<path d={s.path} vectorEffect="non-scaling-stroke" />
				</svg>
			)}
			<motion.svg
				viewBox="0 0 100 100"
				className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${accent ? "" : "text-gold"}`}
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
				aria-hidden
				style={outlineColor}
				initial={{ opacity: 0, ...s.from }}
				whileInView={{ opacity: 1, rotate: 0, scale: 1, x: 0 }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + 0.15 }}
			>
				<path d={s.path} vectorEffect="non-scaling-stroke" />
				{s.decor && <path d={s.decor} vectorEffect="non-scaling-stroke" opacity="0.7" />}
			</motion.svg>
			{effect && <ShapeEffect kind={effect} color={accent} layer="front" />}
			{children}
		</div>
	);
}
