"""Synthesise a royalty-free music bed + paper/pencil/soft-UI SFX, timed to edl.json.
python3 sound.py edl.json outdir  -> music.wav, sfx.wav (48k stereo)"""
import json, sys, numpy as np, wave
SR = 48000
E = json.load(open(sys.argv[1])); OUT = sys.argv[2]
DUR = E["total"] + E["end_card"]; N = int(DUR * SR) + SR
rng = np.random.default_rng(3)

def tt(d): return np.arange(int(d * SR)) / SR
def env_adsr(n, a=.005, d=.2, s=.0, r=.05):
    e = np.ones(n); A = int(a * SR); D = int(d * SR); R = int(r * SR)
    e[:A] = np.linspace(0, 1, A) if A else 1
    if D: e[A:A + D] = np.linspace(1, s, min(D, n - A))[:len(e[A:A + D])]
    e[A + D:] = s
    if R and s > 0: e[-R:] *= np.linspace(1, 0, R)
    return e
def lp(x, a):  # one-pole low-pass, a in (0,1]
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
def lp_fast(x, cutoff):
    # FFT brick-ish low-pass (fast enough for long buffers)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x))
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4); return np.fft.irfft(X, len(x))
def add(buf, x, t, gain=1.0, pan=0.0):
    i = int(t * SR); x = x[: max(0, len(buf[0]) - i)]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0][i:i + len(x)] += x * gain * l * 1.414; buf[1][i:i + len(x)] += x * gain * r * 1.414

# ---------------- music ----------------
mus = [np.zeros(N), np.zeros(N)]
BPM = 92; beat = 60 / BPM; bar = 4 * beat
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def epiano(f, d, vel=1.0):
    t = tt(d); mod = np.sin(2 * np.pi * f * 2 * t) * 1.2 * np.exp(-t * 3)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 1.6) + .25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 4)
    x *= env_adsr(len(t), .004, d, 1, .15); return x * vel
def kick():
    t = tt(.35); f = 48 + 70 * np.exp(-t * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9)
def hat(op=False):
    t = tt(.12 if not op else .3); n = rng.standard_normal(len(t))
    return bp(n, 6000, 14000) * np.exp(-t * (40 if not op else 14))
def bass(f, d):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + .2 * np.sin(4 * np.pi * f * t)) * env_adsr(len(t), .01, d, .8, .08)
# Fmaj9 - Em7 - Dm9 - Bbmaj7(#11)  : warm, unresolved, resolves to F on end card
CH = [[53, 57, 60, 64, 67], [52, 55, 59, 62, 66], [50, 53, 57, 60, 64], [46, 50, 53, 57, 62]]
BASS = [41, 40, 38, 34]
start = 2.9; t0 = start; k = 0
end_music = E["total"] + E["end_card"] - .2
while t0 < E["total"]:
    ch = CH[k % 4]
    for j, m in enumerate(ch):  # strum
        add(mus, epiano(midi(m), bar * .98, .16), t0 + j * .018, pan=(j - 2) * .18)
    add(mus, epiano(midi(ch[-1] + 12), beat * 1.5, .07), t0 + beat * 2.5, pan=.3)
    add(mus, bass(midi(BASS[k % 4]), bar * .9), t0, .28)
    for b in range(4):
        tb = t0 + b * beat
        if b in (0, 2): add(mus, kick(), tb, .35)
        add(mus, hat(), tb + beat / 2, .05, pan=.25)
        if b in (1, 3): add(mus, hat(True), tb, .035, pan=-.2)
    t0 += bar; k += 1
# final resolve chord on end card (F add9, long)
for j, m in enumerate([41, 53, 57, 60, 67, 72]):
    add(mus, epiano(midi(m), 4.5, .17), E["total"] + .15 + j * .03, pan=(j - 2.5) * .15)
mus = [lp_fast(c, 5200) for c in mus]
# arrangement envelope: intro lift, the "Trading" dip, filter-open lift at reaction, fade out
g = np.ones(N); tax = np.arange(N) / SR
g *= np.clip((tax - 2.9) / .4, 0, 1)
def dip(a, b, depth):  # depth in linear gain
    m = (tax >= a) & (tax < b); g[m] *= depth
dip(23.55, 24.6, .2)
seg_react = next(s for s in E["segs"] if s["id"] == "b9a")["out_in"]
g *= np.where(tax < seg_react, .85, 1.0)
fade_st = end_music - 1.8; g *= np.clip((end_music - tax) / 1.8, 0, 1)
mus = [c * g for c in mus]

# ---------------- sfx ----------------
fx = [np.zeros(N), np.zeros(N)]
def whoosh(d=.45, lo=300, hi=3000, up=True):
    t = tt(d); n = rng.standard_normal(len(t)); x = bp(n, lo, hi)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** (1.5 if up else 2); return x * e / (np.abs(x).max() + 1e-9)
