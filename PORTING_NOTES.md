# Porting Notes

## What Changed

- Converted the repository root into an Expo app with `App.js`, `app.json`, `babel.config.js`, `metro.config.js`, and `eas.json`.
- Removed Vite/RNW runtime files from active use, including `index.html`, `vite.config.js`, and source CSS.
- Replaced the web app entry with Expo `App.js` and retained the existing SDRS app shell, Korean copy, domain state, search, import, and export logic.
- Replaced DOM screen and zoom wrappers with React Native `Animated`, `Modal`, `View`, `Pressable`, and `Image`/`SvgXml` equivalents.

## Native Replacements

- Storage: `@react-native-async-storage/async-storage`.
- File import: `expo-document-picker`.
- File read/export/share: `expo-file-system` and `expo-sharing`.
- Bundled seed data: `expo-asset` loads `ship.csv`, `images.zip`, and `no-image.svg`.
- Fonts: `expo-font` loads only existing local font files from `assets/fonts`.
- SVG: `react-native-svg` renders inline XML via `SvgXml`.
- Animations: React Native `Animated`; no `framer-motion`.

## No-op Stubs

Native `src/platform/index.js` intentionally no-ops browser-only helpers such as DOM querying, data attributes, pointer capture, computed styles, visual viewport listeners, and document theme mutation.

## Remaining Parity Gaps

- Image zoom lacks full web pinch/double-tap/pan/source-thumbnail animation parity.
- Long-press reorder no longer has browser pointer capture or synchronous DOM rect reads.
- Dark mode selection exists, but full CSS-variable dark visual parity is not complete.

## Verification Results

- `npm install`: completed after retrying registry socket timeouts.
- `npx expo-doctor`: passed once with `17/17 checks passed`; two later reruns failed only because the network-backed Expo config schema check could not reach the Expo API.
- `npx expo export --platform android`: passed, exported `dist`.
- Static greps for `framer-motion`, RNW/DOM/CSS imports, and browser APIs outside `src/platform` returned no output.
- `npm run audit:data`, `npm run audit:dom`, `npm run audit:browser-apis`, and `npm run test:run` passed.
