# Kongregate export

The dedicated build uses only index.html as its entry, relative paths, and no public directory. Vite includes assets referenced by the game; test pages, galleries, source archives and audition-only files are excluded.

Build from the repository root:

    npm run build:kongregate
    python scripts/package-kongregate.py --output <new-absolute-output-directory>

The packager refuses an existing output folder. It produces a complete ZIP with index.html at the root and an alternative separate index.html/additional-files.zip pair. Use only one upload method. Neither build uploads or submits anything.

The version form inspected on 2026-11-13 requests **index.html** as Game File and
**additional-files.zip** as Additional files (150 MB each). Use the matching pair
from `01-game/separate-upload` for that form. Never mix files from two builds.

## Leaderboards

Only the dedicated Kongregate build enables the optional client API. Normal
Pages/development builds do not connect. The script loads after game startup;
an unavailable CDN or guest account cannot block combat, saving or the menus.

| Exact statistic name | Type | Value |
| --- | --- | --- |
| Highest Wave | Max | Highest fully cleared wave from the committed save |
| Best Gold per Minute | Max | Historical certified safe farm rate, whole gold/minute rounded down |
| Enemies Defeated | Max | Total actual combat kills from the committed save |

Enable **Display in leaderboards**, leave **Server API only** unchecked. A Max
comparison also applies to cumulative kills: submissions contain the saved total,
never an increment. The portal names must match `src/kongregate.ts` exactly.

The optional `bestFarmGoldPerMinute` save-envelope field preserves the rate record
through upgrades, weaker defenses and reloads. Older saves start from their current
valid farm certificate; unavailable past peaks are not reconstructed. Farm probes
exclude temporary hero abilities and do not add their simulated kills or clears.
Offline gold does not add kills. Combat schema/rules and storage IDs are unchanged.

Temporary games, `fresh`/`probe` routes (even malformed ones) and feature previews
are excluded. Normal saved progress resubmits on load/login/online, at wave clears,
with kills batched up to 10 seconds, and every minute to recover silently lost
messages. Client submissions are not cheat-proof and do not provide cloud saves.

References: [JavaScript API](https://docs.kongregate.com/docs/javascript-api),
[statistics](https://docs.kongregate.com/docs/concepts-statistics),
[submit](https://docs.kongregate.com/reference/client-api-stats-submit).
Implementation status and actual verification remain in ROADMAP.md.

For an update to the existing portal entry, preserve its current title, description,
instructions and screenshots; do not overwrite them from older local text templates.
The selected icon is the simplified, bottom-title V2 in
`artifacts/idle-bastion/acceptance/kongregate-icon-v2-2026-11-13/`.
Upload replaces the preview build. Publishing remains a separate user action.

## Credits

SOURCES_AND_LICENSES.txt is the central source/attribution record. The game embeds this text in collapsed local license notices. No external anchors are present in the credits. Names, CC BY source URIs/modification notices, font OFL and runtime MIT licenses remain distributed. The ZIP includes a second readable copy as LICENSES.txt. Moving all required notices into a remote repository alone would not preserve them in the distributed game.

## Verification and limits

See the dated acceptance report. Test the extracted ZIP over HTTP at a nested path and inside an iframe; file:// is not supported for ES modules. Local iframe and touch emulation checks do not replace the actual Kongregate Preview or a physical phone check. Game content is unchanged. Approval remains a platform review decision.
