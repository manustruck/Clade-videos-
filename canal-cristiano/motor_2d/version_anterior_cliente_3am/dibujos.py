"""'El cliente de las 3:00 AM' - animación 2D con skia.

Uso (python del entorno tts):
  python dibujos.py hoja              -> test/hoja.png (un cuadro por escena)
  python dibujos.py cuadro 37.5       -> test/cuadro.png (segundo 37.5 a tamaño completo)
  python dibujos.py video             -> imagen.mp4 (sin audio)
"""
import json
import math
import os
import random
import subprocess
import sys
import types

import skia

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, TOTAL = 1080, 1920, 30, 120.0
LEAD, TAIL = 0.6, 2.5

# ------------------------------------------------------------------ tiempos
with open(os.path.join(HERE, "guion.json"), encoding="utf-8") as f:
    GUION = json.load(f)
WORDS = []
for i in range(len(GUION)):
    with open(os.path.join(HERE, "voz", "{:02d}.json".format(i)), encoding="utf-8") as f:
        WORDS.append(json.load(f))
ENDS = [w[-1]["t"] + w[-1]["d"] for w in WORDS]
GAP = (TOTAL - LEAD - TAIL - sum(ENDS)) / (len(GUION) - 1)
assert GAP > 0.3, GAP
STARTS = []
_t = LEAD
for e in ENDS:
    STARTS.append(_t)
    _t += e + GAP
CUTS = [0.0] + [s - min(0.3, GAP / 2) for s in STARTS[1:]] + [TOTAL]
with open(os.path.join(HERE, "timeline.json"), "w", encoding="utf-8") as f:
    json.dump({"starts": STARTS, "ends": ENDS, "cuts": CUTS, "gap": GAP, "escenas": [g["s"] for g in GUION]}, f, indent=1)

# ------------------------------------------------------------------ utilidades de dibujo


def C(hx, a=1.0):
    hx = hx.lstrip("#")
    return skia.ColorSetARGB(int(max(0, min(1, a)) * 255), int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16))


def P(hx, a=1.0, stroke=0, blur=0):
    p = skia.Paint(AntiAlias=True, Color=C(hx, a))
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style)
        p.setStrokeWidth(stroke)
        p.setStrokeCap(skia.Paint.kRound_Cap)
        p.setStrokeJoin(skia.Paint.kRound_Join)
    if blur:
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    return p


def rr(c, x, y, w, h, r, p):
    c.drawRoundRect(skia.Rect.MakeXYWH(x, y, w, h), r, r, p)


def circ(c, x, y, r, p):
    c.drawCircle(x, y, r, p)


def oval(c, x, y, rx, ry, p):
    c.drawOval(skia.Rect.MakeLTRB(x - rx, y - ry, x + rx, y + ry), p)


def line(c, x1, y1, x2, y2, p):
    c.drawLine(x1, y1, x2, y2, p)


def poly(c, pts, p, close=True):
    pa = skia.Path()
    pa.moveTo(*pts[0])
    for q in pts[1:]:
        pa.lineTo(*q)
    if close:
        pa.close()
    c.drawPath(pa, p)


def vgrad(c, x, y, w, h, top, bottom):
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, y), (0, y + h)], [top, bottom]))
    c.drawRect(skia.Rect.MakeXYWH(x, y, w, h), p)


_fonts = {}
FILES = {
    "ui": "segoeuib.ttf", "uir": "segoeui.ttf", "mano": "segoeprb.ttf", "mono": "consolab.ttf",
}


def font(kind, size):
    k = (kind, size)
    if k not in _fonts:
        if kind not in _fonts:
            _fonts[kind] = skia.Typeface.MakeFromFile(os.path.join(r"C:\Windows\Fonts", FILES[kind]))
        _fonts[k] = skia.Font(_fonts[kind], size)
        _fonts[k].setSubpixel(True)
    return _fonts[k]


def text(c, s, x, y, kind, size, p, align="l"):
    f = font(kind, size)
    w = f.measureText(s)
    if align == "c":
        x -= w / 2
    elif align == "r":
        x -= w
    c.drawString(s, x, y, f, p)
    return w


def wrap(s, kind, size, maxw):
    f = font(kind, size)
    out, cur = [], ""
    for word in s.split(" "):
        test = (cur + " " + word).strip()
        if f.measureText(test) > maxw and cur:
            out.append(cur)
            cur = word
        else:
            cur = test
    if cur:
        out.append(cur)
    return out


def clamp(v, a=0.0, b=1.0):
    return max(a, min(b, v))


def ease(v):
    v = clamp(v)
    return v * v * (3 - 2 * v)


def bounce(v):
    v = clamp(v)
    if v < 0.6:
        return (v / 0.6) ** 2
    if v < 0.85:
        u = (v - 0.6) / 0.25
        return 1 - 0.18 * (1 - (2 * u - 1) ** 2)
    u = (v - 0.85) / 0.15
    return 1 - 0.06 * (1 - (2 * u - 1) ** 2)


def blink_at(T, seed=0.0):
    """1 cuando el ojo está cerrado."""
    ph = (T + seed) % 3.7
    return 1.0 if ph < 0.13 else 0.0


def gotas(c, x, y0, y1, T, n=3, speed=0.8, col="#9fd0e6", r=7, seed=0.0):
    for k in range(n):
        ph = (T * speed + k / n + seed) % 1.0
        y = y0 + (y1 - y0) * ph * ph
        a = 1.0 if ph < 0.9 else (1 - ph) * 10
        pa = skia.Path()
        pa.moveTo(x, y - r * 2.2)
        pa.quadTo(x + r * 1.3, y, x, y + r)
        pa.quadTo(x - r * 1.3, y, x, y - r * 2.2)
        c.drawPath(pa, P(col, 0.9 * a))
        if ph > 0.9:
            oval(c, x, y1 + 4, 26 * (ph - 0.9) * 10, 6, P(col, 0.5 * (1 - ph) * 10, stroke=3))


# ------------------------------------------------------------------ personajes
SKIN, SKIN_D = "#E9B48E", "#C98F6C"
HAIR = "#5A1F22"
INK = "#2A1B19"


