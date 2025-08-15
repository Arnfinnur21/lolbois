import StatCard from "./StatCard";

export default function StatGrid({ items, valueKey }) {
  const top3 = items.slice(0, 3);
  const rest5 = items.slice(3, 8);

  const val = (p) => p?.[valueKey] ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 justify-center">
        {top3.map((p, i) => (
          <StatCard key={p.puuid || i} idx={i} name={p.name} iconUrl={p.profileIconUrl} value={val(p)} valueKey={valueKey} size="lg" />
        ))}
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {rest5.map((p, i) => (
          <StatCard key={p.puuid || i} name={p.name} iconUrl={p.profileIconUrl} value={val(p)} valueKey={valueKey} size="sm" />
        ))}
      </div>
    </div>
  );
}
