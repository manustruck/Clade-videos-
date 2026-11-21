"""Cierre de marca «Fe en Escena»: degradado verde azulado → lima con grano, logo negro, botón «Seguir»
que presiona un dedo índice, redes con @cristianonovelas y el llamado a compartir para el próximo capítulo.

Uso (desde motor_fe/):  python cierre_marca.py [verde|claro] [carpeta_salida]
  verde = degradado verde-lima con grano; claro = fondo crema con el logo real (diseno/marca/logo_claro.png)
  -> cuadros clave PNG (1080x1920) del cierre y una tira con todos.
La función cuadro(c, T, canal) sirve también para el escenario 'cierre_marca' del motor.
"""
import math
import os
import random
import sys

import skia

from estilo import C, H, P, W, brillo_radial, clamp, font, rebote, suave
from texturas import capa_textura

HERE = os.path.dirname(os.path.abspath(__file__))
NEGRO = "#141414"
CREMA = "#f0efea"
_TF = {}


def _tf(nombre):
    if nombre not in _TF:
        _TF[nombre] = skia.Typeface.MakeFromFile(os.path.join(HERE, "fuentes", nombre))
    return _TF[nombre]


def _texto_ancho(c, s, cx, base, tf, tam, color, a=1.0, estirar=1.0, ancho_obj=None):
    """Texto centrado; 'estirar' ensancha la letra (el FE del logo es muy ancho); 'ancho_obj' lo ajusta a un ancho."""
    f = skia.Font(_tf(tf), tam)
    f.setEdging(skia.Font.Edging.kAntiAlias)
    w = f.measureText(s)
    sx = (ancho_obj / w) if ancho_obj else estirar
    c.save()
    c.translate(cx, base)
    c.scale(sx, 1)
    c.drawString(s, -w / 2, 0, f, P(color, a))
    c.restore()
    return w * sx


# ------------------------------------------------------------------ fondo de marca
def fondo(c, T):
    """Degradado vivo: verde azulado arriba, verde brillante al centro, lima amarillo abajo, con manchas que flotan."""
    sh = skia.GradientShader.MakeLinear([(0, 0), (0, H)], [C("#0a7b62"), C("#12a978"), C("#4fd96b"), C("#c9ee5e"), C("#f0f78a")],
                                        [0, 0.28, 0.55, 0.82, 1])
    c.drawRect(skia.Rect(0, 0, W, H), skia.Paint(Shader=sh))
    manchas = [  # (x, y, radio, color, opacidad, fase)
        (120, 260, 620, "#06604d", 0.55, 0.0), (980, 520, 560, "#1fd38f", 0.45, 1.3), (180, 1200, 520, "#2fc25a", 0.35, 2.1),
        (900, 1400, 640, "#e4f56f", 0.55, 0.7), (500, 900, 420, "#38e39a", 0.3, 2.8), (80, 1750, 520, "#d8ef63", 0.5, 1.9),
    ]
    for x, y, r, col, a, ph in manchas:
        xx = x + 60 * math.sin(T * 0.35 + ph)
        yy = y + 50 * math.cos(T * 0.28 + ph)
        p = P(col, a)
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, r * 0.45))
        c.drawCircle(xx, yy, r * 0.75, p)
    # grano fuerte como en la imagen de referencia
    rnd = random.Random(int(T * 24))
    capa_textura(c, skia.Rect(0, 0, W, H), "grano", 0.55, 1.2, skia.BlendMode.kOverlay, rnd.uniform(0, 256), rnd.uniform(0, 256))
    capa_textura(c, skia.Rect(0, 0, W, H), "papel", 0.18, 2.0, skia.BlendMode.kOverlay)


CREMA_FONDO = "#f0efeb"
_LOGO_IMG = {}


def fondo_claro(c, T):
    """Tema claro: crema liso como el logo, con un grano muy suave y una luz que se mueve despacio."""
    c.drawRect(skia.Rect(0, 0, W, H), P(CREMA_FONDO))
    brillo_radial(c, W / 2 + 120 * math.sin(T * 0.4), 700 + 80 * math.cos(T * 0.3), 900, "#ffffff", 0.35)


