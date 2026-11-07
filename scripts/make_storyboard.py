"""Build the storyboard page (HTML) from beats.json + timeline + thumbnails pulled from the render.
Usage: python3 scripts/make_storyboard.py out/reel_v1.mp4 docs/storyboard.html"""
import json, subprocess, sys, base64, html, os, tempfile
video, out = sys.argv[1], sys.argv[2]
beats = json.load(open("scripts/beats.json")); tl = json.load(open("data/timeline.json"))
words = {s["id"]: " ".join(w["text"] for w in tl["words"] if w["seg"] == s["id"]) for s in tl["segments"]}
tmp = tempfile.mkdtemp()
def thumb(t):
    p = f"{tmp}/{t}.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", video, "-frames:v", "1", "-vf", "scale=300:-2", "-q:v", "6", p], check=True)
    return "data:image/jpeg;base64," + base64.b64encode(open(p, "rb").read()).decode()

FOOTAGE = [
 ("Talking Head Video", "1:26 · 1080×1920 selfie, white wall, eating an onigiri while talking", "Main narration + face bubble"),
 ("video-2361 (4:19)", "Full Q&A at Dato Joey's table: your question, his chart reading, his answer", "4 soundbites + 'got the mic' b-roll"),
 ("a0ce…mp4", "Your Qi Men chart on the big screen, Joey annotating with a pen", "Live Door beat"),
 ("video-2265", "Wide shot of the Thrive arena crowd", "'Second year at Thrive'"),
 ("IMG_3800", "Group selfie, everyone waving", "'Carina's group'"),
 ("IMG_4092", "Walking into the CLUB LOUNGE entrance", "'Qi Men Club Lounge'"),
 ("Photo · Club Lounge", "Selfie in front of the gold CLUB LOUNGE wall", "'One serious question' backdrop"),
 ("video-2345", "Dato Joey walking the stage", "Hook polaroid"),
 ("IMG_3534", "Selfie with a friend waving", "Spare"),
 ("IMG_3542", "Crowd pushing in + speaker on stage", "Spare"),
 ("IMG_3801", "Lunch table at the lounge", "Spare"),
 ("IMG_4048 / video-2288", "Arena wide shots, stage lights", "Spare"),
 ("IMG_4049 / 618e…mp4", "Flipping through the Thrive workbook / chart pages", "Spare"),
 ("IMG_4056", "Neighbour studying his chart printout", "Spare"),
 ("video-2277 / 2353", "POV on your phone typing notes, JOEY YAP sign behind", "Spare (good for a 'prep' beat)"),
 ("Photo · Synergy booth", "Selfie with two guys at a booth", "Spare"),
]
rows = "".join(f"<tr><td class=mono>{html.escape(a)}</td><td>{html.escape(b)}</td><td>{html.escape(c)}</td></tr>" for a, b, c in FOOTAGE)
cards = []
for b in beats:
    joey = b["seg"].startswith("J")
    cards.append(f"""<article class="beat{' joey' if joey else ''}">
  <img src="{thumb(b['at'])}" alt="Frame at {b['t']}: {html.escape(b['name'])}" loading="lazy">
  <div class="body">
    <div class="meta"><span class="tc">{b['t']}</span><span class="lay">{html.escape(b['layout'])}</span></div>
    <h3>{html.escape(b['name'])}</h3>
    <p class="vo">“{html.escape(words[b['seg']])}”</p>
    <p><b>On screen</b> {html.escape(b['visual'])}</p>
    <p class="sfx"><b>Sound</b> {html.escape(b['sfx'])}</p>
  </div>
</article>""")
doc = open("scripts/storyboard_template.html").read().replace("{{ROWS}}", rows).replace("{{CARDS}}", "\n".join(cards))
os.makedirs(os.path.dirname(out), exist_ok=True); open(out, "w").write(doc); print("wrote", out, len(doc) // 1024, "KB")