def lucia(c, x, y, s=1.0, look=(0.0, 0.0), expr="neutral", blink=0.0, T=0.0, sweat=False):
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    bob = math.sin(T * 2.2) * 4
    if expr == "risa":
        bob = abs(math.sin(T * 11)) * -16
    # pelo trasero y moño
    circ(c, 0, -190 + bob, 74, P(HAIR))
    rr(c, -178, -150 + bob, 356, 360, 120, P(HAIR))
    # cuerpo
    rr(c, -48, 100, 96, 100, 24, P(SKIN_D))
    rr(c, -262, 190, 100, 330, 50, P("#D9A520"))
    rr(c, 162, 190, 100, 330, 50, P("#D9A520"))
    rr(c, -195, 160, 390, 600, 95, P("#E8B62C"))
    rr(c, -142, 235, 284, 520, 46, P("#2F7D5B"))
    line(c, -100, 240, -62, 150, P("#2F7D5B", stroke=22))
    line(c, 100, 240, 62, 150, P("#2F7D5B", stroke=22))
    rr(c, -72, 440, 144, 96, 22, P("#256649"))
    rr(c, 38, 275, 92, 46, 8, P("#F4EFE2"))
    line(c, 50, 292, 118, 292, P("#8a8a8a", stroke=5))
    line(c, 50, 306, 98, 306, P("#b0b0b0", stroke=4))
    # cabeza
    c.translate(0, bob)
    head = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-152, -138, 304, 276), 98, 98)
    c.drawRRect(head, P(SKIN))
    c.save()
    c.clipRRect(head, True)
    oval(c, -40, -190, 230, 120, P(HAIR))
    oval(c, 170, -120, 90, 150, P(HAIR))
    c.restore()
    circ(c, -108, 62, 24, P("#E58A7A", 0.35))
    circ(c, 108, 62, 24, P("#E58A7A", 0.35))
    scared = expr in ("miedo", "panico")
    R = 60 if not scared else 66
    for sx in (-1, 1):
        ex, ey = sx * 70, -2
        if expr == "risa":
            c.drawArc(skia.Rect.MakeLTRB(ex - 44, ey - 26, ex + 44, ey + 40), 200, 140, False, P(INK, stroke=10))
            continue
        circ(c, ex, ey, R, P("#FFFFFF"))
        circ(c, ex, ey, R, P(INK, stroke=7))
        pr = 26 if not scared else (15 if expr == "panico" else 19)
        px, py = ex + look[0] * (R - pr - 8), ey + look[1] * (R - pr - 8)
        circ(c, px, py, pr, P(INK))
        circ(c, px - pr * 0.35, py - pr * 0.35, pr * 0.3, P("#FFFFFF"))
        if blink > 0.5:
            circ(c, ex, ey, R + 4, P(SKIN))
            c.drawArc(skia.Rect.MakeLTRB(ex - R, ey - 20, ex + R, ey + 30), 10, 160, False, P(INK, stroke=8))
        else:
            for k, ang in enumerate((-150, -128) if sx < 0 else (-30, -52)):
                a = math.radians(ang)
                line(c, ex + math.cos(a) * R, ey + math.sin(a) * R, ex + math.cos(a) * (R + 20), ey + math.sin(a) * (R + 20),
                     P(INK, stroke=7))
    # cejas
    if expr != "risa":
        tilt = {"neutral": 0, "seria": 6, "miedo": -16, "panico": -22}.get(expr, 0)
        by = -86 if not scared else -100
        for sx in (-1, 1):
            line(c, sx * 110, by - tilt * 0.0 + (0 if tilt >= 0 else -tilt * 0.5) * 0 + (tilt if tilt > 0 else 0) * 0 + (-tilt if tilt < 0 else 0),
                 sx * 34, by + (tilt if tilt < 0 else 0) * 1.0 + (tilt if tilt > 0 else 0), P(HAIR, stroke=11))
    # boca
    if expr == "neutral":
        c.drawArc(skia.Rect.MakeLTRB(-30, 58, 30, 100), 20, 140, False, P(INK, stroke=8))
    elif expr == "seria":
        line(c, -24, 92, 24, 92, P(INK, stroke=8))
    elif expr == "risa":
        pa = skia.Path()
        pa.moveTo(-56, 64)
        pa.lineTo(56, 64)
        pa.cubicTo(52, 130, -52, 130, -56, 64)
        c.drawPath(pa, P("#5B1A1E"))
        c.save()
        c.clipPath(pa, True)
        oval(c, 0, 122, 36, 22, P("#E7798A"))
        c.drawRect(skia.Rect.MakeLTRB(-56, 64, 56, 78), P("#FFFFFF"))
        c.restore()
    elif expr == "miedo":
        oval(c, 0, 92, 20, 24, P("#5B1A1E"))
    elif expr == "panico":
        oval(c, 0, 94, 26, 34, P("#5B1A1E"))
    if sweat:
        gotas(c, 150, -70, 60, T, n=1, speed=0.7, r=9)
    c.restore()


MSKIN = "#A7B6BC"
COAT = "#14161B"


def hombre(c, x, y, s=1.0, smile=0.0, look=(0.0, 0.0), T=0.0, umbrella=True, eyes_glow=False):
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    sway = math.sin(T * 0.9) * 3
    # abrigo
    poly(c, [(-170, 230), (170, 230), (250, 1300), (-250, 1300)], P(COAT))
    rr(c, -215, 175, 430, 200, 90, P(COAT))
    rr(c, -40, 130, 80, 90, 20, P("#8696A0"))
    poly(c, [(-70, 190), (0, 330), (-150, 300)], P("#22262E"))
    poly(c, [(70, 190), (0, 330), (150, 300)], P("#22262E"))
    for k in range(4):
        circ(c, 0, 400 + k * 110, 11, P("#2D323B"))
    # paraguas cerrado
    if umbrella:
        c.drawArc(skia.Rect.MakeLTRB(196, 40, 250, 100), 180, 200, False, P("#3a2a20", stroke=12))
        line(c, 196, 70, 200, 190, P("#3a2a20", stroke=12))
        poly(c, [(176, 190), (226, 190), (212, 640)], P("#08090B"))
        line(c, 201, 190, 212, 640, P("#1c1f25", stroke=4))
        gotas(c, 212, 650, 780, T, n=3, speed=0.9)
        rr(c, 140, 215, 90, 300, 45, P(COAT))
        circ(c, 200, 215, 36, P(MSKIN))
    # cabeza
    c.translate(sway, 0)
    rr(c, -108, -150, 216, 320, 84, P(MSKIN))
    oval(c, -52, 20, 40, 22, P("#6F7F88", 0.55))
    oval(c, 52, 20, 40, 22, P("#6F7F88", 0.55))
    for sx in (-1, 1):
        ex, ey = sx * 52, -22
        if eyes_glow:
            circ(c, ex, ey, 44, P("#FFFFFF", 0.35, blur=18))
        circ(c, ex, ey, 31, P("#FFFFFF"))
        circ(c, ex, ey, 31, P("#1b1b1f", stroke=5))
        circ(c, ex + look[0] * 16, ey + look[1] * 16, 7 + 2 * (1 - smile), P("#0b0b0d"))
    # boca
    wv = 28 + 70 * smile
    dp = 6 + 74 * smile
    pa = skia.Path()
    pa.moveTo(-wv, 78 - 14 * smile)
    pa.quadTo(0, 78 + dp, wv, 78 - 14 * smile)
    pa.quadTo(0, 78 + dp * 0.25, -wv, 78 - 14 * smile)
    if smile > 0.25:
        c.drawPath(pa, P("#F2F2EC"))
        c.save()
        c.clipPath(pa, True)
        for k in range(-6, 7):
            line(c, k * 16, 40, k * 16, 180, P("#1b1b1f", stroke=3))
        c.restore()
    c.drawPath(pa, P("#1b1b1f", stroke=6))
    # sombrero
    oval(c, 0, -150, 205, 34, P("#07080A"))
    rr(c, -118, -300, 236, 160, 34, P("#0B0C0F"))
    c.drawRect(skia.Rect.MakeLTRB(-118, -182, 118, -158), P("#4A1014"))
    gotas(c, -196, -140, 120, T, n=2, speed=0.7, seed=0.3)
    gotas(c, 196, -140, 120, T, n=2, speed=0.6, seed=0.7)
    c.restore()