def grano_claro(c, T):
    rnd = random.Random(int(T * 24))
    capa_textura(c, skia.Rect(0, 0, W, H), "grano", 0.22, 1.2, skia.BlendMode.kOverlay, rnd.uniform(0, 256), rnd.uniform(0, 256))
    capa_textura(c, skia.Rect(0, 0, W, H), "papel", 0.10, 2.0, skia.BlendMode.kOverlay)


def logo_imagen(c, cx, top, k=1.0, escala=1.0):
    """Dibuja el logo real del canal (diseno/marca/logo_transparente.png: solo la tinta, sacada de logo_claro.png)."""
    ruta = os.path.join(HERE, "..", "diseno", "marca", "logo_transparente.png")
    if not os.path.exists(ruta):
        return False
    if ruta not in _LOGO_IMG:
        _LOGO_IMG[ruta] = skia.Image.open(ruta)
    im = _LOGO_IMG[ruta]
    src = skia.Rect(250, 230, 830, 850)              # cruz + FE + EN ESCENA con margen
    s = (0.86 + 0.14 * rebote(k)) * escala * 1.08
    w, h = src.width() * s, src.height() * s
    p = skia.Paint(AntiAlias=True)
    p.setAlphaf(clamp(k * 1.6))
    c.drawImageRect(im, src, skia.Rect(cx - w / 2, top, cx + w / 2, top + h), skia.SamplingOptions(skia.FilterMode.kLinear), p)
    return True


# ------------------------------------------------------------------ logo
def cruz(c, cx, cy, alto, color=NEGRO, a=1.0):
    g = alto * 0.16
    c.drawRoundRect(skia.Rect(cx - g / 2, cy - alto / 2, cx + g / 2, cy + alto / 2), g * 0.18, g * 0.18, P(color, a))
    c.drawRoundRect(skia.Rect(cx - alto * 0.32, cy - alto * 0.2 - g / 2, cx + alto * 0.32, cy - alto * 0.2 + g / 2), g * 0.18, g * 0.18, P(color, a))


def logo(c, cx, y_cruz, k=1.0, escala=1.0, color=NEGRO):
    """Cruz + FE (muy ancho) + EN ESCENA (condensada), alineados a un mismo ancho como en el logo."""
    if k <= 0:
        return
    s = (0.86 + 0.14 * rebote(k)) * escala
    c.save()
    c.translate(cx, y_cruz)
    c.scale(s, s)
    a = clamp(k * 1.6)
    ancho = 520
    cruz(c, 0, 0, 110, color, a)
    # FE con las letras casi pegadas, como en el logo
    f = skia.Font(_tf("ArchivoBlack-Regular.ttf"), 330)
    f.setEdging(skia.Font.Edging.kAntiAlias)
    bf = f.getBounds(f.textToGlyphs("F"))[0]   # borde real de la tinta de cada letra
    be = f.getBounds(f.textToGlyphs("E"))[0]
    gap = 16
    sx = (ancho - gap) / (bf.width() + be.width())
    c.save()
    c.translate(-ancho / 2, 330)
    c.scale(sx, 1)
    c.drawString("F", -bf.left(), 0, f, P(color, a))
    c.drawString("E", bf.width() + gap / sx - be.left(), 0, f, P(color, a))
    c.restore()
    _texto_ancho(c, "EN ESCENA", 0, 500, "Anton-Regular.ttf", 150, color, a, ancho_obj=ancho)
    c.restore()


