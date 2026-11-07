"""Remove the wall behind the talking head -> VP9 webm with alpha.
Usage: python3 scripts/cutout.py <in.mp4> <out.webm> [max_frames]"""
import sys, subprocess, numpy as np, time
from rembg import new_session
from rembg.bg import naive_cutout  # noqa
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]; maxf = int(sys.argv[3]) if len(sys.argv) > 3 else 10**9
W, H = 720, 1280
sess = new_session(sys.argv[4] if len(sys.argv) > 4 else "u2net_human_seg")
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "3M", "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1", "-auto-alt-ref", "0", out],
                       stdin=subprocess.PIPE)
n = 0; t0 = time.time(); prev = None
while n < maxf:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    img = Image.frombuffer("RGB", (W, H), buf)
    if n % 2 == 0 or prev is None:   # segment every 2nd frame, reuse in between (halves the cost)
        m = np.asarray(sess.predict(img)[0].convert("L"), dtype=np.float32)
        if prev is not None: m = 0.6 * m + 0.4 * prev   # temporal smoothing against edge flicker
        prev = m
        mi = (Image.fromarray(np.clip((m - 60) * 1.5, 0, 255).astype(np.uint8))
              .filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.5)))   # erode = no wall halo
    rgba = img.copy(); rgba.putalpha(mi)
    enc.stdin.write(rgba.tobytes()); n += 1
    if n % 150 == 0: print("frames", n, f"{(time.time()-t0)/n:.3f}s/frame", flush=True)
enc.stdin.close(); enc.wait(); dec.kill()
print("done", n, "frames", round(time.time() - t0), "s")
