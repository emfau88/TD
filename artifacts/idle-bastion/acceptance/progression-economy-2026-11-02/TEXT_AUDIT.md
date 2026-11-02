# Gold, Progression und Spielertexte · Abschlussprüfung 02.11.2026

**Nachtrag:** Die nachfolgend dokumentierten Textempfehlungen wurden anschließend ausdrücklich beauftragt und lokal umgesetzt. [Umsetzung, neue Prüfergebnisse und vertiefte Wellenempfehlung](TEXT_UPDATE_AND_WAVES.md). Dieser Audit hält den zuvor geprüften Zustand fest.

**Urteil:** Die umgesetzte Goldkorrektur wirkt in den geprüften Szenarien wie vorgesehen. Wisp, Vorratslager und Rückkehrabrechnung verwenden passende Werte. Der Textstand ist jedoch noch nicht vollständig bereinigt: Ein alter Hinweis nennt vier statt fünf Turmtypen; die Erklärung des Wiederholungs-Goldes sollte an der ersten Niederlage deutlicher werden. Ein weiterer pauschaler Eingriff in Gold, Gegner oder Türme ist durch diese Prüfung nicht begründet.

Geprüft wurde der **lokale Umsetzungskandidat** im abgelösten Worktree `progression-economy`, Basis `main` / `80a5a1d`. Keine Aussage über eine bereits veröffentlichte Fassung: Es gab keinen Commit, Push oder Deployment. In dieser Nachprüfung wurden nur Analyseartefakte und die Roadmap ergänzt, keine Spielquellen geändert.

## Umfang und Nachweise

- Alle **111 TypeScript-Dateien unter `src` und 20 HTML-Seiten** inventarisiert; wirtschaftsbezogene Texte anschließend nach tatsächlicher Verwendung eingeordnet. 670 Fundstellen / 458 unterschiedliche Texte schließen Übersetzungen, Laborseiten und unbenutzte Einträge ein und sind deshalb keine Zahl sichtbarer Spielmeldungen. [Inventar samt Quellenprüfsummen](copy-inventory.json), [lesbare Fundstellen](copy-inventory.txt), [kleiner Analyseschritt](audit-copy.ts).
- Wisp-Einführung und Status, Vorratslager einschließlich Vorschau, Farmanzeige, Niederlage, Chronik, Bossprämien, Rückkehr und Claim, Tutorial, Kauf-/Ausbauangaben sowie beide Tavernen-Dialogsammlungen gelesen. Deutsche Texte, englische Zuordnung und dynamische Werte abgeglichen. Keine vollständige neue visuelle Abnahme jedes Dialogzustands behauptet.
- **183 relevante direkt übersetzte Texte besitzen englische Einträge**; keine fehlenden Schlüssel in dieser Auswahl. DOM-Sprachumschaltung, tatsächliche Offline-Konstanten, Wisp-/Wiederholungskombination und Preise abgeglichen. [Werte und gerenderte Beispiele](copy-values.json), [Prüfskript](audit-copy-values.ts).
- **22/22 gezielte Tests bestanden:** Sprachumschaltung, Tutorialführung, Offline-Rückkehr und Belohnungsanzeige. [Neues Protokoll](copy-tests.txt).
- Die vorherigen **460/460 Gesamttests**, Produktionsbuild, 16 integrierten Simulationsläufe, 24 Abwesenheitsvergleiche sowie Desktop-/Mobilbrowserprüfungen sind im [Umsetzungsbericht](REPORT.md) dokumentiert. Sie wurden hier nicht als neue vollständige Testläufe ausgegeben. [Quellvergleich nach dieser Prüfung](copy-source-verification.json).

## Abgleich mit dem tatsächlichen Verhalten

