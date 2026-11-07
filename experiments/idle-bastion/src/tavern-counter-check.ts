import { GameAudio } from './game-audio';
import idle from '../assets/tavern-counter-probe/MC01.mp4';
import talk from '../assets/tavern-counter-probe/MC02.mp4';
import hair from '../assets/tavern-counter-probe/MC03.mp4';
import hand from '../assets/tavern-counter-probe/MC05.mp4';
import posterUrl from '../assets/tavern-counter-probe/poster.png';
import './tavern-counter-check.css';

if (!import.meta.env.DEV && import.meta.env.VITE_TAVERN_PREVIEW !== '1') throw new Error('Nur in der getrennten Tavernen-Vorschau verfügbar.');
const clips = { idle, talk, hair, hand };
type Clip = keyof typeof clips;
const labels: Record<Clip, string> = { idle: 'MC01 · Ruhe', talk: 'MC02 · Gespräch', hair: 'MC03 · Haarreaktion', hand: 'MC05 · Handreaktion' };
const video = document.querySelector<HTMLVideoElement>('#clip')!;
const poster = document.querySelector<HTMLImageElement>('#poster')!; poster.src = posterUrl;
const status = document.querySelector<HTMLElement>('#status')!;
const audio = new GameAudio({ combat: false }); audio.setState(true, false); audio.setTavern(true); audio.setCompanion('mara');
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-clip]')];
let generation = 0, current: Clip = 'idle', lifetime: AbortController | undefined, timer: ReturnType<typeof setTimeout> | undefined;
function controls(ready: boolean) { for (const button of buttons) button.disabled = !ready; }
function play(key: Clip, reactionSound = false) {
  const run = ++generation; current = key; lifetime?.abort(); lifetime = new AbortController(); clearTimeout(timer);
  video.pause(); video.hidden = true; poster.hidden = false; controls(false); status.textContent = `${labels[key]} wird geladen …`;
  video.loop = key === 'idle'; video.muted = true; video.defaultMuted = true; video.dataset.clip = key;
  const options = { signal: lifetime.signal };
  const failed = () => {
    if (run !== generation) return;
    clearTimeout(timer); video.pause(); video.hidden = true; poster.hidden = false; controls(true);
    status.textContent = `${labels[key]} konnte nicht geladen werden. Die gemeinsame Grundpose bleibt sichtbar; du kannst den Clip erneut wählen.`;
  };
  video.addEventListener('loadeddata', () => {
    if (run !== generation) return;
    clearTimeout(timer); video.hidden = false; poster.hidden = true; controls(true);
    status.textContent = labels[key] + (key === 'idle' ? ' · Ruheloop' : ' · anschließend zurück zur Ruhe');
    void video.play().catch(() => { status.textContent = `${labels[key]} ist bereit. Zum Abspielen die Videosteuerung verwenden.`; });
    if (reactionSound) audio.touchCompanion('mara');
  }, { ...options, once: true });
  video.addEventListener('error', failed, { ...options, once: true });
  video.addEventListener('ended', () => { if (run === generation && current !== 'idle') play('idle'); }, options);
  timer = setTimeout(failed, 15000); video.src = clips[key]; video.load();
}
for (const button of buttons) button.addEventListener('click', () => {
  const key = button.dataset.clip as Clip; if (Object.hasOwn(clips, key)) play(key, key === 'hair' || key === 'hand');
});
const soundStatus = document.querySelector<HTMLElement>('#sound-status')!;
document.querySelector('#enable-sound')!.addEventListener('click', () => { audio.setMix({ muted: false }); soundStatus.textContent = 'Ton aktiv. Hand- oder Haarreaktion wählen; Stimme und Musik verwenden die vorhandenen Spielregler.'; });
const volume = document.querySelector<HTMLInputElement>('#voice-volume')!; volume.value = String(Math.round(audio.mix.voices * 100));
volume.addEventListener('input', () => audio.setMix({ voices: Number(volume.value) / 100 }));
for (const [key, file] of Object.entries(clips)) {
  const link = document.createElement('a'); link.href = file; link.textContent = `${labels[key as Clip]} einzeln öffnen`; link.target = '_blank'; link.rel = 'noopener'; document.querySelector('#files')!.append(link);
}
function destroy() { clearTimeout(timer); lifetime?.abort(); video.pause(); audio.destroy(); }
window.addEventListener('pagehide', destroy, { once: true });
if (import.meta.hot) import.meta.hot.dispose(destroy);
play('idle');
