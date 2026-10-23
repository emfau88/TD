# Neun bereits bekannte Testfehler

Die Abschlussmatrix hat **131 Tests, 122 bestanden, neun fehlgeschlagen**.
Dieselben neun Testnamen scheiterten bereits vor dieser Merge-Vorbereitung
(117/126) und auf dem unveränderten Wave-Rework-Ausgangsstand (110/119).
Keine neuen Fehler und keine abgeschwächten Assertionen. Der Gesamtstatus ist
damit ausdrücklich nicht vollständig grün.

| Bereich | Unveränderter fehlgeschlagener Testname |
| --- | --- |
| Grafikfixture | bundled B05 atlases retain original dimensions and logical enemy frame maps |
| Wegfixture | the real idle route uses the accepted connecting source quadrants for each turn and straight segment |
| altes v1-Farmfixture | snapshot v1 migration retains combat exactly and invents neither a certificate nor live-clear history |
| Onboarding / v14 | real v14 veteran and its historical offline basis survive the schema-only migration |
| Onboarding / v15 | schema 15 saves preserve preparation and completed play without forcing the extended lessons |
| Onboarding / asynchroner Bausatz | intro command waits for a background write, then rechecks and consumes the kit once |
| Save-Store / Envelope 1 | envelope one migrates read-only without production evidence and retains CAS revision protection |
| Save-Store / Battle 2 | battle schema two migrates without rewriting the historical absence proof or pending receipt |
| Save-Store / historische Mara-Rückkehr | session return across the Mara rule update pays the historical rate once and starts with no invented current proof |

Diese historischen Fixtures werden in diesem begrenzten Auftrag nicht repariert.
Aktuelle Schema-27/28-Kämpfe, Farmnachweise, manipulierte Daten und einmalige alte
Offline-Auszahlungen werden zusätzlich mit konkreten neuen Regressionen geprüft.

[Aktuelle vollständige Ausgabe](focused-tests.txt) ·
[Ausgangsstand vor Gegnerintegration](../baseline-tests.txt) ·
[Matrix vor dieser Merge-Vorbereitung](../focused-tests.txt) ·
[Maschinenlesbarer Vergleich](verification-summary.json).
