import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function activate(locator: Locator) {
  if (test.info().project.name !== 'mobile-chromium') {
    await locator.click();
    return;
  }
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
  await locator.scrollIntoViewIfNeeded();
  const point = await locator.evaluate((element) => {
    const r = element.getBoundingClientRect(),
      x = r.x + r.width / 2,
      y = r.y + r.height / 2,
      hit = document.elementFromPoint(x, y);
    return {
      x: x - (window.visualViewport?.offsetLeft ?? 0),
      y: y - (window.visualViewport?.offsetTop ?? 0),
      visible: hit === element || (hit !== null && element.contains(hit)),
    };
  });
  expect(point.visible).toBe(true);
  await locator.page().touchscreen.tap(point.x, point.y);
}
async function openBuild(page: Page) {
  await page.goto('./#/configure/s75');
  await expect(page.getByRole('heading', { name: 'Studio 75', exact: true })).toBeVisible();
}
async function addToBag(page: Page) {
  await activate(page.getByRole('button', { name: 'Add to bag', exact: true }));
  await expect(page.getByRole('dialog')).toBeVisible();
}
async function settle(page: Page) {
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    );
  });
}
async function accessibility(page: Page) {
  await settle(page);
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('presents an original responsive home and carries the preview choice into the build', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: 'Find your own rhythm.', exact: true }),
  ).toBeVisible();
  await activate(page.getByRole('button', { name: 'Preview Copper finish', exact: true }));
  await accessibility(page);
  await page.screenshot({ path: info.outputPath('home.png'), fullPage: true });
  await activate(page.getByRole('link', { name: 'Build your keyboard', exact: true }).first());
  await expect(page.getByRole('heading', { name: 'Studio 75', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: /^Copper/ })).toBeChecked();
  await expect(page.getByLabel('Configuration price')).toHaveText('$254');
  expect(errors).toEqual([]);
});
test('persists configured builds, bag quantities and exact saved variants', async ({
  page,
}, info) => {
  await openBuild(page);
  await page.getByRole('radio', { name: /^Copper/ }).check();
  await page.getByRole('radio', { name: /^Signal/ }).check();
  await page.getByRole('radio', { name: /^Silent/ }).check();
  await expect(page.getByLabel('Configuration price')).toHaveText('$294');
  await activate(page.getByRole('button', { name: 'Save this build', exact: true }));
  await expect(page.getByRole('button', { name: 'Unsave this build', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('radio', { name: /^Copper/ })).toBeChecked();
  await expect(page.getByLabel('Configuration price')).toHaveText('$294');
  await accessibility(page);
  await page.screenshot({ path: info.outputPath('configured-keyboard.png'), fullPage: true });
  await addToBag(page);
  await activate(page.getByRole('button', { name: /^Increase quantity of Studio 75/ }));
  await expect(page.getByRole('heading', { name: 'Your bag (2)', exact: true })).toBeVisible();
  await accessibility(page);
  await activate(page.getByRole('button', { name: 'Close dialog', exact: true }));
  await page.reload();
  await activate(page.getByRole('button', { name: 'Open bag, 2 items', exact: true }));
  await expect(page.getByRole('heading', { name: 'Your bag (2)', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('$588');
  await activate(page.getByRole('button', { name: 'Close dialog', exact: true }));
  await page.goto('./#/collection?saved=1');
  await expect(page.getByText('1 keyboard saved', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Configure Studio 75 in Copper', exact: true }),
  ).toBeVisible();
});
test('filters the collection and compares keyboard formats', async ({ page }) => {
  await page.goto('./#/collection');
  await page.getByRole('textbox', { name: 'Search keyboards', exact: true }).fill('no such board');
  await expect(
    page.getByRole('heading', { name: 'Nothing in this combination.', exact: true }),
  ).toBeVisible();
  await activate(page.getByRole('button', { name: 'Clear filters', exact: true }));
  await page.getByRole('combobox', { name: 'Filter layout', exact: true }).selectOption('65%');
  await expect(page.getByText('1 keyboard', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Filter layout', exact: true }).selectOption('');
  await page
    .getByRole('combobox', { name: 'Sort keyboards', exact: true })
    .selectOption('price-high');
  await expect(
    page.locator('.product-card').first().getByRole('heading', { name: 'Studio 98', exact: true }),
  ).toBeVisible();
  await activate(page.getByRole('button', { name: 'Compare Studio 65', exact: true }));
  await activate(page.getByRole('button', { name: 'Compare Studio 75', exact: true }));
  await activate(page.getByRole('button', { name: 'Compare selected (2)', exact: true }));
  await expect(
    page.getByRole('table', { name: 'Compare Studio keyboard formats', exact: true }),
  ).toBeVisible();
  await accessibility(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('completes a discounted demo checkout without retaining contact information', async ({
  page,
}, info) => {
  await openBuild(page);
  await addToBag(page);
  await page.getByRole('textbox', { name: 'Promo code', exact: true }).fill('STUDIO10');
  await activate(page.getByRole('button', { name: 'Apply', exact: true }));
  await expect(page.getByText('STUDIO10 applied', { exact: true })).toBeVisible();
  await activate(page.getByRole('link', { name: 'Continue to demo checkout', exact: true }));
  await expect(page.getByRole('heading', { name: 'Make it yours.', exact: true })).toBeVisible();
  await activate(page.getByRole('button', { name: 'Review your build', exact: true }));
  await expect(page.getByRole('textbox', { name: 'Full name', exact: true })).toBeFocused();
  await expect(page.getByText('Enter a full name.', { exact: true })).toBeVisible();
  await activate(page.getByRole('button', { name: 'Use sample details', exact: true }));
  await accessibility(page);
  await activate(page.getByRole('button', { name: 'Review your build', exact: true }));
  await expect(page.getByRole('heading', { name: 'A final look.', exact: true })).toBeVisible();
  await activate(page.getByRole('button', { name: 'Place demo order', exact: true }));
  await expect(
    page.getByRole('heading', { name: 'Your studio is taking shape.', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('$215.10', { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Your studio is taking shape.', exact: true }),
  ).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem('rafqen:store:v1'));
  expect(stored).not.toContain('demo@example.test');
  expect(stored).not.toContain('12 Example Street');
  await accessibility(page);
  await page.screenshot({ path: info.outputPath('demo-order.png'), fullPage: true });
  await activate(page.getByRole('link', { name: 'Your demo orders', exact: true }).first());
  await expect(page.getByRole('heading', { name: 'Demo orders.', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Studio order/ })).toBeVisible();
});
test('synchronizes two tabs and does not resurrect a removed bag item', async ({
  page,
  context,
}) => {
  await openBuild(page);
  await addToBag(page);
  const other = await context.newPage();
  try {
    await openBuild(other);
    await addToBag(other);
    await expect(page.getByRole('heading', { name: 'Your bag (2)', exact: true })).toBeVisible();
    await expect(other.getByRole('heading', { name: 'Your bag (2)', exact: true })).toBeVisible();
    await activate(page.getByRole('button', { name: /^Increase quantity of Studio 75/ }));
    await expect(other.getByRole('heading', { name: 'Your bag (3)', exact: true })).toBeVisible();
    await activate(other.getByRole('button', { name: /^Remove Studio 75/ }));
    await expect(
      page.getByRole('heading', { name: 'Room for something good.', exact: true }),
    ).toBeVisible();
    await expect(
      other.getByRole('heading', { name: 'Room for something good.', exact: true }),
    ).toBeVisible();
  } finally {
    await other.close();
  }
});
test('preserves invalid saved data until a confirmed reset', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('rafqen:store:v1', '{broken'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await activate(
    page.locator('.storage-banner').getByRole('button', { name: 'Reset demo data', exact: true }),
  );
  await activate(page.getByRole('button', { name: 'Keep my data', exact: true }));
  expect(await page.evaluate(() => localStorage.getItem('rafqen:store:v1'))).toBe('{broken');
  await activate(
    page.locator('.storage-banner').getByRole('button', { name: 'Reset demo data', exact: true }),
  );
  await activate(
    page.getByRole('dialog').getByRole('button', { name: 'Reset demo data', exact: true }),
  );
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(
    JSON.parse((await page.evaluate(() => localStorage.getItem('rafqen:store:v1')))!).cart,
  ).toEqual([]);
});
test('supports the studio layers, reduced motion and keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#/studio');
  const tab = page.getByRole('tab').first();
  await tab.focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab').last()).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('solid form');
  await accessibility(page);
  await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
  const url = page.url();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  expect(page.url()).toBe(url);
  const menu = page.getByRole('button', { name: 'Open navigation', exact: true });
  if (await menu.isVisible()) {
    await activate(menu);
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
  }
});
test('provides safe recovery for unavailable builds and empty checkout', async ({ page }) => {
  await page.goto('./#/configure/missing');
  await expect(
    page.getByRole('heading', { name: 'That keyboard is not here.', exact: true }),
  ).toBeVisible();
  await activate(page.getByRole('link', { name: 'Explore keyboards', exact: true }));
  await expect(page.getByRole('heading', { name: /Your desk.*Your format/ })).toBeVisible();
  await page.goto('./#/checkout');
  await expect(
    page.getByRole('heading', { name: 'Your bag comes first.', exact: true }),
  ).toBeVisible();
  await page.goto('./#/configure/s75?finish=missing');
  await expect(page.getByRole('alert')).toContainText('unavailable');
  await expect(page.getByRole('radio', { name: /^Chalk/ })).toBeChecked();
});
test('opens the optional 3D view or explains the supported illustration fallback', async ({
  page,
}) => {
  await openBuild(page);
  await activate(page.getByRole('button', { name: 'Explore in 3D', exact: true }));
  await expect(page.getByRole('button', { name: 'Illustration', exact: true })).toBeVisible();
  await expect(
    page
      .locator('canvas')
      .or(
        page.getByText(
          '3D is unavailable in this browser. Your full build is shown in the illustration.',
          { exact: true },
        ),
      ),
  ).toBeVisible();
  await activate(page.getByRole('button', { name: 'Rotate keyboard left', exact: true }));
  await activate(page.getByRole('button', { name: 'Illustration', exact: true }));
  await expect(page.getByRole('button', { name: 'Explore in 3D', exact: true })).toBeVisible();
});
