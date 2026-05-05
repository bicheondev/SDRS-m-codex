# Native Port Readiness

## Current Status

This repository is now an Expo-native React Native app at the repository root. The Vite / React Native Web runtime entry has been removed from active use, and `App.js` is the Expo entry point.

## Native Runtime Implemented

- Root Expo config exists in `app.json`, `babel.config.js`, `metro.config.js`, and `eas.json`.
- `package.json` uses Expo scripts and no longer depends on `react-dom` or `react-native-web`.
- `src/platform/storage.js` persists database state with AsyncStorage.
- `src/platform/files.js` imports files with `expo-document-picker`, reads image files with `expo-file-system`, and exports DB archives through `expo-file-system` plus `expo-sharing`.
- `src/platform/bundledData.js` loads `ship.csv`, `images.zip`, and `no-image.svg` through `expo-asset` / `expo-file-system`.
- Local fonts under `assets/fonts` are loaded with `expo-font`.
- SVG UI assets render through `react-native-svg` / `SvgXml`.
- Framer Motion is not used in native runtime; screen transitions use React Native `Animated`.

## Boundary Still Present

The historical `src/platform/web/*` files remain isolated under `src/platform/web` for source-boundary auditing only. Active native imports use the root `src/platform/*.js` files.

## Remaining Parity Risks

- Image zoom is native and functional, but advanced web parity such as thumbnail-origin animation, double tap, pinch zoom, and pan physics remains simplified.
- Native DOM helper replacements are no-op where the original feature depended on browser-only synchronous DOM state.
- Long-press reorder uses React Native layout state, but the original DOM rect and pointer-capture behavior is not fully reproduced.
- Theme CSS variables are resolved for the native app’s primary light visual treatment; full dark-mode parity is not complete.

## Validation

Primary required commands:

```sh
npm install
npx expo-doctor
npx expo export --platform android
grep -R "from 'framer-motion'\|from \"framer-motion\"" src || true
grep -R "react-dom\|react-native-web\|import.meta\|\.css'\|\.css\"" src || true
grep -R "window\|document\|localStorage\|sessionStorage\|visualViewport\|matchMedia\|getBoundingClientRect\|Blob\|FileReader\|createObjectURL\|HTMLElement\|HTMLInputElement" src --exclude-dir=platform || true
```

Latest local results:

- `npm install`: completed after registry timeout retries.
- `npx expo-doctor`: passed once with `17/17 checks passed. No issues detected!`; later retries failed only on the network-backed Expo config schema check due TLS/EPIPE connectivity.
- `npx expo export --platform android`: succeeded and exported `dist`.
- All three required static grep commands completed with no output.

Additional checks:

- `npm run audit:data`: passed.
- `npm run audit:dom`: passed.
- `npm run audit:browser-apis`: passed; browser-specific APIs remain confined to approved `src/platform/web/*` files.
- `npm run test:run`: passed, 3 files / 6 tests.
