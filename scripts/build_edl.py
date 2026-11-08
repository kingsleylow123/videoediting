"""Build the edit decision list, remapped caption words and mastered voice track.
Usage: python3 scripts/build_edl.py <th.mov> <joey.mov>"""
import json, subprocess, sys, re
TH, JOEY = sys.argv[1], sys.argv[2]
th = json.load(open("data/th.json"))["words"]; jy = json.load(open("data/joey.json"))["words"]

# (id, source, in, out, speaker)
EDL = [  # v3 "10/10" cut — ~74s incl. jackpot hook pre-roll
 ("K1","th",0.00,4.84,"K"),
 ("K2","th",4.92,8.14,"K"), ("K2b","th",10.76,12.66,"K"),          # Thrive / Carina … one serious question
 ("K4","th",14.96,22.92,"K"),
 ("K5","th",25.62,34.42,"K"),                                       # starts at "number one" (title card carries "should we…")
 ("K6","th",35.26,39.72,"K"), ("J1","joey",89.66,93.56,"J"),
 ("K7","th",42.22,44.62,"K"), ("J2","joey",108.84,111.48,"J"),
 ("J5","joey",139.58,142.10,"J"),                                   # Joey: "what you really need is a separate product"
 ("K9","th",53.94,57.95,"K"), ("J3","joey",225.95,230.62,"J"),
 ("K10b","th",60.52,63.96,"K"), ("K10c","th",64.40,68.62,"K"),
 ("K11","th",71.62,73.42,"K"),                                      # "it's time to build our moat"
 ("K12","th",73.70,77.98,"K"), ("J4","joey",5.92,7.19,"J"),
 ("K13","th",78.36,84.02,"K"),                                      # ends on "…follow my journey." — one CTA
]
HOOK = 2.5   # seconds of receipt-print pre-roll before "Boom"
GAP = 0.06  # breathing room between joins
FIX = {"Datto":"Dato","Datto,":"Dato,","up":"Yap","Karina's":"Carina's","Chairman":"Qi Men","live":"Live",
       "door,":"Door,","deaf":"Death","door":"Door","club":"Claude","cost":"course","mode.":"moat.",
       "dev":"Death","though.":"Door.","2027?":"2027?","5000":"5,000","Claude,":"CLAUDE","Comment,":"Comment"}
SEQFIX = [(["achievement","club","launch,"],["Qi Men","Club","Lounge,"]),
          (["2","million","ringgit"],["RM2","million",None]),(["2","million","ringgit,"],["RM2","million,",None]),
          (["Joey","up"],["Joey","Yap"])]
EMPH = {"Boom,","RM2","5,000","193","copy","Live","Door,","Death","Door","powerful","separate","product",
        "online","courses.","courses,","course.","13","moat.","Claude.","CLAUDE","194.","2027?","first.","validated,","apart"}

def split_pauses(sid, src, a, b, spk):
    if src != "th": return [(sid, src, a, b, spk)]
    ws = [w for w in th if a - .05 <= w["s"] < b]; out = []; cur = a
    for p, n in zip(ws, ws[1:]):
        if n["s"] - p["e"] > 0.30:
            out.append((sid, src, cur, p["e"] + 0.08, spk)); cur = n["s"] - 0.06
    out.append((sid, src, cur, b, spk)); return out
PARTS = [x for e in EDL for x in split_pauses(*e)]
segs, words, t = [], [], HOOK
for sid, src, a, b, spk in PARTS:
    segs.append(dict(id=sid, src=src, start=round(a,3), end=round(b,3), out=round(t,3), dur=round(b-a,3), spk=spk))
    pool = th if src == "th" else jy
    ws = [dict(w) for w in pool if w["s"] >= a-0.05 and w["s"] < b]
    toks = [w["w"].strip() for w in ws]
    for old, new in SEQFIX:
        for i in range(len(toks)-len(old)+1):
            if toks[i:i+len(old)] == old:
                for k, n in enumerate(new): toks[i+k] = n
    for w, tok in zip(ws, toks):
        if tok is None:
            if words: words[-1]["end"] = round(t + min(w["e"], b) - a, 3)
            continue
        tok = FIX.get(tok, tok) if not (src=="th" and tok=="up" and "Joey" not in [x["text"] for x in words[-1:]]) else tok
        words.append(dict(text=tok, start=round(t+max(w["s"],a)-a,3), end=round(t+min(w["e"],b)-a,3),
                          seg=sid, spk=spk, emph=tok.strip(",.?") in {e.strip(",.?") for e in EMPH}))
    t += (b - a) + GAP
total = round(t, 3)

# manual caption touch-ups for the Joey bites (transcriber mis-hears accent)
for w in words:
    if w["seg"] == "J2" and w["text"] in ("a",): w["text"] = "at"
    if w["seg"] == "J5" and w["text"] == "watcher.": w["text"] = ""
    if w["seg"] == "J4" and w["text"] == "CLAUDE": w["text"] = "Claude,"; w["emph"] = False
words = [w for w in words if not (w["seg"] == "J4" and w["text"] == "Have")]
words = [w for w in words if w["text"]]
agg = []
for sid in dict.fromkeys(x["id"] for x in segs):
    ps = [x for x in segs if x["id"] == sid]
    agg.append(dict(id=sid, src=ps[0]["src"], start=ps[0]["start"], end=ps[-1]["end"], out=ps[0]["out"],
                    dur=round(ps[-1]["out"] + ps[-1]["dur"] - ps[0]["out"], 3), spk=ps[0]["spk"]))
json.dump(dict(fps=30, total=total, hook=HOOK, segments=agg, parts=segs, words=words), open("data/timeline.json","w"), indent=1)

# ---- mastered voice track: per-segment cleanup + loudness match, then concat ----
parts = []
for i, s in enumerate(segs):
    f = f"/tmp/seg_{i}.wav"
    src = TH if s["src"] == "th" else JOEY
    af = "highpass=f=80,afade=t=in:d=0.02,afade=t=out:st=%.3f:d=0.04" % (s["dur"]-0.04)
    if s["src"] == "joey": af = "highpass=f=120,afftdn=nf=-30,lowpass=f=9000,dynaudnorm=f=150:g=7,volume=6dB," + af
    subprocess.run(["ffmpeg","-v","error","-y","-ss",str(s["start"]),"-t",str(s["dur"]),"-i",src,"-vn",
                    "-af",af,"-ar","48000","-ac","2",f], check=True)
    parts.append(f)
    subprocess.run(["ffmpeg","-v","error","-y","-f","lavfi","-i","anullsrc=r=48000:cl=stereo","-t",str(GAP),f"/tmp/gap.wav"], check=True)
subprocess.run(["ffmpeg","-v","error","-y","-f","lavfi","-i","anullsrc=r=48000:cl=stereo","-t",str(HOOK),"/tmp/hook.wav"], check=True)
lst = "/tmp/concat.txt"
open(lst,"w").write("file '/tmp/hook.wav'\n" + "".join(f"file '{p}'\nfile '/tmp/gap.wav'\n" for p in parts))
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",lst,
                "-af","acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-15:TP=-1.5:LRA=9",
                "-ar","48000","public/audio/voice.wav"], check=True)
print("total", total, "segments", len(segs), "words", len(words))
