# Textkorrekturen und Empfehlung zur Wellenprogression · 02.11.2026

Die beauftragten Texte sind lokal auf Deutsch und Englisch korrigiert. **Wellen, Goldregeln, Turmwerte und Kosten wurden bei diesem Auftrag nicht geändert.** Die folgenden Wellenvorschläge beruhen auf den vorhandenen echten Simulationsläufen und einer neuen Auswertung ihrer Einzelwellen, nicht auf bereits simulierten Änderungen der Kampfwerte.

## 1. Umgesetzte Texte und Prüfung

- Farmhinweis und bestehende Niederlagenmeldung erklären die 10-%-Belohnung bereits geschaffter Wellen. Die Niederlagenmeldung empfiehlt Ausbau und erneuten Vorstoß; Geld und Ausbau bleiben erhalten.
- Die Chronik unterscheidet präzise zwischen bereits geschafften und noch nicht geschafften Wellen. Letztere behalten auch nach einem fehlgeschlagenen Versuch ihre volle gewöhnliche Belohnung.
- Der ungenaue Wachstumssatz mit „12 Prozentpunkten“ wurde durch eine verständliche Erklärung ersetzt; Wisps Bonus ist bereits in den angezeigten Erträgen enthalten.
- Der Hinweis nennt „alle Turmtypen“ statt veralteter „vier Turmtypen“.
- Nur bei einem vorhandenen alten Offline-Nachweis unter 60/65 % erklärt die Rückkehranzeige: „Diese Abwesenheit wird noch nach den früheren Regeln vergütet.“ Der historische Anspruch selbst bleibt unverändert.

Betroffen sind [main.ts](../../../../experiments/idle-bastion/src/main.ts), [progress-ui.ts](../../../../experiments/idle-bastion/src/progress-ui.ts), [index.html](../../../../experiments/idle-bastion/index.html) und [en.ts](../../../../experiments/idle-bastion/src/locales/en.ts). Der [Quellvergleich](text-update/source-scope.json) bestätigt: Von den 131 zuvor inventarisierten Dateien haben sich nur diese vier geändert; die übrigen 127 einschließlich Kampf-/Wirtschaftsquellen sind unverändert.

Prüfung nach den Änderungen:

| Grenze / Prüfung | Tatsächlicher Nachweis |
|---|---|
| Übersetzungen und bestehende Anzeige-/Tutorial-/Offlineprüfungen | **22/22 bestanden**, [Protokoll](text-update-tests.txt) |
| Relevante Textschlüssel und dynamische Werte | **184 relevante Texte mit englischen Einträgen**, keine fehlenden Schlüssel; Wisp, Tarife und Preise unverändert, [Ergebnis](text-update/copy-values.json) |
| Produktionsbuild / TypeScript | Bestanden, [Protokoll](text-update-build.txt) |
| Gespeicherte Abreise → Rückkehr → Zusatztext | Alter und neuer Anspruch in DE/EN im echten Produktionsbrowser geprüft; Hinweis nur bei Altanspruch, [sechs Browserfälle](text-update/browser.json) |
| Gespeicherte Niederlage → Farmhinweis → Schließen → Chronik | DE/EN bei 390 × 844 px, kein horizontaler Überlauf, Text und Schließen im sichtbaren Bereich, keine Browser-/Ressourcenfehler. [DE](text-update/farm-de-390.png), [EN](text-update/farm-en-390.png) |
| Sichtprüfung alter Rückkehrhinweise | Beide Sprachen lesbar, Auszahlungsbutton erreichbar. [DE](text-update/legacy-de-390.png), [EN](text-update/legacy-en-390.png) |

Der nach dem Verifikations-Skill geprüfte Ablauf lautet: isolierter IndexedDB-Probespielstand → gespeicherte Abreise bzw. Niederlage → zustandsabhängiger DE/EN-Text → bedienbare bestehende Anzeige. Das Spiel hat hierfür keinen Backend-/API-Schritt. Ein bereits laufender lokaler Server auf Port 5268 lieferte den neu gebauten Stand; keine Veröffentlichung. Der [kleine Browserprüfer](check-text-update.ts) verwendet nur eigene Probe-Slots. Die früheren 460 Gesamttests und Kampfsimulationen wurden für diese reine Textänderung nicht erneut ausgeführt oder als neue Läufe behauptet.

## 2. Was „nach W20 bis ungefähr W40 wenig Druck“ tatsächlich bedeutet

