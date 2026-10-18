# Technische Leitplanken — SPIRE: Idle Bastion

Verbindliche technische Regeln; den tatsächlichen Umsetzungsstand führt die [Roadmap](../ROADMAP.md). Gilt zusammen mit dem [überarbeiteten Auftrag](../README.md). Änderungen an diesen Regeln zuerst dokumentieren; offene Balancewerte sind keine Erlaubnis zur Erweiterung des Funktionsumfangs.

## 1. Eigenständige Anwendung und gezielte Wiederverwendung

- Ziel: `experiments/idle-bastion/`, eigener Einstiegspunkt, eigene Konfiguration, eigene Tests und eigener Build.
- Ausgangspunkt ist `reference/src/`, insbesondere `simulation.ts`, `woodland-simulation.ts`, `data.ts`, `regions.ts` und `style-navigation.ts`.
- Der ältere Hauptordner `src/` ist keine zweite Implementierungsgrundlage.
- Wiederverwenden: Gegnerbewegung, Zielauswahl, Projektile, Schaden, Verlangsamung, Flächenschaden, Figurenbewegung, passende Darstellung und vorhandene Assets.
- Neu: Idle-Zustand, Fortschrittsregeln, Wirtschaft, Gebäude, Tutorial, Farmzertifizierung, Offline-Abrechnung und Speichern während laufender Kämpfe.
- Die bestehende `WoodlandSimulation.snapshot()` speichert ausschließlich Bauphasen. Sie ist kein geeignetes Idle-Speicherformat.
- Die vorhandene Simulation besitzt private Spawn-/ID-Zähler und Objektverweise aus Projektilen beziehungsweise Brandschaden auf Türme. Vollständiges Speichern benötigt hier eine gezielte Anpassung.
- Für den Slice dürfen kleine geeignete Simulationsmodule mit Herkunftsnotiz in die Idle-Anwendung übernommen werden. Dort serialisierbare Zustände ergänzen. Kein Umbau des klassischen Spiels zu einer allgemeinen Engine als Vorbedingung.
- Keine Änderungen an klassischen Spielständen, Karten oder Spielmodi. Keine globale Umdefinition der bisherigen `COLS`/`ROWS`-Konstanten.
- Keine neue Engine, kein Backend, kein Onlinekonto, keine zusätzliche Frameworkmigration.

## 2. Verantwortlichkeiten

| Bereich | Verantwortung |
|---|---|
| Kampf | Feste Simulationsschritte, Gegner, Türme, Projektile, Effekte, Kernleben |
| Fortschritt | Vorstoß, Farmmodus, höchster Abschluss, Erstbesiegungen, Freischaltungen |
| Wirtschaft | Ganzzahlige Geldwerte, Kosten, Belohnungen, Transaktionsrevisionen |
| Siedlung | Gebäudegrundstücke, Ausbaustufen, Technologiebedingungen |
| Figuren | Mara-Zuweisung, Bewegung, automatische Fähigkeit, Wisp-Bonus |
| Welt | Instanzabhängige Abmessungen, Pfade, Sperren, Bauplätze, Gebietszustand |
| Tutorial | Ereignisbasierte Aufgaben, gespeicherte Abschlüsse, Hinweise |
| Speicherung | Validierung, Migration, Kampfsnapshot, atomare Zustandscommits |
| Abwesenheit | Sichere Rate, Zeitfenster, Limit, ausstehende einmalige Belohnung |
| Darstellung | Phaser-Szene und UI lesen Zustand; Animationen vergeben kein Gold |

Diese Trennung beschreibt Zuständigkeiten, keine Verpflichtung zu zehn abstrakten Frameworks. Kleine reine Funktionen und klar abgegrenzte Datenstrukturen genügen.

## 3. Wellen und garantierter Wiedereinstieg

