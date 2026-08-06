import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const output = join(site, 'assets', 'visual', 'hero', 'astera-original-transparent.svg');
const expectedSize = 3097567;
const expectedSha256 = '84a9988a47157a9b6f01602fee08f1b176dbe7d6996a4fd42b07ca644551c5e2';
const sourceUrl = 'https://drive.usercontent.google.com/download?id=13z9nz8KbM2ErPaJvqLamAXv9EGgYb3hg&export=download&confirm=t';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const verify = (bytes, source) => {
  if (bytes.length !== expectedSize) throw new Error(`ASTERA_TOP_SVG_SIZE_MISMATCH source=${source} expected=${expectedSize} actual=${bytes.length}`);
  const hash = sha256(bytes);
  if (hash !== expectedSha256) throw new Error(`ASTERA_TOP_SVG_HASH_MISMATCH source=${source} expected=${expectedSha256} actual=${hash}`);
  const text = bytes.toString('utf8');
  if (!text.includes('width="1536" height="1433"') || !text.includes('viewBox="0 0 1536 1433"')) throw new Error('ASTERA_TOP_SVG_DIMENSION_CONTRACT_INVALID');
  return hash;
};
let bytes;
let source = 'repository-cache';
try {
  bytes = await readFile(output);
  verify(bytes, source);
} catch {
  source = 'public-transfer-source';
  const response = await fetch(sourceUrl, { redirect: 'follow', headers: {'user-agent': 'Astera-HP-Build/1.0'}, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`ASTERA_TOP_SVG_DOWNLOAD_FAILED status=${response.status}`);
  bytes = Buffer.from(await response.arrayBuffer());
  verify(bytes, source);
  await mkdir(dirname(output), {recursive: true});
  await writeFile(output, bytes);
}
const hash = verify(bytes, source);
console.log(`Materialized uploaded Astera TOP SVG from ${source}: ${output} (${bytes.length} bytes, sha256 ${hash})`);
