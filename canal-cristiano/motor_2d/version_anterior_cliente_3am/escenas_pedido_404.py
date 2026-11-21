# ------------------------------------------------------------------ personaje y escenas: "Pedido para el 404"
DSKIN, DSKIN_D = "#C98F63", "#A8734C"
INK = "#2A1B19"
NARANJA = "#E2622B"
_cache = {}


def cono(c, x, y0, y1, half_top, half_bot, a=0.3, col="#FFE2A0"):
    """Cono de luz difuminado, guardado como imagen para no recalcular el desenfoque."""
    key = (y0, y1, half_top, half_bot, col)
    if key not in _cache:
        s = skia.Surface(int(half_bot * 2 + 200), int(y1 - y0 + 200))
        cc = s.getCanvas()
        cc.clear(0)
        p = skia.Paint(AntiAlias=True)
        p.setShader(skia.GradientShader.MakeLinear([(0, 100), (0, y1 - y0 + 100)], [C(col, 1.0), C(col, 0.0)]))
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 40))
        cx = half_bot + 100
        poly(cc, [(cx - half_top, 100), (cx + half_top, 100), (cx + half_bot, y1 - y0 + 100), (cx - half_bot, y1 - y0 + 100)], p)
        _cache[key] = s.makeImageSnapshot()
    p = skia.Paint(AntiAlias=True)
    p.setAlphaf(clamp(a))
    c.drawImage(_cache[key], x - half_bot - 100, y0 - 100, skia.SamplingOptions(skia.FilterMode.kLinear), p)


def parpadeo(T):
    return 0.75 + 0.25 * (1 if math.sin(T * 37) + math.sin(T * 23.1) > -0.6 else 0.2)


def frac_typing(x, a=0.15, b=0.2):
    return clamp((x.tl - a) / max(0.5, x.end - a - b))


def nth(x, sub):
    return [w["t"] for w in x.words if w["w"].lower().strip("¿¡.,:;?!").startswith(sub.lower())]


def dani(c, x, y, s=1.0, look=(0.0, 0.0), expr="neutral", blink=0.0, T=0.0, sweat=False):
    c.save()
    c.translate(x, y)
    c.scale(s, s)
    bob = math.sin(T * 2.2) * 4
    # piernas y zapatos
    rr(c, -130, 700, 110, 360, 40, P("#27313F"))
    rr(c, 20, 700, 110, 360, 40, P("#27313F"))
    rr(c, -150, 1020, 150, 70, 30, P("#111317"))
    rr(c, 0, 1020, 150, 70, 30, P("#111317"))
    # mochila de reparto
    rr(c, -240, 110, 480, 440, 46, P("#1FA39A"))
    rr(c, -240, 110, 480, 64, 30, P("#178178"))
    # cuerpo
    rr(c, -48, 100, 96, 100, 24, P(DSKIN_D))
    rr(c, -262, 190, 100, 330, 50, P("#C9521F"))
    rr(c, 162, 190, 100, 330, 50, P("#C9521F"))
    circ(c, -212, 520, 46, P(DSKIN))
    circ(c, 212, 520, 46, P(DSKIN))
    rr(c, -195, 160, 390, 600, 95, P(NARANJA))
    c.drawRect(skia.Rect.MakeXYWH(-195, 340, 390, 44), P("#E3E7EA"))
    line(c, -118, 180, -118, 338, P("#178178", stroke=30))
    line(c, 118, 180, 118, 338, P("#178178", stroke=30))
    line(c, 0, 190, 0, 720, P("#B84A1B", stroke=6))
    # cabeza
    c.translate(0, bob)
    head = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-150, -130, 300, 268), 96, 96)
    c.drawRRect(head, P(DSKIN))
    circ(c, -106, 66, 22, P("#D9705E", 0.3))
    circ(c, 106, 66, 22, P("#D9705E", 0.3))
    line(c, -146, -30, -118, 104, P("#1b1b1f", stroke=10))
    line(c, 146, -30, 118, 104, P("#1b1b1f", stroke=10))
    c.save()
    c.clipRect(skia.Rect.MakeLTRB(-230, -340, 230, -56), True)
    oval(c, 0, -62, 182, 176, P("#C8231E"))
    c.restore()
    rr(c, -184, -76, 368, 32, 14, P("#8E1B1B"))
    rr(c, -70, -212, 140, 22, 11, P("#FFFFFF", 0.45))
    scared = expr in ("miedo", "panico")
    R = 58 if not scared else 64
    for sx in (-1, 1):
        ex, ey = sx * 70, 6
        if expr == "sonrisa":
            c.drawArc(skia.Rect.MakeLTRB(ex - 44, ey - 22, ex + 44, ey + 44), 200, 140, False, P(INK, stroke=10))
            continue
        circ(c, ex, ey, R, P("#FFFFFF"))
        circ(c, ex, ey, R, P(INK, stroke=7))
        pr = 25 if not scared else (15 if expr == "panico" else 19)
        px, py = ex + look[0] * (R - pr - 8), ey + look[1] * (R - pr - 8)
        circ(c, px, py, pr, P(INK))
        circ(c, px - pr * 0.35, py - pr * 0.35, pr * 0.3, P("#FFFFFF"))
        if blink > 0.5:
            circ(c, ex, ey, R + 4, P(DSKIN))
            c.drawArc(skia.Rect.MakeLTRB(ex - R, ey - 20, ex + R, ey + 30), 10, 160, False, P(INK, stroke=8))
    if expr != "sonrisa":
        up = 22 if scared else 0
        for sx in (-1, 1):
            line(c, sx * 112, -66 - (0 if not scared else -6), sx * 36, -66 - up, P("#3A241C", stroke=13))
    if expr == "neutral":
        c.drawArc(skia.Rect.MakeLTRB(-30, 66, 30, 108), 20, 140, False, P(INK, stroke=8))
    elif expr == "sonrisa":
        pa = skia.Path()
        pa.moveTo(-64, 74)
        pa.lineTo(64, 74)
        pa.cubicTo(56, 132, -56, 132, -64, 74)
        c.drawPath(pa, P("#FFFFFF"))
        c.drawPath(pa, P(INK, stroke=7))
        line(c, -52, 98, 52, 98, P(INK, 0.5, stroke=4))
    elif expr == "miedo":
        oval(c, 0, 100, 20, 24, P("#5B1A1E"))
    elif expr == "panico":
        oval(c, 0, 102, 26, 32, P("#5B1A1E"))
    if sweat:
        gotas(c, 150, -30, 90, T, n=1, speed=0.7, r=9)
    c.restore()