- Spielbeginn und weitere erfolgreiche Vorstoßwellen starten automatisch, mit einer kurzen datengetriebenen Zwischenpause.
- Jeder neue Versuch beginnt mit **20/20 Kernleben**, leerer Gegner-/Projektilmenge und neuer Spawnwarteschlange. Vergangene Kernschäden werden nicht mitgenommen.
- Der Reset gilt auch nach Niederlagen und vor Farmwiederholungen. Es gibt keinen dauerhaften Game-over-Zustand.
- Mara-Cooldown und Figurenpositionen laufen über normale Wellenwechsel weiter. Der Kernreset ist kein kostenloser Fähigkeitsreset.
- Niederlage: bereits bestätigtes Gold und Käufe bleiben erhalten; nicht besiegte Gegner und Abschlussbonus erzeugen keine Belohnung. Wechsel zur besten gültigen Farmwelle.
- „Erneut vorstoßen“ ist eine bewusste Spieleraktion. Sie wird am nächsten sicheren Wellenübergang ausgeführt und setzt bei der ersten noch nicht abgeschlossenen Welle an.
- Während des Vorstoßes sind keine weiteren Startklicks nötig. Kein automatischer erneuter Vorstoß nach derselben Niederlage im Slice.
- Der vorplatzierte Waldwächter bleibt auf seinem Startplatz und ist nicht verkaufbar. Seine Basisleistung muss die erste Farmwelle allein tragen.
- Andere Türme dürfen mit der festgelegten Rückerstattung verkauft werden. Eine sichere Farmwelle sichert Einkommen auch nach ungünstigen Käufen.
- Wellenrezepte und Gegnerwerte sind datengetrieben. Nach Minute 15 läuft eine begrenzte skalierende Folge weiter; kein Sieg-Bildschirm beendet den Slice künstlich.
- Gegneranzahl, gleichzeitige Gegner und Projektilanzahl bleiben begrenzt. Späte Schwierigkeit wächst nicht ausschließlich durch immer mehr Objekte.

### Erster Boss: Rosenspiegel (Welle 15)

- Ein Boss plus acht Begleiter, darunter ein Panzerskorpion. Bestehendes Succubus-Sheet und reine Frame-Zuordnung wiederverwenden; keine klassische Simulation importieren.
- 850 Basis-HP, normale Wellen-HP-Skalierung (in Welle 15 etwa 6.790 HP), Tempo 32, 10 % Rüstung. Erreicht sie den Kern, verliert dieser 20 Leben: Niederlage, kein Bossmeilenstein.
- Innerhalb von 200 Weltpixeln wählt sie den Turm mit der höchsten Grund-DPS. Herzfaden kündigt das Ziel 0,8 Sekunden an; anschließend 4,5 Sekunden lang 40 % weniger Feuerrate. Während Ankündigung und Wirkung bleibt sie stehen. Cooldown 11 Sekunden ab Ankündigung, nach Unterbrechung 6 Sekunden.
- Jeder Frosttreffer unterbricht eine laufende Ankündigung oder Verführung und verlangsamt normal. Verkauf des Zielturms beendet den Zauber. Alle Timer laufen in Simulationszeit und bleiben über Pause/Reload erhalten.
- Erst wenn Boss und alle Begleiter besiegt sind, steigt `bossVictories`. Beim ersten Mal einmalig 750 Gold; kein Wisp-Multiplikator und kein künstlicher Anstieg der Live-Einkommensanzeige. Wiederholbar sind nur gewöhnliches Gegner- und Wellen-Gold.
- Bosswellen zählen nie als Farm-/Offline-Nachweis. Nach Niederlage bleibt der Wiederholungsversuch bewusst: Vorstoß oder Chronik → Boss herausfordern. Eine Herausforderung wird erst am nächsten Wellenübergang gestartet; keine laufende Welle wird abgeschnitten.
- Schema 8 speichert Bosszähler, vorgemerkte Herausforderung sowie Zauberphase, Ziel-UID, Restdauer und Cooldown. Alte Welle-15-Rekorde bleiben erhalten, erzeugen aber weder Bossprämie noch Bosssieg. Ein laufender Altversuch behält sein altes Rezept und wird regulär beendet; die Chronik erlaubt anschließend die echte Herausforderung.

## 4. Sichere Farming-Leistung

Ein bloßer Wellenabschluss oder eine theoretische DPS-Zahl ist kein Farmzertifikat.

1. Die Kandidatenwelle wurde mit dieser Spielregelversion tatsächlich im laufenden Spiel automatisch abgeschlossen. Keine Zertifizierung ungeprüfter Zukunftswellen.
2. Eine reine Kopie der aktuellen Verteidigung prüft die Welle ohne Spieleraktionen und **ohne Maras zeitweiligen Feuerratenbonus**. So bleibt die Aussage unabhängig von ihrem wechselnden Cooldown.
3. Start mit 20 Kernleben, leeren Projektilen und ungünstigen normalen Turm-Cooldowns. Zwei vollständige Wiederholungszyklen müssen ohne Kernschaden enden.
4. Zertifizierbare Kandidaten sind normale Wellen. Bosswellen, Erstbesiegungsprämien und Freischaltbelohnungen zählen nicht zur wiederholbaren Produktion.
5. Sichere Rate = wiederholbares Gold beider Zyklen / gesamte Zykluszeit inklusive Wellenpausen. Wisps Bonus darf berücksichtigt werden, wenn er im gespeicherten Zustand freigeschaltet ist.
6. Das Zertifikat enthält Welle, Rate, Verteidigungsfingerabdruck, Regelversion und relevante Karten-/Technologiezustände.

