# Package validation

Validated locally with Node 22.23.2, npm 10.9.8, Python 3.14.8,
FFmpeg 8.0.1, TypeScript 5.9 and Remotion 4.0.539.

Passed:

- TypeScript checks for shared components and the reference composition.
- Remotion browser bundle compilation with local public assets.
- Standalone offline style render: 1080×1920, 30 fps, 150 decoded frames.
  No source podcast footage or sound archive is needed for that preview.
- Visual inspection of the exported style still.
- Reference typesetting and 28 rendered check frames with temporary external
  source/audio links. The links were removed after validation.
- New-job scaffold creation with synthetic video and explicit frame intervals;
  exact 30 fps frame-to-second conversion; overlapping intervals rejected
  before any job/media folder is written.
- ZIP asset indexing, bounded search and selective extraction using a tiny
  generated fixture; empty audio excluded from ready assets.
- Skill frontmatter/name validation with skill-creator's validator.

Dependency install limit: a clean offline `npm ci` could not fetch an uncached
zod tarball. TypeScript, bundling and rendering were tested using the matching
dependencies already installed on the machine through a temporary link.
The npm lockfile was normalized offline. The temporary dependency link is
removed from the deliverable. A fresh browser render and internet-backed
`npm ci` on another machine were not performed here.

No browser playback/listening certification is implied by a successful bundle
or numerical checks. Production footage/SFX and GPU matting dependencies are
intentionally not shipped. Use the doctor and real playback review per new job.
