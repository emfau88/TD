# Technische Leitplanken — SPIRE: Idle Bastion

## Aktive Echtzeit und Speichergrenzen — 26.10.2026

Phasers Delta-Glättung ist im Hauptspiel ausgeschaltet: langsame Vordergrundframes
werden nicht mehr durch ältere kürzere Zeitabstände ersetzt. Die Session erhält
die volle beobachtete Framezeit. Bis einschließlich zwei Sekunden zählt sie als
aktive Zeit; größere Lücken verwenden weiterhin den bestehenden Offlineweg
(temporäre Partien ohne Offlinewirtschaft verwerfen solche Abwesenheiten).

Aktive Zeit sammelt sich auch während Speicherungen verlustfrei in einer flüchtigen
Warteschlange. Verarbeitung in höchstens 250-ms-Portionen mit unveränderten 25-ms-
Kampfschritten; ein fälliger Save hält die weitere Verarbeitung bis zur Bestätigung
an. Auch über zwei Sekunden angesammelte Live-Zeit bleibt Live-Zeit. Flush, Pause,
Verbergen und Schließen schließen bereits angenommene Zeit vor ihrer Grenze ab.
Speicherfehler verwerfen unbestätigte Zeit und stellen den bestätigten Kampf wieder
her. Saveformate, Farmregeln, Offlineformeln und soziale Belohnungsbudgets bleiben
unverändert. [Gezielte Nachweise](../../../artifacts/idle-bastion/acceptance/runtime-fixes/REPORT.md).

## Einmalige Offline-Begrüßung

Der bestehende Save-Umschlag 2 kann `maraOfflineWelcomeSeen: true` enthalten.
Fehlendes Feld in alten Spielständen bedeutet noch nicht begrüßt; Kampf-Snapshot 31,
Regeln 16 und Offline-Schema 1 bleiben unverändert. Die Markierung gehört zur
Darstellung, nicht in Farmfingerabdruck, Offlineformeln oder Goldkonto.

Die Session bestätigt die Markierung zusammen mit dem ersten positiven reservierten
Rückkehrbeleg, bevor der Dialog verfügbar wird. Nur die aktuelle Session zeigt dann
das vorhandene Mara-Porträt und DE-/EN-Text. Ein Reload auch vor dem Einsammeln zeigt
weiter denselben Anspruch, aber keine zweite Begrüßung. Nullertrag bleibt unmarkiert;
Goldbruchteile zählen als positiv. Der Store erhält eine gesetzte Markierung auch bei
Schreibvorgängen ohne dieses optionale Feld. Schreibfehler rollen den Sessionzustand
zurück; der bisherige Beleg und die Begrüßungsberechtigung bleiben erhalten.
Kein Zusatzdialog, Lesetimer oder Warten auf das Porträt vor dem Einsammeln.

## Early Balance Release — Snapshot 31 / Regeln 16

Neue Versuche ändern ausschließlich Welle 10 (22 Gegner, vier Gruppen, Abschlussgold 20)
und Welle 20 (drei Blattkäfer durch Panzerflieger ersetzen, Abschlussgold minus 30).
`wave-recipes.ts` bindet diese beiden Rezepte an Version 16; alle älteren Rezepte,
HP-Kurven, Preise, Boss-/Heldenfähigkeiten und Goldfaktoren bleiben unverändert.

Schema 29 erhält zunächst `tutorialFrostUid: null` und wird wie Schema 30 vollständig
unter Regeln 15 geprüft. Danach wechseln ausschließlich Schema-/globale Regelversion
auf 31/16. Laufende Rezeptversion, Queue, Gegner, Geschosse, Timer, Geld, Gratis-Frost
und Live-Clear-Kandidaten bleiben erhalten; erst neue Versuche starten unter 16.
Der native Store erkennt die neue Obergrenze über die zentralen Konstanten und
schützt zukünftige Formate weiter vor Überschreiben.

Der neue Fingerabdruck verlangt frische Farmbelege aus zwei verlustfreien Kämpfen
ohne aktive Heldenboni. Bereits eingefrorene Abreise-/Offlineansprüche unter Regeln
1–15 behalten ihren Betrag und ihre Einmal-Auszahlung. Neue Ansprüche akzeptieren
Regeln 16; keine Datenbank-/Savekennung oder Offlineformel ändert sich.
[Messungen und Migrationsnachweise](../../../artifacts/idle-bastion/acceptance/early-balance-release/REPORT.md).
Die folgenden Versionsangaben dokumentieren die jeweiligen früheren Änderungen.

## Zauber- und Markierungsdarstellung

`HeroMarks`, `MaraSpellView` und `IlyraSpellView` lesen den laufenden Battle-Zustand;
sie ändern weder Schaden noch Timer noch gespeicherte Felder. Animationen verwenden
die Simulationszeit, damit Pause und Reload die tatsächlich gültigen Phasen zeigen.
Mara bleibt über `effectTowerUid` an den verstärkten Turm gebunden, auch nach neuer
Zuweisung. Verkauf/Verzauberung blenden den Glow aus; nach natürlichem Ablauf folgt
nur ein optischer Ausklang von 0,4 Sekunden. Ilyras neun Sterne illustrieren weiterhin
einen einzigen Flächentreffer mit Radius 72, keine neun zusätzlichen Treffer.

Die Bildobjekte werden in begrenzten Pools wiederverwendet (60 Markierungen,
je 64 Mara-/Ilyra-Effektbilder). Turmüberzüge übernehmen Frame, Anker, Drehung und
Maßstab beider echten Turmsprites. Bodenmarkierungen liegen unter den Weltobjekten;
Projektile und Einschläge sortieren nach ihrem Bodenpunkt.

`spell-button.ts` erhält native Buttons und zeigt den wirklichen Cooldown radial
mit Restsekunden, Handlungsgrund und Automatikstatus. Auswahl- und Menüaktionen
nutzen dieselben Zustände. `assets/spells/` enthält acht kleine WebP-Ableitungen
der freigegebenen Originale; die separate Mediengalerie wird nicht vom Spiel geladen.

## A2 · Direkte Figurensteuerung

Die Auswahl ist flüchtiger UI-Zustand. Bestehende `moveMaraTo`, `moveIlyraTo` und
`castIlyraAt` bleiben die einzigen Modellbefehle; kein weiterer Schemawechsel oder
geänderte Kampfwerte. Ausdrückliche Bau-/Platzierungs-/Zielmodi haben Vorrang,
danach anklickbare Objekte, erst dann Bodenbewegung. Zweiter Figurentipp öffnet das
Menü ohne Kamerafokus; Dock-Menüs behalten ihren Fokus. Maus-/Touch-Drag erzeugt
keinen Laufbefehl. Rechtsklick unterdrückt das Kontextmenü ausschließlich am Canvas
bei aktiver, bedienbarer Figurenwahl.

