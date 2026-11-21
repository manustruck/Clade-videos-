"""'El grupo del edificio' - motor 2D v2: cámara en movimiento, transiciones, luces y subtítulos grandes.

Uso (python del entorno tts, desde cualquier carpeta):
  python motor.py hoja [fin|mitad|inicio]  -> test/hoja_*.png (un cuadro por plano)
  python motor.py cuadro 37.5              -> test/cuadro.png
  python motor.py tira 12.0 3.0            -> test/tira.png (12 cuadros desde el segundo 12, cada 0,25 s)
  El video completo se hace con render.py.
"""
import json
import re
import sys
import types

from base import *  # noqa: F401,F403  (C, P, rr, circ, oval, line, poly, vgrad, text, wrap, ease, bounce, gotas...)

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
LEAD, GAP, TAIL, TR = 0.2, 0.16, 1.7, 0.24

# ------------------------------------------------------------------ tiempos
with open(os.path.join(HERE, "guion.json"), encoding="utf-8") as f:
    GUION = json.load(f)
CLEAN = [g["n"].replace("*", "").replace("_", "") for g in GUION]
WORDS = []
for i in range(len(GUION)):
    with open(os.path.join(HERE, "voz", "{:02d}.json".format(i)), encoding="utf-8") as f:
        WORDS.append(json.load(f))
ENDS = [w[-1]["t"] + w[-1]["d"] for w in WORDS]
STARTS = []
_t = LEAD
for i, e in enumerate(ENDS):
    _t += GUION[i].get("pre", 0.0)
    STARTS.append(_t)
    _t += e + GAP
TOTAL = round(_t - GAP + TAIL, 2)
NF = int(TOTAL * FPS)
CUTS = [0.0] + [STARTS[i] - GAP / 2 - GUION[i].get("pre", 0.0) * 0.5 for i in range(1, len(GUION))] + [TOTAL]


def limpio(s):
    return s.lower().strip("¿¡.,:;?!…")


def wt_line(i, sub):
    for w in WORDS[i]:
        if limpio(w["w"]).startswith(sub.lower()):
            return w["t"]
    return 0.0


def golpes_de(i):
    g = GUION[i].get("a", {}).get("golpes")
    if not g:
        return []
    t0 = wt_line(i, g[0]) + g[1]
    return [t0 + k * g[3] for k in range(g[2])]


def adds_de(i):
    return [((wt_line(i, w) if w else 0.0) + off, idx) for (w, off, idx) in GUION[i].get("a", {}).get("add", [])]


PELIGRO = {4, 6, 7, 8, 9, 15}
EVENTS = []
for i, g in enumerate(GUION):
    a = g.get("a", {})
    if i > 0 and g.get("tr", "cut") != "cut":
        EVENTS.append(["whoosh", CUTS[i]])
    for t, idx in adds_de(i):
        EVENTS.append(["alerta" if idx in PELIGRO else ("sys" if 11 <= idx <= 14 else "pop"), STARTS[i] + t])
    for t in golpes_de(i):
        EVENTS.append(["golpe", STARTS[i] + t])
    if a.get("vib"):
        EVENTS.append(["vib", STARTS[i] - 0.05])
    if a.get("mute"):
        EVENTS.append(["tic", STARTS[i] + wt_line(i, a["mute"])])
    if g["s"] == "cama" and a.get("modo") == "duerme":
        EVENTS.append(["vib", STARTS[i] + wt_line(i, "pantalla")])
    if g["s"] == "espalda":
        EVENTS.append(["clic", STARTS[i] + wt_line(i, "seguro")])
    if g["s"] == "cenital":
        EVENTS.append(["chirrido", STARTS[i] - 0.1])
        EVENTS.append(["bum", STARTS[i] + wt_line(i, "adentro")])
    if a.get("rojo"):
        EVENTS.append(["impacto", STARTS[i] if i else 0.0])
    if g.get("pre"):
        EVENTS.append(["silencio", STARTS[i] - g["pre"] - 0.05])
with open(os.path.join(HERE, "timeline.json"), "w", encoding="utf-8") as f:
    json.dump({"total": TOTAL, "starts": STARTS, "ends": ENDS, "cuts": CUTS, "events": EVENTS,
               "escenas": [g["s"] for g in GUION]}, f, indent=1)

FILES["sb"] = "seguisb.ttf"

# ------------------------------------------------------------------ utilidades nuevas
_cache = {}
LIN = skia.SamplingOptions(skia.FilterMode.kLinear)


def lerp(a, b, f):
    return a + (b - a) * f


def cono(c, x, y0, y1, half_top, half_bot, a=0.3, col="#FFE2A0"):
    key = ("cono", y0, y1, half_top, half_bot, col)
    if key not in _cache:
        s = skia.Surface(int(half_bot * 2 + 200), int(y1 - y0 + 200))
        cc = s.getCanvas()
        cc.clear(0)
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeLinear([(0, 100), (0, y1 - y0 + 100)], [C(col, 1.0), C(col, 0.0)]))
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 40))
        cx = half_bot + 100
        poly(cc, [(cx - half_top, 100), (cx + half_top, 100), (cx + half_bot, y1 - y0 + 100), (cx - half_bot, y1 - y0 + 100)], p)
        _cache[key] = s.makeImageSnapshot()
    p = skia.Paint(AntiAlias=True)
    p.setAlphaf(clamp(a))
    c.drawImage(_cache[key], x - half_bot - 100, y0 - 100, LIN, p)


def destello(c, x, y, r, col, a):
    """Halo suave (imagen guardada) para luces, pantallas y pulsos."""
    key = ("halo", col)
    if key not in _cache:
        s = skia.Surface(240, 240)
        cc = s.getCanvas()
        cc.clear(0)
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeRadial((120, 120), 120, [C(col, 1.0), C(col, 0.35), C(col, 0.0)], [0.0, 0.45, 1.0]))
        cc.drawCircle(120, 120, 120, p)
        _cache[key] = s.makeImageSnapshot()
    p = skia.Paint(AntiAlias=True)
    p.setAlphaf(clamp(a))
    c.drawImageRect(_cache[key], skia.Rect.MakeLTRB(x - r, y - r, x + r, y + r), LIN, p)


BOK = ("#F2B45A", "#FFD98A", "#6FB7C9", "#F28A5A")


def bokeh(c, x, seed=1, n=12, y0=480, y1=1500, f=0.5, amp=1.0):
    r = random.Random(seed)
    for _ in range(n):
        bx, by = r.uniform(-120, W + 120), r.uniform(y0, y1)
        rad, col, a, ph = r.uniform(26, 70), r.choice(BOK), r.uniform(0.10, 0.34), r.uniform(0, 6.28)
        a *= (0.7 + 0.3 * math.sin(x.T * 1.3 + ph)) * amp
        destello(c, bx + math.sin(x.T * 0.25 + ph) * 18 - x.px * f, by - x.py * f, rad, col, a)