# ------------------------------------------------------------------ redes
def iconos_redes(c, cx, cy, r=34, a=1.0):
    for i, red in enumerate(("tiktok", "facebook", "youtube")):
        x = cx + (i - 1) * (r * 2 + 18)
        c.drawCircle(x, cy, r, P(NEGRO, a))
        w = P("#ffffff", a)
        if red == "tiktok":  # nota musical estilizada
            c.drawRoundRect(skia.Rect(x + 2, cy - 18, x + 9, cy + 10), 3, 3, w)
            c.drawCircle(x - 4, cy + 10, 9, w)
            c.drawCircle(x - 4, cy + 10, 4, P(NEGRO, a))
            q = skia.Path()
            q.moveTo(x + 5, cy - 18)
            q.quadTo(x + 8, cy - 8, x + 18, cy - 7)
            c.drawPath(q, P("#ffffff", a, stroke=6))
        elif red == "facebook":
            f = skia.Font(_tf("ArchivoBlack-Regular.ttf"), 44)
            c.drawString("f", x - f.measureText("f") / 2 + 1, cy + 16, f, w)
        else:  # youtube: rectángulo redondeado con triángulo
            c.drawRoundRect(skia.Rect(x - 18, cy - 12, x + 18, cy + 12), 7, 7, w)
            t = skia.Path()
            t.moveTo(x - 5, cy - 7)
            t.lineTo(x + 8, cy)
            t.lineTo(x - 5, cy + 7)
            t.close()
            c.drawPath(t, P(NEGRO, a))


# ------------------------------------------------------------------ botón
def boton(c, cx, cy, k_aparece, k_presion, siguiendo, k_cambio):
    if k_aparece <= 0:
        return
    w, h = 460, 116
    s = (0.7 + 0.3 * rebote(k_aparece)) * (1 - 0.08 * k_presion) * (1 + 0.06 * math.sin(clamp(k_cambio) * math.pi))
    c.save()
    c.translate(cx, cy)
    c.scale(s, s)
    sp = P("#000000", 0.28)
    sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 18))
    c.drawRoundRect(skia.Rect(-w / 2, -h / 2 + 14 - 8 * k_presion, w / 2, h / 2 + 14 - 8 * k_presion), h / 2, h / 2, sp)
    fondo_b, tinta = (CREMA, NEGRO) if siguiendo else (NEGRO, CREMA)
    c.drawRoundRect(skia.Rect(-w / 2, -h / 2, w / 2, h / 2), h / 2, h / 2, P(fondo_b))
    if siguiendo:
        c.drawRoundRect(skia.Rect(-w / 2, -h / 2, w / 2, h / 2), h / 2, h / 2, P(NEGRO, 1, stroke=5))
    f = skia.Font(_tf("Anton-Regular.ttf"), 64)
    txt = "SIGUIENDO" if siguiendo else "SEGUIR"
    tw = f.measureText(txt)
    icono = 52
    x0 = -(tw + icono + 18) / 2
    c.drawString(txt, x0 + icono + 18, 23, f, P(tinta))
    ix = x0 + icono / 2
    if siguiendo:  # palomita
        ck = skia.Path()
        ck.moveTo(ix - 20, 0)
        ck.lineTo(ix - 5, 15)
        ck.lineTo(ix + 22, -16)
        c.drawPath(ck, P(tinta, 1, stroke=10))
    else:  # signo más
        c.drawRoundRect(skia.Rect(ix - 22, -5, ix + 22, 5), 3, 3, P(tinta))
        c.drawRoundRect(skia.Rect(ix - 5, -22, ix + 5, 22), 3, 3, P(tinta))
    c.restore()


def onda(c, x, y, k):
    if 0 < k < 1:
        for j, (d, col) in enumerate(((0.0, NEGRO), (0.12, "#ffffff"))):
            kk = clamp((k - d) / (1 - d))
            if kk > 0:
                r = 70 + 330 * suave(kk)
                c.drawCircle(x, y, r, P(col, 0.55 * (1 - kk), stroke=7 * (1 - kk) + 1.5))


# ------------------------------------------------------------------ dedo índice
PIEL_CLARA, PIEL, PIEL_OSC, PIEL_SOMBRA = "#f3c9a6", "#e2aa80", "#c48558", "#a86a42"


