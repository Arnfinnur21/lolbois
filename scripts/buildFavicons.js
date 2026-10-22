// scripts/buildFavicons.js
// Turns public/favicon.png into one-colour favicons: black for light mode, white for
// dark mode. Outlines stay solid and fills become see-through, so the drawing keeps
// its detail; the transparent background is kept. Run: npm run gen-icons
import sharp from "sharp";

const SOURCE = "public/favicon.png";
const SIZE = 256;
const FILL_OPACITY = 0.35; // how much of the light fill areas shows, vs the solid outlines
const PADDING = 0.06; // empty margin around the cropped drawing

const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

// Crop to the drawing so it fills the icon
let [minX, minY, maxX, maxY] = [info.width, info.height, 0, 0];
for (let y = 0; y < info.height; y++) {
	for (let x = 0; x < info.width; x++) {
		if (data[(y * info.width + x) * 4 + 3] > 0) {
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}
	}
}

for (const [name, value] of [
	["icon-light.png", 0],
	["icon-dark.png", 255],
]) {
	const out = Buffer.alloc(data.length);
	for (let i = 0; i < data.length; i += 4) {
		const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
		const outline = Math.min(1, Math.max(0, (0.45 - lum) / 0.35)); // 1 for the dark lines
		out[i] = out[i + 1] = out[i + 2] = value;
		out[i + 3] = Math.round(data[i + 3] * (FILL_OPACITY + (1 - FILL_OPACITY) * outline));
	}

	const w = maxX - minX + 1;
	const h = maxY - minY + 1;
	const side = Math.round(Math.max(w, h) * (1 + PADDING * 2));
	// Crop and pad to a square first; sharp would otherwise pad after resizing
	const square = await sharp(out, { raw: info })
		.extract({ left: minX, top: minY, width: w, height: h })
		.extend({
			top: Math.floor((side - h) / 2),
			bottom: Math.ceil((side - h) / 2),
			left: Math.floor((side - w) / 2),
			right: Math.ceil((side - w) / 2),
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		})
		.png()
		.toBuffer();
	await sharp(square).resize(SIZE, SIZE).png().toFile(`public/${name}`);
	console.log(`✅ public/${name}`);
}
