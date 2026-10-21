# Taverne — Zuneigung, Interaktionen und Animationsproduktion

Planungsstand: 21.10.2026. Geprüfter Ausgangspunkt: `61b95c0` auf `codex/idle-bastion-vertical-slice`.

Dieses Dokument hält Fachregeln und Abnahmekriterien fest. **Die einzige Arbeits- und Statusliste mit Checkboxen bleibt [ROADMAP.md](../ROADMAP.md), T01–T07.** Nach dem Dokumentationsauftrag wurde T01 am 21.10.2026 ausdrücklich zur Umsetzung mit kompakter Prüfung, Commit/Push und Vorschaulink beauftragt. Die visuelle Nutzerabnahme einschließlich Haarkorrektur (`fcc7bc1`) wurde am 21.10.2026 ausdrücklich erteilt; siehe Roadmap und T01-Bericht. T02/T03 wurden umgesetzt; T04 wurde am 21.10.2026 visuell freigegeben und zum Commit/Push beauftragt. T05 ist als nächster Schritt gestartet; T06/T07 benötigen weiterhin einen separaten Startauftrag; der ältere zitierte Auftrag aus einem anderen Chat begründete selbst keine Freigabe.

## Quellen und Grenzen

Grundlage ist das vollständig gelesene `AGENTEN_BRIEFING.md` aus `TD_Taverne_Agentenpaket_2026-10-21.zip` (Nutzeranhang, lokal unter `C:/Users/madde/Downloads/`). Enthaltene Referenzen: `01_Tavernenuebersicht.png`, `02_Charakteransicht_Mara.png`, `03_Beruehren_Mara.png`. Die jüngste Besprechung reduziert T01 auf Idle plus eine Reaktion und ersetzt die ursprünglichen Zahlen durch ein offenes Sitzungsziel.

Mockups bestimmen Komposition und Qualitätsziel, sind keine fertigen Assets. Originalfiguren, [Grafikvertrag](ART_DIRECTION.md) und [Stilregeln](../../../reference/STYLE_GUIDE.md) haben Vorrang. Frühere HTML-Puppenproben sind keine abgenommenen Produktionsassets. Vor einer späteren Assetproduktion die Originalreferenzen erneut ansehen.

Optionales, kompaktes System für die erwachsenen Figuren Mara und Ilyra: Gespräche, Berührungen, ein universelles Geschenk und fünf Herzstufen mit wahrnehmbaren Inhalten. Wisp bleibt Wirtschaftsgefährte, ohne romantische Rolle. Tower Defense, Forschung, Farmen und Kampffähigkeiten bleiben Hauptspiel. Kein Gacha, zusätzliche Figuren, Ausrüstung, neue Währungen oder Kampfboni durch Zuneigung.

## Freischaltungen und Migration

| Voraussetzung | Geplantes Ergebnis |
| --- | --- |
| Welle 12 erfolgreich abgeschlossen | Einmaliger kostenloser Bausatz für Taverne I; freiwilliger Bau über Siedlung, keine Tutorialpause und kein Goldkonflikt |
| Taverne I erstmals gebaut | Mara-Interaktionen und ein Startgeschenk |
| Boss 15 tatsächlich erstmals besiegt | Ein universelles Geschenk, einmaliger Anspruch |
| Boss 25 tatsächlich besiegt | Ein universelles Geschenk; Ausbau der Taverne auf II für 1.200 Gold verfügbar |
| Taverne II und tatsächlicher Boss-25-Sieg | Ilyra bewusst kostenlos rekrutieren; vorhandene Kampfeinführung erhalten |

Wisp behält seine vorhandenen Bedingungen (Frostforschung und abgeschlossene Welle 5). Der bestehende Boss-25-Goldpreis wird nicht nochmals vergeben. Ausbau behält Grundstück und Position, eine zusätzliche Gebäude-Assetserie ist keine Voraussetzung; Stufe und Nutzen müssen klar sichtbar sein.

