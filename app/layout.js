import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const displaySerif = Merriweather({
	variable: "--font-display-serif",
	subsets: ["latin"],
	weight: ["900"],
	style: ["italic"],
});

export const metadata = {
	title: "LOLBOIS",
	description: "Season leaderboards for the lolbois: who carries, who ints, who pings.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={`${inter.variable} ${displaySerif.variable} font-sans antialiased`}>
				<MotionProvider>{children}</MotionProvider>
			</body>
		</html>
	);
}
