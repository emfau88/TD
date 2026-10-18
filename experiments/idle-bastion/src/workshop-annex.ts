import type Phaser from 'phaser';

/** Original code-drawn 32x39 workbench canopy, matching the red-roof workshop.
 * Its ground anchor and navigation stay unchanged; no bitmap is modified. */
export function drawWorkshopAnnex(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  const rect = (color: number, dx: number, dy: number, w: number, h: number) => g.fillStyle(color,1).fillRect(x+dx,y+dy,w,h);
  rect(0x30363e,31,-4,30,5); rect(0x66534b,33,-3,26,3);
  rect(0x45352d,34,-28,4,27); rect(0x45352d,56,-28,4,27);
  rect(0xaa7247,35,-27,2,24); rect(0xaa7247,57,-27,2,24);
  rect(0x3b3734,37,-26,19,19);
  rect(0x594335,38,-17,17,11); rect(0xbf874e,36,-18,22,4);
  rect(0xe3af67,36,-18,22,1); rect(0x433b34,39,-7,3,6); rect(0x433b34,53,-7,3,6);
  rect(0x453035,30,-30,32,4); rect(0x694044,32,-34,27,4); rect(0xa75243,35,-38,22,4);
  rect(0xc36a49,35,-38,22,1); rect(0xbf6648,32,-34,27,1); rect(0xd68451,30,-30,32,1);
  for (const dx of [37,44,51]) { rect(0x75413d,dx,-37,1,3); rect(0x75413d,dx-2,-33,1,3); }
  rect(0x354557,43,-22,10,3); rect(0x8194a0,41,-24,13,3);
  rect(0xced4cb,41,-24,13,1); rect(0x826044,40,-22,2,4);
  rect(0xe0b766,35,-26,4,5); rect(0xffdc8e,36,-25,2,3);
}