# ------------------------------------------------------------------ fondos
_rng = random.Random(11)
PRODUCTOS = []
for unit_x in (40, 600):
    for row in range(3):
        xx = unit_x + 14
        while xx < unit_x + 420:
            w = _rng.choice((34, 44, 56, 70))
            h = _rng.randint(70, 130)
            PRODUCTOS.append((xx, row, w, h, _rng.choice(("#B5483F", "#C9A227", "#3F7FA6", "#5E9C6B", "#8C5FA8", "#C96F2E", "#D8D2C2"))))
            xx += w + 8


def lampara(c, T, x=540, power=1.0, flick=False):
    k = power
    if flick:
        k *= 0.75 + 0.25 * (1 if math.sin(T * 37) + math.sin(T * 23.1) > -0.6 else 0.2)
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, 140), (0, 1500)], [C("#FFE2A0", 0.30 * k), C("#FFE2A0", 0.0)]))
    p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 40))
    poly(c, [(x - 90, 140), (x + 90, 140), (x + 620, 1500), (x - 620, 1500)], p)
    line(c, x, 0, x, 90, P("#0a0a0a", stroke=6))
    poly(c, [(x - 40, 90), (x + 40, 90), (x + 100, 150), (x - 100, 150)], P("#101316"))
    oval(c, x, 150, 96, 14, P("#FFE9B8", 0.9 * k))


def fondo_tienda(c, T, counter=True, flick=False, power=1.0):
    vgrad(c, 0, 0, W, H, C("#17353F"), C("#0B1B21"))
    for unit_x in (40, 600):
        rr(c, unit_x, 520, 440, 700, 10, P("#0E2228"))
        for row in range(3):
            c.drawRect(skia.Rect.MakeXYWH(unit_x, 700 + row * 200, 440, 16), P("#27444E"))
    for (xx, row, w, h, col) in PRODUCTOS:
        rr(c, xx, 700 + row * 200 - h, w, h, 6, P(col, 0.62))
        c.drawRect(skia.Rect.MakeXYWH(xx, 700 + row * 200 - h * 0.55, w, h * 0.22), P("#FFFFFF", 0.18))
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#081419", 0.35))
    lampara(c, T, flick=flick, power=power)
    if counter:
        mostrador(c, 1330)


def mostrador(c, y, register=True):
    if register:
        rr(c, 730, y - 210, 290, 220, 18, P("#2B3238"))
        rr(c, 760, y - 185, 150, 70, 8, P("#0F1A14"))
        text(c, "0.00", 890, y - 135, "mono", 44, P("#57D989"), "r")
        rr(c, 760, y - 95, 230, 70, 8, P("#3A434B"))
        for k in range(8):
            rr(c, 772 + (k % 4) * 54, y - 86 + (k // 4) * 30, 44, 22, 5, P("#59646E"))
        c.save()
        c.translate(940, y - 180)
        c.rotate(4)
        rr(c, 0, 0, 70, 84, 3, P("#F1E6CC"))
        for k in range(4):
            line(c, 10, 22 + k * 15, 58, 22 + k * 15, P("#B8322B", stroke=3))
        c.restore()
    c.drawRect(skia.Rect.MakeXYWH(0, y, W, 74), P("#8A5E3F"))
    c.drawRect(skia.Rect.MakeXYWH(0, y, W, 12), P("#A87550"))
    vgrad(c, 0, y + 74, W, H - y - 74, C("#553623"), C("#2E1C12"))
    for k in range(1, 6):
        line(c, k * 180, y + 84, k * 180, H, P("#2A190F", 0.6, stroke=5))


def calle(c, x, y, w, h, T, figure=0.0, big=False):
    """Vista nocturna de la calle dentro del rectángulo dado."""
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(x, y, w, h), True)
    vgrad(c, x, y, w, h, C("#0A1630"), C("#152744"))
    circ(c, x + w * 0.72, y + h * 0.16, 44, P("#E9E6D0"))
    circ(c, x + w * 0.72 + 18, y + h * 0.16 - 10, 40, P("#0B1731"))
    rr(c, x - 20, y + h * 0.42, w * 0.34, h, 4, P("#0C1322"))
    rr(c, x + w * 0.62, y + h * 0.50, w * 0.5, h, 4, P("#0C1322"))
    for k in range(3):
        rr(c, x + 30 + k * 60, y + h * 0.48, 30, 40, 3, P("#1B2A45"))
    c.drawRect(skia.Rect.MakeXYWH(x, y + h * 0.80, w, h * 0.2), P("#1A1E26"))
    line(c, x + w * 0.3, y + h * 0.80, x + w * 0.3, y + h * 0.34, P("#05070B", stroke=10))
    line(c, x + w * 0.3, y + h * 0.34, x + w * 0.44, y + h * 0.34, P("#05070B", stroke=10))
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(0, y + h * 0.36), (0, y + h * 0.85)], [C("#FFD98A", 0.45), C("#FFD98A", 0.0)]))
    poly(c, [(x + w * 0.42, y + h * 0.36), (x + w * 0.46, y + h * 0.36), (x + w * 0.66, y + h * 0.86), (x + w * 0.22, y + h * 0.86)], p)
    circ(c, x + w * 0.44, y + h * 0.355, 12, P("#FFE9B0"))
    if figure > 0:
        fx, fy = x + w * 0.5, y + h * (0.60 if not big else 0.50)
        sc = (0.55 if not big else 0.95) * (0.9 + 0.1 * figure)
        c.save()
        c.translate(fx, fy)
        c.scale(sc, sc)
        a = figure
        poly(c, [(-120, 60), (120, 60), (190, 900), (-190, 900)], P("#030406", a))
        rr(c, -90, -120, 180, 220, 70, P("#030406", a))
        oval(c, 0, -110, 180, 28, P("#030406", a))
        rr(c, -100, -240, 200, 140, 28, P("#030406", a))
        poly(c, [(150, 80), (190, 80), (178, 460)], P("#030406", a))
        circ(c, -38, -30, 13, P("#FFFFFF", a))
        circ(c, 38, -30, 13, P("#FFFFFF", a))
        c.restore()
    c.restore()