Moduswechsel, Kamerabewegung und Dialog-/Session-Sperren verwerfen wartende
Pointerbefehle. Eine UI-Generation prüft außerdem den Zustand erneut, wenn eine
Sessiontransaktion erst nach einem Hintergrundsave ausgeführt werden kann.
Manuelle Pause erlaubt gespeicherte Wegplanung; Lernpausen erlauben sie nicht.

`hero-controls.ts` berechnet ausschließlich Darstellungsempfehlungen aus dem
tatsächlichen Weg, Turmreichweiten und dem bestehenden Pathfinder. Ilyras gespeicherte
Einführungsstufe `cast` bedeutet weiterhin „Laufbefehl akzeptiert“; die Oberfläche
prüft zusätzlich leeren Laufpfad, keine aktive Salve, Bereitschaft und echte Ziele.
Eine Empfehlung löst weder Bewegung noch Zauber aus. Keine neuen Steuerungs-Savefelder.

## Tutorial-Frostbausatz · Schema 30

Die angeleitete Frostphase gewährt genau einen kostenlosen Bausatz nach der weiterhin
60 Gold teuren Forschung. `tutorialFrostUid` speichert die UID des kostenlosen Turms
auch nach Verkauf; dessen `spent` enthält ausschließlich bezahlte Upgrades. Bau,
Verbrauch und Tutorialabschluss werden gemeinsam durch die bestehende Sessiontransaktion
gespeichert und bei Speicherfehler vollständig zurückgerollt. Überspringen beendet die
Berechtigung. Alte bezahlte Türme werden nicht umbewertet. Schema 29 erhält nur den
fehlenden Null-Marker, danach greift die aktuelle vollständige Validierung inklusive
Sturmlicht und Ilyra; Regeln 15 und bestehende Offline-Ansprüche bleiben erhalten.

## Sprache als reine Darstellungseinstellung

`src/i18n.ts` und `src/locales/en.ts` halten vollständige deutsche Quelltexte und
englische Übersetzungen mit nummerierten Platzhaltern zusammen. Neue sichtbare
Texte über `t(...)` ausgeben und den englischen Eintrag ergänzen; Definitionen,
Gegner-/Turm-IDs, gespeicherte Enums und Zahlenwerte niemals übersetzen. Mara und
Ilyra behalten ihre unveränderten Inhaltsdaten; übersetzt wird erst bei der Anzeige.
Die Abdeckungsprüfung umfasst alle Gegnerbeschreibungen und Dialogstufen.

Standard ist ausdrücklich `en`, unabhängig von `navigator.language`. Nur `de`
aktiviert Deutsch. `spire-language-v1` liegt separat in localStorage; blockierter
Zugriff lässt die Auswahl für die aktuelle Sitzung funktionieren. Snapshot 29,
Kampfregeln 15, IndexedDB-Namen, Nachweise und Offline-Ansprüche bleiben identisch.
Kein Schemawechsel und keine erneute Farmzertifizierung durch den Sprachwechsel.

Statische DOM-Texte und zugängliche Beschriftungen werden einmal gebunden;
Sprachwechsel aktualisieren bestehende Knoten. Kein MutationObserver und kein
wiederholter Scan im Kampftakt. Dynamische Ansichten erhalten ihre Texte aus dem
Katalog; Chronik- und Bauplatzcaches berücksichtigen die Sprache. Formatierer
werden pro Sprache wiederverwendet. Ein Wechsel startet keine Charakteranimation
oder Geschichte neu. Rückmeldungen halten ihre Textvorlage, nicht übersetzte IDs.

Die Sprachwahl ist eine Geräte-/Browserpräferenz und wird nicht mit einer
exportierten Partie übertragen. Technische Vorschauseiten, historische Dokumente,
Lizenzoriginale und bestehende Audioaufnahmen bleiben in ihrer Originalsprache.
[Reproduzierbare Prüfung](../../../artifacts/idle-bastion/acceptance/language/REPORT.md).

`reward-display.ts` formatiert ausschließlich die Rückkehranzeige: ganze Goldstücke
mit schmalem Tausenderabstand; tatsächliche Millionen/Milliarden mit explizitem
Näherungszeichen und Größenwort. Exakte Nachkommastellen werden aus den unveränderten
ganzzahligen Währungseinheiten zusammengesetzt und bleiben aufklappbar. Keine Änderung
an `amountUnits`, Rundungsresten, Reservierung oder Auszahlung. Der Dialog bleibt auch
bei niedriger Querformat-Höhe innerhalb des Bildschirms und scrollbar.

## Gezielte Farmsuche — unverändert Snapshot 29 / Regeln 15

Nur die Auswahl der höchstens vier Kandidaten ändert sich. Neben dem höchsten
belegten Live-Clear und der bisherigen Farmwahl wird der tatsächlich gespeicherte
Clear am nächsten zur Mitte beider Wellen betrachtet; bei Gleichstand die kleinere
Welle. Ohne nichttriviale frühere Auswahl bleibt die bestehende Wiederherstellung
mit jüngeren Clears und Einstieg erhalten. Bosse, fehlende Clears und Wellen über
dem Rekord bleiben ausgeschlossen. Eine vollständige Historien-Vollsuche findet
nicht statt.

Nachweisprüfung, Fingerabdruck und die zwei vollständigen verlustfreien Durchläufe
bleiben identisch. Eine gültige alte Rate bleibt erhalten, bis eine bessere
bewiesen ist. Die zusätzliche Welle-1-Probe darf entfallen, wenn ihre maximale
Belohnung einschließlich Wisp selbst ohne jede Kampfzeit, nur mit den beiden
Pflichtpausen, die schon bewiesene Rate nicht schlagen könnte. Diese Obergrenze
erzeugt niemals einen Nachweis oder Gold. Ohne gültige bessere Rate wird der
Einstieg weiterhin vollständig geprüft.

Keine neue Schema-/Regelversion: Wellenrezepte, Kampfsimulation, Nachweisformat,
Gültigkeitsregeln und Offline-Formeln sind unverändert. Ein Versionssprung würde
hier gültige Nachweise unnötig entwerten. Die Sitzung prüft die Auswahl beim Laden
und bei vorhandenen Verteidigungs-/Historienänderungen; kein neuer Timer. Bereits
reservierte Abwesenheit behält ihre eingefrorene alte Grundlage. Erst zukünftige
Abwesenheit kann von der neu belegten besseren Rate profitieren.

[Messungen und Regressionen](../../../artifacts/idle-bastion/acceptance/farm-search/REPORT.md).

## B16 — Snapshot 29 / Regeln 15

