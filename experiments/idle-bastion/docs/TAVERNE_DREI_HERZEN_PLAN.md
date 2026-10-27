# Taverne: erste Beziehungsetappe bis drei Herzen

Planungsstand: 27.10.2026. Grundlage ist der veröffentlichte Main-Stand
`9b3807e43c0d8efe51263e32606daf1cce59245f`, Schema 31 / Kampfregeln 16.
Der aktuelle Hauptstand liegt im Arbeitsverzeichnis
`C:/Users/madde/.codex/worktrees/english-default/TowerDefense`.
Der Checkout unter `Documents/TowerDefense` steht auf einem älteren Tavernenbranch.

Dieses Dokument beschreibt den empfohlenen künftigen Zustand und die erhobenen
Daten. Es ändert keine Spielregel. Auftrag und Umsetzungsstatus stehen ausschließlich
in [ROADMAP.md](../ROADMAP.md). Ältere Entwürfe in
[TAVERNE_INTERAKTION.md](TAVERNE_INTERAKTION.md), insbesondere alle Berührungen ab
Beginn und zusätzliche Animationsproduktion T09/T10, sind für diese neue
Etappe keine Zielvorgabe.

## Empfehlung in einem Absatz

Herz 2 bleibt schnell erreichbar: drei kurze Gespräche und ein vorhandenes
Geschenk reichen vom Neueinstieg aus. Ab Herz 2 zählt jede Figur ihre nächsten
**30 tatsächlich gewonnenen normalen Wellen**. Danach gibt es garantiert ein
persönliches Geschenk für diese Figur. Genügend Zuneigung und das bewusste
Überreichen dieses Geschenks öffnen Herz 3. Vorstoß und Live-Farming zählen,
Niederlagen löschen nichts. Neue Beziehungen enden vorläufig bei drei Herzen.
Kein Countdown, keine zusätzliche Mindestwelle und keine neuen Animationen.

Die gewünschten 10–15 Minuten sind ein Balancierungskorridor, keine Mindestzeit.
Die Messdaten ergeben bei üblichen betrachteten Farmaufstellungen etwa 9–14½
Minuten, bei fortlaufendem Vorstoß rund 15 Minuten anhand des Medians. Leichte
Farmwellen sind schneller; Verluste, Umbauten und Pausen verlängern den Weg.
Eine strikte Zeitgarantie würde eine zusätzliche Zeitregel oder ein komplexeres
gewichtetes System erfordern. Beides gehört nicht zu diesem schlanken Vorschlag.

## 1. Tatsächlicher Bestand

| Bereich | Aktueller Hauptstand | Konsequenz |
| --- | --- | --- |
| Herzschwellen | 10 / 35 / 70 / 110 / 160 Punkte je Figur | Die ersten drei Schwellen bleiben erhalten. |
| Punkte | Gespräch +8, Berührung +4, Geschenk +12 | Keine neue Zuneigungswährung nötig. |
| Belohnungsfenster | 20 Minuten laufende Simulation; je Figur 2 Gespräche, 3 Berührungen, 2 Geschenke | Muss ersetzt werden; nur Geschenk-Drops zu ändern würde die alte Warteblockade stehen lassen. |
| Normale Geschenke | 1 beim Tavernenbau, je 1 für echte Boss-15-/Boss-25-Nachweise; zusätzlich alle 10 normalen Siege, höchstens 2 pro Zeitfenster | Einmalansprüche und vorhandenen Bestand erhalten; zeitliches Drop-Limit entfällt. |
| Bestand | Gemeinsamer Vorrat, maximal 20 | Persönliches Herz-3-Geschenk getrennt davon führen. |
| Taverne/Mara | Kostenloser Tavernenbau nach gewonnener Welle 12 | Früher Einstieg bleibt möglich. |
| Ilyra | Echter Boss-25-Sieg, Taverne II für 1.200 Gold, bewusste kostenlose Rekrutierung | Keine Herzvoraussetzung für Rekrutierung oder Kampffähigkeit einführen. |
| Berührungen | Hand, Haare, Schulter derzeit alle ab 0 Herzen | Domain-Prüfung und UI müssen gemeinsam gestaffelt werden. |
| Vorhandene Darstellung | Haare verwenden Kopfclip; Hand und Schulter denselben Berührungsclip | Aktive Handberührung auf vorhandenes Kichern umlegen: drei feste, unterschiedliche Reaktionen je Figur ohne neue Assets. |
| Szenen | 5 Momente je Figur, je 3 Textabschnitte; sechs Gesprächsstufen mit je 2 Antworten | Alle Quelldaten bleiben; 1–3 bilden die erste verfügbare Etappe. |
| Hinweise | Geschenkbestand nur innerhalb der Taverne; Siedlungsmarkierungen existieren für Bau/Ausbau/Ilyra | Vorhandene Hinweisstellen um Geschenke erweitern. |

## 2. Konkreter vorgeschlagener Zielablauf

### Zuneigung und Aufstieg

