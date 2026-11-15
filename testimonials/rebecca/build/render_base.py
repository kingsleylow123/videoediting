"""Cut, tonemap (HLG->SDR), grade and punch-in every EDL segment, then concat + 5s end-card freeze."""
import json, subprocess, sys, os
src, edl_path, work = sys.argv[1], sys.argv[2], sys.argv[3]
E = json.load(open(edl_path)); os.makedirs(work, exist_ok=True)
TONE = ("zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,"
        "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
GRADE = ("eq=gamma=1.12:contrast=1.04:saturation=1.04,"
         "huesaturation=colors=g:saturation=-0.8:intensity=-0.06:strength=2,"
         "huesaturation=colors=c:saturation=-0.4,colortemperature=temperature=5900")
AUD = "highpass=f=90,afftdn=nr=10:nf=-40,equalizer=f=3000:t=q:w=1.2:g=2,aresample=48000"
parts = []
for s in E["segs"]:
    z, fx, fy = s["zoom"], s["fx"], s["fy"]
    crop = (f"crop=w=iw/{z}:h=ih/{z}:x='max(0,min(iw-ow,{fx}*iw-ow/2))':y='max(0,min(ih-oh,{fy}*ih-oh/2))',"
            if z > 1 else "")
    vf = f"{TONE},fps=30,{crop}scale=1920:1080:flags=lanczos,{GRADE},setsar=1"
    fade = 0.012
    af = f"{AUD},afade=t=in:d={fade},afade=t=out:st={s['dur']-fade:.4f}:d={fade}"
    out = f"{work}/{s['id']}.mkv"; parts.append(out)
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{s['src_in']:.4f}", "-i", src, "-t", f"{s['dur']:.4f}",
           "-map", "0:v:0", "-map", "0:a:0", "-vf", vf, "-af", af, "-frames:v", str(s["frames"]),
           "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p",
           "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", out]
    subprocess.run(cmd, check=True); print("done", s["id"], flush=True)
with open(f"{work}/list.txt", "w") as f:
    for p in parts: f.write(f"file '{os.path.abspath(p)}'\n")
end = E["end_card"]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{work}/list.txt",
    "-vf", f"tpad=stop_mode=clone:stop_duration={end}", "-af", f"apad=pad_dur={end}",
    "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", "-r", "30",
    "-c:a", "pcm_s16le", f"{work}/base.mkv"], check=True)
print("base ready")
