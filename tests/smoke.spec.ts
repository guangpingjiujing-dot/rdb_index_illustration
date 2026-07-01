import { test, expect, type Page } from "@playwright/test";

const PAGES = [
  "/",
  "/about",
  "/basics/why-index",
  "/basics/data-structure",
  "/btree",
  "/hash",
  "/clustered",
  "/composite",
  "/unique",
  "/covering",
  "/partial",
  "/explain",
  "/statistics",
  "/cost",
  "/privacy",
  "/terms",
  "/contact",
];

// Only errors we actually care about. Ignore known noisy ones.
const IGNORE_PATTERNS: RegExp[] = [
  /Failed to load resource.*favicon/i,
  /_next\/static.*\.hot-update\.json/i,
  /websocket connection/i,
];

function watchConsole(page: Page) {
  const errors: string[] = [];
  const warnings: string[] = [];
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (IGNORE_PATTERNS.some((p) => p.test(text))) return;
    if (type === "error") errors.push(text);
    if (type === "warning" || type === "warn") warnings.push(text);
  });
  page.on("pageerror", (err) => {
    errors.push(`PageError: ${err.message}`);
  });
  return { errors, warnings };
}

for (const path of PAGES) {
  test(`${path} loads without console errors`, async ({ page }) => {
    const { errors, warnings } = watchConsole(page);
    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    // Give React hydration + any effect-time warnings a moment
    await page.waitForTimeout(300);
    expect(errors, `Console errors:\n${errors.join("\n")}`).toEqual([]);
    expect(warnings, `Console warnings:\n${warnings.join("\n")}`).toEqual([]);
  });
}

test("B-tree page: interactive search + insert produce no console errors", async ({
  page,
}) => {
  const { errors, warnings } = watchConsole(page);
  await page.goto("/btree", { waitUntil: "networkidle" });

  const searchInput = page.locator('input[type="number"]').first();
  await searchInput.fill("");
  await page.waitForTimeout(100);
  await searchInput.fill("25");
  await page.getByRole("button", { name: /探索開始/ }).click();
  await page.waitForTimeout(2500);

  await page.getByRole("button", { name: /挿入モード/ }).click();
  const insertInput = page.locator('input[type="number"]').first();
  await insertInput.fill("100");
  await page.getByRole("button", { name: /^挿入$/ }).click();
  await page.waitForTimeout(500);

  expect(errors, `Console errors:\n${errors.join("\n")}`).toEqual([]);
  expect(warnings, `Console warnings:\n${warnings.join("\n")}`).toEqual([]);
});

test("Clustered page: range inputs handle clearing without errors", async ({
  page,
}) => {
  const { errors, warnings } = watchConsole(page);
  await page.goto("/clustered", { waitUntil: "networkidle" });

  const inputs = page.locator('input[type="number"]');
  await inputs.nth(0).fill("");
  await page.waitForTimeout(50);
  await inputs.nth(0).fill("30");
  await inputs.nth(1).fill("");
  await page.waitForTimeout(50);
  await inputs.nth(1).fill("70");

  expect(errors, `Console errors:\n${errors.join("\n")}`).toEqual([]);
  expect(warnings, `Console warnings:\n${warnings.join("\n")}`).toEqual([]);
});

test("PageStorage viz interaction", async ({ page }) => {
  const { errors, warnings } = watchConsole(page);
  await page.goto("/basics/data-structure", { waitUntil: "networkidle" });
  const input = page.locator('input[type="text"]').first();
  await input.fill("");
  await input.fill("3:2");
  await page.getByRole("button", { name: /^読む$/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: /全ページを順に読む/ }).click();
  await page.getByRole("button", { name: /スキャン再生/ }).click();
  await page.waitForTimeout(2000);
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});

test("FullScan viz on why-index runs without errors", async ({ page }) => {
  const { errors, warnings } = watchConsole(page);
  await page.goto("/basics/why-index", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /スキャン開始/ }).click();
  await page.waitForTimeout(2500);

  expect(errors, `Console errors:\n${errors.join("\n")}`).toEqual([]);
  expect(warnings, `Console warnings:\n${warnings.join("\n")}`).toEqual([]);
});

test("Hash viz interaction", async ({ page }) => {
  const { errors, warnings } = watchConsole(page);
  await page.goto("/hash", { waitUntil: "networkidle" });
  await page.locator('input[type="text"]').first().fill("");
  await page.locator('input[type="text"]').first().fill("sato");
  await page.getByRole("button", { name: /等価検索/ }).click();
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});

test("Composite viz mode toggles", async ({ page }) => {
  const { errors, warnings } = watchConsole(page);
  await page.goto("/composite", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /先頭＋2番目/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: /2番目カラムだけ/ }).click();
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});

test("Unique viz duplicate insert triggers error state, not console error", async ({
  page,
}) => {
  const { errors, warnings } = watchConsole(page);
  await page.goto("/unique", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /INSERT/ }).click();
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});

test("Covering / Partial mode toggles", async ({ page }) => {
  for (const path of ["/covering", "/partial"]) {
    const { errors, warnings } = watchConsole(page);
    await page.goto(path, { waitUntil: "networkidle" });
    const buttons = page.locator("button");
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 6); i++) {
      const b = buttons.nth(i);
      if (await b.isEnabled()) await b.click().catch(() => {});
      await page.waitForTimeout(80);
    }
    expect(errors, `${path} errors`).toEqual([]);
    expect(warnings, `${path} warnings`).toEqual([]);
  }
});

test("Statistics / Cost sliders", async ({ page }) => {
  for (const path of ["/statistics", "/cost"]) {
    const { errors, warnings } = watchConsole(page);
    await page.goto(path, { waitUntil: "networkidle" });
    const range = page.locator('input[type="range"]').first();
    await range.evaluate((el: HTMLInputElement) => {
      el.value = "80";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.waitForTimeout(200);
    expect(errors, `${path} errors`).toEqual([]);
    expect(warnings, `${path} warnings`).toEqual([]);
  }
});

test("Explain plan switcher", async ({ page }) => {
  const { errors, warnings } = watchConsole(page);
  await page.goto("/explain", { waitUntil: "networkidle" });
  const buttons = page.locator("button");
  const count = await buttons.count();
  for (let i = 0; i < Math.min(count, 4); i++) {
    await buttons.nth(i).click().catch(() => {});
    await page.waitForTimeout(80);
  }
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});
