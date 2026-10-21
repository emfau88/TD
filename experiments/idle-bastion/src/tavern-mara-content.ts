import { hearts, SOCIAL, type Interaction } from './tavern-social';
import type { TouchRegion } from './tavern-animation';

import type { TavernMoment } from './tavern-content';
export type MaraMoment = TavernMoment;
/** Five authored rewards; replay is read-only, unlocked entirely by saved points. */
export const MARA_MOMENTS: readonly MaraMoment[] = [
  { heart: 1, title: 'Ein Platz am Feuer', beats: [
    { line: 'Den Stuhl neben mir halte ich sonst für meine Werkzeugtasche frei. Heute darfst du dort sitzen. Die Tasche wird es überleben.', clip: 'shoulder' },
    { line: 'Als ich in den Hain kam, kannte ich hier niemanden. Ich habe die ganze erste Nacht an einer kaputten Laterne geschraubt, nur um beschäftigt auszusehen.', clip: 'hair' },
    { line: 'Du musst übrigens nichts repariert haben wollen, um vorbeizukommen. Für dich ist hier auch einfach so ein Platz.', clip: 'hand' },
  ] },
  { heart: 2, title: 'Mein Glücksstück', beats: [
    { line: 'Meine erste selbst gebaute Uhr ging jeden Tag sieben Minuten nach. Ich habe sie trotzdem jahrelang getragen. Furchtbar unvernünftig, ich weiß.', clip: 'hand' },
    { line: 'Das kleine Zahnrad daraus habe ich behalten. Es erinnert mich daran, dass etwas nicht perfekt sein muss, um mir wichtig zu sein.', clip: 'hair' },
    { line: 'Dass du wiederkommst, ist mir auch wichtig. So. Jetzt weißt du es. Und wehe, du grinst zu breit.', clip: 'shoulder' },
  ] },
  { heart: 3, title: 'Was ich nicht reparieren kann', beats: [
    { line: 'Wenn die Türme stehen, tue ich gern so, als hätte ich alles im Griff. Meistens überzeugt das sogar mich selbst.', clip: 'shoulder' },
    { line: 'Aber wenn der Kern getroffen wird, habe ich Angst. Nicht um meine Werkstatt. Um die Leute, die wir hier nach Hause gebracht haben. Um dich.', clip: 'hair' },
    { line: 'Du brauchst mir nichts zu versprechen. Bleib einfach einen Moment. Ich muss bei dir wohl nicht immer die Unerschrockene spielen.', clip: 'hand' },
  ] },
  { heart: 4, title: 'Bleib noch ein bisschen', beats: [
    { line: 'Ich habe die Werkstatt heute früher zugemacht. Nein, es ist nichts kaputt. Das ist genau der Punkt: Ich wollte Zeit für dich haben.', clip: 'hair' },
    { line: 'Gib mir deine Hand. Nur wenn du möchtest. Es ist angenehm, einmal nichts festhalten zu müssen, das auseinanderfallen könnte.', clip: 'hand' },
    { line: 'So gefällt mir das. Keine Pläne, keine Heldengeschichten. Du neben mir. Wenn du noch bleibst, beschwere ich mich bestimmt nicht.', clip: 'shoulder' },
  ] },
  { heart: 5, title: 'Unser Morgen', beats: [
    { line: 'Ich habe einen Plan für morgen. Erstaunlicherweise kommen darin weder Zahnräder noch Geschütztürme vor.', clip: 'hair' },
    { line: 'Ich möchte mit dir frühstücken. Und herausfinden, ob du morgens genauso gut darin bist, mich zum Lächeln zu bringen.', clip: 'hand' },
    { line: 'Ich habe mich in dich verliebt. Da, jetzt ist es raus. Für einmal muss ich daran nichts verbessern. Ich möchte einfach, dass du es weißt.', clip: 'shoulder' },
  ] },
];
const stages = [
  { name: 'Erste Begegnungen', greeting: 'Da bist du ja. Setz dich einen Moment zu mir.', talk: ['Weißt du, was ich an diesem Ort mag? Dass wir ihn gemeinsam aufbauen.', 'An einem guten Turm hört man, ob alles stimmt. Bei Menschen ist das schwieriger. Mit dir rede ich aber gern.'], gift: 'Für mich? Das hätte ich jetzt nicht erwartet. Danke, dass du an mich gedacht hast.', hand: 'Du kannst meine Hand nehmen. Aber meine Werkzeuge bleiben bei mir.', hair: 'Vorsichtig mit dem Zopf … den habe ich heute ausnahmsweise ordentlich geflochten.', shoulder: 'He … du hättest auch einfach meinen Namen sagen können.' },
  { name: 'Willkommen am Feuer', greeting: 'Dein Platz ist noch frei. Ich hatte gehofft, dass du vorbeischaust.', talk: ['Heute habe ich Wisp erklärt, warum man Schrauben sortiert. Er hat mir erklärt, warum Gold schöner glänzt. Unentschieden.', 'Die Laterne über der Tür flackert nicht mehr. Ich glaube, langsam wird aus diesem Ort ein Zuhause.'], gift: 'Du hast an mich gedacht? Das ist fast besser als das Geschenk. Fast.', hand: 'Warme Hände. Du warst wohl nicht den ganzen Tag an der Werkbank.', hair: 'So ordentlich bleibt der Zopf sonst nie lange. Heute gebe ich mir offenbar mehr Mühe.', shoulder: 'Das tut gut. Zwischen all den Plänen vergesse ich manchmal, kurz durchzuatmen.' },
  { name: 'Ein kleines Vertrauen', greeting: 'Schön, dich zu sehen. Ich habe dir etwas zu erzählen.', talk: ['Mein Glückszahnrad ist noch da. Nein, du darfst es nicht in einen Turm einbauen. Manches behalte ich einfach für mich.', 'Früher habe ich meine Pausen meistens allein verbracht. Inzwischen sehe ich öfter zur Tür. Seltsam, oder?'], gift: 'Das behalte ich. Und nein, ich zerlege es nicht sofort in seine Einzelteile.', hand: 'Du musst nicht gleich wieder loslassen. Wir haben einen Moment.', hair: 'Wenn du so vorsichtig bist, darfst du das ruhig öfter machen.', shoulder: 'Bei dir darf ich wohl auch mal die Schultern sinken lassen.' },
  { name: 'Ganz ohne Fassade', greeting: 'Da bist du. Neben dir wird es in meinem Kopf etwas ruhiger.', talk: ['Heute war ich unsicher. Dann habe ich mich daran erinnert, dass ich nicht alles allein tragen muss.', 'Ich erzähle dir Dinge, die sonst zwischen meinen Werkzeugen verschwinden. Du hörst wirklich zu. Das bedeutet mir viel.'], gift: 'Du musst mir nichts schenken, damit ich mich über dich freue. Aber ich freue mich trotzdem. Sehr.', hand: 'Danke, dass du bleibst. Gerade brauche ich keinen klugen Rat. Nur deine Hand.', hair: 'So nah lasse ich nicht viele Menschen an mich heran. Bei dir fühlt es sich richtig an.', shoulder: 'Ja. Genau da. Ich merke erst jetzt, wie angespannt ich war.' },
  { name: 'Deine Nähe', greeting: 'Endlich. Heute habe ich die Werkzeuge extra weggeräumt.', talk: ['Ich wollte dir etwas sehr Schlagfertiges sagen. Dann hast du gelächelt, und jetzt ist es weg.', 'Ein Spaziergang ohne Baupläne wäre schön. Mit dir würde ich sogar versuchen, nicht jeden schiefen Zaun zu reparieren.'], gift: 'Du kennst mich inzwischen ziemlich gut. Das gefällt mir gefährlich gut.', hand: 'Lass sie noch ein bisschen hier. Meine Hand passt offenbar erstaunlich gut in deine.', hair: 'Wenn du so weitermachst, vergesse ich noch, was ich dir erzählen wollte.', shoulder: 'Komm ruhig näher. Heute habe ich nicht vor, meine Pause allein zu verbringen.' },
  { name: 'Unser Morgen', greeting: 'Da ist mein Lieblingsmensch. Komm, der Platz neben mir gehört dir.', talk: ['Ich bin gern die Tüftlerin des Hains. Aber bei dir darf ich einfach Mara sein. Das ist mein liebster Teil des Tages.', 'Morgen früh am Feuer, ja? Ich verspreche auch, vorher nicht noch schnell einen Turm umzubauen. Na gut: Ich versuche es.'], gift: 'Für mich? Du weißt schon, dass ich dich auch ohne Geschenke liebe. Aber das hier bekommt einen Ehrenplatz.', hand: 'Mit dir muss ich nicht ständig irgendwo ankommen. Ich bin schon gern genau hier.', hair: 'So könnte der Abend ruhig noch eine Weile bleiben.', shoulder: 'Bleib bei mir, solange du magst. Ich habe dich vermisst.' },
] as const;
export function maraStage(points: number) { return stages[hearts(points)]!; }
export function maraMoment(points: number, heart: number): MaraMoment | undefined {
  return Number.isInteger(heart) && heart >= 1 && heart <= hearts(points) ? MARA_MOMENTS[heart - 1] : undefined;
}
export function maraLine(points: number, action: Interaction, region: TouchRegion, turn: number): string {
  const stage = maraStage(points);
  return action === 'talk' ? stage.talk[Math.abs(turn) % stage.talk.length]! : action === 'gift' ? stage.gift : stage[region];
}
export function nextMaraMoment(points: number): { title: string; points: number } | undefined {
  const count = hearts(points), moment = MARA_MOMENTS[count];
  return moment ? { title: moment.title, points: SOCIAL.heartThresholds[count]! } : undefined;
}