def _grad_v(y0, y1, cols, stops=None):
    return skia.Paint(Shader=skia.GradientShader.MakeLinear([(0, y0), (0, y1)], [C(x) for x in cols], stops), AntiAlias=True)


def mano_indice(c, tx, ty, k_llegar, k_presion, ang=-18.0, escala=1.0):
    """Mano que señala con el DEDO ÍNDICE extendido (vista de lado, uña arriba), los demás dedos doblados
    y el pulgar recogido. La punta del índice toca (tx, ty). Entra desde la derecha con manga blanca y puño rojo.

    k_llegar 0→1: entra desde fuera de cuadro; k_presion 0→1→0: empuja y la yema se aplasta.
    ang: inclinación (negativo = viene un poco desde arriba)."""
    if k_llegar <= 0:
        return
    e = suave(k_llegar)
    th = math.radians(ang)
    dist = (1 - e) * 1250 - 12 * k_presion
    c.save()
    c.translate(tx + math.cos(th) * dist, ty + math.sin(th) * dist)
    c.rotate(ang)
    c.scale(escala, escala)
    # --- sombra suave sobre el botón cuando está cerca
    if e > 0.85:
        sp = P("#000000", 0.30 * (e - 0.85) / 0.15)
        sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 16))
        c.drawOval(skia.Rect(-10, 26, 230, 70), sp)
    # --- manga blanca con pliegues y puño rojo con borde dorado
    manga = skia.Path()
    manga.moveTo(400, -95)
    manga.lineTo(1600, -150)
    manga.lineTo(1600, 210)
    manga.lineTo(400, 150)
    manga.quadTo(380, 30, 400, -95)
    c.drawPath(manga, _grad_v(-150, 210, ["#ffffff", "#f1ede4", "#d3cdc0"]))
    for i, yy in enumerate((-40, 30, 95)):
        pl = P("#000000", 0.08, stroke=10)
        pl.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 6))
        c.drawLine(470, yy, 1600, yy + (i - 1) * 25, pl)
    puno = skia.Path()
    puno.moveTo(392, -98)
    puno.lineTo(455, -100)
    puno.lineTo(455, 155)
    puno.lineTo(392, 152)
    puno.quadTo(372, 30, 392, -98)
    c.drawPath(puno, _grad_v(-100, 155, ["#c4323a", "#9e1f27"]))
    c.drawRect(skia.Rect(452, -100, 464, 156), P("#d7af72"))
    # --- muñeca y dorso de la mano
    dorso = skia.Path()
    dorso.moveTo(400, -70)
    dorso.cubicTo(330, -86, 250, -62, 196, -34)      # nudillo del índice arriba
    dorso.lineTo(190, 30)
    dorso.cubicTo(240, 120, 330, 132, 400, 128)      # palma abajo
    dorso.close()
    c.drawPath(dorso, _grad_v(-86, 132, [PIEL_CLARA, PIEL, PIEL_OSC]))
    # --- tres dedos doblados bajo el índice (se ven los nudillos medios en fila)
    for i, (x0, y0) in enumerate(((198, 36), (238, 58), (282, 76))):
        dedo = skia.Path()
        dedo.addRoundRect(skia.Rect(x0 - 40, y0 - 8, x0 + 44, y0 + 46), 26, 26)
        c.drawPath(dedo, _grad_v(y0 - 8, y0 + 46, [PIEL, PIEL_OSC]))
        sep = P(PIEL_SOMBRA, 0.55, stroke=3)
        c.drawArc(skia.Rect(x0 - 40, y0 - 8, x0 + 44, y0 + 46), 200, 120, False, sep)
    # --- pulgar recogido por delante de los dedos doblados
    pulgar = skia.Path()
    pulgar.moveTo(360, 70)
    pulgar.cubicTo(320, 40, 250, 34, 196, 42)
    pulgar.cubicTo(176, 46, 176, 74, 198, 78)
    pulgar.cubicTo(250, 82, 300, 96, 350, 112)
    pulgar.close()
    c.drawPath(pulgar, _grad_v(34, 112, ["#f0c19b", PIEL, PIEL_OSC]))
    c.drawRoundRect(skia.Rect(184, 46, 214, 70), 10, 10, P("#f6dcc8", 0.9))  # uña del pulgar
    # --- dedo ÍNDICE extendido: la punta en (0, 0); se afina hacia la punta y tiene dos pliegues
    ap = 6 * k_presion  # la yema se aplasta
    ind = skia.Path()
    ind.moveTo(210, -36)                              # base, lado de la uña (arriba)
    ind.cubicTo(150, -30, 70, -24, 26 + ap, -22)
    ind.cubicTo(6 + ap, -21, -4 + ap * 0.6, -10, -2 + ap * 0.6, 2)   # punta redondeada
    ind.cubicTo(0 + ap * 0.6, 14, 12 + ap, 22, 30 + ap, 22)
    ind.cubicTo(80, 24, 150, 30, 205, 38)            # base, lado de la yema (abajo)
    ind.close()
    c.drawPath(ind, _grad_v(-36, 38, [PIEL_CLARA, PIEL, PIEL_OSC]))
    # brillo a lo largo del dedo y sombra de la yema
    c.drawLine(40, -12, 190, -22, P("#ffffff", 0.22, stroke=6))
    c.drawLine(30, 16, 190, 30, P(PIEL_SOMBRA, 0.35, stroke=5))
    # pliegues de las articulaciones
    for x in (78, 148):
        c.drawArc(skia.Rect(x - 7, -26, x + 7, -6), 250, 100, False, P(PIEL_SOMBRA, 0.6, stroke=2.5))
        c.drawArc(skia.Rect(x - 5, -24, x + 5, -10), 250, 100, False, P(PIEL_SOMBRA, 0.4, stroke=2))
    # uña: arriba, cerca de la punta
    una = skia.Path()
    una.addRoundRect(skia.Rect(10 + ap, -21, 52, -6), 7, 7)
    c.drawPath(una, _grad_v(-21, -6, ["#fbe6dc", "#efc3b0"]))
    c.drawLine(50, -19, 50, -8, P("#d99b80", 0.7, stroke=2))  # cutícula
    # nudillo del índice
    c.drawArc(skia.Rect(186, -44, 222, -16), 200, 120, False, P(PIEL_SOMBRA, 0.45, stroke=3))
    c.restore()


