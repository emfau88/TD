# Sturmlicht-Veröffentlichung und gezielte Farmsuche

23.10.2026 · Farmbranch `codex/farm-search` ab main `922aff633c615881ef068918676ab96aa90cb830`.

## Sturmlicht ist übernommen

Der visuell freigegebene Commit wurde unverändert per Fast-forward nach `main`
übernommen. Es gab keine Konflikte, keinen Force-Push und keinen Eingriff in
`codex/tavern-idle-smoothing`, seine lokalen Commits oder uncommittete Änderungen.
Produktionsbuild und relevante Matrix unmittelbar davor erneut geprüft:
**135/147 bestanden, genau zwölf bekannte Fehler, keine neue Fehlerbezeichnung**.
[Build](sturmlicht-release-build.txt) · [Tests](sturmlicht-release-tests.txt).

[GitHub-Pages-Lauf 40007020205](https://github.com/emfau88/TD/actions/runs/40007020205)
ist erfolgreich einschließlich Build und Veröffentlichung. Die
[Live-Seite](https://emfau88.github.io/TD/) antwortet mit HTTP 200 und enthält
Sturmlicht. Die folgende Farmoptimierung ist **nicht** auf main/Pages.

## Entscheidung und tatsächliche Änderung

**Empfehlung: die kleine Farmkorrektur nach Nutzerprüfung übernehmen.** Sie findet
in acht von zwölf gespeicherten Verteidigungsständen eine bessere sichere Welle,
in vier bleibt die bisherige Auswahl erhalten. Keine gemessene Rate sinkt.
Die Änderung betrifft im Produktionscode ausschließlich `src/farming.ts`.

- Höchstens vier unterschiedliche Kandidaten: höchster normaler Live-Clear,
  bisherige Farmwahl, ein tatsächlich belegter Clear möglichst nahe der Mitte
  beider Wellen, Einstieg. Bei gleichem Abstand gewinnt die kleinere Welle.
- Fehlt eine frühere Farmwahl über 1 oder ein Zwischenkandidat, füllen die
  bestehenden jüngeren Kandidaten die Plätze. Keine erfundenen Freischaltungen.
- Ein gültiger Nachweis wird behalten. Neue oder durch Ausbauten ungültig
  gewordene Belege brauchen unverändert zwei vollständige verlustfreie Durchläufe,
  ohne aktive Heldenfähigkeiten und mit konservativen Start-Cooldowns.
- Eine rechnerisch chancenlose Zusatzprobe auf Welle 1 entfällt: Die großzügige
  Obergrenze nimmt sämtliche Belohnungen samt Wisp, null Kampfzeit und nur die
  zwei obligatorischen Pausen an. Ist selbst das nicht besser als die bereits
  bewiesene Rate, kann die reale Welle 1 die Auswahl nicht verbessern. Diese
  Schranke erzeugt weder Sicherheitsnachweis noch Auszahlung. Ohne besseren
  Nachweis bleibt der Einstieg eine vollständig simulierte Rückfalloption.

Kein neuer Director, Timer oder Worker. Obergrenzen bleiben vier Kandidaten ×
8.000 Simulationsschritte. Unveränderte Vergleichsregel: Nur eine strikt höhere
Goldrate ersetzt den bisherigen besten sicheren Beleg.

## Vergleich auf bezahlten Spielständen

Die zwölf originalen B16-Saves stammen aus drei regulär bezahlten Fortsetzungen
mit gemeinsamem Verteidigungskern und zusätzlicher Steinschleuder beziehungsweise
einem/zwei Sturmlichtern. Keine neuen Käufe, geschenkten Ressourcen, HP-,
Preis- oder Rezeptänderungen im Vergleich. Jeder Save wird separat ohne
mitgegebenes Zertifikat und mit einem unter der bisherigen Suche nachgewiesenen
Zertifikat geprüft: **24 Ausgangsfälle × drei Suchvarianten**.

`baseline` ist der Quellstand aus Commit `922aff6`, `midpoint` ändert ausschließlich
den Zwischenkandidaten, `current` ist die implementierte Variante einschließlich
der Einsparung bei Welle 1. Alle verwenden denselben produktiven Nachweiscode.
`current` und `midpoint` liefern in allen 24 Fällen identische Zertifikate;
die Einsparung beeinflusst nur den Aufwand. Rohsave und vorhandenes Zertifikat
führen in diesen zwölf Ständen zur selben Wellenwahl und Goldrate.

| Verteidigung | Rekord | Farmwelle alt → neu | Gold/min alt → neu | Vorteil |
| --- | ---: | ---: | ---: | ---: |
| Zusätzliche Steinschleuder | 40 | 23 → 31 | 3534 → 3912 | 10.7 % |
| Zusätzliche Steinschleuder | 50 | 23 → 36 | 4221 → 4397 | 4.2 % |
| Zusätzliche Steinschleuder | 60 | 23 → 41 | 4221 → 5238 | 24.1 % |
| Zusätzliche Steinschleuder | 70 | 23 → 46 | 4221 → 5474 | 29.7 % |
| Ein Sturmlicht | 40 | 26 → 26 | 3811 → 3811 | 0.0 % |
| Ein Sturmlicht | 50 | 26 → 26 | 4562 → 4562 | 0.0 % |
| Ein Sturmlicht | 60 | 26 → 43 | 4765 → 5180 | 8.7 % |
| Ein Sturmlicht | 70 | 26 → 48 | 4765 → 5290 | 11.0 % |
| Zwei Sturmlichter | 40 | 26 → 26 | 3811 → 3811 | 0.0 % |
| Zwei Sturmlichter | 50 | 26 → 26 | 4338 → 4338 | 0.0 % |
| Zwei Sturmlichter | 60 | 26 → 43 | 4765 → 5447 | 14.3 % |
| Zwei Sturmlichter | 70 | 26 → 48 | 4765 → 5290 | 11.0 % |

Die Zahlen bezeichnen vollständiges Kill- und Abschlussgold einschließlich Wisp
und regulärer Pausen. Es wird kein Gold im laufenden Spiel gutgeschrieben.
[Alle Kandidaten, Belege, Einzelläufe und Zeitmessungen](comparison.json).

## Rechenkosten

Node 22, CPU siehe Rohdatei; sieben erwärmte Wiederholungen pro Suchvariante und Fall,
wechselnde Ausführungsreihenfolge. Die Tabelle mittelt jeweils die zwölf Mediane.
Simulationsschritte sind zusätzlich deterministisch gezählt; Messinstrumentierung
liegt nur in ignorierten lokalen Kopien, nicht im Produktionsbuild.

| Zustand | Mittlere Laufzeit alt → neu | Größter Fall alt → neu | Summe Schritte alt → neu |
| --- | ---: | ---: | ---: |
| Ohne mitgegebenen Nachweis | 94.5 → 83.4 ms | 127.4 → 96.8 ms | 64903 → 58663 |
| Mit gültigem Nachweis | 71.8 → 60.9 ms | 102.4 → 68.3 ms | 48255 → 42015 |

In einzelnen Node-Fällen steigt die Zeit um maximal etwa 4,4 ms; insgesamt sinkt
sie um rund 12–15 %. Mehr Arbeit an einer länger sicheren Zwischenwelle ist nicht
für jeden einzelnen Save vermeidbar. Die ursprüngliche Zwischenvariante ohne
Einsparung benötigt teilweise mehr Schritte; deshalb wurde sie nicht unverändert
übernommen.

Zusätzlich vier ausgewählte Fälle in echtem Chrome mit fünf Wiederholungen:

- Desktop 1600×1000: Mittel 111.1 → 100.0 ms, größter Fall 129.7 → 120.4 ms; einzelne Fälle bis +2.7 ms.
- Mobilprofil 390×844, CPU ×4 gedrosselt: Mittel 322.2 → 292.1 ms, größter Fall 356.5 → 314.6 ms; einzelne Fälle bis +13.7 ms.

[Browserdaten](browser-results.json). Das ist eine CPU-Drosselung auf dem Rechner,
kein Test auf physischer Smartphone-Hardware. Die bereits synchrone Farmsuche
kann auf langsamen Geräten kurz blockieren; diese kleine Änderung reduziert den
mittleren und größten gemessenen Aufwand, garantiert aber keine Verbesserung jedes
Einzelfalls. Eine neue asynchrone Architektur wurde nicht eingeführt.

## Speicher und Offline-Fortschritt

Schema **29**, Kampfregeln **15**, Fingerabdruck und Nachweisformat bleiben gleich.
Eine reine Kandidatenauswahl macht bestehende Sicherheitsbelege nicht ungültig;
ein Versionssprung würde sie unnötig verwerfen. Laden und vorhandene Änderungen
an Verteidigung/Live-Historie lösen wie bisher die Prüfung aus. Keine zusätzliche
periodische Vollsuche.

Bereits angelegte Offline-Fenster und reservierte Ansprüche behalten die exakt
historische Rate. Speichertests prüfen Regeln 14 und 15; zusätzliche echte
Chrome-IndexedDB-Transaktionen prüfen Regeln 15: alter Nachweis Welle 23,
neuer Nachweis Welle 36, alter Anspruch
**2.743,465 Gold**, exakt einmal bezahlt; Reload verändert weder Kampf noch Geld.
Erst zukünftige Abwesenheit profitiert von der neu bewiesenen Rate. 60/65 %
Offline-Effizienz und 2/8 Stunden Obergrenze bleiben unverändert. Bestehende
laufende Wellen, Spawns, Geschosse und Migrationen wurden nicht bearbeitet.

## Prüfung

- **8/8 neue gezielte Tests bestanden:** zwölf bezahlte Stände, maximal vier
  Kandidaten, echte Zwei-Durchlauf-Nachweise, dünne Historie/Gleichstände,
  ungültige Freischaltungen, Erhalt gültiger Belege, Verkäufe, Einstieg,
  historische Offline-Ansprüche, native Reloads und alte laufende Kämpfe.
  [Ausgabe](farm-search-tests.txt).
- **143/155 relevante Tests bestanden**, exakt dieselben zwölf bekannten Fehler,
  keine neuen Fehler oder abgeschwächten bisherigen Assertions.
  [Matrix](regressions.txt) · [zwölf bekannte Fälle](KNOWN-TEST-FAILURES.md).
- Produktionsbuild einschließlich TypeScript erfolgreich. [Build](build.txt).
- Chrome Desktop/Mobilprofil: echte IndexedDB, historische Auszahlung einmalig,
  exakter Reload; keine vorhandene Spielerdatenbank verwendet.
- Produktionsdiff auf `farming.ts` beschränkt. Kein Goldaufschlag, insbesondere
  keine zusätzlichen 3 % pro Welle; keine Änderungen an Türmen, Gegnern oder HP.

## Grenzen und Empfehlung

Die Auswahl ist gezielt besser, aber keine Suche nach der global lukrativsten
Farmwelle. Vier Kandidaten können andere gute Wellen weiterhin übersehen. Die
Untersuchung deckt zwölf konkrete bezahlte Saves und drei verwandte Aufstellungen
ab, keine vollständige neue Progressionssimulation oder Endgame-Abnahme.
Das langfristige Goldplateau bleibt bestehen und wird separat nach Glutwerfer
behandelt. Der zusätzliche Ertrag stammt ausschließlich aus einer besseren Wahl
bereits verfügbarer sicherer Wellen.

Die neuen Belege erfüllen dieselben Sicherheitsanforderungen, die gemessene
Wirtschaft verschlechtert sich in keinem Fall und der durchschnittliche
Rechenaufwand sinkt. Damit ist der kleine Eingriff sinnvoll; physische Mobilgeräte
und weitere ungewöhnliche Aufstellungen bleiben praktische Beobachtungspunkte.
**Branch zur Nutzerprüfung, kein Merge oder Deployment der Farmoptimierung.**

Reproduzieren: aus dem Repository zuerst
`npx tsx experiments/idle-bastion/tests/helpers/compare-farm-search.ts` ausführen.
Der Helper liest den eingefrorenen Ausgangscode per `git show 922aff6`, erzeugt
nur lokale instrumentierte Module unter `.local-assets/` und schreibt Rohdaten.
Die Chrome-Prüfung in `tests/browser/farm-search.ts` nutzt einen separaten lokalen
Vite-Server (standardmäßig 5201) und `PLAYWRIGHT_MODULE` für die vorhandene
Playwright-Installation. Keine Testdateien gelangen in den Pages-Build.