Sturmlicht ist Turm-ID 5. Forschung wird als `settlement.stormResearched` gespeichert;
Schema 28 wird vor Migration vollständig unter Regeln 14 validiert und erhält
anschließend `false`. Bestehende Kämpfe behalten ihre Rezeptversion und Werte.
Regeln 15 erzeugen dieselben Rezepte/HP/Belohnungen wie 14. Keine neue Savekennung.

Eine Kette bleibt ein normaler gespeicherter Schuss mit unverändertem Abschusslevel
und Grundschaden plus `chainHits`. Höchstens zwei bereits abgearbeitete IDs im
aktiven Schuss, keine Duplikate/aktuelle Ziel-ID, keine Turm-/Geschossreferenzen.
Neue Ziele können nach dem Abschuss gespawnt sein; sie werden gegen die globale
UID-Grenze statt die frühere Schuss-ID validiert. Jeder Hop sucht das nächste
lebende ungetroffene Ziel innerhalb 80, multipliziert den Schaden um 0,65 und
endet spätestens nach dem dritten Treffer. Kein Reset bei Verkauf/Upgrade/Reload.

Mara nutzt dieselbe Feuerrate. Ilyras gespeicherte Quelle darf ab aktuellem Schema
ID 5 verwenden; historische Formate bleiben auf IDs 1–4 beschränkt. Für ihre
Schadensbasis zählt nur die einzelne ungebuffte Turm-DPS. Neue Farmnachweise
entstehen unter 15 mit Forschungsbesitz im Fingerabdruck; historische Ansprüche
bis 14 bleiben unverändert einmalig zahlbar. Suchregel und Wirtschaftsformeln
bleiben gleich. [Prüfung und Audit](../../../artifacts/idle-bastion/acceptance/b16/REPORT.md).

## Merge-Vorbereitung E01 — Snapshot 28 / Regeln 14

Vier Frakassets-Gegner und beide Moospilz-Paletten bleiben unverändert. Regeln 14
korrigieren ausschließlich Welle 46: Die neue Waldspinne übernimmt die leichte
Begleitung, damit eine gekürzte Einführungsmischung nicht beinahe nur aus Panzern
besteht. Alte Regeln 13 sind vollständig in `wave-recipes-v13.ts` eingefroren.
Schema 27 wird unter Regeln 13 validiert und ohne Veränderung der laufenden
Queue, Gegner, Heilung, Geschosse und Wallet auf 28 migriert. Der nächste Versuch
verwendet 14. Historische Offline-Basen bis 13 behalten ihre exakten Ansprüche.

Farmkandidaten bleiben auf vier begrenzt und brauchen zwei sichere Durchläufe
unter aktuellen Regeln, ohne Gefährtenbonus. Bei fehlendem Abreisezertifikat wird
nun auch die gespeicherte Farmwahl frisch geprüft. Bei fehlendem oder ungültigem
Nachweis nutzt ein weiterer jüngerer Kandidat einen bisher ungenutzten Prüfplatz.
Bei gültigem Nachweis bleibt die bisherige Auswahlstrategie erhalten. Die
Rückfalloption 1 bleibt reserviert. Es werden ausschließlich zuvor
validierte Live-Clears geprüft; alte Zertifikate verleihen keine Freischaltungen.
Die Offline-Effizienz, Wellenbelohnungen und Upgradepreise bleiben unverändert.


## Wave-Rework 2.0 — Snapshot 26 / Regeln 12

SPIRE ist ein Endlos-Idle-TD; Welle 40 ist ein Elite-Zwischenziel. `wave-recipes.ts` erhält die vier Familien und erhöht ihre sichtbaren Gruppen. Das erste Rework ist unverändert in `wave-recipes-v11.ts` eingefroren. Gespeicherte Regeln 3–11 bleiben anhand ihrer eigenen Anzahl, Reihenfolge, Spawnzeiten, HP und Belohnungen gültig. Aktuelle Versuche beginnen mit Regeln 12; 1–5 und Bosskämpfe 15/25 bleiben unverändert.

Schemas 24 und 25 werden zuerst unter ihren jeweiligen Regeln validiert. Laufende Queue, Timer, HP, Projektile, Heilung, Geld, Figuren und Gebäude bleiben exakt erhalten. Bereits validierte `liveClearedWaves` bleiben **Kandidaten**, keine übernommenen Farmraten. Der geänderte Fingerabdruck verwirft alte Zertifikate; `certifyFarm` ermittelt zwei vollständige verlustfreie Durchläufe unter Regeln 12, bevor eine neue Rate gilt. Dadurch bleiben fortgeschrittene Spieler nach einem Update nicht unnötig auf Farmwelle 1 hängen. Bereits reservierte Offline-Ansprüche und Abreisewerte bis einschließlich Regeln 11 werden nicht rückwirkend neu berechnet; Regeln 12 sind für neue Ansprüche zulässig.

Mehr Kill-Gold ersetzt Abschlussgold statt es zusätzlich aufzuschlagen. Die gemeinsame Belohnung wird von Welle 21 bis 25 schrittweise auf Faktor 0,96 gestrafft; Boss 25 ist ausgenommen. Wisp und Offline-Effizienz bleiben unverändert. Die erste HP-Kurve bis 40 ist identisch; danach wächst sie weiter um 13 % statt beim alten Multiplikator 100.000 zu stagnieren. Ein reiner Maschinenschutz begrenzt HP auf `Number.MAX_VALUE / 1024` pro Multiplikator, sodass auch Boss-Grundwerte endlich bleiben.

Werkstatt II hat keine Level-20-Spielgrenze mehr. Ab 7 wachsen Schaden ×1,30 und Upgradepreis ×1,32 weiter; Reichweite/Feuerrate sowie drei Grafikstufen bleiben begrenzt. Kauf und Save-Validierung verlangen sichere ganzzahlige Preise und Investitionssummen, auch für gespeicherte Projektile und Ilyras Quelllevel. Es wird keine neue feste Spiellevelgrenze eingeführt. Wallet/Offline-Ganzzahlen und exponentielle Kosten sind damit noch keine unbegrenzte Zahlenarchitektur. Der Belohnungsfaktor bleibt vorerst bei 4 gedeckelt: Die Langzeitwirtschaft muss separat weiterentwickelt werden.

[W02-Bericht mit Messungen, Einschränkungen und Spielansichten](../../../artifacts/idle-bastion/acceptance/wave-rework-v2/REPORT.md). Die folgenden W01- und älteren Abschnitte sind historische Herkunft; insbesondere das dortige Leeren der Kandidatenliste gilt seit W02 nicht mehr.

## Wave-Rework — Snapshot 25 / Regeln 11

