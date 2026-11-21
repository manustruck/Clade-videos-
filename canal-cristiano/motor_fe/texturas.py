"""Texturas y efectos que 'rellenan' la imagen: grano de película, papel, tela, pasto, lluvia, rayos y la mano divina.

Las texturas se generan una vez con numpy (ruido) y se usan como patrón repetido, así el render sigue siendo rápido.
"""
import math
import random

import numpy as np
import skia

from estilo import C, H, P, W, brillo_radial, clamp, suave

_LINEAL = skia.SamplingOptions(skia.FilterMode.kLinear)
_IMG = {}


def _imagen(arr):
    a = np.clip(arr, 0, 255).astype(np.uint8)
    rgba = np.ascontiguousarray(np.dstack([a, a, a, np.full_like(a, 255)]))
    return skia.Image.fromarray(rgba)


def _ruido_suave(n, octavas, seed):
    """Ruido de nubes que se repite sin costuras (suma de octavas de ruido periódico)."""
    rng = np.random.default_rng(seed)
    out = np.zeros((n, n))
    amp, tot = 1.0, 0.0
    for o in range(octavas):
        cells = 4 * 2 ** o
        g = rng.random((cells, cells))
        # interpolación bilineal periódica
        x = np.linspace(0, cells, n, endpoint=False)
        i0 = np.floor(x).astype(int)
        f = x - i0
        f = f * f * (3 - 2 * f)
        i1 = (i0 + 1) % cells
        a = g[np.ix_(i0, i0)] * (1 - f)[None, :] + g[np.ix_(i0, i1)] * f[None, :]
        b = g[np.ix_(i1, i0)] * (1 - f)[None, :] + g[np.ix_(i1, i1)] * f[None, :]
        out += (a * (1 - f)[:, None] + b * f[:, None]) * amp
        tot += amp
        amp *= 0.5
    return out / tot


def _tex(nombre):
    if nombre in _IMG:
        return _IMG[nombre]
    rng = np.random.default_rng(abs(hash(nombre)) % 1000)
    if nombre.startswith("grano"):
        arr = 128 + rng.normal(0, 38, (256, 256))
    elif nombre == "papel":
        arr = 128 + (_ruido_suave(512, 6, 4) - 0.5) * 140 + rng.normal(0, 8, (512, 512))
    elif nombre == "tela":  # trama de tejido: hilos horizontales y verticales con irregularidad
        y, x = np.mgrid[0:128, 0:128]
        hilo = 0.5 + 0.25 * np.sin(x * 2 * np.pi / 4) + 0.25 * np.sin(y * 2 * np.pi / 4 + np.sin(x * 0.3))
        arr = 128 + (hilo - 0.5) * 70 + (_ruido_suave(128, 4, 9) - 0.5) * 60 + rng.normal(0, 10, (128, 128))
    elif nombre == "piedra":
        arr = 128 + (_ruido_suave(512, 7, 12) - 0.5) * 170
    else:
        arr = np.full((8, 8), 128)
    _IMG[nombre] = _imagen(arr)
    return _IMG[nombre]


def capa_textura(c, rect, nombre="papel", fuerza=0.25, escala=1.0, modo=skia.BlendMode.kOverlay, dx=0.0, dy=0.0):
    """Pinta una textura gris sobre lo ya dibujado (overlay: aclara y oscurece sin cambiar el color)."""
    m = skia.Matrix()
    m.setScale(escala, escala)
    m.postTranslate(dx, dy)
    sh = _tex(nombre).makeShader(skia.TileMode.kRepeat, skia.TileMode.kRepeat, _LINEAL, m)
    p = skia.Paint(Shader=sh, BlendMode=modo)
    p.setAlphaf(clamp(fuerza))
    c.drawRect(rect, p)


def grano(c, T, fuerza=0.09):
    """Grano de película que cambia en cada cuadro (todo el video tiene 'vida' aunque nada se mueva)."""
    k = int(T * 24)
    rnd = random.Random(k)
    capa_textura(c, skia.Rect(0, 0, W, H), "grano", fuerza, 1.6, skia.BlendMode.kOverlay, rnd.uniform(0, 256), rnd.uniform(0, 256))


