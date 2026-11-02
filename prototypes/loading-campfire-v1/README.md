# Towers & Tantrums — Lagerfeuer-Ladescreen, Entwurf 1

Die Vorschau wurde anschließend zum Einbau sowie Commit/Push freigegeben.
Der echte Loader verwendet die optimierten Exporte aus prepare-runtime.mjs,
direkt eingebettete kleine Startbilder und den vorhandenen echten Ladefortschritt.
Die Demo hier behält ihren ausdrücklich simulierten Balken.
Technische Nachweise: [Integrationsprüfung](../../artifacts/idle-bastion/acceptance/loading-scene-2026-11-02/REPORT.md).
Lokale Vorschau-Aufnahmen in checks/ und ZIPs sind reproduzierbare Arbeitsdateien,
keine Spielressourcen. Veröffentlichungsstatus steht ausschließlich in der Roadmap.

Letzter freigegebener Feinschliff: eine einzelne 27-KB-Wolke mit zwölf Sekunden
Bewegung ausschließlich im freien Himmel; 24 Funken, davon zwei seltenere größere,
längere Flugbahnen, gelegentlicher Schriftglanz und ein deutlicherer Ladebalken.
Die Wolkenposition folgt den Bildkoordinaten und dem Hochformat-Zuschnitt, damit sie
keine Äste/Blätter überlagert. Pause und reduzierte Bewegung gelten für alle Effekte.

**Effekt-Nachkorrektur, 02.11.2026:** Die ersten Funken stiegen am Desktop nicht
sichtbar über die Flamme hinaus. Ihre Quelle sitzt nun im oberen Flammenbereich;
Flugstrecke und Streuung folgen der dargestellten Feuergröße und halten Abstand
zum Titel. Der Nebel hat klarere, weiterhin weiche Bänder und einen kürzeren
Bewegungszyklus. Keine neuen Bildassets, keine Spielintegration.
`effects-check.mjs` dokumentiert zwölf feste Animationszeitpunkte auf Desktop,
Handy-Querformat und Hochformat sowie einen Vergleich mit ausgeblendetem Nebel.
Am Desktop lagen vorher null ausreichend helle Partikel über dem oberen
Flammenbereich, danach im Mittel 12,5; das ist eine Geometrieprüfung, keine
subjektive Qualitätsbewertung. Messwerte: `checks/effects/original.json` und
`checks/effects/revised.json`. Neue Aufnahme: `checks/animated-preview-effects-v2.webm`.

Eigenständige animierte Vollbild-Vorschau vom 02.11.2026. Zum Ansehen `index.html`
im Browser öffnen oder `node serve.mjs` ausführen und `http://127.0.0.1:5207`
aufrufen. Diese Vorschau startet kein Spiel und verwendet weder IndexedDB noch
LocalStorage. Der Ladebalken simuliert rund 16,5 Sekunden und lässt sich wiederholen.

## Aufbau

1. Vollflächige Waldszene mit Taverne, Wachturm, Mond und Sternenhimmel.
2. Getrennte Lagerfeuergruppe, eigene Anordnung für Hochformat. Drei Figuren
   vollständig sichtbar; keine Verzerrung oder künstliche Körperanimation.
3. Acht mit ImageGen erzeugte Flammenbilder als echte wiederholte Animation,
   auf den glühenden Scheiten verankert. Die Bildfrequenz beträgt etwa 8,7 fps.
4. Wenige aufsteigende Funken, räumlich begrenztes Feuerlicht, zwei langsame
   Nebelebenen und sehr dezente Bewegung des Hintergrunds.
5. Scharfe, unabhängige Schrift und Ladeanzeige. DE/EN, Animation anhalten,
   Vollbild soweit vom Browser unterstützt; reduzierte Bewegung wird berücksichtigt.

Die Bilder sind ImageGen-Illustrationen, kein KI-Video. Die Bewegung entsteht aus
den getrennten Ebenen und dem Flammenbogen. Bildquellen und vollständige Prompts:
[PROMPTS.md](PROMPTS.md). Unveränderte generierte PNGs liegen in `sources/`;
WebP-Exporte entstehen mit `prepare.mjs` über die vorhandene Sharp-Installation.
Die Schrift Pixelify Sans stammt aus dem Spiel; OFL-Lizenz liegt in `assets/`.

## Prüfumfang

Browserprüfung: 1920×1080 und 1440×900, Handy-Querformat 844×390 und 720×320,
Hochformat 390×844 und 430×932. Titel, Gruppe, Feuer, Ladebereich und Bedienelemente
bleiben im Viewport. Wechselnde Feuerbilder, Pause, Englisch, reduzierte Bewegung,
Rotation sowie Ende/Wiederholung des Ladebalkens werden in `check.mjs` geprüft.
Messwerte und echte Bildschirmaufnahmen: `checks/`. Emulation ersetzt keine
physische Handyprüfung; die optische Freigabe erfolgt durch den Nutzer.

Diese eigenständige Demo hat keine Abhängigkeit vom Spielstart. Der integrierte
Loader ist separat implementiert und wartet auf tatsächliche Spielbereitschaft;
er übernimmt weder die 16,5-Sekunden-Demodauer noch eine künstliche Mindestwartezeit.

Nur benötigte Bilder werden im Browser geladen: Hintergrund, passende Gruppe,
Feuerbogen und lokale Schrift. Unkomprimierte PNG-Quellen sind nicht Teil des
Ladevorgangs. Die Bilder benötigen zusammen je nach Format rund 0,96–1,01 MB,
zuzüglich Schrift/CSS/JS. Eine kleine Spriteanimation ersetzt hier ein großes Video.
