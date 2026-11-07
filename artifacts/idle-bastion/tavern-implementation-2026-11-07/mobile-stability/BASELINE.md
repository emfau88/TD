# Mobile Tavernenflächen: reproduzierter Wechsel

Die erste Messung wurde am 07.11.2026 am aktuellen lokalen Tavernenstand (`http://127.0.0.1:5278`) mit der echten `TavernUI`, dem Video-Renderer und einer isolierten temporären Session durchgeführt. Mara mit 70 Zuneigung, 30 persönlichen Siegen, Kapitelgeschenk bereits verdient. Die Baseline verwendet die bestehende Standardsprache Englisch; der anschließende Regressionstest umfasst Deutsch und Englisch. Kein Nutzerspielstand wurde geöffnet.

| Viewport | Bühne normal | Persönlicher Moment 1/3 | Neue Begegnung mit Antwortwahl |
| --- | ---: | ---: | ---: |
| 390 × 844 | 421,531 px | 332,813 px | 272,094 px |
| 320 × 844 | 421,531 px | 332,813 px | 272,094 px |
| 390 × 650 | 259,438 px | 190,813 px | 151,813 px |
| 844 × 390 | 70,813 px | 84,813 px | 84,813 px |

Das äußere Dialogrechteck bleibt in allen Fällen unverändert. Im Hochformat wächst der Gesprächsbereich durch `tavern-rig.css` von `flex-basis: clamp(120px,18dvh,158px)` (Zeile 45 der geprüften Ausgangsfassung) auf `clamp(160px,32dvh,260px)` bei persönlichen Momenten (Zeile 91). Die Encounterregel in `tavern-ui.css` (Zeile 208) vergrößert ihn zusätzlich auf `clamp(180px,38dvh,330px)`. Gleichzeitig wechselt der untere Dockinhalt von drei Hauptaktionen (86,375 px im gemessenen Hochformat) zu den Storybuttons (67 px). Die flexible Bühne und dadurch die proportional gezeichnete Canvasfläche übernehmen die gesamte Höhendifferenz. Nach Weiter bis zum Ende oder Zurück springen beide auf die ursprüngliche Größe zurück. Querformat zeigt zusätzlich den Einfluss der verschiedenen Dockhöhen (+14 px Bühne bei Story).

`before/measurements.json` enthält alle Boundingrects von Dialog, Figur-/Textkörper, Bühne, Canvas, Gesprächsbereich und Dock für 52 Zustände. 28 davon weichen gegenüber dem jeweiligen Normalzustand um mehr als einen CSS-Pixel ab. `before/summary.json` fasst die Abweichungen zusammen. Die Baseline ist bewusst eine Fehleraufnahme, keine bestandene Stabilitätsprüfung.

Nach der Korrektur aus dem Hauptcheckout ausführen:

```powershell
node artifacts/idle-bastion/tavern-implementation-2026-11-07/mobile-stability/check-mobile-stability.mjs --verify
```

Der Test umfasst DE/EN, die vier Viewports, Momente 1 und 3, Weiter, Beenden, Zurück sowie neue Begegnung, beide Antwortziele nach lokalem Scrollen, gewählte Antwort und Abschluss. Im Hochformat müssen Dialog, Bühne, Canvas, Gesprächsbereich und Dock innerhalb eines CSS-Pixels unverändert bleiben. Das Querformat wird ebenfalls vermessen und auf bedienbare Antwortziele geprüft. Jeder Antwortbutton muss mindestens 44 px hoch, im scrollbaren Textbereich und Viewport erreichbar und am Mittelpunkt tatsächlich das getroffene Element sein. CSS-Hashes vor und nach einem Lauf verhindern eine vermeintliche Abnahme über mehrere währenddessen geänderte Quellstände.

Optionen: `STABILITY_ORIGIN` für einen anderen lokalen Quellserver, `STABILITY_PHASE` für den Ausgabeordner, `STABILITY_LANGUAGE=de` oder `en` für eine einzelne Sprache und `STABILITY_VIEWPORT=390x844` für ein einzelnes Format. Der Standardlauf ohne `--verify` dokumentiert Messwerte; mit `--verify` prüft er zusätzlich die stabile Hochformatgeometrie. Scrollgrenzen erlauben einen CSS-Pixel für die Rundung des ganzzahligen `scrollTop`; die tatsächliche Treffbarkeit des Buttons wird zusätzlich geprüft. Keine Produktionsdateien werden verändert. Die nachfolgende [Hauptspielprüfung](REPORT.md) erfasst außerdem das echte Touch-Querformat mit `landscape.css`.