Im sichtbaren Kampf unterstützt Mara weiterhin automatisch. Die Offline-Grundlage ist absichtlich konservativer als ein günstiger Live-Durchlauf.

- UI-Bezeichnung: **„Sicher: … G/min“**, mit Erklärung als Offline-Grundlage. Eine zusätzliche Live-Schätzung muss ausdrücklich so heißen.
- Nach Verkauf, Zuweisungs-/Prioritätswechsel, Bau, Upgrade, Technologie- oder Kartenänderung Gültigkeit überprüfen. Schädliche Änderungen entwerten das alte Zertifikat unmittelbar.
- Neuzertifizierung erfolgt als begrenzte deterministische Trockenrechnung, ohne Gold, Erstbesiegungen, Statistik- oder Tutorialereignisse zu vergeben.
- Kandidatenzahl und Rechenzeit begrenzen; bei Bedarf über mehrere Frames oder einen Worker verteilen. Kein ungebremstes Durchsimulieren aller jemals erreichten Wellen.
- Bis zur Neuzertifizierung nur einen tatsächlich tragfähigen niedrigeren Nachweis verwenden. Ohne Nachweis gilt die Rate als null.
- Die Starterrate darf nur verwendet werden, wenn der aktuelle geschützte Startturm und der unveränderte Einstiegspfad sie tatsächlich tragen. Keine erfundene Mindestrate.
- Ein fehlendes Zertifikat blockiert den Kampf nicht: beim ersten Start oder nach Regelwechsel Welle 1 live automatisch absolvieren und dann zertifizieren. Bis zum Nachweis ist die sichere Offline-Rate null; das tatsächlich verdiente Live-Gold zählt bereits.
- Änderungen an Balancingregeln erhöhen `rulesVersion` und erzwingen neue Zertifikate. Die Spielstandversion ist davon getrennt.

## 5. Türme und automatische Figuren

- Vier Typen: Waldwächter, Frostkristall, Steinschleuder, Scharfschütze. Ihre Rollen bleiben Allrounder, Kontrolle, Flächenschaden und Rüstungsdurchdringung.
- Zielbereich der ersten 15 Minuten sind numerische Level 1–10. Die erste Werkstatttechnologie erschließt den Frostkristall und Level 4–6; Werkstatt II öffnet Level 7–20. Level 11–20 dienen als einfache Schadensupgrades für das Weiterspielen ohne zusätzliche Fähigkeiten oder Grafikstufen.
- Gewöhnliche Level erhöhen vor allem Schaden. Reichweite höchstens Basis + 30 Weltpixel, dauerhafter Feuerratenbonus aus Leveln höchstens +30 %. Keine unbegrenzte Exponentialskalierung aus dem klassischen Dreistufensystem übernehmen.
- Sichtbare Turmstufen sind getrennt vom Zahlenlevel: Darstellung 1 auf Level 1–3, Darstellung 2 auf 4–7, Darstellung 3 ab 8.
- Keine automatische Investition und keine automatische Turmaufrüstung. Keine Spezialisierungsbäume im Slice.
- Mara unterstützt einen zugewiesenen Turm; zunächst den Startturm. Sie läuft auf gültigem Weg zum Einsatzort und aktiviert dort automatisch Übertakten.
- Übertakten: 8 Sekunden lang 1,5-fache Feuerrate, 30 Sekunden Cooldown ab Aktivierung. Nach Ablauf automatisch erneut einsetzen, sobald Ziel, Entfernung und Kampfphase passen.
- Laufzeit, Wirkzeit und Cooldown verwenden Simulationszeit. Kein Bonus während Anreise, Pause oder geschlossener Anwendung; kein Cooldownreset durch Neuladen.
- Verkauf des Zielturms führt Mara zum geschützten Startturm zurück. Unzugängliche Ziele werden verständlich angezeigt; keine Figur bleibt dauerhaft in einem ungültigen Auftrag hängen.
- Wisp gibt nach Freischaltung +10 % auf wiederholbare Gegner- und Wellenbelohnungen. Keine Erhöhung von Erstbesiegungs-/Freischaltprämien und kein zusätzlicher Bonus auf bereits mit Wisp berechnetes Offline-Gold.
- Wisps sichtbarer Werkstattgang ist Darstellung seines Auftrags. Der Wirtschaftsbonus hängt nicht vom Einsammeln eines Sprites, einer Animation oder einem Renderframe ab.
- Charakterlevel, neue aktive Wisp-Fähigkeiten und manuelles Dauerklicken auf Mara sind außerhalb des Slice.

