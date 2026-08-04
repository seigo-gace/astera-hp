import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const output = join(site, 'assets', 'images', 'astera-globe-top.webp');
const expectedSha256 = 'e1fa4148097b8c8fabbc25ab9ed3cc4b04be8c331391354c10fc1d24e314e94a';
const expectedSize = 93914;

const details = await stat(output);
if (!details.isFile()) throw new Error('ASTERA_GLOBE_FILE_MISSING');
if (details.size !== expectedSize) throw new Error(`ASTERA_GLOBE_SIZE_MISMATCH expected=${expectedSize} actual=${details.size}`);

const bytes = await readFile(output);
const actualSha256 = createHash('sha256').update(bytes).digest('hex');
if (actualSha256 !== expectedSha256) throw new Error(`ASTERA_GLOBE_HASH_MISMATCH expected=${expectedSha256} actual=${actualSha256}`);
if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') throw new Error('ASTERA_GLOBE_WEBP_SIGNATURE_INVALID');

console.log(`Validated optimized user-provided hero image: ${output} (${details.size} bytes, sha256 ${actualSha256})`);
