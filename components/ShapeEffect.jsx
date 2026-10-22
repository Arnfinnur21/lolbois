// Ambient particle effects around a ShapeFrame, animated in CSS (see .fx-* in globals.css).
// Positions come from a seeded random so the server and browser render the same thing.

function seeded(text) {
	let a = [...text].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 2654435761), 1779033703);
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const CONFETTI = ["#ff6fb5", "#ffd166", "#06d6a0", "#4cc9f0", "#c77dff", "#ff8c42"];

// Each kind: which layer it draws on, how many particles, and one particle's style
const KINDS = {
	embers: {
		layer: "front",
		count: 14,
		particle: (r, c) => ({
			left: `${10 + r() * 80}%`,
			top: `${60 + r() * 35}%`,
			width: `${3 + r() * 3}px`,
			aspectRatio: 1,
			borderRadius: "50%",
			background: c,
			boxShadow: `0 0 8px ${c}`,
			"--dx": `${(r() - 0.5) * 16}cqw`,
			"--rise": `${50 + r() * 35}cqh`,
			animation: `fx-rise ${2.5 + r() * 2.5}s ease-out ${-r() * 5}s infinite`,
		}),
	},
	smoke: {
		layer: "back",
		count: 7,
		particle: (r, c) => ({
			left: `${5 + r() * 60}%`,
			top: `${45 + r() * 35}%`,
			width: `${30 + r() * 25}cqw`,
			aspectRatio: 1,
			borderRadius: "50%",
			background: `radial-gradient(circle, ${c} 0%, transparent 70%)`,
			filter: "blur(10px)",
			"--o": 0.35 + r() * 0.2,
			"--dx": `${(r() - 0.5) * 20}cqw`,
			animation: `fx-smoke ${7 + r() * 4}s ease-in-out ${-r() * 10}s infinite`,
		}),
	},
	sparkles: {
		layer: "front",
		count: 12,
		particle: (r, c) => ({
			left: `${r() * 92}%`,
			top: `${r() * 92}%`,
			width: `${7 + r() * 7}px`,
			aspectRatio: 1,
			background: c,
			clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)",
			filter: `drop-shadow(0 0 4px ${c})`,
			animation: `fx-twinkle ${1.8 + r() * 1.6}s ease-in-out ${-r() * 3}s infinite`,
		}),
	},
	drips: {
		layer: "front",
		count: 9,
		particle: (r, c) => ({
			left: `${15 + r() * 70}%`,
			top: "-4%",
			width: "4px",
			height: "11px",
			borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
			background: c,
			"--dx": "0cqw",
			animation: `fx-fall ${1.6 + r() * 1.6}s ease-in ${-r() * 3}s infinite`,
		}),
	},
	rain: {
		layer: "front",
		count: 16,
		particle: (r, c) => ({
			left: `${r() * 100}%`,
			top: "-6%",
			width: "1px",
			height: `${10 + r() * 8}px`,
			background: c,
			rotate: "12deg",
			"--o": 0.6,
			"--dx": "-8cqw",
			animation: `fx-fall ${0.8 + r() * 0.6}s linear ${-r() * 2}s infinite`,
		}),
	},
	coins: {
		layer: "front",
		count: 10,
		particle: (r, c) => ({
			left: `${10 + r() * 80}%`,
			top: "-6%",
			width: `${8 + r() * 4}px`,
			aspectRatio: 1,
			borderRadius: "50%",
			background: `radial-gradient(circle at 35% 35%, #fff6c8, ${c} 55%, #a07a1c)`,
			"--dx": `${(r() - 0.5) * 10}cqw`,
			"--spin": `${360 + r() * 360}deg`,
			animation: `fx-fall-spin ${2.4 + r() * 2}s ease-in ${-r() * 4}s infinite`,
		}),
	},
	feathers: {
		layer: "front",
		count: 8,
		particle: (r, c) => ({
			left: `${10 + r() * 80}%`,
			top: "-8%",
			width: "6px",
			height: "15px",
			borderRadius: "50% 50% 50% 50% / 80% 80% 20% 20%",
			background: c,
			"--o": 0.85,
			"--dx": `${(r() - 0.5) * 24}cqw`,
			animation: `fx-flutter ${5 + r() * 3}s ease-in-out ${-r() * 8}s infinite`,
		}),
	},
	confetti: {
		layer: "front",
		count: 18,
		particle: (r) => ({
			left: `${r() * 100}%`,
			top: "-6%",
			width: "6px",
			height: "9px",
			background: CONFETTI[Math.floor(r() * CONFETTI.length)],
			"--dx": `${(r() - 0.5) * 20}cqw`,
			"--spin": `${540 + r() * 540}deg`,
			animation: `fx-fall-spin ${2.5 + r() * 2.5}s linear ${-r() * 5}s infinite`,
		}),
	},
	bubbles: {
		layer: "front",
		count: 10,
		particle: (r, c) => ({
			left: `${10 + r() * 80}%`,
			top: `${70 + r() * 25}%`,
			width: `${6 + r() * 9}px`,
			aspectRatio: 1,
			borderRadius: "50%",
			border: `1px solid ${c}`,
			background: `radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.35), transparent 60%)`,
			"--o": 0.8,
			"--dx": `${(r() - 0.5) * 12}cqw`,
			"--rise": `${60 + r() * 30}cqh`,
			animation: `fx-rise ${4 + r() * 3}s ease-in-out ${-r() * 7}s infinite`,
		}),
	},
	speed: {
		layer: "front",
		count: 8,
		particle: (r, c) => ({
			left: "0%",
			top: `${15 + r() * 70}%`,
			width: `${20 + r() * 25}%`,
			height: "2px",
			borderRadius: "2px",
			background: `linear-gradient(to right, ${c}, transparent)`,
			"--o": 0.8,
			animation: `fx-streak ${0.7 + r() * 0.6}s linear ${-r() * 1.4}s infinite`,
		}),
	},
	rings: {
		layer: "back",
		count: 3,
		particle: (r, c, i) => ({
			inset: "12%",
			borderRadius: "50%",
			border: `1.5px solid ${c}`,
			"--to": 1.35,
			animation: `fx-ring 2.4s ease-out ${i * 0.8}s infinite`,
		}),
	},
};

