"""Chinese subtitle line (one per sentence / clause) → data/zh.json + font subset. Review by a native speaker before posting."""
import json, re, urllib.parse, subprocess
d = json.load(open("data/timeline.json")); W = d["words"]
# (first English word of the clause, its occurrence index, Chinese)
ZH = [
 ("Boom,", 0, "我刚问了拿督 Joey Yap：我的 AI 生意，怎样做到一年两百万令吉？"),
 ("and", 0, "这是我第二年跟着 Carina 的团队来 Thrive。"),
 ("I", 1, "我有一个很认真的问题要问他。"),
 ("Dato,", 0, "拿督，我们的 Claude Malaysia 社群，193 天从 0 做到 5000 人，"),
 ("competitors", 0, "现在竞争对手开始抄袭我们了。"),
 ("number", 0, "第一，专注做线上课程；"),
 ("number", 1, "第二，建立销售团队；"),
 ("number", 2, "第三，找人合作；"),
 ("or", 0, "还是第四，经营个人品牌？"),
 ("So", 0, "他打开我的奇门盘，说我在「生门」，"),
 ("Very", 0, "非常好。"),
 ("That", 0, "代表你处在一个非常强势的位置，这是好事。"),
 ("The", 0, "竞争对手呢，都卡在「死门」，"),
 ("they", 0, "他们已经在死门了。"),
 ("They", 0, "撑不了多久的。"),
 ("But", 0, "但你真正需要的，是一个独立的产品。"),
 ("And", 0, "在所有选项里，他直接指向了线上课程。"),
 ("So", 1, "离你最近的，就是课程。"),
 ("Online", 0, "线上课程。对，先做课程。"),
 ("After", 0, "办了超过 13 场吉隆坡实体工作坊之后，"),
 ("it's", 1, "是时候转型，打造完整的线上课程生态系统了。"),
 ("it's", 2, "是时候建立我们的护城河了。"),
 ("Oh,", 0, "对了，冷知识：这整支影片，其实是 Claude 剪辑的。"),
 ("Claude,", 0, "Claude？我当然听过 Claude。"),
 ("So", 2, "我们 2027 年，真的能做到两百万令吉吗？"),
 ("Comment", 0, "留言「CLAUDE」，跟着我一起走这段旅程。"),
]
idx = []
for word, n, zh in ZH:
    hits = [i for i, w in enumerate(W) if w["text"] == word]
    idx.append((hits[n], zh))
out = []
for k, (i, zh) in enumerate(idx):
    j = idx[k + 1][0] - 1 if k + 1 < len(idx) else len(W) - 1
    out.append(dict(start=W[i]["start"], end=min(W[j]["end"] + 0.4, W[j + 1]["start"] if j + 1 < len(W) else 1e9), text=zh,
                    first=W[i]["text"]))
json.dump(out, open("data/zh.json", "w"), ensure_ascii=False, indent=1)
for o in out: print(round(o["start"], 2), o["first"], o["text"])
chars = "".join(sorted(set("".join(z for _, _, z in ZH) + "生死门休伤杜景惊开")))
css = subprocess.run(["curl", "-sS", "-A", "Mozilla/5.0 (X11; Linux x86_64) Chrome/120", "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@800&text=" + urllib.parse.quote(chars)], capture_output=True, text=True).stdout
url = re.search(r"url\((https://[^)]+)\)", css).group(1)
subprocess.run(["curl", "-sS", "-o", "public/fonts/NotoSC-zh-800.woff2", url], check=True); print("font ok", len(chars), "chars")
