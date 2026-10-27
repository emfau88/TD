# Towers & Tantrums · Name, Ladebild und Musikbereitschaft

27.10.2026 · Auf ausdrücklichen Nutzerwunsch: neuer Titel und Untertitel, Lagerfeuerszene, drei zufällige Ladezeilen, Tavernenname sowie kompakte aktuelle GitHub-README. Zusatz: Bei aktivierter Hintergrundmusik den Start erst freigeben, wenn sie abspielbereit ist.

## Ergebnis

- Titel **Towers & Tantrums**, Untertitel **Build towers. Make questionable friends.** Titel im Ladebild bewusst zweizeilig; vollständige Untertitelsätze bleiben zusammen. Die Kopfleiste verwendet denselben Namen. Die Tavernenübersicht heißt **The Last Cozy Corner**; Funktionsbezeichnungen wie „Taverne“ bleiben verständlich.
- Ein neues Lagerfeuerbild mit Mara, Ilyra und Wisp, per eingebautem Imagegen anhand der vorhandenen Figurenreferenzen erzeugt. [Original und vollständiger Prompt](../../loading-art/2026-10-27/PROMPT.md). WebP-Ausgaben mit 720/1200 px sind 93.342/197.310 Bytes groß; das Original bleibt außerhalb des Spielpakets erhalten.
- Pro Seitenstart wird eine von drei Ladezeilen gewählt, ohne Flackern beim Phasenwechsel. Englische/deutsche Texte; bei echten Startfehlern wird der Spruch ausgeblendet.
- Aktivierte Kartenmusik muss vor der Szenenerstellung `HAVE_ENOUGH_DATA` / `canplaythrough` melden. Das ist die Browsermeldung für Abspielbereitschaft, keine Behauptung eines kompletten MP3-Downloads. Der erste Klick/Touch gibt weiterhin die Wiedergabe frei. Stumm oder Musiklautstärke 0 überspringen die Wartephase.
- Netzwerkfehler beziehungsweise 25 Sekunden ohne Musikbereitschaft bieten Wiederholen oder ausdrücklich Start ohne Musik. Letzteres setzt Musik auf 0 und beendet ein gegebenenfalls hängendes Vorladen. Es gibt keine künstliche Mindestladezeit.
- README auf eine kompakte Übersicht mit drei aktuellen Bildern gekürzt; ältere Bildstände datiert, alte Langfassung als `README_HISTORY_2026-10-27.md` erhalten. Speicherkennungen, URLs und historische Quellen bleiben erhalten.
- Beim Prüfen der README-Testlinks wurde der Frost-Teststarter an den bereits automatischen Upgrade-Abschluss angepasst. Der Pages-Packager prüft den Spieleinstieg über seine Struktur statt über den früheren Namen.

## Tatsächliche Prüfung

19/19 gezielte Tests: LoadingScreen, Feature-Probes und Audio. Produktionsbuild einschließlich TypeScript und Pages-Packung bestanden; [Buildausgabe](build-output.txt).

[Browserprüfung](browser-results.json), reproduzierbar mit [check-browser.mjs](check-browser.mjs):

- 1440×900, 1280×720, 390×844, 320×568 und 844×390 auf Englisch; 390×844 und 320×568 zusätzlich auf Deutsch.
- Alle vier Titel-/Untertitelteile vorhanden und ohne Überlauf; ganze Ladekarte sichtbar, Ressourcenleiste nach dem Einstieg frei. Alle drei Zufallstexte tatsächlich angezeigt. Die erste Zufallswahl wird im Test gezielt gesetzt, spätere Zufallswerte bleiben unverändert.
- Musikantwort beim Laden absichtlich zurückgehalten: Ladebild und Eingabesperre bleiben bestehen. Nach Freigabe meldet das Audioelement Bereitschaft 4; der Ladescreen verschwindet, Musik bleibt bis zur Bedienung pausiert. Erster Touch startet die Musik innerhalb des 1,5-s-Prüffensters.
- Stummstart fordert keine Kartenmusik an. Abgebrochene Musikantwort und echter Bereitschaftstimeout getrennt geprüft; „Continue without music“ führt jeweils ins Spiel. Keine JavaScript-Seitenfehler.
- Sichtprüfung der Desktop-, Hochkant-, Querformat- und Fehleransichten. Eine geerbte globale Flex-Regel für Überschriften wurde dabei als Ursache für einen unerwünschten einzeiligen Titel erkannt und durch die lokale Blockdarstellung korrigiert.
- Die zusätzliche [README-Aufnahme](../../readme/2026-10-27/capture.json) verwendet das echte Produktionsspiel und einen isolierten verdienten Welle-40-Ausgangsstand. Mara erreicht über drei echte Gespräche und ein Geschenk zwei Herzen. Tavernenüberschrift bei 320 px geprüft; kein Seitenfehler. [Frost-Teststarter](../../readme/2026-10-27/frost-result.json) erreicht im Browser den passenden Lernschritt.
- Alle 16 lokalen Bild-/Dateiverweise der aktuellen README vorhanden. Die historischen Bilddaten stammen aus Git-Historie beziehungsweise zugehörigen Berichten.

## Ansichten

[Desktop](loading-1440.png) · [Laptop](loading-1280.png) · [Hochkant](loading-390.png) · [Schmales Handy](loading-320.png) · [Querformat](loading-844.png) · [Fehlerfall](loading-error-320.png) · [Tavernenname](tavern-overview-320.png).

Chrome mit Desktop-/Touch-Emulation, keine Behauptung einer physischen iOS-/Android-Abnahme. Arbeits- und Veröffentlichungsstatus ausschließlich in der [Roadmap](../../../../experiments/idle-bastion/ROADMAP.md).

## Veröffentlichung

Code-Commit `41b2abf`, Main-Push bestätigt. [Pages-Lauf 40591918369](https://github.com/emfau88/TD/actions/runs/40591918369) einschließlich Veröffentlichung erfolgreich. Die anschließende [Live-Prüfung](live-results.json) bei 1440/390 px bestätigt neuen Seitentitel, zwei Titelzeilen, Audio-ReadyState 4 vor der ersten Bedienung, alle drei frühen Klicktöne und aktive Musik vor dem ersten Turmbau; keine Seitenfehler. [Skript](check-live.mjs). `automationToSoundMs` enthält Bedienbarkeits-Wartezeit der Browserautomatisierung und ist keine reine Tonlatenz.

Die tatsächliche [GitHub-README](https://github.com/emfau88/TD#readme) wurde im Browser geprüft: neuer Titel, drei aktuelle Bilder und zwei ausdrücklich historische Bilder im aufklappbaren Abschnitt; alle fünf geladen. [Ergebnis](readme-live.json) · [Skript](check-readme.mjs).