| Abschnitt | Zuneigung durch Gespräche/Berührungen | Geschenkregel |
| --- | --- | --- |
| Einstieg bis Herz 1 | 0 → 10; Gespräche sofort möglich | Einstiegsgeschenk ist sichtbar im Vorrat. |
| Herz 1 → Herz 2 | Bis 23 Punkte sammeln | Ab 23 ein normales Geschenk für +12 und damit 35 Punkte / Herz 2 überreichen. |
| Herz 2 → Herz 3 | Bis 58 Punkte sammeln | Nach 30 Siegen seit Herz 2 das persönliche Geschenk für +12 und damit 70 Punkte / Herz 3 überreichen. |
| Ab Herz 3 | Für neue Beziehungen keine weiteren Punkte | Keine Geschenke verbrauchen; Gespräche, freigeschaltete Berührungen und Momente bleiben verfügbar. |

Die letzte Punktestrecke ist damit ausdrücklich dem Geschenk vorbehalten.
Der Balken zeigt beispielsweise „58 / 70 · Zuneigung bereit“ und daneben
„Persönliches Geschenk: 21 / 30 Siege“. Kein scheinbar unerklärlich blockiertes
69/70 und kein endloses weiteres Punkteklicken.

Bei einem neuen Einstieg ergeben drei belohnte Gespräche +8, +8 und +7 = 23;
das vorhandene Geschenk führt direkt auf 35. Es gibt dazwischen keine Zeit- oder
Wellenpflicht. Herz 1 wird beim zweiten Gespräch erreicht und bleibt als Moment
anklickbar, auch wenn der Spieler direkt weitergeht.

Normale Geschenke unterhalb von Herz 2 erst ab 23 Punkten einlösen, damit der
einzige Einstiegsvorrat nicht vorher aufgebraucht wird. Der Button erklärt:
„Noch X Zuneigung bis zu deinem Geschenk“. Ab Herz 2 können normale Geschenke
weiter Zuneigung bis 58 geben; sie ersetzen niemals das persönliche Geschenk.
Bei 58 Punkten kein normales Geschenk verbrauchen. Ist das persönliche Geschenk
bereit und die Zuneigung ausreichend, hat „Persönliches Geschenk überreichen“
Vorrang. Ist nur das Geschenk bereit, bleibt es erhalten und der Hinweis nennt
die noch fehlende Zuneigung.

### Gesprächs- und Berührungspunkte ohne 20-Minuten-Sperre

Pro freigeschalteter Figur stehen anfangs drei belohnte Gespräche zur Verfügung.
Bei Freischaltung der ersten Berührung stehen drei belohnte Berührungen bereit.
Je drei gewonnene normale Live-Wellen füllen einen Gesprächs- und, soweit bereits
freigeschaltet, einen Berührungsplatz auf; jeweils maximal drei gespeichert.
Ein gemeinsamer Restzähler 0–2 pro Figur reicht. Keine Auffüllung pro Klick,
Neuladen, Fensterwechsel oder Uhrzeit. Kein Zurücksetzen beim Herzwechsel.

Die Berührungsreserve ist ein gemeinsames Punktebudget für alle freigeschalteten
Zonen einer Figur, keine Anzahl verbleibender Benutzungen. Eine neue Zone
vergrößert oder erneuert das Budget nicht. Alle gesammelten Berührungen bleiben
auch bei leerem Punktebudget dauerhaft und beliebig nutzbar.

Gespräche und erlaubte Berührungen bleiben auch mit verbrauchten Punkten möglich.
Hinweis dann beispielsweise „Ohne zusätzliche Zuneigung · neue Punkte nach noch
2 Siegen“. An einer Geschenkgrenze stattdessen die konkret fehlende
Geschenkbedingung anzeigen. Bei drei Herzen nur noch „Gemeinsame Zeit“ und den
Etappenabschluss anzeigen, keine nutzlosen Auffüllhinweise.

Diese kleinen Reserven ersetzen die bisherigen Zeitbudgets vollständig.
Geschenke brauchen kein weiteres Interaktionsbudget: Vorrat, Zuneigungsgrenze und
persönlicher Siegzähler begrenzen sie bereits.

### Wann Geschenke entstehen

| Anlass | Gewährung | Anzeige / Bedingungen |
| --- | --- | --- |
| Taverne wird gebaut | 1 normales Geschenk wie bisher | Einmaliger Hinweis auf Mara; Einlösen nach ausreichender Zuneigung. |
| Echter erster Boss-15-/Boss-25-Nachweis | Je 1 normales Geschenk wie bisher | Bereits beanspruchte Ansprüche nicht wieder vergeben. |
| Ilyra wird rekrutiert | Zusätzlich einmal 1 normales Begrüßungsgeschenk | Sichert ihren schnellen Einstieg unabhängig davon, was Mara erhalten hat. Eigener Claim; bei vollem Vorrat aufschieben. |
| Je 10 normale Siege nach Tavernenbau | 1 normales Geschenk, ohne bisheriges Zwei-pro-20-Minuten-Limit | Nur solange eine rekrutierte Figur unter drei Herzen liegt; Vorrat maximal 20. |
| Eigene 30 Siege nach Erreichen von Herz 2 | Genau 1 persönliches Geschenk für Mara bzw. Ilyra | Garantiert, kein Zufallsdrop, kein Inventarplatz nötig, kein Übertragen an die andere Figur. |

