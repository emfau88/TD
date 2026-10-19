# B13 — Balance und vollständiger Anfangsverlauf

Stand: 19.10.2026. Branch `codex/idle-bastion-vertical-slice`, Ausgangsstand `105706a` (Spielstand davor `592b42a`). Umsetzung vollständig; technische B13-Prüfung bestanden, spielerische Grenzen unten offengelegt. Nutzerabnahme: offen. B14 und die Gegnerproduktion B12d bleiben eigene, nicht begonnene Pakete.

## Änderungen und Messmethode

Die neue Gegnermischung bleibt erhalten. Ab Welle 16 wachsen HP nur noch um 13 % pro Welle statt 16 %. Gewöhnliches Kampf-Gold beginnt dort bei 2× und steigt um 0,12 pro Welle bis höchstens 4×. Der erste Boss hat 20 % mehr HP; Begleiter, Rüstung, Heilung, Turmwerte, Preise und der Einstieg bleiben unverändert. Werkstatt II lenkt die nächste Ausbauempfehlung zunächst auf die Steinschleuder bis Level 7. Die Chronik erklärt die höheren Erträge.

Nach Upgrades wird auch die vorher sichere Farmwelle erneut geprüft. Bisher konnte sie zugunsten der jüngsten beiden, möglicherweise nur mit Kernschaden gewonnenen Wellen verloren gehen und die Auswahl unnötig auf Welle 1 zurückfallen. Die Prüfung bleibt auf vier Kandidaten mit je zwei schadensfreien Wiederholungen ohne Mara begrenzt. Es wird weiterhin die beste bewiesene Goldrate gewählt, nicht zwangsläufig die höchste Wellennummer.

Schema 14 / Regeln 10: Laufende alte Kämpfe behalten ihre HP und ihr Belohnungsrezept bis zum Wellenwechsel. Bestehende Käufe, Wisp, Gebäude und historische Offline-Ansprüche bleiben erhalten. Neue Farmnachweise werden neu verdient. Eine echte v13-Bosskampf-Fixture prüft die Migration.

Die Modellmessungen führen ausschließlich bezahlbare Spielbefehle aus, entscheiden höchstens einmal pro Sekunde und beschleunigen nur die Simulation außerhalb des Browsers. Keine Zusatzwährung oder erzwungenen Freischaltungen. `guided` kombiniert zwei Waldwächter mit Frost, Steinschleuder und Scharfschütze; `alternative` investiert zunächst in einen weiteren Waldwächter und andere Plätze. `watch` beginnt Käufe erst nach 180 Sekunden. Nach einer Niederlage folgt ein ausdrücklicher Vorstoßbefehl erst nach einer neuen Investition. Diese Kaufstrategie gehört nur zum Messwerkzeug, nicht zur Spielautomatik.

Im Browser erfolgen Käufe und Vorstöße über normale sichtbare UI-Buttons und Kartenklicks. IndexedDB wird während des Durchlaufs nur gelesen. Ein frischer isolierter Probe-Slot schützt bestehende Partien. Chromium/Playwright, Windows, Desktop 1600×1000, sichtbare Spielgeschwindigkeit 1×, unveränderte Echtzeituhr. Automatisierte Bedienung ersetzt keine Spielerbefragung oder Smartphone-Abnahme.

## Vorher und Modellvarianten

Vor B13 erreichten die drei 15-Minuten-Modelläufe Rekord 23 / 23 / 21. Der erste Boss fiel nach 5:33 / 4:44 / 7:08. Danach blieben die Türme trotz Werkstatt II bei Level 4–5; keine dritte Grafikstufe. Bei der alternativen Platzierung lag die Farmwahl am Ende nur bei Welle 1. [Rohdaten vorher](b13-before.json).

Die Ausgangsstrategie kaufte nach Werkstatt II jeweils das billigste Upgrade. Die neue Empfehlung priorisiert zunächst Steinschleuder 7. Der Vergleich zeigt daher das gesamte B13-Paket einschließlich Kaufempfehlung, keinen isolierten A/B-Nachweis für einen einzelnen Zahlenwert. Eine zunächst probierte Verdopplung der ersten Boss-HP wurde verworfen, weil sie wiederholte Niederlagen und minutenlange Verzögerungen erzeugte.

| Modell, jeweils 15:00 | Werkstatt | Frost/Wisp | Lager | Boss 15 | Lichtung | Werkstatt II | Rekord | Farmwelle |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| guided | 1:19 | 1:36 | 4:05 | 5:46 | 6:36 | 7:24 | 27 | 26 |
| alternative | 1:16 | 1:25 | 3:50 | 7:43 | 8:32 | 9:17 | 25 | 23 |
| watch | 3:03 | 3:05 | 5:46 | 10:20 | 11:01 | 11:49 | 23 | 22 |

