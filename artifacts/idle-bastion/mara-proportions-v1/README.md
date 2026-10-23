# Mara: statische Proportionsprobe

Separate Zeichnungsstudie, keine Änderung des bestehenden Rigs, der Animationen oder des Tavernenpakets. Aktueller Status und Nutzerabnahme ausschließlich in der zentralen ROADMAP.md.

- `before.png`: unveränderte Kopie von `../mara-rig-v2/unity/Export/BodyComparison/IdleOrganic/frame-000.png`.
- `after-source.png`: erste Bearbeitung mit dem eingebauten Imagegen-Werkzeug. Weichere/schlankere Oberarme, vollere Unterarme, größere Hände. Originalausgabe mit Transparenz erhalten.
- `after-forearms-v2.png`: gezielte Folgekorrektur auf Nutzerwunsch; Unterarme wieder etwas schlanker, größere Hände als Referenz beibehalten. Ebenfalls unveränderte Originalausgabe.
- `PROMPT.txt` und `FOREARM_REVISION_PROMPT.txt`: vollständige verwendete Prompts; Prozentwerte darin sind Zielangaben, keine vermessenen Ergebnisgarantien.
- `image-info.json`: Größen, Transparenz und SHA-256-Werte. Beide neuen Bilder sind 1086 × 1448 Pixel, der bisherige Export 768 × 1024.
- `comparison-registration.json`: Merkmalsvergleich im unveränderten Kopf-/Torso-Zielbereich. HTML korrigiert nur die globale Darstellung (einheitliche Skalierung plus Verschiebung). Keine gezielte Körperverzerrung, keine Retusche oder Änderung der PNGs. Die vernachlässigbare geschätzte Rotation wird nicht angewendet.

Die Bilder sind referenzbasierte Zeichnungen und außerhalb der Arme nicht pixelidentisch. Sie dienen der Proportionsabnahme. Nach Freigabe müssen die gewählten Konturen gezielt in die separaten Rig-Ebenen übertragen und Handgelenk-/Ellbogenanschlüsse sowie Bewegungen geprüft werden. Diese statische Probe ist kein Nachweis einer bereits korrigierten Animation.

Vorschau: `python -m http.server 5223 --bind 127.0.0.1 --directory artifacts/idle-bastion/mara-proportions-v1`.

Ansichten: Original/Revision nebeneinander, vergrößerter Arm-/Handbereich, Einzelansicht zum Umschalten, heller Hintergrund und erste Revision zum Vergleich. Keine Verbindung zu Spielständen.

Prüfung: Originalkopie per SHA-256 identisch zur weiterhin vorhandenen Quelle; Alpha-Kanäle 0–255; Desktop und 390 × 844, Detailansicht, Revisionswechsel, Einzelansicht und heller Hintergrund geprüft. Statische Anschlüsse visuell angesehen. Keine neuen Animationstests, weil Rig und Clips unverändert sind.
