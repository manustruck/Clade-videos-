"""Escenarios. Cada uno es una función esc_<nombre>(c, T, k, S) que dibuja el fondo y sus elementos.

T = segundos desde que empezó el plano, k = avance del plano (0-1), S = el plano del guion (dict).
Todo escenario tiene algo en movimiento propio (sol, nubes, aves, velas, lluvia, partículas),
además del movimiento de cámara que pone el motor. 'px' es el paralaje: capas lejanas se mueven menos.
"""
import math
import random

import skia

from estilo import (C, H, P, W, bokeh, brillo_radial, degradado, estrellas, haces, lerp, particulas, suave,
                    texto, partir, clamp)
from personajes import ave, paloma, persona
from texturas import mano_divina, onda_presion, pasto, textura_en, trueno
from objetos import cabra, codice, piedra, rollo, vasija

# ------------------------------------------------------------------ piezas reutilizables


def _personajes(c, T, S):
    if S.get("_capa") == "fondo":  # al dibujar por capas, los personajes van en la capa del frente
        return
    for i, p in enumerate(S.get("pers", [])):
        a = 1.0
        if "entra" in p:  # aparece en el segundo 'entra' del plano
            a = suave((T - p["entra"]) / 0.4)
            if a <= 0:
                continue
        x = p.get("x", W / 2)
        if "hasta_x" in p:  # camina de x a hasta_x durante el plano
            x = lerp(x, p["hasta_x"], suave(T / max(0.1, S.get("_dur", 4))))
        persona(c, x, p.get("y", 1560), p.get("s", 1.0), p.get("tipo", "biblico"), T, p.get("pose", "abajo"),
                p.get("mira", 0.0), a, p.get("espaldas", False), "hasta_x" in p, seed=i * 1.7,
                brillo=p.get("brillo", 0.0), silueta=p.get("silueta", False))


def _montes(c, colores, base, amp, seed, px=0.0, T=0.0):
    rnd = random.Random(seed)
    for i, col in enumerate(colores):
        p = skia.Path()
        y0 = base + i * 90
        p.moveTo(-300, H + 400)
        ph = rnd.uniform(0, 6)
        f = rnd.uniform(0.004, 0.007)
        off = px * (0.2 + 0.25 * i)
        for x in range(-300, W + 320, 30):
            y = y0 - amp * (0.6 - 0.15 * i) * (0.5 + 0.5 * math.sin(x * f + ph)) - 30 * math.sin(x * f * 2.7 + ph * 2)
            p.lineTo(x + off, y)
        p.lineTo(W + 300, H + 400)
        p.close()
        c.drawPath(p, P(col))


def _nubes(c, T, seed, n, y0, y1, col="#ffffff", a=0.18, vel=12):
    rnd = random.Random(seed)
    for _ in range(n):
        x = rnd.uniform(-300, W + 300)
        y = rnd.uniform(y0, y1)
        s = rnd.uniform(0.7, 1.6)
        xx = (x + vel * s * T) % (W + 700) - 350
        p = P(col, a)
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 18))
        for dx, dy, r in ((-60, 10, 50), (0, -10, 70), (70, 8, 55), (130, 16, 40)):
            c.drawCircle(xx + dx * s, y + dy * s, r * s, p)


def _sol(c, x, y, r, col="#ffd89a", a=1.0):
    brillo_radial(c, x, y, r * 5, col, 0.45 * a)
    brillo_radial(c, x, y, r * 2, "#fff1cf", 0.6 * a)
    c.drawCircle(x, y, r, P("#fff4dc", a))


def _aves(c, T, seed, n, y0, y1, dur=12):
    rnd = random.Random(seed)
    for i in range(n):
        y = rnd.uniform(y0, y1)
        x = ((T + rnd.uniform(0, dur)) / dur % 1) * (W + 300) - 150
        ave(c, x, y + 20 * math.sin(T * 1.3 + i), rnd.uniform(0.6, 1.1), T, seed=i)


