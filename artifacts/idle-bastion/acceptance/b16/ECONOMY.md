# Kleiner Wirtschaftsaudit · Wellen 25–70

23.10.2026 · Daten des finalen Sturmlicht-Standes. Ausschließlich Untersuchung,
keine Änderung der allgemeinen Preise, Goldkurve, Farmregeln oder Offline-Quoten.

## Messgrundlage

Alle drei Strategien beginnen mit demselben tatsächlich erspielten Welle-25-Save
aus W02, einschließlich seiner 1.762 Gold und gekauften Türme. Keine geschenkten
Ressourcen, Level oder Forschungsfreigaben. Taverne II kostet regulär 1.200 Gold;
Ilyra wird bewusst rekrutiert, läuft zum Kampfweg und führt ihre erste echte Salve
aus. Danach bleibt ihre Automatik aus. Neue Forschung kostet 900, Sturmlichtbau 170.
Alle Ausbauten werden mit den normalen Kosten bezahlt.

Kontrolle ergänzt eine Steinschleuder, die anderen Ansätze ein beziehungsweise
zwei Sturmlichter in der späten Kurve. Der bestehende Kern der Verteidigung bleibt.
Alle kaufen nach derselben einfachen Kostenpriorität; Steinschleuder/Sturmlicht
werden für ihren Gruppenwert leicht bevorzugt. Nach einer Niederlage wird erst
nach tatsächlichem Ausbau und etwa 20 % höherer gewichteter Verteidigungsleistung
erneut vorgestoßen. Farmwahl verwendet unverändert den Spielalgorithmus. Es sind
wenige plausible Kaufregeln, keine optimale Lösersuche oder aktive Spielerleistung.

| Strategie | Zeit 25→40 | Zeit 25→60 | Zeit 25→70 | Davon Farmzeit | Niederlagen | Bezahlte Käufe/Ausbauten |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Kontrolle, zusätzlicher Flächenturm | 23:07 | 2:53:04 | 7:27:40 | 6:36:35 | 18 | 88 |
| Ein Sturmlicht | 18:32 | 2:24:23 | 7:54:47 | 7:03:28 | 18 | 91 |
| Zwei Sturmlichter | 23:50 | 2:28:48 | 8:03:41 | 7:12:43 | 18 | 110 |

Der reguläre kostenlose Tavernenbausatz und die kostenlose Rekrutierung werden
im Rohprotokoll zusätzlich mit Kosten null aufgeführt. Jede Goldzahlung ist
einzeln ausgewiesen. Zeiten sind bestätigte **Modellzeit ab dem Welle-25-Save**, keine Browser-Wallzeit.
Die bereits erspielte Zeit bis Welle 25 kommt hinzu.

Sturmlicht hilft in diesen Aufstellungen beim Anschluss bis 40/60. Es macht den
gesamten Verlauf nicht automatisch schneller: andere Upgradeverteilung und lange
spätere Farmphasen überwiegen. Zwei Exemplare umgehen die Ausbauanforderungen nicht.
Auf 70 liegen die letzten Turmlevel etwa zwischen 21 und 24; keine Level-20-Schranke.

## Goldrate und nächster sinnvoller Ausbau

| Rekord, ein Sturmlicht | Aktuell gewählte sichere Farmwelle | Gold/min | Günstigster nächster Schadensausbau | Preis / Rate ohne vorhandenes Gold |
| --- | ---: | ---: | ---: | ---: |
| 40 | 26 | 3.811 | 2.592 | 0,68 min |
| 50 | 26 | 4.562 | 7.984 | 1,75 min |
| 60 | 26 | 4.765 | 24.240 | 5,09 min |
| 70 | 26 | 4.765 | 97.140 | 20,39 min |

Mit dem tatsächlich noch vorhandenen Wallet sind es an diesen Punkten ungefähr
0,11 / 1,24 / 4,25 / 19,97 Minuten. Mehrere Upgrades können nötig sein, bevor ein
erneuter Vorstoß sinnvoll ist; ein einzelner Kauf verkürzt nicht automatisch eine
ganze Farmphase. Kontrolle bei 70: etwa 4.221 Gold/min und 20,95 Minuten Restwartezeit
für den günstigsten nächsten Ausbau. Die langsame Phase ist kein neues Sturmlichtproblem.

Die HP-Kurve wächst später um 13 % pro Welle. Schaden wächst bei hohen Leveln um
30 %, Upgradepreise um 32 % pro Level. Reichweite und Feuerrate erreichen früh
ihre bestehenden Grenzen. Um bei ähnlicher Aufstellung die HP-Steigerung auszugleichen,
braucht man grob 0,466 zusätzliche Level pro Schadensquelle und Welle; der Preis
steigt dabei im Mittel um etwa 13,8 % je Welle. Das ist eine Näherung ohne Rüstung,
Gruppenwirkung und Platzierungsänderungen.