Normale Drop-Zählung ist global; der persönliche Zähler ist je Figur getrennt.
Beide persönlichen Zähler dürfen durch denselben Sieg vorankommen, wenn beide
Figuren bereits zwei Herzen haben. Es entstehen keine nacheinander abzuarbeitenden
60 Pflichtsiege. Gezählt wird ab dem jeweiligen erfolgreich gespeicherten
Herz-2-Aufstieg, nicht ab globaler Spielzeit, Boss 25 oder Tavernenbau. Die nächste
danach abgeschlossene Welle darf bereits zählen.

Für alle Zähler gelten dieselben normalen Live-Siege wie bisher: echte
abgeschlossene Versuche in Vorstoß oder Farming, auch Wiederholungen und Siege
mit Kernschaden. Boss 15/25 geben ihre eigenen einmaligen Geschenke, zählen aber
nicht zusätzlich als normale Welle. Niederlagen geben keinen Fortschritt und
ziehen keinen ab. Interne Farmprüfungen, Offline-Ertragsrechnung, Pause,
verborgener Tab und Replay alter Ereignisse erzeugen keine Siege/Geschenke.
Die automatische Simulation bei geöffneter Taverne zählt regulär weiter.

Bei vollem normalen Vorrat oder abgeschlossener Etappe bleibt angebrochener
normaler Drop-Fortschritt gespeichert, wächst aber nicht weiter. Persönliche
Zähler sind vom normalen Vorrat unabhängig. Kein Geschenk verfällt; ein fertiges
persönliches Geschenk wartet unbegrenzt auf seinen bewussten Einsatz.

## 3. Hinweise aus Sicht des Spielers

| Situation | Anzeige |
| --- | --- |
| Geschenk neu erhalten | Kurzer, nicht blockierender Hinweis: „Geschenk gefunden · in der Taverne ansehen“. |
| Geschenk vorhanden, Zuneigung noch zu niedrig | Ruhiges Geschenksymbol und Bestand; in der Charakteransicht „Noch X Zuneigung“. Keine Aufforderung zu einer unmöglichen Aktion. |
| Normales oder persönliches Geschenk jetzt nutzbar | Markierung am Siedlungstab, an der Tavernenkarte und an der passenden Gefährtinnenkarte. Beschriftung nennt Mara/Ilyra. |
| Persönlicher Fortschritt läuft | Direkt bei der Zuneigung: „Persönliches Geschenk · 18 / 30 gewonnene Wellen“. |
| Persönliches Geschenk fertig, Zuneigung fehlt | „Geschenk für Mara bereit · noch X Zuneigung“. |
| Beide Bedingungen erfüllt | Sichtbarer Button „Überreichen · Herz 3 freischalten“. |
| Drei Herzen erreicht | „Eure Geschichte geht in einem kommenden Update weiter.“ Gesperrte Herzen 4/5 entsprechend kennzeichnen. |

Die bestehende Markierung für Ilyras Rekrutierung/Ausbau bleibt erhalten.
Mehrere Gründe in der Taverne zusammenführen, nicht gegenseitig überschreiben.
Für den Siedlungstab Bau-/Tutorialhinweise priorisieren; Geschenke sind ein
ergänzender Anlass. Keinen neuen Pflichtdialog, Tutorialpfeil, Kamerasprung oder
eine Kampfunterbrechung erzeugen. Boss-/Niederlagenmeldungen haben Vorrang vor
einem Geschenktoast; der dauerhafte Hinweis verhindert, dass ein verdrängter
Toast zum Informationsverlust wird.

Bestand und Einlösbarkeit sind getrennte Zustände. Die auffällige Markierung
verschwindet, sobald keine passende Aktion mehr möglich ist; das ruhige
Bestandssymbol darf bleiben. Bei beiden Figuren auf drei Herzen keine
Einlöseaufforderung. Gespeicherte Geschenke bleiben für spätere Inhalte erhalten.

Toasts nur für neue, erfolgreich gespeicherte Zustandsübergänge in der laufenden
Sitzung. Beim Laden den gespeicherten Ausgangszustand übernehmen, keinen alten
Drop erneut feiern. Ein nicht zugestellter Toast muss nicht extra persistiert
werden: die aus dem Save abgeleitete Markierung übernimmt die Erinnerung.
Sprachwechsel und Bildschirmleser erhalten dieselben konkreten Gründe (DE/EN).

## 4. Inhalte und Darstellung

