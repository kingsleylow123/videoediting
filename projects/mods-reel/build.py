#!/usr/bin/env python3
"""Builds index.html for the "Claude Code Mods" reel (style of @nocode.joshua's reel).

Layout per scene: split (graphic top 760 px, face below), face (full-screen face) or
gfx (full-screen graphic). Captions are 2-3 word mono pills timed from words.json.
Edit SCENES / the scene builders below, then: python3 build.py && npx hyperframes check
"""
import json, math, html

W, H, SPLIT, FACE_Y = 1080, 1920, 700, 120
DUR = 74.4
ORANGE, ORANGE_T, ORANGE_S = "#D97757", "#E9A189", "#B95E43"
CREAM, INK, GREY = "#EFEFE8", "#1C1B19", "#8C8A84"

SCENES = [  # id, start, end, mode
    ("intro", 0.00, 6.05, "split"),
    ("ways", 6.05, 10.30, "split"),
    ("sessions", 10.30, 17.25, "split"),
    ("planbuild", 17.25, 22.85, "split"),
    ("day", 22.85, 30.45, "face"),
    ("iface", 30.45, 34.60, "split"),
    ("dash", 34.60, 37.55, "split"),
    ("dashfull", 37.55, 43.25, "gfx"),
    ("easy", 43.25, 47.00, "split"),
    ("router", 47.00, 55.00, "gfx"),
    ("crazy", 55.00, 56.95, "face"),
    ("describe", 56.95, 62.40, "split"),
    ("code", 62.40, 64.55, "split"),
    ("cta", 64.55, 68.45, "face"),
    ("comment", 68.45, 71.95, "split"),
    ("follow", 71.95, DUR, "face"),
]

html_parts, js, audio = [], [], []
esc = html.escape


def mode_at(t):
    for sid, a, b, m in SCENES:
        if a <= t < b:
            return m
    return SCENES[-1][3]


# ---------------------------------------------------------------- svg helpers
def spark(size, color="#fff", cls=""):
    rays = []
    for i in range(12):
        a = math.radians(i * 30 + 15)
        r1, r2 = 9, 44 if i % 2 == 0 else 38
        rays.append(f'<line x1="{r1*math.cos(a):.1f}" y1="{r1*math.sin(a):.1f}" x2="{r2*math.cos(a):.1f}" y2="{r2*math.sin(a):.1f}"/>')
    return (f'<svg class="{cls}" width="{size}" height="{size}" viewBox="-50 -50 100 100">'
            f'<g stroke="{color}" stroke-width="9" stroke-linecap="round">{"".join(rays)}</g></svg>')


def cube(size, kind="orange", inner="", cls="", style=""):
    if kind == "orange":
        f, t, r, st = ORANGE, ORANGE_T, ORANGE_S, "none"
    else:
        f, t, r, st = "#FFFFFF", "#F7F3EF", "#EDE5DE", ORANGE
    sw = "1.4" if kind != "orange" else "0"
    return (f'<div class="cube {cls}" style="width:{size}px;height:{size}px;{style}">'
            f'<svg width="{size}" height="{size}" viewBox="0 0 100 100">'
            f'<polygon points="0,22 22,0 100,0 78,22" fill="{t}" stroke="{st}" stroke-width="{sw}"/>'
            f'<polygon points="78,22 100,0 100,78 78,100" fill="{r}" stroke="{st}" stroke-width="{sw}"/>'
            f'<rect x="0" y="22" width="78" height="78" fill="{f}" stroke="{st}" stroke-width="{sw}"/></svg>'
            f'<div class="cube-in" style="left:0;top:{size*0.22:.0f}px;width:{size*0.78:.0f}px;height:{size*0.78:.0f}px">{inner}</div></div>')


def typed(text, cls="typed"):
    return f'<span class="{cls}">' + "".join(f'<span class="ch">{esc(c)}</span>' for c in text) + "</span>"


def scene_open(sid, mode):
    h = SPLIT if mode == "split" else H
    return f'<div id="sc-{sid}" class="scene" style="height:{h}px">'


def S(sid):
    return f"#sc-{sid}"


def pop(sel, t, dur=0.35, frm="{autoAlpha:0, scale:0.6}", ease="back.out(1.7)", extra=""):
    js.append(f'tl.fromTo("{sel}", {frm}, {{autoAlpha:1, scale:1, y:0, x:0, duration:{dur}, ease:"{ease}"{extra}}}, {t:.2f});')


def fade_up(sel, t, dur=0.4, dy=30, stagger=0):
    st = f", stagger:{stagger}" if stagger else ""
    js.append(f'tl.fromTo("{sel}", {{autoAlpha:0, y:{dy}}}, {{autoAlpha:1, y:0, duration:{dur}, ease:"power3.out"{st}}}, {t:.2f});')


def type_on(sel, t, dur):
    js.append(f'(function(){{const c=document.querySelectorAll("{sel} .ch"); tl.fromTo(c, {{opacity:0}}, {{opacity:1, duration:0.01, stagger:{dur}/Math.max(1,c.length)}}, {t:.2f});}})();')


def sfx(name, t, vol):
    audio.append((name, t, vol))


def window_light(sid, title="Claude Code", w=860, h=520, x=110, y=95, body=""):
    return (f'<div id="{sid}" class="win light" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">'
            f'<div class="bar"><i></i><i></i><i></i><span>{esc(title)}</span></div>{body}</div>')


