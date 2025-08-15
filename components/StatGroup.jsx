import StatGrid from "./StatGrid";

export default function StatGroup({ title, subtitle, items, valueKey }) {
    return (
        <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
            <h3 className="text-m font-medium mb-2 text-center"> {subtitle}</h3>
            <StatGrid items={items} valueKey={valueKey} />
        </section>
    );
}
