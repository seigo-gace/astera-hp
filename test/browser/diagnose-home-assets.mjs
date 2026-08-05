import { chromium } from '@playwright/test';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

const failures = [];
const consoleErrors = [];
const pageErrors = [];

page.on('requestfailed', (request) => {
  const entry = {
    method: request.method(),
    resourceType: request.resourceType(),
    url: request.url(),
    errorText: request.failure()?.errorText || 'UNKNOWN'
  };
  failures.push(entry);
  console.log(`[ASTERA_REQUEST_FAILED] ${JSON.stringify(entry)}`);
});

page.on('response', (response) => {
  if (response.status() < 400) return;
  console.log(`[ASTERA_HTTP_ERROR] ${response.status()} ${response.request().resourceType()} ${response.url()}`);
});

page.on('console', (message) => {
  if (message.type() !== 'error') return;
  const location = message.location();
  const entry = {
    text: message.text(),
    url: location.url || '',
    lineNumber: location.lineNumber ?? null,
    columnNumber: location.columnNumber ?? null
  };
  consoleErrors.push(entry);
  console.log(`[ASTERA_CONSOLE_ERROR] ${JSON.stringify(entry)}`);
});

page.on('pageerror', (error) => {
  const entry = { name: error.name, message: error.message, stack: error.stack || '' };
  pageErrors.push(entry);
  console.log(`[ASTERA_PAGE_ERROR] ${JSON.stringify(entry)}`);
});

try {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 45_000 });
  await page.waitForTimeout(2_000);

  const heroState = await page.evaluate(() => {
    const visual = document.querySelector('[data-astera-hero]');
    const depth = document.querySelector('.astera-hero-depth');
    const patch = document.querySelector('#lower-right-sparkle-removal');
    const baseImage = document.querySelector('#base-image image');
    const svgMount = document.querySelector('[data-astera-svg-mount]');

    return {
      documentUrl: document.URL,
      baseUri: document.baseURI,
      visualClasses: visual?.className || '',
      svgMounted: Boolean(svgMount?.querySelector('svg[data-astera-layered-svg]')),
      fallbackPatchBackground: depth ? getComputedStyle(depth, '::after').backgroundImage : '',
      patchHref: patch?.getAttribute('href') || '',
      patchXlinkHref: patch?.getAttribute('xlink:href') || '',
      patchResolvedHref: patch instanceof SVGImageElement ? patch.href.baseVal : '',
      baseImageHref: baseImage?.getAttribute('href') || '',
      baseImageXlinkHref: baseImage?.getAttribute('xlink:href') || '',
      baseImageResolvedHref: baseImage instanceof SVGImageElement ? baseImage.href.baseVal : '',
      loadedImages: [...document.images].map((image) => ({
        src: image.getAttribute('src') || '',
        currentSrc: image.currentSrc || '',
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
      }))
    };
  });

  console.log(`[ASTERA_HERO_STATE] ${JSON.stringify(heroState)}`);
  console.log(`[ASTERA_DIAGNOSTIC_SUMMARY] ${JSON.stringify({ failures, consoleErrors, pageErrors })}`);
} finally {
  await browser.close();
}
