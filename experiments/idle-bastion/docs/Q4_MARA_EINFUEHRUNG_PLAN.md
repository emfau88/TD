# Q4 · Mara-Einführung — Umsetzungsplan

Stand: 25.10.2026 · geprüfte Basis: `main` / `be155d868217fcaea150a7436047597757a54641`.

**Aktueller Auftrag: Q4 vollständig umsetzen, prüfen, committen und auf `codex/q4-mara-introduction` pushen.** Der Nutzer hat die Umsetzung einschließlich Imagegen ausdrücklich freigegeben und weitere Konzept-/Zwischenfreigaben aufgehoben. Qualität und Konsistenz gehen vor drei neuen Bildern; falls nötig vorhandenes Porträt verwenden und Einschränkung dokumentieren. **Aktualisierung 25.10.2026: direkter Merge ausdrücklich freigegeben („ja dann merge einfach direkt mit“). Nach Commit/Push nach main übernehmen und Veröffentlichung prüfen. Offline-Mara bleibt separat.**

Die [Roadmap](../ROADMAP.md) bleibt die zentrale Projektübersicht für Reihenfolge und Paketstatus. Dieses Dokument enthält die detaillierten Arbeitsschritte und Abnahmekriterien für Q4. Erledigte Punkte erst nach tatsächlicher Prüfung abhaken; Nachweise direkt beim jeweiligen Bulk verlinken. Eine technische Prüfung ersetzt keine visuelle Nutzerfreigabe.

## Laufender Arbeitsstand

- **Bulk 0–4 erledigt:** Auftrag/Plan, gemeinsame Mara-Vorlage, drei Exporte, Dialog/Introfortschritt, Kamera und Tutorialanschluss.
- **Bulk 5 abgeschlossen:** Szenen/Reloads in DE/EN, Skip, Sprache, Orientierung, kleines Smartphone, reduzierte Bewegung, Bild-/Speicherfehler, Altstände und vollständiger Tutorialanschluss bis Frost bestanden. Produktionsmessungen und finale Bilder einschließlich mobiler Kernleben liegen vor.
- **Nutzerkorrektur übernommen:** Schal am rechten Halsbereich geschlossen und anatomisch nachvollziehbar um den Nacken geführt; störenden goldenen oberen Strich entfernt. Alle drei Exporte aus korrigierter gemeinsamer Vorlage (`*-v2-source.png`).
- **Kartenrand behoben:** Intro-Headroom außerhalb der Karte zeigte grünen Renderer-Hintergrund. Sichtbaren Kartenausschnitt auf echte Kartenfläche begrenzt; neue Hochkantaufnahmen ohne diese Streifen geprüft. Reguläre Q3-Kampf-/Baukamera bleibt erhalten.
- **Weitere Nutzeranpassung (25.10.):** Lebensanzeige auf schmalen mobilen Ansichten direkt unter dem tatsächlichen Kern statt schwebend bei `Header + 52 px`. Phaser-Text wandert mit der Karte, Desktop-HUD und Lebensregeln bleiben erhalten. Betroffene Screenshots erneuert; Kernanker, konstante Lesbarkeit, offscreen Verhalten und Desktop-HUD geprüft.
- **Technischer Zwischenstand:** Produktionsbuild bestanden; 343 Tests / 326 bestanden / 17 bekannte Altfehler. Der Namensvergleich bestätigt exakt dieselben Altfehler; keine neuen Fehler. Zusätzliche finale Session-/Introprüfung: 32/32.
- **Bulk 6 läuft:** Commit/Push, ausdrücklich freigegebene Integration nach main und Veröffentlichungsprüfung. [Fertiger Bericht, Bilder, Video und Testnachweise](../../../artifacts/idle-bastion/acceptance/q4-mara-introduction/REPORT.md).

## Ziel und verbindlicher Umfang

