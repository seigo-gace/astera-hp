import {createHash} from 'node:crypto';
import {basename,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const SOURCE_REPOSITORY='seigo-gace/astera-hp';
const SOURCE_COMMIT='aa8a40d84dee94c81bf614cbd19adf307593f87e';
const EXPECTED=Object.freeze({
  'astera-symbol-light.svg':'3e5c62a81f450df3336e67110fe840ff6a1acca7af78e9862ce35c51cceb3c20',
  'astera-symbol-dark.svg':'d576d9cc6c4cb09914e807dc2dab62e5b0a2aca049e774599ca43efd24a947bd',
  'astera-wordmark-light.svg':'700a3ab3610ac40f194d028a4ab51faf2cdd14f2284b69d266d18700d7fe6de4',
  'astera-wordmark-dark.svg':'b4f2c7eee4a50efc6d67668dba85567eb04545c3562053d6d029899258d6b6a4',
  'astera-logo-light.svg':'b9bc0b8afcdfb1ca72182960bc049d4518f1790e22e95a66187e1f860badc004',
  'astera-logo-dark.svg':'cab61af560b3165130f7e8d922c093911f41e822ff01ea0c139db494c4612e52'
});
const here=dirname(fileURLToPath(import.meta.url));const site=join(here,'..');const outputDirectory=join(site,'assets','brand');
const sha256=value=>createHash('sha256').update(value).digest('hex');
function headers(){const value={'accept':'application/vnd.github+json','user-agent':'astera-hp-brand-gate','x-github-api-version':'2022-11-28'};const token=process.env.ASTERA_BRAND_ASSET_TOKEN?.trim()||process.env.GITHUB_TOKEN?.trim();if(token)value.authorization=`Bearer ${token}`;return value}
async function checked(url){const response=await fetch(url,{headers:headers(),signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`BRAND_FETCH_FAILED status=${response.status} url=${url}`);return response}
function validateSvg(bytes,filename){const text=bytes.toString('utf8').trim();if(!text.startsWith('<svg')&&!text.startsWith('<?xml'))throw new Error(`BRAND_NOT_SVG ${filename}`);if(/<image\b[^>]*(?:href|xlink:href)\s*=\s*["']data:/i.test(text))throw new Error(`BRAND_RASTER_EMBED_FORBIDDEN ${filename}`);if(!/viewBox\s*=\s*["'][^"']+["']/i.test(text))throw new Error(`BRAND_VIEWBOX_REQUIRED ${filename}`)}
async function reusable(path,hash){try{return sha256(await readFile(path))===hash}catch{return false}}
const treeUrl=`https://api.github.com/repos/${SOURCE_REPOSITORY}/git/trees/${SOURCE_COMMIT}?recursive=1`;const tree=await (await checked(treeUrl)).json();if(tree.truncated||!Array.isArray(tree.tree))throw new Error('BRAND_SOURCE_TREE_INVALID');const blobs=tree.tree.filter(entry=>entry?.type==='blob'&&typeof entry.path==='string');await mkdir(outputDirectory,{recursive:true});
const manifest={source_repository:SOURCE_REPOSITORY,source_commit:SOURCE_COMMIT,assets:{}};
for(const [filename,expectedHash] of Object.entries(EXPECTED)){const matches=blobs.filter(entry=>basename(entry.path)===filename);if(matches.length!==1)throw new Error(`BRAND_PATH_AMBIGUOUS ${filename} matches=${matches.length}`);const sourcePath=matches[0].path;const outputPath=join(outputDirectory,filename);if(!(await reusable(outputPath,expectedHash))){const encoded=sourcePath.split('/').map(encodeURIComponent).join('/');const response=await checked(`https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${SOURCE_COMMIT}/${encoded}`);const bytes=Buffer.from(await response.arrayBuffer());const actual=sha256(bytes);if(actual!==expectedHash)throw new Error(`BRAND_HASH_MISMATCH ${filename} expected=${expectedHash} actual=${actual}`);validateSvg(bytes,filename);await writeFile(outputPath,bytes)}manifest.assets[filename]={source_path:sourcePath,sha256:expectedHash}}
const favicon=await readFile(join(outputDirectory,'astera-symbol-dark.svg'));if(sha256(favicon)!==EXPECTED['astera-symbol-dark.svg'])throw new Error('BRAND_FAVICON_ALIAS_MISMATCH');await writeFile(join(outputDirectory,'favicon.svg'),favicon);await writeFile(join(outputDirectory,'SOURCE.json'),`${JSON.stringify(manifest,null,2)}\n`);console.log(`Materialized ${Object.keys(EXPECTED).length} official Astera brand SVGs from ${SOURCE_COMMIT}`);
