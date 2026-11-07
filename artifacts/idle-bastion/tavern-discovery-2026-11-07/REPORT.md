# Antworten sichtbar, neue Gespräche auffindbar

Gezielter Nachschliff auf Nutzerauftrag vom 07.11.2026, nach dem lesenden Branch-Review.

Bei der Antwortwahl stehen beide vollständigen Antworten jetzt direkt in der bestehenden unteren Aktionsleiste. Sie benötigen kein Scrollen und vergrößern die mobile Figurenfläche nicht. „Weiter zuhören“ bleibt bewusst als Alternative beim Gesprächtext, Zurück über den vorhandenen Kopf-Pfeil. Nach einer Antwort erscheinen wieder die üblichen Weiter-/Zurück-Schaltflächen und zum Gesprächsende die drei Hauptaktionen. Kein zusätzlicher Dialog oder Menüschritt.

Der bestehende Siedlungs-/Taverneneintrag zeigt „Neu“ und „Neues Gespräch“, sobald ein verfügbarer Gesprächseinstieg ungesehen ist. Die jeweiligen Figurenkarten nennen das neue Gespräch. Erst der tatsächliche Gesprächsstart beendet dessen Neu-Markierung; das bloße Öffnen der Taverne genügt nicht. Angefangene Inhalte heißen „Gespräch fortsetzen“ und bleiben nach Reload erreichbar. Erledigte Gespräche verschwinden aus den Hinweisen; ein bereits verfügbares zweites Gespräch wird anschließend neu angezeigt. Die Hinweise nutzen die vorhandenen gespeicherten Begegnungszustände, ohne neues Savefeld oder zusätzliche Fortschrittsregel.

## Gezielte Prüfung

- 14/14 Tests für Gesprächshinweise, bestehende Begegnungszustände/-texte und Geschenkstatus bestanden. Enthalten: eigene Siegeschwellen, getrennte Figuren, gesperrter Zugang, Wiederaufnahme, Folgegespräch, neutrale Beendigung und keine Belohnung durch Hinweise.
- TypeScript und Produktionsbuild mit beiden Tavernen-Vorschauflags bestanden.
- Acht echte Hauptspiel-Browserfälle: DE/EN × 320×650, 390×650, 1280×844 und Touch-Querformat 667×375. Je Fall beide Figuren und beide Begegnungen, insgesamt 32 Antwortauswahlen geprüft. Beide Buttons unmittelbar vollständig sichtbar, Text passt, echte Treffpunkte und mindestens 44 px Höhe. Auf Hochformatansichten bleibt die Bühne unverändert; kein Scrollen zur Antwortwahl.
- Tatsächlicher Weg über Siedlung → Taverne → Figur → Sprechen geprüft. Abbruch und Reload zeigen Fortsetzen, beide Antwortwege einschließlich bewusstem Weiterzuhören funktionieren, nach Abschluss aller Gespräche kein Gesprächs-Neu am Taverneneintrag. Keine JavaScriptfehler oder horizontalen Überläufe.
- Repräsentative echte Handyaufnahmen angesehen. Keine neue Medienproduktion; keine Behauptung einer physischen Geräteabnahme. Alte Prüfskripte unter `tavern-implementation-2026-11-07/` dokumentieren den damaligen Stand mit Antworten im scrollenden Text. Für den neuen Aufbau gilt `check-discovery.mjs` samt `local/results.json`.

## Öffentliche Prüfung

Als `f0709f85` unter demselben Testlink veröffentlicht; [Pages 42374351131](https://github.com/emfau88/TD/actions/runs/42374351131) erfolgreich. Öffentlich DE/EN bei 390×650 mit beiden Figuren und allen vier Begegnungen geprüft: acht Antwortauswahlen unmittelbar sichtbar, Fortsetzen/Reload und neutrale Beendigung korrekt. 721 Main-Dateien erhalten; menschliche Sichtabnahme bleibt offen.

Die öffentliche Versionskennung entspricht dem geprüften Codecommit `f0709f85600c0fdbaadb0452c61c62a0256432ed`; Main bleibt `daf39fb7b13a05a78530b503fa45074b5f65c9de`. Beide öffentlichen Hauptspielfälle einschließlich neuer/fortgesetzter/erledigter Hinweise bestanden ohne JavaScriptfehler oder horizontale Überläufe. [Messwerte](public/results.json), [Versionsnachweis](public-version.json), [Antwortwahl](public/de-390-mara-answers.png) und [Tavernenhinweis](public/de-390-notice.png). Die vollständige ältere 531-Test-Reihe wurde für diesen kleinen Nachschliff nicht wiederholt; maßgeblich sind die oben genannten 14 gezielten Tests und der aktuelle Build.
