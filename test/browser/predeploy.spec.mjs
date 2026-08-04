import { test, expect } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const sitemap = await readFile(new URL('../../site/dist/sitemap.xml', import.meta.url), 'utf8');
const routes = [...sitemap.matchAll(/<loc>https:\/\/asterav8\.jp([^<]*)<\/loc>/g)]
  .map((match) => match[1] || '/')
  .sort();
const routeSet = new Set(routes.map((route) => new URL(route, 'http://127.0.0.1:4173').pathname));
routeSet.add('/404.html');

function screenshotName(projectName, route) {
  const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\/$/, '').replaceAll('/', '__');
  return join('test-results', 'screenshots', projectName, `${slug}.jpg`);
}

async function loadLazyAssets(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(280, Math.floor(window.innerHeight * 0.72));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({top: y, behavior: 'instant'});
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'});
    await delay(120);
  });
  await page.waitForLoadState('networkidle');
  await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(images.map((image) => {
      if (image.complete) return undefined;
      return new Promise((resolve) => {
        image.addEventListener('load', resolve, {once: true});
        image.addEventListener('error', resolve, {once: true});
      });
    }));
  });
  await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
}

for (const route of routes) {
  test(`${route} renders without browser or layout failures`, async ({ page }, testInfo) => {
    const browserErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => browserErrors.push(`pageerror: ${error.message}`));

    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response, `No response for ${route}`).not.toBeNull();
    expect(response.status(), `HTTP failure for ${route}`).toBeLessThan(400);

    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.locator('.site-header')).toBeVisible();
    await expect(page.locator('.site-footer')).toBeVisible();
    await expect(page.locator('[data-ai-launcher]')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    const title = await page.title();
    expect(title.trim().length, `Missing title for ${route}`).toBeGreaterThan(3);

    const unresolved = await page.locator('body').innerText();
    expect(unresolved, `Unresolved template placeholder in ${route}`).not.toMatch(/\{\{[^}]+\}\}/);

    const layout = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth
    }));
    expect(layout.scrollWidth, `Horizontal overflow in ${route}`).toBeLessThanOrEqual(layout.width + 2);
    expect(layout.bodyWidth, `Body overflow in ${route}`).toBeLessThanOrEqual(layout.width + 2);

    await loadLazyAssets(page);
    const brokenImages = await page.locator('img').evaluateAll((images) => images
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src));
    expect(brokenImages, `Broken images in ${route}`).toEqual([]);

    const badInternalLinks = await page.locator('a[href]').evaluateAll((anchors, knownRoutes) => {
      const known = new Set(knownRoutes);
      return anchors
        .map((anchor) => anchor.getAttribute('href'))
        .filter(Boolean)
        .filter((href) => !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:'))
        .map((href) => new URL(href, window.location.origin))
        .filter((url) => url.origin === window.location.origin)
        .map((url) => url.pathname)
        .filter((pathname) => !known.has(pathname));
    }, [...routeSet]);
    expect([...new Set(badInternalLinks)], `Unknown internal links in ${route}`).toEqual([]);

    if (testInfo.project.name.startsWith('mobile')) {
      const menu = page.locator('[data-nav-toggle]');
      await expect(menu).toBeVisible();
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#global-nav')).toHaveClass(/is-open/);
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
    } else {
      await expect(page.locator('#global-nav')).toBeVisible();
    }

    if (route === '/contact/') {
      await expect(page.locator('[data-contact-form]')).toBeVisible();
      await expect(page.locator('[data-contact-form] [name="replyEmail"]')).toHaveAttribute('required', '');
      await expect(page.locator('[data-contact-form] [name="message"]')).toHaveAttribute('required', '');
    }
    if (route === '/chat/') {
      await expect(page.locator('[data-chat-form]')).toBeVisible();
      await expect(page.locator('[data-chat-form] [name="message"]')).toHaveAttribute('required', '');
    }
    if (route === '/qa/') {
      await expect(page.locator('[data-qa-search]')).toBeVisible();
    }

    const path = screenshotName(testInfo.project.name, route);
    await mkdir(dirname(path), { recursive: true });
    await page.screenshot({ path, type: 'jpeg', quality: 68, fullPage: true });

    expect(browserErrors, `Browser errors in ${route}`).toEqual([]);
  });
}

test('Cloudflare pricing redirects point only to the Astera app', async () => {
  const redirects = await readFile(new URL('../../site/dist/_redirects', import.meta.url), 'utf8');
  expect(redirects).toContain('/pricing https://app.asterav8.jp/pricing 301');
  expect(redirects).toContain('/pricing/ https://app.asterav8.jp/pricing 301');
});