def _vela(c, x, y, s, T, seed=0):
    fl = 1 + 0.12 * math.sin(T * 13 + seed) + 0.07 * math.sin(T * 23 + seed * 2)
    brillo_radial(c, x, y - 120 * s, 260 * s * fl, "#ffb85c", 0.42)
    sh = skia.GradientShader.MakeLinear([(x - 26 * s, 0), (x + 26 * s, 0)], [C("#f6ead2"), C("#d8c7a8")])
    c.drawRoundRect(skia.Rect(x - 26 * s, y - 110 * s, x + 26 * s, y), 6 * s, 6 * s, skia.Paint(Shader=sh, AntiAlias=True))
    c.save()
    c.translate(x, y - 112 * s)
    c.rotate(5 * math.sin(T * 3 + seed))
    c.scale(s, s * fl)
    p = skia.Path()
    p.moveTo(0, -62)
    p.quadTo(18, -20, 12, 0)
    p.quadTo(0, 10, -12, 0)
    p.quadTo(-18, -20, 0, -62)
    c.drawPath(p, P("#ffcf6e"))
    c.drawOval(skia.Rect(-5, -26, 5, 0), P("#fffbe8"))
    c.restore()


def _rayos(c, S, y1=1150):
    """Rayos en el cielo (detrás de edificios y personajes). El destello de pantalla lo pone el motor."""
    for k, tt in enumerate(S.get("_truenos", [])):
        trueno(c, S.get("_t", 0) - tt, seed=k + S.get("_i", 0) * 5, x=S.get("trueno_x"), y1=y1, destello=False)


# ------------------------------------------------------------------ escenarios


def esc_atardecer(c, T, k, S):
    """Colina al atardecer: degradado púrpura → rosa → naranja, sol que baja, nubes, montes, flores y aves."""
    px = S.get("_px", 0)
    degradado(c, ["#2a1f3d", "#6b3a5e", "#c8607a", "#f6a86b", "#ffd59a"], 0, 1250, stops=[0, 0.3, 0.6, 0.85, 1])
    estrellas(c, T, n=30, y1=350)
    _sol(c, W * 0.5 + px * 0.1, 980 + 40 * k, 95)
    _rayos(c, S)
    _nubes(c, T, 4, 6, 300, 800, "#ffd0b0", 0.16)
    _montes(c, ["#7a4a6b", "#5a3352", "#3e2340"], 1080, 220, 2, px, T)
    # colina con hierba
    p = skia.Path()
    p.moveTo(-300, H + 300)
    p.lineTo(-300, 1500)
    p.quadTo(W / 2 + px * 0.6, 1330, W + 300, 1500)
    p.lineTo(W + 300, H + 300)
    p.close()
    sh = skia.GradientShader.MakeLinear([(0, 1330), (0, H)], [C("#6f8a3e"), C("#2f4421")])
    c.drawPath(p, skia.Paint(Shader=sh, AntiAlias=True))
    textura_en(c, p, "piedra", 0.35, 1.2)
    pasto(c, T, 1400, 1560, px, seed=4, densidad=0.5)          # pasto detrás del personaje
    _aves(c, T, 3, 5, 380, 700)
    haces(c, W * 0.5, 700, -8, T, n=3, ancho_=180, color="#ffe3b0", a=0.09, seed=2)
    _personajes(c, T, S)
    pasto(c, T, 1560, H + 120, px, seed=5, densidad=0.9)       # pasto delante (tapa los pies, da profundidad)
    particulas(c, T, seed=11, n=40, color="#ffe2a8", a=0.55)