# ---------------------------------------------------------------- scenes
def sc_intro():
    sid = "intro"
    labels = [("session-chat", 190, 300), ("agent-dashboard", 130, 470), ("model-router", 760, 250),
              ("design-tweaks", 820, 430), ("second-brain", 290, 520)]
    smalls = "".join(
        f'<div class="lab-cube s{i}" style="left:{x}px;top:{y}px">{cube(74, "white")}<div class="lab">{l}</div></div>'
        for i, (l, x, y) in enumerate(labels))
    html_parts.append(scene_open(sid, "split") + f'''
      <div class="tag-claude" style="top:58px">{spark(26)}<span>Claude</span></div>
      <div class="serif title" style="top:96px">Mods</div>
      <div class="big-cube" style="left:425px;top:275px">{cube(240, "orange", spark(120))}</div>
      {smalls}</div>''')
    fade_up(f"{S(sid)} .tag-claude", 0.05, dy=20)
    fade_up(f"{S(sid)} .title", 0.12)
    pop(f"{S(sid)} .big-cube", 0.30, 0.5)
    js.append(f'tl.fromTo("{S(sid)} .lab-cube", {{autoAlpha:0, scale:0.2, x:(i)=>[250,320,-200,-260,150][i], y:(i)=>[120,-40,160,0,-120][i]}}, '
              f'{{autoAlpha:1, scale:1, x:0, y:0, duration:0.5, ease:"back.out(1.4)", stagger:0.16}}, 2.85);')
    js.append(f'tl.to("{S(sid)} .big-cube", {{y:-10, duration:1.2, ease:"sine.inOut", yoyo:true, repeat:3}}, 1.0);')


def sc_ways():
    sid = "ways"
    nums = [(1, 100, 285), (2, 770, 230), (3, 470, 495)]
    cubes = "".join(f'<div class="num-cube n{n}" style="left:{x}px;top:{y}px">{cube(140, "white", f"<span class=num>{n}</span>")}</div>'
                    for n, x, y in nums)
    html_parts.append(scene_open(sid, "split") + f'''
      <div class="ways-title"><span class="serif" style="font-size:96px">3 ways</span><span class="sub">no one is talking about</span></div>
      <svg class="orbit" width="1080" height="700"><ellipse cx="540" cy="420" rx="390" ry="150" fill="none" stroke="#D9D3C9" stroke-width="2"/></svg>
      <div class="hub" style="left:470px;top:350px"><div class="glow"></div>{spark(80)}</div>
      {cubes}</div>''')
    fade_up(f"{S(sid)} .ways-title", 6.08)
    js.append(f'tl.fromTo("{S(sid)} .orbit", {{autoAlpha:0, scale:0.85}}, {{autoAlpha:1, scale:1, duration:0.6, ease:"power2.out"}}, 6.1);')
    pop(f"{S(sid)} .hub", 6.2, 0.45)
    for i, n in enumerate((1, 2, 3)):
        pop(f"{S(sid)} .n{n}", 6.62 + i * 0.22, 0.4)
        js.append(f'tl.to("{S(sid)} .n{n}", {{y:{-14 if i % 2 else 14}, duration:1.1, ease:"sine.inOut", yoyo:true, repeat:2}}, {7.3 + i*0.1:.2f});')


def term(sid, label, x):
    lines = "".join(f'<b style="width:{w}px"></b>' for w in (230, 170, 260, 120, 210))
    return (f'<div id="{sid}" class="win dark" style="left:{x}px;top:88px;width:400px;height:500px">'
            f'<div class="bar"><i></i><i></i><i></i><span><em class="dot"></em>{label}</span></div>'
            f'<div class="lines">{lines}</div><div class="prompt">&gt; <u></u></div></div>')


def sc_sessions():
    sid = "sessions"
    html_parts.append(scene_open(sid, "split") + term("sa", "Session A", 70) + term("sb", "Session B", 610) + f'''
      <div class="link"><div class="dash"></div><div class="knot"></div></div>
      <div class="msg" style="left:110px;top:400px"><b style="width:220px"></b><b style="width:150px"></b><div class="send">Send &#10003;</div></div>
      <div class="inbox" style="left:650px;top:370px"><div class="from">From Session A</div><b style="width:240px"></b><b style="width:170px"></b></div>
      </div>''')
    js.append(f'tl.fromTo("{S(sid)} #sa", {{autoAlpha:0, x:-80}}, {{autoAlpha:1, x:0, duration:0.45, ease:"power3.out"}}, 10.32);')
    js.append(f'tl.fromTo("{S(sid)} #sb", {{autoAlpha:0, x:80}}, {{autoAlpha:1, x:0, duration:0.45, ease:"power3.out"}}, 10.40);')
    fade_up(f"{S(sid)} .lines b", 10.6, 0.25, 10, 0.05)
    js.append(f'tl.fromTo("{S(sid)} .link .dash", {{scaleX:0}}, {{scaleX:1, duration:0.5, ease:"power2.inOut"}}, 12.3);')
    pop(f"{S(sid)} .link .knot", 12.7, 0.3)
    js.append(f'tl.fromTo("{S(sid)} .link", {{autoAlpha:0}}, {{autoAlpha:1, duration:0.01}}, 12.3);')
    pop(f"{S(sid)} .msg", 14.7, 0.35)
    js.append(f'tl.to("{S(sid)} .msg", {{x:540, y:-40, scale:0.85, autoAlpha:0, duration:0.6, ease:"power2.inOut"}}, 15.6);')
    pop(f"{S(sid)} .inbox", 16.2, 0.4)


