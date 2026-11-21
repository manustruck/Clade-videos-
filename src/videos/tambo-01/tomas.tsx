// Plan de tomas del capítulo 1: cada tramo de la línea de tiempo se parte en tomas con su cámara (saltos de cámara).
// [peso, dibujo]: el peso reparte la duración del tramo; u = avance 0..1 de la toma; t = segundos globales.
import React from "react";
import { W, H, F, Cam, camEntre, lerp, pr, cl, Rotulo } from "./base";
import { Exterior } from "./exterior";
import { Sala, Pared, Cuaderno, Lente, Escalera, Orilla, Radio, Plano, Huellas, Tanque, Arbol, Lata, Olla, Mallas } from "./interiores";

export type Ctx = { u: number; t: number };
export type Toma = [number, (c: Ctx) => React.ReactElement];
const k = (a: Cam, b: Cam, u: number) => camEntre(a, b, u);
const AMP: Cam = [1600, 640, 0.6];

export const TOMAS: Record<string, Toma[]> = {
  v1: [
    [0.62, ({ u, t }) => <Exterior t={t} hora="noche" haz="gira" g={pr(u, 0.3, 0.92)} cam={k(AMP, [1500, 700, 0.74], u)} />],
    [0.38, ({ u, t }) => <Plano t={t} u={u} gesto="miedo" fondo="noche" zoom={[1, 1.18]} tiembla={2} />],
  ],
  v2: [
    [0.45, ({ u, t }) => <Plano t={t} u={u} gesto="neutral" fondo="dia" farol={false} zoom={[1.05, 1.15]} />],
    [0.55, ({ u, t }) => <Exterior t={t} hora="dia" cam={k([2050, 660, 1.3], [1990, 700, 2.1], u)} tambo={{ x: 1990, y: 828 }} chispa={{ x: 2100, y: 830 }} lonas />],
  ],
  v3: [[1, ({ u, t }) => <Pared t={t} n={10} noche cam={k([900, 300, 1.15], [900, 780, 1.3], u)} />]],
  titulo: [[1, ({ u, t }) => <g>
    <Exterior t={t} hora="noche" haz="mar" cam={k([1750, 640, 0.66], [1850, 600, 0.8], u)} />
    <rect width={W} height={H} fill="#05060f" opacity={0.35} />
    <g opacity={Math.min(pr(u, 0.05, 0.25), 1 - pr(u, 0.88, 1))} fontFamily={F} fontWeight={800} stroke="#0c0810" strokeLinejoin="round" paintOrder="stroke" transform={`translate(110 ${430 - 20 * u})`}>
      <text fontSize={52} fill="#ffd35a" strokeWidth={12} letterSpacing={6}>CAPÍTULO 1</text>
      <text y={130} fontSize={128} fill="#fff" strokeWidth={22}>SOBREVIVÍ 1 AÑO</text>
      <text y={270} fontSize={128} fill="#fff" strokeWidth={22}>EN UN FARO</text>
      <line x1={0} y1={320} x2={620 * pr(u, 0.15, 0.5)} y2={320} stroke="#b8322a" strokeWidth={14} strokeLinecap="round" />
      <text y={400} fontSize={50} fill="#f3e6c8" strokeWidth={12}>La regla que no escribí</text>
    </g>
  </g>]],
  v4: [
    [0.55, ({ u, t }) => <Exterior t={t} hora="dia" lancha={lerp(3300, 2800, pr(u, 0, 1))} cam={k([2750, 960, 1.05], [2650, 960, 1.35], u)} />],
    [0.45, ({ u, t }) => <Exterior t={t} hora="dia" lancha={2800} cam={k(AMP, [1750, 660, 0.72], u)} />],
  ],
  v5: [
    [0.4, ({ u, t }) => <Exterior t={t} hora="dia" lancha={2800} tambo={{ x: 2570, y: 928, gesto: "neutral" }} chispa={{ x: 2480, y: 906, voltea: true }} cam={k([2680, 950, 2.3], [2660, 940, 2.7], u)} />],
    [0.3, ({ u, t }) => <Exterior t={t} hora="dia" cam={k([1350, 900, 1.3], [820, 950, 2.0], u)} />],
    [0.3, ({ u, t }) => <Exterior t={t} hora="dia" lancha={lerp(2800, 3700, pr(u, 0, 1))} tambo={{ x: 2570, y: 928, gesto: "sorpresa" }} chispa={{ x: 2480, y: 906 }} cam={k([2700, 960, 1.5], [2850, 960, 1.3], u)} />],
  ],
  v6: [
    [0.5, ({ u, t }) => <Exterior t={t} hora="dia" tambo={{ x: 1985, y: 828 }} chispa={{ x: 2030, y: 824 }} cam={k([2050, 720, 1.6], [2050, 280, 2.3], u)} />],
    [0.5, ({ u, t }) => <Escalera t={t} sube={u} cam={[960, 3500 - u * 2500 - 330, 0.82]} />],
  ],
  v43: [
    [0.55, ({ u, t }) => <Lente t={t} hora="dia" tambo={{ x: 400, gesto: "sorpresa" }} chispa={1560} cam={k([960, 580, 1], [960, 500, 1.22], u)} />],
    [0.45, ({ u, t }) => <Lente t={t} hora="dia" cam={k([960, 450, 1.8], [960, 450, 2.3], u)} />],
  ],
  v7: [
    [0.5, ({ u, t }) => <Sala t={t} hora="dia" tambo={{ x: 1180 }} chispa={{ x: 820 }} cam={k([720, 560, 1.08], [1240, 560, 1.08], u)} />],
    [0.5, ({ u, t }) => <Pared t={t} n={0} cam={k([960, 540, 1], [960, 480, 1.18], u)} />],
  ],
  v8: [
    [0.34, ({ u, t }) => <Pared t={t} n={1} escribe={u * 1.25} cam={k([820, 220, 1.3], [860, 230, 1.36], u)} />],
    [0.33, ({ u, t }) => <Pared t={t} n={2} escribe={u * 1.25} cam={k([820, 260, 1.3], [860, 280, 1.36], u)} />],
    [0.33, ({ u, t }) => <Pared t={t} n={3} escribe={u * 1.25} cam={k([820, 300, 1.3], [880, 310, 1.24], u)} />],
  ],
  v44: [
    [0.55, ({ u, t }) => <Sala t={t} hora="dia" reglas={3} tambo={{ x: 1010, voltea: true }} chispa={{ x: 760, cola: Math.sin(t * 12) }} cam={k([760, 600, 1.5], [800, 620, 1.75], u)} />],
    [0.45, ({ u, t }) => <Plano t={t} u={u} quien="chispa" fondo="dia" zoom={[1, 1.1]} />],
  ],
  v9: [
    [0.5, ({ u, t }) => <Exterior t={t} hora="niebla" lluvia lonas cam={k([2250, 700, 2.2], [2300, 740, 2.9], u)} />],
    [0.5, ({ u, t }) => <Tanque t={t} u={u} nivel={lerp(0.12, 0.5, u)} lluvia />],
  ],
  v10: [
    [0.5, ({ u, t }) => <g><Tanque t={t} u={u} nivel={0.5} /><Rotulo texto="3 litros al día" o={pr(u, 0.1, 0.3)} color="#ffd23f" /></g>],
    [0.5, ({ u, t }) => <Pared t={t} n={4} escribe={u * 1.3} cam={k([900, 380, 1.25], [940, 400, 1.3], u)} />],
  ],
  v45: [[1, ({ u, t }) => <Olla t={t} u={u} />]],
  v11: [
    [0.28, ({ u, t }) => <Exterior t={t} hora="dia" tambo={{ x: 1180, y: 962 }} chispa={{ x: 1120, y: 960 }} cam={k([1250, 860, 2.3], [1290, 840, 2.9], u)} />],
    [0.32, ({ u, t }) => <Arbol t={t} u={u} />],
    [0.15, ({ u, t }) => <Plano t={t} u={u} gesto="sorpresa" fondo="dia" farol={false} zoom={[1.1, 1.2]} />],
    [0.25, ({ u, t }) => <Pared t={t} n={5} escribe={u * 1.3} cam={k([900, 470, 1.25], [940, 480, 1.3], u)} />],
  ],
  v12: [
    [0.55, ({ u, t }) => <Orilla t={t} hora="amanecer" pesca cam={k([960, 600, 1], [1050, 640, 1.22], u)} />],
    [0.45, ({ u, t }) => <Orilla t={t} hora="amanecer" pesca cam={k([1480, 770, 2.0], [1500, 760, 2.4], u)} />],
  ],
  v46: [
    [0.4, ({ u, t }) => <Sala t={t} hora="dia" reglas={5} lata tambo={{ x: 840 }} chispa={{ x: 560 }} cam={k([1080, 620, 1.7], [1120, 620, 2.0], u)} />],
    [0.6, ({ u, t }) => <Lata t={t} u={u} />],
  ],
  "p:montaje": [
    [0.25, ({ u, t }) => <Exterior t={t} hora="tarde" lonas cam={k([1500, 660, 0.66], [1700, 640, 0.76], u)} />],
    [0.25, ({ u, t }) => <Orilla t={t} hora="tarde" pesca cam={k([1100, 640, 1.1], [900, 620, 1.25], u)} />],
    [0.25, ({ u, t }) => <Lente t={t} hora="tarde" tambo={{ x: 560, brazo: 0.9 + 0.3 * Math.sin(t * 5) }} cam={k([820, 560, 1.3], [900, 540, 1.5], u)} />],
    [0.25, ({ u, t }) => <Sala t={t} hora="noche" reglas={5} enCama="dormido" chispa={{ x: 1400, estado: "dormida" }} haz cam={k([1380, 620, 1.2], [1500, 640, 1.5], u)} />],
  ],
  v13: [
    [0.4, ({ u, t }) => <Lente t={t} hora="noche" tambo={{ x: 560, brazo: 0.9 + 0.3 * Math.sin(t * 5) }} chispa={1500} cam={k([900, 560, 1.15], [960, 500, 1.4], u)} />],
    [0.3, ({ u, t }) => <Exterior t={t} hora="noche" haz="mar" cam={k([1900, 620, 0.7], [2100, 560, 0.86], u)} />],
    [0.3, ({ u, t }) => <Sala t={t} hora="noche" reglas={5} enCama="dormido" chispa={{ x: 1400, estado: "dormida" }} haz cam={k([1500, 640, 1.5], [1600, 650, 1.9], u)} />],
  ],
  v14: [
    [0.55, ({ u, t }) => <g><Radio t={t} on={0} cam={k([960, 540, 1], [980, 540, 1.16], u)} /><Rotulo texto="21:00" sub="reporte por radio" o={pr(u, 0.05, 0.2)} /></g>],
    [0.45, ({ u, t }) => <Sala t={t} hora="noche" reglas={5} tambo={{ x: 830 }} chispa={{ x: 560, estado: "dormida" }} cam={k([1020, 600, 1.5], [1060, 600, 1.75], u)} />],
  ],
  v47: [
    [0.3, ({ u, t }) => <Exterior t={t} hora="noche" haz="mar" cam={k([2050, 300, 2.0], [2060, 240, 2.5], u)} />],
    [0.35, ({ u, t }) => <Sala t={t} hora="noche" reglas={5} enCama="despierto" chispa={{ x: 1400, estado: "dormida" }} haz cam={k([1680, 660, 1.9], [1700, 670, 2.3], u)} />],
    [0.35, ({ u, t }) => <Exterior t={t} hora="noche" haz="mar" cam={k([1300, 1120, 1.7], [1000, 1110, 1.7], u)} />],
  ],
  v15: [
    [0.5, ({ u, t }) => <g><Sala t={t} hora="noche" reglas={5} enCama="dormido" chispa={{ x: 900, estado: "alerta" }} haz cam={k([1150, 600, 1.2], [1050, 580, 1.5], u)} /><Rotulo texto="3:00 a. m." o={pr(u, 0.1, 0.25)} color="#ffd23f" /></g>],
    [0.5, ({ u, t }) => <Plano t={t} u={u} quien="chispa" fondo="sala" zoom={[1, 1.14]} />],
  ],
  v16: [
    [0.3, ({ u, t }) => <g><Sala t={t} hora="noche" reglas={5} enCama="dormido" chispa={{ x: 900, estado: "alerta" }} haz cam={k([1020, 560, 1.7], [1040, 550, 1.9], u)} /><Rotulo texto="3:00 a. m." o={1} color="#ffd23f" /></g>],
    [0.3, ({ u, t }) => <Sala t={t} hora="noche" reglas={5} tambo={{ x: 1290, voltea: true, gesto: "miedo" }} chispa={{ x: 900, estado: "alerta" }} haz cam={k([1150, 560, 1.6], [1180, 540, 1.9], u)} />],
    [0.4, ({ u, t }) => <Exterior t={t} hora="noche" haz="mar" cam={k([1050, 930, 1.4], [820, 960, 2.0], u)} />],
  ],
  v48: [
    [0.4, ({ u, t }) => <Exterior t={t} hora="dia" tambo={{ x: 1030, y: 1012, voltea: true }} chispa={{ x: 1230, y: 975, voltea: true, alerta: true }} cam={k([980, 960, 2.0], [900, 970, 2.4], u)} />],
    [0.6, ({ u, t }) => <Exterior t={t} hora="dia" rayas cam={k([760, 985, 4.0], [790, 992, 5.2], u)} />],
  ],
  v17: [[1, ({ u, t }) => <Pared t={t} n={6} escribe={u * 1.5} noche cam={k([900, 560, 1.3], [940, 580, 1.4], u)} />]],
  v18: [
    [0.55, ({ u, t }) => <Huellas t={t} hora="amanecer" n={pr(u, 0, 0.8)} cam={k([960, 700, 1.05], [960, 500, 1.25], u)} />],
    [0.45, ({ u, t }) => <Exterior t={t} hora="amanecer" huellas={1} tambo={{ x: 2096, y: 830, gesto: "sorpresa" }} chispa={{ x: 2150, y: 834, alerta: true, voltea: true }} cam={k([1980, 900, 1.9], [1900, 940, 2.2], u)} />],
  ],
  v19: [[1, ({ u, t }) => <Exterior t={t} hora="amanecer" huellas={1} cam={k([2040, 840, 2.8], [1740, 1050, 2.8], u)} />]],
  v20: [
    [0.3, ({ u, t }) => <Plano t={t} u={u} gesto="miedo" fondo="amanecer" mira={[0, 1]} farol={false} zoom={[1.1, 1.25]} />],
    [0.3, ({ u, t }) => <Huellas t={t} hora="amanecer" n={1} zapatos cam={k([940, 820, 1.4], [930, 840, 1.6], u)} />],
    [0.4, ({ u, t }) => <Sala t={t} hora="noche" reglas={6} silla enCama="despierto" chispa={{ x: 1250, estado: "dormida" }} cam={k([1480, 620, 1.3], [1440, 620, 1.65], u)} />],
  ],
  v49: [
    [0.5, ({ u, t }) => <Huellas t={t} hora="noche" n={0} zapatos cascabel cam={k([1040, 880, 1.9], [1080, 880, 2.4], u)} />],
    [0.5, ({ u, t }) => <Huellas t={t} hora="amanecer" n={1} cam={k([960, 600, 1.1], [960, 480, 1.35], u)} />],
  ],
  v21: [
    [0.5, ({ u, t }) => <Sala t={t} hora="dia" reglas={6} tabla tambo={{ x: 900, voltea: true, gesto: "sorpresa" }} chispa={{ x: 440, estado: "alerta" }} cam={k([780, 800, 1.6], [700, 900, 2.3], u)} />],
    [0.5, ({ u, t }) => <Cuaderno t={t} modo="cerrado" noche={false} cam={k([960, 540, 1], [960, 540, 1.22], u)} />],
  ],
  v22: [[1, ({ u, t }) => <Cuaderno t={t} modo="reglas" cam={k([620, 320, 1.6], [680, 360, 1.95], u)} />]],
  v23: [
    [0.35, ({ u, t }) => <Plano t={t} u={u} gesto="miedo" fondo="sala" zoom={[1.1, 1.3]} />],
    [0.65, ({ u, t }) => <Cuaderno t={t} modo="sigue" cam={k([620, 330, 1.5], [1320, 330, 1.75], u)} />],
  ],
  v24: [
    [0.5, ({ u, t }) => <Cuaderno t={t} modo="dia211" cam={k([1320, 300, 1.5], [1300, 290, 2.1], u)} />],
    [0.25, ({ u, t }) => <Cuaderno t={t} modo="cerrado" cam={k([960, 540, 1.2], [960, 540, 1.1], u)} />],
    [0.25, ({ u, t }) => <Plano t={t} u={u} gesto="miedo" fondo="sala" mira={[0, 0.7]} zoom={[1.2, 1.35]} />],
  ],
  v50: [
    [0.5, ({ u, t }) => <Olla t={t} u={u} papel={pr(u, 0.2, 1)} />],
    [0.5, ({ u, t }) => <Cuaderno t={t} modo="intacta" noche={false} cam={k([1320, 320, 1.4], [1300, 290, 2.2], u)} />],
  ],
  v25: [
    [0.55, ({ u, t }) => <g><Sala t={t} hora="noche" reglas={6} tambo={{ x: 830 }} chispa={{ x: 560, estado: "dormida" }} cam={k([1040, 600, 1.6], [1060, 600, 1.85], u)} /><Rotulo texto="21:00" o={pr(u, 0.05, 0.2)} /></g>],
    [0.45, ({ u, t }) => <Radio t={t} on={pr(u, 0.45, 0.6)} cam={k([960, 540, 1.05], [960, 540, 1.3], u)} />],
  ],
  v26: [[1, ({ u, t }) => <Radio t={t} on={1} cam={k([960, 520, 1.1], [860, 540, 1.6], u)} />]],
  v27: [[1, ({ u, t }) => <Plano t={t} u={u} gesto={u < 0.45 ? "sorpresa" : "miedo"} fondo="sala" zoom={[1.05, 1.6]} tiembla={1.5} />]],
  v28: [
    [0.5, ({ u, t }) => <Pared t={t} n={7} escribe={u * 1.4} tiembla={5} noche cam={k([900, 650, 1.3], [940, 660, 1.42], u)} />],
    [0.5, ({ u, t }) => <Cuaderno t={t} modo="regla7" cam={k([1100, 330, 1.3], [1300, 300, 2.0], u)} />],
  ],
  v51: [
    [0.55, ({ u, t }) => <Radio t={t} on={0} bateria={false} cam={k([1100, 560, 1.1], [1250, 600, 1.4], u)} />],
    [0.45, ({ u, t }) => <Radio t={t} on={1} bateria={false} cam={k([960, 540, 1.1], [900, 540, 1.5], u)} />],
  ],
  v52: [
    [0.4, ({ u, t }) => <Pared t={t} n={8} resalta={8} cam={k([900, 600, 1.1], [900, 760, 1.6], u)} />],
    [0.2, ({ u, t }) => <Plano t={t} u={u} gesto="miedo" fondo="amanecer" farol={false} zoom={[1.15, 1.3]} />],
    [0.4, ({ u, t }) => <Huellas t={t} hora="amanecer" n={1} coincide={pr(u, 0.1, 0.7)} cam={k([980, 900, 1.6], [1010, 930, 2.3], u)} />],
  ],
  v29: [
    [0.45, ({ u, t }) => <Exterior t={t} hora="niebla" niebla={1} mallas cam={k(AMP, [1560, 760, 1.5], u)} />],
    [0.55, ({ u, t }) => <g><Mallas t={t} u={u} /><Rotulo texto="2 litros al día" o={pr(u, 0.5, 0.65)} color="#ffd23f" /></g>],
  ],
  v30: [[1, ({ u, t }) => <Exterior t={t} hora="noche" niebla={0.85} haz="mar" sombra={pr(u, 0.55, 0.75)} cam={k([2000, 560, 0.95], [2400, 380, 1.5], u)} />]],
  v53: [[1, ({ u, t }) => <Exterior t={t} hora="dia" raya tambo={{ x: 960, y: 1016, voltea: true }} chispa={{ x: 1230, y: 978, voltea: true, cola: 0 }} cam={k([1080, 960, 2.2], [1160, 960, 2.8], u)} />]],
  v31: [
    [0.45, ({ u, t }) => <Sala t={t} hora="dia" reglas={9} tambo={{ x: 1090, voltea: true, gesto: "sorpresa" }} chispa={{ x: 1760, estado: "alerta", voltea: true }} cam={k([760, 480, 1.4], [700, 460, 1.7], u)} />],
    [0.55, ({ u, t }) => <Pared t={t} n={9} resalta={9} cam={k([860, 700, 1.2], [860, 840, 1.6], u)} />],
  ],
  v32: [
    [0.6, ({ u, t }) => <Pared t={t} n={9} cam={k([700, 850, 1.9], [780, 850, 2.5], u)} />],
    [0.4, ({ u, t }) => <Sala t={t} hora="dia" reglas={9} tambo={{ x: 640, gesto: "miedo" }} chispa={{ x: 1760, estado: "alerta", voltea: true }} cam={k([1100, 620, 1.05], [1300, 660, 1.3], u)} />],
  ],
  v33: [
    [0.35, ({ u, t }) => <Lente t={t} hora="tarde" tambo={{ x: 620, gesto: "decidido", brazo: 0.2 }} cam={k([900, 800, 1.7], [960, 820, 2.0], u)} />],
    [0.3, ({ u, t }) => <Sala t={t} hora="noche" reglas={9} silla tambo={{ x: 1180, gesto: "decidido" }} chispa={{ x: 820 }} cam={k([1380, 620, 1.4], [1420, 620, 1.6], u)} />],
    [0.35, ({ u, t }) => <Olla t={t} u={u} />],
  ],
  v54: [[1, ({ u, t }) => <Lata t={t} u={u} noche />]],
  "p:espera": [
    [0.5, ({ u, t }) => <g><Sala t={t} hora="noche" reglas={9} silla tambo={{ x: 1180, gesto: "decidido" }} chispa={{ x: 820, estado: "dormida" }} haz cam={k([1100, 600, 1.2], [1150, 600, 1.45], u)} /><Rotulo texto="2:59 a. m." o={pr(u, 0.2, 0.4)} color="#ffd23f" /></g>],
    [0.5, ({ u, t }) => <Exterior t={t} hora="noche" haz="mar" cam={k([1700, 640, 0.66], [1900, 600, 0.8], u)} />],
  ],
  v34: [
    [0.4, ({ u, t }) => <g><Sala t={t} hora="noche" reglas={9} silla tambo={{ x: 1180, gesto: "sorpresa" }} chispa={{ x: 880, estado: "alerta" }} haz cam={k([1000, 600, 1.5], [960, 600, 1.8], u)} /><Rotulo texto="3:00 a. m." o={1} color="#ffd23f" /></g>],
    [0.6, ({ u, t }) => <Plano t={t} u={u} quien="chispa" fondo="sala" ladra tiembla={3} zoom={[1.05, 1.2]} />],
  ],
  v35: [
    [0.4, ({ u, t }) => <Lente t={t} hora="noche" giro={u * 1.2} tiembla={3} cam={k([960, 520, 1.3], [960, 480, 1.7], u)} />],
    [0.6, ({ u, t }) => <Exterior t={t} hora="noche" haz="gira" g={pr(u, 0.05, 0.95)} cam={k(AMP, [1450, 720, 0.78], u)} />],
  ],
  v36: [
    [0.5, ({ u, t }) => <Pared t={t} n={9} resalta={9} noche cam={k([760, 850, 1.7], [820, 850, 2.1], u)} />],
    [0.5, ({ u, t }) => <Plano t={t} u={u} gesto="decidido" fondo="sala" zoom={[1.15, 1.4]} />],
  ],
  v37: [[1, ({ u, t }) => <Plano t={t} u={u} gesto="decidido" fondo="sala" farol={false} zoom={[2.0, 2.7]} />]],
  v38: [[1, ({ u, t }) => <Exterior t={t} hora="noche" haz="isla" figura={pr(u, 0.3, 0.55)} cam={k([1500, 700, 0.8], [800, 960, 2.8], u)} />]],
  v39: [
    [0.45, ({ u, t }) => <Exterior t={t} hora="noche" haz="isla" figura={1} rayas cam={k([790, 950, 4.0], [785, 940, 5.2], u)} />],
    [0.55, ({ u, t }) => <Plano t={t} u={u} quien="doble" fondo="oscuro" saluda={pr(u, 0.45, 0.75) * 0.9} zoom={[1.0, 1.25]} />],
  ],
  v40: [
    [0.55, ({ u, t }) => <Sala t={t} hora="noche" reglas={9} silla golpes={Math.max(0, Math.sin(u * Math.PI * 6)) > 0.6 ? 1 : 0} tambo={{ x: 960, gesto: "miedo" }} chispa={{ x: 1180, cola: Math.sin(t * 12) }} tiembla={2} cam={k([1300, 600, 1.4], [1400, 600, 1.75], u)} />],
    [0.45, ({ u, t }) => <Sala t={t} hora="noche" reglas={9} silla golpes={Math.sin(u * 30) > 0.8 ? 1 : 0} tambo={{ x: 960, gesto: "miedo" }} chispa={{ x: 1180, cola: Math.sin(t * 12) }} cam={k([1220, 720, 2.2], [1240, 720, 2.6], u)} />],
  ],
  v41: [
    [0.65, ({ u, t }) => <Pared t={t} n={10} escribe={u * 1.2} tiembla={3} noche cam={k([900, 900, 1.3], [960, 920, 1.42], u)} />],
    [0.35, ({ u, t }) => <Plano t={t} u={u} gesto="decidido" fondo="sala" zoom={[1.2, 1.45]} />],
  ],
  v42: [[1, ({ u, t }) => <Exterior t={t} hora="noche" haz="isla" figura={1} cam={k([1950, 700, 1.4], [1650, 640, 0.62], u)} />]],
  "p:final": [[1, ({ u, t }) => <g>
    <rect width={W} height={H} fill="#04050a" />
    <g opacity={Math.min(pr(u, 0.1, 0.3), 1 - pr(u, 0.9, 1))} fontFamily={F} fontWeight={800} textAnchor="middle" transform={`translate(${W / 2 + (Math.sin(t * 50) > 0.7 ? 5 : 0)} ${H / 2})`}>
      <text y={-20} fontSize={120} fill="#f3e6c8">CONTINUARÁ…</text>
      <text y={90} fontSize={56} fill="#ffd35a">Parte 2 · Día 213</text>
    </g>
  </g>]],
};
export const _cl = cl;