**Präzisierung auf Nutzerwunsch vom 27.10.2026: Berührungen werden gesammelt.**
Jede neue Freischaltung kommt dauerhaft zu den vorherigen hinzu. Keine Zone
ersetzt eine andere; die nutzbaren Zonen werden nicht durch die jeweils höchste
Herzstufe auf eine einzelne Aktion reduziert. Das gilt unabhängig für Mara
und Ilyra sowie nach Schließen, Figurenwechsel und Neuladen.

| Herzen | Neu hinzugekommen | Dauerhaft aktiv nutzbare Berührungen | Weitere Gesten |
| --- | --- | --- | --- |
| 0–1 | Noch keine | 0 | Sprechen, Geschenk vorbereiten/überreichen. |
| 2 | Schulter | 1: Schulter | „Zusammen lachen“. |
| 3 | Haare | 2: Schulter + Haare | Zusätzlich „Ein Kompliment machen“. |
| 4, später | Hand | 3: Schulter + Haare + Hand | Zusätzlich Maras „Ein wenig necken“. |
| 5, später | Keine weitere Zone nötig | Weiterhin alle 3 | Vorhandene Freischaltungen bleiben erhalten. |

Die bereits geplante Drei-Herzen-Grenze bleibt bestehen: Neue Beziehungen
sammeln in dieser ersten Etappe zwei Berührungen. Die dritte ist mit eigener
Reaktion für die spätere Herz-4-Freischaltung vorbereitet; dadurch wird Herz 4
jetzt nicht erreichbar. Bereits verdiente vier/fünf Herzen behalten alle drei.

### Drei verschiedene Reaktionen beim aktiven Berühren

Feste Zuordnung für beide Figuren; keine zufällige Auswahl aus einem
gemeinsamen Pool, die wieder zwei gleiche Bewegungen ergeben könnte:

| Berührungsstelle | Mara | Ilyra |
| --- | --- | --- |
| Schulter, ab Herz 2 | M03 · Berührungsreaktion (`touch`, 2,8 s) | I03 · Berührungsreaktion (`touch`, 3,2 s) |
| Kopf/Haare, ab Herz 3 | M02 · Kopfreaktion (`head`, 2,0 s) | I02 · Kopfreaktion (`head`, 2,8 s) |
| Hand, ab Herz 4 | M05 · Kichern (`giggle`, 5,4 s) | I05 · Kichern (`giggle`, 4,0 s) |

Alle sechs genannten Clips sind bereits im aktuellen Laufzeitpaket vorhanden.
Der Nutzer erlaubt ausdrücklich, für eine Berührung eine andere vorhandene
Reaktion wie Kichern oder die Hüftpose einzusetzen. Für diesen Plan wird
**Kichern für die Hand bei beiden Figuren** gewählt. Schulter, Haare und Hand
führen dadurch je Figur zu drei unterschiedlichen Bewegungen.

Die Eigenständigkeit bezieht sich auf die drei aktiven Berührungen: Kichern
darf weiterhin auch bei „Zusammen lachen“ vorkommen, die Kopfreaktion beim
Sprechen. Eine vollständige Exklusivität über alle Spielaktionen ist nicht
nötig. Die Hüftpose bleibt bei „Ein Kompliment machen“; keine neue Animation,
kein Zufallspool und keine neue Sprachaufnahme.

Im Berührungsmodus alle bereits freigeschalteten Hotspots gleichzeitig
bedienbar lassen. Nach Aufstieg kurz konkret melden, etwa „Neu: Haare
berühren · jetzt 2 Berührungen verfügbar“. Die gesperrte nächste Zone nennt
ihre Herzbedingung; Hand bei der Drei-Herzen-Grenze zusätzlich „in einem
kommenden Update“. Punktebudget und Freischaltung getrennt erklären.
Nachgeladene Clips dürfen bei Fehlern nicht stillschweigend durch denselben
`touch`-Clip ersetzt werden; Ladestatus/Wiederholen zeigen und keinen zweiten
Punktgewinn durch eine reine Wiedergabe-Wiederholung erzeugen.

Bei neuen Beziehungen Herz 4/5 als spätere Fortsetzung kennzeichnen, nicht mit
erreichbaren Punkteschwellen bewerben. Kein Datum und keine Zusage „im nächsten
Update“. Bereits verdiente hohe Herzen haben Bestandsschutz (siehe Migration).

| Herz | Mara | Ilyra |
| --- | --- | --- |
| 1 | Ein Platz am Feuer | Die Wache darf warten |
| 2 | Mein Glücksstück | Ein Stern ohne Namen |
| 3 | Was ich nicht reparieren kann | Was hinter der Ruhe liegt |

Alle neun Textabschnitte pro Figur bleiben erhalten und beliebig wiederholbar.
Das dritte Herz endet bei Vertrauen und Zugehörigkeit; Liebeserklärung und
weitere Annäherung aus Herz 4/5 werden für neue Beziehungen aufgeschoben, nicht
aus den Quelldaten gelöscht. Keine Behauptung, damit sei schon die gesamte
fünfstufige Liebesgeschichte abgeschlossen.