Alte gebaute Tavernen werden Stufe II, auch ohne Ilyra: keine zweite Zahlung, kein erzwungener Umzug. Bestehende Rekrutierungen bleiben erhalten. Veteranen ohne Taverne erhalten bei erfülltem Fortschritt den noch unverbrauchten Bausatzanspruch. Startgeschenk sowie belegte alte Boss-Geschenkansprüche können einmalig nachgereicht werden; dedizierte gespeicherte Ansprüche verhindern Wiederholungen. Ein Wellenrekord allein ersetzt keinen tatsächlichen Bossnachweis. Gold, Gebäude, Lernfortschritt, laufender Kampf und Offline-Ansprüche erhalten.

T02 speichert die Tavernenstufe in Snapshot 23. Weil es nur eine Taverne und keinen Abriss gibt, ist `tavernBuilt` zugleich der dauerhafte Bausatzverbrauch; der noch offene Anspruch wird aus gemeisterter Welle 12 und fehlendem Gebäude abgeleitet. Stufe I zeigt zunächst die Gefährtenverwaltung; T03 ergänzt die gespeicherte Geschenk-/Zuneigungsbasis, T04 ergänzt die bedienbaren Mara-Interaktionen. Keine vorgetäuschte soziale Freischaltung im aktuellen Menü.

## Zuneigung und Geschenke

Ziel ist sinnvoller Fortschritt über ungefähr **3–5 aktive Spielsitzungen je Figur**, nicht 13 oder mehr Pflichtbesuche an unterschiedlichen Kalendertagen. Die erste T03-Balance rechnet mit etwa 20 Minuten aktiv laufendem Spiel pro Sitzung; das tatsächliche Spielgefühl und die Inhalte werden mit T04/T05 geprüft. Neustart/Reload zählt nicht als zusätzliche Sitzung.

Die früher vorgeschlagenen Schwellen 20/60/120/200/300 und zwei Gespräche plus drei Berührungen täglich sind **nicht beschlossen und nicht zu übernehmen**. Vor Umsetzung Werte, Wiederholungsregeln und begrenzte Geschenkquelle gemeinsam dokumentieren; keine versteckte Pflicht zum täglichen Login. Nach ausgeschöpfter Punktebelohnung bleiben Dialog/Animation verfügbar und zeigen transparent, dass aktuell keine weiteren Punkte entstehen. Keine Zuneigungsverluste durch Abwesenheit.

Genau ein Gegenstand `Geschenk`, gemeinsamer Bestand, bewusst ausgewählte Empfängerin. Neben Start- und Bossgeschenken soll eine begrenzte Quelle durch reguläres aktives Spielen verfügbar werden. T03 verwendet zehn tatsächlich gewonnene normale Wellen pro Geschenk, höchstens zwei Geschenke je Aktivitätsabschnitt; live gespieltes Farmen zählt mit, Bosswiederholungen nicht. Keine Belohnung durch interne Farmnachweise, automatisches Reload oder unbegrenzte Offline-Nachberechnung. Gespräche/Berührungen ermöglichen Fortschritt ohne Geschenke.

### Erste Balance und Speichervertrag (T03)

| Regel | Wert / Verhalten |
| --- | --- |
| Herzen | Ab 10 / 35 / 70 / 110 / 160 Punkten; je Figur separat, aus Punkten abgeleitet |
| Belohnungsabschnitt | 20 Minuten tatsächlich laufende Simulation ab gebauter Taverne; gespeichert als 48.000 Schritte à 25 ms |
| Sprechen | Zweimal je Figur/Abschnitt, je +8 Punkte |
| Berühren | Dreimal je Figur/Abschnitt, je +4 Punkte |
| Schenken | Maximal zweimal je Figur/Abschnitt, je ein gemeinsames Geschenk für +12 Punkte |
| Regelmäßige Geschenke | Je zehn normale gewonnene Live-Wellen ein Geschenk, maximal zwei je Abschnitt; Wiederholungsversuche anhand gespeicherter Versuch-ID dedupliziert |
| Vorrat | Maximal 20 gemeinsame Geschenke; bei vollem Vorrat pausiert regulärer Erwerb. Noch offene Meilensteingeschenke werden aufgeschoben, nicht gelöscht |
| Meilensteine | Je eins für den ersten Tavernenbau und echte Boss-15-/Boss-25-Siege; nachträgliche Ansprüche alter Saves genau einmal, kein zusätzliches Gold |

