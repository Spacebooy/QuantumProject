# Quantum Path Finder

A playable maze with five mission lengths and three learning modes. Each junction has 2–8 randomized forward corridors. One continues through the lab; others are bombs or safe dead ends. Backtracking returns along the known approach corridor. The maze is generated once per mission; reset/undo/allocation do not reroll it. Room positions do not distinguish destination branches from dead ends. Unknown rooms are concealed until visited; currently available corridors are represented by lettered unknown rooms.

## Quantum model

Players allocate 1–4 qubits themselves. Too few cannot encode every corridor. Basis indices map to the current junction's displayed corridor order, with q0 the most significant bit. Extra basis states are unmarked and display their aggregate probability. Measuring one consumes a measurement/energy but leaves the player at the junction without losing a life. Extra qubits can change amplification behavior; they are not simply redundant.

All player states and measurements come from the existing POST /simulate API in ideal mode. The frontend only builds gate lists and interprets results. The API already supports H, X, RZ and CNOT, so no backend changes were needed.

The oracle flips every non-bomb corridor, including dead ends. It does not mark padded states. Its implementation uses a supplied classical map predicate; this is an educational oracle, not an assertion of real quantum danger detection or computational speedup over reading the small map. Phase details intentionally expose the safety marking for learning but never disclose which safe corridor reaches the finish.

For n qubits, a basis-state phase flip is built by X-conjugating a phase flip on all-ones. The projector is expanded as:

    |11…1><11…1| = product_j (I - Z_j) / 2^n

For every nonempty subset S of qubits, compute its parity onto one member with CNOT, apply RZ((-1)^(|S|+1) * pi / 2^(n-1)), and uncompute. Omitting the empty subset removes only global phase. Diffusion is H on every qubit, phaseFlip(0), H on every qubit; it is standard Grover diffusion up to global phase. The browser never evolves the state itself.

One ordinary Grover round is not always beneficial. For a uniform initial state and marked fraction M/N, after r rounds the success probability is sin²((2r+1) asin(sqrt(M/N))). In particular, half marked remains 50%; repeated rounds can overshoot. Actual outcomes are never forced to be safe. Expanding phase details shows relative phase modulo a common global phase; phases of zero-amplitude entries are undefined.

## Controls and scoring

- Guided: high-level Superposition, Oracle, Diffusion, Measure.
- Apprentice: individual H/X/Z preparation gates, Oracle/Diffusion blocks.
- Architect: elementary H/X/Y/Z/S/T/RX/RY/RZ/CNOT gates plus supplied Oracle. An expandable diffusion recipe is generated for the allocated register without revealing the oracle.
- Undo removes one player action (including a whole high-level block), reruns the remaining circuit, and does not refund cumulative costs.
- Reset scanner returns to zero using the backend, preserving map/lives/counters.
- Changing allocation clears the scanner only; explicit Allocate fetches its new zero state.
- Each action and measurement costs n energy. Oracle calls, elementary gate count, moves and measurements are tracked. Bombs consume a life and retreat; dead ends require Backtrack.
- Win: 3 stars for keeping all lives, no wasted measurements, and at most one oracle call per move; otherwise 2 with at least two lives, 1 with one. No database or account persistence. Leaving the mission ends that run; switching site navigation preserves it. Dark-mode preference alone is saved in localStorage.

## Development and verification

Run the existing FastAPI application on 127.0.0.1:8000. `npm run dev` proxies `/api` to that server, avoiding development-port CORS mismatches. `npm run preview` uses the same proxy. Production hosting must reverse-proxy `/api`, or build with `VITE_API_URL` set to the backend origin and configure that server's allowed origin separately.

- `npm test`: local capacity, maze and bit-order tests.
- `npm run test:quantum`: also verifies all 1–4 qubit phase-flip targets, padding, multiple marked states, overshoot, diffusion without an oracle, and real measurements against the running /simulate API.
- `npm run build`: production compilation.

The map is a live SVG schematic, not the pre-rendered concept illustration. Pan by scrolling inside the map. Quantum details and long gate histories have independent overflow. Requests are serialized, mutations are disabled in flight, and failed requests preserve the current circuit and position.

## Files added and changed

Added:
- `src/games/PathFinder/PathFinderGame.jsx` — lobby, game state, controls, movement and API lifecycle.
- `src/games/PathFinder/MazeMap.jsx` — live explored maze and character.
- `src/games/PathFinder/QuantumReadout.jsx` — probability comparison, amplitudes, relative phases and diffusion recipe.
- `src/games/PathFinder/maze.js` — randomized mission maps and safety predicate.
- `src/games/PathFinder/quantumOperations.js` — gate decompositions, validation and measurement decoding.
- `src/games/PathFinder/pathfinder.css` — game layout, responsive map and dark theme.
- `src/games/PathFinder/README.md` — implementation and learning notes.
- `src/theme.css` — site-wide theme toggle styling and dark palette.
- `tests/pathfinder.test.js` — structural and real-backend quantum tests.

Modified:
- `src/App.jsx` — mission integration, theme state and preference storage.
- `src/components/Header.jsx` — Quantum Missions navigation and theme toggle.
- `src/main.jsx` — theme stylesheet import.
- `src/api.js` — configurable API origin with development proxy default.
- `vite.config.js` — development/preview API proxy.
- `package.json` — test scripts.
- `eslint.config.js` — Node globals for test files.

No Python/backend files changed. Existing simulator and algorithms behavior is preserved; they now use the same API proxy.

## Playable training mission

The lobby's **Start tutorial** opens a fixed two-qubit practice room in Guided scanner mode. Six successful actions teach allocation, superposition, the safety oracle, one diffusion round, measurement, and backtracking. Exactly one of four corridors is safe, so the existing ideal simulator amplifies that state to probability 1; its destination is a dead end to teach that safety is not a route-to-exit oracle. Completing the backtrack ends training and offers First Light or Replay. It does not award regular mission stars.

The highlighted instruction follows committed scanner state, including Undo and Reset. Failed requests preserve the step, and a hazard/unused measurement returns to allocation through the normal movement logic. Skip returns to the lobby; replay creates a new practice session. Completion is retained only in the current session, like mission progress. The tutorial uses the normal `/simulate` endpoint, with no fabricated states or measurement overrides. English and Vietnamese instructions are included.
