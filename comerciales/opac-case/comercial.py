"""Comercial «¡El segundo producto a mitad de precio!» de Opac Case: edición automática con Python (Pillow + numpy + ffmpeg).

Junta los 8 clips de los compañeros en el orden del guion, quita silencios y errores, iguala las voces, pone el video
vertical 1080x1920, agrega acercamientos, golpes de zoom, textos animados, subtítulos, el logo, música alegre propia
(sin derechos de terceros) y efectos de sonido moderados. Saca la versión completa y la corta.

Uso:  python3 comerciales/opac-case/comercial.py completa|corta [fotos 1.0 5.2 ...]
Los textos de los subtítulos están en TEXTOS (corrígelos si alguna palabra no es exacta y vuelve a correr).
"""
import json, math, os, subprocess, sys
from functools import lru_cache
import numpy as np, soundfile as sf
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
CLIPS = os.environ.get("OPAC_CLIPS", "/tmp/claude-0/-home-user-Clade-videos-/920f7c84-2c99-5ee7-9a3b-451e3b30385d/scratchpad/opac")
W, H, FPS, SR = 1080, 1920, 30, 48000
AZUL, ROJO, AMARILLO, BLANCO, OSCURO = "#1f4fd8", "#e81f2c", "#ffd21f", "#ffffff", "#0b1230"
sys.path.insert(0, os.path.join(RAIZ, "canal-ingles"))
from comun_sonido import filtro, golpe, whoosh, campanita, chasquido, rng, db

# cara aproximada de cada compañero (fracción del cuadro) para centrar los acercamientos
CARA = {1: (0.5, 0.33), 2: (0.5, 0.36), 3: (0.5, 0.42), 4: (0.5, 0.3), 5: (0.5, 0.42), 6: (0.45, 0.5), 7: (0.5, 0.55), 8: (0.5, 0.4)}

# ------------------------------------------------------------------ textos (subtítulos) por clip: (inicio, fin) en el clip original
TEXTOS = {
    1: [(2.95, 5.6, "¡ALTO! Si esta semana piensas en comprar"), (5.6, 8.76, "accesorios para tu celular, ¡presta atención! Porque en"), (8.76, 12.9, "Opac Case tenemos una promoción que no te vas a querer perder.")],
    2: [(0.0, 3.79, "Imagínate que vienes por un estuche, un cargador, unos audífonos..."), (3.79, 6.21, "escoges tu primer producto a su precio normal,"), (6.21, 8.55, "pero lo mejor está cuando eliges el segundo...")],
    3: [(0.5, 3.48, "¡Porque el segundo producto te lo llevas a mitad de precio!"), (4.78, 7.5, "Sí, te compras uno al precio normal y en el segundo"), (7.6, 10.2, "aprovechas el descuento a mitad de precio.")],
    4: [(0.45, 3.07, "¿Necesitas renovar tu estuche?"), (3.07, 6.01, "¿Buscas accesorios para tu celular? Es la oportunidad"), (6.01, 9.15, "de llevarte más por menos.")],
    8: [(0.43, 3.62, "¡Pero mucho ojo! Esta no es una promoción de todos los días,"), (3.62, 6.3, "esta es una promoción de tres días a la semana: martes, miércoles y jueves."), (6.3, 7.2, "¡No la desaproveches!")],
    6: [(0.0, 2.25, "Y lo mejor es que nos encuentras en"), (2.25, 5.84, "nuestras islas de Opac Case, con una gran variedad de accesorios"), (5.84, 7.9, "para todo lo que necesita tu celular. ¡Te esperamos!")],
    5: [(4.42, 7.5, "Y no te quedes sin tu promoción, no olvides compartirla"), (7.5, 10.7, "con amigos, familiares o con tu pareja, para que llegue a más personas.")],
    7: [(0.0, 3.34, "¡Y ya lo sabes! Martes, miércoles y jueves, tu producto a mitad de precio."), (3.34, 5.25, "¡Te esperamos en Opac Case!")],
}
CLAVES = {"alto", "opac", "case", "promoción", "estuche", "cargador", "audífonos", "segundo", "mitad", "precio", "descuento", "accesorios", "ojo", "tres", "martes", "miércoles", "jueves", "islas", "compartirla", "amigos", "esperamos"}

# ------------------------------------------------------------------ las dos versiones: piezas de video (clip, entrada, salida)
# tipo "voz": con la voz del clip; "broll": solo imagen (música). Los "cortes" cambian la imagen por otro clip sin cortar la voz.
VERSIONES = {
    "completa": [
        dict(id="alto", clip=1, a=2.88, b=12.95),
        dict(id="imagina", clip=2, a=0.0, b=8.6),
        dict(id="revela", clip=3, a=0.5, b=3.5), dict(id="revela2", clip=3, a=4.75, b=10.25),
        dict(id="productos", clip=4, a=0.45, b=9.2, cortes=[(1.4, 2.5, 4, 10.6), (4.2, 5.3, 4, 13.2)]),
        dict(id="broll", clip=4, a=10.0, b=12.6, tipo="broll"),
        dict(id="urgencia", clip=8, a=0.43, b=7.22),
        dict(id="islas", clip=6, a=0.0, b=7.93, cortes=[(2.6, 3.9, 4, 15.6), (4.0, 5.2, 7, 0.3)]),
        dict(id="compartir", clip=5, a=4.4, b=10.75),
        dict(id="cierre", clip=7, a=0.0, b=5.28),
        dict(id="final", tipo="final", dur=3.2),
    ],
    "corta": [
        dict(id="revela", clip=3, a=0.5, b=3.5),
        dict(id="urgencia", clip=8, a=0.43, b=7.22),
        dict(id="productos", clip=4, a=6.0, b=9.2),
        dict(id="broll", clip=4, a=10.0, b=12.0, tipo="broll"),
        dict(id="islas", clip=6, a=2.25, b=7.93, cortes=[(1.0, 2.2, 4, 15.6)]),
        dict(id="cierre", clip=7, a=0.0, b=5.28),
        dict(id="final", tipo="final", dur=3.0),
    ],
}