# ------------------------------------------------------------------ el cuadro completo
T_TOQUE = 2.0


def destellos(c, x, y, k, n=10, color=NEGRO, seed=3):
    """Estallido de estrellitas de 4 puntas al presionar."""
    if not (0 < k < 1):
        return
    rnd = random.Random(seed)
    for i in range(n):
        ang = i / n * 2 * math.pi + rnd.uniform(-0.2, 0.2)
        d = 60 + 220 * suave(k) * rnd.uniform(0.7, 1.1)
        r = 16 * (1 - k) * rnd.uniform(0.6, 1.2)
        px_, py_ = x + math.cos(ang) * d, y + math.sin(ang) * d
        st = skia.Path()
        st.moveTo(px_, py_ - r)
        st.quadTo(px_, py_, px_ + r, py_)
        st.quadTo(px_, py_, px_, py_ + r)
        st.quadTo(px_, py_, px_ - r, py_)
        st.quadTo(px_, py_, px_, py_ - r)
        c.drawPath(st, P(color if i % 2 else "#ffffff", 0.9 * (1 - k)))


def _logo_animado(c, T, claro):
    """El logo se revela desde el centro, la cruz cae con rebote y un brillo lo cruza en diagonal."""
    y0 = 360 + 8 * math.sin(T * 1.3)
    k = clamp(T / 0.7)
    c.saveLayer(None, None)
    # revelado vertical desde el centro
    rev = suave(clamp((T - 0.1) / 0.6))
    cy = y0 + 330
    c.save()
    c.clipRect(skia.Rect(0, cy - 420 * rev - 2, W, cy + 420 * rev + 2))
    if not logo_imagen(c, W / 2, y0, k, 1 + 0.01 * math.sin(T * 2.0)):
        logo(c, W / 2, y0 + 70, k, 1 + 0.01 * math.sin(T * 2.0))
    c.restore()
    # brillo que cruza el logo (solo sobre la tinta)
    kb = (T - 0.8) / 0.7
    if 0 < kb < 1:
        xb = -300 + (W + 600) * kb
        sh = skia.GradientShader.MakeLinear([(xb - 120, 0), (xb + 120, 0)],
                                            [C("#ffffff", 0), C("#ffffff", 0.55), C("#ffffff", 0)])
        pb = skia.Paint(Shader=sh, BlendMode=skia.BlendMode.kSrcATop)
        c.save()
        c.rotate(-14, W / 2, cy)
        c.drawRect(skia.Rect(-400, cy - 700, W + 400, cy + 700), pb)
        c.restore()
    c.restore()


