# Ilyra – isolierte Armbeuge (nicht freigegeben)

Die Probe ist technisch exportierbar, wurde aber wegen zu dick wirkendem Unterarm und unnatürlicher Gelenkform beim Beugen vom Nutzer abgelehnt. Keine fertige Grundlage für weitere Gesten. Die Ruhepose ist nicht beanstandet. Weitere Produktion nach Aufwandshinweis angehalten; aktueller Status ausschließlich in der Spiel-Roadmap.

Quellen: ../hip-v1/unity/Assets/Editor/BuildIlyraArmBend.cs und ../hip-v1/unity/Assets/ArmBendStudy/. Originalbilder und ältere Quellen unverändert. Native Unity-SpriteSkin-Geometrie mit erhaltenen UVs neu gebunden; linker Arm ohne die bisherige ungleichmäßige Knochenskalierung, angepasster Ellbogenanker und zusätzlicher Gelenkknochen. Eigene Arm-Ebene vor dem Rumpf behebt das vom Nutzer gemeldete Verschwinden unter dem Gürtel. Formstütze/Hilfsknochen hat die anatomische Darstellung dennoch nicht ausreichend gelöst.

preview/index.html: synchroner Vorher-/Nachher-Vergleich mit 0–90° zusätzlichen Beugewinkeln ab Ruhepose, Einzelgradregler, Knochenanzeige und Ganzfigur/Detailansicht. Keine anatomisch absolute Winkelmessung. preview/Ilyra-Armbeuge.gif und preview/Winkelvergleich.png für direkte Sichtung. Native transparente PNGs in preview/before/frames und preview/after/frames. Es wurden keine weiteren Gesten erstellt.

Prüfung: checks.json dokumentiert 91 Stellungen nachher, 975.884 Dreiecke ohne Faltungen, kleinster Flächenquotient 0,1126; verlustfreie Vorschau-Crops. 191 vorherige Quelldateien per SHA-256 unverändert. Außerhalb des Armgebiets bewegt sich kein Pixel. Ruhebild nach Neuberechnung maximal 1/255 Alphaabweichung, mittlere Composite-Abweichung 0,032/255; keine globale Proportionsänderung. Browservergleich, Regler, Abspielen und 390×844-Hochkantansicht geprüft, keine protokollierten Browserfehler. Screenshots gespeichert. Technische Befunde ersetzen ausdrücklich nicht das negative visuelle Nutzerurteil.

Grenzen: nur ein Arm untersucht; keine fertige anatomische Perspektivkorrektur, keine Integration in alte Clips, kein Produktionspaket. Keine neue Zeichnung erzeugt. Kein Commit oder Push.
