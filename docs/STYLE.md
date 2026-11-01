# Approved Lauza style

The approved direction is the Timothy neo 2D V4 treatment: rectangular forms,
bold black edges, hard offset shadows on graphics, and selective yellow.
Creative choices still follow each clip's meaning and source footage.
The shared machine-readable values are in `brands/lauza/style.json`.
This identity applies across different podcasts and speakers. The actual
person, speaking turns, head size, camera shots and illustrations are per-job.

| Role | Value |
| --- | --- |
| Dark ink | `#171717` |
| Gray background | `#E6E6E6` |
| Light gray | `#F7F7F7` |
| Structures | `#5C5C5C` |
| Soft surfaces | `#CFCFCF` |
| Muted gray | `#B7B7B7` |
| Only colored graphic accent | `#F4CB46` |

Natural source-footage colors are allowed. Do not add blue/coral/cream to
graphics. Lauza's palette is not automatically Vordev's palette.

## Typography

Adwaita Sans supplies solid sentence-case dialogue; Montserrat ExtraBold
supplies selected main concepts; Caladea Italic supplies expressive contrast.
These locally licensed families are a starting point, not a font-count quota.
Measure actual fonts, wait for them to load and review at phone size.

Use small-to-large hierarchy, inline mixed type and balanced stacked lines.
Alternate directional entrances between phrases when appropriate: down, up,
left and right. Let words settle long enough to read. Do not enlarge ordinary
filler verbs merely to show another effect. Yellow is meaningful, not a moving
highlight box on every word. No black letter outlines or text shadows.

Caption center y=1420 is the reference starting point. Recheck face placement,
line count and the lower-right UI on each clip. Keep bottom 300 px clear.

## Camera, icons and depth

Reference opening: close framing at 1.58× → 1.00× over 1.65 s, quintic
smoothstep, with a face-oriented origin near 30% frame height. It was visually
reviewed on Timothy; validate head bounds before reusing on another subject.
Later zooms are purposeful and stay inside source shots.

The FFmpeg fallback supersamples to 2160×3840 before zoompan to reduce
integer crop jitter. This is a rendering technique, not extra source detail.

Speaker-side icons sit in clear upper side areas, outside face/subtitle bounds.
No enclosing black plate. Animate the relevant parts after arrival. Keep them
flat and legible; no 3D props. True graphics behind shoulders/head require
subject segmentation and a separate foreground layer.

## Lower fade

Approved reference stops from y=760 to y=1920:
`[0,0], [.18,.10], [.38,.30], [.60,.58], [.80,.80], [1,.95]`.
This fades black into the lower half. It is absent on full graphic cutaways.
Adjust only when actual face placement or contrast needs it.