def campana(c, x, y, ang):
    line(c, x - 70, y - 90, x, y - 90, P("#30363C", stroke=12))
    line(c, x, y - 90, x, y - 40, P("#30363C", stroke=8))
    c.save()
    c.translate(x, y - 40)
    c.rotate(ang)
    pa = skia.Path()
    pa.moveTo(0, 0)
    pa.cubicTo(60, 10, 50, 90, 78, 120)
    pa.lineTo(-78, 120)
    pa.cubicTo(-50, 90, -60, 10, 0, 0)
    c.drawPath(pa, P("#D9A93A"))
    c.drawRect(skia.Rect.MakeLTRB(-82, 112, 82, 128), P("#B98A25"))
    circ(c, math.sin(math.radians(ang * 2)) * 20, 140, 16, P("#8A6418"))
    c.restore()


def puerta(c, T, figure=0.0, big=False, key_swing=0.0):
    vgrad(c, 0, 0, W, H, C("#152F38"), C("#0A1A20"))
    rr(c, 150, 520, 780, 1500, 14, P("#2C363D"))
    calle(c, 200, 570, 680, 1250, T, figure, big)
    c.drawRect(skia.Rect.MakeXYWH(200, 570, 680, 1250), P("#9CC7E8", 0.05))
    line(c, 260, 640, 420, 980, P("#FFFFFF", 0.06, stroke=40))
    rr(c, 820, 1150, 40, 220, 16, P("#8E979E"))
    rr(c, 880, 1180, 50, 130, 8, P("#1D2428"))
    circ(c, 905, 1215, 12, P("#0B0E10"))
    # llave puesta
    c.save()
    c.translate(905, 1215)
    line(c, 0, 0, 0, 34, P("#C9CED2", stroke=8))
    c.rotate(math.sin(T * 2.4) * 10 * (0.4 + key_swing))
    circ(c, 0, 62, 26, P("#C9CED2", stroke=9))
    line(c, 0, 88, 0, 130, P("#8A8F94", stroke=4))
    rr(c, -22, 130, 44, 60, 8, P("#B8322B"))
    c.restore()