def parpadeo(T):
    return 0.75 + 0.25 * (1 if math.sin(T * 37) + math.sin(T * 23.1) > -0.6 else 0.2)


def pulso_rojo(c, a):
    if a > 0:
        c.drawRect(skia.Rect.MakeXYWH(-600, -600, W + 1200, H + 1200), P("#FF1A1A", a))


def fondo(c, top, bottom):
    vgrad(c, -700, -700, W + 1400, H + 1400, C(top), C(bottom))


def toc(c, xx, yy, age, col, rot):
    if age < 0:
        return
    k = 1 + 0.6 * max(0.0, 1 - age * 6)
    a = 1.0 if age < 0.9 else max(0.4, 1 - (age - 0.9))
    c.save()
    c.translate(xx, yy)
    c.rotate(rot)
    c.scale(k, k)
    text(c, "TOC", 0, 0, "mano", 104, P("#000000", 0.6 * a, blur=6), "c")
    text(c, "TOC", 0, -4, "mano", 104, P(col, a), "c")
    c.restore()


def tarjeta(c, xx, yy, titulo, sub, k):
    k = ease(k)
    if k <= 0:
        return
    c.save()
    c.translate(xx - (1 - k) * 620, yy)
    rr(c, 0, 0, 540, 136, 14, P("#0D1418", 0.92))
    c.drawRect(skia.Rect.MakeXYWH(0, 0, 12, 136), P("#F2C230"))
    text(c, titulo, 36, 62, "ui", 54, P("#FFFFFF"))
    text(c, sub, 36, 108, "uir", 32, P("#C9D2D6"))
    c.restore()


# ------------------------------------------------------------------ Sofi
SK, SKD = "#B9784F", "#96603D"
PELO, HOOD, HOODD, PANT = "#17141A", "#E0A526", "#B98318", "#3C4658"
INK = "#241816"


def sofi(c, x, y, s=1.0, vista="frente", look=(0.0, 0.0), expr="neutral", blink=0.0, lids=0.0, walk=None, T=0.0,
         phone=False, glow=0.0, sweat=False, piernas=True):
    n = c.save()
    c.translate(x, y)
    c.scale(s, s)
    ph = walk
    bob = math.sin(T * 2.2) * 4 if ph is None else -abs(math.sin(ph)) * 12
    la = math.sin(ph) * 24 if ph is not None else 0.0
    if expr == "risa":
        bob = -abs(math.sin(T * 11)) * 14
    if piernas:
        for sx, ang in ((-1, la), (1, -la)):
            c.save()
            c.translate(sx * 62, 470)
            c.rotate(ang)
            rr(c, -52, 0, 104, 290, 40, P(PANT))
            rr(c, -64, 262, 128, 64, 28, P("#E8E4DA"))
            c.restore()
    c.translate(0, bob)

    def brazo(sx, ang):
        c.save()
        c.translate(sx * 152, 205)
        c.rotate(ang)
        rr(c, -46, -10, 92, 270, 46, P(HOODD))
        circ(c, 0, 268, 44, P(SK))
        c.restore()

    aa = -la * 0.8
    brazo(-1, 7 + aa)
    if not (phone and vista == "frente"):
        brazo(1, -7 - aa)
    rr(c, -46, 100, 92, 90, 22, P(SKD))
    rr(c, -172, 150, 344, 352, 92, P(HOOD))
    if vista == "frente":
        rr(c, -72, 334, 144, 92, 30, P(HOODD))
        line(c, -30, 172, -36, 262, P("#F4EFE2", stroke=6))
        line(c, 30, 172, 36, 262, P("#F4EFE2", stroke=6))
        rr(c, -166, -152, 332, 312, 122, P(PELO))
        head = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-150, -130, 300, 268), 96, 96)
        c.drawRRect(head, P(SK))
        c.save()
        c.clipRRect(head, True)
        oval(c, 0, -176, 230, 112, P(PELO))
        c.restore()
        circ(c, -106, 68, 22, P("#D9705E", 0.3))
        circ(c, 106, 68, 22, P("#D9705E", 0.3))
        scared = expr in ("miedo", "panico")
        R = 58 if not scared else 66
        for sx in (-1, 1):
            ex, ey = sx * 70, 6
            if expr == "risa":
                c.drawArc(skia.Rect.MakeLTRB(ex - 44, ey - 22, ex + 44, ey + 44), 200, 140, False, P(INK, stroke=10))
                continue
            circ(c, ex, ey, R, P("#FFFFFF"))
            pr = 25 if not scared else (13 if expr == "panico" else 19)
            px, py = ex + look[0] * (R - pr - 8), ey + look[1] * (R - pr - 8)
            circ(c, px, py, pr, P(INK))
            circ(c, px - pr * 0.35, py - pr * 0.35, pr * 0.3, P("#FFFFFF"))
            lid = max(lids, 1.0 if blink > 0.5 else 0.0)
            if lid > 0:
                c.save()
                pa = skia.Path()
                pa.addCircle(ex, ey, R + 3)
                c.clipPath(pa, True)
                hh = (2 * R + 8) * lid
                c.drawRect(skia.Rect.MakeLTRB(ex - R - 6, ey - R - 6, ex + R + 6, ey - R - 4 + hh), P(SK))
                line(c, ex - R, ey - R - 4 + hh, ex + R, ey - R - 4 + hh, P(INK, stroke=8))
                c.restore()
            circ(c, ex, ey, R, P(INK, stroke=7))
        if expr != "risa":
            up = 24 if scared else 0
            for sx in (-1, 1):
                line(c, sx * 112, -70 + (8 if scared else 0), sx * 36, -70 - up, P(PELO, stroke=13))
        if expr == "neutral":
            c.drawArc(skia.Rect.MakeLTRB(-30, 66, 30, 108), 20, 140, False, P(INK, stroke=8))
        elif expr == "seria":
            line(c, -24, 100, 24, 100, P(INK, stroke=8))
        elif expr == "risa":
            pa = skia.Path()
            pa.moveTo(-58, 72)
            pa.lineTo(58, 72)
            pa.cubicTo(52, 134, -52, 134, -58, 72)
            c.drawPath(pa, P("#5B1A1E"))
            c.save()
            c.clipPath(pa, True)
            c.drawRect(skia.Rect.MakeLTRB(-58, 72, 58, 86), P("#FFFFFF"))
            oval(c, 0, 128, 34, 20, P("#E7798A"))
            c.restore()
        elif expr == "miedo":
            oval(c, 0, 102, 20, 24, P("#5B1A1E"))
        elif expr == "panico":
            oval(c, 0, 104, 26, 34, P("#5B1A1E"))
        if glow > 0:
            c.drawRRect(head, P("#BFE6FF", 0.20 * glow))
        if sweat:
            gotas(c, 150, -30, 90, T, n=1, speed=0.7, r=9)
        if phone:
            rr(c, 84, 250, 92, 190, 46, P(HOODD))
            rr(c, 18, 208, 124, 196, 18, P("#0B0D10"))
            rr(c, 26, 216, 108, 180, 12, P("#BFE6FF", 0.55 + 0.4 * glow))
            circ(c, 128, 400, 44, P(SK))
    else:
        rr(c, -124, 124, 248, 176, 84, P(HOODD))
        rr(c, -160, -152, 320, 304, 114, P(PELO))
        c.drawArc(skia.Rect.MakeLTRB(-110, -120, 110, 60), 205, 60, False, P("#3A3340", stroke=10))
    c.restoreToCount(n)