def tarjeta(c, xx, yy, titulo, sub, k):
    k = ease(k)
    if k <= 0:
        return
    c.save()
    c.translate(xx - (1 - k) * 560, yy)
    rr(c, 0, 0, 520, 136, 14, P("#0D1418", 0.92))
    c.drawRect(skia.Rect.MakeXYWH(0, 0, 12, 136), P("#F2C230"))
    text(c, titulo, 36, 62, "ui", 54, P("#FFFFFF"))
    text(c, sub, 36, 108, "uir", 32, P("#C9D2D6"))
    c.restore()


def telefono(c, xx, yy, w, h):
    rr(c, xx + 10, yy + 16, w, h, 60, P("#000000", 0.5))
    rr(c, xx, yy, w, h, 60, P("#0B0D10"))
    rr(c, xx + 16, yy + 16, w - 32, h - 32, 46, P("#11181D"))
    rr(c, xx + w / 2 - 70, yy + 30, 140, 28, 14, P("#0B0D10"))


# ---------------------------------------------------------------- la app de reparto
INSTR = [
    "1. Toca tres veces. Nunca cuatro.",
    "2. Deja la caja en el suelo y da un paso atrás.",
    "3. Si la puerta se abre sola, no entres.",
]


def pantalla_app(c, x, upto, typing, final=None):
    vgrad(c, 0, 0, W, H, C("#0D1418"), C("#05080A"))
    telefono(c, 70, 500, 940, 1500)
    c.drawRect(skia.Rect.MakeXYWH(86, 560, 908, 150), P(NARANJA))
    text(c, "Pedido #404", 130, 632, "ui", 54, P("#FFFFFF"))
    text(c, "1 pizza grande · pagado en línea", 130, 682, "uir", 32, P("#FFE5D6"))
    rr(c, 120, 740, 840, 150, 24, P("#1B262D"))
    circ(c, 184, 815, 28, P(NARANJA))
    circ(c, 184, 815, 10, P("#1B262D"))
    text(c, "Edificio Los Álamos", 236, 806, "ui", 42, P("#FFFFFF"))
    text(c, "Apartamento 404 · Piso 4", 236, 856, "uir", 34, P("#A9B6BC"))
    text(c, "Instrucciones del cliente", 130, 972, "ui", 40, P("#F2C230"))
    rr(c, 120, 1000, 840, 560, 24, P("#141C21"))
    yy = 1084
    if final is not None:
        s = "1. Entra."[: int(9 * clamp(final) + 0.5)]
        text(c, s, 170, 1260, "ui", 120, P("#FF4A3C"))
    else:
        for k, ins in enumerate(INSTR):
            if k > upto and not (typing and typing[0] == k):
                break
            s = ins if not (typing and typing[0] == k) else ins[: int(len(ins) * clamp(typing[1]))]
            left = len(s)
            for ln in wrap(ins, "uir", 50, 760):
                shown = ln[: max(0, left)]
                left -= len(ln) + 1
                if shown:
                    text(c, shown, 160, yy, "uir", 50, P("#FFFFFF"))
                yy += 68
            yy += 34
    pul = 1.0 if final is None else 0.75 + 0.25 * math.sin(x.T * 7)
    rr(c, 160, 1620, 760, 110, 55, P(NARANJA, pul))
    text(c, "ACEPTAR PEDIDO", 540, 1692, "ui", 46, P("#FFFFFF"), "c")


