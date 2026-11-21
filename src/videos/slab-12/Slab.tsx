// «Lines in concrete: just for looks?» — capítulo 12 del canal en inglés (vertical 1080x1920, 30 cps, three.js).
// Diálogo Flo vs Norm. Una losa de concreto cortada en z = 0. Sin juntas se agrieta por el medio; con juntas de control
// (cortadas a 1/4 del espesor) la grieta queda escondida dentro de la línea. Debajo, una base de grava compactada.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, azar, rebote, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, Tramo, hacerCamara, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const SLAB_FPS = 30, SLAB_SEG = duracion(tiempos), SLAB_CUADROS = Math.round(SLAB_FPS * SLAB_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["concrete", "slab", "crack", "smooth", "lines", "shrinks", "dries", "spot", "middle", "looks", "control", "joints", "weak", "purpose", "four", "inch", "eight", "twelve", "feet", "quarter", "early", "dirt", "gravel", "compacted", "base", "team", "follow", "like"];
const X0 = -0.75, X1 = 0.55, ZB = -1.6, SY = 0.04, GR = 0.13, BASE = 0.1; // losa de X0 a X1, de z = ZB a 0; arriba en SY, espesor GR
const J = [-0.32, 0.12]; // juntas de control
const XN = -1.0, XF = 0.75;
const XG = -0.1; // por donde se agrieta la losa sin juntas

const C = {
  gancho: { pos: [-0.1, 1.15, 2.6], look: [-0.1, 0.0, -0.8] } as Cam, gancho2: { pos: [-0.1, 1.05, 2.2], look: [-0.1, 0.0, -0.8] } as Cam,
  dos: { pos: [-0.12, 0.75, 6.6], look: [-0.12, 0.45, 0] } as Cam, dos2: { pos: [-0.12, 0.7, 6.1], look: [-0.12, 0.42, 0] } as Cam,
  flo: { pos: [XF, 0.85, 2.7], look: [XF, 0.7, 0] } as Cam, flo2: { pos: [XF, 0.85, 2.3], look: [XF, 0.72, 0] } as Cam,
  losa: { pos: [-0.1, 0.95, 3.3], look: [-0.1, 0.0, -0.7] } as Cam, losa2: { pos: [-0.1, 0.9, 2.9], look: [-0.1, 0.0, -0.7] } as Cam,
  sierra: { pos: [0.1, 0.75, 2.3], look: [-0.1, 0.0, -0.8] } as Cam,
  frente: { pos: [J[0], 0.06, 1.0], look: [J[0], -0.01, 0] } as Cam, frente2: { pos: [J[0], 0.05, 0.8], look: [J[0], -0.01, 0] } as Cam,
  medida: { pos: [-0.1, 0.55, 2.7], look: [-0.1, 0.0, -0.4] } as Cam,
  base: { pos: [-0.1, 0.05, 2.5], look: [-0.1, -0.05, 0] } as Cam, base2: { pos: [-0.1, 0.05, 2.1], look: [-0.1, -0.05, 0] } as Cam,
  equipo: { pos: [-0.12, 0.8, 5.0], look: [-0.12, 1.05, 0] } as Cam, fin: { pos: [-0.1, 0.8, 6.2], look: [-0.1, 1.25, 0] } as Cam,
};
const TRAMOS: Tramo[] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2], [T[3], T[4], C.losa, C.losa2], [T[4], T[5], C.losa2, C.losa],
  [T[5], T[6], C.flo, C.flo2], [T[6], T[6] + 3.2, C.sierra, C.losa], [T[6] + 3.2, T[7], C.frente, C.frente2], [T[7], T[8], C.medida, C.medida], [T[8], T[9], C.frente, C.frente2],
  [T[9], T[10], C.flo2, C.flo], [T[10], T[11], C.base, C.base2], [T[11], T[12], C.flo, C.flo2], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const { camEn, pantalla } = hacerCamara(TRAMOS, (t) => (t >= 0.3 && t < 1.2 ? 0.02 : 0) + (t >= T[4] + 0.6 && t < T[4] + 1.6 ? 0.02 : 0));

