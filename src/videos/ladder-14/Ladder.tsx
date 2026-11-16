// «Your ladder angle is wrong» — capítulo 14 del canal en inglés (vertical 1080x1920, 30 cps, three.js).
// Diálogo Flo vs Norm. Una escalera apoyada en la pared de una casa, vista de perfil: muy tendida resbala, muy parada se
// va hacia atrás; la regla 4 a 1 (un pie afuera por cada cuatro de alto) y 3 pies por encima del borde del techo.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, Tramo, hacerCamara, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const LAD_FPS = 30, LAD_SEG = duracion(tiempos), LAD_CUADROS = Math.round(LAD_FPS * LAD_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["ladder", "slide", "flatter", "safer", "flat", "feet", "kick", "wall", "straight", "steep", "backward", "worse", "angle", "four", "one", "foot", "ten", "gutter", "two", "half", "toes", "arms", "rung", "roof", "three", "edge", "team", "follow", "like"];
const XW = 0.6, ER = 2.7, PIE = 0.27; // pared de la casa en x = XW, borde del techo a 10 ft (1 ft = 0.27)
const ANG41 = Math.atan(4), L0 = ER / Math.sin(ANG41), XN = 1.25, XF = -1.55;

const C = {
  gancho: { pos: [-0.5, 1.3, 5.9], look: [-0.5, 1.15, 0] } as Cam, gancho2: { pos: [-0.5, 1.2, 5.3], look: [-0.5, 1.05, 0] } as Cam,
  dos: { pos: [-0.3, 1.55, 7.4], look: [-0.3, 1.45, 0] } as Cam, dos2: { pos: [-0.3, 1.5, 6.9], look: [-0.3, 1.42, 0] } as Cam,
  flo: { pos: [XF, 0.85, 2.7], look: [XF, 0.7, 0] } as Cam, flo2: { pos: [XF, 0.85, 2.3], look: [XF, 0.72, 0] } as Cam,
  pies: { pos: [-0.9, 0.55, 3.4], look: [-0.9, 0.4, 0] } as Cam, pies2: { pos: [-0.9, 0.5, 3.0], look: [-0.9, 0.38, 0] } as Cam,
  alto: { pos: [-0.15, 1.45, 6.6], look: [-0.15, 1.4, 0] } as Cam, alto2: { pos: [-0.15, 1.42, 6.2], look: [-0.15, 1.38, 0] } as Cam,
  check: { pos: [-0.25, 0.75, 3.8], look: [-0.25, 0.55, 0] } as Cam, check2: { pos: [-0.25, 0.72, 3.4], look: [-0.25, 0.55, 0] } as Cam,
  techo: { pos: [0.45, 2.85, 3.3], look: [0.45, 2.85, 0] } as Cam, techo2: { pos: [0.45, 2.85, 2.9], look: [0.45, 2.85, 0] } as Cam,
  equipo: { pos: [-0.3, 1.6, 5.2], look: [-0.3, 1.85, 0] } as Cam, fin: { pos: [-0.3, 1.6, 6.4], look: [-0.3, 2.05, 0] } as Cam,
};
const TRAMOS: Tramo[] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2], [T[3], T[4], C.pies, C.pies2], [T[4], T[5], C.flo, C.flo2],
  [T[5], T[6], C.alto, C.alto2], [T[6], T[7], C.flo2, C.flo], [T[7], T[9], C.alto, C.alto2], [T[9], T[10], C.check, C.check2], [T[10], T[11], C.techo, C.techo2],
  [T[11], T[12], C.flo, C.flo2], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const caida = (t: number) => (t >= 1.0 && t < 1.4 ? 0.05 : 0) + (t >= T[3] + 1.3 && t < T[3] + 1.6 ? 0.04 : 0) + (t >= T[5] + 1.5 && t < T[5] + 1.8 ? 0.05 : 0);
const { camEn, pantalla } = hacerCamara(TRAMOS, caida);

