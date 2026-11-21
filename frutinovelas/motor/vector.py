"""Motor 2D «vector» para frutinovelas (versión 2), solo con Python: Pillow + numpy + ffmpeg.

Estilo: dibujo plano tipo vector con contorno grueso oscuro, personajes con cabeza de fruta y cuerpo humano con
ropa, escenarios con capas (fondo, medio, frente) que se mueven a distinta velocidad, luces que brillan y
parpadean, degradados, polvo flotando, viñeta, y una cámara que NUNCA se queda quieta:
deriva suave + respiración del zoom + golpes de zoom en las palabras clave + temblor en los impactos + barrido
rápido con desenfoque entre tomas. Subtítulos de UNA palabra en amarillo grueso (Anton) en el centro.

Un capítulo es un archivo cap.py con la lista de TOMAS (ver FRUTINOVELAS.md y ESTILO.md).
"""
import json, math, os, subprocess
from functools import lru_cache
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

W, H, FPS, SS = 1080, 1920, 30, 2
SW, SH = 1500, 2200                       # tamaño de la escena (más grande que la pantalla para mover la cámara)
PISO = 1720                               # y de los pies en la escena
TINTA = "#2b1b17"
AQUI = os.path.dirname(os.path.abspath(__file__))

@lru_cache(None)
def fuente(tam, cual="anton"):
    rutas = {"anton": [os.path.join(AQUI, "fuentes", "Anton-Regular.ttf")],
             "bold": ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "C:/Windows/Fonts/arialbd.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"]}[cual]
    for r in rutas + ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
        if os.path.exists(r): return ImageFont.truetype(r, tam)
    return ImageFont.load_default()

def cl(x): return max(0.0, min(1.0, x))
def sm(x): u = cl(x); return u * u * (3 - 2 * u)
def atras(u):
    c1 = 1.70158; c3 = c1 + 1; x = cl(u) - 1; return 1 + c3 * x ** 3 + c1 * x ** 2
def azar(n): x = math.sin(n * 127.1 + 311.7) * 43758.5453; return x - math.floor(x)
def lerp(a, b, u): return a + (b - a) * u

class Lapiz:
    """dibujo con contorno: cada figura se pinta primero en tinta (más grande) y luego en color"""
    def __init__(self, im, k=1, borde=7):
        self.d, self.k, self.b = ImageDraw.Draw(im, "RGBA"), k, borde
    def _p(self, pts): return [(x * self.k, y * self.k) for x, y in pts]
    def elipse(self, x0, y0, x1, y1, col, borde=None):
        b = (self.b if borde is None else borde) * self.k
        if b: self.d.ellipse([x0 * self.k - b, y0 * self.k - b, x1 * self.k + b, y1 * self.k + b], fill=TINTA)
        self.d.ellipse([x0 * self.k, y0 * self.k, x1 * self.k, y1 * self.k], fill=col)
    def rect(self, x0, y0, x1, y1, col, r=0, borde=None):
        b = (self.b if borde is None else borde) * self.k
        if b: self.d.rounded_rectangle([x0 * self.k - b, y0 * self.k - b, x1 * self.k + b, y1 * self.k + b], radius=r * self.k + b, fill=TINTA)
        self.d.rounded_rectangle([x0 * self.k, y0 * self.k, x1 * self.k, y1 * self.k], radius=r * self.k, fill=col)
    def poli(self, pts, col, borde=None):
        b = (self.b if borde is None else borde) * self.k
        if b: self.d.polygon(self._p(pts), fill=TINTA, outline=TINTA, width=int(b * 2))
        self.d.polygon(self._p(pts), fill=col)
    def linea(self, pts, col, w, borde=None):
        b = (self.b if borde is None else borde)
        if b: self.d.line(self._p(pts), fill=TINTA, width=int((w + 2 * b) * self.k), joint="curve")
        self.d.line(self._p(pts), fill=col, width=int(w * self.k), joint="curve")
        if b:  # puntas redondas
            for x, y in (pts[0], pts[-1]): r = (w / 2 + b) * self.k; self.d.ellipse([x * self.k - r, y * self.k - r, x * self.k + r, y * self.k + r], fill=TINTA)
        for x, y in (pts[0], pts[-1]): r = w / 2 * self.k; self.d.ellipse([x * self.k - r, y * self.k - r, x * self.k + r, y * self.k + r], fill=col)
    def arco(self, caja, a0, a1, col, w):
        self.d.arc([v * self.k for v in caja], a0, a1, fill=col, width=int(w * self.k))
    def texto(self, x, y, s, tam, col, borde=TINTA, bw=6, cual="anton"):
        self.d.text((x * self.k, y * self.k), s, font=fuente(int(tam * self.k), cual), fill=col, anchor="mm", stroke_width=int(bw * self.k), stroke_fill=borde)

# ------------------------------------------------------------------ personajes: cabeza de fruta + cuerpo con ropa
PIEL = "#f7c79a"
ELENCO = {
    "valentina": dict(fruta="fresa", nombre="VALENTINA", col="#ff5a6e", fem=True, iris="#7a3b1e",
                      ropa=dict(torso="camiseta", c_torso="#ffffff", pantalon="falda", c_pant="#3b5bdb", zapatos="#ff8fb1", delantal="#ffd6e0"), extra=["diadema"]),
    "rodrigo": dict(fruta="mango", nombre="RODRIGO", col="#ffb030", fem=False, iris="#3b2a1a",
                    ropa=dict(torso="saco", c_torso="#24305e", pantalon="pantalon", c_pant="#24305e", zapatos="#3a2418", corbata="#d1002a"), extra=[]),
    "pina": dict(fruta="pina", nombre="DOÑA PIÑA", col="#f6c431", fem=True, iris="#2f6b3a",
                 ropa=dict(torso="vestido", c_torso="#7a1fa2", pantalon="vestido", c_pant="#7a1fa2", zapatos="#ffd23f"), extra=["perlas", "labios", "bolso"]),
    "uva": dict(fruta="uva", nombre="UVA CRISTAL", col="#c07aff", fem=True, iris="#5a2a8a",
                ropa=dict(torso="vestido", c_torso="#ff9ec7", pantalon="vestido", c_pant="#ff9ec7", zapatos="#ffffff"), extra=["tiara", "labios"]),
    "lucho": dict(fruta="limon", nombre="LUCHO", col="#c8e03a", fem=False, iris="#3b2a1a",
                  ropa=dict(torso="sudadera", c_torso="#8d8f99", pantalon="pantalon", c_pant="#3d5a99", zapatos="#ffffff"), extra=["gorra"]),
    "coco": dict(fruta="coco", nombre="DON COCO", col="#c08a5a", fem=False, iris="#3b2a1a",
                 ropa=dict(torso="camisa", c_torso="#f2e3c6", pantalon="pantalon", c_pant="#6b4a2a", zapatos="#3a2418"), extra=["bigote", "sombrero", "baston", "barba"]),
}
FRUTAS = {"fresa": ("#ee3a4a", "#c8232f"), "mango": ("#ffb347", "#ff7a3d"), "pina": ("#f8c93a", "#d9a01c"),
          "uva": ("#9a4fd6", "#6e2fa8"), "limon": ("#d6ec4a", "#a8c21e"), "coco": ("#8a5a33", "#5e3a1c")}