def papel(c, x, y, w, h, rot=-2.0):
    c.save()
    c.translate(x + w / 2, y + h / 2)
    c.rotate(rot)
    c.translate(-w / 2, -h / 2)
    rr(c, 14, 20, w, h, 6, P("#000000", 0.45, blur=24))
    rr(c, 0, 0, w, h, 6, P("#F3E9D2"))
    for k in range(int(h // 92)):
        line(c, 30, 150 + k * 92, w - 30, 150 + k * 92, P("#B9C7D6", 0.55, stroke=3))
    line(c, 96, 10, 96, h - 10, P("#E0958E", 0.7, stroke=3))
    for tx in (w * 0.2, w * 0.75):
        c.save()
        c.translate(tx, -18)
        c.rotate(-6 if tx < w / 2 else 5)
        rr(c, 0, 0, 150, 52, 4, P("#E8DFA8", 0.82))
        c.restore()


REGLAS = [
    "1. A las 3:00 AM entra un cliente con paraguas. No le hables.",
    "2. Si deja propina, no la toques.",
    "3. Si vuelve a entrar, no es él.",
]


def escena_nota(c, x, upto, typing):
    """upto: número de reglas ya escritas completas; typing: (indice, fracción) o None."""
    vgrad(c, 0, 0, W, H, C("#20292E"), C("#0D1114"))
    rr(c, -40, 1560, 1200, 500, 30, P("#2B3238"))
    lampara(c, x.T, power=0.7)
    pw, ph = 900, 1130
    papel(c, 90, 520, pw, ph)
    c.translate(90 + pw / 2, 520 + ph / 2)
    c.rotate(-2)
    c.translate(-pw / 2, -ph / 2)
    text(c, "Reglas del turno de noche", pw / 2, 122, "mano", 52, P("#2B2B33"), "c")
    line(c, 150, 142, pw - 150, 142, P("#2B2B33", stroke=4))
    yy = 236
    for k, regla in enumerate(REGLAS):
        if k > upto and not (typing and typing[0] == k):
            break
        s = regla
        if typing and typing[0] == k:
            s = regla[: int(len(regla) * clamp(typing[1]))]
        lines = wrap(regla, "mano", 54, pw - 170)
        left = len(s)
        for ln in lines:
            shown = ln[: max(0, left)]
            left -= len(ln) + 1
            if shown:
                text(c, shown, 118, yy, "mano", 54, P("#C2241D"))
            yy += 92
        yy += 46
    if upto >= 2:
        text(c, "— El jefe", pw - 70, ph - 70, "mano", 46, P("#2B2B33"), "r")


def frac_typing(x, a=0.15, b=0.2):
    return clamp((x.tl - a) / max(0.5, x.end - a - b))


def s_nota1(c, x):
    escena_nota(c, x, -1, (0, frac_typing(x, 0.9)))


def s_nota0(c, x):
    escena_nota(c, x, 0, None)


def s_nota2(c, x):
    escena_nota(c, x, 0, (1, frac_typing(x, 0.9)))


def s_nota3(c, x):
    escena_nota(c, x, 1, (2, frac_typing(x, 0.9)))
    if x.tl > x.end:
        text(c, "— El jefe", 900 - 70, 1130 - 70, "mano", 46, P("#2B2B33"), "r")


def tarjeta(c, xx, yy, titulo, sub, k):
    k = ease(k)
    if k <= 0:
        return
    c.save()
    c.translate(xx - (1 - k) * 500, yy)
    rr(c, 0, 0, 470, 136, 14, P("#0D1418", 0.92))
    c.drawRect(skia.Rect.MakeXYWH(0, 0, 12, 136), P("#F2C230"))
    text(c, titulo, 36, 62, "ui", 54, P("#FFFFFF"))
    text(c, sub, 36, 108, "uir", 32, P("#C9D2D6"))
    c.restore()


def s_tienda(c, x):
    fondo_tienda(c, x.T, counter=False)
    lk = (math.sin(x.T * 0.9) * 0.6, 0.1)
    lucia(c, 430, 900, 1.0, lk, "neutral", blink_at(x.T), x.T)
    mostrador(c, 1330)
    tarjeta(c, 60, 1480, "Lucía", "24 años · primera noche sola", (x.tl - 0.3) / 0.5)


def s_risa(c, x):
    c.translate(540, 900)
    c.scale(1.3, 1.3)
    c.translate(-470, -900)
    fondo_tienda(c, x.T, counter=False)
    laughing = x.tl < x.wt("Cree") - 0.2
    lucia(c, 430, 900, 1.0, (0, 0), "risa" if laughing else "neutral", blink_at(x.T), x.T)
    mostrador(c, 1330)
    if laughing and x.tl > 0.6:
        for k, (dx, dy) in enumerate(((250, -260), (330, -180), (270, -90))):
            a = clamp((x.tl - 0.6 - k * 0.25) * 4)
            c.save()
            c.translate(430 + dx, 900 + dy - 20 * math.sin(x.T * 6 + k))
            c.rotate(-10 + k * 9)
            text(c, "ja", 0, 0, "mano", 60, P("#FFE08A", a))
            c.restore()


def s_reloj(c, x):
    vgrad(c, 0, 0, W, H, C("#0E1F2C"), C("#070E14"))
    rr(c, 110, 520, 860, 640, 12, P("#27333B"))
    calle(c, 140, 550, 800, 580, x.T)
    line(c, 540, 550, 540, 1130, P("#27333B", stroke=18))
    line(c, 140, 840, 940, 840, P("#27333B", stroke=18))
    mostrador(c, 1560, register=False)
    rr(c, 250, 1250, 580, 300, 40, P("#101316"))
    rr(c, 280, 1280, 520, 240, 24, P("#1A0606"))
    colon = ":" if (x.T % 1.0) < 0.6 else " "
    text(c, "2" + colon + "59", 540, 1462, "mono", 200, P("#FF3B2F", 0.55, blur=18), "c")
    text(c, "2" + colon + "59", 540, 1462, "mono", 200, P("#FF4A3C"), "c")
    text(c, "AM", 770, 1500, "ui", 30, P("#FF4A3C", 0.8))


def anillos(c, xx, yy, tt):
    for k in range(3):
        ph = (tt * 1.6 + k / 3) % 1
        c.drawArc(skia.Rect.MakeLTRB(xx - 90 - 160 * ph, yy - 90 - 160 * ph, xx + 90 + 160 * ph, yy + 90 + 160 * ph), 200, 140, False,
                  P("#FFE08A", 0.8 * (1 - ph), stroke=8))


def s_puerta(c, x, big):
    tb = x.wt("campana") - 0.3
    k = x.tl - tb
    ring = k > 0
    fig = ease((k - 0.5) / 1.2) if not big else ease((x.tl + 0.2) / 0.8)
    puerta(c, x.T, fig, big)
    ang = math.sin(k * 16) * 32 * math.exp(-k * 0.9) if ring else 0
    campana(c, 540, 600, ang)
    if ring and k < 2.2:
        anillos(c, 540, 660, k)
        c.save()
        c.translate(760, 560)
        c.rotate(12)
        text(c, "¡DING!", 0, 0, "mano", 76, P("#FFE08A", clamp(2.2 - k)))
        c.restore()


def s_puerta1(c, x):
    s_puerta(c, x, False)


def s_puerta2(c, x):
    s_puerta(c, x, True)


def botella(c, xx, yy):
    rr(c, xx - 44, yy - 250, 88, 250, 26, P("#9FD4EE", 0.85))
    rr(c, xx - 24, yy - 300, 48, 60, 10, P("#9FD4EE", 0.85))
    rr(c, xx - 28, yy - 322, 56, 30, 8, P("#2D6FB5"))
    c.drawRect(skia.Rect.MakeXYWH(xx - 44, yy - 170, 88, 70), P("#2D6FB5"))
    line(c, xx - 26, yy - 230, xx - 26, yy - 190, P("#FFFFFF", 0.6, stroke=7))


def s_hombre(c, x):
    vgrad(c, 0, 0, W, H, C("#132B33"), C("#081419"))
    rr(c, 60, 520, 300, 900, 8, P("#0E2228"))
    rr(c, 720, 520, 300, 900, 8, P("#0E2228"))
    lampara(c, x.T, flick=True, power=0.9)
    enter = ease((x.tl + 0.3) / 0.9)
    hombre(c, 540, 860 + (1 - enter) * 60, 1.0, 0.0, (0, 0.3), x.T)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#000000", 0.5 * (1 - enter)))
    mostrador(c, 1560, register=False)
    kb = bounce((x.tl - (x.wt("botella") - 0.2)) / 0.5)
    if x.tl > x.wt("botella") - 0.2:
        botella(c, 300, 1570 - (1 - kb) * 140)


def moneda(c, xx, yy, r=58, wet=0.0, T=0.0):
    oval(c, xx + 6, yy + 10, r, r * 0.92, P("#000000", 0.35, blur=8))
    circ(c, xx, yy, r, P("#D9A93A"))
    circ(c, xx, yy, r - 10, P("#B98A25", stroke=6))
    text(c, "1", xx, yy + 22, "ui", 62, P("#8A6418"), "c")
    c.drawArc(skia.Rect.MakeLTRB(xx - r + 8, yy - r + 8, xx + r - 8, yy + r - 8), 200, 60, False, P("#FFF1B8", 0.9, stroke=7))
    if wet > 0:
        oval(c, xx - 16, yy - 18, 18, 11, P("#BFE6F7", 0.75 * wet))
        oval(c, xx + 22, yy + 14, 11, 7, P("#BFE6F7", 0.75 * wet))


def tablero(c):
    vgrad(c, 0, 0, W, H, C("#8A5E3F"), C("#5E3D27"))
    for k in range(7):
        line(c, 0, 520 + k * 240, W, 500 + k * 240, P("#4A2F1E", 0.45, stroke=5))
    for k in range(18):
        r = random.Random(k)
        xx, yy = r.randint(0, W), r.randint(500, H)
        line(c, xx, yy, xx + r.randint(80, 260), yy - 6, P("#6B452C", 0.5, stroke=3))


COINS = ((420, 1180), (600, 1270), (470, 1390))


def s_monedas1(c, x):
    tablero(c)
    lampara(c, x.T, power=0.8)
    leave = ease((x.tl - (x.wt("monedas") + 1.4)) / 0.8)
    c.save()
    c.translate(-leave * 700, 0)
    c.translate(230, 1500)
    c.scale(1.5, 1.5)
    botella(c, 0, 0)
    c.restore()
    t0 = x.wt("tres") - 0.1
    for k, (cx, cy) in enumerate(COINS):
        kk = (x.tl - t0 - k * 0.28) / 0.45
        if kk > 0:
            b = bounce(kk)
            moneda(c, cx + 180, cy - (1 - b) * 500, 72, wet=1.0, T=x.T)


def s_monedas2(c, x):
    c.translate(540, 1280)
    c.scale(1.25, 1.25)
    c.translate(-720, -1280)
    tablero(c)
    grow = ease(x.p * 1.4)
    oval(c, 690, 1300, 330 * (0.6 + 0.4 * grow), 210 * (0.6 + 0.4 * grow), P("#BFE6F7", 0.22))
    oval(c, 690, 1300, 330 * (0.6 + 0.4 * grow), 210 * (0.6 + 0.4 * grow), P("#E8F7FF", 0.35, stroke=5))
    for k, (cx, cy) in enumerate(COINS):
        moneda(c, cx + 180, cy, 72, wet=1.0, T=x.T)
    for k in range(5):
        r = random.Random(k + 40)
        oval(c, 690 + r.randint(-330, 330), 1300 + r.randint(-230, 230), r.randint(8, 20), r.randint(6, 12), P("#BFE6F7", 0.6))
    # la mano de Lucía se acerca y se retira
    tn = x.wt("No")
    reach = ease((x.tl - 0.6) / 1.4) * (1 - ease((x.tl - tn + 0.1) / 0.5))
    hx, hy = 1010 - reach * 190, 1700 - reach * 190
    c.save()
    c.translate(hx, hy)
    c.rotate(-38)
    rr(c, -70, 60, 150, 600, 70, P("#E8B62C"))
    rr(c, -64, -50, 136, 150, 60, P(SKIN))
    for k in range(4):
        rr(c, -62 + k * 34, -110, 30, 100, 15, P(SKIN))
    rr(c, -92, -10, 34, 90, 17, P(SKIN))
    c.restore()


def s_sonrisa(c, x):
    vgrad(c, 0, 0, W, H, C("#10242B"), C("#05090B"))
    lampara(c, x.T, flick=True, power=0.8)
    sm = ease((x.tl - (x.wt("sonríe") - 0.9)) / 1.2)
    hombre(c, 540, 1010, 1.75, sm, (0, 0.15), x.T, umbrella=False, eyes_glow=sm > 0.5)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#000000", 0.15 + 0.2 * sm))


def s_miedo(c, x):
    c.translate(540, 900)
    c.scale(1.45, 1.45)
    c.translate(-430, -900)
    fondo_tienda(c, x.T, counter=False, flick=True, power=0.7)
    tm = x.wt("Mira")
    lk = (0.0, 0.0) if x.tl < tm else (ease((x.tl - tm) / 0.3), 0.15)
    sh = math.sin(x.T * 40) * 2.5
    lucia(c, 430 + sh, 900, 1.0, lk, "miedo", 0, x.T, sweat=True)
    mostrador(c, 1330)
    if x.tl > tm:
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeLinear([(900, 0), (300, 0)], [C("#7FE0B0", 0.28), C("#7FE0B0", 0.0)]))
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), p)


