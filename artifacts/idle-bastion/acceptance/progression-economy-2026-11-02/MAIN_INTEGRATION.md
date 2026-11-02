# Main-Übernahme der Gold- und Textkorrekturen · 02.11.2026

Nutzerauftrag: bisherigen geprüften Stand auf Main abschließen, danach die W26–50-Varianten nur analysieren und simulieren. Die Auswahl und Integration einer Wellenänderung bleibt Schritt 6 und wird gemeinsam entschieden.

Basis ist `80a5a1dc73d4ef74a4669b2ffef51d776225ef9d`, vor Übernahme per Git-Fetch und GitHub-Connector erneut bestätigt. Keine zwischenzeitlichen Änderungen auf Main, keine Konflikte. Das ältere, separat geöffnete Arbeitsverzeichnis und seine fremden Änderungen bleiben erhalten.

Enthalten sind ausschließlich die zuvor geprüften Wirtschaftsänderungen und zugehörige DE/EN-Texte, Migrationen, Tests und Nachweise. Wellenzusammensetzungen, HP, Turmwerte und Preise bleiben unverändert. Die tatsächlichen Änderungen und 16 integrierten Vergleiche stehen im [Umsetzungsbericht](REPORT.md), die abschließenden Texte im [Textbericht](TEXT_UPDATE_AND_WAVES.md).

Finale technische Prüfung: **460/460 Tests** bestanden, [Protokoll](main-integration-tests.txt). Produktionsbuild einschließlich TypeScript und Pages-Paketierung bestanden, [Protokoll](main-integration-build.txt). Die vorausgehenden sechs Browserprüfungen des finalen Textstands sind weiterhin dokumentiert. Der veröffentlichte Build wird nach dem Push gesondert geprüft; ein erfolgreicher lokaler Build ist kein Deploymentnachweis.

## Veröffentlichung und Abschluss

Als `d4120482796fa1bc20d653b148ffc3873a610036` ohne Force-Push nach Main übernommen; [GitHub Pages 41473447230](https://github.com/emfau88/TD/actions/runs/41473447230) erfolgreich. Der vorhandene Main-Checkout wurde per Fast-Forward aktualisiert, zwei fremde unversionierte Tutorialdateien blieben erhalten. Der ältere ursprünglich geöffnete Arbeitsbranch blieb unverändert.

Die öffentliche Fassung auf `https://emfau88.github.io/TD/` bestand anschließend den vollständigen vorhandenen Browserablauf: DE/Desktop 1440 px mit neuem 26-%-Anspruch, EN/Mobil 390 px mit altem 65-%-Anspruch, identischer Beleg nach Reload, genau einmalige exakte Gutschrift, neue Abreisebedingungen, Pause, Fortsetzung und aktuelle Lager-/Chroniktexte. Frischer mobiler Start einschließlich echter Turmplatzierung, Welle 1 und bezahltem Upgrade ebenfalls erfolgreich. Keine Browser-/Ressourcenfehler. Ausschließlich eigene Probe-Spielstände in isolierten Browserkontexten verwendet. [Messdaten](live-release/browser.json), [Protokoll](live-release.txt), [Prüfer](check-live-release.ts).

Der anschließende [W26–50-Vergleich](../../../waves-26-50-study-2026-11-02/REPORT.md) verändert keine veröffentlichten Spielquellen. Auswahl und Integration eines Kandidaten bleiben dem gemeinsamen Schritt 6 vorbehalten.