def papel(c, fuerza=0.22):
    """Textura de papel pintado sobre toda la imagen (le quita el aspecto de vector liso)."""
    capa_textura(c, skia.Rect(0, 0, W, H), "papel", fuerza, 2.2, skia.BlendMode.kOverlay)


def textura_en(c, path, nombre="tela", fuerza=0.35, escala=1.0):
    """Textura recortada a una forma (ropa, paredes, suelo)."""
    c.save()
    c.clipPath(path, skia.ClipOp.kIntersect, True)
    b = path.getBounds()
    capa_textura(c, b.makeOutset(4, 4), nombre, fuerza, escala, skia.BlendMode.kOverlay)
    c.restore()


# ------------------------------------------------------------------ pasto
def pasto(c, T, y0, y1, px=0.0, seed=1, densidad=1.0, colores=("#3f5a26", "#56732f", "#6d8b3a", "#86a64a"), viento=1.0,
          seco=False, flores=True):
    """Hojas de pasto que se mecen con el viento (más grandes y oscuras adelante)."""
    rnd = random.Random(seed)
    if seco:
        colores = ("#6b5530", "#8a6d3c", "#a8874c", "#c2a263")
    n = int(520 * densidad)
    hojas = []
    for _ in range(n):
        y = rnd.uniform(y0, y1)
        hojas.append((y, rnd.uniform(-160, W + 160), rnd.random(), rnd.choice(colores)))
    hojas.sort()
    for y, x, r, col in hojas:
        prof = (y - y0) / max(1, y1 - y0)
        alto = 26 + 70 * prof * (0.6 + 0.8 * r)
        g = 2.0 + 4.5 * prof
        sway = viento * (10 + 18 * prof) * math.sin(T * 1.7 + x * 0.013 + r * 3) + viento * 6 * math.sin(T * 3.1 + x * 0.05)
        xx = x + px * (0.4 + 0.8 * prof)
        p = skia.Path()
        p.moveTo(xx - g, y)
        p.quadTo(xx + sway * 0.4, y - alto * 0.55, xx + sway, y - alto)
        p.quadTo(xx + sway * 0.4 + g * 0.6, y - alto * 0.5, xx + g, y)
        p.close()
        sh = 0.55 + 0.45 * prof
        c.drawPath(p, P(_oscurecer(col, sh)))
        if flores and r > 0.985:
            c.drawCircle(xx + sway, y - alto, 4 + 4 * prof, P(rnd.choice(["#ffffff", "#f4e3ff", "#ffe9a8"]), 0.9))


def _oscurecer(hexa, f):
    h = hexa.lstrip("#")
    return "#%02x%02x%02x" % tuple(int(int(h[i:i + 2], 16) * f) for i in (0, 2, 4))


# ------------------------------------------------------------------ lluvia
def lluvia(c, T, fuerza=1.0, suelo=1640, viento=-6, seed=2):
    """Lluvia en tres capas de profundidad, salpicaduras en el suelo y un velo azulado."""
    c.drawRect(skia.Rect(0, 0, W, H), P("#1b2540", 0.12 * fuerza))
    rnd = random.Random(seed)
    for capa, (n, vel, largo, gros, a) in enumerate(((140, 1500, 26, 1.4, 0.25), (110, 2000, 40, 2.0, 0.35), (50, 2600, 70, 3.0, 0.42))):
        for _ in range(int(n * fuerza)):
            x0, y0 = rnd.uniform(-100, W + 100), rnd.uniform(0, H + 200)
            y = (y0 + vel * T) % (H + 200) - 100
            x = x0 + viento * (y / 40)
            c.drawLine(x, y, x + viento * largo / 40, y + largo, P("#c7d6f2", a, stroke=gros))
    # salpicaduras: pequeños arcos que se abren y desaparecen
    for i in range(int(36 * fuerza)):
        per = 0.45
        ph = rnd.uniform(0, per)
        k = ((T + ph) % per) / per
        x = rnd.uniform(0, W)
        y = suelo + rnd.uniform(-40, 220)
        r = 6 + 16 * k
        c.drawOval(skia.Rect(x - r * 1.6, y - r * 0.35, x + r * 1.6, y + r * 0.35), P("#d4e0f5", 0.45 * (1 - k), stroke=1.6))


