# Offline-Rückkehr · Mobile Dialogkorrektur

25.10.2026: Nach Nutzerhinweis die Überlagerung des Farmbasis-Texts bei 320×568 korrigiert. Der Textbereich scrollt jetzt innerhalb des Dialogs; der Einsammeln-Knopf belegt einen eigenen Bereich darunter. Kein über dem Text liegender Sticky-Button mehr. Nur `index.html` und `offline-welcome.css` geändert, keine weiteren Spiel-, Speicher- oder Wirtschaftsänderungen.

Vier Produktions-Browserdurchläufe bestanden: **DE/EN bei 320×568 und 390×844**. Farmbasis nach Scrollen vollständig innerhalb des Textbereichs und per Trefferprüfung tatsächlich unverdeckt; Knopf durchgehend im Viewport. Auch ausgeklappte Betragsdetails geprüft. Einsammeln, exakte einmalige Gutschrift und Reload ohne wiederholte Begrüßung bestanden. Keine Browser-/HTTP-Fehler oder `favicon.ico`-Anfrage. Mobile Chrome-Emulation, keine physische Smartphone-Prüfung.

`npm run build` und die fünf vorhandenen `offline-welcome.test.ts`-Tests bestanden erneut. Die letzte Vollsuite des Branches bleibt 356/373 mit den 17 bekannten Altfehlern; wegen der reinen Layoutkorrektur nicht nochmals ausgeführt.

Der Nutzer hat die anschließende Übernahme dieses geprüften Branches nach `main` und GitHub Pages ausdrücklich beauftragt. [Pages-Workflow](https://github.com/emfau88/TD/actions/workflows/idle-bastion-pages.yml).

[Browsermessungen](mobile-fix/local-mobile.json) · [320×568 beim Öffnen](mobile-fix/local-mobile-de-320-start.png) · [vollständig lesbare Farmbasis nach Scrollen](mobile-fix/local-mobile-de-320-basis.png).
