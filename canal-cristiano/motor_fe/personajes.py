"""Personajes planos con degradados y sin contorno (como en las referencias).

persona(c, x, y, s, tipo, T, ...) dibuja con los pies en (x, y). Alto base ~620 px con s=1.
Tipos: 'jesus', 'biblico', 'biblica', 'moderno', 'moderna', 'nino'.
Siempre se mueven un poco: respiran, parpadean y balancean los brazos.
"""
import math

import skia

from estilo import C, P, brillo_radial, clamp, suave
from texturas import textura_en

TIPOS = {
    "jesus":   dict(tunica=("#f4efe6", "#d9d0c2"), manto=("#a3262c", "#6f1519"), pelo="#5b3a22", barba=True, piel="#d9a47c", largo=True, desgaste=0.1),
    "biblico": dict(tunica=("#7a8f4f", "#4f6234"), manto=("#7a5130", "#4d311c"), pelo="#3a2618", barba=True, piel="#c98e63", largo=False, desgaste=0.8),
    "biblica": dict(tunica=("#5b7fa6", "#38587a"), manto=("#d8c7a5", "#b29d76"), pelo="#2e1d12", barba=False, piel="#c98e63", largo=True, velo=True, desgaste=0.6),
    "moderno": dict(tunica=("#2f8f9d", "#1f5f6a"), manto=None, pelo="#1d1410", barba=False, piel="#c98e63", largo=False, pantalon="#2d3550"),
    "moderna": dict(tunica=("#c0566b", "#8c3a4c"), manto=None, pelo="#3a2216", barba=False, piel="#e0a77a", largo=True, pantalon="#2d3550"),
    "beduino": dict(tunica=("#8a6a4a", "#5e4630"), manto=("#3e2f24", "#2a1f17"), pelo="#1d1410", barba=False, piel="#b97a52", largo=False, velo=True, desgaste=0.9),
    "anciano": dict(tunica=("#9a8f7a", "#6e6454"), manto=("#4f3b2a", "#33261b"), pelo="#cfc8bd", barba=True, piel="#c98e63", largo=False, desgaste=0.5),
    "nino":    dict(tunica=("#e0a44a", "#b47a26"), manto=None, pelo="#2b1a10", barba=False, piel="#d9a47c", largo=False, pantalon="#3b4a6b"),
}


def _grad(top, bot, y0, y1, a=1.0):
    sh = skia.GradientShader.MakeLinear([(0, y0), (0, y1)], [C(top, a), C(bot, a)])
    return skia.Paint(Shader=sh, AntiAlias=True)


def _brazo(c, x, y, ang, largo, grosor, col, piel, a):
    """Brazo como cápsula que gira desde el hombro; mano redonda al final."""
    c.save()
    c.translate(x, y)
    c.rotate(ang)
    c.drawRoundRect(skia.Rect(-grosor / 2, 0, grosor / 2, largo), grosor / 2, grosor / 2, P(col, a))
    c.drawCircle(0, largo + grosor * 0.15, grosor * 0.55, P(piel, a))
    c.restore()


