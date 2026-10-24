// Segmented year buttons; `compact` shortens them to '25 on small screens for the sticky bar
export default function SeasonSwitch({ years, active, onChoose, compact = false }) {
	return (
		<div role="group" aria-label="Season" className="flex shrink-0 gap-1">
			{years.map((year) => (
				<button
					key={year}
					type="button"
					onClick={() => onChoose(year)}
					aria-pressed={year === active}
					className={`px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors ${
						year === active ? "bg-gold text-abyss" : "text-muted hover:text-gold-pale"
					}`}
				>
					{compact ? (
						<>
							<span className="sm:hidden">&apos;{year.slice(-2)}</span>
							<span className="hidden sm:inline">{year}</span>
						</>
					) : (
						year
					)}
				</button>
			))}
		</div>
	);
}
