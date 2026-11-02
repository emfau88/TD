# Glutwerfer: begrenzte Integration

Ausgangspunkt: Main `f948a4e`. Nutzer beauftragt Glutwerfer mit Werkstattforschung,
eher höherem Sparpreis, anschließend dezente Neu-Markierung ohne Popup/Kachel.
Keine neuen Gegner, Gebäude, Wellenkurven oder Goldtarife in diesem Paket.

Erster Messkandidat: Forschung nach gemeisterter W34 in Werkstatt II, 5.000 Gold,
separater Bau 220 Gold. 18 Trefferschaden, 12 Brand pro Sekunde für 3 Sekunden,
Radius 30, Reichweite 125, 1,1 s Schussabstand; bestehende Levelskalierung.
Nur Boden, Rüstung wirkt auf beide Schadensarten. Ein stärkster Brand pro Gegner;
gleiche/stärkere Treffer erneuern ihn, schwächere verlängern ihn nicht.
Abgefeuertes und angewandtes Material behält sein damaliges Level nach Upgrade/Verkauf.
Die Forschung verlangt weder Sturmlicht noch eine weitere Begleiterfreischaltung.

Originalbasen, Waffen, Level-X-Projektil und Einschlag aus Foozle Tower Pack 4
(CC0). Drei vorhandene Grafikstufen, keine neuen Evolutionsbilder.

Prüfung: kompakte Fälle für Freischaltung/Bezahlung/Neu, Bodenfilter, Überlagerung,
Rüstung, letzte Treffer, Quelle verkauft, exakter Reload, ungültige Branddaten,
alte Saves/Ansprüche. Derselbe bestehende Controller für drei Spielweisen,
mit ausgeschalteter Glutoption gegen den bisherigen Lauf abgleichen. Danach
bewusstes Sparen/Bauen sowie Rückkehr mit gleicher verdienter Geldbasis vergleichen.
Keine geschenkten Ressourcen in Wirtschaftsvergleichen; Einheitsprüfungen dürfen
künstliche Zustände für einzelne Randfälle verwenden.

Orientierung: Forschung als mehrminütiges Sparziel, Nutzen gegen dichte
Bodengruppen, keine Pflicht zum Kauf und keine langen zusätzlichen Freiläufe.
Ein einfacher Gegner-/Turmvergleich ersetzt dabei keine Prüfung der Progression.
Preis oder Werte nur bei konkretem Messbefund nachschärfen.

Status ausschließlich in der Roadmap; tatsächliche Ergebnisse im Abschlussbericht.

Zweiter Messkandidat: 22 Treffer, 16 Brand/s, 0,95 s Schussabstand. Anlass: Kandidat 1 verliert beim bewussten Sparen in allen drei aktiven Profilen gegen normale Ausgaben (W34/35/36 statt W35/35/39), auch nach Rückkehr kein überzeugender Nutzen. Forschungspreis, Radius, Reichweite und alle anderen Türme bleiben gleich. Unveränderte Kontrollen werden erneut gegen B3 geprüft; Rückkehr-Kontrollen aus Kandidat 1 wiederverwendet. Rohdaten des ersten Kandidaten bleiben in candidate-1 erhalten.

Abschließende Aufstellungs-/Kaufempfindlichkeit mit unverändertem Kandidat 2: gemischt neben dem vorhandenen Frost auf (9,5), taktisch neben dem zweiten Frost auf (13,7), entspannt bleibt (17,7). Der taktische Käufer bewertet den kleinen Brandradius mit 1,6 statt irreführend denselben drei Flächenzielen wie die große Steinschleuder; keine nachträglichen Spielergebnis-Garantien. Kein Wechsel der Türme/Gegnerwerte. Mara berücksichtigt bei ihrer Automatik auch den Bodenfilter von Turm 7. Die ursprünglichen Aufstellungen samt nachteiligen Ergebnissen bleiben in candidate-2.