def sc_planbuild():
    sid = "planbuild"
    packets = "".join(f'<div class="pkt p{i}"></div>' for i in range(3))
    back = "".join(f'<div class="pkt back b{i}"></div>' for i in range(2))
    checks = "".join(f'<div class="chk c{i}"><span>&#10003;</span></div>' for i in range(3))
    html_parts.append(scene_open(sid, "split") + f'''
      <div class="node a" style="left:120px;top:225px"><div class="pill-tag">PLANS</div>{cube(210, "orange", spark(100))}<div class="node-lab">Session A</div></div>
      <div class="node b" style="left:750px;top:225px"><div class="pill-tag">BUILDS</div>{cube(210, "orange", spark(100))}<div class="node-lab">Session B</div><div class="stack">{checks}</div></div>
      <div class="track"></div>{packets}{back}</div>''')
    pop(f"{S(sid)} .node.a", 17.3, 0.45)
    pop(f"{S(sid)} .node.b", 17.45, 0.45)
    js.append(f'tl.fromTo("{S(sid)} .track", {{scaleX:0}}, {{scaleX:1, duration:0.5, ease:"power2.inOut"}}, 17.7);')
    pop(f"{S(sid)} .node.a .pill-tag", 18.0, 0.3)
    pop(f"{S(sid)} .node.b .pill-tag", 19.7, 0.3)
    js.append(f'tl.fromTo("{S(sid)} .pkt:not(.back)", {{autoAlpha:0, x:0}}, {{autoAlpha:1, x:430, duration:0.9, ease:"power1.inOut", stagger:0.3}}, 20.3);')
    js.append(f'tl.to("{S(sid)} .pkt:not(.back)", {{autoAlpha:0, duration:0.15, stagger:0.3}}, 21.15);')
    js.append(f'tl.fromTo("{S(sid)} .pkt.back", {{autoAlpha:0, x:0}}, {{autoAlpha:1, x:-430, duration:0.9, ease:"power1.inOut", stagger:0.3}}, 21.4);')
    fade_up(f"{S(sid)} .chk", 21.6, 0.3, 20, 0.15)


def sc_day():
    sid = "day"
    html_parts.append(f'''<div id="sc-{sid}" class="scene" style="height:{H}px">
      <div class="daypill"><em class="dot"></em><span class="mono">DAY</span>
        <span class="roll"><span class="r1 mono">174</span><span class="r2 mono">175</span></span></div>
      <div class="daysub">helping <b>10,000 Malaysians</b> make more money with AI</div></div>''')
    pop(f"{S(sid)} .daypill", 24.8, 0.4, "{autoAlpha:0, scale:0.7, y:-20}")
    js.append(f'tl.fromTo("{S(sid)} .roll span", {{y:0}}, {{y:-64, duration:0.35, ease:"power3.inOut"}}, 25.2);')
    fade_up(f"{S(sid)} .daysub", 26.3, 0.4, 16)


def ui_body(dashboard=False):
    side = "".join(f'<div class="row"><em></em><b style="width:{w}px"></b></div>' for w in (90, 120, 70, 110, 80))
    chat = ('<div class="bub r"><b style="width:220px"></b></div><div class="bub"><b style="width:380px"></b><b style="width:300px"></b>'
            '<b style="width:340px"></b></div><div class="bub r"><b style="width:160px"></b></div>')
    dash = ""
    if dashboard:
        bars = "".join(f'<i style="height:{h}px"></i>' for h in (40, 70, 55, 95, 80, 120))
        dash = (f'<div class="dashp"><div class="dh">Dashboard <span class="beta">Beta</span></div>'
                f'<div class="tiles"><div class="tile"><div class="big">8</div><div class="sm">agents</div></div>'
                f'<div class="tile"><svg width="90" height="90" viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" fill="none" stroke="#EEE6DF" stroke-width="5"/>'
                f'<circle class="donut" cx="18" cy="18" r="14" fill="none" stroke="{ORANGE}" stroke-width="5" stroke-dasharray="88" stroke-dashoffset="88" transform="rotate(-90 18 18)"/></svg></div></div>'
                f'<div class="bars">{bars}</div></div>')
    return (f'<div class="side">{side}</div><div class="main">{chat}'
            f'<div class="input"><span class="ph">{typed("Change the interface") if not dashboard else "Ask Claude…"}</span><u></u></div></div>{dash}')


def sc_iface():
    sid = "iface"
    html_parts.append(scene_open(sid, "split") + window_light("w-iface", body=ui_body()) + '''
      <div class="hl hl1"><i class="pen"></i></div><div class="hl hl2"><i class="pen"></i></div><div class="hl hl3"><i class="pen"></i></div></div>''')
    pop(f"{S(sid)} #w-iface", 30.48, 0.45, "{autoAlpha:0, scale:0.92, y:30}", "power3.out")
    type_on(f"{S(sid)} .input", 32.5, 1.0)
    js.append(f'tl.fromTo("{S(sid)} .hl", {{autoAlpha:0, scale:1.05}}, {{autoAlpha:1, scale:1, duration:0.3, ease:"power2.out", stagger:0.12}}, 33.65);')


