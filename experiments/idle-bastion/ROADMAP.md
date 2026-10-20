# Roadmap und Arbeitschecklisten — SPIRE: Idle Bastion

Stand: 20.10.2026 · **B01–B13 und beauftragte Nachbesserungen veröffentlicht; B14/G2 offen. Akt II: B15a, F01 und B17a veröffentlicht; B15b veröffentlicht und kompakt geprüft. B16 und B17b–B22 bleiben geplant. B12d bleibt separat.**

Diese Datei ist das Arbeitsboard: Phasen geben die Reihenfolge vor, Arbeitspakete bündeln ein prüfbares Ergebnis, Checklisten machen die verbleibende Arbeit sichtbar. Die verbindlichen Spielregeln stehen im [Auftrag](README.md), technische Einzelheiten in [TECHNIK.md](docs/TECHNIK.md), Grafikregeln in [ART_DIRECTION.md](docs/ART_DIRECTION.md) und Prüfszenarien in [ABNAHME.md](docs/ABNAHME.md).

Neu: [Akt II — Pakete B15–B22, Bestand und Parkliste](#akt-ii) · [Kompakte Gestaltungs- und Technikentscheidungen](docs/AKT_II.md). Alle bisherigen Pakete, Nachweise und Entscheidungen bleiben erhalten.

## Aktueller Stand

| Feld | Stand |
| --- | --- |
| Branch | `codex/idle-bastion-vertical-slice` |
| Ausgangscommit | `5667aaeda3140e2797532894c524a32eb10af1cc` |
| Ablage | `experiments/idle-bastion/` im eigenen Worktree |
| Autorisierter Umfang | B01–B07, UI-Überarbeitung B07a und Fortschritts-/HUD-Ergänzung B07b einschließlich funktionalem Hochkant, zusätzlicher Premium-Überarbeitung mit 3–4 Imagegen-Assets und Commit/Push/Pages beauftragt. Zusätzlich B08–B12 ausdrücklich beauftragt; zusätzlich B12a ausdrücklich beauftragt: Bauflächen, Figuren, Siedlung und Kampfdarstellung. B12b Karten-/Kameraanpassung und anschließend B12c vorhandene Gegner ausdrücklich beauftragt; B12d Gegner-Pipeline nur planen. B13 am 19.10.2026 ausdrücklich beauftragt; anschließend HUD-Balken beheben und Gegner-/Einstiegsvorschläge ausarbeiten. Neuer Einstieg mit Mara und selbst gebautem Startturm ausdrücklich zur Umsetzung mit Save-Erhalt, kompakten Tests und Commit/Push beauftragt |
| Aktueller Auftrag | Nachbesserung Turmbau-Kamera: Ausschnitt und Zoom bei normaler Turmauswahl für alle Typen erhalten; kompakte Prüfung und Veröffentlichung |
| Spielfassung dieses Branches | B15b Ilyra und Tavernenübersicht auf Basis von B17a · [Playlink](https://emfau88.github.io/TD/idle-bastion/) · [Prüfbericht](../../artifacts/idle-bastion/acceptance/b15b/REPORT.md) |
| Nächster Schritt | B15b über den Playlink testen; anschließend B16/Sturmlicht nach Startauftrag. B17b/Ostgebiet, B14/G2 und B12d bleiben getrennt offen |
| G1: 90-Sekunden-Zwischenabnahme | **Freigegeben am 18.10.2026; Wortlaut unten** |
| G2: vollständiger Slice | **Offen; keine Nutzerfreigabe vorhanden** |

Vorhandene klassische Spielfunktionen zählen nicht als fertige Idle-Funktionen. B01–B07 sind abgeschlossen und die Fassung ist auf GitHub Pages testbar. G1 ist freigegeben. B11 ist am 18.10.2026 ausdrücklich mit kompakten Tests und Commit/Push/Pages beauftragt. B12 wurde anschließend ausdrücklich mit denselben Vorgaben beauftragt. B13 ist am 19.10.2026 beauftragt; B14 bleibt separat. Paketstatus und echte Freigaben werden ausschließlich hier geführt; Fachdateien beschreiben Regeln, keine konkurrierenden Fortschrittsstände.

## Nachbesserung — Hinweise, Wisp-Auftritt und Bosstanz

Am 19.10.2026 zusätzlich beauftragt; B14 bleibt separat.

- [x] Niederlagenhinweis mit × schließen und pro verlorenem Versuch speichern; erneute Niederlage darf erneut informieren.
- [x] Wisp kommt vom eigenen Kern über begehbare Felder; Anlauf läuft auch in der Begrüßungspause, mobile Kamera folgt bis zum eigenen Eingriff.
- [x] Frost verlangsamt Rosenspiegel ohne Zauberabbruch; Tanzfenster einschließlich Treffbereich linear 15 % kleiner.
- [x] Pfeile an echten Bedienelementen lassen Erklärungstexte frei; Aktionstasten reservieren Pfeilplatz.
- [x] Zusätzlicher Auftrag: nur Ziffern 2/5/8 durch klare Pixelglyphen ersetzen, übrige Schrift erhalten. Maras aktiver Boost erhält Goldverbindung, wandernden Lichtpunkt und sanfte Turmaura; kurze Hochkantkontrolle bestanden.
- [x] Mara zaubert im angeleiteten Einstieg erst nach ihrer Ankündigung nach Wisp. Wirkungsleiste nur rund 55 px hoch bei 430 px Breite, sofort schließbar.
- [x] Save-Migration 17 → 18, laufende Effekte und Veteranen erhalten. 21 gezielte Modell-/Speicherprüfungen sowie Build und kurze Hochkant-/Desktopkontrolle bestanden. Ältere B10-Zeitvorgabe als Prüfgrenze dokumentiert.
- [x] Codecommit `c164a11` gepusht; [Pages-Lauf 39293922617](https://github.com/emfau88/TD/actions/runs/39293922617) erfolgreich. Öffentliche JS-/CSS-Dateien am 19.10.2026, 17:26 UTC bytegleich mit dem geprüften Build; [Nachweis](../../artifacts/idle-bastion/acceptance/onboarding/readability/public.json).

[Bericht und Spielaufnahmen](../../artifacts/idle-bastion/acceptance/onboarding/readability/REPORT.md).

## Nachbesserung nach B13 — HUD und nächste Gestaltungsschritte

Am 19.10.2026 beauftragt: leeren HUD-Balken beheben, vorhandene Gegner auflisten und drei neue Einheiten mit effizientem Produktionsablauf vorschlagen. Anschließend um Vorschlag für einen verständlicheren Start ergänzt. Der Einstieg wurde anschließend ausdrücklich zur Umsetzung freigegeben; neue Gegner bleiben Vorschläge.

- [x] HUD-Balken reproduziert: unterer Hinweis erzeugt im WebGL-Bereich ein vertikal gespiegeltes schwarzes Rechteck. Minimale Transparenz ausschließlich am Hinweis umgeht die fehlerhafte Überdeckung; nach mehreren Zeichenzyklen geprüft.
- [x] Produktionsbuild und kurze Desktop-/Hochkantprobe bestanden; [Befund, Vorher/Nachher und Prüfumfang](../../artifacts/idle-bastion/acceptance/ui/HUD.md).
- [x] Codecommit `b003fca` gepusht; [Pages-Lauf 39248529885](https://github.com/emfau88/TD/actions/runs/39248529885) erfolgreich. Öffentlicher Playlink liefert `battle-D7MtO5wm.css` mit der Korrektur aus.
- [x] Vollständigen Gegnerbestand und drei Kandidaten mit Produktionsablauf in [ENEMIES.md](docs/ENEMIES.md#vorschlag-drei-weitere-einheiten) festhalten.
- [x] Einstiegsvorschlag festhalten; nach anschließender Freigabe wie unten umgesetzt.

### Neuer Einstieg — erst ankommen, dann verteidigen

Am 19.10.2026 ausdrücklich beauftragt: Mara vorstellen, ersten Turm selbst bauen, bestehende Spielstände erhalten; kompakt prüfen, Roadmap aktualisieren und veröffentlichen.

- [x] Ruhige Karte ohne Turm und Gegner; kurze Mara-Begrüßung auch auf Hochkant direkt sichtbar. Keine Wartezeit oder Dialogserie.
- [x] Kostenlosen Waldwächter-Bausatz selbst auf einem von neun sicheren frühen Feldern platzieren; Reichweite und Baubestätigung, 75 Startgold bleiben erhalten. Vor dem Kampf kostenlos korrigierbar.
- [x] Nach dem Bau zurück zur Karte; erst „Verteidigung starten“ beginnt Welle 1. Eintritt/Kern erklären, danach normale automatische Wellenfolge.
- [x] Maras Fernzauber im echten Kampf anbieten, Wirkzeit am Turm zeigen, Automatik erklären und ausdrücklich einschalten lassen. Direkter Wechsel zur Automatik oder manuelles Weiterspielen möglich.
- [x] Bauphase und Geschenk atomar speichern; Reload/Schreibfehler dürfen weder Geschenk duplizieren noch Kampf vorzeitig starten. Vor dem Start kein Kampf-/Farm-/Offline-Ertrag.
- [x] Altsaves ohne erneute Einführung übernehmen; Geld, Türme, Boss-/Wellenfortschritt, Kampfzustand und historische Offline-Ansprüche erhalten. Schema 15, Kampfregeln unverändert 10.
- [x] Neun gezielte Modell-/Speicherprüfungen und vier bestehende Regressionen bestanden. Einschließlich angenommener acht Sekunden Begrüßung/Bau: Werkstatt bei 86 s, Frostforschung bei 102,25 s im legalen Modelllauf. Keine neue Preisänderung nötig; keine garantierte Echtspielerzeit.
- [x] Produktionsbuild und kurze Desktop-/Hochkantprobe inklusive Bau, Reload, erstem Zauber und altem B13-Spielstand bestanden; Bilder/Prüfgrenzen im Bericht.
- [x] Erste Einstiegsversion als `f538b5c` gepusht; [Pages-Lauf 39252243815](https://github.com/emfau88/TD/actions/runs/39252243815) erfolgreich. Die anschließend beauftragte Erweiterung wird separat unten dokumentiert.

Ablauf, Spielaufnahmen und genaue Prüfgrenzen: [Einstiegsbericht](../../artifacts/idle-bastion/acceptance/onboarding/REPORT.md). Die frühere G1-Freigabe bleibt bestehen; dieser Zusatz ist keine neue Nutzerabnahme des gesamten Slice.

### Erweiterung: geführt vom Waldwächter bis zur Frost-Kombination

Anschließend am 19.10.2026 ausdrücklich beauftragt. Zunächst lokal umgesetzt; Commit und Push anschließend ausdrücklich freigegeben. Diese Erweiterung ersetzt die manuelle Zauberlektion und die hektische freie Kaufphase der ersten Einstiegsversion. Bestehende bereits gestartete Partien werden nicht zurückgesetzt.

- [x] Goldmarkierung und kurzer Hinweis zeigen einen guten ersten Bauplatz; Kamera führt beim Bauen und Auswählen zum Ziel.
- [x] Nach dem ersten verdienten Gold echte Lernpause: Startturm antippen und **genau einmal auf Level 2** verbessern. Der echte Upgradebutton wird hervorgehoben.
- [x] Danach klares Sparziel **400 Gold für die Werkstatt**, mit fehlendem Betrag und Fortschritt. Keine konkurrierenden Kaufaufträge.
- [x] Bezahlbare Werkstatt, Forschung **60 Gold** und Frostturm **110 Gold** bekommen eigene gespeicherte Lernpausen. Nach jeder Aktion ausdrücklich „Weiter“; keine unbemerkte Wiederaufnahme.
- [x] Forschung in der echten Werkstatt markieren. Frost vor/neben dem Waldwächter empfehlen; erst nach einem sichtbaren verlangsamenden Treffer zur freien Verteidigung wechseln.
- [x] Während der Anleitung gewöhnliche Wellen 1–2 wiederholen, ohne Extra-Gold oder künstliche Unverwundbarkeit. Alle neun Startplätze überstehen die vollständige Lernfolge verlustfrei. Danach normaler Vorstoß ab Welle 3.
- [x] Mara unterstützt automatisch; manuelle Zauber/Bewegung werden optional nach der Baulektion zugänglich. Wisp erscheint regulär nach Frostforschung/Welle 5 und kollidiert damit nicht mit dem Frost-Lernschritt.
- [x] Anleitung kann ab Kampfbeginn übersprungen werden. Währenddessen gezielte Käufe, danach freie Bauflächen und Upgrades. Keine zusätzlichen geschenkten Ressourcen.
- [x] Snapshot 16 speichert Lernschritt und Lernpause getrennt von der manuellen Pause. Reload setzt denselben Schritt fort; Lernpausen erzeugen kein Offline-Gold. Bereits laufende Schema-15-Partien behalten ihre Käufe und werden nicht in die erweiterte Anleitung gezwungen.
- [x] Zehn gezielte Modell-/Save-Prüfungen, einschließlich kompletter Lernfolge an allen neun Startplätzen. Empfohlener Platz: 79,425 s Kampf + 58 s beispielhafte Begrüßung/Lesezeit = 2:17,425 bis zur ersten verstandenen Frost-Kombination.
- [x] Produktionsbuild und vollständige mobile Browserfolge mit 20/20 Leben, Lernpause/Reload sowie Desktop-Upgradeansicht geprüft; [Ablauf und Aufnahmen](../../artifacts/idle-bastion/acceptance/onboarding/lessons/REPORT.md). Lokal auf Port 5191 bereit.
- [x] Lernführung als `c74b0b9` gepusht; [Pages-Lauf 39255621279](https://github.com/emfau88/TD/actions/runs/39255621279) erfolgreich. Öffentliches JavaScript und CSS stimmen bytegenau mit dem geprüften Build überein. Die folgenden UX-Nachbesserungen ersetzen Teile dieser ersten Lernfassung.

Das frühere 90-Sekunden-Ziel ist für diese geänderte Lernfolge **keine maximale Lesezeit**. Kampfzeit und tatsächliche Lernpausen werden transparent getrennt dokumentiert; die sichtbare Spielzeit enthält beides. Keine neue G2-Freigabe und kein neuer 15-Minuten-Nachweis.

### Einstiegs-UX nach der Spielprobe — Klickziel und sichtbare Handlung

Am 19.10.2026 zusätzlich beauftragt: direkte Pfeilführung, keine Karten-Platzhalter, weniger verdeckte Action und Leerlauf, Bau ohne doppelte Bestätigung mit sichtbarer Animation, Mara nach Wisp und neue Bauoptionen im Menü kenntlich machen. Bestehende Spielstände behalten ihre Käufe; kein Reset, keine nachträgliche Preiserstattung.

- [x] Ein mitwandernder goldener Pfeil zeigt jeweils genau das anklickbare Feld, den Turm oder den echten Aktionsbutton. Beim Sparen kein Klickauftrag. Empfehlung und Vorschau verdecken Mara nicht.
- [x] Ein Tipp auf ein gültiges Feld im aktiven Baumodus baut direkt. Freie Standortwahl bleibt; bestehende Gebäude werden weiterhin ausdrücklich versetzt.
- [x] „Käfer kommen hier“, Werkbank, Pfähle, Bauschilder und Lagerkasten entfernt; leere Bauflächen haben keine unsichtbaren Anklickbereiche mehr.
- [x] Sparphase: 41 px hohe Leiste am oberen HUD statt großer Mara-Karte. Werkstatt I von 400 auf 200 Gold gesenkt. Ausgangsplatz im Modell: Werkstatt bei 27,85 statt 52,55 s Kampfzeit; keine garantierte Echtspielerzeit.
- [x] Nach dem Bau kompakte Rückmeldung oben; das Gebäude bleibt sichtbar. Staub/Aufbau läuft mit visueller Zeit auch während der Lernpause. Forschung folgt erst nach „Weiter“ und eigenem Sparziel.
- [x] Übertakten bekommt nach bestätigter Wisp-Ankunft eine eigene Erklärung mit aktuellem Effekt/Restzeit und Kamerasprung zum Zauberturm. Unterstützung bleibt während des Baueinstiegs automatisch.
- [x] Freigeschaltetes Lager trägt „Neu“ an Siedlung und Baukarte. Beim Öffnen bestätigen und speichern, auch wenn gleichzeitig ein anderer Speicherschritt läuft.
- [x] Gezielter kompletter Lernablauf an allen neun Startplätzen und Preis-/Speicherrundlauf erfolgreich. Mobile Echtzeitfolge mit direktem Bau: 20/20 Leben, erste Frost-Kombination nach 56,075 s Kampfzeit. Vorherige Prüfversuche hatten zu kurze/zu frühe Browserwartebedingungen; anschließend korrigiert. Keine neue 15-Minuten-Abnahme.
- [x] Kurze Freischaltungsprobe: Wisp vor Mara; Lager-Neuhinweis nach Öffnen und Reload bestätigt. Screenshots und Prüfbericht dokumentiert.
- [x] Codecommit `c6c1298` gepusht; [Pages-Lauf 39259455687](https://github.com/emfau88/TD/actions/runs/39259455687) erfolgreich. Öffentliches `battle-B8NnYoh6.js` und `battle-CSs5GZ7O.css` stimmen bytegenau mit dem finalen lokalen Build überein; Klickpfeil und kompakte Sparanzeige sind auf dem Playlink enthalten.

Nachweis und Bilder: [Interaktive Lernführung](../../artifacts/idle-bastion/acceptance/onboarding/interaction/REPORT.md).

### Korrektur — echte Bedienfolge statt Tutorial-Abkürzungen

Am 19.10.2026 ausdrücklich beauftragt: „Ja so umsetzen“. Ersetzt die vorherige Pfeilführung und die verpflichtende Werkstatt-Sparphase; das übrige Spiel und bestehende Käufe bleiben erhalten.

- [x] Erster Turm und Frost: echter Tab/Baukarte → Kartenplatz. Werkstatt: Siedlung → Werkstatt-Karte → Kartenplatz. Keine zusätzliche „Hier bauen“-Bestätigung.
- [x] Upgrade/Forschung: Kartenobjekt → echter Aktionsbutton. Pfeil über dem Ziel, kein verdeckter Text und kein Bauknopf in der Anleitung. Bereits geöffnete Menüs werden berücksichtigt.
- [x] Kostenloser Werkstatt-Bausatz nach Startturm-Level 2 und erstem Wellensieg. Einmaliger Verbrauch, reloadfest, keine rückwirkende Erstattung; normaler Baupreis außerhalb der Anleitung bleibt 200 Gold.
- [x] Kleine Erklärungen am oberen Rand; nach Werkstattbau 1,8 Sekunden freie Sicht auf die Konstruktion. Erst anschließend bewusst zur Forschung weitergehen. Überspringen über das Spielmenü.
- [x] Elf gezielte Einstiegs-/Saveprüfungen bestanden, einschließlich aller neun Startplätze und alter Saves. Produktionsbuild erfolgreich. Mobile echte 1×-Menüfolge mit Reload bis Frost: 20/20 Leben, keine Browserfehler; Desktop-Menüführung separat kurz geprüft.
- [x] Codecommit `82a5a99` gepusht; [Pages-Lauf 39268268295](https://github.com/emfau88/TD/actions/runs/39268268295) erfolgreich. Öffentliches `battle-OzF1aTOT.js` und `battle-BDiJOrpc.css` stimmen per SHA-256 mit dem geprüften Build überein.

[Prüfung und Screenshots der echten Menüfolge](../../artifacts/idle-bastion/acceptance/onboarding/menu-guide/REPORT.md). B14 und weitere Gegnerproduktion bleiben unbegonnen; keine neue 15-Minuten- oder reale Geräteabnahme behauptet.

### Anschluss nach Frost — Wisp, Mara und nächste Bauoptionen

Am 19.10.2026 nach Einschätzung ausdrücklich mit „ok so durchführen“ beauftragt.

- [x] Nach Frost keine nächste Pflichtkaufkette: freie Verteidigung, verständliches Ziel Welle 5.
- [x] Wisp einmal an der Wellengrenze begrüßen; +10 % Kampf-Gold und automatische Rolle erklären, andere Hinweise zurückhalten.
- [x] Nächsten echten Mara-Zauber in kurzer Pause sichtbar machen; Kamera auf Ziel, acht Sekunden Wirkung/Restdauer, danach echte Porträtbedienung optional anbieten. Cooldown bleibt unverändert.
- [x] Steinschleuder über Türme/Baukarte/Platz bei Frost zeigen; Lager ab Welle 8 über Siedlung/Neu/Baukarte/Vorschau/Platzierung. Beide optional, „Später entdecken“ ohne Zielschleife.
- [x] Falsches Lichtungsziel für Mara korrigieren; Hinweisüberlagerungen entfernen, freie Sicht auf den Lageraufbau erhalten.
- [x] Snapshot 17 mit gespeicherten Phasen; alte Saves erhalten, keine Wiederholung für Veteranen, kein Offline-Ertrag während Lernpause.
- [x] 15 fokussierte Einstiegs-/Anschlussprüfungen und zwei Saveprüfungen bestanden; Produktionsbuild erfolgreich. Kurzer echter UI-Ablauf ab legal vorbereitetem Wisp-Stand, separat Lagerplatzierung, Hochkant und Desktopansicht geprüft. Kein vollständiger neuer 15-Minuten-/Gerätetest.
- [x] Codecommit `5db8cc6` gepusht.
- [x] [Pages-Lauf 39279803452](https://github.com/emfau88/TD/actions/runs/39279803452) inzwischen erfolgreich abgeschlossen; am 19.10.2026 erneut geprüft. Der aktuelle Anschluss wird durch die folgende Nachbesserung ergänzt.

[Prüfbericht und Screenshots](../../artifacts/idle-bastion/acceptance/onboarding/followup/REPORT.md). B14 und neue Gegnerproduktion bleiben unbegonnen.

## B12b — Nordbogen und mobile Kamera

Am 18.10.2026 ausdrücklich beauftragt; kompakte Prüfungen, Commit und Push.

- [x] Oberen Weg zwei Felder tiefer legen; drei zusammenhängende, hindernisfreie Reihen darüber anbieten.
- [x] Mobile Kamera vertikal verschiebbar, Rand mit Gelände füllen, Fokus auch in Y; sichtbare Turmgrafik zur Auswahl anklickbar.
- [x] Alte laufende Versuche auf alter Route beenden; am Wellenübergang passende Plätze erhalten und betroffene Türme kostenlos versetzen.
- [x] Geld, Level, Investitionen, IDs, Gebäude, Mara und historische Offline-Ansprüche erhalten; Farmnachweise für die neue Route neu verdienen.
- [x] Gezielte Geometrie-/Speicherprüfungen, Build und mobile Bau-/Upgradeprobe; [Nachweis](../../artifacts/idle-bastion/acceptance/p4/MAP.md).
- [x] Codecommit `182d931` gepusht; [Pages-Lauf 39166433310](https://github.com/emfau88/TD/actions/runs/39166433310) erfolgreich. Öffentliche Kartenfassung veröffentlicht.

## B12c — Vorhandene Gegner mit gestaffelter Einführung

Am 18.10.2026 ausdrücklich als nächster Schritt nach B12b beauftragt. Vorhandene Originalgrafiken verwenden; sinnvolle Rollen und Fortschritt statt einer rein zufälligen Grafikmischung. Danach kompakt prüfen, committen und pushen.

- [x] Magmakrabbe, Clampbeetle, Flying Locust, Firewasp und Voidbutterfly anhand ihrer vorhandenen Richtungsanimationen integrieren.
- [x] Vorhandene Laternenqualle prüfen und ihre Unterstützerrolle passend zum Idle-Kampf übernehmen.
- [x] Lesbare Rollen und Einführung über zunehmende Wellen, spätere abwechslungsreiche Gruppen; frühe Lernschritte erhalten.
- [x] Gemeinsame Frame-/Richtungsmetadaten nutzen; richtige Blickrichtung, Größe, Schatten und Pause überprüfen.
- [x] Laufende Altversuche und alte Offline-Belege bewahren; neue Gegnerfolgen erst beim nächsten Versuch aktivieren.
- [x] 35 gezielte Gegner-/Atlas-/Kampf-/Offline-/Kartenprüfungen und Build erfolgreich; Desktop/Hochkant mit Heilung und Pause/Reload geprüft. [Nachweis](../../artifacts/idle-bastion/acceptance/p4/ENEMIES.md).
- [x] Codecommit `592b42a` gepusht; [Pages-Lauf 39168061415](https://github.com/emfau88/TD/actions/runs/39168061415) erfolgreich. Öffentlicher Playlink mit Bundle `battle-CmaPzvKp.js`, sechs erfolgreich geladenen neuen Atlanten und erreichbarer Chronik ohne Seitenfehler/Überlauf bestätigt.

## B12d — Wiederholbarer Produktionsablauf für neue Gegner (vorgemerkt)

Nur als nächster Ausbau geplant; keine neue Bildproduktion beauftragt. Vorhandene Verfahren aus `GEGNER_PRODUKTIONSPLAN.md`, `scripts/pixel-atlas.mjs` und der Gegnerprobe weiterverwenden. [Konkretisierter Vorschlag vom 19.10.: Mooskröte, Runenschnecke, Wurzeltrommler und gemeinsamer Ablauf](docs/ENEMIES.md#vorschlag-drei-weitere-einheiten).

- [ ] Kurzen Standardsteckbrief für Rolle, Referenzen, Palette, sichtbare Größe und Anker festlegen.
- [ ] Referenzpose und kleine Laufprobe vor vollständiger Richtungs-/Aktionsproduktion prüfen.
- [ ] Gemeinsames Datenformat für Ausschnitte, Blickrichtung/Spiegelung, Bilddauer, Maßstab und Aktionszeitpunkte.
- [ ] Ein gemeinsamer Import und eine gemeinsame Vorschau mit Originalvergleich, Einzelbildern und Kurvenstrecke.
- [ ] Kompakte Prüfungen für Atlasgrenzen, Transparenz und Richtung; künstlerische Bewegung gezielt ansehen.

## B12a — Freie Verteidigung und verständliche Begleiter

Am 18.10.2026 ausdrücklich beauftragt: beidseits des Gegnerwegs bis zu drei Felder tief bauen, Maras Fernzauber mit sinnvoller Automatik, Wisps Ankunft, optionale östliche Lichtung, eigene Gebäudepositionen und Bauanimationen, Frostatlas korrigieren und Projektile verbessern. B13 ist am 19.10.2026 beauftragt; B14 bleibt separat.

- [x] Freie geeignete Rasterfelder ab Beginn, Hindernisse und Weg schützen; bestehende Türme erhalten.
- [x] Tatsächliche Reichweite/Vorschau, ausdrückliche Bestätigung, Rückkehr zur Karte und kompakte mobile Bedienung.
- [x] Mara unabhängig bewegen, Fernziel wählen, Auto/Manuell, Gegnerprüfung, Buffdauer und Cooldown sichtbar.
- [x] Wisp mit kurzer Ankunft und einmalig gespeicherter Begrüßung.
- [x] Gebäudepositionen in der Siedlung, Versetzen bei Pause; Werkbank statt halbfertiger Werkstatt, sichtbare Baufolge.
- [x] Lichtung optional; Werkstatt II davon entkoppelt. Späterer Herausforderungszugang vorgemerkt, kein vorgetäuschter Dungeon.
- [x] Frost-Einzelframes und Originalprojektil-/Treffervarianten aller Grafikstufen; kosmetische Effekte begrenzen.
- [x] Alte Spielstände und Offline-Belege erhalten; 54 gezielte Modell-/Speichertests und Produktionsbuild bestanden.
- [x] Desktop-/Hochkantprüfung abgeschlossen; [Nachweis und Spielaufnahmen](../../artifacts/idle-bastion/acceptance/p4/REDESIGN.md).
- [x] Codecommit `6dbdd63` gepusht; [Pages-Lauf 39164594184](https://github.com/emfau88/TD/actions/runs/39164594184) erfolgreich. Öffentlicher Playlink lädt `battle-LDNvrmBq.js`; mobile Probe ohne Seitenfehler/Überlauf bestätigt.

## Ergänzung nach B10 — Rosenspiegels Tanzdarstellung

Am 18.10.2026 ausdrücklich beauftragt: das größere Tanzfenster sowie Leuchten, Vibrieren und Herzen des verführten Turms wie im Hauptspiel übernehmen.

- [x] Vorhandenen HD-Tanzatlas mit acht Originalposen und 190 ms je Bild übernehmen.
- [x] Lesbares Fenster während Vorbereitung/Wirkung, mit Restdauer und unveränderter Größe beim Kartenzoom.
- [x] Pulsierende Turmfärbung, leichtes Wackeln, geschwungener Herzfaden und aufsteigende Herzen übernehmen.
- [x] Alle Effekte an die gespeicherte Zauberzeit binden; Pause und Frostunterbrechung im echten Kampf prüfen.
- [x] Desktop/Hochkant, TypeScript und Produktionsbuild prüfen; [Spielaufnahmen und Nachweis](../../artifacts/idle-bastion/acceptance/p4/B10_VISUALS.md) ablegen.
- [x] Codecommit `7a6e2d5` gepusht; [Pages-Lauf 39085400278](https://github.com/emfau88/TD/actions/runs/39085400278) erfolgreich. Öffentlicher Playlink lädt das neue Bundle `battle-SZ-ugDyt.js` und stellt die bestehende Probe ohne Konsolenfehler wieder her.

## Nachbesserung nach B10 — Baukomfort, Schärfe und Turmkombinationen

Am 18.10.2026 ausdrücklich beauftragt: rückwärts laufende Skorpione korrigieren, nach Turmbau zur Karte zurückkehren, mobile Unschärfe verbessern und dichter kombinierbare Bauplätze ergänzen. Die drei zusätzlichen Plätze ändern die ursprüngliche Anzahl auf elf im Startgebiet; die spätere östliche Erweiterung bleibt B11.

- [x] Skorpion-Seitengrafik passend zur Bewegungsrichtung spiegeln; vertikale Ansichten erhalten.
- [x] Nach bestätigtem Bau alle Turmtypen aus Platzierung/Verwaltung entlassen; erneutes Antippen öffnet die Verwaltung.
- [x] Auf dichten Displays höhere interne Zeichenauflösung und lesbarere Spielfeldtexte, bei unverändert kompaktem mobilem HUD/Dock.
- [x] Drei Plätze mit nachgewiesenen gemeinsamen Schussfenstern ergänzen; bisherige Türme und Gegnerroute erhalten.
- [x] Layoutmigration einschließlich Maras Laufweg und alter Offline-Ansprüche prüfen.
- [x] Abschließende Browseraufnahmen und Veröffentlichung: Codecommit `27f54b5`, [Pages-Lauf 39084247681](https://github.com/emfau88/TD/actions/runs/39084247681) erfolgreich. Öffentliche Hochkant-Probe lädt den neuen Build; Kauf am Nordbogen bestätigt, Platzierung und Verwaltung danach geschlossen. [Prüfbericht und Aufnahmen](../../artifacts/idle-bastion/acceptance/p4/USABILITY.md).

## Premium-Überarbeitung nach der mobilen Nachbesserung

Am 18.10.2026 ausdrücklich beauftragt: hochwertige, an den Mockups orientierte UI mit 3–4 passenden Imagegen-Assets. Die kompakte mobile Aufteilung bleibt erhalten. Keine Freigabe für B08 oder neue Figurenmechanik.

- [x] Vier passende Materialien/Symbole erzeugen, Originale und vollständige Prompts erhalten.
- [x] Echte Assets in HUD, Karten, Kontextfenster und Aktionen integrieren; einheitliche Symbole und lokale Pixelschrift.
- [x] 56-px-HUD / 96-px-Dock, eingeklappte Hinweise, Vollbild und erreichbare Chronik mobil erhalten.
- [x] Desktop und normale Hochkantansicht visuell prüfen, betroffene Bedienung und Build bestätigen. [Nachweis](../../artifacts/idle-bastion/acceptance/ui/PREMIUM.md).
- [x] Screenshots, README und nachvollziehbaren Asset-/Prüfnachweis ablegen.
- [x] Commit/Push und erfolgreiche Pages-Veröffentlichung: `b972548`, [Pages-Lauf 39076457593](https://github.com/emfau88/TD/actions/runs/39076457593) erfolgreich. Öffentlicher Playlink mit neuer Schrift, tatsächlich geladener Rahmen-WebP und laufendem Kampf geprüft.

## Mobile-Nachbesserung nach B07b

Am 18.10.2026 ausdrücklich beauftragt: mobile Spielfläche vergrößern, Vollbild erreichbar machen; keine Sonderfall-/Kleinstgeräteoptimierung. Kein Beginn von B08.

- [x] Mobiles HUD/Dock und Zielstreifen komprimieren, überzählige Geräteabstände entfernen.
- [x] Maras Hinweis zunächst einklappen; Hinweise, Chronik und Kernaktionen erreichbar halten.
- [x] Vollbild-Schalter und verständliche Nichtverfügbarkeitsmeldung ergänzen.
- [x] Build und normale Hochkantbedienung prüfen; Desktop-Layout abgrenzen. [Nachweis](../../artifacts/idle-bastion/acceptance/ui/MOBILE.md).
- [x] Commit/Push und öffentliche Testfassung bestätigen: `7b74a7b`, [Pages-Lauf 39073600914](https://github.com/emfau88/TD/actions/runs/39073600914) erfolgreich; mobile Statusleiste 56 px, Dock 96 px und eingeklappter Tipp öffentlich geprüft.

## So werden die Pakete bearbeitet

1. Das nächste freigegebene Paket wählen, Voraussetzungen prüfen und es hier auf „In Arbeit“ setzen. Pro zusammenhängendem Arbeitsstrang ein Hauptpaket bearbeiten; passende unabhängige Teilaufgaben dürfen parallel laufen.
2. Ein Paket liefert eine überschaubare prüfbare Fassung. Kein großer Änderungsblock für sämtliche Phasen und keine vorgezogenen Features hinter ausgeblendeten Buttons.
3. `[x]` bedeutet tatsächlich erledigt und überprüft. Code vorhanden, ein Platzhalter oder ein grüner Build allein genügt nicht. Offene Arbeit bleibt `[ ]`; Hindernisse werden konkret benannt.
4. Nach Abschluss Ergebnis, Prüfungen, Grenzen und Commit im Phasenbericht festhalten und hier verlinken. Geeignete lokale Commits halten Pakete nachvollziehbar; ein Paket darf mehrere kleine Commits benötigen.
5. Danach ohne neue Routinefreigabe zum nächsten zulässigen Paket weitergehen. **G1 ist der verbindliche Halt:** Erst die ausdrückliche Nutzerfreigabe erlaubt B08–B14.
6. Kein Push, Merge oder Deployment aus dieser Planung. Keine zusätzlichen Abnahmeschleifen für normale reversible Detailentscheidungen erfinden.

Die Zahl erledigter Kästchen ist keine belastbare Prozent- oder Zeitangabe. Abschluss zählt über das sichtbare Ergebnis und seine Prüfungen.

## Übersicht der Arbeitspakete

| Phase | Paket | Prüffähiges Ergebnis | Voraussetzung | Status / Nachweis |
| --- | --- | --- | --- | --- |
| P0 | Planung | Auftrag, Referenzen und Checklisten vorhanden | Planungsauftrag | Erledigt; ursprüngliche Unterlagen in `6ac8dea`, Checklisten in diesem Dokument |
| P1 | B01 · Eigenständiger Einstieg | Leere Idle-Anwendung separat start- und baubar, Kartenrahmen festgelegt | Umsetzungsauftrag | Erledigt · `b47294a` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b01--eigenständiger-einstieg-und-kartenrahmen) |
| P1 | B02 · Kampf und Gold | Automatische Wellen, bezahlbare Käufe, Kernreset | B01 | Erledigt · `d10cb04` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b02--automatischer-kampf-und-bauwirtschaft) |
| P1 | B03 · Spielstand | Laufenden Kampf samt Wirtschaft konsistent wiederherstellen | B02 | Erledigt · `40dc019` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b03--konsistenter-spielstand-während-des-kampfes) |
| P1 | B04 · Farmen und Abwesenheit | Tragfähige Rückfallwelle, korrekte Offline-Zeit, ein schreibender Tab | B03 | Erledigt · `25e9a5f` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b04--sicheres-farmen-abwesenheit-und-tab-eigentümerschaft) |
| P2 | B05 · Startlichtung und Mara | Echter Wald, sichtbare automatische Unterstützung und bedienbares HUD | B04; Layout aus B01 | Erledigt · `884f7c4` · [Nachweis](../../artifacts/idle-bastion/acceptance/p1/REPORT.md#b05--startlichtung-mara-und-kompakte-bedienung) |
| P2 | B06 · Werkstatt und Frost | Erstes sichtbares Gebäude mit neuer taktischer Möglichkeit | B05 | Erledigt · `8a0a276` · [Nachweis](../../artifacts/idle-bastion/acceptance/90s/REPORT.md#b06--werkstatt-und-echte-frosttechnik) |
| P2 | B07 · Einstieg und Nachweise | Regulär spielbarer 90-Sekunden-Kreislauf samt kurzer Technikfolge | B06 | Erledigt · `8a0a276` · [Browserzeiten und drei Spielweisen](../../artifacts/idle-bastion/acceptance/90s/REPORT.md) |
| P2 | B07a · Spieloberfläche | Große Karte, Dock, Kontextaktionen und funktionale Hochkantansicht | Zusätzlicher Nutzerauftrag vor B08 | Abgeschlossen und veröffentlicht · [Nachweis](../../artifacts/idle-bastion/acceptance/ui/REPORT.md) |
| P2 | B07b · Orientierung und HUD | Goldzufluss, Wellenrekord, nächstes Ziel, Versuchshistorie und stimmige warme Oberflächen | Zusätzlicher ausdrücklicher Nutzerauftrag am 17.10.2026 | Abgeschlossen und veröffentlicht · [Nachweis](../../artifacts/idle-bastion/acceptance/ui/PROGRESS.md) |
| Halt | G1 · Nutzerabnahme | Ausdrückliche Entscheidung zur vorgelegten Fassung | B01–B07 sowie B07a/B07b geprüft | **Freigegeben · 18.10.2026** |
| P3 | B08 · Wisp und Turmrollen | Zweite Figur, Wirtschaftseffekt und vier unterscheidbare Türme | G1 freigegeben | Abgeschlossen · [Nachweis](../../artifacts/idle-bastion/acceptance/p3/B08.md) |
| P3 | B09 · Lager und Rückkehr | Zweites Gebäude und befriedigender Wiedereinstieg | B08 | Abgeschlossen |
| P4 | B10 · Erste Bossherausforderung | Lesbarer Boss verlangt die verfügbaren Turmrollen | B09 | Abgeschlossen · [Nachweis](../../artifacts/idle-bastion/acceptance/p4/B10.md) |
| P4 | B11 · Wachsende Karte | Echte seitliche Freischaltung mit zwei nützlichen Turmplätzen | B10 | Abgeschlossen · [Nachweis](../../artifacts/idle-bastion/acceptance/p4/B11.md) |
| P4 | B12 · Ausbau und Fortsetzung | Werkstatt II, spätere Level und Fortschritt nach Minute 15 | B11 | Abgeschlossen; B13-Balance geprüft |
| Zusatz | B12a · Freie Verteidigung | Wegstreifen, Fernzauber, Einführung, Siedlungsbau und Originaleffekte | Zusätzlicher Nutzerauftrag | Veröffentlicht · [Nachweis](../../artifacts/idle-bastion/acceptance/p4/REDESIGN.md) |
| Zusatz | B12b · Nordbogen/Kamera | Drei obere Baureihen und mobile Erreichbarkeit; sichere Kartenmigration | Nutzerauftrag | Veröffentlicht · [Nachweis](../../artifacts/idle-bastion/acceptance/p4/MAP.md) |
| Zusatz | B12c · Vorhandene Gegner | Unterschiedliche Rollen und gestaffelte Gegnergruppen | B12b; ausdrücklich beauftragt | Veröffentlicht · [Nachweis](../../artifacts/idle-bastion/acceptance/p4/ENEMIES.md) |
| Später | B12d · Gegnerproduktion | Einheitlicher Ablauf für neue Figuren | Nur vorgemerkt | Nicht begonnen |
| P5 | B13 · Gesamter Spielverlauf | Gemessene 15-Minuten-Sitzung und Rückkehr mit legalen Aktionen | B12 | Veröffentlicht · [B13-Nachweis](../../artifacts/idle-bastion/acceptance/15min/REPORT.md) |
| P5 | B14 · Stabilität und Lieferung | Geprüfte Builds, Regression, Laufzeit und ehrlicher Ergebnisbericht | B13 | Nicht begonnen |
| Ende | G2 · Gesamtabnahme | Vollständiger Slice bewertet | B14 | **Offen** |

## B07a — Karte im Mittelpunkt

Am 17.10.2026 zusätzlich vor B08 beauftragt, einschließlich Commit, Push und bestehendem Playlink. Die anschließende Ergänzung umfasst eine funktionale Hochkantansicht; eine vollständige Geräteoptimierung ist nicht verlangt. Keine Freigabe für B08 daraus ableiten.

- [x] Karte großflächig, ohne äußeren Seitenrahmen oder dauerhafte Verwaltungsleiste darstellen; schmale Statusleiste und kompaktes Dock nach den Mockups.
- [x] Vorhandene Spielgrafiken im Bau-/Begleiterdock verwenden; Details bei Auswahl eines Turms, Bauplatzes oder Gebäudes einblenden.
- [x] Alle bisherigen Käufe, Forschung, Mara-Zuweisung, Pause, Rückkehr und Speicher-Recovery erreichbar halten.
- [x] Hochkant: lesbarer Kartenausschnitt, Ziehen, Übersicht und große Bauplatz-Schaltflächen; kein notwendiges Scrollen der gesamten Webseite.
- [x] Desktop und Hochkant tatsächlich ansehen, betroffene Bedienabläufe und vorhandenen Spielstand prüfen; echte Touch-Geräteprüfung von einer schmalen Browseransicht unterscheiden.
- [x] Screenshots und kurze Prüfnotizen ablegen, README-Galerie erweitern.
- [x] Committen, pushen und Testfassung veröffentlichen; öffentliche Oberfläche bestätigen.

## Historische UX-Vormerkungen — inzwischen durch B12a beauftragt

Am 17.10.2026 zusätzlich besprochen und auf Nutzerwunsch vorgemerkt. Diese Punkte erweitern B07a nicht und umgehen weder G1 noch eine spätere ausdrückliche Beauftragung. Priorität: zuerst Orientierung und verständliche Handlungen, danach Änderung des Figurenverhaltens. Die folgende historische Liste wird durch das beauftragte Paket B12a oben konkretisiert; dessen Checkliste führt den aktuellen Stand.

- [ ] **Werkstatt verständlich machen:** Zustand, nächste mögliche Handlung, Goldpreis und Nutzen bereits am Gebäude bzw. an seiner Karte vermitteln. Vor Reparatur „Werkstatt reparieren · 400 Gold“, danach Frostforschung mit Preis/Voraussetzung. Kein erneutes dauerhaftes Bauplatzschild unter einem fertigen Gebäude.
- [ ] **Mara: Ziel und Standort trennen:** Fernunterstützung eines bewusst gewählten Turms als mögliche Neugestaltung prüfen. Automatische Aktivierung bevorzugen; kein obligatorisches regelmäßiges Spell-Klicken. Reichweite, Zielwechsel, Abklingzeit, Farmnachweis und Save-Verhalten vor Umsetzung festlegen.
- [ ] **Mara-Effekt sofort lesbar:** Aktivierungsimpuls zum Turm, eindeutiger Effekt am Turm, verbleibende Wirkungsdauer und anschließende Abklingzeit am Porträt. Aktiver Bonus darf nicht nur aus einem Detailtext erkennbar sein.
- [ ] **Freie Figurenbewegung prüfen:** Charaktere sollen sich von Turmpositionen lösen können. Sinnvolle Ziele/Interaktionen definieren; reine Dekoration und spielwirksame Bewegung unterscheiden. Noch keine neuen Gebäude oder Nebenaktivitäten daraus ableiten.

## B07b — Fortschrittsorientierung und hochwertige Oberflächen

Die folgenden Informationsideen wurden nach der Diskussion ausdrücklich zur Umsetzung einschließlich Commit/Push freigegeben. Kleine dauerhaft sichtbare Zusammenfassung, ergänzende Details auf Abruf; Karte bleibt Hauptfläche. Maras Fernzauber und freie Bewegung gehören nicht zu diesem Paket.

- [x] Laufenden ungefähren Goldzufluss klar von sicherer Farmbasis und tatsächlicher Offline-Rate unterscheiden. Geglättete aktive Messzeit und normale Kampfbelohnungen verwenden; Käufe, Verkäufe, einmalige Freischaltboni und Offline-Claims nicht als wiederholbares Einkommen behandeln. Start-/Pausenzustand ehrlich beschriften.
- [x] Aktuelle Welle, Vorstoß/Farmen, höchste **besiegte** Welle und nächstes konkretes Freischaltziel verständlich zusammenführen. „Erreicht“, „besiegt“ und „sicher farmbar“ nicht gleichsetzen; auf Hochkant darf der nächste Schritt nicht allein in einem ausgeblendeten Desktopblock stehen.
- [x] Abrufbare Fortschrittsansicht: Versuche/Siege/Niederlagen je Welle, Farmdurchläufe getrennt von Vorstößen. Künftige Zähler transaktional speichern; bei alten Saves fehlende Historie als unbekannt ausweisen, niemals aus dem Rekord erfinden. Reload zählt nicht als neuer Versuch.
- [x] Figuren über Porträts, Freischaltbedingungen und aktuellen Auftrag erklären; bei zwei Figuren keinen zusätzlichen permanenten Mengenzähler einführen. Mehr Informationen erst beim Öffnen der Figurenübersicht.
- [x] Nach einer Niederlage erklären, welche Welle gescheitert ist, wo nun gefarmt wird und was erhalten bleibt. Nächste sinnvolle Handlung anbieten, ohne ein garantiert erfolgreiches Upgrade vorzutäuschen.
- [x] HUD, Dock und Kontextfenster als zusammengehörige warme Material-/Farbwelt gestalten; klare Typografie und Kontraste auf Desktop/Hochkant. Höchstens zehn zusätzliche Bilder erlaubt, nur bei tatsächlichem Bedarf.
- [x] Statistikmigration, Zählung und Goldzufluss gezielt prüfen; reale Desktop-/Hochkantansichten und vorhandenen Spielstand kontrollieren. Screenshots, Bericht, Commit/Push und GitHub-Pages-Prüfung abschließen.

Veröffentlicht: Code `2c96642`, einschließlich B07a `d0566cf`. [Pages-Lauf 39072783215](https://github.com/emfau88/TD/actions/runs/39072783215) erfolgreich; öffentliche Chronik, laufender Goldzufluss und Wellenfortschritt im Browser bestätigt. 131 Tests und Produktionsbuild bestanden. G1 bleibt offen.

Vergleichsbeispiele für die Diskussion: [The Tower: umschaltbare Währung/Ertragsanzeige und Welleninformationen (Community-Wiki)](https://the-tower-idle-tower-defense.fandom.com/wiki/Gameplay); [Bloons TD 6: höchste Runden in separater Profilstatistik (Entwicklernotizen)](https://store.steampowered.com/news/posts/?appgroupname=Bloons+TD+6&appids=960090&enddate=1709170182&feed=steam_community_announcements). Das sind Anregungen für die Informationshierarchie, keine Übernahme ihres Umfangs oder ihrer Wirtschaft.

## Aufwand der verbleibenden Pakete

Grobe relative Einschätzung nach B07, keine Termin- oder Freigabezusage. „Mittel“ bedeutet ein begrenzter Ausbau vorhandener Systeme; „groß“ mehrere zusammenwirkende Änderungen oder voraussichtlich mehrere Abstimmungsrunden. Das technische Fundament ist vorhanden, die vollständige 15-Minuten-Balance noch nicht.

| Paket | Einschätzung | Hauptaufwand / Unsicherheit |
| --- | --- | --- |
| B08 | Groß | Wisp, zwei neue Turmrollen, zusätzliche Gegnerrollen und Bauplatzfreigaben wirken auf Wirtschaft, Save und Farmbasis zusammen. |
| B09 | Mittel | Ein Lagerasset und verständliche Rückkehrvorschau; die bestehende Offline-Abrechnung muss die Verbesserung korrekt ab Kauf berücksichtigen. |
| B10 | Mittel | Vorhandenen Boss und Anzeigen integrieren; Schwierigkeit und reguläre Wiederholungsversuche abstimmen. |
| B11 | Groß | Echte Kartenerweiterung mit Kamera, Grafik, Figurenzugängen und zwei tatsächlich nützlichen Schusspositionen. |
| B12 | Mittel | Werkstatt-II-Ergänzung, höhere Level und Wellenkurve; die vorhandenen Grafikstufen lassen sich weiterverwenden. |
| B13 | Groß / variabel | Alle Meilensteine müssen im tatsächlichen 15-Minuten-Verlauf zusammenpassen; Balancekorrekturen können mehrere betroffene Systeme berühren. |
| B14 | Mittel bis groß | Save-Export/Import, gezielte Speicher-/Offline-Regression, längerer Betrieb und reproduzierbare Lieferung; Aufwand hängt von den Befunden ab. |

Für B08–B12 möglichst pro Paket eine sichtbare spielbare Verbesserung liefern und betroffene Regeln gezielt prüfen. B13/B14 bündeln die notwendigen Gesamtdurchläufe; nicht nach jedem kleinen Grafikfix die komplette Matrix wiederholen. Der bestehende G1-Halt bleibt verbindlich.

## P0 — Planung: erledigte Grundlagen

- [x] Aktuellen Spielstrang unter `reference/src/` und abgenommene Waldkarte identifiziert; älteren Entwurf im Stammordner abgegrenzt.
- [x] Isolierten Branch und Worktree auf dokumentiertem Ausgangscommit angelegt.
- [x] [Auftrag](README.md), [Technik](docs/TECHNIK.md), [Grafikvertrag](docs/ART_DIRECTION.md), [Abnahmeplan](docs/ABNAHME.md) und [Arbeitsregeln](AGENTS.md) abgelegt.
- [x] Beide gelieferten Mockups unverändert und dauerhaft als Konzeptreferenzen gesichert.
- [x] Verbindliche 90-Sekunden-Zwischenabnahme sowie Arbeitspakete mit Abhängigkeiten und Abschlusskriterien definiert.

Vorbefund aus der vorangegangenen Analyse: 54 Root- und 58 Referenztests sowie beide TypeScript-Prüfungen bestanden. Das ist kein neuer Build-/Prüfnachweis dieser Planungsänderung. Die klassische Speicherung funktioniert nur in Bauphasen; es gibt drei grafische Turmstufen und keine fertigen Werkstatt-/Lagersprites im Builder-Pack.

## P1 — Kleine technische Grundlage

### B01 — Isolierter Einstieg und maßstäblicher Kartenrahmen

**Ergebnis:** Eine separat startbare und baubare Idle-Anwendung sowie ein geprüftes neutrales Startlayout. Keine fertige Spielprogression.

- [x] Branch, Arbeitsverzeichnis und Abhängigkeiten prüfen; im neuen Worktree fehlende ignorierte Dateien nicht als Quellverlust behandeln.
- [x] Eigenen Einstieg, Build, Konfiguration und Testaufruf einrichten. Geplant: `npm run idle:dev`, `idle:build`, `idle:test`; erst nach Einrichtung als ausführbar dokumentieren.
- [x] Übernommene Kampf-/Darstellungsmodule und Herkunft festhalten; klassische Spielregeln, Startdateien und Save-Keys schützen.
- [x] Instanzabhängige 40er-Zellen, 28×16-Startregion und späteres Flächenbudget bis 36×16 vorsehen. Keine globale Änderung alter Kartenkonstanten.
- [x] Neutrale Layoutprobe mit Kern/Pfadende, Werkstattgrundstück, vier aktiven Turmplätzen und Figurenzugängen bei 1366×768 und 1920×1080 ansehen.
- [x] Erste Gegner, Startturm, Mara-Position, Kern und Werkstattplatz ohne notwendiges Scrollen unterbringen; künftige östliche Turmplätze müssen den letzten Wegabschnitt erreichen können.

**Fertig, wenn:** Start und Build wirklich laufen, die Ausgangsgeometrie plausibel ist und keine Änderungen am klassischen Spiel erforderlich waren oder unbemerkt eingeflossen sind. Layoutprobe ist kein fertiger Screenshotnachweis des späteren Spiels.

### B02 — Automatischer Kampf und echte Bauwirtschaft

**Voraussetzung:** B01. **Ergebnis:** Ein legal spielbarer technischer Kampfkreislauf bei 1×.

- [x] Geschützten Waldwächter und reguläres Startgold anlegen; Startturm nicht verkauf-/verschiebbar machen.
- [x] Gegner, Zielwahl, Projektile, Schaden und 1×-Simulationsschritte aus bewährten Regeln übernehmen.
- [x] Wellen automatisch starten und fortsetzen; jeden neuen Versuch mit 20/20 Kernleben, frischer Gegnerwarteschlange und ohne alte Projektile beginnen.
- [x] Bauen, Level-1–3-Upgrades und zulässigen Verkauf aus dem echten Goldsaldo bezahlen; bestätigte Kills und Wellenabschlüsse genau einmal verbuchen.
- [x] Levelzahl und Grafikstufe trennen; Reichweiten-/Feuerratengrenzen und Preis-/Belohnungsdaten an zentraler Stelle festlegen.
- [x] Einstiegspfad und erste Welle so prüfen, dass allein der geschützte Startturm eine sichere Grundlage trägt; keine bloß behauptete Mindestrate einsetzen.

**Fertig, wenn:** Automatische Kämpfe Geld verdienen, reguläre Käufe den Kampf verändern, Wellen sauber wechseln und die reine Simulation ohne Phaser prüfbar bleibt. Niederlage ist ein definierter Zustand für B04, keine Löschung des Fortschritts.

### B03 — Konsistenter Spielstand während des Kampfes

**Voraussetzung:** B02. **Ergebnis:** Reload setzt Kampf, Geld und Käufe widerspruchsfrei fort.

- [x] Eigenen versionierten IndexedDB-Spielstand gemäß Technikvertrag anlegen; klassische Daten weder lesen noch ersetzen.
- [x] Türme, Gegner, Projektilwerte, Spawnfortschritt, IDs, Timer und Wirtschaft in einen serialisierbaren Zustand überführen.
- [x] Wirtschaftliche Änderungen atomar speichern und erst nach Commit bestätigen; asynchrone Schreibvorgänge in gültiger Reihenfolge abarbeiten.
- [x] Regelmäßige Kampfsnapshots ergänzen; noch unbestätigte reine Simulationsschritte dürfen bei hartem Abbruch begrenzt zurückspringen.
- [x] Reload nach Kill/Kauf, während einer Welle und vor Niederlage prüfen; bereits abgefeuerte Geschosse verkaufter Türme korrekt rekonstruieren.
- [x] Ungültige oder unbekannt neuere Saves schützen, bekannte Versionen kontrolliert behandeln; Schreibfehler verständlich anzeigen statt Speichern vorzutäuschen.

**Fertig, wenn:** Bestätigte Ressourcen und Käufe erhalten bleiben, keine Belohnung beim Restore erneut entsteht und deterministische Fortsetzung mit/ohne Reload übereinstimmt. Export/Import ist spätestens in B14 vollständig nachzuweisen.

### B04 — Sicheres Farmen, Offline-Zeit und Tab-Eigentümerschaft

**Voraussetzung:** B03. **Ergebnis:** Niederlage und Abwesenheit erzeugen einen verlässlichen, nachvollziehbaren Fortschritt.

- [x] Nach Niederlage auf eine gültige sichere Farmwelle wechseln; erneuten Vorstoß per Button am Wellenübergang beginnen und danach automatisch fortsetzen.
- [x] Farmnachweis nach realem autonomem Sieg durch zwei konservative Prüfläufe ohne Mara-Bonus bestätigen; Erstbesiegs-/Bossboni ausschließen und Zykluspausen einrechnen.
- [x] Relevante Änderungen entwerten Zertifikate; ohne Nachweis Welle 1 live spielen können und Offline-Rate zunächst null anzeigen.
- [x] Einen schreibenden Tab mit Eigentümerschaft und Writer-Epoche sichern; zweiter Tab, Leaseübernahme und später erwachender alter Tab dürfen kein Gold duplizieren oder neue Saves überschreiben.
- [x] Aktive Simulation, Hintergrundzeit, Suspend und ausdrückliche Pause eindeutig trennen. Pause bleibt gespeichert und erzeugt keine Offline-Produktion.
- [x] 60 % / 2 Stunden, unveränderlichen Abrechnungscursor und einmalige ausstehende Belohnung umsetzen; Reload, Doppelklick, negative Zeit und große Uhrsprünge prüfen.
- [x] Die P1-Fassung tatsächlich starten, Kampf/Farmen/Reload/Abwesenheit demonstrieren und verbleibende technische Grenzen dokumentieren.

**Fertig, wenn:** Keine Niederlagenschleife, kein doppelter Zeitraum und kein zweiter wirtschaftlich aktiver Tab entsteht. Der technische Kreislauf funktioniert; damit ist noch kein gutes Spielgefühl abgenommen.

## P2 — Der erste vollständige Spielkreislauf

### B05 — Startlichtung, Mara und kompakte Bedienung

**Voraussetzung:** B04; Layout aus B01. **Ergebnis:** Der Nutzer startet direkt in die echte Waldansicht und versteht die wichtigsten Eingriffe.

- [x] Eigene Waldvariante im Originalmaßstab zusammensetzen; Weg und Kern enden sichtbar konsistent, Gebäudegrundstück und Zugänge bleiben frei.
- [x] Mara von Anfang an darstellen und dem Startturm zuweisen; Anreise, Übertakten und automatische Wiederholung bei 8 Sekunden Wirkung / 30 Sekunden Cooldown ab Aktivierung integrieren.
- [x] Mara-Neuzuweisung, unzugängliche Ziele und Verkauf ihres Zielturms behandeln; Position, Weg, Wirkzeit und Cooldown durch Reload erhalten und die konservative Farmprüfung erneut prüfen.
- [x] Gold, sichere Farmbasis, Welle, Kernleben, Vorstoß/Farmen und ein nächstes Ziel anzeigen; keine volle spätere Menüleiste im Einstieg.
- [x] Turmbau, Auswahl, Upgrade, Verkauf und Pause verständlich bedienen; Kamerabewegung und Bauklick sauber trennen.
- [x] Alte dekorative Wisp-Baueffekte entfernen oder passend ersetzen, damit Wisp vor seiner Freischaltung nicht erscheint.
- [x] Startansicht und Bedienung in beiden Desktopauflösungen im Browser prüfen; alle Einstiegsziele ohne Kamerasuche erreichbar halten.

**Fertig, wenn:** Die Startansicht tatsächlich lebt, Mara ohne Dauerklicken unterstützt und der Spieler eine bezahlbare Aktion erkennt. Die ersten Käufe funktionieren mit echter Wirtschaft und Speicherung.

### B06 — Erste Werkstatt und sichtbar wirksame Technologie

**Voraussetzung:** B05. **Ergebnis:** Die Karte verändert sich durch ein Gebäude, das eine neue Kampfmöglichkeit eröffnet.

- [x] Grundstück, Silhouette, Anker, Referenzbilder und benötigte Zustände vor Assetproduktion nach Grafikvertrag festlegen.
- [x] Nur beschädigte Werkstatt und Werkstatt I produzieren/aufbereiten; Rohquelle, Prompt, Referenzen und technische Metadaten sichern.
- [x] Gebäude neben Originalturm, Baum und Mara bei echter Spielgröße prüfen; kurze Bauwirkung ohne fremden Stil und ohne vorzeitig auftauchenden Wisp integrieren.
- [x] Werkstatt gegen reguläres Gold bauen; Bauzustand, Grundstück und Freischaltungen korrekt speichern.
- [x] „Frostfassung“ gegen Gold kaufen: Frostkristall und Level 4–6 freischalten; Frostwirkung im tatsächlichen Kampf zeigen.
- [x] Baupreise, Erträge und Folgekäufe gemeinsam abstimmen: Werkstatt nach etwa 60–90 Sekunden, erste Technik samt nutzbarem Frostturm in kurzer Fortsetzung bis ungefähr 150 Sekunden erreichbar.

**Fertig, wenn:** Die Werkstatt sichtbar und stilistisch passend entsteht, eine erkennbare taktische Folge hat und nicht nur ein Menüeintrag bleibt. Lager, Werkstatt II und spätere Assets bleiben unproduziert.

### B07 — Live-Tutorial, Balance und Zwischenabnahme vorbereiten

**Voraussetzung:** B06. **Ergebnis:** Eine selbst startbare Fassung mit nachgewiesenem ersten Spielkreislauf.

- [x] Kurze Mara-Hinweise und ein aktuelles Ziel für Kampf, eigenen Turm, Upgrade, Werkstatt und Frostfassung an tatsächliche Ereignisse binden.
- [x] Skip, zustandsbezogenes Wiederanzeigen, bereits erledigte Schritte, alternative Turmplätze und Reload prüfen; keine zusätzlichen Ressourcen durch Tutorialwiederholung.
- [x] Einen echten frischen 1×-Durchlauf mit Zeitprotokoll spielen: erste Gegner/Schüsse, erstes Gold, eigener Turm bis 20 Sekunden, Upgrade und Werkstatt bei etwa 60–90 Sekunden.
- [x] Erste Technologie und Frostwirkung nur als kurze Fortsetzung bis etwa 120–150 Sekunden nachweisen; die Zielzeit nicht durch feste Geschenk-Timer erzwingen.
- [x] Drei Spielweisen prüfen: Tutorial folgen, anders investieren, drei Minuten zuschauen und dann weiterspielen. Unterschiedliches Tempo zulassen, Sackgassen beheben.
- [x] Speicherung/Farming mit dieser echten Anfangsverteidigung erneut gezielt prüfen, einschließlich Mara und Frost; nur betroffene Prüfungen wiederholen.
- [x] Startanleitung, konkrete Fassung, echte Screenshots, gemessene Zeiten und die drei wichtigsten Schwächen zur Nutzerprobe vorlegen.

**Fertig, wenn:** Die Fassung startbar ist, der Ablauf nachvollziehbar funktioniert und alle Nachweise samt Abweichungen vorliegen. Das Paket fertigzustellen ist noch keine Nutzerfreigabe.

## G1 — Verbindlicher Halt: 90-Sekunden-Zwischenabnahme

**Status: FREIGEGEBEN am 18.10.2026. Aktueller Auftrag: B08 mit möglichst kompakten Tests.**

- [x] B01–B07 nachgewiesen; keine wesentlichen offenen Speicher-/Farmfehler in der vorgelegten Fassung.
- [x] Startbare Probe, Commit, Screenshots, Zeitprotokoll und Ergebnisse der drei Spielweisen bereitgestellt.
- [x] Spielgefühl selbst kritisch beurteilt: verständliche Entscheidungen, spürbare Verbesserungen, wenig Leerlauf, Werkstatt als echter Fortschritt und stimmiger Maßstab.
- [x] Nutzer konnte die konkrete Fassung beurteilen; verlangte Änderungen innerhalb P2 umgesetzt und bei Bedarf erneut vorgelegt.
- [x] **Ausdrückliche Nutzerfreigabe erhalten und hier dokumentiert.** Dieses Kästchen darf nur aufgrund der tatsächlichen Nutzerentscheidung gesetzt werden.

| Freigabenachweis | Eintrag |
| --- | --- |
| Geprüfte Fassung / Commit | `8a0a276` · [Playlink](https://emfau88.github.io/TD/idle-bastion/) · [Bericht](../../artifacts/idle-bastion/acceptance/90s/REPORT.md) |
| Datum und Chatbezug | 18.10.2026 · ausdrückliches Go zum nächsten Bulk B08 nach Veröffentlichung des Premium-HUD |
| Wortlaut / Entscheidung | „Ok go, halte deine Tests so kompakt und klein wie möglich“ — Antwort auf den vorgeschlagenen B08-Durchlauf einschließlich G1-Freigabe. |
| Offene Auflagen | Kompakte, gezielte Prüfungen. B09 und folgende nicht Teil dieses Durchlaufs; keine Behauptung einer erneuten gemessenen Nutzerprobe. |

Historische Halteregel bis zur obigen G1-Freigabe: Während des Wartens nur P2 prüfen und korrigieren. Kein Wisp, Lager, Boss, Werkstatt II oder freischaltbare Erweiterung vorziehen und keine entsprechenden Assets auf Vorrat erzeugen. Zeitablauf, erfolgreiche Tests und allgemeine Entwicklungsautonomie ersetzen die Freigabe nicht.

## P3 — Frühe Siedlung und Rückkehr

### B08 — Wisp, weitere Turmrollen und Bauplätze

**Status: ABGESCHLOSSEN.** [Prüfung und echte Aufnahmen](../../artifacts/idle-bastion/acceptance/p3/B08.md).

**Voraussetzung:** G1 ausdrücklich freigegeben. **Ergebnis:** Zweite Figur und weitere Turmrollen verändern die Entscheidungen des Spielers.

- [x] Abgenommenen Einstieg beibehalten; relevante Balanceänderungen gegen seine gemessenen Zeiten prüfen.
- [x] Wisp nach Frostfassung und Welle 5 etwa bei Minute 2–4 freischalten; vorhandene Figur verwenden, keine Charakterlevel einführen.
- [x] 10 % Bonus auf wiederholbare Gegner-/Wellenbelohnungen korrekt und genau einmal vergeben; sichtbaren Auftrag ohne Sammelzwang darstellen.
- [x] Steinschleuder bei Wisp-Freischaltung und Scharfschütze nach Welle 10 anbieten; passende Gegnerrollen ohne unerwartete unlösbare Sperre einführen.
- [x] Je zwei weitere Startregion-Turmplätze nach Welle 5 und 10 öffnen und speichern.
- [x] Tutorial, Save und Farmzertifikate um die tatsächlichen Freischaltungen ergänzen; Wisps Bonus nicht ein zweites Mal auf Offline-Erträge anwenden.

**Fertig, wenn:** Vier unterscheidbare Turmrollen nutzbar sind und Wisps automatischer Nutzen sichtbar und messbar ist.

### B09 — Vorratslager und befriedigende Rückkehr

**Status: ABGESCHLOSSEN UND VERÖFFENTLICHT.** Nutzerauftrag: „Nächster Bulk“ nach veröffentlichtem B08. Ein benötigtes Lagerasset ist Teil dieses Pakets.

**Voraussetzung:** B08. **Ergebnis:** Ein zweites sichtbares Gebäude verbessert die nächste Spielsitzung.

- [x] Nur benötigtes Lagerasset nach Grafikvertrag produzieren, in Spielgröße neben der Werkstatt prüfen sowie Herkunft, Aufbereitung und Nutzung dokumentieren.
- [x] Lager nach Wisp und Welle 8 gegen Gold etwa bei Minute 4–6 bauen; Grundstück und Figurenwege freihalten.
- [x] Offline-Werte ab Kauf auf 65 % / 8 Stunden erhöhen; keine rückwirkende Verbesserung vergangener Abwesenheit.
- [x] Sichere Basis, Effizienz, Limit und Ein-Stunden-Beispiel verständlich anzeigen; Tutorialhinweis ohne lange Unterbrechung.
- [x] Kontrolliert nachgestellte Ein-Stunden-Abwesenheit mit regulär erspieltem Stand abrechnen und danach real weiterspielen; sinnvolle Käufe und erhaltene Fortschrittsbedingungen nachweisen.
- [x] Abwesenheit über acht Stunden, wiederholte Rückkehr vor Claim und Lagerwerte nach Reload prüfen; kein erneuertes Limit allein durch Öffnen des Dialogs.

**Veröffentlichung:** Codecommit `34382cc`, [Pages-Lauf 39080652213](https://github.com/emfau88/TD/actions/runs/39080652213) erfolgreich. Öffentlicher Playlink mit geladenem Lagerasset und erklärter Kaufsperre vor Wisp/Welle 8 geprüft.

**Nachweis:** [B09-Bericht mit echtem Kauf, Rückkehrprüfung und Desktop-/Hochkantaufnahmen](../../artifacts/idle-bastion/acceptance/p3/B09.md).

**Fertig, wenn:** Lager und Rückkehr einen verständlichen Vorteil bringen, ohne die Anfangsprogression oder die Abrechnungsregeln zu umgehen. Kein zusätzlicher verpflichtender Nutzerhaltepunkt.

## P4 — Boss, Kartenwachstum und weiterer Ausbau

### B10 — Erste Bossherausforderung

**Status: ABGESCHLOSSEN UND VERÖFFENTLICHT.** Am 18.10.2026 mit „Go b10“ beauftragt. Auf den anschließenden Nutzervorschlag hin ersetzt Succubus „Rosenspiegel“ die geplante Magmakrabbe: angekündigte Turmverführung, durch Frost unterbrechbar, plus kleine gepanzerte Begleitgruppe. Vorhandene Assets; keine zusätzliche Grafikproduktion.

**Voraussetzung:** B09. **Ergebnis:** Eine lesbare Herausforderung belohnt die verfügbaren Turmkombinationen.

- [x] Vorhandene Succubus „Rosenspiegel“ als Boss in Welle 15 samt kleiner Begleitgruppe konfigurieren; kein neues umfangreiches Grafikpaket erzeugen.
- [x] Bossankündigung, Lebensanzeige und nachvollziehbare Wirkung von Frost, Fläche und Rüstungsdurchdringung zeigen.
- [x] Zielbereich etwa Minute 7–10 mit legaler Verteidigung prüfen; bei Scheitern sichere Farmphase und bewussten neuen Vorstoß ermöglichen.
- [x] Erstbesiegung und spätere Wiederholungsbelohnungen sauber trennen; Bosswellen nicht als sichere Offline-Farmbasis verwenden.
- [x] Gespeicherter Bossfortschritt übersteht Reload; unterbrochener Kampf vergibt keinen vorzeitigen Sieg.

**Fertig, wenn:** Ein regulärer erster Bosssieg möglich, verständlich und als Meilenstein gespeichert ist.

[Gezielte Prüfung und echte Screenshots](../../artifacts/idle-bastion/acceptance/p4/B10.md). Umsetzung `c22494e`; [Pages-Lauf 39082715325](https://github.com/emfau88/TD/actions/runs/39082715325) erfolgreich. Öffentlicher Playlink mit Bundle `battle-DumR7ptg.js`, laufendem Kampf und Rosenspiegel-Abschnitt in der Chronik geprüft.

### B11 — Scrollbare Lichtung mit tatsächlichem Nutzen

**Voraussetzung:** B10; geometrische Vorbereitung aus B01. **Ergebnis:** Die bestehende Welt wird sichtbar größer und sinnvoll nutzbar.

- [x] Nach Boss 15 und Goldkauf eine östliche Lichtung öffnen, Ziel etwa Minute 8–11; maximal acht zusätzliche Spalten, keine neue Region.
- [x] Genau zwei neue Turmplätze nahe der westlichen Erweiterungskante anlegen; echte Schussfenster auf den vorhandenen letzten Wegabschnitt prüfen.
- [x] Gegnerpfad und Kern während Freischaltung nicht verschieben; keine zweite Angriffsfront oder hinter dem Kern weiterlaufenden Gegner erzeugen.
- [x] Waldkante sichtbar freilegen und Kameragrenzen erweitern, ohne sämtliche Objekte zu verkleinern; nur benötigte Dekoration ergänzen.
- [x] „Lichtung ansehen“ anbieten, keinen überraschenden Kamerasprung erzwingen; HUD und Rückkehr-zur-Verteidigung bleiben bedienbar.
- [x] Gesperrte Plätze vor Freischaltung zurückweisen; Freischaltung, Bauplätze, Figurenzugänge und Kameraverhalten nach Reload, im Kampf und bei beiden Viewports prüfen.

**Entscheidung und Nachweis:** Vier zusätzliche Spalten auf 32×16, einmalig 900 Gold nach echtem Boss-15-Sieg. Im legalen Modellablauf nach 9:42 Minuten geöffnet. [Gezielte Prüfung und Desktop-/Hochkantaufnahmen](../../artifacts/idle-bastion/acceptance/p4/B11.md).

**Fertig, wenn:** Der Nutzer tatsächlich in einen neuen Abschnitt scrollt und dessen Turmplätze taktisch helfen. Eine größere leere Karte oder Plätze außerhalb der Reichweite erfüllen das Paket nicht.

**Veröffentlichung:** Codecommit `cd71fba`, [Pages-Lauf 39142819226](https://github.com/emfau88/TD/actions/runs/39142819226) erfolgreich. Öffentlicher Playlink mit finalem Bundle, übernommenem Altstand und neuem Lichtungsmenü geprüft. B12 nicht begonnen.

### B12 — Werkstatt II und Fortschritt nach Minute 15

**Voraussetzung:** B11. **Ergebnis:** Sichtbarer weiterer Ausbau und ein erreichbares nächstes Ziel.

- [x] Werkstatt II nach Lichtung und Goldkauf etwa bei Minute 10–13 zugänglich machen; kleinen sichtbaren Anbau im bisherigen Maßstab ergänzen, Herkunft dokumentieren und Gebäudestufe nach Reload prüfen.
- [x] Level 7–20 freischalten; erste 15 Minuten auf ungefähr Level 1–10 ausrichten, spätere Level als normale Schadensupgrades ohne neue Fähigkeiten/Grafikstufen.
- [x] Zahlenlevel und vorhandene drei Grafikstufen korrekt zuordnen; Reichweite und Feuerrate innerhalb der festgelegten Grenzen halten.
- [x] Zweiten Boss um Welle 25 als nahes oder erreichtes Ziel bei etwa Minute 13–15 anbieten.
- [x] Weitere Wellen datengetrieben skalieren und Farmen stabil erhalten; Gegner-/Projektilmenge und Zahlenbereiche begrenzen.
- [x] Nächstes wirklich erreichbares Upgrade anzeigen; keine aktive Quest für ein nicht implementiertes Zukunftsgebäude ausgeben.

**Fertig, wenn:** Die Siedlung nochmals sichtbar wächst und nach Minute 15 ohne künstliches Ende sinnvoll weitergespielt werden kann.

**Nachweis:** [B12-Bericht und echte Spielaufnahmen](../../artifacts/idle-bastion/acceptance/p4/B12.md). Gezielter Modellverlauf mit verdientem Gold: Werkstatt II bei 13:01; nach 15 Minuten Rekord 20 und ein konkreter nächster Kauf. Welle 25 ist dabei als nächstes Bossziel sichtbar, nicht bereits besiegt. Gesamtabstimmung und vollständige 15-Minuten-Browserabnahme folgen in B13; keine G2-Abnahme behauptet.

**B12 veröffentlicht:** Codecommit `c40864c`, [Pages-Lauf 39147533177](https://github.com/emfau88/TD/actions/runs/39147533177) erfolgreich. Öffentliches Bundle `battle-CqIGhtYi.js`, übernommener Altstand und getrennte Bosschronik bestätigt.

## P5 — Gesamterlebnis, Stabilität und Lieferung

### B13 — Vollständiger legaler Verlauf und Balancekorrektur

**Abgeschlossen und veröffentlicht.** Am 19.10.2026 ausdrücklich einschließlich neuer Gegnerbalance, kompakter Tests und Commit/Push beauftragt.

**Voraussetzung:** B12. **Ergebnis:** Ein gemessener Spielverlauf statt lediglich vorhandener Einzelmechaniken.

- [x] Einen echten 15-Minuten-Durchlauf im Browser mit frischem Save, regulären Aktionen und 1× durchführen; Ladezeit getrennt erfassen.
- [x] Tatsächliche Zeiten für Werkstatt, Frostfassung, Wisp, Lager, Boss, Lichtung und Werkstatt II protokollieren und gegen den Auftrag prüfen; den abgenommenen Einstieg nach späteren Balanceänderungen gezielt erneut verifizieren.
- [x] Fortschritt über die Sitzung verteilen; unnötige Wartezeiten, unklare Ziele und bedeutungslose Käufe beheben.
- [x] Alternative Investitionen und anfängliches Zuschauen mit dem vollständigen System auf Sackgassen prüfen; die Varianten müssen nicht gleich schnell sein.
- [x] Rückkehrsitzung aus regulärem Fortschritt weiterführen; simulierte Abwesenheit ausdrücklich kennzeichnen und echte nachfolgende Käufe zeigen.
- [x] Drei wichtigste spielerische Schwächen benennen; nach Änderungen nur betroffene Prüfungen wiederholen, keinen simulierten Durchlauf als Echtzeitplaytest ausgeben.

**Fertig, wenn:** Der Verlauf nachgewiesen und verständlich ist, mehrere spürbare Erfolge bietet und wesentliche Balanceprobleme behoben oder ausdrücklich offengelegt sind. Fehlender Echtzeitdurchlauf bleibt ein offener Nachweis.

**Nachweis:** [B13-Bericht mit echten 15 Minuten, drei Modellvarianten, Rückkehrkäufen und Screenshots](../../artifacts/idle-bastion/acceptance/15min/REPORT.md). 24 gezielte Tests und Produktionsbuild bestanden. Nutzerbewertung bleibt offen; B14/G2 werden damit nicht vorweggenommen. Codecommit `3ffd64b`, [Pages-Lauf 39245665113](https://github.com/emfau88/TD/actions/runs/39245665113) erfolgreich; öffentliches B13-Bundle und Chronik geprüft.

### B14 — Regression, Langzeitbetrieb und prüfbare Lieferung

**Voraussetzung:** B13. **Ergebnis:** Reproduzierbar startbarer, technisch geprüfter Slice mit ehrlichen Grenzen.

- [ ] Vollständige Speicher-/Offline-Matrix aus dem Abnahmeplan einschließlich zwei Tabs, Suspend, abgebrochener Claims und Speicherfehler abschließen.
- [ ] Validierten Save-Export/Import fertigstellen und prüfen; fremde/defekte Daten abweisen, gültigen Stand nicht ohne bewusste Bestätigung ersetzen.
- [ ] Bestehende Tests, TypeScript, Idle-Build und betroffene klassische Builds prüfen; heutige Waldversion zusätzlich im Browser öffnen. Historische JSDOM-Tests sind kein visueller Nachweis.
- [x] Leeren dunklen Balken aus B13-Aufnahmen separat auf Nutzerauftrag eingegrenzt und korrigiert; Nachweis bei der HUD-Nachbesserung. B14 insgesamt bleibt nicht begonnen.
- [ ] Mindestens 30 Minuten ununterbrochenen Browserbetrieb plus längere beschleunigte Modellprüfung durchführen; Last, Browser, Gerät, Speicher sowie Objekt-/Eventgrenzen dokumentieren.
- [ ] Separaten Idle-Build und möglichst eigenständiges HTML tatsächlich öffnen; gültige Startbefehle sowie Origin-/Dateipfadgrenzen der Speicherung dokumentieren.
- [ ] Echte Screenshots aus erster Minute, Werkstatt, ungefähr Minute 15 und geöffneter Lichtung liefern; Grafikquellen und verwendete Assets nachvollziehbar zuordnen.
- [ ] Technischen Bericht, Testbericht und offene Punkte mit Status vollständig/teilweise/vorbereitet/nicht begonnen ablegen; keine ungefragte Vorschauveröffentlichung.

**Fertig, wenn:** Die Fassung reproduzierbar prüfbar ist, das klassische Spiel funktionsfähig bleibt und Leistungs-/Speichergrenzen mit tatsächlichen Ergebnissen beschrieben sind.

## G2 — Vollständigen Slice bewerten

**Status: OFFEN.**

- [ ] B08–B14 mit Nachweisen abgeschlossen; verbleibende Einschränkungen ausdrücklich genannt.
- [ ] Spielbarer Build, Zeitverlauf, Rückkehrnachweis, technische Berichte und echte Screenshots bereitgestellt.
- [ ] Kritische Bewertung beantwortet: neugieriger Einstieg, verständliche Entscheidungen, befriedigende Upgrades, Wartezeiten, Beitrag der Siedlung, Motivation nach 15 Minuten und drei größte Schwächen.
- [ ] Nutzerentscheidung zur konkreten Fassung dokumentiert; technische Prüfung und Nutzerabnahme getrennt ausgewiesen.

Die Gesamtabnahme erlaubt nicht automatisch zusätzliche Spielphasen, Kongregate-Anbindung, Veröffentlichung oder Merge nach `main`.

## Abschlussnachweis und Übergabe

Keine separate Datei pro Checkbox anlegen. Ein kurzer Bericht pro Phase genügt, mit Abschnitten für die Pakete. Empfohlene Ablage im Repository: `artifacts/idle-bastion/acceptance/`. Die Nutzerproben liegen unter `90s/REPORT.md` und `15min/REPORT.md`; diese Dateien erst bei tatsächlicher Umsetzung anlegen.

Für jedes abgeschlossene Paket im Bericht festhalten:

- Ergebnis und zugehöriger Commit; was jetzt wirklich funktioniert.
- Tatsächlich ausgeführte Prüfungen mit Ergebnis und gegebenenfalls Screenshot/Startbefehl.
- Offene Fehler, nicht geprüfte Annahmen und Änderungen an Balance-/Layoutwerten.
- Nächstes zulässiges Paket oder erforderliche Nutzerentscheidung.

**Nach Unterbrechung:** zuerst dieses Board und den letzten Bericht lesen. Aktuelles Paket, offene Checkboxen und Freigabestatus prüfen; bereits abgeschlossene Arbeit nicht erneut beginnen. Ein funktionierender Teil eines Pakets darf als Teilfortschritt gemeldet werden, ohne das Gesamtpaket fertigzusetzen.

## Entscheidungsprotokoll

| Datum | Entscheidung |
| --- | --- |
| 17.10.2026 | Überarbeiteten Markdown-Auftrag und Roadmap im neuen Branch angelegt; Spielimplementierung noch nicht beauftragt |
| 17.10.2026 | Kompakter Start, schrittweise wachsende scrollbare Karte und genau eine Erweiterung im Slice |
| 17.10.2026 | Verbindliche Nutzer-Zwischenabnahme nach den ersten 90 Sekunden; kurze Technologievorführung bis etwa 150 Sekunden gehört dazu |
| 17.10.2026 | Feste Turmplätze, manuelle Käufe/neuer Vorstoß, 1×, Kernreset, konservatives Farming und atomarer Kampfsave festgelegt |
| 17.10.2026 | Roadmap zu 14 prüfbaren Arbeitspaketen mit Checklisten und Abschlusskriterien ausgebaut; Funktionsumfang und Freigabegrenzen bleiben gleich |

| 17.10.2026 | B01 umgesetzt und geprüft; Nutzer beauftragt anschließend ausdrücklich B02 |


| 17.10.2026 | B02 umgesetzt und geprüft; Nutzer beauftragt anschließend ausdrücklich B03 |


<a id="akt-ii"></a>

## P6 — Akt II: Taverne, neue Verteidigung und eine echte Ostfront

**Planung vom 19.10.2026; anschließend B15a ausdrücklich beauftragt, ohne Ilyra.** Die ursprüngliche Roadmap-Erweiterung einschließlich bisher ungenutzter Türme bleibt erhalten; nur der unten abgegrenzte Teil ist zur Umsetzung freigegeben. Kern/HQ und verbündete Einheiten werden ausdrücklich nur als spätere Ideen notiert. B14, G2 und die Gegnerproduktion B12d werden durch diesen Plan weder abgeschlossen noch automatisch gestartet.

**Ziel:** Nach dem bisherigen Ausbau folgen ungefähr zwischen Welle 26 und 40 neue Entscheidungen: Ilyra rekrutieren, weitere Turmrollen kennenlernen, die Ostverteidigung vorbereiten und zwei Fronten meistern. Das ist ein überschaubarer zweiter Akt, kein Versprechen einer fertigen Endlosbalance. Bestehender Inhalt wird erhalten; insbesondere tritt der Leerenfalter bereits ab Welle 28 auf.

Die folgenden Pakete ergänzen die alten Checklisten. Die bisherigen Grenzen „eine Front“, „höchstens 36 Spalten“ und „keine Taverne“ beschreiben Akt I; die geplanten Abweichungen gelten ausschließlich für einen später beauftragten Akt II. Fachentscheidungen und Quellen: [AKT_II.md](docs/AKT_II.md). Paketstatus bleibt ausschließlich hier.

### Geprüfter Bestand und Auswahl

- [x] Vier bisher spielerisch ungenutzte Türme in den klassischen Daten samt Originalgrafiken identifiziert; Idle unterstützt derzeit nur Turmtypen 1–4.
- [x] Ilyra und Runa samt älteren Fähigkeiten und Rohgrafiken geprüft; noch keine fertigen Idle-Figuren.
- [x] Bestehende Karten-, Save- und Farmgrenzen geprüft; zwei Fronten benötigen gezielte Änderungen über eine bloße Kartenverbreiterung hinaus.

| Bestand | Möglicher Nutzen | Entscheidung für den Plan |
| --- | --- | --- |
| Sturmlicht / Turm 05 | Kettenblitz über mehrere getrennte Ziele | Erster zusätzlicher Turm, B16 |
| Schnellfeuer / Turm 06 | Sehr schneller Einzelschaden | Reserve; überschneidet sich derzeit mit Waldwächter und Mara |
| Glutwerfer / Turm 07 | Bodenzone und anhaltender Brandschaden, Kombination mit Frost | Zweiter zusätzlicher Turm, B20 |
| Sonnenobelisk / Turm 08 | Schwerer Flächen-/Durchschlagsangriff | Reserve; seine Grafik stellt bereits den Kern dar. Erst eigene Rolle und unterscheidbare Darstellung festlegen |
| Ilyra, Himmelsritterin | Gezielte Sternensalve, besonders wirksam gegen Flieger | Erste garantierte Rekrutin der Taverne, B15 |
| Runa, Moorhexe | Kontrollzone/Nebelschleier | Spätere alternative Rekrutin; nicht gleichzeitig mit Ilyra einführen, Überschneidung mit Frost vermeiden |

Alte Preise, Reichweiten und Schadenswerte sind Referenzen, keine zugesagte Idle-Balance. Die aktuelle Idle-Steinschleuder trifft auch Flieger; neue Rollen dürfen diese bestehende Funktion nicht stillschweigend entfernen.

### Reihenfolge und Paketgröße

M = abgegrenzter Funktionsausbau, L = mehrere zusammenhängende Systeme. Das sind relative Größen, keine Stunden- oder Ein-Durchlauf-Zusagen. Große Pakete haben explizite Teilschritte; nur das vollständige Ergebnis schließt das Paket ab.

| Paket | Ergebnis | Größe | Abhängigkeit | Status |
| --- | --- | --- | --- | --- |
| B15 | Taverne und verständlich eingeführte Ilyra | M–L, zwei Teilschritte | Bestehender Akt I | B15a veröffentlicht; B15b umgesetzt und geprüft |
| B16 | Sturmlicht als neue taktische Turmrolle | M | B15b / Ilyras Einführung | Geplant |
| B17 | B17a: Siedlung am Kern; B17b: große Ostkarte | M je Teilschritt | B17a nach F01; B17b mit B18 vorbereiten | B17a umgesetzt; B17b geplant und bis B19 intern |
| B18 | Zwei Kampfrouten, sichere Saves und Farming | L, zwei Teilschritte | B17; relevante offene Speicherrisiken aus B14 klären | Geplant |
| B19 | Vorbereitbarer, bewusst geöffneter Ostangriff | M | B15–B18 | Geplant; erste öffentliche Ostfront |
| B20 | Glutwerfer und belastbarer Brandschaden | M | B19 | Geplant |
| B21 | Wellen 26–40, Zusammenspiel und Akt-II-Boss | L, Wellen und Boss getrennt bearbeiten | B19/B20 | Geplant |
| B22 | Kompakte Gesamtprobe und prüfbare Lieferung | M | B15–B21 | Geplant |

B15/B16 können eigenständig spielbar veröffentlicht werden. B17a darf die nützliche Siedlungsfläche nach eigener Beauftragung bereits veröffentlichen. B17b/B18 dürfen in Zwischenständen keine kostenpflichtige leere Erweiterung und keine unfertige Front aktivieren. Die Ostfront wird erst mit B19 angeboten. Erforderliche Speicherreparaturen gehen der Einführung neuer Routen vor; das ersetzt nicht die übrigen offenen B14-Nachweise.

### Ergänzung vom 20.10.2026 — Frostturm und Siedlung am Kern

**Auftrag:** Plan ergänzen und anschließend **F01/Frostturm umsetzen**. B17a/B17b wurden hier zunächst nur geplant; B17a wurde anschließend mit „ok go“ separat freigegeben und umgesetzt. Bestehende Pakete und Nachweise bleiben erhalten. Empfohlene Reihenfolge: F01 → B17a → B15b/Ilyras Einführung → B16 → B17b/B18 → B19. Die fertige Ilyra-Animationsvorschau bleibt unabhängig nutzbar.

#### F01 — Frostturm auf denselben Boden setzen

**Umfang klein, umgesetzt und kompakt geprüft.** Grafikrahmen 64×192 gegenüber 64×128 bei den anderen Türmen; die bisherigen Anker 0,81/0,8 erzeugen bei Faktor 0,63 einen relativen Versatz von 6,8544 Spieleinheiten nach unten.

- [x] Einen gemeinsamen Montagevertrag für Bauvorschau, Erzeugung und laufende Darstellung verwenden; Frostsockel unten mit den übrigen Turmtypen ausrichten.
- [x] Frostkristall um denselben Betrag mitführen, damit seine Position relativ zum Sockel erhalten bleibt. Rahmen/Animationen aller drei Stufen beibehalten.
- [x] Baukoordinaten, Reichweiten, Auswahlzelle, Save-Schema und Kampfregeln unverändert lassen. Kein neues Asset.
- [x] Kompakt prüfen: Produktionsbuild sowie Vorschau/Bau/Upgrade in drei Stufen neben anderen Türmen, ober- und unterhalb eines Wegs; Bau-Staub und eine Hochkantansicht mitprüfen.

Nachweis: [F01-Bericht mit Messwerten und Spielansichten](../../artifacts/idle-bastion/acceptance/f01/REPORT.md). Tatsächliche Sprite-Unterkanten bei allen drei Vergleichstürmen/-stufen identisch (29,128 Spieleinheiten unter der Zellenmitte), Vorschau/Bau deckungsgleich. Produktionsbuild bestanden; keine zusätzliche Volltestsuite.

**Fertig, wenn:** Vorschau und gebauter Frostturm denselben Platz zeigen und der Sockel in jeder Stufe auf gleicher Höhe wie die Nachbartürme steht.

#### B17a — Siedlung am Kern, vorgezogener Kartenteil

**Am 20.10.2026 freigegeben und umgesetzt.** Die Basisfläche bekommt sofort einen Nutzen durch bestehende Gebäude. Sie schaltet keine neue Angriffsroute frei.

- [x] Kern bei `(27, 6)`, 40er Zellen und bestehenden Westweg erhalten. Die Startkarte rechts um eine kompakte, von Anfang an zugängliche Basisfläche erweitern; Endmaß für neue Partien: 40×16 Zellen, also zwölf zusätzliche Spalten gegenüber der alten Startkarte.
- [x] Werkstatt, Lager und Taverne südlich/südöstlich des Kerns in einem frei bebaubaren Siedlungsbereich unterbringen. Vorplätze, Gehwege, Bauanimationen, Beschriftungen und Reserve für wenige spätere Gebäude einplanen; vorhandene Assets und Grundstücksgrößen übernehmen.
- [x] Den künftigen Ostweg zum Kern schon geometrisch reservieren, einschließlich bis zu drei Reihen Turmbaufläche auf beiden Seiten. Siedlung außerhalb dieses Korridors halten; reservierte Bereiche im aktuellen Spiel nicht als fertige Front oder bezahlbares leeres Gebiet anbieten.
- [x] Neue Spiele beginnen mit der neuen Siedlungsfläche. In Altsaves Gebäude, Stufen, Gold und Fortschritt erhalten; bisherigen Standort bis zu einem bewusst gewählten kostenlosen Umzug gültig lassen. Umzug nur in sicherer Pause, atomar speichern und zugängliche Eingänge garantieren. Türme und laufende Gegner nicht verschieben.
- [x] Bisher für 900 Gold gekaufte Lichtung samt gesetzten Türmen erhalten. Ihr Besitz wird für den späteren Ostzugang angerechnet; die kostenlose Basisfläche ersetzt diesen Gegenwert nicht durch einen erneuten Kauf. Festgelegt: `clearing.unlocked` bleibt der gespeicherte Kaufbeleg; daraus folgen 900 Gold zweckgebundene Anrechnung beim späteren Ostzugang. Keine Auszahlung, kein neuer Lichtungskauf in der Oberfläche.
- [x] **Nutzerkorrektur während der Umsetzung:** keine zusätzlichen Front-/Basis-Buttons. Desktop per gedrückter linker Maustaste, mobil per Touch verschieben; Hochkantmaßstab erhalten. Echte Bau-/Lernaktionen fokussieren den Zielort einmalig. Die vorhandene Übersicht holt im aktiven Lernschritt das Ziel zurück; keine neue HUD-Zeile oder automatische Kamerafahrt bei gewöhnlichen Ereignissen.
- [x] Einführung mit Mara, Werkstatt/Frost, Wisp-Ankunft und später Ilyra an tatsächliche Gebäude-/Kernpositionen anbinden. Bestehende Lernpausen und klare Menüführung erhalten; keine zweite Pflichtanleitung, keine längere Sparphase.
- [x] Kompakt geprüft: frischer Einstieg bis gebautem Frostturm mit 20/20 Leben, fortgeschrittener Save mit allen Gebäuden und gekaufter Lichtung, kostenloser Umzug samt Reload sowie echte Maus-/Touchverschiebung in normalem Hochkant. Fünf gezielte neue und vier bestehende Prüffälle; Produktionsbuild erfolgreich. [Bericht und aktuelle Ansichten](../../artifacts/idle-bastion/acceptance/b17a/REPORT.md).

**Fertig, wenn:** Die Basis ist als geschützte Siedlung am Kern verständlich, Gebäude bleiben frei platzierbar und erreichbar, der zukünftige Ostkorridor bleibt frei, und Altsaves verlieren keinen Besitz.

**Übergangsregel:** Ein alter Spielstand behält bis zum freiwilligen Umzug auch seine alte Kartengeometrie. In „Siedlung → Siedlung am Kern“ ist der Umzug nach der Einführung bei manueller Pause verfügbar. Die neue Karte ersetzt die alte in einer gemeinsamen Speichertransaktion; anschließend sind die Gebäude in der Basis frei versetzbar. Dies verhindert verdeckte Ortsänderungen während einer laufenden Partie.

#### B17b — Ostkarte auf dieser Basis fortführen

Die ursprünglichen großen Ostkarten-/Kameraanforderungen unter B17 bleiben bestehen. Die neue Siedlung und ihr sicherer Umzug werden in B17a vorgezogen; Angaben zum Erhalt alter Gebäudeplätze gelten für die Übergangsphase bis zum freiwilligen Umzug. B17b erweitert anschließend östlich der Basis in Richtung des bisherigen Arbeitsziels von etwa 56×16 Zellen. B18 liefert Routen/Speicherung, B19 die bewusst eröffnete Ostfront. Keine Ostgegner durch B17a und keine zweite Zahlung für bereits erworbenes Gebiet.

### B15 — Taverne und Ilyras erste Rekrutierung

**Gesamtziel bleibt:** Die Siedlung bekommt einen neuen Zweck und eine verständlich eingeführte Kampffigur. **Geänderte Reihenfolge auf Nutzerwunsch:** zuerst B15a nur Taverne; danach separat B15b Ilyra. Das Gesamtpaket ist erst mit der Rekrutierung fertig.

#### B15a — Gebäude, noch ohne Rekrutierung

Am 19.10.2026 ausdrücklich beauftragt; anschließend um Werkstatt-II-Asset und Gebäudebeschriftungen ergänzt.

- [x] Tatsächlicher Sieg gegen Boss 25 schaltet Taverne frei; ein hoher Rekord allein genügt nicht. Baupreis 1.200 Gold, entsprechend der einmaligen Bossbelohnung.
- [x] Neue Option an Siedlung/Baukarte markieren und nach Öffnen speichern. Vor Boss 25 gesperrt; keine neue Pflichtaufgabe oder Tutorial-Unterbrechung.
- [x] Frei platzieren und bei Pause versetzen. Eine zusätzliche südliche Hofreihe nur für die Taverne ermöglicht bei allen bisherigen legalen Gebäudeanordnungen Platz, ohne alte Gebäude zu verschieben.
- [x] Ein Tipp baut; Menü schließt, kurze Bauanimation sichtbar. Kein leerer Platzhalter vor dem Bau.
- [x] Ehrliche Kaufbeschreibung: derzeit Treffpunkt, noch keine Gäste, Rekrutierung oder Kampfboni. Die spätere erste Rekrutierung ist im Bau enthalten, kein zweiter Goldkauf.
- [x] Ein Tavernenasset und ein separates Werkstatt-II-Asset mit Imagegen erzeugen; Werkstatt II ersetzt den gezeichneten Anbau. Gebaute Werkstatt I/II, Lager I und Taverne dezent auf der Karte beschriften; Namen erst nach Bauanimation zeigen.
- [x] Schema 19: Altsaves aus 18 behalten Gebäude, Figuren, Gold und Fortschritt; Bau/Gold/Position atomar speichern. Kein kostenloser Tavernenbesitz durch Migration, kein Eingriff in Kampfregeln 10.
- [x] Fünf gezielte Tavernenprüfungen und vier bestehende Speicher-/Bauprüfungen bestanden; Produktionsbuild bestanden. Kurzer Browsercheck auf Desktop und Hochkant mit direktem Bau und Reload; keine zusätzliche Vollabnahme.
- [x] Codecommit `d9f83d1` gepusht; [Pages-Lauf 39306506798](https://github.com/emfau88/TD/actions/runs/39306506798) erfolgreich. Öffentliche JS-/CSS-Dateien und beide neuen Gebäudeassets am 19.10.2026, 18:56 UTC bytegleich mit dem lokalen Produktionsbuild; [öffentlicher Nachweis](../../artifacts/idle-bastion/acceptance/b15/public.json). README mit vier aktuellen Spielaufnahmen ergänzt; [Bericht](../../artifacts/idle-bastion/acceptance/b15/REPORT.md).

#### B15b — Ilyra und Gefährtenübersicht

Die ursprünglichen Gameplay-Anforderungen bleiben erhalten. Mit B15a war Figurenimplementierung noch nicht beauftragt; am 20.10.2026 wurde B15b anschließend ausdrücklich freigegeben, zusätzlich mit Mara und Wisp in der Tavernenübersicht. Am 20.10.2026 hat der Nutzer nach Ansicht der bestehenden Figuren ein neues erwachsenes Ilyra-Design, dessen vereinfachte Standpose und anschließend Lauf-/Zauberanimationen freigegeben. Damit ersetzt diese begrenzte Grafikbeauftragung den ursprünglichen Plan, ausschließlich Ilyras alte Rohgrafik auszuschneiden. Keine zusätzliche Figurenserie.

- [x] Ilyras freigegebene Erscheinung als Lauf-/Zauberposen erzeugt und in 32 Rahmen mit vier Blickrichtungen aufbereitet; Fußpunkt (32, 56), vier Laufphasen, drei Zauberphasen, gespiegelte Gegenrichtung. Originale, vollständige Prompts, Metadaten und reproduzierbare Packung unter [assets/ilyra](assets/ilyra/README.md).
- [x] Separate Animationsvorschau neben Mara in 1× und vergrößert, mit Richtungs-/Aktionswahl und Einzelbildansicht. Produktionsbuild und ein kompakter Browserdurchlauf: alle Richtungen/Phasen, Zauber kehrt zum Stand zurück, Desktop und 430 × 932 bei DPR 2 ohne JavaScriptfehler oder horizontales Überlaufen. Kein echter Gerätetest oder Gameplay-Nachweis. [Kompakter Bericht und Bilder](../../artifacts/idle-bastion/acceptance/b15-ilyra-animations/REPORT.md) · [Bewegte Vorschau](https://emfau88.github.io/TD/idle-bastion/ilyra-check.html).
- [x] Laufzeitgrafik in die Figurensteuerung übernehmen; Laufgeschwindigkeit, Zauberbeginn und Rückkehr zum Stand mit der tatsächlichen Simulation synchronisieren. Bewegte Darstellung mit tatsächlicher Simulation verbunden; persönliche Nutzerabnahme bleibt offen.
- [x] Gezielte Sternensalve mit sichtbarem Zielgebiet, verständlicher Reichweite, Abklingzeit und Flug-/Treffereffekt einbauen. Gegen Flieger besonders wirksam; Stärke mit dem Verteidigungsfortschritt abstimmen, ohne eigenes Heldenlevelsystem.
- [x] Figur darf sich bewegen und einen Bereich unterstützen, ohne dauerhaft an einem Turm zu kleben. Wirkungszentrum/Zielwahl eindeutig erklären; keine versehentlichen doppelten Killbelohnungen oder zirkulären Verstärkungen mit Mara.
- [x] Ilyras garantierte erste Rekrutierung an die bereits gebaute Taverne anschließen; für Besitzer aus B15a ohne weitere Goldkosten. Kein automatischer Auftritt ohne bewusste Einführung, keine Zufallsauswahl oder Wartezeit.
- [x] Gebäudeplatzierung und lokale Flächenreserve in B15a umgesetzt, unabhängig von einer geöffneten Ostfront; vorhandene Gebäude bleiben stehen.
- [x] Kurzer Auftritt, Name, Rolle und eine echte Anwendung; Hinweise an realen Menüpunkten. Bauanimation und Ankunft sichtbar lassen, mobile Kampfzone freihalten.
- [x] Bau, Kosten und Rekrutierung atomar speichern. Altsaves erhalten keine ungefragte Rekrutierung; Wisp bleibt Wirtschaftsbegleiter, zwei Kampffiguren reichen vorerst.
- [x] Passendes Tavernenasset in B15a erstellt; vorhandene Werkstatt und Spielansicht als Stilreferenz, Original/Prompt/Aufbereitung dokumentiert.
- [x] Kompakt prüfen: Kauf/Rekrutierung samt Reload, eine Boden-/Fliegeranwendung, keine doppelte Belohnung und kurze Hochkantansicht.

- [x] Taverne zeigt Mara, Wisp und Ilyra mit Rolle und Status. Bestehende Tavernenbesitzer erhalten einen „Neu“-Hinweis; kein zweiter Kauf. Rekrutierung schließt das Menü, damit Ilyras Auftritt sichtbar bleibt.
- [x] Erste Salve manuell; erst danach optionale Automatik. 28 s Abklingzeit, 210 px Reichweite, 72 px Radius; mindestens 70 bzw. 1,5 Sekunden ungebuffte Turm-DPS, gegen Flieger ×1,5. Garantierte Farm-/Offline-Erträge ohne Ilyras Fähigkeit.
- [x] Sechs neue gezielte Prüfungen, vier bestehende Speicher-/Umzugsfälle, Produktionsbuild und Desktop-/Hochkant-Browserdurchlauf. [Bericht und vier Ansichten](../../artifacts/idle-bastion/acceptance/b15b/REPORT.md). Kein physischer Gerätetest und keine neue vollständige Balanceabnahme.

**Fertig, wenn:** Ein Spieler baut die Taverne, versteht Ilyras Nutzen und kann sie wirksam einsetzen; ein Reload verliert oder dupliziert weder Gold noch Figur.

#### Nachbesserung vom 20.10.2026 — Kamera bei Turmbau

- [x] Ursache: feste Standardplätze pro Turmtyp lösten bei jeder Bauauswahl `focusPad` aus; Scharfschütze auf `tower-11` (23,9) nahe dem Kern. Bei Waldwächter und anderen Türmen derselbe Mechanismus.
- [x] Normale Bauauswahl behält Ausschnitt und Zoom, ohne versteckte Platz-Vorauswahl. Nur angeleiteter Start-/Frost-/Steinschleuderbau fokussiert seinen empfohlenen Platz.
- [x] Vorher/Nachher im Browser geprüft: alle vier Turmkarten auf Desktop 1440×900 und Hochkant 430×932/DPR 2. Nachher unveränderte Kamera; Scharfschütze per Maus/Touch direkt baubar, Menü schließt, Startturm-Anleitung bleibt fokussiert. Keine JavaScriptfehler; Produktionsbuild erfolgreich. Kein neuer ausführlicher Spieldurchlauf nötig.

### B16 — Sturmlicht: Kettenblitz mit eigener Aufgabe

**Ergebnis:** Ein fünfter Turm verbindet auseinandergezogene Gegnergruppen, ohne Steinschleuder oder Scharfschütze zu ersetzen.

- [ ] Originalgrafiken von Turm 05 samt drei Ausbaustufen und Treffereffekten übernehmen; Animation, Fußpunkt und Richtungen im tatsächlichen Spielmaßstab prüfen.
- [ ] Bis zu drei verschiedene Ziele mit begrenzter Sprungreichweite und abnehmendem Schaden treffen; Reihenfolge deterministisch, kein mehrfacher Treffer desselben Gegners innerhalb einer Kette.
- [ ] Verteilte Ziele als Stärke, Einzelziele als Schwäche abstimmen. Kein zusätzlicher kostenloser Rüstungsdurchschlag und keine Unterbrechung von Bosszaubern.
- [ ] Nach Ilyras Einführung ungefähr ab Welle 28 die Sturmlicht-Forschung in der bestehenden Werkstatt anbieten. Die Welle macht Forschung verfügbar; erst ein bewusster Goldkauf schaltet den Turm frei. Rollenbeschreibung, Forschungspreis und Baupreis unterscheiden; kein Pflichtkauf vor Öffnung der Ostfront.
- [ ] Erforschte Technologien in der Werkstatt als kleine passende Icons mit Häkchen zeigen; Antippen erklärt Name und Nutzen. Gesperrte Forschung gedimmt mit Voraussetzung. Keine zusätzliche dauerhafte HUD-Leiste; vorhandene Frost-/Turmforschung konsistent einbeziehen.
- [ ] Turmtyp, Upgrades und laufende Angriffe vollständig speichern; Treffer bei Verkauf oder Reload weder verschwinden lassen noch doppelt abrechnen.
- [ ] Kompakt prüfen: Kette mit wenigen/vielen Zielen, Upgrade/Mara-Wechselwirkung, Reload während eines Angriffs und kurze Sichtprüfung.

**Fertig, wenn:** Sturmlicht schafft eine erkennbare neue Bauentscheidung und übersteht Save/Reload mit korrekten Treffern und Kosten.

### B17 — Ostgebiet und Kamera vorbereiten (ursprünglicher Umfang, jetzt B17b)

**Ergebnis:** Eine taktisch nutzbare zweite Kartenhälfte. Noch keine öffentliche Freischaltung der Ostfront ohne B18/B19. Die vorgezogene, bereits nutzbare Siedlungsfläche ist separat in B17a umgesetzt (Ergänzung vom 20.10.2026).

- [ ] Von der heutigen 28/32×16-Karte auf ungefähr 56×16 planen: östlich des Kerns ähnlich viel Raum wie westlich. Endmaß nach Weg-/Bauflächenprobe festlegen; 40er Zellen und bestehende Weltkoordinaten erhalten.
- [ ] Kern bei seiner bisherigen Position belassen; eigene Oststrecke führt von rechts zum selben Kern. Mindestens zwei unterscheidbare Abschnitte mit sinnvoll kombinierbaren Turmplätzen und bis zu drei bebaubaren Zellen beiderseits des Weges vorsehen.
- [ ] Genügend Platz über den oberen Wegabschnitten und für mobile Auswahl lassen; keine unerreichbare Reihe am Bildschirmrand. Alte Turm- und Gebäudeplätze auch in der bisherigen Lichtung erhalten.
- [ ] Bereits für 900 Gold erworbene Lichtung als bestehenden Gebietsbesitz anerkennen. Kein zweiter Kauf derselben Fläche; bisherige Belohnungen behalten. Spieler ohne Lichtung erhalten einen einmaligen, transparenten Zugang, keine doppelte Gebühr.
- [ ] Originalgelände wiederverwenden; keine neue Biomproduktion. Vorbereitungsfläche soll sichtbar einen Zweck haben, bevor dort Gegner erscheinen.
- [ ] Direkte Kameraziele West / Kern / Ost und normale Verschiebung vorsehen. Hochkant im lesbaren Maßstab bleiben; vollständige Karte nur auf ausdrücklichen Übersichtswunsch, kein dauerndes automatisches Hin- und Herspringen.
- [ ] Kompakt prüfen: alte frei platzierte Objekte nach Migration, bebaubare Kombinationen an beiden Seiten und eine normale Hochkantansicht. Geometrie bis B19 nur intern aktivieren.

**Fertig, wenn:** Beide Seiten sind erreichbar und spielerisch nutzbar, ohne bisherige Bauten zu verlieren oder die Karte dauerhaft kleinzoomen zu müssen.

### B18 — Zwei Routen, ein sicherer Spielstand

**Ergebnis:** Technisch belastbare Zwei-Fronten-Wellen. **Teilschritte:** zuerst Routen/Kampf, anschließend Save, Farmnachweise und Migration. Keine allgemeine Engine-Neuentwicklung.

- [ ] Jeder Spawn/Gegner bekommt eine eindeutige Route mit lokalem Wegfortschritt. Alte laufende Westwellen einschließlich Projektilen und Effekten exakt weiterführen.
- [ ] Turmpriorität nach tatsächlicher Reststrecke zum gemeinsamen Kern auf beiden Wegen berechnen; vorhandene Geschosse, Flächen, Ketten, Mara/Ilyra und Bossfähigkeiten überprüfen.
- [ ] Wellen beschreiben West-, Ost- oder gemischte Zusammensetzung bei gemeinsamem Gesamtbudget. Genau eine Wellenbelohnung, ein Goldkonto, ein Kern und eine sichtbare Wellenzahl.
- [ ] Frontzugang, Vorbereitungszustand, Routenzuordnung und aktive Fähigkeiten versioniert speichern. Wellenrekord allein darf keine nie errungene neue Belohnung oder neue Bossfreigabe erzeugen.
- [ ] Historische Offline-Ansprüche mit ihrer ursprünglichen Grundlage erhalten. Neue sichere Farmbasis nur für die tatsächlich geprüfte Verteidigung und Wellenzusammensetzung zertifizieren; ein Westnachweis beweist keine Zwei-Fronten-Welle.
- [ ] Bewusst gewählte reine West-Farmwellen bleiben zulässig, wenn genau dieses Rezept gespielt und vergütet wird. Keine stillen zusätzlichen Ostspawns während alter Farmversuche.
- [ ] Farm-/Offline-Nachweis ohne zeitweilige Mara-/Ilyra-Aktivfähigkeiten führen; dauerhafte reguläre Wirtschaftseffekte getrennt berücksichtigen. Keine Offline-Bosse oder automatischen neuen Gebietsfreischaltungen.
- [ ] Niederlage führt in einen wirklich sicheren Zustand zurück, erneuter Vorstoß bleibt bewusst. Keine endlose Verlustschleife oder dauerhafte Sackgasse durch einen ungeschickten Ausbau.
- [ ] Relevante noch offene Speicherfehler aus B14 vor Veröffentlichung beheben. Kompakte gezielte Prüfungen für beide Routen, laufenden Save, einmalige Belohnung, alte Offline-Ansprüche und sichere Rückfallwelle; offene B14-Gesamtprüfung ehrlich offen lassen.

**Fertig, wenn:** Eine gemischte Welle kann exakt geladen und korrekt beendet werden; Farmen bleibt nach Niederlage und Migration verlässlich und vergütet nur nachgewiesene Leistung.

### B19 — Die Ostfront bewusst eröffnen

**Ergebnis:** Ein verständlicher neuer Spielabschnitt statt überraschender Gegner nach einem Update.

- [ ] Nach Taverne/Ilyra und dem vorgesehenen Fortschritt die Ostverteidigung anbieten. Erst Gelände ansehen, Türme/Unterstützung vorbereiten, dann ausdrücklich „Ostfront öffnen“ wählen.
- [ ] Vorbereitung ohne bereits laufenden Ostangriff ermöglichen; bei zu wenig Gold auf der bestehenden Westseite weiterfarmen können. Keine automatische Öffnung beim Laden eines fortgeschrittenen Saves.
- [ ] Zuerst einzelne Ostangriffe, danach wechselnde Schwerpunkte einführen. Vorhandene Gegner mit unterschiedlichen Rollen verwenden; nicht einfach die volle Westwelle rechts duplizieren.
- [ ] West / Kern / Ost direkt erreichbar machen; kompakte Anzeige der aktiven Front und einer tatsächlichen Gefahr. Wesentliche Informationen kostenlos, ohne Spähergebäude oder dauerhafte zweite Seitenleiste.
- [ ] Hinweise kurz und schließbar, Pfeile an echten Bedienelementen; Taverne, Ilyra, neues Gebiet und erster Doppelangriff nacheinander erklären. Keine zweite lange Bauanleitung über der Kampfzone.
- [ ] Veteranen jenseits Welle 40 behalten Rekord und Besitz. Erstmalige Ost-Einführung nach bewusstem Einstieg staffeln; Zuordnung zu ihrer bestehenden Wellenzahl/Schwierigkeit ausdrücklich festlegen, ohne zweite sichtbare Wellenzählung oder erfundene Bossabschlüsse.
- [ ] Kompakt prüfen: erster Zugang, Reload während Vorbereitung, geringe Goldreserve, Einführung für Veteranen und Wechsel zwischen beiden Fronten im Hochkantformat.

**Fertig, wenn:** Der Spieler weiß, warum er nach Osten geht, kann sich vorbereiten und erkennt, wo gerade Unterstützung gebraucht wird. Erst damit B17b–B19 öffentlich aktivieren; B17a ist eigenständig nutzbar.

### B20 — Glutwerfer und anhaltender Schaden

**Ergebnis:** Ein sechster Turm belohnt das Zusammenhalten von Bodengegnern mit Frost und unterscheidet sich von direktem Flächenschaden.

- [ ] Originalturm 07 mit seinen gemeinsam genutzten Projektil-/Treffergrafiken korrekt einbinden; Spritesheets nicht als vollständige Einzelbilder darstellen.
- [ ] Kleine Bodenzone plus klar sichtbaren Brandschaden über Zeit umsetzen. Gleichartige Brände stapeln nicht unbegrenzt: stärkste Quelle gilt, erneuter Treffer erneuert die Dauer nach einer dokumentierten Regel.
- [ ] Kombination mit Frost abstimmen; weder Feuer noch Frost unterbrechen bestehende Bosszauber. Flieger bleiben die erkennbare Schwäche des Glutwerfers.
- [ ] Brandquelle, Schadensgrundlage und Restdauer mitführen; Verkauf des Ursprungsturms und Reload dürfen keine doppelten Belohnungen, verschwundenen Treffer oder unendlichen Brände erzeugen.
- [ ] Glutwerfer-Forschung ungefähr um Welle 33–35 in der Werkstatt anbieten, danach ausdrücklich mit Gold erforschen; kein automatischer Turmzugang durch Wellennummer. In die Forschungsicons aus B16 aufnehmen. Klarer Nutzen ohne Pflichtkauf, neue Währung oder weiteres Forschungsgebäude.
- [ ] Kompakt prüfen: überlappende Brände, Frost-Kombination, Reload/Verkauf während Brand und letzter Kill; Darstellung auf normalem Desktop und Hochkant kurz ansehen.

**Fertig, wenn:** Feuer und Frost ergeben eine sichtbare, gespeicherte und ausgewogen vergütete Kombination; andere Verteidigungen bleiben sinnvoll.

### B21 — Gestalteter Verlauf bis Welle 40

**Ergebnis:** Neue Rollen und zwei Fronten tragen mehrere echte Spielentscheidungen. **Teilschritte:** zuerst Wellen/Wirtschaft, danach ein eigener Bossabschnitt.

- [ ] Meilensteinfolge aus [AKT_II.md](docs/AKT_II.md) abstimmen: Boss 25 → Taverne/Ilyra → Sturmlicht → vorbereitete Ostfront → Glutwerfer → ausgewählte Doppelangriffe → Boss 40. Richtwerte anhand tatsächlich erreichbarer Käufe korrigieren.
- [ ] Neue Gegnerzusammensetzungen statt pauschaler HP-Sprünge nutzen; Bodenschwärme, Rüstung und Flieger stellen unterschiedliche Fragen. Vorhandene Einführung des Leerenfalters ab Welle 28 berücksichtigen.
- [ ] Gesamtbelastung beider Fronten budgetieren; anfangs abwechselnde Schwerpunkte, später kurze gleichzeitige Herausforderungen. Kein dauernder Zwang, beide Kartenseiten hektisch zu bedienen.
- [ ] Für Welle 40 einen Boss mit einer gut angekündigten neuen Mechanik planen, bevorzugt zeitlich begrenzter Gruppenschutz mit sichtbarem Auslaufen. Vorhandene passende Grafik zuerst prüfen; kein bloßer alter Boss mit mehr Leben. Während der Lernphase keine volle zweite Bossfront.
- [ ] Boss-/Farmregeln über die bisherigen Sonderfälle 15/25 hinaus erweitern; Boss 40 nie als sichere Offline-Farmbasis zählen. Bisherige Suchgrenze bis Welle 32 gezielt anpassen, Berechnungsaufwand weiterhin begrenzen.
- [ ] Kosten und Einkommen für Taverne, Türme und Verteidigung abstimmen. Bestehenden Einstieg nicht verlängern, keine zusätzliche Währung und keine Pflicht zum mehrfachen Leerkaufen vor dem ersten Ostangriff.
- [ ] Zwei unterschiedliche Verteidigungsansätze und eine überwiegend automatische Spielweise prüfen; Ostfront darf bewusst aufgeschoben werden. Farmen und alternative Ausgaben müssen einen Ausweg bieten.
- [ ] Einen legalen Modellverlauf samt gezielten Browserproben neuer Meilensteine dokumentieren. Simulationszeit, echte Bedienzeit und angenommene Entscheidungen unterscheiden; keine unbelegten 40-Wellen- oder Endlosbalance-Versprechen.

**Fertig, wenn:** Der neue Verlauf bietet nachvollziehbare Abwechslung und mindestens zwei tragfähige Spielweisen; der Boss ist verständlich und Niederlagen bleiben behebbar.

### B22 — Kompakte Gesamtprobe und Lieferung von Akt II

**Ergebnis:** Eine über den Playlink prüfbare Erweiterung mit nachvollziehbaren Grenzen.

- [ ] Neue Risiken gezielt zusammen prüfen: alte freie Gebäudepositionen/gekaufte Lichtung, hoher Rekord, Erst-Rekrutierung, Frontvorbereitung, laufende Zwei-Fronten-Welle und konservative Offline-Basis. Keine alten Prüfungen ohne Änderungsbezug immer wieder ausführen.
- [ ] Einen regulären Verlauf durch die neuen Meilensteine prüfen; automatische Modellprüfung und tatsächliche Spielerbedienung klar auseinanderhalten. Build und kurze Desktop-/Hochkantprobe durchführen, keine Matrix aus Sondergrößen.
- [ ] Verständlichkeit und Darstellung direkt prüfen: sichtbare Bauten, freie Kampfzone, lesbare Zahlen, kurze Hinweise, klare Wirkungsdauer und Auswahl beider Fronten. Technische Funktion allein genügt nicht.
- [ ] Änderungen mit wenigen aussagekräftigen Spielaufnahmen und kompaktem Bericht festhalten; README/Playlink aktuell halten. Commit/Push und tatsächlichen Pages-Stand bei Umsetzung verifizieren.
- [ ] Offene Fehler, Balancegrenzen und ungetestete Fälle nennen. B14/G2 bleiben getrennt, solange deren eigene Nachweise bzw. Nutzerbewertung fehlen; B22 ersetzt sie nicht rückwirkend.

**Fertig, wenn:** Akt II ist öffentlich nachvollziehbar spielbar, Spielstände bleiben erhalten und der Nutzer kann Taverne, neue Türme und Ostfront gezielt bewerten. Kein automatischer Start eines weiteren Akts.

### Parkliste — spätere Ideen, keine Zusage für Akt II

| Idee | Möglicher Nutzen | Grenze / nächste sinnvolle Prüfung |
| --- | --- | --- |
| Runa in der Taverne | Alternative Kontrollfigur | Erst nach Ilyra; gegen Frost abgrenzen. Auswahl/Wechsel statt beliebig vieler gleichzeitig aktiver Figuren |
| Schnellfeuer | Alternative für konzentrierten Schaden | Zuerst eigenen Nutzen gegenüber Waldwächter/Mara belegen |
| Sonnenobelisk | Später schwerer Spezialturm | Eigene Kampfrolle und klare Unterscheidung zum gleich aussehenden Kern nötig |
| Späherposten / Grenzwacht | Spätere Erkundung oder Wahl einer Herausforderung | Unverzichtbare Frontübersicht bleibt Bestandteil des kostenlosen HUD; kein reiner Zahlenbonus als Baugrund |
| Runenatelier | Eventuell alternative Turmspezialisierungen | Zuerst bestehende Werkstatt nutzen; kein zweites Gebäude für dieselbe Upgrade-Funktion |
| Weitere Gegnerproduktion B12d | Neue erkennbare Gegnerrollen über die bestehende Pipeline | Eigenständiger Auftrag, keine Voraussetzung für die zwei geplanten Türme oder die erste Ostfront |
| Kern/HQ nutzbar machen — Nutzeridee | Zentrale Interaktion, etwa eine Verteidigungsfähigkeit oder eine spätere Ausbauentscheidung | Nur vorgemerkt: konkrete Funktion erst nach Spielbedarf auswählen. Kein zusätzliches Pflichtmenü im Einstieg und keine vorgezogene Kern-Mechanik |
| Wachstube/Kaserne mit verbündeten Einheiten — Nutzeridee | Gelegentlich eigene Einheiten aussenden, die auf der Lane den Gegnern entgegenlaufen | Später kleiner Prototyp auf einer Route. Echte Gefechte brauchen Zielwahl und Angriffe der Gegner, Lebenspunkte, Reichweiten, Blockieren/Ausweichen, Tod/Weiterlaufen, passende Animationen sowie Save-/Farmregeln. Nicht als einfache Spawn-Grafik unterschätzen |

Bei verbündeten Einheiten zuerst klären, ob sie Gegner tatsächlich aufhalten und bekämpfen oder nur einen zeitlich begrenzten Effekt darstellen. Das sind unterschiedliche Spielsysteme. Echte Einheiten sollen neue Entscheidungen schaffen, keine dauerhafte automatische Wegsperre oder kostenlose Goldschleife. Der Kern könnte später ihr Ausgangspunkt sein; damit ist noch weder Kaserne noch HQ-Ausbau fest beschlossen.

Nicht in Akt II: Heldenausrüstung/-level, Gacha, zusätzliche Prestige-Währung, Dungeons, viele weitere Regionen oder eine große neue Assetserie. Diese Parkliste ist kein versteckter Arbeitsauftrag.
