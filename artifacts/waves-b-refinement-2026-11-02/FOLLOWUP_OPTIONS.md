# Towers & Tantrums · vorhandener Inhalt und nächste kleine Schritte

02.11.2026 · ausschließlich Bestandsprüfung und Vorschläge. Keine neuen Türme,
Gegner, Gebäude oder Lebensregeln implementiert. Verbindlicher Status nur Roadmap.

## Türme: drei tatsächlich ungenutzte Reihen

`public/assets/Tower 06…08*.png` enthalten Basis, drei Waffenstufen und Projektile;
Turm 07 besitzt Brand-/Treffergrafik. `reference/src/data.ts` und
`reference/src/simulation.ts` enthalten historische Vorlagen. Die aktuellen
Idle-Typen 1–5 sind bereits Waldwächter, Frost, Stein, Scharfschütze, Sturmlicht.
Alte Preise und Werte sind **keine** freigegebene Balance für das jetzige Spiel.

| Reserve | Eigene Rolle / Vorschlag | Zeitpunkt als Arbeitsziel | Abwägung |
|---|---|---|---|
| Glutwerfer, 07 | Brand über Zeit, kleine Bodenfläche; stärkste Brandquelle statt unbegrenztem Stapeln | Forschung nach W34/35, vor dem nächsten größeren Ausbau | Beste nächste Ergänzung; Flieger als klare Schwäche. Brandzustand/Kills/Reload und Farmnachweise benötigen gezielte Integration. |
| Schnellfeuer, 06 | Schnell reagierender, kurzreichweitiger Einzelschaden gegen leichte flinke Ziele | Frühestens etwa W45–50, nur bei nachgewiesener Lücke | Viel vorhandene Grafik, aber große Überschneidung mit Waldwächter. Vorerst Reserve. |
| Sonnenobelisk, 08 | Teurer Flächenschaden mit Rüstungsdurchdringung | Eher W60+, kein fester Termin | Gefahr, Stein und Scharfschütze gleichzeitig zu ersetzen. Grafik ähnelt dem aktuellen Kern, der Turm-08-Material nutzt. Später prüfen. |

Die neue Kurve funktioniert mit den heutigen fünf Typen. Ein neuer Turm soll
eine Alternative schaffen und darf keinen Pflichtkauf darstellen. Nach Glutwerfer
ein begrenzter Vergleich W30–45 mit/ohne ihn; keine automatische globale HP-Erhöhung.
Forschungspreis am Einkommen und den konkurrierenden Upgrades messen, nicht aus
dem alten Kaufpreis übernehmen. Zusätzliche Ausbaustufen 5–25 sind für die drei
Reserven noch nicht wie bei den heutigen fünf Turmreihen vorbereitet.

## Gegner: vorhanden ist mehr als eine Ideenliste

Aktuell 16 normale Gegnertypen plus Rosenspiegel. Moospilz W42, Waldspinne W46,
Hornfledermaus W50 und Zunderläufer W54 sind **bereits im Spiel**, keine Reserve.

Das bekannte lokale Archiv `free_monster_pack_frakassets.zip` wurde gelesen:
13.905.403 Bytes, SHA-256 identisch zu `assets/local-monsters/sources.json`.
Vier seiner zehn Kreaturen sind integriert, sechs noch nicht. Die sechs besitzen
48er Top-down-Quellen in vier Ansichten, jeweils Idle/Attack/Hurt, **keinen Walk-Clip**.
[Kontaktübersicht](unused-monsters.png), [Clip-Inventar](unused-monsters.json).

| Unbenutzte Originalfigur | Sinnvolle Einordnung | Empfehlung |
|---|---|---|
| Schwebendes violettes Auge | Klar anderer Flieger, zunächst bekannte Werte/Rollen statt neuer Fähigkeit | Erster günstiger Kandidat, etwa W58; zwei Exemplare, direkte Wiederholung, später gemischte Gruppen. |
| Grünes Drachenjunges | Markanter robuster Flieger | Danach etwa W62. Flug-/Schwebedarstellung erst in Bewegung prüfen; keine zusätzliche Feuerresistenz nur wegen des Aussehens. |
| Orangefarbener Flammengeist | Weiterer schwebender Gegner | Reserve etwa W66+; Rolle gegen Falter, Wespe und Zunderläufer abgrenzen. |
| Grüne Kobra | Bodenform bietet optische Vielfalt | Erst passende Bewegungsprobe; vorhandenes Idle ist noch kein glaubwürdiges Kriechen. |
| Rote Beißpflanze | Stationär wirkende Form | Derzeit geringerer Nutzen auf einer laufenden Lane; keine neue Stationärgegner-Mechanik nur für dieses Asset. |
| Rosa Sandwurm | Stationär aus Sand auftauchende Form | Zurückstellen; Boden-/Grabbewegung wäre zusätzliche Arbeit und verändert den Waldkontext. |

