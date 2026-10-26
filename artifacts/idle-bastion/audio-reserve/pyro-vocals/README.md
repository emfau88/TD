# P01–P32 · vollständige Stimmenreserve

Auf Nutzerwunsch am 26.10.2026 im Projekt abgelegt. Alle 32 echten Einzel-WAVs aus
der korrigierten lokalen Hörliste, mit stabilen P-Nummern. `index.html` spielt jede
Datei separat; es gibt keine Sprungmarken in einer gemeinsamen Aufnahme.

Quelle: [Sexy vocals von pyro13djt](https://freesound.org/people/pyro13djt/sounds/337997/),
Datei `337997__pyro13djt__sexy-vocals.wav`. Auf der Quellenseite am 26.10.2026 als
[CC0](https://creativecommons.org/publicdomain/zero/1.0/) ausgewiesen.

Schnitt: Pausen ab 0,20 s unter −38 dBFS; keine benachbarten Abschnitte verbunden.
40 ms Vorlauf / 60 ms Nachlauf innerhalb der Originalaufnahme. Originale 44,1 kHz,
Stereo, Float-PCM 32 Bit; keine Tempo-, Tonhöhen-, Pegel- oder Dynamikänderung.
Zusammen 15.099.760 Bytes. `segments.json` enthält genaue Samplegrenzen, Originalhash
und SHA-256 jeder WAV. `cut-verification.json` belegt den PCM-Abgleich jedes Abschnitts
mit seinem eigenen Bereich in der Originalaufnahme.

Für Maras aktuelle Befehlsstimme ausdrücklich gewählt: **P11, P09, P07, P06, P03, P01,
P14**. Bytegleiche Laufzeitkopien liegen unter
`experiments/idle-bastion/assets/mara-command-voice/`; deren Wiedergabepegel werden
erst im Spiel angeglichen. Die gesamte Reserve bleibt außerhalb des Vite-/Pages-Pakets.

Exakte Reproduktion eines Schnitts mit den Werten aus `segments.json`:

```text
ffmpeg -i 337997__pyro13djt__sexy-vocals.wav -af "atrim=start_sample=START:end_sample=END,asetpts=PTS-STARTPTS" -c:a pcm_f32le Pxx.wav
```

Die Originalaufnahme bleibt im Soundordner des Nutzers; die Reserve enthält alle
32 ausgewählten Schnittbereiche als eigenständig nutzbare Dateien.
