"""Motor de videos del canal de fe: estilo de las referencias, con la cámara SIEMPRE en movimiento.

Lee <carpeta>/guion.json y <carpeta>/voz/NN.json (tiempos por palabra de narrar.py) y dibuja 1080x1920 a 30 fps.

Uso (desde motor_fe/):
  python motor.py <carpeta> hoja [0.5]       -> <carpeta>/test/hoja.png   (un cuadro por plano)
  python motor.py <carpeta> cuadro 12.3      -> <carpeta>/test/cuadro.png
  python motor.py <carpeta> tira 8.0 2.0     -> <carpeta>/test/tira.png   (cuadros seguidos para ver el movimiento)
  python motor.py <carpeta> movimiento       -> comprueba que ningún tramo quede quieto
  El video completo: python render.py <carpeta> 3

Cómo se mueve todo (lo que pidió el canal: nunca quieto):
  1. Cámara por plano: zoom, desplazamiento y giro de inicio a fin, con una curva que nunca llega a velocidad cero.
     Si un plano no trae cámara, se le asigna una automáticamente (alterna acercar, alejar, subir y bajar).
  2. 'Respiración' de cámara encima de todo (zoom y giro muy leves) para que ni un cuadro quede congelado.
  3. Cada escenario tiene movimiento propio (sol, nubes, aves, velas, lluvia) y partículas flotando siempre.
  4. Transiciones en movimiento (fundido, zoom, deslizar, luz, negro): la cámara sigue avanzando durante el cruce.
  5. Subtítulos palabra por palabra, rótulos que entran con rebote y pergaminos que suben.
"""
import json
import math
import os
import re
import sys

import skia

from estilo import (H, W, C, P, ancho, caja_clave, cita, clamp, contador, font, pastilla, pergamino, suave,
                    vineta, vivo)
from escenas import ESCENAS

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
LEAD, GAP, TAIL = 0.25, 0.18, 0.6
TR = {"fundido": 0.45, "zoom": 0.5, "desliz": 0.45, "luz": 0.6, "negro": 0.7, "corte": 0.0}

CARPETA = None
GUION = PLANOS = CANAL = None
STARTS = ENDS = CUTS = None
TOTAL = NF = 0
PALABRAS = []   # [{w, t, d, plano, clave, peligro}]
BLOQUES = []    # grupos de palabras que se muestran juntos


# ------------------------------------------------------------------ carga y tiempos
def _limpio(s):
    return s.replace("*", "").replace("_", "")