def sc_dash():
    sid = "dash"
    html_parts.append(scene_open(sid, "split") + window_light("w-dash", body=ui_body(True)) + "</div>")
    js.append(f'tl.fromTo("{S(sid)} #w-dash", {{autoAlpha:0}}, {{autoAlpha:1, duration:0.01}}, 34.6);')
    js.append(f'tl.fromTo("{S(sid)} .dashp", {{autoAlpha:0, x:120}}, {{autoAlpha:1, x:0, duration:0.5, ease:"power3.out"}}, 35.35);')
    js.append(f'tl.fromTo("{S(sid)} .main", {{width:690}}, {{width:390, duration:0.5, ease:"power3.out"}}, 35.35);')
    js.append(f'tl.fromTo("{S(sid)} .bars i", {{scaleY:0}}, {{scaleY:1, duration:0.4, ease:"back.out(1.6)", stagger:0.06}}, 35.8);')
    js.append(f'tl.fromTo("{S(sid)} .donut", {{attr:{{"stroke-dashoffset":88}}}}, {{attr:{{"stroke-dashoffset":26}}, duration:0.8, ease:"power2.out"}}, 35.9);')


def sc_dashfull():
    sid = "dashfull"
    agents = [("Research", "Reading the sources", "Running"), ("Writer", "Drafting the script", "Running"),
              ("Editor", "Waiting on the draft", "Waiting")]
    rows = "".join(f'<div class="arow ar{i}"><em class="av{" off" if s=="Waiting" else ""}">{spark(30)}</em><div><b>{n}</b><span>{d}</span></div>'
                   f'<i class="st{" w" if s=="Waiting" else ""}">{s}</i></div>' for i, (n, d, s) in enumerate(agents))
    # deterministic "second brain" network
    pts, k = [], 0
    for ring, cnt in ((0, 1), (55, 7), (105, 13), (150, 19)):
        for j in range(cnt):
            a = 2 * math.pi * j / cnt + ring * 0.01
            pts.append((180 + ring * math.cos(a), 170 + ring * math.sin(a) * 0.92))
    lines = []
    for i, p in enumerate(pts):
        for q in pts[i + 1:]:
            if math.dist(p, q) < 62:
                lines.append(f'<line x1="{p[0]:.0f}" y1="{p[1]:.0f}" x2="{q[0]:.0f}" y2="{q[1]:.0f}"/>')
    dots = "".join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{7 if i % 5 == 0 else 5}" fill="{ORANGE if i % 5 == 0 else INK}"/>' for i, (x, y) in enumerate(pts))
    stats = "".join(f'<div class="stat s{i}"><span>{n}</span><b>{v}</b></div>' for i, (n, v) in enumerate((("Projects", 12), ("Tasks", 38), ("Notes", 214))))
    html_parts.append(scene_open(sid, "gfx") + f'''
      <div class="dtitle">{spark(70, ORANGE)}<span class="serif">Dashboard</span></div>
      <div class="dsub">right inside Claude Code</div>
      <div class="card agents"><div class="ct">Your agents</div><div class="cs">what they are doing right now</div>{rows}</div>
      <div class="card brain"><div class="ct">Second brain</div><div class="cs">the full overview</div>
        <svg class="net" width="360" height="340"><g stroke="#CFC8BE" stroke-width="1.5">{"".join(lines)}</g>{dots}</svg>
        <div class="stats">{stats}</div></div></div>''')
    fade_up(f"{S(sid)} .dtitle, {S(sid)} .dsub", 37.58, 0.45, 24, 0.08)
    fade_up(f"{S(sid)} .agents", 37.9, 0.45, 40)
    fade_up(f"{S(sid)} .arow", 39.15, 0.35, 16, 0.25)
    fade_up(f"{S(sid)} .brain", 40.85, 0.45, 40)
    js.append(f'tl.fromTo("{S(sid)} .net circle", {{scale:0, transformOrigin:"50% 50%"}}, {{scale:1, duration:0.3, ease:"back.out(2)", stagger:0.012}}, 41.2);')
    js.append(f'tl.fromTo("{S(sid)} .net g", {{autoAlpha:0}}, {{autoAlpha:1, duration:0.6}}, 41.5);')
    fade_up(f"{S(sid)} .stat", 41.9, 0.35, 16, 0.18)


def sc_easy():
    sid = "easy"
    items = ("Fix a typo", "Rename these files", "Tidy up my notes")
    cards = "".join(f'<div class="ecard e{i}"><em>&#10003;</em><div><b>{t}</b><span>easy</span></div></div>' for i, t in enumerate(items))
    html_parts.append(scene_open(sid, "split") + f'''
      <div class="kicker" style="left:90px;top:70px">THE EASY STUFF</div>
      <div class="ecol">{cards}</div>
      <div class="model big"><div class="kicker">BIGGER MODEL</div><div class="serif mname">Opus</div><div class="cost">$$$</div></div>
      <div class="model cheap"><div class="kicker o">CHEAPER MODEL</div><div class="serif mname">Haiku</div><div class="cost">$</div></div></div>''')
    pop(f"{S(sid)} .model.big", 43.3, 0.4, "{autoAlpha:0, scale:0.9, y:20}", "power3.out")
    fade_up(f"{S(sid)} .kicker", 44.9, 0.3, 10)
    fade_up(f"{S(sid)} .ecard", 45.0, 0.35, 24, 0.18)
    pop(f"{S(sid)} .model.cheap", 46.0, 0.4)
    js.append(f'tl.to("{S(sid)} .model.big", {{opacity:0.45, duration:0.3}}, 46.0);')