## 6. Karte, Kamera und gebundene Bauplätze

- Das 40-Pixel-Raster bleibt erhalten. Startgebiet 28×16 Zellen; kleine seitliche Erweiterung gemäß Kartenplan, keine riesige Welt.
- Weltabmessungen, begehbare Flächen, Pfade, Dekoration und Kameragrenzen stammen aus einer Idle-Karteninstanz.
- Startgebiet und Erweiterung besitzen dauerhafte Gebiet-/Bauplatz-IDs. Speichern von IDs statt allein flüchtiger Arraypositionen.
- Turmbauplätze sind fest definiert; Gebäude besitzen eigene Grundstücke und Laufzugänge. Kein Bauen auf Wegen, im Wasser, in versperrten Gebieten oder auf Figurenlaufzugängen.
- Die erste Erweiterung öffnet zwei taktisch nützliche Turmplätze. Sie verändert den vorhandenen Gegnerweg nicht mitten in einem laufenden Versuch.
- Im Slice kein zweiter Angriffspfad und kein versetzbarer Spire. Erweiterte Angriffsrouten bleiben spätere Arbeit.
- Kamera zeigt zunächst Kampf, Kern, Mara und Werkstattgrundstück gemeinsam. Erst die kleine Erweiterung macht räumliches Erkunden notwendig.
- Scrollen und Bauklick dürfen nicht dieselbe Eingabe auslösen. HUD bleibt fest; Rückkehr-zur-Verteidigung-Button, saubere Kameragrenzen und bedarfsgerechtes Culling.
- Auf kleinerem Desktop passen Zoom/Fit und UI-Anordnung den Startausschnitt an. Zusätzliche Weltbreite darf nicht durch winzige unlesbare Sprites erkauft werden.
- Kameraposition darf optional gespeichert werden; sie ist keine wirtschaftliche oder kampfrelevante Größe.

## 7. Wirtschaft und Zeit

- Geld intern als sichere ganze Untereinheiten führen, beispielsweise 1/1000 Gold. Restbeträge bleiben gespeichert; Anzeige wird passend gerundet.
- Jede Belohnung hat einen nachvollziehbaren Ursprung. Erstbesiegungen besitzen dauerhafte einmalige IDs; Farmbelohnungen gehören zu einer eindeutigen Versuchs-ID.
- Ein Snapshot enthält Gold und bereits abgearbeitete Kampf-/Belohnungszustände gemeinsam. Renderereignisse sind niemals eine zweite Quelle für Gutschriften.
- Keine unbeschränkte Liste aller bisherigen Kills speichern. Versuchs-/Ereigniszähler, fortgeschriebener Saldo und einmalige Meilenstein-IDs reichen.
- Nur 1× Spieltempo. Simulationszeit entsteht aus festen Schritten von höchstens 25 ms; monotone Laufzeit und Kalenderzeit bleiben getrennt.
- Kalenderzeit dient ausschließlich zur Abwesenheitsabgrenzung. Systemuhrsprünge verändern keine Geschossbewegung und keine laufenden Cooldowns.
- Ungewöhnlich große Frame-Lücken nicht in einem einzigen Kampfschritt nachholen. Unterbrechung kontrolliert als Abwesenheit behandeln; dieselbe Lücke niemals zusätzlich aktiv simulieren.
- Kosten, Belohnungen und Grenzwerte validieren; NaN, negative Preise und Überschreiten sicherer Zahlenbereiche dürfen keinen gültigen Spielzustand erzeugen.

## 8. Verbindliches Speicherverfahren

Eigene IndexedDB-Datenbank und eigener Namensraum, `spire-idle-bastion`, Store `saves`, Spielstand-ID `default`, mit versioniertem Save-Envelope. Keine Wiederverwendung von `spire-woodland-v1`. Versionierung: Envelope 2, Kampfsnapshot 9, Layoutversion 2, Kampfregeln 5 und Datenbankversion 1. Bekannte Kampfschemas 1–8 werden vor der Migration validiert. Gold, Statistik, Mara, Forschung und laufende Projektile bleiben erhalten. `waveRecipeVersion` erhält die alte Gegnerfolge und Spawnabstände bis zum nächsten Versuch. Alte Live-Farmnachweise werden bei Regelwechsel verworfen; auch ein gerade beendeter Altversuch zertifiziert keine neue Regel. Historische Offline-Ansprüche behalten ihre ursprüngliche Basis (Regeln 1–5); Offline-Daten besitzen weiterhin Version 1. „Frische Probe“ verwendet einen eigenen, in der URL identifizierten Datenbanknamen und berührt den Hauptspielstand nicht.