Dritte Turmgrafikstufe im Modell nach 8:56 / 10:49 / 13:26. Die frühe Werkstatt bleibt in den beiden aktiven Varianten innerhalb von 90 Sekunden. Erstes Lager im Bereich 3:50–5:46. Der Bosszeitpunkt reicht von 5:46 bis 10:20; starke Platzierung darf das ursprüngliche Ziel 7–10 Minuten unterschreiten. Lichtung und Werkstatt II können entsprechend früher kommen. Keine künstlichen Zeitbarrieren. [Rohdaten nachher samt Käufen](b13-after.json).

Die alternativen Käufe und das anfängliche Zuschauen erzeugen keine dauerhafte Sackgasse. Sie sind nicht gleich schnell: Die beobachtende Variante steht nach 15 Minuten erst vor dem zweiten Boss. Schlechteste Einzelkaufabstände liegen je nach Variante noch bei etwa 2½–3 Minuten; das sind Abstände zwischen Käufen während weiterlaufender Kämpfe, keine gemessene Pflicht-Inaktivität.

## Echter Browserdurchlauf und Rückkehr

Ein zusammenhängender Browserdurchlauf: **900.75 Sekunden Spielzeit bei 1×**, 903.22 Sekunden reale Zeit zuzüglich separat gemessener **970 ms Ladezeit**. Die Tabelle zeigt die erste gespeicherte Beobachtung je Meilenstein; durch Abtasten und UI-Bedienung liegt sie bis wenige Sekunden nach dem eigentlichen Kauf. Keine beschleunigte Browseruhr, keine vorgefüllte Währung. [Minutenprotokoll und UI-Befehle](b13-browser.json) · [vollständiger Endspielstand](b13-browser-save.json).

| Meilenstein | Beobachtete Spielzeit |
| --- | --- |
| Werkstatt I | 1:21 |
| Frostfassung / Wisp | 1:40 |
| Vorratslager | 4:10 |
| Boss 15 | 5:50 |
| Optionale Lichtung | 6:44 |
| Werkstatt II | 7:35 |
| Boss 25 | 13:28 |

Nach 15 Minuten: **Welle 26 besiegt, Welle 27 aktiv**, beide Bosse besiegt, Farmwelle 24, 1.135 Gold. Waldwächter Level 9/9, Frost 3, Steinschleuder 7, Scharfschütze 5. Der zweite Boss benötigte einen erneuten Vorstoß. Kein Seitenfehler oder fehlgeschlagener Ressourcenabruf im Lauf. Die ersten 90 Sekunden wurden damit auf der finalen Kampf-/Wirtschaftskurve erneut im echten Browser gespielt.

[Erste Minute](b13-minute1.png) · [Werkstatt](b13-workshop.png) · [erster Boss besiegt](b13-boss.png) · [Lichtung geöffnet](b13-clearing.png).

![Regulärer Spielstand nach 15 Minuten](b13-minute15.png)

Für die Rückkehr wurde exakt dieser erspielte Save in einen eigenen Probe-Slot übernommen und ausschließlich der Abwesenheitsbeginn um eine Stunde zurückgesetzt. **Simulierte Abwesenheit**, anschließend echte UI-Aktionen im finalen Build. Farmbasis: 2.311,9 G/min, Lager 65 %, Limit acht Stunden. Das Rückkehrfenster zeigte rund **90.186 Gold**; die Zeit bis zum tatsächlichen Einsammeln zählt zusätzlich mit. Keine nachträglich erfundene Farmrate und keine erzwungenen Bosssiege. Nach einmaligem Claim war die ausstehende Belohnung gelöscht.

Danach regulär gekauft und gespeichert: Steinschleuder **7→8**, Scharfschütze **5→6**, Waldwächter **9→10**. Der Kampf lief weitere 19.075 Sekunden weiter. [Rückkehrprotokoll](b13-return.json) · [Rückkehrfenster](b13-return.png) · [danach gekaufte Verbesserungen](b13-return-purchases.png).


## Kompakte Prüfung