def cuadro(c, T, canal=None, tema=None):
    canal = canal or {}
    tema = tema or canal.get("tema_cierre", "verde")
    claro = tema == "claro"
    # cámara del cierre: acercamiento lento + sacudida corta cuando el dedo presiona
    c.save()
    z = 1.0 + 0.04 * suave(T / 4.0)
    sx = sy = 0.0
    d = T - T_TOQUE
    if 0 <= d < 0.25:
        amp = 9 * (1 - d / 0.25)
        sx, sy = amp * math.sin(d * 120), amp * 0.6 * math.cos(d * 97)
    c.translate(W / 2 + sx, H / 2 + sy)
    c.scale(z, z)
    c.translate(-W / 2, -H / 2)
    (fondo_claro if claro else fondo)(c, T)
    _logo_animado(c, T, claro)
    # botón seguir: aparece con rebote y 'respira' con un halo que invita a tocarlo
    bx, by = W / 2, 1290
    k_btn = clamp((T - 0.55) / 0.45)
    if 0.9 < T < T_TOQUE:
        ph = ((T - 0.9) * 1.6) % 1
        c.drawRoundRect(skia.Rect(bx - 230 - 40 * ph, by - 58 - 30 * ph, bx + 230 + 40 * ph, by + 58 + 30 * ph),
                        60 + 30 * ph, 60 + 30 * ph, P(NEGRO, 0.35 * (1 - ph), stroke=4))
    pres = math.sin(clamp((T - (T_TOQUE - 0.12)) / 0.3) * math.pi) if T_TOQUE - 0.12 < T < T_TOQUE + 0.18 else 0.0
    sig = T >= T_TOQUE
    boton(c, bx, by, k_btn, pres, sig, (T - T_TOQUE) / 0.35 if sig else 0)
    onda(c, bx + 178, by, (T - T_TOQUE) / 0.9)
    destellos(c, bx + 178, by, (T - T_TOQUE) / 0.7, color=NEGRO)
    # redes: cada ícono entra rebotando, uno tras otro; el usuario se escribe letra por letra
    for i in range(3):
        ki = clamp((T - 0.8 - 0.12 * i) / 0.4)
        if ki > 0:
            c.save()
            x = W / 2 + (i - 1) * 86
            c.translate(x, 1480)
            c.scale(rebote(ki), rebote(ki))
            c.translate(-x, -1480)
            c.save()
            c.clipRect(skia.Rect(x - 40, 1440, x + 40, 1520))
            iconos_redes(c, W / 2, 1480)
            c.restore()
            c.restore()
    u = canal.get("usuario", "@cristianonovelas")
    n = int(clamp((T - 1.1) / 0.6) * len(u))
    if n > 0:
        f = font("bold", 52)
        full = f.measureText(u)
        c.drawString(u[:n], W / 2 - full / 2, 1585, f, P(NEGRO))
        if n < len(u) and int(T * 8) % 2 == 0:
            c.drawRect(skia.Rect(W / 2 - full / 2 + f.measureText(u[:n]) + 4, 1545, W / 2 - full / 2 + f.measureText(u[:n]) + 9, 1595), P(NEGRO))
    # compartir: sube y la flecha se mueve; luego el próximo capítulo
    k_sh = suave((T - 2.5) / 0.45)
    if k_sh > 0:
        y = 1720 + 40 * (1 - k_sh)
        f = skia.Font(_tf("Anton-Regular.ttf"), 56)
        txt = "COMPÁRTELO"
        tw = f.measureText(txt)
        x0 = W / 2 - (tw + 76) / 2
        c.save()
        c.translate(x0 + 28, y - 20)
        c.scale(k_sh * (1 + 0.06 * math.sin(T * 6)), k_sh * (1 + 0.06 * math.sin(T * 6)))
        c.drawCircle(0, 0, 30, P(NEGRO))
        c.rotate(12 * math.sin(T * 5))
        fl = skia.Path()
        fl.moveTo(-13, 10)
        fl.quadTo(-12, -8, 8, -8)
        fl.lineTo(8, -18)
        fl.lineTo(21, -3)
        fl.lineTo(8, 11)
        fl.lineTo(8, 1)
        fl.quadTo(-5, 0, -13, 10)
        c.drawPath(fl, P(CREMA_FONDO if claro else "#d9f26a"))
        c.restore()
        c.drawString(txt, x0 + 76, y, f, P(NEGRO, k_sh))
        k_px = suave((T - 2.9) / 0.4)
        if k_px > 0:
            f2 = font("semi", 38)
            prox = canal.get("proximo", "Próximo capítulo muy pronto")
            c.drawString(prox, W / 2 - f2.measureText(prox) / 2, y + 70 + 20 * (1 - k_px), f2, P(NEGRO, 0.85 * k_px))
    # el dedo índice llega, presiona y se va
    lleg = clamp((T - 1.0) / 0.9) if T < 2.6 else 1 - clamp((T - 2.6) / 0.8)
    mano_indice(c, bx + 182, by - 4, lleg, pres)
    if claro:
        grano_claro(c, T)
    c.restore()