# ------------------------------------------------------------------ chat del grupo
MSG = [
    ("Admin Torre Norte", "#F2C230", "Bienvenida al 7B, Sofi."),
    ("Marta 3A", "#7FD9A8", "¡Bienvenida, vecina!"),
    ("Don Hugo 5C", "#E58A7A", "Cualquier cosa, avisa."),
    ("Admin Torre Norte", "#F2C230", "Regla del edificio: después de las 12, nadie usa las escaleras."),
    ("Número desconocido", "#A9B6BC", "Ya subió."),
    ("Marta 3A", "#7FD9A8", "¿Quién?"),
    ("Número desconocido", "#A9B6BC", "Va por el 5."),
    ("Número desconocido", "#A9B6BC", "Por el 6."),
    ("Número desconocido", "#A9B6BC", "Está en el 7."),
    ("Número desconocido", "#A9B6BC", "Sofi, abre. Soy el administrador."),
    ("Admin Torre Norte", "#F2C230", "Yo estoy en el piso 1. NO ABRAS."),
    ("sys", "", "Marta 3A salió del grupo"),
    ("sys", "", "Don Hugo 5C salió del grupo"),
    ("sys", "", "Admin Torre Norte salió del grupo"),
    ("sys", "", "Número desconocido salió del grupo"),
    ("7B", "#FF4A3C", "Ya estoy adentro."),
]


def telefono(c, xx, yy, w, h):
    rr(c, xx + 12, yy + 18, w, h, 60, P("#000000", 0.5))
    rr(c, xx, yy, w, h, 60, P("#0B0D10"))
    rr(c, xx + 16, yy + 16, w - 32, h - 32, 46, P("#0F161A"))
    rr(c, xx + w / 2 - 70, yy + 30, 140, 28, 14, P("#0B0D10"))


def alto_msg(m):
    if m[0] == "sys":
        return 70
    return 62 + len(wrap(m[2], "uir", 46, 640)) * 58 + 26


def burbuja(c, idx, y, k):
    m = MSG[idx]
    h = alto_msg(m)
    c.save()
    c.translate(120, y + h)
    c.scale(0.86 + 0.14 * k, 0.86 + 0.14 * k)
    c.translate(-120, -(y + h))
    if m[0] == "sys":
        w = font("uir", 30).measureText(m[2]) + 60
        rr(c, 540 - w / 2, y + 8, w, 54, 27, P("#1B262D", k))
        text(c, m[2], 540, y + 46, "uir", 30, P("#A9B6BC", k), "c")
    else:
        lines = wrap(m[2], "uir", 46, 640)
        f = font("uir", 46)
        w = max([f.measureText(ln) for ln in lines] + [font("ui", 30).measureText(m[0])]) + 70
        dang = idx in PELIGRO
        rr(c, 120, y, w, h, 30, P("#3A1D20" if dang else "#25313A", k))
        if dang:
            rr(c, 120, y, w, h, 30, P("#FF4A3C", 0.9 * k, stroke=4))
        text(c, m[0], 152, y + 46, "ui", 30, P(m[1], k))
        for j, ln in enumerate(lines):
            text(c, ln, 152, y + 46 + 58 * (j + 1), "uir", 46, P("#FFFFFF", k))
    c.restore()


def s_chat(c, x):
    a = x.a
    vis = [(idx, 1.0) for idx in a.get("base", [])]
    nsys = 0
    for t0, idx in adds_de(x.i):
        k = (x.tl - t0) / 0.2
        if k > 0:
            vis.append((idx, ease(k)))
            nsys += 1 if 11 <= idx <= 14 else 0
    fondo(c, "#0E1B21", "#05090B")
    bokeh(c, x, seed=3, n=9, f=0.3)
    vib = a.get("vib") and x.tl < 0.5
    if vib:
        c.translate(math.sin(x.T * 95) * 8, 0)
    telefono(c, 70, 500, 940, 1560)
    c.drawRect(skia.Rect.MakeXYWH(86, 560, 908, 150), P("#17222A"))
    circ(c, 176, 636, 46, P("#2F7D5B"))
    text(c, "TN", 176, 652, "ui", 40, P("#FFFFFF"), "c")
    text(c, "Vecinos Torre Norte", 246, 628, "ui", 44, P("#FFFFFF"))
    part = a.get("part", "14 participantes")
    if a.get("cuenta"):
        part = "{} participantes".format(14 - 3 * nsys)
    text(c, part, 246, 674, "uir", 30, P("#FF8A7A" if (a.get("cuenta") and nsys) or "2 " in part else "#7FD9A8"))
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(86, 712, 908, 1010), True)
    y = 1700
    for idx, k in reversed(vis):
        y -= (alto_msg(MSG[idx]) + 20) * k
        burbuja(c, idx, y, k)
    c.restore()
    rr(c, 120, 1750, 840, 86, 43, P("#17222A"))
    text(c, "Mensaje", 170, 1806, "uir", 34, P("#6F7D85"))
    if a.get("panel"):
        k = ease((x.tl - x.wt(a["panel"]) + 0.15) / 0.3)
        if k > 0:
            c.save()
            c.translate(0, (1 - k) * 700)
            rr(c, 110, 1020, 860, 600, 34, P("#131C22"))
            rr(c, 110, 1020, 860, 600, 34, P("#2A3A44", stroke=4))
            text(c, "Participantes (2)", 160, 1110, "ui", 48, P("#FFFFFF"))
            circ(c, 210, 1240, 52, P("#E0A526"))
            text(c, "Tú", 300, 1258, "ui", 52, P("#FFFFFF"))
            hot = ease((x.tl - x.wt("siete") + 0.1) / 0.25)
            rr(c, 140, 1340, 800, 210, 26, P("#3A1D20", 0.4 + 0.6 * hot))
            rr(c, 140, 1340, 800, 210, 26, P("#FF4A3C", hot, stroke=6))
            circ(c, 210, 1444, 52, P("#0B0D10"))
            circ(c, 190, 1436, 9, P("#FFFFFF"))
            circ(c, 230, 1436, 9, P("#FFFFFF"))
            text(c, "7B", 300, 1440, "ui", 64, P("#FF4A3C"))
            text(c, "contacto sin agregar", 300, 1496, "uir", 34, P("#A9B6BC"))
            c.restore()
    if a.get("rojo"):
        pulso_rojo(c, 0.10 + 0.08 * math.sin(x.T * 9))


