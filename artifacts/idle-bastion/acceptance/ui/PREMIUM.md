# Premium-Oberfläche · 18.10.2026

Zusätzlicher Nutzerauftrag nach der mobilen Verdichtung: 3–4 passende Imagegen-Assets, Gestaltung nahe den Mockups, kompakte mobile Aufteilung erhalten, Commit/Push/Pages. Paketstatus und Freigaben bleiben in der [Roadmap](../../../../experiments/idle-bastion/ROADMAP.md).

## Sichtbare Änderungen

Vier tatsächlich erzeugte und verwendete Bilder: Messingrahmen, eingelegte Kartenfläche, goldene Aktionsfläche und Goldmünze. Kopfzeile, Dock, Bau-/Begleiterkarten, Zielstreifen, Hinweise und Dialoge folgen einer gemeinsamen Materialgestaltung. Rahmen werden in neun Teilflächen skaliert; Texte bleiben HTML. Die Original-Spielgrafiken werden weiterverwendet.

Pixelify Sans für Überschriften und Kennzahlen, Systemschrift für kleine Erklärungstexte. Einheitliche SVG-Pixelsymbole ersetzen unterschiedliche Unicode-Piktogramme. Hauptaktionen sind golden, neutrale Aktionen dunkel und gesperrte Karten zurückgenommen. Aktive Tabs und die aktuelle Baukarte sind klar gefasst.

[Original-PNGs, WebP-Laufzeitdateien, vollständige Imagegen-Prompts und Schriftlizenz](../../../../experiments/idle-bastion/assets/ui/README.md). Vier Generierungen, kein CLI-Fallback, keine weiteren Gebäude oder Charaktere. Laufzeitbilder insgesamt 196.342 Bytes; Schrift zusätzlich 79.160 Bytes. Die großen Originalquellen werden nicht mit der App ausgeliefert.

## Gezielte Prüfung

- TypeScript/Vite: `npm run idle:build` erfolgreich.
- Desktop bei 1366 × 768 und Hochkant bei 390 × 844 tatsächlich im Browser angesehen.
- Mobiles HUD weiterhin 56 px, Dock 96 px; Weltfläche rund 692 px bzw. 82 % der Fensterhöhe. Keine zusätzliche feste UI-Zone.
- Maras Tipp bleibt zunächst eingeklappt. Gold/Welle öffnen weiterhin die Chronik; Vollbild betreten und verlassen.
- Über die echten UI-Aktionen: Waldwächter an der Nordostkurve gebaut, Turm aufgewertet, Werkstatt repariert und Frosttechnik erforscht. Karte wechselt von Forschungshinweis zur Münze mit 110 Gold; erforschte Werkstatt zeigt ihren Abschlusszustand.
- Detailfenster und Chronik geprüft: kein horizontaler Überlauf; lange Chronik scrollt vertikal. Ein beim ersten Bildvergleich aufgefallener Rahmenüberlauf wurde korrigiert.
- Normale, ausgewählte, gesperrte und deaktivierte Zustände visuell geprüft. Keine neue Spielmechanik, Save-Änderung oder Balancingänderung.
- Während längerer Hintergrundarbeit meldete die Testpartie eine abgelaufene Schreibsitzung. Der vorhandene Knopf „Hier erneut aktivieren“ und der Rückkehrdialog stellten die Partie wieder her. Diese bestehende Sitzungsmechanik wurde hier nicht geändert.
- Keine wiederholte vollständige Gameplay-Testserie. Dies ist eine Browserprüfung, keine reale Smartphone-/Safari-Geräteabnahme und keine Nutzerfreigabe G1.

## Spielaufnahmen

![Desktop mit dem integrierten UI](premium-desktop-1366x768.png)

| Kompakte mobile Ansicht | Mobile Turmaktion |
| --- | --- |
| ![Hochkantansicht](premium-mobile-390x844.png) | ![Turmfenster](premium-context-390x844.png) |

## Veröffentlichung

Veröffentlichte Fassung: `b972548`. [Pages-Lauf 39076457593](https://github.com/emfau88/TD/actions/runs/39076457593) erfolgreich (klassisches Spiel und Idle gebaut). Die öffentliche Fassung wurde im Browser geöffnet: Messing-WebP und Pixelify-Schrift geladen, Kampf läuft, kein Fehlerpanel. Der Paketstatus steht in der Roadmap. [Playlink](https://emfau88.github.io/TD/idle-bastion/) · [Frische Probe](https://emfau88.github.io/TD/idle-bastion/?fresh=1).