def s_app1(c, x):
    pantalla_app(c, x, -1, (0, frac_typing(x, 1.0)))


def s_app0(c, x):
    pantalla_app(c, x, 0, None)


def s_app2(c, x):
    pantalla_app(c, x, 0, (1, frac_typing(x, 0.6)))


def s_app3(c, x):
    pantalla_app(c, x, 1, (2, frac_typing(x, 0.6)))


def s_appfin(c, x):
    pantalla_app(c, x, -1, None, final=(x.tl - (x.wt("entra") - 0.2)) / 0.5)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#FF0000", 0.06 + 0.04 * math.sin(x.T * 7)))


# ---------------------------------------------------------------- la calle
_rb = random.Random(5)
EDIFICIOS = []
_x = -40
while _x < W:
    bw = _rb.randint(150, 260)
    bh = _rb.randint(420, 760)
    wins = [(_rb.random() < 0.16) for _ in range(60)]
    EDIFICIOS.append((_x, bw, bh, wins))
    _x += bw + 6


def fondo_calle(c, T):
    vgrad(c, 0, 0, W, H, C("#081228"), C("#1B2E4D"))
    circ(c, 820, 640, 54, P("#E9E6D0"))
    circ(c, 842, 626, 50, P("#0B1731"))
    for (bx, bw, bh, wins) in EDIFICIOS:
        c.drawRect(skia.Rect.MakeXYWH(bx, 1500 - bh, bw, bh), P("#0D1626"))
        k = 0
        for wy in range(int(1500 - bh + 40), 1440, 90):
            for wx in range(int(bx + 24), int(bx + bw - 50), 62):
                c.drawRect(skia.Rect.MakeXYWH(wx, wy, 36, 50), P("#F2C870" if wins[k % 60] else "#16233A", 0.9 if wins[k % 60] else 1.0))
                k += 1
    c.drawRect(skia.Rect.MakeXYWH(0, 1500, W, 160), P("#2A2F36"))
    c.drawRect(skia.Rect.MakeXYWH(0, 1500, W, 14), P("#3A4049"))
    c.drawRect(skia.Rect.MakeXYWH(0, 1660, W, 300), P("#15171B"))
    for k in range(5):
        c.drawRect(skia.Rect.MakeXYWH(40 + k * 240, 1780, 130, 14), P("#C9B65A", 0.5))
    line(c, 150, 1500, 150, 690, P("#05070B", stroke=14))
    line(c, 150, 690, 270, 690, P("#05070B", stroke=14))
    cono(c, 270, 700, 1520, 18, 280, 0.38)
    circ(c, 270, 702, 14, P("#FFE9B0"))


def moto(c, x, y):
    circ(c, x - 110, y, 74, P("#0B0C0F"))
    circ(c, x - 110, y, 30, P("#59646E"))
    circ(c, x + 130, y, 74, P("#0B0C0F"))
    circ(c, x + 130, y, 30, P("#59646E"))
    poly(c, [(x - 150, y - 60), (x + 60, y - 60), (x + 150, y - 150), (x + 110, y - 250), (x + 70, y - 250), (x + 60, y - 130), (x - 150, y - 130)],
         P("#D9DEE2"))
    rr(c, x - 170, y - 170, 190, 44, 20, P("#1b1b1f"))
    line(c, x + 90, y - 250, x + 60, y - 330, P("#1b1b1f", stroke=14))
    line(c, x + 20, y - 330, x + 100, y - 330, P("#1b1b1f", stroke=14))
    rr(c, x - 230, y - 330, 170, 160, 16, P("#1FA39A"))
    rr(c, x - 230, y - 330, 170, 34, 12, P("#178178"))
    circ(c, x + 150, y - 190, 20, P("#FFF1B8"))
    cono(c, x + 150, y - 190, y + 60, 10, 120, 0.25)


