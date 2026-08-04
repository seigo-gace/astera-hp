import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const partsDirectory = join(site, 'assets-source', 'astera-globe-top');
const output = join(site, 'assets', 'images', 'astera-globe-top.png');
const expectedSha256 = 'a9f277573e81d96176eb8879fc06c619ec9ca1c8501dd5a9caaaa7ec8b77165a';
const partNames = Array.from({ length: 7 }, (_, index) => `globe.part${String(index).padStart(2, '0')}`);

const encodedParts = await Promise.all(partNames.map((name) => readFile(join(partsDirectory, name), 'utf8')));
const bytes = Buffer.from(encodedParts.join(''), 'base64');
const actualSha256 = createHash('sha256').update(bytes).digest('hex');

if (actualSha256 !== expectedSha256) throw new Error(`ASTERA_GLOBE_HASH_MISMATCH expected=${expectedSha256} actual=${actualSha256}`);
if (bytes.length !== 180582) throw new Error(`ASTERA_GLOBE_SIZE_MISMATCH expected=180582 actual=${bytes.length}`);
if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9)) throw new Error('ASTERA_GLOBE_JPEG_SIGNATURE_INVALID');

await mkdir(dirname(output), { recursive: true });
await writeFile(output, bytes);
console.log(`Materialized user-provided hero image: ${output} (${bytes.length} bytes, sha256 ${actualSha256})`);
