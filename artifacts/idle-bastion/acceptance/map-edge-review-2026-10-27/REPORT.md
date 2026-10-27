# Kartenrand – reine Prüfung vom 27.10.2026

Auftrag: linken Spawn-Rand prüfen und Screenshots zeigen; kein Karten-/Kamerafix. Kontrolliert im gebauten aktuellen Produktionspaket, frische isolierte Partien, Desktop 1440×900 und Hochkant 390×900, deutscher Text, keine Seitenfehler.

Im Intro-Schritt „Der Weg zum Kern“ schließt die Karte links sauber ab. Nach dem Intro (Einführung 4/14, erster Turmbau) zeigt die Hochkantansicht links etwa 16 Bildschirm-Pixel dunkelgrünen Hintergrund; nach Ziehen Richtung linkem Rand etwa 32 Pixel. Der Weg beginnt sichtbar erst rechts neben dem Streifen. Desktop 1440×900 blieb in dieser Probe links sauber. Die Kartenübersicht zeigt außerdem auf Hochkant viel untexturierten Hintergrund über/unter der verkleinerten Gesamtkarte.

Quellbefund: `battle-scene.ts:324` / fitCameraBounds erlaubt im fokussierten Hochkant-Tutorial weiterhin padX=40 Weltpixel und setzt negative linke Grenzen. Vertikal bleibt ebenfalls zusätzlicher Spielraum. `main.ts:939` verwendet als Rendererhintergrund #183424. Der frühere spezielle Intro-Fix in frameIntro (ab Zeile 406, ursprünglicher Commit 56c59d3) ist weiterhin vorhanden. Die Tavernenänderung hat keine Kamera-/Kartenquelle geändert. Es handelt sich um zwei unterschiedliche Kamerapfade; eine allgemeine Rücknahme des alten Intro-Fixes wurde nicht gefunden.

Screenshots: intro-spawn-390.png (sauberer Intro-Rand), after-intro-390.png (Streifen direkt danach), spawn-left-390.png (breiter nach Ziehen), spawn-left-1440-detail.png (Desktop-Vergleich). Aufnahme ausschließlich über normale Spieloberfläche; keine Bildbearbeitung. Kein Fix durchgeführt. Erst ein weiterer Umsetzungsauftrag würde Kameragrenzen/Übersichtsfüllung verändern.