Die neue Rezeptversion verwendet `wave-recipes.ts`; Regeln 3–10 bleiben unverändert verfügbar. Neue aktuelle Saves enthalten Schema 25 und Regeln 11, eine laufende alte Welle behält ihre `waveRecipeVersion`. V24 wird vor der Migration vollständig unter Regeln 10 validiert. Queue, Spawnrestzeit, Gegnerwerte/Heilzeiten, Geschosse, Goldreste, Boss-/Figuren-/Gebäudezustände bleiben erhalten. `liveClearedWaves` wird geleert und die aktuelle Farmwahl auf 1 gesetzt; neue sichere Nachweise brauchen zwei verlustfreie Durchläufe ohne aktive Heldenfähigkeiten. Die neue Version muss auch an der nativen Save-Grenze und in Offline-Proof-Validierung bekannt sein. Historische Offline-Ansprüche 1–10 behalten ihre ursprüngliche Grundlage; 11 ist für neue Ansprüche zulässig.

Keine neue Savekennung, Datenbankversion, Route oder Ostfront. Die vorhandenen drei Heiltimer gelten auch für den Kultisten; die Ziel-Lockouts sind für beide Arten gemeinsam. Wellenzahlen und Spawnintervalle werden beim Laden anhand der gespeicherten Rezeptversion validiert. Weitere Details und Nachweise: [Gegner](ENEMIES.md), [W01-Bericht](../../../artifacts/idle-bastion/acceptance/wave-rework/REPORT.md).

## Tavernenstufen und soziale Basis — Snapshot 24

T02 führte Snapshot 23 ein: kostenloser Taverne-I-Bausatz nach gemeisterter Welle 12, II-Ausbau für 1.200 Gold nach echtem Boss-25-Sieg, alte bezahlte Tavernen automatisch II. T03 ergänzt Snapshot 24 mit `social` aus `tavern-social.ts`. Punkte, gemeinsamer Geschenkbestand, einmalige Meilensteinansprüche und begrenzte Aktions-/Wellenbelohnungen werden zusammen mit dem Kampf transaktional gespeichert. Grenzen richten sich nach gespeicherten Live-Schritten, nicht nach der Systemuhr. Soziale Werte wirken nicht auf Kampf/Farmen/Offline; interne Farmproben deaktivieren soziale Belohnungen ausdrücklich. Datenvertrag, Balance und T04-Schnittstelle stehen in [TAVERNE_INTERAKTION.md](TAVERNE_INTERAKTION.md). Die folgenden älteren Technikabschnitte bleiben als Herkunft erhalten.


## Ilyra — Snapshot 22

Schema 20 wird zuerst vollständig validiert, danach um `ilyra: null` ergänzt. Keine automatische Rekrutierung. Die gebaute Taverne berechtigt zur kostenlosen, atomar gespeicherten Rekrutierung; auch alte Besitzer zahlen nichts zusätzlich. Mara/Wisp werden in der Tavernenübersicht angezeigt, nicht erneut gekauft.

Ilyra verwendet kardinale Fußwege, 110 px/s und denselben Hindernissatz wie Mara. Spawn nahe dem tatsächlichen Taverneneingang; Position, Restweg, Blickrichtung, Einführung und Automatik werden gespeichert. Bau auf ihrer aktuellen Zelle wird abgelehnt, ein durch Neubau blockierter Restweg wird gestoppt. Gebäudeumzug darf die Figur nicht verdeckt versetzen oder einschließen.

Sternensalve: 210 px Zielreichweite, 72 px Trefferradius, 28 s Abklingzeit, Neue Salven: 0,243 s Vorbereitung, Einschlag bei 0,81 s, Ausklang bis 1,2825 s (35 % längere Darstellung). Die gespeicherte Phasenuhr `age` läuft mit `dt / pace`; `pace: 1.35` gilt für neue Salven. Schema 21 wird nach Validierung zu 22 übernommen; bereits fliegende Salven ohne `pace` behalten ihr altes Timing (0,18 / 0,60 / 0,95 s), Trefferstatus und verbleibenden Cooldown. Kein nachträgliches Verschieben oder Wiederholen von Treffern. Schaden pro getroffener Einheit: `round(max(70, 1.5 * höchste ungebuffte Turm-DPS))`; Flieger ×1,5, danach normale Rüstung. Keine Dauerfeuer-Grundattacke. Zielpunkt bleibt während des Flugs fest. Quelltyp/-stufe, berechneter Schaden, Ursprung, Phasenalter, Tempo und Trefferstatus werden eingefroren und validiert. Gemeinsame Killabrechnung verhindert doppelte Goldvergabe mit Turmprojektilen.

Die erste Anwendung ist manuell. Nach bewusst gewähltem Standort und tatsächlich ausgelöster Salve erscheint die optionale Automatik. Sie wartet auf eine Gruppe (mindestens zwei normale Gegner), einen Flieger oder Boss in Reichweite. Nicht während Bewegung, Abklingzeit oder leerer Wellen wirken. Keine neue automatische Lernpause oder dauerhafte Hinweis-Kachel. Pfeil an den realen Standort-/Zauberbuttons, nach Auswahl freies Spielfeld; Zielkreis und Flugphase zeigen die Wirkung.

Farmprüfungen entfernen gespeicherte Salven und deaktivieren Ilyras Fähigkeit ausdrücklich. Rekrutierung, Bewegung und Automatik verändern keinen Farmfingerabdruck oder historischen Offline-Anspruch; eine neue sichere Welle muss weiterhin ohne aktive Heldenfähigkeiten bewiesen werden. Kampfregeln 10 und bestehende Wellen bleiben unverändert.

## Siedlung am Kern — Snapshot 20, neue Partien mit Layout 5

`IdleBattle.newGame()` verwendet `core40`: 40×16 Zellen, Kern (27,6), unveränderter Westweg und Kampfregeln 10. Der reine Kampf-Konstruktor und explizite Layouts 3/4 bleiben für historische Migrationen und Prüfmodelle verfügbar. Gebäude liegen frei innerhalb (30,10)–(38,14); der spätere Ostkorridor (28,3)–(39,9) enthält keine Siedlungsgebäude. Vorhandene Waldgrafiken bilden den neuen Rand, ein schmaler Fußweg verbindet Kern und Höfe. Es gibt noch keine Ostgegner oder zweite Route.

Schema 19 wird vor der Umstellung auf 20 vollständig nach seinen Regeln validiert. Positionen, alte Karte, Gold, Figuren und laufende Gegner bleiben erhalten. „Siedlung am Kern“ verlegt alle vorhandenen Gebäude erst bei bewusstem Klick in manueller Pause und nach der laufenden Einführung. `BattleSession.relocateSettlement()` bestätigt Lage und neue Karte atomar; Schreibfehler rollen zurück. Türme, Gegner, Timer, Gebäudelevel und Preise ändern sich nicht. Die alten Versionen und Grundstücke bleiben bis dahin gültig. Historische Offline-Ansprüche behalten ihre ursprüngliche Grundlage; die neue Verteidigung wird anhand ihres geänderten Kartenfingerabdrucks neu geprüft.