def _cabeza(L, fruta, cx, cy, r):
    c, s = FRUTAS[fruta]
    if fruta == "fresa":
        L.poli([(cx - r * 1.02, cy - r * 0.25), (cx + r * 1.02, cy - r * 0.25), (cx + r * 0.55, cy + r * 0.85), (cx, cy + r * 1.08), (cx - r * 0.55, cy + r * 0.85)], c)
        L.elipse(cx - r * 1.05, cy - r * 0.95, cx + r * 1.05, cy + r * 0.55, c)
        L.d.ellipse([(cx - r * 1.02) * L.k, (cy - r * 0.92) * L.k, (cx + r * 1.02) * L.k, (cy + r * 0.52) * L.k], fill=c)
        L.d.polygon(L._p([(cx - r * 0.98, cy - r * 0.2), (cx + r * 0.98, cy - r * 0.2), (cx + r * 0.52, cy + r * 0.82), (cx, cy + r * 1.03), (cx - r * 0.52, cy + r * 0.82)]), fill=c)
        for i in range(18):
            x, y = cx + (azar(i) - 0.5) * r * 1.7, cy - r * 0.7 + azar(i + 30) * r * 1.5
            if abs(x - cx) < r * (0.95 - max(0, (y - cy) / r) * 0.6) and not (abs(x - cx) < r * 0.75 and cy - r * 0.45 < y < cy + r * 0.55):
                L.d.ellipse([(x - 5) * L.k, (y - 7) * L.k, (x + 5) * L.k, (y + 7) * L.k], fill="#ffe27a")
        for a in range(-2, 3):
            L.poli([(cx, cy - r * 0.9), (cx + a * r * 0.32 - r * 0.2, cy - r * 1.12), (cx + a * r * 0.42, cy - r * 1.3 + abs(a) * 14), (cx + a * r * 0.32 + r * 0.2, cy - r * 1.1)], "#3fa63a", 5)
    elif fruta == "mango":
        L.elipse(cx - r * 0.95, cy - r * 1.05, cx + r * 1.0, cy + r * 0.95, c)
        L.d.ellipse([(cx + r * 0.05) * L.k, (cy - r * 0.95) * L.k, (cx + r * 0.9) * L.k, (cy - r * 0.05) * L.k], fill=s)
        L.linea([(cx + 10, cy - r * 1.05), (cx + 20, cy - r * 1.3)], "#6b4a2a", 9, 4); L.poli([(cx + 22, cy - r * 1.25), (cx + r * 0.7, cy - r * 1.45), (cx + r * 0.75, cy - r * 1.2), (cx + 40, cy - r * 1.1)], "#3fa63a", 5)
    elif fruta == "pina":
        for a in range(-4, 5):
            L.poli([(cx + a * 10 - 14, cy - r * 0.95), (cx + a * r * 0.13, cy - r * 1.9 + abs(a) * r * 0.13), (cx + a * 10 + 14, cy - r * 0.95)], "#3fa63a" if a % 2 else "#5cc24a", 4)
        L.elipse(cx - r * 0.95, cy - r * 1.05, cx + r * 0.95, cy + r * 1.0, c)
        for i in range(-5, 6):
            for sgn in (1, -1):
                x0 = cx + i * r * 0.36
                pts = [(x0, cy - r * 1.0), (x0 + sgn * r * 1.4, cy + r * 1.0)]
                pass
        for gx in range(-6, 7):                                             # trama de rombos solo dentro del óvalo
            for gy in range(-6, 7):
                x, y = cx + gx * r * 0.26 + (gy % 2) * r * 0.13, cy + gy * r * 0.3
                if ((x - cx) / (r * 0.85)) ** 2 + ((y - cy) / (r * 0.9)) ** 2 < 1 and not (abs(x - cx) < r * 0.7 and cy - r * 0.45 < y < cy + r * 0.7):
                    q = r * 0.1; L.d.polygon(L._p([(x, y - q), (x + q, y), (x, y + q), (x - q, y)]), outline=s, width=3 * L.k)
    elif fruta == "uva":
        for x, y, rr in [(-0.55, -0.55, 0.5), (0.55, -0.55, 0.5), (0, -0.85, 0.48), (-0.75, 0.15, 0.48), (0.75, 0.15, 0.48), (0, 0.6, 0.5)]:
            L.elipse(cx + x * r - rr * r, cy + y * r - rr * r, cx + x * r + rr * r, cy + y * r + rr * r, c, 5)
        L.d.ellipse([(cx - r * 0.8) * L.k, (cy - r * 0.8) * L.k, (cx + r * 0.8) * L.k, (cy + r * 0.85) * L.k], fill=c)
        L.linea([(cx, cy - r * 1.3), (cx + 10, cy - r * 1.55)], "#6b4a2a", 8, 4)
    elif fruta == "limon":
        L.poli([(cx - 18, cy - r * 1.0), (cx, cy - r * 1.22), (cx + 18, cy - r * 1.0)], c, 5)
        L.elipse(cx - r * 1.0, cy - r * 1.05, cx + r * 1.0, cy + r * 0.95, c)
        for i in range(14): x, y = cx + (azar(i + 5) - 0.5) * r * 1.6, cy + (azar(i + 9) - 0.5) * r * 1.6; L.d.ellipse([(x - 3) * L.k, (y - 3) * L.k, (x + 3) * L.k, (y + 3) * L.k], fill=s)
    elif fruta == "coco":
        L.elipse(cx - r * 1.0, cy - r * 1.0, cx + r * 1.0, cy + r * 1.0, c)
        for i in range(40):
            a = azar(i) * math.pi * 2; rr = r * (0.3 + 0.65 * azar(i + 3)); x, y = cx + math.cos(a) * rr, cy + math.sin(a) * rr
            L.d.line([(x * L.k, y * L.k), ((x + 12) * L.k, (y + 5) * L.k)], fill=s, width=3 * L.k)
        L.d.ellipse([(cx - r * 0.75) * L.k, (cy - r * 0.6) * L.k, (cx + r * 0.75) * L.k, (cy + r * 0.8) * L.k], fill="#a8784a")

CEJAS = {"neutral": (0, 0), "feliz": (-6, -4), "triste": (-2, 14), "llora": (-2, 16), "enojo": (8, -18), "sorpresa": (-18, 0), "malvada": (2, -16), "duda": (0, 8)}