# ------------------------------------------------------------------ truenos
def _rayo_path(x0, y0, y1, seed):
    rnd = random.Random(seed)
    principal = [(x0, y0)]
    x, y = x0, y0
    ramas = []
    while y < y1:
        y += rnd.uniform(30, 70)
        x += rnd.uniform(-45, 45)
        principal.append((x, y))
        if rnd.random() < 0.22:
            rx, ry, rama = x, y, [(x, y)]
            for _ in range(rnd.randint(3, 6)):
                ry += rnd.uniform(25, 55)
                rx += rnd.uniform(-60, 60) + (25 if rnd.random() < 0.5 else -25)
                rama.append((rx, ry))
            ramas.append(rama)
    return principal, ramas


def trueno(c, T_desde, seed=1, x=None, y1=1050, rayo=True, destello=True):
    """Relámpago: rayo ramificado con brillo y un destello doble que ilumina toda la pantalla.
    T_desde = segundos desde que cae el rayo (dibujar solo si 0 <= T_desde < 0.9)."""
    if not (0 <= T_desde < 0.9):
        return 0.0
    # intensidad con doble parpadeo, como un rayo real
    k = T_desde
    flash = max(0.0, 1 - k / 0.12) + 0.75 * max(0.0, 1 - abs(k - 0.22) / 0.07) + 0.35 * max(0.0, 1 - abs(k - 0.38) / 0.06)
    flash = clamp(flash)
    if flash <= 0.01:
        return 0.0
    if not rayo:
        if destello:
            c.drawRect(skia.Rect(0, 0, W, H), P("#dfe8ff", 0.45 * flash))
        return flash
    rnd = random.Random(seed)
    x0 = x if x is not None else rnd.uniform(220, W - 220)
    principal, ramas = _rayo_path(x0, -40, y1, seed)
    for grosor, col, a in ((26, "#7aa2ff", 0.18), (12, "#b9ccff", 0.45), (4.5, "#ffffff", 1.0)):
        p = P(col, a * flash, stroke=grosor)
        if grosor > 10:
            p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, grosor * 0.6))
        path = skia.Path()
        path.moveTo(*principal[0])
        for pt in principal[1:]:
            path.lineTo(*pt)
        c.drawPath(path, p)
        for rama in ramas:
            rp = skia.Path()
            rp.moveTo(*rama[0])
            for pt in rama[1:]:
                rp.lineTo(*pt)
            pr = P(col, a * flash * 0.7, stroke=grosor * 0.55)
            c.drawPath(rp, pr)
    if destello:
        c.drawRect(skia.Rect(0, 0, W, H), P("#dfe8ff", 0.45 * flash))
    else:  # ilumina el cielo detrás del rayo
        brillo_radial(c, x0, 400, 900, "#cdd9ff", 0.5 * flash)
    return flash