/** estado de la escalera en el segundo t: pie (x), ángulo con el suelo y largo */
const escalera = (t: number): { xf: number; ang: number; largo: number } => {
  const apoyada = (ang: number, largo = L0) => ({ xf: XW - largo * Math.cos(ang), ang, largo });
  if (t < T[2]) { const u = pr(t, 0.4, 1.35); return apoyada(lerp(0.95, 0.1, u * u)); }                    // resbala con Flo encima
  if (t < T[3]) return apoyada(0.9);
  if (t < T[4]) { const u = pr(t, T[3] + 0.3, T[3] + 1.4); return apoyada(lerp(0.9, 0.1, u * u)); }          // muy tendida: se va
  if (t < T[5]) return apoyada(1.5);
  if (t < T[7]) { const base = apoyada(1.5), u = pr(t, T[5] + 0.4, T[5] + 1.6); return { ...base, ang: lerp(1.5, Math.PI - 0.06, u * u) }; } // muy parada: hacia atrás
  const extra = t >= T[10] ? 0.82 * pr(t, T[10] + 0.2, T[10] + 1.2) : 0;
  return { xf: XW - L0 * Math.cos(ANG41), ang: ANG41, largo: L0 + extra };
};

const Escalera: React.FC<{ xf: number; ang: number; largo: number }> = ({ xf, ang, largo }) => {
  const n = Math.floor(largo / PIE);
  return (
    <group position={[xf, 0, 0.25]} rotation={[0, 0, ang]}>
      {[-0.13, 0.13].map((z) => <Caja key={z} p={[largo / 2, 0, z]} s={[largo, 0.05, 0.035]} c="#c7ced6" />)}
      {[...Array(n)].map((_, i) => <mesh key={i} position={[PIE * (i + 0.6), 0, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.014, 0.014, 0.26, 8]} /><meshLambertMaterial color="#9aa5b1" /></mesh>)}
      {[-0.13, 0.13].map((z) => <Caja key={`p${z}`} p={[0.03, -0.01, z]} s={[0.08, 0.06, 0.05]} c="#333a40" />)}
    </group>
  );
};

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const e = escalera(t);
  const gancho = t < T[2];
  const fH = habla(t, 1), nH = habla(t, 0);
  // Flo: en el gancho va subida en la escalera y baja con ella
  let fp: [number, number, number] = [XF, 0, 0.35], fCae = 0, fAla = fH * 0.7;
  if (gancho) {
    const d = 0.32 * e.largo, x = e.xf + d * Math.cos(e.ang), y = d * Math.sin(e.ang);
    fp = [x - 0.15, Math.max(0, y - 0.15), 0.5]; fCae = t < 1.35 ? 0.1 : pr(t, 1.35, 1.8) * 0.9; fAla = t < 1.8 ? 1 : fH * 0.7;
  }
  if (t >= T[11] && t < T[12]) fAla = 0.5 + 0.3 * Math.sin(t * 8);
  const chequeo = t >= T[9] && t < T[10] + 0.2;
  const nx = chequeo ? lerp(XN, e.xf - 0.32, pr(t, T[9], T[9] + 0.6)) : XN;
  const nBrazo = chequeo && t > T[9] + 0.6 ? 1 : (t >= T[7] && t < T[9]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} huecos={[[XW, 3.2]]} zPasto={-2.6} />
      {/* la casa: pared, ventana, techo plano con canaleta */}
      <Caja p={[XW + 1.1, ER / 2, -1.3]} s={[2.2, ER, 2.6]} c="#f2e3c6" />
      {[...Array(9)].map((_, i) => <Caja key={i} p={[XW + 1.1, 0.15 + i * 0.3, 0.002]} s={[2.2, 0.012, 0.004]} c="#d9c6a2" sombra={false} recibe={false} />)}
      <Caja p={[XW + 1.0, 1.55, 0.006]} s={[0.55, 0.6, 0.01]} c="#7fc8ff" sombra={false} />
      <Caja p={[XW + 1.0, 1.55, 0.01]} s={[0.04, 0.6, 0.01]} c="#ffffff" sombra={false} /><Caja p={[XW + 1.0, 1.55, 0.011]} s={[0.55, 0.04, 0.01]} c="#ffffff" sombra={false} />
      <Caja p={[XW + 1.1, ER + 0.04, -1.3]} s={[2.4, 0.08, 2.8]} c="#7a4a3a" />
      <Caja p={[XW - 0.06, ER - 0.02, -1.3]} s={[0.1, 0.1, 2.8]} c="#e8e8e8" />
      <Escalera {...e} />
      {t >= T[6] && t < T[7] && <Preguntas t={t} a={T[6]} p={[XF + 0.1, 1.2, 0.4]} />}
      <Flo p={fp} t={t} habla={fH} cae={fCae} giro={0.4} ala={fAla} />
      <Norm p={[nx, nSalto, 0.55]} t={t} giro={chequeo ? 1.2 : -0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const e = escalera(t);
  const [px, py] = pantalla(t, [e.xf, 0.02, 0.3]);
  const [wx, wy] = pantalla(t, [XW, 0.02, 0.3]), [ex, ey] = pantalla(t, [XW, ER, 0.3]);
  const medidas = v(T[7] + 0.4, T[9]);
  const diez = t >= T[8] + 0.2;
  const [tx, ty] = pantalla(t, [XW, ER + 0.82, 0.3]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR LADDER" abajo="WILL SLIDE" color="#ff4a1a" tamAbajo={120} />
      <Grande s="FLATTER = SAFER?" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={100} />
      <Grande s="TOO FLAT ✗" o={v(T[3] + 0.2, T[4])} col="#ff2a2a" borde="#fff" tam={120} />
      {v(T[3] + 0.4, T[4]) > 0 && <path d={`M${px + 20} ${py - 60} h120 v-30 l70 50 l-70 50 v-30 h-120z`} transform={`scale(-1 1) translate(${-2 * px} 0)`} fill="#ff2a2a" stroke="#fff" strokeWidth={8} opacity={v(T[3] + 0.4, T[4])} />}
      <Grande s="FEET KICK OUT" o={v(T[3] + 0.4, T[4])} col="#fff" borde="#14321f" tam={84} y={410} />
      <Grande s="STRAIGHT UP!" o={v(T[4] + 0.1, T[5])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="TOO STEEP ✗" o={v(T[5] + 0.2, T[6])} col="#ff2a2a" borde="#fff" tam={120} />
      <Grande s="TIPS BACKWARD" o={v(T[5] + 0.4, T[6])} col="#fff" borde="#14321f" tam={84} y={410} />
      <Grande s="THE MAGIC ANGLE?" o={v(T[6] + 0.05, T[7])} col="#ff4f9a" borde="#fff" tam={100} />
      <Grande s="THE 4 : 1 RULE" o={v(T[7] + 0.2, T[9])} col="#27c24c" borde="#fff" tam={120} />
      {medidas > 0 && <g opacity={medidas}>
        <line x1={wx + 40} y1={wy} x2={ex + 40} y2={ey} stroke="#fff" strokeWidth={16} /><line x1={wx + 40} y1={wy} x2={ex + 40} y2={ey} stroke="#14321f" strokeWidth={7} />
        <line x1={px} y1={py + 40} x2={wx} y2={wy + 40} stroke="#fff" strokeWidth={16} /><line x1={px} y1={py + 40} x2={wx} y2={wy + 40} stroke="#14321f" strokeWidth={7} />
        <Etiqueta s={diez ? "10 FT" : "4 UP"} x={wx + 160} y={(wy + ey) / 2} o={1} col="#ffd23f" borde="#14321f" tam={84} />
        <Etiqueta s={diez ? "2.5 FT" : "1 OUT"} x={(px + wx) / 2} y={py + 130} o={1} col="#ffd23f" borde="#14321f" tam={84} /></g>}
      <Grande s="ARMS OUT → RUNG ✓" o={v(T[9] + 0.8, T[10])} col="#27c24c" borde="#fff" tam={84} />
      <Grande s="3 FT ABOVE THE EDGE" o={v(T[10] + 0.6, T[11])} col="#27c24c" borde="#fff" tam={76} />
      {v(T[10] + 1.0, T[11]) > 0 && <g opacity={v(T[10] + 1.0, T[11])}>
        <line x1={ex - 90} y1={ey} x2={tx - 90} y2={ty} stroke="#14321f" strokeWidth={8} />
        <Etiqueta s="3 FT" x={ex - 200} y={(ey + ty) / 2 + 20} o={1} col="#ffd23f" borde="#14321f" tam={78} /></g>}
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="FLATTER" der="4 TO 1" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR PERGOLA WILL WOBBLE" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const LadderVideo: React.FC = () => {
  const t = useCurrentFrame() / LAD_FPS;
  return <Marco t={t} seg={LAD_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} />;
};