def _cara(L, p, cx, cy, r, emo, boca, ojos, mira):
    k = L.k
    sep, er = r * 0.42, r * 0.33 * (1.12 if emo == "sorpresa" else 1)
    for lado in (-1, 1):
        ex, ey = cx + lado * sep, cy - r * 0.02
        if ojos > 0.2:
            L.elipse(ex - er, ey - er * ojos, ex + er, ey + er * ojos, "white", 5)
            ir = er * 0.55; px = ex + mira * er * 0.35
            L.d.ellipse([(px - ir) * k, (ey - ir * ojos) * k, (px + ir) * k, (ey + ir * ojos) * k], fill=p["iris"])
            L.d.ellipse([(px - ir * 0.5) * k, (ey - ir * 0.5 * ojos) * k, (px + ir * 0.5) * k, (ey + ir * 0.5 * ojos) * k], fill="#140b08")
            L.d.ellipse([(px - ir * 0.15 - 8) * k, (ey - ir * 0.55 * ojos - 4) * k, (px - ir * 0.15 + 4) * k, (ey - ir * 0.55 * ojos + 8) * k], fill="white")
        else:
            L.arco([ex - er, ey - er * 0.6, ex + er, ey + er * 0.9], 200, 340, TINTA, 7)
        if p["fem"]:
            for j in range(3): L.d.line([((ex + lado * er * (0.5 + j * 0.3)) * k, (ey - er * 0.85) * k), ((ex + lado * er * (0.7 + j * 0.35)) * k, (ey - er * 1.15 - j * 3) * k)], fill=TINTA, width=5 * k)
        alto, ang = CEJAS.get(emo, (0, 0))
        if emo == "malvada" and lado == 1: alto, ang = -10, 8
        y0 = ey - er - 20 + alto
        L.d.line([((ex - lado * er * 0.9) * k, (y0 + ang * 0.5) * k), ((ex + lado * er * 0.9) * k, (y0 - ang * 0.5) * k)], fill="#5a3a22", width=11 * k)
    if "gafas" in p["extra"]:
        for lado in (-1, 1):
            ex = cx + lado * sep; L.d.ellipse([(ex - er - 8) * k, (cy - er - 8) * k, (ex + er + 8) * k, (cy + er + 8) * k], outline=TINTA, width=6 * k)
    # mejillas y nariz
    for lado in (-1, 1): L.d.ellipse([(cx + lado * r * 0.62 - 26) * k, (cy + r * 0.3 - 12) * k, (cx + lado * r * 0.62 + 26) * k, (cy + r * 0.3 + 12) * k], fill=(255, 120, 140, 110))
    L.d.ellipse([(cx - 7) * k, (cy + r * 0.2 - 5) * k, (cx + 7) * k, (cy + r * 0.2 + 5) * k], fill=(160, 70, 60))
    my = cy + r * 0.48
    if "bigote" in p["extra"]:
        L.elipse(cx - 55, my - 30, cx, my - 6, "white", 4); L.elipse(cx, my - 30, cx + 55, my - 6, "white", 4)
    labios = "#d1002a" if "labios" in p["extra"] else TINTA
    if boca > 0.1:
        a, b = 16 + 14 * boca, 8 + 26 * boca
        L.elipse(cx - a, my - b * 0.3, cx + a, my + b, "#5a1420", 5)
        L.d.ellipse([(cx - a * 0.55) * k, (my + b * 0.35) * k, (cx + a * 0.55) * k, (my + b * 0.9) * k], fill="#ff6b7a")
    elif emo in ("feliz",): L.arco([cx - 32, my - 26, cx + 32, my + 16], 20, 160, labios, 7)
    elif emo in ("triste", "llora"): L.arco([cx - 26, my + 4, cx + 26, my + 40], 200, 340, labios, 7)
    elif emo == "malvada": L.arco([cx - 38, my - 30, cx + 24, my + 8], 10, 130, labios, 8)
    elif emo == "sorpresa": L.elipse(cx - 13, my - 4, cx + 13, my + 24, "#5a1420", 5)
    elif emo == "enojo": L.d.line([((cx - 24) * k, (my + 8) * k), ((cx + 24) * k, (my + 2) * k)], fill=labios, width=7 * k)
    else: L.arco([cx - 22, my - 12, cx + 22, my + 10], 30, 150, labios, 6)
    if emo == "llora":
        for lado in (-1, 1): L.d.polygon(L._p([(cx + lado * sep - 10, cy + er * 0.6), (cx + lado * sep + 10, cy + er * 0.6), (cx + lado * sep + 6, cy + r * 0.95), (cx + lado * sep - 6, cy + r * 0.95)]), fill="#7fd0ff")

POSES = {   # (hombro → codo → mano) para izquierda y derecha, relativo al cuerpo
    "normal": [((-95, 0), (-120, 120), (-118, 230)), ((95, 0), (120, 120), (118, 230))],
    "jarra": [((-95, 0), (-165, 90), (-92, 150)), ((95, 0), (165, 90), (92, 150))],
    "arriba": [((-95, 0), (-170, -90), (-150, -210)), ((95, 0), (170, -90), (150, -210))],
    "senala": [((-95, 0), (-120, 120), (-118, 230)), ((95, 0), (220, -10), (330, -40))],
    "tapa": [((-95, 0), (-80, 60), (-25, -120)), ((95, 0), (80, 60), (25, -120))],
    "ofrece": [((-95, 0), (-120, 120), (-118, 230)), ((95, 0), (190, 60), (270, 40))],
    "rasca": [((-95, 0), (-120, 120), (-118, 230)), ((95, 0), (175, -60), (95, -170))],
    "brazos": [((-95, 0), (-30, 90), (60, 70)), ((95, 0), (30, 90), (-60, 70))],
}