def line_svg(cls, x1, y1, x2, y2, color):
    L = math.hypot(x2 - x1, y2 - y1)
    return (f'<line class="{cls}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="4" '
            f'stroke-linecap="round" stroke-dasharray="{L:.0f}" stroke-dashoffset="{L:.0f}" data-len="{L:.0f}"/>')


def sc_router():
    sid = "router"
    chips = [("Fix a typo", "easy", 90), ("Rename files", "easy", 400), ("Plan my launch", "hard", 710)]
    req = "".join(f'<div class="req q{i}" style="left:{x}px"><b>{t}</b><i class="{lv}">{lv}</i></div>' for i, (t, lv, x) in enumerate(chips))
    mx, my = 540, 760
    ins = "".join(line_svg(f"lin in{i}", x + 140, 400, mx, my - 110, ORANGE if lv == "easy" else INK) for i, (t, lv, x) in enumerate(chips))
    outs = line_svg("lout o0", mx - 70, my + 85, 290, 1000, ORANGE) + line_svg("lout o1", mx + 70, my + 85, 790, 1000, INK)
    html_parts.append(scene_open(sid, "gfx") + f'''
      <div class="kicker" style="left:90px;top:250px">REQUESTS</div>{req}
      <svg class="wires" width="1080" height="1920">{ins}{outs}</svg>
      <div class="mod" style="left:{mx-115}px;top:{my-115}px"><div class="glow"></div><span class="serif">Mod</span></div>
      <div class="mcard haiku" style="left:110px;top:1000px"><div class="kicker o">CHEAPER MODEL</div><div class="serif mname">Haiku</div>
        <div class="mini"><i>Fix a typo</i><i>Rename files</i></div></div>
      <div class="mcard opus" style="left:610px;top:1000px"><div class="kicker">BIGGER MODEL</div><div class="serif mname">Opus</div>
        <div class="mini"><i class="dk">Plan my launch</i></div></div>
      <div class="limits"><div class="lh"><b>Your limits</b><span>simple tasks stay off them</span></div>
        <div class="lb"><div class="fill with"></div></div><div class="ll"><span>with the mod</span></div>
        <div class="lb"><div class="fill without"></div></div><div class="ll"><span>without a mod</span></div></div></div>''')
    fade_up(f"{S(sid)} .kicker:first-child, {S(sid)} .req", 47.02, 0.35, 20, 0.12)
    pop(f"{S(sid)} .mod", 47.25, 0.5)
    js.append(f'tl.to("{S(sid)} .lin", {{attr:{{"stroke-dashoffset":0}}, duration:0.45, ease:"power2.out", stagger:0.12}}, 47.8);')
    js.append(f'tl.to("{S(sid)} .lout", {{attr:{{"stroke-dashoffset":0}}, duration:0.45, ease:"power2.out", stagger:0.2}}, 48.4);')
    pop(f"{S(sid)} .haiku", 48.85, 0.4, "{autoAlpha:0, scale:0.9, y:30}", "power3.out")
    pop(f"{S(sid)} .opus", 49.6, 0.4, "{autoAlpha:0, scale:0.9, y:30}", "power3.out")
    fade_up(f"{S(sid)} .limits", 51.4, 0.45, 40)
    js.append(f'tl.fromTo("{S(sid)} .fill.with", {{width:"0%"}}, {{width:"28%", duration:1.0, ease:"power2.out"}}, 52.2);')
    js.append(f'tl.fromTo("{S(sid)} .fill.without", {{width:"0%"}}, {{width:"92%", duration:1.4, ease:"power2.out"}}, 52.3);')


def sc_describe():
    sid = "describe"
    chips = "".join(f'<div class="fchip f{i}">{t}</div>' for i, t in enumerate(("read", "agents", "build")))
    bars = "".join(f'<i style="height:{h}px"></i>' for h in (34, 58, 46, 80))
    html_parts.append(scene_open(sid, "split") + f'''
      <div class="chat"><div class="who">YOU</div><div class="said">{typed("Build me a mod that shows what my agents are doing.")}</div></div>
      <div class="dcube" style="left:150px;top:310px">{cube(190, "orange", spark(90))}</div>
      <div class="target" style="left:700px;top:330px"><div class="dbox"></div>
        <div class="made">{cube(190, "white", f'<div class="mbars">{bars}</div>')}<div class="node-lab">your mod</div></div></div>
      <div class="conn"></div>{chips}</div>''')
    fade_up(f"{S(sid)} .chat", 56.98, 0.35, 20)
    type_on(f"{S(sid)} .said", 57.1, 2.4)
    pop(f"{S(sid)} .dcube", 59.6, 0.4)
    js.append(f'tl.fromTo("{S(sid)} .target", {{autoAlpha:0}}, {{autoAlpha:1, duration:0.3}}, 59.75);')
    js.append(f'tl.fromTo("{S(sid)} .conn", {{scaleX:0}}, {{scaleX:1, duration:0.4}}, 60.3);')
    js.append(f'tl.fromTo("{S(sid)} .fchip", {{autoAlpha:0, x:0, y:0}}, {{autoAlpha:1, x:(i)=>[380,400,370][i], y:(i)=>[-50,10,70][i], duration:0.7, ease:"power2.inOut", stagger:0.18}}, 60.4);')
    js.append(f'tl.to("{S(sid)} .fchip", {{autoAlpha:0, duration:0.2, stagger:0.18}}, 61.05);')
    js.append(f'tl.fromTo("{S(sid)} .made", {{autoAlpha:0, scale:0.5}}, {{autoAlpha:1, scale:1, duration:0.45, ease:"back.out(1.8)"}}, 61.6);')
    js.append(f'tl.to("{S(sid)} .dbox", {{autoAlpha:0, duration:0.2}}, 61.6);')