- `npm run idle:build`: TypeScript und Produktionsbuild bestanden; finales Spielbundle `battle-CTw5Oimz.js`.
- `npx tsx --test experiments/idle-bastion/tests/balance.test.ts experiments/idle-bastion/tests/enemies.test.ts experiments/idle-bastion/tests/offline.test.ts`: **24/24 bestanden**, rund 3,4 Sekunden Testlauf. [Ausgabe](b13-tests.txt). Die erste Farm-Regressionsfixture wurde präzisiert: Ein Upgrade des Startturms kann Welle 1 tatsächlich zur besten Goldrate machen; die endgültige Fixture prüft einen anderen Turm und die echte Wiederprüfung einer älteren sicheren Welle.
- Die normale Browserfassung des 15-Minuten-Laufs enthält dieselben finalen Kampf-/Wirtschaftsregeln; währenddessen wurde nur die Zielauswahl und der Erklärungstext finalisiert. Die anschließende Rückkehrprobe verwendet den finalen Build.
- Keine komplette Alt-Testmatrix, kein zweiter langer Browserlauf und keine erneute Mobile-Matrix. Diese Änderung betrifft Balance, Migration und Zielauswahl. B14 behält seine separaten Speicher-/Langzeitprüfungen.

Modellvarianten reproduzieren: `npx tsx experiments/idle-bastion/tests/helpers/measure-balance.ts`.

Browser reproduzieren: `node node_modules/vite/bin/vite.js preview --config experiments/idle-bastion/vite.config.ts --port 5191 --host 127.0.0.1`, danach `npx tsx experiments/idle-bastion/tests/browser/b13-playthrough.ts`. Playwright muss verfügbar sein; alternativ `PLAYWRIGHT_MODULE` auf dessen installierte ESM-Datei setzen. Anschließend `npx tsx experiments/idle-bastion/tests/browser/b13-return.ts`. Letzteres übernimmt nur den tatsächlich gespeicherten 15-Minuten-Stand und stellt eine Stunde Abwesenheit nach.

## Spielgefühl und die drei wichtigsten Grenzen

Der Einstieg zeigt schnell einen bezahlbaren Bau und eine sichtbare Technologie. Die Werkstatt eröffnet eine neue Turmrolle; das Lager macht die Rückkehr wertvoll. Rüstung, Schwärme und Heilung geben den vier Türmen verschiedene Aufgaben. Die neue Kurve verhindert den beobachteten frühen Stillstand, und Level 7 wird innerhalb der Sitzung als sichtbarer Ausbau erreichbar. Die Lichtung bleibt eine optionale Investition in Platz, nicht eine Voraussetzung für bessere Türme.

1. **Timing hängt stark von der Platzierung ab.** Gute Überlappung beschleunigt die frühen Meilensteine deutlich. Einzelne Sparphasen dauern weiterhin mehrere Minuten. Echte Nutzerproben müssen zeigen, ob Hinweise und Rückmeldung für weniger zielgerichtete Käufer genügen.
2. **Nach den zwei Bossbegegnungen fehlt ein neuer Spielanlass.** Welle 25 nutzt dieselbe Bossfigur mit stärkerer Begleitung. Die östliche Lichtung hat noch keinen Dungeon-/Herausforderungszugang. Diese Inhalte sind keine versteckten vorhandenen Funktionen.
3. **Langzeitbalance ist noch offen.** Stündlicher Offline-Ertrag erlaubt viele Käufe, während Turmlevel 20, Gegnerzahl und HP-Skalierung begrenzt sind. B13 belegt den Einstieg und eine Rückkehr; es belegt keine ausgeglichene unendliche Progression. B14 prüft technische Langzeitgrenzen, nicht hunderte Stunden Endspiel.

## Veröffentlichung

Codecommit **`3ffd64b`** gepusht. [Pages-Lauf 39245665113](https://github.com/emfau88/TD/actions/runs/39245665113) erfolgreich; bestehendes Spiel und Idle-Slice im Workflow gebaut. Öffentlicher [Playlink](https://emfau88.github.io/TD/idle-bastion/) lädt das erwartete Bundle `battle-CTw5Oimz.js`, Canvas und Chronik mit B13-Ertragsbeschreibung. Keine Seiten-/Ressourcenfehler. [Öffentlicher Prüfnachweis](b13-public.json).

Visueller Restbefund: In den Aufnahmen beim Werkstattbau und nach den Rückkehrkäufen ist oben mittig ein leerer dunkler Balken sichtbar; in der Aufnahme bei Minute 15 fehlt er. Die Ursache wurde in B13 nicht isoliert. Für die Darstellungsprüfung in B14 vorgemerkt; die B13-Aussage „keine Seitenfehler“ bezieht sich auf JavaScript-/Ladefehler, nicht auf vollständige grafische Fehlerfreiheit.
