# Animierter Ladescreen — Integrationsprüfung, 02.11.2026

Ausgangsstand: Main e6af0f2. Nutzer hat die gezeigte Vollbildszene anschließend
zum Einbau, Optimieren, Commit und Push freigegeben. Später ausdrücklich ergänzt:
eine langsame Hintergrundwolke ohne Überdeckung von Baumblättern, mehr/höhere
Funken mit einzelnen größeren Glutstücken, dezenter Schriftglanz, lesbarer Balken.

## Umsetzung

- Vorhandener echter Ladeablauf bleibt maßgeblich. Keine simulierte Prozentzahl,
  Mindestwartezeit oder Änderung an Spielregeln/Saves. Die separate Vorschau
  behält ihren als Demo beschriebenen 16,5-Sekunden-Balken.
- Vollständige erste Szene (Wald, passende Figurengruppe, statisches Feuer) und
  Loader-CSS direkt in der gebauten HTML-Datei. Vier Inline-WebPs einschließlich
  beider Ausrichtungen zusammen 22.050 Bytes vor Base64; keine Bild-/CSS-Anfrage
  nötig, um die erste komplette Szene anzuzeigen. Schrift nutzt font-display:swap.
- Danach optional scharfe WebPs: im Handy-Querformat zusammen 299.530 Bytes
  inklusive Feuerbogen und 26.684-Byte-Wolke, gegenüber etwa 1 MB Vorschau-Bildern.
  Hochformat 384.228 Bytes, Desktop 608.938 Bytes. Niedrige Request-Priorität,
  decodierte Bilder werden eingeblendet, laufende Requests beim Spielstart
  abgebrochen. Save-Data/2G überspringt diese Zusatzbilder.
- Feuer aus acht generierten Frames, 256×256-Canvas, ca. 8,7 Bildwechsel/s;
  Lichtupdates höchstens 30/s. 24 CSS-Funken, zwei davon größer und seltener sichtbar.
  Wolke bewegt sich einmal zwölf Sekunden und hält danach ihre Position.
  Ihre gesamte Bahn liegt im freien Himmelsbereich der Originalbildkoordinaten.
  Nebel und kurzer Schriftglanz bleiben getrennte, dekorative Effekte.
- Animation pausierbar; reduzierte Bewegung, versteckter Tab und versteckter/
  fehlgeschlagener Loader werden berücksichtigt. Hintergrundarbeit endet beim
  Eintritt ins Spiel. Spielstart ist unabhängig vom Laden dieser Dekoration.

## Nachweise

14/14 vorhandene Loader-/Audiotests bestanden; TypeScript, Produktionsbuild und
Pages-Paketierung erfolgreich. Geprüft: echte Fortschrittszahlen, ungültige
Zähler, Retry/Recovery, Freigabe der Eingaben, Timeout, Übersetzungen, Musik.

check-runtime.mjs prüft gegen den Produktionsbuild:

| Prüfung | Ergebnis |
| --- | --- |
| Desktop 1440×900, 1920×1080 | Titel, Gruppe, Feuer, Status und Bedienelement vollständig sichtbar |
| Touch-Querformat 844×390, 932×430, 720×360 | Sichtbarkeit, Abstand zwischen Feuer/Status, 7-px-Balken bestätigt |
| Touch-Hochformat 390×844 und Rotation | Passende Gruppe geladen; keine falsche Querformat-Ebene nach Drehung |
| Effekte | Feuerframes wechseln, 24/2 Funken, Schriftglanz; Wolke bewegt sich und hält nach zwölf Sekunden |
| Pause/Ende | Canvas und Licht stoppen; Funken ausgeblendet, kein weiterer Animationsloop |
| Einstieg ohne Bootstrap | Inline-Szene bereits vorhanden; bei Modulfehler bleibt Retry sichtbar |
| Echter Spielstart, normale Bilder | ready, Spielcanvas sichtbar, Eingaben freigegeben, keine JS-Fehler |
| Echter Spielstart, alle optionalen Bilder abgebrochen | Ebenfalls ready, kein zusätzlicher Ladefehler |
| Echter Spielstart, reduzierte Bewegung | Ebenfalls ready; Feueratlas wird nicht angefordert |

