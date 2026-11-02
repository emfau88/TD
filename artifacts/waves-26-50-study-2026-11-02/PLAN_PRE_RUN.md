# W26–50: festgelegter Vergleich vor der Auswahl

Basis: veröffentlichter Gold-/Textcommit `d4120482796fa1bc20d653b148ffc3873a610036`. Auftrag vom 02.11.2026: Schritte 1–5 durchführen; Entscheidung und Integration in Schritt 6 gemeinsam. Status ausschließlich in der ROADMAP. Dieses Dokument beschreibt Versuch und Kriterien, keine Freigabe eines Kandidaten.

## Festgehaltene Grenzen

W1–25 einschließlich Bossen, Preisen, Turmwerten, Figuren, Wirtschaft und Offline-Caps bleiben unverändert. Keine neuen Gegner oder Systeme. Nur isolierte Kopien des bestehenden Simulationscodes. Gegenstand ist W26–50; der Anschluss 51–55 wird zusätzlich numerisch geprüft, damit kein künstlicher Abbruch bei W50 entsteht. Keine Veröffentlichung von Kandidaten.

## Vorab definierte Kandidaten

- **Kontrolle:** exakter Main-Stand, keine Anpassung.
- **A – lokale HP-Rampe:** zusätzlicher HP-Faktor ab W26: `1 + 0,06 × min(Welle − 25, 10)`, also 1,06 bei W26, 1,30 bei W30 und 1,60 ab W35. Anschließend kein weiteres zusätzliches exponentielles Wachstum; bisherige 13-%-Grundkurve läuft weiter. Zusammensetzung, Spawnzeiten und Belohnungen bleiben exakt gleich. Die 60-%-Anhebung ist eine klar begrenzte Sensitivitätsprobe, kein behauptetes Optimum.
- **B – geglättete Anforderung mit kleinen Gruppenänderungen:** dieselbe Anhebungsrampe, aber bezogen auf eine stetige nominale Begegnungsanforderung statt auf jede schwankende bestehende Mischung. Diagnosegewicht pro Gegner: `HP / (1−Rüstung) × sqrt(Tempo/45)`, Heiler ×1,25 (bereits vorhandenes `enemyPressure`). Referenz ist das geometrische Mittel der ursprünglichen W26–30, auf W26 mit der bisherigen 13-%-Kurve zurückgerechnet. Ziel ab W26: Referenz × `1,13^(Welle−26)` × A-Rampe. Ein gemeinsamer HP-Faktor je Welle gleicht die aktuelle Mischung auf dieses Ziel ab. Dies ist eine Steuergröße für die Probe, kein Beweis gleicher tatsächlicher Schwierigkeit.

B verändert zusätzlich höchstens vier Plätze je normaler Welle bis W50: Schwärme erhalten etwas mehr ihrer vorhandenen schnelleren Begleitung (maximal vier), Anstürme drei zusätzliche vorhandene schnellere Gegner, Panzer-/Unterstützungsgruppen höchstens zwei zusätzliche vorhandene robuste Begleiter. Nur bereits im Rezept vorkommende Arten, keine zusätzlichen Typen, keine Änderungen an den zwei Einführungsplätzen neuer Arten oder den Heilern, Elite 40 unverändert gemischt. Spawnzeiten und Gesamtzahl bleiben unverändert. Mehr Kill-Basisgold wird vom Abschluss-Basisgold abgezogen; mindestens 20 Abschluss-Basisgold bleiben erforderlich. Rundungsunterschiede nach der normalen Goldskalierung werden separat gemessen. Nach W50 keine weiteren Gruppenänderungen; die nominale Kurve setzt sich mit den bisherigen 13 % fort.

Die genaue Umsetzung und Prüfsummen werden vor dem ersten Kandidatenlauf gesichert. Keine nachträgliche heimliche Anpassung dieser beiden Kandidaten an bevorzugte Ergebnisse. Fehler im Analyseaufbau werden dokumentiert und korrigiert.

## Messung und weiche Auswahlkriterien

1. **Einstieg erhalten:** W1–25 und alle Käufe bis zu diesem Punkt müssen in gleichen Profilen exakt übereinstimmen.
2. **Früher spürbarer Druck:** Nach W25 erstmals mindestens fünf verlorene Leben, erste Niederlage, längste schadensfreie Folge und größte erreichte Wegstrecke messen. Erwünscht sind ernsthafte Ausbauanforderungen im Bereich W31–35 statt überwiegend erst W36–40; gute Aufbauten dürfen weiter kommen.
3. **Rückkehrbelohnung:** W20-/W30-Abreise, 24 Stunden mit echtem Nachweis, sinnvolle Goldausgabe und weitere Käufe. Grob 3–6 Minuten bis erneutem Druck dienen als Vergleichsbereich, nicht als starre Verlustfrist.
4. **Erholung:** Bestwellen nach 30/60 Minuten, Farmzeit, Zeit ohne neuen Rekord und tatsächliche Erholungsdauer vergleichen. Ein Kandidat gewinnt nicht allein durch frühere Niederlagen. Deutlich längere Stillstände oder wiederholte Niederlagen ohne Annäherung sind ein Gegenargument; normale Farmphasen bleiben erwünscht.
5. **Wirtschaftliche Folgen:** sichere Farmrate, Auszahlungen nach 0,5/2/8/24 Stunden, Ausbauten, Goldbilanz und reguläres Begegnungsgold prüfen. Acht und 24 Stunden müssen weiterhin gleich auszahlen. Keine neue Goldquelle durch Gruppentausch.
6. **Kurve und Vielfalt:** Anzahl/Arten je Welle, aufeinanderfolgende nominale Druckverhältnisse und tatsächliche Ergebnisse der drei Aufbauten gemeinsam betrachten. Gegnereigenschaften, Heiler und neue Einführungen müssen erhalten bleiben.

## Begrenzter Versuchsaufbau

Die drei bereits überprüften Profile gemütlich/gemischt/taktisch behalten Kaufintervalle, Prioritäten, Positionen, Heldennutzung und Wiederholungsregeln. Drei frische Läufe je Stand bis 60 Minuten, mit gesonderter Auswertung des 30-Minuten-Präfixes. Daraus werden W20 und W30 tatsächlich erspielt und je sechs Rückkehrläufe über 30 Minuten gestartet. Keine geschenkten Türme oder vorgegebenen hohen Levels.

Zusätzlich für A/B jeweils die drei identischen W30-Zustände der Kontrolle als fester Verteidigungsvergleich, um die Wirkung neuer Ausgangslagen von der reinen Wellenänderung zu trennen. W20 muss zwischen Varianten ohnehin exakt übereinstimmen. Bei gemischt je Stand zehn Minuten sicheres Farmen gegen unmittelbare Fehlversuche ohne Käufe am ersten Verlust ab W26. Bei einem langen gemischten Stillstand wird die bereits vorhandene kleine Aufbauanpassung als Sensitivitätsprobe genutzt.

Jeder Lauf prüft verdientes Gold minus tatsächliche Käufe, Wiederherstellbarkeit und echte Farmnachweise. Die Originalquellen werden per Prüfsumme geschützt. Bounded deterministic simulation; keine behaupteten Nutzerdaten, perfekte Strategie oder Endlosbalance. Die resultierende Empfehlung bleibt ausdrücklich vorläufig bis zur gemeinsamen Entscheidung.