/** tramo recto delgado entre dos puntos sobre la superficie (en x-z) o sobre la cara del corte (en x-y) */
const Raya: React.FC<{ a: [number, number]; b: [number, number]; plano: "arriba" | "frente"; ancho?: number; c?: string }> = ({ a, b, plano, ancho = 0.012, c = "#2a2622" }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return plano === "arriba"
    ? <mesh position={[m[0], SY + 0.003, m[1]]} rotation={[0, -Math.atan2(dy, dx), 0]}><boxGeometry args={[l, 0.004, ancho]} /><meshBasicMaterial color={c} /></mesh>
    : <mesh position={[m[0], m[1], 0.009]} rotation={[0, 0, Math.atan2(dy, dx)]}><boxGeometry args={[l, ancho, 0.004]} /><meshBasicMaterial color={c} /></mesh>;
};
const GRIETA: [number, number][] = [...Array(11)].map((_, i) => [XG + (i % 2 ? 1 : -1) * (0.02 + 0.03 * azar(i + 5)), (ZB * i) / 10]);
const GRIETA_F: [number, number][] = [...Array(5)].map((_, i) => [XG + (i % 2 ? 1 : -1) * 0.015 * (i ? 1 : 0), SY - (GR * i) / 4]);

const Grieta: React.FC<{ g: number }> = ({ g }) => g <= 0 ? null : <group>
  {GRIETA.slice(0, -1).map((p, i) => i < g * 10 && <Raya key={i} a={p} b={GRIETA[i + 1]} plano="arriba" ancho={0.016} />)}
  {GRIETA_F.slice(0, -1).map((p, i) => i < g * 6 && <Raya key={`f${i}`} a={p} b={GRIETA_F[i + 1]} plano="frente" ancho={0.012} />)}
</group>;