def sc_code():
    sid = "code"
    rows = []
    for i in range(22):
        w = [180, 320, 260, 420, 140, 360, 220, 300, 400, 170, 280, 350, 200, 330, 250, 380, 160, 300, 240, 340, 190, 280][i]
        hot = i in (2, 6, 11, 15, 19)
        rows.append(f'<div class="cl"><span>{i+1:02d}</span><b class="{"hot" if hot else ""}" style="width:{w}px"></b></div>')
    html_parts.append(scene_open(sid, "split") + f'<div class="codep"><div class="cin">{"".join(rows)}</div></div></div>')
    js.append(f'tl.fromTo("{S(sid)} .codep", {{autoAlpha:0}}, {{autoAlpha:1, duration:0.01}}, 62.4);')
    js.append(f'tl.fromTo("{S(sid)} .cl", {{autoAlpha:0, x:-20}}, {{autoAlpha:1, x:0, duration:0.15, stagger:0.06}}, 62.42);')
    js.append(f'tl.fromTo("{S(sid)} .cin", {{y:0}}, {{y:-260, duration:2.1, ease:"none"}}, 62.45);')


def sc_cta():
    sid = "cta"
    html_parts.append(f'''<div id="sc-{sid}" class="scene" style="height:{H}px">
      <div class="guide"><em>{spark(34)}</em><span>Step-by-step guide</span></div></div>''')
    pop(f"{S(sid)} .guide", 67.0, 0.4, "{autoAlpha:0, scale:0.7, y:-20}")


def sc_comment():
    sid = "comment"
    html_parts.append(scene_open(sid, "split") + f'''
      <div class="igc"><div class="igh">Comments</div>
        <div class="posted"><em class="av2"></em><div><b>you</b> <span class="c">CLAUDE</span><div class="ago">now &middot; Reply</div></div><i class="heart">&#9829;</i></div>
        <div class="compose"><em class="av2"></em><div class="field"><span class="ph2">Add a comment&hellip;</span>{typed("CLAUDE", "typed tc")}</div><span class="post">Post</span></div></div>
      <div class="dm"><em class="av">{spark(36)}</em><div><b>kingsleylow.ai</b><span>Here's your step-by-step guide &rarr;</span></div>
        <svg class="plane" width="40" height="40" viewBox="0 0 24 24"><path d="M2 21 23 12 2 3v7l15 2-15 2z" fill="{ORANGE}"/></svg></div>
      <div class="sent">&#10003; Sent to your DMs</div></div>''')
    fade_up(f"{S(sid)} .igc", 68.47, 0.35, 30)
    js.append(f'tl.to("{S(sid)} .ph2", {{autoAlpha:0, duration:0.05}}, 68.75);')
    type_on(f"{S(sid)} .compose", 68.75, 0.45)
    js.append(f'tl.to("{S(sid)} .post", {{color:"{ORANGE}", duration:0.1}}, 69.2);')
    fade_up(f"{S(sid)} .posted", 69.45, 0.3, -20)
    js.append(f'tl.to("{S(sid)} .compose .tc", {{autoAlpha:0, duration:0.1}}, 69.45);')
    js.append(f'tl.to("{S(sid)} .ph2", {{autoAlpha:1, duration:0.1}}, 69.5);')
    js.append(f'tl.fromTo("{S(sid)} .dm", {{autoAlpha:0, y:-80}}, {{autoAlpha:1, y:0, duration:0.45, ease:"back.out(1.4)"}}, 70.05);')
    pop(f"{S(sid)} .sent", 71.4, 0.3)


def sc_follow():
    sid = "follow"
    html_parts.append(f'''<div id="sc-{sid}" class="scene" style="height:{H}px">
      <div class="follow"><em class="av">{spark(52)}</em><div class="who2"><b>kingsleylow.ai</b><span>Claude tips</span></div>
        <div class="fbtn"><span class="f1">Follow</span><span class="f2">Following</span></div></div></div>''')
    pop(f"{S(sid)} .follow", 72.2, 0.45, "{autoAlpha:0, scale:0.75, y:40}")
    js.append(f'tl.to("{S(sid)} .fbtn", {{scale:0.9, duration:0.1, yoyo:true, repeat:1}}, 73.2);')
    js.append(f'tl.to("{S(sid)} .fbtn", {{backgroundColor:"#E9E7E1", duration:0.15}}, 73.3);')
    js.append(f'tl.to("{S(sid)} .f1", {{autoAlpha:0, duration:0.1}}, 73.3);')
    js.append(f'tl.fromTo("{S(sid)} .f2", {{autoAlpha:0}}, {{autoAlpha:1, duration:0.15}}, 73.32);')


