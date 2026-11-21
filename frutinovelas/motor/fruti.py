"""Motor 2D de frutinovelas, hecho solo con Python (Pillow + numpy + ffmpeg).

Dibuja personajes fruta con cara animada (parpadeo, cejas por emoción, boca que se mueve con la voz), escenarios,
cámara (zoom, paneo, temblor), efectos de telenovela (zoom dramático, destello, lluvia, lágrimas) y subtítulos
palabra por palabra. Un capítulo es un archivo de Python con la lista de tomas (ver temporada1/cap01/cap.py).

Uso desde el capítulo:  from fruti import render;  render(TOMAS, carpeta_del_capitulo)
Requiere: pillow, numpy, soundfile y ffmpeg en el PATH. Corre igual en Windows, Mac y Linux.
"""
import json, math, os, subprocess, sys
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS, SS = 1080, 1920, 30, 2          # tamaño final, cuadros por segundo, sobremuestreo de los personajes
PISO = 1500                                # y de los pies en la escena
FUENTES = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "C:/Windows/Fonts/arialbd.ttf",
           "/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/Library/Fonts/Arial Bold.ttf"]

@lru_cache(None)
def fuente(tam):
    for f in FUENTES:
        if os.path.exists(f): return ImageFont.truetype(f, tam)
    return ImageFont.load_default()

def cl(x): return max(0.0, min(1.0, x))
def sm(x): u = cl(x); return u * u * (3 - 2 * u)
def atras(u):
    c1 = 1.70158; c3 = c1 + 1; x = cl(u) - 1; return 1 + c3 * x ** 3 + c1 * x ** 2
def azar(n): x = math.sin(n * 127.1 + 311.7) * 43758.5453; return x - math.floor(x)
def lerp(a, b, u): return a + (b - a) * u

# ------------------------------------------------------------------ personajes
# Cada fruta: color del cuerpo, sombra, forma, hojas y accesorios. Lienzo del personaje: 600 x 820 (pies en y = 800).
FRUTAS = {
    "fresa": dict(c="#e8283a", s="#b51628", forma="fresa", hojas="corona", nombre="VALENTINA", col="#ff5a6e", fem=True, extra=["delantal", "diadema"]),
    "mango": dict(c="#ffb030", s="#e2601f", forma="mango", hojas="tallo", nombre="RODRIGO", col="#ffb030", fem=False, extra=["corbata"]),
    "pina": dict(c="#f6c431", s="#c98a12", forma="pina", hojas="penacho", nombre="DOÑA PIÑA", col="#f6c431", fem=True, extra=["perlas", "labios", "aretes"]),
    "uva": dict(c="#8b3fc8", s="#5c2192", forma="uva", hojas="tallo", nombre="UVA CRISTAL", col="#c07aff", fem=True, extra=["tiara", "labios"]),
    "limon": dict(c="#c8e03a", s="#93ab17", forma="limon", hojas="ninguna", nombre="LUCHO", col="#c8e03a", fem=False, extra=["gorra"]),
    "coco": dict(c="#7a4a26", s="#4f2c12", forma="coco", hojas="ninguna", nombre="DON COCO", col="#c08a5a", fem=False, extra=["bigote", "baston", "sombrero"]),
}