def s_calle(c, x):
    fondo_calle(c, x.T)
    moto(c, 800, 1560)
    dani(c, 400, 800, 0.82, (math.sin(x.T * 0.8) * 0.5, 0.2), "neutral", blink_at(x.T), x.T)
    tarjeta(c, 60, 1700, "Dani", "20 años · último pedido", (x.tl - 0.3) / 0.5)


def s_sonrisa(c, x):
    c.translate(540, 980)
    c.scale(1.5, 1.5)
    c.translate(-400, -800)
    fondo_calle(c, x.T)
    grin = x.tl < x.wt("Los") + 0.4
    dani(c, 400, 800, 0.82, (0.3, -0.2), "sonrisa" if grin else "neutral", blink_at(x.T), x.T)
    k = (x.tl - x.wt("propina") + 0.2) / 1.6
    if 0 < k:
        a = clamp(k * 4) * clamp(3 - k * 2.2)
        c.save()
        c.translate(600, 640 - 80 * ease(k))
        rr(c, -110, -40, 220, 80, 40, P("#2FA866", a))
        text(c, "+ propina", 0, 14, "ui", 40, P("#FFFFFF", a), "c")
        c.restore()


# ---------------------------------------------------------------- el edificio
def s_lobby(c, x):
    vgrad(c, 0, 0, W, H, C("#263A3F"), C("#101A1D"))
    c.drawRect(skia.Rect.MakeXYWH(0, 1660, W, 300), P("#1A1F22"))
    for k in range(7):
        line(c, 540 + (k - 3) * 150, 1660, 540 + (k - 3) * 330, 1920, P("#272E32", stroke=4))
    line(c, 0, 1770, W, 1770, P("#272E32", stroke=4))
    fl = parpadeo(x.T)
    rr(c, 230, 540, 620, 1130, 10, P("#59646B"))
    vgrad(c, 290, 600, 500, 1060, C("#FFEFC6"), C("#D2AE6C"))
    for k in range(1, 4):
        line(c, 290 + k * 125, 600, 290 + k * 125, 1660, P("#B99556", 0.5, stroke=4))
    line(c, 300, 1250, 780, 1250, P("#8C7440", stroke=12))
    c.drawRect(skia.Rect.MakeXYWH(290, 600, 500, 1060), P("#000000", 0.45 * (1 - fl)))
    c.drawRect(skia.Rect.MakeXYWH(290, 600, 64, 1060), P("#8C979E"))
    c.drawRect(skia.Rect.MakeXYWH(726, 600, 64, 1060), P("#8C979E"))
    poly(c, [(290, 1660), (790, 1660), (1010, 1920), (70, 1920)], P("#FFE2A0", 0.22 * fl))
    rr(c, 900, 900, 130, 180, 12, P("#0B0E10"))
    text(c, "PB", 965, 990, "mono", 64, P("#FF4A3C"), "c")
    poly(c, [(940, 1020), (990, 1020), (965, 1056)], P("#FF4A3C"))
    circ(c, 965, 1150, 24, P("#F2C230"))
    rr(c, -20, 1330, 200, 340, 8, P("#3A2A22"))
    rr(c, 10, 1250, 150, 60, 6, P("#D9D2BE"))
    text(c, "PORTERÍA", 85, 1290, "ui", 24, P("#2B2B33"), "c")


def lerp(a, b, f):
    return a + (b - a) * f