| Stelle | Ergebnis |
|---|---|
| Wisp | **Korrekt:** dauerhaft +10 % gewöhnliches Kampf-Gold, bereits in der Farmbasis enthalten. Kein Bonus auf Verkäufe oder einmalige Bossprämien. Aus 100 Basisgold werden mit Wisp 110; bei einer bekannten Welle 11. Die beiden 10-%-Angaben bedeuten unterschiedliche Dinge. [Panel](../../../../experiments/idle-bastion/index.html), [Status und Einführung](../../../../experiments/idle-bastion/src/main.ts) |
| Vorratslager / Lagerhinweise | **Korrekt:** neue Abreisen ohne Lager 24 % / höchstens 2 Stunden, mit Lager 26 % / höchstens 8 Stunden; Baupreis 650 Gold. Vorschau verwendet die aktuellen Konstanten und berücksichtigt Pause. [Lagerdarstellung](../../../../experiments/idle-bastion/src/main.ts), [Hinweise](../../../../experiments/idle-bastion/src/hud.ts), [Einführung](../../../../experiments/idle-bastion/src/discovery-ui.ts) |
| Rückkehr / Abrechnung | **Korrekt:** gespeicherte Abreisebedingungen werden angezeigt und genau einmal abgerechnet. Ein alter Anspruch darf deshalb noch 60/65 % zeigen und deutlich mehr zahlen. Das ist Bestandsschutz, kein vergessenes neues Tarif-Schild. Neue Abreisen verwenden 24/26 %. [Anzeige](../../../../experiments/idle-bastion/src/main.ts), [Abrechnung](../../../../experiments/idle-bastion/src/offline.ts) |
| Farmen / Chronik / Niederlage | **Regel richtig, Erklärung zu versteckt:** Die Chronik nennt 10 % für gemeisterte Wellen. Die Meldungen beim Scheitern und Wechsel zum Farmen erklären diesen starken Einkommenswechsel nicht. Noch nicht geschaffte Wellen zahlen auch bei wiederholten Fehlversuchen voll. [Chronik und Rückzug](../../../../experiments/idle-bastion/src/progress-ui.ts), [Meldungsauswahl](../../../../experiments/idle-bastion/src/main.ts) |
| Boss- und Wachstumstext | Erstprämien 750/1.200 Gold und spätere 10-%-Belohnung stimmen. Der daneben stehende pauschale Satz „danach pro Welle um 12 Prozentpunkte“ vereinfacht spätere Modifikatoren und erklärt Wiederholungen nicht. Beispiel ohne Wisp, Basis 100: W16 → 200, W20 → 248, W21 → 258, später 384. „Höchstens vierfach“ bleibt als Obergrenze richtig. [Chronik, Zeile 127](../../../../experiments/idle-bastion/index.html) |
| Turmhinweis | **Tatsächlich veraltet:** „Alle vier Turmtypen treffen auch Flieger.“ Es gibt fünf. Englisch sagt bereits korrekt „All tower types“. Empfohlen: „Alle Turmtypen treffen auch Flieger.“ Dieser Alttext wurde nicht durch die Goldänderung verursacht. [Zeile 130](../../../../experiments/idle-bastion/index.html) |
| Baukosten, Anleitung und Tavernen-Dialogtexte | Kein weiterer belegter Widerspruch zu den Wirtschaftsänderungen gefunden. Die Turm- und Upgradepreise wurden nicht geändert. Ein alter englischer Frostbau-Schlüssel mit 110 Gold ist unbenutzt; der aktuelle Einführungsablauf berücksichtigt den kostenlosen ersten Frostbau. |

**Keine stehengebliebenen festen 60-/65-%-Offlineangaben in den untersuchten Spielertexten gefunden.** Alte Migrationskonstanten, historische Dokumentation und Zahlen für andere Mechaniken sind keine veralteten aktuellen Hinweise. Ein zunächst verdächtiger Rundungszweig für Kampfmeldungen ist durch die aktuelle Ereignisauswahl nicht erreichbar; daraus wird kein sichtbarer Fehler abgeleitet. Die Offlineanzeige berücksichtigt kleine und gebrochene Goldbeträge bereits.

## Bewertung der Goldanpassung

**🟢 Offline-Wirtschaft im geprüften Bereich:** Bei gleicher Verteidigung zahlt eine neue Abreise jetzt **96 % weniger** als vorher. Mit Lager ergeben 24 Stunden in den sechs erspielten W20-/W30-Ausgangslagen **24.886–47.358 Gold**; acht Stunden zahlen identisch viel. Das sind 26 % von acht Stunden geprüfter Farmleistung, also ungefähr **2 Stunden 5 Minuten** dieser Farmleistung. Die absolute Goldzahl allein sagt wenig aus, weil spätere Ausbauten entsprechend teuer sind.