def s_monitor(c, x):
    vgrad(c, 0, 0, W, H, C("#0C1418"), C("#05080A"))
    rr(c, 50, 560, 980, 800, 34, P("#15191C"))
    rr(c, 440, 1360, 200, 120, 10, P("#101315"))
    rr(c, 300, 1460, 480, 40, 16, P("#15191C"))
    sx, sy, sw, sh = 90, 600, 900, 690
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(sx, sy, sw, sh), True)
    c.drawRect(skia.Rect.MakeXYWH(sx, sy, sw, sh), P("#1E2A26"))
    for k in range(9):
        line(c, sx + sw / 2 + (k - 4) * 60, sy + 250, sx + sw / 2 + (k - 4) * 190, sy + sh, P("#33443E", stroke=3))
    for k in range(5):
        yy = sy + 250 + (k / 4) ** 1.6 * (sh - 250)
        line(c, sx, yy, sx + sw, yy, P("#33443E", stroke=3))
    c.drawRect(skia.Rect.MakeXYWH(sx, sy, sw, 250), P("#16201D"))
    lucia(c, sx + 450, sy + 150, 0.42, (0, 0.5), "miedo", 0, x.T)
    poly(c, [(sx + 150, sy + 250), (sx + 750, sy + 250), (sx + 800, sy + 350), (sx + 100, sy + 350)], P("#4A5A52"))
    poly(c, [(sx + 100, sy + 350), (sx + 800, sy + 350), (sx + 800, sy + 400), (sx + 100, sy + 400)], P("#2E3A35"))
    oval(c, sx + 450, sy + 560, 120, 30, P("#6FA08D", 0.5))
    if (x.T % 0.9) < 0.6:
        pp = P("#E8FFE8", 0.8, stroke=5)
        pp.setPathEffect(skia.DashPathEffect.Make([22, 16], 0))
        c.drawRoundRect(skia.Rect.MakeXYWH(sx + 330, sy + 300, 240, 300), 20, 20, pp)
        text(c, "SIN MOVIMIENTO", sx + 450, sy + 650, "mono", 34, P("#E8FFE8", 0.9), "c")
    c.drawRect(skia.Rect.MakeXYWH(sx, sy, sw, sh), P("#3FAE7A", 0.22))
    for yy in range(int(sy), int(sy + sh), 6):
        line(c, sx, yy, sx + sw, yy, P("#000000", 0.22, stroke=2))
    gy = sy + (x.T * 240) % sh
    c.drawRect(skia.Rect.MakeXYWH(sx, gy, sw, 26), P("#FFFFFF", 0.06))
    text(c, "CAM 01 · CAJA", sx + 24, sy + 50, "mono", 34, P("#E8FFE8"))
    secs = 27 + int(x.tl)
    text(c, "03:10:{:02d}".format(secs % 60), sx + sw - 24, sy + sh - 24, "mono", 34, P("#E8FFE8"), "r")
    if (x.T % 1.0) < 0.5:
        circ(c, sx + sw - 130, sy + 38, 11, P("#FF3B2F"))
    text(c, "REC", sx + sw - 24, sy + 50, "mono", 34, P("#E8FFE8"), "r")
    c.restore()


def telefono(c, xx, yy, w, h):
    rr(c, xx + 10, yy + 16, w, h, 60, P("#000000", 0.5, blur=26))
    rr(c, xx, yy, w, h, 60, P("#0B0D10"))
    rr(c, xx + 16, yy + 16, w - 32, h - 32, 46, P("#11181D"))
    rr(c, xx + w / 2 - 70, yy + 30, 140, 28, 14, P("#0B0D10"))


def s_telefono(c, x):
    tablero(c)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#05090B", 0.55))
    vib = x.tl < 1.8 and (x.tl % 0.6) < 0.4
    dx = math.sin(x.T * 90) * 9 if vib else 0
    c.save()
    c.translate(540 + dx, 1180)
    c.rotate(-7 + (math.sin(x.T * 70) * 1.2 if vib else 0))
    telefono(c, -270, -480, 540, 980)
    circ(c, 0, 0, 420, P("#9FE8C0", 0.06, blur=60))
    text(c, "3:11", 0, -250, "ui", 120, P("#FFFFFF"), "c")
    k = ease((x.tl - 0.2) / 0.4)
    rr(c, -226, -150 + (1 - k) * 60, 452, 170, 30, P("#25313A", k))
    circ(c, -170, -66 + (1 - k) * 60, 36, P("#2F7D5B", k))
    text(c, "J", -170, -50 + (1 - k) * 60, "ui", 44, P("#FFFFFF", k), "c")
    text(c, "Jefe", -116, -80 + (1 - k) * 60, "ui", 40, P("#FFFFFF", k))
    text(c, "Mensaje nuevo · ahora", -116, -32 + (1 - k) * 60, "uir", 30, P("#B9C4CA", k))
    c.restore()
    if vib:
        for sgn in (-1, 1):
            for k2 in range(2):
                c.drawArc(skia.Rect.MakeLTRB(540 + sgn * (330 + k2 * 50) - 40, 1080, 540 + sgn * (330 + k2 * 50) + 40, 1280),
                          -40 if sgn > 0 else 140, 80, False, P("#FFFFFF", 0.5, stroke=8))