def esc_noche_ciudad(c, T, k, S):
    """Ciudad gris-azulada (el problema: ansiedad, soledad). Ventanas que se encienden, estrellas, lluvia opcional."""
    px = S.get("_px", 0)
    degradado(c, ["#0e1324", "#1f2840", "#3b4560"], 0, 1500)
    estrellas(c, T, n=80, y1=700)
    _rayos(c, S)
    rnd = random.Random(4)
    for capa, (col, base, alto, f) in enumerate((("#2a3350", 1300, 700, 0.3), ("#20283f", 1420, 600, 0.6), ("#161c2e", 1560, 520, 1.0))):
        x = -260
        while x < W + 260:
            w = rnd.uniform(110, 200)
            h = rnd.uniform(alto * 0.45, alto)
            xx = x + px * f
            ed = skia.Path()
            ed.addRect(skia.Rect(xx, base - h, xx + w - 8, H + 200))
            c.drawPath(ed, P(col))
            textura_en(c, ed, "piedra", 0.3, 0.8)
            for wy in range(int(base - h + 30), int(base - 40), 54):
                for wx in range(int(xx + 18), int(xx + w - 30), 40):
                    on = (math.sin(wx * 0.37 + wy * 0.11 + capa) + math.sin(T * 0.6 + wx * 0.05)) > 1.1
                    if on:
                        c.drawRect(skia.Rect(wx, wy, wx + 18, wy + 26), P("#ffcf7a", 0.75 - capa * 0.15))
            x += w
    degradado(c, ["#1a1f30", "#0b0e18"], 1560, H + 200)
    for i in range(5):  # charcos que reflejan las ventanas
        x = 120 + i * 230 + px * 0.9
        c.drawOval(skia.Rect(x - 90, 1700 + (i % 2) * 70, x + 90, 1730 + (i % 2) * 70), P("#ffcf7a", 0.08 + 0.04 * math.sin(T * 2 + i)))
    _personajes(c, T, S)
    bokeh(c, T, seed=6, n=10, colores=("#ffcf8a", "#8fb4ff"), a=0.16)
    particulas(c, T, seed=12, n=25, color="#cfe0ff", a=0.35)


def esc_pueblo(c, T, k, S):
    """Pueblo bíblico de adobe a pleno día o al atardecer ('hora': 0 día → 1 atardecer)."""
    px = S.get("_px", 0)
    hora = S.get("hora", 0.0) + 0.25 * k * S.get("avanza_hora", 0)
    top = "#3d6fae" if hora < 0.5 else "#5a2f52"
    degradado(c, [top, "#8fb7d8" if hora < 0.5 else "#d9785a", "#f3d7a6"], 0, 1250)
    c.drawRect(skia.Rect(-300, 1250, W + 300, 1400), P("#e9c896"))
    _sol(c, W * 0.72 + px * 0.1, lerp(330, 900, hora) + 60 * k, 75)
    _nubes(c, T, 7, 4, 250, 600, "#ffffff", 0.2)
    _rayos(c, S)
    rnd = random.Random(5)
    for capa, (base, f, col) in enumerate(((1150, 0.35, "#d2a776"), (1300, 0.7, "#c08d5c"))):
        x = -200
        while x < W + 200:
            w, h = rnd.uniform(160, 280), rnd.uniform(150, 300)
            xx = x + px * f
            sh = skia.GradientShader.MakeLinear([(xx, 0), (xx + w, 0)], [C(col), C("#a8754a")])
            muro = skia.Path()
            muro.addRect(skia.Rect(xx, base - h, xx + w - 14, base + 40))
            c.drawPath(muro, skia.Paint(Shader=sh))
            textura_en(c, muro, "piedra", 0.55, 0.7)
            c.drawRect(skia.Rect(xx + w - 40, base - h, xx + w - 14, base + 40), P("#000000", 0.15))
            c.drawRect(skia.Rect(xx + w * 0.4, base - 90, xx + w * 0.4 + 46, base + 40), P("#6b4426"))
            c.drawRect(skia.Rect(xx + 20, base - h + 40, xx + 56, base - h + 76), P("#4a2e1a"))
            x += w
    sh = skia.GradientShader.MakeLinear([(0, 1320), (0, H)], [C("#d9b07a"), C("#a87a4c")])
    suelo = skia.Path()
    suelo.addRect(skia.Rect(-300, 1320, W + 300, H + 300))
    c.drawPath(suelo, skia.Paint(Shader=sh))
    textura_en(c, suelo, "piedra", 0.5, 1.4)
    pasto(c, T, 1330, 1400, px, seed=6, densidad=0.12, seco=True, flores=False)
    _personajes(c, T, S)
    pasto(c, T, 1800, H + 100, px, seed=7, densidad=0.18, seco=True, flores=False)
    particulas(c, T, seed=13, n=35, color="#fff0c8", a=0.4, vel=(-6, 6), deriva=60)