Die Aussage betraf Spieler, die **W20 erreicht haben, 24 Stunden weg waren, anschließend ihr vorhandenes und erhaltenes Gold ausgeben und regelmäßig weiter aufrüsten**. Es ist keine Aussage über einen ungeänderten W20-Aufbau und kein universelles Urteil über alle Spieler.

| Situation / Spielweise | Erster Lebensverlust | Erstmals mindestens 5 verlorene Leben | Erste Niederlage |
|---|---:|---:|---:|
| Frisch, gemütlich | W12 | W12 nach 4,1 min | W15 nach 7,3 min |
| Frisch, gemischt | W29 | W32 nach 13,5 min | W40 nach 20,0 min |
| Frisch, taktisch | W32 | W36 nach 15,0 min | W40 nach 18,6 min |
| W20 + 24 h, gemütlich | W39 | W40 nach 10,4 min | W44 |
| W20 + 24 h, gemischt | W40 | W40 nach 8,8 min | W44 |
| W20 + 24 h, taktisch | W40 | W40 nach 8,5 min | W46 |

**Die Sorge ist für diese Rückkehrer berechtigt:** Zwei Profile schaffen W21–39 ohne Lebensverlust, das gemütliche W21–38. Es sind nicht bloß knappe Siege ohne Schaden: Beim gemischten Rückkehrer erreicht bis einschließlich W31 kein Gegner mehr als etwa 30 % des Weges. Das spricht für große Reserven. Es beweist nicht, dass jeder Mensch diese Kämpfe langweilig findet.

**Es betrifft teilweise auch aktive Spieler:** Der gemischte Frischlauf bleibt bis W28 schadensfrei, der taktische bis W31. Anschließend verlieren beide in W36 bereits 19 von 20 Kernleben. W32–39 sind bei diesen Frischläufen also keineswegs durchgehend leicht. Der Befund ist ein langer einfacher Vorlauf mit später starkem Druck, nicht „alle ersten 39 Wellen sind bedeutungslos“.

Die Gesamtreichweite nach der Pause ist nicht ausschließlich durch Offline-Gold gekauft: Vorhandene Verteidigung, vorhandenes Geld, neue Erstbelohnungen und laufende Käufe tragen dazu bei. Die Profile sind plausible feste Kauf-/Platzierungsregeln, keine Nutzerstatistik und kein Beweis optimaler Spielweise.

## 3. Gesamtbild der Architektur

Es greifen vier Entwicklungen ineinander:

1. **Gegner wachsen bereits:** Die individuelle HP-Grundkurve steigt bis W15 um 16 %, danach um 13 % pro Welle. Einfach „jede Welle mehr HP“ ist also schon vorhanden.
2. **Der gesamte Kampf wächst ungleichmäßig:** Anzahl, Rüstung, Tempo, Heilung und Spawnabstände ändern den Druck zusätzlich. Gesamt-HP springen beispielsweise W31 → W32 um 66 %, fallen W32 → W33 um 28 % und steigen W35 → W36 um 45 %. Das allein ist kein vollständiger Schwierigkeitswert, passt aber zu den gemessenen späten Druckspitzen. W43 → W44 verdoppelt die Gesamt-HP ungefähr; der Übergang nach W40 gehört deshalb in eine Gegenprobe.
3. **Die Verteidigung wächst in Sprüngen:** Neue Türme, Mehrfachtreffer, Frost, Werkstatt II, Ilyra nach Boss 25 und Sturmlicht nach W28 verändern mehr als reine DPS. Ab Turmlevel 7 steigen Schaden pro Stufe um 30 % und Folgepreise um 32 %. Eine kleine skalare DPS-Zahl kann diese Synergien nicht vollständig abbilden.
4. **Wirtschaft und Schwierigkeit beeinflussen sich gegenseitig:** Neue Wellen zahlen weiterhin voll. Härtere Wellen können die sichere Farmwelle oder Farmrate senken und so auch die Offline-Auszahlung reduzieren. Mehr Gegner können dagegen mehr Gold erzeugen. Ein Wellenumbau muss beides berücksichtigen; sonst folgt auf die gezielte Goldkorrektur unbeabsichtigt eine weitere Einkommenskürzung oder eine neue Geldquelle.