def _cuerpo(L, p, pose, bx, by):
    """torso (by = hombros), piernas, ropa y brazos; devuelve la posición de las manos"""
    ro, k = p["ropa"], L.k
    # piernas y zapatos
    if ro["pantalon"] in ("pantalon",):
        L.rect(bx - 80, by + 260, bx - 8, by + 470, ro["c_pant"]); L.rect(bx + 8, by + 260, bx + 80, by + 470, ro["c_pant"])
    elif ro["pantalon"] == "falda":
        L.rect(bx - 60, by + 300, bx - 22, by + 470, PIEL); L.rect(bx + 22, by + 300, bx + 60, by + 470, PIEL)
        L.poli([(bx - 100, by + 250), (bx + 100, by + 250), (bx + 130, by + 360), (bx - 130, by + 360)], ro["c_pant"])
    else:  # vestido largo
        L.rect(bx - 55, by + 360, bx - 20, by + 470, PIEL); L.rect(bx + 20, by + 360, bx + 55, by + 470, PIEL)
        L.poli([(bx - 100, by + 150), (bx + 100, by + 150), (bx + 150, by + 400), (bx - 150, by + 400)], ro["c_pant"])
    L.elipse(bx - 95, by + 448, bx - 5, by + 490, ro["zapatos"], 6); L.elipse(bx + 5, by + 448, bx + 95, by + 490, ro["zapatos"], 6)
    # torso
    L.rect(bx - 22, by - 40, bx + 22, by + 10, PIEL, 4)
    L.rect(bx - 105, by - 5, bx + 105, by + 280, ro["c_torso"], 26)
    if ro["torso"] == "sudadera":
        L.rect(bx - 70, by + 150, bx + 70, by + 240, "#6f717a", 10, 5)
        for x in (-20, 20): L.d.line([((bx + x) * k, (by + 5) * k), ((bx + x) * k, (by + 90) * k)], fill="white", width=5 * k)
    if ro["torso"] == "saco":
        L.poli([(bx - 30, by), (bx + 30, by), (bx, by + 150)], "white", 4)
        L.poli([(bx - 8, by + 10), (bx + 8, by + 10), (bx + 14, by + 120), (bx, by + 145), (bx - 14, by + 120)], ro.get("corbata", "#d1002a"), 4)
    if ro["torso"] == "camisa":
        for j in range(4): L.d.ellipse([(bx - 5) * k, (by + 40 + j * 55) * k, (bx + 5) * k, (by + 50 + j * 55) * k], fill=TINTA)
    if "delantal" in ro:
        L.rect(bx - 75, by + 90, bx + 75, by + 300, ro["delantal"], 18, 5); L.rect(bx - 35, by + 190, bx + 35, by + 245, "#ffffff", 8, 4)
    if "perlas" in p["extra"]:
        for i in range(9): a = math.pi * (0.15 + 0.7 * i / 8); x, y = bx + 60 * math.cos(a), by + 15 + 30 * math.sin(a); L.d.ellipse([(x - 9) * k, (y - 9) * k, (x + 9) * k, (y + 9) * k], fill="#fffaf0", outline=TINTA, width=2 * k)
    # brazos
    manos = []
    for (h, c, m) in POSES[pose]:
        pts = [(bx + h[0], by + 30 + h[1]), (bx + c[0], by + 30 + c[1]), (bx + m[0], by + 30 + m[1])]
        L.linea(pts, ro["c_torso"] if ro["torso"] != "vestido" else PIEL, 46, 6)
        L.elipse(pts[2][0] - 24, pts[2][1] - 24, pts[2][0] + 24, pts[2][1] + 24, PIEL, 6)
        manos.append(pts[2])
    return manos

def _prop(L, prop, x, y):
    if prop == "vaso":
        L.poli([(x - 30, y - 70), (x + 30, y - 70), (x + 22, y + 10), (x - 22, y + 10)], "#ff9a1a", 6); L.rect(x - 34, y - 80, x + 34, y - 66, "#ffe0b0", 4, 5)
        L.linea([(x + 10, y - 80), (x + 30, y - 120)], "#ff4f9a", 8, 3)
    elif prop == "sobre":
        L.rect(x - 70, y - 45, x + 70, y + 45, "#f6ecd8", 6, 6); L.poli([(x - 70, y - 45), (x, y + 5), (x + 70, y - 45)], "#e8dcc2", 4)
    elif prop == "bolso":
        L.rect(x - 45, y, x + 45, y + 70, "#7a3a1a", 10, 6); L.arco([x - 30, y - 40, x + 30, y + 20], 180, 360, TINTA, 8)
    elif prop == "anillo":
        L.d.ellipse([(x - 26) * L.k, (y - 26) * L.k, (x + 26) * L.k, (y + 26) * L.k], outline="#ffd23f", width=10 * L.k); L.poli([(x, y - 50), (x - 16, y - 26), (x + 16, y - 26)], "#bfefff", 4)
    elif prop == "botella":
        L.rect(x - 24, y - 90, x + 24, y + 60, "#cfe8f6", 12, 5); L.rect(x - 12, y - 115, x + 12, y - 88, "#3d7bd8", 4, 4)

@lru_cache(maxsize=4096)
def personaje(quien, emo="neutral", boca=0, ojos=4, mira=0, pose="normal", prop=None):
    """sprite RGBA 700x1000 (pies en y=990). Se dibuja al doble y se reduce (bordes suaves)."""
    p, k = ELENCO[quien], SS
    im = Image.new("RGBA", (700 * k, 1000 * k), (0, 0, 0, 0)); L = Lapiz(im, k)
    bx, by = 350, 500
    manos = _cuerpo(L, p, pose, bx, by)
    cx, cy, r = bx, by - 210, 175
    _cabeza(L, p["fruta"], cx, cy, r)
    if "tiara" in p["extra"]: L.poli([(cx - 70, cy - r * 0.95), (cx - 50, cy - r * 1.25), (cx - 20, cy - r * 1.05), (cx, cy - r * 1.35), (cx + 20, cy - r * 1.05), (cx + 50, cy - r * 1.25), (cx + 70, cy - r * 0.95)], "#e8f6ff", 5)
    if "diadema" in p["extra"]: L.arco([cx - r * 0.95, cy - r * 1.0, cx + r * 0.95, cy + r * 0.2], 200, 340, "#ff9ec7", 18)
    if "gorra" in p["extra"]: L.elipse(cx - r * 0.95, cy - r * 1.1, cx + r * 0.95, cy - r * 0.35, "#1d8fd8", 6); L.poli([(cx + r * 0.6, cy - r * 0.55), (cx + r * 1.45, cy - r * 0.5), (cx + r * 1.4, cy - r * 0.35), (cx + r * 0.6, cy - r * 0.38)], "#1570b0", 6)
    if "sombrero" in p["extra"]: L.elipse(cx - r * 1.3, cy - r * 0.9, cx + r * 1.3, cy - r * 0.6, "#d9c39a", 6); L.rect(cx - r * 0.7, cy - r * 1.45, cx + r * 0.7, cy - r * 0.75, "#d9c39a", 30, 6); L.rect(cx - r * 0.7, cy - r * 0.95, cx + r * 0.7, cy - r * 0.8, "#7a4a26", 0, 0)
    _cara(L, p, cx, cy + 10, r, emo, boca / 4, ojos / 4, mira / 2)
    if "barba" in p["extra"]: L.d.ellipse([(cx - 60) * k, (cy + r * 0.62) * k, (cx + 60) * k, (cy + r * 1.05) * k], fill="white", outline=TINTA, width=5 * k)
    if prop: _prop(L, prop, *manos[1])
    if "bolso" in p["extra"] and prop != "bolso": _prop(L, "bolso", manos[0][0], manos[0][1] - 10)
    if "baston" in p["extra"]: L.linea([(manos[0][0], manos[0][1]), (manos[0][0] - 10, 990)], "#7a4a26", 14, 5)
    sombra = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sombra).ellipse([(bx - 150) * k, 970 * k, (bx + 150) * k, 1000 * k], fill=(0, 0, 0, 60))
    sombra.alpha_composite(im)
    return sombra.resize((700, 1000), Image.LANCZOS)

