// 変な ER 図 の全景を PNG に書き出して public/og/weird-er-diagram.png に保存する。
// OG 画像に静的 PNG として使う (Satori で SVG text をラスタライズできない対策)。
//
// 使い方:
//   node tools/generate-og-er-diagram.mjs
//
// 前提: 本番 (https://taitech.dev) が最新デプロイでアクセス可能なこと。
// dev サーバから撮る場合は URL を http://localhost:3000/... に変えて実行。

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const TARGET_URL = process.env.OG_TARGET_URL ?? "https://taitech.dev/data-modeling/er-diagram";
const OUT_PATH = "public/og/weird-er-diagram.png";

mkdirSync(dirname(OUT_PATH), { recursive: true });

console.log(`Fetching ${TARGET_URL} …`);
const browser = await chromium.launch();
try {
  // WeirdERDiagram の viewBox が 1400x780。少しゆとりある大きめの viewport で撮る
  const page = await browser.newPage({
    viewport: { width: 1800, height: 1200 },
    deviceScaleFactor: 2, // Retina でクリアに撮る
  });
  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });

  // 旗艦ページ内の最初の figure > svg (= WeirdERDiagram) を対象
  const svg = page.locator("figure svg").first();
  await svg.waitFor({ state: "visible", timeout: 5000 });

  await svg.screenshot({ path: OUT_PATH, omitBackground: false });
  console.log(`Saved ${OUT_PATH}`);
} finally {
  await browser.close();
}