def cargar(carpeta):
    global CARPETA, GUION, PLANOS, CANAL, STARTS, ENDS, CUTS, TOTAL, NF, PALABRAS, BLOQUES
    CARPETA = os.path.abspath(carpeta)
    with open(os.path.join(CARPETA, "guion.json"), encoding="utf-8") as f:
        GUION = json.load(f)
    PLANOS = GUION["planos"]
    CANAL = dict(json.load(open(os.path.join(HERE, "canal.json"), encoding="utf-8")))
    CANAL.update(GUION.get("canal", {}))
    voces = []
    for i in range(len(PLANOS)):
        with open(os.path.join(CARPETA, "voz", "{:02d}.json".format(i)), encoding="utf-8") as f:
            voces.append(json.load(f))
    ENDS = [v[-1]["t"] + v[-1]["d"] if v else 1.0 for v in voces]
    STARTS, t = [], LEAD
    for i, e in enumerate(ENDS):
        t += PLANOS[i].get("pre", 0.0)
        STARTS.append(t)
        t += e + GAP + PLANOS[i].get("post", 0.0)
    TOTAL = round(t - GAP + TAIL + PLANOS[-1].get("cola", 2.4 if PLANOS[-1]["esc"] == "cierre" else 0.0), 2)
    NF = int(TOTAL * FPS)
    CUTS = [0.0] + [STARTS[i] - GAP / 2 - PLANOS[i].get("pre", 0.0) * 0.6 for i in range(1, len(PLANOS))] + [TOTAL]
    # palabras del guion (con *clave* y _peligro_) alineadas con los tiempos de la voz
    PALABRAS = []
    for i, S in enumerate(PLANOS):
        orig = S["n"].split()
        tts = voces[i]
        for j, w in enumerate(orig):
            # posición proporcional por caracteres entre el texto escrito y el leído
            if len(tts) == len(orig):
                tw = tts[j]
            else:
                pos = sum(len(_limpio(x)) + 1 for x in orig[:j]) / max(1, sum(len(_limpio(x)) + 1 for x in orig))
                acc, tot = 0, sum(len(x["w"]) + 1 for x in tts)
                tw = tts[-1]
                for x in tts:
                    if acc / max(1, tot) >= pos - 1e-6:
                        tw = x
                        break
                    acc += len(x["w"]) + 1
            PALABRAS.append(dict(w=_limpio(w), t=STARTS[i] + tw["t"], d=tw["d"], plano=i,
                                 clave="*" in w, peligro=w.startswith("_") or w.rstrip(".,;:!?»").endswith("_")))
    for j, p in enumerate(PALABRAS):  # fin = inicio de la siguiente (o +0.4 s)
        nxt = PALABRAS[j + 1]["t"] if j + 1 < len(PALABRAS) and PALABRAS[j + 1]["plano"] == p["plano"] else p["t"] + max(0.4, p["d"])
        p["fin"] = max(p["t"] + 0.05, nxt)
    # bloques: se corta en puntuación fuerte, en cambio de plano o al llenar 2 líneas
    BLOQUES, cur = [], []
    for p in PALABRAS:
        if cur and (p["plano"] != cur[-1]["plano"] or _lineas(cur + [p]) > 2):
            BLOQUES.append(cur)
            cur = []
        cur.append(p)
        if re.search(r"[.?!:;»]$", p["w"]) and len(cur) >= 2:
            BLOQUES.append(cur)
            cur = []
    if cur:
        BLOQUES.append(cur)
    for b in BLOQUES:
        b[0]["_bloque_ini"] = b[0]["t"] - 0.08
    with open(os.path.join(CARPETA, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump(timeline(), f, ensure_ascii=False, indent=1)


SUB_TAM, SUB_Y, SUB_MAX, SUB_LH = 50, 330, 900, 70


def _lineas(ps):
    n, w = 1, 0
    for p in ps:
        ww = ancho(p["w"] + " ", "semi", SUB_TAM)
        if w + ww > SUB_MAX and w > 0:
            n += 1
            w = 0
        w += ww
    return n


def t_palabra(i, sub):
    """Segundo absoluto en que se dice la primera palabra del plano i que empieza por 'sub'."""
    for p in PALABRAS:
        if p["plano"] == i and p["w"].lower().strip("¿¡«»\"',.;:!?").startswith(sub.lower()):
            return p["t"]
    return STARTS[i]


def timeline():
    ev = []
    for i, S in enumerate(PLANOS):
        if i > 0:
            ev.append(dict(t=CUTS[i], tipo="transicion", tr=S.get("tr", "fundido")))
        for p in PALABRAS:
            if p["plano"] == i and p["clave"]:
                ev.append(dict(t=p["t"], tipo="clave"))
        for key in ("cifra", "pergamino", "contador"):
            if key in S:
                ens = S[key].get("en", "")
                for en in (ens if isinstance(ens, list) else [ens]):
                    ev.append(dict(t=t_palabra(i, en) if en else STARTS[i], tipo=key))
        if S["esc"] == "cierre":
            ev.append(dict(t=CUTS[i], tipo="cierre"))
    return dict(total=TOTAL, starts=STARTS, ends=ENDS, cuts=CUTS, eventos=sorted(ev, key=lambda e: e["t"]))


# ------------------------------------------------------------------ cámara
AUTO = [dict(z=[1.06, 1.22]), dict(z=[1.24, 1.08], y=[-40, 30]), dict(z=[1.08, 1.2], x=[50, -50]),
        dict(z=[1.12, 1.26], y=[60, -40], r=[-1.5, 1.0]), dict(z=[1.22, 1.1], x=[-50, 40])]


def _cam_f(f):
    """Avance de cámara: dentro del plano usa la curva 'vivo'; fuera (durante transiciones) sigue en línea recta."""
    if f < 0:
        return 0.55 * f
    if f > 1:
        return 1 + 0.55 * (f - 1)
    return vivo(f)


def camara(i, t):
    S = PLANOS[i]
    cam = dict(AUTO[i % len(AUTO)])
    cam.update(S.get("cam", {}))
    z = cam.get("z", [1.06, 1.2])
    if abs(z[1] - z[0]) < 0.05:  # regla: siempre hay zoom
        z = [z[0], z[0] + 0.08]
    a, b = CUTS[i], CUTS[i + 1]
    f = _cam_f((t - a) / max(0.1, b - a))

    def v(key):
        r = cam.get(key, [0, 0])
        return r[0] + (r[1] - r[0]) * f
    zz = z[0] + (z[1] - z[0]) * f
    # respiración: nunca un cuadro congelado
    zz *= 1 + 0.008 * math.sin(t * 2 * math.pi / 3.3)
    rot = v("r") + 0.35 * math.sin(t * 2 * math.pi / 5.1)
    return zz, v("x") + 6 * math.sin(t * 0.9), v("y") + 5 * math.cos(t * 0.7), rot


def dibuja_plano(c, i, t, extra_z=1.0, dy=0.0):
    S = dict(PLANOS[i])
    S["_dur"] = CUTS[i + 1] - CUTS[i]
    S["_canal"] = CANAL
    z, x, y, r = camara(i, t)
    S["_px"] = x * 0.8
    c.save()
    c.translate(W / 2, H / 2 + dy)
    c.rotate(r)
    c.scale(z * extra_z, z * extra_z)
    c.translate(-W / 2 + x, -H / 2 + y)
    T = t - CUTS[i]
    ESCENAS[S["esc"]](c, T, clamp(T / max(0.1, S["_dur"])), S)
    c.restore()


# ------------------------------------------------------------------ rótulos del plano
def rotulos(c, i, t):
    S = PLANOS[i]
    a, b = CUTS[i], CUTS[i + 1]
    sale = 1 - suave((t - (b - 0.3)) / 0.3)  # se van al terminar el plano
    if "cita" in S:
        cita(c, S["cita"], min(suave((t - a - 0.3) / 0.4), sale))
    if "cifra" in S:
        q = S["cifra"]
        t0 = t_palabra(i, q["en"]) - 0.05 if q.get("en") else a + 0.4
        k = clamp((t - t0) / 0.45)
        num = q["num"]
        m = re.match(r"^([+\-]?)([\d.]+)$", num)
        if m and q.get("cuenta", True):  # el número sube contando
            val = float(m.group(2).replace(".", ""))
            cur = int(val * suave(clamp((t - t0) / 0.9)))
            num = m.group(1) + "{:,}".format(cur).replace(",", ".")
        if k > 0:
            pastilla(c, q.get("x", W / 2), q.get("y", 960), num, q.get("uni", ""), min(k, 1) * sale + 0.0001 if sale < 1 else k)
    if "pergamino" in S:
        q = S["pergamino"]
        t0 = t_palabra(i, q["en"]) if q.get("en") else a + 0.3
        pergamino(c, q["titulo"], q["texto"], min(clamp((t - t0) / 0.6), sale), y=q.get("y", 1560), T=t)
    if "contador" in S:
        q = S["contador"]
        act = [clamp((t - t_palabra(i, en)) / 0.35) if t >= t_palabra(i, en) else 0 for en in q.get("en", [])]
        contador(c, q.get("n", 3), act, t, y=q.get("y", 640), k=min(suave((t - a) / 0.4), sale))


# ------------------------------------------------------------------ subtítulos (karaoke de las referencias)
def subtitulos(c, t):
    bloque = None
    for bq in BLOQUES:
        if bq[0]["_bloque_ini"] <= t:
            bloque = bq
    if not bloque:
        return
    ult = bloque[-1]
    if t > ult["fin"] + 0.35:
        return
    vis = [p for p in bloque if p["t"] - 0.04 <= t]
    if not vis:
        return
    # posiciones con el bloque completo (para que nada salte al aparecer palabras)
    lineas, cur, w = [], [], 0
    for p in bloque:
        ww = ancho(p["w"], "semi", SUB_TAM)
        sp = ancho(" ", "semi", SUB_TAM)
        if cur and w + sp + ww > SUB_MAX:
            lineas.append((cur, w))
            cur, w = [], 0
        cur.append((p, ww))
        w += (sp if len(cur) > 1 else 0) + ww
    lineas.append((cur, w))
    sp = ancho(" ", "semi", SUB_TAM)
    fade_out = 1 - suave((t - ult["fin"] - 0.1) / 0.25)
    for li, (ps, lw) in enumerate(lineas):
        x = W / 2 - lw / 2
        y = SUB_Y + li * SUB_LH
        for p, ww in ps:
            if p["t"] - 0.04 <= t:
                e = suave((t - p["t"] + 0.04) / 0.14)
                actual = p["t"] <= t < p["fin"]
                if p["clave"]:
                    caja_clave(c, x, y - SUB_TAM * 0.78, x + ww, y + SUB_TAM * 0.24, clamp((t - p["t"]) / 0.3) * fade_out)
                if p["peligro"]:
                    col, kind, a = "#ff5d5d", "bold", 1.0
                elif actual or p["clave"]:
                    col, kind, a = "#ffffff", "bold", 1.0
                else:
                    col, kind, a = "#c9ccd4", "med", 0.62
                fw = ancho(p["w"], kind, SUB_TAM)
                pa = P(col, a * e * fade_out)
                if e < 1:
                    pa.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 6 * (1 - e) + 0.01))
                sh = P("#000000", 0.5 * e * fade_out)
                sh.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 7))
                f = font(kind, SUB_TAM)
                yy = y + 10 * (1 - e)
                c.drawString(p["w"], x + (ww - fw) / 2, yy + 3, f, sh)
                c.drawString(p["w"], x + (ww - fw) / 2, yy, f, pa)
            x += ww + sp