`clearing.unlocked` und `openedAt` bleiben unverändert der Nachweis eines alten Lichtungskaufs. `eastAccessCredit` leitet daraus 900 Gold **reservierte Zugangsgutschrift** ab. Kein zusätzliches ausgebbares Gold und kein neuer Kauf leerer Fläche. B19 muss diesen Betrag vor einem Zugangskauf abziehen. Die bisherigen östlichen Turmfelder bleiben auf der neuen Karte offen.

Keine zusätzlichen Kamera-Navigationsbuttons: Ziehen/Touch verschiebt die Karte, Übersicht/Zoom bleiben vorhanden. Normale Turmbau-Auswahlen behalten Ausschnitt und Zoom bei, ohne feste Platz-Vorauswahl je Turmtyp. Nur angeleiteter Start-/Frost-/Steinschleuderbau sowie konkrete Objektaktionen fokussieren ein Ziel; die breitere Karte verkleinert nicht den Standardmaßstab. Wisp läuft vom Kern zum aktuellen Werkstatteingang und pendelt anschließend im tatsächlichen Siedlungsbereich.


## Hinweise und Auftritte (Snapshot 18)

`dismissedDefeatAttempt` speichert den geschlossenen verlorenen Versuch. Nur eine spätere Niederlage darf den Hinweis erneut öffnen. Schema 17 wird vor der Migration validiert; danach wird dieses Feld mit 0 ergänzt. Geld, Käufe, aktive Effekte, Timer und historische Offline-Ansprüche bleiben erhalten.

Die aktuelle Anschlussfolge lautet `wisp → mara-wait → mara-ready → mara-effect → mara-controls → cannon → warehouse → done`. In angeleiteten Partien bleiben neue automatische und manuelle Mara-Aktivierungen bis zur Einführung gesperrt. Bestehende aktive Effekte aus Altsaves werden nicht gelöscht. `mara-wait` pausiert zum Lesen; „Übertakten zeigen“ setzt `mara-ready`. Erst bei tatsächlichem Gegnerkontakt beginnt der normale Zauber samt kleiner schließbarer Restzeitleiste. `mara-start` bleibt für alte bereits dort gespeicherte Partien gültig. Überspringen der Anleitung beendet die Sperre.

Wisps Ankunft beginnt neben dem eigenen Kern und folgt begehbaren Feldern zur Werkstatt. Die rein visuelle Ankunftsuhr läuft auch in der Begrüßungs-Lernpause, hält aber bei manueller/Browserpause; sie erzeugt keine Ressourcen. Nach Reload wird sie aus dem gespeicherten Ankunftszeitpunkt abgeleitet: Bei unbestätigter eingefrorener Begrüßung kann der Lauf nochmals beginnen, Begrüßung und Bonus werden aber nicht dupliziert. Die mobile Kamera folgt bis zum Ende des Anlaufs, Begrüßen oder eigenem Kartenkontakt.

Frost verlangsamt Rosenspiegel, unterbricht aber weder Ankündigung noch Tanz. Tod, Zielverlust/Verkauf und reguläres Wirkungsende bleiben wirksam. Tanzfenster und Treffbereich sind linear auf 85 % skaliert. Wellenrezept-/Farmregelversion bleibt 10: normale Wellen sind unverändert, Bosswellen bleiben außerhalb der Farm-/Offline-Zertifizierung.

Aktionsbuttons in Detailfenstern reservieren Pfeilplatz. Bestätigungskarten erhalten nur eine Button-Umrandung; andere Pfeile weichen Textüberdeckungen aus oder werden ausgeblendet. [Gezielte Prüfung und Ansichten](../../../artifacts/idle-bastion/acceptance/onboarding/readability/REPORT.md).

## Anschlussführung nach Frost (ursprünglich Snapshot 17)

Kampfregeln 10 und Layout 4 bleiben unverändert. Das gespeicherte Feld `discovery` führt neue Partien durch `wisp → mara-wait → mara-start → mara-effect → mara-controls → cannon → warehouse → done`; `off` bleibt für reine Kampfmodelle und fortgeschrittene ältere Spielstände. Die Anschlussführung wird erst nach `introduction.stage = done` aktiv.

- Nach Frost: freie Bau-/Upgradeentscheidungen und Ziel Welle 5. Wisp pausiert einmal an der Wellengrenze, bis die Begrüßung bestätigt ist. Sein Bonus wirkt unverändert automatisch; keine zusätzliche Belohnung durch den Dialog.
- Mara: tatsächliche nächste Aktivierung abwarten. Bei der echten achtsekündigen Verstärkung startet eine kurze Beobachtungspause, Kamera auf dem betroffenen Turm. „Verstärkung ansehen“ lässt Wirkung und normalen 30-Sekunden-Cooldown weiterlaufen. Keine künstliche Aktivierung oder Gratis-Rücksetzung. Restzeit am Turm und im kleinen Hinweis; anschließend optional das echte Mara-Porträt für Automatik/manuelles Zaubern/Bewegen.
- Steinschleuder: Pfeil zu Tab/Baukarte, anschließend ein verfügbarer Platz nahe Frost. Andere gültige Plätze bleiben erlaubt. Lager: ab Welle 8 „Neu“ bei Siedlung/Baukarte → Vorschau → Platzierung. Beide Käufe sind optional und lassen sich auf später verschieben; kein Sparzwang und keine künstliche Pause bis zum Kauf. Bereits gebaute Optionen werden übersprungen.
- Ein Hinweis zur Zeit: keine alten Tutorialkarten oder konkurrierenden Ziele während der Anschlusslektion; beim Platzieren verschwinden die Erklärungen. Während der Bauerfolgsmeldung bleibt der alte mobile Tippknopf verborgen. Begrüßung/Weiter werden hervorgehoben, ohne einen Pfeil über den Erklärungstext zu legen.
- `learningPaused` umfasst die beiden Anschluss-Pausen. Session bestätigt Phasenwechsel sofort atomar, behandelt diese Zeit als Pause für Offline-Erträge und unterdrückt leere Rückkehrdialoge. Farmbeweise schalten `discovery` aus. Das bestehende Fortschrittsbit 15 und `currentGoal` verweisen beide auf Mara statt fälschlich auf die Lichtung.
- Migration: Schema 16 wird zuerst unverändert validiert. Neue Spieler vor Welle 5 mit begonnener Einführung/Vorbereitungszeit und sichtbarer Anleitung erhalten `wisp`; fortgeschrittene Partien `off`. Geld, Käufe, Gegner, Timer und bereits bestätigte Begrüßungen bleiben erhalten. Frühere unterstützte Formate durchlaufen die bestehende Kette. Keine Wirtschaftsänderung und keine Entwertung vorhandener Farmbelege.

