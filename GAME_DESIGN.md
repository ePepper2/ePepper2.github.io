# Bombus — A Bee's Year

A mobile-browser game that walks the player through one real annual colony
cycle of the western bumblebee (*Bombus occidentalis*), one phase per life
stage. No accounts, no server, no saved progress — a full playthrough is a
self-contained session.

## Why this species

Native to Washington and genuinely in decline there: WDFW/Xerces surveys
document roughly a 93% drop in occupancy over the last two decades. That
gives the game a real conservation narrative instead of a generic "learn
about bees" framing.

- [WDFW — Western bumblebee](https://wdfw.wa.gov/species-habitats/species/bombus-occidentalis)
- [Xerces Society — Pacific Northwest pollinator resources](https://xerces.org/pollinator-resource-center/pnw)
- [WSU Hortsense — Apidae: Bumble Bees](https://hortsense.cahnrs.wsu.edu/fact-sheet/apidae-bumble-bees-bombus-spp/)

## Phases

| # | Phase | Real behavior it teaches | Core mechanic | Status |
|---|-------|---------------------------|----------------|--------|
| 1 | Spring Emergence | Only mated queens survive winter alone; she emerges in late winter/early spring, must feed immediately, and searches for a nest site — often an abandoned rodent burrow | Drag-to-fly exploration with a draining energy meter; refuel at real early bloomers (willow, Oregon grape); find a hidden burrow | **Built** (`/bombus`) |
| 2 | Founding the Nest | Queen builds a wax pot from her own wax glands, provisions it with nectar/pollen, lays her first eggs, and incubates them by vibrating her flight muscles for heat | Gather wax + pollen, then a rhythm/hold mechanic to "shiver-warm" the brood clump | Planned |
| 3 | First Workers | Once workers emerge, they take over foraging while the queen stays in the nest laying eggs | Perspective splits: queen egg-laying loop + worker foraging loop introducing buzz pollination (hold-to-vibrate on a flower) | Planned |
| 4 | Peak Summer Colony | Colony growth depends on foraging range, flower variety, and real threats (habitat loss, pesticide exposure, poor forage) | Resource-balancing loop across multiple workers, managing hazards | Planned |
| 5 | Producing Reproductives | Late-season colonies shift investment from workers to new queens (gynes) and males | Strategy choice: allocate resources toward new queens/males vs. more workers | Planned |
| 6 | Mating Flight | New queens and males leave the nest to mate | Short flight/avoidance mini-game as a new daughter queen | Planned |
| 7 | Diapause Prep | The old queen, workers, and males die off — the colony is annual; only newly mated queens survive, by fattening up and digging into loose soil to overwinter | Final foraging beat, then "dig in" — loops back to Phase 1's premise | Planned |

Ending: a short field-journal recap of the year's facts, plus a link to a
real conservation resource (Xerces/WDFW).

## Engagement design

- Each phase: ~60–90s of core gameplay, bookended by one short sourced
  "field note" popup — momentum isn't broken by walls of text.
- Persistent HUD: energy meter + phase label.
- One consistent control scheme across phases: drag to move, hold to
  interact (buzz-pollinate / shiver-warm).

## Tech approach

Matches the rest of the site: plain HTML/CSS/JS, no bundler, no framework.

- `/bombus/index.html` + `css/`, `js/engine/` (canvas loop, responsive
  scaling, unified pointer input, scene manager), `js/phases/` (one module
  per life stage), `js/data/` (sourced content, e.g. forage plants).
- Pointer Events API unifies mouse (desktop Chrome) and touch (mobile
  Chrome) input.
- Canvas scales responsively within a 9:16–16:9 aspect range so the same
  game reads on a phone held upright and a wide desktop window.
- No localStorage — every visit is a fresh playthrough, by design.

## Quality checks

- **ESLint** (`npm run lint`) — flat config, catches bugs in `bombus/js`.
- **TypeScript via JSDoc** (`npm run typecheck`) — `tsc --noEmit` checks
  `bombus/js` against JSDoc annotations without adopting `.ts` files.
- **Vitest** (`npm test`) — unit tests for pure logic (energy system, scene
  manager) alongside the modules they test.
- **GitHub Actions** (`.github/workflows/ci.yml`) — runs all three on every
  push/PR before anything reaches `main`.
- Manual QA per milestone: real phone in Chrome, desktop Chrome resized a
  few ways.

## Milestones

1. **Engine skeleton + Phase 1 vertical slice** — done.
2. Phases 2–3 (nest founding, buzz pollination).
3. Phases 4–5 (colony balancing, reproductive investment).
4. Phases 6–7 + ending journal.
5. Polish: audio, transitions, fact-check every field note, perf/touch QA.
