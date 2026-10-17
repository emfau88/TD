import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, relative, isAbsolute, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const enemyPreview = process.argv[2] === 'enemy';
const succubusPreview = process.argv[2] === 'succubus';
const woodland = process.argv[2] === 'forest';
const stylePreview = process.argv[2] === 'style' || woodland || enemyPreview || succubusPreview;
const filename = succubusPreview ? 'Spire-Succubus.html' : enemyPreview ? 'Spire-Gegnerprobe.html' : woodland ? 'Spire-Regionen.html' : stylePreview ? 'Spire-Style.html' : 'Spire-Original.html';
const manifest = JSON.parse(await readFile(resolve(root, 'public/assets/manifest.json'), 'utf8'));
const images = Object.fromEntries(await Promise.all(Object.keys(manifest).map(async name => [
  name,
  `data:image/png;base64,${(await readFile(resolve(root, 'public/assets', `${name}.png`))).toString('base64')}`,
])));
if (stylePreview) images['Mara style source'] = `data:image/png;base64,${(await readFile(resolve(root, 'public/assets/Mara style source.png'))).toString('base64')}`;
if (woodland || enemyPreview || succubusPreview) for(const name of ['Laternenmoor Props v1','Spiegelwinter Tiles v1','Spiegelwinter Sprites v1','Windbruch Tiles v1','Windbruch Sprites v1','Windbruch Details v1','Lantern Jelly Pixel v1','Succubus Pixel v2'])images[name] = `data:image/png;base64,${(await readFile(resolve(root, 'public/assets',`${name}.png`))).toString('base64')}`;
const uiNames = ['panel-frame.png', 'button-states.png', 'menu-backdrop.png', 'spire-emblem.png', 'hud-icons.png', 'tower-slots.png', 'map-covers.png'];
const uiImages = Object.fromEntries(await Promise.all(uiNames.map(async name => [
  name,
  `data:image/png;base64,${(await readFile(resolve(root, 'public/ui', name))).toString('base64')}`,
])));
const distRoot = resolve(root, succubusPreview ? 'succubus-dist' : enemyPreview ? 'enemy-dist' : woodland ? 'woodland-dist' : stylePreview ? 'style-dist' : 'dist');
const builtPath = (url, directory = distRoot) => {
  const cleanUrl = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  const assetPath = cleanUrl.startsWith('/')
    ? resolve(distRoot, cleanUrl.replace(/^\/+/, ''))
    : resolve(directory, cleanUrl);
  const pathFromDist = relative(distRoot, assetPath);
  if (pathFromDist.startsWith('..') || isAbsolute(pathFromDist)) throw new Error(`Asset outside dist: ${url}`);
  return assetPath;
};
const builtHtml = await readFile(resolve(distRoot, succubusPreview ? 'succubus-preview.html' : enemyPreview ? 'enemy-preview.html' : woodland ? 'woodland.html' : stylePreview ? 'style.html' : 'index.html'), 'utf8');
const scriptPath = builtHtml.match(/<script[^>]*src="([^"\s]+)"[^>]*><\/script>/)?.[1];
const stylePath = builtHtml.match(/<link[^>]*href="([^"\s]+\.css)"[^>]*>/)?.[1];
if (!scriptPath || !stylePath) throw new Error('Run npm run build before packaging.');
const script = await readFile(builtPath(scriptPath), 'utf8');
const styleFile = builtPath(stylePath);
const styles = await readFile(styleFile, 'utf8');
const mimeTypes = {
  '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
};
const cssUrlPattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/g;
const cssAssetUrls = [...new Set([...styles.matchAll(cssUrlPattern)]
  .map(match => (match[1] ?? match[2] ?? match[3]).trim())
  .filter(url => !url.startsWith('data:') && !url.startsWith('#')))];
const embeddedCssAssets = new Map(await Promise.all(cssAssetUrls.map(async url => {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) throw new Error(`External CSS asset cannot be packaged: ${url}`);
  const assetPath = builtPath(url, dirname(styleFile));
  const mimeType = mimeTypes[extname(assetPath).toLowerCase()];
  if (!mimeType) throw new Error(`Unsupported CSS asset: ${url}`);
  return [url, `data:${mimeType};base64,${(await readFile(assetPath)).toString('base64')}`];
})));
const embeddedStyles = styles.replace(cssUrlPattern, (match, doubleQuoted, singleQuoted, unquoted) => {
  const url = (doubleQuoted ?? singleQuoted ?? unquoted).trim();
  return embeddedCssAssets.has(url) ? `url("${embeddedCssAssets.get(url)}")` : match;
});
const bundle = JSON.stringify({ manifest, images, uiImages }).replaceAll('<', '\\u003c');
const document = `<!doctype html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="theme-color" content="#132c28"><title>${succubusPreview ? 'Rosenspiegel · Succubus · Spire' : enemyPreview ? 'Laternenqualle · Grafikprobe · Spire' : woodland ? 'Vier Regionen · Spire' : stylePreview ? 'Waldlichtung · Spire Grafikprobe' : 'Originalkarten · Spire — Hüter des Waldes'}</title><style>${embeddedStyles.replaceAll('</style', '<\\/style')}</style></head>
<body><div id="app"></div><script>window.__SPIRE_BUNDLE__=${bundle};</script><script type="module">${script.replaceAll('</script', '<\\/script')}</script></body></html>`;
await writeFile(resolve(root, filename), document);
// Keep the accepted woodland launcher's URL and browser storage working.
if (woodland) await writeFile(resolve(root, 'Spire-Wald.html'), document);
console.log(`${filename}: ${(Buffer.byteLength(document) / 1024 / 1024).toFixed(2)} MB, ${Object.keys(images).length} game images, ${Object.keys(uiImages).length} UI images, ${embeddedCssAssets.size} CSS assets embedded`);