### Additive Bauplätze in Layoutversion 2

Die bestehende Karte, Gegnerroute und acht bisherigen Bauplätze bleiben geometrisch unverändert. Drei neue Plätze (`tower-09` Nordbogen, `tower-10` Mittelpass, `tower-11` Südbogen) öffnen anfangs, nach Welle 5 bzw. nach Welle 10. Mit Basisreichweiten überlappen sie jeweils mindestens 60 Weltpixel Gegnerweg mit zwei bisherigen Schadensplätzen. Keine pauschale Reichweitenerhöhung.

Layout 1 wird vor der Migration gegen seine ursprüngliche Geometrie validiert. Danach bleiben Geld, Gegner, Projektile, Türme, Boss-/Forschungserfolge und Kampfuhren erhalten. Nur eine durch neue Reservierungen ungültig gewordene Mara-Route wird neu berechnet; steht Mara selbst auf einem neuen Bauplatz, wird sie einmalig zum nächsten legalen Feld gesetzt. Ihr Auftrag und Cooldown bleiben erhalten, kein neuer Unterstützungsbonus wird erzeugt. Layout 2 gehört zum Farmfingerabdruck; vorhandene aktuelle Nachweise werden neu geprüft, historische Offline-Ansprüche bleiben unverändert. Alte Clients erkennen die neuere Layoutversion und überschreiben den Stand nicht.

### Fortschrittschronik und Ertragsanzeige

Schema 5 ergänzt `progress`: Startpunkt der Aufzeichnung, reines Kampfgold, getrennte Vorstoß-/Farm-Gesamtsummen, Versuche/Siege/Niederlagen für die letzten 100 verschiedenen Wellen und letzte bekannte Niederlage. Beginn und Ausgang werden an den tatsächlichen Modellübergängen erfasst und gemeinsam mit Kampf und Wirtschaft bestätigt. Reload löst keinen neuen Versuch aus; fehlgeschlagene Speichertransaktionen rollen auch die Zähler zurück. Bei Migration startet die Versuchszählung mit dem nächsten tatsächlichen Wellenstart. Die noch laufende alte Welle erhält keinen erfundenen Start/Sieg; eine neue Niederlage kann trotzdem erklärt werden. Frühere Zahlen bleiben ausdrücklich unbekannt. Beim Entfernen alter Einzelzeilen bleiben die Gesamtsummen erhalten.

Die HUD-Rate verwendet ausschließlich Änderungen von `progress.battleGold` über maximal 60 aktive Simulationssekunden, mit erster Schätzung nach 15 Sekunden. Sie ist eine unverbindliche Messung des jüngsten Goldzuflusses einschließlich regulärer Wellenboni. Käufe, Verkäufe, Offline-Gold und die einmalige Bossprämie verändern diesen Zähler nicht. Das alte Feld `earned` behält aus Kompatibilitätsgründen seine bisherige Bedeutung einschließlich Offline-Gold. Die Messung beginnt nach Reload neu; Pause und angehaltener Kampf werden explizit gezeigt. Sichere Farmbasis und daraus berechneter Offline-Ertrag stehen separat in der Chronik. Wellenrekord bedeutet stets höchste **besiegte** Welle, nicht sichere Farmwelle.

Der Zustand enthält mindestens:

- `schemaVersion`, `rulesVersion`, Save-ID, Revision und Writer-Epoche;
- Gold samt Restbeträgen, Käufe, einmalige Belohnungs-IDs, aktuelle Versuchs-ID;
- Vorstoß-/Farmmodus, aktuelle/höchste Welle, Abschlussstatus, Farmzertifikat;
- alle Türme, Gebäudestufen, Technologien, Charakterfreischaltungen und Mara-Zuweisung;
- Tutorialzustand, Gebietszustand, explizite Pause und Wirtschaftszustand;
- Simulationszeit, Spawnwarteschlange/-cursor, Spawnrestzeit und nächste Objekt-ID;
- lebende Gegner einschließlich HP, Pfadfortschritt, Statuswirkungen und relevante Fähigkeitstimer;
- Projektile samt Ziel-ID und für ihren Einschlag benötigten Schusswerten;
- Turm-Cooldowns, Mara-Position/-Weg/-Wirkzeit/-Cooldown und weitere laufende automatische Aufträge;
- zuletzt abgerechnete Kalenderzeit, Abwesenheitsfenster, damalige Produktionsbasis und ausstehende Belohnung.

