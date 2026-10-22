"use client";
import { useId } from "react";
import { motion } from "framer-motion";

// Closed path through points around (50, 50), radius r(angle), in a 0–100 box
function radialPath(points, radius) {
	const coords = Array.from({ length: points }, (_, i) => {
		const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
		const r = radius(i, angle);
		return `${(50 + r * Math.cos(angle)).toFixed(2)} ${(50 + r * Math.sin(angle)).toFixed(2)}`;
	});
	return `M${coords.join(" L")} Z`;
}

// Uneven spikes so it reads as an explosion rather than a neat star
const BLAST_SPIKES = [50, 43, 49, 41, 50, 45, 48, 42, 50, 44, 47, 43];

// Every shape is a path in a 0–100 box: it clips the art (scaled into the art's box)
// and is drawn as the gold outline around it
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
};

// Art clipped into a shape, with a thin gold outline of the same shape set
// larger than it and centred on it, leaving an even gap all round.
export default function ShapeFrame({ shape = "diamond", src, alt = "", className = "", style, delay = 0, children }) {
	const s = SHAPES[shape] ?? SHAPES.diamond;
	const clipId = `shape-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
	const fillRule = s.evenOdd ? "evenodd" : undefined;

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
				className="absolute rounded-full bg-gold/10 blur-3xl"
				style={{ inset: "20%" }}
				aria-hidden
			/>
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
					className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-gold/35"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					aria-hidden
					style={{ rotate: `${s.echo.rotate}deg`, scale: s.echo.scale }}
				>
					<path d={s.path} vectorEffect="non-scaling-stroke" />
				</svg>
			)}
			<motion.svg
				viewBox="0 0 100 100"
				className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-gold"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				aria-hidden
				initial={{ opacity: 0, ...s.from }}
				whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + 0.15 }}
			>
				<path d={s.path} vectorEffect="non-scaling-stroke" />
			</motion.svg>
			{children}
		</div>
	);
}
