// Renders _tools/og-image.html to assets/og-image.png at 1200 × 630.
//     node _tools/og-image.mjs
// Needs the playwright package and its Chromium. This repo has no package.json, so point NODE_PATH
// at a node_modules that has it: NODE_PATH=/path/to/node_modules node _tools/og-image.mjs
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, 'og-image.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.locator('.og').screenshot({ path: join(here, '..', 'assets', 'og-image.png') });
await browser.close();
