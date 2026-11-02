# Handy-Querformat · Towers & Tantrums

## Nachkorrektur nach Handy-Rückmeldung

Ausgangspunkt `3d4b558`: Das neue Handyfoto zeigt Tutorialschritt 6. Der
vollbreite Hinweis verdeckte weiterhin den unteren Weg; außerdem behandelte die
Querformatkamera die Fläche hinter den Leisten als sichtbar. Dadurch war bei
normalem Zoom kein vertikales Verschieben bis zum unteren Kartenrand möglich.

- Kampf-Tutorialhinweise sitzen nun rechts in einer 220–280 px breiten Box.
  Aufklappbare Details und vorhandene Aktionen bleiben erhalten. Die drei
  vorgeschalteten Intro-Seiten sind von dieser Nachkorrektur nicht betroffen.
- Die Touch-Querformatkamera nutzt den gemessenen Bereich zwischen den Leisten.
  Der normale Maßstab bleibt gleich; der untere Kartenrand kann durch Verschieben
  über die Bauleiste gebracht werden. Die Übersicht passt die ganze Karte in
  diesen Bereich. Während des Tutorials bleibt der Übersichtsknopf wie bisher
  eine Rückkehr zum aktuellen Lernziel.
- Ausschließlich Darstellung/Kamera; keine Änderungen an Spielregeln, Kartenmodell,
  Assets oder Spielständen. Hochformat-/Desktopregeln bleiben gleich.

| Messung im Zustand des Handyfotos | Vorher | Nachher |
| --- | ---: | ---: |
| Breite Tutorialhinweis bei 720×320 | 704 px | 230 px |
| Kamera-Sichtfeld bei 720×320 | 320 px, teilweise hinter Leisten | 208 px zwischen Leisten |
| Normaler Kartenmaßstab bei 720×320 | 0,5 | 0,5 |
| Unterer Kartenrand vollständig erreichbar | nein | ja, durch Verschieben |

35/35 gezielte Kamera-/Intro-/Tutorialtests und Produktionsbuild bestanden.
26 Browserzustände im Produktionsbuild auf 720×320 EN, 844×390 DE, 932×430 EN
sowie Hochformat 390×844 und Desktop 1440×900 geprüft, ohne HTTP-/JavaScriptfehler.
Der Startzustand entsteht durch echte Modellschritte bis zur Upgrade-Lernpause.
Geprüft: Details, echte Touch-Verschiebung bis Kartenende, Zoom, Lernziel-Rückkehr,
Turm öffnen und aufwerten sowie Rotation. Die Übersicht wurde zusätzlich direkt
über die Kameramethode geprüft, da der Tutorialknopf absichtlich das Lernziel
fokussiert. Nur die lokale Browserantwort erhält dafür einen Beobachtungshook;
kein Testhook im Spiel. Keine persönlichen Spielstände geöffnet.

Im anfänglichen 720×320-Ausschnitt sind 37 von 39 Wegfeld-Mittelpunkten frei
sichtbar, bei 844×390 und 932×430 alle 39. Das ist eine einfache geometrische
Messung, keine Garantie, dass alle Gegnersprites jederzeit unverdeckt bleiben.
Verschieben kann obere Kartenteile ausblenden; die normale Ansicht zeigt bewusst
nicht die komplette Karte verkleinert. Die konkrete Handyabnahme bleibt offen.

[Messwerte](followup/results.json), [720×320](followup/720-initial.png),
[unterer Kartenrand](followup/720-bottom.png), [844×390 DE](followup/844-initial.png).
Reproduktion gegen einen frischen Produktionsbuild:

```powershell
npx tsx artifacts/idle-bastion/acceptance/mobile-landscape-2026-11-02/followup.ts http://127.0.0.1:5199
```

## Ursprüngliches Paket

Ausgangsstand: `a6f2cae` auf Main, 02.11.2026. Beauftragt: ausschließlich das
Querformat-Paket einschließlich Prüfung, Commit und Push. Schwerpunkt gängige
Handygrößen, keine Sonderlayouts für exotische Kleinstgeräte.

## Änderung und Grenzen

- Ein gemeinsamer Darstellungsmodus für Touch-Geräte im Querformat mit höchstens
  500 CSS-Pixeln verfügbarer Höhe. `src/landscape.css` wird zuletzt eingebunden;
  Hochformat und Maus/Desktop behalten ihre bisherigen Regeln.
- Kopfzeile 48 px, Bauleiste 64 px, jeweils zuzüglich sicherer Bildschirmränder.
  Tabs neben dem horizontal scrollbaren Katalog; vollständige Karten, Porträts,
  Namen und Abklinganzeigen. Wichtige Kopfknöpfe und Kernleben passen in die Leiste.
- Die drei Intro-Karten haben eine inhaltsabhängige Höhe am unteren Rand. Die
  Intro-Kamera liest denselben CSS-Modus und fokussiert den freien Bereich darüber.
  Spätere Tutorialhinweise schließen an die Bauleiste an. Bestehende Details,
  Pflichtaktionen und Lernschritte bleiben erhalten.
- Taverne: Figur links, Herzen/Gespräch/Aktionen rechts. Lange Texte und die
  Übersicht scrollen; die Navigation und Aktionsleiste bleiben erreichbar.
  Werkstatt, Spielmenü, Chronik und Rückkehrfenster berücksichtigen die kurze Höhe.

Keine Änderung an Kampf, Wellen, Gold, Turmwerten, Preisen, Offline-Abrechnung,
Fähigkeiten, sozialen Regeln, Spielständen, Speicherkennungen oder Grafikassets.
Die zusätzliche Kernleben-Anzeige auf der Karte wird nur im neuen Querformatmodus
ausgeblendet, weil dort die vollständige Anzeige in der Kopfzeile sichtbar ist.