# ------------------------------------------------------------------ escenas
_rb = random.Random(9)
LEJOS = []
_x = -700
while _x < W + 700:
    bw, bh = _rb.randint(160, 300), _rb.randint(500, 1500)
    LEJOS.append((_x, bw, bh, [_rb.random() < 0.13 for _ in range(90)]))
    _x += bw + 10
LUCES_TORRE = [[_rb.random() < 0.28 for _ in range(4)] for _ in range(9)]


def s_fachada(c, x):
    k = ease(clamp((x.T - CUTS[x.i]) / 1.25))
    c.translate(540, 960)
    c.rotate((1 - k) * -17)
    zz = 0.78 + 0.22 * k
    c.scale(zz, zz)
    c.translate(-540, -960 + (1 - k) * 1650)
    vgrad(c, -1200, -2700, 3500, 4300, C("#040915"), C("#1B2E4D"))
    circ(c, 880, -1500, 70, P("#E9E6D0"))
    circ(c, 908, -1518, 64, P("#070E1E"))
    for (bx, bw, bh, wins) in LEJOS:
        c.drawRect(skia.Rect.MakeXYWH(bx, 1500 - bh, bw, bh), P("#0B1424"))
        j = 0
        for wy in range(int(1500 - bh + 50), 1430, 120):
            for wx in range(int(bx + 26), int(bx + bw - 50), 70):
                if wins[j % 90]:
                    c.drawRect(skia.Rect.MakeXYWH(wx, wy, 36, 56), P("#F2C870", 0.75))
                j += 1
    c.drawRect(skia.Rect.MakeXYWH(190, -700, 700, 2200), P("#111D2E"))
    c.drawRect(skia.Rect.MakeXYWH(190, -700, 16, 2200), P("#1D2D44"))
    c.drawRect(skia.Rect.MakeXYWH(180, -730, 720, 36), P("#0B1322"))
    line(c, 540, -730, 540, -900, P("#0B1322", stroke=10))
    circ(c, 540, -900, 10, P("#FF4A3C", 0.5 + 0.5 * (x.T % 1.0 < 0.5)))
    for fl in range(9):
        fy = 1500 - 290 - fl * 235
        for col in range(4):
            wx = 250 + col * 158
            es7b = fl == 6 and col == 2
            lit = LUCES_TORRE[fl][col] or es7b
            c.drawRect(skia.Rect.MakeXYWH(wx, fy, 108, 150), P("#FFD98A" if es7b else ("#D9A857" if lit else "#16233A"), 1.0 if es7b else 0.8))
            if es7b:
                destello(c, wx + 54, fy + 75, 190, "#FFD98A", 0.55)
                circ(c, wx + 54, fy + 96, 22, P("#17141A"))
                rr(c, wx + 26, fy + 110, 56, 40, 14, P("#17141A"))
                kk = ease((x.tl - x.wt("silenciar") + 0.1) / 0.25)
                if kk > 0:
                    line(c, wx + 120, fy + 60, wx + 190, fy - 10, P("#FFD98A", kk, stroke=8))
                    text(c, "7B", wx + 200, fy + 30, "ui", 200 * (0.7 + 0.3 * bounce(kk)), P("#FFD98A", kk))
    rr(c, 390, 1320, 300, 76, 10, P("#0B1322"))
    text(c, "TORRE NORTE", 540, 1374, "ui", 38, P("#F2B45A"), "c")
    c.drawRect(skia.Rect.MakeXYWH(470, 1400, 140, 100), P("#F2C870", 0.8))
    c.drawRect(skia.Rect.MakeXYWH(-1200, 1500, 3500, 120), P("#2A2F36"))
    c.drawRect(skia.Rect.MakeXYWH(-1200, 1620, 3500, 800), P("#14161A"))
    line(c, 80, 1500, 80, 880, P("#05070B", stroke=14))
    line(c, 80, 880, 180, 880, P("#05070B", stroke=14))
    cono(c, 180, 890, 1520, 16, 240, 0.4)
    circ(c, 180, 892, 14, P("#FFE9B0"))
    bokeh(c, x, seed=11, n=10, y0=-400, y1=1300, f=0.0)


def s_escaleras(c, x):
    piso = x.a.get("piso", 5)
    fondo(c, "#14272E", "#0A1418")
    for j in range(-2, 4):
        y = 1500 - j * 640
        text(c, str(piso + j), 190, y - 250, "ui", 300, P("#1D3A44"), "c")
        c.drawRect(skia.Rect.MakeXYWH(-700, y, 1130, 34), P("#253A42"))
        c.drawRect(skia.Rect.MakeXYWH(990, y - 320, 800, 34), P("#253A42"))
        for st in range(8):
            c.drawRect(skia.Rect.MakeXYWH(430 + st * 70, y - (st + 1) * 40, 660 - st * 70, 40), P("#1B2C33"))
            c.drawRect(skia.Rect.MakeXYWH(430 + st * 70, y - (st + 1) * 40, 70, 8), P("#2F4750"))
        for st in range(8):
            c.drawRect(skia.Rect.MakeXYWH(430, y - 320 - (st + 1) * 40, 560 - st * 70, 40), P("#16252B"))
        line(c, 430, y - 110, 990, y - 430, P("#3A525B", stroke=10))
        circ(c, 60, y - 470, 18, P("#FFE2A0", parpadeo(x.T + j)))
        cono(c, 60, y - 460, y, 14, 260, 0.26 * parpadeo(x.T + j))
    q = x.p
    sx, sy = lerp(300, 930, q), lerp(1500, 1210, q)
    n = c.save()
    c.translate(sx, sy)
    c.skew(-0.35, 0)
    paso = math.sin(x.T * 7)
    poly(c, [(-70, -330), (70, -330), (120, 0), (-120, 0)], P("#020304", 0.78))
    rr(c, -64, -470, 128, 160, 60, P("#020304", 0.78))
    oval(c, 0, -470, 120, 22, P("#020304", 0.78))
    rr(c, -76, -590, 152, 130, 26, P("#020304", 0.78))
    line(c, -70, -300, -150 - 20 * paso, -60, P("#020304", 0.78, stroke=34))
    line(c, 70, -300, 150 + 20 * paso, -60, P("#020304", 0.78, stroke=34))
    c.restoreToCount(n)
    bokeh(c, x, seed=5, n=5, f=0.2, amp=0.6)