def esc_cuarto_vela(c, T, k, S):
    """Interior oscuro y cálido: ventana con haz de luz, polvo flotando y vela que titila."""
    px = S.get("_px", 0)
    degradado(c, ["#1a110d", "#2c1b14", "#1a100c"], 0, H)
    pared = skia.Path()
    pared.addRect(skia.Rect(-300, -300, W + 300, 1500))
    textura_en(c, pared, "piedra", 0.6, 0.9)
    wx, wy = 690 + px * 0.4, 520
    c.drawRect(skia.Rect(wx, wy, wx + 260, wy + 340), P("#ffd99a", 0.85))
    for i in range(1, 4):
        c.drawRect(skia.Rect(wx + i * 65 - 6, wy, wx + i * 65 + 6, wy + 340), P("#2c1b14"))
    c.drawRect(skia.Rect(wx, wy + 164, wx + 260, wy + 176), P("#2c1b14"))
    haces(c, wx + 130, wy + 170, 32, T, n=4, ancho_=110, color="#ffdca0", a=0.2, seed=4, largo=1800)
    c.drawRect(skia.Rect(-300, 1500, W + 300, H + 300), P("#120b08"))
    mesa = skia.Path()
    mesa.addRoundRect(skia.Rect(160 + px * 0.8, 1380, 620 + px * 0.8, 1420), 8, 8)
    c.drawPath(mesa, P("#5a3a24"))
    textura_en(c, mesa, "tela", 0.6, 0.4)
    _vela(c, 300 + px * 0.8, 1382, 1.0, T)
    _personajes(c, T, S)
    particulas(c, T, seed=14, n=55, color="#ffd9a0", a=0.6, vel=(-8, 8), deriva=40)
    bokeh(c, T, seed=2, n=8, a=0.12)


def esc_cruz(c, T, k, S):
    """Cruz en la colina con rayos que giran detrás (el momento central)."""
    px = S.get("_px", 0)
    degradado(c, ["#3a1a12", "#a4492a", "#f0a050", "#ffe2a0"], 0, 1300)
    cx, cy = W / 2 + px * 0.3, 900
    c.save()
    c.translate(cx, cy)
    c.rotate(T * 4)
    for i in range(18):
        c.rotate(20)
        p = skia.Path()
        p.moveTo(0, 0)
        p.lineTo(-40, -1600)
        p.lineTo(40, -1600)
        p.close()
        c.drawPath(p, P("#fff2cc", 0.09))
    c.restore()
    brillo_radial(c, cx, cy, 520, "#fff1c9", 0.6)
    _rayos(c, S)
    p = skia.Path()
    p.moveTo(-300, H + 300)
    p.lineTo(-300, 1480)
    p.quadTo(W / 2 + px * 0.6, 1220, W + 300, 1480)
    p.lineTo(W + 300, H + 300)
    p.close()
    c.drawPath(p, P("#1d0f0a"))
    pasto(c, T, 1300, 1420, px, seed=8, densidad=0.35, colores=("#2a160e", "#3a2214", "#24130c", "#4a2c18"), flores=False)
    sh = skia.GradientShader.MakeLinear([(cx - 30, 0), (cx + 30, 0)], [C("#3a2214"), C("#7a4f30"), C("#3a2214")])
    pc = skia.Paint(Shader=sh, AntiAlias=True)
    madera = skia.Path()
    madera.addRect(skia.Rect(cx - 30, 560, cx + 30, 1330))
    madera.addRect(skia.Rect(cx - 190, 700, cx + 190, 758))
    c.drawPath(madera, pc)
    textura_en(c, madera, "tela", 0.7, 0.35)
    textura_en(c, madera, "piedra", 0.5, 0.5)
    _personajes(c, T, S)
    particulas(c, T, seed=15, n=50, color="#ffe9b8", a=0.7)


