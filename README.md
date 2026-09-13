# حزب (Hizb)

A cross-platform (iOS + Android) Quran app built with React Native / Expo: the full
Mushaf (604 authentic pages), fast Arabic search, bookmarks, and ayah-by-ayah
recitation.

## Features

- **Mushaf reader** - swipe through all 604 pages rendered from the authentic
  Hafs/Madani page plates (vector, so they stay crisp at any zoom level), with
  pinch-to-zoom and a "go to page" jump. A **text mode** toggle switches to a
  selectable, tappable ayah-by-ayah view (Amiri Quran font) for search-result
  highlighting, bookmarking, copy, and share.
- **Search** - full-text ayah search (SQLite FTS5, normalized so plain/undiacritized
  typing still matches the diacritized Quran text) plus surah-name search.
- **Bookmarks** - long-press any ayah in text mode to bookmark it; manage them from
  the Bookmarks screen.
- **Recitation audio** - streams per-ayah recitation from everyayah.com, with disk
  caching for offline replay, a persistent mini-player, and a reciter picker in
  Settings. Background playback is enabled on both platforms.
- **Light/dark/system theme**, last-read-page restoration, and a fully offline data
  layer (only audio playback needs network).

## Project structure

```
App.tsx                    Root: ErrorBoundary > SQLiteProvider > RootNavigator
index.ts                   Entry point; installs the global JS error handler
src/
  navigation/               React Navigation stack + route param types
  screens/                  Splash, Landing, SurahList, Search, Bookmarks, Settings
  mushaf/                   Reader internals: MushafPage (SVG), TextPage, dialogs
  db/                       expo-sqlite repository layer (surahs, ayahs, bookmarks)
  audio/                    EveryAyah URL building + the audio player singleton
  state/                    zustand stores (theme, reader, audio)
  theme/                    Colors and typography (Amiri / Amiri Quran fonts)
  components/               Shared UI: ErrorBoundary, MiniPlayer, ZoomableView, ...
assets/
  data/quran.db             Bundled SQLite DB (committed - ~3MB)
  mushaf/                   604 page SVGs - NOT committed, see setup below (~400MB)
scripts/                    One-off/codegen scripts, see below
```

## Setup

```bash
npm install
```

The 604 Mushaf page SVGs (~400MB) are **not** committed to this repo - they're
copied from the sibling Flutter prototype this app was ported from. If you have
`../Quran Project/mushaf-pages-cleaned` next to this repo on the same machine:

```bash
npm run copy:mushaf-assets        # copies the 604 SVGs into assets/mushaf/
npm run generate:mushaf-manifest  # regenerates src/assets/mushafManifest.ts
```

If you don't have that source folder, the app still runs fully in **text mode**
(the Mushaf/SVG mode will show a "couldn't load this page" placeholder per page
until the assets are copied in).

## Running the app

This machine has no Android SDK / Xcode installed, so the practical loop is:

```bash
npm start
```

Then scan the QR code with **Expo Go** on your phone (iOS or Android) - every
native module used here (SQLite, audio, SVG, file system, gestures) is supported
in Expo Go. `npm run android` / `npm run ios` only work if you have the
respective native toolchain installed locally.

## Verifying changes

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # jest - repository/utility unit tests
npx expo export     # full production Metro bundle, catches asset/bundling issues
                     # without needing a device (rm -rf dist afterwards)
```

None of these can substitute for actually opening the app in Expo Go - they catch
type errors, lint issues, and bundler/asset problems, not runtime/UI behavior.

## Building for the App Store / Play Store

This project is set up for [EAS Build](https://docs.expo.dev/build/introduction/)
(`eas.json` has `development`/`preview`/`production` profiles). Before you can
produce a real build:

1. Create an [Expo account](https://expo.dev/) and run `npx eas login`.
2. **Apple Developer Program** ($99/yr) for iOS builds/TestFlight/App Store, and a
   **Google Play Console** account ($25 one-time) for Android/Play Store.
3. Decide on real values for `ios.bundleIdentifier` / `android.package` in
   `app.json` (currently placeholders: `com.hizbapp.quran`) - these can't be
   changed after your first store submission.
4. `npx eas build --platform android --profile preview` to get an installable
   `.apk` for testing outside Expo Go, then `--profile production` +
   `npx eas submit` when ready to publish.
5. Both stores require a hosted privacy policy URL for the listing - Settings'
   "عن التطبيق" section has the in-app text to adapt; it'll need to live on a
   real URL (e.g. a GitHub Pages page) before submission.

## Notable data fix

The bundled `quran.db` originally indexed ayah search text *with* full Arabic
diacritics, so searching the way anyone actually types (undiacritized) matched
nothing. `scripts/fix-fts-diacritics.mjs` normalizes a `text_ar_plain` column and
rebuilds the FTS5 index against it (already applied to `assets/data/quran.db`);
`src/utils/arabicNormalize.ts` applies the same normalization to search queries at
runtime.