Schon die ersten Szenen rufen aktuell Schulter-/Haar-/Handclips auf. Frühe
Szenen sollen stattdessen bestehende Kopf-/Ruhebewegungen verwenden. Narration
und Darstellung müssen dabei von der tatsächlich freigeschalteten
Berührungsaktion getrennt werden; ein Kopfclip ist kein Haarstreicheln.
Keine neue Animation, neue Zone oder neue Stimme nötig.

Besonders wichtig bei Hand → Kichern: Aktuell rufen sowohl aktive Berührungen
als auch Storyabschnitte dieselbe Methode `TavernPlayer.play(region)` auf,
und `TavernBeat.clip` ist ebenfalls als Berührungsregion typisiert. Ein bloßer
Austausch in dieser Methode würde deshalb auch ruhige/ernste Herzmomente mit
einem bisherigen `hand`-Eintrag kichern lassen. Für die spätere Umsetzung
aktive Berührungszuordnung und ausdrücklich gewählten Szenenclip trennen
(z. B. getrennte Playeraufrufe für Berührung und Moment). Die bestehende
Szenendramaturgie und Texte erhalten; frühe Momente wie oben mit Kopf/Ruhe
darstellen. Geschenkreaktion, Gespräch, Gestenbuttons und automatische Idle
bekommen keine unbeabsichtigte neue Zuordnung.

Normale Gespräche aktuell stufenabhängig: Ein schneller Aufstieg kann eine
ältere Antwort überspringen. Kleine Lösung ohne neues Archivmenü:
Die zwei aktuellen Antworten zuerst, danach im Gesprächswechsel auch die
bereits freigeschalteten früheren Antworten anbieten. Alle Stufen 0–3 bleiben
so erreichbar; Herz-4-/5-Texte erscheinen nur bei entsprechendem Bestandsschutz.
Ein Laufzeit-Zähler genügt; keine neuen „alles gelesen“-Saveflags oder
Gesprächspflicht. Herzszenen werden weiterhin über ihre Herzen wiederholt.

Generische Berührungsstimmen erst nach einer erlaubten, bestätigten
Berührungsaktion auslösen. Kein Audio durch abgewiesene Hotspots. Die manuellen
Befehlsstimmen auf der Kampfkarte sind unabhängig und bleiben unverändert.
Auch automatische Idle-Varianten auf neue Gestengrenzen prüfen, damit eine
später gesperrte Geste nicht automatisch schon früh läuft.

## 5. Umsetzungsstellen und Datenvertrag

| Quelle | Notwendige Arbeit |
| --- | --- |
| [tavern-social.ts](../src/tavern-social.ts) | Zentrale Angebote, neue Punktbudgets, 23/58-Grenzen, 30-Siege-Geschenk, normale Drops, Claim/Validierung. Alle sichtbaren Sperrgründe hier ableiten. |
| [battle.ts](../src/battle.ts) | Tavernenbau/Rekrutierung, Übergang zu Herz 2, einmalige Clear-Verarbeitung, Social-Schema-Migration. Alten Tick-Reset entfernen. |
| [tavern-interactions.ts](../src/tavern-interactions.ts) | Region und Geschenkart bis zur autoritativen Prüfung reichen; Punkte und Verbrauch gemeinsam atomar speichern. |
| [battle-session.ts](../src/battle-session.ts) | Bestehende Serialisierung/Rollback nutzen. Falls nötig nach erfolgreichem Commit Geschenkübergänge sichtbar machen; keine Zusage vor dauerhaftem Save. |
| [tavern-ui.ts](../src/tavern-ui.ts) | Vorrat, Zähler, Gründe, Empfängerin, 3-Herzen-Etappe, Momente und Gesprächswechsel. Sämtliche gesammelten Hotspots gleichzeitig erhalten, neue Zone verständlich melden; Tastatur/Touch. Alten 20-Minuten-Hilfetext ersetzen. |
| [tavern-animation.ts](../src/tavern-animation.ts), [tavern-rig-preview.ts](../src/tavern-rig-preview.ts), [tavern-presentation.ts](../src/tavern-presentation.ts), [tavern-content.ts](../src/tavern-content.ts), [tavern-companions.ts](../src/tavern-companions.ts) | Kumulative Freigaberegeln und feste Zuordnung Schulter → touch, Haare → head, Hand → giggle je Figur. Aktive Berührung und Szenenclip getrennt ansteuern; benötigte Clips passend laden, keine gemeinsame Ersatzanimation. Historische Präsentation kompatibel halten; keine Umgehung über Playermethoden. |
| [tavern-mara-content.ts](../src/tavern-mara-content.ts), [tavern-ilyra-content.ts](../src/tavern-ilyra-content.ts) | Texte erhalten; frühere Antworten verfügbar halten, nächste Momente passend zur Etappe, Szenenclips anpassen. |
| [main.ts](../src/main.ts), Tavernen-CSS, [locales/en.ts](../src/locales/en.ts) | Bestehende Siedlungs-/Tavernenhinweise und DE/EN-Texte ergänzen. |
| [farming.ts](../src/farming.ts), Offline-/Save-Prüfungen | Ausschluss interner Proben erhalten; soziale Daten gehören nicht in den Verteidigungsfingerabdruck. |