def esc_cielo(c, T, k, S):
    """Cielo nocturno con estrellas, nubes suaves y luz dorada (momentos de reflexión o de Dios)."""
    degradado(c, ["#0b0f22", "#1d2346", "#3b2f5c", "#6b4a6e"], 0, H)
    estrellas(c, T, n=160, y1=H)
    _nubes(c, T, 9, 7, 900, 1700, "#c9b5e8", 0.14, vel=18)
    _rayos(c, S)
    brillo_radial(c, W / 2, 700, 700, "#ffe2a8", 0.18 + 0.05 * math.sin(T))
    if S.get("paloma"):
        paloma(c, W / 2 + 60 * math.sin(T * 0.7), 760 + 30 * math.sin(T * 1.1), 1.4, T)
    _personajes(c, T, S)
    bokeh(c, T, seed=8, n=14, colores=("#ffe6b0", "#c9b5ff"), a=0.2)
    particulas(c, T, seed=16, n=40, color="#fff3d0", a=0.5)


def esc_pergamino(c, T, k, S):
    """Fondo de papel antiguo con líneas que se escriben solas (para citar la Escritura en grande)."""
    degradado(c, ["#3a2817", "#5c4024", "#3a2817"], 0, H)
    c.save()
    c.translate(W / 2, H * 0.47)
    c.rotate(-2 + 1.2 * math.sin(T * 0.4))
    w, h = 900, 1180
    sh = skia.GradientShader.MakeRadial((0, -100), 900, [C("#f3e2b8"), C("#d9bf8a"), C("#b99560")], [0, 0.7, 1])
    c.drawRoundRect(skia.Rect(-w / 2, -h / 2, w / 2, h / 2), 16, 16, skia.Paint(Shader=sh, AntiAlias=True))
    hoja = skia.Path()
    hoja.addRoundRect(skia.Rect(-w / 2, -h / 2, w / 2, h / 2), 16, 16)
    textura_en(c, hoja, "papel", 0.6, 1.0)
    rnd = random.Random(3)
    for _ in range(40):  # manchas del papel
        p = P("#8a6438", 0.06)
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 30))
        c.drawCircle(rnd.uniform(-w / 2, w / 2), rnd.uniform(-h / 2, h / 2), rnd.uniform(30, 120), p)
    tit = S.get("titulo", "")
    if tit:
        texto(c, tit, 0, -h / 2 + 150, "serif", 74, "#7a1f22")
    cuerpo = S.get("texto", "")
    lineas = partir(cuerpo, "serif", 62, w - 160)
    prog = clamp(T / max(0.5, S.get("_dur", 4) * 0.8))
    total = sum(len(l) for l in lineas)
    vis = int(total * prog)
    for i, ln in enumerate(lineas):
        s = ln[:max(0, vis)]
        vis -= len(ln)
        if s:
            texto(c, s, 0, -h / 2 + 300 + i * 82, "serif", 62, "#2b1d14")
    c.restore()
    particulas(c, T, seed=17, n=35, color="#ffe2a8", a=0.45)