def _cuerpo(d, f, k):
    """dibuja la forma de la fruta; k = escala (SS). Devuelve el centro de la cara."""
    c, s, forma = f["c"], f["s"], f["forma"]
    E = lambda x0, y0, x1, y1, col, **kw: d.ellipse([x0 * k, y0 * k, x1 * k, y1 * k], fill=col, **kw)
    P = lambda pts, col: d.polygon([(x * k, y * k) for x, y in pts], fill=col)
    if forma == "fresa":
        P([(130, 330), (470, 330), (300, 690)], s); E(120, 200, 480, 480, s)
        P([(150, 335), (450, 335), (300, 670)], c); E(135, 210, 465, 470, c)
        for i in range(26):
            x, y = 170 + azar(i) * 260, 260 + azar(i + 40) * 330
            cara = ((x - 300) / 150) ** 2 + ((y - 400) / 120) ** 2 < 1
            if abs(x - 300) < 175 - (y - 260) * 0.42 and not cara: E(x - 6, y - 9, x + 6, y + 9, "#ffe066")
        return 300, 370
    if forma == "mango":
        E(110, 190, 500, 690, s); E(120, 200, 485, 670, c); E(280, 210, 470, 420, "#ff6a3d")
        return 300, 400
    if forma == "pina":
        E(120, 220, 480, 700, s); E(132, 230, 468, 688, c)
        capa = Image.new("RGBA", d.im.size, (0, 0, 0, 0)); dc = ImageDraw.Draw(capa)
        for i in range(-6, 8):
            dc.line([((150 + i * 50) * k, 230 * k), ((150 + i * 50 + 260) * k, 690 * k)], fill="#b97a0e", width=4 * k)
            dc.line([((450 - i * 50) * k, 230 * k), ((450 - i * 50 - 260) * k, 690 * k)], fill="#b97a0e", width=4 * k)
        mascara = Image.new("L", capa.size, 0); ImageDraw.Draw(mascara).ellipse([132 * k, 230 * k, 468 * k, 688 * k], fill=255)
        capa.putalpha(Image.composite(capa.getchannel("A"), Image.new("L", capa.size, 0), mascara)); f["_capa"] = capa
        E(170, 330, 430, 560, c)                                           # zona lisa para la cara
        return 300, 430
    if forma == "uva":
        for x, y, r in [(300, 300, 95), (205, 390, 90), (395, 390, 90), (250, 500, 92), (350, 500, 92), (300, 610, 80), (160, 520, 70), (440, 520, 70)]:
            E(x - r, y - r, x + r, y + r, s); E(x - r + 8, y - r + 6, x + r - 8, y + r - 8, c)
            E(x - r * 0.5, y - r * 0.6, x - r * 0.1, y - r * 0.3, "#b58ae0")
        E(185, 300, 415, 520, c)
        return 300, 410
    if forma == "limon":
        P([(300, 170), (270, 230), (330, 230)], c); P([(300, 720), (270, 660), (330, 660)], c)
        E(120, 210, 480, 690, s); E(130, 220, 470, 680, c)
        return 300, 420
    if forma == "coco":
        E(110, 220, 490, 690, s); E(120, 230, 480, 680, c)
        for i in range(70):
            x, y = 140 + azar(i) * 320, 250 + azar(i + 9) * 400
            d.line([(x * k, y * k), ((x + 14) * k, (y + 6) * k)], fill="#5c3318", width=3 * k)
        E(150, 300, 450, 600, "#8a5a33")
        return 300, 430
    return 300, 400

def _hojas(d, f, k):
    E = lambda x0, y0, x1, y1, col: d.ellipse([x0 * k, y0 * k, x1 * k, y1 * k], fill=col)
    P = lambda pts, col: d.polygon([(x * k, y * k) for x, y in pts], fill=col)
    h = f["hojas"]
    if h == "corona":
        for a in range(-2, 3):
            P([(300, 225), (300 + a * 55 - 35, 170 - abs(a) * 5), (300 + a * 70, 140 + abs(a) * 25), (300 + a * 55 + 35, 175)], "#2f9a3a")
    elif h == "tallo":
        d.line([(300 * k, 200 * k), (310 * k, 150 * k)], fill="#6b4a2a", width=10 * k); P([(310, 160), (390, 120), (420, 160), (340, 185)], "#3fa637")
    elif h == "penacho":
        for a in range(-4, 5):
            P([(290 + a * 8, 240), (300 + a * 36, 60 + abs(a) * 22), (310 + a * 8, 240)], "#2f9a3a" if a % 2 else "#4fc24a")

CEJAS = {  # (alto, ángulo interno) por emoción
    "neutral": (0, 0), "feliz": (-8, -6), "triste": (-4, 16), "enojo": (6, -22), "sorpresa": (-22, 0), "malvada": (0, -18), "llora": (-4, 18),
}

