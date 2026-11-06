# Drei Creeps: frühe Vielfalt und Balance

06.11.2026 · Ausgangsstand `57555d3`, Regeln 20 / Schema 36.
Umsetzung: Regeln 21 / Schema 37. Commit und Push anschließend ausdrücklich beauftragt;
aktueller Veröffentlichungsstand ausschließlich in der Roadmap.

## Ergebnis

**Mehr erkennbare Figuren, weitgehend gleiche Progression.** Kobaltschleim ab
W3, Flammengeist ab W7, schwebendes Auge ab W12. Zunächst jeweils zwei Exemplare,
danach wiederkehrende Mischungen. Der Schleim ist ein etwas zäherer, langsamer
Bodengegner; Flammengeist ein schneller Flieger, Auge ein langsamerer Flieger
mit mehr HP. Keine neuen Spezialfähigkeiten.

| W1–20 | Vorher | Jetzt |
| --- | ---: | ---: |
| Gegner insgesamt | 293 | 293 |
| Verschiedene Figuren einschließlich Boss | 9 | 12 |
| Anteil Blattkäfer/Feuerkäfer/Flugheuschrecke | 82,9 % | 48,5 % |
| Mittlere Artenzahl je Welle | 2,50 | 2,75 |

Meist zwei bis drei Arten; W12 und W20 vier normale Arten, W15 vier einschließlich
Boss. W1/2 bleiben unverändert. Alle Boss- und Elitebegegnungen bleiben erhalten.
Ab W26 wiederholen sich die neuen Begleiter ebenfalls; Flammengeist ersetzt dort
ausschließlich vorhandene Flieger. Boden-/Luftanteil, Heilerplätze, Gegnerzahl,
Spawnzeiten und die bisherige nominale Druckkurve bleiben dadurch erhalten.

Turm-/Heldenwerte, Preise, allgemeine HP-Kurve, Farmquoten und Offlinecaps wurden
nicht verändert. Basisgoldbudget jeder Welle bleibt exakt gleich. Bestehende
Rundung pro Abschuss/Abschluss bewirkt in W1–250 maximal **0,612 %** Unterschied
in der tatsächlichen Vollauszahlung: größter Betrag relativ auf W28,
1.430 statt 1.438,8 mit Wisp. Kein neuer Goldbonus.

## Vergleich mit drei Spielweisen

Unveränderte Kaufcontroller aus dem vorherigen Wurm-/Glutwerfer-Audit:
gemütlich (alle 20 s kaufen, vorsichtiger erneut versuchen), gemischt (10 s,
beide Helden), aktiv/flächenlastig (5 s, zwei Käufe, DPS/Kosten-Auswahl).
Verschiedene Turmplätze, Reihenfolgen und Forschung; echtes verdientes Gold,
Kaufledger und gültige Saves. Aktiv ist kein mathematisch optimaler Spieler.

Je Stand drei frische 60-Minuten-Läufe und neun Rückkehrläufe: tatsächlich
erspielte Abreise nach W8, W14 oder W20, 24 Stunden Pause, danach 30 Minuten
mit Goldausgabe und weiterem Kaufen. Vorher/Nachher sind jeweils eigenständig
erspielte Zustände derselben Controller; Unterschiede in Geld und Aufbauten
sind Teil des gemessenen Gesamteffekts. Keine geschenkten Upgrades.

| Profil | Rekord frisch nach 30 min, jetzt | Nach 60 min, vorher → jetzt | Erste Niederlage frisch, jetzt |
| --- | ---: | --- | --- |
| Gemütlich | 32 | 34 → 34 | W15 bei 7,5 min |
| Gemischt | 34 | 35 → 35 | W35 bei 17,6 min |
| Aktiv / Fläche | 35 | 36 → 36 | W35 bei 15,9 min |

| Abreise, dann 24 h Pause | Profil | Offlinegold vorher → jetzt | Rekord nach 30 min Rückkehr, vorher → jetzt | Erste Niederlage nach Rückkehr, jetzt |
| --- | --- | ---: | --- | --- |
| W8 | Gemütlich | 2.142 → 2.142 | 33 → 32 | W15, 5,5 min |
| W8 | Gemischt | 2.355 → 2.373 | 34 → 34 | W35, 13,9 min |
| W8 | Aktiv | 2.222 → 2.163 | 35 → 35 | W36, 14,0 min |
| W14 | Gemütlich | 9.282 → 9.795 | 35 → 35 | W15, 1,5 min |
| W14 | Gemischt | 12.220 → 12.126 | 38 → 36 | W36, 10,9 min |
| W14 | Aktiv | 12.477 → 11.754 | 39 → 39 | W37, 10,9 min |
| W20 | Gemütlich | 24.814 → 21.965 | 40 → 39 | W39, 11,4 min |
| W20 | Gemischt | 31.961 → 28.818 | 42 → 42 | W41, 11,4 min |
| W20 | Aktiv | 32.737 → 28.579 | 43 → 42 | W43, 12,5 min |