# ------------------------------------------------------------------ escenarios con capas (fondo, medio, frente) y luces
def _grad(im, caja, c0, c1, vertical=True):
    x0, y0, x1, y1 = caja; w, h = x1 - x0, y1 - y0
    a = np.linspace(0, 1, h if vertical else w)
    c0, c1 = np.array(Image.new("RGB", (1, 1), c0).getpixel((0, 0)), float), np.array(Image.new("RGB", (1, 1), c1).getpixel((0, 0)), float)
    g = (c0[None] + (c1 - c0)[None] * a[:, None]).astype(np.uint8)
    arr = np.repeat(g[:, None, :], w, axis=1) if vertical else np.repeat(g[None, :, :], h, axis=0)
    im.paste(Image.fromarray(arr, "RGB"), (x0, y0))

@lru_cache(None)
def escenario(nombre):
    """devuelve {fondo, medio, frente (RGBA del tamaño de la escena), luces: [(x, y, radio, color)]}"""
    k = 1
    fondo = Image.new("RGB", (SW, SH), "#000"); medio = Image.new("RGBA", (SW, SH), (0, 0, 0, 0)); frente = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
    F, M, R = Lapiz(fondo, k), Lapiz(medio, k), Lapiz(frente, k)
    luces = []
    if nombre == "sala":
        _grad(fondo, (0, 0, SW, PISO - 120), "#efe3c4", "#e2cfa6")
        for i in range(9): x, y = azar(i) * SW, 200 + azar(i + 4) * 1200; F.d.ellipse([x - 70, y - 30, x + 70, y + 30], fill=(205, 186, 150))
        F.rect(-10, PISO - 260, SW + 10, PISO - 230, "#c9b48a", 0, 5)
        F.rect(160, 240, 560, 760, "#8a5a33", 0, 8); _grad(fondo, (180, 260, 540, 740), "#bfe6ff", "#6fb8f0"); F.d.polygon([(180, 740), (540, 740), (460, 260), (260, 260)], fill="#8fd0ff")
        F.rect(980, 620, 1290, PISO - 120, "#9a6436", 0, 8); F.rect(1020, 660, 1250, PISO - 160, "#b07a46", 0, 6); F.elipse(1225, 1160, 1245, 1180, "#ffd23f", 4)
        _grad(fondo, (0, PISO - 120, SW, SH), "#b98352", "#8a5a33")
        for i in range(12): F.d.line([(i * 130, PISO - 120), (i * 130 - 60, SH)], fill="#7a4a26", width=5)
        M.rect(80, 1080, 1180, 1500, "#7d9a62", 60); M.rect(40, 1180, 190, 1560, "#6f8c55", 50); M.rect(1080, 1180, 1230, 1560, "#6f8c55", 50); M.rect(150, 1330, 1120, 1560, "#86a46a", 30)
        M.linea([(700, 0), (700, 140)], TINTA, 6, 0); M.poli([(620, 140), (780, 140), (740, 100), (660, 100)], "#c9cdd6", 6); M.elipse(655, 130, 745, 220, "#fff6c8", 6)
        luces += [(700, 180, 520, (255, 236, 170)), (360, 500, 420, (190, 230, 255))]
        R.rect(150, 1900, 1350, 1960, "#7a4a26", 6); R.rect(200, 1960, 240, 2150, "#6b3d1e", 4); R.rect(1260, 1960, 1300, 2150, "#6b3d1e", 4)
        for j, (x, col) in enumerate([(300, "#e8283a"), (420, "#3fa63a"), (980, "#e8283a")]): R.rect(x, 1800, x + 60, 1900, col, 10, 6)
        R.elipse(560, 1870, 760, 1910, "white", 5); R.rect(820, 1850, 930, 1895, "#3d7bd8", 10, 5)
        for i in range(8): x, y = 100 + azar(i + 50) * 1300, 2000 + azar(i + 60) * 150; R.rect(x, y, x + 70, y + 30, ["#e8283a", "#ffffff", "#3d7bd8"][i % 3], 8, 5)
    elif nombre == "calle":
        _grad(fondo, (0, 0, SW, 1400), "#9fdcff", "#e8f6ff")
        for i, (x, col, w) in enumerate([(0, "#e8604a", 380), (380, "#ffd36a", 360), (740, "#6fd3c8", 380), (1120, "#b9a4ec", 400)]):
            F.rect(x, 300, x + w, PISO - 140, col, 0, 7); F.rect(x + 40, 900, x + w - 40, PISO - 160, "#d8f4ee" if i % 2 else "#fff1d6", 0, 6)
            F.rect(x + 30, 380, x + w - 30, 520, "#ffffff", 10, 6); F.texto(x + w / 2, 450, ["TIENDA", "JUGOS", "PAN", "BAZAR"][i], 70, ["#e8283a", "#3a1a10", "#1d6f68", "#5a2a8a"][i], TINTA, 0)
        F.rect(-10, PISO - 140, SW + 10, PISO + 60, "#d6d2c6", 0, 6)
        for i in range(12): F.d.line([(i * 140, PISO - 140), (i * 140, PISO + 60)], fill="#b9b4a6", width=6)
        F.rect(-10, PISO + 60, SW + 10, SH, "#3b3e47", 0, 0)
        for i in range(6): F.rect(60 + i * 260, PISO + 260, 220 + i * 260, PISO + 290, "#ffd23f", 0, 0)
        luces += [(1300, 120, 600, (255, 240, 200))]
        R.linea([(1380, 900), (1380, PISO + 40)], "#3a3f58", 22, 6); R.elipse(1320, 840, 1440, 920, "#fff2b0", 6)
    elif nombre == "mercado":
        _grad(fondo, (0, 0, SW, 1000), "#8fd8ff", "#ffe6b8"); _grad(fondo, (0, 700, SW, PISO), "#f6d29a", "#e8b874")
        for i, (x, col) in enumerate([(30, "#e8283a"), (520, "#2f9a3a"), (1010, "#1d8fd8")]):
            F.rect(x, 980, x + 460, 1520, "#c98a4a", 0, 7)
            for j in range(10): F.rect(x + j * 46, 860, x + 46 + j * 46, 1000, col if j % 2 == 0 else "white", 0, 5)
            for m in range(14): fx, fy = x + 50 + (m % 7) * 60, 1380 + (m // 7) * 64; F.elipse(fx - 28, fy - 28, fx + 28, fy + 28, ["#ff8a1a", "#e8283a", "#c8e03a", "#8b3fc8", "#f6c431"][(m + i) % 5], 4)
        F.rect(250, 600, 1250, 740, "#7a3a1a", 14, 8); F.texto(750, 670, "MERCADO SAN JUGO", 90, "#ffd23f", TINTA, 7)
        _grad(fondo, (0, PISO - 100, SW, SH), "#d9a066", "#b98352")
        luces += [(750, 300, 700, (255, 236, 190))]
        R.rect(80, 1640, 1420, 1920, "#ff6b8a", 20, 8); R.rect(60, 1610, 1440, 1660, "#ffffff", 14, 7); R.texto(750, 1790, "JUGOS VALENTINA", 110, "white", "#b51628", 9)
        for j in range(6): R.poli([(160 + j * 210, 1500), (240 + j * 210, 1500), (230 + j * 210, 1612), (170 + j * 210, 1612)], ["#ff8a1a", "#e8283a", "#c8e03a", "#8b3fc8", "#f6c431", "#ff8fb1"][j], 6)
    elif nombre == "mansion":
        _grad(fondo, (0, 0, SW, PISO - 100), "#4a1460", "#a8326e")
        for x in (90, 1410): F.rect(x - 60, 300, x + 60, PISO - 100, "#e8c66a", 10, 7)
        for x in (330, 1170): F.poli([(x - 160, 0), (x + 160, 0), (x + 80, PISO - 100), (x - 80, PISO - 100)], "#8a0f2a", 7)
        F.rect(420, 560, 1080, 700, "#fff0f6", 20, 8); F.texto(700, 632, "R", 90, "#d1002a", TINTA, 0); F.texto(870, 632, "UVA", 90, "#d1002a", TINTA, 0); F.d.text((760, 632), "♥", font=fuente(80, "bold"), fill="#d1002a", anchor="mm")
        for i in range(12): x = 120 + i * 115; F.elipse(x - 34, 420 + 40 * math.sin(i) - 44, x + 34, 420 + 40 * math.sin(i) + 44, ["#ff9ec7", "#ffd23f", "#c07aff"][i % 3], 5)
        for i in range(13):
            for j in range(6): F.rect(i * 120, PISO - 100 + j * 90, i * 120 + 120, PISO - 10 + j * 90, "#f4ecf6" if (i + j) % 2 else "#2a1430", 0, 0)
        M.linea([(750, 0), (750, 200)], "#e8c66a", 8, 4)
        for i in range(9): a = i / 8 * math.pi; M.elipse(750 + 190 * math.cos(a) - 22, 200 + 70 * math.sin(a) - 22, 750 + 190 * math.cos(a) + 22, 200 + 70 * math.sin(a) + 22, "#fff6c8", 4)
        luces += [(750, 230, 650, (255, 220, 160)), (90, 900, 300, (255, 200, 120)), (1410, 900, 300, (255, 200, 120))]
        M.rect(1180, 1420, 1440, 1700, "#fff0f6", 16, 7); M.rect(1215, 1310, 1405, 1430, "#ffc8dc", 16, 7); M.rect(1250, 1220, 1370, 1320, "#ffe0ec", 16, 7)
    return dict(fondo=fondo.convert("RGBA"), medio=medio, frente=frente, luces=luces)

@lru_cache(None)
def _brillo(radio, col):
    """mancha de luz radial (RGBA) para sumar sobre la imagen"""
    n = int(radio * 2); y, x = np.mgrid[0:n, 0:n]; d = np.sqrt((x - radio) ** 2 + (y - radio) ** 2) / radio
    a = np.clip(1 - d, 0, 1) ** 2.2
    arr = np.zeros((n, n, 4), np.uint8); arr[..., :3] = col; arr[..., 3] = (a * 150).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")

@lru_cache(None)
def _vineta(fuerza):
    y, x = np.mgrid[0:H, 0:W]; d = np.sqrt(((x - W / 2) / (W * 0.62)) ** 2 + ((y - H / 2) / (H * 0.6)) ** 2)
    a = (np.clip(d - 0.55, 0, 1) ** 1.6 * fuerza).clip(0, 255).astype(np.uint8)
    arr = np.zeros((H, W, 4), np.uint8); arr[..., 3] = a
    return Image.fromarray(arr, "RGBA")

@lru_cache(None)
def _degradado(c0, c1):
    """capa de color arriba→abajo (para el tono de la escena)"""
    a = np.linspace(0, 1, H)[:, None]
    c0, c1 = np.array(c0, float), np.array(c1, float)
    arr = np.zeros((H, W, 4), np.uint8); arr[..., :4] = (c0[None, None] + (c1 - c0)[None, None] * a[..., None]).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")

# ------------------------------------------------------------------ cámara viva
def camara(tm, t, claves_t, impactos):
    """posición (cx, cy), zoom y giro: base de la toma + deriva + respiración + golpe en palabras clave + temblor"""
    u = sm((t - tm["a"]) / max(0.01, tm["b"] - tm["a"]))
    (x0, y0, z0), (x1, y1, z1) = tm["cam"]
    cx, cy, z = lerp(x0, x1, u), lerp(y0, y1, u), lerp(z0, z1, u)
    cx += 18 * math.sin(t * 0.7 + 1.3) + 9 * math.sin(t * 1.9); cy += 12 * math.sin(t * 0.9) + 6 * math.cos(t * 2.3)   # deriva de mano
    z *= 1 + 0.018 * math.sin(t * 1.4)                                                                                  # respiración
    giro = 0.6 * math.sin(t * 0.8) + tm.get("giro", 0)
    for tc in claves_t:                                                                                               # golpe de zoom en la palabra clave
        dtc = t - tc
        if 0 <= dtc < 0.45: z *= 1 + 0.09 * math.sin(math.pi * cl(dtc / 0.45)) ** 0.6
    for ti, f in impactos:                                                                                            # temblor en impactos
        dti = t - ti
        if 0 <= dti < 0.4: a = f * (1 - dti / 0.4); cx += 26 * a * math.sin(t * 95); cy += 18 * a * math.cos(t * 83); giro += 2.2 * a * math.sin(t * 70)
    return cx, cy, z, giro

# ------------------------------------------------------------------ textos
def subtitulo(im, pal, t):
    """UNA palabra a la vez, amarilla y gruesa, que entra con rebote (estilo de la referencia)"""
    w = next((x for x in pal if x["a"] - 0.04 <= t < x["b"] + 0.05), None)
    if not w: return
    s = w["p"].upper().strip(",.;:…\"'")
    if not s: return
    e = 0.7 + 0.3 * atras((t - w["a"] + 0.04) / 0.16)
    tam = int(150 * e)
    d = ImageDraw.Draw(im)
    while d.textlength(s, font=fuente(tam)) > 940 and tam > 60: tam -= 6
    d.text((W / 2 + 6, 1250 + 8), s, font=fuente(tam), fill=(0, 0, 0, 160), anchor="mm", stroke_width=12, stroke_fill=(0, 0, 0, 160))
    d.text((W / 2, 1250), s, font=fuente(tam), fill="#ffe14d", anchor="mm", stroke_width=12, stroke_fill="#1a0f0a")

def texto_toma(im, tx, t, tm):
    dt = t - tm["a"] - tx.get("t", 0)
    if dt < 0 or (tx.get("dur") and dt > tx["dur"]): return
    d = ImageDraw.Draw(im); e = atras(dt / 0.3); tipo = tx.get("tipo", "grande")
    if tipo == "logo":
        d.rounded_rectangle([150, 120, 930, 300], radius=40, fill=(122, 15, 42, 235), outline="#ffd23f", width=8)
        d.text((540, 185), tx.get("serie", "CORAZÓN DE FRESA"), font=fuente(82), fill="#ffd23f", anchor="mm", stroke_width=5, stroke_fill="#3a0510")
        d.text((540, 262), tx["s"], font=fuente(46), fill="white", anchor="mm", stroke_width=4, stroke_fill="#3a0510")
    elif tipo == "carta":
        d.rounded_rectangle([110, 760, 970, 1060], radius=50, fill=(20, 5, 10, 225), outline="#ffd23f", width=8)
        d.text((540, 910), tx["s"], font=fuente(max(10, int(120 * e))), fill="#ffd23f", anchor="mm", stroke_width=6, stroke_fill="#3a0510")
    elif tipo == "seguir":
        y = 360; d.rounded_rectangle([250, y, 830, y + 110], radius=55, fill="#ff3f6e", outline="white", width=7)
        d.text((540, y + 56), tx.get("s", "SÍGUEME PARA EL CAPÍTULO 2"), font=fuente(54), fill="white", anchor="mm", stroke_width=4, stroke_fill="#1a0505")
    elif tipo == "final":
        # cierre fijo de todos los capítulos: CONTINUARÁ + botón SEGUIR que se toca
        a = cl(dt / 0.3)
        capa = Image.new("RGBA", (W, H), (10, 0, 6, int(170 * a))); im.alpha_composite(capa); d = ImageDraw.Draw(im)
        d.text((540, 640), "CONTINUARÁ…", font=fuente(int(150 * e)), fill="#ff3f6e", anchor="mm", stroke_width=10, stroke_fill="#1a0505")
        d.text((540, 800), tx.get("pregunta", "¿QUÉ VA A PASAR?"), font=fuente(84), fill="white", anchor="mm", stroke_width=7, stroke_fill="#1a0505")
        toca = dt > 1.0
        bw = 300 + 20 * math.sin(t * 8) * (not toca)
        d.rounded_rectangle([540 - bw, 1380, 540 + bw, 1530], radius=75, fill="#37d67a" if toca else "#ff3f6e", outline="white", width=8)
        d.text((540, 1455), "SIGUIENDO" if toca else "SÍGUEME", font=fuente(96), fill="white", anchor="mm", stroke_width=6, stroke_fill="#1a0505")
        d.text((540, 1620), tx.get("s", "PARA EL CAPÍTULO 2"), font=fuente(76), fill="#ffe14d", anchor="mm", stroke_width=7, stroke_fill="#1a0505")
        hx, hy = 760, 1500 + (0 if toca else 30 * abs(math.sin(t * 5)))
        d.ellipse([hx - 40, hy - 40, hx + 40, hy + 40], fill="#ffe0c7", outline="#1a0505", width=6); d.rounded_rectangle([hx - 16, hy - 110, hx + 16, hy - 20], radius=16, fill="#ffe0c7", outline="#1a0505", width=6)
    else:
        d.text((540, tx.get("y", 520)), tx["s"], font=fuente(max(10, int(tx.get("tam", 110) * e))), fill=tx.get("col", "white"), anchor="mm", stroke_width=9, stroke_fill="#1a0505")

# ------------------------------------------------------------------ armado del cuadro
def envolvente(wav, n):
    import soundfile as sf
    a, sr = sf.read(wav)
    if a.ndim > 1: a = a.mean(axis=1)
    paso = sr // FPS
    v = np.array([np.sqrt(np.mean(a[i * paso:(i + 1) * paso] ** 2)) if i * paso < len(a) else 0 for i in range(n)])
    return np.clip(v / (np.percentile(v[v > 0], 90) if (v > 0).any() else 1), 0, 1)

def _valor(v, t, a):
    """un valor fijo o una lista [(segundo dentro de la toma, valor), ...]"""
    if isinstance(v, list): return next((x for t0, x in reversed(v) if t >= a + t0), v[0][1])
    return v

def cuadro(TOMAS, t, TI, G, vol, fi, total, claves_t, limpio=False):
    i = next((j for j, x in enumerate(TOMAS) if x["a"] <= t < x["b"]), len(TOMAS) - 1); tm = TOMAS[i]
    esc = escenario(tm["escena"])
    quien = next((G["quien"][f["i"]] for f in TI["frases"] if f["a"] <= t < f["b"]), None)
    impactos = [(tm["a"] + e["t"], e.get("f", 1)) for e in tm.get("efectos", []) if e["tipo"] == "temblor"]
    cx, cy, z, giro = camara(tm, t, claves_t, impactos)
    par = lambda f: (int(-(cx - SW / 2) * f), int(-(cy - SH / 2) * f * 0.3))   # paralaje: el fondo se mueve menos, el frente más
    im = Image.new("RGBA", (SW, SH)); o = par(-0.12); im.alpha_composite(esc["fondo"], (0, 0)) if o == (0, 0) else im.paste(esc["fondo"], o)
    im.alpha_composite(esc["medio"])
    for ac in sorted(tm.get("actores", []), key=lambda a: a.get("z", 0)):
        q = ac["quien"]; s = ac.get("s", 1.0)
        entra = cl((t - tm["a"] - ac["entra"]) / 0.35) if "entra" in ac else 1
        if entra <= 0: continue
        parp = 0 if ((t + azar(len(q)) * 3) % 3.3) < 0.12 else 4
        boca = int(round(4 * vol[min(fi, len(vol) - 1)])) if quien == q else 0
        sp = personaje(q, _valor(ac.get("emo", "neutral"), t, tm["a"]), boca, parp, int(round(_valor(ac.get("mira", 0), t, tm["a"]) * 2)), _valor(ac.get("pose", "normal"), t, tm["a"]), ac.get("prop"))
        sw, sh = int(700 * s), int(1000 * s)
        sp = sp.resize((sw, sh), Image.BILINEAR)
        rebote = int(16 * abs(math.sin(t * 9))) if quien == q else int(5 * math.sin(t * 2.2 + len(q)))   # respira aunque no hable
        x = int(ac["x"] - sw / 2 + (1 - sm(entra)) * ac.get("desde", 0)); y = int(ac.get("y", PISO) - sh * 0.99) - rebote
        _pegar(im, sp, x, y)
    of = par(0.25); fr = esc["frente"]
    im.alpha_composite(fr.crop((max(0, -of[0]), max(0, -of[1]), SW, SH)), (max(0, of[0]), max(0, of[1])))
    for ef in tm.get("efectos", []): _efecto(im, ef, t, tm)
    for (lx, ly, lr, lc) in esc["luces"]:                                     # luces que brillan y respiran
        b = _brillo(int(lr * (1 + 0.04 * math.sin(t * 3 + lx))), lc); im.alpha_composite(b, (int(lx - b.width / 2), int(ly - b.height / 2))) if lx - b.width / 2 >= 0 and ly - b.height / 2 >= 0 else _pegar(im, b, int(lx - b.width / 2), int(ly - b.height / 2))
    # recorte de la cámara con zoom y giro
    cw, ch = W / z, H / z
    mg = 130
    cx, cy = min(max(cx, cw / 2 + mg), SW - cw / 2 - mg), min(max(cy, ch / 2 + mg), SH - ch / 2 - mg)
    pad = 60
    rec = im.crop((int(cx - cw / 2 - pad), int(cy - ch / 2 - pad), int(cx + cw / 2 + pad), int(cy + ch / 2 + pad)))
    if abs(giro) > 0.05: rec = rec.rotate(giro, resample=Image.BILINEAR, expand=False)
    rec = rec.crop((pad, pad, rec.width - pad, rec.height - pad)).resize((W, H), Image.BILINEAR)
    # barrido rápido entre tomas (desenfoque horizontal + corrimiento)
    dt0, dt1 = t - tm["a"], tm["b"] - t
    if i > 0 and dt0 < 0.12 or dt1 < 0.08 and i < len(TOMAS) - 1:
        u = (1 - dt0 / 0.12) if dt0 < 0.12 else (1 - dt1 / 0.08)
        rec = rec.filter(ImageFilter.BoxBlur(int(4 + 26 * u))); rec = ImageChops.offset(rec, int(140 * u * (1 if dt0 < 0.12 else -1)), 0)
    # tono, polvo, viñeta
    rec.alpha_composite(_degradado(tuple(tm.get("tono", (255, 200, 120, 26))), (40, 20, 80, 46)))
    d = ImageDraw.Draw(rec)
    for j in range(26):
        x = (azar(j) * W + t * (12 + 20 * azar(j + 3))) % W; y = (azar(j + 7) * H - t * (20 + 30 * azar(j + 1))) % H; r = 2 + 3 * azar(j + 5)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 250, 220, int(90 + 80 * math.sin(t * 2 + j))))
    rec.alpha_composite(_vineta(tm.get("vineta", 140)))
    if not limpio:
        for tx in tm.get("textos", []): texto_toma(rec, tx, t, tm)
        final = any(tx.get("tipo") == "final" for tx in tm.get("textos", []))
        if quien and not final:
            p = ELENCO[quien]; d = ImageDraw.Draw(rec); tw = d.textlength(p["nombre"], font=fuente(54))
            d.rounded_rectangle([540 - tw / 2 - 30, 1090, 540 + tw / 2 + 30, 1160], radius=35, fill=p["col"], outline="white", width=5)
            d.text((540, 1126), p["nombre"], font=fuente(54), fill="white", anchor="mm", stroke_width=4, stroke_fill="#1a0505")
        if not any(tx.get("tipo") == "final" for tx in tm.get("textos", [])): subtitulo(rec, TI["palabras"], t)
        ImageDraw.Draw(rec).rectangle([0, 0, int(W * t / total), 12], fill="#ff3f6e")
    for ef in tm.get("efectos", []):
        if ef["tipo"] == "destello" and 0 <= t - tm["a"] - ef["t"] < 0.25:
            rec = Image.blend(rec, Image.new("RGBA", (W, H), "white"), 0.9 * (1 - (t - tm["a"] - ef["t"]) / 0.25))
    return rec.convert("RGB")