for f in (sc_intro, sc_ways, sc_sessions, sc_planbuild, sc_day, sc_iface, sc_dash, sc_dashfull, sc_easy,
          sc_router, sc_describe, sc_code, sc_cta, sc_comment, sc_follow):
    f()

# ---------------------------------------------------------------- scene visibility + layout
layout = {"split": (SPLIT, FACE_Y), "face": (0, 0), "gfx": (H, 0)}
pre = []
for sid, a, b, m in SCENES:
    ph, fy = layout[m]
    pre.append(f'tl.set("#panel", {{height:{ph}}}, {a:.2f}); tl.set("#face", {{y:{fy}}}, {a:.2f});')
    pre.append(f'tl.set("#sc-{sid}", {{autoAlpha:1}}, {a:.2f}); tl.set("#sc-{sid}", {{autoAlpha:0}}, {b:.2f});')
# punch-in on the "craziest part" line
pre.append('tl.fromTo("#face", {scale:1}, {scale:1.08, duration:0.25, ease:"power2.out", transformOrigin:"50% 40%"}, 55.0);')
pre.append('tl.set("#face", {scale:1}, 56.95);')

# ---------------------------------------------------------------- captions
words = json.load(open("words.json"))
chunks, cur = [], []
for s, e, t in words:
    t2 = t.upper().replace(",", "").replace(".", "").replace("?", "?")
    n_words = len(t2.split())
    cur_len = sum(len(x[2]) + 1 for x in cur)
    if cur and (len(cur) + n_words > 3 or cur_len + len(t2) > 18):
        chunks.append(cur); cur = []
    cur.append((s, e, t2))
    if t.endswith((".", "?", ",")):
        chunks.append(cur); cur = []
if cur:
    chunks.append(cur)
cap_html = []
cap_y = {"split": SPLIT - 36, "face": 600, "gfx": 1440}
cut_times = sorted({a for _, a, _, _ in SCENES} | {DUR})
for i, c in enumerate(chunks):
    start = c[0][0]
    nxt = chunks[i + 1][0][0] if i + 1 < len(chunks) else DUR
    end = min(nxt, c[-1][1] + 0.35) if nxt - c[-1][1] > 0.6 else nxt
    # never let a caption run across a scene cut into a different layout
    m = mode_at(start + 0.01)
    for ct in cut_times:
        if start < ct < end and mode_at(ct) != m:
            end = ct
    text = " ".join(x[2] for x in c)
    cap_html.append(f'<div class="capwrap" id="cap{i}" style="top:{cap_y[m]}px"><span class="cap">{esc(text)}</span></div>')
    pre.append(f'tl.set("#cap{i}", {{autoAlpha:1}}, {start:.2f}); tl.set("#cap{i}", {{autoAlpha:0}}, {end:.2f});')