Mit 2 Gesprächen + 3 Berührungen + 1 Geschenk entstehen **40 Punkte pro Figur/Abschnitt**, also fünf Herzen nach vier Abschnitten. Zwei Figuren können aus zwei regulären Geschenken je Abschnitt parallel vorankommen. Ohne Geschenke sind sechs Abschnitte nötig. Dies ist ein rechnerischer Ausgangspunkt, keine bereits visuell oder im vollständigen Spielablauf abgenommene Balance. Belohnungen können innerhalb des Abschnitts frei verteilt werden; neue Kalenderdaten, Reload und erneutes Öffnen erzeugen keinen neuen Abschnitt. Eine längere Sitzung kann mehrere Abschnitte umfassen.

Manuelle Pause, Lernpause, geschlossener/verborgener Tab und Offline-Nachberechnung füllen keine Budgets auf. Die vorhandene Session unterbindet die Simulation in diesen Zuständen. Der Abschnitt zählt laufendes Spiel inklusive automatischem Live-Farmen, keine nachgewiesenen Maus-/Touch-Aktivitäten. Es gibt keine Uhrzeitabhängigkeit, keinen Verfall und keinen Login-Zwang. Reguläre Wellenfortschritte beginnen pro Abschnitt neu; alte Überschüsse werden nicht nachträglich in zusätzliche Geschenke umgerechnet.

Snapshot **24** ergänzt `social` mit Punkten, Geschenkbestand, permanenten Meilensteinansprüchen, Aktivitätszähler, Aktionsbudgets und letzter vergüteter Wellenversuch-ID. Migration 23 → 24 erhält vorhandene Gold-/Boss-/Gebäude-/Figuren-/Offline-Daten. Farmnachweise verwenden ausdrücklich `socialRewards: false`; Zuneigung verändert weder Kampfwerte noch Verteidigungsfingerabdruck.

Für T04: `companionOffer()` liefert den aktuellen Annahme-/Punkte-/Sperrstatus, `interactCompanion()` führt die Aktion innerhalb von `BattleSession.command()` aus. Geschenkverbrauch, Punkte und Budget sind **eine Transaktion**. Erst nach erfolgreicher Speicherung belohnte Reaktion zeigen. Bei ausgeschöpftem Gesprächs-/Berührungsbudget ist die Reaktion weiter erlaubt (`accepted: true`, `points: 0`), benötigt aber keinen Save; der unveränderte Sessionzustand liefert dann erwartungsgemäß kein Schreib-Acknowledgement. Geschenke ohne Punktegewinn werden nicht verbraucht. Nur vorhandene Figuren dürfen interagieren; Ilyra muss tatsächlich rekrutiert sein. Wisp hat keine sozialen Werte. Freischaltungen einzelner Berührungsbereiche und sichtbare Herz-Inhalte gehören zu T04/T05; T03 enthält keine zusätzlichen Bildassets oder Menüs.

Fünf Herzen brauchen fünf konkrete wahrnehmbare Freischaltungen. Mögliche Staffelung: vertrautere Begrüßung, zusätzliche Gesichtsreaktion, weitere Nähe/Hand an der Taille, kurze Umarmung, persönliche romantische Abschlussszene. Genaue Zuordnung und Inhalte vor Produktion in T05 festlegen. Anfangs Hand, Haare und Schulter; abweichende Mockup-Zonen nicht automatisch übernehmen. Gesperrte Bereiche geben keine Punkte; zurückhaltende Reaktionen passen zum aktuellen Verhältnis. Mara bleibt direkt/neckisch, Ilyra eher reserviert. Keine große Film- oder Szenenbibliothek.

