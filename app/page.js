import site from "@/data/site.json";
import Seasons from "@/components/Seasons";
import UnderConstruction from "@/components/UnderConstruction";
import { formatDate } from "@/lib/utils";

// Forgiving about how the host stores it: True, "true", 1, yes, on
const maintenance = /^["']?(true|1|yes|on)["']?$/i.test(process.env.MAINTENANCE_MODE?.trim() ?? "");

export default function HomePage() {
	if (maintenance) return <UnderConstruction />;

	return (
		<main>
			<Seasons site={site} />
			<footer className="border-t border-gold/15 px-6 py-10 text-center text-xs text-muted">
				<p>Updated {formatDate(site.generatedAt)} · Data from the Riot Games API</p>
				<p className="mt-2 opacity-70">
					LOLBOIS isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot
					Games or anyone officially involved in producing or managing Riot Games properties.
				</p>
			</footer>
		</main>
	);
}