def _cara(d, f, k, cx, cy, emo, boca, ojos, mira):
    E = lambda x0, y0, x1, y1, col, **kw: d.ellipse([x0 * k, y0 * k, x1 * k, y1 * k], fill=col, **kw)
    L = lambda pts, col, w: d.line([(x * k, y * k) for x, y in pts], fill=col, width=int(w * k), joint="curve")
    tinta = "#2a0f12"
    for lado in (-1, 1):
        ex, ey, r = cx + lado * 52, cy - 10, 36 if emo != "sorpresa" else 42
        E(ex - r - 4, ey - r - 4, ex + r + 4, ey + r + 4, tinta)
        if ojos > 0.15:
            E(ex - r, ey - r * ojos, ex + r, ey + r * ojos, "white")
            px, pr = ex + mira * 12, 15 if emo != "sorpresa" else 11
            E(px - pr, ey - pr * ojos, px + pr, ey + pr * ojos, "#1a0a0a"); E(px - 5, ey - 9 * ojos, px + 2, ey - 3 * ojos, "white")
        else:
            L([(ex - r, ey), (ex + r, ey)], tinta, 6)
        if f["fem"]:
            for j in range(3): L([(ex + lado * (r - 6 + j * 6), ey - r + 10 - j * 4), (ex + lado * (r + 10 + j * 8), ey - r - 6 - j * 6)], tinta, 5)
        alto, ang = CEJAS.get(emo, (0, 0))
        if emo == "malvada" and lado == 1: alto, ang = -14, 10
        y0 = ey - r - 24 + alto
        L([(ex - lado * 30, y0 + ang * 0.5 * (1 if lado == 1 else 1)), (ex + lado * 30, y0 - ang * 0.5)], tinta, 9)
    my = cy + 75
    if "bigote" in f["extra"]:
        E(cx - 70, my - 38, cx, my - 8, "white"); E(cx, my - 38, cx + 70, my - 8, "white")
    if boca > 0.12:
        a, b = 26 + 18 * boca, 8 + 34 * boca
        E(cx - a, my - b * 0.4, cx + a, my + b, "#5a0f1a"); E(cx - a * 0.55, my + b * 0.35, cx + a * 0.55, my + b * 0.95, "#ff6b7a")
        if "labios" in f["extra"]: d.ellipse([(cx - a) * k, (my - b * 0.4) * k, (cx + a) * k, (my + b) * k], outline="#d1002a", width=7 * k)
    else:
        col = "#d1002a" if "labios" in f["extra"] else tinta
        if emo in ("feliz",): d.arc([(cx - 40) * k, (my - 30) * k, (cx + 40) * k, (my + 20) * k], 20, 160, fill=col, width=8 * k)
        elif emo in ("triste", "llora"): d.arc([(cx - 34) * k, (my + 4) * k, (cx + 34) * k, (my + 50) * k], 200, 340, fill=col, width=8 * k)
        elif emo == "malvada": d.arc([(cx - 44) * k, (my - 34) * k, (cx + 30) * k, (my + 10) * k], 10, 120, fill=col, width=9 * k)
        elif emo == "sorpresa": E(cx - 16, my - 6, cx + 16, my + 26, "#5a0f1a")
        elif emo == "enojo": L([(cx - 30, my + 8), (cx + 30, my + 2)], col, 9)
        else: d.arc([(cx - 30) * k, (my - 16) * k, (cx + 30) * k, (my + 12) * k], 30, 150, fill=col, width=7 * k)
    if emo in ("feliz", "sorpresa") or f["fem"]:
        E(cx - 120, cy + 25, cx - 70, cy + 50, "#ff8fa3"); E(cx + 70, cy + 25, cx + 120, cy + 50, "#ff8fa3")

def _extras(d, f, k, cx, cy, emo, pose, t):
    E = lambda x0, y0, x1, y1, col, **kw: d.ellipse([x0 * k, y0 * k, x1 * k, y1 * k], fill=col, **kw)
    P = lambda pts, col: d.polygon([(x * k, y * k) for x, y in pts], fill=col)
    L = lambda pts, col, w: d.line([(x * k, y * k) for x, y in pts], fill=col, width=int(w * k), joint="curve")
    ex = f["extra"]
    if "delantal" in ex:
        d.rounded_rectangle([205 * k, 480 * k, 395 * k, 640 * k], radius=30 * k, fill="white"); d.rounded_rectangle([255 * k, 540 * k, 345 * k, 600 * k], radius=12 * k, fill="#ffd6dc")
        L([(215, 485), (260, 440)], "white", 10); L([(385, 485), (340, 440)], "white", 10)
    if "diadema" in ex: d.arc([170 * k, 175 * k, 430 * k, 330 * k], 200, 340, fill="#ff9ec7", width=16 * k)
    if "corbata" in ex: P([(300, 520), (275, 545), (300, 650), (325, 545)], "#1d3f9a"); P([(285, 505), (315, 505), (308, 528), (292, 528)], "#2a56c8")
    if "perlas" in ex:
        for i in range(11): a = math.pi * (0.15 + 0.7 * i / 10); E(300 + 120 * math.cos(a) - 11, 520 + 50 * math.sin(a) - 11, 300 + 120 * math.cos(a) + 11, 520 + 50 * math.sin(a) + 11, "#fff8ee")
    if "aretes" in ex:
        for x in (150, 450): E(x - 12, 430, x + 12, 470, "#ffd23f")
    if "tiara" in ex: P([(230, 225), (250, 170), (275, 205), (300, 150), (325, 205), (350, 170), (370, 225)], "#e8f6ff")
    if "gorra" in ex: E(180, 190, 420, 300, "#1d8fd8"); P([(380, 260), (500, 270), (480, 295), (380, 290)], "#1570b0")
    if "sombrero" in ex: E(140, 240, 460, 290, "#d9c39a"); d.rounded_rectangle([200 * k, 150 * k, 400 * k, 265 * k], radius=30 * k, fill="#d9c39a"); d.rectangle([200 * k, 235 * k, 400 * k, 255 * k], fill="#7a4a26")
    if emo == "llora":
        for lado in (-1, 1):
            for j in range(3):
                u = ((t * 1.6 + j / 3) % 1)
                y = cy + 30 + u * 230
                E(cx + lado * 60 - 10, y - 14, cx + lado * 60 + 10, y + 14, "#5ac8ff")
    if emo == "enojo" and (int(t * 6) % 2 == 0):
        L([(cx + 110, cy - 150), (cx + 140, cy - 120)], "#ff2a2a", 8); L([(cx + 140, cy - 150), (cx + 110, cy - 120)], "#ff2a2a", 8)

