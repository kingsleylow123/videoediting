# videoediting — Claude-edited Reels

Remotion pipeline that turns a talking-head selfie + event footage into a 9:16 Reel with
motion graphics, word-synced captions and original sound design. Every graphic is anchored to a
spoken word (see `src/storyboard.ts`), so retiming the cut never breaks sync.

## Reel: "I asked Dato Joey Yap how to hit RM2M a year" (Thrive 2026, Day 193)

| Step | Command |
|---|---|
| 1. Pull footage from Drive into a scratch `src/` dir, transcode proxies into `public/` | see `scripts/` header comments |
| 2. Transcribe (faster-whisper, word timestamps) → `data/th.json`, `data/joey.json` | `python3 scripts/tx.py` (scratch) |
| 3. Edit decision list, caption fixes, mastered voice | `python3 scripts/build_edl.py <talking_head.mov> <joey_qa.mov>` |
| 4. Sound kit + music bed (synthesised, royalty-free) | `python3 scripts/make_sfx.py public/sfx 92` |
| 5. Preview stills | `node scripts/stills.mjs <dir> 2.0 13.5 40` |
| 6. Render | `node scripts/render.mjs out/reel.mp4` |
| 7. Storyboard page | `python3 scripts/make_storyboard.py out/reel.mp4 docs/storyboard.html` |

Layout: hybrid. The speaker is full-frame on hook / emotional beats and springs into a bottom-left
bubble (`BUB` in `src/Reel.tsx`) while a media card above carries b-roll and graphics.
Dato Joey's real answers are cut in as full-screen soundbites (J1–J4 in the EDL).

Large media (`public/th.mp4`, `public/broll/`, `public/audio/`, `out/`) is git-ignored.
