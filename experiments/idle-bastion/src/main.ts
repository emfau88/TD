import {towerPreviewDatabase} from './tower-evolution';
import { TavernStoryHistory } from './tavern-story-history';
import { mountCredits } from './credits-ui';
import { offlineGoldDisplay } from './reward-display';
import { loadingScreen } from './loading-screen';
import { startupText } from './locales/startup';
import { t, numberFormat, onLanguageChange, language } from './i18n';
import { bindStaticTranslations, mountLanguageSettings } from './i18n-dom';
import { GameAudio } from './game-audio';
import { TavernUI } from './tavern-ui';
import { tavernGiftStatus } from './tavern-gift-status';
import { COMPANIONS } from './tavern-companions';
import { rigPreviewPresentation } from './tavern-rig-preview';
import { discoveryStep, updateDiscoveryUI } from './discovery-ui';
import { LessonPointer } from './lesson-pointer';
import { updateOnboarding } from './onboarding-ui';
import { MaraIntro } from './mara-intro';
import { tutorialProgress } from './tutorial-progress';
import { TutorialGuide } from './tutorial-guide';
import { prepareIntroPortraits } from './intro-portraits';
import maraOfflinePortrait from '../assets/intro/mara/mischievous.webp';
import { updateOfflineWelcome } from './offline-welcome';
import './offline-welcome.css';
import './mara-intro.css';
import { QuickWinGuidance, workshopGoldMissing, type QuickWinNotice } from './quick-win-guidance';
import './quick-win-guidance.css';
import { introducedEnemy } from './enemy-roster';
import { MARA } from './mara';
import { heroWorldAvailable, maraControlStage, recommendIlyraPosition, ilyraFirstTarget, type ControlledHero } from './hero-controls';
import { syncIlyraUI } from './ilyra-ui';
import { syncVolleyAction } from './volley-action';
import { syncMaraAction } from './mara-action';
import type { BuildingId, GridCell } from './layout';
import Phaser from 'phaser';
import { bossEncounter } from './boss';
import './battle.css';
import './progress.css';
import './premium.css';
import './spell-actions.css';
import './tutorial-guide.css';
import './header-pause.css';
import { mountUIIcons, uiIcon } from './ui-icons';
import { STORM_CHAIN, STORMLIGHT, SETTLEMENT, towerDefinition, type TowerId, stats, upgradeCost, sellValue, type IdleBattle } from './battle';
import { BattleScene } from './battle-scene';
import { nextObjective, tutorialHint, tutorialStep } from './hud';
import { BattleSession, SessionLoadError, SessionOwnershipError } from './battle-session';
import { openBattleStore, type BattleSaveStore } from './save-store';
import { offlinePolicy, WAREHOUSE_OFFLINE } from './offline';
import { farmRewardGold } from './farming';
import { ART } from './art';
import { drawDockArt } from './dock-art';
import { createProgressUI, recommendedUpgrade } from './progress-ui';