[Nachweis und Ansichten](../../../artifacts/idle-bastion/acceptance/onboarding/followup/REPORT.md).

## Erweiterte Lernführung (ursprünglich Snapshot 16)

Kampfregeln bleiben 10. Neue Partien folgen `welcome/build/ready → combat → upgrade → workshop → research → frost → observe → done`. `introduction.halted` ist die separate Lernpause; sie stoppt Gegner, Geschosse, Cooldowns, Wellentimer und Produktion, lässt aber den geführten Kauf zu. Nach der Aktion bleibt sie bis zur ausdrücklichen Fortsetzung aktiv. Eine Pause beginnt, wenn der nächste Kauf bezahlbar ist; die Werkstatt wartet stattdessen auf das erste Level-2-Upgrade und die erste abgeschlossene Welle. Die vorhandene Vorbereitungszeit zählt nun auch Lern-/Lesezeit und wird zur sichtbaren Gesamtspielzeit addiert.

Während der Anleitung sind nur das erste Level-2-Upgrade und die jeweiligen Werkstatt-/Frostkäufe offen. „Anleitung überspringen“ im Spielmenü beendet diese Einschränkung; anschließend gelten normale Baupreise. Ab gemeisterter Welle 2 wird regulär Welle 2 gefarmt, bis die Kombination steht; keine abweichenden Gegnerwerte/Belohnungen. Farmnachweise prüfen weiterhin den echten Kampf ohne Lernpausen und ohne Mara-Bonus. Nach Abschluss wird der normale Vorstoß vorgemerkt. Wisp kann daher erst nach dem Lernabschluss und Welle 5 auftauchen.

Ein einzelner Pfeil in Bildschirmkoordinaten folgt der echten Bedienfolge: Baukatalog-Tab → Baukarte → Kartenplatz; Upgrade/Forschung: Turm/Gebäude → Aktionsbutton. Nur Begrüßung, Kampfbeginn und abgeschlossene Schritte verwenden den Hinweisbutton. Der Pfeil steht über dem Ziel statt über dessen Beschriftung. Er bleibt auf mobilen Bildschirmen gleich groß und nimmt keine Klicks entgegen. Ein Tipp im aktiven Baumodus baut direkt; nur das Versetzen bestehender Gebäude behält eine Bestätigung. Sparphasen verwenden eine kleine HUD-Leiste, abgeschlossene Schritte eine kompakte Rückmeldung am oberen Rand. Die geführte Werkstatt verwendet einen kostenlosen Bausatz nach Welle 1 und Startturm-Level 2. `workshopKitAvailable` wird aus bestehenden gespeicherten Meilensteinen und der aktiven Werkstattlektion abgeleitet; `workshopBuilt` verbraucht ihn einmalig. `workshopBuildCost` liefert für Modell und UI denselben Preis. Außerhalb der Anleitung bleiben es 200 Gold, ohne Erstattung bestehender Käufe. Schema 16 bleibt unverändert; kein gespeichertes Geldgeschenk oder neues Timerfeld. Nach dem Bau sind Hinweise 1,8 Sekunden verborgen, während Staub und Aufbau sichtbar laufen; danach folgt ein ausdrücklicher Weiter-Schritt. Gebäudeanimationen verwenden visuelle Zeit unabhängig von der Lernpause. Leere Gebäudeplätze haben weder Requisiten noch unsichtbare Anklickbereiche. Der erste Frostplatz liegt etwas vor dem Waldwächter: So trifft Frost vor dessen tödlichen Pfeilen. Außerhalb der Anleitung bleibt die bisherige freie Platzierung bestehen.

Der Eintritt in eine Lernpause wird sofort atomar mit dem Kampfergebnis bestätigt; reine Lesezeit benötigt keine ständig flackernden Speichersperren und wird bei Aktion/Verlassen mitgespeichert. Lernpausen werden für Offline-Zeit als angehalten behandelt. Wiederkehr in eine Lernpause überspringt den leeren Offline-Dialog. Snapshot 15 wird zunächst nach seinen bisherigen Regeln validiert: vorbereitende Partien bleiben in der Vorbereitung, bereits begonnene Partien erhalten `done`, alle behalten Geld, Käufe und Kampfzustand. Keine erneute Einführung für Veteranen. Der früher ungenutzte Lichtungs-Hinweisplatz 15 erklärt nun nach bestätigter Wisp-Ankunft Maras Übertakten; bereits gelesene Hinweise werden nicht zurückgesetzt. Der Lager-Neuhinweis nutzt den vorhandenen Hinweisstatus 12 und erlischt beim Öffnen der freigeschalteten Lageroption.

## Einstieg nach B13: Vorbereitung und Speichermigration

Erste Einstiegsversion: **Snapshot 15**, weiterhin **Kampfregeln 10**, Layout 4. `IdleBattle.newGame()` erzeugt einen turmlosen Start; der reine Kampf-Konstruktor bleibt für bestehende Modellproben/Migration erhalten. Browser-Sessions verwenden immer den geführten Start.

- `introduction.stage`: `welcome → build → ready → practice → auto → done`. Alternative: während der Zauberlektion direkt Automatik einschalten. Nur `welcome/build/ready` stoppen Kampfticks; aktive Vorbereitungszeit wird separat gespeichert und zur angezeigten Spielzeit addiert.
- Ein geschützter Waldwächter UID 1 aus einem kostenlosen Bausatz; nur neun überprüfte frühe Felder. Vor dem Start kostenlos versetzbar, keine weiteren Käufe. 75 Gold bleiben erhalten. Bausatzverbrauch, Position und Phase werden gemeinsam durch die Session bestätigt/bei Schreibfehler zurückgerollt.
- `startDefense()` beginnt genau einmal den ersten Versuch. Maras erste manuelle Verstärkung wird nur mit Gegnern in Turmreichweite angeboten; danach Wahl zwischen bestehender gegnerabhängiger Automatik und manuellem Spiel.
- Kein Farmnachweis/Offline-Ertrag vor dem ersten Kampf. Wiederherstellen einer Vorbereitung erzeugt keinen leeren Rückkehrdialog; normale laufende Partien behalten die bisherigen Rückkehrregeln.
- Schema 14 wird vollständig gegen seine bisherigen Regeln validiert; Migration ergänzt nur `introduction: { stage: 'done', preparationSeconds: 0 }` und Schema 15. Keine Wirtschafts-/Kampfregeländerung, daher keine Entwertung bestehender Farmbelege. Ältere unterstützte Schemas durchlaufen die vorhandene Kette; kein zusätzlicher Turm oder Tutorialzwang.
- [Gezielter Nachweis und Aufnahmen](../../../artifacts/idle-bastion/acceptance/onboarding/REPORT.md). Die folgenden historischen Abschnitte dokumentieren ihre jeweils ursprünglichen Versionen.

