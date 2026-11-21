"""Estilo del canal: paleta, letras y efectos (degradados, haces de luz, partículas, viñeta, subtítulos, rótulos).

Sacado de los 8 videos de referencia (ver ../referencias/ESTILO_REFERENCIAS.md):
dibujo plano con degradados suaves y sin contornos, fondos oscuros y cálidos, dorado para lo divino,
rojo solo para el peligro, haces de luz y partículas en todo momento, letra fina en el tercio superior.
Todas las medidas están pensadas para 1080x1920.
"""
import math
import os
import random

import skia

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1920

# ------------------------------------------------------------------ paleta (medida en las referencias)
PAL = {
    "negro": "#120c0a", "cafe": "#44241d", "terracota": "#754431", "dorado": "#d7af72", "oro": "#f1c66b",
    "ambar": "#cf8a5d", "crema": "#f2e5bc", "rojo": "#b42f35", "noche": "#1b2033", "azul": "#2a3449",
    "gris": "#9aa0ad", "blanco": "#ffffff", "piel": "#e0a77a", "piel2": "#b97a52", "pergamino": "#ecd9ae",
    "caja": "#1c2a4a", "caja_borde": "#9ec5ff",
}


def C(hexa, a=1.0):
    """Color skia desde '#rrggbb' (o una tupla rgb) con opacidad a (0-1)."""
    if isinstance(hexa, (tuple, list)):
        r, g, b = hexa[:3]
    else:
        h = PAL.get(hexa, hexa).lstrip("#")
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return skia.Color(int(r), int(g), int(b), max(0, min(255, int(a * 255))))


def mezcla(c1, c2, f):
    a = PAL.get(c1, c1).lstrip("#")
    b = PAL.get(c2, c2).lstrip("#")
    x = [int(a[i:i + 2], 16) for i in (0, 2, 4)]
    y = [int(b[i:i + 2], 16) for i in (0, 2, 4)]
    return "#%02x%02x%02x" % tuple(int(x[i] + (y[i] - x[i]) * f) for i in range(3))


def P(color, a=1.0, aa=True, stroke=0.0):
    p = skia.Paint(AntiAlias=aa, Color=C(color, a))
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style)
        p.setStrokeWidth(stroke)
        p.setStrokeCap(skia.Paint.kRound_Cap)
        p.setStrokeJoin(skia.Paint.kRound_Join)
    return p


# ------------------------------------------------------------------ letras
_tf = {}
_ft = {}
FUENTES = {
    "reg": "Poppins-Regular.ttf", "med": "Poppins-Medium.ttf", "semi": "Poppins-SemiBold.ttf",
    "bold": "Poppins-Bold.ttf", "black": "Poppins-ExtraBold.ttf", "serif": ("CormorantGaramond.ttf", 650),
    "serif_l": ("CormorantGaramond.ttf", 500),
}


def _typeface(kind):
    if kind not in _tf:
        spec = FUENTES[kind]
        if isinstance(spec, tuple):
            t = skia.Typeface.MakeFromFile(os.path.join(HERE, "fuentes", spec[0]))
            tag = int.from_bytes(b"wght", "big")
            coord = skia.FontArguments.VariationPosition.Coordinate(tag, spec[1])
            vp = skia.FontArguments.VariationPosition(skia.FontArguments.VariationPosition.Coordinates([coord]))
            fa = skia.FontArguments()
            fa.setVariationDesignPosition(vp)
            t = t.makeClone(fa)
        else:
            t = skia.Typeface.MakeFromFile(os.path.join(HERE, "fuentes", spec))
        _tf[kind] = t
    return _tf[kind]


def font(kind, size):
    k = (kind, round(size, 1))
    if k not in _ft:
        f = skia.Font(_typeface(kind), size)
        f.setSubpixel(True)
        f.setEdging(skia.Font.Edging.kAntiAlias)
        _ft[k] = f
    return _ft[k]


def ancho(s, kind, size):
    return font(kind, size).measureText(s)


def texto(c, s, x, y, kind, size, color, a=1.0, align="c", sombra=0.0):
    f = font(kind, size)
    w = f.measureText(s)
    x0 = x - w / 2 if align == "c" else (x - w if align == "r" else x)
    if sombra:
        sp = P("#000000", 0.55 * a * sombra)
        sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, size * 0.12))
        c.drawString(s, x0, y + size * 0.05, f, sp)
    c.drawString(s, x0, y, f, P(color, a))
    return w