Wichtig: Aktuell kennt die Spiellogik nur die Aktion `touch`, nicht die Region.
Nur `minHearts` in der Oberfläche zu ändern reicht deshalb nicht. Vorschau und
Ausführung müssen dieselbe zentrale Prüfung für Schulter/Haare/Hand verwenden.
Freigabe je Zone mit „erreichte Herzen mindestens Mindestherzen“ ableiten,
nicht mit Gleichheit zur aktuellen Stufe oder einer einzigen aktuellen Zone.
Dauerhafter Besitz folgt den erhaltenen, nicht sinkenden Zuneigungspunkten;
keine zweite widersprüchliche Liste freigeschalteter Berührungen speichern.
Die Clipzuordnung ist je Figur fest definiert und vom Story-Abspielpfad getrennt.

Minimaler neuer gespeicherter Zustand zusätzlich zu Punkten/Vorrat/Claims:
- Je Figur Gesprächsreserve 0–3, Berührungsreserve 0–3, Auffüllrest 0–2.
- Je Figur persönliche Siege 0–30 und Geschenk bereits eingelöst ja/nein.
  „Bereit“ wird aus 30 Siegen und noch nicht eingelöst abgeleitet.
- Ein globaler Rest 0–9 für normale Geschenk-Drops; bisherige
  `lastClearAttempt`-Deduplizierung beibehalten.
- Ein zusätzlicher einmaliger Claim für Ilyras Begrüßungsgeschenk.
- Keine Uhrzeit, zweite Herzanzahl, eigene Geschenk-Währung, Drop-Zufallszahl
  oder gesonderte Benachrichtigungsdatenbank.

Geschenkart und Region sind Befehlsparameter; eine überholte UI-Vorschau darf
keine unzulässige Aktion erzwingen. Mehrfachklick, konkurrierender Save, Fehler,
Figurwechsel und Reload dürfen niemals zwei Geschenke verbrauchen oder zwei
persönliche Belohnungen gewähren. Normale Wellenabschlüsse, Milestone-Claims und
persönlicher Fortschritt aus demselben Sieg bleiben ein konsistenter Snapshot.

## 6. Bestehende Spielstände und weitere Abhängigkeiten

Eine neue Social-Struktur benötigt eine explizite Snapshot-Migration; nächstes
freies Schema nach 31 verwenden. Kampfregeln 16, laufende alte Wellenrezepte,
Speicherkennungen, Gold, Türme, Rekrutierung und Offlinebelege nicht wegen dieser
Änderung neu versionieren oder zurücksetzen. Der Farmfingerabdruck enthält
derzeit keine Social-Daten und soll das beibehalten.

Punkte, normale Geschenke und alte Einmalclaims unverändert übernehmen.
Auch Zwischenwerte 24–34 bzw. 59–69 dürfen nicht abgeschnitten werden:
Beim passenden Geschenk nur bis 35 bzw. 70 ergänzen und den echten Punktwert
anzeigen. Früher bereits erreichte zwei Herzen brauchen kein nachträgliches
Herz-2-Geschenk.

Bei vorhandenen zwei Herzen beginnt der neue persönliche Zähler mit 0;
historische Siege seit diesem Herz sind nicht gespeichert und dürfen nicht
erfunden werden. Bei mindestens 70 Punkten gilt Herz 3 als bereits erreicht;
persönliches Geschenk als erledigt übernehmen. Bereits erworbene Herzen 4/5,
Momente und zugehörige Interaktionen erhalten. Bei solchen vier/fünf Herzen
sind Schulter, Haare und Hand zugleich verfügbar und verwenden bereits die
drei unterschiedlichen geplanten Reaktionen. Ein erneuter Aufstieg oder
Freischaltkauf ist dafür nicht nötig. Zwischenstände oberhalb von 70 ebenfalls
unverändert speichern; ohne künftige Freigabe keinen weiteren Herzaufstieg
gewähren.

Neue Belohnungsreserven einmal bei Migration initialisieren (3 Gespräche für
verfügbare Figuren, 3 Berührungen ab Herz 2). Nicht rekrutierte Ilyra erhält
keine aktiven Punkte/Reserven. Den vorhandenen normalen Drop-Rest übernehmen;
die alte Anzahl „Geschenke in diesem Zeitfenster“ und Tickzeit begrenzen künftig
nichts mehr. Für bereits rekrutierte Ilyra unter Herz 2 ohne Vorrat den neuen
Begrüßungsanspruch einmal gewähren; in anderen alten Rekrutierungsfällen als
erledigt übernehmen, damit der Patch keine ungezielte Zusatzverteilung erzeugt.