def fondo_puerta(c, x, shake=0.0, pies=0.0, peep=1.0, cerrado=0.0):
    fondo(c, "#10222A", "#060C0F")
    c.drawRect(skia.Rect.MakeXYWH(-700, 1730, W + 1400, 1200), P("#12181B"))
    luz = parpadeo(x.T * 0.4)
    poly(c, [(250, 1730), (830, 1730), (1010, 2300), (70, 2300)], P("#F2B45A", 0.13 * luz))
    if pies > 0:
        for fx in (400, 600):
            poly(c, [(fx, 1730), (fx + 80, 1730), (fx + 110, 2300), (fx - 30, 2300)], P("#05090B", 0.85 * pies))
    c.save()
    c.translate(shake, 0)
    rr(c, 210, 530, 660, 1210, 8, P("#0B1418"))
    rr(c, 240, 560, 600, 1160, 4, P("#2B3D44"))
    rr(c, 300, 650, 480, 400, 10, P("#24343A"))
    rr(c, 300, 1130, 480, 480, 10, P("#24343A"))
    circ(c, 540, 860, 24, P("#C9A54A"))
    circ(c, 540, 860, 14, P("#07090A"))
    circ(c, 540, 860, 8, P("#F2B45A", peep))
    rr(c, 730, 1010, 70, 40, 8, P("#8E979E"))
    for k in range(5):
        circ(c, 715 - k * 22, 1034 + 10 * math.sin(k * 1.3 + x.T * 2), 9, P("#8E979E", stroke=5))
    rr(c, 730, 1130, 70, 96, 12, P("#59646B"))
    circ(c, 765, 1178, 22, P("#FF4A3C" if cerrado > 0.5 else "#C9CED2"))
    circ(c, 765, 1300, 30, P("#C9A54A"))
    c.restore()
    c.drawRect(skia.Rect.MakeXYWH(240, 1718, 600, 12), P("#FFD98A", luz))
    destello(c, 540, 1724, 330, "#F2B45A", 0.28 * luz)
    if pies > 0:
        for fx in (400, 600):
            c.drawRect(skia.Rect.MakeXYWH(fx, 1716, 80, 16), P("#05090B", pies))


def s_puerta(c, x):
    tk = golpes_de(x.i)
    push = max([math.exp(-(x.tl - t) * 8) for t in tk if x.tl >= t] + [0.0])
    sh = push * 16 * math.sin(x.T * 80)
    peep = 1.0
    if x.a.get("apaga") and tk:
        peep = 1 - ease((x.tl - tk[0]) / 0.15)
    c.translate(0, push * 6 * math.sin(x.T * 60))
    fondo_puerta(c, x, shake=sh, pies=ease((x.tl + 0.3) / 0.5) if x.a.get("pies") else 0.0, peep=peep)
    for k, (t, pos) in enumerate(zip(tk, ((360, 940), (700, 1110), (400, 1330)))):
        toc(c, pos[0], pos[1], x.tl - t, "#FF4A3C", -12 + k * 10)
    pulso_rojo(c, 0.16 * push)
    bokeh(c, x, seed=8, n=4, f=0.2, amp=0.4)


def s_espalda(c, x):
    ts = x.wt("seguro")
    lock = ease((x.tl - ts) / 0.15)
    fondo_puerta(c, x, pies=1 - ease((x.tl - x.wt("golpes")) / 0.6), cerrado=lock)
    if 0 < x.tl - ts < 0.9:
        text(c, "CLIC", 880, 1150 - 40 * (x.tl - ts), "mano", 70, P("#FFE08A", clamp(2 - (x.tl - ts) * 2.2)))
    back = ease(x.p)
    reach = ease((x.tl - ts + 0.5) / 0.4) * (1 - ease((x.tl - ts - 0.2) / 0.5))
    n = c.save()
    c.translate(640 - reach * 40, 1210)
    c.rotate(-150)
    rr(c, -46, 0, 92, 330, 46, P(HOODD))
    c.restoreToCount(n)
    sofi(c, 500, 1330 + back * 130, 1.35 + 0.12 * back, vista="espalda", T=x.T * 2, piernas=False)
    c.drawRect(skia.Rect.MakeXYWH(-700, -700, W + 1400, H + 1400), P("#000000", 0.12))


def caja(c, bx, by, bw, bh, label):
    rr(c, bx, by, bw, bh, 8, P("#B98A55"))
    c.drawRect(skia.Rect.MakeXYWH(bx + bw / 2 - 22, by, 44, bh), P("#D9B98A"))
    c.drawRect(skia.Rect.MakeXYWH(bx, by, bw, 14), P("#A2763F"))
    text(c, label, bx + bw / 2, by + bh / 2 + 12, "ui", 30, P("#5B4326"), "c")


def s_sala(c, x):
    fondo(c, "#183540", "#0E1F26")
    c.save()
    c.translate(-x.px * 0.5, 0)
    rr(c, 590, 560, 400, 540, 8, P("#0B1418"))
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(606, 576, 368, 508), True)
    vgrad(c, 606, 576, 368, 508, C("#081228"), C("#1B2E4D"))
    for k in range(22):
        r = random.Random(k + 70)
        c.drawRect(skia.Rect.MakeXYWH(606 + r.randint(0, 340), 760 + r.randint(0, 300), 22, 32), P("#F2C870", 0.7))
    bokeh(c, x, seed=21, n=7, y0=600, y1=1050, f=0.7)
    c.restore()
    line(c, 790, 576, 790, 1084, P("#0B1418", stroke=12))
    c.restore()
    c.drawRect(skia.Rect.MakeXYWH(-700, 1560, W + 1400, 1200), P("#231913"))
    for k in range(-3, 10):
        line(c, k * 190, 1560, k * 190 - 120, 2400, P("#18110C", 0.7, stroke=5))
    line(c, 150, 1560, 150, 760, P("#0B0D10", stroke=12))
    poly(c, [(90, 760), (210, 760), (250, 640), (50, 640)], P("#E8D9B0"))
    cono(c, 150, 760, 1580, 60, 330, 0.34)
    caja(c, 640, 1330, 320, 240, "COCINA")
    caja(c, 690, 1110, 260, 220, "LIBROS")
    caja(c, 60, 1400, 240, 170, "FRÁGIL")
    k = ease(clamp((x.tl + 0.2) / 2.2))
    if k < 1:
        sofi(c, lerp(230, 430, k), lerp(1010, 800, k), lerp(1.2, 0.84, k), vista="espalda", walk=x.T * 9, T=x.T)
    else:
        sofi(c, 430, 800, 0.84, look=(0.2, 0.7), expr="neutral", blink=blink_at(x.T), T=x.T, phone=True, glow=0.8)
        if (x.T % 1.3) < 0.5:
            for j in range(2):
                c.drawArc(skia.Rect.MakeLTRB(470 + j * 26, 930, 560 + j * 26, 1040), -50, 100, False, P("#BFE6FF", 0.7, stroke=7))
    tarjeta(c, 60, 1660, "Sofi", "23 años · apto 7B", (x.tl - 0.2) / 0.45)


