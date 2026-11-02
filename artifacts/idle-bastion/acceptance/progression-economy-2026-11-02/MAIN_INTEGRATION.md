# Main-Übernahme der Gold- und Textkorrekturen · 02.11.2026

Nutzerauftrag: bisherigen geprüften Stand auf Main abschließen, danach die W26–50-Varianten nur analysieren und simulieren. Die Auswahl und Integration einer Wellenänderung bleibt Schritt 6 und wird gemeinsam entschieden.

Basis ist `80a5a1dc73d4ef74a4669b2ffef51d776225ef9d`, vor Übernahme per Git-Fetch und GitHub-Connector erneut bestätigt. Keine zwischenzeitlichen Änderungen auf Main, keine Konflikte. Das ältere, separat geöffnete Arbeitsverzeichnis und seine fremden Änderungen bleiben erhalten.

Enthalten sind ausschließlich die zuvor geprüften Wirtschaftsänderungen und zugehörige DE/EN-Texte, Migrationen, Tests und Nachweise. Wellenzusammensetzungen, HP, Turmwerte und Preise bleiben unverändert. Die tatsächlichen Änderungen und 16 integrierten Vergleiche stehen im [Umsetzungsbericht](REPORT.md), die abschließenden Texte im [Textbericht](TEXT_UPDATE_AND_WAVES.md).

Finale technische Prüfung: **460/460 Tests** bestanden, [Protokoll](main-integration-tests.txt). Produktionsbuild einschließlich TypeScript und Pages-Paketierung bestanden, [Protokoll](main-integration-build.txt). Die vorausgehenden sechs Browserprüfungen des finalen Textstands sind weiterhin dokumentiert. Der veröffentlichte Build wird nach dem Push gesondert geprüft; ein erfolgreicher lokaler Build ist kein Deploymentnachweis.