# ------------------------------------------------------------------ mano divina que presiona 'Seguir'
def mano_divina(c, tx, ty, k_llegar, k_presion, a=1.0, ang=72.0, escala=0.85):
    """Mano con manga blanca y borde rojo que entra desde la luz (arriba a la derecha) y presiona con el índice en (tx, ty).

    k_llegar: 0 = fuera de cuadro, 1 = la punta del dedo toca el botón.
    k_presion: 0-1-0 cuánto empuja (avanza un poco más y la yema se aplasta).
    ang: dirección de donde viene el brazo (0 = desde arriba, 90 = desde la derecha).
    """
    if k_llegar <= 0 or a <= 0:
        return
    e = suave(k_llegar)
    th = math.radians(ang)
    d = (math.sin(th), -math.cos(th))          # dirección hacia donde está el brazo
    dist = (1 - e) * 1400 - 16 * k_presion
    c.save()
    c.translate(tx + d[0] * dist, ty + d[1] * dist)
    c.rotate(ang)
    c.scale(escala, escala)
    # en este sistema la punta del índice está en (0, 0) y el brazo sube hacia -y
    brillo_radial(c, 0, -700, 760, "#fff1c9", 0.55 * a * e)
    sh = skia.GradientShader.MakeLinear([(-100, 0), (100, 0)], [C("#d6cfc1", a), C("#fbf8f1", a), C("#c9c0b0", a)])
    manga = skia.Path()
    manga.moveTo(-100, -1700)
    manga.lineTo(100, -1700)
    manga.lineTo(92, -330)
    manga.quadTo(0, -300, -92, -330)
    manga.close()
    c.drawPath(manga, skia.Paint(Shader=sh, AntiAlias=True))
    textura_en(c, manga, "tela", 0.3, 0.5)
    for i, x in enumerate((-40, 10, 55)):  # pliegues de la manga
        pl = P("#000000", 0.10 * a, stroke=8)
        pl.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 5))
        c.drawLine(x, -1650, x + 8, -360, pl)
    c.drawRoundRect(skia.Rect(-96, -365, 96, -322), 10, 10, P("#a3262c", a))
    c.drawRoundRect(skia.Rect(-96, -330, 96, -322), 4, 4, P("#d7af72", a))
    piel = skia.GradientShader.MakeLinear([(-80, 0), (80, 0)], [C("#c58a60", a), C("#ebbb93", a), C("#b97a52", a)])
    pp = skia.Paint(Shader=piel, AntiAlias=True)
    # muñeca
    c.drawRoundRect(skia.Rect(-60, -340, 60, -230), 44, 44, pp)
    # dorso de la mano
    palma = skia.Path()
    palma.moveTo(-72, -250)
    palma.quadTo(-86, -150, -58, -105)
    palma.lineTo(58, -105)
    palma.quadTo(86, -160, 70, -250)
    palma.close()
    c.drawPath(palma, pp)
    # tres dedos doblados (se ven los nudillos)
    for i, x in enumerate((-48, -8, 30)):
        c.drawRoundRect(skia.Rect(x - 22, -128, x + 18, -60), 20, 20, P("#d29a6f", a))
        c.drawRoundRect(skia.Rect(x - 20, -76, x + 16, -52), 14, 14, P("#c58a60", a))
        c.drawLine(x - 12, -100, x + 8, -100, P("#9c6440", 0.45 * a, stroke=2.5))
    # pulgar sobre los dedos
    pul = skia.Path()
    pul.moveTo(62, -210)
    pul.quadTo(96, -150, 56, -96)
    pul.quadTo(30, -80, 22, -110)
    pul.quadTo(48, -150, 40, -200)
    pul.close()
    c.drawPath(pul, P("#dea57b", a))
    # índice extendido hasta la punta (0,0); la yema se aplasta al presionar
    ap = 1 - 0.1 * k_presion
    indice = skia.Path()
    indice.addRoundRect(skia.Rect(-30, -190, 6, -2 * ap), 18, 18)
    c.drawPath(indice, pp)
    c.drawLine(-26, -120, 2, -120, P("#9c6440", 0.35 * a, stroke=2))
    c.drawLine(-26, -66, 2, -66, P("#9c6440", 0.35 * a, stroke=2))
    c.drawRoundRect(skia.Rect(-24, -40, 0, -8), 8, 8, P("#f4d6bd", 0.9 * a))  # uña
    # sombra suave de la mano sobre el botón al acercarse
    if e > 0.8:
        sp = P("#000000", 0.25 * a * (e - 0.8) * 5)
        sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 18))
        c.drawOval(skia.Rect(-40, 10, 40, 40), sp)
    gp = P("#fff2c8", 0.22 * a * e, stroke=12)
    gp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 16))
    c.drawPath(palma, gp)
    c.restore()


def onda_presion(c, x, y, k):
    """Anillo de luz que se expande cuando el dedo presiona."""
    if 0 < k < 1:
        r = 30 + 260 * suave(k)
        c.drawCircle(x, y, r, P("#ffe7a8", 0.7 * (1 - k), stroke=6 * (1 - k) + 1))
        brillo_radial(c, x, y, r * 1.2, "#fff1c9", 0.3 * (1 - k))