def s_cara(c, x):
    a = x.a
    modo = a.get("modo", "panico")
    fondo(c, "#183540", "#0A151A")
    bokeh(c, x, seed=31, n=12, f=0.6)
    if modo == "risa":
        tm = x.wt(a.get("mute", "Silencia"))
        riendo = x.tl < tm - 0.15
        lids = ease((x.tl - x.wt(a.get("duerme", "duerme")) + 0.1) / 0.5) if a.get("duerme") else 0.0
        sofi(c, 540, 1060, 1.9, look=(0.0, 0.0 if riendo else 0.6), expr="risa" if riendo else "neutral",
             blink=blink_at(x.T), lids=lids, T=x.T, piernas=False)
        k = bounce((x.tl - tm + 0.05) / 0.35)
        if x.tl > tm - 0.05:
            n = c.save()
            c.translate(840, 760)
            c.scale(k, k)
            circ(c, 0, 0, 96, P("#0D1418", 0.95))
            circ(c, 0, 0, 96, P("#FF4A3C", stroke=8))
            pa = skia.Path()
            pa.moveTo(0, -46)
            pa.cubicTo(44, -40, 34, 14, 50, 30)
            pa.lineTo(-50, 30)
            pa.cubicTo(-34, 14, -44, -40, 0, -46)
            c.drawPath(pa, P("#FFFFFF"))
            circ(c, 0, 44, 12, P("#FFFFFF"))
            line(c, -58, -58, 58, 58, P("#FF4A3C", stroke=12))
            c.restoreToCount(n)
        c.drawRect(skia.Rect.MakeXYWH(-700, -700, W + 1400, H + 1400), P("#000000", 0.55 * lids))
    else:
        destello(c, 540, 1500, 700, "#BFE6FF", 0.25)
        sofi(c, 540 + math.sin(x.T * 44) * 4, 1060, 1.9, look=(0.0, 0.35), expr="panico", T=x.T, glow=1.0, sweat=True, piernas=False)
        if a.get("rojo"):
            pulso_rojo(c, 0.10 + 0.10 * abs(math.sin(x.T * 5)))


def s_cama(c, x):
    modo = x.a.get("modo", "duerme")
    fondo(c, "#0D1B21", "#060C0F")
    cono(c, 860, 480, 1500, 60, 300, 0.12, "#9FC4E8")
    bokeh(c, x, seed=41, n=5, f=0.5, amp=0.5)
    c.drawRect(skia.Rect.MakeXYWH(-700, 1500, W + 1400, 1200), P("#0A1114"))
    rr(c, 40, 880, 190, 640, 30, P("#3A2A22"))
    rr(c, 840, 1250, 220, 270, 12, P("#2A1D17"))
    on = ease((x.tl - x.wt("pantalla") + 0.1) / 0.15) if modo == "duerme" else 0.0
    rr(c, 890, 1226, 120, 26, 8, P("#0B0D10"))
    if on > 0:
        rr(c, 894, 1228, 112, 20, 6, P("#BFE6FF", on))
        cono(c, 950, 700, 1230, 260, 40, 0.30 * on, "#BFE6FF")
        destello(c, 950, 1230, 260, "#BFE6FF", 0.5 * on)
    rr(c, 90, 1250, 760, 250, 44, P("#D9D2C4"))
    rr(c, 120, 1150, 310, 140, 64, P("#F1ECE0"))
    if modo == "duerme":
        sofi(c, 290, 1130, 0.62, lids=1.0, expr="seria", T=x.T * 0.5, glow=on, piernas=False)
        rr(c, 180, 1230, 690, 290, 60, P("#2E5E6E"))
        line(c, 220, 1290, 820, 1290, P("#3F7486", stroke=10))
        for k in range(3):
            ph = (x.T * 0.5 + k / 3) % 1
            text(c, "z", 430 + k * 44 + ph * 30, 1080 - k * 54 - ph * 40, "mano", 44 + k * 12, P("#BFE6FF", 0.7 * (1 - ph) * (1 - on)))
    else:
        tk = x.wt("Ella")
        lk = (0.0, 0.5) if x.tl < tk else (0.8 * ease((x.tl - tk) / 0.25), -0.1)
        sofi(c, 430 + math.sin(x.T * 40) * 2, 930, 0.86, look=lk, expr="miedo", T=x.T, phone=True, glow=1.0, sweat=True, piernas=False)
        rr(c, 180, 1300, 690, 220, 60, P("#2E5E6E"))
        line(c, 220, 1350, 820, 1350, P("#3F7486", stroke=10))
        destello(c, 520, 1150, 420, "#BFE6FF", 0.22)


def s_mirilla(c, x):
    c.drawRect(skia.Rect.MakeXYWH(-700, -700, W + 1400, H + 1400), P("#030506"))
    cx, cy, R = 540, 1120, 440
    n = c.save()
    pa = skia.Path()
    pa.addCircle(cx, cy, R)
    c.clipPath(pa, True)
    c.drawRect(skia.Rect.MakeXYWH(0, 600, W, 1100), P("#0A1418"))
    poly(c, [(100, 680), (980, 680), (640, 1020), (440, 1020)], P("#0E181C"))
    poly(c, [(100, 680), (440, 1020), (440, 1240), (100, 1560)], P("#18303A"))
    poly(c, [(980, 680), (640, 1020), (640, 1240), (980, 1560)], P("#142A32"))
    poly(c, [(100, 1560), (980, 1560), (640, 1240), (440, 1240)], P("#2B1518"))
    for side in (0, 1):
        for (f1, f2) in ((0.12, 0.42), (0.6, 0.82)):
            pts = []
            for f, top in ((f1, True), (f2, True), (f2, False), (f1, False)):
                wx = 100 + 340 * f
                wtop, wbot = 680 + 340 * f, 1560 - 320 * f
                pts.append((wx if side == 0 else W - wx, lerp(wtop, wbot, 0.2) if top else wbot))
            poly(c, pts, P("#0A1215"))
    c.drawRect(skia.Rect.MakeXYWH(440, 1020, 200, 220), P("#101D22"))
    fl = parpadeo(x.T * 0.7)
    c.drawRect(skia.Rect.MakeXYWH(490, 1050, 100, 190), P("#F2B45A", 0.9 * fl))
    destello(c, 540, 1150, 260, "#F2B45A", 0.5 * fl)
    sh = ease((x.tl - x.wt("encendida") + 0.5) / 0.6)
    if sh > 0:
        rr(c, 512, 1090 + (1 - sh) * 60, 56, 150, 24, P("#020304", sh))
        oval(c, 540, 1092 + (1 - sh) * 60, 44, 10, P("#020304", sh))
    poly(c, [(300, 1560), (780, 1560), (600, 1240), (480, 1240)], P("#F2B45A", 0.08 * fl))
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeRadial((cx, cy), R, [C("#000000", 0.0), C("#000000", 0.25), C("#000000", 0.92)], [0.0, 0.6, 1.0]))
    c.drawCircle(cx, cy, R, p)
    c.restoreToCount(n)
    circ(c, cx, cy, R + 14, P("#8A6F2C", stroke=30))
    c.drawArc(skia.Rect.MakeLTRB(cx - R - 14, cy - R - 14, cx + R + 14, cy + R + 14), 200, 50, False, P("#E8CB7A", 0.8, stroke=12))
    if blink_at(x.T, 0.6) > 0.5:
        c.drawRect(skia.Rect.MakeXYWH(-700, -700, W + 1400, H + 1400), P("#000000", 0.85))


