# Zwölf bekannte Testfehler bei der Farmprüfung

Die aktuelle Matrix hat 155 Tests: 143 bestanden, zwölf fehlgeschlagen. Kein neuer Fehlername gegenüber dem geprüften Ausgangsstand.

## Die bisherigen neun Fehler

- bundled B05 atlases retain original dimensions and logical enemy frame maps
- the real idle route uses the accepted connecting source quadrants for each turn and straight segment
- snapshot v1 migration retains combat exactly and invents neither a certificate nor live-clear history
- real v14 veteran and its historical offline basis survive the schema-only migration
- schema 15 saves preserve preparation and completed play without forcing the extended lessons
- intro command waits for a background write, then rechecks and consumes the kit once
- envelope one migrates read-only without production evidence and retains CAS revision protection
- battle schema two migrates without rewriting the historical absence proof or pending receipt
- session return across the Mara rule update pays the historical rate once and starts with no invented current proof

## Drei zusätzlich einbezogene Ilyra-Altfälle

Diese drei Tests scheitern identisch auf dem unveränderten main-Ausgangspunkt. [Separater Baseline-Lauf](../b16/baseline-ilyra.txt).

- free conscious recruitment preserves veteran saves and rejects repeats; core settlement also supports it
- saved windup and flight hit once, reward ground/air kills once, and reject forged damage
- slower volleys remain in flight at the old hit time; legacy saves finish once at their old pace

[Aktuelle vollständige Ausgabe](regressions.txt). Keine alten Fehler durch abgeschwächte Assertionen verdeckt. Die angepassten Migrationstests prüfen alle bisherigen Siedlungsfelder weiterhin exakt und zusätzlich stormResearched=false. Die neun neuen B16-Tests bestehen vollständig.