def esc_cierre(c, T, k, S):
    """Cierre: logo del canal, 'Síguenos' que pasa a 'Siguiendo ✓', 'Compártelo' y el próximo capítulo."""
    canal = S.get("_canal", {})
    degradado(c, ["#120c0a", "#2c1a12", "#4a2a18"], 0, H)
    haces(c, W / 2, -200, 0, T, n=5, ancho_=160, color="#ffdca0", a=0.12, seed=7)
    bokeh(c, T, seed=3, n=16, a=0.22)
    cx, cy = W / 2, 820
    e = suave(T / 0.6)
    brillo_radial(c, cx, cy, 380, "#ffd590", 0.5 * e)
    c.save()
    c.translate(cx, cy)
    s = 0.6 + 0.4 * e + 0.02 * math.sin(T * 2.5)
    c.scale(s, s)
    c.drawCircle(0, 0, 170, P("#f7efe0", e))
    c.drawCircle(0, 0, 170, P("dorado", e, stroke=10))
    # logo «Fe en Escena»: cruz pequeña, FE grande y EN ESCENA debajo
    c.drawRect(skia.Rect(-5, -128, 5, -86), P("#b98a4e", e))
    c.drawRect(skia.Rect(-18, -116, 18, -107), P("#b98a4e", e))
    texto(c, canal.get("iniciales", "FE"), 0, 28, "black", 120, "#3a2416", e)
    texto(c, canal.get("logo_sub", "EN ESCENA"), 0, 82, "bold", 30, "#a3262c", e)
    c.drawRect(skia.Rect(-128, 70, -108, 73), P("#b98a4e", e))
    c.drawRect(skia.Rect(108, 70, 128, 73), P("#b98a4e", e))
    c.restore()
    texto(c, canal.get("nombre", "Tu canal"), cx, 1088, "bold", 58, "#f6ead2", e, sombra=1)
    if canal.get("usuario"):
        texto(c, canal["usuario"], cx, 1140, "med", 34, "#d7af72", e * 0.9)
    # botón seguir → la mano de Cristo baja desde la luz y lo presiona → siguiendo
    T_TOQUE = 2.0
    b = suave((T - 0.8) / 0.4)
    if b > 0:
        sig = T > T_TOQUE
        bw = 330
        col = "#2a2a2e" if sig else "#fe2c55"
        r = skia.Rect(cx - bw / 2, 1195, cx + bw / 2, 1285)
        c.save()
        sc = 1 - 0.1 * math.sin(clamp((T - T_TOQUE + 0.12) / 0.3) * math.pi) if T > T_TOQUE - 0.12 else 1
        c.translate(cx, 1240)
        c.scale(sc * b, sc * b)
        c.translate(-cx, -1240)
        c.drawRoundRect(r, 14, 14, P(col))
        if sig:  # 'Siguiendo' + palomita dibujada (la letra no trae el símbolo)
            wt = texto(c, "Siguiendo", cx - 22, 1257, "semi", 44, "#ffffff")
            ck = skia.Path()
            x0 = cx - 22 + wt / 2 + 18
            ck.moveTo(x0, 1239)
            ck.lineTo(x0 + 12, 1251)
            ck.lineTo(x0 + 34, 1227)
            c.drawPath(ck, P("#ffffff", 1, stroke=6))
        else:
            texto(c, "Síguenos", cx, 1257, "semi", 44, "#ffffff")
        c.restore()
    onda_presion(c, cx + 60, 1240, (T - T_TOQUE) / 0.8)
    # la mano: llega (1.0 → 1.9 s), presiona (1.9 → 2.15 s), se queda un momento y se retira
    lleg = clamp((T - 1.0) / 0.9) if T < 2.6 else 1 - clamp((T - 2.6) / 0.9)
    pres = math.sin(clamp((T - 1.88) / 0.3) * math.pi) if 1.88 < T < 2.18 else 0.0
    mano_divina(c, cx + 60, 1236, lleg, pres)
    # compartir que late
    sh = suave((T - 1.4) / 0.4)
    if sh > 0:
        y = 1420
        pul = 1 + 0.08 * math.sin(T * 6)
        c.save()
        c.translate(cx - 150, y)
        c.scale(pul * sh, pul * sh)
        c.drawCircle(0, 0, 54, P("#f1c66b"))
        p = skia.Path()  # flecha de compartir
        p.moveTo(-22, 16)
        p.quadTo(-20, -14, 14, -14)
        p.lineTo(14, -30)
        p.lineTo(36, -6)
        p.lineTo(14, 18)
        p.lineTo(14, 2)
        p.quadTo(-8, 0, -22, 16)
        c.drawPath(p, P("#3a2416"))
        c.restore()
        texto(c, "Compártelo", cx + 50, y + 16, "semi", 46, "#f6ead2", sh, sombra=1)
    nx = suave((T - 2.0) / 0.5)
    if nx > 0:
        texto(c, canal.get("proximo", "Próximo capítulo muy pronto"), cx, 1580 + 20 * (1 - nx), "med", 40, "#e8c98e", nx)
    particulas(c, T, seed=18, n=50, color="#ffe2a8", a=0.6)


