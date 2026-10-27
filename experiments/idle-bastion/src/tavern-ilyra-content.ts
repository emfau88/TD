import { hearts, SOCIAL, type Interaction } from './tavern-social';
import type { TouchRegion } from './tavern-animation';
import type { TavernMoment } from './tavern-content';

/** Ilyra chooses trust slowly; her scenes share mechanics, never Mara's voice. */
export const ILYRA_MOMENTS: readonly TavernMoment[] = [
  { heart: 1, title: 'Die Wache darf warten', beats: [
    { line: 'Du siehst zu meinem Speer. Eine alte Gewohnheit: Ich lege ihn selten außer Reichweite. Hier kann ich es versuchen.', clip: 'head' },
    { line: 'Die anderen haben mich eingeladen, bevor sie wussten, ob ich bleiben würde. Das ist mir lange nicht passiert.', clip: 'idle' },
    { line: 'Setz dich. Du musst die Stille nicht füllen. Ich finde es angenehm, sie mit dir zu teilen.', clip: 'head' },
  ] },
  { heart: 2, title: 'Ein Stern ohne Namen', beats: [
    { line: 'Nördlich vom Hain steht ein schiefer Baum. Von dort sieht man einen kleinen Stern, den das Feuer hier unten überstrahlt.', clip: 'head' },
    { line: 'Ich habe ihn auf jeder meiner Reisen gesucht. Solange ich ihn fand, fühlte ich mich weniger verloren. Seinen Namen kenne ich bis heute nicht.', clip: 'head' },
    { line: 'Wenn deine Wache vorbei ist, zeige ich ihn dir. Nur dir. Manche Geschichten erzähle ich lieber unter freiem Himmel.', clip: 'touch' },
  ] },
  { heart: 3, title: 'Was hinter der Ruhe liegt', beats: [
    { line: 'Alle sagen, ich sei so ruhig. Meistens bedeutet das nur, dass ich meine Antwort länger mit mir herumtrage.', clip: 'touch' },
    { line: 'Ich bin oft weitergezogen, bevor jemand fragen konnte, ob ich bleiben möchte. Abschiede schienen mir leichter, wenn ich sie selbst bestimmte.', clip: 'head' },
    { line: 'Hier ertappe ich mich dabei, für den nächsten Morgen zu planen. Du kommst in diesen Plänen erstaunlich oft vor.', clip: 'idle' },
  ] },
  { heart: 4, title: 'Ein Schritt auf dich zu', beats: [
    { line: 'Heute habe ich mich gefragt, ob du wiederkommst. Dann fand ich es albern, nur auf dich zu warten. Also: Hier bin ich.', clip: 'head' },
    { line: 'Ich möchte deine Hand nehmen. Wenn du das auch möchtest. Einen mutigen Satz auszusprechen ist offenbar schwieriger als eine Wache zu übernehmen.', clip: 'touch' },
    { line: 'Ja. So ist es gut. Wir können später noch zu unserem Stern gehen. Diesen Moment möchte ich erst einmal behalten.', clip: 'touch' },
  ] },
  { heart: 5, title: 'Hier möchte ich bleiben', beats: [
    { line: 'Früher habe ich morgens zuerst nach dem Weg aus einem Ort gesucht. Heute habe ich als Erstes nach dir gesehen.', clip: 'head' },
    { line: 'Ich bleibe nicht, weil du eine Wächterin brauchst. Ich bleibe, weil ich dich liebe. Das wollte ich klar sagen, ohne mich hinter schönen Sternengeschichten zu verstecken.', clip: 'touch' },
    { line: 'Und morgen? Morgen sitzen wir wieder hier. Du darfst mir alles erzählen. Oder gar nichts. Ich bin gern bei dir.', clip: 'touch' },
  ] },
];
const stages = [
  { name: 'Ein vorsichtiger Anfang', greeting: 'Du bist willkommen. Ich gewöhne mich noch an die Ruhe hier.', talk: ['Der Hain klingt nachts anders. Ich kenne inzwischen die Vögel, die vor dem Morgen singen.', 'Mara hat mir einen Platz am Feuer gezeigt. Ich glaube, sie merkt, wenn jemand nicht weiß, wohin mit sich.'], gift: 'Du hast etwas für mich mitgebracht? Danke. Ich weiß die Aufmerksamkeit zu schätzen.', hand: 'So ist es in Ordnung. Lass mir nur einen Augenblick, mich daran zu gewöhnen.', hair: 'Vorsichtig … die silbernen Strähnen verfangen sich leicht an der Brille.', shoulder: 'Du hast mich überrascht. Es ist gut. Ich bin es nur nicht gewohnt, die Wache abzugeben.' },
  { name: 'Geteilte Stille', greeting: 'Ich habe den Speer schon abgestellt. Heute darf die Wache warten.', talk: ['Früher hätte ich nach einer Einladung einen Vorwand zum Gehen gesucht. Heute habe ich mir diesen Platz ausgesucht.', 'Du kannst auch einfach neben mir sitzen. Mit dir fühlt sich Stille nicht nach Alleinsein an.'], gift: 'Ich werde es aufbewahren. Es erinnert mich daran, dass hier jemand an mich denkt.', hand: 'Du brauchst nicht so vorsichtig zu fragen. Meine Hand bleibt noch einen Moment hier.', hair: 'Danke. Im Wind hätte ich die Strähne längst wieder vor den Augen.', shoulder: 'Jetzt erkenne ich dich, ohne mich umzudrehen. Darüber freue ich mich mehr, als ich erwartet hätte.' },
  { name: 'Unter unserem Stern', greeting: 'Der Himmel ist heute klar. Vielleicht haben wir später Zeit.', talk: ['Unser kleiner Stern hat noch immer keinen Namen. Vielleicht braucht er auch keinen, solange wir wissen, welcher gemeint ist.', 'Ich habe auf meinen Reisen viel gesehen. Seltsamerweise möchte ich dir zuerst von den kleinen Dingen erzählen.'], gift: 'Du hast dir gemerkt, was mir gefällt. Das ist nicht selbstverständlich. Danke.', hand: 'Komm. Ich zeige dir später den Weg zum schiefen Baum. Bis dahin kannst du sie gern halten.', hair: 'Bei dir muss ich nicht bei jeder Bewegung zusammenzucken. Das fühlt sich neu an.', shoulder: 'Ein wenig näher ist in Ordnung. Ich werde es dir sagen, wenn ich Abstand brauche.' },
  { name: 'Ohne Rüstung', greeting: 'Schön, dass du da bist. Heute möchte ich dir nichts vorspielen.', talk: ['Ich habe lange geglaubt, Unabhängigkeit hieße, niemanden zu vermissen. Inzwischen sehe ich das anders.', 'Heute habe ich Wisp gefragt, wie lange er hierbleibt. Er sagte: Solange es sich lohnt. Ich glaube, bei ihm bedeutete das etwas anderes als bei mir.'], gift: 'Du kennst inzwischen auch meine leisen Wünsche. Das berührt mich.', hand: 'Bleib so. Ich muss nicht immer diejenige sein, die alles sicher festhält.', hair: 'Du gehst behutsam mit mir um. Ich bemerke das, auch wenn ich wenig dazu sage.', shoulder: 'Danke. Ich merke erst jetzt, wie schwer dieser Tag auf mir lag.' },
  { name: 'Ein Schritt zu dir', greeting: 'Diesmal habe ich dich gesucht. Ich wollte deine Nähe.', talk: ['Ich habe mir einen sehr gelassenen Empfang für dich zurechtgelegt. Jetzt lächle ich schon, bevor du etwas gesagt hast.', 'Wenn du heute Abend frei hast, würde ich gern mit dir hinausgehen. Diesmal ist das keine Einladung zur Wache.'], gift: 'Ich freue mich. Und noch mehr darüber, dass du geblieben bist, um es mir selbst zu geben.', hand: 'Ja, genau so. Du darfst wissen, dass ich darauf gehofft habe.', hair: 'Wenn du mich dabei so ansiehst, verliere ich den Faden. Das passiert mir selten.', shoulder: 'Du kannst ruhig näherkommen. Ich habe dir diesen Platz nicht zufällig freigehalten.' },
  { name: 'Hier möchte ich bleiben', greeting: 'Da bist du. Ich bin gern dort zu Hause, wo wir zusammen sind.', talk: ['Ich liebe unsere kleinen Gewohnheiten. Deinen Blick zur Tür. Den Platz am Feuer. Dass ich nicht mehr nach einem Grund zum Bleiben suche.', 'Unser Stern wird heute wohl hinter Wolken stehen. Das macht nichts. Ich hatte ohnehin vor, den Abend mit dir zu verbringen.'], gift: 'Danke, mein Herz. Du musst mir nichts beweisen. Ich freue mich einfach über dich.', hand: 'Deine Hand in meiner. Manchmal ist das alles, was ich vom Abend brauche.', hair: 'Bleib ruhig so nah. Ich möchte diesen stillen Moment mit dir genießen.', shoulder: 'Hier kann ich die Augen schließen. Ich vertraue dir.' },
] as const;
export function ilyraStage(points: number) { return stages[hearts(points)]!; }
export function ilyraMoment(points: number, heart: number): TavernMoment | undefined {
  return Number.isInteger(heart) && heart >= 1 && heart <= hearts(points) ? ILYRA_MOMENTS[heart - 1] : undefined;
}
export function ilyraLine(points: number, action: Interaction, region: TouchRegion, turn: number): string {
  const stage = ilyraStage(points);
  const talks = [stage, ...stages.slice(0, hearts(points))].flatMap(entry => entry.talk);
  return action === 'talk' ? talks[Math.abs(turn) % talks.length]! : action === 'gift' ? stage.gift : stage[region];
}
export function nextIlyraMoment(points: number): { title: string; points: number } | undefined {
  const count = hearts(points), moment = ILYRA_MOMENTS[count];
  return count < 3 && moment ? { title: moment.title, points: SOCIAL.heartThresholds[count]! } : undefined;
}