def esc_cierre_marca(c, T, k, S):
    """Escenario para el motor: el cierre de marca ocupa todo el cuadro (no usa la cámara del plano)."""
    cuadro(c, T, S.get("_canal", {}), S.get("tema"))


def main():
    import json
    tema = sys.argv[1] if len(sys.argv) > 1 else "verde"
    out = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(HERE, "..", "diseno", "cierre" if tema == "verde" else "cierre_" + tema)
    os.makedirs(out, exist_ok=True)
    canal = json.load(open(os.path.join(HERE, "canal.json"), encoding="utf-8"))
    momentos = [(0.45, "1_logo"), (1.6, "2_dedo_llega"), (1.96, "3_presiona"), (2.3, "4_siguiendo"), (3.6, "5_compartir")]
    imgs = []
    for T, nombre in momentos:
        s = skia.Surface(W, H)
        cuadro(s.getCanvas(), T, canal, tema)
        im = s.makeImageSnapshot()
        im.save(os.path.join(out, nombre + ".png"), skia.kPNG)
        imgs.append(im)
    # tira con los cinco momentos
    sc = 0.36
    w, h = int(W * sc), int(H * sc)
    s = skia.Surface(w * len(imgs) + 12 * (len(imgs) - 1), h)
    c = s.getCanvas()
    c.clear(C("#111111"))
    for i, im in enumerate(imgs):
        c.drawImageRect(im, skia.Rect(i * (w + 12), 0, i * (w + 12) + w, h), skia.SamplingOptions(skia.FilterMode.kLinear))
    s.makeImageSnapshot().save(os.path.join(out, "0_secuencia.png"), skia.kPNG)
    print("listo:", out)


if __name__ == "__main__":
    main()