Objektverweise werden durch stabile IDs oder notwendige unveränderliche Schusswerte ersetzt. Auch ein bereits abgefeuertes Projektil eines inzwischen verkauften Turms muss korrekt wiederherstellbar sein. Kosmetische Partikel und bereits konsumierte UI-Ereignisse werden nicht gespeichert oder erneut vergütet.

### Atomare Bestätigung

1. Simulationsschritt oder Benutzerbefehl berechnet einen konsistenten Folgezustand.
2. Sobald Geld, Kauf, Freischaltung, Wellenabschluss oder Abwesenheitsabrechnung betroffen ist, wird dieser Zustand als eine IndexedDB-Transaktion geschrieben.
3. Revision und Writer-Epoche innerhalb derselben Transaktion prüfen. Erst nach erfolgreichem Commit gilt die wirtschaftliche Änderung als bestätigt und wird als solche angezeigt.
4. Befehle und Commits serialisieren; niemals einen alten asynchronen Snapshot über einen neueren schreiben. Mehrere Ereignisse eines Simulationsschritts gemeinsam committen.
5. Zusätzlich regelmäßige Kampfsnapshots sowie ein Commit bei geordnetem Hintergrundwechsel. Nicht ausschließlich auf `unload` oder `beforeunload` vertrauen.

Ein harter Prozessabbruch kann die letzten noch nicht bestätigten Simulationsbruchteile verwerfen. **Bereits bestätigte Käufe, Gold und Freischaltungen dürfen nicht verloren gehen oder erneut vergeben werden.** Keine technisch unmögliche Garantie für den noch nicht abgeschlossenen Schreibvorgang behaupten.

### Wiederherstellung und Fehler

- Format, Grenzen, Referenzen, eindeutige IDs und gültige Positionen prüfen, bevor der Zustand verwendet wird.
- Bekannte ältere Schemas gezielt migrieren und testen. Bei unbekannter neuerer Version nicht überschreiben.
- Einen zuletzt validen Vorgängerstand behalten. Bei beschädigtem Hauptstand kontrollierte Wiederherstellung anbieten und den beschädigten Rohstand nicht still vernichten.
- Schreibfehler stoppen weitere bestätigte Wirtschaftsvorgänge und zeigen einen verständlichen Hinweis. Kein stummes Weiterspielen mit scheinbar gespeichertem Gold.
- Ist dauerhafter Browserspeicher grundsätzlich nicht verfügbar, nur ausdrücklich gekennzeichneten temporären Modus ohne Offline-Versprechen anbieten.
- Export/Import eines validierten Idle-Spielstands als kompakte Sicherungs-/Umzugsmöglichkeit bis zur Gesamtabnahme implementieren; niemals automatisch klassische Daten importieren.
- Verlässlicher Betrieb benötigt einen stabilen HTTP(S)-Origin. `file://`, private Browserfenster oder wechselnde Preview-URLs garantieren keine gemeinsame dauerhafte Speicherung. Ein HTML-Build allein beweist diese Eigenschaft nicht.

## 9. Mehrere Tabs, Pause und Abwesenheit

- Genau ein Tab darf den Save wirtschaftlich fortschreiben. Andere zeigen „Spiel bereits in einem anderen Tab aktiv“ und bleiben ohne eigene Simulation oder Belohnungen.
- Web Locks nach Verfügbarkeit verwenden. Zusätzlich beziehungsweise als Fallback Eigentümerschaft über eine IndexedDB-Lease mit Writer-Epoche absichern.
- Die B04-Lease läuft fünf Sekunden und wird bei sichtbarer aktiver Sitzung regelmäßig erneuert. Ihre Epoche bleibt auch nach Freigabe als Tombstone erhalten. Web Locks ordnen kurz die Übernahme; eine eingefrorene Registerkarte darf durch einen dauerhaft gehaltenen Web Lock keine gültige Leaseübernahme blockieren.
- Jeder Commit prüft die gültige Epoche im persistenten Writer-Datensatz innerhalb seiner Datenbanktransaktion. Ein eingefrorener alter Tab darf nach Leaseübernahme keine veralteten Ergebnisse schreiben.
- Verstecken des aktiven Tabs: aktuellen Zustand committen, Simulation stoppen, Abwesenheitsgrenze setzen und Kontrolle geordnet abgeben. Keine parallel weiterlaufende gedrosselte Kampfsimulation.
- Rückkehr: zuerst Eigentümerschaft erwerben, aktuellen Stand lesen und Abwesenheit abrechnen; danach Kampf fortsetzen.
- Eine zweite Registerkarte verursacht keinen zusätzlichen Abwesenheitszeitraum, solange der berechtigte Tab aktiv spielt.
- Explizite Pause friert Kampf, Figuren und Produktion ein, wird gespeichert und bleibt nach Neuladen aktiv. Während dieser Pause entsteht auch bei geschlossenem Browser kein Offline-Gold.
- Einstellungen und Tutorialhinweise pausieren nicht automatisch. Nur ausdrücklich angezeigte Pausezustände unterbrechen die Wirtschaft.