Keine Verbindung zu Kampfboni oder der Stärke von Mara/Ilyra hinzufügen.
Taverne II und Ilyras Rekrutierung bleiben von der Beziehung unabhängig.
Der zukünftige Kongregate-Export ist ebenfalls unabhängig. Langsamere
Freischaltung ist eine Inhalts-/Balancemaßnahme, kein Nachweis einer
Plattformzulassung.

## 7. Erhobene Zeitdaten und Grenzen

### Neue kleine Engine-Messung

Am 27.10.2026 auf oben genanntem Main-Code: fünf aufeinanderfolgende
Farmzyklen je Aufstellung/Welle, 18 Kombinationen, insgesamt **90 Siege ohne
Kernschaden**. Zyklen enthalten die normalen zwei Sekunden Zwischenpause.
Keine Dateien des Spiels oder der Spielstände verändert; nur im Speicher
restaurierte Simulationskopien.

Ausgangsstände:
- [B-Snapshots des Early-Balance-Audits](../../../artifacts/idle-bastion/acceptance/early-balance-release/selected/B-snapshots.json):
  `entry15` und `clear25`, bereits Schema 31 / Regeln 16.
- [Kontrollstand 25](../../../artifacts/idle-bastion/acceptance/b16/economy/control-wave25-earned.json),
  [30](../../../artifacts/idle-bastion/acceptance/b16/economy/control-wave30-earned.json),
  [40](../../../artifacts/idle-bastion/acceptance/b16/economy/control-wave40-earned.json):
  vorhandene wirtschaftlich erspielte Aufstellungen, über den aktuellen Restorer
  migriert. Neue Messwellen ausdrücklich mit Rezept 16 gestartet.

Reproduktion: `IdleBattle.restore`, Normalisierung wie `prove` in `farming.ts`
(Intermission, volle Kernleben, leere Queue/Geschosse/Gegner, normale
Turm-Cooldowns, zurückgesetzte Messzeit), danach Fünf-Zyklen-Lauf in
25-ms-Schritten; `clear`-Ereignisse und Kernleben erfassen.
`maraBonus:false`, `ilyraAbilities:false`, `socialRewards:false`;
keine Käufe während der Messung. Das misst die vorhandenen Aufstellungen,
keine komplette neue Spielersitzung. Aktive Heldenfähigkeiten können Zeiten
weiter verkürzen. Alle fünf Zyklen je Tabellenwert waren identisch.

Sekunden je vollständigem Zyklus; „–“ bedeutet nicht gemessen:

| Farmwelle | B vor Boss 15 | B nach Boss 25 | Kontrolle 25 | Kontrolle 30 | Kontrolle 40 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 11,825 | 11,825 | 9,375 | 9,375 | 9,375 |
| 7 | 13,800 | 13,800 | – | – | – |
| 12 | 17,350 | 12,925 | 12,450 | 12,450 | 10,700 |
| 14 | 22,450 | – | – | – | – |
| 23 | – | 27,200 | 24,100 | 23,275 | 19,200 |
| 24 | – | 28,875 | – | – | – |

### Bestehende vollständige Vorstoßläufe

Zusätzlich ausgewertet, nicht neu gespielt:
[runs.json des Early-Balance-Release-Passes](../../../artifacts/idle-bastion/acceptance/early-balance-release/selected/runs.json).
93 gewonnene normale Vorstoßversuche von Welle 12 bis 24 (ohne Boss 15):
Median einschließlich zwei Sekunden Zwischenpause **30,275 s**,
arithmetisches Mittel **32,487 s**, Spanne **16,675–64,425 s**.
Die sechs dort enthaltenen Farmversuche haben einen Median von **14,825 s**.
Das sind Beobachtungen aus vorhandenen Profilen, keine Verteilung aller Spieler.

### Daraus abgeleitete Drop-Wahl

| Beispiel | Normales Geschenk nach 10 Siegen | Persönliches Geschenk nach 30 Siegen |
| --- | ---: | ---: |
| Frühe Farm 12, B vor Boss 15 | 2,89 min | 8,68 min |
| Frühe Farm 14, B vor Boss 15 | 3,74 min | 11,23 min |
| Farm 23, B nach Boss 25 | 4,53 min | 13,60 min |
| Farm 24, B nach Boss 25 | 4,81 min | 14,44 min |
| Farm 23, Kontrolle 30 | 3,88 min | 11,64 min |
| Farm 23, Kontrolle 40 | 3,20 min | 9,60 min |
| Vorstoß anhand Median | 5,05 min | 15,14 min |
| Sehr leichte Farm 1, Kontrolle 25–40 | 1,56 min | 4,69 min |

**Empfehlung bleibt 30 normale Siege je Figur nach Herz 2.**
35 wären bei frühen Farmwellen näher an zehn Minuten, würden aber beim
beobachteten Vorstoß-Median schon 17,66 Minuten und beim Mittel 18,95 Minuten
bedeuten. Zehn Siege wären offensichtlich zu kurz. Ein festes Ziel wie
„Welle 30 erreichen“ wäre insbesondere bei Ilyras späterem Einstieg ungeeignet.