const element = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const value = document.getElementById(id);
  if (!value) throw new Error(t("Missing battle element: {0}", id));
  return value as T;
};
const unbindStaticLanguage = bindStaticTranslations(document);
const unmountLanguage = mountLanguageSettings(document);
mountUIIcons();
const lessonPointer = new LessonPointer();
let focusedLesson = "";
let workshopRevealUntil = 0;
let focusedDiscovery = '';
const lifetime = new AbortController();
mountCredits(lifetime.signal);
const audio = new GameAudio();
audio.bindControls(element('audio-controls'));
const currency = numberFormat({ maximumFractionDigits: 0 });
const rateFormat = numberFormat({ maximumFractionDigits: 1 });
const damageFormat = numberFormat({ minimumFractionDigits: 1, maximumFractionDigits: 1 });
const intervalFormat = numberFormat({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
const build = element<HTMLButtonElement>('build');
const upgrade = element<HTMLButtonElement>('upgrade');
const sell = element<HTMLButtonElement>('sell');
const pause = element<HTMLButtonElement>('pause');
const advance = element<HTMLButtonElement>('advance');
const claim = element<HTMLButtonElement>('claim-offline');
const recover = element<HTMLButtonElement>('recover-save');
const assignMara = element<HTMLButtonElement>('assign-mara');
const buildFrost = element<HTMLButtonElement>('build-frost');
const buildWarehouse = element<HTMLButtonElement>('build-warehouse');
const buildWorkshop = element<HTMLButtonElement>('build-workshop');
const researchFrost = element<HTMLButtonElement>('research-frost');
const padChoice = element<HTMLSelectElement>('pad-choice');
const entryURL = new URL(location.href);
if (entryURL.searchParams.has('fresh')) {
  entryURL.searchParams.delete('fresh'); entryURL.searchParams.set('probe', crypto.randomUUID());
  history.replaceState(null, '', entryURL);
}
const probeSlot = entryURL.searchParams.get('probe');
// Explicit fresh probes keep the user's main game and its offline clock intact.
const databaseName = towerPreviewDatabase(probeSlot);
let session: BattleSession | undefined;
let intro: MaraIntro | undefined;
let introPortraits: string[] = [];
let finishingIntro = false;
let scene: BattleScene | undefined;
let game: Phaser.Game | undefined;
let gameResize: ResizeObserver | undefined;
let store: BattleSaveStore | undefined;
let selectedPadId: string | undefined;
let selectedTechnology: 'frost'|'storm' = 'frost';
let selectedPanel: 'tower' | 'settlement' | 'warehouse' | 'tavern' | 'mara' | 'wisp' | 'ilyra' | 'clearing' = 'tower';
let catalogPanel: 'tower' | 'settlement' = 'tower';
let contextOpen = false;
let placementType: TowerId | undefined;
let groundMode: 'mara' | BuildingId | undefined;
let ilyraMode: 'move' | 'cast' | undefined;
let selectedHero: ControlledHero | undefined;
let heroGeneration = 0;
let heroSuggestion: { x: number; y: number } | undefined;
let heroFeedback: (() => string) | undefined;
let heroFeedbackUntil = 0;
let resumeIlyraGuide = false;
const buildingName = (id: BuildingId): string => ({ workshop: t('Werkstatt'), warehouse: t('Lager'), tavern: t('Taverne') })[id];
const buildingBuilt = (b: IdleBattle, id: BuildingId): boolean => b.settlement[`${id}Built`];
const buildingCost = (b: IdleBattle, id: BuildingId): number => id === 'workshop' ? b.workshopBuildCost : SETTLEMENT[`${id}Cost`];
let groundCandidate: GridCell | undefined;
let toastUntil = 0;
let combatMessage: (() => string) | undefined;
function showCombatMessage(message = combatMessage): void {
  combatMessage = message;
  if (message) element('combat-message').textContent = message();
}
const announcedEnemies = new Set<string>();
let padListKey = '';
let mobileHintOpen = false;
let mobileHintStep = -1;
let ready = false;
let tavernStories: TavernStoryHistory | undefined;
const tavernUI = new TavernUI({ storyHistory: () => tavernStories, session: () => session, presentation: rigPreviewPresentation, navigate: kind => openContext(kind, true), onOpenChange: open => audio.setTavern(open), onGift: () => audio.play('gift'), onHeart: () => audio.play('gift'), onCompanion: who => audio.setCompanion(who), onTouch: who => audio.touchCompanion(who) });
const quickWins = new QuickWinGuidance(databaseName, { action: openQuickWin, dismissed: acknowledgeQuickWin }, lifetime.signal);
const tutorialGuide = new TutorialGuide();
let booting = false;
let lifecycle = Promise.resolve();
let retryTimer: number | undefined;
const progressUI = createProgressUI(action => {
  if (action === 'archer' || action === 'frost' || action === 'cannon' || action === 'sniper') startPlacement(({ archer: 1, frost: 2, cannon: 3, sniper: 4 } as const)[action]);
  else if (action === 'mara' || action === 'wisp') openContext(action);
  else if (action === 'clearing') { catalogPanel = 'settlement'; openContext('clearing'); }
  else if (action === 'warehouse') { catalogPanel = 'settlement'; openContext('warehouse'); }
  else if (action === 'workshop') { catalogPanel = 'settlement'; openContext('settlement'); }
  else if (action === 'upgrade' && session) {
    const towers = session.battle.towers;
    const tower = recommendedUpgrade(session.battle) ?? towers[0];
    if (!tower) return;
    selectedPadId = tower.padId; scene?.setSelected(selectedPadId); openContext('tower');
  }
}, lifetime.signal);

function duration(ms: number): string {
  const seconds = Math.floor(ms / 1000), minutes = Math.floor(seconds / 60), hours = Math.floor(minutes / 60);
  return hours ? t("{0} Std. {1} Min.", hours, minutes % 60) : minutes ? t("{0} Min. {1} Sek.", minutes, seconds % 60) : t("{0} Sek.", seconds);
}
function showError(message: string, canRecover = false, ownership = false): void {
  element('error-panel').hidden = false;
  element('app-error').hidden = false;
  element('app-error').textContent = t(message);
  element('load-actions').hidden = false;
  recover.hidden = !canRecover;
  element('activate-session').hidden = !ownership;
  element('temporary-session').hidden = ownership;
  const startup = loadingScreen();
  if (!ready && startup?.visible) startup.fail(t(message), () => window.location.reload(), () => startup.dismiss());
}
window.addEventListener('error', event => showError(t("Ein unerwarteter Fehler ist aufgetreten: {0}", event.message)), { signal: lifetime.signal });

function syncUI(): void {
  const live = session;
  const view = scene;
  audio.setState(ready && !!live && !live.error && !live.suspended && !live.awaitingResume, !!live && !live.paused && !live.tavernOpen && !live.battle.learningPaused && !live.battle.preparing);
  const unavailable = !ready || !live || live.inputBusy || Boolean(live.error) || live.suspended;
  if (intro?.active) {
    element<HTMLButtonElement>('intro-skip').disabled = unavailable || finishingIntro || !!live?.awaitingResume;
    element<HTMLButtonElement>('onboarding-primary').disabled = unavailable || finishingIntro || !!live?.awaitingResume;
  }
  build.disabled = upgrade.disabled = sell.disabled = pause.disabled = advance.disabled = claim.disabled = assignMara.disabled = unavailable;
  if (!ready || !live || live.error || live.suspended || live.paused || live.tavernOpen)
    element<HTMLButtonElement>('onboarding-primary').disabled = element<HTMLButtonElement>('onboarding-secondary').disabled = true;
  element<HTMLButtonElement>('build-cannon').disabled = element<HTMLButtonElement>('build-sniper').disabled = unavailable;
  buildFrost.disabled = buildWorkshop.disabled = buildWarehouse.disabled = researchFrost.disabled = unavailable;
  if (!ready || !live || !view) { quickWins.hide(); lessonPointer.show(); return; }
  view.paused = live.paused || live.tavernOpen || document.hidden || Boolean(live.error) || live.suspended || live.awaitingResume;
  const saveStatus = element('save-status');
  saveStatus.dataset.revision = String(live.revision);
  saveStatus.textContent = t(live.error ? t('Probe angehalten · letzter bestätigter Stand erhalten')
    : live.suspended ? t('Abwesend · Kampf angehalten')
    : live.temporary ? t('Temporäre Probe · kein Speichern und kein Offline-Ertrag')
    : live.busy ? t('Wird gespeichert …') : t('1× · dieser Tab ist aktiv · lokal gespeichert'));
  tavernUI.update();
  if (live.inputBusy) return;
  const sim = live.battle;
  if (selectedHero && !heroContextAvailable()) clearHeroSelection();
  if (resumeIlyraGuide && heroContextAvailable() && !live.inputBusy) {
    resumeIlyraGuide = false;
    if (sim.ilyra?.introduction !== 'done' && !contextOpen && !placementType && !groundMode) { selectHero('ilyra'); return; }
  }
  element('tower-panel').hidden = selectedPanel !== 'tower';
  element('clearing-panel').hidden = selectedPanel !== 'clearing';
  element('tavern-panel').hidden = selectedPanel !== 'tavern';
  element('ilyra-panel').hidden = selectedPanel !== 'ilyra';
  syncIlyraUI(sim, unavailable || live.awaitingResume, view.paused);
  element('warehouse-panel').hidden = selectedPanel !== 'warehouse';
  element('settlement-panel').hidden = selectedPanel !== 'settlement';
  element('wisp-panel').hidden = selectedPanel !== 'wisp';
  element('wisp-status').textContent = t(sim.wispUnlocked ? t("Aktiv · +10 % Kampf-Gold. Auftrag: {0} versorgen.", sim.settlement.warehouseBuilt ? t('Werkstatt und Lager') : t('die Werkstatt')) : t("Wisp kommt kostenlos nach Frostfassung und gemeisterter Welle 5. {0} · {1}.", sim.settlement.frostResearched ? t('Frostfassung ✓') : t('Frostfassung fehlt'), sim.highestCleared >= 5 ? t('Welle 5 ✓') : t('Welle 5 noch offen')));
  element('pick-wisp').classList.toggle('locked', !sim.wispUnlocked);
  element('wisp-brief').textContent = t(sim.wispUnlocked ? t('+10 % Gold') : t('Frost & Welle 5'));
  element('pick-wisp').setAttribute('aria-label', t(sim.wispUnlocked ? t('Wisp · +10 Prozent Kampf-Gold') : t('Wisp · Frostfassung und Welle 5 nötig')));
  element('catalog-next').hidden = false;
  element('mara-panel').hidden = selectedPanel !== 'mara';
  element('context-panel').hidden = !contextOpen || live.awaitingResume || Boolean(live.error);
  element('tower-catalog').hidden = catalogPanel !== 'tower';
  element('settlement-catalog').hidden = catalogPanel !== 'settlement';
  for (const kind of ['tower', 'settlement'] as const) {
    element(`${kind}-tab`).setAttribute('aria-selected', String(catalogPanel === kind));
    element(`${kind}-tab`).tabIndex = catalogPanel === kind ? 0 : -1;
  }
  const blocked = unavailable || view.paused || sim.phase === 'defeat' || sim.preparing;
  view?.setPlacement(placementType, groundMode, groundCandidate);
  view.setIlyraMode(ilyraMode);
  view.setHeroSelection(selectedHero, heroSuggestion);
  element('placement-help').hidden = !(placementType || groundMode || ilyraMode || selectedHero) || live.awaitingResume;
  element('placement-text').textContent = t(ilyraMode === 'move' ? t('Ilyra · freien Standort am Weg antippen · Ziehen verschiebt die Karte')
    : ilyraMode === 'cast' ? t('Sternensalve · Gegner innerhalb der blauen Reichweite antippen')
    : groundMode === 'mara' ? t('Mara · begehbares Ziel antippen')
    : groundMode && buildingBuilt(sim, groundMode) ? t('Neuen Standort wählen und Versetzen bestätigen')
    : groundMode ? t("{0} · freien Platz antippen · {1}", buildingName(groundMode), groundMode === 'workshop' && sim.workshopKitAvailable ? t('kostenlos') : t("{0} Gold", buildingCost(sim, groundMode)))
    : sim.preparing ? t('Startturm · Pfeil zeigt einen guten Platz · antippen und kostenlos bauen')
    : sim.guiding ? t('Frostkristall · markierten Platz antippen · kostenlos')
    : t("{0} · freies Feld am Weg antippen und direkt bauen", towerDefinition(placementType ?? 1).name));
  if (selectedHero && !ilyraMode) element('placement-text').textContent = heroSelectionText(sim);
  if (selectedHero && heroFeedback && performance.now() < heroFeedbackUntil) element('placement-text').textContent = heroFeedback();
  element('placement-help').title = selectedHero ? t('Desktop: Auch Rechtsklick auf freien Boden bewegt die gewählte Figur. Esc beendet die Auswahl.') : '';
  const heroAim = element<HTMLButtonElement>('hero-aim'), heroLocation = element<HTMLButtonElement>('hero-location');
  heroAim.hidden = selectedHero !== 'ilyra' || !!ilyraMode;
  syncVolleyAction(heroAim, sim, unavailable, view.paused);
  const heroMaraCast = element<HTMLButtonElement>('hero-mara-cast');
  heroMaraCast.hidden = selectedHero !== 'mara' || !!ilyraMode;
  syncMaraAction(heroMaraCast, sim, unavailable || !heroContextAvailable(), view.paused);
  heroLocation.hidden = selectedHero !== 'ilyra' || sim.ilyra?.introduction === 'done' || !!ilyraMode || !heroSuggestion;
  heroLocation.disabled = unavailable;
  element('placement-help').dataset.hero = selectedHero ?? '';
  for (const hero of ['mara', 'ilyra'] as const) element(`pick-${hero}`).classList.toggle('hero-selected', selectedHero === hero);
  const confirm = element<HTMLButtonElement>('confirm-placement');
  confirm.hidden = !groundMode || groundMode === 'mara' || !buildingBuilt(sim, groundMode);
  if (groundMode === 'mara') confirm.hidden = true;
  const groundBuilt = !!groundMode && groundMode !== 'mara' && buildingBuilt(sim, groundMode);
  confirm.textContent = t(groundMode ? groundBuilt ? t('Hier versetzen') : t("Hier bauen · {0} Gold", buildingCost(sim, groundMode === 'mara' ? 'workshop' : groundMode)) : sim.preparing ? sim.towers.length ? t('Hierher versetzen · kostenlos') : t('Hier bauen · kostenlos') : sim.towerBuildCost(placementType ?? 1) === 0 ? t('Hier bauen · kostenlos') : t("Hier bauen · {0} Gold", sim.towerBuildCost(placementType ?? 1)));
  confirm.disabled = unavailable || sim.phase === 'defeat' || (!groundMode && live.paused) || (groundMode ? !groundCandidate || !sim.canPositionBuilding(groundMode === 'mara' ? 'workshop' : groundMode, groundCandidate)
    || (groundBuilt ? !live.paused : sim.gold < buildingCost(sim, groundMode === 'mara' ? 'workshop' : groundMode))
    : !selectedPadId || !sim.canBuild(selectedPadId, placementType));
  element('pick-archer').setAttribute('aria-pressed', String(placementType === 1));
  element('pick-frost').setAttribute('aria-pressed', String(placementType === 2));
  element('pick-frost').classList.toggle('locked', !sim.settlement.frostResearched);
  element('frost-lock').textContent = t(sim.settlement.frostResearched ? t('Verlangsamung') : t('Frostfassung nötig'));
  element('frost-price').textContent = sim.frostKitAvailable ? t('Kostenlos') : t(sim.settlement.frostResearched ? '110' : t('Forschung'));
  element('pick-frost').setAttribute('aria-label', sim.frostKitAvailable ? t('Frostkristall · erster Bau kostenlos') : t('Frostkristall · 110 Gold'));
  for (const [name, kind, role, condition] of [['cannon', 3, t('Flächenschaden'), t('Frost & Welle 5')], ['sniper', 4, t('Ignoriert Rüstung'), t('Welle 10 meistern')], ['storm', 5, t('Kette · höchstens drei Ziele'), t('Werkstattforschung & Welle 28')]] as const) {
    const unlocked = sim.isTowerUnlocked(kind);
    element(`pick-${name}`).classList.toggle('locked', !unlocked);
    element(`pick-${name}`).setAttribute('aria-pressed', String(placementType === kind));
    element(`${name}-lock`).textContent = t(unlocked ? role : condition);
    element(`${name}-price`).textContent = t(unlocked ? String(towerDefinition(kind).cost) : kind === 3 ? sim.highestCleared < 5 ? t('Welle 5') : t('Forschung') : kind === 5 ? t('Forschung') : t('Welle 10'));
  }
  const freePads = sim.layout.towerPads.filter(pad => sim.isPadUnlocked(pad.id) && !sim.towers.some(tower => tower.padId === pad.id));
  const padKey = language() + ':' + freePads.map(pad => pad.id).join(',');
  if (padKey !== padListKey) {
    padListKey = padKey;
    const names: Record<string, string> = { 'tower-02': t('Nordwest'), 'tower-03': t('Nordost'), 'tower-04': t('Südkurve'), 'tower-05': t('Nordweg'), 'tower-06': t('Engpass'), 'tower-07': t('Südweg'), 'tower-08': t('Kernwache'), 'tower-09': t('Nordbogen'), 'tower-10': t('Mittelpass'), 'tower-11': t('Südbogen'), 'tower-east-01': t('Östlicher Sporn'), 'tower-east-02': t('Ostbogen') };
    const current = padChoice.value;
    padChoice.replaceChildren(new Option(t('Bauplatz wählen …'), ''), ...sim.layout.towerPads.filter(pad => sim.isPadUnlocked(pad.id)).map(pad => new Option(names[pad.id] ?? t("Feld {0}/{1}", pad.cell.x + 1, pad.cell.y + 1), pad.id)));
    padChoice.value = current;
    element('placement-pads').replaceChildren();
  }
  const certificate = live.certificate;
  element('next-objective').textContent = t(nextObjective(sim));
  const playSeconds = sim.elapsed + sim.introduction.preparationSeconds;
  element('play-time').textContent = t(`${Math.floor(playSeconds / 60)}:${String(Math.floor(playSeconds % 60)).padStart(2, '0')}`);
  const hintStep = tutorialStep(sim), discovery = discoveryStep(sim);
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  if (hintStep !== mobileHintStep) { mobileHintStep = hintStep; mobileHintOpen = hintStep === 15; }
  element('wisp-arrival').hidden = !sim.wispUnlocked || sim.wispArrival.met || contextOpen || Boolean(placementType || groundMode) || live.awaitingResume;
  element('pick-wisp').classList.toggle('new-companion', sim.wispUnlocked && !sim.wispArrival.met);
  const hintAvailable = sim.introduction.stage === 'done' && !sim.discoveryActive && (sim.wispArrival.met || !sim.wispUnlocked) && !sim.bossActive && !sim.tutorial.hidden && !(sim.tutorial.seen & (1 << hintStep)) && !contextOpen && !placementType && !selectedHero && !live.awaitingResume;
  element('tutorial-card').hidden = !hintAvailable || (mobile && !mobileHintOpen);
  element('mobile-hint').hidden = !mobile || !hintAvailable || mobileHintOpen;
  element('mobile-hint').setAttribute('aria-expanded', String(mobileHintOpen));
  element('tutorial-hint').textContent = t(tutorialHint(sim));
  element('tutorial-card').dataset.step = String(hintStep);
  element('hint-action').hidden = hintStep !== 15;
  element('pick-mara').classList.toggle('new-companion', hintStep === 15 && sim.wispArrival.met && !sim.tutorial.hidden);
  const mara = sim.mara;
  const maraTarget = sim.towers.find(tower => tower.uid === mara.targetTowerUid);
  const targetName = maraTarget?.protected ? t('Startturm') : maraTarget?.def.name ?? t('Noch kein Turm');
  const inSpellRange = !!maraTarget && Math.hypot(mara.x - maraTarget.x, mara.y - maraTarget.y) <= MARA.range;
  element('mara-brief').textContent = t(sim.maraIntroductionPending ? t('Nach Wisp') : mara.effectRemaining > 0 ? t("Buff · {0} s", Math.ceil(mara.effectRemaining)) : mara.cooldownRemaining > 0 ? t("Bereit in {0} s", Math.ceil(mara.cooldownRemaining)) : t('Zauber bereit'));
  element<HTMLProgressElement>('mara-cooldown').value = MARA.cooldown - mara.cooldownRemaining;
  element('mara-status').textContent = t(sim.maraIntroductionPending ? t('Mara zeigt dir Übertakten nach Wisps Ankunft. Zuerst bauen wir die Verteidigung auf.') : t("Ziel: {0}. ", targetName) + (mara.effectRemaining > 0 ? t("Buff wirkt noch {0} s.", Math.ceil(mara.effectRemaining)) : mara.cooldownRemaining > 0 ? t("Abklingzeit: {0} s.", Math.ceil(mara.cooldownRemaining)) : !inSpellRange ? t('Außerhalb der Zauberreichweite. Ziel erneut zuweisen oder näher laufen.') : mara.autoCast ? t('Bereit · wartet auf Gegner beim Ziel.') : t('Bereit · manuell auslösen.')));
  const maraStage = maraControlStage(sim), fullMaraMenu = maraStage === 'ready';
  element('mara-panel').dataset.stage = maraStage;
  element('mara-title').textContent = t(fullMaraMenu ? 'Mara · Übertakten' : 'Mara');
  element('mara-title').hidden = !fullMaraMenu;
  const maraDetails = element<HTMLDetailsElement>('mara-details');
  maraDetails.hidden = !fullMaraMenu;
  if (!fullMaraMenu) maraDetails.open = false;
  element('move-mara').hidden = element('mara-auto').hidden = !fullMaraMenu;
  const manualLesson = maraStage === 'lesson' && sim.discovery === 'mara-ready' && !mara.autoCast;
  element('cast-mara').hidden = !fullMaraMenu && !manualLesson;
  element('mara-actions').hidden = !fullMaraMenu && !manualLesson;
  if (maraStage === 'waiting') element('mara-status').textContent = t(sim.discovery === 'mara-wait'
    ? 'Mara zeigt dir gleich ihren Zauber. Danach kannst du sie selbst steuern.'
    : 'Nach Wisps Ankunft zeigt dir Mara ihren Zauber. Danach kannst du sie selbst steuern.');
  else if (maraStage === 'lesson') element('mara-status').textContent = manualLesson
    ? t('Wirke jetzt Übertakten. Danach lernst du Maras Steuerung kennen.')
    : mara.effectRemaining > 0 ? t('Übertakten · noch {0} s. Danach kannst du Mara steuern.', Math.ceil(mara.effectRemaining))
    : t('Mara wartet auf Gegner, um dir Übertakten zu zeigen.');
  const auto = element<HTMLButtonElement>('mara-auto'); auto.disabled = blocked; auto.textContent = t("Automatik: {0}", mara.autoCast ? t('Ein') : t('Aus')); auto.setAttribute('aria-pressed', String(mara.autoCast));
  syncMaraAction(element<HTMLButtonElement>('cast-mara'), sim, unavailable, view.paused);
  element<HTMLButtonElement>('move-mara').disabled = unavailable || !heroContextAvailable();
  element('camera-zoom').setAttribute('aria-pressed', String(view.mapZoom > 1));
  element('camera-zoom').setAttribute('aria-label', t(view.mapZoom > 1 ? t('Karte weiter ansehen') : t('Karte näher ansehen')));
  element('safe-rate').textContent = t("{0} G/min sicher", rateFormat.format(certificate ? farmRewardGold(certificate) * 60000 / certificate.durationMs : 0));
  element('safe-rate').title = t(certificate ? t("Welle {0}: zwei konservative, schadensfreie Wiederholungen inklusive Wellenpausen. Grundlage für {1} % Offline-Ertrag.", certificate.wave, offlinePolicy(sim.settlement.warehouseBuilt).efficiencyPermille / 10)
    : t('Noch kein gültiger Farmnachweis. Eine erste Welle muss live geschafft und zweimal konservativ geprüft werden.'));
  element('menu-farm-rate').textContent = t("{0}. {1}", element('safe-rate').textContent, element('safe-rate').title);
  element('gold').textContent = t(currency.format(sim.gold));
  element('lives').textContent = t("{0} / 20", sim.lives);
  element('wave').textContent = t(String(sim.wave));
  const mode = sim.mode === 'farm' ? t('Farmen') : t('Vorstoß');
  element('battle-phase').textContent = t(live.error ? t('Angehalten') : live.awaitingResume ? t('Rückkehr') : view.paused ? 'Pause'
    : sim.phase === 'defeat' ? t('Wechsel ins sichere Farmen …')
    : sim.phase === 'wave' ? t("{0} · Welle {1} · {2} Gegner", mode, sim.wave, sim.remaining)
    : t("{0} · nächste Welle in {1} s", mode, Math.ceil(sim.intermissionRemaining)));
  element('pause-state').textContent = t(live.paused ? t('PAUSE') : t('EIN'));
  pause.classList.toggle('paused', live.paused);
  pause.setAttribute('aria-pressed', String(live.paused));
  pause.setAttribute('aria-label', t(live.paused ? t('Auto-Kampf fortsetzen') : t('Auto-Kampf pausieren')));
  pause.title = pause.getAttribute('aria-label')!;
  pause.disabled = unavailable || live.awaitingResume;
  advance.hidden = sim.mode !== 'farm';
  advance.textContent = t(sim.bossChallengeRequested ? t('Boss am Wellenwechsel vorgemerkt') : sim.advanceRequested ? t('Vorstoß vorgemerkt') : t("Erneut vorstoßen · Welle {0}", sim.nextAdvanceWave));
  advance.disabled = unavailable || view.paused || sim.advanceRequested || sim.bossChallengeRequested;
  element('return-card').hidden = !live.awaitingResume;
  updateOfflineWelcome(element('return-mara'), live.showMaraOfflineWelcome, maraOfflinePortrait);
  if (live.awaitingResume) {
    const reward = live.pendingReward;
    const departure = live.offline.window ?? live.offline.baseline, basis = departure.certificate;
    const rewardDisplay = offlineGoldDisplay(reward?.amountUnits ?? 0);
    element('return-gold').textContent = rewardDisplay.headline;
    element('return-gold-exact').textContent = rewardDisplay.exact;
    element('return-amount-details').hidden = !rewardDisplay.showDetails;
    element('return-elapsed').textContent = t(duration(reward?.elapsedMs ?? 0));
    element('return-credited').textContent = t(duration(reward?.creditedMs ?? 0));
    element('return-details').textContent = t(live.paused ? t('Die gespeicherte Pause war aktiv. Dabei entsteht kein Offline-Gold.')
      : !basis ? t('Noch kein sicherer Farmnachweis vorhanden. Besiege zuerst eine Welle zuverlässig.')
      : reward && reward.elapsedMs > reward.creditedMs ? t('Deine Vorräte sind voll. Die Sammelzeit wurde ausgeschöpft.')
      : t('Deine Verteidigung hat Gold für dich gesammelt. Setze es für deinen nächsten Ausbau ein.'));
    element('return-basis').textContent = t("Farmbasis beim Verlassen: {0} G/min · {1} % Ertrag · bis zu {2} Stunden. Zeit bis zum Einsammeln zählt mit.", rateFormat.format(basis ? farmRewardGold(basis) * 60000 / basis.durationMs : 0), departure.efficiencyPermille / 10, departure.limitMs / 3600000);
    claim.textContent = t(reward && reward.amountUnits > 0 ? t('Belohnung einsammeln und fortsetzen') : live.paused ? t('Zur pausierten Verteidigung') : t('Verteidigung fortsetzen'));
    claim.disabled = unavailable || document.hidden;
  }
  const tower = sim.towers.find(value => value.padId === selectedPadId);
  const pad = sim.layout.towerPads.find(value => value.id === selectedPadId);
  padChoice.value = selectedPadId ?? '';
  padChoice.hidden = !!tower;
  element('selection-title').textContent = t(selectedPanel === 'ilyra' ? t('Ilyra · Sternensalve') : selectedPanel === 'tavern' ? t("Taverne {0}", sim.settlement.tavernLevel === 2 ? 'II' : 'I') : selectedPanel === 'clearing' ? t('Ostzugang') : selectedPanel === 'warehouse' ? t('Vorratslager') : selectedPanel === 'wisp' ? 'Wisp' : selectedPanel === 'mara' ? 'Mara' : selectedPanel === 'settlement' ? t('Werkstatt')
    : tower ? t("{0} · Level {1}", tower.def.name, tower.level) : pad ? t('Freier Bauplatz') : t('Bauplatz wählen'));
  element('tower-name').textContent = t(tower?.def.name ?? t('Turm wählen'));
  element('tower-role').textContent = t(tower?.def.id === 5 ? t('Bis zu drei Ziele · 80 Sprungreichweite · 100/65/42 % Schaden') : tower?.def.id === 4 ? t('Bevorzugt Rüstung · ignoriert 100 % davon') : tower?.def.id === 3 ? t('Flächentreffer · 52 Reichweite um das Ziel') : tower?.def.id === 2 ? t('Frosttreffer · 45 % langsamer für 2 s') : t('Zuverlässige Pfeile · Allrounder'));
  element('selection-description').textContent = t(selectedPanel !== 'tower' ? '' : tower
    ? tower.protected ? t('Dein erster Turm sichert die Grundverteidigung. Du kannst ihn verbessern.') : t("{0} verteidigt den Weg. Verbessere ihn oder investiere das Gold an anderer Stelle.", tower.def.name)
    : (pad && sim.isPadUnlocked(pad.id)) ? t('Wähle einen freigeschalteten Turm für diesen Platz.')
    : pad?.availability === 'east-clearing' ? t('Öffne zuerst die östliche Lichtung nach dem Bosssieg.')
    : pad ? t("Dieser Platz öffnet nach gemeisterter Welle {0}.", pad.availability === 'wave-5' ? 5 : 10) : t('Wähle einen hell markierten Platz auf der Karte.'));
  build.hidden = Boolean(tower); upgrade.hidden = !tower; sell.hidden = !tower; assignMara.hidden = !tower;
  buildFrost.hidden = Boolean(tower) || !sim.settlement.frostResearched;
  build.disabled = blocked || !selectedPadId || !sim.canBuild(selectedPadId);
  buildFrost.disabled = blocked || !selectedPadId || !sim.canBuild(selectedPadId, 2);
  for (const [name, kind] of [['cannon', 3], ['sniper', 4], ['storm', 5]] as const) {
    const button = element<HTMLButtonElement>(`build-${name}`);
    button.hidden = Boolean(tower) || !sim.isTowerUnlocked(kind);
    button.disabled = blocked || !selectedPadId || !sim.canBuild(selectedPadId, kind);
  }
  const canUpgrade = Boolean(tower && tower.level < sim.maxLevel);
  upgrade.disabled = blocked || !tower || !canUpgrade || sim.gold < upgradeCost(tower);
  upgrade.textContent = t(tower && canUpgrade ? t("Aufwerten · {0} Gold", currency.format(upgradeCost(tower))) : t('Levelgrenze erreicht'));
  sell.disabled = blocked || !tower || tower.protected;
  assignMara.disabled = blocked || !tower || (tower.uid === mara.targetTowerUid && inSpellRange);
  assignMara.textContent = t(tower?.uid === mara.targetTowerUid ? t('Zauberziel · Mara heranrufen') : t('Als Zauberziel wählen'));
  sell.textContent = t(tower?.protected ? t('Geschützter Startturm') : t("Verkaufen · +{0} Gold", currency.format(tower ? sellValue(tower) : 0)));
  element('tower-stats').innerHTML = tower ? (() => {
    const values = stats(tower);
    return [
      ['damage', t('Schaden'), damageFormat.format(values.damage)],
      ['target', t('Reichweite'), values.range],
      ['cooldown', t('Angriff alle'), `${intervalFormat.format(values.cooldown)} s`],
      ['skull', t('Abschüsse'), tower.kills],
    ].map(([icon, label, value]) => `<div><dt><span class="ui-icon tower-stat-icon" aria-hidden="true">${uiIcon(String(icon))}</span><span>${label}</span></dt><dd>${value}</dd></div>`).join('');
  })() : '';
  element('action-hint').textContent = t(blocked ? live.error ? t('Der letzte bestätigte Spielstand bleibt erhalten.') : live.awaitingResume ? t('Setze die Verteidigung über den Rückkehrbeleg fort.') : t('Setze den Kampf fort, um zu bauen oder aufzuwerten.')
    : tower ? tower.level >= sim.maxLevel ? sim.settlement.frostResearched ? sim.settlement.workshopUpgraded ? t('Weitere Upgrades benötigen mehr Gold.') : t('Werkstatt II erschließt weitere Turmlevel.') : t('Frostfassung erschließt Level 4–6.') : sim.gold < upgradeCost(tower) ? t("Noch {0} Gold bis zum nächsten Level.", currency.format(upgradeCost(tower) - sim.gold)) : t('Mehr Schaden verbessert die Verteidigung sofort.')
    : (pad && sim.isPadUnlocked(pad.id)) && sim.gold < 75 ? t("Noch {0} Gold bis zum Waldwächter.", currency.format(75 - sim.gold)) : '');
  const settlement = sim.settlement;
  const workshopIcon = element<HTMLImageElement>('workshop-icon');
  const workshopSource = sim.settlement.workshopUpgraded ? ART.workshopUpgraded : ART.workshop;
  if (workshopIcon.getAttribute('src') !== workshopSource) workshopIcon.src = workshopSource;
  element('workshop-card-title').textContent = t(settlement.workshopUpgraded ? t('Werkstatt II') : settlement.workshopBuilt ? t('Werkstatt I') : t('Werkstatt I'));
  element('workshop-card-copy').textContent = t(settlement.workshopUpgraded ? t('Fortlaufende Turmlevel') : settlement.frostResearched ? t('Werkstatt II ausbauen') : settlement.frostResearched ? t('Frosttechnik verfügbar') : settlement.workshopBuilt ? t('Frostfassung erforschen') : t('Bauen & forschen'));
  element('workshop-card-price').textContent = t(settlement.workshopUpgraded ? t('✓ Ausgebaut') : settlement.frostResearched ? currency.format(SETTLEMENT.workshopUpgradeCost) : settlement.frostResearched ? t('✓ Erforscht') : `${settlement.workshopBuilt ? SETTLEMENT.researchCost : sim.workshopKitAvailable ? t('Kostenlos bauen') : SETTLEMENT.workshopCost}`);
  element('pick-workshop').classList.toggle('researched', settlement.frostResearched);
  element('workshop-title').textContent = t(settlement.workshopUpgraded ? t('Werkstatt II') : settlement.workshopBuilt ? t('Werkstatt I') : t('Werkstatt bauen'));
  element('workshop-description').textContent = t(settlement.workshopUpgraded ? t('Der neue Arbeitsplatz erschließt Turmlevel ab 7. Höhere Level erhöhen den Schaden; Reichweite und Feuerrate bleiben begrenzt.') : settlement.frostResearched
    ? t('Werkstatt II kostet {0} Gold und erschließt Turmlevel ab 7.', currency.format(SETTLEMENT.workshopUpgradeCost))
    : settlement.workshopBuilt ? t('Frostfassung erschließt den Frostkristall und Turmlevel 4–6.') : t('Wähle eine Position in der Siedlung und baue die Werkstatt. Sie eröffnet die Frostforschung.'));
  const upgradeWorkshop = element<HTMLButtonElement>('upgrade-workshop');
  upgradeWorkshop.hidden = !settlement.frostResearched || settlement.workshopUpgraded;
  upgradeWorkshop.disabled = blocked || sim.gold < SETTLEMENT.workshopUpgradeCost;
  element('workshop-upgrade-condition').hidden = !settlement.frostResearched || settlement.workshopUpgraded;
  element('workshop-upgrade-condition').textContent = t(sim.gold < SETTLEMENT.workshopUpgradeCost ? t("Noch {0} Gold für Werkstatt II.", currency.format(workshopGoldMissing(sim.gold))) : t('Bereit zum Ausbau · Turmlevel ab 7 freischalten.'));
  buildWorkshop.hidden = settlement.workshopBuilt;
  buildWorkshop.textContent = t(sim.workshopKitAvailable ? t('Werkstatt kostenlos bauen') : t("Werkstatt platzieren · {0} Gold", sim.workshopBuildCost));
  buildWorkshop.disabled = blocked || sim.gold < sim.workshopBuildCost;
  element<HTMLButtonElement>('pick-workshop').disabled = sim.preparing || sim.guiding && (sim.introduction.stage !== 'workshop' && sim.introduction.stage !== 'research' || !sim.learningPaused);
  researchFrost.hidden = !settlement.workshopBuilt || settlement.frostResearched;
  researchFrost.textContent = t("Frostfassung erforschen · {0} Gold", SETTLEMENT.researchCost);
  researchFrost.disabled = blocked || sim.gold < SETTLEMENT.researchCost;
  element('choose-frost').hidden = !settlement.frostResearched;
  const techVisible=settlement.workshopBuilt&&!sim.guiding;
  element('research-icons').hidden=!techVisible;element('research-details').hidden=!techVisible;
  for(const tech of ['frost','storm'] as const){
    const researched=tech==='frost'?settlement.frostResearched:settlement.stormResearched;
    const available=tech==='frost'?settlement.workshopBuilt:sim.stormResearchUnlocked;
    element(`tech-${tech}`).classList.toggle('locked',!researched&&!available);
    element(`tech-${tech}`).setAttribute('aria-pressed',String(selectedTechnology===tech));
    element(`tech-${tech}-status`).textContent = t(researched?t('✓ Erforscht'):available?t('Erforschbar'):t('Gesperrt'));
  }
  element('research-details').textContent = t(selectedTechnology==='frost'
    ? settlement.frostResearched?t('✓ Frostfassung: Frostkristall und Turmlevel 4–6 verfügbar.'):t('Frostfassung: Werkstatt nötig · 60 Gold. Verlangsamt Gegner und erschließt Turmlevel 4–6.')
    : settlement.stormResearched?t("✓ Sturmlicht: bis zu drei Ziele, 80 Sprungreichweite, sinkender Schaden. Turmbau separat: {0} Gold.", STORMLIGHT.cost)
    : t("Sturmlicht: Frostfassung, gemeisterte Welle {0} und abgeschlossene Ilyra-Einführung nötig. Forschung {1} Gold; Turmbau separat {2} Gold.", STORM_CHAIN.wave, STORM_CHAIN.researchCost, STORMLIGHT.cost));
  const stormResearch=element<HTMLButtonElement>('research-storm');
  stormResearch.hidden=!techVisible||settlement.stormResearched;
  stormResearch.disabled=blocked||!sim.stormResearchUnlocked||sim.gold<STORM_CHAIN.researchCost;

  const warehouseIcon = element<HTMLImageElement>('warehouse-icon');
  if (warehouseIcon.getAttribute('src') !== ART.warehouse) warehouseIcon.src = ART.warehouse;
  for (const id of ['workshop', 'warehouse', 'tavern'] as const) {
    const button = element<HTMLButtonElement>(`move-${id}`);
    button.hidden = !buildingBuilt(sim, id);
    button.disabled = unavailable || !live.paused;
    button.textContent = t(live.paused ? t("{0} versetzen", buildingName(id)) : t('Zum Versetzen pausieren'));
  }
  const builtWarehouse = settlement.warehouseBuilt;
  const safeRate = certificate ? farmRewardGold(certificate) * 60000 / certificate.durationMs : 0;
  element('pick-warehouse').classList.toggle('locked', !sim.warehouseUnlocked);
  element('pick-warehouse').classList.toggle('researched', builtWarehouse);
  const warehouseNew = sim.warehouseUnlocked && !builtWarehouse && !(sim.tutorial.seen & (1 << 12)) && (!sim.discoveryActive || sim.discovery === 'warehouse');
  const ilyraNew = sim.ilyraRecruitable;
  const tavernUpgradeNew = settlement.tavernLevel === 1 && sim.tavernUpgradeUnlocked;
  const tavernNew = ilyraNew || tavernUpgradeNew || sim.tavernUnlocked && !settlement.tavernBuilt && !settlement.tavernSeen;
  const gifts = tavernGiftStatus(sim.social, { tavernBuilt: settlement.tavernBuilt, ilyraRecruited: !!sim.ilyra, boss15: !!sim.bossVictories, boss25: !!sim.secondBossVictories });
  const giftNames = gifts.recipients.map(who => COMPANIONS[who].name).join(' / ');
  const giftLabel = giftNames ? t('Geschenk überreichen: {0}', giftNames) : gifts.owned ? t('Geschenke im Vorrat') : '';
  element('pick-warehouse').classList.toggle('new-building', warehouseNew);
  element('pick-tavern').classList.toggle('new-building', tavernNew);
  element('pick-tavern').classList.toggle('gift-ready', !!giftNames);
  element('tavern-gift-badge').hidden = !gifts.owned;
  element('pick-tavern').classList.toggle('has-gifts', gifts.owned);
  element('tavern-gift-note').hidden = !gifts.owned;
  element('tavern-gift-note').textContent = giftLabel;
  element('settlement-tab').classList.toggle('new-building', warehouseNew || tavernNew);
  element('settlement-tab').setAttribute('aria-label', t(ilyraNew ? t('Siedlung · Ilyra wartet in der Taverne') : tavernUpgradeNew ? t('Siedlung · Taverne II verfügbar') : tavernNew ? t('Siedlung · Taverne kostenlos bauen') : warehouseNew ? t('Siedlung · Neues Gebäude verfügbar: Vorratslager') : t('Siedlung')));
  if (giftLabel) element('settlement-tab').setAttribute('aria-label', `${element('settlement-tab').getAttribute('aria-label')} · ${giftLabel}`);
  element('pick-tavern').title = giftLabel;
  element<HTMLImageElement>('tavern-icon').src = ART.tavern;
  element<HTMLImageElement>('tavern-portrait').src = ART.tavern;
  element('pick-tavern').hidden = sim.highestCleared < 11 && !sim.tavernUnlocked;
  element('pick-tavern').classList.toggle('locked', !sim.tavernUnlocked);
  element('pick-tavern').classList.toggle('researched', settlement.tavernBuilt);
  element('tavern-card-price').textContent = t(settlement.tavernBuilt
    ? ilyraNew ? t('II · Ilyra wartet') : tavernUpgradeNew ? t('II ausbauen · 1.200') : t("Stufe {0} · Gefährten", settlement.tavernLevel === 2 ? 'II' : 'I')
    : sim.tavernUnlocked ? t('Kostenlos bauen') : t('Nach Welle 12'));
  element('tavern-description').textContent = t(settlement.tavernBuilt
    ? t('Dein Treffpunkt für alle Gefährten. Wähle eine Figur für ihre Rolle und Befehle.')
    : t('Nach Welle 12 kannst du die Taverne kostenlos bauen. Dort triffst du deine Gefährten.'));
  element('tavern-condition').textContent = t(!settlement.tavernBuilt
    ? sim.tavernUnlocked ? t('Baue deine Taverne kostenlos auf einem freien Platz in der Siedlung.') : t('Besiege Welle 12. Danach kannst du die Taverne jederzeit kostenlos bauen.')
    : settlement.tavernLevel === 1
      ? sim.tavernUpgradeUnlocked ? t('Boss 25 besiegt. Mit Taverne II kannst du Ilyra kostenlos rekrutieren.') : t('Nächstes Ziel: Boss 25 besiegen, dann für 1.200 Gold zu Taverne II ausbauen und Ilyra rekrutieren.')
      : sim.ilyra ? t('Mara verstärkt Türme · Wisp versorgt · Ilyra kämpft.') : t('Taverne II · Ilyra kennenlernen und kostenlos rekrutieren.'));
  const buildTavern = element<HTMLButtonElement>('build-tavern');
  buildTavern.hidden = settlement.tavernBuilt;
  buildTavern.disabled = blocked || !sim.tavernKitAvailable;
  const upgradeTavern = element<HTMLButtonElement>('upgrade-tavern');
  upgradeTavern.hidden = settlement.tavernLevel !== 1;
  upgradeTavern.disabled = blocked || !sim.tavernUpgradeUnlocked || sim.gold < SETTLEMENT.tavernUpgradeCost;
  upgradeTavern.textContent = t(!sim.tavernUpgradeUnlocked ? t('Taverne II · erst nach Boss 25')
    : sim.gold < SETTLEMENT.tavernUpgradeCost ? t("Taverne II · noch {0} Gold", currency.format(SETTLEMENT.tavernUpgradeCost - sim.gold)) : t('Taverne II ausbauen · 1.200 Gold'));
  element('warehouse-card-price').textContent = t(builtWarehouse ? t('✓ Gebaut') : sim.warehouseUnlocked ? String(SETTLEMENT.warehouseCost) : sim.wispUnlocked ? t('Welle 8') : t('Wisp & Welle 8'));
  element('warehouse-description').textContent = t(builtWarehouse ? t('Wisp versorgt das Lager. Deine Vorräte sammeln automatisch während deiner Abwesenheit.')
    : t('Wenn du das Spiel schließt, sammelt deine sichere Verteidigung weiter. Das Lager verlängert das Sammeln von 2 auf 8 Stunden. Optional; es macht deine Türme nicht stärker.'));
  element('warehouse-rate').textContent = t(certificate ? t("{0} G/min", rateFormat.format(safeRate)) : t('Noch kein Nachweis'));
  element('warehouse-efficiency').textContent = t(builtWarehouse ? t('65 % der Farmbasis') : '60 % → 65 %');
  element('warehouse-cap').textContent = t(builtWarehouse ? t('Bis zu 8 Stunden') : t('2 → 8 Stunden'));
  element('warehouse-preview').textContent = t(live.paused ? t('0 Gold · Pause aktiv') : !certificate ? t('Zuerst sicher farmen')
    : builtWarehouse ? t("≈ {0} Gold", currency.format(safeRate * 60 * WAREHOUSE_OFFLINE.efficiencyPermille / 1000))
    : t("{0} → {1} Gold", currency.format(safeRate * 60 * 0.6), currency.format(safeRate * 60 * 0.65)));
  element('warehouse-condition').textContent = t(!sim.warehouseUnlocked ? t("Voraussetzung: {0} · Welle 8 {1}.", sim.wispUnlocked ? 'Wisp ✓' : t('Wisp (Frost & Welle 5)'), sim.highestCleared >= 8 ? '✓' : 'meistern')
    : !builtWarehouse && sim.gold < SETTLEMENT.warehouseCost ? t("Noch {0} Gold. Die Vorschau gilt bei unveränderter Verteidigung; während einer Pause entsteht kein Ertrag.", currency.format(SETTLEMENT.warehouseCost - sim.gold))
    : t('Vorschau bei unveränderter Verteidigung. Während einer Pause entsteht kein Offline-Ertrag.'));
  buildWarehouse.hidden = builtWarehouse;
  buildWarehouse.disabled = blocked || !sim.warehouseUnlocked || sim.gold < SETTLEMENT.warehouseCost;
  const atCore = sim.layout.version === 5;
  element('pick-clearing').hidden = !atCore || !sim.eastAccessCredit;
  element('pick-clearing').classList.toggle('researched', atCore);
  element('clearing-card-title').textContent = t('Ostzugang');
  element('clearing-card-copy').textContent = t('Für den späteren Ausbau');
  element('clearing-card-price').textContent = t('900 G Gutschrift');
  element('clearing-title').textContent = t('Ostzugang vorgemerkt');
  element('clearing-description').textContent = t('Dein früherer Lichtungskauf zählt beim späteren Öffnen der Ostfront mit 900 Gold. Diese Gutschrift ist für den Zugang reserviert.');
  element('clearing-condition').textContent = t('Die Ostfront folgt in einem späteren Ausbau.');
  element('show-clearing').hidden = !atCore;
  element('layout-status').textContent = t(view.paused ? t('Kampf angehalten.')
    : sim.mode === 'farm' ? t("Sicheres Farmen · Welle {0}. Ein neuer Vorstoß beginnt erst auf deinen Wunsch am Wellenübergang.", sim.farmWave)
    : t("Automatischer Vorstoß · höchste geschaffte Welle {0}.", sim.highestCleared));
  const relevantEvents = sim.drainEvents();
  scene?.acceptEvents(relevantEvents);
  audio.accept(relevantEvents, sim);
  if (relevantEvents.some(event => event.type === 'map-update')) { selectedPadId = undefined; placementType = undefined; closeContext(); }
  const message = relevantEvents.find(event => event.type === 'boss-victory') ?? relevantEvents.filter(event => ['frost-tip', 'defeat', 'build', 'upgrade', 'sell', 'workshop', 'research', 'wisp', 'pads', 'warehouse', 'tavern', 'tavern-upgrade', 'boss-victory', 'clearing', 'workshop-upgrade', 'map-update'].includes(event.type)).at(-1) ?? relevantEvents.find(event => event.type === 'personal-gift') ?? relevantEvents.find(event => event.type === 'gift-found');
  if (message) toastUntil = performance.now() + 4500;
  if (message) showCombatMessage(() => t(message.type === 'clear' ? t("Welle {0} geschafft · +{1} Gold Abschlussbonus.", message.wave, currency.format(message.amount ?? 0))
    : message.type === 'kill' ? t("Gegner besiegt · +{0} Gold.", currency.format(message.amount ?? 0))
    : message.type === 'wave' ? t("{0} · Welle {1} hat begonnen. Deine Türme greifen automatisch an.", mode, message.wave)
    : message.type === 'boss-victory' ? message.amount ? t("{0} besiegt! +{1} Gold Erstprämie.", bossEncounter(message.wave ?? 15).title, currency.format(message.amount)) : t('Rosenspiegel erneut besiegt. Gewöhnliche Kampfbelohnungen erhalten.')
    : message.type === 'personal-gift' ? t('Persönliches Geschenk für {0} bereit · Taverne', message.companion ? COMPANIONS[message.companion].name : '')
    : message.type === 'gift-found' ? t('Geschenk gefunden · in der Taverne ansehen.')
    : message.type === 'map-update' ? t("Nordbogen angepasst · drei Baureihen oberhalb des Wegs.{0}", message.amount ? t(" {0} Türme kostenlos in der Nähe versetzt; alle Upgrades bleiben erhalten.", message.amount) : '')
    : message.type === 'clearing' ? t('Östliche Lichtung geöffnet! Optionale Fläche verfügbar · Lichtung ansehen.')
    : message.type === 'wisp' ? t('Wisp ist da! +10 % Kampf-Gold und die Steinschleuder sind jetzt verfügbar.')
    : message.type === 'pads' ? t("Welle {0} gemeistert{1}.", message.wave, message.wave === 10 ? t(' · Scharfschütze verfügbar') : '')
    : message.type === 'frost-tip' ? t('Frost hält Gegner länger in Reichweite deiner Pfeile.')
    : message.type === 'build' ? t("{0} gebaut und einsatzbereit.", message.tower?.def.name)
    : message.type === 'upgrade' ? t("{0} verbessert. Der nächste Schuss nutzt den höheren Schaden.", message.tower?.def.name)
    : message.type === 'workshop-upgrade' ? t('Werkstatt II fertig! Turmlevel ab 7 sind jetzt verfügbar.')
    : message.type === 'workshop' ? t('Die Werkstatt ist fertig! Frostfassung ist jetzt erforschbar.')
    : message.type === 'tavern-upgrade' ? t('Taverne II fertig! Du kannst jetzt Ilyra kennenlernen und kostenlos rekrutieren.')
    : message.type === 'tavern' ? t('Die Taverne steht! Ein neuer Treffpunkt für deine Siedlung.')
    : message.type === 'warehouse' ? t('Vorratslager gebaut! Künftig 65 % Offline-Ertrag für bis zu 8 Stunden.')
    : message.type === 'research' && message.technology === 'storm' ? t('Sturmlicht erforscht! Der Turmbau ist jetzt im Baukatalog verfügbar.') : message.type === 'research' ? t('Frostfassung erforscht! Baue einen Frostkristall oder verbessere Türme bis Level 6.')
    : message.type === 'sell' ? t("Turm verkauft · +{0} Gold. Die sichere Farmbasis wird neu geprüft.", currency.format(message.amount ?? 0))
    : t('Der Vorstoß ist gescheitert. Gold und Türme bleiben erhalten; die Verteidigung wechselt ins sichere Farmen.')));
  const startedWave = relevantEvents.find(e => e.type === 'wave');
  const newcomer = startedWave && sim.waveRecipeVersion >= 9 && sim.mode === 'advance' && sim.highestCleared < sim.wave ? introducedEnemy(sim.wave, sim.waveRecipeVersion) : undefined;
  if (!message && newcomer && newcomer.firstWave >= 6 && !announcedEnemies.has(newcomer.id)) {
    announcedEnemies.add(newcomer.id);
    showCombatMessage(() => t("Neu: {0} · {1}. Mehr in der Chronik.", newcomer.name, newcomer.counter));
    toastUntil = performance.now() + 6500;
  }
  element('combat-message').hidden = sim.introduction.stage !== 'done' || !!discovery || performance.now() > toastUntil || contextOpen || Boolean(placementType || groundMode) || live.awaitingResume;
  if (!element('combat-message').hidden) { element('tutorial-card').hidden = true; element('mobile-hint').hidden = true; }
  progressUI.update(live);
  const boss = sim.bossEnemy, charm = sim.bossCharm;
  const showBoss = sim.bossActive && !live.awaitingResume && !contextOpen && !placementType;
  element('boss-banner').hidden = !showBoss;
  document.querySelector<HTMLElement>('.goal-ribbon')!.hidden = showBoss || sim.introduction.stage !== 'done' || !!discovery || !element('wisp-arrival').hidden || hintStep === 15 && !element('tutorial-card').hidden;
  element('boss-title').textContent = t("{0} · Welle {1}", bossEncounter(sim.wave).title, sim.wave);
  element('boss-health').textContent = t(boss ? t("{0} / {1}", currency.format(Math.ceil(boss.hp)), currency.format(Math.ceil(boss.maxHp))) : sim.bossQueued ? t('Im Anmarsch') : t('Boss gefallen'));
  const health = element<HTMLProgressElement>('boss-health-bar');
  health.max = boss?.maxHp ?? 1; health.value = boss?.hp ?? (sim.bossQueued ? 1 : 0);
  const charmTarget = sim.towers.find(t => t.uid === charm.targetUid);
  element('boss-skill').textContent = t(charm.phase === 'windup' ? t("♥ Zielt auf {0} · {1} s", charmTarget?.def.name, rateFormat.format(charm.remaining))
    : charm.phase === 'channel' ? t("♥ {0}: 40 % langsamer · {1} s", charmTarget?.def.name, rateFormat.format(charm.remaining))
    : charm.phase === 'interrupted' ? t('Zauber unterbrochen!')
    : boss?.slowRemaining ? t("Frost aktiv · 45 % langsamer · {0} s", rateFormat.format(boss.slowRemaining))
    : boss ? t('Frost bremst ihren Vormarsch · der Tanz läuft weiter') : sim.bossQueued ? sim.bossWins(sim.wave) ? t('Boss und Begleiter besiegen · Wiederholung') : t("Boss und Begleiter besiegen · {0} Gold Erstprämie", currency.format(bossEncounter(sim.wave).firstReward)) : t('Besiege noch die übrigen Begleiter'));
  element('boss-banner').dataset.phase = charm.phase;
  element('boss-support').textContent = t("{0} Begleiter übrig · Fläche & Durchdringung", Math.max(0, sim.remaining - (boss || sim.bossQueued ? 1 : 0)));
  document.getElementById('app')!.classList.toggle('context-open', contextOpen || Boolean(placementType || groundMode));
  updateOnboarding(live, { placing: Boolean(placementType || groundMode), contextOpen, catalogPanel, revealing: performance.now() < workshopRevealUntil, intro, portraits: introPortraits });
  syncIntroCamera();
  updateDiscoveryUI(live, contextOpen, Boolean(placementType || groundMode), catalogPanel);
  const tutorial = tutorialProgress(sim, intro);
  element('app').classList.toggle('tutorial-active', !!tutorial);
  for (const badge of document.querySelectorAll<HTMLElement>('[data-tutorial-progress]')) {
    badge.hidden = !tutorial;
    badge.textContent = tutorial ? t('Einführung {0}/{1}', tutorial.current, tutorial.total) : '';
  }
  if (tutorial) {
    const label = t('Einführung {0}/{1}', tutorial.current, tutorial.total);
    element('record-wave').textContent = label;
    element('record-wave').title = tutorial.optional ? t('Optionaler Einführungsschritt') : label;
  } else element('record-wave').removeAttribute('title');
  if (selectedPanel === 'mara' && !fullMaraMenu) element('lesson-note').hidden = true;
  const quickHintVisible = quickWins.update({
    cannonUnlocked: sim.isTowerUnlocked(3), cannonBuilt: sim.towers.some(value => value.def.id === 3),
    workshopAvailable: settlement.workshopBuilt && settlement.frostResearched && !settlement.workshopUpgraded,
    levelSix: sim.towers.some(value => value.level >= 6), gold: sim.gold, tutorialSeen: sim.tutorial.seen,
  }, {
    suppressed: contextOpen || Boolean(placementType || groundMode || ilyraMode) || live.awaitingResume || !!live.error || live.suspended
      || sim.introduction.stage !== 'done' || !!discovery && discovery !== 'cannon' || sim.bossActive
      || !element('wisp-arrival').hidden || performance.now() < workshopRevealUntil || !!document.querySelector('dialog[open]'),
    tutorialActive: !!tutorial,
    towerAtCap: contextOpen && selectedPanel === 'tower' && !!tower && tower.level >= 6,
  });
  if (quickHintVisible) {
    for (const id of ['tutorial-card', 'mobile-hint', 'combat-message']) element(id).hidden = true;
    document.querySelector<HTMLElement>('.goal-ribbon')!.hidden = true;
    if (discovery === 'cannon') element('discovery-card').hidden = true;
  }
  // Focus the genuine cast once; its compact countdown runs with the battle.
  if (discovery !== focusedDiscovery) {
    focusedDiscovery = discovery ?? '';
    if (discovery === 'wisp') scene?.followWispArrival();
    if (discovery === 'mara-wait') scene?.focusMaraIntroduction();
    if (discovery === 'mara-start' || discovery === 'mara-effect') {
      contextOpen = false; placementType = undefined; groundMode = undefined;
      const target = sim.towers.find(t => t.uid === sim.mara.effectTowerUid);
      if (target) scene?.focusPad(target.padId);
      element('context-panel').hidden = true; element('placement-help').hidden = true;
      updateDiscoveryUI(live, false, false, catalogPanel);
    }
  }
  tutorialGuide.update(sim, { intro, contextOpen, placing: Boolean(placementType || groundMode || ilyraMode || selectedHero),
    blocked: live.awaitingResume || !!live.error || live.suspended || !!document.querySelector('dialog[open]'), paused: live.paused });
  positionContext();
  syncLessonPointer();
}

function syncLessonPointer(): void {
  if (intro?.active && session?.battle.introduction.stage === 'welcome') {
    scene?.setLearningTarget();
    const point = scene?.introAnchor();
    lessonPointer.show(point && !session.error && !session.suspended && !session.awaitingResume
      && !document.querySelector('dialog[open]') ? point : undefined, ['intro-core', 'intro-spawn', 'intro-starter'][intro.step]);
    return;
  }
  const b = session?.battle;
  scene?.setLearningTarget();
  if (b?.ilyra && b.ilyra.introduction !== 'done' && b.introduction.stage === 'done' && !discoveryStep(b)
      && !session?.paused && !session?.error && !session?.suspended && !session?.awaitingResume && !document.querySelector('dialog[open]')) {
    if (selectedHero === 'ilyra') {
      if (b.ilyra.path.length || b.ilyra.volley) { lessonPointer.show(); return; }
      const aim = ilyraFirstTarget(b);
      if (ilyraMode === 'cast') {
        const point = aim && scene?.worldAnchor(aim);
        lessonPointer.show(point && document.elementFromPoint(point.x, point.y) === game?.canvas ? point : undefined, 'ilyra-target'); return;
      }
      if (aim) { lessonPointer.show(element<HTMLButtonElement>('hero-aim')); return; }
      const point = heroSuggestion && scene?.worldAnchor(heroSuggestion);
      const arrived = heroSuggestion && Math.hypot(heroSuggestion.x - b.ilyra.x, heroSuggestion.y - b.ilyra.y) < 5;
      lessonPointer.show(arrived ? undefined : point && document.elementFromPoint(point.x, point.y) === game?.canvas ? point : element<HTMLButtonElement>('hero-location'), 'ilyra-position'); return;
    }
    const id = contextOpen && selectedPanel === 'ilyra' ? b.ilyra.introduction === 'move' ? 'move-ilyra' : 'aim-ilyra' : !contextOpen && !ilyraMode && !placementType && !groundMode ? 'pick-ilyra' : undefined;
    const target = id ? element<HTMLButtonElement>(id) : undefined;
    lessonPointer.show(target && !target.disabled ? target : undefined); return;
  }
  const blocked = !b || !scene || session?.paused || session?.error || session?.suspended || session?.awaitingResume
    || performance.now() < workshopRevealUntil || document.querySelector('dialog[open]') || b.introduction.stage === 'done' && !discoveryStep(b);
  if (blocked) { lessonPointer.show(); return; }
  const button = (id: string) => lessonPointer.show(element<HTMLButtonElement>(id));
  const stage = b.introduction.stage;
  if (b.learningPaused && !b.lessonComplete && focusedLesson !== stage) {
    focusedLesson = stage;
    if (stage === 'upgrade') { const tower = b.towers.find(t => t.protected); if (tower) scene!.focusPad(tower.padId); }
    if (stage === 'research') scene!.focusObject('settlement');
  }
  const world = (kind: 'starter' | 'upgrade' | 'workshop' | 'research' | 'frost' | 'cannon' | 'warehouse') => {
    const point = scene!.learningAnchor(kind), at = point && document.elementFromPoint(point.x,point.y);
    // If the player pans away, the real overview control brings the target back.
    if (!point || at !== game?.canvas) { button('camera-reset'); return; }
    scene!.setLearningTarget(kind); lessonPointer.show(point,kind);
  };
  if (stage === 'done') {
    const step = discoveryStep(b);
    if (placementType || groundMode) {
      if (step === 'cannon' && placementType === 3) world('cannon');
      else if (step === 'warehouse' && groundMode === 'warehouse') world('warehouse');
      else lessonPointer.show();
      return;
    }
    if (contextOpen) {
      if (step === 'warehouse' && selectedPanel === 'warehouse' && !buildWarehouse.disabled) button('build-warehouse');
      else if (step === 'mara-ready' && selectedPanel === 'mara' && !element<HTMLButtonElement>('cast-mara').disabled) button('cast-mara');
      else button('close-context');
      return;
    }
    if (step === 'wisp') button('meet-wisp');
    else if (step === 'mara-start' || step === 'mara-wait') button('discovery-next');
    else if (step === 'mara-controls' || step === 'mara-ready' && !b.mara.autoCast) button('pick-mara');
    else if (step === 'cannon') button(catalogPanel === 'tower' ? 'pick-cannon' : 'tower-tab');
    else if (step === 'warehouse') button(catalogPanel === 'settlement' ? 'pick-warehouse' : 'settlement-tab');
    else lessonPointer.show();
    return;
  }
  if (placementType) { world(b.preparing ? 'starter' : 'frost'); return; }
  if (groundMode) { if (groundMode === 'workshop') world('workshop'); else lessonPointer.show(); return; }
  if (contextOpen) {
    if (stage === 'upgrade' && selectedPanel === 'tower' && !upgrade.disabled) button('upgrade');
    else if (stage === 'research' && selectedPanel === 'settlement' && !researchFrost.disabled) button('research-frost');
    else if (stage === 'workshop' && selectedPanel === 'settlement' && !buildWorkshop.disabled) button('build-workshop');
    else button('close-context');
    return;
  }
  if (stage === 'welcome' || stage === 'ready' || b.lessonComplete) { button('onboarding-primary'); return; }
  if (stage === 'build') { button(catalogPanel === 'tower' ? 'pick-archer' : 'tower-tab'); return; }
  if (!b.learningPaused) { lessonPointer.show(); return; }
  if (stage === 'upgrade') world('upgrade');
  else if (stage === 'research') world('research');
  else if (stage === 'workshop') button(catalogPanel === 'settlement' ? 'pick-workshop' : 'settlement-tab');
  else if (stage === 'frost') button(catalogPanel === 'tower' ? 'pick-frost' : 'tower-tab');
  else lessonPointer.show();
}

function positionContext(): void {
  const panel = element('context-panel');
  if (panel.hidden || !scene || window.innerWidth <= 700) return;
  const anchor = scene.uiAnchor(selectedPanel);
  const canvas = game?.canvas.getBoundingClientRect();
  if (!anchor || !canvas) return;
  const x = canvas.left + anchor.x * canvas.width / scene.scale.width;
  const y = canvas.top + anchor.y * canvas.height / scene.scale.height;
  const box = panel.getBoundingClientRect();
  const top = document.querySelector('.app-header')!.getBoundingClientRect().bottom + 10;
  const bottom = document.querySelector('.command-dock')!.getBoundingClientRect().top - 10;
  panel.style.left = `${Math.max(10, Math.min(window.innerWidth - box.width - 10, x + box.width + 30 < window.innerWidth ? x + 30 : x - box.width - 30))}px`;
  panel.style.top = `${Math.max(top, Math.min(bottom - box.height, y - box.height / 2))}px`;
}

function clearHeroSelection(): void { selectedHero = undefined; heroSuggestion = undefined; heroFeedback = undefined; heroGeneration++; scene?.invalidatePointer(); scene?.setHeroSelection(); }
function heroContextAvailable(): boolean {
  return !!session && ready && !intro?.active && !session.error && !session.suspended && !session.awaitingResume
    && !document.hidden && !document.querySelector('dialog[open]') && performance.now() >= workshopRevealUntil
    && heroWorldAvailable(session.battle);
}
function heroSelectionText(b: IdleBattle): string {
  if (heroFeedback && performance.now() < heroFeedbackUntil) return heroFeedback();
  if (selectedHero === 'ilyra' && b.ilyra) {
    const s = b.ilyra;
    if (s.volley) return t('Ilyra · Sternensalve läuft. Danach kannst du sie wieder bewegen.');
    if (session?.paused) return t('Ilyra · Ziel wählbar; sie läuft nach dem Fortsetzen.');
    if (s.path.length) return t('Ilyra läuft · Ein neues Bodenziel ersetzt den Weg.');
    if (s.introduction !== 'done') {
      if (s.introduction === 'move') return heroSuggestion ? t('Ilyra · Markiertes Feld antippen. Dort erreicht sie den Gegnerweg.') : t('Ilyra · freien Standort am Weg antippen · Ziehen verschiebt die Karte');
      if (!ilyraFirstTarget(b)) return t('Ilyra angekommen · Warte auf Gegner im blauen Kreis oder wähle einen näheren Standort.');
      return t('Ilyra bereit · „Sternensalve zielen“, dann Gegner antippen.');
    }
    return t('Ilyra gewählt · Boden: laufen · erneut Ilyra: Menü');
  }
  const target = b.towers.find(tower => tower.uid === b.mara.targetTowerUid);
  if (target && Math.hypot(target.x - b.mara.x, target.y - b.mara.y) > MARA.range)
    return t('Mara gewählt · Zugewiesener Turm außerhalb der Zauberreichweite. Boden: laufen.');
  return session?.paused ? t('Mara · Ziel wählbar; sie läuft nach dem Fortsetzen.') : t('Mara gewählt · Boden: laufen · erneut Mara: Menü');
}
function selectHero(hero: ControlledHero, manual = false): void {
  if (!heroContextAvailable() || session!.inputBusy || hero === 'ilyra' && !session!.battle.ilyra) return;
  clearHeroSelection(); selectedHero = hero;
  placementType = undefined; groundMode = undefined; groundCandidate = undefined; ilyraMode = undefined;
  contextOpen = false; selectedPadId = undefined; scene?.setSelected();
  if (hero === 'ilyra' && session!.battle.ilyra!.introduction !== 'done') heroSuggestion = recommendIlyraPosition(session!.battle);
  if (manual) audio.commandHero(hero,'select');
  syncUI();
}
function selectMapHero(hero: ControlledHero): void {
  if (hero === 'mara' && session && maraControlStage(session.battle) !== 'ready') {
    if (!ready || intro?.active || session.inputBusy || session.error || session.suspended || session.awaitingResume
      || document.hidden || document.querySelector('dialog[open]')) return;
    openContext('mara', false, false);
    if (contextOpen && selectedPanel === 'mara') audio.commandHero('mara', 'select');
    return;
  }
  if (!heroContextAvailable()) { if (session?.battle.discoveryActive) openContext(hero); return; }
  if (selectedHero === hero) openContext(hero, false, false); else selectHero(hero, true);
}
async function moveSelectedHero(cell: GridCell): Promise<void> {
  const hero = selectedHero, generation = heroGeneration;
  if (!hero || !heroContextAvailable() || session!.inputBusy) return;
  let accepted = false;
  await perform(b => {
    // A background save may delay this callback. Never replay an old order in
    // a new UI mode, dialog, tutorial pause or different selected hero.
    if (generation !== heroGeneration || !heroContextAvailable()) return;
    accepted = hero === 'mara' ? b.moveMaraTo(cell) : b.moveIlyraTo(cell);
  }, true, true);
  if (generation !== heroGeneration || session?.error) return;
  if (accepted) audio.commandHero(hero,'move');
  heroFeedback = accepted ? undefined : () => hero === 'ilyra' && session?.battle.ilyra?.volley
    ? t('Ilyra · Sternensalve läuft. Danach kannst du sie wieder bewegen.') : t('Kein freier Weg dorthin. Wähle einen anderen Standort.');
  heroFeedbackUntil = performance.now() + 3500; syncUI();
}
function aimIlyra(): void {
  if (!heroContextAvailable() || !session?.battle.ilyra || session.inputBusy || session.paused || !ilyraFirstTarget(session.battle)) return;
  if (selectedHero !== 'ilyra') selectHero('ilyra', true);
  heroGeneration++; ilyraMode = 'cast'; heroFeedback = undefined; contextOpen = false; syncUI();
}
function closeContext(): void { clearHeroSelection(); ilyraMode = undefined; groundMode = undefined; groundCandidate = undefined; contextOpen = false; selectedPadId = undefined; scene?.setSelected(); syncUI(); }
function acknowledgeQuickWin(notice: QuickWinNotice): void {
  const b = session?.battle;
  if (!b) return;
  const bit = 1 << (notice === 'cannon' ? 8 : 16);
  if (!(b.tutorial.seen & bit) || notice === 'cannon' && discoveryStep(b) === 'cannon')
    void perform(battle => { battle.tutorial.seen |= bit; if (notice === 'cannon' && discoveryStep(battle) === 'cannon') battle.dismissDiscovery(); }, true, true);
  else syncUI();
}
function inspectCannon(): void { quickWins.inspectCannon(); acknowledgeQuickWin('cannon'); }
function openQuickWin(notice: QuickWinNotice): void {
  acknowledgeQuickWin(notice);
  if (notice === 'workshop') { catalogPanel = 'settlement'; openContext('settlement'); return; }
  catalogPanel = 'tower'; placementType = undefined; closeContext();
  const card = element<HTMLButtonElement>('pick-cannon'); card.scrollIntoView({ block: 'nearest', inline: 'nearest' }); card.focus({ preventScroll: true });
}
function openContext(kind: typeof selectedPanel, buildingControls = false, focus = true): void {
  if (kind === 'clearing' && (session?.battle.layout.version !== 5 || !session.battle.eastAccessCredit)) return;
  if (session?.battle.preparing && kind !== 'mara' || intro?.active || performance.now() < workshopRevealUntil) return;
  if (session && (kind === 'settlement' && session.battle.settlement.workshopBuilt || kind === 'warehouse' && session.battle.settlement.warehouseBuilt || kind === 'tavern' && buildingControls && session.battle.settlement.tavernBuilt)) audio.play('craft');
  clearHeroSelection(); ilyraMode = undefined; groundMode = undefined; groundCandidate = undefined; placementType = undefined; selectedPanel = kind; contextOpen = true;
  if (kind === 'settlement' && session?.battle.settlement.frostResearched && !session.battle.settlement.workshopUpgraded && session.battle.towers.some(tower => tower.level >= 6)) {
    quickWins.inspectWorkshop(); acknowledgeQuickWin('workshop');
  }
  if (kind !== 'tower') { selectedPadId = undefined; scene?.setSelected(); }
  if (kind === 'tavern' && session?.battle.settlement.tavernBuilt && !buildingControls) { contextOpen = false; syncUI(); tavernUI.open(); return; }
  if (focus) scene?.focusObject(kind); syncUI();
  if (kind === 'tavern' && session?.battle.tavernUnlocked && !session.battle.settlement.tavernSeen)
    void perform(b => { b.settlement.tavernSeen = true; }, true, true);
  if (kind === 'warehouse' && session?.battle.warehouseUnlocked && !(session.battle.tutorial.seen & (1 << 12)))
    void perform(b => { b.tutorial.seen |= 1 << 12; }, true, true);
}
function startPlacement(kind: TowerId): void {
  clearHeroSelection();
  if (intro?.active) return;
  if (!session || !ready) return;
  if (session.battle.preparing && kind !== 1) return;
  if (session.battle.guiding && kind === 1) { if (session.battle.introduction.stage === 'upgrade') showLearningTower(); return; }
  if (session.battle.guiding && (kind !== 2 || session.battle.introduction.stage !== 'frost')) return;
  if (session.battle.introduction.stage === 'welcome') { void perform(b => b.beginIntroduction()).then(() => { if (session?.battle.introduction.stage === 'build') startPlacement(kind); }); return; }
  if (kind === 2 && !session.battle.settlement.frostResearched) { catalogPanel = 'settlement'; openContext('settlement'); return; }
  if (!session.battle.isTowerUnlocked(kind)) { if (kind === 5) {selectedTechnology='storm';catalogPanel='settlement';openContext('settlement');} else if (kind === 3) openContext('wisp'); else { showCombatMessage(() => t('Scharfschütze: Welle 10 meistern. Ab Welle 11 schützt Rüstung einen Teil der Gegner.')); toastUntil = performance.now() + 6000; syncUI(); } return; }
  if (placementType === kind) { placementType = undefined; closeContext(); return; }
  ilyraMode = undefined; groundMode = undefined; groundCandidate = undefined; catalogPanel = 'tower'; placementType = kind; contextOpen = false; selectedPadId = undefined; scene?.setSelected();
  // Only guided construction suggests a location. Ordinary purchases keep the player's view.
  const preferred = session.battle.preparing ? session.battle.recommendedStarterPad : session.battle.guiding && kind === 2 ? session.battle.recommendedFrostPad
    : discoveryStep(session.battle) === 'cannon' && kind === 3 ? session.battle.recommendedCannonPad : undefined;
  const pads = session.battle.layout.towerPads.filter(pad => session!.battle.preparing ? session!.battle.isPreferredStarterLocation(pad.id) : session!.battle.guiding ? session!.battle.isLearningFrostLocation(pad.id) : session!.battle.isPadUnlocked(pad.id) && !session!.battle.towers.some(tower => tower.padId === pad.id));
  if (!pads.length) { placementType = undefined; selectedPadId = 'tower-03'; scene?.setSelected(selectedPadId); openContext('tower'); }
  else if (preferred) { selectedPadId = pads.find(pad => pad.id === preferred)?.id ?? pads[0].id; scene?.setSelected(selectedPadId); scene?.focusPad(selectedPadId); }
  syncUI();
}
async function placeTower(padId: string, kind: TowerId = 1): Promise<boolean> {
  const live = session;
  if (!live || live.paused || !live.battle.preparing && live.battle.towers.some(tower => tower.padId === padId)) return false;
  // Building Frost completes the lesson synchronously. Preserve the already
  // framed entrance instead of treating that completion as a normal map focus.
  const finishingFrostLesson = kind === 2 && live.battle.guiding && live.battle.introduction.stage === 'frost';
  await perform(battle => battle.build(padId, kind));
  const built = session === live && !live.error && live.battle.towers.some(tower => tower.padId === padId);
  if (built) { if (!finishingFrostLesson) scene?.focusObject('tower'); placementType = undefined; closeContext(); }
  return built;
}
async function selectPad(padId?: string): Promise<void> {
  clearHeroSelection();
  if (session?.battle.preparing && !placementType) return;
  selectedPadId = padId; selectedPanel = 'tower'; scene?.setSelected(padId);
  if (!padId) { contextOpen = false; syncUI(); return; }
  const kind = placementType;
  if (kind) { contextOpen = false; if (session?.battle.canBuild(padId, kind)) await placeTower(padId, kind); else syncUI(); return; }
  placementType = undefined;
  contextOpen = true; scene?.focusObject('tower'); syncUI();
}

async function boot(options: { temporary?: boolean; recover?: boolean } = {}, ownershipRetries = 6): Promise<void> {
  if (booting || document.hidden) return;
  if (retryTimer !== undefined) { clearTimeout(retryTimer); retryTimer = undefined; }
  booting = true; ready = false; audio.setState(false, false);
  loadingScreen()?.begin('save', language());
  build.disabled = upgrade.disabled = sell.disabled = pause.disabled = advance.disabled = claim.disabled = assignMara.disabled = true;
  element('app-error').hidden = true; element('load-actions').hidden = true; element('error-panel').hidden = true;
  try {
    gameResize?.disconnect(); gameResize = undefined;
    game?.destroy(true); game = undefined; scene = undefined; focusedLesson = ""; focusedDiscovery = ""; lessonPointer.show();
    const previous = session; session = undefined;
    await previous?.close().catch(() => undefined);
    store?.close(); store = options.temporary ? undefined : await openBattleStore(undefined, databaseName);
    const live = await BattleSession.open(store, { recover: options.recover });
    session = live;
    live.setTavernOpen(tavernUI.isOpen);
    clearHeroSelection(); resumeIlyraGuide = !!live.battle.ilyra && live.battle.ilyra.introduction !== 'done';
    let preferences: Storage | undefined;
    try { if (!live.temporary) preferences = localStorage; } catch { /* Optional UI preferences. */ }
    intro = new MaraIntro(databaseName, live.origin, live.battle.introduction.stage, preferences);
    tavernStories = new TavernStoryHistory(databaseName, live.origin, live.battle.social.points, preferences);
    finishingIntro = false;
    const portraitsReady = intro.active ? prepareIntroPortraits() : Promise.resolve([]);
    updateOnboarding(live, { placing: false, contextOpen: false, catalogPanel, revealing: false, intro });
    progressUI.reset();
    if (document.hidden && !live.temporary) { await live.suspend(); return; }
    // Resolve music before Phaser's boot waits on the browser's load event.
    loadingScreen()?.begin('audio', language());
    try { await audio.prepareStartupMusic(); }
    catch {
      if (session !== live) return;
      loadingScreen()?.fail(startupText('Die Musik ist noch nicht abspielbereit. Versuche es erneut oder starte ohne Musik.', language()),
        () => window.location.reload(), () => { audio.setMix({ music: 0 }); void boot(options); }, 'Ohne Musik fortfahren');
      return;
    }
    if (session !== live) return;
    if (live.battle.wave > 0) showCombatMessage(() => t('Gespeicherte Verteidigung geladen. Gold, Türme und laufender Kampf sind wieder da.'));
    live.onChange = () => { if (session === live) { scene?.refresh(); syncUI(); } };
    live.onError = error => { if (session === live) { showError(t("Die Probe ist angehalten; der letzte bestätigte Stand bleibt erhalten. {0}", error.message), false, true); syncUI(); } };
    // Render at up to twice CSS resolution on dense displays. Phaser's own
    // displayScale maps touch coordinates back into the larger canvas.
    const pixelDensity = Math.min(2, Math.max(1, Math.round(window.devicePixelRatio || 1)));
    const host = element('game');
    const view = new BattleScene(() => live.battle, {
      advance(seconds) { if (ready && session === live) live.advance(seconds); },
      loadProgress(completed, total) { if (scene === view && session === live) loadingScreen()?.progress(completed, total); },
      preparing() { if (scene === view && session === live) loadingScreen()?.begin('render', language()); },
      loadError() {
        if (scene !== view || session !== live) return;
        ready = false; view.paused = true; syncUI();
        const message = t('Spielgrafiken konnten nicht geladen werden. Bitte versuche es erneut.');
        showError(message);
        loadingScreen()?.fail(message, () => { void boot(options); }, () => loadingScreen()?.dismiss());
      },
      canRender: () => !live.busy,
      canSelect: () => ready && !intro?.active && !live.inputBusy && !live.error && !live.suspended && !live.awaitingResume && !document.querySelector('dialog[open]'),
      canControlHero: heroContextAvailable,
      changed: syncUI,
      select(padId) { void selectPad(padId); },
      ground(cell) { if (groundMode === 'mara') { let accepted = false; void perform(b => { accepted = b.moveMaraTo(cell); }).then(() => { if (accepted && !live.error) closeContext(); else { element('placement-text').textContent = t('Dorthin führt kein freier Weg. Wähle ein anderes Feld.'); } }); } else { groundCandidate = cell; const id = groundMode; syncUI(); if (id && !buildingBuilt(live.battle, id)) void placeBuilding(id, cell); } },
      selectWisp() { openContext('wisp'); },
      selectMara() { selectMapHero('mara'); },
      selectIlyra() { selectMapHero('ilyra'); },
      heroGround(cell) { void moveSelectedHero(cell); },
      ilyraGround(point) {
        const mode = ilyraMode, generation = heroGeneration; if (!mode) return;
        let accepted = false;
        void perform(b => { if (generation !== heroGeneration || !heroContextAvailable() || live.paused) return; accepted = mode === 'move' ? b.moveIlyraTo({x:Math.floor(point.x/40),y:Math.floor(point.y/40)}) : b.castIlyraAt(point); }, mode === 'move', true).then(() => {
          if (generation !== heroGeneration) return;
          if (accepted && !live.error) { audio.commandHero('ilyra',mode); ilyraMode = undefined; heroGeneration++; syncUI(); }
          else { heroFeedback = () => t('Wähle Gegner innerhalb der blauen Reichweite. Die Salve muss bereit sein.'); heroFeedbackUntil = performance.now() + 3500; syncUI(); }
        });
      },
      selectClearing() { catalogPanel = 'settlement'; openContext('clearing'); },
      selectTavern() { catalogPanel = 'settlement'; openContext('tavern'); },
      selectWarehouse() { catalogPanel = 'settlement'; openContext('warehouse'); },
      selectWorkshop() { catalogPanel = 'settlement'; openContext('settlement'); },
      async ready() {
        if (scene !== view || session !== live) return;
        try {
          introPortraits = await portraitsReady;
          if (scene !== view || session !== live) return;
          ready = true; drawDockArt(view); view.setSelected(selectedPadId); syncUI();
          if(probeSlot?.startsWith('tower-arena-')) {
            view.frameTowerTest();
            if(!document.getElementById('tower-test-camera')){
              const button=document.createElement('button');button.id='tower-test-camera';button.type='button';button.textContent='◎';button.title=language()==='de'?'Testbereich':'Test area';button.setAttribute('aria-label',button.title);
              Object.assign(button.style,{position:'absolute',top:'calc(100% + 6px)',right:'0',width:'40px',height:'40px'});
              button.addEventListener('click',()=>scene?.frameTowerTest());document.querySelector('.map-controls')?.prepend(button);
            }
          }
          if (['ready', 'combat', 'upgrade', 'frost', 'observe'].includes(live.battle.introduction.stage)) view.focusGuidedDefense();
          loadingScreen()?.complete();
          if (intro?.active) element('onboarding-primary').focus({ preventScroll: true });
        }
        catch { ready = false; view.paused = true; showError(t('Das Spiel konnte nicht gestartet werden. Bitte versuche es erneut.')); }
      },
    }, pixelDensity);
    scene = view;
    loadingScreen()?.begin('assets', language());
    game = new Phaser.Game({
      type: Phaser.AUTO, parent: 'game', width: Math.round(host.clientWidth * pixelDensity), height: Math.round(host.clientHeight * pixelDensity),
      backgroundColor: '#111c20', pixelArt: true, roundPixels: true, render: { antialias: false }, audio: { noAudio: true },
      // BattleSession accounts for real active time and handles actual absence.
      // Phaser's smoothing replaces slow frames with older, shorter deltas.
      fps: { smoothStep: false },
      loader: { timeout: 15000, maxRetries: 1 },
      scene: [view], scale: { mode: Phaser.Scale.NONE, zoom: 1 / pixelDensity, autoCenter: Phaser.Scale.CENTER_BOTH },
    });
    const activeGame = game;
    gameResize = new ResizeObserver(() => {
      const width = Math.round(host.clientWidth * pixelDensity), height = Math.round(host.clientHeight * pixelDensity);
      if (width > 0 && height > 0 && (activeGame.scale.width !== width || activeGame.scale.height !== height)) activeGame.scale.resize(width, height);
    });
    gameResize.observe(host);
  } catch (error) {
    session = undefined;
    const message = error instanceof Error ? error.message : String(error);
    const ownership = error instanceof SessionOwnershipError;
    if (ownership && ownershipRetries > 0) {
      loadingScreen()?.begin('save', language());
      element('save-status').textContent = t('Schreibfreigabe wird geprüft …');
      element('layout-status').textContent = t('Warte kurz auf die Freigabe der bisherigen Registerkarte.');
      retryTimer = window.setTimeout(() => { void boot(options, ownershipRetries - 1); }, 1000);
      return;
    }
    showError(ownership ? t('Spiel bereits in einem anderen Tab aktiv. Dieser Tab führt keinen Kampf aus und vergibt kein Gold. Du kannst ihn erneut aktivieren, wenn der andere Tab nicht mehr aktiv ist.')
      : t("Der Spielstand wurde nicht überschrieben. {0}", message), error instanceof SessionLoadError && error.canRecover, ownership);
    element('save-status').textContent = t(ownership ? t('Anderer Tab ist aktiv') : t('Spielstand konnte nicht geladen werden'));
  } finally { booting = false; }
}
function syncIntroCamera(): void {
  if (!ready || !scene) return;
  const active = intro?.active && session?.battle.introduction.stage === 'welcome';
  document.querySelector<HTMLElement>('.command-dock')!.inert = !!active;
  scene.presentIntro(active ? intro!.step : null, element('onboarding-card').getBoundingClientRect());
}
const introResize = new ResizeObserver(syncIntroCamera);
introResize.observe(element('onboarding-card'));
lifetime.signal.addEventListener('abort', () => introResize.disconnect(), { once: true });
async function finishIntro(): Promise<void> {
  const live = session, flow = intro;
  if (!ready || !live || !flow?.active || finishingIntro || live.inputBusy || live.error || live.suspended || live.awaitingResume || document.hidden) return;
  finishingIntro = true;
  const saved = await live.command(b => b.beginIntroduction());
  if (session !== live) return;
  if (saved) {
    flow.complete(); catalogPanel = 'tower'; contextOpen = false;
    syncUI(); scene?.focusGuidedDefense();
    element('pick-archer').focus({ preventScroll: true });
  }
  finishingIntro = false; syncUI();
}
element('intro-skip').addEventListener('click', () => { void finishIntro(); }, { signal: lifetime.signal });
async function perform(action: (battle: IdleBattle) => unknown, allowPaused = false, waitForSave = true): Promise<void> {
  const live = session;
  if (!ready || !live || (!allowPaused && live.paused) || live.error || document.hidden || live.awaitingResume || live.suspended) return;
  const completion = live.command(action, waitForSave || live.battle.introduction.stage !== 'done' || live.battle.discoveryActive);
  syncUI(); await completion;
  scene?.refresh(); syncUI();
}
function startGroundPlacement(id: BuildingId | 'mara'): void {
  if (!session || !ready || session.battle.preparing) return;
  if (id === 'mara') { selectHero('mara', true); return; }
  clearHeroSelection();
  ilyraMode = undefined; placementType = undefined; contextOpen = false; selectedPadId = undefined; scene?.setSelected(); groundMode = id;
  groundCandidate = id === 'tavern' ? session.battle.recommendedTavernPlot : { ...session.battle.plots[id] };
  scene?.focusObject(id === 'workshop' ? 'settlement' : id); syncUI();
}
function showLearningTower(): void {
  const tower = session?.battle.towers.find(t => t.protected); if (!tower) return;
  selectedPadId = tower.padId; scene?.setSelected(tower.padId); openContext('tower'); scene?.focusPad(tower.padId);
}
element('onboarding-primary').addEventListener('click', () => {
  const b = session?.battle; if (!b) return;
  const stage = b.introduction.stage;
  if (stage === 'welcome') {
    if (intro?.active) {
      if (!ready || finishingIntro || session?.inputBusy || session?.error || session?.suspended) return;
      if (intro.step < 2) { intro.next(); syncUI(); }
      else void finishIntro();
    } else void perform(b => b.beginIntroduction());
    return;
  }
  if (stage === 'ready') { void perform(b => b.startDefense()).then(() => scene?.focusGuidedDefense()); return; }
  if (b.lessonComplete) {
    void perform(b => b.continueLesson()).then(() => {
      if (session && ['combat', 'workshop', 'frost', 'observe'].includes(session.battle.introduction.stage)) scene?.focusGuidedDefense();
    }); return;
  }

}, { signal: lifetime.signal });
element('dismiss-fallback').addEventListener('click', () => {
  void perform(b => { b.dismissedDefeatAttempt = b.progress.lastDefeat?.attemptId ?? 0; }, true, true);
}, { signal: lifetime.signal });
element('discovery-next').addEventListener('click', () => {
  void perform(b => b.continueDiscovery(), false, true);
}, { signal: lifetime.signal });
element('discovery-later').addEventListener('click', () => {
  void perform(b => b.dismissDiscovery(), false, true);
}, { signal: lifetime.signal });
element('onboarding-secondary').addEventListener('click', () => {
  if (session?.battle.introduction.stage === 'ready') startPlacement(1);
  else void perform(b => b.skipLessons());
}, { signal: lifetime.signal });
for (const id of ['workshop', 'warehouse', 'tavern', 'mara'] as const) element(`move-${id}`).addEventListener('click', () => startGroundPlacement(id), { signal: lifetime.signal });
element('mara-auto').addEventListener('click', () => { void perform(b => { b.mara.autoCast = !b.mara.autoCast; }); }, { signal: lifetime.signal });
element('cast-mara').addEventListener('click', () => {
  let accepted=false;const live=session;
  void perform(b => {accepted=b.castMaraNow();}).then(() => {
    if(accepted&&session===live&&!live?.error)audio.commandHero('mara','cast');
    closeContext();
  });
}, { signal: lifetime.signal });
element('meet-wisp').addEventListener('click', () => { void perform(b => { b.meetWisp(); }, true, true); }, { signal: lifetime.signal });
element('confirm-placement').addEventListener('click', () => {
  if (placementType && selectedPadId) { void placeTower(selectedPadId, placementType); return; }
  const id = groundMode, cell = groundCandidate;
  if (cell && id && id !== 'mara') void placeBuilding(id, cell);
}, { signal: lifetime.signal });
async function placeBuilding(id: BuildingId, cell: GridCell): Promise<void> {
  const live = session; if (!live || live.battle.phase === 'defeat' || !live.battle.canPositionBuilding(id, cell)) return;
  const built = buildingBuilt(live.battle, id);
  if (!built && live.battle.gold < buildingCost(live.battle, id)) return;
  let accepted = false;
  if (!built) workshopRevealUntil = performance.now() + 1800;
  await perform(b => {
    if (buildingBuilt(b, id)) { if (live.paused) accepted = b.positionBuilding(id, cell); return; }
    if (id === 'tavern') { accepted = b.buildTavern(cell); return; }
    if (b.gold < buildingCost(b, id) || id === 'warehouse' && !b.warehouseUnlocked) return;
    if (!b.positionBuilding(id, cell)) return;
    accepted = id === 'workshop' ? b.buildWorkshop() : b.buildWarehouse();
  }, true, true);
  if (accepted && !live.error) { scene?.focusObject(id === 'workshop' ? 'settlement' : id); closeContext(); }
  else { workshopRevealUntil = 0; element('placement-text').textContent = t('Hier ist kein freier Zugang. Wähle einen anderen Platz.'); }
}
build.addEventListener('click', () => { if (selectedPadId) void placeTower(selectedPadId); }, { signal: lifetime.signal });
buildFrost.addEventListener('click', () => { if (selectedPadId) void placeTower(selectedPadId, 2); }, { signal: lifetime.signal });
element('upgrade-tavern').addEventListener('click', () => { void perform(b => b.upgradeTavern(), true, true); }, { signal: lifetime.signal });
element('build-tavern').addEventListener('click', () => startGroundPlacement('tavern'), { signal: lifetime.signal });
element('pick-tavern').addEventListener('click', () => openContext('tavern'), { signal: lifetime.signal });
buildWarehouse.addEventListener('click', () => { startGroundPlacement('warehouse'); }, { signal: lifetime.signal });
buildWorkshop.addEventListener('click', () => { startGroundPlacement('workshop'); }, { signal: lifetime.signal });
element('upgrade-workshop').addEventListener('click', () => { void perform(battle => battle.upgradeWorkshop()); }, { signal: lifetime.signal });
element('replay-first-boss').addEventListener('click', () => { void perform(b => b.requestBossChallenge(15)).then(() => { if (session?.battle.bossChallengeRequested) element<HTMLDialogElement>('chronicle').close(); }); }, { signal: lifetime.signal });
researchFrost.addEventListener('click', () => { void perform(battle => battle.researchFrost()).then(() => { if (session?.battle.guiding && session.battle.lessonComplete) closeContext(); }); }, { signal: lifetime.signal });
padChoice.addEventListener('change', () => { placementType = undefined; void selectPad(padChoice.value || undefined); }, { signal: lifetime.signal });
for (const kind of ['tower', 'settlement'] as const) {
  element(`${kind}-tab`).addEventListener('click', () => { catalogPanel = kind; placementType = undefined; closeContext(); if (kind === 'settlement' && session?.battle.tavernUnlocked && !session.battle.settlement.tavernSeen) element('pick-tavern').scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, { signal: lifetime.signal });
  element(`${kind}-tab`).addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault(); const other = kind === 'tower' ? 'settlement' : 'tower';
    element(`${other}-tab`).click(); element(`${other}-tab`).focus();
  }, { signal: lifetime.signal });
}
element('choose-frost').addEventListener('click', () => startPlacement(2), { signal: lifetime.signal });
for (const [name, kind] of [['cannon', 3], ['sniper', 4], ['storm', 5]] as const) {
  element(`pick-${name}`).addEventListener('click', () => { if (kind === 3 && session?.battle.isTowerUnlocked(3)) inspectCannon(); startPlacement(kind); }, { signal: lifetime.signal });
  element(`build-${name}`).addEventListener('click', () => { if (selectedPadId) void placeTower(selectedPadId, kind); }, { signal: lifetime.signal });
}
for (const hero of ['mara','wisp','ilyra'] as const) element(`tavern-${hero}`).addEventListener('click', () => openContext(hero), { signal: lifetime.signal });
element('pick-ilyra').addEventListener('click', () => {
  openContext('ilyra');
  if (session?.battle.ilyra && contextOpen && selectedPanel === 'ilyra') audio.commandHero('ilyra','select');
}, { signal: lifetime.signal });
element('recruit-ilyra').addEventListener('click', () => {
  void perform(b => b.recruitIlyra(), true, true).then(() => { if (session?.battle.ilyra) { selectHero('ilyra', true); if (heroSuggestion) scene?.showHeroPosition(heroSuggestion); syncUI(); } });
}, { signal: lifetime.signal });
for (const mode of ['move','cast'] as const) element(mode === 'move' ? 'move-ilyra' : 'aim-ilyra').addEventListener('click', () => {
  if (mode === 'cast') aimIlyra(); else { selectHero('ilyra', true); if (heroSuggestion) scene?.showHeroPosition(heroSuggestion); }
}, { signal: lifetime.signal });
element('hero-aim').addEventListener('click', aimIlyra, { signal: lifetime.signal });
element('hero-mara-cast').addEventListener('click', () => {
  const generation=heroGeneration;
  if(selectedHero!=='mara'||!heroContextAvailable()||session?.inputBusy||session?.paused)return;
  let accepted=false;
  void perform(b => { if(generation===heroGeneration&&selectedHero==='mara'&&heroContextAvailable())accepted=b.castMaraNow(); })
    .then(()=>{if(accepted&&generation===heroGeneration&&!session?.error)audio.commandHero('mara','cast');});
}, { signal: lifetime.signal });
element('hero-location').addEventListener('click', () => { if (selectedHero === 'ilyra' && heroSuggestion) scene?.showHeroPosition(heroSuggestion); }, { signal: lifetime.signal });
element('ilyra-auto').addEventListener('click', () => { void perform(b => b.setIlyraAuto(!b.ilyra?.autoCast), true, true); }, { signal: lifetime.signal });
element('pick-wisp').addEventListener('click', () => openContext('wisp'), { signal: lifetime.signal });
element('challenge-boss').addEventListener('click', () => {
  void perform(b => b.requestBossChallenge(b.nextBossWave)).then(() => { if (session?.battle.bossChallengeRequested) element<HTMLDialogElement>('chronicle').close(); });
}, { signal: lifetime.signal });
element('catalog-next').addEventListener('click', () => { const list = element(`${catalogPanel}-catalog`); list.scrollTo({ left: list.scrollLeft >= list.scrollWidth - list.clientWidth - 2 ? 0 : list.scrollLeft + list.clientWidth, behavior: 'smooth' }); }, { signal: lifetime.signal });
element('pick-archer').addEventListener('click', () => startPlacement(1), { signal: lifetime.signal });
element('pick-frost').addEventListener('click', () => startPlacement(2), { signal: lifetime.signal });
element('research-storm').addEventListener('click', () => {void perform(b=>b.researchStorm());}, {signal:lifetime.signal});
for(const tech of ['frost','storm'] as const)element(`tech-${tech}`).addEventListener('click',()=>{selectedTechnology=tech;syncUI();},{signal:lifetime.signal});
element('pick-clearing').addEventListener('click', () => openContext('clearing'), { signal: lifetime.signal });
element('show-clearing').addEventListener('click', () => { placementType = undefined; closeContext(); scene?.showBase(); }, { signal: lifetime.signal });

element('pick-warehouse').addEventListener('click', () => openContext('warehouse'), { signal: lifetime.signal });
element('pick-workshop').addEventListener('click', () => {
  if (session?.battle.settlement.workshopBuilt) openContext('settlement');
  else startGroundPlacement('workshop');
}, { signal: lifetime.signal });
element('skip-lessons').addEventListener('click', () => {
  void perform(b => b.skipLessons(), true, true).then(() => element<HTMLDialogElement>('game-menu').close());
}, { signal: lifetime.signal });
element('pick-mara').addEventListener('click', () => {
  if (session && maraControlStage(session.battle) !== 'ready') { selectMapHero('mara'); return; }
  openContext('mara');
  if(contextOpen&&selectedPanel==='mara')audio.commandHero('mara','select');
}, { signal: lifetime.signal });
element('close-context').addEventListener('click', closeContext, { signal: lifetime.signal });
element('cancel-placement').addEventListener('click', () => { placementType = undefined; closeContext(); }, { signal: lifetime.signal });
element('placement-pads').addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-pad]');
  if (button?.dataset.pad) void selectPad(button.dataset.pad);
}, { signal: lifetime.signal });
const menu = element<HTMLDialogElement>('game-menu');
element('open-menu').addEventListener('click', () => menu.showModal(), { signal: lifetime.signal });
element('close-menu').addEventListener('click', () => menu.close(), { signal: lifetime.signal });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.open && !tavernUI.isOpen) { placementType = undefined; closeContext(); } }, { signal: lifetime.signal });
element('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.fullscreenEnabled) await document.documentElement.requestFullscreen();
    else throw new Error('Fullscreen unavailable');
  } catch {
    element('fullscreen-notice').hidden = false;
    if (!menu.open) menu.showModal();
  }
}, { signal: lifetime.signal });
document.addEventListener('fullscreenchange', () => {
  const active = Boolean(document.fullscreenElement);
  element('fullscreen').setAttribute('aria-label', t(active ? t('Vollbild verlassen') : t('Vollbild')));
  element('fullscreen').setAttribute('aria-pressed', String(active));
  element('fullscreen').title = t(active ? t('Vollbild verlassen') : t('Vollbild'));
}, { signal: lifetime.signal });
element('mobile-hint').addEventListener('click', () => { mobileHintOpen = true; syncUI(); }, { signal: lifetime.signal });
element('close-mobile-hint').addEventListener('click', () => { mobileHintOpen = false; syncUI(); }, { signal: lifetime.signal });
element('hint-action').addEventListener('click', () => {
  const b = session?.battle, tower = b?.towers.find(t => t.uid === b.mara.targetTowerUid);
  if (tower) { selectedPadId = tower.padId; scene?.setSelected(tower.padId); scene?.focusPad(tower.padId); }
}, { signal: lifetime.signal });
element('hint-skip').addEventListener('click', () => { void perform(battle => { battle.tutorial.hidden = true; }, true); }, { signal: lifetime.signal });
element('hint-read').addEventListener('click', () => { const step = session && tutorialStep(session.battle); if (step !== undefined) void perform(battle => { battle.tutorial.seen |= 1 << step; }, true, true); }, { signal: lifetime.signal });
element('show-hints').addEventListener('click', () => { menu.close(); placementType = undefined; closeContext(); mobileHintOpen = true; void perform(battle => { battle.tutorial.hidden = false; battle.tutorial.seen = 0; }, true); }, { signal: lifetime.signal });
element('new-probe').addEventListener('click', () => {
  const url = new URL(location.href); url.searchParams.set('probe', crypto.randomUUID());
  void (session?.suspend() ?? Promise.resolve()).then(() => location.assign(url));
}, { signal: lifetime.signal });
upgrade.addEventListener('click', () => {
  const live = session, firstUpgrade = live?.battle.introduction.stage === 'upgrade';
  let accepted = false;
  void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); accepted = !!tower && battle.upgrade(tower.uid); }).then(() => {
    if (session === live && !live?.error && accepted && firstUpgrade) { closeContext(); scene?.focusGuidedDefense(); }
  });
}, { signal: lifetime.signal });
sell.addEventListener('click', () => { void perform(battle => { const tower = battle.towers.find(value => value.padId === selectedPadId); return tower && battle.sell(tower.uid); }); }, { signal: lifetime.signal });
advance.addEventListener('click', () => { void perform(battle => battle.requestAdvance()); }, { signal: lifetime.signal });
assignMara.addEventListener('click', () => {
  let accepted=false;const live=session;
  void perform(battle => {const tower=battle.towers.find(value=>value.padId===selectedPadId);accepted=!!tower&&battle.assignMara(tower.uid);})
    .then(()=>{if(accepted&&session===live&&!live?.error)audio.commandHero('mara','move');});
}, { signal: lifetime.signal });
element('camera-reset').addEventListener('click', () => {
  const b = session?.battle;
  if (groundMode && groundMode !== 'mara') scene?.focusObject(groundMode === 'workshop' ? 'settlement' : groundMode);
  else if (placementType && selectedPadId) scene?.focusPad(selectedPadId);
  else if (b?.learningPaused && b.introduction.stage === 'research') scene?.focusObject('settlement');
  else if (b?.learningPaused && b.introduction.stage === 'upgrade') { const tower = b.towers.find(t => t.protected); if (tower) scene?.focusPad(tower.padId); }
  else { placementType = undefined; closeContext(); scene?.resetCamera(); }
  syncUI();
}, { signal: lifetime.signal });
element('camera-zoom').addEventListener('click', () => { if (scene) scene.setMapZoom(scene.mapZoom > 1 ? 1 : 1.15); syncUI(); }, { signal: lifetime.signal });
pause.addEventListener('click', () => { if (session) { const completion = session.setPaused(!session.paused); syncUI(); void completion.then(syncUI); } }, { signal: lifetime.signal });
claim.addEventListener('click', () => {
  const live = session;
  if (!live || live.inputBusy || live.error || document.hidden) return;
  const complete = async () => {
    if (live.pendingReward) await live.claimOffline();
    if (!live.error && !document.hidden) await live.resumeActive();
    syncUI();
  };
  void complete(); syncUI();
}, { signal: lifetime.signal });
element('reset').addEventListener('click', () => {
  void (session?.suspend() ?? Promise.resolve()).catch(() => undefined).then(() => window.location.reload());
}, { signal: lifetime.signal });
recover.addEventListener('click', () => { void boot({ recover: true }); }, { signal: lifetime.signal });
element('temporary-session').addEventListener('click', () => { void boot({ temporary: true }); }, { signal: lifetime.signal });
element('activate-session').addEventListener('click', () => { void boot(); }, { signal: lifetime.signal });

