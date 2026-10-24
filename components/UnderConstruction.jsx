// Shown instead of the site while MAINTENANCE_MODE=true
export default function UnderConstruction() {
	return (
		<main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6">
			<img src="/bg.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20" />
			<div className="absolute inset-0 -z-10 bg-gradient-to-b from-abyss/60 via-abyss/90 to-abyss" />

			<div className="max-w-xl text-center">
				<p className="eyebrow text-gold">Under construction</p>
				<h1 className="title-display mt-4 text-6xl text-gold-pale md:text-7xl">Lolbois</h1>
				<div className="mx-auto mt-8 h-px w-24 bg-gold/40" />
				<p className="font-fell mt-8 text-xl leading-relaxed text-gold-pale/90 md:text-2xl">
					Slakiði á maður ég er að cook&apos;a, kemur aftur live þegar ég nenni að klára :)
				</p>
			</div>
		</main>
	);
}
