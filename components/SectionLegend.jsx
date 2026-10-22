"use client";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

// A section counts as current once its top passes this far down the viewport
const ACTIVE_LINE = 0.35;

// Fixed legend on the right edge (wide screens): one diamond per section, a gold line
// filling with page progress, names on hover. Fades in once the stats start.
export default function SectionLegend({ items, startId }) {
	const [active, setActive] = useState(-1);
	const [visible, setVisible] = useState(false);
	const { scrollYProgress } = useScroll();
	const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

	useEffect(() => {
		let frame = 0;
		const update = () => {
			frame = 0;
			const line = window.innerHeight * ACTIVE_LINE;
			const start = document.getElementById(startId);
			setVisible(start ? start.getBoundingClientRect().top < window.innerHeight * 0.5 : true);
			let current = -1;
			items.forEach((item, i) => {
				const el = document.getElementById(item.id);
				if (el && el.getBoundingClientRect().top <= line) current = i;
			});
			setActive(current);
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [items, startId]);

	return (
		<motion.nav
			aria-label="Page sections"
			// The padding is an invisible hover area around the diamonds; right-0 plus pr-5 keeps
			// them where right-5 had them
			className="group/legend fixed right-0 top-1/2 z-40 hidden origin-right -translate-y-1/2 py-8 pl-12 pr-5 transition-[scale] duration-300 ease-out hover:scale-[1.35] xl:block"
			initial={false}
			animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 12 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			style={{ pointerEvents: visible ? "auto" : "none" }}
		>
			<div className="relative">
				{/* Track and progress line, running through the diamonds' centres */}
				<div className="absolute bottom-1.5 right-[5px] top-1.5 w-px bg-gold/15" />
				<motion.div
					className="absolute bottom-1.5 right-[5px] top-1.5 w-px origin-top bg-gold"
					style={{ scaleY: progress }}
				/>
				<ol className="relative space-y-1.5">
					{items.map((item, i) => {
						const isActive = i === active;
						const passed = i < active;
						return (
							<li key={item.id}>
								<a
									href={`#${item.id}`}
									className="relative flex items-center"
									aria-current={isActive ? "location" : undefined}
								>
									{/* Positioned off to the left so hidden labels don't cover the page */}
									<span
										className={`absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap bg-abyss/90 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider transition-all duration-300 ${
											isActive ? "text-gold" : "text-gold-pale/70"
										} pointer-events-none translate-x-2 opacity-0 group-hover/legend:pointer-events-auto group-hover/legend:translate-x-0 group-hover/legend:opacity-100`}
									>
										{item.number ? `${item.number} ` : ""}
										{item.label}
									</span>
									<span
										className={`block size-[11px] shrink-0 rotate-45 border transition-all duration-300 ${
											isActive
												? "scale-125 border-gold bg-gold shadow-[0_0_10px_rgba(200,170,110,0.7)]"
												: passed
													? "border-gold bg-gold/60"
													: "border-gold/40 bg-abyss"
										}`}
									/>
								</a>
							</li>
						);
					})}
				</ol>
			</div>
		</motion.nav>
	);
}

// Thin gold line along the bottom of the sticky bar, for screens without the legend
export function ProgressLine() {
	const { scrollYProgress } = useScroll();
	const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
	return (
		<motion.div
			aria-hidden
			className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-gold xl:hidden"
			style={{ scaleX: progress }}
		/>
	);
}