## B13: Balance mit dem erweiterten Gegnerkader

B13-Basis: Schema **14**, Kampfregeln **10**, Layout **4**. `src/balance.ts` bündelt die Kurve. Die Einführung der Arten und die Wellenrezepte aus B12c bleiben erhalten.

- Bis Welle 15: weiterhin Faktor `1,16^(Welle−1)`. Nur Rosenspiegel in Welle 15 hat zusätzlich 20 % HP (rund 8.148 statt 6.790). Keine Änderung der ersten fünf Wellen, Turmwerte, Preise oder Heilfähigkeiten.
- Ab Welle 16: HP-Faktor `1,16^14 × 1,13^(Welle−15)`, weiterhin bei 100.000 begrenzt. Das entschärft die Häufung von Rüstung/Heilung nach Welle 20, ohne ihre Gegenmittel zu entfernen.
- Gewöhnliche Gegner- und Abschlussbelohnungen ab Welle 16: `min(4; 2 + 0,12 × (Welle−16))`. Zuerst auf ganzes Basisgold runden, anschließend Wisps 10 % einmal anwenden. Erstprämien, Verkäufe und Offline-Gutschriften werden nicht nochmals multipliziert. Offline nutzt bereits die gemessene erhöhte Farmrate.
- Neuzertifizierung prüft höchstens vier Kandidaten: jüngste normale Welle, frühere sichere Welle, zweitjüngste und Welle 1. Nach einer Änderung wird die alte sichere Welle erneut vollständig bewiesen; ihre frühere Rate wird nicht blind übernommen. Zwei schadensfreie Zyklen ohne Mara bleiben Pflicht.
- Ein laufender alter Versuch behält HP, Spawnfolge und gewöhnliches Gold seines Rezeptstands. Erst der nächste Versuch verwendet Regeln 10. Aktive Farmnachweise müssen neu verdient werden; bereits entstandene Offline-Ansprüche behalten ihre historische Rate. Geld, Käufe und Bossprämien werden nicht zurückgesetzt.
- Werkstatt II empfiehlt zunächst die Steinschleuder bis Level 7. Zielanzeige und Zielknopf benutzen dieselbe Auswahl. Alle Käufe bleiben manuell; die Lichtung bleibt optional.

Messwerte, Varianten und Grenzen: [B13-Bericht](../../../artifacts/idle-bastion/acceptance/15min/REPORT.md). Das ist eine Abstimmung des ersten Spielabschnitts, keine validierte Endlosbalance.

## Verbindliche Ergänzung nach B12: Bauflächen, Figuren und Siedlung

Diese am 18.10.2026 beauftragten Regeln ersetzen die bisherigen festen Bauplätze, Maras Turmnachbarschaft und die Lichtung als Voraussetzung für Werkstatt II. Historische Migrationsabschnitte unten beschreiben weiterhin ihre jeweilige alte Version.

- Schema 11 / Kampfregeln 7 / Layout 3. Ein Baufeld liegt in Manhattan-Distanz 1–3 zu einer Wegzelle, außerhalb der Siedlung und aller Geländehindernisse. Bisherige Platz-IDs behalten ihre Koordinaten; neue IDs kodieren die Rasterkoordinate. Alle geeigneten Startflächen sind sofort offen. Der Weg und der geschützte Startturm bleiben fest.
- Vorschau und bestätigter Kauf sind getrennt. Goldpreis, Belegung, Freischaltung, Gelände und Maras aktuelle Zelle werden beim Kauf erneut geprüft. Kartenziehen baut nichts. Nach Erfolg schließt die Auswahl.
- Siedlungsfläche: x=2–10, y=10–13, nullbasiert. Werkstatt 3×2, Lager 2×2 einschließlich Vorplatz; kein Überlappen. Positionen liegen im Snapshot. Der erste Bau wählt eine Position; spätere Umzüge sind in der UI nur während ausdrücklicher Pause möglich und kostenlos. Mara darf nicht überbaut werden; unterbrochene Laufwege stoppen ohne Cooldown-Reset.
- Mara: unabhängiger Laufweg, bevorzugtes Zauberziel und `effectTowerUid`. Fernreichweite 240 Weltpixel; 8 s Wirkung, 30 s Cooldown ab Aktivierung. Auto wirkt nur während einer Welle mit lebendem Gegner in Turmreichweite; verführte Türme werden abgewartet. Manuelle Auslösung nutzt denselben Cooldown. Bewegung/Zielwechsel erhalten die laufende Wirkung. Verkauf des betroffenen Turms beendet nur dessen Buff, nicht den Cooldown. Farmproben rechnen weiterhin ohne Mara.
- Wisp: einmaliger Ankunftszeitpunkt plus bestätigtes Begrüßungsflag. Der Bonus beginnt bei Freischaltung, unabhängig von Animation und Begrüßung. Kein erneuter Bonus oder Dialog nach bestätigtem Reload.
- Lichtung bleibt optional (bisheriger Preis/Bossnachweis). Werkstatt II verlangt Frostforschung und 1.200 Gold. Ein späterer Herausforderungszugang ist eine Roadmap-Idee und wird nicht als vorhandener Inhalt dargestellt.
- Schema 10 und ältere Versionen werden zuerst mit ihren alten Layout-/Figurenregeln validiert. Neue Migration erhält Geld, Käufe, Positionen, Kampf, Cooldowns, Pause und historische Offline-Belege. Aktuelle Farmnachweise werden neu verdient. Der neue Fingerabdruck enthält Layoutversion, Breite, Gebäude- und Turmpositionen sowie relevante Regeln statt aller möglichen Bauzellen.
- Animationen sind rein kosmetisch: Originalatlanten für jede Grafikstufe, einzelne Frostframes mit Idle-/Attack-Folge, kurzlebige Treffer und Turmbau. Effekte folgen Simulationszeit, sind auf 96 gleichzeitig begrenzt und erzeugen keine Spielbelohnungen.


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
- 850 Basis-HP, Wellen-HP-Skalierung plus B13-Bossfaktor (in Welle 15 etwa 8.148 HP), Tempo 32, 10 % Rüstung. Erreicht sie den Kern, verliert dieser 20 Leben: Niederlage, kein Bossmeilenstein.
- Innerhalb von 200 Weltpixeln wählt sie den Turm mit der höchsten Grund-DPS. Herzfaden kündigt das Ziel 0,8 Sekunden an; anschließend 4,5 Sekunden lang 40 % weniger Feuerrate. Während Ankündigung und Wirkung bleibt sie stehen. Cooldown 11 Sekunden ab Ankündigung, nach Unterbrechung 6 Sekunden.
- Frosttreffer verlangsamen Rosenspiegel, ohne Ankündigung oder Verführung zu unterbrechen. Verkauf des Zielturms beendet den Zauber. Alle Timer laufen in Simulationszeit und bleiben über Pause/Reload erhalten.
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
- Sichtbare Turmstufen sind getrennt vom Zahlenlevel: Darstellung 1 auf Level 1–3, Darstellung 2 auf 4–6, Darstellung 3 ab 7.
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


