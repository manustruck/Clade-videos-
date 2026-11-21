"""Utilidades de dibujo compartidas (sacadas de dibujos.py del video 2)."""
import math
import os
import random

import skia

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


# En Windows usa C:\Windows\Fonts; en Linux/Mac, una fuente parecida (para probar fuera de la PC).
_RESPALDO = {"segoeuib.ttf": "DejaVuSans-Bold.ttf", "segoeui.ttf": "DejaVuSans.ttf",
             "segoeprb.ttf": "DejaVuSans-BoldOblique.ttf", "consolab.ttf": "DejaVuSansMono-Bold.ttf",
             "impact.ttf": "DejaVuSans-Bold.ttf"}


def _ruta_fuente(nombre):
    if os.path.isfile(nombre):
        return nombre
    win = os.path.join(r"C:\Windows\Fonts", nombre)
    if os.path.isfile(win):
        return win
    for d in ("/usr/share/fonts/truetype/dejavu", "/Library/Fonts"):
        q = os.path.join(d, _RESPALDO.get(nombre, "DejaVuSans.ttf"))
        if os.path.isfile(q):
            return q
    return win


def font(kind, size):
    k = (kind, size)
    if k not in _fonts:
        if kind not in _fonts:
            _fonts[kind] = skia.Typeface.MakeFromFile(_ruta_fuente(FILES[kind]))
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


