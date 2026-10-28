# Kongregate export

The dedicated build uses only index.html as its entry, relative paths, and no public directory. Vite includes assets referenced by the game; test pages, galleries, source archives and audition-only files are excluded.

Build from the repository root:

    npm run build:kongregate
    python scripts/package-kongregate.py --output <new-absolute-output-directory>

The packager refuses an existing output folder. It produces a complete ZIP with index.html at the root and an alternative separate index.html/additional-files.zip pair. Use only one upload method. Neither build uploads or submits anything.

Copy the prepared text templates from docs/kongregate into the delivery's 03-texts directory. Actual screenshots and the icon are captured with the acceptance script in artifacts/idle-bastion/acceptance/kongregate-2026-10-28/check-export.mjs. The icon uses the approved campfire artwork and existing Pixelify Sans font; no new artwork is generated.

## Credits

SOURCES_AND_LICENSES.txt is the central source/attribution record. The game embeds this text in collapsed local license notices. No external anchors are present in the credits. Names, CC BY source URIs/modification notices, font OFL and runtime MIT licenses remain distributed. The ZIP includes a second readable copy as LICENSES.txt. Moving all required notices into a remote repository alone would not preserve them in the distributed game.

## Verification and limits

See the dated acceptance report. Test the extracted ZIP over HTTP at a nested path and inside an iframe; file:// is not supported for ES modules. Local iframe and touch emulation checks do not replace the actual Kongregate Preview or a physical phone check. Game content is unchanged. Approval remains a platform review decision.
