import {execFileSync} from 'node:child_process';
import {readFile, stat} from 'node:fs/promises';
import {extname, normalize} from 'node:path';

const self = normalize('site/scripts/validate-public-repo.mjs');
const binaryExtensions = new Set([
  '.avif', '.bmp', '.gif', '.ico', '.jpeg', '.jpg', '.png', '.webp',
  '.woff', '.woff2', '.ttf', '.otf', '.zip', '.gz', '.pdf', '.mp4', '.webm'
]);
const forbiddenTrackedNames = [
  /(^|\/)\.env(?:\.|$)/i,
  /(^|\/)(?:id_rsa|id_ed25519)(?:\.|$)/i,
  /(^|\/)(?:credentials|service-account|service_account)(?:\.[^/]+)?$/i
];
const forbiddenContent = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/u],
  ['GitHub classic token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/u],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{40,}\b/u],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/u],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/u],
  ['OpenAI secret key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/u],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/u],
  ['Stripe live secret', /\bsk_live_[A-Za-z0-9]{20,}\b/u],
  ['Telegram bot token', /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/u],
  ['Slack webhook', /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/_-]+/u],
  ['Discord webhook', /https:\/\/(?:discord(?:app)?\.com)\/api\/webhooks\/[A-Za-z0-9/_-]+/u],
  ['Notion workspace URL', /https?:\/\/(?:www\.)?(?:notion\.so|app\.notion\.com)\//iu],
  ['hard-coded Cloudflare token', /CLOUDFLARE_(?:API_)?TOKEN\s*[:=]\s*['"][^'"\s]{16,}['"]/iu],
  ['hard-coded generic secret', /(?:API[_-]?KEY|CLIENT[_-]?SECRET|ACCESS[_-]?TOKEN|PASSWORD)\s*[:=]\s*['"][^'"\s]{12,}['"]/iu]
];

const tracked = execFileSync('git', ['ls-files', '-z'], {encoding: 'utf8'})
  .split('\0')
  .filter(Boolean)
  .map(normalize);

const violations = [];
for (const path of tracked) {
  if (path === self) continue;
  if (forbiddenTrackedNames.some((pattern) => pattern.test(path))) {
    violations.push(`${path}: forbidden tracked filename`);
    continue;
  }
  if (binaryExtensions.has(extname(path).toLowerCase())) continue;

  let details;
  try {
    details = await stat(path);
  } catch (error) {
    if (error?.code === 'ENOENT') continue;
    throw error;
  }
  if (!details.isFile() || details.size > 2_000_000) continue;

  let source;
  try {
    source = await readFile(path, 'utf8');
  } catch {
    continue;
  }

  for (const [label, pattern] of forbiddenContent) {
    if (pattern.test(source)) violations.push(`${path}: ${label}`);
  }
}

if (violations.length) {
  throw new Error(`PUBLIC_REPOSITORY_SAFETY_FAILED\n${violations.join('\n')}`);
}

console.log(`Public repository safety PASS (${tracked.length} tracked files; no common secrets, private keys, env files or Notion workspace URLs)`);
