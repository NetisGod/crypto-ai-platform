// Generates square favicons for the app from the brand logo.
// Run with: node scripts/generate-favicons.mjs
//
// Inputs:  public/landing/logo-coin-trace.png
// Outputs: src/app/favicon.ico
//          src/app/icon.png        (512x512)
//          src/app/apple-icon.png  (180x180)

import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const SRC_LOGO = path.join(ROOT, "public/landing/logo-coin-trace.png");
const OUT_DIR = path.join(ROOT, "src/app");

async function makeSquare(size) {
  // The brand logo is essentially a rounded-square icon. Pad to square,
  // then resize to the requested size, keeping a transparent background.
  return sharp(SRC_LOGO)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const icon512 = await makeSquare(512);
  await fs.writeFile(path.join(OUT_DIR, "icon.png"), icon512);

  const apple180 = await makeSquare(180);
  await fs.writeFile(path.join(OUT_DIR, "apple-icon.png"), apple180);

  // Multi-resolution ICO for broad browser/OS support.
  const icoSources = await Promise.all([16, 32, 48, 64].map(makeSquare));
  const icoBuffer = await pngToIco(icoSources);
  await fs.writeFile(path.join(OUT_DIR, "favicon.ico"), icoBuffer);

  // eslint-disable-next-line no-console
  console.log("Generated:");
  for (const f of ["favicon.ico", "icon.png", "apple-icon.png"]) {
    const stat = await fs.stat(path.join(OUT_DIR, f));
    // eslint-disable-next-line no-console
    console.log(`  src/app/${f} (${stat.size} bytes)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