Die Wellenzahlen sind Einordnungsvorschläge, keine beschlossenen Freischaltungen.
Neue Arten ersetzen Teile vorhandener Gruppen innerhalb derselben Gesamtbelastung
und Belohnung. Nicht gleichzeitig alle Reserven hinzufügen. Die vorhandenen
Einführungen bis W54 liefern bereits Inhalt für den ersten Abschnitt.

Zusätzlich liegen **drei ältere Spezialgegner** im Repository, mit Definitionen
und Mechanikvorlagen im historischen `src/`, nicht im aktuellen Idle-Spiel:

| Figur / Datei | Historische Rolle | Eignung |
|---|---|---|
| Sternenrichter | Schützt zwei nahe Gegner | Interessanter Kandidat für einen späteren besonderen Gegner oder Bossabschnitt W40/50. Schildregel und Lesbarkeit separat testen. |
| Wurzeltrommler / `Root Herald.png` | Beschleunigt Begleiter | Spätere Gruppenvariante; kann bestehende Wellen stark verschärfen. Kein schneller reiner Grafikimport. |
| Frostwidder / `Frost Ram.png` | Stört/verlangsamt Türme | Späterer Konter; kann frustrierend sein, wenn er die ganze Verteidigung dauerhaft schwächt. Zurückstellen. |

Diese alten Atlanten haben 443er Zellen und acht Frames; die alte Darstellung
verwendet nur zwei Laufbilder für alle Richtungen. Sie sind keine fertig passenden
Idle-Atlanten. Alte Werte und Fähigkeiten nicht ungeprüft übernehmen. Vesper ist
eine Figur/Porträtreserve, kein vorbereiteter normaler Creep. Weitere gezeichnete
Konzepte in alten Dokumenten wurden nicht als einsatzbereite Gegner gezählt.

## Gebäude und zusätzliche Goldausgaben

**Erste Wahl: vorhandene Werkstatt erweitern.** Zunächst eine bewusst gekaufte
Glutwerfer-Forschung. Ein weiterer Gebäudestand lohnt sich, wenn er später mehrere
Technologien trägt; eine leere Werkstatt III als zusätzliche Eintrittsgebühr
bringt wenig. Nutzen: klarer Kauf, neue Verteidigungsmöglichkeit, vorhandene UI.
Aufwand mittel für den Turm einschließlich Brand/Speicherung, klein für die
zusätzliche Forschung im vorhandenen System.

**Zweite Möglichkeit: begrenzter Kernausbau.** Ein oder zwei bezahlte Ausbauschritte
mit etwas mehr maximalen Kernleben als Sicherheitsreserve. Vorteil: ein anderer
Nutzen als mehr DPS. Nachteil: verschiebt Niederlagen und verlangt Anpassung der
Savevalidierung, UI und Farmprüfung; deshalb ein eigenes kleines Paket. Keine
endlose HP-Skalierung. Das ist getrennt von dauerhaftem Schaden zwischen Wellen.

**Später: Taverne mit einer echten Begleiterwahl.** Eine weitere Option statt
mehrerer gleichzeitig gestapelter globaler Buffs. Vorteil: anderer Aufbau; Nachteil:
deutlich mehr Inhalt/Animation/Balance als Werkstattforschung. Runa ist nur eine
historische Vorlage und kein fertiger neuer Idle-Begleiter.

**Derzeit nicht empfohlen:** Lager II mit noch mehr Offline-Gold oder längerer
Sammelzeit, Goldmultiplikatoren, allgemeine Rabattgebäude. Sie verstärken genau
den Ressourcenvorsprung, den wir gerade begrenzt haben. Späherposten/optionale
Herausforderungen sind später möglich; vorhandene grundlegende Gegnerhinweise
dürfen dafür nicht hinter einen Kauf wandern. Kaserne mit echten eigenen
Lane-Einheiten wäre wegen Zielwahl, Blockieren und Lebenspunkten ein größeres Paket.

## Reihenfolge und offene HP-Frage

1. Aktuellen Wellenstand kurz selbst spielen: normale Aktivphase und Rückkehr.
2. Glutwerfer mit Werkstattforschung als **ein** überschaubares Paket, anschließend
   W30–45 vergleichen. Keine gleichzeitigen neuen Gebäude, Gegner oder Goldtarife.
3. Danach wahlweise **ein** neuer Creep aus der vorhandenen Fliegerreserve oder
   ein begrenzter Kernausbau, abhängig vom sichtbaren Bedarf.
4. Weiterer Bossabschnitt separat; Sternenrichter als vorhandenen Kandidaten prüfen.

Kernleben starten heute mit 20 pro Versuch. Dauerhafter Schaden würde auch nach
kleinen Verlusten irgendwann eine Niederlage erzwingen. Für dieses Idle-Spiel
empfehle ich vorerst den jetzigen Reset. Falls später mehr Bedeutung kleiner
Verluste gewünscht ist, erst Erholung, Farmbetrieb und Rückkehr gemeinsam simulieren.
Keine Reparaturwerkstatt einbauen, bevor diese Grundentscheidung gefallen ist.
