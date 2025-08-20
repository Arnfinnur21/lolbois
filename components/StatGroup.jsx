import StatGrid from "./StatGrid";

const GROUP_STYLES = {
	kills: "bg-gradient-to-r from-bg-base to-bg-killers",
	deaths: "bg-gradient-to-r from-bg-base to-bg-inters",
};

export default function StatGroup({ title, subtitle, items, valueKey }) {
	const bg = GROUP_STYLES[valueKey] ?? "";
	return (
		<section className={`md:p-12 rounded-3xl  md:m-10`}>
			<h2 className="text-3xl font-bold mb-4 text-left">{title}</h2>
			<h3 className="text-m font-medium italic mb-4 text-left"> {subtitle}</h3>
			<StatGrid items={items} valueKey={valueKey} />
		</section>
	);
}