def s_cenital(c, x):
    c.drawRect(skia.Rect.MakeXYWH(-900, -900, W + 1800, H + 1800), P("#070D10"))
    c.drawRect(skia.Rect.MakeXYWH(-900, 1700, W + 1800, 300), P("#16282E"))
    c.drawRect(skia.Rect.MakeXYWH(140, 520, 800, 1170), P("#2A2019"))
    for k in range(1, 9):
        line(c, 140, 520 + k * 130, 940, 520 + k * 130, P("#1F1712", stroke=4))
    rr(c, 180, 570, 310, 440, 18, P("#D9D2C4"))
    rr(c, 200, 590, 270, 110, 30, P("#F1ECE0"))
    rr(c, 180, 730, 310, 280, 18, P("#2E5E6E"))
    for (bx, by, bs) in ((720, 1380, 170), (760, 1220, 130), (190, 1480, 150)):
        rr(c, bx, by, bs, bs, 6, P("#B98A55"))
        c.drawRect(skia.Rect.MakeXYWH(bx + bs / 2 - 14, by, 28, bs), P("#D9B98A"))
    oval(c, 540, 1300, 220, 150, P("#3A2A22", 0.6))
    pared = P("#6B777E", stroke=22)
    line(c, 140, 520, 940, 520, pared)
    line(c, 140, 520, 140, 1690, pared)
    line(c, 940, 520, 940, 1690, pared)
    line(c, 140, 1690, 450, 1690, pared)
    line(c, 630, 1690, 940, 1690, pared)
    ko = ease((x.T - CUTS[x.i]) / 1.0)
    c.drawRect(skia.Rect.MakeXYWH(600, 532, 300, 120), P("#020304"))
    n = c.save()
    c.translate(600, 652)
    c.rotate(78 * ko)
    line(c, 0, 0, 300, 0, P("#4A3328", stroke=18))
    c.restoreToCount(n)
    kf = ease((x.T - CUTS[x.i] - 0.5) / (TOTAL - CUTS[x.i] - 0.7))
    fx, fy = lerp(760, 590, kf), lerp(600, 1080, kf)
    poly(c, [(fx - 90, fy), (fx + 90, fy), (fx + 40, fy + 260), (fx - 140, fy + 260)], P("#000000", 0.35 * ko))
    line(c, fx - 80, fy + 10, fx - 70, fy + 150 * kf + 40, P("#020304", ko, stroke=34))
    line(c, fx + 80, fy + 10, fx + 50, fy + 150 * kf + 40, P("#020304", ko, stroke=34))
    oval(c, fx, fy, 118, 58, P("#020304", ko))
    circ(c, fx, fy, 64, P("#0A0C0F", ko))
    oval(c, fx, fy, 100, 100, P("#020304", ko * 0.6, stroke=10))
    sx, sy = 540, 1290
    poly(c, [(sx - 40, sy + 60), (sx + 40, sy + 60), (sx + 190, sy + 420), (sx - 190, sy + 420)], P("#BFE6FF", 0.13))
    oval(c, sx, sy, 100, 54, P(HOOD))
    circ(c, sx, sy, 62, P(PELO))
    rr(c, sx - 28, sy + 56, 56, 84, 10, P("#0B0D10"))
    rr(c, sx - 22, sy + 62, 44, 72, 6, P("#BFE6FF", 0.9))
    km = bounce((x.tl - x.wt("ya") + 0.1) / 0.3)
    if x.tl > x.wt("ya") - 0.1:
        n = c.save()
        c.translate(sx + 90, sy + 150)
        c.scale(km, km)
        rr(c, 0, 0, 360, 130, 28, P("#3A1D20"))
        rr(c, 0, 0, 360, 130, 28, P("#FF4A3C", stroke=5))
        text(c, "7B", 26, 44, "ui", 30, P("#FF4A3C"))
        text(c, "Ya estoy adentro.", 26, 98, "uir", 40, P("#FFFFFF"))
        c.restoreToCount(n)
    pulso_rojo(c, 0.06 + 0.12 * kf * abs(math.sin(x.T * 4)))


ESCENAS = {
    "chat": s_chat, "fachada": s_fachada, "escaleras": s_escaleras, "puerta": s_puerta, "espalda": s_espalda,
    "sala": s_sala, "cara": s_cara, "cama": s_cama, "mirilla": s_mirilla, "cenital": s_cenital,
}

# ------------------------------------------------------------------ subtítulos y etiqueta


def marcas(n):
    am, ro = set(), set()
    for m in re.findall(r"\*([^*]+)\*", n):
        am.update(limpio(w) for w in m.split())
    for m in re.findall(r"_([^_]+)_", n):
        ro.update(limpio(w) for w in m.split())
    return am, ro


def chunks(words, original, am, ro):
    pos = 0
    for w in words:
        w["end"], w["col"] = False, None
        base = w["w"]
        k = original.find(base, pos)
        if k < 0:
            continue
        pre = original[k - 1] if k > 0 and original[k - 1] in "¿¡" else ""
        j = k + len(base)
        post = ""
        while j < len(original) and original[j] in ".,:;?!":
            post += original[j]
            j += 1
        w["w"] = pre + base + post
        w["end"] = any(ch in post for ch in ".?!:,")
        w["col"] = "rojo" if limpio(base) in ro else ("amarillo" if limpio(base) in am else None)
        pos = j
    out, cur, n = [], [], 0
    for w in words:
        if cur and (n + len(w["w"]) > 15 or len(cur) >= 3):
            out.append(cur)
            cur, n = [], 0
        cur.append(w)
        n += len(w["w"]) + 1
        if w["end"]:
            out.append(cur)
            cur, n = [], 0
    if cur:
        out.append(cur)
    return out


CHUNKS = []
for _w, _g, _cl in zip(WORDS, GUION, CLEAN):
    _am, _ro = marcas(_g["n"])
    CHUNKS.append(chunks(_w, _cl, _am, _ro))


def subtitulos(c, i, tl, T):
    ch = None
    cs = CHUNKS[i]
    for k, grp in enumerate(cs):
        t0 = grp[0]["t"] - 0.06
        t1 = cs[k + 1][0]["t"] - 0.06 if k + 1 < len(cs) else grp[-1]["t"] + grp[-1]["d"] + 0.4
        if t0 <= tl < t1:
            ch = grp
            break
    if not ch:
        return
    size = 96
    f = font("ui", size)
    sp = 24
    widths = [f.measureText(w["w"].upper()) for w in ch]
    total = sum(widths) + sp * (len(ch) - 1)
    if total > 980:
        size = int(size * 980 / total)
        f = font("ui", size)
        sp = sp * size / 96
        widths = [f.measureText(w["w"].upper()) for w in ch]
        total = sum(widths) + sp * (len(ch) - 1)
    xx, yy = (W - total) / 2, 350
    for w, wd in zip(ch, widths):
        age = tl - (w["t"] - 0.05)
        if age >= 0:
            s = w["w"].upper()
            k = 1 + 0.28 * max(0.0, 1 - age * 7)
            col = "#FFFFFF"
            jx = jy = 0.0
            if w["col"] == "amarillo":
                col = "#FFD21F"
                k = 1 + 0.45 * max(0.0, 1 - age * 5)
            elif w["col"] == "rojo":
                col = "#FF3B30"
                k = 1 + 0.55 * max(0.0, 1 - age * 5)
                jx, jy = math.sin(T * 70) * 5, math.cos(T * 83) * 4
            n = c.save()
            c.translate(xx + wd / 2 + jx, yy - size * 0.35 + jy)
            c.scale(k, k)
            c.translate(-wd / 2, size * 0.35)
            c.drawString(s, 0, 6, f, P("#000000", 0.55, blur=8))
            c.drawString(s, 0, 0, f, P("#05080A", stroke=max(8, size * 0.13)))
            c.drawString(s, 0, 0, f, P(col))
            c.restoreToCount(n)
        xx += wd + sp