const Sierra: React.FC<{ x: number; u: number; t: number }> = ({ x, u, t }) => (u <= 0 || u >= 1) ? null : (
  <group position={[x, SY + 0.05, lerp(0.05, ZB + 0.05, u)]}>
    <mesh rotation={[t * 40, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 0.008, 24]} /><meshLambertMaterial color="#c9d1d9" /></mesh>
    <Caja p={[0.06, 0.05, 0]} s={[0.1, 0.09, 0.22]} c="#ff8a1a" />
    <mesh position={[0.06, 0.13, 0.12]} rotation={[0.9, 0, 0]}><cylinderGeometry args={[0.01, 0.01, 0.3, 6]} /><meshLambertMaterial color="#333" /></mesh>
    {[...Array(8)].map((_, i) => { const d = ((t * 3 + i / 8) % 1); return <mesh key={i} position={[(azar(i) - 0.5) * 0.08, -0.04 + 0.2 * d, 0.08 + 0.15 * d]} scale={0.4 + d}><sphereGeometry args={[0.012, 6, 4]} /><meshBasicMaterial color="#e6e1d8" transparent opacity={1 - d} /></mesh>; })}
  </group>
);

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const gancho = t < T[1];
  const conJuntas = t >= T[6] + 0.2;
  const grieta = gancho ? pr(t, 0.3, 1.2) : t >= T[4] && !conJuntas ? pr(t, T[4] + 0.6, T[4] + 1.8) : 0;
  const cae = conJuntas ? rebote(pr(t, T[6] + 0.2, T[6] + 0.8)) : 1;
  const encoge = t >= T[3] && t < T[4] ? 0.025 * Math.sin(pr(t, T[3] + 0.2, T[4] - 0.2) * Math.PI) : 0;
  const corte = (k: number) => conJuntas ? pr(t, T[6] + 0.9 + k * 1.15, T[6] + 2.0 + k * 1.15) : 0;
  const escondida = t >= T[6] + 3.2 ? pr(t, T[6] + 3.4, T[6] + 4.2) : 0;
  const base = t >= T[10] ? 1 : 0, sube = t >= T[10] && t < T[11] ? Math.min(pr(t, T[10] + 0.1, T[10] + 0.5), 1 - pr(t, T[10] + 2.0, T[10] + 2.5)) : 0, grava = t >= T[10] ? pr(t, T[10] + 0.5, T[10] + 1.5) : 0;
  const dy = 0.9 * (1 - cae) + 0.25 * sube;
  const fH = habla(t, 1), nH = habla(t, 0);
  const fAla = gancho || (t >= T[4] + 0.6 && t < T[4] + 1.6) ? 1 : fH * 0.7;
  const nBrazo = (t >= T[6] && t < T[9]) || (t >= T[10] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} huecos={[[X0 - 0.05, X1 + 0.05]]} />
      {/* hueco en la tierra donde va la losa (y la base de grava) */}
      <Caja p={[(X0 + X1) / 2, SY - GR - BASE / 2, (ZB + 0.004) / 2]} s={[X1 - X0, BASE, -ZB + 0.004]} c={base ? "#a7a196" : "#7a5234"} sombra={false} />
      {base > 0 && [...Array(28)].map((_, i) => <mesh key={i} position={[X0 + 0.03 + azar(i + 11) * (X1 - X0 - 0.06), SY - GR - BASE + 0.015 + azar(i + 12) * (BASE - 0.03) * grava, 0.006]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.012 + 0.008 * azar(i + 13), 8, 6]} /><meshLambertMaterial color={i % 3 ? "#8f897c" : "#d6d0c2"} /></mesh>)}
      {base > 0 && <Caja p={[(X0 + X1) / 2, SY - GR - BASE * (1 - grava) / 2 - 0.002, 0.007]} s={[X1 - X0, BASE * (1 - grava) + 0.001, 0.004]} c="#7a5234" sombra={false} recibe={false} />}
      {/* la losa */}
      <group position={[0, dy, 0]} scale={[1 - encoge, 1, 1]}>
        <Caja p={[(X0 + X1) / 2, SY - GR / 2, (ZB + 0.006) / 2]} s={[X1 - X0, GR, -ZB + 0.006]} c="#c7c3bb" />
        <Caja p={[(X0 + X1) / 2, SY - GR / 2, 0.006]} s={[X1 - X0, GR, 0.002]} c="#b3aea4" sombra={false} recibe={false} />
        {[...Array(30)].map((_, i) => <mesh key={i} position={[X0 + 0.02 + azar(i + 20) * (X1 - X0 - 0.04), SY - 0.01 - azar(i + 21) * (GR - 0.02), 0.008]}><circleGeometry args={[0.004 + 0.006 * azar(i + 22), 6]} /><meshBasicMaterial color={i % 2 ? "#9a958c" : "#8a857c"} /></mesh>)}
        {!conJuntas && <Grieta g={grieta} />}
        {conJuntas && J.map((x, k) => { const u = corte(k); return u > 0 && <group key={k}>
          <Caja p={[x, SY - 0.016, -(-ZB * u) / 2 + 0.004]} s={[0.016, 0.034, -ZB * u + 0.008]} c="#4a463f" sombra={false} recibe={false} />
          <Sierra x={x} u={u} t={t} />
        </group>; })}
        {escondida > 0 && <Raya a={[J[0], SY - 0.034]} b={[J[0] + 0.008, SY - 0.034 - (GR - 0.034) * escondida]} plano="frente" ancho={0.006} />}
      </group>
      {t >= T[9] && t < T[10] && <Preguntas t={t} a={T[9]} p={[XF + 0.1, 1.2, 0.4]} />}
      {t >= T[5] && t < T[6] && <Preguntas t={t} a={T[5]} p={[XF + 0.1, 1.2, 0.4]} />}
      <Flo p={[XF, 0, 0.35]} t={t} habla={fH} giro={-0.4} ala={fAla} />
      <Norm p={[XN, nSalto, 0.4]} t={t} giro={0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
    const [j0x, j0y] = pantalla(t, [J[0], SY + 0.01, -0.3]), [j1x, j1y] = pantalla(t, [J[1], SY + 0.01, -0.3]);
  const [fx, fy] = pantalla(t, [X0 + 0.04, SY - GR / 2, 0.01]);
  const [gx, gy] = pantalla(t, [J[0], SY - 0.017, 0.01]);
  const flechas = v(T[3] + 0.2, T[4]);
  const medida = v(T[7] + 0.2, T[8]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR SLAB" abajo="WILL CRACK" color="#ff6a1a" tamAbajo={120} />
      <Grande s="NO UGLY LINES!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={110} />
      <Grande s="CONCRETE SHRINKS" o={flechas} col="#fff" borde="#14321f" tam={90} />
      {flechas > 0 && <g opacity={flechas} fill="#ff2a2a" stroke="#fff" strokeWidth={6}>
        <path d={`M300 820 l-90 -40 v24 h-160 v32 h160 v24z`} transform={`translate(${20 * Math.sin(t * 6)} 0)`} />
        <path d={`M780 820 l90 -40 v24 h160 v32 h-160 v24z`} transform={`translate(${-20 * Math.sin(t * 6)} 0)`} /></g>}
      <Grande s="RANDOM CRACK ✗" o={v(T[4] + 0.8, T[5])} col="#ff2a2a" borde="#fff" tam={100} />
      <Grande s="JUST FOR LOOKS?" o={v(T[5] + 0.1, T[6])} col="#ff4f9a" borde="#fff" tam={110} />
      <Grande s="CONTROL JOINTS" o={v(T[6] + 0.8, T[6] + 3.2)} col="#27c24c" borde="#fff" tam={104} />
      <Grande s="WEAK SPOT ON PURPOSE" o={v(T[6] + 0.8, T[6] + 3.2)} col="#fff" borde="#14321f" tam={60} y={400} />
      <Grande s="THE CRACK HIDES HERE ✓" o={v(T[6] + 3.4, T[7])} col="#27c24c" borde="#fff" tam={70} />
      {medida > 0 && <g opacity={medida}>
        <line x1={j0x} y1={j0y - 70} x2={j1x} y2={j1y - 70} stroke="#fff" strokeWidth={16} /><line x1={j0x} y1={j0y - 70} x2={j1x} y2={j1y - 70} stroke="#14321f" strokeWidth={7} />
        {[[j0x, j0y], [j1x, j1y]].map(([x, y]) => <line key={x} x1={x} y1={y - 105} x2={x} y2={y - 35} stroke="#14321f" strokeWidth={8} />)}
        <Etiqueta s="8–12 FT" x={(j0x + j1x) / 2} y={(j0y + j1y) / 2 - 100} o={1} col="#ffd23f" borde="#14321f" tam={74} />
        <Etiqueta s="4 IN SLAB" x={fx + 120} y={fy + 120} o={1} col="#fff" borde="#14321f" tam={60} />
      </g>}
      <Grande s="EVERY 8–12 FT" o={medida} col="#27c24c" borde="#fff" tam={100} />
      {v(T[8] + 0.2, T[9]) > 0 && <g opacity={v(T[8] + 0.2, T[9])}>
        <path d={`M${gx + 70} ${gy - 160} L${gx + 12} ${gy - 30}`} stroke="#ff2a2a" strokeWidth={14} strokeLinecap="round" />
        <Etiqueta s="1 IN = ¼" x={gx + 170} y={gy - 190} o={1} col="#ffd23f" borde="#14321f" tam={78} /></g>}
      <Grande s="CUT EARLY!" o={v(T[8] + 0.2, T[9])} col="#ff6a1a" borde="#fff" tam={120} />
      <Grande s="WHAT'S UNDER IT?" o={v(T[9] + 0.05, T[10])} col="#ff4f9a" borde="#fff" tam={100} />
      <Grande s="COMPACTED GRAVEL BASE" o={v(T[10] + 0.4, T[11])} col="#fff" borde="#14321f" tam={68} />
      <Sello t={t} a={T[11] + 0.5} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="LOOKS" der="CONTROL" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: THIS RAILING WON'T HOLD YOU" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const SlabVideo: React.FC = () => {
  const t = useCurrentFrame() / SLAB_FPS;
  return <Marco t={t} seg={SLAB_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} />;
};
