# Arbeitsregeln für Idle Bastion

1. Vor Änderungen `README.md`, `ROADMAP.md` und die zur Aufgabe passende Datei unter `docs/` lesen.
2. Die Umsetzung wurde mit B01 ausdrücklich gestartet; anschließend wurde B02 beauftragt. Aktuelles Paket, Ergebnisse und weitere Freigaben stehen in der Roadmap. Die 90-Sekunden-Abnahme bleibt verbindlich.
3. Nur auf `codex/idle-bastion-vertical-slice` im zugehörigen Worktree arbeiten. `main`, das klassische Spiel und seine Spielstände schützen. Kein eigenmächtiger Push, Merge oder Deployment.
4. Nach Umsetzungsstart P1 und P2 selbstständig bearbeiten; dann bei **G1 / 90-Sekunden-Zwischenabnahme** anhalten. Erst ausdrückliche Nutzerfreigabe erlaubt P3 und folgende. Verstrichene Zeit, technische Tests oder eigene Begeisterung sind keine Freigabe.
5. P2 umfasst die erste Werkstatt und erste Technologie. Wisp, Lager, Boss, Kartenerweiterung und deren Assets nicht vor G1 ausarbeiten. Generische Datenfelder sind Vorbereitung, kein vorgezogener Funktionsausbau.
6. Kein neuer Haltepunkt für gewöhnliche reversible Detailentscheidungen. Innerhalb einer autorisierten Phase selbstständig arbeiten. Bei Enginewechsel, gefährlicher Änderung des klassischen Spiels oder grundlegender Abweichung vom Umfang zuerst das konkrete Problem erläutern.
7. Bestehende Pixelart und `reference/STYLE_GUIDE.md` bestimmen den Maßstab. Mockups unter `docs/references/` sind Kompositionsideen, keine zusätzlichen Features oder fertigen Atlanten.
8. Nur unmittelbar benötigte Gebäudeassets erzeugen; zuerst Bedarf, Maße und Originalreferenzen festlegen, dann im echten Spielmaßstab prüfen. Keine Bilder oder Umsetzungen in dieser Planungsphase generieren.
9. Paketstatus, Arbeitschecklisten und Freigaben ausschließlich in `ROADMAP.md` pflegen. Ein Paket nur mit geprüftem Ergebnis abschließen; Nachweise in phasenbezogenen Berichten verlinken, keine Tests oder Nutzerabnahmen erfinden.
10. Im neuen Worktree können ignorierte Abhängigkeiten/Builds fehlen. Setup bei Umsetzungsbeginn prüfen. `scripts/reference.mjs` bereitet vor jedem Modus Assets neu auf; `reference:test` ist deshalb keine rein lesende Bestandsprüfung.
11. Die Roadmap gliedert P1–P5 in B01–B14. Voraussetzungen beachten, gewöhnliche Pakete ohne neue Einzelabnahme nacheinander bearbeiten; G1 sperrt B08–B14 bis zur ausdrücklichen Nutzerfreigabe. Nach Unterbrechung beim nächsten offenen Schritt des aktuellen Pakets fortsetzen.