## 10. Offline-Belohnung ohne Doppelzählung

- Ausgangswerte: 60 % der zertifizierten Rate, höchstens 2 Stunden. Lager I: 65 %, höchstens 8 Stunden.
- Grundlage ist die beim Verlassen gültige sichere Rate einschließlich damaliger Boni. Keine nachträglich erfundenen höheren Raten oder rückwirkenden Lagerverbesserungen.
- Formel: sichere Goldrate pro Minute × anrechenbare Minuten × Effizienz, mit einmaliger Rundung und gespeichertem Rest.
- Offline entstehen ausschließlich Gold und ein Rückkehrbeleg. Keine Bossabschlüsse, Wellenrekorde, Charakter-/Technologie-/Gebietsfreischaltungen oder automatischen Käufe.
- Rückwärts laufende Uhr: null neue anrechenbare Zeit; den Abrechnungscursor nicht zurücksetzen, bereits reservierte Zeit bleibt verbraucht. Große Vorwärtssprünge: höchstens das verbliebene Offline-Limit. Ohne vertrauenswürdige Serverzeit keine Manipulationssicherheit versprechen.
- Ein Abwesenheitsfenster besitzt eine feste Herkunft, einen Abrechnungscursor und eine bereits verbrauchte Limitdauer. Neuladen erneuert dieses Limit nicht.
- Rückkehr legt Betrag, Zeitraum und eindeutige Belohnungs-ID atomar als `pendingReward` ab und markiert den Zeitraum als reserviert.
- „Belohnung einsammeln“ addiert genau diesen Betrag und entfernt die ausstehende Belohnung in derselben Transaktion. Doppelklicks und Neuladen können keine zweite Gutschrift erzeugen.
- Wird vor dem Einsammeln geschlossen, bleibt die ausstehende Belohnung erhalten. Neu hinzugekommene Abwesenheit darf höchstens das Restlimit desselben Fensters verbrauchen.
- Erst tatsächliches Fortsetzen des aktiven Spiels beendet das Abwesenheitsfenster. Der Rückkehrdialog allein startet kein frisches Zwei-/Achtstundenlimit.
- Aktive Simulation und Offline-Abrechnung besitzen eine gemeinsame eindeutige Zeitgrenze. Kein Zeitraum wird gleichzeitig als aktiver Kampf und als Abwesenheit vergütet.

## 11. Prüfung

Die verbindlichen Szenarien und Nachweise stehen in [ABNAHME.md](ABNAHME.md). Besonders wichtig sind deterministische Snapshot-Fortsetzung einschließlich verkaufter Projektilquelle, atomare Käufe, Farmzertifikate, einmalige Offline-Claims und konkurrierende Tabs. Technische Tests ersetzen weder Browserprüfung noch Nutzer-Zwischenabnahme.

## B08: konkrete Freischaltungen und Kampfwerte

- Wisp und Steinschleuder: Frostfassung plus höchste gemeisterte Welle ≥ 5. Scharfschütze: höchste gemeisterte Welle ≥ 10. Je zwei Startregion-Plätze bei 5 und 10; östliche Plätze bleiben gesperrt. Bedingungen werden aus dauerhaft gespeicherter Forschung und Rekord abgeleitet, ohne wiederholbare Geschenke oder doppelte Unlock-Flags.
- Steinschleuder: 135 Gold, 28 Basisschaden, 150 Reichweite, 1,55 s, 52 Radius. Jede getroffene lebende Einheit erhält genau einen Treffer und höchstens eine Abschussbelohnung.
- Scharfschütze: 170 Gold, 53 Basisschaden, 190 Reichweite, 1,85 s. Bevorzugt innerhalb seiner Reichweite gepanzerte Gegner und ignoriert deren Rüstung vollständig.
- Wellen 1–5 behalten Rezepte, Werte und Kosten. Ab 6 entstehen Dreiergruppen mit Abständen 0,32 / 0,32 / 1,65 s. Ab 11 ist jeder fünfte Gegner ein Panzerskorpion: 50 Basis-HP, Tempo 40, 45 % Rüstung, 15 Gold, 2 Kernschaden. Die normalen HP-Steigerungen gelten weiter. Rüstung ist auch mit anderen Türmen überwindbar.
- Wisps 10 % gelten ab Freischaltung für folgende Gegner-/Wellenbelohnungen. Tausendstel werden ganzzahlig im Geldbeutel getragen; `rewardRemainderUnits` führt Kampfgold unabhängig von Offline-Resten für die Statistik. Verkäufe und Offline-Claims erhalten keinen weiteren Bonus.
- Farmzertifikate führen neben ganzem `rewardGold` optional `rewardRemainderUnits`. Der Offline-Rechner verwendet diese exakte Rate mit rationaler BigInt-Rechnung und dem bestehenden 60-%-/2-h-Fenster. Historische Zertifikate ohne Rest bleiben unverändert gültige Abreisegrundlagen.
- Wisp ist automatisch aktiv; sein kurzer Werkstattgang folgt begehbaren Zellen und Simulationszeit. Keine Sammelobjekte, Bewegungskommandos oder Charakterlevel.