## Gemessene Verbesserung

| Messung | Vorher | Nachher |
| --- | ---: | ---: |
| Kopf/Bauleiste, 720×320 | 52 / 98 px | 48 / 64 px |
| Höhe zwischen diesen Leisten | 170 px | 208 px (+22 %) |
| Erste Intro-Karte, 720×320 EN | 360×252 px rechts | 704×142 px unten |
| Mara-Tavernenbühne, 720×320 | 0,8 px hoch | 232 px hoch |
| Mara-Tavernenbühne, 844×390 | 70,8 px hoch | 302 px hoch |

Vorher waren bei 720 px auch rechte Kopfknöpfe außerhalb des Viewports und Maras
Porträt oberhalb ihres Kachelrahmens. Die Browserprüfungen verlangen nun vollständig
enthaltene Kopfknöpfe, Kataloghöhe, Porträt und Name. Der absichtliche horizontale
Katalogausschnitt bleibt scrollbar; vertikal werden die Karten vollständig gezeigt.

## Tatsächlich geprüft

- 39/39 gezielte Tests: Tutorial-Kamera, Kartenkamera, Intro, Tutorial-Anordnung
  und Tavernen-Atlascache. Ein zusätzlicher Kameratest schützt die neue Fokussierung
  oberhalb der Karte und die bestehende Seitenkarte für kurze Maus-Viewports.
- TypeScript und Produktionsbuild bestanden.
- 111 aufgezeichnete Browserzustände im Produktionsbuild: **720×320 EN,
  844×390 DE, 932×430 EN**, dazu 390×844 EN und 1440×900 DE als Gegenproben.
  Alle mobilen Kontexte melden Touch-Eingabe, auch bei Breiten über 700 px.
- Drei Intro-Seiten, tatsächlicher Turmbau per Touch am empfohlenen Kartenpunkt,
  W1-Hinweis, Details ein/aus, Werkstatt/Frostforschung, Warten auf Wisp,
  horizontales Katalogscrollen, Taverne mit beiden Figuren, Gespräche, echte
  Freischaltung des ersten Herzens, Geschichte/Weiter/Zurück, Berührungshinweise,
  Glut-Forschungseintrag, Menüscrollen, Chronik, Pause/Reload und 24-h-Rückkehrfenster.
- 720×320 → 390×844 → 720×320 ohne Reload geprüft. Die zuvor erfassten
  Hochformat-Rechtecke von Intro, W1 und Wisp stimmen exakt mit dem Ausgangsstand
  überein. Desktop zusätzlich visuell und durch Bedienung gegengeprüft.
- Keine JavaScript- oder HTTP-Fehler in der Browsermatrix.
- Abschließender Produktionsbuild und sechs zusätzliche Start-/Menü-/Tavernenproben
  bestanden, einschließlich 844×390 mit Maus (neuer Modus bleibt aus) und einem
  künstlich gesetzten asymmetrischen 44-px-Rand in 720×320. Letzteres prüft die
  Layoutberechnung, nicht die Meldung realer Hardwareaussparungen durch Android.
- Öffentliche Stichprobe nach erfolgreichem [Pages-Lauf 41513208351](https://github.com/emfau88/TD/actions/runs/41513208351)
  für Codecommit `27ab413`: dieselben sechs Fälle bestanden. Ein erster Lauf wurde
  wegen HTTP 503 für die bestehende Schriftdatei abgebrochen; anschließender
  Direktabruf HTTP 200 und kompletter Wiederholungslauf ohne HTTP-/JavaScriptfehler.
  [Öffentliche Messwerte](public-results.json).

Die Teststände stammen aus echten Modellschritten bzw. dem vorhandenen
Glutwerfer-Simulationsnachweis. Für Herzgeschichten werden zwei reale Gespräche
geführt; keine Zuneigung wird künstlich gesetzt. Jede Probe verwendet einen eigenen
Browserkontext und Datenbanknamen. Persönliche Spielstände werden nicht geöffnet.

## Reproduktion und Bilder

Produktionsbuild lokal starten, dann aus der Repository-Wurzel:

```powershell
npm run build
npm run idle:preview -- --port 5199
npx tsx artifacts/idle-bastion/acceptance/mobile-landscape-2026-11-02/browser.ts http://127.0.0.1:5199
```

Der Browserstarter nutzt die vorhandene Codex-Playwright-Installation und Chrome;
bei anderer Arbeitsumgebung diese beiden Pfade im Skript anpassen. Keine neue
Projektabhängigkeit oder Testplattform. [Messdaten](browser/results.json).

| Ansicht | Aufnahme |
| --- | --- |
| Intro | [720×320](browser/720-320-intro-0.png) |
| W1 / vollständige Leisten | [720×320](browser/720-320-wave1.png) |
| Taverne | [Mara](browser/720-320-tavern-mara.png), [Geschichte](browser/720-320-mara-story.png) |
| Werkstatt | [844×390 DE](browser/844-390-workshop.png) |
| Gegenproben | [Hochformat](browser/390-844-tavern-mara.png), [Desktop](browser/1440-900-wave1.png) |

Browseremulation ersetzt keine Sichtprüfung auf dem konkreten Handy. Reale
Android-/Browserleisten und Hardwareaussparungen wurden nicht auf einem physischen
Gerät abgenommen. Veröffentlichung ist ausdrücklich beauftragt; menschliche
Sichtabnahme bleibt als solche offen. Aktueller Paketstatus nur in der Roadmap.