def s_pasillo(c, x):
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#081013"))
    poly(c, [(0, 480), (1080, 480), (680, 900), (400, 900)], P("#0E181C"))
    poly(c, [(0, 480), (400, 900), (400, 1260), (0, 1920)], P("#16282E"))
    poly(c, [(1080, 480), (680, 900), (680, 1260), (1080, 1920)], P("#132329"))
    poly(c, [(0, 1920), (1080, 1920), (680, 1260), (400, 1260)], P("#2B1518"))
    poly(c, [(250, 1920), (830, 1920), (610, 1260), (470, 1260)], P("#3A1C20"))
    for side in (0, 1):
        for (f1, f2) in ((0.10, 0.36), (0.52, 0.74)):
            pts = []
            for f, top in ((f1, True), (f2, True), (f2, False), (f1, False)):
                wx = 400 * f
                wtop, wbot = 480 + 420 * f, 1920 - 660 * f
                y = lerp(wtop, wbot, 0.22) if top else wbot
                pts.append((wx if side == 0 else W - wx, y))
            poly(c, pts, P("#0A1215"))
    c.drawRect(skia.Rect.MakeXYWH(400, 900, 280, 360), P("#101D22"))
    c.drawRect(skia.Rect.MakeXYWH(478, 950, 124, 310), P("#2A1D17"))
    rr(c, 518, 985, 44, 24, 4, P("#C9A54A"))
    fl = parpadeo(x.T * 0.6)
    oval(c, 540, 1262, 110, 18, P("#FFE08A", 0.35 * fl, blur=14))
    c.drawRect(skia.Rect.MakeXYWH(478, 1256, 124, 7), P("#FFE9A8", fl))
    poly(c, [(250, 1920), (830, 1920), (600, 1330), (480, 1330)], P("#FFE2A0", 0.07))
    poly(c, [(450, 1920), (630, 1920), (560, 1480), (520, 1480)], P("#000000", 0.5))
    for k in range(3):
        f = 0.15 + k * 0.3
        oval(c, 540, 480 + 420 * f - 14 * (1 - f), 70 * (1 - f), 12 * (1 - f), P("#1E2C31"))


def puerta404(c, T, open_k=0.0, shake=0.0, eye=0.0, light=1.0, deep=0.0):
    vgrad(c, 0, 0, W, H, C("#1E3038"), C("#0F1B20"))
    c.drawRect(skia.Rect.MakeXYWH(-200, 1700, W + 400, 1200), P("#3B1F22"))
    c.drawRect(skia.Rect.MakeXYWH(-200, 1680, W + 400, 22), P("#0C1417"))
    rr(c, 170, 520, 740, 1182, 6, P("#141D21"))
    c.drawRect(skia.Rect.MakeXYWH(200, 550, 680, 1150), P("#020304"))
    if deep > 0:
        for sgn in (-1, 1):
            circ(c, 640 + sgn * 44, 1020, 26, P("#FFFFFF", 0.3 * deep, blur=12))
            circ(c, 640 + sgn * 44, 1020, 15, P("#FFFFFF", deep))
            circ(c, 640 + sgn * 44, 1022, 4, P("#020304", deep))
    kx = 1 - 0.62 * open_k
    dw = 680 * kx
    c.save()
    c.translate(shake, 0)
    c.drawRect(skia.Rect.MakeXYWH(200, 550, dw, 1150), P("#4A3328"))
    rr(c, 200 + 60 * kx, 660, 560 * kx, 400, 10, P("#3E2A20"))
    rr(c, 200 + 60 * kx, 1140, 560 * kx, 470, 10, P("#3E2A20"))
    cx = 200 + dw / 2
    rr(c, cx - 90 * kx, 580, 180 * kx, 64, 8, P("#C9A54A"))
    if kx > 0.6:
        text(c, "404", cx, 630, "ui", 50, P("#2B2118"), "c")
    circ(c, cx, 800, 24, P("#C9A54A"))
    circ(c, cx, 800, 15, P("#07090A"))
    if eye > 0:
        circ(c, cx, 800, 13, P("#FFFFFF", eye))
        circ(c, cx, 800, 5, P("#07090A", eye))
    circ(c, 200 + dw - 70 * kx, 1190, 28, P("#C9A54A"))
    c.drawRect(skia.Rect.MakeXYWH(200, 550, dw, 1150), P("#000000", 0.35 * open_k))
    c.restore()
    if light > 0:
        oval(c, 540, 1704, 380, 34, P("#FFE08A", 0.3 * light, blur=22))
        c.drawRect(skia.Rect.MakeXYWH(200, 1690, 680, 12), P("#FFE9A8", light))


def toc(c, xx, yy, age, col, rot):
    if age < 0:
        return
    k = 1 + 0.5 * max(0.0, 1 - age * 6)
    a = 1.0 if age < 0.9 else max(0.45, 1 - (age - 0.9))
    c.save()
    c.translate(xx, yy)
    c.rotate(rot)
    c.scale(k, k)
    text(c, "TOC", 0, 0, "mano", 96, P("#000000", 0.6 * a, blur=6), "c")
    text(c, "TOC", 0, -4, "mano", 96, P(col, a), "c")
    c.restore()


