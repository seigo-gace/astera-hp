import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {basename,dirname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {mkdir,mkdtemp,readFile,readdir,rm,writeFile} from 'node:fs/promises';

const EXPECTED=Object.freeze({
  'astera-symbol-light.svg':'3e5c62a81f450df3336e67110fe840ff6a1acca7af78e9862ce35c51cceb3c20',
  'astera-symbol-dark.svg':'d576d9cc6c4cb09914e807dc2dab62e5b0a2aca049e774599ca43efd24a947bd',
  'astera-wordmark-light.svg':'700a3ab3610ac40f194d028a4ab51faf2cdd14f2284b69d266d18700d7fe6de4',
  'astera-wordmark-dark.svg':'b4f2c7eee4a50efc6d67668dba85567eb04545c3562053d6d029899258d6b6a4',
  'astera-logo-light.svg':'b9bc0b8afcdfb1ca72182960bc049d4518f1790e22e95a66187e1f860badc004',
  'astera-logo-dark.svg':'cab61af560b3165130f7e8d922c093911f41e822ff01ea0c139db494c4612e52'
});
const ARCHIVE_NAME='astera-logo-vector-text-sources.tar.gz';
const ARCHIVE_SHA256='8f075dbdf8941cdd7fd226c546574591c3b4d02ae1974477fe3983196f785810';
const here=dirname(fileURLToPath(import.meta.url));
const site=join(here,'..');
const outputDirectory=join(site,'assets','brand');
const sha256=value=>createHash('sha256').update(value).digest('hex');
function validateSvg(bytes,filename){const text=bytes.toString('utf8').trim();if(!text.startsWith('<svg')&&!text.startsWith('<?xml'))throw new Error(`BRAND_NOT_SVG ${filename}`);if(/<image\b[^>]*(?:href|xlink:href)\s*=\s*["']data:/i.test(text))throw new Error(`BRAND_RASTER_EMBED_FORBIDDEN ${filename}`);if(!/viewBox\s*=\s*["'][^"']+["']/i.test(text))throw new Error(`BRAND_VIEWBOX_REQUIRED ${filename}`)}
async function reusable(path,hash){try{return sha256(await readFile(path))===hash}catch{return false}}
function gitBytes(objectId){return execFileSync('git',['cat-file','blob',objectId],{encoding:null,maxBuffer:64*1024*1024})}
function parseObjectInventory(){const text=execFileSync('git',['rev-list','--all','--objects'],{encoding:'utf8',maxBuffer:64*1024*1024});return text.split('\n').filter(Boolean).map(line=>{const split=line.indexOf(' ');return split<0?{objectId:line,path:''}:{objectId:line.slice(0,split),path:line.slice(split+1)}})}
async function walk(directory){const entries=await readdir(directory,{withFileTypes:true});const files=[];for(const entry of entries){const path=join(directory,entry.name);if(entry.isDirectory())files.push(...await walk(path));else files.push(path)}return files}
const objects=parseObjectInventory();
function candidatesByBasename(filename){return objects.filter(entry=>entry.path&&basename(entry.path)===filename)}
function findExactHistoryBlob(filename,expectedHash){const candidates=candidatesByBasename(filename);for(const candidate of candidates){let bytes;try{bytes=gitBytes(candidate.objectId)}catch{continue}if(sha256(bytes)!==expectedHash)continue;validateSvg(bytes,filename);return{bytes,source:{mode:'git-object-history',object_id:candidate.objectId,path:candidate.path}}}return null}
function findArchiveInHistory(){for(const candidate of candidatesByBasename(ARCHIVE_NAME)){let bytes;try{bytes=gitBytes(candidate.objectId)}catch{continue}if(sha256(bytes)===ARCHIVE_SHA256)return{bytes,source:{mode:'git-archive-object',object_id:candidate.objectId,path:candidate.path}}}for(const candidate of candidatesByBasename(`${ARCHIVE_NAME}.b64`)){let encoded;try{encoded=gitBytes(candidate.objectId).toString('utf8').replace(/\s+/g,'')}catch{continue}const bytes=Buffer.from(encoded,'base64');if(sha256(bytes)===ARCHIVE_SHA256)return{bytes,source:{mode:'git-base64-archive-object',object_id:candidate.objectId,path:candidate.path}}}const chunks=new Map();for(const entry of objects){const match=basename(entry.path||'').match(/^astera-logo-vector-text-sources\.tar\.gz\.b64\.chunk(\d{2})\.txt$/);if(!match)continue;const index=Number(match[1]);if(index<0||index>10||chunks.has(index))continue;chunks.set(index,entry)}if(chunks.size===11){const encoded=[...Array(11).keys()].map(index=>gitBytes(chunks.get(index).objectId).toString('utf8')).join('').replace(/\s+/g,'');const bytes=Buffer.from(encoded,'base64');if(sha256(bytes)===ARCHIVE_SHA256)return{bytes,source:{mode:'git-chunked-archive-objects',objects:[...chunks.entries()].sort((a,b)=>a[0]-b[0]).map(([index,entry])=>({index,object_id:entry.objectId,path:entry.path}))}}}return null}
async function recoverFromArchive(archive){const directory=await mkdtemp(join(tmpdir(),'astera-brand-'));try{const archivePath=join(directory,ARCHIVE_NAME);await writeFile(archivePath,archive.bytes);execFileSync('tar',['-xzf',archivePath,'-C',directory],{stdio:'pipe'});const files=await walk(directory);const recovered={};for(const [filename,expectedHash] of Object.entries(EXPECTED)){const matches=files.filter(path=>basename(path)===filename);for(const path of matches){const bytes=await readFile(path);if(sha256(bytes)!==expectedHash)continue;validateSvg(bytes,filename);recovered[filename]={bytes,source:{...archive.source,archive_sha256:ARCHIVE_SHA256,archive_member:path.slice(directory.length+1)}};break}}return recovered}finally{await rm(directory,{recursive:true,force:true})}}
await mkdir(outputDirectory,{recursive:true});
const resolved={};
for(const [filename,expectedHash] of Object.entries(EXPECTED)){const outputPath=join(outputDirectory,filename);if(await reusable(outputPath,expectedHash)){resolved[filename]={bytes:await readFile(outputPath),source:{mode:'verified-worktree-cache',path:outputPath.slice(process.cwd().length+1)}};continue}const direct=findExactHistoryBlob(filename,expectedHash);if(direct)resolved[filename]=direct}
const missing=Object.keys(EXPECTED).filter(filename=>!resolved[filename]);
if(missing.length){const archive=findArchiveInHistory();if(archive){const recovered=await recoverFromArchive(archive);for(const filename of missing)if(recovered[filename])resolved[filename]=recovered[filename]}}
const stillMissing=Object.keys(EXPECTED).filter(filename=>!resolved[filename]);if(stillMissing.length)throw new Error(`BRAND_BYTES_NOT_FOUND_IN_GIT_HISTORY_OR_ARCHIVE ${stillMissing.join(',')}`);
const manifest={source_mode:'verified-git-history-or-archive-object',archive_sha256:ARCHIVE_SHA256,assets:{}};
for(const [filename,expectedHash] of Object.entries(EXPECTED)){const record=resolved[filename];if(sha256(record.bytes)!==expectedHash)throw new Error(`BRAND_HASH_MISMATCH ${filename}`);validateSvg(record.bytes,filename);await writeFile(join(outputDirectory,filename),record.bytes);manifest.assets[filename]={sha256:expectedHash,source:record.source};console.log(`Recovered ${filename} sha256=${expectedHash} source=${JSON.stringify(record.source)}`)}
const favicon=resolved['astera-symbol-dark.svg'].bytes;await writeFile(join(outputDirectory,'favicon.svg'),favicon);await writeFile(join(outputDirectory,'SOURCE.json'),`${JSON.stringify(manifest,null,2)}\n`);console.log(`Materialized ${Object.keys(EXPECTED).length} official Astera brand SVGs from verified Git history/archive bytes`);
