# Production workflow

## 1. Intake and analysis

Read the actual footage, supplied references, transcript and timestamps.
Probe dimensions, duration, rotation, frame rate and source shot cuts. Confirm
the requested mode: analysis/proposal, a review preview, or a final export.
Use the existing authorization; do not introduce another approval checkpoint.
For one or multiple speakers, identify who is actually speaking in each shot.
Rebuild framing per clip; never reuse the reference person's face coordinates.
Input word times must refer to the supplied clip's own clock. If a long-source
transcript uses absolute timestamps, apply its documented clip-start offset;
do not guess an offset from the wording.

Build a timecoded plan: spoken claim, speaker/cutaway, action, caption layout,
camera target, SFX contact, and required assets. Preserve original voice and
lip timing. Cut fillers or pauses >0.4 s only in verified silence, and map
every affected word/visual/SFX to the edited clock if actual cuts are made.

## 2. New job

`scripts/new-job.py` copies a provided source into ignored local media and
creates a plan plus a basic review component. It accepts word-level seconds
(`w,s,e` or `text,start,end`) or explicit 30 fps frame intervals.
Empty/missing alignment is marked as awaiting alignment, never invented.

Register the generated `Clip` in `src/Root.tsx` with 1080×1920, 30 fps and
`durationInFrames` from its plan. The initial center crop is provisional.
Review every camera angle and replace it with shot-aware face framing before
final production. The review component is not the finished neo design.

For another clip, build fresh scene anchors and semantic illustrations using
the reference case. Replace hardcoded Timothy wording and 52-second bounds.
Shared components/fonts belong in `src/shared` / `public/shared`.
Brand job data lives in `brands/<brand>/<job>`; media in its `public` mirror.

## 3. Audio and assets

Use acoustic alignment from Antigravity when supplied; do not rerun a model
unnecessarily. If alignment is unavailable, obtain it before claiming precise
word timing. Preserve raw input and record text corrections separately.

Index ZIP assets with `scripts/media-library.py`; search bounded metadata and
extract selected effects. Rebuild the local catalog after moving archives.
Never unzip the entire large collection just to find one effect. The catalog
and user ZIPs are not bundled. `timothy-reference/mix.py` is a working example
for the original collection's members, not a universal SFX selection.

Use SFX-only by default. Align actual attacks/peaks to visual actions, leave
quiet intervals and keep dialogue clear. Normalize dialogue then master the
combined mix. Do not attach loud effects to every subtitle word.

## 4. Implementation and review

Use the Remotion frame clock; no timers, unseeded randomness or CSS animation.
Keep camera motion on footage, not on caption/UI coordinates. At source cuts,
the crop must jump to the new shot rather than interpolate through empty space.
Maintain hair/chin clearance throughout the motion, not just on its endpoints.

Review beginning, middle, end, source cuts, short keywords, graphic transitions
and the punchline at phone scale. On graphic cutaways, hide ordinary captions.
Show one primary visual idea per beat. A request for more animation should
produce meaningful object actions and varied composition, not perpetual bounce.

## 5. Export and validation

Use Remotion first. `render.cjs` demonstrates an SVG/FFmpeg fallback where
Studio/browser rendering is unavailable; browser font loading and SVG font
resolution differ, so check both before claiming parity. Rendering fallback
requires FFmpeg SVG support, fonts and an H.264 encoder.

Check TypeScript, output dimensions/fps/frame count, text/face safe zones,
palette, missing assets and caption visibility. Check loudness/true peak after
audio changes. Compare decoded audio after visual-only edits; repeat timing
checks when the audio/timeline actually changes. Numerical correlation cannot
certify perceptual lip sync; directly review playback/listening when available.

Save a versioned output and a small verification report. Avoid unnecessary
reruns after relevant checks pass. Keep secrets, footage, ZIPs and renders
outside the Git package. Publish only when the user authorizes it.
