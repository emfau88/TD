# Taverne — Zuneigung, Interaktionen und Animationsproduktion

Planungsstand: 21.10.2026. Geprüfter Ausgangspunkt: `61b95c0` auf `codex/idle-bastion-vertical-slice`.

Dieses Dokument hält Fachregeln und Abnahmekriterien fest. **Die einzige Arbeits- und Statusliste mit Checkboxen bleibt [ROADMAP.md](../ROADMAP.md), T01–T07.** Nach dem Dokumentationsauftrag wurde T01 am 21.10.2026 ausdrücklich zur Umsetzung mit kompakter Prüfung, Commit/Push und Vorschaulink beauftragt. Die visuelle Nutzerabnahme einschließlich Haarkorrektur (`fcc7bc1`) wurde am 21.10.2026 ausdrücklich erteilt; siehe Roadmap und T01-Bericht. T02–T07 benötigen weiterhin einen separaten Startauftrag; der ältere zitierte Auftrag aus einem anderen Chat begründete selbst keine Freigabe.

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

## Zuneigung und Geschenke

Ziel ist sinnvoller Fortschritt über ungefähr **3–5 aktive Spielsitzungen je Figur**, nicht 13 oder mehr Pflichtbesuche an unterschiedlichen Kalendertagen. Die durchschnittliche aktive Sitzungsdauer und daraus abgeleitete Werte werden in T03 konkretisiert und in T05 anhand des gesamten Ablaufs geprüft. Neustart/Reload zählt nicht als zusätzliche Sitzung.

Die früher vorgeschlagenen Schwellen 20/60/120/200/300 und zwei Gespräche plus drei Berührungen täglich sind **nicht beschlossen und nicht zu übernehmen**. Vor Umsetzung Werte, Wiederholungsregeln und begrenzte Geschenkquelle gemeinsam dokumentieren; keine versteckte Pflicht zum täglichen Login. Nach ausgeschöpfter Punktebelohnung bleiben Dialog/Animation verfügbar und zeigen transparent, dass aktuell keine weiteren Punkte entstehen. Keine Zuneigungsverluste durch Abwesenheit.

Genau ein Gegenstand `Geschenk`, gemeinsamer Bestand, bewusst ausgewählte Empfängerin. Neben Start- und Bossgeschenken soll eine begrenzte Quelle durch reguläres aktives Spielen verfügbar werden. Kandidat: gespeicherter Fortschrittszähler für tatsächlich gespielte Wellen mit begrenzter Ausgabe; Intervall und Obergrenze in T03 festlegen. Keine Belohnung durch interne Farmnachweise, automatisches Reload oder unbegrenzte Offline-Nachberechnung. Gespräche/Berührungen ermöglichen Fortschritt ohne Geschenke.

Fünf Herzen brauchen fünf konkrete wahrnehmbare Freischaltungen. Mögliche Staffelung: vertrautere Begrüßung, zusätzliche Gesichtsreaktion, weitere Nähe/Hand an der Taille, kurze Umarmung, persönliche romantische Abschlussszene. Genaue Zuordnung und Inhalte vor Produktion in T05 festlegen. Anfangs Hand, Haare und Schulter; abweichende Mockup-Zonen nicht automatisch übernehmen. Gesperrte Bereiche geben keine Punkte; zurückhaltende Reaktionen passen zum aktuellen Verhältnis. Mara bleibt direkt/neckisch, Ilyra eher reserviert. Keine große Film- oder Szenenbibliothek.

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