Quellen: [balance.ts](../../../../experiments/idle-bastion/src/balance.ts), [wave-recipes.ts](../../../../experiments/idle-bastion/src/wave-recipes.ts) mit den eingefrorenen Rezepten, [battle.ts](../../../../experiments/idle-bastion/src/battle.ts). [Neue kompakte Datenauswertung](wave-pressure-review.json), [reproduzierbarer Extraktor](analyze-wave-pressure.ts). Die HP-Summen enthalten echte Grundwerte und Skalierung; Heilung, Rüstungsdurchdringung, Positionierung und Flächenwirkung erfordern weiterhin Kampfproben.

## 4. Ausgereifte Handlungsoptionen

| Ansatz | Konkrete Ausgestaltung | Vorteile | Nachteile / Risiko | Urteil |
|---|---|---|---|---|
| **A: Nur eine höhere HP-Kurve** | Den Bereich W16–35 lokal stärker machen und bis zum späteren Bereich kontrolliert anschließen. Keine pauschale Anhebung des ewigen Wachstumsfaktors. | Wenig Code, gut vergleichbar, bringt früher Ausbauanforderungen. | Macht dieselben Kämpfe vor allem zäher. Behebt ungünstige Mischungen nicht und kann schwächere Spieler stark bremsen. | Geeignete Vergleichsvariante, allein nicht meine erste Wahl. |
| **B: Steigende Grundanforderung plus abgestimmte Gegnergruppen** | Bestehenden Rezeptgenerator verwenden; pro Welle ein steigendes Grundniveau, begrenzte Abweichung der Familien. Gezielt HP, Anteil robuster Gegner und Spawnabstände aufeinander abstimmen. Beginnend mit W16–35, Anschluss bis W50 prüfen. | Behebt frühen Leerlauf und spätere Sprünge gemeinsam. Verschiedene Türme bleiben sinnvoll. Bestehende Gegner und Mechaniken reichen aus. | Braucht mehrere reale Kampfvergleiche. Ein statischer Druckwert allein kann Heilung, Flächenschaden und Frost nicht verlässlich gewichten. | **Empfohlen.** Kleines zusammenhängendes Balancepaket, kein neues Spielsystem. |
| **C: Vor allem zusätzliche Spezialkombinationen** | Nach bekannter Einführung öfter schnelle Gegner mit robusten Begleitern, Heiler mit einer begrenzten Panzergruppe, frostresistente Falter mit leichten Begleitern. Vorhandene Mengen-/Heilergrenzen erhalten. | Mehr taktische Abwechslung ohne neue Assets. Gute Platzierung und passende Turmwahl werden wichtiger. | Allein keine stetige Kurve; einzelne Bauweisen können abrupt ausgekontert werden. Enge Gruppen stärken Flächentürme und können sogar leichter werden. | Als Bestandteil von B sinnvoll, als alleinige Lösung zu unzuverlässig. |

**Meine Empfehlung ist B mit ausgewählten Elementen aus C.** Eine stetig steigende Grundanforderung entspricht dem Nutzerziel. Trotzdem muss die nächste Welle nach einem guten Upgrade subjektiv leichter werden dürfen. Auch kann eine Panzerwelle für einen Scharfschützenaufbau leichter sein als eine vorherige schnelle Welle. „Für jede mögliche Verteidigung jede Welle schwerer“ wäre mit unterschiedlichen Gegnerrollen nicht sinnvoll garantierbar.

Der Schwerpunkt sollte auf **früherem, besser verteiltem Druck** liegen, nicht auf noch härteren W40-/W44-Mauern. Konkret:

- W1–5 und den bereits anspruchsvollen Einstieg schwächerer Spieler zunächst erhalten. W10–15 als Kontrollbereich prüfen, nicht pauschal erhöhen.
- W16–24 muss den Ausbau nach dem ersten Boss zunehmend prüfen; nicht ausschließlich mehr leichte Gegner nachliefern, die ein einzelner starker Flächenturm abräumt.
- W26–35 muss mit Werkstatt-II-Ausbau, regulär rekrutierter Ilyra und dem Sturmlicht-Angebot Schritt halten. Die Gegenprobe berücksichtigt Spieler, die diese Angebote später nutzen. Freischaltungen dürfen Vorteile bringen und sollen nicht sofort vollständig neutralisiert werden.
- Die späteren Gruppen W32/36/40 in eine steigende Folge einbetten: davor weniger lange Leerlaufstrecken, danach keine unnötig scharfen Rückfälle. Besondere Gegnerkombinationen bleiben erkennbar; kein fester Zwang, jede fünfte Welle zu verlieren.
- Bestehenden Gesamtbelohnungsrahmen bei Rezeptänderungen kontrollieren. Mehr Gegner allein dürfen nicht automatisch die nächste Goldspirale finanzieren. Turmpreise und Offline-Tarife während dieser ersten Gegenprobe festhalten.

