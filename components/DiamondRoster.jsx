"use client";
import ShapeFrame from "./ShapeFrame";

// 4 per row, neighbours overlapping by 12% of a diamond: 4w - 3(0.12w) ≈ 100%, so w ≈ 28%
const PER_ROW = 4;
const DIAMOND_WIDTH = 100 / (PER_ROW - (PER_ROW - 1) * 0.12);
// Each item sits a step lower than the one before, restarting every row. Neighbouring
// tips overlap vertically by up to 12% of a diamond, so a 14% step keeps them clear.
const STEP = 14;

// items: [{ key, src, alt, title, badge, onSelect?, active? }]. `badge` sits over the
// bottom tip at a quarter of the diamond's width. Items with onSelect become buttons.
export default function DiamondRoster({ items, className = "" }) {
	const rows = [];
	for (let i = 0; i < items.length; i += PER_ROW) rows.push(items.slice(i, i + PER_ROW));

	return (
		<div className={className}>
			{rows.map((row, r) => (
				<div key={r} className={`flex justify-center ${r ? "mt-4" : ""}`}>
					{row.map((item, i) => {
						const Tag = item.onSelect ? "button" : "div";
						return (
							<Tag
								key={item.key}
								type={item.onSelect ? "button" : undefined}
								onClick={item.onSelect}
								aria-pressed={item.onSelect ? Boolean(item.active) : undefined}
								title={item.title}
								className={`relative block transition-opacity ${
									item.active === false ? "opacity-55 hover:opacity-90" : ""
								}`}
								style={{
									width: `${DIAMOND_WIDTH}%`,
									marginInline: `${-DIAMOND_WIDTH * 0.06}%`,
									// centred on the row: -1.5, -0.5, 0.5, 1.5 steps
									translate: `0 ${(i - (PER_ROW - 1) / 2) * STEP}%`,
								}}
							>
								<ShapeFrame shape="diamond" src={item.src} alt={item.alt} delay={(r * PER_ROW + i) * 0.06} />
								<span className="absolute left-1/2 top-[87.5%] z-10 w-1/4 -translate-x-1/2 -translate-y-1/2">
									{item.badge}
								</span>
							</Tag>
						);
					})}
				</div>
			))}
		</div>
	);
}