MENSAJE = "Perdón, olvidé la regla 4. Cierra con llave antes de las 3. El cliente de las 3 no usa la puerta."


def s_chat(c, x):
    vgrad(c, 0, 0, W, H, C("#0A1014"), C("#05080A"))
    telefono(c, 70, 500, 940, 1500)
    c.drawRect(skia.Rect.MakeXYWH(86, 560, 908, 150), P("#17222A"))
    circ(c, 180, 636, 46, P("#2F7D5B"))
    text(c, "J", 180, 654, "ui", 52, P("#FFFFFF"), "c")
    text(c, "Jefe", 250, 628, "ui", 46, P("#FFFFFF"))
    text(c, "en línea", 250, 674, "uir", 30, P("#7FD9A8"))
    rr(c, 620, 770, 330, 84, 30, P("#1F5D46"))
    text(c, "ok, todo bien", 786, 826, "uir", 36, P("#E9FFF4"), "c")
    text(c, "11:58 PM", 940, 890, "uir", 24, P("#7C8A92"), "r")
    f = frac_typing(x, 0.1, 0.3)
    s = MENSAJE[: int(len(MENSAJE) * f)]
    lines = wrap(MENSAJE, "uir", 46, 640)
    bh = 70 + len(lines) * 64
    rr(c, 130, 940, 720, bh, 34, P("#25313A"))
    left = len(s)
    yy = 1010
    for ln in lines:
        shown = ln[: max(0, left)]
        left -= len(ln) + 1
        if shown:
            text(c, shown, 166, yy, "uir", 46, P("#FFFFFF"))
        yy += 64
    text(c, "3:11 AM", 140, 940 + bh + 40, "uir", 24, P("#7C8A92"))
    if f < 1:
        for k in range(3):
            circ(c, 170 + k * 34, 940 + bh + 90, 10, P("#8FA0A8", 0.4 + 0.6 * (((x.T * 3) + k / 3) % 1 > 0.5)))
    rr(c, 120, 1830, 840, 90, 45, P("#17222A"))
    text(c, "Mensaje", 170, 1888, "uir", 34, P("#6F7D85"))


def s_candado(c, x):
    c.translate(905, 1215)
    z = 1.5 + 0.5 * ease(x.p)
    c.scale(z, z)
    c.translate(-760, -1160)
    puerta(c, x.T, 0.0, False, key_swing=1.0)
    c.drawRect(skia.Rect.MakeXYWH(872, 1262, 70, 26), P("#D6DBDF"))
    k = ease((x.tl - x.wt("cerrada")) / 0.4)
    if k > 0:
        c.save()
        c.translate(700, 1105)
        c.rotate(-8)
        rr(c, -150, -44, 300, 76, 12, P("#B8322B", k))
        text(c, "CERRADO", 0, 12, "ui", 50, P("#FFFFFF", k), "c")
        c.restore()


def sombra_figura(c, xx, yy, rise, sm, T):
    c.save()
    c.translate(xx, yy + (1 - rise) * 500)
    poly(c, [(-300, 200), (300, 200), (420, 1500), (-420, 1500)], P("#020304"))
    rr(c, -330, 120, 660, 320, 150, P("#020304"))
    rr(c, -170, -230, 340, 440, 130, P("#020304"))
    oval(c, 0, -220, 330, 52, P("#020304"))
    rr(c, -190, -470, 380, 260, 50, P("#020304"))
    for sgn in (-1, 1):
        circ(c, sgn * 80, -50, 50, P("#FFFFFF", 0.35 * rise, blur=20))
        circ(c, sgn * 80, -50, 30, P("#FFFFFF", rise))
        circ(c, sgn * 80, -44, 7, P("#020304", rise))
    if sm > 0:
        wv = 130 * sm
        pa = skia.Path()
        pa.moveTo(-wv, 70)
        pa.quadTo(0, 70 + 120 * sm, wv, 70)
        pa.quadTo(0, 70 + 30 * sm, -wv, 70)
        c.drawPath(pa, P("#F2F2EC", sm))
        c.save()
        c.clipPath(pa, True)
        for k in range(-8, 9):
            line(c, k * 18, 40, k * 18, 220, P("#020304", sm, stroke=3))
        c.restore()
    gotas(c, -310, -200, 900, T, n=3, speed=0.7, seed=0.1, r=9)
    gotas(c, 310, -200, 900, T, n=3, speed=0.6, seed=0.5, r=9)
    c.restore()


def s_detras(c, x):
    vgrad(c, 0, 0, W, H, C("#1B3A45"), C("#0C1D24"))
    lampara(c, x.T, flick=True, power=0.9 - 0.5 * x.p)
    rise = ease((x.tl + 0.1) / 1.6)
    sm = ease((x.tl - x.end + 0.2) / 0.9)
    sombra_figura(c, 540, 900, rise, sm, x.T)
    sh = math.sin(x.T * 45) * 3
    lucia(c, 540 + sh, 1420, 1.0, (0, -0.1), "panico", 0, x.T, sweat=True)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#000000", 0.25 * x.p))


def s_final(c, x):
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#040607"))
    for sgn in (-1, 1):
        circ(c, 540 + sgn * 90, 700, 56, P("#FFFFFF", 0.3, blur=24))
        if blink_at(x.T, 1.0) < 0.5:
            circ(c, 540 + sgn * 90, 700, 34, P("#FFFFFF"))
            circ(c, 540 + sgn * 90, 706, 8, P("#040607"))
    pa = skia.Path()
    pa.moveTo(380, 820)
    pa.quadTo(540, 960, 700, 820)
    pa.quadTo(540, 860, 380, 820)
    c.drawPath(pa, P("#F2F2EC"))
    c.save()
    c.clipPath(pa, True)
    for k in range(-9, 10):
        line(c, 540 + k * 18, 780, 540 + k * 18, 980, P("#040607", stroke=3))
    c.restore()
    k = ease((x.tl + 0.1) / 0.4)
    text(c, "¿TÚ QUÉ", 540, 1180 + (1 - k) * 40, "ui", 150, P("#FFFFFF", k), "c")
    text(c, "HARÍAS?", 540, 1340 + (1 - k) * 40, "ui", 150, P("#FF4A3C", k), "c")
    k2 = ease((x.tl - x.wt("Comenta") + 0.1) / 0.4)
    rr(c, 240, 1450, 600, 110, 55, P("#F2C230", k2))
    text(c, "COMENTA", 540, 1526, "ui", 62, P("#111111", k2), "c")
    k3 = ease((x.tl - x.wt("sígueme") + 0.1) / 0.4)
    text(c, "Sígueme para la PARTE 2", 540, 1660, "ui", 54, P("#FFFFFF", k3), "c")
    gotas(c, 200, 500, 1900, x.T, n=2, speed=0.5, seed=0.2, r=9)
    gotas(c, 880, 500, 1900, x.T, n=2, speed=0.45, seed=0.6, r=9)


