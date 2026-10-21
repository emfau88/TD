# Fortlaufende Roadmap — SPIRE: Idle Bastion

Stand: 21.10.2026 · Branch `codex/idle-bastion-vertical-slice` · [Spiel testen](https://emfau88.github.io/TD/idle-bastion/)

**Aktuell:** T01 wurde am 21.10.2026 ausdrücklich einschließlich Commit/Push und Vorschaulink beauftragt. Mara-Atlas und isolierte Vorschau sind als `89fa694` veröffentlicht; Build, kompakte Steuerungsprüfung und Pages-Browserprüfung (Desktop/Hochkant) bestanden. [Nachweis](../../artifacts/idle-bastion/acceptance/t01/REPORT.md). **Nach T01 auf die visuelle Nutzerfreigabe warten.** T02–T07, F03–F05 und übrige Akt-II-Pakete nicht automatisch starten. B14/G2 bleiben offen.

Diese Liste ist das einzige aktuelle Arbeitsboard. Die Nummern zeigen die sinnvolle Bearbeitungsreihenfolge; vorhandene Bulk-IDs bleiben erhalten. `[x]` = umgesetzt und geprüft, `[ ]` = offen. Bisherige Arbeit wird nicht gelöscht: [vollständiges Archiv mit alten Checklisten, Entscheidungen und Abnahmen](ROADMAP_ARCHIVE_2026-10-20.md). Fachregeln: [Auftrag](README.md), [Technik](docs/TECHNIK.md), [Grafik](docs/ART_DIRECTION.md), [Akt II](docs/AKT_II.md), [Tavernenplan](docs/TAVERNE_INTERAKTION.md), [Abnahmeplan](docs/ABNAHME.md).

- [x] **01 · B01–B04 — Fundament.** Separater Idle-Einstieg, automatische Wellen, Bauwirtschaft, konsistenter Spielstand, sicheres Farmen/Offline-Gold und Tab-Eigentümerschaft. [Nachweise](../../artifacts/idle-bastion/acceptance/p1/REPORT.md).

- [x] **02 · B05–B07 / G1 — Erster Spielkreislauf.** Startlichtung, Mara, Werkstatt und Frosttechnologie. Die ursprüngliche 90-Sekunden-Zwischenabnahme wurde am 18.10.2026 ausdrücklich freigegeben; spätere Lernpausen begrenzen nicht die Lesezeit. [Zwischenabnahme](../../artifacts/idle-bastion/acceptance/90s/REPORT.md).

- [x] **03 · B07a/B07b und UI-Nachbesserungen — Karte im Mittelpunkt.** Kompaktes HUD/Dock, mobile Hochkantansicht und Vollbild, Fortschritt/Income/Chronik, gestaltete Pixeloberflächen, besser lesbare Ziffern. [Oberfläche](../../artifacts/idle-bastion/acceptance/ui/REPORT.md), [Orientierung](../../artifacts/idle-bastion/acceptance/ui/PROGRESS.md).

- [x] **04 · B08/B09 — Wisp und Lager.** Vier Turmrollen, Wisp als Wirtschaftsgefährte, Lager und verständliche Rückkehrbelohnung. [B08](../../artifacts/idle-bastion/acceptance/p3/B08.md); übrige historische Nachweise im Archiv.

- [x] **05 · B10–B12 — Bosse, Lichtung und Werkstatt II.** Rosenspiegel mit Tanzfenster/Herzen, erster Gebietsbesitz, zweiter Boss und spätere Turmstufen. Tanz durch Frost nicht mehr unterbrochen; Bau schließt das Menü. [B10](../../artifacts/idle-bastion/acceptance/p4/B10.md), [B11](../../artifacts/idle-bastion/acceptance/p4/B11.md).

- [x] **06 · B12a–B12c — Freie Verteidigung und Gegnerbestand.** Drei bebaubare Felder entlang beider Wegseiten, freie Figurenbewegung/Fernzauber, frei platzierbare Siedlung und Bauanimationen, Nordbogen mit mobiler Kamera, zusätzliche vorhandene Gegnerrollen. [Gestaltung](../../artifacts/idle-bastion/acceptance/p4/REDESIGN.md), [Karte](../../artifacts/idle-bastion/acceptance/p4/MAP.md), [Gegner](../../artifacts/idle-bastion/acceptance/p4/ENEMIES.md).

- [x] **07 · B13 — Verlauf und Balance von Akt I.** Legal gespielte 15 Minuten, unterschiedliche Investitionen, Rückkehrprobe und Balance mit erweitertem Gegnerbestand. Diese Abnahme beweist keine Endlos- oder spätere Zwei-Fronten-Balance. [Bericht](../../artifacts/idle-bastion/acceptance/15min/REPORT.md).

- [x] **08 · Einstieg und Anschluss — Verständlich lernen.** Mara begrüßt, Spieler baut den Startturm, geführte Upgrade-/Werkstatt-/Frostfolge mit echten Menüzeigern und Lernpausen. Werkstatt-Bausatz, sichtbarer Bau, danach Wisp vom Kern, Mara-Einführung, optionale Steinschleuder/Lagerhinweise. Schließbare Niederlagenhinweise und sichtbarer Mara-Boost. [Menüführung](../../artifacts/idle-bastion/acceptance/onboarding/menu-guide/REPORT.md), [spätere Darstellungsfixes](../../artifacts/idle-bastion/acceptance/onboarding/readability/REPORT.md). Alte Saves behalten ihren Fortschritt.

- [x] **09 · F01 — Frostturm-Anker.** Sockel und Kristall stehen in Vorschau und allen Ausbaustufen auf derselben Bodenhöhe wie die Nachbartürme. [Nachweis](../../artifacts/idle-bastion/acceptance/f01/REPORT.md).

- [x] **10 · B15a — Taverne und Gebäudeoptik.** Nach tatsächlichem Boss-25-Sieg Taverne für 1.200 Gold bauen. Werkstatt II mit eigenem Gebäudeasset; Gebäude tragen dezente Namen. [Bericht](../../artifacts/idle-bastion/acceptance/b15/REPORT.md).

- [x] **11 · B17a, vorgezogen — Siedlung am Kern.** Nutzbare Basisfläche für Werkstatt, Lager und Taverne; freiwilliger kostenloser Umzug, alte Standorte und Lichtungsbesitz bleiben erhalten. Ostkorridor reserviert. Navigation per Mausziehen/Touch, keine zusätzlichen Front-/Basis-Buttons. [Bericht](../../artifacts/idle-bastion/acceptance/b17a/REPORT.md).

- [x] **12 · B15b — Ilyra und Gefährtenübersicht.** Bewusste kostenlose Rekrutierung in der gebauten Taverne, selbst gewählter Standort und gezielte Sternensalve; Automatik erst nach erster manueller Anwendung. Mara, Wisp und Ilyra zusammen in der Taverne. Lauf-/Zauberatlas, vollständiger Save-Erhalt und Farmnachweis ohne Salve. [Bericht](../../artifacts/idle-bastion/acceptance/b15b/REPORT.md), [Grafik und Vorschau](assets/ilyra/README.md).

- [x] **13 · Turmbau-Kamera.** Normale Turmauswahl behält Ausschnitt und Zoom bei allen vier Typen; nur echte geführte Bauaktionen fokussieren. Desktop-/Hochkantprobe einschließlich Scharfschützenbau und Starttutorial bestanden. Veröffentlicht als `d81e0c0`; [Pages-Lauf](https://github.com/emfau88/TD/actions/runs/39486392137).

- [x] **14 · F02 — Ilyras Darstellung und lesbare Salve.** Schwarze Verbindungen zwischen Körper und Speer gezielt transparent korrigiert (78 Pixel, übrige Figur/Anker unverändert). Neue Salven laufen 35 % länger; Schaden und 28-s-Cooldown bleiben gleich, alte laufende Salven behalten ihr Timing. Acht gezielte Tests, Build, kurze Desktop-/Hochkantprobe und Atlasvergleich bestanden. [Bericht und Vorher/Nachher](../../artifacts/idle-bastion/acceptance/f02/REPORT.md). Keine Idle-Animation umgesetzt.

- [ ] **15 · T01 — Mara-Animationsprobe. Geliefert und technisch geprüft; visuelle Nutzerabnahme offen.** Kleine isolierte Qualitätsprobe, keine Gameplay-/Save-Änderung. [Vorschau](https://emfau88.github.io/TD/idle-bastion/mara-check.html) · [Nachweis](../../artifacts/idle-bastion/acceptance/t01/REPORT.md). [Grafikvertrag und Abnahme](docs/TAVERNE_INTERAKTION.md#animation-und-visuelle-zwischenabnahme).
  - [x] Original-Mara als verbindliche Referenz verwenden; Bildausschnitt, Pixelmaßstab, Anker und Assetbedarf vor Produktion festlegen.
  - [x] Eine ruhige echte Idle-Animation und genau eine Schulter-Berührungsreaktion mit Kopf-, Arm-/Schulter- und Körperbewegung samt sauberer Rückkehr produzieren; keine weiteren Reaktionen/Figuren.
  - [x] Separate HTML-Vorschau mit Antippen/Klick, Einzelbildern bzw. Atlas und dokumentierten Framezeiten liefern; schnelle Wiederholungen dürfen die Animation nicht zerreißen.
  - [x] Kurz auf Desktop und normalem mobilem Hochkant prüfen: Identität, Transparenz, Bewegung, Loop, Lesbarkeit und Ladeverhalten. Vorschau erst nach Veröffentlichungsfreigabe committen/pushen und erreichbaren Link prüfen; keine erfundene Abnahme.
  - [ ] **Visuelle Nutzerabnahme dokumentieren. Hier anhalten.** Bei unzureichendem Ergebnis zuerst Produktionsmethode korrigieren; T02–T07 nicht automatisch beginnen.

- [ ] **16 · T02 — Tavernenstufen und Bestandsschutz. Geplant; nach T01-Abnahme und Startauftrag.**
  - [ ] Nach erfolgreich abgeschlossener Welle 12 einmaligen kostenlosen Taverne-I-Bausatz anbieten; optionaler Siedlungshinweis, keine neue Pflichtpause.
  - [ ] Ausbau auf II für 1.200 Gold erst nach tatsächlichem Boss-25-Sieg; Ilyra erst mit II und Bossnachweis bewusst kostenlos rekrutieren. Befehle, Save-Prüfung und UI gemeinsam anpassen.
  - [ ] Bereits gebaute alte Taverne als II erhalten, ohne erneute Zahlung; alte Rekrutierung, Positionen, Gold und Offline-Ansprüche bewahren. Veteranen ohne Taverne erhalten bei erfülltem Fortschritt den Bausatzanspruch.
  - [ ] Gezielt neue/alte Saves mit und ohne Taverne/Ilyra, Reload und doppelte Bau-/Ausbauaktionen prüfen; bestehende Kampfeinführung erhalten.

- [ ] **17 · T03 — Zuneigung, Geschenke und Balancebasis. Geplant; benötigt T02.**
  - [ ] Punkte je Figur, daraus abgeleitete fünf Herzstufen, gemeinsamer Geschenkbestand, Einmalansprüche und begrenzte Interaktionsbelohnungen im bestehenden transaktionalen Save speichern.
  - [ ] Startgeschenk und Boss-15-/Boss-25-Geschenke einmalig vergeben, belegte alte Ansprüche berücksichtigen; kein zusätzliches Bossgold, keine Farm-/Offline-Duplikate. Verbrauch und Zuneigung gemeinsam speichern/zurückrollen.
  - [ ] Ziel von ungefähr 3–5 aktiven Spielsitzungen je Figur konkretisieren: Sitzungsdauer, Herzschwellen, Interaktionsgrenzen und begrenzte regulär erspielbare Geschenkquelle festlegen. Frühere Tageslimits/Zahlen sind verworfen, nicht implementieren.
  - [ ] Reload/Mehrfachklick/Schreibfehler und Zeitgrenzen gezielt prüfen; Neustart ist keine neue Belohnungssitzung. Keine Kampfboni, kein Zuneigungsverfall oder Login-Zwang.

- [ ] **18 · T04 — Kompakte Taverne mit Mara. Geplant; benötigt T01-Abnahme und T03.**
  - [ ] Ein Tavernenfenster mit Übersicht, Charakteransicht und darin umschaltbarem Berührungsmodus; Sprechen/Berühren/Schenken, Empfängerin und Geschenkbestand klar darstellen.
  - [ ] Freigegebene Idle-/Berührungsanimation integrieren; weitere benötigte Einstiegsreaktionen für Hand/Haare erst jetzt produzieren. Reaktionen über Figur/Bereich/Herzstufe als Daten konfigurieren.
  - [ ] Ilyras Sperrbedingungen nennen, Wisp über Gefährtenverwaltung erreichbar halten; Gebäudeverschieben und schnelle Kampfsteuerung außerhalb der romantischen Ansicht erhalten.
  - [ ] Kampf läuft grundsätzlich weiter, bestehende Pause bleibt bestehen; kleiner Status und schließbarer Hinweis bei Kernschaden/Niederlage mit Rückweg zum Kampf. Hochkant, Touchflächen, Zurück/Schließen und ungestörte Animation prüfen.

- [ ] **19 · T05 — Maras fünf Herzstufen. Geplant; benötigt T04.**
  - [ ] Für jede Stufe konkrete neue Dialoge, Posen/Reaktionen oder kurze persönliche Szene definieren; anfangs Hand/Haare/Schulter, spätere Nähe stufenweise.
  - [ ] Nur tatsächlich benötigte zusätzliche Animationen herstellen; passende Reaktionen wiederverwenden, keine Vollproduktion aller Bereich-mal-Stufe-Kombinationen.
  - [ ] Verlauf über die in T03 definierten aktiven Sitzungen prüfen und Werte nachstellen; kein endlos belohntes Antippen und keine langen künstlichen Wartezeiten.
  - [ ] Sichtbare Belohnung jeder Stufe, Reload und eindeutige gesperrte/verfügbare Aktionen prüfen. Erst mit fünf ausgearbeiteten Stufen als vollständiges Mara-System bezeichnen.

- [ ] **20 · T06 — Ilyras Taverneninteraktionen. Geplant; benötigt T05.**
  - [ ] Freigegebene Ilyra-Identität übernehmen; eigene Referenz/Idle/Reaktionsprobe visuell prüfen, danach erforderliche Inhalte für fünf Herzstufen ergänzen.
  - [ ] Gemeinsame Technik und Geschenkbestand verwenden, aber eigene Persönlichkeit, Dialoge und Animationen; romantisch erst nach regulärer Rekrutierung verfügbar.
  - [ ] Keine Änderung an Sternensalve, Standort, Einführung oder Automatik; Speerzwischenräume/Transparenz, Ladebudget und Figurenwechsel kurz prüfen.

- [ ] **21 · T07 — Gemeinsame Abnahme und Veröffentlichung. Geplant; benötigt T06.**
  - [ ] Betroffene Speicher-/Belohnungsfälle zusammen prüfen, einschließlich alter Taverne ohne Ilyra, Zeitgrenzen, Farmen/Offline und laufender Kampf; keine komplette alte Testserie ohne Anlass wiederholen.
  - [ ] Desktop-/Hochkantablauf vom Öffnen über Interaktion/Figurenwechsel bis Rückkehr zum Kampf prüfen; Build und tatsächlich durchgeführte Prüfungen dokumentieren.
  - [ ] Roadmap/README und wenige aussagekräftige Screenshots aktualisieren. Nach Freigabe committen/pushen und Pages-Playlink prüfen; Veröffentlichung nicht aus dem Planungsauftrag ableiten.

- [ ] **22 · F03 — Einschläge korrekt hinter Vordergrundtürmen. Geplant, unabhängig vom Tavernenplan.** Nutzerbefund: Effekte auf dem Weg übermalen Türme unterhalb des Weges, besonders bei dichter Bebauung an den Tutorialplätzen. Welt-Effekte nach ihrem Boden-/Trefferpunkt einsortieren; Bodenringe, Fluggeschosse, Treffer und bewusst darüberliegende UI/Zauberanzeigen unterscheiden. Kein pauschales Absenken aller Effekte unter alle Türme. Bestätigter Ansatzpunkt: `combat-effects.ts` legt Einschläge pauschal auf Tiefe 5502, Türme liegen bei Welt-Y + 1000. Zusätzlich `battle-scene.ts` und `ilyra-view.ts` einbeziehen. Fertig nach kurzer Szene mit Türmen ober-/unterhalb des Weges, Frost/Flächenschaden und Ilyra, auch in Hochkant; Kampflogik bleibt gleich.

- [ ] **23 · F04 — Ilyras Idle-Animation. Nur vorgemerkt.** Ruhige Atmung/kleine Gewichtsverlagerung, dezente Haar-/Umhang- oder Speerbewegung in allen Richtungen. Bestehende Figur, feste Füße und saubere transparente Zwischenräume erhalten. Keine laufende Zauberpose oder dauernden Kampfeffekte im Stand; weiche Übergänge zu Gehen/Zaubern, Pause hält an. Erst kleine Standprobe in Spielgröße abnehmen, dann benötigte Frames ergänzen.

- [ ] **24 · F05 — Maras Idle-Animation. Nur vorgemerkt, eigener Punkt.** Passende ruhige Standbewegung aus ihrer vorhandenen Pixelart, gleiche Bodenanker und klarer Unterschied zwischen Ruhe, Laufen und Übertakten. Keine Gameplay-/Cooldown-Änderung; Pause und Übergänge prüfen. Separat umsetzbar, keine neue Figurengestaltung.

- [ ] **25 · B16 — Sturmlicht und Forschungsicons. Geplant.** Vorhandenen Turm 05 mit drei Stufen verwenden; Kettenblitz auf bis zu drei verschiedene Ziele, begrenzte Sprungreichweite/abnehmender Schaden, kein Mehrfachtreffer und keine Bossunterbrechung. Nach Ilyras Einführung etwa ab Welle 28 Forschung in der Werkstatt anbieten, bewusst für Gold kaufen; Forschung und Baupreis unterscheiden. Kleine Icons mit Häkchen/antippbarem Nutzen zeigen erforschte Technologien, gesperrte nennen Voraussetzungen; Frost und vorhandene Forschung einbeziehen, keine neue HUD-Leiste. Fertig bei erkennbarer Rolle gegenüber Einzel-/Flächenschaden und korrektem Upgrade/Mara/Verkauf/Reload während einer Kette. [Fachentscheidungen](docs/AKT_II.md).

- [ ] **26 · B14, vorgezogener Teil — Speicherrisiken vor zwei Routen. Geplant.** Nur die für Ostfront/alte Ansprüche relevanten offenen Speicherprobleme gezielt schließen: laufender Kampf, Tab-Eigentümerschaft, unterbrochene Claims/Schreibfehler und Bestandsschutz. Dieser Teil ist Voraussetzung für B18-Veröffentlichung, ersetzt nicht B14 insgesamt und keine G2-Nutzerabnahme.

- [ ] **27 · B17b — Große Osthälfte vorbereiten. Geplant.** Auf B17a/core40 aufbauen; Ziel ungefähr 56×16 Zellen, Endmaß nach taktischer Probe. Rechts ähnlich viel Verteidigungsraum wie links, Weg zum unveränderten Kern, mindestens zwei nutzbare Abschnitte und bis drei Baureihen pro Seite. Mobile Auswahl erreichbar halten; keine Konflikte mit Siedlung, alten Türmen oder früheren Standorten. Vorhandenes Gelände und Lichtungsbesitz/Gutschrift erhalten, keine doppelte Gebietsgebühr. Mausziehen/Touch bleiben Navigation, keine West-/Kern-/Ost-Sprungbuttons. Bis B19 nur intern vorbereiten, keine kostenpflichtige leere Erweiterung veröffentlichen.

- [ ] **28 · B18 — Zwei Routen und sichere Fortsetzung. Geplant, zwei Teilschritte.** Erst Routenzuordnung/Reststrecken-Zielwahl und Kampf, danach Migration/Farmnachweise. Alte Westgegner, Geschosse und aktive Fähigkeiten exakt fortsetzen; eine Welle, ein Goldkonto, ein Kern, eine Belohnung. Gemischte Rezepte mit gemeinsamem Budget. Historische Offline-Ansprüche erhalten; sichere Basis für genau die neue Verteidigung und Rezeptzusammensetzung ohne aktive Mara-/Ilyra-Zauber belegen. Reine West-Farmwellen bleiben erlaubt, keine stillen Ostspawns oder Offline-Bossfreigaben. Niederlage führt sicher zurück, Vorstoß bleibt bewusst. Fertig nach gezieltem Reload, Einmalbelohnung und Rückfallprüfung; B17b/B18 erst mit B19 öffentlich aktivieren.

- [ ] **29 · B19 — Ostfront bewusst eröffnen. Geplant.** Nach Taverne/Ilyra und passendem Fortschritt: Gebiet ansehen, Verteidigung vorbereiten, ausdrücklich öffnen. Wenig Gold erlaubt weiteres Westfarmen; kein Überraschungsangriff beim Laden. Zunächst einzelne Ostangriffe, dann wechselnde Schwerpunkte; kompakte Front-/Gefahrenanzeige, kurze schließbare Hinweise, freie Kampfzone. Veteranen behalten Rekord/Besitz und bekommen eine gestaffelte Einführung ohne zweite Wellenzählung oder erfundene Bossabschlüsse. Fertig, wenn Erstzugang, Reload der Vorbereitung und mobile Übersicht verständlich funktionieren. Erste öffentliche Ostfront erst hier.

- [ ] **30 · B20 — Glutwerfer. Geplant.** Vorhandenen Turm 07 samt korrekt ausgeschnittenen Effekten verwenden. Bodenzone/Brandschaden mit Frost kombinieren; stärkste Brandquelle und eindeutige Erneuerungsregel statt unbegrenztem Stapeln, Flieger als Schwäche. Keine Bosszauber-Unterbrechung. Forschung ungefähr Welle 33–35 bewusst in der Werkstatt kaufen und als Icon anzeigen. Quelle/Schaden/Restzeit bleiben bei Verkauf/Reload erhalten; überlappende Brände und letzte Kills kompakt prüfen.

- [ ] **31 · B21 — Verlauf 26–40 und Boss 40. Geplant, zwei Teilschritte.** Erst Wellen/Wirtschaft, dann eigener Bossabschnitt. Folge: Boss 25 → Taverne/Ilyra → Sturmlicht → vorbereitete Ostfront → Glutwerfer → Doppelangriffe → Boss 40. Vorhandenen Leerenfalter ab Welle 28 berücksichtigen; Zusammensetzung statt bloßer HP-Sprünge. Gesamtbelastung beider Fronten begrenzen, keine dauernde Bedienhektik. Boss mit klar angekündigter neuer Mechanik (bevorzugt zeitweiliger Gruppenschutz), passende Bestandskunst zuerst prüfen. Boss 40 aus sicherem Offline-Farmen ausschließen und bisherige Suchgrenze 32 gezielt erweitern. Zwei Verteidigungsansätze und überwiegend automatische Spielweise legal prüfen; Zeiten/Annahmen transparent, keine Endlosbalance behaupten.

- [ ] **32 · B22 — Akt II gemeinsam prüfen und liefern. Geplant.** Regulärer Verlauf durch die neuen Meilensteine plus kurze Desktop-/Hochkantprobe. Alte Bauten/hoher Rekord/Rekrutierung/Frontvorbereitung/laufende gemischte Welle/Offline-Basis gezielt zusammen prüfen; keine Wiederholung alter Tests ohne Anlass. Sichtbarkeit von Bau/Effekten, lesbare Zahlen und freie Kampfzone mitprüfen. Wenige aussagekräftige Screenshots, README/Playlink und offener Restumfang; Commit/Push/Pages tatsächlich verifizieren. Ersetzt B14/G2 nicht.

- [ ] **33 · B14 / G2 — Verbleibende Stabilität und Gesamtabnahme. Offen.** Restliche Speicher-/Offline-Matrix, validierter Export/Import mit bewusster Ersetzung, relevante Builds und mindestens 30 Minuten ununterbrochener Browserbetrieb plus längere Modellprüfung. Last/Gerät/Grenzen dokumentieren; aktueller separater Build, Rückkehrnachweise, Screenshots und ehrlicher Bericht. Danach Nutzerbewertung des vollständigen Slice einschließlich Einstieg, Entscheidungen, Wartezeiten und drei größter Schwächen festhalten. Kein Ersatz durch einen grünen Build oder B22. Kritische Fehler werden unabhängig von dieser Reihenfolge vorher behoben.

- [ ] **34 · B12d — Effiziente Gegnerproduktion. Separat geplant.** Standardsteckbrief (Rolle, Referenz, Palette, Größe, Anker), zuerst Referenzpose und kurze Laufprobe. Gemeinsame Ausschnitt-/Richtungs-/Zeitdaten, Import und Vorschau mit Einzelbildern/Kurvenstrecke; Grenzen, Transparenz und Bewegungsrichtung kompakt prüfen. Kandidaten und drei Produktionsvorschläge stehen in [ENEMIES.md](docs/ENEMIES.md#vorschlag-drei-weitere-einheiten). Neue Serien erst nach bewährter Probe; keine Voraussetzung für Sturmlicht oder erste Ostfront, vor weiterer Endlos-Inhaltserweiterung sinnvoll.

- [ ] **35 · Spätere Ideen — bewusst geparkt.** Runa als alternative Kontrollgefährtin (gegen Frost abgrenzen, Auswahl/Wechsel statt Figurenpflicht); Schnellfeuer/Sonnenobelisk erst mit eigener Rolle und vom Kern unterscheidbarer Grafik. Späherposten für optionale Herausforderungen, Runenatelier nur bei Bedarf jenseits der Werkstatt. Kern/HQ mit sinnvoller Interaktion. Wachstube/Kaserne mit verbündeten Lane-Einheiten erst als kleiner Prototyp: echte Gefechte brauchen Gegnerangriffe/Zielwahl, Blockieren, Leben/Tod, Animationen und Save-/Farmregeln. Kein bloßer Spawn als fertiges Kampfsystem. Nicht beschlossen: Ausrüstung/Heldenlevel, Gacha, zusätzliche Währungen, PvP, mehrere Biome, Prestige oder ein weiterer Akt.

Pro begonnenem Paket: konkretes Ergebnis umsetzen, nur betroffene Risiken kompakt prüfen, Status/Nachweis hier aktualisieren. Save-Bestand und klassisches Spiel erhalten. Bestehende Commit-/Push-/Pages-Autorisierung gilt für zuvor beauftragte Arbeiten; T01 ist separat zur Umsetzung und Veröffentlichung beauftragt, T02–T07 bleiben ohne Startfreigabe. Kein Merge nach `main`. Unbeauftragte Punkte und Nutzerabnahmen bleiben offen.
