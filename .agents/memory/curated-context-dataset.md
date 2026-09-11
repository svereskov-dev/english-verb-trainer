---
name: Curated Context dataset
description: Approval boundary and immutability rule for the manually reviewed Context Mode records.
---

Keep the manually curated Context Mode records unchanged except for corrections the user explicitly authorizes. Do not normalize, regenerate, or silently repair their IDs, sentences, answers, subjects, or practice targets. Stage 2 is approved and active: these records are the only runtime Context sentence source.

**Why:** The dataset was manually curated and reviewed. Runtime and persisted-session integrity depend on always resolving Context content from the currently active canonical record rather than serialized sentence data.

**How to apply:** Treat new validation findings as reportable issues unless the user authorizes a correction. Select by verb and explicit practice target. Fall back to the corresponding non-context exercise when no active record exists. Rehydrate every persisted exercise from its stable ID; reject malformed, unknown, invalid-target, or inactive curated IDs, and never trust persisted question, answer, type, verb, tense, or target fields.