- Drei kompakte, vom Spieler weitergeschaltete Szenen auf der echten Spielkarte: Kern/Begrüßung → Gegnereingang/Weg → erster Waldwächter.
- Eure unten festgehaltenen DE-/EN-Texte wortgetreu verwenden. Rund 20–30 Sekunden bleiben ein Gestaltungsziel, kein Timer oder Zeitlimit.
- Drei neue, konsistente Mara-Dialogporträts auf einer gemeinsamen Masterbüste: einladend, konzentriert-zuversichtlich, verschmitzt. Drei Varianten sind im aktuellen Umsetzungsauftrag freigegeben.
- Sofort vollständig sichtbare Texte und Porträts, jederzeit Weiter/Überspringen; keine Schreibmaschinenanimation und keine künstliche Wartezeit.
- Möglichst nur eine größere, kontrollierte Kamerafahrt vom Kern zum Eingang; danach nahtlos in das bestehende Baututorial.
- Q3 ist bereits umgesetzt: Waldwächter (10,5), Frostkristall (8,5). Ziele trotzdem aus den tatsächlichen Spieldaten ableiten.
- Kampfregeln, Preise, Wirtschaft, Freischaltungen und Kampfspeicherformat erhalten. Keine Änderung an Mara-Bewegung, Fähigkeiten oder Tavernenanimationen.
- Offline-Mara bleibt ein separates Folgepaket; sie ist keine Voraussetzung für die Q4-Abnahme.

## Bulks und Freigabepunkte

| Bulk | Ergebnis | Voraussetzung / Abschluss |
| --- | --- | --- |
| 0 · Plan festlegen | Umfang, Darstellung und Asset-Plan verbindlich | Nutzerfreigabe des endgültigen Plans und Auftrag für die nächste Phase |
| 1 · Masterbüste | Eine konsistente Mara-Grundlage in tatsächlicher Anzeigegröße | Interne Prüfung der Masteransicht; Zwischenfreigabe ausdrücklich entfallen |
| 2 · Porträtset | Drei zusammengehörige, optimierte Ausdrücke | Interne Konsistenzprüfung; gemeinsam mit Ingame-Ergebnis zur Schlussprüfung |
| 3 · Dialog und Fortschritt | Drei bedienbare Szenen mit sicherem Speichern/Überspringen | Funktionsprüfung im isolierten Arbeitsbranch |
| 4 · Kamera und Tutorialanschluss | Richtige Kartenziele und störungsfreier Übergang zum Bau | Echter Ablauf einschließlich Q3-Kamera geprüft |
| 5 · Tests und Ingame-Abnahme | Desktop-/Mobilnachweise und dokumentierte Regressionen | Nutzer beurteilt echte Ingame-Aufnahmen |
| 6 · Abschluss und Veröffentlichung | Geprüfter, ausdrücklich freigegebener Stand auf main | Eigene Merge-Freigabe erforderlich |

### Bulk 0 · Plan und Asset-Umfang festlegen

- [x] Drei Szenen und vereinfachte Kameraführung durch den Nutzer grundsätzlich bestätigt.
- [x] Verbindliche DE-/EN-Dialoge vom Nutzer erhalten und unten festgehalten.
- [x] Bestehende Quellen, Onboarding, Kamera und Offline-Regeln rein lesend untersucht.
- [x] Diesen Detailplan mit Bulks und Abnahmekriterien im Projekt abgelegt.
- [x] Endgültige Porträtanzahl, Zielgrößen und Darstellungsplan bestätigen: idealerweise drei konsistente Bilder, vorhandenes Porträt als zulässiger Qualitätsfallback.
- [x] Geplante Anschlusskorrekturen der bestehenden Tutorialtexte bestätigen.
- [x] Ausdrücklichen Auftrag zur Asset- und Implementierungsphase erhalten; keine erneute Zwischenabnahme erforderlich.

**Freigabenachweis:** Nutzerauftrag vom 24.10.2026: „Du kannst jetzt mit der Umsetzung beginnen“, Imagegen erlaubt, Commit/Push nur auf Arbeitsbranch, abschließende Ingame-Sichtprüfung vor Merge.

### Bulk 1 · Quellen und gemeinsame Masterbüste