def _acantilado(c, base, alto, col, seed, px, f, cuevas=()):
    """Pared de roca con estratos y bocas de cueva."""
    rnd = random.Random(seed)
    p = skia.Path()
    p.moveTo(-300 + px * f, H + 300)
    x = -300
    p.lineTo(x + px * f, base - alto * 0.6)
    while x < W + 300:
        x += rnd.uniform(60, 140)
        p.lineTo(x + px * f, base - alto * rnd.uniform(0.75, 1.0))
    p.lineTo(W + 300 + px * f, H + 300)
    p.close()
    c.drawPath(p, P(col))
    textura_en(c, p, "piedra", 0.55, 0.9)
    c.save()
    c.clipPath(p, skia.ClipOp.kIntersect, True)
    for i in range(6):  # estratos horizontales
        y = base - alto * 0.9 + i * alto * 0.17
        pe = P("#000000", 0.05, stroke=8)
        pe.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 5))
        q = skia.Path()
        q.moveTo(-300, y)
        for xx in range(-300, W + 320, 60):
            q.lineTo(xx, y + 14 * math.sin(xx * 0.01 + i * 1.7))
        c.drawPath(q, pe)
    c.restore()
    for (cx, cy, r) in cuevas:
        xx = cx + px * f
        sh = skia.GradientShader.MakeRadial((xx, cy), r * 1.3, [C("#0d0806"), C("#2a1a10"), C("#2a1a10", 0)], [0, 0.7, 1])
        c.drawOval(skia.Rect(xx - r, cy - r * 1.15, xx + r, cy + r * 0.9), skia.Paint(Shader=sh, AntiAlias=True))


def esc_desierto(c, T, k, S):
    """Acantilados de Qumrán junto al mar Muerto: cielo cálido, cuevas en la roca, polvo y cabras."""
    px = S.get("_px", 0)
    hora = S.get("hora", 0.2)
    degradado(c, ["#6aa0c8" if hora < 0.5 else "#5a3a5e", "#e9c79a" if hora < 0.5 else "#e08a5a", "#f3dcb0"], 0, 1100)
    _rayos(c, S)
    _sol(c, W * 0.25 + px * 0.1, lerp(300, 820, hora), 70)
    _nubes(c, T, 12, 3, 250, 500, "#ffffff", 0.18)
    c.drawRect(skia.Rect(-300, 960, W + 300, 1010), P("#7fa9b8", 0.8))  # el mar Muerto a lo lejos
    _acantilado(c, 1050, 300, "#c99a68", 21, px, 0.3)
    _acantilado(c, 1350, 520, "#b07f50", 22, px, 0.6, cuevas=S.get("cuevas", [(640, 1080, 55), (300, 1150, 38)]))
    sh = skia.GradientShader.MakeLinear([(0, 1380), (0, H)], [C("#d8b07a"), C("#a27346")])
    suelo = skia.Path()
    suelo.addRect(skia.Rect(-300, 1380, W + 300, H + 300))
    c.drawPath(suelo, skia.Paint(Shader=sh))
    textura_en(c, suelo, "piedra", 0.5, 1.4)
    for i in range(S.get("cabras", 0)):
        cabra(c, 760 + i * 120 + px * 0.9 + 20 * math.sin(T * 0.4 + i), 1520 + i * 30, 0.8, T, seed=i)
    _personajes(c, T, S)
    pasto(c, T, 1760, H + 100, px, seed=9, densidad=0.15, seco=True, flores=False)
    particulas(c, T, seed=22, n=45, color="#fff0c8", a=0.45, vel=(-6, 6), deriva=80)