def partir(s, kind, size, maxw):
    lineas, cur = [], ""
    for w in s.split():
        t = (cur + " " + w).strip()
        if ancho(t, kind, size) > maxw and cur:
            lineas.append(cur)
            cur = w
        else:
            cur = t
    if cur:
        lineas.append(cur)
    return lineas


# ------------------------------------------------------------------ curvas de tiempo
def clamp(v, a=0.0, b=1.0):
    return max(a, min(b, v))


def suave(f):
    f = clamp(f)
    return f * f * f * (f * (f * 6 - 15) + 10)


def vivo(f):
    """Curva para la cámara: suave al empezar, pero NUNCA se detiene del todo (mezcla con lineal)."""
    f = clamp(f)
    return 0.55 * f + 0.45 * suave(f)


def rebote(f):
    f = clamp(f)
    return 1 + 2.7 * (f - 1) ** 3 + 1.7 * (f - 1) ** 2


def aparece(T, t0, d=0.35):
    return suave((T - t0) / d)


def lerp(a, b, f):
    return a + (b - a) * f


# ------------------------------------------------------------------ fondos y degradados
def degradado(c, colores, y0=0, y1=H, x0=-400, x1=W + 400, stops=None):
    """Degradado vertical de varios colores (lista de hex)."""
    cols = [C(x) for x in colores]
    sh = skia.GradientShader.MakeLinear([(0, y0), (0, y1)], cols, stops)
    c.drawRect(skia.Rect(x0, y0 - 2000 if y0 <= 0 else y0, x1, y1 + 2000 if y1 >= H else y1), skia.Paint(Shader=sh))


def brillo_radial(c, x, y, r, color, a=0.6):
    sh = skia.GradientShader.MakeRadial((x, y), r, [C(color, a), C(color, a * 0.35), C(color, 0)], [0, 0.4, 1])
    c.drawCircle(x, y, r, skia.Paint(Shader=sh, AntiAlias=True))


def vineta(c, fuerza=0.55):
    sh = skia.GradientShader.MakeRadial((W / 2, H * 0.48), H * 0.72,
                                        [C("#000000", 0), C("#000000", 0), C("#000000", fuerza)], [0, 0.55, 1])
    c.drawRect(skia.Rect(0, 0, W, H), skia.Paint(Shader=sh))
    # franja superior oscurecida para que se lean los subtítulos
    sh2 = skia.GradientShader.MakeLinear([(0, 0), (0, H * 0.36)], [C("#000000", 0.42), C("#000000", 0)])
    c.drawRect(skia.Rect(0, 0, W, H * 0.36), skia.Paint(Shader=sh2))


def haces(c, x, y, ang, T, n=4, largo=2200, ancho_=150, color="#ffe9b8", a=0.16, seed=1):
    """Haces de luz diagonales ('rayos de Dios') que respiran y se desplazan despacio."""
    rnd = random.Random(seed)
    c.save()
    c.translate(x, y)
    c.rotate(ang)
    for i in range(n):
        off = (i - (n - 1) / 2) * ancho_ * 1.25 + rnd.uniform(-40, 40) + 30 * math.sin(T * 0.35 + i * 1.7)
        w = ancho_ * rnd.uniform(0.6, 1.25)
        al = a * (0.6 + 0.4 * math.sin(T * 0.9 + i * 2.1 + seed))
        sh = skia.GradientShader.MakeLinear([(off - w / 2, 0), (off + w / 2, 0)],
                                            [C(color, 0), C(color, al), C(color, 0)])
        p = skia.Paint(Shader=sh, AntiAlias=True)
        path = skia.Path()
        path.moveTo(off - w * 0.25, 0)
        path.lineTo(off + w * 0.25, 0)
        path.lineTo(off + w * 0.7, largo)
        path.lineTo(off - w * 0.7, largo)
        path.close()
        sh2 = skia.GradientShader.MakeLinear([(0, 0), (0, largo)], [C("#ffffff", 1), C("#ffffff", 0)])
        p.setShader(skia.Shaders.Blend(skia.BlendMode.kDstIn, sh, sh2))
        c.drawPath(path, p)
    c.restore()