## Maras fünf ausgearbeitete Herzstufen (T05)

| Herzen / Punkte | Persönlicher Moment | Entwicklung |
| --- | --- | --- |
| 1 / 10 | Ein Platz am Feuer | Mara erzählt von ihrer ersten Nacht im Hain und hält einen Platz frei. |
| 2 / 35 | Mein Glücksstück | Das Zahnrad ihrer ersten misslungenen Uhr erklärt, warum ihr Unvollkommenes wichtig ist. |
| 3 / 70 | Was ich nicht reparieren kann | Sie spricht über Angst um den Hain und Vertrauen zum Spieler. |
| 4 / 110 | Bleib noch ein bisschen | Sie nimmt bewusst frei und lädt zu einer ruhigen, gegenseitig gewollten Nähe ein. |
| 5 / 160 | Unser Morgen | Frühstückspläne und ein persönliches Liebesgeständnis schließen den ersten Beziehungsbogen. |

Jeder Moment enthält drei kurze, manuell weitergeschaltete Abschnitte mit den bereits freigegebenen Schulter-, Hand- und Haarreaktionen. Zusätzlich gibt es für 0–5 Herzen jeweils eine eigene Begrüßung, zwei wechselnde Gesprächsantworten sowie eigene Geschenk-/Hand-/Haar-/Schulterantworten. Quelle: `src/tavern-mara-content.ts`. Es wurden keine neuen Grafikassets produziert; die bestehenden Atlanten bleiben unverändert.

Die fünf Herzen sind zugleich die Einstiege in die persönlichen Momente. Noch gesperrte Herzen nennen Titel und Punkteschwelle, der nächste Inhalt steht sichtbar unter dem Fortschritt. Nach verdientem Herz erscheint ein kleiner optionaler Einstieg zum neuen Moment. Keine automatische Unterbrechung oder zusätzliche Pause. Zurück, Schließen und Kampfverwaltung bleiben erreichbar.

Freischaltungen werden ausschließlich aus den gespeicherten Punkten abgeleitet. Nach Reload sind alle verdienten Momente wieder verfügbar, auch wenn eine Szene zuvor abgebrochen wurde. Wiederholen kostet nichts und erzeugt keine Punkte; es gibt keine zusätzlichen Scene-Seen-Flags und keine Snapshot-Migration. Sprechen/Berühren bleiben nach dem Punktebudget und bei fünf Herzen verfügbar. Geschenke bei voller Zuneigung bleiben gesperrt.

Die T03-Balance bleibt nach der kompakten Prüfung bestehen: 40 Punkte mit einem Geschenk je Aktivitätsabschnitt ergeben fünf Herzen nach vier Abschnitten; ohne Geschenke sechs. Das ist eine überprüfte Modellrechnung. Die langfristige subjektive Spielbalance bleibt Teil der gemeinsamen T07-Abnahme.

## Oberfläche und Hintergrundkampf

Ein Tavernenfenster mit Übersicht und Charakteransicht; Berühren ist ein Modus der Charakteransicht. Große, lesbare Figur und kurze Texte, keine dauerhaft zusätzliche HUD-Leiste. Warmes Raumgefühl mit vorhandenen Schiefer-/Messingrahmen; Raumillustration darf auf Hochkant nicht den Großteil der nutzbaren Höhe verbrauchen.

Übersicht zeigt Mara und Ilyra, echte Herzstände und klare Sperrbedingungen. Charakteransicht bietet Sprechen, Berühren, Schenken sowie Empfängerin/Bestand. Keine scheinbar verdienten Herzen bei gesperrter Ilyra. Im Berührungsmodus Kopf bis ungefähr Knie, Gesicht/Hände/Schulter/Taille erreichbar; dezente Hotspots, keine Beschriftungswolke. Touchflächen an den tatsächlichen Figurenausschnitt koppeln; Ziehen/Scrollen nicht versehentlich als Berührung belohnen. Zurück/Schließen bleibt stets zugänglich.