Dem steht der bei vier gedeckelte Goldfaktor gegenüber. Feste Gegnerdeckel und
begrenzte Abschlussbelohnungen führen langfristig zu einer nahezu flachen Rate.
Waldwächter-Upgrades kosten auf Level 15/20/25/30 beispielsweise
7.984 / 31.997 / 128.225 / 513.859 Gold; Sturmlicht auf denselben Leveln
18.098 / 72.526 / 290.644 / 1.164.746. Damit wächst die Wartezeit deutlich schneller
als das sichere Einkommen. Es gibt bis 70 keine mathematische Sackgasse, aber lange
zusätzliche Farmzeiten. Die vorhandenen sicheren Ganzzahlgrenzen bleiben langfristig
eine separate technische Grenze; dieser Auftrag baut keine neue Zahlenarchitektur.

## Weshalb alte Farmwellen wiederkehren

Die laufenden Strategien bleiben auf 23 beziehungsweise 26. Dafür gibt es zwei Gründe:
leichte alte Gruppen laufen schnell durch, und die begrenzte Suche prüft hauptsächlich
die beiden jüngsten Clears, den alten gültigen Nachweis und den Einstieg. Jüngste
Erfolge sind oft nur mit Durchbrüchen gelungen und deshalb kein sicherer Farmnachweis.
Ein bereits sicherer älterer Kandidat bleibt dann korrekt erhalten, ohne dass die
Suche alle anderen alten Wellen wirtschaftlich vergleicht.

Zusätzliche **reine Analyseproben auf Kopien** derselben bezahlten Saves zeigen:

| Stand | Auswahl im Spiel | Beste sichere Welle innerhalb der gespeicherten Live-Historie | Vorteil |
| --- | --- | --- | ---: |
| Kontrolle, Rekord 40 | 23 · 3.534 G/min | 29 · 4.595 G/min | +30 % |
| Ein Sturmlicht, Rekord 40 | 26 · 3.811 G/min | 29 · 4.314 G/min | +13 % |
| Ein Sturmlicht, Rekord 60 | 26 · 4.765 G/min | 32 · 6.314 G/min | +33 % |
| Ein Sturmlicht, Rekord 70 | 26 · 4.765 G/min | 43 · 6.565 G/min | +38 % |

Alle Alternativen bestehen zwei vollständige verlustfreie Durchläufe ohne aktive
Heldenboni. Die Live-Verteidigung, Belohnungen und Produktionsnachweise werden
dabei nicht geändert. „Beste“ bezieht sich auf die noch gespeicherten Kandidaten,
nicht auf jede jemals gespielte Welle. Das Ausnutzen einer alten sicheren Welle ist
kein Fehler; das Übersehen einer bereits besseren sicheren Alternative ist die
kleine wirtschaftliche Schwäche der bewusst begrenzten Suche.

## Genau zwei Vorschläge für später

1. **Farmkandidaten besser verteilen, weiterhin höchstens vier Proben.** Neben
   gültigem Nachweis, höchstem Clear und Einstieg einen Kandidaten ungefähr in der
   Mitte zwischen bisheriger Farmwahl und Rekord statt des fast gleichen zweiten
   Frontiers prüfen. Die vorhandene sichere
   Rate bleibt erhalten, bis zwei neue sichere Durchläufe eine bessere belegen.
   Dieser konkrete kleine Versuch hätte in den vier gemessenen Saves 0–11 % höhere
   Rate gebracht. Die obigen 13–38 % sind das Potenzial einer vollständigen Prüfung
   der gespeicherten Historie, kein Versprechen für vier Kandidaten. Ein kleines
   A/B der Kandidatenregel ist sinnvoller als eine Vollsuche im Produkt.
2. **Das spätere Goldplateau separat testen.** Als begrenzte Hypothese zunächst
   etwa +3 % Begegnungsbudget pro Welle ab 45 gegen die aktuelle Deckelung vergleichen,
   einschließlich Farm-/Offline-Folgen und nötiger Ausbaupausen. Diese Größe ist
   ein Versuchswert, keine freigegebene Balance. Bei 70 wäre der Zusatzfaktor etwa
   2,16; Kosten und HP wachsen weiterhin stärker. Keine pauschale Sofortgutschrift.

Beides ist **nicht implementiert**. Insbesondere die Farmregel wird in B16 nur um
den fünften Turm im Fingerabdruck ergänzt, nicht um eine neue Auswahlpolitik.

## Rohdaten und Reproduzieren

[Kontrolle](economy/control.json) · [ein Sturmlicht](economy/one-storm.json) ·
[zwei Sturmlichter](economy/two-storms.json) · [isolierte Farmproben](economy/farm-audit.json) ·
[Preiskurve](economy/upgrade-curve.json).

Die drei bezahlten Verläufe erzeugt `tests/helpers/measure-stormlight.ts`; die
zusätzlichen Farmproben `tests/helpers/audit-storm-farms.ts`. Jeweils über den
vorhandenen TSX-Runner ausführen. Primäre Grenze der Aussage: feste einfache
Kaufprioritäten und wenige Platzierungen. Ein menschlicher Spieler kann gezielter
gegensteuern; diese Zahlen sind keine allgemeine Endgame-Abnahme.
