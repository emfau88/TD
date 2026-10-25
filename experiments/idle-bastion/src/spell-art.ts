import type Phaser from 'phaser';
export const SPELL_ART={
 'mara-spell':new URL('../assets/spells/mara-spell.webp',import.meta.url).href,
 'ilyra-spell':new URL('../assets/spells/ilyra-spell.webp',import.meta.url).href,
 'mara-ring':new URL('../assets/spells/mara-ring.webp',import.meta.url).href,
 'ilyra-ring':new URL('../assets/spells/ilyra-ring.webp',import.meta.url).href,
 destination:new URL('../assets/spells/destination.webp',import.meta.url).href,
 'mara-mote':new URL('../assets/spells/mara-mote.webp',import.meta.url).href,
 'star-projectile':new URL('../assets/spells/star-projectile.webp',import.meta.url).href,
 'star-impact':new URL('../assets/spells/star-impact.webp',import.meta.url).href,
} as const;
export type SpellArt=keyof typeof SPELL_ART;
export function preloadSpellArt(scene:Phaser.Scene):void {
 for(const [name,url]of Object.entries(SPELL_ART))scene.load.image(`spell-${name}`,url);
}