def tick(f=2600, d=.03):
    t = tt(d); return (np.sin(2 * np.pi * f * t) * .6 + bp(rng.standard_normal(len(t)), 2000, 8000) * .4) * np.exp(-t * 180)
def pop(f=900):
    t = tt(.12); fr = f * (1 + 1.5 * np.exp(-t * 60)); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 35)
def swish(d=.55):
    t = tt(d); n = rng.standard_normal(len(t)); x = bp(n, 1500, 9000)
    return x / np.abs(x).max() * np.clip(t / d, 0, 1) ** 1.5 * np.exp(-np.clip(t - d * .85, 0, None) * 40)
def pencil(d):
    t = tt(d); n = rng.standard_normal(len(t)); x = bp(n, 2500, 9000)
    grain = (np.sin(2 * np.pi * 23 * t) > 0.3) * .6 + .4
    return x / np.abs(x).max() * grain * env_adsr(len(t), .02, d, 1, .05) * .7
def chime(notes=(76, 83)):
    out = np.zeros(int(1.6 * SR))
    for i, m in enumerate(notes):
        t = tt(1.6 - i * .14); x = (np.sin(2 * np.pi * midi(m) * t) + .3 * np.sin(2 * np.pi * midi(m) * 3 * t)) * np.exp(-t * 3.2)
        out[int(i * .14 * SR):int(i * .14 * SR) + len(x)] += x
    return out * .5
def thud():
    t = tt(.25); return (np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 40)) * t) + bp(rng.standard_normal(len(t)), 200, 1200) * .5) * np.exp(-t * 22)
def tapestop(d=.32):
    t = tt(d); f = 220 * (1 - t / d) ** 1.5 + 30; x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3
    return lp_fast(x, 1200) * np.exp(-t * 4)
def keys(d):
    out = np.zeros(int(d * SR)); tt0 = 0
    while tt0 < d - .05:
        x = tick(rng.uniform(1800, 3200), .025) * rng.uniform(.4, 1)
        i = int(tt0 * SR); out[i:i + len(x)] += x[: len(out) - i]; tt0 += rng.uniform(.07, .16)
    return out
def riser(d):
    t = tt(d); f = 220 * 2 ** (t / d * 1.0); return np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2 * .5
def paper_snap():
    t = tt(.09); return bp(rng.standard_normal(len(t)), 1500, 7000) * np.exp(-t * 60)

S = lambda x, t, gdb, pan=0: add(fx, x / (np.abs(x).max() + 1e-9), t, 10 ** (gdb / 20), pan)
o = {s["id"]: s["out_in"] for s in E["segs"]}; T = E["total"]
# hook
S(whoosh(.4, 300, 2500), 0.0, -24)
for i in range(9): S(tick(2400 + i * 60), 0.08 + i * .075, -30 + i * .6)
S(swish(.5), 1.55, -27, .3)
S(whoosh(.35, 400, 3000), 2.4, -25)
S(paper_snap(), o["b1a"] - .02, -22)
# who
S(pop(820), 3.72, -28, -.4); S(tick(3000), 4.02, -30, -.6)
# opportunity
S(pencil(.9), 17.95, -30, .4); S(chime((88,)), 20.3, -31, .4)
# twist
S(tapestop(), o["b3b"] - .02, -24); S(thud(), o["b3b"], -26)
# mechanism
S(whoosh(.35, 500, 3500), 25.85, -27, .4); S(keys(2.4), 26.6, -34, .3)
for tc in (26.4, 26.9, 28.3): S(tick(2200), tc, -28, .4)
S(chime((76, 83)), 29.45, -24, .3)
# recap
S(pop(760), 33.5, -28, .5); S(thud(), 37.35, -23)
# proof
S(whoosh(.35, 500, 3500), 43.85, -27, .4); S(swish(.55), 47.25, -27, .4)
# payback
S(whoosh(.35, 500, 3500), 50.55, -27, .4)
r = riser(3.3); S(r, 52.2, -30, .3); S(pop(1300), 56.5, -27, .3)
# timeline
S(whoosh(.35, 500, 3500), 61.5, -27); S(pencil(4.6), 61.8, -34)
S(pop(900), 62.6, -28, -.4); S(pop(1050), 66.6, -28, .4); S(swish(.6), 67.9, -28)
# end card
S(whoosh(.5, 250, 3000), T - .05, -22); S(tick(2600, .04), T + 1.6, -26)

def write(path, st):
    a = np.stack(st, 1); a = a / max(1.0, np.abs(a).max() / .89)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a * 32767).astype(np.int16).tobytes())
write(f"{OUT}/music.wav", mus); write(f"{OUT}/sfx.wav", fx); print("sound ready", DUR)