def _pegar(im, sp, x, y):
    bx0, by0 = max(0, -x), max(0, -y); bx1, by1 = min(sp.width, im.width - x), min(sp.height, im.height - y)
    if bx1 > bx0 and by1 > by0: im.alpha_composite(sp.crop((bx0, by0, bx1, by1)), (max(0, x), max(0, y)))

def _efecto(im, ef, t, tm):
    tipo, dt = ef["tipo"], t - tm["a"]; d = ImageDraw.Draw(im)
    if tipo == "lluvia":
        for i in range(220):
            x = (azar(i) * SW + dt * 80) % SW; y = (azar(i + 7) * SH + dt * 2600 * (0.8 + 0.4 * azar(i + 3))) % SH
            d.line([(x, y), (x - 10, y + 60)], fill=(180, 210, 255, 150), width=4)
    elif tipo == "jugo" and dt >= ef["t"]:
        u = cl((dt - ef["t"]) / 0.45); (x0, y0), (x1, y1) = ef["de"], ef["a"]
        for i in range(30):
            v = cl(u * 1.4 - azar(i) * 0.4); x = lerp(x0, x1, v) + (azar(i + 3) - 0.5) * 110 * v; y = lerp(y0, y1, v) - 140 * math.sin(math.pi * v) + (azar(i + 5) - 0.5) * 70
            r = 16 + 16 * azar(i + 8); d.ellipse([x - r, y - r, x + r, y + r], fill="#ff9a1a", outline=TINTA, width=3)
    elif tipo == "brillo_obj" and dt >= ef["t"]:
        x, y = ef["x"], ef["y"]
        for j in range(10):
            a = j / 10 * math.pi * 2 + dt * 2; r0 = 60 + 10 * math.sin(dt * 8)
            d.line([(x + math.cos(a) * r0, y + math.sin(a) * r0), (x + math.cos(a) * (r0 + 60), y + math.sin(a) * (r0 + 60))], fill=(255, 245, 170, 230), width=8)
    elif tipo == "rayos":   # rayos de luz de ventana
        for j in range(4):
            a = 120 + 30 * math.sin(dt * 0.8 + j)
            capa = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(capa).polygon([(ef["x"] + j * 60, ef["y"]), (ef["x"] + j * 60 + 70, ef["y"]), (ef["x"] + 400 + j * 160, ef["y"] + 1500), (ef["x"] + 200 + j * 160, ef["y"] + 1500)], fill=(255, 250, 220, int(a * 0.25)))
            im.alpha_composite(capa)