### B09: Lager und eingefrorene Rückkehrwerte

Vorratslager I kostet 650 Gold und setzt Wisp (Frostfassung + Welle 5) und gemeisterte Welle 8 voraus. Einmaliger, sofortiger Kauf; `warehouseBuilt` und `warehouseBuiltAt` werden zusammen mit dem Goldabbuchungssatz gespeichert. Keine Änderung an Kampfregeln, Turmpreisen oder Startwellen. Schema 6 → 7 ergänzt das unbebaute Lager und erhält laufenden Kampf, Statistik und Live-Farmnachweise.

Offline-Policy ist ausdrücklich entweder 600 Promille / 2 Stunden oder 650 Promille / 8 Stunden. Der aktive Checkpoint übernimmt die aktuelle Lagerstufe, und das Abwesenheitsfenster friert diese Policy gemeinsam mit Farmbasis und Pause ein. Öffnen/Neuladen eines unbeanspruchten Rückkehrbelegs erneuert weder Basis noch Limit. Kauf ist während der Rückkehr gesperrt; bestehende Ansprüche werden zuerst unter der alten Policy abgewickelt. Die nächste aktive Grenze verwendet die neue. Pause und fehlender Nachweis erzeugen weiterhin null Ertrag.

Das Lager verändert keinen Schaden und Wisps Goldbonus bleibt derselbe. Deshalb gehört der Lagerzustand nicht in den Kampffingerabdruck; der genaue bisherige Fingerprint bleibt bei Schema-6-Migration erhalten. Die bestehende rationale Restwertrechnung bleibt unverändert, kein zusätzlicher Wisp-Bonus beim Offline-Claim. Die Anzeige nutzt den eingefrorenen Beleg; zusätzliche Zeit bis zum Einsammeln wird unter derselben Obergrenze abgerechnet.


## Östliche Lichtung

Nach mindestens einem tatsächlich gewonnenen Rosenspiegel-Kampf kostet das einmalige Öffnen 900 Gold. Vier zusätzliche Spalten erweitern das Gebiet von 28×16 auf 32×16 Zellen; Pfad, Kern, Gegner, Projektile und vorhandene Türme bleiben unverändert. Die bereits reservierten Plätze `tower-east-01` (28,7) und `tower-east-02` (28,10) werden baubar. Beide besitzen schon mit Frost Level 1 einen gemeinsamen Schussabschnitt mit einem Waldwächter Level 1 an der Kernwache (26,8). Keine Reichweitenerhöhung für die Erweiterung.

Schema 9 ergänzt `clearing: { unlocked, openedAt }` und `layoutId: start28 | east32`. Schema 8 wird einschließlich laufendem Bosszauber zuerst validiert und mit geschlossener Lichtung übernommen. Kauf und Goldabzug laufen in derselben bestätigten Speichertransaktion; bei Schreibfehlern werden beide zurückgerollt. Neue Plätze sind in einem geschlossenen Snapshot ungültig. Beim Öffnen fallen nur alte Randhindernisse weg; bestehende Mara-Routen bleiben zulässig. Die veränderte Geometrie verlangt einen neuen Farmnachweis, historische Offline-Belege behalten ihre Basis.

Die Szene ersetzt das Gelände einmal beim Zustandswechsel, erweitert die Kameragrenzen und behält den Zoom. Der gewöhnliche Desktop-Maßstab orientiert sich weiter am Startgebiet; nur die bewusst gewählte Übersicht passt die gesamte Karte ein. Der Kauf schwenkt nicht zur Lichtung. „Lichtung ansehen“ und „Zur Verteidigung“ steuern die Ausschnitte ausdrücklich, auch hochkant und nach Reload.
