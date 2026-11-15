"""Edit decision list for the Rebecca testimonial. Source = clean iPhone MOV (HLG, 60fps)."""
import json, sys, re
FPS = 30
# id, src_in, src_out, zoom, focus_x, focus_y, beat
SEGS = [
 ("hookA", 54.55, 56.05, 1.18, .30, .45, "hook"),
 ("hookB", 58.10, 59.30, 1.18, .30, .45, "hook"),
 ("hookC", 59.30, 59.85, 1.18, .30, .45, "hook"),
 ("b1a",    6.40, 11.66, 1.00, .50, .50, "who"),
 ("b1b",   12.38, 16.45, 1.08, .35, .45, "who"),
 ("b2",    16.80, 26.62, 1.00, .50, .50, "opp"),
 ("b3a",   26.65, 27.80, 1.00, .50, .50, "twist"),
 ("b3b",   28.90, 29.80, 1.28, .30, .42, "twist"),
 ("b3c",   30.25, 31.55, 1.12, .30, .45, "twist"),
 ("b4a",   33.45, 37.00, 1.05, .35, .48, "mech"),
 ("b4b",   37.60, 41.45, 1.08, .35, .48, "mech"),
 ("b5a",   42.24, 47.55, 1.08, .68, .45, "recap"),
 ("b5b",   48.14, 51.70, 1.00, .50, .50, "recap"),
 ("b6a",   51.90, 53.85, 1.00, .50, .50, "proof"),
 ("b6b",   54.55, 56.05, 1.00, .50, .50, "proof"),
 ("b6c",   56.35, 59.30, 1.00, .50, .50, "proof"),
 ("b6d",   59.80, 61.10, 1.05, .68, .45, "proof"),
 ("b7a",   61.45, 68.20, 1.00, .50, .50, "payback"),
 ("b7b",   68.80, 69.70, 1.12, .30, .45, "payback"),
 ("b8a",   76.80, 79.50, 1.00, .50, .50, "timeline"),
 ("b8b",   81.13, 82.45, 1.00, .50, .50, "timeline"),
 ("b8c",   82.85, 87.98, 1.06, .32, .46, "timeline"),
 ("b8d",   88.55, 91.60, 1.12, .32, .46, "timeline"),
 ("b9a",   92.00, 93.35, 1.08, .68, .45, "reaction"),
 ("b9b",   97.10, 97.80, 1.08, .30, .45, "reaction"),
 ("b10",   98.85, 102.85, 1.00, .50, .50, "warmth"),
]
END_CARD = 5.0

def build():
    out, t = [], 0.0
    for sid, a, b, z, fx, fy, beat in SEGS:
        n = round((b - a) * FPS)            # frame-exact duration
        d = n / FPS
        out.append(dict(id=sid, src_in=a, src_out=a + d, dur=d, frames=n, zoom=z, fx=fx, fy=fy, beat=beat, out_in=round(t, 4), out_out=round(t + d, 4)))
        t += d
    return out, t

