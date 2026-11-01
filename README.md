# Lauza Clipper Kit

Repo portabel untuk Antigravity, Claude, Codex, atau agent lain yang bisa
membaca file dan menjalankan Node/Python/FFmpeg. Acuan visualnya versi Timothy
Neo 2D V4 yang disukai: **hitam–abu–kuning, grafis kotak, ikon bergerak,
subtitle bervariasi, zoom wajah halus, dan SFX tanpa musik tambahan**.

Ini kit untuk **berbagai video podcast dan berbagai pembicara**, bukan editor
khusus Timothy. Gaya bersama ada di `brands/lauza/style.json`; isi, angka,
timing, pembicara aktif, crop dan aksi ilustrasi dianalisis ulang tiap video.
Contoh Timothy hanya acuan implementasi visual.

## Mulai

Node 20+ dan npm diperlukan untuk Remotion. Pasang dependensi dari lockfile:

```sh
npm ci
npm run check
npm run dev
```

Buka komposisi **LauzaStylePreview**. Preview grafis ini berjalan tanpa video
podcast, arsip sound effect, atau layanan AI. Durasi 5 detik, tanpa audio.
Render normal: `npm run render:preview` (Remotion dapat mengunduh browser saat
pertama kali dibutuhkan).

Jika browser renderer tidak tersedia, Linux + FFmpeg dengan SVG dan encoder
H.264 dapat memakai `npm run preview:offline`. Fontconfig lokal disiapkan
skrip tersebut. Ini fallback yang perlu dicek tampilannya pada mesin tujuan.

`npm run doctor` membaca kesiapan lingkungan. Python standar cukup untuk
doctor, pembuat job dan indeks ZIP. Typesetting/mixing opsional membutuhkan:

```sh
python -m venv .venv
# Aktifkan venv sesuai OS, lalu:
python -m pip install -r requirements.txt
```

Pins Python dicatat dari lingkungan yang diuji: Python 3.14.8. Python 3.12+
dibutuhkan oleh pin SciPy ini; preview Remotion tidak memerlukan paket Python.
Untuk mixing, probing dan fallback render, sediakan `ffmpeg` serta `ffprobe`
di PATH. Tidak ada instalasi GPU, model segmentasi atau layanan berbayar wajib.

## Klip baru

```sh
python scripts/new-job.py --brand lauza --name klip-01 --video /path/clip.mp4 --words /path/words.forced.json
```

Skrip membuat folder job dan menyalin video ke media lokal yang diabaikan Git.
Jika `--words` belum ada, status alignment akan ditandai belum tersedia.
Hasil awal adalah review framing/timing, **bukan edit final otomatis**.
Daftarkan `Clip` dari job baru di `src/Root.tsx`, mengikuti contoh composition
yang ada, dengan durasi dari `plan.json`. Minta agent membaca workflow lalu
menyusun beat baru sesuai ucapan. Crop tengah awal harus ditinjau per shot.

| Lokasi | Isi |
| --- | --- |
| `AGENTS.md` | Aturan bersama untuk semua agent |
| `CLAUDE.md`, `GEMINI.md` | Pintu masuk singkat ke aturan yang sama |
| `skills/lauza-clipper/SKILL.md` | Skill portabel, instruksi inti dan routing |
| `docs/STYLE.md` | Palet dan keputusan desain yang disetujui |
| `docs/WORKFLOW.md` | Analisis → timing → desain → review → ekspor |
| `src/shared` | Font loader dan komponen review dasar |
| `brands/lauza/timothy-reference` | Implementasi lengkap acuan V4 |
| `brands/vordev` | Namespace terpisah; menunggu brief brand Vordev |
| `public/shared/fonts` | Tiga font lokal beserta lisensinya |
| `scripts` | Doctor, pembuat job, indeks aset dan preview offline |

## Contoh Timothy lengkap

Kode, interval kata, crop dan motion plan disertakan. Video sumber, WAV hasil
mix, SFX, ZIP aset, LUT, model, node_modules dan hasil render tidak dibundel.
Letakkan video sumber yang sesuai pada
`public/brands/lauza/timothy-reference/source.mp4`.
Klip contoh berdurasi 52 detik; jangan memakai angka/timestamp-nya untuk klip baru.

Untuk membangun mix dari koleksi SFX asli:

```sh
python scripts/media-library.py index /path/SOUND-EFFECT.zip
python scripts/media-library.py search whoosh --kind sfx --limit 5
python brands/lauza/timothy-reference/typeset.py
python brands/lauza/timothy-reference/mix.py
npm run render:reference
```

Mix contoh memakai nama anggota ZIP asli; sesuaikan sumber efek untuk koleksi
lain. Jalankan `npm run doctor -- --job brands/lauza/timothy-reference` untuk
memeriksa media yang masih kurang. FFmpeg fallback lengkap:
`node brands/lauza/timothy-reference/render.cjs --check --render`.

## Pakai pada agent lain

Salin seluruh repo, jalankan setup, lalu tempel:

> Baca AGENTS.md dan skills/lauza-clipper/SKILL.md. Gunakan docs/STYLE.md
> sebagai acuan desain dan docs/WORKFLOW.md sebagai proses kerja. Untuk klip
> baru, analisis isi serta timestamp dahulu; jangan menyalin beat Timothy.

Ini tetap bekerja jika client tidak otomatis memuat file instruksi. Lihat
`PROMPT-ANTIGRAVITY.md` untuk prompt tugas dan publish opsional. Jika ingin
memasang skill pada client tertentu, sertakan akses ke seluruh repo: skill
ini memakai dokumen, kode dan font pendamping, bukan satu file mandiri.

## GitHub

Folder ini repo Git lokal. Buat remote privat atau tentukan URL tujuan, lalu
push ketika memang diinstruksikan. Job produksi baru dan media diabaikan Git
secara default. Preview/output tidak masuk arsip distribusi. Lisensi font ada
di `THIRD_PARTY.md`; kode proyek belum diberi lisensi open-source.
Distribusi ZIP tidak membawa `.git`; jalankan `git init -b main` jika memulai
dari ZIP. Untuk membuat ulang ZIP dari file kit yang sudah ditrack, jalankan
`python scripts/package.py`; file `.zip.sha256` dibuat di samping ZIP.

## Validasi paket

Lihat `VALIDATION.md` untuk hasil pemeriksaan paket dan batas lingkungan uji.