**Maßgebliche Grundlagen:** [Quellensicherung](../../../artifacts/idle-bastion/TAVERN_BACKUP_CURRENT.md), [finale Mara-Proportionen](../../../artifacts/idle-bastion/mara-proportions-v1/idle-rig/README.md), [abgestimmte Reaktionen M01–M08](../../../artifacts/idle-bastion/mara-proportions-v1/reactions-v1/README.md).

- [x] Nach Beauftragung erforderliche LFS-Quelldateien bereitstellen; Originale und vorhandene Exportstände erhalten.
- [x] Aktuelle freigegebene Mara als verbindliche Identitätsreferenz auswählen: aktuelles Tavernenporträt und finale `ProportionsNative`-Quellen; ältere Darstellungen nicht vermischen.
- [x] Gemeinsame Kopf-/Schulteransicht mit festem Ausschnitt, Kopfgröße, Blickrichtung, Beleuchtung, Kontur, Pixelraster und Palette vorbereiten.
- [x] Haare, Kleidung, Schmuck, Schultern und Körperproportionen als gemeinsame Grundlage fixieren.
- [x] Masteransicht neben bestehender Mara sowie in geplanter Desktop- und Mobilgröße zeigen; Wirkung auf dunklem Dialoghintergrund prüfen.
- [x] Zwischenfreigabe gemäß aktuellem Auftrag entfallen; Master intern gegen vorhandene Mara prüfen.

**Ergebnis:** bearbeitbare Masterdatei, Referenzen und Größenvergleich. Noch keine Spielintegration.

**Nachweis:** [Porträtquellen und Exportbericht](../../../artifacts/idle-bastion/q4-mara-portraits/README.md). Drei WebP-Dateien, zusammen 80.672 Bytes; Originale erhalten. Keine zusätzliche LFS-Datei erforderlich: vorhandenes finales Tavernenporträt ist die gemeinsame Referenz. Finale Nutzerbewertung bleibt nach Ingame-Lieferung offen.

### Bulk 2 · Drei konsistente Dialogporträts

| Variante | Ausdruck | Verwendung |
| --- | --- | --- |
| Einladend | Offener Blick, warmes, zurückhaltendes Lächeln | Szene 1 |
| Konzentriert-zuversichtlich | Wacher Blick, ruhige Entschlossenheit | Szene 2 einschließlich des Niederlagensatzes |
| Verschmitzt | Leicht angehobene Augenbraue, kleines selbstbewusstes Grinsen | Szene 3; später eventuell Offline-Mara |

- [x] Die drei Ausdrücke aus derselben freigegebenen Masterbüste entwickeln; keine unabhängig neu erzeugten Figuren.
- [x] Änderungen auf die Mimik begrenzen: Augen, Lider, Brauen, Mund und notwendige Gesichtsschattierung.
- [x] Varianten nebeneinander und durch Überlagerung prüfen; Drift bei Kleidung, Schmuck, Haaren, Silhouette oder Proportionen korrigieren.
- [x] Erkennbarkeit der Ausdrücke in tatsächlicher Mobilgröße beurteilen; keine nur bei Vergrößerung sichtbaren Unterschiede akzeptieren.
- [x] Transparente WebP-Exporte vorbereiten; 272 × 320 px entsprechend dem bestehenden Seitenverhältnis als Exportgröße anhand der Anzeigegrößen prüfen.
- [x] Gesamtumfang von ungefähr 150–300 KB für drei Laufzeitbilder anstreben; Kompression visuell prüfen, Qualität vor starrer Dateigröße.
- [x] Quellen, Bearbeitungsschritte und Exportparameter dokumentieren; gemeinsame Anker gegen Bildsprünge prüfen.
- [x] Set intern prüfen; endgültige Nutzerbewertung erfolgt mit den Ingame-Aufnahmen.

**Optional, nicht Bestandteil dieses ersten Sets:** aufmunternde vierte Variante bei einem tatsächlich beauftragten Niederlagendialog. Eine fünfte selbstzufriedene Variante ist derzeit nicht erforderlich; sie überschneidet sich mit „verschmitzt“.