**Nicht empfohlen:** Alle Gegner pauschal verdoppeln, globales HP-Wachstum blind erhöhen, alle Türme schwächen oder Schwierigkeit am persönlichen Goldbestand mitwachsen lassen. Letzteres würde den Gewinn guter Entscheidungen und der Pause nachträglich entwerten. Auch ein bloßes Überspringen leichter neuer Wellen würde die gemeinsame Progression aktiver Spieler nicht reparieren.

## 5. Kleine, entscheidungsfähige Gegenprobe vor einer Umsetzung

Die vorhandenen Simulatoren reichen aus. Drei Vergleichsstände sind sinnvoll: aktueller Stand, lokale HP-Kurve als Kontrolle, abgestimmte Kurve plus wenige Rezeptanpassungen als Empfehlung. Keine umfangreiche neue Infrastruktur und kein 40-Zeilen-Handtuning jeder einzelnen Welle.

Für jeden Kandidaten dieselben drei Spielweisen mit 30 Minuten frischem Spiel und W20-/W30-Rückkehr prüfen. **Die Rückkehr-Ausgangslagen zusätzlich unter dem Kandidaten neu erspielen**: Härtere Wellen verändern bereits die Verteidigung und das Einkommen beim Erreichen von W20. Alte identische Ausgangslagen bleiben als kontrollierter Vergleich und für Bestandsschutz wichtig, reichen allein aber nicht aus. Den schwächeren Aufbau und beobachtete Stillstände bis 60 Minuten verfolgen; kleine Farm-/Fehlversuchskontrolle wiederverwenden.

Wenige Entscheidungskriterien:

- Nach dem Tutorial keine langen Strecken neuer Wellen, in denen Gegner bei allen vernünftigen Aufbauten schon sehr früh verschwinden. Neben Lebensverlusten auch die bereits protokollierte größte Wegstrecke betrachten.
- Durchschnittlicher aktiver Aufbau soll schon vor dem heutigen späten W32–36-Sprung ernsthaft gefordert sein; ein guter Aufbau darf weiter kommen. Niederlagen sind möglich und erwünscht, aber nicht vorgeschrieben.
- Rückkehrer dürfen einige Wellen deutlich überlegen sein. Als **weicher Prüfbereich** wären etwa 3–6 Minuten bis zu erkennbarem Druck interessant, statt der heutigen 8–10 Minuten ab W20. Das ist ein Vergleichsziel, keine bereits belegte Wirkung eines bestimmten Faktors.
- Nach einer Niederlage müssen bezahlbare Ausbauten oder eine sinnvolle Platzierungsanpassung erkennbar helfen. Kürzere Siege allein sind kein Erfolg, wenn danach nur ein wesentlich längerer Goldstillstand folgt.
- Farm-/Offline-Auszahlung, Übergang W40–50 und wiederholte Fehlversuche zusammen prüfen. Nicht nur die erste Niederlage früher erzeugen und ihre Folgewirkungen ignorieren.

Bei einer später beauftragten Implementierung bleiben laufende alte Rezepte und gespeicherte Abreiseansprüche erhalten. Neue Kampfregeln gelten erst für neue Versuche; Farmnachweise werden über das bestehende Versions-/Fingerabdruckverfahren neu geprüft. Kein dynamischer Schwierigkeitsregler, keine zusätzliche Save-Struktur ohne Bedarf und keine neue Währung.

**Bewertung:** Die Goldkorrektur hat die übermäßige Ressourcenquelle eingegrenzt. Das präzisierte Ziel einer gleichmäßigeren, früher spürbaren Herausforderung rechtfertigt jetzt ein begrenztes Wellenpaket. Wie stark dessen einzelne Stellschrauben sein müssen, ist durch die bisherigen unveränderten Kampfproben noch nicht belegt. Eine konkrete Prozentkombination als „optimal“ auszugeben wäre deshalb verfrüht; Umfang, Ansatz, Vergleichsvarianten und Abnahmekriterien sind dagegen klar genug, um die kleine Vorabprobe gezielt durchzuführen.