Wisp bleibt in der Gefährtenverwaltung erreichbar, ebenso die schnellen Kampfaktionen von Mara/Ilyra außerhalb der romantischen Ansicht. Gebäudeverschieben bleibt im Siedlungsmenü. Kein neues paralleles Hauptmenü für jede Aktion.

Automatischer Kampf läuft grundsätzlich weiter; manuelle Pause wird respektiert. Ein kleiner Status und ein schließbarer Hinweis bei tatsächlichem Kernschaden/Niederlage erlauben den Rückweg zum Kampf. Keine automatische Schließung der Taverne, keine großen Warnfenster über der Figur. Diese Integration gehört zu T04, nicht zur isolierten T01-Probe. Das vorhandene Pausenverhalten beeinflusst Offline-Erträge; deshalb keine unbeabsichtigte neue Pause beim Öffnen.

## Animation und visuelle Zwischenabnahme

**T01 ausschließlich:** eine hochwertige Mara-Darstellung, ruhige Idle-Animation, eine echte Schulter-Berührungsreaktion und organische Rückkehr zur Idle-Pose. Keine zweite/dritte Reaktion, Ilyra, Tavernenintegration, Save- oder Kampfänderung.

Mara: rote Haare, türkisgrüner Schal/Umhang, vorhandene Lederkleidung; keine Schutzbrille aus dem Mockup übernehmen. Später Ilyra: weiß/silbernes Haar, warme Haut, goldene Schutzbrille, weiß-blaue Kleidung, dunkelblauer Umhang und goldener Kristallspeer. Keine violette Elfenmagierin. Große Tavernenfiguren benötigen passende Detailauflösung; hochskalierte 64-Pixel-Spielatlanten sind kein Ersatz.

Bevorzugte Technik: echte zusammenhängende Animationsframes als Spriteatlas. Zunächst maßgerechte Referenzpose und kurze Bewegungsprobe; Auflösung, Anker, Framezahl und Laufzeit anhand der tatsächlichen Darstellung bestimmen. Richtwert für eine Reaktion: 6–12 echte Frames, bei Bedarf mehr für einen sauberen Übergang. Die Qualität entscheidet, nicht eine Pflichtzahl. Bildgenerierung kann Vorlagen liefern, konsistente Zwischenframes und manuelle Bereinigung bleiben der Produktionsengpass.

Die Reaktion zeigt Wahrnehmen, Blick/Kopfbewegung, nachvollziehbare Arm-/Schulter- und Körperreaktion, dann Entspannen. Idle zeigt ruhige Atmung/Blinzeln. Keine bloßen Bildwechsel zwischen unverbundenen Posen, Bewegung des gesamten Standbildes, pulsierende Kontur oder Verformung einer Einzelillustration als Ersatz. Stabile Identität, Anatomie, Kleidung, Bildausschnitt und Anker; kein Pixelzittern, keine schwarzen transparenten Zwischenräume, kein Sprung am Loop.

Eine echte Ebenen-/Skelettanimation wäre eine spätere Alternative bei größerem Umfang, braucht aber sauber getrennte Körper-/Kleidungs-/Gesichtsteile und eine geprüfte Werkzeugkette. Die vorhandene Atlas-Arbeitsweise ist der effizientere erste Versuch. Wenn T01 nicht überzeugt, Methode überarbeiten statt weitere Assets auf derselben unzureichenden Basis produzieren.

Lieferung: getrennte interaktive HTML-Vorschau mit Klick/Touch, animierte Darstellung plus zugängliche Frames/Atlas, dokumentierte Quellen/Prompts/Framezeiten und kurze Desktop-/Hochkantprüfung. Kein Speichern in echten Spielständen. Wiederholtes Tippen darf den Ablauf nicht zerreißen. Erst nach Veröffentlichungserlaubnis Commit/Push und tatsächlich erreichbaren Vorschaulink liefern. **Danach ausdrückliche visuelle Nutzerabnahme; technische Tests ersetzen sie nicht.**

F04/F05 bleiben eigenständige geplante Idle-Animationen für die kleinen Kartenfiguren. Sie werden durch T01 oder die Tavernenintegration weder umgesetzt noch als erledigt markiert.

