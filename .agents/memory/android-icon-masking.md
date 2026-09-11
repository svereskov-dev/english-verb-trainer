---
name: Android icon masking
description: Reliable treatment for keeping the VerbFlow launcher and splash artwork consistent across Android devices.
---

Keep the canonical icon artwork inside Android’s adaptive foreground safe area and let Android apply the launcher mask. Do not add rounded corners through ImageMagick compositing in the cross-platform generator.

**Why:** ImageMagick rounded-mask composition produced incompatible transparent/black outputs across command variants, while Android’s native adaptive mask is stable and preserves the intended launcher shape.

**How to apply:** Generate the foreground on a transparent adaptive canvas with safe-area padding, keep legacy icons from the same canonical source, and visually inspect a background-composited preview before syncing Android resources.