**Nachweis:** [Porträtquellen und Exportbericht](../../../artifacts/idle-bastion/q4-mara-portraits/README.md). Drei WebP-Dateien, zusammen 80.672 Bytes; Originale erhalten. Keine zusätzliche LFS-Datei erforderlich: vorhandenes finales Tavernenporträt ist die gemeinsame Referenz. Finale Nutzerbewertung bleibt nach Ingame-Lieferung offen.

### Bulk 3 · Dialogoberfläche und gespeicherter Introfortschritt

Voraussetzung: erfüllter ausdrücklicher Implementierungsauftrag; keine Zwischenfreigabe erforderlich. Auf einem isolierten `codex/`-Branch vom dann aktuellen `main` arbeiten.

- [x] Vorhandene `welcome`-Phase um drei Präsentationsschritte erweitern; währenddessen im Kampfmodell in `welcome` bleiben.
- [x] Eine zuständige Onboarding-Darstellung verwenden; keine zweite parallel aktualisierte Begrüßung aufbauen.
- [x] Die verbindlichen Texte, Buttons, Anzeige 1/3–3/3 und „Intro überspringen / Skip intro“ vollständig DE/EN einbinden.
- [x] Desktop-/Mobillayout nach den unten beschriebenen Zielgrößen umsetzen; gesamten Text unmittelbar anzeigen.
- [x] Während des Intros den noch unbenutzten Baukatalog ausblenden und konkurrierende Bau-/Kartenaktionen sperren; Sprach-/Audioeinstellungen erreichbar halten.
- [x] Drei kleine Porträts während des vorhandenen Q1-Ladevorgangs vorbereiten und dekodieren; keinen Tavernenplayer oder Animationsatlas dafür laden.
- [x] Bei Bildfehlern eine bereits verfügbare Mara-Darstellung verwenden; Bedienung darf dadurch nicht hängen bleiben.
- [x] Neue und geladene Partien über eine Laufzeitinformation aus `BattleSession.open()` unterscheiden; kein neues Feld im Kampfsnapshot.
- [x] UI-Status je Spielslot speichern: Version, aktuelle Szene und aktiv/abgeschlossen, analog zu den vorhandenen Q2-Präferenzen.
- [x] Nur bei tatsächlich neu angelegter Partie einen neuen Introstatus setzen; alte Spielstände ohne Status nicht nachträglich einführen.
- [x] Reload, Wiederherstellung und fehlende Präferenzspeicherung gemäß der Zustandstabelle unten behandeln.
- [x] Abschließen/Überspringen zuerst über den vorhandenen gespeicherten Übergang `welcome → build` bestätigen; erst anschließend UI-Status abschließen.
- [x] Mehrfachklicks und Schreibfehler absichern; `skipLessons()` für Intro-Überspringen nicht verwenden.

**Ergebnis:** drei vollständig bedienbare Szenen, sicherer Fortschritt und erhaltenes nachfolgendes Tutorial.

**Nachweis:** Implementiert und erste Browserprüfung bestanden; `qa/q4-mara-introduction/browser/checks.json` (Desktop/Hochkant, DE/EN, alle Szenen-ReLoads), `tests/mara-intro.test.ts` (7/7), kompletter Anschluss bis Frost in `qa/q4-mara-introduction/tutorial/checks.json`. Abschließende Robustheitsprüfung und gebündelter Lieferbericht folgen in Bulk 5.

### Bulk 4 · Kamera, Marker und Anschluss an Q3

