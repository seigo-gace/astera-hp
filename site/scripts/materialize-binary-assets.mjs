import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const repositoryRoot = join(site, '..');
const output = join(site, 'assets', 'images', 'astera-globe-top.webp');
const expectedSha256 = '64f34c997275d1769c8b767957038eaf1bfe3f0f0dd672e68ea550bc5314b8b2';
const expectedSize = 178672;
const sourceUrl = 'https://drive.usercontent.google.com/download?id=1ZXXKJJ9C8fRQwHkIc5_BHhzUB2aszYcV&export=download&confirm=t';
const gsapSource = join(repositoryRoot, 'node_modules', 'gsap', 'dist', 'gsap.min.js');
const gsapOutput = join(site, 'assets', 'vendor', 'gsap-3.12.2.min.js');

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const verify = (bytes, source) => {
  if (bytes.length !== expectedSize) throw new Error(`ASTERA_GLOBE_SIZE_MISMATCH source=${source} expected=${expectedSize} actual=${bytes.length}`);
  const actualSha256 = sha256(bytes);
  if (actualSha256 !== expectedSha256) throw new Error(`ASTERA_GLOBE_HASH_MISMATCH source=${source} expected=${expectedSha256} actual=${actualSha256}`);
  if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') throw new Error(`ASTERA_GLOBE_WEBP_SIGNATURE_INVALID source=${source}`);
  return actualSha256;
};

let bytes;
let source = 'repository-cache';
try {
  const cached = await readFile(output);
  verify(cached, source);
  bytes = cached;
} catch {
  source = 'public-transfer-source';
  const response = await fetch(sourceUrl, {
    redirect: 'follow',
    headers: {'user-agent': 'Astera-HP-Build/1.0'},
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`ASTERA_GLOBE_DOWNLOAD_FAILED status=${response.status}`);
  bytes = Buffer.from(await response.arrayBuffer());
  verify(bytes, source);
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, bytes);
}

const actualSha256 = verify(bytes, source);
console.log(`Materialized latest user-provided hero image from ${source}: ${output} (${bytes.length} bytes, sha256 ${actualSha256})`);

await mkdir(dirname(gsapOutput), {recursive: true});
await copyFile(gsapSource, gsapOutput);
const gsapRuntime = await readFile(gsapOutput, 'utf8');
if (!gsapRuntime.includes('GSAP 3.12.2') || gsapRuntime.length < 50000) throw new Error('ASTERA_GSAP_RUNTIME_INVALID');
console.log(`Materialized pinned GSAP runtime: ${gsapOutput} (${gsapRuntime.length} characters)`);
