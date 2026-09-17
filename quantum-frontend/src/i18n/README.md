# English and Vietnamese

The header language control selects `en` or `vi`; LanguageProvider remembers it in localStorage and sets the document language and title. Switching changes presentation without replacing circuit, lesson, account or mission state.

Vite uses our local JSX runtime to translate native element text, fragment text and title/placeholder/alt/aria-label attributes through LanguageContext. It never translates control values, API payloads, IDs, classes or event handlers. Mark user-authored content with `translate="no"`; descendants inherit this protection. Gate identifiers and mathematical notation retain their original form.

Add new source text to vi.js (general), viGame.js, viInterface.js (tutorial controls/errors) or viTutorial.js (curriculum). Add complete dynamic sentence patterns to translate.js. Keep the English source string as the key; whitespace is normalized for lookup. Unknown text falls back to the original. Add translations whenever introducing new user-visible API errors. External browser-native validation messages follow the browser's language settings.

`npm test` checks all curriculum content and hints, visible JSX text, accessibility attributes, dynamic examples, and the presentation boundary's protection of values and user text. Browser checks should also cover switching during a lesson or mission and long Vietnamese labels at mobile widths.