def _relleno_tela(c, path, y0, y1, a, desgaste=0.3, T=0.0, seed=0):
    """Rellena la ropa: trama de tela, sombra del lado derecho, pliegues, brillo del borde y desgaste de uso diario."""
    textura_en(c, path, "tela", 0.3, 0.45)
    b = path.getBounds()
    c.save()
    c.clipPath(path, skia.ClipOp.kIntersect, True)
    # sombra lateral (la luz viene de la izquierda)
    sh = skia.GradientShader.MakeLinear([(b.left(), 0), (b.right(), 0)], [C("#ffffff", 0.10 * a), C("#000000", 0), C("#000000", 0.30 * a)], [0, 0.45, 1])
    c.drawRect(b, skia.Paint(Shader=sh))
    # pliegues verticales que se mueven con la respiración
    for i, fx in enumerate((0.22, 0.4, 0.62, 0.8)):
        x = b.left() + b.width() * fx + 3 * math.sin(T * 1.4 + i + seed)
        pl = skia.Path()
        pl.moveTo(x, y0 + (y1 - y0) * 0.25)
        pl.quadTo(x + 14 * math.sin(i * 2.1), (y0 + y1) / 2, x - 6, y1)
        pp = P("#000000", 0.16 * a, stroke=7)
        pp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 4))
        c.drawPath(pl, pp)
        c.drawPath(pl, P("#ffffff", 0.06 * a, stroke=2))
    if desgaste > 0:
        # suciedad del uso diario abajo (polvo del camino) y manchas
        sd = skia.GradientShader.MakeLinear([(0, y1 - 170), (0, y1)], [C("#5a3d22", 0), C("#5a3d22", 0.55 * desgaste * a)])
        c.drawRect(skia.Rect(b.left(), y1 - 170, b.right(), y1 + 4), skia.Paint(Shader=sd))
        import random as _r
        rnd = _r.Random(seed * 7 + 3)
        for _ in range(int(6 * desgaste)):
            mp = P("#3b2a18", 0.12 * a)
            mp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 9))
            c.drawCircle(rnd.uniform(b.left(), b.right()), rnd.uniform(y0 + 60, y1), rnd.uniform(10, 26), mp)
        # dobladillo deshilachado
        x = b.left()
        while x < b.right():
            c.drawLine(x, y1 - 2, x + 3, y1 + 9 + 5 * rnd.random(), P("#2c1e12", 0.45 * desgaste * a, stroke=2))
            x += 9
        # remiendo cosido (solo con mucho desgaste)
        if desgaste >= 0.6:
            rx, ry = b.left() + b.width() * 0.28, y0 + (y1 - y0) * 0.62
            c.drawRect(skia.Rect(rx, ry, rx + 46, ry + 40), P("#8a6a44", 0.85 * a))
            st = P("#e9d9b6", 0.8 * a, stroke=2)
            st.setPathEffect(skia.DashPathEffect.Make([6, 5], 0))
            c.drawRect(skia.Rect(rx + 4, ry + 4, rx + 42, ry + 36), st)
    c.restore()


POSES = {  # (ángulo brazo izq, ángulo brazo der) en grados; 0 = colgando
    "abajo": (8, -8), "orar": (-150, 150), "senalar": (8, -105), "levantar": (165, -165),
    "bendecir": (10, -130), "abrazar": (-70, 70), "pensar": (8, 150), "cargar": (-40, 40),
}


