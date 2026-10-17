import { mkdirSync } from "node:fs";
import sharp from "sharp";

const OUT = "public/icons";
mkdirSync(OUT, { recursive: true });

/** Full-bleed black square, centered white "O" ring (maskable-safe). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a0a0a"/>
  <circle cx="256" cy="256" r="118" fill="none" stroke="#ffffff" stroke-width="54"/>
</svg>`;

/** Rounded corners for the non-maskable (any) icon. */
const svgRounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0a0a0a"/>
  <circle cx="256" cy="256" r="118" fill="none" stroke="#ffffff" stroke-width="54"/>
</svg>`;

const jobs = [
  { svg, out: `${OUT}/icon-maskable-512.png`, size: 512 },
  { svg, out: `${OUT}/icon-512.png`, size: 512 },
  { svg, out: `${OUT}/icon-192.png`, size: 192 },
  { svg: svgRounded, out: `${OUT}/apple-touch-icon.png`, size: 180 },
];

for (const job of jobs) {
  await sharp(Buffer.from(job.svg)).resize(job.size, job.size).png().toFile(job.out);
  console.log("wrote", job.out);
}