def s_toca(c, x):
    tk = [x.wt("Una"), x.wt("Dos"), x.wt("Tres")]
    push = max([math.exp(-(x.tl - t) * 9) for t in tk if x.tl >= t] + [0.0])
    puerta404(c, x.T, shake=push * 4, light=parpadeo(x.T * 0.5))
    for k, (t, pos) in enumerate(zip(tk, ((330, 900), (420, 1080), (320, 1260)))):
        toc(c, pos[0], pos[1], x.tl - t, "#FFE08A", -10 + k * 9)
    c.save()
    c.translate(820 - push * 70, 1010)
    c.rotate(-18)
    rr(c, 30, -60, 620, 150, 70, P("#C9521F"))
    rr(c, -70, -74, 150, 170, 60, P(DSKIN))
    for k in range(4):
        line(c, -40, -40 + k * 34, 10, -40 + k * 34, P(DSKIN_D, stroke=6))
    c.restore()


def caja_pizza(c, cx, cy):
    poly(c, [(cx - 210, cy - 70), (cx + 210, cy - 70), (cx + 260, cy + 70), (cx - 260, cy + 70)], P("#D9B98A"))
    poly(c, [(cx - 260, cy + 70), (cx + 260, cy + 70), (cx + 260, cy + 110), (cx - 260, cy + 110)], P("#B8935F"))
    oval(c, cx, cy, 120, 40, P("#C8231E"))
    text(c, "PIZZA", cx, cy + 14, "ui", 40, P("#FFFFFF"), "c")


def s_caja(c, x):
    c.translate(0, -560)
    puerta404(c, x.T, light=parpadeo(x.T * 0.5))
    tc = x.wt("caja") - 0.35
    k = bounce((x.tl - tc) / 0.5)
    if x.tl > tc:
        oval(c, 540, 1960, 270, 40, P("#000000", 0.4 * k))
        caja_pizza(c, 540, 1880 - (1 - k) * 500)
    back = ease((x.tl - x.wt("paso") + 0.1) / 0.6)
    for sgn, ph in ((-1, 0.0), (1, 0.25)):
        b = ease((x.tl - x.wt("paso") + 0.1 - ph) / 0.5)
        yy = 2230 + b * 190
        rr(c, 540 + sgn * 150 - 80, yy, 160, 300, 70, P("#111317"))
        rr(c, 540 + sgn * 150 - 80, yy, 160, 90, 45, P("#E3E7EA"))
    _ = back


def s_dentro(c, x):
    t0 = x.wt("toca") + 0.1
    tk = [t0 + k * 0.38 for k in range(4)]
    push = max([math.exp(-(x.tl - t) * 9) for t in tk if x.tl >= t] + [0.0])
    sh = push * 14 * math.sin(x.T * 80)
    eye = ease((x.tl - tk[3] - 0.5) / 0.5)
    puerta404(c, x.T, shake=sh, eye=eye, light=0.25 + 0.75 * (1 - min(1, push * 2)))
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#FF0000", 0.10 * push))
    for k, (t, pos) in enumerate(zip(tk, ((360, 900), (700, 1010), (390, 1210), (690, 1400)))):
        toc(c, pos[0], pos[1], x.tl - t, "#FF4A3C", -12 + k * 8)
    c.save()
    c.translate(0, 560)
    caja_pizza(c, 540, 1280)
    c.restore()


def s_abre(c, x):
    k = ease((x.tl - (x.wt("abre") - 0.7)) / 1.8)
    deep = ease((x.tl - x.end + 0.2) / 0.8)
    puerta404(c, x.T, open_k=k, light=1 - k, deep=deep)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#000000", 0.25 * k))


def s_miedo(c, x):
    vgrad(c, 0, 0, W, H, C("#16282E"), C("#081013"))
    c.drawRect(skia.Rect.MakeXYWH(-200, 1660, W + 400, 400), P("#2B1518"))
    rr(c, 60, 760, 190, 520, 4, P("#0A1215"))
    c.drawRect(skia.Rect.MakeXYWH(80, 780, 150, 500), P("#020304"))
    for sgn in (-1, 1):
        circ(c, 155 + sgn * 22, 960, 8, P("#FFFFFF"))
    p = skia.Paint(AntiAlias=True)
    p.setShader(skia.GradientShader.MakeLinear([(1080, 0), (350, 0)], [C("#FFE2A0", 0.30 * parpadeo(x.T)), C("#FFE2A0", 0.0)]))
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), p)
    s = 1.25 - 0.3 * ease(x.p)
    dani(c, 560 + 120 * ease(x.p) + math.sin(x.T * 42) * 3, 900 + 60 * ease(x.p), s, (-0.8, 0.0), "panico", 0, x.T, sweat=True)