def pildora(c, s, T):
    if not s:
        return
    red = s.startswith("*")
    s = s.lstrip("*")
    f = font("ui", 34)
    w = f.measureText(s) + 86
    rr(c, (W - w) / 2, 418, w, 62, 31, P("#0B1418", 0.92))
    if red:
        rr(c, (W - w) / 2, 418, w, 62, 31, P("#FF4A3C", 0.9, stroke=3))
    circ(c, (W - w) / 2 + 34, 449, 9, P("#FF4A3C" if red else "#57D989", 1.0 if (T % 1.2) < 0.8 else 0.3))
    c.drawString(s, (W - w) / 2 + 58, 461, f, P("#FFFFFF"))


_vig = skia.Paint(AntiAlias=True)
_vig.setShader(skia.GradientShader.MakeRadial((W / 2, H * 0.55), H * 0.72, [C("#000000", 0.0), C("#000000", 0.0), C("#000000", 0.8)], [0.0, 0.55, 1.0]))
_top = skia.Paint(AntiAlias=True)
_top.setShader(skia.GradientShader.MakeLinear([(0, 0), (0, 600)], [C("#000000", 0.78), C("#000000", 0.0)]))

# ------------------------------------------------------------------ cuadro


def indice(T):
    i = 0
    while i + 1 < len(GUION) and T >= CUTS[i + 1]:
        i += 1
    return i


def draw_shot(c, i, T):
    seg = GUION[i]
    x = types.SimpleNamespace()
    x.T, x.i = T, i
    x.tl = T - STARTS[i]
    x.end = ENDS[i]
    x.p = clamp((T - CUTS[i]) / (CUTS[i + 1] - CUTS[i]))
    x.a = seg.get("a", {})
    x.words = WORDS[i]
    x.wt = lambda sub: wt_line(i, sub)
    cam = seg.get("cam", {})
    z = lerp(*cam.get("z", [1.06, 1.12]), x.p)
    x.px = lerp(*cam.get("x", [0, 0]), x.p)
    x.py = lerp(*cam.get("y", [0, 0]), x.p)
    n = c.save()
    c.clipRect(skia.Rect.MakeXYWH(0, 0, W, H))
    c.translate(W / 2, H / 2)
    c.rotate(lerp(*cam.get("r", [0, 0]), x.p))
    c.scale(z, z)
    c.translate(-W / 2 - x.px, -H / 2 - x.py)
    ESCENAS[seg["s"]](c, x)
    c.restoreToCount(n)


def draw_frame(c, T):
    i = indice(T)
    seg = GUION[i]
    c.clear(C("#000000"))
    tr = seg.get("tr", "cut")
    k = (T - CUTS[i]) / TR
    if i > 0 and k < 1 and tr != "cut":
        e = ease(k)
        if tr == "zoom":
            n = c.save()
            c.translate(W / 2, H / 2)
            c.scale(1 + 0.4 * (1 - e), 1 + 0.4 * (1 - e))
            c.translate(-W / 2, -H / 2)
            draw_shot(c, i, T)
            c.restoreToCount(n)
            c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#000000", 0.6 * (1 - e)))
        else:
            dx, dy = (W, 0) if tr == "left" else (0, H)
            n = c.save()
            if tr == "left":
                c.translate(-e * dx, 0)
            draw_shot(c, i - 1, CUTS[i] - 0.001)
            c.restoreToCount(n)
            if tr == "up":
                c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#000000", 0.5 * e))
            n = c.save()
            c.translate((1 - e) * dx, (1 - e) * dy)
            draw_shot(c, i, T)
            c.restoreToCount(n)
    else:
        draw_shot(c, i, T)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), _vig)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, 600), _top)
    if T < 0.12:
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#FFFFFF", 0.5 * (1 - T / 0.12)))
    if T > TOTAL - 0.5:
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#000000", (T - (TOTAL - 0.5)) / 0.5))
    pildora(c, seg["pill"], T)
    subtitulos(c, i, T - STARTS[i], T)


# ------------------------------------------------------------------ pruebas
def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "hoja"
    os.makedirs(os.path.join(HERE, "test"), exist_ok=True)
    if mode == "hoja":
        cols, sc = 8, 0.22
        rows = (len(GUION) + cols - 1) // cols
        which = sys.argv[2] if len(sys.argv) > 2 else "fin"
        fr = {"fin": 0.92, "mitad": 0.5, "inicio": 0.12}[which]
        sheet = skia.Surface(int(W * sc * cols), int(H * sc * rows))
        cc = sheet.getCanvas()
        cc.clear(C("#202020"))
        for i in range(len(GUION)):
            T = STARTS[i] + ENDS[i] * fr
            n = cc.save()
            cc.translate((i % cols) * W * sc, (i // cols) * H * sc)
            cc.clipRect(skia.Rect.MakeXYWH(0, 0, W * sc, H * sc))
            cc.scale(sc, sc)
            draw_frame(cc, T)
            cc.restoreToCount(n)
        sheet.makeImageSnapshot().save(os.path.join(HERE, "test", "hoja_{}.png".format(which)), skia.kPNG)
        print("hoja lista; total={:.2f}s cuadros={}".format(TOTAL, NF))
    elif mode == "cuadro":
        s = skia.Surface(W, H)
        draw_frame(s.getCanvas(), float(sys.argv[2]))
        s.makeImageSnapshot().save(os.path.join(HERE, "test", "cuadro.png"), skia.kPNG)
        print("cuadro listo")
    elif mode == "tira":
        t0, dt = float(sys.argv[2]), float(sys.argv[3]) / 12 if len(sys.argv) > 3 else 0.25
        sc = 0.15
        sheet = skia.Surface(int(W * sc * 12), int(H * sc))
        cc = sheet.getCanvas()
        for k in range(12):
            n = cc.save()
            cc.translate(k * W * sc, 0)
            cc.clipRect(skia.Rect.MakeXYWH(0, 0, W * sc, H * sc))
            cc.scale(sc, sc)
            draw_frame(cc, t0 + k * dt)
            cc.restoreToCount(n)
        sheet.makeImageSnapshot().save(os.path.join(HERE, "test", "tira.png"), skia.kPNG)
        print("tira lista")


if __name__ == "__main__":
    main()
