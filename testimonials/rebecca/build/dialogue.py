"""Re-cut a cleaned full-length source audio by the EDL -> dialogue.wav (48k stereo) incl. end-card padding."""
import json, sys, numpy as np, soundfile as sf
src, edl_path, out = sys.argv[1:4]
x, sr = sf.read(src, always_2d=True); assert sr == 48000
E = json.load(open(edl_path)); parts = []
f = int(0.012 * sr)
for s in E["segs"]:
    a = int(round(s["src_in"] * sr)); n = int(round(s["dur"] * sr))
    seg = x[a:a + n].copy()
    if len(seg) < n: seg = np.vstack([seg, np.zeros((n - len(seg), 2))])
    ramp = np.linspace(0, 1, f)[:, None]; seg[:f] *= ramp; seg[-f:] *= ramp[::-1]
    parts.append(seg)
parts.append(np.zeros((int(E["end_card"] * sr), 2)))
sf.write(out, np.vstack(parts), sr, subtype="PCM_16"); print("dialogue", sum(len(p) for p in parts) / sr, "s")
