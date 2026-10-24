# SPIRE: Idle Bastion – Balance-Audit Welle 1–25

**25.10.2026 · Analyse, keine Balanceänderung · Gesamtbewertung: 6/10**

Geprüfte Basis: [`main` / `537b5e8`](https://github.com/emfau88/TD/commit/537b5e8c9cf09b696b41644da4c56dbc8633d720), einschließlich Q3 und inzwischen veröffentlichter Q4-Einführung. Die Simulationen liefen auf `56c59d3`; der abschließende Vergleich zu `537b5e8` enthält ausschließlich Dokumentation/Nachweise, identischen Spielcode. Arbeitsbranch: `codex/early-balance-audit`. Nur dieser Bericht wird committed; keine Übernahme nach `main`.

## Gesamturteil

**Der Eindruck „bis 20 zu leicht“ trifft für sinnvoll ausgebaute Verteidigungen zu. „Beide Bosse sind zu leicht“ trifft nur eingeschränkt zu.** Die Kurve hat zwei weiche Abschnitte (6–10 und 16–20), einen deutlichen Sprung bei 21 und einen echten Ausbaucheck bei 25. Boss 15 bestraft eine schwache Aufstellung bereits hart, fordert eine normale Mischverteidigung aber wenig heraus. Gold ist nach Boss 15 reichlich vorhanden; Farmen ist bis 25 überwiegend eine Rückfallfunktion, keine notwendige Vorbereitung.

Die Bewertung betrifft die gewünschte **Schwierigkeitskurve**, nicht Grafik, Technik oder Gesamtqualität. Empfehlenswert sind einzelne stärkere Begegnungen und eine vorsichtige Prüfung der Bossmechanik, keine allgemeine HP-Erhöhung.

## Methode und Grenzen

- **[R] Regelbefund:** direkt aus aktuellem Code berechnete Werte und geprüfte Bedingungen.
- **[S] Simulation:** deterministische Läufe der echten `IdleBattle`-Engine mit festen 25-ms-Schritten, tatsächlicher Bewegung, Reichweiten, Projektilen, Rüstung, Heilung und Fähigkeiten. Keine vereinfachte DPS-gegen-HP-Rechnung.
- **[E] Einschätzung:** Interpretation, Zeitannahmen und noch ungetestete Vorschläge.

Zehn abschließend ausgewertete Verläufe: A/B/C, Tutorialausbau ohne weitere Investition, B ohne Mara, C mit 20-/60-Sekunden-Kaufintervallen, B ohne weitere Käufe nach 15 sowie Waldwächter- und Flächenvarianten. Zusätzlich **54 Bossfortsetzungen** aus regulär erspielten Zuständen; darunter identische Kontrollfälle ohne den jeweiligen ohnehin fehlenden Turmtyp. Das ist eine Sensitivitätsprüfung, keine Stichprobe menschlicher Spieler und kein Beweis eines globalen Optimums.

Alle Hauptläufe beginnen über `IdleBattle.newGame()`: **75 Gold, kostenloser selbst gebauter Startturm (10,5), Frost (8,5)**, reguläres Tutorial und kostenpflichtiger Frostbau. Käufe/Forschung erfolgen über die normalen Methoden; keine Geldzuschüsse, manipulierten Freischaltungen, Offlinegutschriften oder importierten Endspielstände. Nach jedem Tick wird die Geldbilanz geprüft: `75 + verdient − ausgegeben = Wallet` einschließlich Nachkommarest. Farmwahl verwendet das vorhandene `certifyFarm`: nur wirklich gemeisterte normale Wellen, zwei verlustfreie Proben ohne aktive Heldenboni. Prüfproben zahlen dem Hauptlauf kein Gold aus.

Bosskontrollen setzen einen erspielten Zustand in einem getrennten Speichermodell fort und stoppen weitere Käufe. Entfernungsversuche verkaufen regulär den untersuchten Turmtyp; Verkaufsgold wird nicht reinvestiert. Sie zeigen Beiträge zur konkreten Aufstellung, keine preisgleichen Alternativen. Browser-Spielstände, Speicherdatenbanken und Q4-Dateien wurden nicht bearbeitet.

**Zeitangaben sind simulierte 1×-Spielzeit**, einschließlich Wellenpausen, verlorener Kämpfe und Wiederholungen, ohne menschliche Lese-/Menüzeit, Download, Speicherdauer und Ablenkung. Keine neue Browser-/Nutzerabnahme. Die drei Q4-Szenen verändern die Kampfzeit nicht. Für eine durchgelesene Partie sind zusätzlich etwa **1–3 Minuten** plausibel [E]; tatsächliche menschliche Zeiten wurden nicht gemessen.

## Regeln und Wirtschaft im geprüften Stand [R]

| Bereich | Tatsächliche Regel |
|---|---|
| Einstieg | Startturm gratis; Upgrade auf L2: 60; angeleitete Werkstatt I gratis; Frostforschung: 60; Frostbau: **110** Gold. Summe der bezahlten Pflichtschritte: **230**. Werkstatt außerhalb der Anleitung: 200. |
| Turmfreigaben | Waldwächter sofort; Frost nach Forschung; Steinschleuder nach Forschung und gemeisterter 5; Scharfschütze nach gemeisterter 10. |
| Gebäude/Figuren | Wisp nach Forschung + 5; Lager ab 8 für 650; Taverne I ab 12 gratis. Werkstatt II: 1.200, nach Forschung kaufbar, kein Boss-15-Zwang. |
| Noch nicht verfügbar | Ilyra erst **nach besiegtem Boss 25 und Taverne II für 1.200**; Sturmlicht erst nach 28 und Ilyra-Einführung. Beide helfen nicht beim ersten Boss-25-Sieg. |
| Upgrades | Grenze zunächst L3, nach Frostforschung L6, nach Werkstatt II weitere Level. Erstes Upgrade jedes Turms 60. Schaden L1–6: ×1 / 1,75 / 2,8 / 4,1 / 5,7 / 7,5; danach ×1,30 pro Level. Reichweitenbonus höchstens 30 px, Feuerrate höchstens ×1,30. |
| Gegnerwachstum | HP bis 15 ×1,16 je Welle, danach ×1,13; Boss 15 zusätzlich ×1,20. Rüstung/Tempo und Gruppen unterscheiden die Bedrohung. |
| Kern/Niederlage | **20 Leben bei jedem neuen Versuch**; alle Gegner weg und Kern >0 zählt als Sieg, auch mit Durchbrüchen. Niederlage erhält Bauten/Gold und führt ins Farmen; Vorstoß bewusst erneut starten. |
| Einkommen | Kill- und Abschlussgold; Wisp +10 % auf wiederholbare Belohnungen. Einmalige Bossprämien 750/1.200 ohne Wisp-Bonus. Kein passives Online-Grundeinkommen zusätzlich zu Kämpfen. |
| Offline | Sichere Farmrate ×60 %, maximal 2 h; mit Lager ×65 %, maximal 8 h. Keine Offline-Bosse/Freischaltungen. |

### Turmvergleich

Werte ohne Mara, vor Rüstung und ohne Flächenmultiplikation. „L3 gesamt“ enthält Bau und beide Upgrades; der geschenkte Startturm ist 75 Gold günstiger.

| Turm | Bau | L1 Schaden / Takt / Reichweite | L3 gesamt | L3 Einzelziel-DPS | Rolle |
|---|---:|---|---:|---:|---|
| Waldwächter | 75 | 14 / 0,60 s / 132 px | 229 | 83,4 | Sehr günstiger Basisschaden |
| Frost | 110 | 7 / 0,90 s / 126 px | 308 | 27,8 | Tempo ×0,55 für 2 s; kein Stapeln, kein Tanzabbruch |
| Steinschleuder | 135 | 28 / 1,55 s / 150 px | 364 | 64,6 | Alle lebenden Ziele im Radius 52 px; trifft auch Flieger |
| Scharfschütze | 170 | 53 / 1,85 s / 190 px | 443 | 102,4 | Ignoriert Rüstung, priorisiert gepanzerte Ziele; trifft Flieger |

Die Laternenqualle ab 21 heilt nach 0,4 s Vorbereitung bis zu zwei verwundete Begleiter um 6 % ihrer maximalen HP; 3 s Cooldown, 100 px Radius, 2 s Zielsperre. Keine Selbst-/Bossheilung. Die ersten zwei Skorpione kommen bei 11, Krabben bei 13, Panzerflieger bei 17, Goblins bei 19.

## Drei Spielweisen und ihre Ergebnisse [S]

Notation: **W** Waldwächter, **F** Frost, **St** Steinschleuder, **S** Scharfschütze; Zahl = Level. Koordinaten sind Rasterfelder.

| Profil | Entscheidungsregeln | Erste Niederlage | Boss 15 besiegt | Boss 25 besiegt |
|---|---|---|---|---|
| **A – Anfänger** | Anfangs W3/F2; zweiter W bei (17,9), nur L2. Lager vor weiterer Kampfstärke. Reagiert erst auf Niederlagen, bevorzugt einfache Levelkäufe; später S bei (14,8). Höchstens ein bezahlter Kauf je 20 s. Mara bleibt am Startturm automatisch. | **15 bei 7:50**, insgesamt drei Niederlagen dort | **12:55**, vierter Versuch | **19:25**, erster Versuch |
| **B – Durchschnitt** | St bei (9,7), S bei (14,5); frühe Mischung bis ungefähr L3/4, Frost L2. Lager früh, Werkstatt II nach 18. Ab 20 L5; bei mindestens fünf verlorenen Kernleben im Sieg zusätzliche Upgradeziele bis L7. Höchstens ein Kauf je 10 s; automatische Mara am Startturm. | **Keine bis einschließlich 25** | **5:05**, erster Versuch | **11:08**, erster Versuch |
| **C – Erfahren** | St bei (11,5), S bei (14,5); gute Überlappung. Zweiter F1 bei (14,7) nach 15. Upgrades nach zusätzlicher Einzelziel-DPS pro Gold, ungefähr 200 Gold Reserve; Ziel L4 vor 15, L6 danach, bis L8 ab 20. Werkstatt II vor Lager; Mara dem stärksten Einzelziel-Turm zuweisen, Automatik. Höchstens ein Kauf je 5 s. | **Keine bis einschließlich 25** | **5:01**, erster Versuch | **10:04**, erster Versuch |

A bekommt nach Niederlagen schrittweise höhere Levelziele, ergänzt nach der dritten Niederlage einen Scharfschützen und kauft nach erreichter L6-Grenze Werkstatt II. Er bleibt lernfähig; ein absichtlich dauerhaft falsches Kaufverhalten würde keinen sinnvollen Spielertyp abbilden. Insgesamt 28/25/25 bezahlte Aktionen bei A/B/C, einschließlich der Pflichtkäufe. Nicht bei jedem Prüfintervall wird tatsächlich gekauft.

### Wichtigste Wellen

Jede Profilzelle: **Zeit des ersten Siegs / verlorene Kernleben im erfolgreichen Versuch**. Die Schwierigkeitsbezeichnung ist eine Einschätzung [E] anhand dieser Läufe, keine numerische Gewinnwahrscheinlichkeit.

| Welle | Auffälligkeit / Schwierigkeit | A | B | C |
|---:|---|---|---|---|
| 5 | Passender leichter Einstieg | 1:36 / 0 | 1:34 / 0 | 1:35 / 0 |
| 6 | Neue Flieger, aber leichter als 5; 11 Gegner | 1:50 / 0 | 1:47 / 0 | 1:48 / 0 |
| 10 | Noch keine relevante Hürde | 3:03 / 0 | 2:47 / 0 | 2:52 / 0 |
| 11 | Zwei Skorpione; A braucht länger, verliert nichts | 3:35 / 0 | 3:05 / 0 | 3:12 / 0 |
| 12 | Erste sichtbare Überforderung von A | 4:20 / 9 | 3:23 / 0 | 3:30 / 0 |
| 13 | Panzer + Krabben: sinnvoller Rollentest | 5:19 / 13 | 3:47 / 0 | 3:54 / 0 |
| 14 | Schwache Planung wird sichtbar, aber noch verziehen | 6:17 / 14 | 4:08 / 0 | 4:14 / 0 |
| **15** | **Harter Sprung für A, kontrollierbar für B/C** | **12:55 / 0, nach 3 Niederlagen** | **5:05 / 0** | **5:01 / 0** |
| 16 | Erholung nach Boss; sehr hoher Ertrag | 13:30 / 0 | 5:33 / 0 | 5:26 / 0 |
| 20 | Bis hier weiterhin kein Druck auf B/C | 15:29 / 0 | 7:11 / 0 | 6:53 / 0 |
| **21** | **Größter normaler Sprung: sieben Krabben + Heiler** | 16:12 / 2 | 8:00 / 9 | 7:29 / 0 |
| 22 | Panzerprüfung; B reagiert mit Upgrades | 16:53 / 0 | 8:39 / 0 | 8:00 / 0 |
| 24 | Tempo belastet auch gute Aufstellungen | 18:17 / 4 | 10:05 / 5 | 9:15 / 1 |
| **25** | **Echter Ausbaucheck, genügend Geld für Gegenmaßnahmen** | **19:25 / 0** | **11:08 / 0** | **10:04 / 0** |

**Der zentrale Regelbefund:** Der maximale Kernschaden aller Gegner beträgt in Welle 6–12 nur **11 / 10 / 13 / 10 / 15 / 16 / 19**. Bei 20 frischen Leben ist eine Niederlage dort durch normale Durchbrüche **mathematisch ausgeschlossen**, selbst wenn sämtliche Gegner entkommen. Mehr HP allein beheben das nicht. Bei 13/14 sind es 23/21: schon vier bzw. zwei verhinderte Schadenspunkte reichen zum Sieg.

Die Minimalprobe mit ausschließlich **W2/F1** erreicht deshalb 12: Durchbrüche kosten bei 7/8/9/10/11/12 jeweils 3/2/4/9/12/16 Leben. Erst 13 verliert sie bei **7:05**, mit **1.471 Gold** im Wallet. Das Problem ist nicht fehlendes Geld, sondern dass schwache Verteidigung lange weiterkommt.

## Gold und tatsächlich eingesetzter Ausbau [S]

Wallet nach dem jeweiligen Sieg, einschließlich Erstprämie; Ausgaben kumulativ einschließlich Forschung und Gebäude. Kein später verdientes Gold wird rückwirkend verwendet.

| Profil | Wallet nach 5 / 10 / 15 / 20 / 25 | Ausgaben bis 15 / 25 | Türme beim Sieg 15 | Türme beim Sieg 25 |
|---|---|---|---|---|
| A | 393 / 1.160,6 / 1.397,8 / 846,9 / 2.028,8 | 2.756 / 12.587 | W6, F2, W5 | W9, F2, W9, S6 |
| B | 239 / 221,6 / 1.703,8 / 3.766,9 / 2.375,4 | 2.010 / 11.532 | W4, F2, St3, S3 | W7, F2, St7, S7 |
| C | 299 / 931,6 / 1.726,8 / 1.040,9 / 2.164,2 | 1.987 / 12.247 | W4, F1, St4, S4 | W8, F1, St5, S8, F1 |

Das sind **hinreichende erspielte Aufstellungen**, keine bewiesenen Mindestanforderungen. Vor dem ersten Boss-15-Versuch besitzen A/B/C 1.184,3 / 726,1 / 749,1 Gold. Vor dem ersten Boss-25-Versuch sind es 1.057,7 / 3.586,3 / 2.014,1.

Lagerkäufe: A bei 3:40, B bei 2:40, C bei 7:15. Werkstatt II: A bei 15:20, B bei 6:20, C bei 6:10. Frühes Lager verbessert Online-Kampf und Online-Ertrag nicht; es ist eine sinnvolle Abwesenheitsinvestition, aber kein Pflichtkauf auf dem Weg zu Boss 15.

## Boss 15 und Boss 25

### Boss 15: Vorbereitung zählt, Mechanik verschenkt Druck

**[R]** Rosenspiegel besitzt **8.147,3 HP**, 10 % Rüstung und 32 px/s Tempo; ein Entkommen kostet alle 20 Kernleben. Begleitung: fünf Blattkäfer, zwei Feuerkäfer, ein Skorpion. Alle neun Gegner werden binnen **5,37 s** gespawnt. Erstprämie 750, voller wiederholbarer Ertrag mit Wisp 227,7 Gold.

**[S]** A scheitert dreimal; B gewinnt mit W4/F2/St3/S3 in **55,2 s**, C mit W4/F1/St4/S4 in **45,0 s**. Beide kaufen während dieses Bosskampfs nichts. B tötet den Boss nach etwa **44 % der Wegstrecke**, C nach 34 %. Bei B führt das Entfernen von Frost, Steinschleuder **oder** Scharfschütze jeweils zur Niederlage. Andere Kombinationen können die Rolle ersetzen: drei W4 plus F1 schlagen ihn ebenfalls in 49,4 s.

**[R/S]** Tanz: 200 px Reichweite, 0,8 s Vorbereitung, 4,5 s Kanal, 11 s Cooldown ab Beginn; der stärkste erreichbare Turm schießt im Kanal mit Faktor 0,6. Der Boss **steht während Vorbereitung und Kanal vollständig still**, alle anderen Türme feuern weiter. B erlebt fünf vollständige Kanäle: **26,5 s Stillstand** einschließlich Vorbereitung in einem 55,2-s-Kampf. Die Fähigkeit findet also statt; sie wird nicht einfach vor dem ersten Einsatz übersprungen. Ihr Stillstand gewährt der Verteidigung zugleich viel zusätzliche Schusszeit.

**[E]** Für schlecht vorbereitete Spieler bereits anspruchsvoll, für normale Mischverteidigung ein langer, relativ sicherer Kampf. Nicht pauschal mehr HP geben. Seine Mechanik sollte eher weniger Zeit verschenken.

### Boss 25: deutlich substantieller als der frühe Eindruck

**[R]** **23.047,0 HP**, gleiche Rüstung, Geschwindigkeit und Tanzmechanik; sieben Blattkäfer, drei Feuerkäfer, zwei Skorpione begleiten ihn. 13 Gegner, Spawnfenster 9,31 s. Erstprämie 1.200, voller wiederholbarer Ertrag 914,1 Gold. Keine neue zweite Bossfähigkeit.

**[S]** B startet mit **W6/F2/St6/S6** und 3.586,3 Gold. Ohne Nachkäufe verliert dieser exakt erspielte Zustand nach **85,2 s**. Drei reguläre Upgrades auf W7/St7/S7 kosten **656 + 1.181 + 1.488 = 3.325 Gold**: bereits beim Eintritt bezahlbar. Vorab gekauft gewinnt dieselbe Verteidigung ohne Eingriff in **56,4 s**; im Hauptlauf erfolgen die Käufe während des Kampfes, Sieg nach 61,0 s. Ein zusätzlicher F1 allein für 110 rettet die L6-Aufstellung nicht, sondern verlängert ihre Niederlage auf 104,5 s.

C gewinnt auch ohne weitere Käufe mit W8/F1/St5/S7/F1 in **53,4 s**; im Hauptlauf verkürzt das reguläre S8-Upgrade auf 47,3 s. Ohne beide Frosttürme verliert diese C-Kontrolle. A gewinnt nach den zuvor bezahlten Upgrades; sein erster Boss-25-Sieg ist kein Beleg für geringe Anforderungen an einen frischen L3-Ausbau.

**[E]** Boss 25 erfüllt den Ausbaucheck schon recht gut. Fehlendes Farmen entsteht vor allem dadurch, dass die nötigen Upgrades vorher finanziert sind. Seine HP und Belohnung zunächst unverändert lassen. Die fehlende neue Mechanik begrenzt die Eigenständigkeit des Meilensteins, rechtfertigt aber kein neues Featurepaket in diesem Audit.

## Farmen, Zeit und Idle-Tauglichkeit

**[S] Kein Hauptprofil braucht eine längere Geldfarm.** Alle wiederholen im Tutorial Welle 2 einmal: Nach zwei Siegen bleiben 105 Gold nach Upgrade/Forschung, es fehlen nur fünf zum Frost. Bei 36,125 s wird Frost mit 3 Restgold gebaut; der bereits begonnene Wiederholungskampf endet bei 42,675 s. Dieser vollständige zusätzliche Zyklus einschließlich Pause kostet **15,075 s**.

A absolviert nach den drei Niederlagen zusätzlich **7 / 7 / 10**, zusammen rund **45,7 s** einschließlich Übergangspausen und **601,7 Gold**. Die zunächst gekauften Wiederaufbau-Upgrades kosten 94/304/547; diese Beträge waren jeweils schon unmittelbar nach der Niederlage vorhanden. Die Wiederholungen kommen aus Rückfall und erneuter Vorbereitung, **nicht aus einem zwingenden Geldengpass**. Drei verlorene Bosskämpfe kosten dagegen zusammen **271,6 s**. B/C benötigen nach dem Tutorial keinen einzigen Farmdurchlauf.

**[R] Einkommenssprung:** voller regulärer Ertrag mit Wisp bei Welle 14: 282,7; Boss 15: 227,7 + 750 einmalig; Welle 16: **710,6**, 17: 706,2, 18: 764,5, 19: 855,8, 20: 913. Der Belohnungsfaktor springt bei 16 von 1 auf **2**, danach +0,12 je Welle. Zusammen mit leichteren Begegnungen erzeugt dies einen starken Ausbauvorsprung.

**[S]** Die sichere Farmbasis der fertigen Verteidigungen liegt bei A/B/C auf 24/20/19 mit rund **2.230 / 2.861 / 2.597 Gold pro Minute**. Das sind Prüfwerte für diese späten Ausbauten, keine anfänglichen Einnahmen und keine zusätzlich in die Läufe eingebuchten Erträge. Die Farmprüfung ist konservativ und grundsätzlich sinnvoll; höchste Welle und beste Goldrate sind nicht identisch.

**Idle-Grenze:** B ohne automatische Mara gewinnt ebenfalls ohne Niederlage bis 25 (11:08). In identischen Bosskontrollen kostet fehlender Mara-Bonus B bei 15 nur etwa 3 s, C bei 25 etwa 2 s. Automatik reicht; manuelles Zaubertiming ist nicht erforderlich. C mit Kaufprüfung alle 20 statt 5 s bleibt siegreich und braucht nur rund **14 s länger**. Eine absichtlich auf **einen einzigen Kauf pro Minute** begrenzte Variante verliert dagegen je einmal bei 15/25, erreicht 25 nach 19:25 mit 9.525 ungenutztem Gold. Das misst langsame Kaufabwicklung, nicht einen menschlichen Spieler, der bei einem kurzen Besuch mehrere Upgrades kauft.

Wer nach B's Boss-15-Sieg überhaupt nichts mehr kauft, schafft trotzdem 16–20 und scheitert erst bei **21**; danach läuft die sichere Farm weiter. **[E]** Entspanntes unbeaufsichtigtes Kämpfen funktioniert. Die ersten Minuten enthalten jedoch zu wenige notwendige Anpassungen; später tragen Kaufentscheidungen deutlich mehr als aktive Fähigkeiten zur Herausforderung bei.

## Dominante Strategien und schwache Investitionen

- **[S] Waldwächter + Frost ist sehr wirtschaftlich, aber nicht eindeutig dominant.** Drei Waldwächter plus zwei F1 erreichen 25 ohne Niederlage in 11:04, Gesamtausgaben 10.368. Die Flächenvariante W + zwei Steinschleudern + zwei F1 ist schneller: 9:54 bei 11.586 Ausgaben. C liegt dazwischen mit 10:04 und 12.247. Keine platzierungs- und budgetgleiche globale Optimierung; daraus folgt kein sofortiger Nerf eines Turmtyps.
- **[R/S] Frost L1 ist schon wertvoll.** Level erhöhen seinen Schaden, Reichweite und Feuerrate, aber weder die 45-%-Verlangsamung noch die 2-s-Dauer. Ein zweiter Standort kann mehr bewirken als hohe Frostlevel. Die Bosskontrollen zeigen großen Nutzen, aber kein universelles „zweiter Frost gewinnt immer“.
- **[R/E] Scharfschütze behält eine reale Nische:** Rüstung ignorieren und längere Reichweite. Dass Waldwächterstrategien ebenfalls gewinnen, ist kein Beleg für Nutzlosigkeit. Steinschleuder ist in dichten Gruppen stark; ihr Vorteil schwankt mit Platz und Spawnrhythmus.
- **[R/E] Lager ist für eine durchgehend aktive frühe Sitzung ein Aufschub der Kampfkraft**, für Abwesenheit sinnvoll. Taverne I kostet nichts, soziale Aktionen verbessern den Kampf nicht. Werkstatt II vor Bedarf für L7 zu kaufen bindet 1.200 Gold ohne unmittelbare Kampfwirkung. Kein Beleg für grundsätzlich nutzlose Türme; eher für wenig dringliche frühe Investitionsentscheidungen.

## Fünf priorisierte Empfehlungen [E – noch nicht umgesetzt oder gegensimuliert]

Die Zahlen sind konkrete Startpunkte für eine nächste isolierte Abstimmung, keine bereits bewiesene Zielbalance. Änderungen einzeln prüfen, erst danach kombinieren.

| Rang / Priorität | Aktueller Wert bzw. Verhalten | Konkreter Vorschlag | Erwarteter Effekt | Mögliche Nebenwirkung |
|---|---|---|---|---|
| **1 · P1** | Welle 10: 15 Gegner, maximal 15 Kernschaden; Niederlage unmöglich. | **Nur Welle 10 auf 22 Gegner:** bisherige 10 Blattkäfer + 2 Wespen + 3 Heuschrecken um 7 Heuschrecken ergänzen. Vier Gruppen 6/6/5/5, innen 0,30 s, zwischen Gruppen 1,05 s: Spawnfenster etwa 8,70 statt 8,69 s. Abschlussgold auf 20 setzen: voller Ertrag mit Wisp 235,4 statt 225,5. | Eine schwache Verteidigung kann erstmals vor 11 tatsächlich scheitern; Frost/Fläche bekommen einen sichtbaren Anlass. Kaum längeres Spawnfenster, kein HP-Aufschlag. | Lokaler Sprung und stärkere Flächenpräferenz; B/C sollen weiterhin ohne Farmzwang gewinnen. A muss nicht zwangsläufig verlieren. Anschluss an 11 prüfen. |
| **2 · P1, vorsichtige Probe** | Boss 15 steht während 4,5-s-Kanal still; B erhält insgesamt 26,5 s zusätzliche Standzeit über fünf Tänze. | **Nur bei Boss 15 während des Kanals mit 35 % Normaltempo weitergehen** (11,2 px/s vor Frost); Vorbereitung 0,8 s weiter im Stand. Dauer, Cooldown, Turmrate 0,6 und HP zunächst erhalten. | Tanz erzeugt mehr Vorwärtsdruck und weniger kostenlose Beschusszeit; verteilt Feuerzonen werden wichtiger. Keine beliebige Verlängerung des Bosskampfs. | Verlassen der 200-px-Zielreichweite kann Kanäle abbrechen; gezielt prüfen. A verliert bereits oft, daher kein gleichzeitiger HP-/Begleiterbuff. Boss 25 zunächst unangetastet. |
| **3 · P2** | Welle 16–19 bezahlen mit Faktoren 2 / 2,12 / 2,24 / 2,36; B hat nach 20 trotz Lager/Werkstatt II 3.766,9 Gold. | Nur diese vier Faktoren auf **1,60 / 1,80 / 2,00 / 2,20** glätten; ab 20 bisherige Kurve, Erstprämien und Kosten erhalten. | Rund 390 Gold weniger bei vier vollständigen Siegen, vor Rundung; gezieltere Kaufreihenfolge, etwas mehr Anlass für kurze Farmvorbereitung. | Auch sichere Farmraten dieser Wellen sinken. Das garantiert noch keinen Farmbedarf und darf keine lange Geldsperre erzeugen; erst nach 1/2 prüfen. |
| **4 · P2** | Welle 20: 15 Blattkäfer + 8 Feuerkäfer + 2 Goblins; 21 springt auf sieben Krabben + Heiler. Gesamt-HP steigen 10.360 → 18.492 (+78 %). | In **Welle 20 genau drei Blattkäfer durch drei bereits bekannte Panzerflieger ersetzen**; 25 Gegner und Spawnzeiten erhalten. Abschlussgold um 30 Grundgold vermindern, um den höheren Kill-Ertrag weitgehend auszugleichen. | Rüstung vor dem Heilerpaket wieder relevant machen; Investitionssignal vor 21, ohne weitere Art oder pauschale HP-Kurve. | Etwas langsameres Aufräumen und stärkere Scharfschützenrolle; durch Mindest-Abschlussgold/Rundung bleibt eventuell ein kleiner Mehrertrag. Nicht gleichzeitig 21 verschärfen. |
| **5 · P3, Komfort** | Nach zwei Tutorialwellen stehen 105 Gold bereit, Frost kostet 110; eine komplette Wiederholung startet wegen fünf fehlender Goldstücke. | **Frostbau 110 → 105 Gold**, weiterhin bezahlt; Forschung und Startgold erhalten. | Beseitigt die rechnerische Fünf-Gold-Warteschleife ohne kostenlosen Frost. Erwartet ungefähr einen 15-s-Zyklus weniger bis zum freien Vorstoß. | Jeder spätere Frost wird ebenfalls 5 Gold günstiger. Tatsächlichen Tutorialübergang und Reload erneut prüfen; kein Eingriff in Q4-Dialoge nötig. |

### Vor dem Release

**Zuerst Empfehlung 1 testen, dann Empfehlung 2 separat vergleichen.** Das trifft die beiden wichtigsten Befunde: fehlende frühe Verlustrisiken und der sich selbst entschärfende Tanz. Erfolgskriterium: 1–5 bleiben entspannt; bei 10 kann unterlassener Ausbau Konsequenzen haben; B/C können 15 weiterhin mit verdienter Mischverteidigung bewältigen; A wird nicht in mehrere zusätzliche 90-s-Fehlversuche gedrängt. Empfehlung 5 ist eine kleine optionale Komfortkorrektur. 3/4 erst nach erneuter Betrachtung der Gesamtkurve entscheiden; fünf Änderungen zugleich wären schlecht auswertbar.

**Unverändert lassen:** Q3-Positionen und Q4-Einführung; den geschützten kostenlosen Startturm, kostenlosen Tutorial-Werkstattbausatz und Welle 1–5; 20 Kernleben als verständliche Grundregel; einzelne Turmrollen, Rüstungsdurchdringung und begrenzte Reichweiten; Maras entspannte Automatik; Boss-25-HP/Erstprämie; Wisps 10 %, sichere Farmnachweise und Offlinegrenzen. Niederlage ohne Bauverlust ist ein passender Idle-Kern. Keine künstlich erzwungene Niederlage für gut vorbereitete Spieler.

## Nachvollziehbarkeit und technische Prüfung

**19/19 vorhandene gezielte Tests bestanden**, keine neuen Tests committed:

```text
node node_modules/tsx/dist/cli.mjs --test \
  experiments/idle-bastion/tests/tutorial-placement.test.ts \
  experiments/idle-bastion/tests/wave-v2.test.ts \
  experiments/idle-bastion/tests/farm-search.test.ts
```

Geprüft wurden insbesondere bezahlter Q3-Tutorialablauf mit Reload, unveränderte Wellen-/Belohnungsregeln und konservative Farmzertifizierung. Die Vollsuite und ein neuer Produktionsbuild wurden für diesen reinen Bericht nicht wiederholt; die in der Roadmap dokumentierten Altfehler werden nicht als behoben dargestellt.

Die temporären Treiber verwenden ausschließlich das aktuelle Kampfmodell und den vorhandenen Farmhelfer. A/B/C-Kaufregeln, Positionen, Startbedingungen und Geldbilanzen stehen oben; die Bossfortsetzungen frieren weitere Ausgaben ein. **Nicht mit den alten `runBalance`-/`playOpening`-Standardläufen gleichsetzen:** Diese starten teilweise über den historischen Konstruktor und andere Plätze. Temporäre Treiber/JSON-Daten sind nicht Teil des veröffentlichten Reports; die einzelnen Tickprotokolle sind damit auf GitHub nicht vollständig reproduzierbar archiviert. Die Ergebnisse sind konkrete Modellmessungen, keine gemessene Spielerstatistik oder visuelle Abnahme.

Quellen auf der geprüften Revision: [Kampf, Käufe, Tutorial, Kern und Ziele](https://github.com/emfau88/TD/blob/537b5e8c9cf09b696b41644da4c56dbc8633d720/experiments/idle-bastion/src/battle.ts), [HP und Goldfaktoren](https://github.com/emfau88/TD/blob/537b5e8c9cf09b696b41644da4c56dbc8633d720/experiments/idle-bastion/src/balance.ts), [Wellenauflösung](https://github.com/emfau88/TD/blob/537b5e8c9cf09b696b41644da4c56dbc8633d720/experiments/idle-bastion/src/wave-recipes.ts), [Gruppen bis 25](https://github.com/emfau88/TD/blob/537b5e8c9cf09b696b41644da4c56dbc8633d720/experiments/idle-bastion/src/wave-recipes-v12.ts), [Gegnerwerte](https://github.com/emfau88/TD/blob/537b5e8c9cf09b696b41644da4c56dbc8633d720/experiments/idle-bastion/src/enemy-roster.ts), [Bosswerte](https://github.com/emfau88/TD/blob/537b5e8c9cf09b696b41644da4c56dbc8633d720/experiments/idle-bastion/src/boss.ts), [Farmprüfung](https://github.com/emfau88/TD/blob/537b5e8c9cf09b696b41644da4c56dbc8633d720/experiments/idle-bastion/src/farming.ts), [Offline](https://github.com/emfau88/TD/blob/537b5e8c9cf09b696b41644da4c56dbc8633d720/experiments/idle-bastion/src/offline.ts).