# ------------------------------------------------------------------ utilidades
def cl(x): return max(0.0, min(1.0, x))
def sm(x): u = cl(x); return u * u * (3 - 2 * u)
def atras(u):
    c1 = 1.70158; c3 = c1 + 1; x = cl(u) - 1; return 1 + c3 * x ** 3 + c1 * x ** 2
def azar(n): x = math.sin(n * 127.1 + 311.7) * 43758.5453; return x - math.floor(x)

@lru_cache(None)
def fuente(tam, cual="anton"):
    tam = max(6, int(tam))
    r = {"anton": os.path.join(RAIZ, "frutinovelas", "motor", "fuentes", "Anton-Regular.ttf"), "bold": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"}[cual]
    return ImageFont.truetype(r if os.path.exists(r) else "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", tam)

def fuente_clip(n):
    for ext in ("mp4", "mov"):
        p = os.path.join(CLIPS, f"orig_{n}.{ext}")
        if os.path.exists(p): return p
    raise FileNotFoundError(n)

def normalizado(n):
    """clip a 1080x1920, 30 cps, con color y nitidez mejorados (se guarda para no repetir)"""
    out = os.path.join(CLIPS, f"norm_{n}.mp4")
    if not os.path.exists(out):
        vf = "scale=1080:1920:flags=lanczos:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,eq=contrast=1.06:saturation=1.18:brightness=0.015,unsharp=5:5:0.6"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", fuente_clip(n), "-vf", vf, "-an", "-c:v", "libx264", "-crf", "14", "-preset", "fast", out], check=True)
    return out

def cuadros(n, a, b):
    """lee los cuadros del clip normalizado entre a y b (segundos)"""
    k = max(1, int(round((b - a) * FPS)))
    p = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-i", normalizado(n), "-frames:v", str(k), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    fr = np.frombuffer(p, np.uint8).reshape(-1, H, W, 3)
    if len(fr) < k: fr = np.concatenate([fr, np.repeat(fr[-1:], k - len(fr), 0)])
    return fr

@lru_cache(None)
def promo():
    return Image.open(os.path.join(AQUI, "recursos", "promo_mitad.png")).convert("RGBA")

# ------------------------------------------------------------------ línea de tiempo
def armar(version):
    piezas, t = [], 0.0
    for p in VERSIONES[version]:
        dur = p["dur"] if p.get("tipo") == "final" else p["b"] - p["a"]
        piezas.append(dict(p, t0=t, t1=t + dur)); t += dur
    # palabras con tiempo estimado (repartido por letras dentro de cada frase)
    palabras = []
    for p in piezas:
        if p.get("tipo") in ("broll", "final"): continue
        for (a, b, txt) in TEXTOS[p["clip"]]:
            a2, b2 = max(a, p["a"]), min(b, p["b"])
            if b2 - a2 < 0.3: continue
            ws = txt.split(); pesos = [len(w) + 2 for w in ws]; tot = sum(pesos); acc = 0
            # si la pieza corta la frase, tomamos solo las palabras que caen dentro
            for w, pe in zip(ws, pesos):
                wa = a + (b - a) * acc / tot; acc += pe; wb = a + (b - a) * acc / tot
                if wa >= p["a"] - 0.05 and wb <= p["b"] + 0.1:
                    palabras.append(dict(p=w, a=p["t0"] + wa - p["a"], b=p["t0"] + wb - p["a"], pieza=p["id"]))
    return piezas, t, palabras

def momento(palabras, pieza, texto, n=0):
    """segundo (en la línea de tiempo) en que suena la palabra `texto` dentro de la pieza (n-ésima vez)"""
    m = [w["a"] for w in palabras if w["pieza"] == pieza and texto.lower() in w["p"].lower()]
    return m[n] if len(m) > n else None

# ------------------------------------------------------------------ dibujo de textos y gráficos
def texto(d, x, y, s, tam, col=BLANCO, borde=OSCURO, bw=None, anchor="mm", cual="anton"):
    bw = bw if bw is not None else max(4, tam // 10)
    d.text((x + tam * 0.04, y + tam * 0.06), s, font=fuente(tam, cual), fill=(0, 0, 0, 150), anchor=anchor, stroke_width=bw, stroke_fill=(0, 0, 0, 150))
    d.text((x, y), s, font=fuente(tam, cual), fill=col, anchor=anchor, stroke_width=bw, stroke_fill=borde)

def impacto(im, s, dt, dur, y, tam, col, borde=OSCURO, rot=-4, fondo=None):
    """texto que entra grande con rebote y sale rápido"""
    if dt < 0 or dt > dur: return
    e = atras(dt / 0.25); sale = 1 - sm((dt - (dur - 0.18)) / 0.18)
    capa = Image.new("RGBA", (W, 420), (0, 0, 0, 0)); d = ImageDraw.Draw(capa)
    if fondo:
        tw = d.textlength(s, font=fuente(tam)); d.rounded_rectangle([540 - tw / 2 - 40, 210 - tam * 0.62, 540 + tw / 2 + 40, 210 + tam * 0.62], radius=30, fill=fondo)
    texto(d, 540, 210, s, tam, col, borde)
    esc = (1.7 - 0.7 * e) * sale
    if esc <= 0.02: return
    capa = capa.rotate(rot * (1 - e) + rot * 0.3, resample=Image.BICUBIC).resize((max(1, int(W * esc)), max(1, int(420 * esc))), Image.BICUBIC)
    im.alpha_composite(capa, (int(540 - capa.width / 2), int(y - capa.height / 2)))

def etiqueta(im, s, dt, dur, x, y, col, tam=70, desde=1):
    if dt < 0 or dt > dur: return
    e = atras(dt / 0.22); sale = 1 - sm((dt - (dur - 0.15)) / 0.15)
    d = ImageDraw.Draw(im); tw = d.textlength(s, font=fuente(tam))
    xx = x + desde * (1 - e) * 500 + desde * (1 - sale) * 700
    d.rounded_rectangle([xx - tw / 2 - 34, y - tam * 0.62, xx + tw / 2 + 34, y + tam * 0.62], radius=tam * 0.5, fill=col, outline=BLANCO, width=6)
    texto(d, xx, y, s, tam, BLANCO, OSCURO, 5)

def logo(im, a=1.0, x=40, y=70, tam=46):
    """marca provisional de Opac Case (cámbiala por el logo oficial en recursos/logo.png)"""
    p = os.path.join(AQUI, "recursos", "logo.png")
    if os.path.exists(p):
        lg = Image.open(p).convert("RGBA"); s = 110 / lg.height; lg = lg.resize((int(lg.width * s), 110))
        if a < 1: lg.putalpha(lg.getchannel("A").point(lambda v: int(v * a)))
        im.alpha_composite(lg, (x, y)); return
    d = ImageDraw.Draw(im); tw = d.textlength("OPAC CASE", font=fuente(tam))
    d.rounded_rectangle([x, y, x + tw + 50, y + tam + 34], radius=24, fill=(31, 79, 216, int(235 * a)), outline=(255, 255, 255, int(255 * a)), width=4)
    d.text((x + 25, y + 17), "OPAC CASE", font=fuente(tam), fill=(255, 255, 255, int(255 * a)))

def destellos(d, cx, cy, r, t, n=10):
    for i in range(n):
        a = i / n * math.pi * 2 + t * 1.5; rr = r * (0.75 + 0.35 * azar(i)); x, y = cx + math.cos(a) * rr, cy + math.sin(a) * rr * 0.6
        s = 10 + 16 * abs(math.sin(t * 6 + i * 1.7))
        d.polygon([(x, y - s), (x + s * 0.28, y), (x, y + s), (x - s * 0.28, y)], fill=(255, 245, 190, 230)); d.polygon([(x - s, y), (x, y + s * 0.28), (x + s, y), (x, y - s * 0.28)], fill=(255, 245, 190, 230))

def promo_png(im, dt, cy=520, ancho=980, t=0.0):
    if dt < 0: return
    e = atras(dt / 0.35); p = promo(); w = int(ancho * e * (1 + 0.025 * math.sin(t * 5))); h = int(p.height * w / p.width)
    if w < 4: return
    im.alpha_composite(p.resize((w, h), Image.BICUBIC), (int(540 - w / 2), int(cy - h / 2)))
    destellos(ImageDraw.Draw(im), 540, cy, ancho * 0.5, t)

def sello50(im, dt, x=820, y=1180, r=150, t=0.0):
    """estrella amarilla con «2.º PRODUCTO 50% OFF»"""
    if dt < 0: return
    e = atras(dt / 0.3); rr = r * e; d = ImageDraw.Draw(im)
    if rr < 4: return
    pts = []
    for i in range(32):
        a = i / 32 * math.pi * 2 + t * 0.6; q = rr if i % 2 == 0 else rr * 0.84; pts.append((x + math.cos(a) * q, y + math.sin(a) * q))
    d.polygon(pts, fill=AMARILLO, outline=ROJO); d.ellipse([x - rr * 0.8, y - rr * 0.8, x + rr * 0.8, y + rr * 0.8], outline=ROJO, width=6)
    d.text((x, y - rr * 0.42), "2.º PRODUCTO", font=fuente(max(8, int(rr * 0.22))), fill=OSCURO, anchor="mm")
    d.text((x, y + rr * 0.05), "50%", font=fuente(max(8, int(rr * 0.62))), fill=ROJO, anchor="mm", stroke_width=max(1, int(rr * 0.03)), stroke_fill=BLANCO)
    d.text((x, y + rr * 0.52), "OFF", font=fuente(max(8, int(rr * 0.26))), fill=OSCURO, anchor="mm")

def aclaracion(im):
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([110, 1800, 970, 1890], radius=16, fill=(0, 0, 0, 175))
    d.text((540, 1826), "Descuento aplicado al producto de menor valor.", font=fuente(30, "bold"), fill=BLANCO, anchor="mm")
    d.text((540, 1864), "Aplican condiciones.", font=fuente(30, "bold"), fill=BLANCO, anchor="mm")

def calendario(im, tiempos, t, y=1080):
    """tres tarjetas de calendario que aparecen una por una (MARTES, MIÉRCOLES, JUEVES)"""
    d = ImageDraw.Draw(im)
    for i, (dia, t0) in enumerate(zip(["MARTES", "MIÉRCOLES", "JUEVES"], tiempos)):
        if t0 is None or t < t0: continue
        e = atras((t - t0) / 0.3); x = 200 + i * 340; w, h = 300 * e, 300 * e
        if w < 6: continue
        d.rounded_rectangle([x - w / 2, y - h / 2, x + w / 2, y + h / 2], radius=28 * e, fill=BLANCO, outline=AZUL, width=8)
        d.rounded_rectangle([x - w / 2, y - h / 2, x + w / 2, y - h / 2 + h * 0.3], radius=28 * e, fill=ROJO)
        for k in (-1, 1): d.rounded_rectangle([x + k * w * 0.25 - 8, y - h / 2 - 22 * e, x + k * w * 0.25 + 8, y - h / 2 + 22 * e], radius=8, fill=OSCURO)
        d.text((x, y - h / 2 + h * 0.15), "PROMO", font=fuente(max(8, int(44 * e))), fill=BLANCO, anchor="mm")
        d.text((x, y + h * 0.15), dia, font=fuente(max(8, int((52 if len(dia) > 7 else 64) * e))), fill=AZUL, anchor="mm")
        d.text((x, y + h * 0.36), "50% 2.º", font=fuente(max(8, int(36 * e))), fill=ROJO, anchor="mm")

def reloj(im, x, y, r, t):
    d = ImageDraw.Draw(im); d.ellipse([x - r, y - r, x + r, y + r], fill=BLANCO, outline=ROJO, width=10)
    for k in range(12): a = k / 12 * math.pi * 2; d.line([(x + math.cos(a) * r * 0.78, y + math.sin(a) * r * 0.78), (x + math.cos(a) * r * 0.9, y + math.sin(a) * r * 0.9)], fill=OSCURO, width=5)
    for (vel, largo, ancho) in ((6.0, 0.75, 8), (0.5, 0.5, 12)):
        a = t * vel - math.pi / 2; d.line([(x, y), (x + math.cos(a) * r * largo, y + math.sin(a) * r * largo)], fill=OSCURO, width=ancho)
    d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=ROJO)

def iconos_compartir(im, dt, t):
    d = ImageDraw.Draw(im)
    for i, (col, letra) in enumerate([("#25d366", "wa"), ("#1877f2", "f"), ("#e1306c", "ig")]):
        e = atras((dt - i * 0.15) / 0.3)
        if e <= 0: continue
        x, y, r = 300 + i * 240, 1120 - 30 * abs(math.sin(t * 4 + i)), 95 * e
        if letra == "wa":
            d.ellipse([x - r, y - r, x + r, y + r], fill=col, outline=BLANCO, width=8)
            d.ellipse([x - r * 0.55, y - r * 0.55, x + r * 0.55, y + r * 0.55], outline=BLANCO, width=max(2, int(r * 0.1)))
            d.polygon([(x - r * 0.45, y + r * 0.3), (x - r * 0.62, y + r * 0.66), (x - r * 0.18, y + r * 0.5)], fill=BLANCO)
        elif letra == "f":
            d.rounded_rectangle([x - r, y - r, x + r, y + r], radius=r * 0.3, fill=col, outline=BLANCO, width=8)
            d.text((x + r * 0.08, y + r * 0.1), "f", font=fuente(max(8, int(r * 1.5)), "bold"), fill=BLANCO, anchor="mm")
        else:
            d.rounded_rectangle([x - r, y - r, x + r, y + r], radius=r * 0.35, fill=col, outline=BLANCO, width=8)
            d.rounded_rectangle([x - r * 0.55, y - r * 0.55, x + r * 0.55, y + r * 0.55], radius=r * 0.2, outline=BLANCO, width=max(2, int(r * 0.1)))
            d.ellipse([x - r * 0.25, y - r * 0.25, x + r * 0.25, y + r * 0.25], outline=BLANCO, width=max(2, int(r * 0.09)))
    # notificación que baja desde arriba
    if dt > 0.4:
        e = sm((dt - 0.4) / 0.3); y = -160 + 360 * e
        d.rounded_rectangle([90, y, 990, y + 140], radius=36, fill=(255, 255, 255, 240), outline=AZUL, width=5)
        d.rounded_rectangle([115, y + 28, 199, y + 112], radius=20, fill=AZUL); d.text((157, y + 70), "OC", font=fuente(40), fill=BLANCO, anchor="mm")
        d.text((225, y + 48), "Opac Case", font=fuente(40), fill=OSCURO, anchor="lm"); d.text((225, y + 98), "¡2.º producto a mitad de precio! 🔔"[:-2], font=fuente(36), fill=ROJO, anchor="lm")

def subtitulos(im, palabras, t):
    """grupos de 2 a 3 palabras; la que suena en amarillo y las palabras clave en azul claro"""
    grupos, act = [], []
    for i, w in enumerate(palabras):
        act.append(w); sig = palabras[i + 1] if i + 1 < len(palabras) else None
        if len(act) == 3 or not sig or sig["pieza"] != w["pieza"] or w["p"][-1] in ".,;:?!…":
            grupos.append((act[0]["a"], (sig["a"] if sig and sig["pieza"] == w["pieza"] else w["b"] + 0.15), act)); act = []
    g = next((x for x in grupos if x[0] - 0.03 <= t < x[1]), None)
    if not g: return
    ws = [w["p"].upper().strip(",.;:…") for w in g[2]]; tam = 82
    d = ImageDraw.Draw(im)
    while sum(d.textlength(s + " ", font=fuente(tam)) for s in ws) > 960 and tam > 46: tam -= 4
    tot = sum(d.textlength(s + " ", font=fuente(tam)) for s in ws); x = 540 - tot / 2
    e = atras((t - g[0]) / 0.18); y = 1560 + 30 * (1 - e)
    for w, s in zip(g[2], ws):
        act = w["a"] - 0.02 <= t < w["b"] + 0.08; clave = s.lower().strip("¡!¿?") in CLAVES
        col = AMARILLO if act else ("#7fd3ff" if clave else BLANCO)
        d.text((x + 4, y + 6), s, font=fuente(tam), fill=(0, 0, 0, 160), anchor="lm", stroke_width=10, stroke_fill=(0, 0, 0, 160))
        d.text((x, y), s, font=fuente(tam), fill=col, anchor="lm", stroke_width=10, stroke_fill=OSCURO)
        x += d.textlength(s + " ", font=fuente(tam))

def pantalla_final(t, dt, version):
    im = Image.new("RGBA", (W, H)); a = np.linspace(0, 1, H)[:, None]
    c0, c1 = np.array([20, 60, 200]), np.array([8, 20, 70])
    arr = (c0 + (c1 - c0) * a).astype(np.uint8); im = Image.fromarray(np.repeat(arr[:, None, :], W, 1).reshape(H, W, 3)).convert("RGBA")
    d = ImageDraw.Draw(im)
    for i in range(14):  # rayos de luz que giran
        an = i / 14 * math.pi * 2 + t * 0.3
        d.polygon([(540, 760), (540 + math.cos(an) * 1500, 760 + math.sin(an) * 1500), (540 + math.cos(an + 0.12) * 1500, 760 + math.sin(an + 0.12) * 1500)], fill=(255, 255, 255, 18))
    e = lambda k: atras((dt - k) / 0.3)
    if e(0) > 0: texto(d, 540, 230, "OPAC CASE", int(130 * e(0)), BLANCO, AZUL, 10)
    promo_png(im, dt - 0.15, 660, 960, t); d = ImageDraw.Draw(im)
    if e(0.5) > 0:
        d.rounded_rectangle([90, 1060, 990, 1190], radius=40, fill=ROJO, outline=BLANCO, width=6); texto(d, 540, 1125, "MARTES | MIÉRCOLES | JUEVES", int(66 * min(1, e(0.5))), BLANCO, OSCURO, 4)
    if e(0.8) > 0: texto(d, 540, 1300, "VISÍTANOS EN NUESTRAS ISLAS", int(76 * min(1, e(0.8))), AMARILLO, OSCURO, 7)
    if e(1.1) > 0: texto(d, 540, 1450, "¡TE ESPERAMOS!", int(130 * min(1, e(1.1))), BLANCO, ROJO, 10)
    aclaracion(im)
    return im

# ------------------------------------------------------------------ eventos visuales de cada pieza
def eventos(p, t, palabras):
    """devuelve (zoom extra, centro x, centro y, temblor) y una función que dibuja los textos de la pieza"""
    dt = t - p["t0"]; i = p["id"]; dib = []; z, tb = 1.0, 0.0
    m = lambda w, n=0: momento(palabras, i, w, n)
    def punch(t0, f=0.14, dur=0.35):
        nonlocal z
        if t0 is not None and 0 <= t - t0 < dur: z *= 1 + f * math.sin(math.pi * (t - t0) / dur) ** 0.5
    if i == "alto":
        z *= 1 + 0.35 * (1 - sm(dt / 0.45)); tb = 1.0 if dt < 0.5 else 0
        dib.append(lambda im: impacto(im, "¡ALTO!", dt - 0.02, 1.4, 470, 230, ROJO, BLANCO, -6))
        to = m("opac"); punch(to)
        dib.append(lambda im: logo(im, sm((t - to) / 0.3)) if to is not None and t >= to else None)
        punch(m("promoción")); punch(m("perder"), 0.1)
    elif i == "imagina":
        for k, (w, s, col) in enumerate([("estuche", "ESTUCHE", AZUL), ("cargador", "CARGADOR", ROJO), ("audífonos", "AUDÍFONOS", AZUL)]):
            tw = m(w)
            if tw is not None: punch(tw, 0.08); dib.append(lambda im, tw=tw, s=s, col=col, k=k: etiqueta(im, s, t - tw, 2.6 - k * 0.4, 540, 420 + k * 130, col, 72, 1 if k % 2 == 0 else -1))
        ts = m("segundo"); punch(ts, 0.18, 0.6)
        dib.append(lambda im: impacto(im, "¿QUÉ PASA CON EL SEGUNDO?", t - (ts or 99), 2.0, 470, 84, AMARILLO, OSCURO, -3))
    elif i == "revela":
        tm = m("mitad"); punch(m("segundo"), 0.12); punch(tm, 0.22, 0.5); tb = 1.0 if tm is not None and 0 <= t - tm < 0.35 else 0
        dib.append(lambda im: promo_png(im, t - (tm if tm is not None else p["t0"] + 1.5) + 0.25, 520, 1000, t))
        dib.append(lambda im: sello50(im, t - (tm or 99) - 0.3, 860, 1220, 140, t))
        dib.append(lambda im: aclaracion(im) if tm is not None and t >= tm else None)
    elif i == "revela2":
        punch(m("normal"), 0.08); punch(m("mitad"), 0.16)
        dib.append(lambda im: sello50(im, dt + 1.0, 860, 1220, 140, t))
        dib.append(lambda im: impacto(im, "2.º PRODUCTO", dt, 99, 330, 120, AMARILLO, OSCURO, -3))
        dib.append(lambda im: impacto(im, "50% OFF", dt - 0.2, 99, 500, 200, ROJO, BLANCO, -3))
        dib.append(aclaracion)
    elif i == "productos":
        te, ta, tr = m("estuche"), m("accesorios"), m("menos")
        punch(te, 0.1); punch(ta, 0.1); punch(tr, 0.15)
        dib.append(lambda im: etiqueta(im, "ESTUCHES", t - (te or 99), 1.8, 540, 420, AZUL, 84))
        dib.append(lambda im: etiqueta(im, "ACCESORIOS", t - (ta or 99), 2.2, 540, 420, ROJO, 84, -1))
        dib.append(lambda im: impacto(im, "¡MÁS POR MENOS!", t - (tr or 99) + 0.1, 2.5, 470, 130, AMARILLO, OSCURO, -4))
    elif i == "broll":
        for k, (s, col) in enumerate([("ESTUCHES", AZUL), ("AUDÍFONOS", ROJO), ("CARGADORES", AZUL), ("ACCESORIOS", ROJO)]):
            t0 = k * (p["t1"] - p["t0"]) / 4
            dib.append(lambda im, t0=t0, s=s, col=col, k=k: etiqueta(im, s, dt - t0, (p["t1"] - p["t0"]) / 4 + 0.05, 540, 900, col, 120, 1 if k % 2 == 0 else -1))
        z *= 1.05 + 0.08 * cl(dt / (p["t1"] - p["t0"]))
    elif i == "urgencia":
        tb = 0.6 if dt < 0.4 else 0; punch(p["t0"] + 0.1, 0.18)
        dib.append(lambda im: impacto(im, "¡MUCHO OJO!", dt, 2.3, 450, 170, BLANCO, ROJO, -5, fondo=ROJO))
        dias = [m("martes"), m("miércoles"), m("jueves")]
        for d0 in dias: punch(d0, 0.07)
        dib.append(lambda im: calendario(im, dias, t, 470) if dias[0] is not None and t >= dias[0] else None)
        dib.append(lambda im: reloj(im, 900, 760, 90, t) if dias[0] is not None and t >= dias[0] else None)
        tn = m("desaproveches")
        dib.append(lambda im: impacto(im, "¡SOLO 3 DÍAS A LA SEMANA!", t - (tn if tn is not None else p["t1"] - 1.0) + 0.4, 2.0, 760, 92, AMARILLO, OSCURO, -3))
    elif i == "islas":
        ti = m("islas"); punch(ti, 0.12)
        dib.append(lambda im: impacto(im, "¡VISÍTANOS EN NUESTRAS ISLAS!", t - (ti if ti is not None else p["t0"]), 3.2, 420, 84, BLANCO, AZUL, -3))
        dib.append(lambda im: etiqueta(im, "ISLAS OPAC CASE", dt - 0.2, p["t1"] - p["t0"] - 0.2, 540, 1340, AZUL, 54))
    elif i == "compartir":
        tc = m("compartirla"); punch(tc, 0.12); punch(m("amigos"), 0.08)
        dib.append(lambda im: iconos_compartir(im, t - (tc if tc is not None else p["t0"] + 1.5), t))
        dib.append(lambda im: impacto(im, "¡ENVÍASELO A TUS AMIGOS!", t - (tc if tc is not None else p["t0"] + 1.5) - 0.6, 99, 830, 92, AMARILLO, OSCURO, -3))
    elif i == "cierre":
        te = m("esperamos")
        if te is not None: z *= 1 + 0.12 * sm((t - te) / 1.2)
        dib.append(lambda im: sello50(im, dt, 880, 330, 120, t))
        dib.append(lambda im: impacto(im, "MARTES · MIÉRCOLES · JUEVES", dt - 0.3, 99, 1360, 64, BLANCO, ROJO, -2))
    z *= 1 + 0.05 * sm(dt / max(0.5, p["t1"] - p["t0"]))       # acercamiento lento continuo
    return z, tb, dib

# ------------------------------------------------------------------ sonido
def mezcla(piezas, total, palabras, salida):
    N = int(total * SR); voz = np.zeros(N); fx = np.zeros(N)
    def poner(arr, x, seg, g=1.0):
        i = int(seg * SR)
        if 0 <= i < N: x = x[: N - i]; arr[i:i + len(x)] += x * g
    for p in piezas:
        if p.get("tipo") in ("broll", "final"): continue
        tmp = os.path.join(CLIPS, f"v_{p['id']}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{p['a']:.3f}", "-to", f"{p['b']:.3f}", "-i", fuente_clip(p["clip"]), "-vn", "-ac", "1", "-ar", str(SR),
                        "-af", "highpass=f=90,afftdn=nf=-25,loudnorm=I=-16:TP=-2:LRA=7,afade=t=in:d=0.03,areverse,afade=t=in:d=0.05,areverse", tmp], check=True)
        a, _ = sf.read(tmp); poner(voz, a, p["t0"])
    # música alegre propia: 120 pulsos por minuto, Do – Sol – La menor – Fa
    t = np.arange(N) / SR; mus = np.zeros(N); pulso = 0.5
    def nota(f, dur, forma="pluck"):
        n = int(dur * SR); tt = np.arange(n) / SR
        if forma == "bajo": return np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3) + 0.3 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 6)
        return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(4 * np.pi * f * tt) + 0.25 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 7)
    ACORDES = [[261.6, 329.6, 392.0], [196.0, 246.9, 293.7], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6]]
    k, seg = 0, 0.0
    while seg < total:
        ac = ACORDES[(k // 8) % 4]
        if k % 2 == 0: poner(mus, golpe(55, 0.3, 0.6), seg, 1.0)                       # bombo
        if k % 4 == 2: poner(mus, filtro(rng.standard_normal(int(0.12 * SR)), "band", [1200, 6000]) * np.exp(-np.arange(int(0.12 * SR)) / SR * 30), seg, 0.7)  # palmada
        poner(mus, filtro(rng.standard_normal(int(0.04 * SR)), "high", 7000) * np.exp(-np.arange(int(0.04 * SR)) / SR * 90), seg + pulso / 2, 0.35)              # platillo
        poner(mus, nota(ac[0] / 2, 0.45, "bajo"), seg, 0.8)
        for j, f in enumerate(ac): poner(mus, nota(f * 2, 0.3), seg + pulso / 2 + j * 0.02, 0.25)
        if k % 2 == 1: poner(mus, nota([ac[2], ac[1], ac[0], ac[1]][(k // 2) % 4] * 4, 0.25), seg, 0.18)
        seg += pulso / 2 if False else pulso; k += 1
    mus = filtro(mus, "high", 40); mus *= np.interp(t, [0, 0.3, total - 1.2, total], [0, 1, 1, 0])
    # efectos
    def frenazo():
        n = int(0.55 * SR); tt = np.arange(n) / SR; f = 2400 * np.exp(-tt * 4) + 300
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 * np.exp(-tt * 2.5) + filtro(rng.standard_normal(n), "band", [1500, 5000]) * 0.25 * np.exp(-tt * 3)
    def pop(): n = int(0.08 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * (900 - 4000 * tt) * tt) * np.exp(-tt * 40)
    def alerta(): return np.concatenate([np.sin(2 * np.pi * 880 * np.arange(int(0.12 * SR)) / SR), np.zeros(int(0.05 * SR)), np.sin(2 * np.pi * 660 * np.arange(int(0.12 * SR)) / SR)]) * 0.5
    def tictac(): n = int(0.05 * SR); return filtro(rng.standard_normal(n), "band", [2000, 5000]) * np.exp(-np.arange(n) / SR * 80)
    for p in piezas:
        if p["t0"] > 0: poner(fx, whoosh(0.3), p["t0"] - 0.15, db(-17))
        i = p["id"]; m = lambda w: momento(palabras, i, w)
        if i == "alto": poner(fx, frenazo(), p["t0"], db(-8)); poner(fx, golpe(60, 0.4, 0.9), p["t0"] + 0.05, db(-10))
        if i == "imagina":
            for w in ("estuche", "cargador", "audífonos"):
                if m(w) is not None: poner(fx, pop(), m(w), db(-12))
            if m("segundo") is not None: poner(fx, whoosh(1.0), m("segundo") - 0.4, db(-15))
        if i == "revela" and m("mitad") is not None:
            poner(fx, golpe(48, 0.8, 0.9), m("mitad"), db(-5)); poner(fx, campanita(2093, 0.8), m("mitad") + 0.1, db(-15)); poner(fx, campanita(2637, 0.8), m("mitad") + 0.2, db(-17))
        if i in ("productos", "broll"):
            for w in ("estuche", "accesorios", "menos"):
                if m(w) is not None: poner(fx, pop(), m(w), db(-12))
            if i == "broll":
                for k in range(4): poner(fx, pop(), p["t0"] + k * (p["t1"] - p["t0"]) / 4, db(-11))
        if i == "urgencia":
            poner(fx, alerta(), p["t0"] + 0.05, db(-12))
            for w in ("martes", "miércoles", "jueves"):
                if m(w) is not None: poner(fx, pop(), m(w), db(-11))
            if m("martes") is not None:
                for k in range(int((p["t1"] - m("martes")) / 0.5)): poner(fx, tictac(), m("martes") + k * 0.5, db(-22))
        if i == "compartir" and m("compartirla") is not None: poner(fx, campanita(1760, 0.4), m("compartirla") + 0.4, db(-13)); poner(fx, campanita(2349, 0.4), m("compartirla") + 0.5, db(-14))
        if i == "final": poner(fx, golpe(50, 0.9, 0.8), p["t0"], db(-6)); poner(fx, campanita(1568, 1.0), p["t0"] + 0.15, db(-13)); poner(fx, campanita(2093, 1.0), p["t0"] + 0.3, db(-14))
    env = filtro(np.abs(voz), "low", 4, 1); pato = 1 - 0.7 * np.clip(env / 0.04, 0, 1)        # la música baja cuando hablan
    m = mus / (np.abs(mus).max() + 1e-9) * db(-12) * pato + fx + voz / (np.abs(voz).max() + 1e-9) * db(-2)
    m = np.stack([m, m], 1); m = m / np.abs(m).max() * db(-1)
    sf.write(salida, m, SR)

# ------------------------------------------------------------------ render
def render(version, fotos=None):
    piezas, total, palabras = armar(version)
    os.makedirs(os.path.join(AQUI, "out"), exist_ok=True); os.makedirs(os.path.join(AQUI, "publicar"), exist_ok=True)
    mudo = os.path.join(AQUI, "out", f"{version}_mudo.mp4")
    pipe = None if fotos else subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                                                "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", mudo], stdin=subprocess.PIPE)
    cache = {}
    def src(p, clip, a, b):
        k = (clip, round(a, 3), round(b, 3))
        if k not in cache: cache.clear(); cache[k] = cuadros(clip, a, b)
        return cache[k]
    marcas = [int(s * FPS) for s in fotos] if fotos else range(int(total * FPS))
    logo_desde = momento(palabras, "alto", "opac") or 0
    for fi in marcas:
        t = fi / FPS
        p = next((x for x in piezas if x["t0"] <= t < x["t1"]), piezas[-1]); dt = t - p["t0"]
        if p.get("tipo") == "final":
            im = pantalla_final(t, dt, version)
        else:
            clip, a, b = p["clip"], p["a"], p["b"]
            for (c0, c1, oc, oa) in p.get("cortes", []):            # imagen de otro clip, la voz sigue
                if c0 <= dt < c1: clip, a, b = oc, oa + 0.0, oa + (c1 - c0); dt_src = dt - c0; break
            else: dt_src = dt
            fr = src(p, clip, a, b) if not fotos else cuadros(clip, a + dt_src, a + dt_src + 1 / FPS)
            img = Image.fromarray(fr[min(len(fr) - 1, int(dt_src * FPS))] if not fotos else fr[0])
            z, tb, dib = eventos(p, t, palabras)
            cx, cy = CARA.get(clip, (0.5, 0.4)); cx, cy = cx * W, cy * H
            cx += 6 * math.sin(t * 1.3); cy += 4 * math.cos(t * 1.7)
            if tb: cx += 22 * tb * math.sin(t * 90); cy += 16 * tb * math.cos(t * 77)
            cw, ch = W / z, H / z; cx = min(max(cx, cw / 2), W - cw / 2); cy = min(max(cy, ch / 2), H - ch / 2)
            img = img.crop((int(cx - cw / 2), int(cy - ch / 2), int(cx + cw / 2), int(cy + ch / 2))).resize((W, H), Image.BILINEAR).convert("RGBA")
            # barrido de entrada en cada corte
            if dt < 0.1 and p["t0"] > 0: img = img.filter(ImageFilter.BoxBlur(int(18 * (1 - dt / 0.1))))
            # viñeta suave y degradado de color para unificar los clips
            for f in dib:
                f(img)
            if t >= logo_desde and p["id"] != "alto": logo(img)
            subtitulos(img, palabras, t)
            if p["id"] == "revela" and dt < 0.12: img = Image.blend(img, Image.new("RGBA", (W, H), "white"), 0.8 * (1 - dt / 0.12))
            im = img
        ImageDraw.Draw(im).rectangle([0, 0, int(W * t / total), 10], fill=ROJO)
        out = im.convert("RGB")
        if fotos: out.resize((W // 2, H // 2)).save(os.path.join(AQUI, "out", f"foto_{version}_{t:05.2f}.png")); continue
        pipe.stdin.write(out.tobytes())
        if fi % 300 == 0: print(f"  {version} {t:5.1f}/{total:.1f} s", flush=True)
    if fotos: return
    pipe.stdin.close(); pipe.wait()
    wav = os.path.join(AQUI, "out", f"{version}.wav"); mezcla(piezas, total, palabras, wav)
    final = os.path.join(AQUI, "publicar", f"opac_case_mitad_de_precio_{version}.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mudo, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                    "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", final], check=True)
    json.dump([dict(p=w["p"], a=round(w["a"], 2), b=round(w["b"], 2)) for w in palabras], open(os.path.join(AQUI, "out", f"{version}_palabras.json"), "w"), ensure_ascii=False)
    print("listo", final, round(total, 1), "s")

if __name__ == "__main__":
    v = sys.argv[1] if len(sys.argv) > 1 else "completa"
    if len(sys.argv) > 2 and sys.argv[2] == "fotos": render(v, [float(x) for x in sys.argv[3:]])
    else: render(v)
