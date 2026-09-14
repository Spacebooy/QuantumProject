# Guided Tutorial

Entry: Circuit Builder → Guided Tutorial. Optional, off by default. No backend
changes, simulated client-side outcomes, persistence tables, or new dependencies.

## Modules

- `tutorialLessons.js`: 18 core lessons, three advanced introductions, 30 exercises;
  includes reusable gate descriptions, example inputs, hints and outcome predicates.
- `useTutorial.js`: React progress state and navigation. App remains the sole owner
  of the active circuit. Captures a circuit backup before practice; restores it on
  exit. A paused snapshot supports resume without losing the real practice result.
- `tutorialUtils.js`: circuit identity, operation comparison, amplitude/phase,
  measurement and Bell-state validation. Global phase is ignored; relative phase
  is checked. An identical histogram alone cannot pass the Bell-state challenge.
- `TutorialOverlay.jsx`: accessible guide controls, compact layout, hints and feedback.
- `TutorialHighlight.jsx`: stable `data-tutorial-id` lookup, pointer-transparent
  highlight, scroll/resize tracking, and separate CNOT control/target outlines.
- `TutorialLessonSelector.jsx`: unordered lesson selection, completed/skipped status.
- `QubitBot.jsx`: original SVG character and reusable mood/message API.
- `tutorial.css`: scoped guide and gate-information styles.

App passes its existing state and successful `/simulate` response to the guide.
Selecting a gate alone never completes a task. Normal exercises require the actual
operation sequence, qubit count, mode and expected API observation. The Bell challenge
accepts alternative circuits using H/X/CNOT if their actual state matches the target.
Late responses cannot replace restored circuits or validate a different exercise.
The existing BlochSphere component renders actual one-qubit API amplitudes during
lessons. No independent pure-state sphere is shown for an entangled pair.

Progress lasts while the app is mounted, including navigation, exit and resume.
Reloading the page resets it. Skipped steps do not count as completed. Restart Lesson
clears that lesson's progress. Practice inputs are reloaded when moving to an
interactive step, so every exercise can be reached independently after skipping.

Noise limitation: existing UI slider values are not transmitted by `/simulate`.
The noise lessons explicitly distinguish the backend's fixed-parameter stochastic
trajectories from a tunable ensemble experiment. Noisy tasks accept any valid real
trajectory; they never require a particular random measurement.

## Validation

From `quantum-frontend`:

```sh
npm run build
npm test
TEST_SIMULATOR=http://127.0.0.1:8001 node --test tests/tutorial.test.js
```

The last command checks all 30 exercises against the live backend as a guest.
Unit tests cover curriculum coverage, incorrect controls/angles/modes, phase-sensitive
Bell validation, collapse checks and contextual feedback. Existing PathFinder live
tests additionally require `TEST_TOKEN` for circuits larger than two qubits.

Browser checked: entry, result-gated Next, wrong X during H lesson, successful H/X,
lesson selection, skip/hint, restoration and resume, gate info, dark theme, and a
390×844 viewport. Production build and targeted ESLint passed.

Manual checks worth repeating on your own devices:
- Complete a lesson using keyboard only; navigate between the guide and real circuit
  cells, and use Exit or Escape while focus is in the guide.
- Try a full Bell challenge, rotation angles and noise lesson on a physical phone.
- Exit or change lessons during a slow/failed API request; verify your saved circuit.
- Review the teaching wording and pacing with a beginner. Refresh intentionally
  clears progress; no tutorial database migration or setup is required.

## Beginner guidance update

`tutorialPlainLanguage.js` supplies short high-school-friendly explanations; the
precise original wording stays in an optional disclosure. `tutorialGuidance.js`
derives one immediate action from the live circuit, including wrong-gate removal,
rotation angle entry, CNOT target selection and empty-slot placement. A slow gold
pulse and a nearby action label identify the target. “Show me where” brings it
back into view. “Pause glow” and reduced-motion preferences stop the animation.
Guidance tests cover gate → slot → run and settings/control-target distinctions.