- [x] Kernziel aus `layout.core`, Eingang/Weg aus `layout.road`, Startturmziel aus `recommendedStarterPad` ableiten.
- [x] Tatsächliche Dialoghöhe, Header, sichere Bildschirmränder und Pixeldichte für den freien Kartenausschnitt berücksichtigen.
- [x] Kern vor Freigabe der ersten Spielansicht passend rahmen; keinen sichtbaren Sprung aus dem bisherigen Startausschnitt erzeugen.
- [x] Eine kontrollierte Fahrt von Szene 1 zu Szene 2 mit weichem Start/Ende implementieren; auf Hochkant zunächst ungefähr 1,0–1,3 Sekunden vorsehen und visuell beurteilen.
- [x] Weiterklicken, Überspringen und Bildschirmdrehung müssen laufende Fahrten abbrechen; keine Bewegungen oder veralteten Abschlussaktionen aufstauen.
- [x] Szene 2 und 3 verwenden möglichst denselben Ausschnitt mit Eingang und Q3-Startplatz; keine weitere große Fahrt.
- [x] Kernring, Spawnrichtung, wenige dezente Wegpunkte und Bauplatzkreis mit vorhandenen Phaser-/UI-Mitteln darstellen.
- [x] Normale Lernpfeile während des Intros unterdrücken; nach Übergabe Intro-Markierungen entfernen und bestehende Lernführung freigeben.
- [x] Reduzierte Bewegung unterstützen: direkte Kamerapositionierung, statische Markierungen, keine dekorativen Pulse erforderlich.
- [x] Bei Abschluss/Überspringen zuverlässig den bestehenden Tutorialausschnitt und den echten Baukataloghinweis wiederherstellen.
- [x] Vorhandene Ready-/Kampftexte gemäß Anschlussvorschlag unten bereinigen; spätere Mara-Zaubereinführung erhalten.

**Ergebnis:** Kern, Eingang und Bauplatz sind in jeder Szene sichtbar; vollständige Übergabe an den normalen Bauablauf.

**Nachweis:** Implementiert und erste Browserprüfung bestanden; `qa/q4-mara-introduction/browser/checks.json` (Desktop/Hochkant, DE/EN, alle Szenen-ReLoads), `tests/mara-intro.test.ts` (7/7), kompletter Anschluss bis Frost in `qa/q4-mara-introduction/tutorial/checks.json`. Abschließende Robustheitsprüfung und gebündelter Lieferbericht folgen in Bulk 5.

### Bulk 5 · Technische Prüfung und echte Ingame-Abnahme

- [x] Neue Partie vollständig durchspielen; jede Introszene nach Reload prüfen.
- [x] Weiterklicken und Überspringen aus allen Szenen prüfen, auch mitten in einer Kamerafahrt und bei schnellen Mehrfachklicks.
- [x] Alte Saves in `welcome`, `build`, laufender Anleitung und fortgeschrittenem Spiel sowie Sicherungswiederherstellung prüfen.
- [x] Speicherfehler, blockierte UI-Präferenzen, erneutes Booten und Tab-Eigentümerschaft prüfen; keine Doppelbegrüßung oder beschädigte Partie.
- [x] DE/EN einschließlich Sprachwechsel während des Intros prüfen; keine fehlenden Übersetzungen oder abgeschnittenen Texte.
- [x] Desktop 1280 × 800, Smartphone 390 × 844 und mindestens ein kleineres Format prüfen; Drehung und unterschiedliche Pixeldichten berücksichtigen.
- [x] Reduzierte Bewegung, Tastaturbedienung, sichtbaren Fokus und ausreichend große Touchflächen prüfen.
- [x] Leeren/warmen Browsercache und Porträt-Ladefehler prüfen; übertragene Porträtgröße und fehlende Tavernenatlas-Downloads dokumentieren.
- [x] Echten Anschluss bis zum kostenlosen Waldwächter, ersten Upgrade, Werkstatt, Forschung und Frost prüfen; Q3-Positionen und Kamera erhalten.
- [x] Produktionsbuild und relevante Regressionstests ausführen; bekannte Altfehler von neuen Problemen getrennt ausweisen.
- [x] Echte Ingame-Screenshots aller drei Szenen auf Desktop und Smartphone erstellen; zusätzlich Übergang zum ersten Bau und eine kurze Aufnahme der Kamerafahrt vorlegen.
- [x] Nutzerfeedback einarbeiten und die visuelle Ingame-Abnahme dokumentieren.

**Bekannte Ausgangslage, kein Ergebnis von Q4:** Auf Basis `be155d8` bestanden 319/336 Tests; 17 bekannte Altfehler waren getrennt dokumentiert. Vor Q4-Abschluss mit dem dann aktuellen Ausgangsstand vergleichen.