def notificacion(c, x, hora, titulo, sub, col):
    vgrad(c, 0, 0, W, H, C("#141B1F"), C("#05080A"))
    vib = x.tl < 1.8 and (x.tl % 0.6) < 0.4
    dx = math.sin(x.T * 90) * 9 if vib else 0
    c.save()
    c.translate(540 + dx, 1180)
    c.rotate(-5 + (math.sin(x.T * 70) * 1.2 if vib else 0))
    telefono(c, -290, -500, 580, 1040)
    text(c, hora, 0, -270, "ui", 120, P("#FFFFFF"), "c")
    k = ease((x.tl - 0.2) / 0.4)
    yy = -170 + (1 - k) * 60
    rr(c, -250, yy, 500, 200, 30, P("#25313A", k))
    circ(c, -190, yy + 70, 36, P(col, k))
    text(c, titulo, -136, yy + 66, "ui", 40, P("#FFFFFF", k))
    for j, ln in enumerate(wrap(sub, "uir", 30, 360)):
        text(c, ln, -136, yy + 112 + j * 38, "uir", 30, P("#B9C4CA", k))
    c.restore()
    if vib:
        for sgn in (-1, 1):
            for k2 in range(2):
                cx = 540 + sgn * (350 + k2 * 50)
                c.drawArc(skia.Rect.MakeLTRB(cx - 40, 1080, cx + 40, 1280), -40 if sgn > 0 else 140, 80, False, P("#FFFFFF", 0.5, stroke=8))


def s_tel1(c, x):
    notificacion(c, x, "1:52", "Pedido entregado", "El cliente subió una foto", "#2FA866")


def s_tel2(c, x):
    notificacion(c, x, "1:55", "Nuevo pedido", "Apto 404 · misma dirección", NARANJA)
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#FF0000", 0.05))


def s_foto(c, x):
    vgrad(c, 0, 0, W, H, C("#0D1418"), C("#05080A"))
    telefono(c, 70, 500, 940, 1500)
    c.drawRect(skia.Rect.MakeXYWH(86, 560, 908, 130), P("#17222A"))
    text(c, "Comprobante de entrega", 130, 642, "ui", 44, P("#FFFFFF"))
    px, py, pw, ph = 120, 730, 840, 1000
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(px, py, pw, ph), True)
    c.drawRect(skia.Rect.MakeXYWH(px, py, pw, ph), P("#020304"))
    dx, dw = px + 250, 340
    c.save()
    c.clipRect(skia.Rect.MakeXYWH(dx, py + 110, dw, ph - 110), True)
    vgrad(c, dx, py, dw, ph, C("#2B4750"), C("#16282E"))
    c.drawRect(skia.Rect.MakeXYWH(dx, py + 800, dw, 300), P("#3B1F22"))
    dani(c, dx + dw / 2, py + 400, 0.46, (0, 0.2), "panico", 0, x.T)
    c.save()
    c.translate(dx + dw / 2, py + 900)
    c.scale(0.5, 0.5)
    caja_pizza(c, 0, 0)
    c.restore()
    c.restore()
    line(c, dx, py + 110, dx, py + ph, P("#141D21", stroke=14))
    line(c, dx + dw, py + 110, dx + dw, py + ph, P("#141D21", stroke=14))
    line(c, dx, py + 110, dx + dw, py + 110, P("#141D21", stroke=14))
    poly(c, [(dx + dw, py + 110), (px + pw, py + 40), (px + pw, py + ph), (dx + dw, py + ph)], P("#2A1D17", 0.9))
    for yy in range(int(py), int(py + ph), 7):
        line(c, px, yy, px + pw, yy, P("#000000", 0.18, stroke=2))
    text(c, "01:51 AM", px + pw - 24, py + ph - 24, "mono", 34, P("#FFFFFF", 0.9), "r")
    fl = 1 - (x.tl + 0.3) / 0.45
    if fl > 0:
        c.drawRect(skia.Rect.MakeXYWH(px, py, pw, ph), P("#FFFFFF", fl))
    c.restore()
    rr(c, px, py, pw, ph, 4, P("#FF4A3C", 0.8, stroke=5))
    text(c, "Foto subida por: Cliente 404", 130, 1800, "uir", 36, P("#A9B6BC"))


