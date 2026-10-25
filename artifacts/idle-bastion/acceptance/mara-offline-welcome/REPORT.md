# Mara · Erste positive Offline-Rückkehr

25.10.2026 · Branch `codex/mara-offline-welcome`, Basis `main/a732403`. Kein Merge und kein Deployment.

Der bestehende Rückkehrdialog erhält einmal pro Spielstand das vorhandene Porträt `assets/intro/mara/mischievous.webp` und einen kurzen Spruch:

> **DE:** Da bist du ja! Ich habe auf dein Gold aufgepasst. Nachgezählt habe ich es nur dreimal. Na gut, viermal.
>
> **EN:** There you are! I've been guarding your gold. I only counted it three times. All right, four.

Die optionale Save-Markierung `maraOfflineWelcomeSeen` wird zusammen mit dem ersten positiven Rückkehrbeleg gespeichert. Deshalb wiederholt auch ein Reload **vor** dem Einsammeln die Begrüßung nicht. Null- und Pausenertrag setzen die Markierung nicht; positive Goldbruchteile zählen. Ein weiterer Rückkehrdialog in derselben Session bleibt ebenfalls ohne Wiederholung. Alte Saves ohne Feld sind weiter gültig. Bestehende Kampf-/Offline-Schemata, Farmbelege, Ertragsberechnung und Auszahlung bleiben unverändert.

Einsammeln/Fortsetzen bleibt der vorhandene einzige Aktionsknopf, ohne Lesetimer oder Porträt-Ladebarriere. Auf kurzen Hochkantansichten bleibt der Knopf am unteren Dialogrand sichtbar. Das vorhandene `public/ui/spire-emblem.png` ist als relatives PNG-Favicon eingebunden; Vite übernimmt es unverändert in den Build. Keine neuen Spielgrafiken oder Audiodateien.

| Prüfung | Ergebnis |
|---|---|
| Native Session-/Save-/Offline-Regressionen | **69/69 bestanden**: einmalige positive Anzeige, Null-/Pausenertrag, Goldbruchteil, späterer positiver Ertrag desselben Saves, Reload vor Auszahlung, erneute Abwesenheit, Schreibfehler und DE/EN. |
| Vollsuite | **356/373 bestanden, exakt dieselben 17 Altfehler** wie Main, keine neuen Fehler und keine Skips. |
| Produktionsbuild | `npm run build` bestanden. |
| Browser, Produktionsbuild | Fünf Abläufe: DE/Desktop 1280×800, EN/Hochkant 390×844, DE/klein 320×568, EN/Nullertrag und DE mit bewusst verzögertem Porträt. Richtiger Text/Anzeigezustand, sofort bedienbarer Knopf, vollständige Auszahlung und Reload ohne Wiederholung/Doppelauszahlung. |
| Favicon | Emblem HTTP 200; keine automatische `favicon.ico`-Anfrage, keine JavaScript-/HTTP-/Konsolenfehler in den fünf Browserabläufen. |

Prüfungen mit isolierten Chrome-Profilen und real verdienten archivierten Farmnachweisen; keine echten Nutzerspielstände verändert. Mobile Emulation, keine physische Smartphone-Prüfung oder visuelle Nutzerfreigabe. Textprotokolle nur auf UTF-8/LF und entfernte Leerzeichen am Zeilenende normalisiert.

[Messdaten](checks.json) · [gezielte Tests](targeted.txt) · [Vollsuite](tests.txt) · [Build](build.txt) · [Browserabläufe](browser.json) · [DE Desktop](de-1280.png) · [DE klein](de-320.png) · [EN Hochkant](en-390.png).