# ------------------------------------------------------------------ cuadro completo
def plano_en(t):
    for i in range(len(PLANOS)):
        if CUTS[i] <= t < CUTS[i + 1]:
            return i
    return len(PLANOS) - 1


def draw_frame(c, t):
    c.clear(C("#000000"))
    i = plano_en(t)
    # ¿estamos dentro de una transición? (centrada en el corte)
    tr_i, e, tipo = None, 0.0, None
    for j in (i, i + 1):
        if 0 < j < len(PLANOS):
            tipo_j = PLANOS[j].get("tr", "fundido")
            d = TR.get(tipo_j, 0.45)
            if d > 0 and CUTS[j] - d / 2 <= t < CUTS[j] + d / 2:
                tr_i, e, tipo = j, (t - (CUTS[j] - d / 2)) / d, tipo_j
    if tr_i is None:
        dibuja_plano(c, i, t)
        rotulos(c, i, t)
    else:
        a, b = tr_i - 1, tr_i
        es = suave(e)
        if tipo == "fundido":
            dibuja_plano(c, a, t)
            c.saveLayerAlpha(None, int(255 * es))
            dibuja_plano(c, b, t)
            c.restore()
        elif tipo == "zoom":
            dibuja_plano(c, a, t, extra_z=1 + 0.35 * es)
            c.saveLayerAlpha(None, int(255 * es))
            dibuja_plano(c, b, t, extra_z=0.82 + 0.18 * es)
            c.restore()
        elif tipo == "desliz":
            dibuja_plano(c, a, t, dy=-H * 0.35 * es)
            c.saveLayerAlpha(None, int(255 * min(1, es * 1.6)))
            dibuja_plano(c, b, t, dy=H * 0.6 * (1 - es))
            c.restore()
        elif tipo == "negro":
            if e < 0.5:
                dibuja_plano(c, a, t)
                c.drawRect(skia.Rect(0, 0, W, H), P("#000000", suave(e * 2)))
            else:
                dibuja_plano(c, b, t)
                c.drawRect(skia.Rect(0, 0, W, H), P("#000000", 1 - suave((e - 0.5) * 2)))
        elif tipo == "luz":
            dibuja_plano(c, a if e < 0.5 else b, t, extra_z=1 + 0.08 * math.sin(e * math.pi))
            c.drawRect(skia.Rect(0, 0, W, H), P("#fff2d2", math.sin(e * math.pi) * 0.95))
        rotulos(c, a if e < 0.5 else b, t)
    vineta(c)
    subtitulos(c, t)
    # entrada y salida del video
    if t < 0.25:
        c.drawRect(skia.Rect(0, 0, W, H), P("#000000", 1 - suave(t / 0.25)))


