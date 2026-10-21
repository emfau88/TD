import clips from '../assets/voice-audition/manifest.json';

const urls = import.meta.glob('../assets/voice-audition/*.wav', { eager:true, query:'?url', import:'default' }) as Record<string,string>;
const root = document.querySelector<HTMLElement>('#clips')!;
const selected = new Set<string>();
for (const group of ['A','B']) {
  const section = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = `Aufnahme ${group} · ${group==='A'?'8':'16'} Varianten`;
  const grid = document.createElement('div'); grid.className='clips';
  for (const clip of clips.filter(c=>c.id.startsWith(group))) {
    const card=document.createElement('article');
    const label=document.createElement('label');
    const check=document.createElement('input'); check.type='checkbox';
    label.append(check,`${clip.id} vormerken`);
    const detail=document.createElement('p');
    detail.textContent=`${clip.duration.toFixed(2)} s · Original ${clip.start.toFixed(2)}–${clip.end.toFixed(2)} s`;
    const audio=document.createElement('audio'); audio.controls=true; audio.preload='none';
    audio.src=urls[`../assets/voice-audition/${clip.file}`]!;
    audio.setAttribute('aria-label',`${clip.id} anhören`);
    audio.addEventListener('play',()=>{
      for(const other of document.querySelectorAll('audio')) if(other!==audio) { other.pause(); other.currentTime=0; }
    });
    check.addEventListener('change',()=>{
      if(check.checked) selected.add(clip.id); else selected.delete(clip.id);
      document.querySelector<HTMLTextAreaElement>('#selection')!.value=[...selected].sort().join(', ');
      document.querySelector('#count')!.textContent=selected.size?`${selected.size} Favoriten ausgewählt.`:'Noch keine Favoriten ausgewählt.';
    });
    card.append(label,detail,audio);grid.append(card);
  }
  section.append(heading,grid);root.append(section);
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) for(const audio of document.querySelectorAll('audio')) audio.pause();
});
