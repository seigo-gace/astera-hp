import {createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const site=join(here,'..');
const manifest=JSON.parse(await readFile(join(site,'data/asset-manifest.json'),'utf8'));
const sha256=value=>createHash('sha256').update(value).digest('hex');

if(manifest.status!=='top-rebuild-svg-verified-logo-pending')throw new Error('ASSET_MANIFEST_STATUS_INVALID');
if(!manifest.topVisual?.activeOnTop||manifest.topVisual.uiOverlayAllowed!==false)throw new Error('TOP_VISUAL_ROLE_INVALID');
if(manifest.brandStatus?.officialLogo!=='pending-design-and-approval')throw new Error('OFFICIAL_LOGO_STATUS_INVALID');
if(manifest.brandStatus?.repositoryAssetRequired!==false||manifest.brandStatus?.temporaryHeaderLabelIsLogo!==false)throw new Error('PENDING_LOGO_POLICY_INVALID');
if(!Array.isArray(manifest.brand)||manifest.brand.length!==10||manifest.brand.some(asset=>asset.required!==false||asset.status!=='pending-official-design'||asset.sha256))throw new Error('PENDING_BRAND_SLOTS_INVALID');

const topPath=join(site,manifest.topVisual.file.replace(/^\/assets\//,'assets/'));
const top=await readFile(topPath);
if(top.length!==manifest.topVisual.bytes||top.length!==3097567)throw new Error(`TOP_SVG_SIZE_INVALID ${top.length}`);
const topHash=sha256(top);
if(topHash!==manifest.topVisual.sha256||topHash!=='84a9988a47157a9b6f01602fee08f1b176dbe7d6996a4fd42b07ca644551c5e2')throw new Error(`TOP_SVG_HASH_INVALID ${topHash}`);
const topText=top.toString('utf8');
if(!topText.includes('width="1536" height="1433"')||!topText.includes('viewBox="0 0 1536 1433"'))throw new Error('TOP_SVG_DIMENSION_INVALID');

for(const file of manifest.supportingVisuals){
  const path=join(site,file.replace(/^\/assets\//,'assets/'));
  const info=await stat(path);
  if(!info.isFile()||info.size<500)throw new Error(`SUPPORTING_VISUAL_INVALID ${file}`);
  const text=await readFile(path,'utf8');
  if(!/^<svg\b/.test(text.trim())||!/viewBox=/.test(text))throw new Error(`SUPPORTING_VISUAL_NOT_SVG ${file}`);
}

const home=await readFile(join(site,'templates','home.html'),'utf8');
if((home.match(/<details class="top-topic"/g)||[]).length!==9)throw new Error('TOP_MAIN9_COUNT_INVALID');
if(!home.includes(manifest.topVisual.file))throw new Error('TOP_ACTIVE_VISUAL_REFERENCE_MISSING');
if(/astera-globe-top\.webp|astera-globe-exact-layered|data-astera-hero|<canvas/.test(home))throw new Error('TOP_LEGACY_VISUAL_REFERENCE_PRESENT');
if(!home.includes('/supporters/')||!home.includes('/evidence/'))throw new Error('TOP_REQUIRED_ROUTE_LINK_MISSING');

const header=await readFile(join(site,'templates','partials','header.html'),'utf8');
if(!header.includes('header-language-row')||!header.includes('header-action-row')||!header.includes('data-brand-status="pending-official-logo"'))throw new Error('TOP_HEADER_STRUCTURE_OR_LOGO_STATUS_INVALID');
if(/<img[^>]+astera-top-brand|\/assets\/brand\/astera-(?:logo|symbol|wordmark)/.test(header))throw new Error('UNAPPROVED_LOGO_ASSET_REFERENCE_PRESENT');
if(!header.includes('astera-top-brand-label')||!header.includes('>Astera<'))throw new Error('TEMPORARY_BRAND_LABEL_MISSING');

const transport=await readFile(join(site,'assets','customer-ai-transport.js'),'utf8');
if(!transport.includes('https://api.asterav8.jp/v1/customer-ai')||!transport.includes('/messages')||!transport.includes('/jobs/'))throw new Error('CUSTOMER_AI_EDGE_CONTRACT_INVALID');
if(/HF_TOKEN|huggingface\.co|G-ACE\/astera-customerAI/.test(transport))throw new Error('CUSTOMER_AI_PRIVATE_SPACE_LEAK');

const packageJson=JSON.parse(await readFile(join(site,'..','package.json'),'utf8'));
if(packageJson.dependencies?.gsap!=='3.12.2')throw new Error('GSAP_PIN_INVALID');
if(packageJson.scripts?.build?.includes('materialize-official-brand-assets'))throw new Error('REMOVED_LOGO_RECOVERY_STILL_IN_BUILD');
const headers=await readFile(join(site,'public','_headers'),'utf8');
if(!/script-src 'self'/.test(headers)||/cdnjs|jsdelivr|unsafe-inline/.test(headers))throw new Error('CSP_INVALID');

console.log('Visual asset contract PASS (uploaded TOP SVG exact + official logo pending without substitute + Main 9 supporting SVG + private Customer AI boundary)');