## B12: Werkstatt II, spätere Level und zweite Bossbegegnung

Werkstatt II kostet einmalig **1.200 Gold**, setzt die geöffnete Lichtung und Frostfassung voraus und hebt die Levelgrenze von 6 auf 20. Kauf, Zeitpunkt und Abbuchung werden gemeinsam gespeichert. Level 1–3 / 4–6 / 7–20 nutzen Grafikstufe I / II / III. Ab Level 7 steigt nur der Schaden, jeweils um 30 %; Reichweite bleibt bei höchstens +30 Weltpixeln, Feuerrate bei höchstens Faktor 1,3. Preise bis Level 6 bleiben unverändert; das nächste Upgrade kostet ab Level 6 `round(Turmpreis × 8,75 × 1,32^(Level−6))`. Kein automatischer Goldverbrauch.

Welle **25** ist Rosenspiegels Rückkehr: ein Boss und zwölf Begleiter, normale HP-Skalierung, dieselbe verständliche Verführungs-/Frostmechanik samt Tanzfenster. Eigener Siegzähler und einmalige **1.200 Gold** Erstprämie, getrennt von Welle 15. Beide Begegnungen können über die Chronik wiederholt werden; Wiederholungen erzeugen keine zweite Erstprämie. Beide Bosswellen bleiben vom Farmen ausgeschlossen. Nach Niederlage bleibt der nächste Vorstoß manuell. Gewöhnliche Wellen bleiben auf 28 Gegner begrenzt, HP-Multiplikator auf 100.000, gleichzeitig fliegende Projektile auf 1.024.

Snapshot **10**, Kampfregeln **6**: `settlement.workshopUpgraded/upgradedAt`, `secondBossVictories` und `bossChallengeWave` ergänzen den Zustand. Schema 9 wird zuerst mit seinen Regeln validiert, dann übernommen; Geld, Gebäude, Lichtung, Türme und laufender Kampf bleiben erhalten. Alte Welle-25-Rekorde erzeugen keinen Bosssieg. Laufende alte Rezepte enden regulär; danach wird eine fehlende Bossbegegnung beim Vorstoß nachgeholt. Aktuelle Farmnachweise werden neu verdient; historische Offline-Belege behalten ihre ursprünglichen Werte und werden nicht rückwirkend verändert.

Nach Werkstatt II zeigt das nächste Ziel einen tatsächlich kaufbaren Turmausbau mit Preis und fehlendem Gold. Wenn alle vorhandenen Türme maximal sind, folgen freie Plätze oder bewusstes Farmen/Vorstoßen. Keine Quest für ein zukünftiges Gebäude. Die Feinabstimmung der gesamten 15-Minuten-Kurve bleibt Gegenstand von B13.

## Kartenrevision 4: Nordbogen und Übernahme

Der Nordbogen liegt bei Rasterzeile 4 statt 2. Einstieg, Kern, Siedlung und der weitere Weg bleiben unverändert; die Route verkürzt sich von 1.680 auf 1.520 Weltpixel (ca. 9,5 %). Keine pauschale Änderung von Gegnertempo oder Turmreichweite. Die vollständige Balance bleibt B13.

Schema 12 / Regeln 8 akzeptiert Layout 4 sowie Layout 3 für den Abschluss alter Versuche. Schema 11 wird zuerst gegen seine originale Geometrie geprüft; laufende Gegner, Geschosse und Timer bleiben exakt erhalten. Erst in einer Wellenpause erfolgt die Kartenumstellung. Unveränderte Turmkoordinaten werden zuerst reserviert, übrige Türme auf nahe freie gültige Plätze versetzt. UID, Level, Investition, Kills und Cooldown bleiben erhalten; Gebäude bleiben stehen. Mara wird nur bei ungültigem Standort/Laufweg angepasst, ohne Zauberzeit zurückzusetzen. Aktuelle Farmnachweise werden entwertet, historische Offline-Belege bis Regel 8 bleiben gültig.

Mobile: vorhandener Maßstab, ein Feld vertikaler Kamerarand, Y-Fokus auf ausgewählte Objekte; dekorative Grasränder sind keine zusätzlichen Bauzellen. Turmauswahl bevorzugt ein belegtes Bodenfeld und berücksichtigt anschließend sichtbare Basis/Waffe, damit hochstehende Grafiken antippbar sind.

## Gegnererweiterung B12c

Aktuell Schema 13 / Regeln 9, Layout 4 (Layout 3 nur für noch laufende Altversuche). Sechs vorhandene Figuren ergänzen die normalen Wellen; Regeln, Richtungen, Heilung und Migrationsgrenzen stehen kompakt in [ENEMIES.md](ENEMIES.md). Der nächste Versuch wechselt auf die neuen Gegnerrezepte. Historische Offline-Belege bleiben erhalten. Gleichzeitige Gegner sind weiterhin auf 28 begrenzt; Quallen auf zwei pro Welle.

## Snapshot 19: optionale Taverne

Schema 18 wird vor der Übernahme validiert und um tavernBuilt=false, tavernBuiltAt=null, tavernSeen=false ergänzt. Der optionale plots.tavern existiert erst nach dem Bau; alte Siedlungsplätze und alle laufenden Kampfwerte bleiben erhalten. Der Besitz erfordert einen tatsächlich verbuchten Sieg über Boss 25 und eine gültige 3×2-Position. Regeln 10 und Layoutrevision 4 bleiben unverändert, weil kein alter Weg oder Platz geändert wird.

buildTavern prüft Freischaltung, Zustand, Gold und Gelände, reserviert Gebäude samt Hof und zieht genau 1.200 Gold ab. Die bestehende BattleSession speichert die gesamte Aktion atomar; fehlgeschlagene Transaktion setzt auch Position und Kosten zurück. Freies Versetzen nutzt die vorhandene UI-Pause. Die zusätzliche südliche Hofreihe ist ausschließlich Tavernenfläche; alte Werkstatt-/Lagerzonen bleiben unverändert. Alle legalen bisherigen Kombinationen lassen dort mindestens einen Tavernenstandort zu.

Der Farmklon normalisiert tavernBuiltAt wie andere reine Bauzeitstempel. Die Taverne hat in B15a keinen Kampf-/Offline-Bonus und keine Rekrutierung; ihre erste spätere Rekrutierung wird in B15b aus vorhandenem Besitz abgeleitet, ohne zweiten Gebäudekauf. Keine Änderung historischer Offline-Ansprüche.