Das persönliche Geschenk ist an Spielfortschritt gebunden, nicht an die
Garantie von zehn verstrichenen Minuten. Bewusst sehr leichte Live-Farmwellen
dürfen schneller sein. Falls eine echte Mindestdauer später ausdrücklich
gewünscht wird, wäre das eine neue Designentscheidung; keine versteckte
Zeitsperre in diese Umsetzung einbauen.

## 8. Kompakte Abnahme der späteren Umsetzung

Die fünf Umsetzungspakete T12.1–T12.5 mit Reihenfolge, Abhängigkeiten,
Arbeitscheckboxen und Abschlusskriterien stehen ausschließlich in der
[Roadmap](../ROADMAP.md). Dort werden aktueller Stand, nächster Schritt und
tatsächliche Ergebnisse beim Abarbeiten gepflegt. Dieser Fachplan enthält
weiterhin die Regeln und Prüffälle, keine zweite Arbeits-/Statusliste.

Gezielte Social-, Interaktions-, Content- und Session-Prüfungen gehören schon
zum jeweils betroffenen Paket. Die abschließende Gesamtprüfung ergänzt die
zusammenhängenden Mara-/Ilyra-Abläufe, Zeitmessung, Produktionsbuild und echte
Browserprobe. Bereits bestandene Einzelprüfungen nur bei Folgeänderungen oder
neuen Befunden wiederholen. Die Paketstruktur ändert weder die Spielregeln
dieses Plans noch den rein vorbereitenden Umfang des aktuellen Auftrags.

Erwartete überprüfbare Abläufe:
- Beide Figuren separat: 0 → 8 → 16 → 23 → Geschenk → 35;
  Herz-1- und Herz-2-Moment bleiben erreichbar. Ilyra hat einen garantierten
  Einstiegsvorrat, auch wenn Mara vorher alles verbraucht hat.
- 29 Siege geben kein persönliches Geschenk; Sieg 30 genau eines.
  Beide Empfängerinnen zählen unabhängig bzw. gleichzeitig. Geschenk vor
  genügend Zuneigung wartet; genügend Zuneigung vor Geschenk wartet ebenfalls.
- Vorrat 20, normale Zehnergrenze, Bossclaims und persönliches Geschenk
  gleichzeitig; keine verlorene persönliche Belohnung oder Doppelgewährung.
- Allein Gespräche/gesparte normale Geschenke können die reservierten
  Herzgrenzen nicht überschreiten. Nach 70 kein Verbrauch oder Punkteanstieg;
  erlaubte Gespräche/Berührungen/Momente funktionieren weiter.
- Kumulative Freischaltungen separat für Mara/Ilyra: Herz 2 nur Schulter;
  Herz 3 Schulter und Haare; bereits verdienter Herz-4-/5-Spielstand alle drei.
  Nach Figurenwechsel, Neuladen und leerem Punktebudget bleiben alle
  freigeschalteten Zonen nutzbar. Neue Zone ersetzt keine alte und füllt das
  gemeinsame Punktebudget nicht auf.
- Aktive Schulter/Haare/Hand wählen pro Figur exakt `touch`/`head`/`giggle`.
  Auch nach erneutem Antippen oder Ladeverzug keine zufällig gleiche bzw.
  stillschweigend gemeinsame Ersatzanimation. Vorhandene Runtime-Atlanten
  nutzen; keine neue Assetproduktion.
- Storymomente mit bisherigen Hand-Einträgen behalten passende Szenenbewegungen
  und erhalten nicht versehentlich die neue Kicherreaktion. Sprechen,
  Geschenkfreude, Gestenbuttons und automatische Idle weiterhin korrekt.
- Falsche Berührungsregion, alte Buttonvorschau, Doppelklick, Speicherfehler,
  Reload und verlorener Schreibbesitz: kein Punkt-/Geschenkverlust.
- Vorstoß/Farming zählen, Niederlage löscht nichts; Offline, interne Farmprobe,
  Pause und Neuladen zählen nicht. Reine Social-Aktion ändert keinen gültigen
  Farmnachweis oder Offline-Ertrag.
- Alte Saves ohne Taverne, mit gesperrter Ilyra, an 23/34/35/58/69/70/109/110/160
  Punkten und mit alten Claims/Restzählern laden und erneut speichern.
- Desktop und 390/320 px in DE/EN: Geschenkbesitz versus Einlösbarkeit,
  Siedlungsmarkierung, beide Figuren, Herzszenen, abgesperrte Zonen,
  Fortsetzungshinweis, keine störende Pflichtunterbrechung.
- Gesprächspool enthält alle schon freigeschalteten Antworten; keine neuen
  Herz-4-/5-Texte bei frisch auf drei Herzen begrenzten Beziehungen.

Vor Veröffentlichung außerdem zwei kurze echte Abläufe Mara/Ilyra mit dem neuen
System zeitlich protokollieren. Die obigen Messungen kalibrieren den Plan; sie
sind kein Test einer bereits implementierten neuen Geschenklogik.

