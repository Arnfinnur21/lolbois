/** @type {import('next').NextConfig} */
const nextConfig = {
	// Lets a check build (NEXT_DIST_DIR=.next-check npx next build) write elsewhere,
	// so it doesn't wipe the files a running `npm run dev` is using in .next
	distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