def esc_cueva(c, T, k, S):
    """Interior de la cueva: roca oscura, boca de luz, vasijas en el suelo. 'lanza' (s): entra una piedra;
    'rompe' (s): se parte la vasija 'rompe_i'."""
    px = S.get("_px", 0)
    c.drawRect(skia.Rect(-300, -300, W + 300, H + 300), P("#1c120c"))
    roca = skia.Path()
    roca.addRect(skia.Rect(-300, -300, W + 300, H + 300))
    textura_en(c, roca, "piedra", 0.7, 0.8)
    bx, by = 260 + px * 0.3, 380
    boca = skia.Path()
    boca.addOval(skia.Rect(bx - 210, by - 190, bx + 210, by + 160))
    c.drawPath(boca, _grad_cielo())
    haces(c, bx, by, -32, T, n=4, ancho_=150, color="#ffe2b0", a=0.22, seed=6, largo=1900)
    suelo = skia.Path()
    suelo.moveTo(-300, 1500)
    suelo.quadTo(W / 2, 1400, W + 300, 1520)
    suelo.lineTo(W + 300, H + 300)
    suelo.lineTo(-300, H + 300)
    suelo.close()
    c.drawPath(suelo, P("#3a2618"))
    textura_en(c, suelo, "piedra", 0.6, 1.2)
    vas = S.get("vasijas", [(520, 1560, 1.0), (760, 1600, 1.15), (900, 1540, 0.85)])
    ri = S.get("rompe_i", 1)
    t_r = S.get("rompe")
    for i, (x, y, sc) in enumerate(vas):
        r = clamp((T - t_r) / 0.9) if (t_r is not None and i == ri and T >= t_r) else 0.0
        vasija(c, x + px * 0.9, y, sc, r, seed=i, T=T)
    if "lanza" in S and t_r is not None:
        x1, y1 = vas[ri][0] + px * 0.9, vas[ri][1] - 160 * vas[ri][2]
        piedra(c, bx + 40, by + 40, x1, y1, (T - S["lanza"]) / max(0.2, t_r - S["lanza"]), alto=180)
    _personajes(c, T, S)
    particulas(c, T, seed=23, n=60, color="#ffe2b0", a=0.55, vel=(-5, 5), deriva=40)


def _grad_cielo():
    return skia.Paint(Shader=skia.GradientShader.MakeLinear([(0, 190), (0, 540)], [C("#fff3d6"), C("#f2c98e")]), AntiAlias=True)


def esc_rollo(c, T, k, S):
    """El rollo bajo un foco, en un santuario oscuro. 'abre' (s) lo desenrolla; 'comparar' muestra al lado un códice."""
    degradado(c, ["#0e0b10", "#1d1520", "#120c0a"], 0, H)
    haces(c, W / 2, -120, 0, T, n=3, ancho_=220, color="#fff0cc", a=0.16, seed=8, largo=1800)
    bokeh(c, T, seed=31, n=10, a=0.14)
    c.drawRoundRect(skia.Rect(-100, 1180, W + 100, 1260), 10, 10, P("#3b2616"))
    k_ab = clamp((T - S.get("abre", 0.2)) / 1.6)
    if S.get("comparar"):
        rollo(c, 330, 1000, 420, k_ab, T, alto=260, brillo=S.get("brillo", 0.6))
        codice(c, 820, 1000, 0.8)
    else:
        rollo(c, W / 2, 980, S.get("ancho", 900), k_ab, T, alto=360, brillo=S.get("brillo", 0.8))
    _personajes(c, T, S)
    particulas(c, T, seed=24, n=50, color="#fff0c8", a=0.55)


ESCENAS = {k[4:]: v for k, v in globals().items() if k.startswith("esc_")}
from cierre_marca import esc_cierre_marca  # noqa: E402
ESCENAS["cierre_marca"] = esc_cierre_marca
