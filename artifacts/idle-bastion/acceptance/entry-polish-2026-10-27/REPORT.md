# Einstieg und Bedienung · 27.10.2026

Der geprüfte Ablauf führt vom frischen Start über hörbare frühe Bestätigungen und das automatisch abgeschlossene erste Upgrade bis zu den späteren Tutorialhinweisen, der Gebäudeplatzierung und der Tavernenkarte.

## Änderungen

- Der vorhandene Klickton wird beim Laden mit einem OfflineAudioContext vorbereitet. Kartenmusik lädt ohne Wiedergabe vor; hörbares Audio beginnt erst nach Bedienung. Weitere Effekte werden nach Musikstart vorbereitet. Frühe Buttons warten auf die Audiofreigabe; der Audio-Credits-Button erhält ebenfalls den allgemeinen Klickton.
- Die 14 bestehenden Lernziele bleiben erhalten. Der Zähler ist auch in kompakten Tutorialkarten sowie bei Wisp, Mara und dem Steinschleuderhinweis lesbar. Spätere Hauptaktionen verwenden denselben goldenen Buttonstil und mindestens 44 px Bedienhöhe.
- Das Upgradeziel trägt ein Quadrat am Bodenanker. Das erste erfolgreiche Upgrade setzt denselben Kampf ohne zusätzliche Bestätigung fort, schließt sein Menü und wird zusammen mit dem Fortschritt gespeichert. Ältere Stände auf der bisherigen Bestätigung werden beim nächsten aktiven Tick weitergeführt; die manuelle Pause bleibt getrennt.
- Maras Zaubereinführung fährt einmalig zu ihr; spätere manuelle Kamerabewegungen werden dadurch nicht laufend überschrieben. Die vorhandene Fokussierung des echten Zaubereffekts bleibt erhalten.
- Das Koordinaten-Dropdown ist im Menü eines vorhandenen Turms ausgeblendet. Die Auswahl für freie Bauplätze bleibt bestehen.
- Gebäude werden mit dem Zentrum ihrer 3×2- beziehungsweise 2×2-Grundfläche am gewählten Bodenpunkt eingerastet. Gespeicherte Baukoordinaten und Kollisionsprüfung bleiben unverändert; die Bauempfehlung zeigt denselben Mittelpunkt. Ungültige Positionen aktualisieren die rote Vorschau.
- Geschenke erscheinen als kleines Ecksymbol an der Tavernenkarte. Vorrat und Einlösbarkeit bleiben unterscheidbar, der Siedlungstab erhält kein Geschenksymbol mehr. Ein gleichzeitiger Neu-Hinweis sitzt in der anderen Ecke. Die betroffenen englischen Texte sind ergänzt.

## Prüfung