## Technik, Risiken und kompakte Prüfung

Ausgangspunkt: `battle.ts` enthält Tavernenbau/Bossnachweise und Snapshot-Migrationen; die Rekrutierung braucht bei früherer Taverne eine zusätzliche unabhängige Boss-/Stufenprüfung. `main.ts`, `ilyra-ui.ts` und `index.html` enthalten aktuelle Karten, Gefährtenübersicht und Aktionen. Das soziale System bekommt einen klar abgegrenzten Daten-/UI-Bereich, statt sämtliche Inhalte in `main.ts` zu sammeln.

Tavernenstufe, Bausatzverbrauch, Punkte je Figur, Geschenkbestand, einmalige Ansprüche und Belohnungsgrenzen im bestehenden Snapshot speichern; Herzen ableiten, nicht als zweite Wahrheit speichern. `battle-session.ts` bietet serialisierte Aktionen und Rücknahme bei Speicherfehlern, der bestehende Save-Store Tab-Eigentümerschaft. Geschenkverbrauch und Punkte müssen eine Transaktion bilden; kein unabhängiger localStorage-Zähler. Animation erst als Folge einer erfolgreichen Aktion anzeigen, Belohnungen niemals aus Animationsframes auslösen.

Regeln für Zeitgrenzen explizit festlegen: Uhrsprünge dürfen keine negativen Wartezeiten oder mehrfachen Ansprüche erzeugen. Lokale Uhrzeit ist ohne Server nicht manipulationssicher; keine neue Server-Infrastruktur für dieses optionale System. Soziale Punkte verändern keine Verteidigungs-/Farmberechnung. Interne simulierte Farmproben dürfen keine echten sozialen Belohnungen erzeugen.

Große Atlanten verursachen auch bei kleinen komprimierten Dateien Arbeitsspeicher-/Grafikspeicherbedarf. Nur benötigte Figur/Clips laden, Speicher bei Wechsel freigeben und auf normalem Hochkant prüfen. Animationszeit von Kampfzeit trennen: Figur kann bei manuell pausiertem Kampf reagieren; bei verborgenem Tab pausiert die Darstellung, ohne doppelte Belohnung bei Rückkehr.

Pro Paket nur betroffene Risiken prüfen. Zusammen relevant: Welle 12/echte Bosse 15 und 25, alte Saves mit/ohne Taverne und Ilyra, wiederholte Claims/Mehrfachklicks, Schreibfehler, Reload während Interaktion, Zeitgrenzen, Farm-/Offline-Erhalt, Figurwechsel und Rückkehr zum Kampf. Echte Mobilgeräteprüfung von Desktop-Hochkantemulation unterscheiden. Kein vollständiger alter Testlauf pro Checkbox.

## Aufwand und spätere Inhalte

T01 ist eine kleine Funktionsprobe mit hohem Grafikrisiko. T02/T03/T04 sind mittlere technische Pakete mit klaren Schnittstellen. T05/T06 werden durch Inhalts- und Animationsqualität bestimmt; bei Bedarf je Figur in Referenz/Animation und Stufeninhalte teilen, ohne neue Systeme einzuführen. T07 ist eine kompakte gemeinsame Abschlussprüfung.

Die bisher genannten 5–10 Produktionstage für alles sind eine unbestätigte grobe Schätzung, keine Lieferzusage. Erst nach T01 anhand tatsächlicher Framequalität, Korrekturschleifen und Wiederverwendbarkeit neu schätzen. Keine Assetserie vor dieser Entscheidung.

Später und nicht in T01–T07: Zimmer, Möbel, Outfits, Kartenspiel, weitere Charaktere oder große zusätzliche Szenen. Keine Umsetzung allein wegen einer Darstellung im Mockup. Neue Türme/Ostfront bleiben eigene Roadmap-Pakete; das soziale System blockiert keine Ilyra-Rekrutierung durch zusätzliche Herzvoraussetzungen.
