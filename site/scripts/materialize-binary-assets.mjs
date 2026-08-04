import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const sourceDirectory = join(site, 'assets-source', 'astera-globe-top-correct');
const output = join(site, 'assets', 'images', 'astera-globe-top.webp');
const expectedSha256 = '64f34c997275d1769c8b767957038eaf1bfe3f0f0dd672e68ea550bc5314b8b2';
const expectedSize = 178672;
const partNames = ['hero-correct.part00', 'hero-correct.part01'];

const encodedParts = await Promise.all(partNames.map((name) => readFile(join(sourceDirectory, name), 'utf8')));
const encoded = encodedParts.join('').replaceAll(/\s+/gu, '');
const bytes = Buffer.from(encoded, 'base64');
const actualSha256 = createHash('sha256').update(bytes).digest('hex');

if (bytes.length !== expectedSize) throw new Error(`ASTERA_GLOBE_SIZE_MISMATCH expected=${expectedSize} actual=${bytes.length}`);
if (actualSha256 !== expectedSha256) throw new Error(`ASTERA_GLOBE_HASH_MISMATCH expected=${expectedSha256} actual=${actualSha256}`);
if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') throw new Error('ASTERA_GLOBE_WEBP_SIGNATURE_INVALID');

await mkdir(dirname(output), { recursive: true });
await writeFile(output, bytes);
console.log(`Materialized latest user-provided hero image: ${output} (${bytes.length} bytes, sha256 ${actualSha256})`);
