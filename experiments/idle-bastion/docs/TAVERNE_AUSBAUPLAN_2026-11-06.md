# Taverne: verständlicher Fortschritt, neue Animationen und vollständige Begegnungen

Erstellt: **06.11.2026**. **Umsetzung am 07.11.2026 mit „arbeite den Plan ab“ ausdrücklich beauftragt.** Die Pakete werden nacheinander umgesetzt und geprüft; die gewünschten visuellen Abnahmen neuer Clips bleiben erhalten.

Präzisierung auf Nutzerwunsch: **Die vertraute Tavernenoberfläche und ihre einfache Bedienung bleiben die Grundlage.** Die folgenden technischen Regeln und Inhaltslisten sind Arbeitsunterlagen, keine Vorlage für ein umfangreicheres Spielmenü.

Ursprüngliche Planungsbasis: Main `daf39fb7b13a05a78530b503fa45074b5f65c9de`. Die anschließende Umsetzung entstand isoliert auf `codex/tavern-comfy-integration` und wurde am 07.11.2026 mit Code `2913db03` nach Main übernommen. Der ältere Checkout im Projektwurzelverzeichnis bleibt davon getrennt; dort wird diese Dokumentation für den Nutzer mitgeführt.

Diese ausdrücklich gewünschte Markdown-Datei beschreibt Umfang und Abnahmekriterien in Paketen mit Checkboxen. Die [ROADMAP](../ROADMAP.md) bleibt die übergreifende aktuelle Statusliste. Plan und Roadmap werden auf zusätzlichen Nutzerwunsch während der Umsetzung aktualisiert. Offene Checkboxen bezeichnen noch nicht abgeschlossene Schritte; technische Ergebnisse und ausstehende Sichtabnahmen werden getrennt festgehalten.

## Aktueller Umsetzungsstand · 07.11.2026