**Nachweis:** [Umsetzungs- und Abnahmebericht](../../../artifacts/idle-bastion/acceptance/q4-mara-introduction/REPORT.md). Nutzerkorrekturen an Schal/Kette, grünem Rand und mobiler Kernlebenanzeige eingearbeitet. Der Nutzer hat anschließend den direkten Merge am 25.10. ausdrücklich freigegeben; keine weitere Zwischenfreigabe ausstehend.

### Bulk 6 · Abschluss und Veröffentlichung

- [x] Umsetzungsbericht, Assetquellen, tatsächliche Testergebnisse und offene Einschränkungen vervollständigen; Roadmap aktualisieren.
- [ ] Nach entsprechender Beauftragung Änderungen auf dem Arbeitsbranch committen und pushen; Commit-SHA dokumentieren.
- [x] Ausdrückliche Freigabe des endgültigen Merge erhalten: Nutzer am 25.10. „ja dann merge einfach direkt mit“.
- [ ] Erst nach dieser Freigabe den aktuellen Main-Stand prüfen und den freigegebenen Umfang integrieren.
- [ ] Veröffentlichung und öffentlichen Spielstart einschließlich Desktop-/Mobilprobe prüfen.

**Merge-Freigabe:** erteilt am 25.10.2026. **Commit/Veröffentlichung:** in Arbeit; Nachweis wird nach erfolgreicher Übernahme ergänzt.

## Verbindliche Dialoge und Szenen

### Szene 1 · Willkommen

**Bild:** Einladendes Porträt; echte Karte mit bereits sichtbarem Kern und dezentem goldenem Ring.

**DE:** „Ah, da bist du ja! Ich bin Mara. Willkommen im alten Hain. Den Kern dort müssen wir beschützen. Eigentlich ist es hier ziemlich friedlich. Eigentlich.“

**EN:** “Ah, there you are! I'm Mara. Welcome to the Old Grove. We need to protect that core. It's usually quite peaceful here. Usually.”

**Button:** Weiter / Continue.

### Szene 2 · Gegner und Niederlagen

**Bild:** Konzentriert-zuversichtliches Porträt; Kamera führt zum Eingang, Richtungshinweis und dezente Punkte markieren den tatsächlichen Weg. Auf Hochkant genügt die verständliche Darstellung der sichtbaren Wegabschnitte; keine zusätzliche Fahrt entlang des gesamten Weges.

**DE:** „Die Angreifer kommen von hier und folgen dem Weg zum Kern. Eine verlorene Welle? Dein Ausbau bleibt erhalten. Wir verstärken die Türme und versuchen es wieder.“

**EN:** “Enemies enter here and follow this path to the core. Lose a wave? What you've built stays. We strengthen the towers and try again.”

**Button:** Verstanden / Got it.

### Szene 3 · Unsere erste Verteidigung

**Bild:** Verschmitztes Porträt; möglichst derselbe Eingangsbereich, goldener Kreis am tatsächlich empfohlenen Waldwächterplatz. Wegmarkierungen treten zurück.

**DE:** „Du baust die Türme, die kämpfen von allein. Und ich? Ich habe noch ein paar Zauber im Ärmel. Aber eins nach dem anderen – fangen wir mit deinem Waldwächter an!“

**EN:** “You build the towers, and they fight on their own. And me? I've got a few spells up my sleeve. But one thing at a time—let's start with your Grove Warden!”

**Button:** Ersten Turm bauen / Build your first tower.

Der Button führt zur bestehenden Führung über die tatsächliche Waldwächterkarte im Katalog; er baut keinen Turm automatisch. Gold, Upgrade und Werkstatt werden weiterhin erst bei Relevanz erklärt.

## Darstellung und Assetvertrag