def persona(c, x, y, s=1.0, tipo="biblico", T=0.0, pose="abajo", mira=0.0, a=1.0, espaldas=False,
            camina=False, seed=0, brillo=0.0, silueta=False):
    t = TIPOS[tipo]
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    resp = 1 + 0.012 * math.sin(T * 2.1 + seed)          # respiración
    bal = 2.2 * math.sin(T * 1.3 + seed)                 # balanceo
    paso = math.sin(T * 7.0 + seed) if camina else 0.0
    c.rotate(bal * 0.35 + (2.5 * paso if camina else 0))
    if brillo > 0:
        brillo_radial(c, 0, -330, 420, "#fff1c4", 0.45 * brillo)
    # sombra de contacto
    sp = P("#000000", 0.22 * a)
    sp.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 18))
    c.save()  # sombra larga hacia la derecha (luz de la izquierda)
    c.skew(-1.3, 0)
    c.scale(1, 0.22)
    c.drawRoundRect(skia.Rect(-95, -560, 95, 0), 80, 80, sp)
    c.restore()
    sp2 = P("#000000", 0.4 * a)
    sp2.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 10))
    c.drawOval(skia.Rect(-120, -16, 120, 16), sp2)
    if silueta:
        t = dict(t, tunica=("#120c0a", "#120c0a"), manto=("#120c0a", "#120c0a") if t["manto"] else None,
                 pelo="#120c0a", piel="#120c0a", pantalon="#120c0a")
    c.scale(1, resp)
    torso_top, cadera = -470, -250
    # piernas (solo modernos) o pies bajo la túnica
    if "pantalon" in t:
        for sx, ph in ((-1, 0), (1, math.pi)):
            dx = 26 * math.sin(T * 7.0 + seed + ph) if camina else 0
            pierna = skia.Path()
            pierna.addRoundRect(skia.Rect(sx * 44 - 26 + dx, cadera - 10, sx * 44 + 26 + dx, -28), 22, 22)
            c.drawPath(pierna, P(t["pantalon"], a))
            if not silueta:
                textura_en(c, pierna, "tela", 0.55, 0.45)
            c.drawRoundRect(skia.Rect(sx * 44 - 34 + dx * 1.2, -40, sx * 44 + 38 + dx * 1.2, 0), 16, 16, P("#f2efe9" if not silueta else "#120c0a", a))
        cuerpo_bot = cadera + 10
    else:
        for sx in (-1, 1):
            c.drawRoundRect(skia.Rect(sx * 40 - 30, -34, sx * 40 + 34, 0), 14, 14, P("#6b4a2e" if not silueta else "#120c0a", a))
        cuerpo_bot = -20
    # túnica (trapecio con degradado)
    path = skia.Path()
    path.moveTo(-78, torso_top + 20)
    path.quadTo(0, torso_top - 12, 78, torso_top + 20)
    path.lineTo(112 if "pantalon" not in t else 92, cuerpo_bot)
    path.quadTo(0, cuerpo_bot + 16, -112 if "pantalon" not in t else -92, cuerpo_bot)
    path.close()
    c.drawPath(path, _grad(t["tunica"][0], t["tunica"][1], torso_top, cuerpo_bot, a))
    if not silueta:
        _relleno_tela(c, path, torso_top, cuerpo_bot, a, t.get("desgaste", 0.2), T, seed)
    # manto cruzado
    if t["manto"]:
        m = skia.Path()
        m.moveTo(-80, torso_top + 18)
        m.quadTo(-20, torso_top + 10, 60, torso_top + 40)
        m.lineTo(-10, cuerpo_bot - 40)
        m.lineTo(-96, cuerpo_bot - 30)
        m.close()
        c.drawPath(m, _grad(t["manto"][0], t["manto"][1], torso_top, cuerpo_bot, a))
        if not silueta:
            _relleno_tela(c, m, torso_top, cuerpo_bot - 30, a, t.get("desgaste", 0.2) * 0.7, T, seed + 1)
        c.drawRect(skia.Rect(-82, -300, 82, -286), P(t["manto"][1], a * 0.8))  # cinturón
    # brazos según pose
    la, ra = POSES.get(pose, POSES["abajo"])
    osc = 4 * math.sin(T * 1.7 + seed)
    col_brazo = t["manto"][0] if t["manto"] else t["tunica"][0]
    if not espaldas or True:
        _brazo(c, -78, torso_top + 40, la + osc + (18 * math.sin(T * 7 + seed) if camina else 0), 175, 44, col_brazo, t["piel"], a)
        _brazo(c, 78, torso_top + 40, ra - osc - (18 * math.sin(T * 7 + seed) if camina else 0), 175, 44, t["tunica"][0], t["piel"], a)
    # cuello y cabeza
    c.drawRect(skia.Rect(-20, torso_top - 34, 20, torso_top + 6), P(t["piel"], a))
    hy = torso_top - 100
    c.save()
    c.translate(0, hy)
    c.rotate(mira * 8 + 1.5 * math.sin(T * 0.9 + seed))
    if t.get("largo"):  # pelo largo detrás
        c.drawRoundRect(skia.Rect(-70, -62, 70, 92), 50, 50, P(t["pelo"], a))
    if t.get("velo") and not silueta:
        c.drawRoundRect(skia.Rect(-82, -78, 82, 110), 60, 60, _grad("#e9dcc0", "#bfae8a", -78, 110, a))
    sh = skia.GradientShader.MakeRadial((-18, -20), 110, [C(t["piel"], a), C(_oscuro(t["piel"]), a)])
    cara = skia.Path()
    cara.addOval(skia.Rect(-60, -70, 60, 74))
    c.drawPath(cara, skia.Paint(Shader=sh, AntiAlias=True))
    if not silueta:
        c.save()
        c.clipPath(cara, skia.ClipOp.kIntersect, True)
        shc = skia.GradientShader.MakeLinear([(-10, 0), (64, 0)], [C("#000000", 0), C("#4a2416", 0.32 * a)])
        c.drawRect(skia.Rect(-60, -70, 64, 76), skia.Paint(Shader=shc))
        c.restore()
        textura_en(c, cara, "papel", 0.25, 0.5)
    if not espaldas and not silueta:
        # ojos que parpadean y miran
        parp = 1.0 if (T * 0.55 + seed * 0.37) % 3.1 > 0.12 else 0.15
        for ex in (-22, 22):
            c.drawOval(skia.Rect(ex - 6 + mira * 8, -6 - 7 * parp, ex + 6 + mira * 8, -6 + 7 * parp), P("#2a1a12", a))
        c.drawRoundRect(skia.Rect(-12 + mira * 6, 30, 12 + mira * 6, 35), 3, 3, P("#7a3f2e", a * 0.8))
        if t.get("barba"):
            b = skia.Path()
            b.moveTo(-56, 6)
            b.quadTo(-50, 90, 0, 96)
            b.quadTo(50, 90, 56, 6)
            b.quadTo(30, 40, 0, 44)
            b.quadTo(-30, 40, -56, 6)
            c.drawPath(b, P(t["pelo"], a))
            c.drawRoundRect(skia.Rect(-14 + mira * 6, 28, 14 + mira * 6, 34), 3, 3, P("#3a2418", a * 0.9))
    # pelo arriba
    hp = skia.Path()
    hp.moveTo(-62, -8)
    hp.quadTo(-66, -86, 0, -84)
    hp.quadTo(66, -86, 62, -8)
    hp.quadTo(40, -50, 0, -52)
    hp.quadTo(-40, -50, -62, -8)
    if espaldas:
        c.drawOval(skia.Rect(-62, -76, 62, 76), P(t["pelo"], a))
    else:
        c.drawPath(hp, P(t["pelo"], a))
    if t.get("velo") and not silueta and not espaldas:
        v = skia.Path()
        v.moveTo(-84, 100)
        v.quadTo(-90, -96, 0, -92)
        v.quadTo(90, -96, 84, 100)
        v.lineTo(62, 100)
        v.quadTo(66, -60, 0, -62)
        v.quadTo(-66, -60, -62, 100)
        v.close()
        c.drawPath(v, _grad("#efe4cc", "#c8b690", -96, 100, a))
        if tipo == "beduino":  # kufiya con rayas rojas y agal (cordón negro)
            c.save()
            c.clipPath(v, skia.ClipOp.kIntersect, True)
            for yy in range(-90, 100, 22):
                c.drawLine(-90, yy, 90, yy + 10, P("#b0303a", 0.45 * a, stroke=4))
            c.restore()
            c.drawRoundRect(skia.Rect(-70, -66, 70, -48), 9, 9, P("#1a1412", a))
            c.drawRoundRect(skia.Rect(-70, -50, 70, -36), 7, 7, P("#2a201c", a))
    c.restore()
    c.restore()


