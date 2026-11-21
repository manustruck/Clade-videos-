"""Objetos animados para las historias: vasija de barro (que se rompe), piedra lanzada, rollo que se desenrolla,
códice, cabra. Todos planos con degradados y textura, como los personajes."""
import math
import random

import skia

from estilo import C, P, brillo_radial, clamp, suave
from texturas import textura_en


def _grad(y0, y1, cols):
    return skia.Paint(Shader=skia.GradientShader.MakeLinear([(0, y0), (0, y1)], [C(x) for x in cols]), AntiAlias=True)


def vasija(c, x, y, s=1.0, rota=0.0, seed=0, T=0.0):
    """Vasija de barro con tapa (como las de Qumrán). 'rota' 0→1: se parte y los trozos caen."""
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    sp = P("#000000", 0.35)
    sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 10))
    c.drawOval(skia.Rect(-80, -14, 80, 14), sp)
    cuerpo = skia.Path()
    cuerpo.moveTo(-46, -300)
    cuerpo.cubicTo(-100, -260, -96, -40, -60, 0)
    cuerpo.lineTo(60, 0)
    cuerpo.cubicTo(96, -40, 100, -260, 46, -300)
    cuerpo.close()
    tapa = skia.Path()
    tapa.addRoundRect(skia.Rect(-54, -334, 54, -296), 16, 16)
    if rota <= 0:
        c.drawPath(cuerpo, _grad(-300, 0, ["#c98a55", "#a8693a", "#7a4a26"]))
        textura_en(c, cuerpo, "piedra", 0.45, 0.6)
        sh = skia.GradientShader.MakeLinear([(-96, 0), (96, 0)], [C("#ffffff", 0.12), C("#000000", 0), C("#000000", 0.35)])
        c.save()
        c.clipPath(cuerpo, skia.ClipOp.kIntersect, True)
        c.drawRect(skia.Rect(-100, -310, 100, 0), skia.Paint(Shader=sh))
        for yy in (-240, -200):
            c.drawLine(-80, yy, 80, yy, P("#5a3418", 0.35, stroke=3))
        c.restore()
        c.drawPath(tapa, _grad(-334, -296, ["#b57a48", "#7a4a26"]))
    else:
        # trozos que saltan y caen con giro
        rnd = random.Random(seed)
        k = suave(rota)
        for i in range(9):
            # cada trozo salta en arco y cae al suelo (y = 0), donde se queda
            x_ini, y_ini = rnd.uniform(-50, 50), -150 + rnd.uniform(-110, 110)
            x_fin = x_ini + rnd.uniform(-170, 170)
            y_fin = -rnd.uniform(4, 22)
            alto = rnd.uniform(60, 160)
            xx = x_ini + (x_fin - x_ini) * k
            yy = y_ini + (y_fin - y_ini) * k - alto * 4 * k * (1 - k)
            c.save()
            c.translate(xx, yy)
            c.rotate(rnd.uniform(-160, 160) * k)
            tr = skia.Path()
            w, h = rnd.uniform(30, 60), rnd.uniform(26, 50)
            tr.moveTo(-w / 2, -h / 2)
            tr.lineTo(w / 2, -h / 3)
            tr.lineTo(w / 3, h / 2)
            tr.lineTo(-w / 2, h / 3)
            tr.close()
            c.drawPath(tr, P(rnd.choice(["#a8693a", "#8d5530", "#c98a55"])))
            c.restore()
        # la base de la vasija queda en pie
        base = skia.Path()
        base.moveTo(-60, 0)
        base.lineTo(-74, -70)
        base.lineTo(-40, -95)
        base.lineTo(-5, -60)
        base.lineTo(30, -100)
        base.lineTo(74, -70)
        base.lineTo(60, 0)
        base.close()
        c.drawPath(base, _grad(-100, 0, ["#a8693a", "#7a4a26"]))
        # un rollo asoma de entre los trozos
        c.drawRoundRect(skia.Rect(-30, -150 * k, 30, -60), 14, 14, P("#e6d2a6", k))
        # polvo del golpe
        if rota < 1:
            brillo_radial(c, 0, -150, 260 * (0.6 + k), "#d9b98a", 0.5 * (1 - k))
    c.restore()