| Ansicht | Platzierung und Richtwerte |
| --- | --- |
| Desktop, etwa 1280 × 800 | Unten mittig, 620–680 px breit und etwa 230–270 px hoch; Porträt links 128 × 160 px, Text rechts, Aktionen darunter. |
| Smartphone, etwa 390 × 844 | Unten mit 8–12 px Seitenabstand, etwa 240–280 px hoch; Porträt ca. 88 × 110 px, Fließtext 16 px, Button mindestens 44 px hoch. |
| Kleine / flache Displays | Zuerst Porträt und Abstände kompakter, bei Bedarf Text über volle Kartenbreite. Tatsächliche Textmenge bestimmt die Höhe; keine abgeschnittenen Texte. |

Vorhandene Wald-/Anthrazitflächen, Messingrahmen, Goldbutton und Schriften nutzen. Kartenhöhe möglichst an der längsten Szene ausrichten und nach Sprach-/Formatwechsel neu bestimmen. Unverzichtbar sind sofort lesbarer Text, ein deutlich erkennbares Gesicht und freie Sicht auf das jeweilige Kartenziel. Neue Markierungsbilder, zusätzliche Soundproduktion und eine animierte Dialogfigur sind nicht erforderlich.

Geplante neue Laufzeitassets: drei statische transparente WebP-Porträts, vorzugsweise unter `assets/intro/mara/`. Vorhandenes aktuelles Porträt: `assets/tavern-rig/mara-portrait.webp` (272 × 320 px, rund 93 KB). Bearbeitbare Masterdatei, Quellen und Referenzvergleich getrennt von den kleinen Laufzeitdateien erhalten. Endgültige Dateinamen und Exportgröße beim Assetabschluss festlegen.

## Zustandsregeln für Speichern und Fortsetzen

| Situation | Verhalten |
| --- | --- |
| Neue Partie erfolgreich angelegt | UI-Introstatus für diesen Spielslot auf Szene 1 setzen. |
| Reload mit aktivem Q4-Status und Kampfphase `welcome` | Gespeicherte Szene und deren Kartenziel wiederherstellen. |
| Alter Save ohne Q4-Status, auch in `welcome` | Keine neue Drei-Szenen-Einführung starten; bisherigen Einstieg fortsetzen. |
| Kampfphase bereits `build` oder später | Intro geschlossen halten; veralteter UI-Status darf es nicht wieder öffnen. |
| Wiederherstellung eines Sicherungsstands | Q4-UI-Status konservativ verwerfen; keine neue Sequenz erzwingen. |
| UI-Präferenzen nicht verfügbar | In der aktuellen Sitzung bedienbar bleiben; nach Reload keine neue Introberechtigung erfinden. |
| Abschluss oder Überspringen | Erst vorhandenen Übergang `welcome → build` erfolgreich speichern, dann UI-Status abschließen. Bei Schreibfehlern bestehende Fehlerbehandlung verwenden. |

Kein Einsatz von `skipLessons()` für „Intro überspringen“. Kein Schemawechsel im Kampfsnapshot. Der UI-Status ist keine neue wirtschaftliche Transaktion und verändert keine Offline-Ansprüche.

## Anschlusskorrekturen am bestehenden Tutorial — zur Planfreigabe

Die bisherige Ready-Erklärung wiederholt automatisches Kämpfen und verspricht unmittelbar Maras Magie. Geplanter Ersatz:

**DE:** „Dein Waldwächter steht. Starte die Verteidigung, wenn du bereit bist.“

**EN:** “Your Grove Warden is in place. Start the defense when you're ready.”

Geplanter Titel des folgenden Kampfhinweises: **„Dein erstes Gefecht / Your first battle“**. Die konkrete bestehende Gold-/Upgrade-Anleitung bleibt erhalten. Maras tatsächliche Zaubereinführung findet weiterhin an ihrer bestehenden späteren Stelle statt.

## Geplante Codebereiche

Alle folgenden Spielpfade liegen unter `experiments/idle-bastion/`. Neue Dateinamen sind Vorschläge, noch keine angelegten Implementierungsdateien.