def particulas(c, T, seed=3, n=60, color="#ffdca0", y0=0, y1=H, tam=(2, 6), vel=(-25, -8), a=0.7, deriva=30):
    """Polvo/chispas que flotan siempre (dan vida aunque nada más se mueva)."""
    rnd = random.Random(seed)
    for _ in range(n):
        x = rnd.uniform(-50, W + 50)
        y = rnd.uniform(y0, y1)
        r = rnd.uniform(*tam)
        vy = rnd.uniform(*vel)
        ph = rnd.uniform(0, 6.28)
        yy = y0 + ((y - y0 + vy * T) % max(1, (y1 - y0)))
        xx = x + deriva * math.sin(T * 0.6 + ph)
        al = a * (0.35 + 0.65 * (0.5 + 0.5 * math.sin(T * 2.2 + ph)))
        brillo_radial(c, xx, yy, r * 3.2, color, al * 0.5)
        c.drawCircle(xx, yy, r * 0.6, P(color, al))


def bokeh(c, T, seed=5, n=14, colores=("#ffcf8a", "#ffe6b0", "#f4a261"), y0=200, y1=1700, r=(25, 70), a=0.22):
    rnd = random.Random(seed)
    for _ in range(n):
        x = rnd.uniform(0, W)
        y = rnd.uniform(y0, y1)
        rr = rnd.uniform(*r)
        ph = rnd.uniform(0, 6.28)
        col = rnd.choice(colores)
        xx = x + 40 * math.sin(T * 0.25 + ph)
        yy = y + 30 * math.cos(T * 0.2 + ph)
        al = a * (0.5 + 0.5 * math.sin(T * 0.7 + ph))
        p = P(col, al)
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, rr * 0.25))
        c.drawCircle(xx, yy, rr, p)


def estrellas(c, T, seed=9, n=110, y1=1000):
    rnd = random.Random(seed)
    for _ in range(n):
        x, y = rnd.uniform(0, W), rnd.uniform(-200, y1)
        r = rnd.uniform(0.8, 2.6)
        ph = rnd.uniform(0, 6.28)
        al = 0.35 + 0.65 * (0.5 + 0.5 * math.sin(T * rnd.uniform(1.2, 3.0) + ph))
        c.drawCircle(x, y, r, P("#fff6dc", al))
        if r > 2.2:
            brillo_radial(c, x, y, r * 6, "#fff2c8", al * 0.35)


# ------------------------------------------------------------------ rótulos
def caja_clave(c, x0, y0, x1, y1, k=1.0):
    """Caja de palabra clave: azul marino, borde punteado celeste y puntitos en las esquinas."""
    if k <= 0:
        return
    pad = 10
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = 0.85 + 0.15 * rebote(k)
    c.save()
    c.translate(cx, cy)
    c.scale(s, s)
    c.translate(-cx, -cy)
    r = skia.Rect(x0 - pad, y0 - pad * 0.6, x1 + pad, y1 + pad * 0.6)
    c.drawRoundRect(r, 6, 6, P("caja", 0.92 * min(1, k * 1.5)))
    bp = P("caja_borde", 0.9 * min(1, k * 1.5), stroke=2.2)
    bp.setPathEffect(skia.DashPathEffect.Make([9, 6], 0))
    c.drawRoundRect(r, 6, 6, bp)
    for (qx, qy) in ((r.left(), r.top()), (r.right(), r.top()), (r.left(), r.bottom()), (r.right(), r.bottom())):
        c.drawRect(skia.Rect(qx - 4.5, qy - 4.5, qx + 4.5, qy + 4.5), P("#eaf3ff", min(1, k * 1.5)))
    c.restore()