Nach W20-Rückkehr entstehen die ersten Kernschäden nach 7,7 / 6,2 / 7,2 Minuten.
Mindestens fünf verlorene Leben werden nach 7,7 / 7,9 / 7,2 Minuten erreicht.
Andere Kampfdauern ändern die nachgewiesenen Farmraten; das erklärt Unterschiede
im Offlinegold trotz identischer Quoten. Nach W8 ist in diesen Profilen noch kein
Lager gebaut: 2 h = 8 h = 24 h Auszahlung. Nach W14/W20 gilt mit Lager 8 h = 24 h.
Zusätzlich wurden für alle neun Abreisen 30 min, 2 h, 8 h und 24 h abgerechnet.

**Kritische Einordnung:** Die Vielfalt verbessert sich klar. Gemischte und aktive
Spielweisen schaffen die ersten 20 Wellen weiterhin ohne Kernschaden; dieses
Paket macht den bewusst leichten Einstieg nicht zu einer Niederlagenpflicht.
Das gemütliche Profil verliert bereits auf W12–14 Leben und dreimal gegen W15.
Ein Tagesvorrat nach W20 überspringt weiterhin viele leichte Wellen, aber erzeugt
hier weder mehr Geld noch zusätzliche Reichweite. Eine vollständige Überarbeitung
dieses bestehenden Idle-Sprungs wäre ein eigener Auftrag. Der gemischte W14-
Rückkehrfall endet zwei Wellen früher als vorher; die veränderte Zusammensetzung
wirkt also tatsächlich und ist keine bloße Umfärbung.

## Sicherung und Darstellung

- Regeln 20 unverändert für alle 250 erfassten Wellen geprüft; historische Tests
  bleiben erhalten. Bestehende Kämpfe, HP, Schüsse und Gold laufen exakt weiter.
  Erst eine neue Versuchswelle nutzt Regeln 21. Alte Offlinebelege bleiben zahlbar.
- Farmhistorie bleibt als Kandidatenliste erhalten. Veraltete Zertifikate werden
  durch die vorhandene Versionsprüfung verworfen und mit zwei vollständigen
  aktuellen Probekämpfen ersetzt. Keine neue Farmabkürzung oder Gratisvergütung.
- 495/495 Tests bestanden, TypeScript und Produktionsbuild erfolgreich.
  Neue Prüfungen decken frühe Artfreigaben, Save/Reload, Richtungsbilder, Budgets,
  alte Wellen und unveränderte spätere Druck-/Luftanteile ab.
- Neun Entwicklungsbrowserfälle: W3/W7/W12 bei 1440×900, 844×390, 390×844,
  DE/EN, tatsächliche Sprites, Bewegung, Pause, exakter Reload, kein horizontaler
  Überlauf und keine HTTP-/JavaScriptfehler. Visuelle Fixtures isoliert in `probe`-
  Saves; kein Zugriff auf den Hauptspielstand. Browseremulation ersetzt keine
  physische Handyabnahme. Normale gegenseitige Überdeckung schneller/langsamer
  Gegner ist weiterhin möglich; die kleinen Figuren fügen keine größeren Körper hinzu.
- Dieselben neun Fälle anschließend am fertigen Produktionsbuild erfolgreich:
  [Produktionsdaten](browser-production/results.json), Aufnahmen im selben Ordner.
  Der erste Entwicklungsserver wurde wegen falsch weitergereichter npm-Argumente
  korrigiert; dafür war keine Änderung am Spiel erforderlich.
- Nur drei kleine Laufzeitatlanten, zusammen 15.118 Bytes. Schleim: 18 generierte
  Posen, sechs je Richtung, Gegenseite gespiegelt. Flamme/Auge: Original-Frakassets,
  je vier echte Richtungen. Transparenz/Pixelmaßstab und Lizenzhinweise geprüft.

## Nachweise und Wiederholung

`baseline/` = unveränderte Engine; `candidate-1/` und das historisch so benannte
`selected/` = Zwischenvarianten. **`final/` ist das gewählte Ergebnis.**
Die erste spätere Flammen-Variante ersetzte Bodengegner und konnte alte Farmaufbauten
unerwartet unsicher machen. Verworfen zugunsten des Erhalts der Luft-/Bodenanteile.
[Zusammenfassung aller zwölf Fälle](summary.json), [Rundung und alte Farmaufbauten](facts.json),
[Tests](tests-final.txt), [Build](build-final.txt), [Browserdaten](browser/results.json).
In den zwölf zusätzlichen historischen Verteidigungen aus dem Farm-Audit bleiben
die ausgewählten Farmwellen nach der Korrektur dieselben wie zuvor.

```powershell
node --import tsx artifacts/creep-trio-2026-11-06/measure.ts repeat
node --import tsx artifacts/creep-trio-2026-11-06/facts.ts
node --import tsx --test experiments/idle-bastion/tests/*.test.ts
npm run build
node --import tsx artifacts/creep-trio-2026-11-06/browser.ts http://127.0.0.1:5214
```

Keine neue Bibliothek, keine neue Spielmechanik, keine Änderung anderer Spielpakete.
Die drei deterministischen Profile sind eine belastbare Stichprobe, keine Garantie
für beliebige Platzierungen oder das Spielgefühl jedes Menschen.
