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
  return join('test-results', 'screenshots', projectName, `${slug}.png`);
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
      const menu = page.locator('[data-menu-button]');
      await expect(menu).toBeVisible();
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#site-nav')).toHaveClass(/is-open/);
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
    } else {
      await expect(page.locator('#site-nav')).toBeVisible();
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
    await page.screenshot({ path, fullPage: true });

    expect(browserErrors, `Browser errors in ${route}`).toEqual([]);
  });
}

test('pricing paths redirect to the Astera app', async ({ request }) => {
  for (const route of ['/pricing', '/pricing/']) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(response.status());
    expect(response.headers().location).toBe('https://app.asterav8.jp/pricing');
  }
});
