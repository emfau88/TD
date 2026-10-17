import Phaser from 'phaser';
import { KEYS, SCALE, MARA_FOOT, preloadArt, prepareArt } from './art';
const workshop = new URL('../assets/workshop/workshop-i.png', import.meta.url).href;
class Comparison extends Phaser.Scene {
  preload() { preloadArt(this); this.load.image('workshop-check', workshop); }
  create() {
    prepareArt(this);
    for (let y = 0; y < 280; y += 40) for (let x = 0; x < 760; x += 40) this.add.image(x, y, KEYS.grass, 'grass').setOrigin(0).setDisplaySize(40, 40);
    this.add.image(90, 180, KEYS.grass, 'tree-0').setOrigin(0.5, 1).setScale(SCALE.tree);
    this.add.image(220, 180, KEYS.tower, 0).setOrigin(0.5, 0.8).setScale(SCALE.tower);
    this.add.image(220, 144, KEYS.weapon, 0).setScale(SCALE.tower);
    this.add.image(330, 180, KEYS.mara, 0).setOrigin(MARA_FOOT[0]/64, MARA_FOOT[1]/64);
    this.add.image(480, 180, KEYS.workshopDamaged).setOrigin(0.5, 112/128);
    this.add.image(640, 180, 'workshop-check').setOrigin(0.5, 112/128);
    ['Originalbaum','Waldwächter','Mara','Beschädigt','Werkstatt I'].forEach((name, i) => this.add.text([90,220,330,480,640][i], 215, name, {fontSize:'12px',color:'#172b1f'}).setOrigin(0.5));
  }
}
new Phaser.Game({type:Phaser.AUTO,parent:'comparison',width:760,height:280,pixelArt:true,roundPixels:true,audio:{noAudio:true},scene:[Comparison]});
