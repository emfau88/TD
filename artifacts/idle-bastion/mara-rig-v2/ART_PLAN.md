# Mara: Aufbau vor der Grafikproduktion

Verbindliche Designreferenz: bestehende Mara (rotes Haar, grünes Auge, Zopf, teal/goldener Umhang, burgunderfarbenes Mieder, braune Handschuhe/Gürtel, türkise Phiolen).

Neue neutrale Vorlage: vom Oberschenkel aufwärts, beide Arme entspannt mit etwas Abstand zum Körper. Kein fertiges Ganzkörperbild als Quelle zum Zerschneiden. Produktionsgrafik wird als getrennte, vollständig gezeichnete Bauteile angefordert.

1. Körper-Bauteilsatz: durchgehender Oberkörper einschließlich Halsansatz und verdeckter Schulteransätze; Hüfte/Gürtel/Oberschenkel; separat vollständige linke/rechte Oberarme, Unterarme und Hände; hinterer Umhang und vordere Stoffteile. Gelenkanschlüsse als verdeckte abgerundete Überlappungen, keine dunklen Schnittlinien quer durch Haut.
2. Kopf-Bauteilsatz: vollständiges Grundgesicht, hinteres Haar, vordere Frisur, Seitensträhnen und durchgehender Zopf mit mehreren Bones. Kopf bleibt starr gebunden; Beweglichkeit über Hals/Kopf, keine unabhängige Verschiebung der Augen.
3. Gesicht: Augen-/Lid- und Mundvarianten auf festem Grundgesicht; identische feste Montagepunkte. Augenbrauen separat. Keine neu generierten vollständigen Gesichter pro Animationsframe.

Montagewerte, Schnittrechtecke zwischen bereits getrennten Bauteilen und Ebenenreihenfolge werden explizit gespeichert. PSB und einzelne transparente PNGs bleiben editierbar. Gewichte auf zusammenhängenden Meshes; Armbeugung über weiche Übergangsgewichte und großzügige verdeckte Gelenke. Keine Maschen ohne sichtbaren Zweck.

Ausgabe: 768 × 1024, 30 Bilder/s, 5 s Idle + 1,6 s Kopfreaktion + 2,4 s Berührungsreaktion. Ausgabe zunächst unkomprimierte transparente PNGs, dann verlustfreie WebP-Atlanten mit Randabstand und expliziter Frame-Metadatei.
