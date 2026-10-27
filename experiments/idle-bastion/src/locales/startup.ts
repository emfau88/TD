// Small enough for the entry screen before Phaser and the main text catalogue.
export const startupEnglish: Record<string, string> = {
  'Der alte Hain': 'The Old Grove',
  'Die Musik wird vorbereitet …': 'Getting the music ready…',
  'Ohne Musik fortfahren': 'Continue without music',
  'Die Musik ist noch nicht abspielbereit. Versuche es erneut oder starte ohne Musik.': 'The music is not ready to play. Try again or continue without music.',
  'Wir bitten die Monster, sich höflich anzustellen …': 'Convincing the monsters to queue politely …',
  'Mara nennt es ein Feature. Ilyra sieht das anders.': "Mara says it's a feature. Ilyra disagrees.",
  'Die Taverne wird aufgefüllt. Nur für die Moral.': 'Stocking the tavern. Strictly for morale.',
  'Der Wald erwacht …': 'The forest awakens…',
  'Spielstand wird initialisiert …': 'Preparing your saved game…',
  'Verteidigung wird vorbereitet …': 'Preparing your defenses…',
  'Die Lichtung wird aufgebaut …': 'Bringing the grove to life…',
  'Spielgrafiken': 'Game artwork',
  '{0} / {1} Spielgrafiken geladen': '{0} / {1} artwork files loaded',
  'Der Start wurde unterbrochen.': 'Startup was interrupted.',
  'Das Laden dauert ungewöhnlich lange. Bitte prüfe deine Verbindung und versuche es erneut.': 'Loading is taking longer than expected. Please check your connection and try again.',
  'Das Spiel konnte nicht gestartet werden. Bitte versuche es erneut.': 'The game could not start. Please try again.',
  'Spielgrafiken konnten nicht geladen werden. Bitte versuche es erneut.': 'Game artwork could not load. Please try again.',
  'Erneut versuchen': 'Try again',
  'Spielstand prüfen': 'Check saved game',
};
export function startupLanguage(): 'en' | 'de' {
  try { return globalThis.localStorage?.getItem('spire-language-v1') === 'de' ? 'de' : 'en'; }
  catch { return 'en'; }
}
export function startupText(source: string, language: 'en' | 'de', ...values: number[]): string {
  const text = language === 'en' ? startupEnglish[source] ?? source : source;
  return text.replace(/\{(\d+)\}/g, (match, index: string) => values[Number(index)] === undefined ? match : String(values[Number(index)]));
}