def _brazos(d, f, k, pose, t):
    """brazos y piernas de palito; pose: normal, jarra, arriba, senala, cruzados, tapa"""
    L = lambda pts, col, w: d.line([(x * k, y * k) for x, y in pts], fill=col, width=int(w * k), joint="curve")
    E = lambda x0, y0, x1, y1, col: d.ellipse([x0 * k, y0 * k, x1 * k, y1 * k], fill=col)
    tinta, piel = "#2a0f12", "#2a0f12"
    L([(255, 660), (245, 780)], tinta, 14); L([(345, 660), (355, 780)], tinta, 14)
    E(200, 765, 265, 805, "#3a1a10"); E(335, 765, 400, 805, "#3a1a10")
    w = math.sin(t * 3) * 6
    manos = {
        "normal": [(150, 470, 120, 600 + w), (450, 470, 480, 600 - w)],
        "jarra": [(150, 470, 90, 520), (450, 470, 510, 520)],
        "arriba": [(150, 450, 70, 300 + w), (450, 450, 530, 300 - w)],
        "senala": [(150, 470, 120, 600), (450, 450, 590, 400)],
        "tapa": [(150, 470, 250, 470), (450, 470, 350, 470)],
        "ofrece": [(150, 470, 120, 600), (450, 480, 560, 470)],
    }[pose]
    for x0, y0, x1, y1 in manos:
        mx, my = (x0 + x1) / 2 + (-20 if x1 < x0 else 20), (y0 + y1) / 2 + 20
        if pose == "jarra": mx, my = (x0 + x1) / 2 - (25 if x1 < x0 else -25), y0 + 40
        L([(x0, y0), (mx, my), (x1, y1)], tinta, 13); E(x1 - 20, y1 - 20, x1 + 20, y1 + 20, "white")
    if "baston" in f["extra"]: L([(480, 600), (500, 800)], "#6b4a2a", 12)

@lru_cache(maxsize=4096)
def personaje(tipo, emo="neutral", boca=0, ojos=1.0, mira=0.0, pose="normal", tq=0):
    """sprite RGBA de 600x820 (pies en y=800). boca/ojos/mira llegan cuantizados para aprovechar la caché."""
    f, k = FRUTAS[tipo], SS
    im = Image.new("RGBA", (600 * k, 820 * k), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    t = tq / 10
    _brazos(d, f, k, pose, t)
    _hojas(d, f, k)
    f = dict(f); cx, cy = _cuerpo(d, f, k)
    if "_capa" in f:
        im.alpha_composite(f["_capa"]); d = ImageDraw.Draw(im)
        d.ellipse([170 * k, 330 * k, 430 * k, 560 * k], fill=f["c"])
    _cara(d, f, k, cx, cy, emo, boca / 4, ojos / 4, mira / 2)
    _extras(d, f, k, cx, cy, emo, pose, t)
    if pose == "tapa": _brazos(d, f, k, "tapa", t)
    sombra = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sombra).ellipse([150 * k, 780 * k, 450 * k, 815 * k], fill=(0, 0, 0, 70))
    sombra.alpha_composite(im)
    return sombra.resize((600, 820), Image.LANCZOS)

# ------------------------------------------------------------------ escenarios (se dibujan una vez a 2x y se guardan)
def _grad(d, k, y0, y1, c0, c1):
    c0, c1 = np.array(Image.new("RGB", (1, 1), c0).getpixel((0, 0))), np.array(Image.new("RGB", (1, 1), c1).getpixel((0, 0)))
    for y in range(y0 * k, y1 * k, 2):
        u = (y - y0 * k) / max(1, (y1 - y0) * k); d.rectangle([0, y, W * k, y + 2], fill=tuple(int(v) for v in c0 + (c1 - c0) * u))