# ---------------------------------------------------------------- sound design
# (time, sfx file in sfx/ without "sx-" and ".wav", volume, optional max length)
# Files are Pixabay-licensed, peak-normalised to -1 dBFS (kit/sfx). The renderer ducks this bus under the voice.
CUES = [
    # intro: tag slides in, hero cube lands on the hook, labelled mods pop in rising
    (0.00, "whoosh-soft", 0.40), (0.27, "impact-bass-1", 0.50, 1.6),
    (2.85, "pop", 0.38), (3.01, "pop-2", 0.38), (3.17, "pop-3", 0.38), (3.33, "pop-4", 0.38), (3.49, "pop-4", 0.30),
    # 3 ways: hub, then 1-2-3 climbing in pitch
    (6.05, "whoosh", 0.42), (6.20, "pop", 0.40), (6.62, "pop-2", 0.42), (6.84, "pop-3", 0.42), (7.06, "pop-4", 0.42),
    # sessions talk: windows slide, lines type, link snaps, message flies and lands
    (10.30, "whoosh-soft", 0.40), (10.40, "whoosh-soft", 0.28), (10.60, "typing", 0.22, 0.55),
    (12.30, "whoosh-soft", 0.22), (12.70, "click", 0.42),
    (14.70, "pop", 0.40), (15.60, "whoosh", 0.40), (16.20, "notification", 0.38, 1.3),
    # plans / builds: work passing both ways, checks ticking
    (17.25, "whoosh", 0.40), (17.30, "pop", 0.32), (17.45, "pop-2", 0.32),
    (18.00, "click", 0.38), (19.70, "click-hi", 0.38),
    (20.30, "whoosh-soft", 0.32), (21.40, "whoosh-soft", 0.32),
    (21.60, "click-soft", 0.36), (21.75, "click-soft", 0.36), (21.90, "click-hi", 0.36),
    # day 175 (face)
    (22.85, "whoosh-soft", 0.22), (24.80, "pop", 0.42), (25.20, "ping", 0.34, 0.9), (26.30, "sparkle", 0.20, 1.2),
    # change the interface: typed prompt, outlines snap on
    (30.45, "whoosh", 0.40), (32.50, "typing", 0.34, 1.05),
    (33.65, "click-soft", 0.36), (33.77, "click-soft", 0.36), (33.89, "click-hi", 0.36),
    # dashboard slides in, bars + donut fill
    (35.35, "whoosh-soft", 0.40), (35.80, "pop-2", 0.26), (35.90, "sparkle", 0.22, 1.2),
    # full dashboard: agents tick in, second brain sparkles, stats count
    (37.55, "whoosh", 0.45), (39.15, "click-soft", 0.36), (39.40, "click-soft", 0.36), (39.65, "click-soft", 0.36),
    (40.85, "whoosh-soft", 0.32), (41.20, "sparkle", 0.24, 1.4),
    (41.90, "pop", 0.28), (42.08, "pop-2", 0.28), (42.26, "pop-3", 0.28),
    # easy stuff -> cheaper model
    (43.25, "whoosh", 0.40), (43.30, "pop", 0.28),
    (45.00, "click", 0.34), (45.18, "click", 0.34), (45.36, "click-hi", 0.34), (46.00, "ping", 0.36, 0.9),
    # router: the Mod lands, wires draw, models appear, limits fill
    (47.00, "whoosh", 0.45), (47.25, "impact-bass-1", 0.40, 1.4),
    (47.80, "whoosh-soft", 0.26), (48.40, "whoosh-soft", 0.26), (48.85, "pop", 0.34), (49.60, "pop-2", 0.34),
    (51.40, "pop-3", 0.28), (52.25, "whoosh-soft", 0.24),
    # build-up into "the craziest part", hit on the punch-in
    (52.46, "whoosh-cinematic", 0.16, 2.9), (54.64, "impact-bass-2", 0.48, 1.8),
    # describe the mod: typed request, tags fly, mod gets built
    (56.95, "whoosh", 0.40), (57.10, "typing", 0.34, 1.5), (58.60, "typing", 0.34, 0.9),
    (59.60, "pop", 0.40), (60.40, "whoosh-soft", 0.32), (61.60, "sparkle", 0.36, 1.4), (61.62, "pop-3", 0.32),
    # code scrolls
    (62.40, "glitch-3", 0.34, 1.2), (62.45, "typing", 0.20, 1.6),
    # cta (face) + guide pill
    (64.55, "whoosh-soft", 0.22), (67.00, "pop", 0.42),
    # comment CLAUDE: six keystrokes, post, DM arrives, sent
    (68.45, "whoosh", 0.40),
    (68.75, "key-press", 0.42, 0.25), (68.83, "key-press", 0.42, 0.25), (68.90, "key-press", 0.42, 0.25),
    (68.98, "key-press", 0.42, 0.25), (69.05, "key-press", 0.42, 0.25), (69.13, "key-press", 0.42, 0.25),
    (69.20, "click", 0.42), (69.45, "pop-2", 0.34), (70.05, "notification", 0.44, 1.5), (71.40, "chime", 0.22, 1.3),
    # follow card: pops in, button tapped, sparkles to "Following"
    (71.95, "whoosh-soft", 0.26), (72.20, "pop", 0.45), (73.20, "click", 0.48), (73.32, "sparkle", 0.32, 1.1),
]

SFX_GAIN = 1.8  # master level for the whole SFX bus (relative to the cue volumes above)

import subprocess
def _len(name):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"sfx/sx-{name}.wav"],
                         capture_output=True, text=True).stdout.strip()
    return float(out)

aud = [f'<audio id="vo" data-role="voice" src="media/voice.m4a" data-start="0" data-duration="{DUR}" data-volume="1"></audio>']
_lens = {}
for i, cue in enumerate(CUES):
    t, name, vol = cue[:3]
    if name not in _lens:
        _lens[name] = _len(name)
    d = min(cue[3] if len(cue) > 3 else _lens[name], _lens[name], DUR - t)
    v = min(0.95, vol * SFX_GAIN)
    aud.append(f'<audio id="sx{i}" src="sfx/sx-{name}.wav" data-start="{t:.2f}" data-duration="{d:.2f}" data-volume="{v:.2f}"></audio>')
audio = CUES

css = open("style.css").read()
page = f'''<!doctype html>
<html lang="en" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="vendor/gsap.min.js"></script>
<style>
{css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-fps="30" data-width="1080" data-height="1920">
  <video id="face" class="clip" src="media/head.mp4" muted playsinline data-start="0" data-duration="{DUR}" data-track-index="0"></video>
  <div id="panel"></div>
  {"".join(html_parts)}
  {"".join(cap_html)}
  {"".join(aud)}
</div>
<script>
  window.__timelines = window.__timelines || {{}};
  const tl = gsap.timeline({{ paused: true }});
  gsap.set(".scene, .capwrap", {{autoAlpha:0}});
  {chr(10).join("  " + l for l in pre)}
  {chr(10).join("  " + l for l in js)}
  tl.set({{}}, {{}}, {DUR});
  window.__timelines["main"] = tl;
  tl.seek(0);
</script>
</body>
</html>
'''
open("index.html", "w").write(page)
print(f"scenes={len(SCENES)} captions={len(chunks)} sfx={len(audio)} tweens={len(js)}")