- [x] MC03/Haarreaktion ausdrücklich vom Nutzer freigegeben. PC-Berührungsherzen verdoppelt, Touch-Größe erhalten; Ilyras vorhandenen Komplimentclip in der Figurengröße korrigiert und Original archiviert. Direkter „Besuch fortsetzen“-Knopf nach Fensterwechsel/Minimieren, mit regulärer einmaliger Offline-Gutschrift und weiterhin pausiertem Kampf. 39/39 gezielte Tests, Build, acht Ziel-/Reaktionsfälle und zwei Wiederaufnahmefälle bestanden. [Nachweis](../../../artifacts/idle-bastion/tavern-targets-2026-11-07/REPORT.md).
- [x] Als `2913db03` veröffentlicht und öffentlich geprüft: [Pages 42378344595](https://github.com/emfau88/TD/actions/runs/42378344595), vier Desktop-/Handyfälle beider Figuren und zwei Wiederaufnahmefälle bestanden. Normales Produktionsbuild, 30/30 Save-/Tavernen-Kompatibilitätstests sowie zwei echte Produktionsbrowserfälle mit beiden Figuren und Reload bestanden.
- [x] Vom Nutzer beauftragte Main-Übernahme abgeschlossen: Code `2913db03` per Fast-forward, [Pages 42380058567](https://github.com/emfau88/TD/actions/runs/42380058567) erfolgreich. Öffentliche Hauptversion DE/Desktop und EN/Handy mit beiden Figuren, Berührungen, Kompliment und Reload geprüft; normale Speicherkennung und keine Browserfehler. Weitere Clips bleiben zurückgestellt. Die konkrete spätere Clipplanung steht in Abschnitt 5.4; Turmhinweise wurden separat ausschließlich untersucht.
- [ ] Direkte öffentliche Testlinks nach Main-Übernahme wiederherstellen: GitHub Pages bricht die Vorschau bei `syncing_files` nach 600 Sekunden ab ([Lauf 42381268263](https://github.com/emfau88/TD/actions/runs/42381268263)). Hauptspiel öffentlich geprüft und erreichbar; [lokaler Teststarter](http://127.0.0.1:5278/tavern-test.html) verfügbar. Öffentliche Vorschau derzeit HTTP 404; kein weiterer Versuch aktiv.

- [x] **Nachschliff aus dem Branch-Review lokal geprüft:** beide Antworten direkt in der vorhandenen unteren Leiste sichtbar; neue und begonnene Gespräche am Siedlungs-/Tavernenzugang und bei der Figur kenntlich. Neu wird erst beim tatsächlichen Gesprächsstart aufgehoben; Fortsetzen bleibt nach Reload. Acht echte Hauptspielfälle DE/EN, 32 Antwortauswahlen, 14/14 gezielte Tests und Build bestanden. Keine neue Menüebene oder Fortschrittsregel.
- [x] Als `f0709f85` unter demselben Testlink veröffentlicht; [Pages 42374351131](https://github.com/emfau88/TD/actions/runs/42374351131) erfolgreich. Öffentlich DE/EN bei 390×650 mit beiden Figuren und allen vier Begegnungen geprüft: acht Antwortauswahlen unmittelbar sichtbar, Fortsetzen/Reload und neutrale Beendigung korrekt. 721 Main-Dateien erhalten; menschliche Sichtabnahme bleibt offen.
- [x] **Mobile Nachbesserungen lokal geprüft:** konstante Figurfläche bei Herzaufstieg, persönlichen Momenten und Begegnungen; lokal scrollbare Texte/Antworten, feste Hochformatreserven. 128 Rig-Zustände und zehn echte Touch-Hauptspielfälle mit 180 Zuständen bestanden. Dunklen Kompliment-Sondereffekt durch normale Bildüberblendung ersetzt und für beide Figuren mit nativen Videoframes sowie sechs echten Hauptspielfällen geprüft. Produktionsbuild und aktualisierte README-Vergleichsbilder fertig.
- [x] Nachbesserungen als `46ee4286` unter demselben Testlink veröffentlicht, [Pages 42326182901](https://github.com/emfau88/TD/actions/runs/42326182901) erfolgreich. Öffentliche Version bestätigt: zwei mobile Figurenfälle / 36 Zustände ohne Größenwechsel und sechs echte Clipwechsel-Fälle / 921 Frames ohne dunkles Rechteck. Menschliche Sichtabnahme blieb damals offen; zu diesem Zeitpunkt noch kein Main-Merge.
**Zusätzlich beauftragt:** Stand auf `codex/tavern-comfy-integration` committen/pushen und isolierten öffentlichen Ingame-Test mit vorbereiteten Spielständen in der README verlinken. Teststarter, eigener Speichernamensraum und passende zufällige Reaktionssounds sind lokal fertig geprüft (531/531 Tests, Build, acht Ingame-Fälle); Branch-Vorschau veröffentlicht und öffentlich mit acht Ingame-Fällen geprüft; drei echte UI-Vorher/Nachher-Paare in der README eingebunden. [Test ohne Durchspielen](https://emfau88.github.io/TD/previews/tavern/tavern-test.html). Diese erste Testlieferung erfolgte noch ohne Main-Merge; die spätere Übernahme ist oben dokumentiert.

**Neue Priorität auf ausdrücklichen Nutzerwunsch:** Weitere Videoproduktion wird nach dem bereits laufenden MC03 zurückgestellt. MC01, MC05, MC02 und MC03 sind ausdrücklich freigegeben. MC04/MC06/MC07, Ilyras Fensterset und spätere Herz-5-/Outfitvideos vorerst nicht starten. Einzelbilder als mögliche spätere Alternative sind nur eine Idee, kein aktueller Generierungsauftrag. Die verbleibenden Bulks unten bleiben als Zukunftsplan erhalten; der Schwerpunkt liegt zunächst auf dem vorhandenen Herz-1–3-Bogen, Verständlichkeit und abschließender Prüfung. Herz 4/5 sind noch nicht neu spielbar freigeschaltet.

- [x] **Bulk 0 abgeschlossen:** Arbeitsbasis, Vergleichsaufnahmen und verifiziertes Altarchiv (6/6 Schritte).
- [ ] **Bulk 1 technisch abgeschlossen, visuelle Abnahme offen:** 15 Cliprollen/Stimmen, Fehlerfälle, echtes Hauptspiel bei1280/320px mit Reload sowie Produktionsbuild bestanden; alle9 Umsetzungsschritte unten erledigt.
- [ ] **Bulk 2 technisch abgeschlossen, menschliche Verständnis-/Sichtprobe offen:** zwölf DE/EN-Desktop-/Handyfälle bestanden; Hinweis in allen Fällen sichtbar. Gezielte Tests und Build grün; sechs von sieben Schritten unten erledigt.
- [x] **Bulk 3 abgeschlossen:** M09 v3 und I08 ausdrücklich freigegeben, als eigene Handreaktionen lokal integriert und samt Kontaktpunkten/Stimmen geprüft. M10/I09 nach Nutzervergleich verworfen; bewährte M02/I02 bleiben. Keine pauschale Neuproduktion.
- [ ] **Bulk 4 technisch abgeschlossen:** vier Begegnungen mit dauerhaften gleichwertigen Antworten, ehrlichen Rückbezügen und Fortsetzen. Bestehendes Sprechen-Menü, kein zusätzliches Aufstiegsgate. 512/512 Tests, Build, acht DE/EN-Desktop-/Handyfälle und Hauptspiel/Reload bestanden; menschliche Inhalts-/Spielgefühlabnahme offen.
- [ ] **Bulk 5: Qualitätsprobe abgenommen, weiterer Videoausbau zurückgestellt:** aufrechte vorhandene Tresenpose und V2 visuell gegen Mara geprüft, gemeinsame Comfy-Referenz480×704 samt beiden Händen kontrolliert. MC01/Idle fertig (90Frames/3,75s;291,2s), gesamte Bildfolge/Gesicht/Hände kontrolliert und im Chat gezeigt; **Vom Nutzer freigegeben.** MC05/Hand ebenfalls vom Nutzer freigegeben; gemeinsame Ruhe→Hand→Ruhe-Probe aufDesktop/320px einschließlich Fehlerfallback bestanden. MC02 ebenfalls fertig und vom Nutzer freigegeben; MC03 ist als letzter bereits gestarteter Clip fertig kontrolliert und inzwischen ausdrücklich vom Nutzer freigegeben; keine weiteren Renderings. Weitere Produktion ausdrücklich zurückgestellt.

Bulk 5: Qualitätsprobe abgenommen, weitere Videoproduktion zurückgestellt; Bulks 6–9 sind noch offen. Diese Übersicht und die Detailcheckboxen werden nach überprüften Ergebnissen aktualisiert; eine ausstehende Sichtabnahme wird nicht durch einen technischen Haken ersetzt.

## 1. Entscheidung: der empfohlene Weg

**Zuerst die 15 freigegebenen Clips sauber austauschen und den bestehenden Fortschritt verständlich machen. Danach die fehlenden Reaktionen ergänzen. Herz 4 öffnet erst dann einen neuen Treffpunkt, wenn dort ein vollständiges kleines Interaktionsset funktioniert.**

Ein neuer Treffpunkt ist ein Paket aus Hintergrund, verbindlicher Ruhepose, passenden Reaktionen, Berührungspunkten und Dialogen. Kein einzelnes Vorbeugevideo mit anschließender Rückkehr in die alte Szene. Innerhalb eines Treffpunkts beginnen und enden normale Reaktionen in derselben Ruhepose. Nur eine bewusst gewählte Ortsänderung oder eine ausdrücklich als Rückblick gestartete Geschichte darf die Szene wechseln.

Für Mara ist die vorhandene **aufrechtere Grundpose am Tresen mit beiden Händen auf der Platte** der effizienteste Ausgangspunkt. Das stärkere Vorbeugen wird eine besondere Reaktion, danach kehrt sie zur Tresen-Ruhe zurück. Die dauerhaft tiefe Ellbogenstütze bekommt vorerst kein eigenes interaktives Set. Wer sie später als Ruhepose verwenden möchte, braucht dafür erneut passende Reaktionen.

Ilyra erhält nach derselben Methode eine eigene Szene **am Tavernenfenster mit Blick in den Abendhimmel**. Sie bleibt im vertrauten Raum; kein zusätzliches begehbares Raum- oder Gebäudesystem ist nötig.

Die Spielmotivation entsteht aus konkreten nächsten Begegnungen, wiedererkennbaren Vorlieben und eigener Initiative der Figuren. Mehr Punkte oder längere Wartezeiten allein lösen das nicht.

### Verbindliche Leitlinie für die Oberfläche

Die Taverne soll sich weiterhin wie ein persönlicher Besuch bei Mara oder Ilyra anfühlen. Bessere Reaktionen, kurze passende Texte und neue gemeinsame Momente tragen die Verbesserung. **Ein kompletter Menü- oder Layoutumbau gehört nicht zu diesem Plan. Diese Leitlinie gilt für alle Bulks.**

- Bestehenden Rahmen, Farben, Schriften, Herzen, Figurenfokus, Dialogbereich, Navigation und die drei Hauptaktionen **Sprechen / Berühren / Schenken** erhalten. Keine zusätzlichen Haupttabs oder dauerhaft neuen Aktionsleisten.
- Den vorhandenen Fortschritts-/Hinweisbereich verbessern: normalerweise **ein kurzer, zum aktuellen Stand passender Satz**, bei Bedarf eine zweite kurze Zeile. Keine dauerhafte Aufgabenkarte mit mehreren Zahlenreihen, Checklisten oder parallelen Fortschrittsbalken.
- Der aktuelle Grund für fehlenden Fortschritt und die nächste sinnvolle Handlung bleiben direkt verständlich. Genaue Punkte, Reserven und sämtliche Regeln sind bei Bedarf im bereits vorhandenen Bereich „Geschenke & Fortschritt“ in einem Schritt lesbar. Keine neue Untermenükette.
- Neue Inhalte über die bekannten Wege anbieten: persönliche Momente über die Herzen, neue Gespräche über Sprechen, Berührungen an der Figur und Geschenke über Schenken. Bei einer Gesprächswahl beide Antworten direkt in der bestehenden unteren Leiste zeigen; längere Texte scrollen darüber. Kein separates Begegnungsarchiv, Raumverwaltungsmenü oder Favoritenmenü.
- Neue Orte über eine Einladung und später einen direkten Eintrag im vorhandenen Sprechen-Menü erreichen. Kein Zwischenschritt „Orte → Raum wählen → Pose wählen → bestätigen“. Die Szene bestimmt passende Pose und Reaktionen automatisch.
- Zu einem Zeitpunkt höchstens einen neuen kontextbezogenen Einstieg hervorheben. Weitere verdiente Inhalte bleiben erreichbar, ohne mehrere auffällige Karten oder Meldungen aufzuschichten.
- Neue Texte und Effekte dürfen die Figur auf dem Handy nicht wesentlich verkleinern oder das gewohnte Layout ständig verschieben. Die bestehende Zeichensprache der Taverne bleibt erhalten.
- Jeder neue sichtbare Schalter braucht einen konkreten Nutzen, den ein vorhandenes Element nicht bereits erfüllt. Reine Verwaltungsoptionen, eine Pin-Funktion und zusätzliche Sammlungsansichten sind nicht Bestandteil der Umsetzung.

Die Tabellen im Plan beschreiben mögliche Zustände und interne Zuordnungen. Sie werden **nicht gleichzeitig als Tabellen, Statusübersichten oder zusätzliche Menüs ins Spiel übertragen**.

## 2. Verifizierter Bestand und tatsächliche Lücken

| Bereich | Tatsächlicher Stand | Folgerung |
| --- | --- | --- |
| Animationen | Mara M01–M08 und Ilyra I01–I07 ausdrücklich freigegeben und lokal integriert; zusätzlich M09 v3/I08 als eigene Hände integriert | Beim Austausch exakt die abgenommenen Revisionen verwenden |
| Dateiformat | Neu: stumme H.264-MP4s, 480 × 704, 24 FPS, Hintergrund enthalten. Alt: transparente WebP-Atlanten, 480 × 700, 30 FPS | Neuer Darstellungsadapter und geprüfte Komposition nötig; bloßer Dateitausch genügt nicht |
| Umfang | Neue 15 MP4s: 11.221.966 Byte; alte 15 Laufzeit-Atlanten: 48.628.964 Byte | Rund 77 % weniger Dateidaten, aber kein identischer Codec-/Laufzeitvergleich und keine RAM-Messung |
| Einstieg | Drei Gespräche: 0 → 8 → 16 → 23; normales Geschenk → 35 Punkte / Herz 2 | Schnellen Einstieg erhalten |
| Herz 3 | 58 Punkte, 30 normale Live-Siege seit Herz 2, persönliches Geschenk bewusst überreichen | Jeweils verständlich sagen, was noch fehlt; normale Geschenke ersetzen die 30 Siege nicht |
| Aktuelle Grenze | Neue Beziehungen enden bei 70 Punkten / Herz 3 | Herz 4/5 nicht nur durch Entfernen dieser Grenze öffnen |
| Bestandsschutz | Bereits früher verdiente Herzen 4/5 bleiben erhalten | Alte Beziehungen und bereits verfügbare Gesten nicht wieder sperren |
| Berührungen | Schulter ab Herz 1; Haare ab Herz 2; Hand ab Herz 3 | Kumulativ erhalten; inzwischen eigene freigegebene Handreaktionen M09/I08 eingebunden |
| Weitere Gesten | Lachen ab Herz 2; Kompliment ab Herz 3; Maras Necken ab Herz 4 | M07 ist für neue Beziehungen aktuell unerreichbar, aber vollständig vorhanden |
| Geschichten | Fünf geschriebene Momente je Figur, je drei Abschnitte; Stufendialoge vorhanden | Texte nutzen und gezielt ergänzen; bisher keine fünf eigenständigen Filmszenen |
| Geschenkquellen | Einmal Taverne, Boss 15, Boss 25, Ilyra; ein normales Geschenk je zehn normale Siege; Bestand maximal 20 | Nutzen und Verfügbarkeit unterscheiden; Bestand nicht löschen |
| Kampf | Bei geöffneter Taverne pausiert er | Ein Besuch darf nicht den Eindruck erwecken, dass dort der Siegzähler weiterläuft |
| Audio | Stimmen und Effekte werden separat durch bestätigte Aktionen ausgelöst | Keine Tonspur in die neuen Videos einbauen; vorhandene Ereignisse erhalten |

### Was vom Tresen bereits existiert

- Gemeinsamer Hintergrund und drei getrennte Zeichnungen: Grundpose, stärker vorgebeugt, tiefe Ellbogenstütze.
- Drei alte kleine Rig-Bewegungsproben innerhalb dieser Posen: 5 / 5 / 5,2 Sekunden. Das sind keine fertigen vollständigen Berührungssets; unter anderem fehlt eigenständiges Blinzeln.
- **4,2-Sekunden-Reaktion V2:** Grundpose → Vorbeugen → Grundpose. Laut vorhandener Roadmap vom Nutzer als deutlich besser bestätigt und als bevorzugte Grundlage behalten. Nur lokal, nicht ins Spiel integriert.
- Eine vorbereitete 4,8-Sekunden-Bewegung innerhalb der Ellbogenstütze, bisher nur teilweise ausgeliefert. **Kein Übergang von der Grundpose in die Ellbogenstütze.**

Die alte V2 ist eine brauchbare Vorlage und eventuell weiterverwendbar. Sie ist noch kein zu den 15 neuen ComfyUI-Clips geprüftes Szenenpaket. Gesicht, Kleidung, Hintergrund, Pose und Bewegung müssen vor einer Übernahme zusammen verglichen werden.

Quellen: [Regeln im geprüften Main-Snapshot](../../../artifacts/idle-bastion/tavern-audit-2026-11-06/source/src/tavern-social.ts), [Oberfläche](../../../artifacts/idle-bastion/tavern-audit-2026-11-06/source/src/tavern-ui.ts), [Clips und Zuordnung](../../../artifacts/idle-bastion/tavern-audit-2026-11-06/clip-replacement-plan.json), [Tresen-Rigs](../../../artifacts/idle-bastion/mara-counter-pose-v1/rig-v1/README.md), [Vorbeuge-V2](../../../artifacts/idle-bastion/mara-counter-pose-v1/touch-lean-v2/README.md), [Ellbogen-Vorbereitung](../../../artifacts/idle-bastion/mara-counter-pose-v1/support-settle-v1/README.md).

## 3. Fortschritt muss ohne Erklärung von außen verständlich sein

### 3.1 Ein kurzer Hinweis an der vertrauten Stelle

Aktuell stehen einige Hinweise schon im Spiel, aber die Bedingungen verteilen sich auf Geschenkhinweise, den Balken und aufklappbare Details. Das ist für eine sichere Erstbenutzung nicht ausreichend. Besonders **58 / 70 bei weiter möglichen Berührungen** kann wie ein Fehler wirken.

Der bestehende Hinweisbereich bei Herzen/Geschenken erhält **eine** kurze kontextabhängige Erklärung. Es kommt keine zusätzliche dauerhaft sichtbare Aufgabenkarte hinzu. Beispiel bei 58 Punkten und 18 von 30 Siegen:

```text
Für Maras persönliches Geschenk fehlen noch 12 gewonnene Wellen.
Auch Farmen zählt.
```

Der vorhandene Rückweg zum Kampf bleibt an seiner bisherigen Stelle. Die vorhandene Kampfstatuszeile erklärt „Kampf pausiert während des Besuchs“; dafür keine zusätzliche Hinweisbox oder einen zweiten Rückkehrknopf anlegen.

Wenn alles bereit ist, lautet der Hinweis beispielsweise **„Dein persönliches Geschenk ist bereit – überreiche es für Herz 3.“** Der vorhandene Schenken-Button wird entsprechend hervorgehoben. Seine Hauptbeschriftung und Position bleiben vertraut; eine kurze Unterzeile kann das persönliche Geschenk benennen. Es braucht keinen neuen Geschenkdialog oder zusätzlichen Bestätigungsschritt.

Die Herzen und der bestehende Beziehungsbalken bleiben erhalten. Bei einem noch fehlenden Geschenk beschreibt der Hinweis die verbleibende Bedingung, statt einen kommentarlosen 58/70-Stillstand stehen zu lassen. **Keine zusätzlichen 58/58- und 18/30-Balken daneben.** Wer genaue Zahlen sehen möchte, findet sie im vorhandenen Detailbereich, einschließlich „Das persönliche Geschenk gibt die letzten 12 Punkte für Herz 3.“

Der Hinweis richtet sich nach dem nächsten tatsächlich möglichen Schritt: erst eine bereitstehende Übergabe oder Einladung, sonst die aktuell fehlende Bedingung. Fehlen sowohl Nähe als auch Siege, darf eine zweite kurze Zeile das sagen. Beispiel: „Lernt euch noch etwas besser kennen. Für das persönliche Geschenk fehlen außerdem 12 Siege.“ Ist gerade keine punktgebende Interaktion möglich, nennt der Text stattdessen die nächste Auffüllung durch Siege. Keine Bedingungen verstecken, aber auch nicht sämtliche Zähler gleichzeitig anzeigen. Zwischenbegegnungen werden erst bei Verfügbarkeit über Sprechen kenntlich; ein zweiter Countdown bis zum nächsten Gespräch ist unnötig.

### 3.2 Zustände, Texte und nächster Schritt

Die folgende Tabelle ist eine interne Text-/Zustandsliste. Im Spiel erscheint jeweils nur der passende Hinweis, nicht die gesamte Liste und nicht für jede Zeile ein neuer Button.

| Zustand | Beispiel für den passenden Hinweis | Vorhandener Bedienweg |
| --- | --- | --- |
| Vor Herz 2, unter 23 Punkten | „Lernt euch noch etwas kennen, bevor du dein erstes Geschenk überreichst.“ | Sprechen; Schulter ab Herz 1 weiterhin ohne Punkte möglich |
| 23 Punkte und normales Geschenk vorhanden | „Dein erstes Geschenk öffnet Herz 2.“ | Schenken, mit passender kurzer Unterzeile |
| Unter 58 Punkten, Reserve verfügbar | „Verbringt noch etwas Zeit miteinander.“ Wenn auch Siege fehlen, eine zweite kurze Zeile dazu | Sprechen oder Berühren |
| Unter 58 Punkten, Reserve leer | „Ihr könnt weiter Zeit miteinander verbringen. Neue Zuneigung gibt es nach X weiteren Siegen.“ | Berühren bleibt möglich; vorhandener Rückweg zum Kampf |
| 58 Punkte, beispielsweise 18/30 Siege | „Für Maras persönliches Geschenk fehlen noch 12 gewonnene Wellen.“ | Vorhandener Rückweg zum Kampf; kein „Noch 12 Zuneigung“ |
| 30/30 Siege, Zuneigung fehlt | „Dein persönliches Geschenk wartet schon. Lernt euch noch etwas besser kennen.“ | Sprechen/Berühren; bei leerer Reserve stattdessen die fehlenden Siege zur Auffüllung nennen |
| Beide Voraussetzungen erfüllt | „Dein persönliches Geschenk ist bereit – überreiche es für Herz 3.“ | Schenken, mit „Persönliches Geschenk“ als Unterzeile |
| Normales Geschenk im Vorrat, aber nicht verwendbar | Neben dem nächsten Schritt erklären: „Normale Geschenke ersetzen das persönliche Geschenk nicht.“ | Kurze Erklärung am vorhandenen Schenken-Bereich; kein neues Inventarmenü |
| Aktuelle Inhaltsetappe beendet | „Diese Etappe ist abgeschlossen. Eure gemeinsamen Momente bleiben.“ | Herzen und bekannte Aktionen weiter verwenden |
| Eine spätere Etappe noch nicht ausgeliefert | „Weitere Begegnungen folgen in einem Update.“ | Keine Punktesammelaufforderung für nicht erreichbare Herzen |

Die Reserve-Erklärung nennt Siege; weder „morgen“ noch „heute verbraucht“ im Regeltext. Es gibt keine tägliche Rücksetzung.

Weitere verbindliche Regeln:

- Ein Siegziel nennt „gewonnene normale Wellen“; „Farmen zählt“ kann als kurze Ergänzung stehen. Der vorhandene Detailbereich erklärt Boss-/Offline-Ausschluss, genaue Zähler und Reservewerte. Der bestehende Kampfstatus zeigt die Tavernenpause. Keine versteckte Mindestwelle.
- Der Zähler gehört der ausgewählten Figur und beginnt bei deren zweitem Herz. Beide können durch dieselben Siege vorankommen. Nicht pauschal 30 weitere Siege für jede neue Auswahl verlangen.
- Der vorhandene Rückweg zum Kampf schließt die Taverne und respektiert eine vorher manuell gesetzte Pause. Keine überraschende Fortsetzung eines bewusst pausierten Spiels.
- Gesperrte Herzen sind als **Erklärung** per Touch und Tastatur erreichbar: einmal antippen zeigt den kurzen Grund direkt im vorhandenen Hinweisbereich, ohne ein weiteres Menü zu öffnen. Tooltip allein und vollständig deaktivierter Button reichen nicht. Die Erklärung vergibt keine Punkte.
- Geschenkbesitz, Einlösbarkeit und neue Begegnung sprachlich unterscheiden, aber keine drei dauerhaften Statuskacheln daraus bauen. Nur eine unmittelbar passende Aktion hervorheben; Neues über den vorhandenen Zugang markieren.
- Auf der Karte höchstens ein dezenter zusammengefasster Hinweis „Mara möchte dich sehen“. Kein Öffnungszwang, kein wiederholtes Aufblinken pro Sieg, kein Ablaufen der Einladung.
- Nur ausgelieferte Belohnungen konkret versprechen. Ein noch nicht produzierter Balkon oder ein Outfit erscheint nicht als jetzt erfüllbarer Auftrag.

### 3.3 Kurze Verständnisprüfung als echte Abnahme

Ohne vorherige Erklärung einen Stand mit 58 Punkten / 18 Siegen zeigen. Die Testperson muss unmittelbar erkennen können: „Was fehlt? Wo bekomme ich es?“ Auf Nachfrage müssen auch „Helfen meine normalen Geschenke?“ und „Zählt die Zeit hier in der Taverne?“ über den vorhandenen Geschenkbereich beziehungsweise Kampfstatus beantwortbar sein. Dasselbe mit 30 Siegen / fehlender Zuneigung sowie komplett fertigen Voraussetzungen prüfen. Zusätzlich einen Besuch nach längerer Pause prüfen: Was ist neu und was ist der nächste Schritt?

Ebenso prüfen: Sind Sprechen, Berühren, Schenken und Zurück noch an den vertrauten Stellen? Funktioniert der Einstieg ohne eine Anleitung? Lassen sich die wenigen Zusatzdetails in einem Schritt öffnen, und wirkt die Ansicht weiterhin wie dieselbe Taverne? Wenn Verständlichkeit nur durch weitere Panels, Hauptbuttons oder Untermenüs erreicht wird, den Entwurf vereinfachen.

Erst diese Probe bestätigt Verständlichkeit. Eine technisch korrekte Beschriftung oder unsere Kenntnis der Regeln ersetzt sie nicht.

## 4. Empfohlener Beziehungsbogen

### 4.1 Belohnungen und Tempo

| Etappe | Bestehender Stand / vorgeschlagene Voraussetzung | Wahrnehmbarer Gewinn |
| --- | --- | --- |
| Herz 1 | Bestehend: 10 Punkte | Schulterkontakt, persönliche Begrüßung, erster Moment |
| Herz 2 | Bestehend: 35 Punkte durch schnellen Einstieg | Haare, gemeinsames Lachen, Blickwechsel; klares persönliches Ziel |
| Auf dem Weg zu Herz 3 | 30 **neue normale Siege seit Herz 2 bei dieser Figur**; Treffen nach 10 und 20 dieser neuen Siege | Neue Antworten, kleine Wahl, Initiative und Vorfreude |
| Herz 3 | Bestehend: 58 + persönliches Geschenk = 70 | Eigene Handreaktion, Kompliment, dritter Moment |
| Herz 4 | **Testvorschlag:** 98 Punkte + 40 normale Siege seit Herz 3; Einladung bewusst annehmen → 110 | Vollständig interaktiver neuer Treffpunkt; Mara zusätzlich vorhandenes Necken |
| Herz 5 | **Testvorschlag:** 148 Punkte + 50 normale Siege seit Herz 4; besonderen Moment bewusst beginnen → 160 | Eigene Wangenreaktion am neuen Treffpunkt, persönlicher Abschluss und dauerhafte Wiederholbarkeit |

**40 / 50 Siege und die neuen Zwischenobergrenzen sind vorgeschlagene Startwerte, keine gemessene Idealbalance und kein aktueller Spielstand.** Die bekannten Schwellen 110 / 160 bleiben als Speicherwerte nutzbar. Die letzten zwölf Punkte einer späteren Etappe stammen aus deren einmaligem Abschluss; Geschenkstapel können ihn nicht überspringen. Ein neuer Währungs- oder Inventartyp für diese Abschlüsse ist unnötig.

Mit insgesamt 30 + 40 + 50 Siegen ab Herz 2 ergäbe eine rein lineare Übertragung der früher gemessenen Farmgeschwindigkeiten ungefähr 24–57 Minuten Kampfzeit, plus Besuche und Lesen. Das ist nur eine Größenordnung: Verteidigung, weitere Wellen, Niederlagen und Pausen verändern sie. Ziel sind etwa zwei überschaubare Sitzungen oder eine längere; keine erzwungenen Kalendertage. Vor Festlegung mit dem dann aktuellen Kampfcode messen. Die fünf Minuten bis Herz 3 bleiben ein weiches Ziel, solange keine gesondert gewünschte aktive Mindestzeit eingeführt wird.

Für Herz 4 und 5 dieselbe kurze kontextabhängige Erklärung verwenden. Die Bedingungen bleiben intern eindeutig; sichtbare zusätzliche Checklisten oder Etappenmenüs entstehen daraus nicht. Die zusätzlichen Siege sind durch jeweils zwei neue kleine Begegnungen gefüllt, etwa bei 15/30 von 40 und 20/40 von 50. Keine Strecke nur durch höhere Zahlen verlängern.

### 4.2 Kleine Begegnungen mit Bedeutung

Erstes Paket nur zwischen Herz 2 und 3: **zwei kurze Begegnungen je Figur**, je zwei bis drei Textabschnitte, eine Antwortwahl mit zwei stimmigen Optionen.

**Zählbeginn ausdrücklich geklärt (07.11.2026):** Die folgenden 10/20 Siege sind keine Gesamtzahl seit Spielbeginn und keine Tutorialmeilensteine. Für jede Figur zählt `personal[Figur].clears` erst ab deren Herz 2 (35 Zuneigung). Siege vor Tavernenbau, vor dem ersten Besuch oder vor Herz 2 werden nicht nachträglich übernommen. Beispiel: Mara erreicht nach bereits 25 früheren Siegen Herz 2 → ihr Zähler steht trotzdem bei 0; erst zehn weitere normale Siege öffnen das erste Gespräch. Hat Ilyra noch kein Herz 2, beginnt ihr eigener Zähler noch nicht. Haben beide Herz 2, zählen dieselben neuen Siege für beide parallel. Live-Farmen zählt; Bosskämpfe, Niederlagen und Offlinegold nicht.

**Warum ein Besuch trotzdem schnell wirken kann:** Herz 2 benötigt nur drei Gespräche und ein normales Geschenk. Normale Geschenke können bereits vor dem ersten Besuch vorhanden sein; nach gebauter Taverne kann bei weiteren Siegen auch ohne Besuch normaler Vorrat entstehen. Damit lässt sich Zuneigung nach Herz 2 schnell auf 58 bringen, aber weder der persönliche Siegfortschritt noch Herz 3 kaufen. Für Herz 3 bleiben 30 neue Siege, mindestens 58 Zuneigung und die bewusste persönliche Geschenkübergabe erforderlich. Alte bereits verdiente Herzen bleiben erhalten; der Direkt-Teststarter mit Herz 3 ist absichtlich vorbereitet und bildet keinen frischen Einstieg ab. Eine Änderung der Zahlen oder Geschenkbalance folgt aus dieser Klarstellung nicht.

- **Mara / 10 Siege:** Rückbezug auf ihr Glückszahnrad; ehrlich nachfragen oder ihren Scherz erwidern. Sie merkt sich den gewählten Ton.
- **Mara / 20 Siege:** Sie behält etwas für den Spieler zurück beziehungsweise deutet den späteren Platz am Tresen an. Noch keine Nutzung des nicht freigeschalteten Ortes.
- **Ilyra / 10 Siege:** Ihr namenloser Stern; gemeinsam einen Namen überlegen oder die geteilte Stille wählen.
- **Ilyra / 20 Siege:** Sie beginnt von sich aus ein Gespräch und deutet ihren späteren Platz am Fenster an.

Die Auswahl verändert eine spätere Antwort, nicht die Anzahl der Herzen. Keine verborgene „richtige“ Flirtantwort, kein Zuneigungsverlust. Mara bleibt frech und direkt, Ilyra zurückhaltend mit später wachsender eigener Initiative. Texte dürfen spielerisch und anzüglich sein, ohne jede Begegnung gleich klingen zu lassen.

Die 10-/20-Siege-Gespräche sind **keine zusätzlichen Aufstiegsbedingungen**. Wer bis 30 durchspielt, verliert sie nicht und muss nicht vor dem Geschenk mehrere Pflichtdialoge erledigen. Sprechen markiert ein neues Gespräch; der vorhandene Plaudern-Einstieg führt zum nächsten ungesehenen Thema. Kein eigener Begegnungsbildschirm und kein automatisches Abarbeiten mehrerer Dialoge hintereinander. Eine Antwortwahl erscheint direkt beim Dialog, höchstens zwei Optionen und keine weitere Unterebene. Ohne getroffene Wahl gelten neutrale, ehrlich formulierte Anschlusstexte; keine erfundenen Erinnerungen.

Verdiente Herzmomente bleiben wie bisher über die Herzen wiederholbar. Bereits gehörte Zwischengespräche dürfen als passende Plauderthemen wiederkehren; eine separate Sammlung zur gezielten Verwaltung jedes Gesprächs ist dafür nicht erforderlich.

Im normalen Plaudern stufengerechte Themen bevorzugen. Frühere konkrete Ereignisse dürfen wiederkehren; frühe Distanz- oder Erstbegegnungssätze sollen auf hohen Stufen nicht unpassend wiederholt werden. Nicht jedes neue Thema benötigt eine neue Animation.

### 4.3 Geschenke

- Einstiegsgeschenk, bestehende Ansprüche und angesammelten Vorrat erhalten. Ilyras Begrüßungsgeschenk sichert ihren Einstieg unabhängig von Mara.
- Persönliches Geschenk erzählerisch konkretisieren, etwa ein kleines passendes Fundstück für Maras Glückszahnrad oder Ilyras Sternmotiv. Es bleibt technisch die garantierte persönliche Belohnung, kein Zufallsdrop und keine neue Sammelwährung.
- Normale Geschenke bleiben optionale Beschleuniger auf dem Weg zur jeweiligen Zwischenobergrenze. Sie ersetzen weder Siegziel noch neue Begegnung. Falls die Reststrecke weniger als zwölf Punkte beträgt, die tatsächliche Wirkung am vorhandenen Schenken-Bereich kenntlich machen; kein weiterer Bestätigungsdialog. Exakte Werte bleiben im Detailbereich lesbar.
- Geschenke oberhalb des aktuellen Punktedeckels nicht verbrauchen. Ein Stopp nennt die noch fehlende Bedingung und lässt Gespräch/Berührung verfügbar.
- Zunächst Zehner-Drops beibehalten, neue Nutzung mit vollständigem Bogen messen: Zufluss, tatsächlich verbrauchte Geschenke, Restbestand nach Herz 3/4/5. Erst danach Häufigkeit oder Vorratsgrenze ändern. Keine Entwertung alter Bestände.
- Spätere kosmetische Wünsche können einen begrenzten zusätzlichen Nutzen bieten. **Kein Geschenkpreis für normale Wiederholung verdienter Szenen.**
- Falls ein optionales Outfit normale Geschenke kosten soll, muss der Erwerb auch bei zwei abgeschlossenen Beziehungen möglich bleiben. Die aktuelle reguläre Quelle endet dann; ohne angepasste Quelle wäre ein solcher Kauf möglicherweise dauerhaft blockiert. Darum erst einen vollständigen Erwerbsweg planen, dann einen Preis festlegen.

## 5. Welche zusätzlichen Animationen wirklich gebraucht werden

Nicht jede Textvariante braucht einen Clip. **Berührungszonen sollen unterscheidbar reagieren; ein allgemeines Lächeln darf dagegen mehrere passende Gesprächssituationen tragen.** Folgende IDs sind nur neue Planungsnamen, keine vorhandenen Dateien.

### 5.1 Bestehende Standardansicht: zuerst vier Ergänzungen

| Plan-ID | Charakter / Reaktion | Zielbewegung und Dauer | Zweck / Priorität |
| --- | --- | --- | --- |
| M09 | Mara: Handkontakt | Blick kurz zur eigenen Hand, Finger/Hand sanft öffnen oder leicht anbieten, warmer Blick zurück; ca. 2,5–3,5 s | **Nötig:** ersetzt die Hand→Kichern-Dopplung ab Herz 3 |
| I08 | Ilyra: Handkontakt | Kleine bewusste Bewegung ihrer eigenen Hand, ruhiger Blickkontakt, kurzer Halt; ca. 2,5–3,5 s | **Nötig:** eigener Charakterton, ebenfalls kein Kichern |
| M10 | Mara: Zuhören / Antwort | Kleine Blick- oder Kopfbestätigung, dezentes Lächeln, entspannte Hände; ca. 1,5–2,3 s | Empfohlen: Plaudern und neutrale Geschichte von Haarberührung trennen |
| I09 | Ilyra: Zuhören / Antwort | Ruhiges Aufmerken, kleiner bestätigender Blick, sanftes Blinzeln; ca. 1,5–2,3 s | Empfohlen: eigene neutrale Reaktion statt ständigem Haarclip |

Alle vier starten und enden in der vorhandenen Standard-Ruhepose, mit demselben Hintergrund und Outfit. Es erscheinen ausschließlich ihre eigenen Hände. Die Berührung des Spielers wird durch Blick, eigene Bewegung und Text vermittelt.

Danach: M02/I02 für Haare, M03/I03 für Schulter, M05/I05 für echtes Lachen, M09/I08 für Hand. M10/I09 dürfen mehrere inhaltlich passende Dialogabschnitte unterstützen. Vor der Umstellung die vorhandenen Kopfclips erneut als Haarreaktion ansehen; sie gelten nicht automatisch als misslungen oder müssen pauschal neu gerendert werden.

Eine neue Herzfreischaltung benötigt **keinen zusätzlichen KI-Clip**: zunächst die bestehende dezente Kopfbestätigung plus neue UI-Animation; später passt in der Standardansicht die freigegebene Freude zu einem freudigen Aufstieg. Ernste Storyabschnitte bleiben davon ausgenommen. Diese spätere Änderung wird ausdrücklich im UX-Paket geprüft und nicht heimlich im reinen Assettausch vorgenommen.

**Nutzerentscheidung nach den Vergleichen:** I08 ist freigegeben. Neue M10 und I09 verbessern die Wirkung aus Nutzersicht nicht; stattdessen bleiben die links gezeigten bereits freigegebenen M02/I02 in Verwendung. Damit sind nur die zwei eigenen Handreaktionen als neue Standardassets vorgesehen. Passende bestehende Reaktionen dürfen bewusst mehrere Situationen bedienen. M09 wird ausschließlich wegen des beanstandeten Fingerzuckens korrigiert.

### 5.2 Herz 4: sieben Rollen pro neuem Treffpunkt

Für Mara heißen die Plan-IDs `MC01–MC07`, für Ilyra `IF01–IF07`. MC = Mara am Counter/Tresen; IF = Ilyra am Fenster. Pro Figur **eine** verbindliche Grundpose und ein unveränderter Szenenhintergrund.

| Rollen-ID | Funktion | Dauer als Ziel | Mara am Tresen | Ilyra am Fenster |
| --- | --- | --- | --- | --- |
| MC01 / IF01 | Ruhe | 3–4,5 s, loopfähig | Kleine Mimik/Blinzeln, Hände plausibel auf der Platte, keine Dauerwippe | Entspannte eigene Haltung, kein unmotivierter Wind |
| MC02 / IF02 | Gespräch / freundliche Antwort | 1,5–2,3 s | Zugewandter Blick, kleines Lächeln; Auflagen bleiben stimmig | Kurzer Blick zum Spieler, zurückhaltendes Lächeln |
| MC03 / IF03 | Haare berühren | 2–3 s | Kleine Kopfreaktion innerhalb der Tresenhaltung | Eigene klare Kopf-/Blickreaktion in der Fensterhaltung |
| MC04 / IF04 | Schulter berühren | 2–3 s | Leichtes Entspannen von Schulter/Oberkörper, Auflage nicht verrutscht | Wahrnehmen und Entspannen, räumlich vom Haarclip unterscheidbar |
| MC05 / IF05 | Hand berühren | 2,5–3,5 s | Reagiert mit der sichtbar aufliegenden eigenen Hand, ohne fremde Hand | Eigene sichtbare Hand reagiert in ihrer Fensterpose |
| MC06 / IF06 | Lachen / spielerisches Necken | 3–4 s | Kurzes Lachen mit passendem Körperimpuls und Ausklang | Kleineres warmes Lachen, Haltung bleibt erkennbar |
| MC07 / IF07 | Besondere Annäherung | 3,5–4,5 s | Grundpose → etwas näher über den Tresen → Halt → Grundpose; vorhandene V2 als Ausgangspunkt prüfen | Sie wendet sich bewusst näher zu, hält Blickkontakt, kehrt zur Fenster-Ruhe zurück |

**14 Rollen insgesamt, nicht zwingend 14 komplett neue Generierungen.** MC07 besitzt bereits eine alte 4,2-s-Vorlage. Bestehende Rig-Idles können als Referenzen dienen; ihre Wiederverwendung setzt passende Qualität und Pose voraus. Alle neuen Ausgaben werden einzeln nacheinander beurteilt.

Diese sieben Rollen sind ein vollständiges kleines Set, kein Versprechen auf jede denkbare Geste. Die zusätzliche automatische Idle-Variante und eine eigene Geschenkfreude am neuen Ort sind zunächst unnötig. Ein ruhiges freundliches Annehmen über MC02/IF02 ist dort passend. Nicht aus der Standardansicht lachen, hüpfen oder an die Hüfte greifen lassen. Die besondere Annäherung MC07/IF07 ist die neue lokale Reaktion auf das vertraute **„Kompliment machen“**; dafür keinen zusätzlichen Hauptbutton „Näherkommen“ und keine weitere Gestenebene einführen.

### 5.3 Herz 5 und später: gezielte Erweiterung

| Plan-ID | Rolle | Dauer | Einordnung |
| --- | --- | --- | --- |
| MC08 / IF08 | Wangenreaktion | ca. 2,5–3,5 s | Neue Berührung **am Tresen beziehungsweise Fenster**, nach Herz 5; Blickkontakt, sanftes Neigen, eigene Mimik, keine fremde Hand |
| MC09 / IF09 | Persönlicher Abschluss | ca. 4–5 s | Eigene kurze Annäherung und bewusstes Halten; Texte des fünften Moments nutzen, Rückkehr zur jeweiligen Ruhepose |

Die neue Wangenaktion wird als ortsgebundene Belohnung benannt: „Neu: Wange berühren am Tresen“. Die Standardansicht erhält dafür keinen unbenutzbaren Hotspot und keine neue Ortsauswahl: Der vorhandene direkte Eintrag „Zum Tresen“ unter Sprechen führt zum passenden Ort. Soll die Wangenberührung später überall verfügbar sein, sind zwei zusätzliche Reaktionen für die Standardpose nötig.

**Produktionsumfang des vorgeschlagenen vollständigen Bogens:** nach Nutzervergleich zwei neue Standard-Handreaktionen + vierzehn Herz-4-Rollen + vier Herz-5-Rollen = **20 zusätzliche Rollen**, mit einer vorhandenen Tresen-Reaktionsvorlage. Kein Auftrag, diese nun alle zu rendern. Zuerst die nötigen Standard-Handreaktionen, die bereits guten Gesprächsclips behalten; danach ein kleines Mara-Tresenpaket als Qualitätsnachweis.

Vorerst zurückstellen: weitere Hotspots ohne eigene Reaktion, dauerhaft tiefe Ellbogenhaltung mit vollständigem Bedienumfang, Umarmung aus schwieriger Perspektive, frei kombinierbare Outfitwechsel und mehrere zusätzliche Räume. Sie vervielfachen den nötigen Animationsbestand.

### 5.4 Konkretisierung der späteren Clips · Nutzerwunsch vom 07.11.2026

**Gestalterische Richtung:** Beide erwachsenen Figuren dürfen am neuen Treffpunkt selbstbewusster und flirtender wirken. Nähe entsteht durch Blickkontakt, eine kurze gehaltene Pose und eine erkennbare Antwort auf den Spieler. Kleidung, Frisur und Gesicht bleiben identisch. Die Kamera bleibt ruhig; natürliche Körper- und Stoffbewegung folgt einer tatsächlichen Gewichtsverlagerung oder einem Lachen. Keine isolierten Wippbewegungen, keine fremden Hände, kein Einknicken des Halses und keine wechselnde Figurengröße.

**Mara: die vier freigegebenen Clips bleiben die Grundlage.** MC01/Ruhe, MC02/Gespräch, MC03/Haare und MC05/Hand werden nicht neu produziert. Die stärkere Annäherung gehört in eine eigene kurze Reaktion; danach kehrt Mara zur vorhandenen Ruhepose zurück. Dadurch bleiben die übrigen Clips und Kontaktpunkte verwendbar.

| Fehlender Clip | Konkrete Inszenierung | Zielzeit |
| --- | --- | --- |
| MC04 · Schulter | Sie nimmt die Berührung mit einem seitlichen Blick wahr, entspannt die betreffende Schulter und lächelt. Die eigenen Hände bleiben plausibel auf dem Tresen. Kein Verwechseln mit der Haarreaktion. | 2–2,5 s |
| MC06 · Lachen | Ein kurzes warmes Lachen mit kleinem Oberkörperimpuls und natürlichem Ausklang. Haltung und Kleidung folgen der Bewegung; anschließend dieselbe ruhige Tresenpose. | 3–3,5 s |
| MC07 · Annäherung | Auf das vorhandene Kompliment stützt sie sich mit den eigenen Händen ab, neigt sich aus der Hüfte etwas näher zum Spieler und hält den Blick kurz. Dann sauber zurück zu MC01. Zuerst prüfen, ob die vorhandene V2 ohne Sprung in Perspektive, Größe oder Handauflage passt. | 3,5–4,5 s |

**Ilyra: zuerst ein einziges verbindliches Fenster-Referenzbild.** Eine leichte Dreiviertelhaltung mit entspanntem Stand und einer sichtbar am Fensterbrett ruhenden Hand gibt ihr eine eigene Silhouette. Die vorhandene Kleidung bestimmt den Ausschnitt; keine neue Garderobe, kein zusätzlicher Sitz-/Aufstehablauf und kein Wind. Kopf, Haare und Umhang müssen im Referenzbild eindeutig getrennt lesbar sein.

| Fehlender Clip | Konkrete Inszenierung | Zielzeit |
| --- | --- | --- |
| IF01 · Ruhe | Sehr dezente Atmung, ein Blinzeln, stabiler Kopf und Hals. Handauflage und Umhang bleiben ruhig. | 3–4 s |
| IF02 · Gespräch | Kurze bewusste Zuwendung zum Spieler mit einem zurückhaltenden Lächeln, anschließend Ausgangsblick. | 1,8–2,3 s |
| IF03 · Haare | Kleine Kopfneigung und Blickreaktion, ohne große Haarbewegung oder eine fremde Hand. | 2–2,5 s |
| IF04 · Schulter | Wahrnehmen, Schulter leicht entspannen, freundlicher Seitenblick; räumlich und emotional von IF03 unterscheidbar. | 2–2,5 s |
| IF05 · Hand | Die aufliegende eigene Hand entspannt sich etwas, dazu Blickkontakt. Keine einzelnen flatternden Finger. | 2,5–3 s |
| IF06 · Lachen | Kleines warmes Lachen mit stimmiger Schulter-/Körperbewegung; kein Hüpfen und kein unbegründetes Nachwippen. | etwa 3 s |
| IF07 · Annäherung | Aus der Dreiviertelhaltung leichte Zuwendung, spielerischer Blick über die Schulter beziehungsweise zum Spieler, kurzer Halt und Rückkehr zu IF01. Keine vollständige Drehung oder zweite Dauerpose. | 3,5–4,5 s |

**Herz 5, beide Figuren:** MC08/IF08 ergänzen eine Wangenreaktion mit sanfter Kopfneigung und Blickkontakt (2,5–3,5 s). MC09/IF09 bilden den persönlichen Abschluss (4–5 s): Mara offen und warm, Ilyra zunächst zurückhaltend und dann bewusst zugewandt. Beide bleiben an ihrem eigenen Ort und kehren zur dortigen Ruhe zurück. Weitere Berührungen sind damit nicht automatisch beauftragt.

**Noch fehlende Spielarbeit:** Herz 4 braucht für beide Figuren vollständige lokale Sets, Einladung/Ortswechsel, Fortschrittsbedingungen und je zwei Zwischengespräche. Herz 5 braucht zusätzlich Fortschritt, je zwei Zwischengespräche, Abschluss und die Messung der Geschenkbalance für eine Favoritin sowie beide Figuren parallel. Bis dahin keine leere Herz-4-/5-Freischaltung für neue Beziehungen. Bereits verdiente alte Herzen bleiben erhalten. Die Zahlen aus Abschnitt 4 sind Vorschläge, keine bereits implementierten Bedingungen.

**Sparsame Reihenfolge für einen späteren Auftrag:** vorhandene Mara-Clips erhalten → MC07-V2 prüfen → nur MC04/MC06 und nötigenfalls MC07 ergänzen → Ilyras Fensterreferenz abstimmen → IF01 und IF05 als Probe → restliches IF-Set → gemeinsame Herz-4-Integration → erst danach Herz 5. Renderings einzeln nacheinander und jeweils vor Integration beurteilen. Momentan wird nichts davon generiert.

Während einer Reaktion bleiben weitere Berührungen gesperrt; erst die Rückkehr zur passenden Ruhepose aktiviert ihre Kontaktpunkte wieder. Die bekannten drei Hauptaktionen, direkter Ortswechsel unter Sprechen und vorhandene Figuren-Soundpools bleiben die Grundlage. Keine neuen Posemenüs oder technischen Bedienfelder.

## 6. Szenen dürfen sich nicht gegenseitig überschreiben

### 6.1 So erlebt es der Spieler

1. Herz 4 ist verdient und gespeichert. Mara sagt beispielsweise: „Komm, hier am Tresen ist noch ein Platz für dich.“
2. Der vorhandene Freischalthinweis zeigt **„Neu: Gemeinsame Zeit am Tresen“** mit einem direkten „Mitkommen“. Die Einladung lässt sich einfach stehen lassen; kein Bestätigungsfenster und kein zusätzlicher Pflichtknopf „Später“.
3. Erst bei „Mitkommen“ laden die benötigten Dateien. Bis sie bereit sind, bleibt die bisherige Szene sichtbar und Zurück bleibt möglich. Für spätere Besuche steht direkt unter Sprechen „Zum Tresen“, ohne dazwischen ein Ortsmenü zu öffnen.
4. Ein kurzer gestalteter Schnitt wechselt in die Tresen-Grundpose. Kein Film muss das Hinübergehen und Umpositionieren vollständig zeigen.
5. Die neue Ansicht macht den Ort erkennbar; optional ergänzt „Am Tresen“ die vorhandene Namenszeile. Keine zusätzliche Ortsleiste. Dieselben Hauptaktionen Sprechen, Berühren und Schenken bleiben an ihren bisherigen Stellen; Texte, Hotspots und Clips gehören nun zum Tresen.
6. Hand antippen spielt MC05, Haare MC03, Schulter MC04. Anschließend läuft immer wieder MC01. **Es gibt keine automatische Rückkehr zum stehenden M01.**
7. Beim vertrauten „Kompliment machen“ lehnt sie sich mit MC07 etwas näher. Danach bleibt Mara am Tresen. Ein tieferes Vorbeugen ist in dieser ersten Fassung eine zeitlich begrenzte Reaktion, keine zweite dauerhafte Ruhepose und kein zusätzlicher Bedienmodus.
8. Unter Sprechen ersetzt „Wieder an unseren Platz“ den Eintrag „Zum Tresen“ und führt direkt zurück. „Zurück“ zur Gefährtenübersicht und Schließen behalten ihre bisherige Bedeutung. Beim späteren Besuch darf der zuletzt gewählte freigeschaltete Ort derselben Figur automatisch wieder erscheinen, ohne Favoriten- oder Poseauswahl. Für Ilyra gilt dasselbe mit „Ans Fenster“.

Falls wir später ausdrücklich die tiefe Vorbeuge als dauerhafte Ruhe wählen: alle dortigen Reaktionen müssen aus genau dieser Pose starten und dorthin zurückkehren. Die vorhandene V2 mit anderer Anfangs-/Endpose ist dann **nicht** ohne Weiteres verwendbar. Das ist eine zusätzliche Produktionsentscheidung, kein cleverer Trick beim Abspielen.

### 6.2 Vollständige Aktionszuordnung am neuen Ort

| Aktion | Tresen | Fenster | Regel |
| --- | --- | --- | --- |
| Nichts tun | MC01 | IF01 | Nur eigener Szenen-Idle |
| Plaudern / neutrale Storyantwort | MC02 | IF02 | Szenengerechte Texte; keine automatische Behauptung einer Lippenvertonung |
| Haare | MC03 | IF03 | Eigene lokale Anker |
| Schulter | MC04 | IF04 | Eigene lokale Anker |
| Hand | MC05 | IF05 | Eigene lokale Anker |
| Lachen | MC06 | IF06 | Wiederverwendung als passende Emotion erlaubt |
| Kompliment | MC07 | IF07 | Besondere lokale Annäherung als Reaktion auf die vorhandene Aktion; keine Standard-Hüftpose und kein zusätzlicher Menüpunkt |
| Mara necken | MC06 | — | Ilyra erhält dadurch nicht ungefragt Maras besondere Aktion |
| Geschenk annehmen | MC02 | IF02 | Vorhandene Bestätigung/Audio nach erfolgreicher Spielaktion |
| Wange ab Herz 5 | MC08 | IF08 | Nur anbieten, wenn tatsächlich produziert und freigeschaltet |
| Abschlussmoment Herz 5 | MC09 | IF09 | Einmalige Belohnung, später kostenloser Rückblick |

Diese Tabelle ist die interne Zuordnung vorhandener Bedienwege. Gesprächsgesten bleiben unter Sprechen, Berührungen an der Figur, Geschenkübergabe unter Schenken und Herzmomente an den Herzen. Sie erzeugt keine neue Leiste mit einem Button für jede Tabellenzeile.

Ernste Gesprächsabschnitte können auf MC01/IF01 oder die neutrale Antwort zurückgreifen. Sie lösen kein Kichern oder Vorbeugen allein deshalb aus, weil eine alte Story einst `touch` verwendete. Für Szenengeschichten werden passende Reaktionen ausdrücklich zugeordnet.

### 6.3 Kleine technische Grundlage, keine neue Spielengine

Die bestehende `TavernPlayer`-Schnittstelle bleibt der Einstieg. Die interne Zuordnung wird perspektivisch **Figur → Szene → Grundpose/Outfit → Aktion → Clip**. **Das ist keine Navigation, die der Spieler durchlaufen muss.** Szene, Pose und Clip ergeben sich automatisch aus seiner vertrauten Aktion. Ein kleiner, typisierter Katalog reicht; es braucht kein allgemeines verzweigtes Filmwerkzeug.

Jeder Clip beschreibt mindestens Szene, Outfit, Anfangspose, Endpose, Loop-/Einmalverhalten, Quelldatei und Dauer. Jede Szene enthält ihre Ruhepose, gültigen Aktionen, Figurenanker und benötigten Startdateien. Beispiel:

```text
mara / standard / default / touch.hand  → M09 → standard.idle
mara / counter  / default / touch.hand  → MC05 → counter.idle
mara / counter  / default / compliment → MC07 → counter.idle
```

**Invarianten und Fehlerverhalten:**

- Kein Clip aus einer anderen Szene oder einem anderen Outfit als stiller Ersatz. Fehlt eine neue Szene, bleibt die alte sichtbar; fehlt eine Aktion, wird sie nicht angeboten. Bei Laufzeitfehlern bleibt das letzte gültige lokale Bild mit verständlicher Wiederholungsmöglichkeit.
- Spielerische Freigabe und Medienbereitschaft sind getrennt. Ein Downloadfehler nimmt keine Herzen zurück und verbraucht eine schon bestätigte Belohnung nicht erneut.
- Freischaltungen kommen aus Spielregeln, nicht aus veralteten `minHeart`-Feldern der alten Grafikmanifeste. Ein freigeschalteter Ort wird erst veröffentlicht, wenn sein vollständiger Aktionskatalog verfügbar ist.
- Hotspots werden pro Szene an ihrer tatsächlichen Ruhepose definiert, mit ausreichend großen Touchflächen. Bewegung darf sie nicht dauerhaft auf eine falsche Körperstelle versetzen. Zuerst die Ankerführung und Animation korrigieren; nicht vorsorglich ein zweites dauerhaftes Berührungsmenü ergänzen. Zugängliche Beschriftung und Tastaturbedienung am vorhandenen Bedienweg erhalten.
- Schnelle Folgeaktionen bleiben bedienbar. Neueste Auswahl gewinnt beim Nachladen; veraltete Ladeantworten dürfen keine Szene zurückholen. Keine Wartepflicht bis zum Ende eines viersekündigen Clips.
- Übergänge innerhalb einer Pose auf Doppelkonturen, Handsprünge und Halsversatz prüfen. Ein Match der Anfangs-/Endpose ist der wichtigste Schutz; ein langer transparenter Bildmorph ist kein Ersatz für passende Frames.
- Größere Orts-/Posenwechsel als kurzer bewusster Schnitt, etwa 150 ms aus-/150 ms einblenden ohne zwei übereinander sichtbare Körper. Neue Szene vor dem Schnitt bereitstellen. Bei reduzierter Bewegung direkter sauberer Wechsel.
- Bestehende Hüftclips M08/I07 gesondert prüfen: insbesondere I07 hat eine eigene Pose. Für eine bewusst gestartete Komplimentreaktion sind ein erkennbarer kurzer Posewechsel und anschließende Rückkehr zur gewählten Szene erlaubt; nicht unbemerkt eine zweite interaktive Grundpose aktivieren.
- Rückblicke tragen ihre ursprüngliche Szene. Das Antippen eines verdienten Herzens startet wie bisher dessen Moment und darf erkennbar dorthin wechseln; danach kehrt man an den vorherigen Treffpunkt zurück. Die vorhandenen Weiter-/Zurück-Knöpfe reichen. Während eines Rückblicks keine unpassenden freien Berührungsaktionen und kein zusätzliches Geschichtenmenü.
- Szenenwechsel, zusätzliche Aktionen und Clipende füllen weder Reserven auf noch vergeben sie Zuneigung. Wiederholung verdienter Inhalte bleibt kostenlos.

## 7. Herzfreischaltung, Audio und kleine Verbesserungen

### Herzfreischaltung mit lesbarer Belohnung

Nach erfolgreicher Speicherung: Herz füllt sich in etwa 250–350 ms, leuchtet kurz auf und setzt sich innerhalb insgesamt etwa 0,8–1,1 Sekunden. Höchstens wenige kleine Lichtpartikel; kein bildfüllendes Konfetti und keine Figur, die hinter einer Meldung verschwindet.

Gleichzeitig genau der bestehende Aufstiegsklang. Der vorhandene Freischalthinweis zeigt **„Herz 3 – Neu: Hand berühren“** und höchstens einen direkten Einstieg „Ausprobieren“. Der persönliche Moment bleibt über dasselbe Herz erreichbar; keine zusätzliche Karte mit mehreren neuen Buttons. Der Hinweis bleibt bis zur nächsten bewussten Aktion lesbar, statt nach zwei Sekunden zu verschwinden. Danach übernimmt wieder der passende Fortschrittssatz; das neue Herz behält seine kleine „Neu“-Markierung, bis sein Moment angesehen wurde. Keine zusätzlichen Meldungen übereinander und kein großes Feuerwerk für bereits bekannte Inhalte.

- Die Figur reagiert passend zur aktuellen Szene. Bulk 1 lässt die alte Kopfreaktion unverändert; ein späteres bewusst geprüftes UX-Paket kann in der Standardansicht die vorhandene Freude verwenden. Am Tresen/Fenster die lokale freundliche Reaktion, kein alter Stehclip.
- Neue Hotspots einmal sanft markieren. Alle bleiben danach ruhig; kein dauerhaftes Blinken vieler Herzen gleichzeitig.
- Die Feier blockiert weder Zurück noch den nächsten sinnvollen Schritt und verändert die gewohnte Anordnung nicht. Keine automatisch gestartete mehrteilige Geschichte.
- Bei reduziertem Bewegungswunsch statisches gefülltes Herz, Text und derselbe optionale Klang. Statusmeldung für Screenreader ohne wiederholtes Vorlesen jeder Animation.
- Reload spielt eine verdiente Belohnung nicht erneut aus. Ein noch ungesehener Moment bleibt als „Neu“ auffindbar. Ein Speicherfehler löst weder die Erfolgsmeldung noch Punkte/Geschenkverbrauch aus.

### Audio bleibt unabhängig von der Clipdauer

Die neuen Videos bleiben stumm. Bestehende Musik, Stimmenpools, Lautstärken, Zufall ohne direkte Wiederholung, Überlappungsschutz und 2,5-s-Mindestabstand der Tavernenstimme bleiben im Austauschpaket unverändert. Kein zusätzlicher Klang durch Loopende, Szenenladen oder erneutes Abspielen eines gespeicherten Moments.

Eine Stimme darf über das Ende eines kurzen Reaktionsvideos hinauslaufen; sie wird nicht passend zur Videolänge gestreckt, neu gestartet oder abgeschnitten. Bestehende Stopregeln bei Figurenwechsel, Schließen, Tabverlust, Mute und Verlust des aktiven Speicherbesitzes erhalten. Keine falsche Lippensynchronität versprechen.

Für später hinzukommende Hand-/Wangenaktionen und Ortswechsel das Ereignis bewusst festlegen: Hand/Wange als bestätigte erlaubte Berührung nutzen den passenden vorhandenen Pool, ein reiner Ortswechsel erzeugt keine Berührungsstimme. Ein laufender Satz darf beim Ortswechsel ausklingen; eine neue Reaktion drängt keinen zweiten Satz darüber. Ernsthafte Geschichten erhalten keine zufällige Berührungsstimme. Geschenk- und Herzklang nicht doppeln, wenn eine Aktion beides auslöst.

### Weitere kleine Verbesserungen mit hohem Nutzen

- Persönliche Momente weiter über die vorhandenen Herzen aufrufen; Titel und „Neu“ bei Bedarf dort verständlich zeigen. Neue Zwischengespräche über Sprechen/Plaudern anbieten. Keine zusätzliche Sammlung, Chronik oder Bibliothek für die Taverne bauen.
- Beim Wiederkommen ein kurzer, zum tatsächlichen Stand passender Satz: offenes Gespräch, Einladung oder fertiges Geschenk. Keine künstlichen Aussagen über eine Abwesenheitsdauer, die nicht zuverlässig gespeichert wurde.
- Höchstens die zuletzt gewählte Figur und ihren Ort automatisch merken, soweit es zum vorhandenen Öffnungsverhalten passt. Keine Favoriten-/Pin-Verwaltung hinzufügen; beide Beziehungen bleiben unabhängig und ohne Fortschrittsstrafe für einen Wechsel.
- Erstes Laden freundlich mit passendem Standbild auffangen; bekannte Aktionen gezielt vorladen. Keine Downloads aller Szenen, Outfits und Figuren beim Spielstart.
- Spiel auf Englisch und Deutsch gleich vollständig halten; kurze mobile Texte und erklärende Details trennen. Gesperrte Zustände auch ohne Farbwahrnehmung erkennen können.

## 8. Umsetzung in Bulks

Die Reihenfolge schützt den bereits freigegebenen Bestand und ermöglicht kleine überprüfbare Lieferungen. **Die bulkweise Umsetzung ist seit 07.11.2026 beauftragt.** Der zusammenhängende Auftrag erfordert nicht für jede Checkbox eine neue Rückfrage. Die gewünschten visuellen Clip-Abnahmen bleiben erhalten; erst geprüft abgeschlossene Schritte werden abgehakt. Optionale spätere Erweiterungen aus Bulk 9 werden nach dem vollständigen ersten Bogen konkretisiert.

### Bulk 0 — Ausgangsstand und verbindliche Zuordnung

**Abgeschlossen · 07.11.2026:** Frisch abgeglichenes Main `daf39fb`, isolierter Branch `codex/tavern-comfy-integration` unter `.worktrees/tavern-comfy-integration`. 15 freigegebene Master per SHA-256 geprüft; 253 alte Dateien / 49.038.130 Byte archiviert und vollständig in ein separates Verzeichnis wiederhergestellt und per Hash verglichen. Vier Desktop-/Handyaufnahmen der unveränderten Oberfläche ohne Browserfehler. Alte Pfade für historische Vorschauen und Einführungsporträts erhalten.

- [x] Auf aktuellem Main eine isolierte Arbeitsbasis unter `codex/` erstellen; parallele Änderungen, aktuelle Regeln und bestehende Speicherkennungen abgleichen.
- [x] Die bestehende Tavernenansicht auf Desktop und Handy als Vergleich festhalten: Stil, Figurenfläche, Herzen, Dialog, drei Hauptaktionen und Rückwege. Diese Anordnung ist die Grundlage, kein Entwurf für einen vollständigen Umbau.
- [x] Die 15 freigegebenen Revisionen samt Prüfsummen aus dem Austauschplan übernehmen; verworfene Versuche nicht als Quelle verwenden.
- [x] Vollständige alte Laufzeit-Atlanten, Manifest, Porträts, Quellenzuordnung und Player-/Konfigurationsstand unter `archive/tavern-animations/pre-comfy-2026-11-06/` sichern; vorhandene Zeichnungen/Rigs erhalten.
- [x] Vor einem Umhängen von Pfaden alle Verbraucher finden: Hauptspiel, historische Vorschauen, Tests, Builds. Archiv außerhalb automatischer Produktions-Globs halten; historische Vorschauen nicht durch Verschieben brechen.
- [x] Wiederherstellung der alten **Darstellung** anhand der archivierten Dateien und Prüfsummen nachweisen. Keine alte inkompatible Spielstandversion als Rollback installieren.

**Abnahme:** Genau 15 eindeutige aktuelle Quellen, vollständiges wiederverwendbares Altarchiv, keine Löschung und keine unbeabsichtigte Spielregeländerung.

### Bulk 1 — Freigegebene Videos in die bestehende Taverne übernehmen

**Technisch abgeschlossen · 07.11.2026:** 15 Rollen einschließlich echter Stimmen/Geschenkverbrauch und gezielter Fehlerfälle bestanden. Echtes Hauptspiel bei1280/320px samt regulärem Fortsetzen und Reload ohne Seitenfehler/alte Atlasbild-Downloads. 35/35 Regressionstests und Produktionsbuild bestanden. Visuelle Nutzerabnahme der Integration offen. [Prüfbericht](../../../artifacts/idle-bastion/tavern-implementation-2026-11-07/REPORT.md).

Abhängig von Bulk 0. **Reiner Darstellungstausch.**

- [x] Video-Adapter hinter der bisherigen Player-Schnittstelle bauen; H.264 zunächst direkt nutzen, 24 FPS/Tempo erhalten. Falls nötig nur Web-Auslieferung/Startbereitschaft optimieren; Master unverändert behalten.
- [x] 480 × 704 auf den bisherigen logischen 480 × 700-Ausschnitt ausrichten, zunächst per Darstellung statt verlustreicher Neuberechnung. Gleiche Figurengröße, Anker, Vordergrundrahmen und Hotspots prüfen.
- [x] Eingebackenen Tavernenhintergrund mit Bühne und seitlichen Flächen abstimmen; keine doppelte Raumzeichnung oder sichtbare rechteckige Naht. Wenn die Komposition nicht sauber passt, zunächst die Probe korrigieren, nicht alle Clips neu freistellen.
- [x] Kleine reale UI-Probe mit Mara/Ilyra: Idle, je eine Reaktion und Ilyras separate Hüftpose. Erst nach stimmiger Wiedergabe alle 15 zuordnen.
- [x] Bestehende Zuordnung exakt erhalten: M01/I01 idle, M02/I02 head, M03/I03 touch, M04/I04 variant, M05/I05 giggle, M06/I06 joy, M07 tease, M08/I07 hip. Herzaufstieg und Geschichten weiterhin wie bisher.
- [x] Kürzere Idle-Dauer nicht versehentlich in häufigere Varianten übersetzen: bisherige Größenordnung von drei alten Idle-Loops erhalten, Mara etwa 15 s, Ilyra etwa 18 s vor der Variante.
- [x] Ladefehler, jüngste Folgeaktion, Rückkehr zu Idle, Loopnaht, Figurenwechsel, Close/Tabwechsel und Freigeben der Medien prüfen. Kein schwarzer oder fremder Zwischenframe.
- [x] Audio, Geschenktransaktionen, Herzgrenzen und Kampf-/Tavernenpause unverändert im echten Ablauf gegenprüfen.
- [x] Desktop sowie 390/320 px ansehen; Browserprüfung und gegebenenfalls tatsächlich verfügbares Mobilgerät getrennt dokumentieren. Paketgröße messen, alten Assetdownload im normalen neuen Pfad ausschließen.

**Abnahme:** Alle 15 Clips laufen in der richtigen bisherigen Situation. Die neue Darstellung ist visuell abgenommen; Belohnungen, Stimme und Bedienung funktionieren wie zuvor. Rahmen, Hauptaktionen und Navigation entsprechen weiterhin der vertrauten Taverne. Keine neuen Herzen oder Berührungen aus diesem Bulk ableiten.


### Bulk 2 — Verständliche Fortschrittsanzeige und Herzfreude

**Technisch abgeschlossen · 07.11.2026:** zwölf Browserfälle zu58/18,47/30 und58/30 bei1280/320px inDE/EN; alle Hinweise ohne Öffnen der Details sichtbar, drei Hauptaktionen, kein Überlaufen. Erklärbare Herzen, gespeicherter Herzaufstieg und Ausprobieren geprüft. 35/35 Tests und Build bestanden. Die letzte Checkbox bleibt wegen ausstehender ungeführter menschlicher Verständnis-/Sichtprobe offen.

Abhängig von Bulk 1; benötigt keine neue KI-Animation.

- [x] Den vorhandenen Hinweisbereich mit einem kurzen kontextabhängigen Satz aus Abschnitt 3 verbessern; bei Bedarf zwei kurze Zeilen. Alle aufgeführten Sperr-/Bereitzustände abdecken, ohne zusätzliche Aufgabenkarte oder parallele Zahlenbalken.
- [x] Mobil den aktuell fehlenden Schritt direkt erklären. Exakte Punkte/Reserve-/Gesamtzähler in den vorhandenen Detailbereich legen; gesperrte Herzen zeigen ihre Erklärung ohne Untermenü. Der aktuelle Sperrgrund darf nicht nur dort stehen.
- [x] Bestehende Karte-/Tavernenhinweise unterscheiden Besitz, Einlösbarkeit und Neues; keine zusätzlichen Statuskacheln. Schenken bleibt der bekannte direkte Bedienweg, Rückkehr zum Kampf respektiert manuelle Pause.
- [x] Herzfüllung, kurzer Glanz, bestehender Klang und lesbarer Hinweis am bestehenden Platz umsetzen; höchstens ein direkter Einstieg „Ausprobieren“. Persönliche Momente weiterhin über die Herzen, ohne neue Karte oder Dialogebene.
- [x] Eine passende Aufstiegsreaktion bewusst zuordnen und prüfen, ohne Audio zu verdoppeln oder ernsthafte Momente in Jubel zu verwandeln.
- [x] DE/EN, Tastatur, Touch, Screenreader-Status und reduzierte Bewegung berücksichtigen.
- [ ] Ungeführte Verständnisprobe zu 58/18, 47/30 und 58/30 sowie nach Wiederkehr durchführen; beobachtete Irrtümer beheben. Mit der bestehenden Ansicht vergleichen: gleicher Stil und bekannte Wege, keine zusätzliche Menüebene, keine wesentlich kleinere Figur durch neue Hinweise.

**Abnahme:** Der Spieler kann ohne Hilfe sagen, was fehlt und was er als Nächstes tun kann. Kein unkommentiert stillstehender Balken und keine Pflicht, dafür einen Hilfetext zu suchen. Gleichzeitig bleiben drei Hauptaktionen, vertraute Anordnung und Figurenfokus erhalten; zusätzliche Zahlenkarten oder verschachtelte Erklärungen bestehen die Abnahme nicht.


### Bulk 3 — Vier fehlende Standardreaktionen

**Abgeschlossen:** Beide eigenen Handreaktionen sind nach Nutzerfreigabe integriert. M09 v3 ersetzt das beanstandete Fingerzucken; I08 bleibt die freigegebene Fassung. Neue M10/I09 werden nach Nutzervergleich nicht verwendet, M02/I02 bleiben bewusst für Gespräche erhalten. Kein weiterer Standardclip wird ohne konkreten Bedarf neu produziert.

Abhängig von Bulk 1; kann nach Bulk 2 unabhängig vom neuen Szenensystem abgenommen werden.

- [x] M09 erzeugt und verglichen: v1 verworfen (fremde Hand), v2 ohne fremde Hand. Nutzer findet Bewegung/Blick gut, beanstandet Fingerzucken.
- [x] Notwendige M09-Korrektur v3 erzeugt; vollständige Bildfolge und Handdetails geprüft, Vergleich im Chat gezeigt. Finger wirken in der eigenen Sichtkontrolle ruhiger.
- [x] M09 v3 vom Nutzer ausdrücklich freigegeben (07.11.2026), unverändert eingebunden und im echten UI geprüft; keine Freigabe aus technischen Tests abgeleitet.
- [x] I08/Hand aus gleicher Ilyra-Referenz einzeln erzeugt (73Frames/3,04s;234,4s Renderzeit); vollständige Bildfolge, Gesicht/Hände und Ränder kontrolliert. Keine fremde Hand; **Vom Nutzer freigegeben**; eigener Handclip lokal integriert, bildlinker Kontaktpunkt passend gesetzt. Echte UI: Hand→I08, Lachen→I05, Gespräch/Haare→I02, Schulter→I03; Stimmen, Stoppen beim Schließen und unveränderte Punkte/Geschenke geprüft.
- [x] M10 erzeugt und verglichen; Nutzer bevorzugt die bisherige M02-Fassung (linker Clip). **M02 für Gespräche behalten, neue M10 nicht verwenden.** Keine weitere Neuproduktion nötig.
- [x] I09 erzeugt und verglichen; Nutzer bevorzugt die bisherige I02-Fassung (linker Clip). **I02 für Gespräche behalten, neue I09 nicht verwenden.** Bestehende Haare-/Schulter-/Lachclips erhalten.
- [x] Freigegebene Handreaktionen dem tatsächlichen Herz-3-Handkontakt zugeordnet; Lachen bleibt M05/I05. M02/I02 für neutrale Gespräche ausdrücklich weiterverwenden; deren passende Mehrfachnutzung ist nach Nutzerentscheidung akzeptiert.
- [x] Beide Handclips vom Nutzer abgenommen; echte UI auf Desktop/390px geprüft: Hand→M09/I08, Lachen→M05/I05, Gespräch/Haare→M02/I02, Schulter→M03/I03; separate Stimmen laufen/stoppen, keine unerwarteten Punkte/Geschenke oder Browserfehler. Bildlinke Handanker Mara(117,590), Ilyra(102,568).
- [x] Eigene optionale Handrolle eingeführt: Ilyra nutzt I08; Mara nutzt den freigegebenen M09 v3. Keine neue globale Hand→Kichern-Abkürzung. TypeScript, Diffprüfung und gezielte Chrome-UI-Probe ohne GPU bestanden.

**Abnahme:** Freigegebene eigene Handreaktionen spielen passend zum gewählten Kontaktpunkt; bewährte M02/I02 bleiben nach Nutzervergleich die Gesprächsreaktionen. Die freigegebenen 15 Clips bleiben erhalten und sinnvoll verwendet. Keine Neuproduktion nur um eine formale Cliptrennung zu erzwingen.

### Bulk 4 — Herz 2 bis 3 mit kleinen Begegnungen füllen

**Technisch abgeschlossen, menschliche Inhalts-/Spielgefühlprobe offen.** Schema 38 ergänzt ausschließlich Begegnungsrecords; Kampfregeln 21 und Herz-/Geschenkvoraussetzungen bleiben erhalten. Acht Browserfälle mit beiden sichtbaren Antworten, Sprachwechsel, Saveablehnung, Doppeltipp, Fortsetzen und neutralem Zweig bestanden. Vollsuite 512/512, Produktionsbuild und echtes Hauptspiel/Reload bei1280/320px bestanden. [Nachweise](../../../artifacts/idle-bastion/tavern-implementation-2026-11-07/REPORT.md).

Abhängig von Bulk 2; Die bewährten M02/I02 liefern nach Nutzerentscheidung bereits passende neutrale Animationen; keine neue Gesprächsproduktion erforderlich.

- [x] Je Figur zwei kurze Begegnungen bei 10/20 der bestehenden 30 Siege schreiben, mit je einer kleinen Wahl und späterem Rückbezug.
- [x] Neue Dialoge mit vorhandenen Geschichten abstimmen; versprochene Handlungen/Orte noch nicht als schon benutzbar darstellen.
- [x] Verfügbarkeit, ungesehene Begegnungen und tatsächlich getroffene Entscheidungen dauerhaft je Figur speichern; übersprungene Wahl neutral behandeln.
- [x] Neue Gespräche über Sprechen/Plaudern und Antwortoptionen direkt im bestehenden Dialog anbieten. Kein Begegnungsarchiv oder zusätzlicher Haupttab; Wiederholung der Herzmomente bleibt an den Herzen.
- [x] Beim Erreichen mehrerer Meilensteine nichts verlieren, nichts automatisch nacheinander aufzwingen und keinen Siegfortschritt zurücksetzen.
- [x] Persönliche Geschenke erzählerisch konkretisieren; normale Geschenke und ihre begrenzte Rolle verständlich halten.
- [x] Tatsächlichen Weg zu Herz 3 mit schwächerer, normaler und überlegener Verteidigung sowie beiden Figuren prüfen. Gemessene reguläre Farmfälle: 10:02–11:37 Minuten Kampfzeit für30 Siege; beide Figuren parallel gleich schnell. Engine-Einstiegswellen-Randfall4:41, daher keine harte5-Minuten-Grenze. Aktive Simulationszeit und nicht gemessene reale Bedien-/Lesezeit ausdrücklich getrennt. [Methodik](../../../artifacts/idle-bastion/tavern-implementation-2026-11-07/bulk4-timing/REPORT.md).

**Abnahme:** Vor Herz 3 gibt es zwei echte neue Begegnungen; Fortschritt und Wiederholung bleiben frei, keine zusätzliche verdeckte Dialogsperre.

### Bulk 5 — Mara am Tresen als vollständige Probe

Abhängig von Bulk 1–4. Zuerst isolierte Vorschau; Herz 4 noch nicht im Hauptspiel öffnen.

- [x] Vorhandene aufrechte Tresen-Grundpose und festen Hintergrund als gemeinsame Szene ausgewählt; Identität/Kleidung gegen Mara abgeglichen. Gemeinsame Referenz über Comfy-Bildknoten geprüft: Original1086×1448 → Crop[99,0,987,1448] →480×704, beide Hände vollständig sichtbar und Proportionen erhalten. [Vorprüfung](../../../artifacts/idle-bastion/tavern-implementation-2026-11-07/bulk5-preflight/REPORT.md).
- [ ] Alten V2-Clip prüfen und entscheiden, ob er im neuen Set stimmig wiederverwendet oder mit ComfyUI neu umgesetzt wird. Die tiefe Ellbogenstütze nicht als fertigen Übergang behandeln.
- [x] Kleine Qualitätsprobe MC01/Idle(3,75s) und MC05/Hand(3,04s) nacheinander erstellt, vollständig kontrolliert und beide vom Nutzer ausdrücklich freigegeben. Gemeinsame Ruhe→Hand→dieselbeRuhe-Vorschau aufDesktop/320px und gezielter Ladefehler bestanden; erst danach MC02 gestartet. Keine Spielintegration des Teilsets.
- [x] MC02 und MC03 fertiggestellt und einzeln vom Nutzer visuell freigegeben.
- [ ] MC04, MC06 und MC07 mit gleichen Referenzen fertigstellen und einzeln abnehmen; Produktion auf Nutzerwunsch zurückgestellt.
- [ ] Szenenkatalog mit Anfangs-/Endpose, lokalen Aktionen, Hotspots und Fehlerverhalten umsetzen. Versehentliche Verweise auf Standardclips technisch zurückweisen.
- [ ] Einladung mit „Mitkommen“, Vorladen, bewussten Szenenschnitt und direkte Rückkehr prüfen. Spätere Ortswechsel über einen kontextabhängigen Eintrag im vorhandenen Sprechen-Menü; keine Orts-/Poseauswahl oder zusätzliche Navigationsleiste. Den letzten Ort gegebenenfalls automatisch merken.
- [ ] Alle drei Berührungen, Gespräch, Lachen, Kompliment mit besonderer Annäherung, Necken und Geschenk am Tresen durchspielen. Bekannte Hauptaktionen und Gestenwege erhalten; Audio und Punkte unabhängig vom Szenenwechsel halten.
- [ ] Standard → Tresen → Hand → Kompliment/Annäherung → Haare → alter Rückblick → Tresen → Standard prüfen, einschließlich schneller Eingaben und Ladefehler. Kein eigener zusätzlicher Bedienweg für die Annäherung.

**Abnahme:** Man kann wirklich am Tresen bleiben und mit den vertrauten Aktionen interagieren. Keine Aktion spielt unbemerkt die stehende Mara oder eine unpassende Grundpose. Eine einzelne schöne Vorbeuge genügt nicht als Abschluss dieses Bulks; ein zusätzliches Raumverwaltungsmenü ebenso wenig.

### Bulk 6 — Ilyras Fensterplatz und spielbare Herz-4-Etappe

Abhängig von der vollständigen Mara-Probe. Gemeinsame Herz-4-Veröffentlichung erst mit beiden vollständigen Sets.

- [ ] Ilyras bestehende Kleidung und Identität in eine eindeutig gezeichnete Fenster-Grundpose übernehmen; ruhiger Abend, kein unbegründeter Wind oder neue Frisur.
- [ ] IF01/Idle und IF05/Hand zuerst prüfen, anschließend IF02–IF04 und IF06–IF07 nacheinander ergänzen. Gleiche Szene-/Aktionsregeln wie Mara, eigene Persönlichkeit.
- [ ] Je Figur zwei kleine Begegnungen für die Herz-3→4-Strecke schreiben; nur produzierte Erlebnisse ankündigen.
- [ ] Vorschlag 98 Punkte / 40 neue Siege / Einladung → 110 implementieren und messen; Zählerbeginn beim tatsächlichen Erreichen von Herz 3, keine alten Siege erfinden.
- [ ] Herz-4-Einladung über den bestehenden Hinweis und direkten Einstieg anzeigen; spätere Besuche über Sprechen. Keine neue Freischaltungs-/Raumübersicht. Bestehendes Mara-Necken in der Standardansicht freischalten, am Tresen passende lokale Variante verwenden.
- [ ] Alte Herz-4-/5-Saves erhalten den nun verfügbaren Ort ohne erneuten Grind. Früher ungesehene neue Inhalte optional anbieten; keine bereits verdienten Punkte abziehen.
- [ ] Beide Szenen samt aller Aktionen in echter Oberfläche prüfen; fehlende Downloads dürfen kein gemischtes Szenenset erzeugen.

**Abnahme:** Herz 4 bedeutet für beide Figuren ein dauerhaft besuchbares neues Erlebnis mit vollständiger Bedienung. Der Weg dorthin ist verständlich und enthält mehr als einen längeren Zähler.

### Bulk 7 — Herz 5, Abschluss und Geschenkbilanz

Abhängig von Bulk 6.

- [ ] MC08/IF08 als eigene Wangenreaktionen und MC09/IF09 als kurzen Abschluss produzieren; sämtliche Clips bleiben in der jeweiligen Treffpunktpose.
- [ ] Den vorhandenen fünften Herzmoment mit den neuen Bildern verbinden; je Figur zwei kleinere vorherige Begegnungen ergänzen.
- [ ] Vorschlag 148 Punkte / 50 neue Siege / Abschluss → 160 prüfen. Aufstieg bewusst auslösen; keine Geschenkstapel-Abkürzung, keine Pflicht zum nächsten Kalendertag.
- [ ] Herz 5 zeigt im vorhandenen Hinweis konkret Wangenkontakt am jeweiligen Ort und den verdienten Abschluss. Für den Ortswechsel den direkten bestehenden Gesprächseintrag nutzen; keine weiteren gesperrten Hotspots oder Auswahlmenüs in der Standardansicht hinzufügen.
- [ ] Bei voller Beziehung alle verdienten Treffen, Berührungen und Geschichten erhalten. Keine nutzlosen Punkteaufforderungen, keine erneuten Geschenkpreise für Rückblicke.
- [ ] Geschenkzufluss/-verbrauch für eine Favoritin und beide parallel messen; erst anhand des vollständigen Bogens Dropzahl/Vorratsgrenze gegebenenfalls nachjustieren.
- [ ] Frühere Herz-5-Saves erhalten verdiente neue Freischaltungen ohne verlorene Inhalte; neue Aufgabenhinweise erfinden keine bereits getroffenen Dialogentscheidungen.

**Abnahme:** Ein vollständiger erster Beziehungsbogen mit sichtbarem Abschluss, sinnvoller Geschenkrolle und mehreren wiederbesuchbaren Erlebnissen. Keine neue Inhaltslücke unmittelbar hinter dem nächsten Herz.

### Bulk 8 — Gemeinsame Abnahme und Lieferung

Bei jeder Lieferung kompakt auf deren Änderungen anwenden; zum vollständigen Bogen die verbundenen Abläufe zusammen prüfen.

- [ ] Eine Favoritin und beide Figuren parallel vom frischen Einstieg aus durchspielen; nach Herz 2 und mitten in einer neuen Etappe schließen/laden/fortsetzen.
- [ ] Grenzen, atomaren Geschenkverbrauch, doppelte Eingabe, abgelehnten Save, Schreibbesitz, Offline-Ertrag und keine Belohnung durch Videoende/Replay prüfen.
- [ ] Alle Aktionspfade pro Szene, drei Berührungszonen, Ortswechsel während des Nachladens, Wiederholung und Rückkehr aus Geschichten prüfen.
- [ ] Bestehende Stimmen und Musik hörbar prüfen: kein Doppeln, kein Abschneiden am Clipende, richtige Figur, Stopregeln und Regler unverändert.
- [ ] Langsames/fehlerhaftes Laden, Desktop, 390/320 px, Sprachwechsel und reduzierte Bewegung prüfen; echte Mobilgeräte nur als geprüft nennen, wenn tatsächlich getestet.
- [ ] Kleine ungeführte Verständlichkeitsprobe und subjektive Bewertung von Spannung/Tempo durchführen; technische Tests nicht als diese Nutzerabnahme ausgeben.
- [ ] Gegen die Ausgangsansicht prüfen: gleiche Gestaltung und drei Hauptaktionen, Rückblicke weiterhin an den Herzen, Zusatzdetails in einem Schritt, Ortswechsel direkt, keine Archiv-/Favoriten-/Raumverwaltung. Bei mehr sichtbarer Verwaltung oder spürbar mehr Verschachtelung zuerst vereinfachen.
- [ ] Passende Regressionstests und Produktionsbuild, tatsächliche Ergebnisse und verbleibende Grenzen dokumentieren; nur betroffene Prüfungen wiederholen.
- [ ] Archivwiederherstellung und Save-Verträglichkeit bestätigen. Hauptspielumschaltung/Veröffentlichung erst im dann autorisierten Umfang; tatsächliches Ergebnis nachweisen.

**Abnahme:** Darstellung, Fortschritt, Inhalt und Audio funktionieren als zusammenhängendes System. Die Taverne wirkt weiterhin wie derselbe persönliche, leicht bedienbare Ort. Ausstehende Sicht- oder Spielgefühlentscheidungen bleiben ausdrücklich offen.

### Bulk 9 — Optionale Outfits und weitere Posen

Nach dem vollständigen ersten Bogen; keine Voraussetzung für Bulk 0–8.

- [ ] Zuerst je Figur höchstens ein Freizeit-Outfit an einem bestimmten Treffpunkt entwerfen, mit eigener Sichtabnahme und klarem Erwerbsweg.
- [ ] Für ein **interaktiv auswählbares** Outfit sämtliche dort angebotenen Idle-/Berührungs-/Gestenclips im gleichen Outfit bereitstellen. Nicht nach einer Berührung unbemerkt zurück in Standardkleidung wechseln.
- [ ] Falls zunächst nur ein besonderes Abendvideo im neuen Outfit entsteht, es ehrlich als wiederholbaren Moment anbieten, mit „Erneut ansehen“ und „Zurück“. Kein globaler Outfitumschalter und keine scheinbar verfügbaren Berührungen.
- [ ] Tiefe Ellbogenstütze oder zusätzliche Räume nur mit eigener Szene-/Posenentscheidung und vollständigem benötigtem Reaktionsumfang planen. Vorhandene Einzelbilder sind Referenzen, kein fertiger Bedienumfang.
- [ ] Erwerb kosmetischer Wünsche nach beiderseitigem Beziehungsabschluss absichern; keine dauerhaft unerfüllbare Geschenkforderung.

**Abnahme:** Jede angebotene Kombination aus Ort, Pose, Outfit und Aktion ist tatsächlich vorhanden. Kleine vollständige Pakete haben Vorrang vor vielen halbfertigen Varianten.

## 9. Produktions- und Speicherregeln für alle Pakete

### Animation

- Neu präzisiert am 07.11.2026: Bewährte Prompts/Scripts der freigegebenen M01–M08/I01–I07 bleiben die Qualitätsgrundlage. Neue Reaktionen dürfen deutlicher flirty und neckisch werden: bewusster Blickkontakt, wissendes Lächeln, kurze gespannte Pausen und passende Annäherung. Idle bleibt dezent; Intensität entsteht in den Reaktionen mit kontrollierten Bewegungen und weiterhin stabiler Anatomie.
- Kamera und Hintergrund bleiben in einer Szene fest. Gleiche Figur, Kleidung, Haare, Accessoires und Proportionen; kein Fotorealismus.
- Nie fremde Hände. Klare kleine Reaktionen statt schwieriger Mehrpersonenbewegungen.
- Idle: fast ruhige Arme, dezente Atmung und Mimik, keine Halsstauchung, kein unmotiviertes Haar-/Umhang- oder Brustwackeln.
- Lachen, Freude und nachvollziehbare Körperbewegung: natürliche moderate Folgebewegung, die mit dem Körper ausklingt. Kein losgelöstes Wackeln nach dem eigentlichen Impuls.
- Meist unter fünf Sekunden, so kurz wie gut lesbar. Bestehende Laufzeiten nicht ohne konkreten Grund verdoppeln. Ein klares Wahrnehmen, Reagieren und kurzes Halten ist wichtiger als die absolute Kürze.
- Referenz pro Szene zuerst festlegen. Anfang und Ende auf dieselbe Ruhepose ausrichten, tatsächliche Frames prüfen; eine Promptvorgabe garantiert keine passenden Anschlüsse.
- Auf diesem Laptop weiter einzeln rendern, keine parallelen GPU-Aufträge. Keine neue Großserie vor Abnahme von Idle plus einer repräsentativen Reaktion.
- Ganze Framefolge und Gesicht/Hände/Hals/Bildränder prüfen, dann Übergänge in echter UI. Prüfsummen und verworfene Versionen erhalten. Nutzersichtprüfung bleibt entscheidend.

### Speicherung und Migration

- Bulk 1 benötigt keine neuen Beziehungswerte. Darstellungswechsel dürfen die Save-Regeln nicht verändern.
- Neue inhaltliche Entscheidungen und Etappenzähler in den vorhandenen dauerhaften Spielzustand mit Validierung/Migration aufnehmen; nicht als zweite unabhängige Zuneigungsquelle in `localStorage` führen.
- Reine Orts-/Anzeigepräferenzen und „schon angesehen“ können als getrennte UI-Historie bestehen, solange ihr Verlust keine verdienten Inhalte sperrt. Vorhandene `TavernStoryHistory` bei Migration berücksichtigen.
- Verfügbarkeit von Geschichten, Orten und Berührungen aus dauerhaft verdienten Werten ableiten. Ein „gesehen“-Flag ist kein Freischaltschlüssel.
- Einmalige neue Etappenabschlüsse und Geschenkverbrauch atomar speichern. Nach Savefehler keine Feier, keine vorweggenommene Freischaltung und kein verlorener Bestand.
- Bekannte höhere Altstände ohne Nachgrind erhalten. Zwischenstände nicht nach unten auf neue Zwischenobergrenzen kappen; bereits überschrittene Punktbedingungen gelten als erfüllt. Nur zukünftig benötigte Siegabschnitte beginnen ohne erfundene Historie.
- Scene-/Clip-Ladezustände sind kurzlebige Darstellung. Nach einem Fehler oder Reload an einer sicheren freigeschalteten Ruhepose fortsetzen; kein erneut gewährter Aufstieg.

## 10. Was dieser Plan ausdrücklich nicht behauptet

Die neuen Standardclips sind visuell freigegeben; ihre Spielintegration ist noch nicht geprüft. Tresen-V2 ist eine vorhandene bevorzugte Vorlage, kein bereits vollständig ausgelieferter Herz-4-Ort. Die genannten Zeiten und späteren Siegziele sind Zielkorridore beziehungsweise Testvorschläge. Verständlichkeit, endgültiges Tempo und die Wirkung der neuen Szenen werden erst durch die aufgeführten Prüfungen bestätigt.

Für diesen Plan wurden aktuelle gespeicherte Main-Quellen, die aktuelle Anzeige-/Aktionslogik, Audio-/Story-Historie und vorhandene Tresen-Dokumentation und Vorschauaufnahmen gelesen beziehungsweise angesehen. Die anschließende Nutzerpräzisierung ist in den Oberflächenregeln, Textbeispielen, Szenenabläufen und Bulk-Abnahmen berücksichtigt: gezielte Verbesserung der vertrauten Taverne, kein vollständiger Umbau. Diese Aussage beschreibt die abgeschlossene Planungsphase; die anschließend beauftragte Umsetzung ist oben je Bulk dokumentiert. Aktuell: Bulk 0 abgeschlossen, Bulk 1/2 lokal technisch abgeschlossen und menschliche Integrations-/Verständnisabnahme offen. Bulk 3 abgeschlossen: M09 v3/I08 freigegeben und lokal geprüft integriert; M02/I02 bleiben. Bulk 4 technisch abgeschlossen und nachgewiesen; Bulk 5 besitzt mit MC01/MC02/MC03/MC05 vier freigegebene Probeclips; das restliche Set und Bulks 6–9 bleiben Zukunft. Der vorhandene Herz-1–3-Umfang ist inzwischen auf Main veröffentlicht; daraus folgt kein Startauftrag für weitere Renderings.