def buzon(c, bx, by, num, hi):
    rr(c, bx, by, 360, 380, 14, P("#7E8A91"))
    rr(c, bx + 18, by + 18, 324, 344, 10, P("#69757C"))
    rr(c, bx + 70, by + 70, 220, 26, 8, P("#1b1f22"))
    rr(c, bx + 90, by + 150, 180, 86, 8, P("#F1E6CC"))
    text(c, num, bx + 180, by + 214, "ui", 60, P("#2B2118"), "c")
    circ(c, bx + 180, by + 300, 20, P("#1b1f22"))
    if hi:
        rr(c, bx - 8, by - 8, 376, 396, 18, P("#F2C230", stroke=10))


BUZ = ((150, 640), (570, 640), (150, 1100), (570, 1100))


def pared_buzones(c, x, idx):
    vgrad(c, 0, 0, W, H, C("#24363D"), C("#111C20"))
    c.drawRect(skia.Rect.MakeXYWH(-200, 1700, W + 400, 600), P("#1A1F22"))
    cono(c, 540, 300, 1700, 60, 520, 0.22 * parpadeo(x.T))
    for k, num in enumerate(("401", "402", "403")):
        buzon(c, BUZ[k][0], BUZ[k][1], num, idx == k)
    bx, by = BUZ[3]
    rr(c, bx, by, 360, 380, 6, P("#1A2A30"))
    for (ox, oy) in ((24, 24), (336, 24), (24, 356), (336, 356)):
        circ(c, bx + ox, by + oy, 9, P("#0B1114"))
    if idx == 3:
        pp = P("#FF4A3C", 0.95, stroke=9)
        pp.setPathEffect(skia.DashPathEffect.Make([30, 20], x.T * 40))
        c.drawRoundRect(skia.Rect.MakeXYWH(bx - 8, by - 8, 376, 396), 18, 18, pp)
        text(c, "?", bx + 180, by + 270, "ui", 220, P("#FF4A3C"), "c")


def s_buzones0(c, x):
    pared_buzones(c, x, -1)
    dani(c, 540, 1700, 0.95, (0.0, -0.7), "miedo", blink_at(x.T), x.T * 2.5, sweat=True)


def s_buzones(c, x):
    c.translate(540, 1060)
    c.scale(1.12, 1.12)
    c.translate(-540, -1060)
    ts = nth(x, "cuatrocientos")
    idx = -1
    for k, t in enumerate(ts):
        if x.tl >= t - 0.1:
            idx = k
    if idx == 3 and x.tl < x.wt("No") - 0.05:
        idx = 2
    pared_buzones(c, x, idx)


def s_final(c, x):
    c.drawRect(skia.Rect.MakeXYWH(0, 0, W, H), P("#040607"))
    rr(c, 330, 520, 420, 520, 4, P("#10171A"))
    c.drawRect(skia.Rect.MakeXYWH(350, 540, 380, 500), P("#000000"))
    poly(c, [(350, 540), (470, 580), (470, 1040), (350, 1040)], P("#3A2820"))
    for sgn in (-1, 1):
        circ(c, 600 + sgn * 46, 760, 34, P("#FFFFFF", 0.3, blur=16))
        if blink_at(x.T, 1.0) < 0.5:
            circ(c, 600 + sgn * 46, 760, 18, P("#FFFFFF"))
            circ(c, 600 + sgn * 46, 763, 5, P("#040607"))
    k = ease((x.tl + 0.1) / 0.4)
    text(c, "¿ACEPTARÍAS", 540, 1230 + (1 - k) * 40, "ui", 124, P("#FFFFFF", k), "c")
    text(c, "EL PEDIDO?", 540, 1380 + (1 - k) * 40, "ui", 140, P("#FF4A3C", k), "c")
    k2 = ease((x.tl - x.wt("Comenta") + 0.1) / 0.4)
    rr(c, 240, 1470, 600, 110, 55, P("#F2C230", k2))
    text(c, "COMENTA", 540, 1546, "ui", 62, P("#111111", k2), "c")
    k3 = ease((x.tl - x.wt("sígueme") + 0.1) / 0.4)
    text(c, "Sígueme para la PARTE 2", 540, 1680, "ui", 54, P("#FFFFFF", k3), "c")


ESCENAS = {
    "app1": s_app1, "app0": s_app0, "app2": s_app2, "app3": s_app3, "appfin": s_appfin, "calle": s_calle,
    "sonrisa": s_sonrisa, "lobby": s_lobby, "pasillo": s_pasillo, "toca": s_toca, "caja": s_caja, "dentro": s_dentro,
    "abre": s_abre, "miedo": s_miedo, "tel1": s_tel1, "tel2": s_tel2, "foto": s_foto, "buzones0": s_buzones0,
    "buzones": s_buzones, "final": s_final,
}

