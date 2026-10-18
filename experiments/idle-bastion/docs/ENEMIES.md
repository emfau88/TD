# Vorhandene Gegner im Idle-Spiel

Die Idle-Werte und Rollen liegen in `src/enemy-roster.ts`, die gemessenen Originalanimationen in `src/enemy-art.ts`. Das klassische Spiel wird nicht verändert. Keine neuen Bildgenerierungen für dieses Paket.

| Erste Welle | Figur / Originalasset | Rolle und Gegenmittel |
| --- | --- | --- |
| 1 | Blattkäfer / Leafbug | Grundgegner; Waldwächter und Fläche |
| 4 | Feuerkäfer / Firebug | Zügiger; Frost schafft mehr Schusszeit |
| 6 | Flugheuschrecke / Flying Locust | Schneller leichter Schwarm; Frost und Fläche |
| 9 | Feuerwespe / Firewasp | Sehr schneller Durchbrecher; überlappende Schussbereiche |
| 11 | Panzerskorpion / Scorpion | 45 % Rüstung; Scharfschütze |
| 13 | Magmakrabbe / Magma Crab | Langsam, viele HP, 25 % Rüstung; Durchdringung und Direktschaden |
| 15 / 25 | Rosenspiegel / Succubus Pixel v2 | Bestehende Bossbegegnungen; Frost unterbricht Turmverführung |
| 17 | Panzerflieger / Clampbeetle | Bewegliche 30-%-Rüstung; Scharfschütze und Frost |
| 21 | Laternenqualle / Lantern Jelly Pixel v1 | Heilt verwundete Begleiter; Flächendruck |
| 28 | Leerenfalter / Voidbutterfly | Schnell, Frost bremst nur um 20 %; Direktschaden |

## Begegnungen und Verständlichkeit

Die ersten fünf Wellen sowie die beiden Bossrezepte behalten ihre Zusammensetzung. Jede neue normale Art wird zunächst mit zwei Exemplaren zwischen bekannten Gegnern vorgestellt. Dazwischen und danach wechseln vier feste Gruppenmuster: Schwarm, Tempo, Panzer, Unterstützung. Noch nicht eingeführte Arten werden durch bekannte Gegner ersetzt. Maximal 28 Gegner und höchstens zwei Quallen pro Welle; keine wachsenden Listen oder Zufallswürfe beim Laden. Spätere Wellen behalten die vorhandene begrenzte HP-Skalierung.

Alle vier Turmtypen treffen Flieger mit denselben Reichweiten und Effekten. Flieger folgen dem bestehenden Weg. Eine kleine vertikale Schwebebewegung und der getrennte Bodenschatten machen ihren Flug sichtbar; keine neue Luftabwehrpflicht.

Kurze Einführungsmeldungen erscheinen beim Vorstoß. Die Chronik zeigt vollständige Wellenzusammensetzung, nächsten neuen Typ und einklappbare Rollen/Gegenmittel. Das HUD erhält keine zusätzliche Daueranzeige. Bereits weit fortgeschrittene Spielstände können diese Informationen ebenfalls in der Chronik lesen.

Die Qualle pausiert 0,4 Sekunden zum Heilen und verwendet ihre vier vorhandenen Heilbilder. Am Ende heilen bis zu zwei lebende, verwundete Begleiter innerhalb von 100 Weltpixeln um 6 % ihrer maximalen HP. Frühestens alle drei Sekunden; keine Selbst-, Quallen- oder Bossheilung. Zwei Sekunden Sperre pro geheiltem Ziel verhindern Stapeln. Tödliche Treffer werden vor dem Heilimpuls verarbeitet. Grüne Lichtzeichen markieren die tatsächlich geheilten Ziele. Alle Timer und Effekte folgen der pausierbaren Simulationszeit.

## Grafikvertrag

Foozle/Baldur: vorhandene CC0-Boden- und Fluggegnerpakete, PNGs unter `public/assets/`, logische Tags und physische Zellen aus `public/assets/manifest.json`. Frame-Maps und originale Bilddauern explizit übernehmen, niemals logische Indizes für physische Atlaszellen halten. Bewegung: je acht Bilder in drei Richtungen; Leerenfalter je vier Bilder aus dem zweiten, im Original ebenfalls „Idle“ genannten Tagblock. „Walk“ der Krabbe wird als Bewegung verwendet.

Skorpion, Krabbe und Panzerflieger blicken im Seitenatlas nach links; Feuerwespe, Heuschrecke und Falter nach rechts. Bei der Wespe liegt der gestreifte spitze Hinterleib links, der Kopf mit dunklen Fühlern rechts. Maßstab 0,83; Feuerwespe 0,65 bei 96er statt 64er Frames. Bestehende Blatt-/Feuerkäfer behalten ihre jeweiligen Framegrößen. Alle Richtungen bleiben in ihrer Originalpalette.

Die Laternenqualle nutzt den bestehenden 64er Atlas und unveränderten Framevertrag aus `reference/src/jelly-art.ts`: 6 Laufbilder, 4 Heilbilder, 100 ms/Bild. Quelle und Produktionsnachweis: `artifacts/enemies/lantern-jelly/v1/REPORT.md`. Rosenspiegels Körper-/Tanzdarstellung bleibt unverändert.

## Speicher- und Balancegrenzen

Schema 13 / Kampfregeln 9. Historische Formate werden zuerst unter ihren bisherigen Regeln validiert. Laufende alte Wellen behalten Gegner, Spawnfolge, Geschosse und Belohnungen; erst der nächste Versuch nutzt neue Rezepte. Alte aktuelle Farmnachweise verfallen; neue werden erneut ohne Mara nachgewiesen. Historische Offline-Ansprüche bleiben erhalten. Die drei Heil-Timer werden exakt gespeichert. Abgeleitete HP/Schusswerte erlauben ausschließlich wenige Maschinenrundungsschritte zwischen JS-Laufzeiten; gespeicherte Werte werden nicht verändert.

Diese Erweiterung schafft neun normale Gegnertypen und wiederkehrende taktische Unterschiede. Eine ausgeglichene unendliche Progression oder neue Endspielmechanik wird damit nicht behauptet. Gesamtes Tempo und erreichbare Ausbaustufen bleiben Gegenstand von B13. Ein standardisierter Produktionsablauf für ganz neue Gegner ist B12d in der Roadmap, noch keine neue Bildserie.
