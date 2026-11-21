"""Portada (miniatura) del capítulo: un cuadro fuerte del video + título grande + etiqueta del capítulo + logo.

Uso (desde motor_fe/):  python portada.py <carpeta>
Lee "portada" del guion.json:
  {"t": 41.0, "titulo": "LA PIEDRA QUE ENCONTRÓ LA BIBLIA", "resaltar": ["BIBLIA"], "etiqueta": "CAPÍTULO 1"}
Escribe <carpeta>/portada.png (1080x1920, para TikTok/Reels/Shorts) y <carpeta>/portada_16x9.png (1280x720, YouTube).
El título va en la franja central (en TikTok la parte de abajo la tapan los botones y el texto).
"""
import json
import os
import sys

import skia

import motor
from estilo import C, H, P, W, partir
from cierre_marca import logo_imagen

HERE = os.path.dirname(os.path.abspath(__file__))
_TF = {}


def tf(nombre):
    if nombre not in _TF:
        _TF[nombre] = skia.Typeface.MakeFromFile(os.path.join(HERE, "fuentes", nombre))
    return _TF[nombre]


def titulo_grande(c, lineas, resaltar, cx, y0, tam, ancho_max):
    """Título en Anton, blanco con borde negro grueso; las palabras resaltadas en lima de la marca."""
    f = skia.Font(tf("Anton-Regular.ttf"), tam)
    for i, ln in enumerate(lineas):
        y = y0 + i * tam * 1.02
        palabras = ln.split()
        esp = f.measureText(" ")
        total = sum(f.measureText(p) for p in palabras) + esp * (len(palabras) - 1)
        x = cx - total / 2
        for p in palabras:
            limpia = p.strip(".,:;¿?¡!«»").upper()
            col = "#d9f26a" if limpia in resaltar else "#ffffff"
            borde = P("#000000", 1, stroke=tam * 0.14)
            sombra = P("#000000", 0.55)
            sombra.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, tam * 0.12))
            c.drawString(p, x + 6, y + 10, f, sombra)
            c.drawString(p, x, y, f, borde)
            c.drawString(p, x, y, f, P(col))
            x += f.measureText(p) + esp


def portada(carpeta):
    motor.cargar(carpeta)
    cfg = motor.GUION.get("portada", {})
    t = float(cfg.get("t", motor.TOTAL * 0.45))
    motor.SIN_SUBS = True
    base = skia.Surface(W, H)
    motor.draw_frame(base.getCanvas(), t)
    img = base.makeImageSnapshot()
    s = skia.Surface(W, H)
    c = s.getCanvas()
    # el cuadro, sin los subtítulos (se tapan con una franja oscura arriba) y un poco más oscuro para que resalte el título
    c.drawImage(img, 0, 0)
    sh = skia.GradientShader.MakeLinear([(0, 0), (0, H)], [C("#000000", 0.85), C("#000000", 0.25), C("#000000", 0.35), C("#000000", 0.75)],
                                        [0, 0.3, 0.6, 1])
    c.drawRect(skia.Rect(0, 0, W, H), skia.Paint(Shader=sh))
    titulo = cfg.get("titulo", motor.GUION.get("titulo", "")).upper()
    resaltar = [r.upper() for r in cfg.get("resaltar", [])]
    tam = 150
    lineas = []
    while tam > 80:
        f = skia.Font(tf("Anton-Regular.ttf"), tam)
        lineas, cur = [], ""
        for w in titulo.split():
            prueba = (cur + " " + w).strip()
            if f.measureText(prueba) > 940 and cur:
                lineas.append(cur)
                cur = w
            else:
                cur = prueba
        lineas.append(cur)
        if len(lineas) <= 4:
            break
        tam -= 10
    y0 = 760 - (len(lineas) - 1) * tam * 0.5
    # etiqueta del capítulo
    et = cfg.get("etiqueta", "")
    if et:
        fe = skia.Font(tf("Anton-Regular.ttf"), 54)
        we = fe.measureText(et)
        r = skia.Rect(W / 2 - we / 2 - 30, y0 - tam - 90, W / 2 + we / 2 + 30, y0 - tam - 10)
        c.drawRoundRect(r, 14, 14, P("#d9f26a"))
        c.drawString(et, W / 2 - we / 2, r.bottom() - 20, fe, P("#141414"))
    titulo_grande(c, lineas, resaltar, W / 2, y0, tam, 940)
    # logo pequeño abajo (encima de la zona que tapan los botones de TikTok)
    c.save()
    c.translate(W / 2, 1380)
    c.scale(0.32, 0.32)
    c.translate(-W / 2, -1380)
    capa = skia.Surface(W, H)
    capa.getCanvas().clear(C("#000000", 0))
    logo_imagen(capa.getCanvas(), W / 2, 1180, 1.0, 1.0)
    li = capa.makeImageSnapshot()
    p = skia.Paint()
    p.setColorFilter(skia.ColorFilters.Blend(C("#ffffff"), skia.BlendMode.kSrcIn))
    c.drawImage(li, 0, 0, skia.SamplingOptions(), p)
    c.restore()
    out = os.path.join(motor.CARPETA, "portada.png")
    s.makeImageSnapshot().save(out, skia.kPNG)
    # versión 16:9 para YouTube (el cuadro recortado al centro + el mismo título)
    s2 = skia.Surface(1280, 720)
    c2 = s2.getCanvas()
    c2.drawImageRect(img, skia.Rect(0, 560, W, 560 + W * 720 / 1280), skia.Rect(0, 0, 1280, 720), skia.SamplingOptions(skia.FilterMode.kLinear))
    c2.drawRect(skia.Rect(0, 0, 1280, 720), P("#000000", 0.45))
    t2 = 104
    f2 = skia.Font(tf("Anton-Regular.ttf"), t2)
    lin2 = partir_anton(titulo, f2, 1160)
    titulo_grande(c2, lin2, resaltar, 640, 360 - (len(lin2) - 1) * t2 * 0.5 + t2 * 0.35, t2, 1160)
    s2.makeImageSnapshot().save(os.path.join(motor.CARPETA, "portada_16x9.png"), skia.kPNG)
    print("PORTADA_OK", out)


def partir_anton(texto, f, maxw):
    lineas, cur = [], ""
    for w in texto.split():
        prueba = (cur + " " + w).strip()
        if f.measureText(prueba) > maxw and cur:
            lineas.append(cur)
            cur = w
        else:
            cur = prueba
    lineas.append(cur)
    return lineas


if __name__ == "__main__":
    portada(sys.argv[1])