def _oscuro(hexa, f=0.78):
    h = hexa.lstrip("#")
    return "#%02x%02x%02x" % tuple(int(int(h[i:i + 2], 16) * f) for i in (0, 2, 4))


def ave(c, x, y, s, T, seed=0, color="#1a1214", a=0.9):
    """Ave en silueta que aletea."""
    ala = math.sin(T * 9 + seed) * 0.8
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    p = skia.Path()
    p.moveTo(-30, -12 * ala)
    p.quadTo(-14, -4, 0, 4)
    p.quadTo(14, -4, 30, -12 * ala)
    p.quadTo(14, 6, 0, 10)
    p.quadTo(-14, 6, -30, -12 * ala)
    c.drawPath(p, P(color, a))
    c.restore()


def paloma(c, x, y, s, T, a=1.0):
    """Paloma blanca luminosa (Espíritu Santo)."""
    brillo_radial(c, x, y, 220 * s, "#fff4d6", 0.55 * a)
    ala = math.sin(T * 5) * 0.6
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    body = skia.Path()
    body.moveTo(-70, 10)
    body.quadTo(-10, -20, 60, -6)
    body.quadTo(80, -4, 86, 6)
    body.quadTo(60, 10, 40, 26)
    body.quadTo(-10, 40, -70, 10)
    c.drawPath(body, P("#ffffff", a))
    for sgn in (-1, 1):
        w = skia.Path()
        w.moveTo(-10, 0)
        w.quadTo(-40, -90 * (0.6 + ala * sgn * 0.4), -110, -120 * (0.6 + ala * sgn * 0.4))
        w.quadTo(-40, -40, 30, 0)
        w.close()
        c.drawPath(w, P("#fbf7ee", a * (0.95 if sgn > 0 else 0.8)))
    c.restore()
