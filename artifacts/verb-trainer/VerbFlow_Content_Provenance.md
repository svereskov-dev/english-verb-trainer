# VerbFlow Content Provenance

This internal record documents what the repository and available project
history establish about VerbFlow's educational content and bundled visual
resources. It is not a claim that AI-assisted material is automatically
copyright-protected, unique, or free of third-party rights.

## General project history

The project owner states that most educational material was created
specifically for VerbFlow with assistance from ChatGPT and Replit, then
reviewed and edited during development. That statement is project-history
information supplied by the owner. Repository inspection can confirm when
files and batches were added, but cannot independently prove authorship or
exclude consultation of unrecorded external sources.

## 335-verb dictionary and verb forms

- Current source: `src/data/verbs.ts`
- Export snapshot: `verbs-export.json`
- The current dictionary contains 335 verbs.
- Irregular forms are stored explicitly. Most regular past forms are generated
  by project code.
- Git history shows the verb data being created and revised within the project.
- No repository file names a dictionary, textbook, API, corpus, or other
  external dataset as the source of the verb list or irregular forms.

Individual spellings and ordinary conjugation facts are linguistic facts.
Repository evidence does not establish the origin of the selection or
arrangement of the complete 335-item list.

## Frequency ordering

`frequencyRank` was present in the earliest available tracked version of the
verb data. The initial relevant commit was authored by Replit Agent, but the
commit, technical specification, scripts, and attached records do not name a
frequency corpus or source list. Later export files call the value
`sourceFrequencyRank`, which describes the field but does not identify an
external source.

**Status:** Origin unresolved. Do not claim that the ordering was independently
generated or sourced from a particular corpus without additional records.

## Russian translations

- Current source: the `translations` map in `src/data/verbs.ts`.
- Git history records a Replit Agent commit adding Russian translations.
- No translator, dictionary, API, website, or license is identified in the
  commit or available project notes.

**Status:** Project-added content with unresolved underlying source. The
repository does not show systematic import from a named translation database,
but it cannot prove independent creation.

## British-English IPA transcriptions

- Current source: `src/data/verbIPA.ts`.
- A Replit Agent commit dated 2026-06-26 created the complete 354-line file
  while implementing the owner's request for stored British-English IPA.
- The attached task requested British English and supplied a few illustrative
  examples, but did not provide a complete transcription dataset or source.
- A follow-up Replit Agent commit changed one display/transcription detail.
- No commit message, script, imported file, API client, URL, dictionary name,
  attribution, or license identifies where the complete table came from.
- No evidence in the available repository proves that the table was generated
  by an AI model, manually assembled, obtained from an API, or copied from a
  specific dictionary.

Individual phonetic descriptions represent linguistic information, while a
substantial compiled transcription database can have copyright, contractual,
or database-right considerations depending on jurisdiction and source.

**Status:** Origin unresolved. The current dataset has not been modified by
this compliance task.

**Recommended resolution:** Independently verify every entry against one or
more reliable pronunciation references without copying a proprietary
dictionary's compiled table. If a clean replacement is preferred, select a
British-English pronunciation source whose license expressly permits
commercial redistribution of a compiled dataset, document the version and
license, then replace the data only after owner approval. Expect possible
changes in stress marks, weak forms, syllabification, and treatment of regular
past-tense endings.

## Grammar explanations and tense guide

- Taxonomy and tense identifiers: `src/data/grammar.ts`
- User-facing tense guide: `src/pages/tenses.tsx`
- The guide consists of short grammar structures, Russian prompts, and simple
  examples maintained in project source.
- No external textbook, website, or grammar dataset is cited.

Grammar rules and short formulae are generally factual or functional. The
repository cannot independently prove the origin of the wording and examples.

## Context exercises

- Runtime source: `src/data/contextExercises.json`
- Total records: 4,020, including 3,330 active and 690 inactive/unavailable.
- Historical inputs: seven final batch JSON files under `attached_assets/`.
- The batch files use project-specific IDs and metadata and match the runtime
  record count.
- Project records describe the batches as manually curated and reviewed.
- No external corpus, textbook, website, or licensed sentence dataset is cited.

**Status:** Strong project-specific creation and curation indicators, while the
repository alone cannot provide an independent originality guarantee.

## Other educational text

Onboarding, settings, paywall, exercise instructions, error messages, and
similar interface text are maintained in project source. No third-party source
or attribution was found for those texts.

## Fonts and visual resources

### Inter

The four local font files were added by the 2026-09-22 Replit Agent commit
“Localize Inter font assets and remove remote Google Fonts.” The preceding app
loaded Inter 400/500/600/700 from Google Fonts. The local files identify
themselves as RSMS Inter Regular, Medium, SemiBold, and Bold, font version
4.002; this family/version metadata matches the official Inter 4.1 static
release. Exact download URLs were not retained. Inter is distributed under the
SIL Open Font License 1.1, whose complete text is included in
`src/assets/licenses/THIRD_PARTY_LICENSES.txt`.

### VerbFlow branding

The owner states that the VerbFlow branding and Google Play promotional
artwork were created specifically for this project with AI assistance. Source
SVGs and generated derivatives are present under `assets/`, `public/`, and the
Android launcher resources. The repository supports a project-specific asset
pipeline but does not contain independent creation-service records.

### `public/opengraph.jpg`

The image is a screenshot-style rendering of VerbFlow's own earlier interface:
it contains the “English Verb Trainer” title, daily-progress card, counters,
and Start Practice button. No external photograph or illustration appears in
it. No source-code or HTML reference currently uses this file, although Vite
copies it into web and Android public assets because it is stored in `public/`.
Its exact capture/generation record is unavailable. It was retained to avoid an
unnecessary asset deletion; it may be removed separately if the owner confirms
it is no longer wanted.

## Software-license inventory boundary

The in-app notice covers direct application/runtime components and the common
license families of their bundled transitive modules. Google Play Billing
Library 9.0.0 is governed by Google's Android SDK License Agreement according
to Google's 9.0.0 release notes; it is not represented as Apache-2.0 in the
notice. The final signed AAB and its fully resolved Gradle dependency graph
remain the authoritative release-package inventory and must be checked during
release preparation.