# ------------------------------------------------------------------ revisión
def _snap(t, scale=1.0):
    s = skia.Surface(int(W * scale), int(H * scale))
    c = s.getCanvas()
    c.scale(scale, scale)
    draw_frame(c, t)
    return s.makeImageSnapshot()


def _hoja(tiempos, cols, scale, out):
    imgs = [_snap(t, scale) for t in tiempos]
    w, h = imgs[0].width(), imgs[0].height()
    rows = (len(imgs) + cols - 1) // cols
    s = skia.Surface(w * cols, h * rows)
    c = s.getCanvas()
    c.clear(C("#000000"))
    for k, im in enumerate(imgs):
        c.drawImage(im, (k % cols) * w, (k // cols) * h)
        c.drawString("{:.1f}s".format(tiempos[k]), (k % cols) * w + 8, (k // cols) * h + 26, font("bold", 22), P("#ffff00"))
    s.makeImageSnapshot().save(out, skia.kPNG)


def movimiento():
    """Mide la diferencia entre cuadros seguidos en todo el video: reporta tramos quietos (>= 6 cuadros)."""
    import numpy as np
    prev, quietos, run, worst = None, [], 0, 1e9
    sc = 0.125
    for k in range(0, NF):
        im = _snap(k / FPS, sc).toarray()[..., :3].astype(np.float32)
        if prev is not None:
            d = float(np.abs(im - prev).mean())
            worst = min(worst, d)
            if d < 0.15:
                run += 1
                if run == 6:
                    quietos.append(round(k / FPS, 2))
            else:
                run = 0
        prev = im
    print("cuadros={} tramos_quietos={} {} diferencia_minima={:.3f}".format(NF, len(quietos), quietos[:10], worst))


def main():
    cargar(sys.argv[1])
    modo = sys.argv[2] if len(sys.argv) > 2 else "hoja"
    os.makedirs(os.path.join(CARPETA, "test"), exist_ok=True)
    if modo == "hoja":
        fr = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
        ts = [CUTS[i] + (CUTS[i + 1] - CUTS[i]) * fr for i in range(len(PLANOS))]
        _hoja(ts, 6, 0.25, os.path.join(CARPETA, "test", "hoja.png"))
    elif modo == "cuadro":
        _snap(float(sys.argv[3]), 1.0).save(os.path.join(CARPETA, "test", "cuadro.png"), skia.kPNG)
    elif modo == "tira":
        t0, d = float(sys.argv[3]), float(sys.argv[4]) if len(sys.argv) > 4 else 2.0
        _hoja([t0 + d * k / 11 for k in range(12)], 6, 0.25, os.path.join(CARPETA, "test", "tira.png"))
    elif modo == "movimiento":
        movimiento()
    print("listo: total={:.2f}s cuadros={} planos={}".format(TOTAL, NF, len(PLANOS)))


if __name__ == "__main__":
    main()
