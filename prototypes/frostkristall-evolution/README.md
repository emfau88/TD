# Frostkristall · isolierte Grafikstudie

Stand: 29.10.2026. Ausgangspunkt: `823d2ea88a583ef29a3e1c847ff322773bb65e3f` auf `main`.

[Vorschau auf GitHub Pages](https://emfau88.github.io/TD/prototypes/frostkristall-evolution/?revision=1) · [Vergleich aller acht Stufen](comparison.png) · [Neue Einzelassets](assets/compact/)

## Ergebnis und Herkunft

Staffelung ausschließlich in dieser Vorschau: **1 / 2 / 3 / 5 / 10 / 15 / 20 / 25**. Keine Spielintegration, kein Kongregate-Export, keine Änderung an Kampf, Verlangsamung, Balance, Saves oder produktivem Rendering.

Das vorhandene Assetpack enthält tatsächlich drei Frostsockel und drei Kristall-/Angriffs-, Projektil- und Trefferstufen. Das Spiel schaltet diese bisher bei **1 / 4 / 7** um, ebenso wie beim Waldwächter. Die Dateibezeichnungen Level01/02/03 sind Grafikstufen; zusätzliche Atlasframes sind Animationen und keine weiteren Skins. Originalfarben: Cyan / Bernstein / Grün.

Auf Nutzerfeedback bleibt die Studie durchgehend **Eisblau / Cyan / Weiß**, mit wenigen Metall- und Goldakzenten. Die ursprünglichen frühen Bauformen bleiben erkennbar: kompaktere Originalsockel, Originalkristall 1, separate eisblaue Varianten für 2/3. Die umgefärbten Varianten stammen aus Imagegen und sind keine pixelidentischen Originale. Alle Originalquellen bleiben unverändert; Kopien liegen unter `assets/original/`.

Die fünf neuen Skins 5–25 entwickeln Fassung, Streben und Kristallform weiter. Sockel und schwebender Kristall bleiben getrennt. Generierte Quellen und Prompts liegen in `sources/`; `pack-assets.py` beschneidet, skaliert mit Nearest Neighbor und packt die transparenten Komponenten. Keine neuen Dateien im produktiven Assetverzeichnis.

## Größenrahmen und Nachbarreihen

- Originaler Renderfaktor `0.63`, Frost-Basisanker `166.4` Grafikpixel und Bodenversatz `+13` Kartenpixel; unveränderter Fußpunkt.
- Höchstens **64 Grafikpixel Breite** und **92 Grafikpixel / 57.96 Kartenpixel Gesamthöhe**. Die neuen Stufen sind etwa 51.7–53.6 Kartenpixel hoch; spätere Stärke entsteht nicht durch höhere Gebäude.
- Kompakte Originalsockel bewahren ihre Frontfelder; der Höhenrahmen berücksichtigt vorsorglich sämtliche vorhandenen Angriffsframes aller drei Originalstufen.
- Nachgebildeter Kartenausschnitt mit Originaltextur, 40 Kartenpixel Feldabstand, gleicher Perspektive, Tiefensortierung und Kameraformel wie im Spiel. Bei 390×844: Zoom 1.31875, Feldabstand 52.75 px; bei 320×568: Zoom 0.8875, Feldabstand 35.5 px.
- Zwei Reihen zeigen alle acht Stufen; dritte Reihe wahlweise Frost oder kompakte Waldwächter. Geometrieprüfung: alle **64 Frost/Frost- und 64 Frost/Waldwächter-Kombinationen** lassen hintere Kristalle frei. Die Waldwächterprobe verwendet die kompakten Prototypen, nicht die höheren produktiven Altsockel. Das ist kein vollständiger Kampf-/Effekt-Stresstest.

## Schussprobe und Grenzen

Ein sichtbares Frostgeschoss je rein visuellem 1.8-s-Vergleichszyklus, acht Richtungen, Pause, Zeitlupe, Flug-/Trefferstandbild und Zeitregler. Kristalle bleiben aufrecht. Stufe 1 verwendet ihren vorhandenen Angriffsatlas; 2/3 und 5–25 haben vorläufig nur eine kleine Kristallbewegung. Die orange/grünen Originalanimationen werden nicht in die blauen Varianten eingeblendet. Alle Treffer verwenden den vorhandenen cyanfarbenen Effekt, die neuen Geschosse leiten sich aus den jeweiligen Kristallen ab.

Für eine spätere Integration fehlen insbesondere passend umgefärbte Angriffsatlanten 2/3 und fertige Angriffsanimationen der neuen Skins. Die Vorschau ist daher eine Gestaltungsentscheidung, kein integrationsfertiges Animationspaket. Bei reduzierter Bewegung startet die Schussprobe pausiert.

## Prüfungen

- `node --test prototypes/frostkristall-evolution/study-model.test.js prototypes/waldwaechter-evolution/shot-model.test.js`: **11/11 bestanden** (6 Frost, 5 Waldwächter). Stufen, Framegrenzen, Geschosszahl, Flug/Treffer, Richtungen, Zeitregler, FPS 15/30/60/144, Pause/unsichtbare Zeit.
- `python prototypes/frostkristall-evolution/verify-assets.py`: bestanden. Alpha, Abmessungen, Anker, reservierte Animationshöhen, 128 Nachbarpaarungen, kühle Farbvarianten, unveränderte Originalkopien und Asset-Hashes. Details: [geometry-check.json](geometry-check.json).
- `npm run build`: bestanden, inklusive separater Pages-Kopie; [Buildlog](build-result.txt). Keine erneute Vollsuite behauptet: Änderungen betreffen nur Prototyp, Pages-Kopierliste und Roadmap.
- Echter Browser: 390×844, 320×568 und Desktop 1100×900; alle acht Schussstufen, originale Stufe-1-Bewegung, Flug/Treffer, Zeitlupe, zwei/drei Reihen, Frost-/Waldwächternachbarn, Levelbeschriftung, Detailauswahl/4×-Vergrößerung und Reload geprüft. Kein horizontaler Seitenüberlauf, keine prototypbezogenen Konsolenfehler. Desktop-Screenshot über die alternative unterstützte Browser-Erfassung gesichert, nachdem die direkte Erfassung zeitweise scheiterte.

## Sichtnachweise

Die Kartenbilder stammen aus der laufenden isolierten Vorschau mit echten Originaltexturen und Spielmaßen, nicht aus dem produktiven Kampf und nicht aus gestalteten Mockups.

- [Desktopvergleich aller acht Stufen](screenshots/desktop-comparison.jpg)
- [390×844: kompakte Mischreihen](screenshots/map-390.jpg)
- [320×568: kompakte Mischreihen](screenshots/map-320.jpg)

![Acht Froststufen](comparison.png)

## Kritische Bewertung

Die gemeinsame Frostpalette liest sich schlüssiger als wechselnde Elemente. Die frühen Formen und die spät hinzukommenden Streben/Facetten sind wiedererkennbar; die Größe bleibt ruhig. Echte neue Silhouetten funktionieren hier besser als bloße kleine Abzeichen. Auf 320 px sind einzelne Übergänge, besonders 3→5 und 5→10, dennoch subtil. 15/20/25 unterscheiden sich in der Fassung klarer; eine exakte Rangfolge allein am Bild ist nicht in jeder Situation selbstverständlich. Diese Grenze ist für die gemeinsame Sichtprüfung offengelegt. Keine behauptete visuelle Nutzerfreigabe.

Veröffentlichungsnachweis wird nach erfolgreichem Pages-Lauf ergänzt.