def piedra(c, x0, y0, x1, y1, k, alto=220, s=1.0):
    """Piedra que vuela en arco de (x0,y0) a (x1,y1); k 0→1. Deja una estela."""
    if not (0 < k < 1):
        return
    for j in range(6):
        kk = max(0.0, k - j * 0.035)
        x = x0 + (x1 - x0) * kk
        y = y0 + (y1 - y0) * kk - alto * 4 * kk * (1 - kk)
        a = 1.0 if j == 0 else 0.18 * (1 - j / 6)
        r = 18 * s * (1 if j == 0 else 0.8)
        c.save()
        c.translate(x, y)
        c.rotate(kk * 720)
        c.drawRoundRect(skia.Rect(-r, -r * 0.8, r, r * 0.8), r * 0.6, r * 0.6, P("#6b5a48" if j == 0 else "#d9c3a0", a))
        c.restore()


def rollo(c, cx, cy, ancho, k_abrir=1.0, T=0.0, alto=300, brillo=0.0, lineas=True, seed=4):
    """Rollo de pergamino que se desenrolla desde el centro hacia los lados, con columnas de texto antiguo."""
    k = suave(k_abrir)
    w = 40 + (ancho - 40) * k
    if brillo > 0:
        brillo_radial(c, cx, cy, ancho * 0.9, "#fff1c9", 0.45 * brillo * (0.85 + 0.15 * math.sin(T * 2)))
    hoja = skia.Path()
    hoja.addRect(skia.Rect(cx - w / 2, cy - alto / 2, cx + w / 2, cy + alto / 2))
    c.drawPath(hoja, _grad(cy - alto / 2, cy + alto / 2, ["#efdcae", "#dcc08a", "#c9a56c"]))
    textura_en(c, hoja, "papel", 0.6, 0.8)
    if lineas and w > 80:
        rnd = random.Random(seed)
        c.save()
        c.clipPath(hoja, skia.ClipOp.kIntersect, True)
        col_w = 120
        x = cx - ancho / 2 + 40
        while x < cx + ancho / 2 - 40:
            for ly in range(int(cy - alto / 2 + 28), int(cy + alto / 2 - 20), 18):
                lw = rnd.uniform(0.6, 1.0) * (col_w - 24)
                c.drawLine(x, ly, x + lw, ly, P("#3b2a1a", 0.55, stroke=3))
            x += col_w
        c.restore()
    for sx in (-1, 1):  # los dos cilindros enrollados
        xx = cx + sx * w / 2
        sh = skia.GradientShader.MakeLinear([(xx - 26, 0), (xx + 26, 0)], [C("#9c7444"), C("#ecd6a6"), C("#8a6338")])
        c.drawRoundRect(skia.Rect(xx - 26, cy - alto / 2 - 18, xx + 26, cy + alto / 2 + 18), 22, 22, skia.Paint(Shader=sh, AntiAlias=True))


def codice(c, cx, cy, s=1.0):
    """Libro antiguo (códice medieval) para comparar con el rollo."""
    c.save()
    c.translate(cx, cy)
    c.scale(s, s)
    c.drawRoundRect(skia.Rect(-150, -200, 150, 200), 12, 12, _grad(-200, 200, ["#7a3a24", "#4a2214"]))
    c.drawRect(skia.Rect(-130, -184, 140, 190), P("#efe0bd"))
    c.drawRoundRect(skia.Rect(-150, -200, -120, 200), 8, 8, P("#3a1a0e"))
    for i in range(4):
        c.drawCircle(-135, -150 + i * 100, 8, P("#d7af72"))
    c.restore()


def cabra(c, x, y, s=1.0, T=0.0, seed=0):
    """Cabra en silueta clara que mueve la cabeza."""
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    col = "#e9dfcc"
    c.drawRoundRect(skia.Rect(-80, -120, 70, -50), 34, 34, P(col))
    for lx in (-62, -40, 36, 54):
        c.drawRoundRect(skia.Rect(lx - 6, -60, lx + 6, 0), 5, 5, P("#cbbfa8"))
    c.save()
    c.translate(66, -110)
    c.rotate(-10 + 8 * math.sin(T * 1.7 + seed))
    c.drawRoundRect(skia.Rect(-10, -50, 40, 0), 18, 18, P(col))
    c.drawLine(4, -46, -14, -84, P("#8a7a64", 1, stroke=6))
    c.drawLine(18, -46, 10, -86, P("#8a7a64", 1, stroke=6))
    c.drawCircle(26, -30, 4, P("#2a1a12"))
    c.restore()
    c.restore()
