import welcome from '../assets/intro/mara/welcome.webp';
import focused from '../assets/intro/mara/focused.webp';
import mischievous from '../assets/intro/mara/mischievous.webp';
import fallback from '../assets/tavern-rig/mara-portrait.webp';

const sources = [welcome, focused, mischievous];
let prepared: Promise<string[]> | undefined;
/** Only invoked for an eligible intro, alongside the normal game loader.
 * Bounded decode; optional artwork can never block starting the game. */
export function prepareIntroPortraits(): Promise<string[]> {
  return prepared ??= (async () => {
    const decoded = await Promise.all(sources.map(decode));
    const backup = decoded.every(Boolean) ? '' : await decode(fallback);
    return decoded.map(url => url || backup);
  })();
}
function decode(url: string): Promise<string> {
  return new Promise(resolve => {
    const image = new Image();
    const timer = window.setTimeout(() => done(''), 2500);
    let settled = false;
    function done(value: string) { if (settled) return; settled = true; clearTimeout(timer); image.onload = image.onerror = null; resolve(value); }
    image.onload = () => { void image.decode().then(() => done(url), () => done('')); };
    image.onerror = () => done('');
    image.src = url;
  });
}
