"""Synthesise an original, royalty-free SFX kit + music bed (44.1k stereo WAV)."""
import numpy as np, wave, os, sys
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/sfx"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def save(name, x, gain=0.9):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    pk = np.max(np.abs(x)) or 1
    x = (x / pk * gain * 32767).astype(np.int16)
    with wave.open(f"{OUT}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())

def t(d): return np.arange(int(SR * d)) / SR
def env(n, a, r):  # attack/release in seconds
    e = np.ones(n); A = int(a*SR); R = int(r*SR)
    if A: e[:A] = np.linspace(0, 1, A)
    if R: e[-R:] *= np.linspace(1, 0, R) ** 2
    return e
def lp(x, a):  # one-pole lowpass, a in (0,1)
    y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s += a * (v - s); y[i] = s
    return y
def bandsweep(d, f0, f1, q=0.15):
    n = int(SR*d); noise = rng.standard_normal(n)
    f = np.geomspace(f0, f1, n); out = np.zeros(n); lo = bp = 0.0
    for i in range(n):  # state-variable filter
        F = 2*np.sin(np.pi*f[i]/SR); hi = noise[i] - lo - q*bp; bp += F*hi; lo += F*bp; out[i] = bp
    return out

# whoosh: swept band noise, swelling then fading, slight stereo pan
for name, d, f0, f1 in [("whoosh", .45, 300, 3500), ("whoosh_down", .5, 3000, 250), ("swish", .22, 800, 6000)]:
    x = bandsweep(d, f0, f1); n = len(x); e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    pan = np.linspace(0.2, 0.8, n); x = x*e
    save(name, np.stack([x*(1-pan), x*pan], 1), .8)

# pop: short pitched blip
x = t(.12); f = 900*np.exp(-x*30)+300
save("pop", np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*35), .8)
# click (UI tick)
x = t(.04); save("click", (rng.standard_normal(len(x))*np.exp(-x*300) + np.sin(2*np.pi*2400*x)*np.exp(-x*150)), .6)
# key typing tick
x = t(.03); save("key", rng.standard_normal(len(x))*np.exp(-x*400)*0.5 + np.sin(2*np.pi*1800*x)*np.exp(-x*250)*0.4, .45)
# ding: bell partials
x = t(1.6); b = sum(a*np.sin(2*np.pi*f*x)*np.exp(-x*k) for f,a,k in [(1318,1,3),(2637,.5,5),(3951,.25,7),(1976,.3,4)])
save("ding", b*env(len(x), .002, .2), .7)
# success chime (two-note)
x1 = t(.18); x2 = t(1.0)
n1 = np.sin(2*np.pi*988*x1)*np.exp(-x1*8); n2 = sum(np.sin(2*np.pi*f*x2)*np.exp(-x2*4)*a for f,a in [(1319,1),(2638,.3)])
save("chime", np.concatenate([n1, n2]), .7)
# impact / boom: sub drop + noise thump
x = t(1.2); sub = np.sin(2*np.pi*np.cumsum(55+90*np.exp(-x*18))/SR)*np.exp(-x*3.2)
thump = lp(rng.standard_normal(len(x)), .08)*np.exp(-x*14)*3
save("impact", np.tanh((sub+thump)*1.6), .95)
# riser: noise + rising tone, 1.2s
x = t(1.2); r = bandsweep(1.2, 200, 7000, .3)*np.linspace(0,1,len(x))**2
tone = np.sin(2*np.pi*np.cumsum(np.geomspace(150, 900, len(x)))/SR)*np.linspace(0,1,len(x))**2*.4
save("riser", (r+tone)*env(len(x), .01, .03), .7)
# glitch: bit-crushed bursts
x = t(.35); g = np.sign(np.sin(2*np.pi*np.cumsum(rng.choice([180,420,950,1600], len(x)))/SR))
g *= (rng.random(len(x)//600+1).repeat(600)[:len(x)] > .35); save("glitch", g*env(len(x), .001, .05)*.6, .55)
# cash/coin: high metallic hits
x = t(.6); c = sum(np.sin(2*np.pi*f*x)*np.exp(-x*k) for f,k in [(2093,9),(3136,11),(4186,14)])
c2 = np.concatenate([np.zeros(int(.07*SR)), c])[:len(x)]; save("coin", c + .7*c2, .6)
# stamp: thud + paper slap
x = t(.4); s = np.sin(2*np.pi*120*x)*np.exp(-x*25) + lp(rng.standard_normal(len(x)), .3)*np.exp(-x*40)*2
save("stamp", np.tanh(s*1.5), .9)
# swoosh-pop for counters (tick)
x = t(.05); save("tick", np.sin(2*np.pi*3200*x)*np.exp(-x*120), .35)
# negative buzz (wrong)
x = t(.35); save("buzz", np.sign(np.sin(2*np.pi*110*x))*.5*np.exp(-x*6) + np.sin(2*np.pi*116*x)*.3, .5)

# ---- v3 hook kit ----
# mechanical key: plastic tick + spring ping + low thock, three variants
for k, (f1, f2) in enumerate([(2600, 140), (3100, 160), (2300, 120)]):
    x = t(.07); n = rng.standard_normal(len(x))
    click = n * np.exp(-x * 520) * .9 + np.sin(2*np.pi*f1*x) * np.exp(-x * 260) * .35
    thock = np.sin(2*np.pi*f2*x) * np.exp(-x * 60) * .6
    save(f"mkey{k}", click + thock, .55)
# enter: heavier, longer thock
x = t(.16); save("enter", np.sin(2*np.pi*95*x)*np.exp(-x*30) + rng.standard_normal(len(x))*np.exp(-x*300)*1.2 + np.sin(2*np.pi*1800*x)*np.exp(-x*120)*.3, .8)
# slot ratchet: one reel tick
x = t(.035); save("ratchet", (np.sin(2*np.pi*1400*x) + .6*rng.standard_normal(len(x))) * np.exp(-x*200), .4)
# reel stop clack
x = t(.18); save("clack", np.tanh((np.sin(2*np.pi*180*x)*np.exp(-x*35) + rng.standard_normal(len(x))*np.exp(-x*90)*.8 + np.sin(2*np.pi*2400*x)*np.exp(-x*80)*.3)*1.8), .8)
# coins cascade: 40 random metallic tinks over 1.4s
dur = 1.6; N = int(SR*dur); c = np.zeros(N)
for i in range(46):
    at = int(SR * (rng.random()**1.6) * 1.3); f0 = rng.uniform(2800, 6200); xx = t(.25)
    tink = sum(np.sin(2*np.pi*f0*m*xx)*np.exp(-xx*(28+m*6))*a for m, a in [(1, 1), (2.76, .4), (5.4, .15)])
    j = min(N, at+len(xx)); c[at:j] += tink[:j-at] * rng.uniform(.3, 1)
save("coins", c, .55)
# ka-ching: drawer slide + register bell double strike + coins tail
xs = t(.12); slide = bandsweep(.12, 600, 3000) * np.linspace(1, .2, len(xs))
xb = t(1.4); bell = lambda: sum(a*np.sin(2*np.pi*f*xb)*np.exp(-xb*k) for f, a, k in [(1567, 1, 3.2), (3135, .55, 5), (4700, .3, 7), (2349, .35, 4)])
kach = np.zeros(int(SR*1.9)); kach[:len(xs)] += slide * 1.4
b1 = bell(); i1 = int(.10*SR); kach[i1:i1+len(b1)] += b1 * .8
i2 = int(.20*SR); kach[i2:i2+len(b1)] += b1 * 1.0
co = np.concatenate([np.zeros(int(.25*SR)), c])[:len(kach)] * .6; kach[:len(co)] += co
save("kaching", kach, .95)
# sub hit for the jackpot slam
x = t(.9); save("subhit", np.tanh(np.sin(2*np.pi*np.cumsum(38+60*np.exp(-x*16))/SR)*np.exp(-x*4)*2.2), .95)

# ---- v4 (Version A receipt hook) kit: richer, with a simple room reverb ----
def reverb(x, rt=1.1, mix=.25):
    ir_t = t(rt); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 6.9 / rt); ir = lp(ir, .35); ir /= np.sum(np.abs(ir)) / 6
    wet = np.convolve(x, ir)[:len(x) + len(ir_t)]; dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return dry * (1 - mix) + wet * mix
# dot-matrix printer line: needle chatter at ~180 Hz with paper-feed hum, 0.32s
x = t(.32); chat = np.zeros(len(x)); step = int(SR / 180)
for i in range(0, len(x), step):
    seg = rng.standard_normal(min(90, len(x) - i)) * np.exp(-np.arange(min(90, len(x) - i)) / 18); chat[i:i+len(seg)] += seg * rng.uniform(.6, 1)
feed = np.sin(2*np.pi*95*x) * .25 + bandsweep(.32, 900, 1300, .5) * .3
save("printer", (chat * .7 + feed) * env(len(x), .005, .04), .6)
# paper tear: filtered noise with ragged envelope
x = t(.35); rag = (rng.random(len(x)) > .45).astype(float); rag = lp(rag, .02)
save("tear", bandsweep(.35, 2500, 5000, .4) * rag * np.linspace(1, .3, len(x)), .7)
# logo slam: deep impact + noise burst + bright shimmer tail, reverberated
x = t(1.6); boom = np.sin(2*np.pi*np.cumsum(48 + 110*np.exp(-x*22))/SR) * np.exp(-x*3.5)
burst = lp(rng.standard_normal(len(x)), .25) * np.exp(-x*18) * 1.6
shim = sum(np.sin(2*np.pi*f*x + rng.uniform(0, 6)) * np.exp(-x*2.2) for f in [2093, 2637, 3136, 4186, 5274]) * .06
save("slam", reverb(np.tanh((boom + burst) * 1.5) + shim, 1.4, .3), .95)
# reverse cymbal riser into the slam, 0.6s
x = t(.6); cym = bandsweep(.6, 3000, 9000, .25) * np.linspace(0, 1, len(x)) ** 3
save("revcym", cym, .6)
# shimmer sparkle
x = t(1.2); save("shimmer", reverb(sum(np.sin(2*np.pi*f*x) * np.exp(-x*(3 + k)) * np.clip((x - k*.05)*40, 0, 1) for k, f in enumerate([2349, 2793, 3520, 4186, 4699, 5588])), 1.0, .35), .5)
# punchier layered whoosh (air + low body), reverberated
x = t(.5); air = bandsweep(.5, 400, 6000, .12) * np.sin(np.linspace(0, np.pi, len(x))) ** 2
body = np.sin(2*np.pi*np.cumsum(np.geomspace(90, 45, len(x)))/SR) * np.sin(np.linspace(0, np.pi, len(x))) * .5
save("whoosh2", reverb(air + body, .6, .2), .8)
# warmer, more "real" ka-ching: add reverb to the existing layered one
save("kaching2", reverb(kach, 1.2, .22), .95)

# ---- music bed: 100 BPM light, warm pluck + soft kick + hat, 96s ----
bpm = 100; beat = 60/bpm; dur = float(sys.argv[2]) if len(sys.argv) > 2 else 96
N = int(SR*dur); mus = np.zeros(N)
def add(at, sig):
    i = int(at*SR); j = min(N, i+len(sig));
    if i < N: mus[i:j] += sig[:j-i]
chords = [[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]]  # Am7 Fmaj7 Cmaj7 G7(ish)
def midi(m): return 440*2**((m-69)/12)
xk = t(.35); kick = np.sin(2*np.pi*np.cumsum(45+70*np.exp(-xk*30))/SR)*np.exp(-xk*9)
xh = t(.06); hat = rng.standard_normal(len(xh))*np.exp(-xh*90); hat -= lp(hat, .5)
xp = t(beat*0.9)
nb = int(dur/beat)
for b in range(nb):
    bar = b//4; ch = chords[bar % 4]; at = b*beat
    if b % 4 in (0, 2): add(at, kick*.9)
    add(at+beat/2, hat*.25)
    if b % 2 == 0: add(at, hat*.12)
    # arp pluck
    for k in range(2):
        m = ch[(b*2+k) % 4] + 12
        add(at+k*beat/2, np.sin(2*np.pi*midi(m)*xp[:int(SR*beat*.45)])*np.exp(-xp[:int(SR*beat*.45)]*7)*.18)
    # pad every bar
    if b % 4 == 0:
        xpad = t(beat*4)
        pad = sum(np.sin(2*np.pi*midi(m)*xpad + .3*np.sin(2*np.pi*.5*xpad)) for m in ch)/4
        add(at, pad*env(len(xpad), .4, .6)*.16)
        xb = t(beat*3.6); add(at, np.sin(2*np.pi*midi(ch[0]-24)*xb)*env(len(xb), .01, .3)*.3)
mus = lp(mus, .35)
fade = int(2*SR); mus[-fade:] *= np.linspace(1, 0, fade)
save("music_bed", mus, .5)
print("ok", sorted(os.listdir(OUT)))
