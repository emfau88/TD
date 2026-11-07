import { TavernVideoPlayer, videoPresentation } from './tavern-video';
import { tavernLocationConfig } from './tavern-locations';
import type { TavernLocation, TavernPlayer } from './tavern-presentation';
import type { Companion, Interaction, TouchRegion } from './tavern-social';
import type { TavernSceneClip } from './tavern-content';

/** Keep the current room visible until a complete, decoded replacement can take over. */
export class TavernVisitPlayer implements TavernPlayer {
  private player: TavernVideoPlayer;
  private who: Companion = 'mara';
  private count = 0;
  private request = 0;
  private staging = new Set<TavernVideoPlayer>();
  private place: TavernLocation = 'standard';
  changingLocation = false;
  constructor(private canvas: HTMLCanvasElement, private changed: () => void) {
    this.player = new TavernVideoPlayer(canvas, changed);
  }
  get location() { return this.place; }
  get ready() { return this.player.ready; }
  get reacting() { return this.changingLocation || this.player.reacting; }
  get reactionsReady() { return !this.changingLocation && this.player.reactionsReady; }
  get loadingReactions() { return this.changingLocation || this.player.loadingReactions; }
  setHearts(count: number) { this.count = count; this.player.setHearts(count); }
  async start(who: Companion = 'mara') {
    this.stop(); this.who = who;
    this.player = new TavernVideoPlayer(this.canvas, this.changed); this.player.setHearts(this.count);
    await this.player.start(who);
  }
  stop() {
    this.request++; for (const candidate of this.staging) candidate.stop(); this.staging.clear();
    this.player.stop(); this.changingLocation = false; this.place = 'standard';
  }
  canVisit(location: TavernLocation) {
    return location === 'standard' || !!tavernLocationConfig(this.who, this.count, location);
  }
  anchors() {
    return tavernLocationConfig(this.who, this.count, this.place)?.anchors ?? videoPresentation.anchors(this.who);
  }
  async setLocation(location: TavernLocation): Promise<boolean> {
    if (!this.canVisit(location) || !this.ready) return false;
    const request = ++this.request;
    for (const previous of this.staging) previous.stop(); this.staging.clear();
    if (location === this.place) { this.changingLocation = false; this.changed(); return true; }
    this.changingLocation = true; this.changed();
    const buffer = document.createElement('canvas');
    const config = tavernLocationConfig(this.who, this.count, location);
    const candidate = new TavernVideoPlayer(buffer, () => { if (candidate === this.player) this.changed(); },
      config);
    candidate.setHearts(this.count); this.staging.add(candidate);
    let backgroundTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      const backgroundReady = config ? new Promise<boolean>(resolve => {
        const image = new Image(); image.src = config.background;
        backgroundTimer = setTimeout(() => resolve(false), 10000);
        void image.decode().then(() => resolve(true), () => resolve(false));
      }) : Promise.resolve(true);
      const [, backgroundLoaded] = await Promise.all([candidate.start(this.who), backgroundReady]);
      if (request !== this.request || !candidate.ready || !backgroundLoaded) return false;
      this.player.stop(); this.player = candidate; this.place = location;
      this.staging.delete(candidate); candidate.attachCanvas(this.canvas);
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(backgroundTimer);
      if (this.staging.delete(candidate)) candidate.stop();
      if (request === this.request) { this.changingLocation = false; this.changed(); }
    }
  }
  prepareReactions() { return this.changingLocation ? Promise.resolve(false) : this.player.prepareReactions(); }
  play(region: TouchRegion) { if (!this.changingLocation) this.player.play(region); }
  scene(clip: TavernSceneClip) { if (!this.changingLocation) this.player.scene(clip); }
  act(action: Interaction) { if (!this.changingLocation) this.player.act(action); }
  gesture(key: string) { if (!this.changingLocation) this.player.gesture(key); }
  canGesture(key: string) { return this.player.canGesture(key); }
}