**🟢 Erneute Herausforderung bleibt erhalten:** Nach Rückkehr, sinnvoller Goldausgabe und weiteren regelmäßigen Käufen entsteht der erste deutliche Druck nach **4,8–10,4 Minuten**, erste Niederlagen bei W44–46. Beim frischen Einstieg haben alle drei Profile innerhalb von 30 Minuten deutlichen Druck und eine Niederlage erlebt. Erster Druck nach 4,1 / 13,5 / 15,0 Minuten, erste Niederlage bei W15 / W40 / W40. Die Änderungen machen aktive Fortschrittswellen nicht automatisch schwerer; sie begrenzen vor allem wiederholbare Ressourcen.

**🟡 Spielgefühl noch prüfen:** Nach W20 bleiben bis zu 19 weitere geschaffte Wellen vor dem nächsten deutlichen Druck. Das entspricht hier rund 8–10 Minuten Überlegenheit. Für ein Idle-Spiel kann das eine angenehme Rückkehrbelohnung sein; wer sofort wieder schwierige Entscheidungen erwartet, könnte es lang finden. Niederlagen und anschließendes Farmen sind ausdrücklich gewollt und allein kein Fehler.

Die drei Profile sind feste plausible Kauf-/Platzierungsregeln, keine repräsentative Nutzerstudie. „Deutlicher Druck“ bedeutet in diesen Vergleichen mindestens fünf verlorene Kernleben; Gegnernähe, subjektive Spannung und menschliche Denkpausen sind damit nicht vollständig erfasst. Die gemessene Wellenreichweite enthält vorhandene Stärke und aktives Einkommen, nicht nur Offline-Gold. Kein Nachweis perfekter Endlosbalance oder aller denkbaren Strategien.

## Gezielte Empfehlungen

| Priorität / Art | Problem und vorgeschlagene Lösung | Nutzen / Aufwand |
|---|---|---|
| 1 · Erklärung vor Release vervollständigen | In den bestehenden Hinweis beim ersten Wechsel zum Farmen aufnehmen: „Bereits geschaffte Wellen bringen beim Farmen 10 % Gold. Baue deine Verteidigung aus und starte danach erneut einen Vorstoß.“ In der Chronik „Neue Wellen“ durch „Noch nicht geschaffte Wellen“ präzisieren. | Verhindert den Eindruck plötzlich fehlerhafter Einnahmen; kleiner DE/EN-Textabgleich, kein neues Fenster oder System. |
| 2 · Notwendige kleine Textkorrektur | „Alle vier Turmtypen“ durch „Alle Turmtypen“ ersetzen. | Beseitigt belegte Falschinformation; sehr geringer Aufwand. |
| 3 · Empfohlene Vereinfachung | Den technischen Wachstumssatz durch eine verständliche Erklärung ersetzen: Fortschrittswellen bringen den vollen, später höheren Ertrag; bekannte Wellen 10 %; Wisp ist bereits eingerechnet. | Vermeidet ungenaue Zahlenregeln und erklärt die relevante Spielerentscheidung; geringer Aufwand. |
| 4 · Optionaler Migrationshinweis | Bei einem alten Anspruch im vorhandenen Rückkehrtext ergänzen: „Diese Abwesenheit wird noch nach den früheren Regeln vergütet.“ | Erklärt einmalig hohe Altzahlungen und 65 % im Beleg neben 26 % im Lager; kleiner bedingter DE/EN-Text. Keine Kürzung alter Ansprüche. |

**Weiteres Vorgehen:** Diese kleinen Textpunkte bereinigen, danach ein kurzer menschlicher Spieltest mit frischem Einstieg und einer vorbereiteten Rückkehr. Entscheidend ist, ob sich 5–10 Minuten Überlegenheit sowie die spätere Erholung angenehm anfühlen. Eine weitere Goldkürzung oder ein Wellen-/Turm-Rework ist derzeit nicht ausreichend begründet. Für den ersten Release ist der lokale Wirtschaftskandidat aus technischer und simulierter Progressionssicht grundsätzlich geeignet; die subjektive Spielgefühl-Abnahme bleibt offen.

Reproduktion dieser Nachprüfung aus dem Worktree:

```powershell
node --import tsx artifacts/idle-bastion/acceptance/progression-economy-2026-11-02/audit-copy.ts
node --import tsx artifacts/idle-bastion/acceptance/progression-economy-2026-11-02/audit-copy-values.ts
node --import tsx --test experiments/idle-bastion/tests/i18n.test.ts experiments/idle-bastion/tests/tutorial-guide.test.ts experiments/idle-bastion/tests/offline-welcome.test.ts experiments/idle-bastion/tests/reward-display.test.ts
```
