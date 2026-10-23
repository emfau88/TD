# Historical migration fixtures

These are frozen snapshots produced by the original TypeScript models at the
source commits recorded in legacy-migrations.json. Tests read the JSON directly;
running tests requires neither Git history nor the old simulation code.

- Schema 1: 40dc0197667723db8c4dc4b03c56587f48364ffe, ordinary default battle.
  Advance in 25 ms steps until wave 2 starts, then advance 2.5 seconds. Record the
  snapshot and the next 80 individual steps, including original combat events.
- Store schema 1/2 inputs: respective original models at 40dc019 / 25e9a5f.
  Construct the battle, build tower-02, advance 0.4 seconds, and snapshot.
- Schema 15: f538b5c93f25dc2e60baeda88199db4e4212b3d5. Record welcome, first
  free tower placed at cell-6-6, and the unguided default battle. No schema labels
  or rules are changed after snapshotting.
- Schema 20: a850f646ca09fce319f8ffea6bb94a37cd2b9eb0. Use the same artificial
  veteran setup as the existing Ilyra unit tests: 12,000 gold, cleared wave 25,
  both boss victories, workshop and Frost research, Wisp met, discovery off.
  Build the then-paid tavern. Record its original location and voluntary relocation.
  These are valid historical-format unit fixtures, not earned progression runs.
- Schema 21: 147d9679df4da00e867fc569ca1a89d8efc1ab3a. Use that veteran,
  recruit Ilyra, walk her to (3,5), start farm wave 6 and advance 0.9 seconds.
  Cast at the first enemy. Record at volley age 0.3 and 0.7 seconds; the latter
  has already hit. Record respectively the next 13 and 2 original 25 ms steps
  as end-state and event oracles. Legacy volleys have no pace field.

The archived real schema-14 browser save remains in its existing acceptance
directory and is still exercised by the onboarding test.

assertHistoricalFields checks every historical key and complete array exactly.
Only explicitly documented root schema/rules/layout migrations are overridden at
call sites. Added fields are checked through documented defaults, negative
validation tests and exact current save/reload comparisons. The helper never
changes a snapshot, drops historical fields or accepts approximate numbers.

## Small critical-test maintenance package

The additional critical section records original-format live projectiles for
schemas 3, 5, 6, 8, 9, 10, 16, 17, 18, 22 and 23. Exact source commits are stored
in critical.sources. Snapshots are taken after building tower-02 and advancing
in 25 ms steps until the first homing shot exists. They are inputs, not current
model outputs relabelled as historical versions.

Additional original-model unit fixtures cover:
- Schema 6 with an unbuilt but affordable warehouse, schema 9 with purchased
  clearing and an eastern Frost tower, schema 16 veteran and actual schema 17 defeat.
- Schema 2 after wave 2 starts plus 2.75 seconds; schema 3 with assigned walking
  Mara after 1.2 seconds; schema 18 with the old warehouse plot.
- Schema 22 unbuilt/paid/recruited ownership, and schema 23 unbuilt/paid/recruited/
  early level-I/high-record-without-boss states. Artificial veteran money is only
  a unit fixture, never an earned campaign or browser save.
- Schema 23 original offline module with an explicit old rule-10 proof, a fixed
  absence and pending receipt. This checks historical entitlement preservation.
- Schema 7 normal wave-15 record, which must never become a boss victory.
- Schema 8 Mara standing at (11,4). The expected reroute is frozen from the
  originally shipped layout-2 migration at 27f54b5, not from today's migrator.
- Schema 8 active boss dance from the unchanged earned opening in the original
  c22494e B10 test. The original run and its original 7–10-minute gate pass.

The small restoreHistorical helper compares every old field, unchanged input and
exact current reload. Clearing of old live evidence and the special Mara reroute
are explicit per-test overrides. It does not remove validation or skip a test.