| Grenze | Ergebnis |
| --- | --- |
| Modell und Speichern | 76/76 gezielte Tests bestanden: Audio, Intro, Lernfortschritt, Platzierung, Kamera, Discovery, Quick-Win-Hinweise und BattleSession. |
| Neues/älteres Upgrade | Gleiche Welle läuft nach Level 2 weiter; Reload, kein zweiter Tutorialkauf und alter gespeicherter Bestätigungszustand geprüft. |
| Echte frühe Bedienung | Frischer Chrome-Kontext bei 1440/390/320 px: kein hörbarer AudioContext vor Bedienung; Klickton vorab dekodiert; Continue, Got it und Build your first tower erzeugen jeweils tatsächlich einen AudioBufferSource-Start. Musikzeit läuft vor dem ersten Turmbau. |
| Durchgängiger Einstieg | Turm über echte Maus/Touch-Aktion gebaut, Kampf gestartet, Upgradeziel geöffnet, Dropdown ausgeblendet, Upgrade ausgeführt, Menü geschlossen, Reload im nächsten Lernschritt. |
| Spätere UI und Daten | Native IndexedDB mit isolierten validierten Testständen: Werkstatt am angetippten Grundflächenzentrum, Mara im Kamerabild, Tutorial 11/14 und 13/14, goldener Steinschleuderbutton mit mindestens 44 px Höhe sowie Geschenkhinweis an der Tavernenkarte. Alle drei Breiten geprüft. |
| Produktion | npm run build einschließlich TypeScript erfolgreich. Unverändertes Produktionspaket separat auf Desktop und Hochkant: erste Desktop-Bestätigung per Enter, weitere Klicks/Touch, Musik, Bau/Upgrade/Reload, Audio-Credits, stumm/laut. Keine Seitenfehler. |
| GitHub Pages | Code-Commit `a85870f` über [Lauf 40587206143](https://github.com/emfau88/TD/actions/runs/40587206143) veröffentlicht. Neue isolierte Chrome-Kontexte bei 1440/390 px: alle drei frühen Klicktöne tatsächlich gestartet, Musik vor dem Turmbau aktiv, neue Tavernenmarkierung vorhanden und alte Umzugsaktion entfernt; keine Seitenfehler. |
| Sichtprüfung | Screenshots geprüft. Überdeckung des Geschenks durch Neu zunächst gefunden, korrigiert und die betroffenen Ansichten erneut geprüft. |

Zwei ältere Testhelfer erwarteten nach dem Upgrade weiterhin die entfallene Bestätigung und versuchten anschließend verfrüht die Werkstatt zu bauen. Sie wurden an den nun atomaren Übergang angepasst. Der abschließende gezielte Lauf bestand vollständig. Eine anfänglich zu enge URL-Regel der Browser-Messanbindung wurde für Vites Modul-Zeitstempel erweitert; keine entsprechende Instrumentierung im Spielcode.

Die späteren UI-Stände sind ausdrücklich synthetische Teststände, der frühe Einstieg verwendet echte Spielaktionen und neue lokale Speicherslots. Die Geschenkansicht nutzt einen älteren Kartenstand. Auf anschließenden Nutzerwunsch wurde dessen Umzugsoption „Siedlung am Kern“ aus der Spieloberfläche entfernt; die erneute Ansicht zeigt die zusätzliche Kachel nicht mehr. Historische Speicherformate bleiben lesbar.

## Nachweise

[Frischer Einstieg](fresh-results.json) · [Spätere Ansichten](later-results.json) · [Letzte Badge-/Buttonprüfung](badge-button-results.json) · [Produktionsprüfung](production-results.json) · [Umzugsoption entfernt](settlement-final-results.json) · [Buildausgabe](build-output.txt) · [Live-Prüfung](live-results.json).

[Prüfskript Einstieg](check-fresh.mjs) · [Spätere Ansichten](check-later.mjs) · [Badge-Nachprüfung](check-badges.mjs) · [Produktion](check-production.mjs) · [Umzugsoption](check-settlement.mjs) · [GitHub Pages](check-live.mjs).

[Intro 320 px](intro-320.png) · [Upgradeziel 390 px](upgrade-marker-390.png) · [Mara 390 px](mara-390.png) · [Steinschleuder 390 px](cannon-390.png) · [Geschenke 320 px](gift-320.png) · [Geschenke Desktop](gift-1440.png).

Die Live-Messgröße `automationToSoundMs` enthält die automatische Wartezeit auf bedienbare Buttons; sie misst keine reine Tonlatenz. Der Live-Check identifiziert die veröffentlichte Oberfläche anhand ihrer neuen Bedienelemente, da der Linux-Build andere Bundle-Hashes als der lokale Windows-Build erzeugt.

Visuelle Eigenprüfung und technische Wiedergabemessung; keine subjektive Hör- oder Nutzerabnahme behauptet. Schema und Kampfregeln unverändert. Aufgaben- und Veröffentlichungsstatus stehen ausschließlich in der [Roadmap](../../../../experiments/idle-bastion/ROADMAP.md).