def pastilla(c, x, y, num, unidad="", k=1.0, color_num="#ffffff", tam=78):
    """Cifra en pastilla oscura redondeada ('+750 años'). Entra con rebote."""
    if k <= 0:
        return
    s = rebote(k)
    fn, fu = font("bold", tam), font("semi", tam * 0.42)
    wn = fn.measureText(num)
    wu = fu.measureText(unidad) + (12 if unidad else 0)
    w, h = wn + wu + 56, tam * 1.25
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    sp = P("#000000", 0.45)
    sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 14))
    c.drawRoundRect(skia.Rect(-w / 2, -h / 2 + 8, w / 2, h / 2 + 8), h / 2.4, h / 2.4, sp)
    c.drawRoundRect(skia.Rect(-w / 2, -h / 2, w / 2, h / 2), h / 2.4, h / 2.4, P("#1d1713", 0.9))
    c.drawRoundRect(skia.Rect(-w / 2, -h / 2, w / 2, h / 2), h / 2.4, h / 2.4, P("dorado", 0.55, stroke=2.5))
    c.drawString(num, -w / 2 + 28, tam * 0.36, fn, P(color_num))
    if unidad:
        c.drawString(unidad, -w / 2 + 28 + wn + 12, tam * 0.36, fu, P("crema", 0.9))
    c.restore()


def pergamino(c, titulo, cuerpo, k=1.0, y=1560, T=0.0):
    """Versículo en pergamino crema abajo: libro en rojo, texto en serifa oscura. Sube con suavidad."""
    if k <= 0:
        return
    f = suave(k)
    w = 880
    lineas = partir("«" + cuerpo + "»", "serif", 44, w - 120)
    h = 110 + 52 * len(lineas)
    yy = y + (1 - f) * 120
    c.save()
    c.translate(W / 2, yy)
    sp = P("#000000", 0.45 * f)
    sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 22))
    c.drawRoundRect(skia.Rect(-w / 2, -h / 2 + 14, w / 2, h / 2 + 14), 10, 10, sp)
    sh = skia.GradientShader.MakeLinear([(0, -h / 2), (0, h / 2)], [C("#f6e7c2", f), C("#e5cc98", f)])
    c.drawRoundRect(skia.Rect(-w / 2, -h / 2, w / 2, h / 2), 8, 8, skia.Paint(Shader=sh, AntiAlias=True))
    for sx in (-1, 1):  # rollos de los extremos
        sh2 = skia.GradientShader.MakeLinear([(sx * w / 2 - 22, 0), (sx * w / 2 + 22, 0)],
                                             [C("#b98a4e", f), C("#f3dfb0", f), C("#a87a40", f)])
        c.drawRoundRect(skia.Rect(sx * w / 2 - 22, -h / 2 - 16, sx * w / 2 + 22, h / 2 + 16), 18, 18,
                        skia.Paint(Shader=sh2, AntiAlias=True))
    texto(c, titulo.upper(), 0, -h / 2 + 62, "bold", 30, "#a3262c", f)
    for i, ln in enumerate(lineas):
        texto(c, ln, 0, -h / 2 + 118 + i * 52, "serif", 44, "#2b1d14", f)
    c.restore()


def cita(c, s, k=1.0, y=470):
    """Referencia bíblica pequeña debajo del subtítulo ('Proverbios 3:5')."""
    if k > 0:
        texto(c, s, W / 2, y, "med", 30, "#e8dcc2", 0.8 * suave(k), sombra=1)


def contador(c, n, activos, T, y=640, k=1.0):
    """Círculos 1-2-3 que se encienden en dorado (para 'tres claves')."""
    if k <= 0:
        return
    r, gap = 52, 136
    x0 = W / 2 - gap * (n - 1) / 2
    for i in range(n):
        x = x0 + i * gap
        on = activos[i] if i < len(activos) else 0
        c.drawCircle(x, y, r, P("#1d1713", 0.75 * k))
        c.drawCircle(x, y, r, P("dorado", 0.8 * k, stroke=4))
        if on > 0:
            s = rebote(on)
            sh = skia.GradientShader.MakeRadial((x, y - 14), r * 1.2, [C("#ffe7a3", k), C("#d39a3a", k)])
            c.drawCircle(x, y, r * 0.86 * s, skia.Paint(Shader=sh, AntiAlias=True))
            texto(c, str(i + 1), x, y + 22, "bold", 62, "#2a1a0e", k * clamp(on * 2))
            brillo_radial(c, x, y, r * 2.4, "#ffd27a", 0.25 * on * (0.8 + 0.2 * math.sin(T * 4)))