document.addEventListener('visibilitychange', () => {
  const hidden = document.hidden;
  syncUI();
  lifecycle = lifecycle.then(async () => {
    if (session?.temporary) { if (hidden) await session.flush(); syncUI(); return; }
    if (hidden) await session?.suspend(); else await boot();
  })
    .catch(error => showError(t("Die Probe ist angehalten. {0}", error instanceof Error ? error.message : String(error)), false, true));
}, { signal: lifetime.signal });
window.addEventListener('pagehide', () => { void session?.suspend().catch(() => undefined); }, { signal: lifetime.signal });
const heartbeat = window.setInterval(() => {
  if (!document.hidden && session && !session.suspended) void session.heartbeat().catch(() => syncUI());
}, 1000);
const unbindDynamicLanguage = onLanguageChange(() => { showCombatMessage(); syncUI(); scene?.refreshLanguage(); });
if (import.meta.hot) import.meta.hot.dispose(() => { loadingScreen()?.dismiss(); unbindStaticLanguage(); unmountLanguage(); unbindDynamicLanguage(); quickWins.destroy(); tavernUI.destroy(); audio.destroy(); lifetime.abort(); clearInterval(heartbeat); clearTimeout(retryTimer); game?.destroy(true); void session?.close().catch(() => undefined); });
void boot();
