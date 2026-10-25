# Frost & Figuren: Prüfung vor einer Main-Übernahme

25.10.2026. **Nur geprüft, kein Merge und keine finale Integration der Grafikproben.**
Geprüfter Branch: `codex/frost-kit-hero-controls` / `790344b610dcd15827ec7dda67d62f4b1e7759a0`.
Aktueller Main: `537b5e8c9cf09b696b41644da4c56dbc8633d720`.

## Ergebnis

Für den bereits implementierten kostenlosen Frost und die Figurensteuerung wurden
keine neuen technischen Merge-Hindernisse gefunden. Main ist ein Vorfahr des Branches;
eine Übernahme wäre derzeit ohne Konfliktauflösung möglich. Das ist keine Zusicherung,
dass jeder Geräte- oder Spielzustand fehlerfrei ist: 17 bestehende Testfehler bleiben
offen, physische Smartphones wurden nicht geprüft.

**Der vom Nutzer gewünschte Gesamtstand einschließlich neuer Optik ist noch nicht
vollständig ins echte Spiel integriert.** Ein jetziger Merge würde die Grafiken als
Dateien übernehmen, sie aber im Spiel nicht aktivieren. Erst echte Integration der
abgenommenen Gestaltung, Prüfung mit laufendem Spiel und anschließende Merge-Freigabe.

## Was auf diesem Branch liegt

| Paket | Inhalt | Im echten Spiel eingebaut? |
| --- | --- | --- |
| Kostenloser Tutorial-Frost | Einmaliger Bausatz nach bezahlter Forschung; Verbrauch bleibt nach Verkauf/Reload erhalten; kein Verkaufserlös für den kostenlosen Grundturm | Ja |
| Direkte Figurensteuerung | Mara/Ilyra auf der Karte wählen, wiederholt Boden antippen, Menü bei erneutem Antippen, Desktop-Rechtsklick, Drag-/Dialog-/Pausenschutz | Ja |
| Ilyras Einführung | Erreichbarer Standort am Gegnerweg, Ankunft abwarten, erste Salve bewusst zielen; Fortsetzen nach Reload | Ja |
| Testeinstiege | Frost, Figuren, Ilyra direkt starten; getrennte Probe-Spielstände; Branch-Preview auf Pages | Ja, separate Testseite |
| Grafik V1–V3 | Runde Zauberbuttons/radialer Cooldown, enge leuchtende Figurenringe, Ziel-/Wegzeichen, wiederholte Mara-Projektile, Turm-Glow/Funken, neun Ilyra-Sterne mit sichtbarer AoE-Fläche | **Nur separate Gestaltungsprobe mit Bildern/Clips** |

Der frühe Balance-Audit lag auf einem anderen Branch. Gegner-, Boss- und reguläre
Turmwerte wurden hier nicht allgemein angepasst. Die frühere kostenlose Frostverfügbarkeit
ist die gewünschte Änderung der Einstiegswirtschaft. Q4-Introcode bleibt unverändert.

## Tatsächlich erneut geprüft

Quellcode und Tests wurden aus den Git-Commits in zwei getrennte temporäre Verzeichnisse
exportiert. Unveränderte Grafik-/Referenzdateien und installierte Abhängigkeiten wurden
wiederverwendet. Der ältere, lokale und uncommittete rechteckige Button-Entwurf war
ausgeschlossen. Keine Nutzer-Spielstände wurden geöffnet oder geändert.

| Prüfung | Ergebnis |
| --- | --- |
| Aktueller Main, vollständiges `npm test` | 326/343 bestanden; 17 Fehler |
| Branch, vollständiges `npm test` | 339/356 bestanden; **exakt dieselben 17 Fehler**, keine neuen, keine Skips |
| Normaler `npm run build`, ohne Preview-Flag | TypeScript, Vite und Pages-Paket erfolgreich |
| Neuer Spieleinstieg/Q4, Skip, Reload | 1280×800, 390×844 und 320×568 erfolgreich |
| Bestehender Main-Spielstand, Migration, Reload | Desktop und Hochkant erfolgreich; Gold und Türme unverändert |
| Regulärer Standardspeicher | Weiterhin `spire-idle-bastion`; kein Wechsel auf den Vorschau-Speicher |
| Teststarter und alte `/idle-bastion/`-Adresse | Probe bleibt isoliert; Weiterleitung erhält Probeparameter und Hash |
| Browserfehler / fehlende Ressourcen | Keine in diesen Produktionsläufen |
| Grafikprototyp im normalen Hauptbundle | Nicht enthalten; keine `artReview`-/`spell-disc`-/`volley-action`-Integration |
| Öffentlicher Main nach V3-Galerie-Update | Hauptseite bytegleich mit bisherigem Main-Artefakt; Main-Ref unverändert |

Nachweise: [Testvergleich](tests.json), [Speicherprüfung](migration.json),
[Produktionsbrowser](production-browser.json). Die früheren umfassenden Eingabe-,
Tutorial- und Race-Prüfungen stehen im [A2-Bericht](../hero-controls/REPORT.md).
Desktop-/Touch-Emulation ist keine Messung auf physischer Smartphone-Hardware.

## Speicherformat 30, einfach erklärt

Version 30 ist die Kennzeichnung des gespeicherten Datenformats. Es enthält zusätzlich,
welcher Frostturm den einmaligen kostenlosen Bausatz verbraucht hat. Bestehende
Version-29-Spielstände werden automatisch übernommen; ein neues Spiel ist nicht nötig.

An einem tatsächlich verdienten Main-Spielstand geprüft: Alle bisherigen Kampffelder
und Offline-Daten bleiben erhalten. Nach Speichern kann die neue Fassung denselben
Stand wieder öffnen. Der alte Main-Code weist den neu gespeicherten Stand dagegen
als zu neu zurück und überschreibt ihn nicht. Ein späterer Code-Rollback müsste
deshalb die Version-30-Lesefähigkeit erhalten. Das ist eine Rückwärtskompatibilitätsgrenze,
kein nachgewiesener Verlust beim normalen Update.

## Vor dem gewünschten Gesamt-Release

1. Die Grafikprobe in die echten UI-/Renderwege einbinden. Reale Buff-/Cooldownzeiten,
   Pause, Automatik, Bewegung, Zielwechsel, Verkauf, Sichtreihenfolge und Reload prüfen.
   Der isolierte Prototyp verwendet gestellte Zeiten und eine angehaltene Szene.
2. Temporäre README-/Galerielinks klären: Ein normaler Main-Deploy veröffentlicht das
   Hauptspiel, kopiert aber die temporäre `/previews/frost-hero/`-Galerie nicht mit.
   Galerie dauerhaft bereitstellen oder Links anpassen; sonst entstehen tote Links.
3. Den vollständig integrierten Stand nochmals kompakt auf Desktop und Mobile prüfen.
   Eine physische Handyprobe ist besonders für Effektdichte und Bediengefühl sinnvoll.

**Empfehlung:** Das bereits implementierte Frost-/A2-Paket ist nach dieser Prüfung
technisch übernehmbar. Für das Ziel „alle besprochenen Updates im funktionierenden
Main-Spiel“ zuerst die noch ausstehende Grafikintegration fertigstellen und gemeinsam
prüfen. Keine Main-Übernahme ohne die ausdrücklich noch ausstehende Nutzerfreigabe.
