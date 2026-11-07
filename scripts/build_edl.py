"""Build the edit decision list, remapped caption words and mastered voice track.
Usage: python3 scripts/build_edl.py <th.mov> <joey.mov>"""
import json, subprocess, sys, re
TH, JOEY = sys.argv[1], sys.argv[2]
th = json.load(open("data/th.json"))["words"]; jy = json.load(open("data/joey.json"))["words"]

# (id, source, in, out, speaker)
EDL = [
 ("K1","th",0.00,4.84,"K"), ("K2","th",4.92,12.66,"K"), ("K3","th",13.02,14.42,"K"),
 ("K4","th",14.96,22.92,"K"), ("K5","th",23.70,34.42,"K"), ("K6","th",35.26,39.72,"K"),
 ("J1","joey",89.66,93.56,"J"), ("K7","th",42.22,44.62,"K"), ("J2","joey",108.84,111.48,"J"),
 ("K8","th",46.62,53.86,"K"), ("K9","th",53.94,57.95,"K"), ("J3","joey",225.95,230.62,"J"),
 ("K10a","th",58.76,60.14,"K"), ("K10b","th",60.52,63.96,"K"), ("K10c","th",64.40,68.62,"K"),
 ("K11","th",69.24,73.42,"K"), ("K12","th",73.70,77.98,"K"), ("J4","joey",5.92,7.19,"J"),
 ("K13","th",78.36,85.60,"K"),
]
GAP = 0.06  # breathing room between joins
FIX = {"Datto":"Dato","Datto,":"Dato,","up":"Yap","Karina's":"Carina's","Chairman":"Qi Men","live":"Live",
       "door,":"Door,","deaf":"Death","door":"Door","club":"Claude","cost":"course","mode.":"moat.",
       "dev":"Death","though.":"Door.","2027?":"2027?","5000":"5,000","Claude,":"CLAUDE","Comment,":"Comment"}
SEQFIX = [(["achievement","club","launch,"],["Qi Men","Club","Lounge,"]),
          (["2","million","ringgit"],["RM2","million",None]),(["2","million","ringgit,"],["RM2","million,",None]),
          (["Joey","up"],["Joey","Yap"])]
EMPH = {"Boom,","RM2","5,000","193","copy","Live","Door,","Death","Door","powerful","separate","product",
        "online","courses.","courses,","course.","13","moat.","Claude.","CLAUDE","194.","2027?","first.","validated,","apart"}

segs, words, t = [], [], 0.0
for sid, src, a, b, spk in EDL:
    segs.append(dict(id=sid, src=src, start=a, end=b, out=round(t,3), dur=round(b-a,3), spk=spk))
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
    if w["seg"] == "J4" and w["text"] == "CLAUDE": w["text"] = "Claude,"; w["emph"] = False
words = [w for w in words if not (w["seg"] == "J4" and w["text"] == "Have")]
json.dump(dict(fps=30, total=total, segments=segs, words=words), open("data/timeline.json","w"), indent=1)

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
lst = "/tmp/concat.txt"
open(lst,"w").write("".join(f"file '{p}'\nfile '/tmp/gap.wav'\n" for p in parts))
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",lst,
                "-af","acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-15:TP=-1.5:LRA=9",
                "-ar","48000","public/audio/voice.wav"], check=True)
print("total", total, "segments", len(segs), "words", len(words))
