# E01 · Vier zusätzliche Gegner und Merge-Vorbereitung

Stand 23.10.2026 · `codex/local-enemy-assets`, Draft-PR #2 gegen
`codex/wave-rework`. Kein Merge nach `main`, keine Änderung an Draft-PR #1.
[Aktuelle Abschlussprüfung und gezielte Korrekturen](merge-ready/REPORT.md).

## Was integriert bleibt

Vier Frakassets-Kreaturen ergänzen die zwölf normalen SPIRE-Arten auf **sechzehn**.
Die ersten 40 Wellen bleiben exakt beim abgestimmten W02-Stand, einschließlich
Tutorial, Bossen und Elitewelle 40. Vier Familien, höchstens drei Arten, 28 Gegner
und zwei Heiler bleiben erhalten. Keine zusätzlichen Kampfmechaniken oder Ostfront.

| Ab Welle | Art | Rolle | Grundwerte vor HP-Skalierung | Farbe |
| --- | --- | --- | --- | --- |
| 42 | Moospilz | normaler Waldläufer | 28 HP, Tempo 43, 9 Gold, ein Kernschaden | rote oder moosgrüne Kappe |
| 46 | Waldspinne | flinker Bodenläufer | 30 HP, Tempo 64, 12 Gold, ein Kernschaden | violett |
| 50 | Hornfledermaus | schneller Flieger | 24 HP, Tempo 74, 12 Gold, ein Kernschaden | violett |
| 54 | Zunderläufer | langsamer Panzer | 60 HP, Tempo 36, 25 % Rüstung, 18 Gold, zwei Kernschaden | schwarz mit Zündschnur |

Die beiden Moospilzfarben teilen eine Definition, Clips und identische Kampfwerte;
die gespeicherte UID bestimmt die kosmetische Farbe. Alle vier Arten kehren in
der nächsten Welle und danach familienabhängig regelmäßig zurück. In der gezielt
korrigierten Welle 46 füllt die Spinne die leichte Begleitung: sieben Skorpione,
15 Spinnen und zwei Quallen statt 20 Skorpionen, zwei Spinnen und zwei Quallen.
Alle anderen geprüften Rezepte bis 250 bleiben gleich.

## Vorschau und Auswahl

