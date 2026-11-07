# Adding the paid Motion Cheat Code pack (optional)

The studio already works with free tools. The paid pack (US$49, motioncheatcode.com) adds
250 prompts, 60 templates, 400 sound effects, 30 music tracks, fonts and 6 Claude Code skills.

## Before you run it

1. **Make this repository private** (GitHub → repo → Settings → Change visibility → Private).
   The pack is licensed to you personally; a public repo would share it with everyone.
2. The cloud environment must allow `motioncheatcode.com` (done: environment "videoediting")
   plus the download host the pack is served from (`<something>.private.blob.vercel-storage.com`).
   Claude will ask to add the exact host when the download starts.
3. Have the download link from the order email (`https://motioncheatcode.com/download/?t=...`).
   Each run uses 1 of your 5 downloads.

## Prompt to paste in a new session

```
Install the Motion Cheat Code pack into this repo. My download link: PASTE-YOUR-DOWNLOAD-LINK
Run: curl -fsSL https://motioncheatcode.com/phone/setup.sh -o /tmp/mcc-setup.sh && bash /tmp/mcc-setup.sh "PASTE-YOUR-DOWNLOAD-LINK"
in the background (5-10 min). If a download host is blocked, ask me to allow that exact host.
Keep the "RENDER RULE" from the original CLAUDE.md at the top of the merged CLAUDE.md:
render only with node tools/render.js, never npx hyperframes render.
Then make prompt P002 from library/02-PROMPT-VAULT/prompts.md into projects/p002 and export exports/p002.mp4, push, and send me the video.
```
