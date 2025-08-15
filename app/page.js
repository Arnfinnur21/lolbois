import { categories } from "@/lib/categories";
import StatGroup from "@/components/StatGroup";

export default function HomePage() {
  return (
    <main className="p-6">
      {categories.map(cat => (
        <StatGroup key={cat.title} title={cat.title} subtitle={cat.subtitle} items={cat.items} valueKey={cat.valueKey} />
      ))}
    </main>
  );
}