// Radar: sonar rings spreading out from the shape plus a sweep turning over it
function Radar({ color }) {
	return (
		<>
			<div className="fx-layer" aria-hidden>
				{[0, 1, 2].map((i) => (
					<span
						key={i}
						className="fx-p"
						style={{
							inset: "8%",
							borderRadius: "50%",
							border: `1.5px solid ${color}`,
							"--to": 1.6,
							animation: `fx-ring 3s ease-out ${i}s infinite`,
						}}
					/>
				))}
			</div>
			<div className="fx-layer" aria-hidden style={{ zIndex: 5 }}>
				<span
					className="fx-p"
					style={{
						inset: "6%",
						borderRadius: "50%",
						opacity: 0.45,
						background: `conic-gradient(from 0deg, transparent 0deg, transparent 300deg, ${color} 360deg)`,
						mixBlendMode: "screen",
						animation: "fx-spin 3s linear infinite",
					}}
				/>
			</div>
		</>
	);
}

export default function ShapeEffect({ kind, color = "#c8aa6e", layer }) {
	if (kind === "radar") return layer === "back" ? <Radar color={color} /> : null;
	const spec = KINDS[kind];
	if (!spec || spec.layer !== layer) return null;
	const r = seeded(kind);
	return (
		<div className="fx-layer" aria-hidden style={layer === "front" ? { zIndex: 5 } : undefined}>
			{Array.from({ length: spec.count }, (_, i) => (
				<span key={i} className="fx-p" style={spec.particle(r, color, i)} />
			))}
		</div>
	);
}
