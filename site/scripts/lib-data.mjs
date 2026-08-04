import { readFile } from 'node:fs/promises';
export async function readJson(url){return JSON.parse(await readFile(url,'utf8'))}
export async function readChunkedData(baseUrl,indexName){
  const index=await readJson(new URL(indexName,baseUrl));
  const chunks=await Promise.all(index.chunks.map(name=>readJson(new URL(name,baseUrl))));
  const data=chunks.flat();
  if(data.length!==index.count)throw new Error(`CHUNK_COUNT_MISMATCH ${indexName}`);
  return data;
}