@lru_cache(None)
def escenario(nombre):
    k = 2; im = Image.new("RGB", (W * k, H * k), "#000"); d = ImageDraw.Draw(im)
    R = lambda x0, y0, x1, y1, col, **kw: d.rectangle([x0 * k, y0 * k, x1 * k, y1 * k], fill=col, **kw)
    E = lambda x0, y0, x1, y1, col: d.ellipse([x0 * k, y0 * k, x1 * k, y1 * k], fill=col)
    T = lambda x, y, s, tam, col, borde="#3a1a10": d.text((x * k, y * k), s, font=fuente(tam * k), fill=col, anchor="mm", stroke_width=6 * k, stroke_fill=borde)
    if nombre == "mercado":
        _grad(d, k, 0, 900, "#7fd3ff", "#ffe2b0")
        R(0, 500, 1080, 1520, "#f2c891")
        for i, (x, col) in enumerate([(0, "#e8283a"), (360, "#2f9a3a"), (720, "#1d8fd8")]):
            R(x + 20, 700, x + 340, 1180, "#c98a4a")
            for j in range(8): R(x + 20 + j * 40, 600, x + 40 + j * 40, 720, col if j % 2 == 0 else "white")
            d.polygon([((x + 20) * k, 720 * k), ((x + 340) * k, 720 * k), ((x + 340) * k, 760 * k), ((x + 20) * k, 760 * k)], fill=col)
            for m in range(12):
                fx, fy = x + 50 + (m % 6) * 48, 1000 + (m // 6) * 50
                E(fx - 24, fy - 24, fx + 24, fy + 24, ["#ff8a1a", "#e8283a", "#c8e03a", "#8b3fc8", "#f6c431"][(m + i) % 5])
        R(140, 420, 940, 540, "#7a3a1a"); T(540, 480, "MERCADO SAN JUGO", 60, "#ffd23f")
        R(0, 1520, 1080, 1920, "#d9a066")
        for i in range(12): R(i * 90, 1520, i * 90 + 4, 1920, "#c48a52")
        R(60, 1330, 1020, 1560, "#ff6b8a"); R(60, 1300, 1020, 1340, "#ffffff")       # el puesto de jugos (mostrador)
        for j in range(5): R(120 + j * 190, 1250, 190 + j * 190, 1310, ["#ff8a1a", "#e8283a", "#c8e03a", "#8b3fc8", "#f6c431"][j]); R(120 + j * 190, 1240, 190 + j * 190, 1252, "white")
        T(540, 1440, "JUGOS VALENTINA", 64, "white", "#b51628")
    elif nombre == "mansion":
        _grad(d, k, 0, 1520, "#5a1a6a", "#a8326e")
        for x in (60, 1000): R(x - 40, 300, x + 40, 1520, "#e8c66a"); R(x - 50, 280, x + 50, 320, "#f6d77a")
        for x in (200, 880): d.polygon([((x - 120) * k, 0), ((x + 120) * k, 0), ((x + 60) * k, 1500 * k), ((x - 60) * k, 1500 * k)], fill="#8a0f2a")
        d.line([(540 * k, 0), (540 * k, 220 * k)], fill="#e8c66a", width=6 * k)
        for i in range(9): a = i / 8 * math.pi; E(540 + 150 * math.cos(a) - 18, 220 + 60 * math.sin(a) - 18, 540 + 150 * math.cos(a) + 18, 220 + 60 * math.sin(a) + 18, "#fff6c8")
        E(420, 200, 660, 260, "#f6d77a")
        R(270, 420, 810, 540, "#fff0f6"); T(540, 480, "R ♥ UVA", 66, "#d1002a", "#fff0f6")
        for i in range(10): E(100 + i * 95, 330 + 30 * math.sin(i), 160 + i * 95, 400 + 30 * math.sin(i), ["#ff9ec7", "#ffd23f", "#c07aff"][i % 3])
        for i in range(12):
            for j in range(5): R(i * 90, 1520 + j * 80, i * 90 + 90, 1600 + j * 80, "#f4ecf6" if (i + j) % 2 else "#2a1430")
        R(380, 1180, 700, 1330, "#fff0f6"); R(420, 1080, 660, 1190, "#ffc8dc"); R(460, 1000, 620, 1090, "#ffe0ec")    # pastel
    elif nombre == "calle":
        _grad(d, k, 0, 1500, "#060a1e", "#1c2a5a")
        for i in range(9):
            x, w, h = i * 125 - 20, 110 + 30 * azar(i), 500 + 500 * azar(i + 3)
            R(x, 1500 - h, x + w, 1500, "#10183a")
            for j in range(int(h / 70)):
                for m in range(2):
                    if azar(i * 20 + j * 3 + m) > 0.45: R(x + 15 + m * 50, 1500 - h + 30 + j * 70, x + 45 + m * 50, 1500 - h + 70 + j * 70, "#ffd36a")
        R(0, 1500, 1080, 1920, "#1a2240")
        for i in range(10): R(i * 120 + 30, 1690, i * 120 + 90, 1702, "#ffd36a")
        R(860, 900, 880, 1500, "#3a3f58"); E(820, 860, 920, 930, "#ffe9a0")
        E(700, 1480, 1040, 1560, "#3a4a7a")
    return im.resize((W, H), Image.LANCZOS)

# ------------------------------------------------------------------ texto en pantalla
def texto(d, x, y, s, tam, col="white", borde="#1a0505", ancho=None, anchor="mm"):
    d.text((x, y), s, font=fuente(tam), fill=col, anchor=anchor, stroke_width=ancho or max(4, tam // 9), stroke_fill=borde)

def subtitulos(d, pal, t, quien_col=None):
    """grupo de hasta 3 palabras; la que suena en amarillo y más grande"""
    grupos, act = [], []
    for i, w in enumerate(pal):
        act.append(w); sig = pal[i + 1] if i + 1 < len(pal) else None
        if len(act) == 3 or not sig or sig["i"] != w["i"] or w["p"][-1] in ".,;:?!":
            grupos.append((act[0]["a"], sig["a"] if sig and sig["i"] == w["i"] else w["b"] + 0.3, act)); act = []
    g = next((x for x in grupos if x[0] - 0.05 <= t < x[1]), None)
    if not g: return
    palabras = [w["p"].upper().strip(",.;:") for w in g[2]]
    tam = 84
    while sum(d.textlength(p + " ", font=fuente(tam)) for p in palabras) > 980 and tam > 50: tam -= 4
    x = 540 - sum(d.textlength(p + " ", font=fuente(tam)) for p in palabras) / 2
    for w, p in zip(g[2], palabras):
        activa = w["a"] - 0.03 <= t < w["b"] + 0.1
        visible = t >= w["a"] - 0.05
        if visible:
            esc = 1.08 if activa else 1.0
            ft = fuente(int(tam * esc))
            d.text((x, 1660), p, font=ft, fill="#ffe14d" if activa else "white", anchor="lm", stroke_width=10, stroke_fill="#1a0505")
        x += d.textlength(p + " ", font=fuente(tam))

# ------------------------------------------------------------------ cámara y armado de cada cuadro
def envolvente(wav, n):
    """volumen de la voz por cuadro (0..1), para mover la boca"""
    import soundfile as sf
    a, sr = sf.read(wav)
    if a.ndim > 1: a = a.mean(axis=1)
    paso = sr // FPS
    v = np.array([np.sqrt(np.mean(a[i * paso:(i + 1) * paso] ** 2)) if i * paso < len(a) else 0 for i in range(n)])
    return np.clip(v / (np.percentile(v[v > 0], 90) if (v > 0).any() else 1), 0, 1)

def render(TOMAS, carpeta, salida="out/mudo.mp4", desde=0.0, hasta=None, fotos=None, escala=1.0, limpio=False):
    """TOMAS: lista de dicts {a, b, escena, cam: [(cx, cy, zoom), (cx, cy, zoom)], actores: [...], efectos: [...], textos: [...]}.
    Cada actor: {tipo, x, emo, pose, mira, s, entra} — x en píxeles de la escena; s = escala.
    `fotos`: lista de segundos para sacar solo esas imágenes (revisión rápida)."""
    TI = json.load(open(os.path.join(carpeta, "voz", "tiempos.json"), encoding="utf-8"))
    G = json.load(open(os.path.join(carpeta, "guion.json"), encoding="utf-8"))
    total = TI["total"] + 1.2 if hasta is None else hasta
    n = int(total * FPS)
    vol = envolvente(os.path.join(carpeta, "voz", "voz.wav"), n + 2)
    habla = lambda t: next((G["quien"][f["i"]] for f in TI["frases"] if f["a"] <= t < f["b"]), None)
    os.makedirs(os.path.join(carpeta, "out"), exist_ok=True)
    pipe = None
    if not fotos:
        ow, oh = int(W * escala) // 2 * 2, int(H * escala) // 2 * 2
        pipe = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{ow}x{oh}", "-r", str(FPS), "-i", "-",
                                 "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", os.path.join(carpeta, salida)], stdin=subprocess.PIPE)
    cuadros = [int(s * FPS) for s in fotos] if fotos else range(int(desde * FPS), n)
    for fi in cuadros:
        t = fi / FPS
        tm = next((x for x in TOMAS if x["a"] <= t < x["b"]), TOMAS[-1])
        u = sm((t - tm["a"]) / max(0.01, tm["b"] - tm["a"]))
        im = escenario(tm["escena"]).copy().convert("RGBA")
        quien = habla(t)
        for ac in sorted(tm.get("actores", []), key=lambda a: a.get("z", 0)):
            tipo = ac["tipo"]; s = ac.get("s", 1.0)
            entra = cl((t - tm["a"] - ac.get("entra", -1)) / 0.35) if "entra" in ac else 1
            if entra <= 0: continue
            parp = 0 if ((t + azar(len(tipo)) * 3) % 3.4) < 0.12 else 4
            boca = int(round(4 * vol[fi])) if quien == tipo else 0
            emo = ac.get("emo", "neutral"); pose = ac.get("pose", "normal")
            if isinstance(emo, list): emo = next((e for t0, e in reversed(emo) if t >= tm["a"] + t0), emo[0][1])
            if isinstance(pose, list): pose = next((p for t0, p in reversed(pose) if t >= tm["a"] + t0), pose[0][1])
            sp = personaje(tipo, emo, boca, parp, int(round(ac.get("mira", 0) * 2)), pose, int(t * 10) % 40 if emo == "llora" else 0)
            sw, sh = int(600 * s), int(820 * s)
            sp = sp.resize((sw, sh), Image.BILINEAR) if s != 1 else sp
            salto = int(14 * abs(math.sin(t * 9))) if quien == tipo else 0
            x = int(ac["x"] - sw / 2 + (1 - entra) * ac.get("desde", 0)); y = int(ac.get("y", PISO) - sh * 0.975) - salto
            im.alpha_composite(sp, (x, y)) if 0 <= x and x + sw <= W and y >= 0 else _pegar(im, sp, x, y)
        d = ImageDraw.Draw(im)
        for ef in tm.get("efectos", []):
            _efecto(im, d, ef, t, tm)
        # cámara
        (x0, y0, z0), (x1, y1, z1) = tm["cam"]
        cx, cy, z = lerp(x0, x1, u), lerp(y0, y1, u), lerp(z0, z1, u)
        for ef in tm.get("efectos", []):
            if ef["tipo"] == "zoomdrama":
                for j, t0 in enumerate(ef["t"]):
                    if t >= tm["a"] + t0: z = ef["z"][j]; cx, cy = ef["c"][j]
            if ef["tipo"] == "temblor" and tm["a"] + ef["t"] <= t < tm["a"] + ef["t"] + ef.get("dur", 0.4):
                cx += 18 * math.sin(t * 90); cy += 12 * math.cos(t * 77)
        cw, ch = W / z, H / z
        cx, cy = min(max(cx, cw / 2), W - cw / 2), min(max(cy, ch / 2), H - ch / 2)
        im = im.crop((int(cx - cw / 2), int(cy - ch / 2), int(cx + cw / 2), int(cy + ch / 2))).resize((W, H), Image.BILINEAR)
        d = ImageDraw.Draw(im)
        for tx in ([] if limpio else tm.get("textos", [])): _texto_toma(im, d, tx, t, tm)
        if quien and not limpio:
            f = FRUTAS[quien]; nm = f["nombre"]
            tw = d.textlength(nm, font=fuente(48))
            d.rounded_rectangle([540 - tw / 2 - 30, 1530, 540 + tw / 2 + 30, 1600], radius=35, fill=f["col"], outline="white", width=5)
            texto(d, 540, 1566, nm, 48, "white", "#1a0505", 5)
        if not limpio:
            subtitulos(d, TI["palabras"], t)
            d.rectangle([0, 0, int(W * t / total), 12], fill="#ff3f6e")
        for ef in tm.get("efectos", []):
            if ef["tipo"] == "destello" and 0 <= t - tm["a"] - ef["t"] < 0.25:
                a = 1 - (t - tm["a"] - ef["t"]) / 0.25; im = Image.blend(im.convert("RGB"), Image.new("RGB", (W, H), "white"), a * 0.9).convert("RGBA")
        if t > total - 0.6: im = Image.blend(im.convert("RGB"), Image.new("RGB", (W, H), "black"), cl((t - (total - 0.6)) / 0.6)).convert("RGBA")
        out = im.convert("RGB")
        if fotos:
            (out if limpio else out.resize((W // 2, H // 2))).save(os.path.join(carpeta, "out", f"{'portada' if limpio else 'foto'}_{t:05.2f}.png")); continue
        if escala != 1.0: out = out.resize((ow, oh), Image.BILINEAR)
        pipe.stdin.write(out.tobytes())
        if fi % 150 == 0: print(f"  {t:5.1f}/{total:.1f} s", flush=True)
    if pipe: pipe.stdin.close(); pipe.wait()

def _pegar(im, sp, x, y):
    """pega un sprite aunque se salga del cuadro"""
    bx0, by0 = max(0, -x), max(0, -y); bx1, by1 = min(sp.width, W - x), min(sp.height, H - y)
    if bx1 > bx0 and by1 > by0: im.alpha_composite(sp.crop((bx0, by0, bx1, by1)), (max(0, x), max(0, y)))

def _efecto(im, d, ef, t, tm):
    tipo, dt = ef["tipo"], t - tm["a"]
    if tipo == "lluvia":
        for i in range(140):
            x = (azar(i) * W + dt * 60) % W; y = (azar(i + 7) * H + dt * 2400 * (0.8 + 0.4 * azar(i + 3))) % H
            d.line([(x, y), (x - 8, y + 50)], fill=(170, 200, 255, 150), width=3)
    elif tipo == "jugo" and dt >= ef["t"]:
        u = cl((dt - ef["t"]) / 0.5); x0, y0, x1, y1 = ef["de"] + ef["a"]
        for i in range(26):
            v = cl(u * 1.4 - azar(i) * 0.4); x, y = lerp(x0, x1, v) + (azar(i + 3) - 0.5) * 90 * v, lerp(y0, y1, v) - 120 * math.sin(math.pi * v) + (azar(i + 5) - 0.5) * 60
            r = 14 + 14 * azar(i + 8); d.ellipse([x - r, y - r, x + r, y + r], fill="#ff9a1a")
        if u >= 1:
            for i in range(9): x, y = x1 + (azar(i) - 0.5) * 160, y1 + azar(i + 2) * 160 + (dt - ef["t"] - 0.5) * 60; d.ellipse([x - 16, y - 22, x + 16, y + 22], fill="#ffa22a")
    elif tipo == "anillo" and dt >= ef["t"]:
        x, y, r = ef["x"], ef["y"], 46 * atras((dt - ef["t"]) / 0.3)
        d.ellipse([x - r, y - r, x + r, y + r], outline="#ffd23f", width=14)
        d.polygon([(x, y - r - 40), (x - 26, y - r - 6), (x + 26, y - r - 6)], fill="#bfefff")
        for i in range(8):
            a = i / 8 * math.pi * 2 + dt * 2; d.line([(x + math.cos(a) * (r + 20), y + math.sin(a) * (r + 20)), (x + math.cos(a) * (r + 50), y + math.sin(a) * (r + 50))], fill="#fff6b0", width=6)
    elif tipo == "vineta":
        a = ef.get("a", 150); m = Image.new("L", (W, H), 0); md = ImageDraw.Draw(m); md.ellipse([-200, 100, W + 200, H - 100], fill=255)
        m = m.filter(ImageFilter.GaussianBlur(120)); capa = Image.new("RGBA", (W, H), ef.get("col", (90, 0, 20, a))); capa.putalpha(Image.eval(m, lambda v: int((255 - v) * a / 255)))
        im.alpha_composite(capa)

def _texto_toma(im, d, tx, t, tm):
    dt = t - tm["a"] - tx.get("t", 0)
    if dt < 0 or (tx.get("dur") and dt > tx["dur"]): return
    e = atras(dt / 0.3)
    tipo = tx.get("tipo", "grande")
    if tipo == "logo":
        d.rounded_rectangle([140, 150, 940, 330], radius=40, fill="#7a0f2a", outline="#ffd23f", width=8)
        texto(d, 540, 215, "CORAZÓN DE FRESA", 72, "#ffd23f", "#3a0510")
        texto(d, 540, 285, tx["s"], 44, "white", "#3a0510")
    elif tipo == "carta":
        d.rounded_rectangle([110, 760, 970, 1060], radius=50, fill=(20, 5, 10, 220), outline="#ffd23f", width=8)
        texto(d, 540, 910, tx["s"], int(96 * e), "#ffd23f", "#3a0510")
    elif tipo == "continuara":
        d.rectangle([0, 700, W, 1150], fill=(10, 0, 5, 215))
        texto(d, 540, 860, "CONTINUARÁ…", int(120 * e), "#ff3f6e", "#1a0505")
        texto(d, 540, 1010, tx.get("s", "SIGUE LA SERIE"), 60, "white", "#1a0505")
    elif tipo == "seguir":
        d.rounded_rectangle([290, 380, 790, 480], radius=50, fill="#ff3f6e", outline="white", width=6)
        texto(d, 540, 430, tx.get("s", "SÍGUEME · CAP. 2"), 48, "white", "#1a0505")
    else:
        texto(d, 540, tx.get("y", 520), tx["s"], int(tx.get("tam", 96) * e), tx.get("col", "white"), "#1a0505")
