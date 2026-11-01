---
name: lauza-clipper
description: Plan, review and produce Lauza podcast clips using the approved black-gray-yellow 2D neo-brutalism style, acoustic captions, face-safe camera moves, animated explanatory objects and SFX. Use inside this clipper kit; apply Vordev branding only from its own brief.
---

# Lauza clipper

Read [approved style](../../docs/STYLE.md) for visual decisions.
Read [workflow](../../docs/WORKFLOW.md) when planning or executing a clip.
Commands and dependency setup are in the repository [README](../../README.md).

The reference case is `brands/lauza/timothy-reference`. Its shapes, caption
hierarchy and rendering approach are reusable; its dialogue, numbers, object
choices, timestamps and crop path are specific to that clip. Do not paste its
anchors onto new footage.
The speaker/podcast is not fixed. Shared style comes from
`brands/lauza/style.json`; determine active speakers and fresh framing for
every source, including videos with more than one person.

## Invariants

- 1080×1920, 30 fps; keep source timestamps when converting frame rate.
- Use real word intervals from supplied acoustic alignment or align the audio.
  Frame timestamps at 30 fps may be converted to seconds; phrase durations
  may not be evenly divided and relabeled as word alignment.
- Compose readable 2–5 word captions, varying size, type and direction by role.
  Preserve time for reading after motion. Brief words get shorter entrances.
- No black subtitle outline, no dark card surrounding speaker-side icons.
  A gradual lower-frame black fade is approved; keep the face readable.
- Full-motion graphics carry their own type. Hide dialogue captions there.
  An integrated on-speaker quote replaces the ordinary caption layer.
- Camera framing must retain hair and chin, follow each shot and have an
  explicit subject. A strong opening pullback is an option, not mandatory.
- Use flat diagrams and objects that perform the sentence: notes enter a
  wallet; a shackle closes; a relevant graph builds. One primary idea per beat.
- Dialogue stays primary. Add selective timed SFX for animations, icons and
  type emphasis; no added music by default. Check attack/leading silence.
- Voice target −16 LUFS before mastering; final −14 LUFS and ≤−1.5 dBTP.
  If music is later requested, duck it about 11 LU below the voice.
- Keep text above the bottom 300 px and away from the lower-right platform UI.
- Do not apply audio/video offsets based on visual guesses. Correlation checks
  reveal added delay, not perceptual lip-sync truth. Report review limitations.

## Working modes

Analysis request: inspect the real clip/references and return a timecoded beat
proposal. Do not edit/render until authorized. Existing execution authorization
remains valid; routine reversible production steps need no repeated approval.

Execution request: prepare timing/framing, implement, review phone-sized frames,
render a versioned file and run checks appropriate to the change. Finish the
requested artifact. Preserve approved prior exports for comparison.

The kit runs on Remotion. GSAP can be adapted to its frame clock if useful.
HyperFrames/Facecammaxxing are optional sources of techniques, not installed
dependencies. Real behind-person occlusion requires a clean subject matte;
never claim a flat overlay is behind the body. Do not add 3D without a new brief.