# Hand-written caption chunks per segment: (word_count, EN, ZH). *word* = clay highlight.
CAPS = {
 "hookA": [(4, "The deal was *RM5,000.*", "这单生意值 RM5,000。")],
 "hookB": [(3, "I've collected *50%.*", "我已经收了 50%。")],
 "b1a": [(3, "Hi, I'm Rebecca,", "嗨,我是 Rebecca,"), (6, "and after joining the *one-day class,*", "上完一天课程之后,")],
 "b1b": [(6, "I started to explore *AI.*", "我开始探索 AI。")],
 "b2": [(4, "Then one opportunity came,", "然后一个机会来了,"), (5, "somebody was looking for", "有人在找"),
        (5, "somebody to make a *dashboard*", "会做仪表板的人"), (9, "in a niche I wasn't even familiar with.", "而且是我完全不熟悉的领域。")],
 "b3a": [(4, "What was the niche?", "是什么领域?")],
 "b3b": [(1, "*Trading.*", "交易。")],
 "b3c": [(3, "Yes, *US stocks.*", "对,美股。")],
 "b4a": [(6, "After *prompting* and learning more,", "经过不断提示和学习,")],
 "b4b": [(5, "I managed to *close*", "我成功拿下了"), (5, "the deal with the client.", "这个客户。")],
 "b5a": [(5, "So basically, you learn *Claude,*", "所以你学了 Claude,"), (6, "and now you close a deal,", "现在就成交了,"), (5, "your very, very *first deal.*", "你的第一单。")],
 "b5b": [(8, "to build a *Claude dashboard* for someone else.", "帮别人做一个 Claude 仪表板。"), (2, "Yes, correct.", "对,没错。")],
 "b6a": [(7, "And how much is the deal worth?", "这单值多少钱?")],
 "b6b": [(4, "The deal was *RM5,000.*", "这单生意值 RM5,000。")],
 "b6c": [(6, "And have you collected the money?", "收到钱了吗?"), (3, "I've collected *50%.*", "我已经收了 50%。")],
 "b6d": [(3, "You've collected 50%?", "已经收了 50%?"), (1, "Yes.", "对。")],
 "b7a": [(7, "So with just *one deal,*", "所以只靠一单,"), (6, "you made back the whole investment", "你就赚回了"), (9, "of the one-day and two-day classes.", "一天和两天课程的全部投资。")],
 "b7b": [(2, "*Almost,* yeah.", "差不多啦。")],
 "b8a": [(4, "And how long did", "那整个过程"), (5, "this whole process take you…", "花了你多久……")],
 "b8b": [(6, "until you closed your *first client?*", "到你拿下第一个客户?")],
 "b8c": [(6, "I started learning Claude in *August,*", "我八月开始学 Claude,"), (9, "and started taking on my first deal in", "然后开始接我的第一单,")],
 "b8d": [(1, "*October.*", "在十月。"), (9, "So that's about *two and a half months.*", "大概两个半月。")],
 "b9a": [(6, "Wow, *two and a half months.*", "哇,两个半月。")],
 "b9b": [(2, "Yes, correct.", "对,没错。")],
 "b10": [(6, "I'm so happy for you, Rebecca.", "真替你高兴,Rebecca。"), (1, "Congrats!", "恭喜!"), (2, "Thank you.", "谢谢。")],
}

def seg_words(seg, words):
    ws = [w for w in words if seg["src_in"] - 0.05 <= (w["s"] + w["e"]) / 2 < seg["src_out"]]
    merged = []
    for w in ws:
        t = w["w"].strip()
        if merged and re.match(r"^[,%-]", t):
            merged[-1]["e"] = w["e"]
        else:
            merged.append(dict(s=w["s"], e=w["e"]))
    return merged

def captions(edl, words):
    caps = []
    for seg in edl:
        ws = seg_words(seg, words); i = 0
        for n, en, zh in CAPS.get(seg["id"], []):
            grp = ws[i:i + n]; i += n
            assert len(grp) == n, (seg["id"], en, len(grp))
            s = seg["out_in"] + max(0.0, grp[0]["s"] - seg["src_in"])
            e = seg["out_in"] + min(seg["dur"], grp[-1]["e"] - seg["src_in"])
            caps.append(dict(seg=seg["id"], en=en, zh=zh, s=round(max(seg["out_in"], s - 0.08), 3), e=round(e, 3)))
        assert i == len(ws), (seg["id"], "unused words", len(ws) - i)
    for k, c in enumerate(caps):
        nxt = caps[k + 1]["s"] if k + 1 < len(caps) else c["e"] + 0.5
        c["e"] = round(min(nxt, c["e"] + 0.5), 3)
    return caps

if __name__ == "__main__":
    edl, total = build()
    words = json.load(open(sys.argv[1]))
    caps = captions(edl, words)
    json.dump(dict(fps=FPS, total=total, end_card=END_CARD, segs=edl, captions=caps), open(sys.argv[2], "w"), indent=1)
    print(f"body {total:.2f}s + end {END_CARD}s = {total+END_CARD:.2f}s, {len(caps)} caption chunks")
    for i, c in enumerate(caps): print(i, f"{c['s']:6.2f}-{c['e']:6.2f}", c["seg"], c["en"])
    for s_ in edl: print(s_["id"], s_["beat"], s_["out_in"], s_["out_out"])
