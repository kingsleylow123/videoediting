import sys, json
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
for path, out in zip(sys.argv[1::2], sys.argv[2::2]):
    import wave, numpy as np
    wf=wave.open(path); a=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768
    segs, info = m.transcribe(a, language="en", word_timestamps=True, vad_filter=True)
    words=[]; lines=[]
    for s in segs:
        lines.append({"start":s.start,"end":s.end,"text":s.text})
        for w in s.words: words.append({"s":round(w.start,2),"e":round(w.end,2),"w":w.word})
    json.dump({"segments":lines,"words":words}, open(out,"w"), indent=1)
    print("done", out, flush=True)
