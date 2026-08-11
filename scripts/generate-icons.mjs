import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public", "icons");

function svg(size) {
  const fontSize = Math.round(size * 0.28);
  const subSize = Math.round(size * 0.08);
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b2416"/>
      <stop offset="55%" stop-color="#6b3e2a"/>
      <stop offset="100%" stop-color="#4a2c1a"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.38}" fill="none" stroke="#f7f4f0" stroke-width="${Math.max(2, size * 0.012)}" opacity="0.45"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" fill="#f7f4f0">G&amp;F</text>
  <text x="50%" y="${size * 0.78}" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial, sans-serif" font-size="${subSize}" letter-spacing="${size * 0.04}" fill="#a67c52">31.10.26</text>
</svg>`);
}

function ogSvg() {
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f4f0"/>
      <stop offset="55%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#efe8e0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="980" cy="120" r="220" fill="#a67c52" opacity="0.16"/>
  <circle cx="180" cy="520" r="260" fill="#6b3e2a" opacity="0.1"/>
  <text x="80" y="210" font-family="Georgia, serif" font-size="42" letter-spacing="12" fill="#6b3e2a">SATURDAY 31.10.2026</text>
  <text x="80" y="340" font-family="Georgia, serif" font-size="96" fill="#3b2416">Aubin &amp; Francybel</text>
  <text x="80" y="420" font-family="Arial, sans-serif" font-size="28" fill="#7a5c4a">Wedding invitation</text>
  <rect x="80" y="470" width="120" height="2" fill="#a67c52" opacity="0.8"/>
</svg>`);
}

await mkdir(outDir, { recursive: true });

for (const size of [192, 512]) {
  await sharp(svg(size)).png().toFile(path.join(outDir, `icon-${size}.png`));
}

await sharp(svg(32)).png().toFile(path.join(root, "public", "favicon.png"));
await sharp(svg(180)).png().toFile(path.join(outDir, "apple-touch-icon.png"));
await sharp(ogSvg()).jpeg({ quality: 88 }).toFile(path.join(root, "public", "og.jpg"));
await writeFile(path.join(outDir, "icon.svg"), svg(512));

console.log("Icons generated in public/icons and public/og.jpg");