Layout-Screenshots verwenden absichtlich angehaltenen Spielimport und einen
eingesetzten Beispiel-Zähler, damit der Loader prüfbar bleibt. Dies ist kein
gemessener Spiel-Ladefortschritt. Fehlerdialog-Screenshot prüft Anordnung;
Retry-/Recovery-Verhalten wird zusätzlich mit den vorhandenen Tests geprüft.

## Messung und Grenzen

Chrome, frische Browserkontexte, 844×390, DPR 2. Netz-/CPU-Drosselung über CDP;
für die isolierten Loader-Messungen ist der große Spielimport ersetzt.
Einzelmessungen des abschließenden Laufs:

| Profil | Erstes sichtbares Rendering | Scharfe Ebenen vollständig | Feueratlas bereit |
| --- | ---: | ---: | ---: |
| Lokal, ungedrosselt | 0,152 s | 0,239 s | 0,253 s |
| 10 Mbit/s, 60 ms Latenz, CPU ×4 langsamer | 0,588 s | 1,458 s | 1,542 s |
| 1,6 Mbit/s, 150 ms Latenz, CPU ×4 langsamer | 0,396 s | 3,784 s | 3,744 s |

Der geringe Unterschied der ersten Anzeige zwischen den gedrosselten Profilen
ist kein Beleg, dass langsameres Netz schneller wäre. Lokale CPU-/Browserlast
schwankt; frühere Entwicklungsdurchläufe zeigten auch über zwei Sekunden.
Es gibt daher keine garantierte „Instant“-Zeit. Entscheidend und separat geprüft:
Die vollständige kleine Szene benötigt weder Bootstrap noch die scharfen Bilder.
Die erste Fassung ist vorübergehend weicher; endgültige WebP-Details wurden in
Desktop-, Quer- und Hochformataufnahmen visuell geprüft.

Die echten lokalen Spielstarts erreichten ready nach ca. 3,1–5,2 s in den drei
Prüfvarianten. Das ist kein Download-Benchmark des ganzen Spiels über Mobilfunk.
Headless-Chrome lieferte in der gedrosselten Animationsprobe p95-Frameabstände
von 16,7–22,3 ms, dabei hohe simulierte Hauptthread-Auslastung. Wegen teils
unbegrenzter Headless-Bildrate sind daraus keine belastbaren Handy-FPS oder
Energieverbrauchswerte abzuleiten. Ein physisches Handy wurde nicht gemessen.

Reproduktion: npm run build, Vite-Preview auf Port 5199, anschließend
node prototypes/loading-campfire-v1/check-runtime.mjs. Der Prüfer verwendet die
lokal vorhandene Playwright-/Chrome-Installation; Pfade ggf. anpassen.
[Messdaten](results.json), Beispiel [Querformat](844x390.jpg),
[Hochformat](390x844.jpg), [erster Frame ohne JavaScript](first-frame-without-javascript.jpg).
PNG-Arbeitsaufnahmen und Vorschauvideos sind lokal ignoriert.

Quellen und vollständige ImageGen-Prompts:
[PROMPTS.md](../../../../prototypes/loading-campfire-v1/PROMPTS.md).
Nur integriertes ImageGen, kein API-/CLI-Fallback. Generierte Originale erhalten,
WebP-Exporte ausschließlich skalieren/komprimieren bzw. ersten Feuerframe entnehmen.
Veröffentlichungsstatus steht in der fortlaufenden Roadmap.

## Öffentliche Verifikation

Implementierung d44f51b per Fast-forward auf Main übernommen und gepusht.
[Pages-Lauf 41533798669](https://github.com/emfau88/TD/actions/runs/41533798669)
erfolgreich. Anschließend reale öffentliche Starts auf 844×390 Touch-Querformat
und 1440×900 Desktop: Inline-Szene/Wolke im ausgelieferten HTML, ready,
sichtbares Spielcanvas, freigegebene Eingaben, keine HTTP- oder JavaScriptfehler.
Beide Prüfungen liefen in frischen isolierten Browserkontexten.
[Öffentliche Messdaten](public.json).
