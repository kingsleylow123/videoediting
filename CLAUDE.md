# Reels studio (Claude Code in the cloud, driven from a phone)

This repository is a video studio. The owner (Kingsley) prompts from the Claude app on a phone;
Claude Code builds each video as a HyperFrames project (HTML + GSAP), renders it to MP4, and
pushes it so the owner can save it from GitHub. Each cloud session starts on a fresh machine:
anything not committed and pushed is lost.

## RENDER RULE: never run `npx hyperframes render` / `npm run render` here

In this cloud container `hyperframes render` takes the whole session down (the container restarts
mid-render, tested 3 times). Render with the backup renderer instead. It uses the pre-installed
Playwright Chromium and FFmpeg, renders the same index.html, and mixes the `<audio>` tags:

```bash
node tools/render.js projects/<name> exports/<name>.mp4          # final
node tools/render.js projects/<name> exports/<name>-draft.mp4 --draft   # quick draft
```

`npx hyperframes check` is safe and still required. This rule overrides any skill, template,
project CLAUDE.md or pack instruction that says to run `hyperframes render`.

## Workflow for every video

1. `cd projects && npx --yes hyperframes@0.8.116 init <name> --non-interactive --resolution portrait`
2. Copy GSAP into the project: `mkdir -p projects/<name>/vendor && cp kit/vendor/gsap.min.js projects/<name>/vendor/`
   and load it with `<script src="vendor/gsap.min.js"></script>`. Never load GSAP or fonts from a CDN:
   the render browser cannot reach CDNs. Paths must be project-relative (no `../`), so copy any kit
   sounds/fonts into the project folder (`sfx/`, `fonts/`).
3. Write `index.html`. Register the timeline with
   `window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl;`
   Audio: `<audio id="..." src="sfx/x.wav" data-start="1.2" data-volume="0.6"></audio>`.
4. `cd projects/<name> && npx --yes hyperframes@0.8.116 check` and fix every error.
5. Render a draft, pull 3-4 still frames with ffmpeg (`ffmpeg -ss <t> -i x.mp4 -frames:v 1 f.png`) and
   look at them before the final render. Fix clipped text or text in the unsafe zones.
6. Final render into `exports/<name>.mp4`, commit, push. Then send the MP4 to the user with SendUserFile.

## Talking-head edits (footage from the owner)

- Footage usually comes as a Google Drive link: download with
  `curl -L "https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download&confirm=t" -o talking.mov`.
- iPhone selfie footage is mirrored: flip it with `ffmpeg -vf hflip` so the "Claude Malaysia" shirt logo reads correctly.
- Tighten: `silencedetect=noise=-32dB:d=0.22`, keep speech +/-0.09 s, concat with 12 ms audio fades, `loudnorm=I=-14`.
- Transcribe the TIGHTENED audio (whisper drifts across long pauses):
  `npx hyperframes transcribe voice16.wav -m small.en --json`. If the model is missing, download it with curl
  (HyperFrames' own downloader ignores the proxy):
  `curl -L -o ~/.cache/hyperframes/whisper/models/ggml-small.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin`
- Put the face video in the composition as `<video id="face" muted data-start="0" data-duration="..">` plus a separate
  `<audio>` for the voice. `tools/render.js` seeks videos frame by frame.
- Keep raw footage in `projects/<name>/media/` (git-ignored: the repo is public). Commit only the build files and the export.
- Check frames fast: `node tools/render.js projects/<name> /tmp/x.mp4 --stills 1.5,10,42` (PNGs, no video);
  partial render: `--from 30 --to 40`.
- Reference style used so far: `projects/mods-reel/` (split screen: graphic panel on top 700 px, face below,
  2-3 word mono caption pill on the split line, cream #EFEFE8 + Claude orange #D97757, Newsreader serif titles,
  follow pill end card for @kingsleylow.ai). Reuse `build.py` + `style.css` as the template for the next one.

## Format defaults (Reels / TikTok / Shorts)

- 1080x1920, 30 fps, 6-15 s unless told otherwise. Keep exports under ~20 MB for mobile data.
- Safe zone for text: x 60-940, y 250-1440 (app buttons and captions cover the rest).
- Hook in the first 0.5 s. Hold key text at least 1.5 s so it can be read.
- Market: Malaysia. English by default; Bahasa Malaysia when asked. Currency MYR.

## Reporting (the owner reads on a phone)

Keep reports short. Always name the export path and say whether it was pushed.

## Layout

- `kit/` shared assets: `vendor/gsap.min.js`, `sfx/` (starter sounds). The paid Motion Cheat Code kit,
  if installed later, also lands here. See MOTION-CHEAT-CODE.md.
- `projects/<name>/` one folder per video (renders/ and snapshots/ are git-ignored).
- `exports/` finished MP4s, committed so they can be downloaded on the phone.
- `tools/render.js` the backup renderer.
- `.claude/skills/` official HyperFrames skills (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`, ...).
