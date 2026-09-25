# VerbFlow — Copyright and License Compliance: Final Report

## 1. Changes implemented

- Added the complete offline notice file:
  `artifacts/verb-trainer/src/assets/licenses/THIRD_PARTY_LICENSES.txt`
- Added the themed notice page:
  `artifacts/verb-trainer/src/pages/third-party-licenses.tsx`
- Added `/settings/licenses` to:
  `artifacts/verb-trainer/src/App.tsx`
- Added the **Third-Party Licenses** Settings entry in:
  `artifacts/verb-trainer/src/pages/settings.tsx`
- Added `.ttf` and `.txt` to the web app's offline precache patterns in:
  `artifacts/verb-trainer/vite.config.ts`
- Added the internal content record:
  `artifacts/verb-trainer/VerbFlow_Content_Provenance.md`

No educational dataset, billing source, dependency version, Android keyboard
code, app identifier, SDK level, or unrelated interface was changed.

## 2. Inter provenance and license

The four existing local files are:

- `src/assets/fonts/inter-400.ttf`
- `src/assets/fonts/inter-500.ttf`
- `src/assets/fonts/inter-600.ttf`
- `src/assets/fonts/inter-700.ttf`

Git history establishes that a 2026-09-22 Replit Agent commit added these files
specifically to replace runtime Google Fonts delivery of Inter
400/500/600/700. Font metadata identifies them as RSMS Inter Regular, Medium,
SemiBold, and Bold, version 4.002. The family, styles, PostScript names, foundry,
and version match the official Inter 4.1 static release. The exact download
URLs were not retained, but the repository history and binary metadata provide
a consistent Google Fonts/official Inter provenance chain. The existing files
were therefore retained to avoid unnecessary visual changes.

The complete SIL Open Font License 1.1 and Inter copyright notice are included
in the distributed offline notice.

## 3. Third-party notices

The notice includes the applicable complete license texts and copyright
notices for:

- Inter (SIL OFL 1.1)
- Lucide React (ISC plus Feather-derived MIT notice)
- React and React DOM (MIT)
- Capacitor Core, Android, App, Browser, Splash Screen, and Status Bar (MIT)
- `cordova-plugin-purchase` (MIT)
- Radix UI components (MIT)
- TanStack React Query and other MIT runtime components
- `idb` and ISC runtime components
- `class-variance-authority` (Apache-2.0)
- Wouter (The Unlicense)

The inventory is limited to application/runtime components and does not
intentionally list unrelated workspace development tools. The notice is both
embedded in the rendered page and emitted as a separate hashed text asset.

Google Play Billing Library 9.0.0 is governed by the Android SDK License
Agreement according to Google's release notes. It is not incorrectly
classified as Apache-2.0.

## 4. IPA provenance findings

Git history establishes that a Replit Agent commit dated 2026-06-26 created
`src/data/verbIPA.ts` while implementing the owner's request for stored
British-English IPA. The task supplied only a few illustrative examples.

No available commit message, script, imported dataset, API client, URL,
dictionary name, attribution, or license identifies the source of the complete
table. The repository does not prove whether it was AI-generated, manually
assembled, obtained from an API, or copied from a dictionary. No source has
been invented or inferred.

Recommendation: independently verify every entry without copying a proprietary
compiled table, or select a British-English dataset whose license expressly
allows commercial redistribution. Any replacement should happen only after
owner approval because it can change stress marks, weak forms, and
transcription conventions. The IPA dataset was not changed.

## 5. Frequency ordering and other uncertain content

`frequencyRank` appears in the earliest tracked verb data. No repository record
names a frequency list, corpus, API, or license. Its origin therefore remains
unresolved.

The Russian translations were added in a Replit Agent commit, but no underlying
dictionary, translator, API, or license is identified. The grammar guide and
4,020 context records have strong project-specific creation and curation
indicators, but the repository alone cannot provide an independent originality
guarantee. Detailed findings are in `VerbFlow_Content_Provenance.md`.

## 6. Visual assets

`public/opengraph.jpg` is an app-screen rendering containing VerbFlow's former
“English Verb Trainer” interface. It has no external photograph or
illustration, and no current source or metadata reference uses it. Vite still
copies it because it remains under `public/`. Its exact capture record is not
available. It was retained to avoid unnecessary deletion and can be removed if
the owner confirms it is no longer wanted.

The owner identifies the branding and promotional artwork as project-specific
and AI-assisted. The repository contains source SVGs and generated derivatives
but not independent creation-service records.

## 7. Build and offline validation

- TypeScript typecheck: passed.
- Test suite: 13 files, 206 tests passed.
- Production web build: passed.
- Capacitor Android web build: passed.
- Capacitor Android sync: passed.
- Generated Android assets contain:
  - all four Inter TTF files;
  - `THIRD_PARTY_LICENSES-CDfZuYZX.txt`;
  - the complete OFL, Lucide/Feather, Apache-2.0, MIT, ISC, and Unlicense text.
- Active source and generated assets contain no
  `fonts.googleapis.com` or `fonts.gstatic.com` reference.
- The notice page uses only packaged content and requires no network request.
- A clean preview loaded without browser-console errors. Because first-run
  onboarding intentionally supersedes application routes until completion,
  the automated clean-profile screenshot showed onboarding rather than the
  nested Settings page; the page was nevertheless typechecked and bundled.
- Billing-related source files have no diff.

## 8. Remaining release verification

The Replit environment has Java 19 rather than the Java 21 required by this
Android project. It could complete Capacitor sync but not a final Gradle release
build or resolved release dependency report.

Before publishing the signed AAB:

1. Open the Android project with Android Studio's Java 21 Embedded JDK.
2. Resolve and archive the release Gradle dependency graph.
3. Build the release AAB.
4. Inspect the AAB to confirm the four font files and third-party notice asset.
5. Reconcile any additional native transitive component notices revealed by
   the resolved release graph.
6. Perform the final offline device check of Settings → Third-Party Licenses.
7. Confirm whether the unused `public/opengraph.jpg` should be deleted.
8. Decide whether to retain, independently verify, or replace the unresolved
   IPA and frequency datasets.