def render(TOMAS, carpeta, salida="out/mudo.mp4", fotos=None, limpio=False, claves=()):
    """claves: palabras que llevan golpe de zoom (además de las marcadas en guion.json)"""
    TI = json.load(open(os.path.join(carpeta, "voz", "tiempos.json"), encoding="utf-8"))
    G = json.load(open(os.path.join(carpeta, "guion.json"), encoding="utf-8"))
    total = TI["total"] + 1.6
    n = int(total * FPS)
    vol = envolvente(os.path.join(carpeta, "voz", "voz.wav"), n + 2)
    lim = lambda s: "".join(c for c in s.lower() if c.isalnum())
    cl_set = {lim(c) for c in list(claves) + G.get("claves", [])}
    claves_t = [w["a"] for w in TI["palabras"] if lim(w["p"]) in cl_set]
    os.makedirs(os.path.join(carpeta, "out"), exist_ok=True)
    if fotos:
        for s in fotos:
            img = cuadro(TOMAS, s, TI, G, vol, int(s * FPS), total, claves_t, limpio)
            (img if limpio else img.resize((W // 2, H // 2))).save(os.path.join(carpeta, "out", f"{'portada' if limpio else 'foto'}_{s:05.2f}.png"))
        return
    pipe = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                             "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", os.path.join(carpeta, salida)], stdin=subprocess.PIPE)
    for fi in range(n):
        pipe.stdin.write(cuadro(TOMAS, fi / FPS, TI, G, vol, fi, total, claves_t).tobytes())
        if fi % 150 == 0: print(f"  {fi / FPS:5.1f}/{total:.1f} s", flush=True)
    pipe.stdin.close(); pipe.wait()
