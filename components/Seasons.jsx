"use client";
import { useEffect, useState } from "react";
import Hero from "./Hero";
import Leaderboard from "./Leaderboard";
import SeasonSwitch from "./SeasonSwitch";

// Holds the chosen season (?season=2025) and hands Hero and Leaderboard that season's
// data in the same shape as a single-season site: { ...site, seasonStart, seasonEnd, modes }
export default function Seasons({ site }) {
	// Seasons with no games yet (not fetched) stay hidden, and so does a switch with one season
	const years = Object.keys(site.seasons).filter((y) =>
		Object.values(site.seasons[y].modes).some((m) => m.totalGames > 0)
	);
	const [year, setYear] = useState(site.currentSeason);

	useEffect(() => {
		const param = new URLSearchParams(window.location.search).get("season");
		if (years.includes(param)) setYear(param);
	}, [site]); // eslint-disable-line react-hooks/exhaustive-deps

	const chooseYear = (next) => {
		setYear(next);
		const url = new URL(window.location.href);
		if (next === site.currentSeason) url.searchParams.delete("season");
		else url.searchParams.set("season", next);
		window.history.replaceState(null, "", url);
	};

	const view = { ...site, ...site.seasons[year], season: year, current: year === site.currentSeason };
	const seasonSwitch = (compact) =>
		years.length > 1 && <SeasonSwitch years={years} active={year} onChoose={chooseYear} compact={compact} />;

	return (
		<>
			<Hero site={view} seasonSwitch={seasonSwitch(false)} />
			{/* Remount per season, since a mode can be missing from the other one */}
			<Leaderboard key={year} site={view} seasonSwitch={seasonSwitch(true)} />
		</>
	);
}