[Gemeinsame bewegte Vorschau](http://127.0.0.1:5196/enemy-lab.html): alle bisherigen
SPIRE-Gegner, die vier integrierten Arten und optional die zehn Frakassets-Kandidaten.
Richtung, Original-/Spielmaßstab, Auflösung/Kontur sowie Pause und Einzelbild sind
wählbar. Beide Moospilzfarben bleiben direkt auswählbar. Kein Zugriff auf Spielstände.
Die optionalen lokalen Vergleichsfunktionen des anderen Pilzpakets wurden auf
Nutzerauftrag vollständig entfernt; Originaldownloads bleiben unverändert.

| Geprüfte Frakassets-Kreatur | Originalbewegung | Entscheidung |
| --- | --- | --- |
| Mushroom Monster | Walk, acht Bilder × vier Ansichten | Moospilz |
| Fuzzy Spider | Walk, acht × vier | Waldspinne |
| Horned Bat | Idle/Flügelschlag, sechs × vier | Hornfledermaus |
| Bomb Walker | Walk, acht × vier | Zunderläufer |
| Dragon Whelp | Idle/Flügelschlag, sechs × vier | Reserve; größere Flügelsilhouette |
| Floating Eye | Idle, acht × vier | Reserveflieger |
| Flame Wisp | Idle, acht × vier | Reserve; thematisch nahe am vorhandenen Wisp |
| Biter Plant | Idle/Attack/Hurt, kein Walk | stationär, nicht als Wellenläufer gewählt |
| Cobra | Idle/Attack/Hurt, kein Walk | stationär, nicht gewählt |
| Sandworm | Idle/Attack/Hurt, kein Walk | stationär, nicht gewählt |

Top-down 48 mit Kontur passt im Vergleich am besten. Die Original-JSON bestimmt
Quellrechtecke, vier echte Ansichten, Pivot und 83/84-ms-Dauern. Keine erfundenen
Frames oder ungenutzten Angriffsanimationen im Spiel. Lit und Shine werden verbunden,
ohne Resampling in 64er Zellen gepackt und mit festem Bodenanker (32,43), Maßstab
0,83 und Nearest Neighbor dargestellt. Eine Bodenschattenebene, keine wandernde
Zentrierung pro Frame. Die vier Laufzeit-PNGs sind seit der Integration byteidentisch.

## Quellen, Lizenz und Speicher

[Frakassets · Free Monster Pack](https://frakassets.itch.io/free-monster-pack),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Namensnennung, Quelle,
Lizenzlink und Änderungsvermerk stehen im Spielmenü unter Gegnergrafiken & Lizenzen
sowie in [Asset-README und Importanleitung](../../../../experiments/idle-bastion/assets/local-monsters/README.md).
Lokales Foozle Skeleton Grunt stimmt mit der vorhandenen Quelle überein; kein
zweiter Import. Das CC0-Legend-Paket bleibt Reserve, ohne Produktionsdateien daraus.

| Laufzeit-PNG | Bytes |
| --- | ---: |
| Moospilz einschließlich beider Farben | 19.195 |
| Waldspinne | 14.561 |
| Hornfledermaus | 10.269 |
| Zunderläufer | 8.744 |
| **Gesamt** | **52.769 / 51,5 KiB** |

Vier Texturen, ca. 2,5 MiB dekodiert. Keine Originalarchive, Normalmaps, vollständigen
Quellsammlungen oder lokale Vergleichsdateien im Produktionsbuild. Laufzeitimport
mit `python experiments/idle-bastion/scripts/import-local-enemies.py --runtime`
braucht ausschließlich das Frakassets-ZIP; normaler Build braucht keine Downloads
und kein Python. `--gallery` erzeugt optional die lokale Frakassets-Vergleichsgalerie.

## Aktuelle Prüfung

Schema **28 / Regeln 14**; Versionen 12 und 13 bleiben für historische laufende
Versuche eingefroren. Gespeicherte Kämpfe, Wallet und einmalige alte Offline-Ansprüche
bleiben erhalten. Fehlende Farmnachweise prüfen nun die gespeicherte Farmwahl neu,
statt sie zu übergehen; keine Übernahme alter Raten ohne zwei sichere Durchläufe.
HP-Kurve, Turmwerte, Preise, Goldbudgets und Offline-Effizienz bleiben unverändert.

- **25/25** betroffene Wave-/Asset-/Migrationsprüfungen erfolgreich.
- Größere relevante Matrix: **122/131**, genau **neun bekannte Fehler**, keine neuen.
  [Separat dokumentierte Fehler](merge-ready/KNOWN-TEST-FAILURES.md).
- TypeScript, Produktionsbuild und Produktionsvorschau erfolgreich. Desktop
  1600×1000 und Mobil-Viewport 390×844: vier Arten, beide Farben, Einzelbild,
  dichte Welle 54 mit 22 lebenden Gegnern sowie aktueller/historischer Reload geprüft.
- Gleiche bezahlte Fortsetzung 40→56: **68:16** statt 99:34 zusätzliche Modellminuten,
  sechs Niederlagen und 24 Käufe, **null statt 157 Farmdurchläufe auf Welle 1**.
  Kein geschenktes Gold; die jetzigen 171 Farmdurchläufe nutzen nachgewiesene Welle 29.

[Aktuelle Spielansichten und vollständige Nachweise](merge-ready/REPORT.md).
Der ursprüngliche Messlauf bleibt als Vergleich erhalten. Technische Prüfung ist
keine allgemeine Endgame- oder subjektive Stilfreigabe; physische schwache Smartphones
und langfristige Gold-/Kostenkurven bleiben gesondert zu prüfen.
