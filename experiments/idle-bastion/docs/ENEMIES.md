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
| 15 / 25 | Rosenspiegel / Succubus Pixel v2 | Bestehende Bossbegegnungen; Frost verlangsamt Turmverführung |
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

Aktuell Schema 14 / Kampfregeln 10 (B13); die Einführung der zusätzlichen Arten erfolgte mit Schema 13 / Regeln 9. Historische Formate werden zuerst unter ihren bisherigen Regeln validiert. Laufende alte Wellen behalten Gegner, Spawnfolge, Geschosse und Belohnungen; erst der nächste Versuch nutzt neue Rezepte. Alte aktuelle Farmnachweise verfallen; neue werden erneut ohne Mara nachgewiesen. Historische Offline-Ansprüche bleiben erhalten. Die drei Heil-Timer werden exakt gespeichert. Abgeleitete HP/Schusswerte erlauben ausschließlich wenige Maschinenrundungsschritte zwischen JS-Laufzeiten; gespeicherte Werte werden nicht verändert.

Diese Erweiterung schafft neun normale Gegnertypen und wiederkehrende taktische Unterschiede. Eine ausgeglichene unendliche Progression oder neue Endspielmechanik wird damit nicht behauptet. B13 stimmt HP und wiederholbares Gold ab Welle 16 auf diesen Kader ab; Arten, Rüstung, Tempo und Heilung behalten ihre Rollen. [Messungen und Grenzen](../../../artifacts/idle-bastion/acceptance/15min/REPORT.md). Ein standardisierter Produktionsablauf für ganz neue Gegner ist B12d in der Roadmap, noch keine neue Bildserie.

## Vorschlag: drei weitere Einheiten

Entwurf vom 19.10.2026, noch keine Bildproduktion oder neue Kampfregel. Der aktuelle Bestand oben ist vollständig: neun normale Arten und eine Bossfigur. Zusätzliche Silhouetten sollen den stark von Insekten geprägten Kader ergänzen. Zwei Einheiten verwenden vorhandene Kampfregeln; nur die dritte erhält eine neue Fähigkeit.

| Reihenfolge | Einheit | Erkennbare Form / Rolle | Aufwand und Gegenmittel |
| --- | --- | --- | --- |
| 1 | Mooskröte | Breiter, moosgrüner Körper, langsamer kurzer Hüpfzyklus; viele HP, keine Rüstung | Geringer Mechanikaufwand; Frost verlängert das Schussfenster, Waldwächter liefern Dauerschaden. Kein Springen über Wegabschnitte. |
| 2 | Runenschnecke | Große ockergraue Spiralschale, kleiner dunkler Körper; sehr langsam, stark gepanzert | Geringer Mechanikaufwand; vorhandene Rüstung und Scharfschützen-Durchdringung nutzen. Keine zusätzliche Schildleiste. Visuelle Abwechslung einer bekannten Rolle. |
| 3 | Wurzeltrommler | Kleines zweibeiniges Wurzelwesen mit heller Trommel; begleitet Gruppen | Mittlerer Aufwand; kurzer angekündigter Tempoimpuls für wenige nahe Begleiter. Nicht stapelbar, keine Selbst-/Bossverstärkung; sichtbare Zielzeichen und gespeicherte Timer. Frost/Fläche helfen gegen die beschleunigte Gruppe. |

Der Trommler greift eine vorhandene Motividee aus dem [älteren Produktionsplan](../../../GEGNER_PRODUKTIONSPLAN.md) auf; Altbilder sind Entwürfe, keine fertigen Laufzeitsprites. Frostwidder und Sternenrichter bleiben spätere Optionen. Einführungswellen und Werte erst anhand der erweiterten Progression abstimmen; nicht drei neue Sonderregeln in die ersten 15 Minuten drücken.

### Schlanker gemeinsamer Produktionsablauf

1. **Steckbrief:** Rolle, drei Ansichten (unten/oben/seitlich), eindeutige Blickrichtung, Körpergröße, Palette und Bezugspunkt festlegen. Original-Blattkäfer, Skorpion und aktueller Wald sind Stilreferenzen. 64 × 64 Laufzeitframes, echte Transparenz, harte Pixelgruppen; Maßstab um 0,83 als Ausgangspunkt. Keine gemalten Hintergründe oder Beschriftungen im Atlas.
2. **Eine Referenzpose plus Seitenzyklus:** Imagegen für konsistente Entwürfe und kurze Sequenzen nutzen. Zuerst eine Einheit, zunächst nur sechs seitliche Bewegungsbilder. Neben Originalen in echter Spielgröße prüfen: Volumen, Bodenkontakt, erkennbare Bewegung, Übergang letztes/erstes Bild. Kein vollständiges Großsheet auf Verdacht.
3. **Nur benötigte Zustände:** Danach je sechs Bewegungsbilder oben/unten ergänzen; Gegenseite spiegeln. Das ergibt zunächst 18 verschiedene Bilder pro normaler Einheit. Ruhe kann die erste Pose verwenden. Der aktuelle Idle-Renderer benötigt keine eigene Angriffs-/Todessequenz; solche Bilder erst mit einem sichtbaren Verwendungszweck produzieren. Beim Trommler zusätzlich vier Aktionsbilder je Ansicht, also 30 Bilder insgesamt. Zielbudget für alle drei: 66 unterschiedliche Posen, keine Zusage von 66 separaten Generierungen.
4. **Deterministischer Import:** `scripts/pixel-atlas.mjs` und die Quallenaufbereitung als Grundlage eines gemeinsamen datengetriebenen Packers nutzen. Pro Einheit nur Konfiguration mit gemessenen Ausschnitten, einheitlichem Anker, Blickrichtung, Palette, Framefolge, Dauer und Aktionszeitpunkt. Einheitlich skalieren, niemals jede Pose individuell passend strecken; Nearest-Neighbor, keine weichen Skalierfilter. Rohbilder und Prompts erhalten.
5. **Eine gemeinsame Probe:** Bestehende Gegnerprobe um die Datenkonfiguration ergänzen. Alle Richtungen auf einer Strecke mit Kurven, Einzelbildansicht und Originalvergleich; Vorder-/Rückseite wirklich zeichnen. Bodenanker bleibt stabil, Hoppen wird nicht doppelt im Sprite und Renderer hinzugefügt.
6. **Kompakte Freigabe zur Integration:** Ein automatischer Atlascheck (Maße, Alpha, gültige Frame-Maps/Anker), ein kurzer Sichtcheck in Desktop und Hochkant. Für die neue Trommlermechanik zusätzlich Pause/Reload, Stapelgrenze und Wirkung prüfen. Zuerst zwei Exemplare zwischen bekannten Gegnern einführen; danach gemischte Wellen.

Der gemeinsame Packer und die gemeinsame Vorschau sind noch zu standardisieren. Die Vorarbeiten existieren bereits; künstlerisch konsistente Bewegung bleibt der Teil, der gezielte Nacharbeit benötigt. Nach zwei misslungenen Versuchen denselben Entwurf vereinfachen oder gute Frames bearbeiten, keine endlose Promptserie. Erst die Mooskröte als Pilot fertigstellen, dann dieselben Werkzeuge für Schnecke und Trommler verwenden.