ESCENAS = {
    "nota1": s_nota1, "nota0": s_nota0, "nota2": s_nota2, "nota3": s_nota3, "tienda": s_tienda, "risa": s_risa,
    "reloj": s_reloj, "puerta1": s_puerta1, "puerta2": s_puerta2, "hombre": s_hombre, "monedas1": s_monedas1,
    "monedas2": s_monedas2, "sonrisa": s_sonrisa, "miedo": s_miedo, "monitor": s_monitor, "telefono": s_telefono,
    "chat": s_chat, "candado": s_candado, "detras": s_detras, "final": s_final,
}

# ------------------------------------------------------------------ rótulos


def chunks(words):
    out, cur, n = [], [], 0
    for w in words:
        if cur and (n + len(w["w"]) > 17 or len(cur) >= 4):
            out.append(cur)
            cur, n = [], 0
        cur.append(w)
        n += len(w["w"]) + 1
    if cur:
        out.append(cur)
    return out


CHUNKS = [chunks(w) for w in WORDS]


def subtitulos(c, i, tl):
    ch = None
    cs = CHUNKS[i]
    for k, grp in enumerate(cs):
        t0 = grp[0]["t"] - 0.08
        t1 = cs[k + 1][0]["t"] - 0.08 if k + 1 < len(cs) else grp[-1]["t"] + grp[-1]["d"] + 0.45
        if t0 <= tl < t1:
            ch = grp
            break
    if not ch:
        return
    size = 76
    f = font("ui", size)
    sp = f.measureText(" ")
    widths = [f.measureText(w["w"]) for w in ch]
    total = sum(widths) + sp * (len(ch) - 1)
    if total > 980:
        size = int(size * 980 / total)
        f = font("ui", size)
        sp = f.measureText(" ")
        widths = [f.measureText(w["w"]) for w in ch]
        total = sum(widths) + sp * (len(ch) - 1)
    xx, yy = (W - total) / 2, 330
    for w, wd in zip(ch, widths):
        cur = w["t"] - 0.05 <= tl < w["t"] + w["d"] + 0.06
        said = tl >= w["t"] - 0.05
        c.drawString(w["w"], xx + 3, yy + 5, f, P("#000000", 0.75, blur=7))
        if cur:
            rr(c, xx - 12, yy - size * 0.86, wd + 24, size * 1.16, 14, P("#F2C230"))
            c.drawString(w["w"], xx, yy, f, P("#111111"))
        else:
            c.drawString(w["w"], xx, yy, f, P("#FFFFFF", 1.0 if said else 0.45))
        xx += wd + sp


def pildora(c, s, T):
    if not s:
        return
    f = font("ui", 34)
    w = f.measureText(s) + 86
    red = ("ROTA" in s) or s.startswith("3:")
    rr(c, (W - w) / 2, 398, w, 62, 31, P("#0B1418", 0.92))
    if red:
        rr(c, (W - w) / 2, 398, w, 62, 31, P("#FF4A3C", 0.9, stroke=3))
    circ(c, (W - w) / 2 + 34, 429, 9, P("#FF4A3C" if red else "#57D989", 1.0 if (T % 1.2) < 0.8 else 0.3))
    c.drawString(s, (W - w) / 2 + 58, 441, f, P("#FFFFFF"))


_vig = skia.Paint(AntiAlias=True)
_vig.setShader(skia.GradientShader.MakeRadial((W / 2, H * 0.55), H * 0.72, [C("#000000", 0.0), C("#000000", 0.0), C("#000000", 0.78)], [0.0, 0.55, 1.0]))
_top = skia.Paint(AntiAlias=True)
_top.setShader(skia.GradientShader.MakeLinear([(0, 0), (0, 560)], [C("#000000", 0.72), C("#000000", 0.0)]))


def draw_frame(c, T):
    i = 0
    while i + 1 < len(CUTS) - 1 and T >= CUTS[i + 1]:
        i += 1
    seg = GUION[i]
    words = WORDS[i]
    x = types.SimpleNamespace()
    x.T, x.i = T, i
    x.tl = T - STARTS[i]
    x.end = ENDS[i]
    x.p = clamp((T - CUTS[i]) / (CUTS[i + 1] - CUTS[i]))

    def wt(sub):
        for w in words:
            if sub.lower() in w["w"].lower():
                return w["t"]
        return 0.0

    x.wt = wt
    c.clear(C("#000000"))
    c.save()
    z = 1.0 + 0.045 * x.p
    c.translate(W / 2, H / 2)
    c.scale(z, z)
    c.translate(-W / 2, -H / 2)
    ESCENAS[seg["s"]](c, x)
    c.restore()
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), _vig)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, 560), _top)
    fade = 1 - (T - CUTS[i]) / 0.2
    if fade > 0 and i > 0:
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#000000", fade))
    if T > TOTAL - 1.2:
        c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#000000", (T - (TOTAL - 1.2)) / 1.2))
    pildora(c, seg["pill"], T)
    subtitulos(c, i, x.tl)


# ------------------------------------------------------------------ salida
def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "hoja"
    os.makedirs(os.path.join(HERE, "test"), exist_ok=True)
    if mode == "hoja":
        cols, rows, sc = 7, 3, 0.25
        which = sys.argv[2] if len(sys.argv) > 2 else "fin"
        sheet = skia.Surface(int(W * sc * cols), int(H * sc * rows))
        sc_c = sheet.getCanvas()
        sc_c.clear(C("#202020"))
        for i in range(len(GUION)):
            T = STARTS[i] + (ENDS[i] * (0.92 if which == "fin" else 0.45))
            sc_c.save()
            sc_c.translate((i % cols) * W * sc, (i // cols) * H * sc)
            sc_c.clipRect(skia.Rect.MakeXYWH(0, 0, W * sc, H * sc))
            sc_c.scale(sc, sc)
            draw_frame(sc_c, T)
            sc_c.restore()
        sheet.makeImageSnapshot().save(os.path.join(HERE, "test", "hoja_{}.png".format(which)), skia.kPNG)
        print("hoja lista; gap={:.2f}".format(GAP))
    elif mode == "cuadro":
        s = skia.Surface(W, H)
        draw_frame(s.getCanvas(), float(sys.argv[2]))
        s.makeImageSnapshot().save(os.path.join(HERE, "test", "cuadro.png"), skia.kPNG)
        print("cuadro listo")
    else:
        import time
        out = os.path.join(HERE, "imagen.mp4")
        ff = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", "{}x{}".format(W, H), "-r", str(FPS),
             "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", out],
            stdin=subprocess.PIPE)
        s = skia.Surface(W, H)
        n = int(TOTAL * FPS)
        t0 = time.time()
        for k in range(n):
            draw_frame(s.getCanvas(), k / FPS)
            ff.stdin.write(s.makeImageSnapshot().tobytes())
            if k % 300 == 0:
                print("cuadro", k, "de", n, "{:.0f}s".format(time.time() - t0), flush=True)
        ff.stdin.close()
        ff.wait()
        print("VIDEO_OK {:.0f}s".format(time.time() - t0))


main()