| Bereich | Geplante Dateien / Änderung |
| --- | --- |
| Präsentation | Neues `src/intro-presentation.ts`: drei Szenen, UI-Fortschritt, Überspringen und Übergabe. |
| Gestaltung | Neue `src/intro-presentation.css`, bestehendes Onboarding-Markup in `index.html`; vorhandene Gestaltungselemente weiterverwenden. |
| Tutorial | `src/onboarding-ui.ts`: neue Begrüßungsdarstellung und bereinigte Anschlussformulierungen. |
| Integration | `src/main.ts`: Startberechtigung, Ladeanschluss, Buttons, Sprachwechsel und Abschluss. |
| Session | `src/battle-session.ts`: Laufzeitinformation über neue/geladene Partie und Wiederherstellung; kein neues Kampfspeicherfeld. |
| Kamera | `src/battle-scene.ts`, bei Bedarf gemeinsame Geometrie in `src/tutorial-camera.ts`; bestehende Q3-Funktionen erhalten. |
| Ressourcen / Sprache | Statische Porträts und Ladeanbindung über `src/art.ts` bzw. vorhandenen Ladeablauf; Übersetzungen in `src/locales/en.ts`. |
| Prüfung / Dokumentation | Gezielte Intro-/Kameratests, Browserprüfung, phasenbezogene Nachweise und Roadmap-Pflege. |

## Aufwand und Grenzen

| Arbeit | Planungsschätzung |
| --- | ---: |
| Quellen, Masterbüste, drei Ausdrücke und Export | 1–2 Arbeitstage |
| Dialogoberfläche, UI-Fortschritt, DE/EN und Tutorialanschluss | 1–1,5 Arbeitstage |
| Kamera, Marker und responsive Anpassung | 0,5–1 Arbeitstag |
| Tests, Ingame-Aufnahmen und eine Korrekturrunde | 0,5–1 Arbeitstag |

**Planungsrahmen: etwa 4–6 Arbeitstage**, einschließlich einer normalen visuellen Korrekturrunde. Freigabewartezeiten und zusätzliche grundlegende Grafikrevisionen sind nicht enthalten. Eine vierte/fünfte Mimik oder ein neues Niederlagendialogsystem erweitert den Umfang und wird separat entschieden.

## Separates Folgepaket · Offline-Mara

**Nicht Bestandteil von Q4 und kein Hindernis für dessen Abschluss. Noch nicht zur Implementierung beauftragt.**

**DE:** „Wieder da? Deine bewährte Verteidigung hat während deiner Abwesenheit Gold verdient. Ich habe natürlich alles beaufsichtigt. Größtenteils.“

**EN:** “Back already? Your trusted defenses earned gold while you were away. I supervised everything, of course. Mostly.”

- [ ] Folgepaket separat beauftragen.
- [ ] Den Kommentar in die bestehende Rückkehranzeige einbinden; verschmitztes Porträt wiederverwenden, sofern passend.
- [ ] Nur bei tatsächlich positiver Offline-Belohnung anzeigen; den ungerundeten Anspruch prüfen.
- [ ] Einmalige Bestätigung je Spielslot erst an das erfolgreiche Einsammeln koppeln; wiederholtes Rendern darf keine neue Begrüßung starten.
- [ ] Vorhandene Angaben zu Farmbasis, angerechneter Zeit und Begrenzung erhalten; keine neuen Wellen-/Bossabschlüsse suggerieren.
- [ ] Vorhandene Offline-Berechnung und atomare Auszahlung erhalten; Nullertrag, Reload, Schreibfehler und doppelte Eingaben prüfen.
- [ ] DE/EN und Desktop/Hochkant abnehmen; Nachweise separat dokumentieren.

**Schätzung:** 2–4 Stunden einschließlich gezielter Prüfung, ohne neue Porträtproduktion.

## Nachweise beim Abarbeiten

Freigaben jeweils mit Datum und konkreter Nutzerentscheidung bei ihrem Bulk ergänzen. Für technische Prüfungen tatsächlichen Befehl, Ausgangscommit, Ergebnis und Abweichungen dokumentieren. Nur klar benannte Vorschauen als Grafikprobe bezeichnen; die abschließende UI-Abnahme verwendet echte Ingame-Aufnahmen.
