// «Don't hang a swing like this» — capítulo 16 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// Un porche cortado en z = 0: tablas del techo y vigas (joists) arriba. Con ganchos de rosca en las tablas, un lado se
// suelta y el columpio cae; bien hecho: perno de ojo que atraviesa la viga, con arandela y tuerca, y eslabón cerrado.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, rebote, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, Tramo, V3, hacerCamara, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const SWI_FPS = 30, SWI_SEG = duracion(tiempos), SWI_CUADROS = Math.round(SWI_FPS * SWI_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["swing", "drop", "back", "screw", "hooks", "ceiling", "boards", "threads", "looser", "yesterday", "force", "bounce", "joist", "eye", "bolt", "through", "washer", "nut", "wood", "closed", "quick", "links", "chain", "team", "follow", "like"];
const CY = 2.3, JOISTS = [-1.2, -0.45, 0.3, 1.05], X0 = -1.6, X1 = 1.35, L = 1.65; // techo, vigas, porche, largo de cadena
const MAL: [number, number] = [-0.8, -0.05], BIEN: [number, number] = [-0.45, 0.3];
const XN = 1.0;

const C = {
  gancho: { pos: [-0.3, 1.45, 5.4], look: [-0.3, 1.2, 0] } as Cam, gancho2: { pos: [-0.3, 1.4, 4.8], look: [-0.3, 1.15, 0] } as Cam,
  dos: { pos: [-0.15, 1.5, 6.6], look: [-0.15, 1.3, 0] } as Cam, dos2: { pos: [-0.15, 1.45, 6.0], look: [-0.15, 1.25, 0] } as Cam,
  flo: { pos: [-0.42, 1.25, 2.7], look: [-0.42, 1.1, 0] } as Cam, flo2: { pos: [-0.42, 1.25, 2.3], look: [-0.42, 1.12, 0] } as Cam,
  techo: { pos: [-0.42, 2.2, 2.6], look: [-0.42, 2.35, 0.3] } as Cam, techo2: { pos: [-0.42, 2.2, 2.2], look: [-0.42, 2.35, 0.3] } as Cam,
  gancho_c: { pos: [MAL[1], 2.15, 1.6], look: [MAL[1], 2.25, 0.3] } as Cam, gancho_c2: { pos: [MAL[1], 2.15, 1.35], look: [MAL[1], 2.25, 0.3] } as Cam,
  viga: { pos: [BIEN[0], 2.3, 1.9], look: [BIEN[0], 2.35, 0.3] } as Cam, viga2: { pos: [BIEN[0], 2.3, 1.6], look: [BIEN[0], 2.35, 0.3] } as Cam,
  eslabon: { pos: [BIEN[1], 2.0, 1.6], look: [BIEN[1], 2.1, 0.3] } as Cam,
  floS: { pos: [-1.25, 0.9, 3.0], look: [-1.25, 0.75, 0] } as Cam, floS2: { pos: [-1.25, 0.9, 2.6], look: [-1.25, 0.77, 0] } as Cam,
  norm: { pos: [XN, 0.5, 2.3], look: [XN, 0.4, 0] } as Cam, norm2: { pos: [XN, 0.48, 2.0], look: [XN, 0.38, 0] } as Cam,
  equipo: { pos: [-0.2, 1.4, 5.0], look: [-0.2, 1.65, 0] } as Cam, fin: { pos: [-0.2, 1.4, 6.2], look: [-0.2, 1.85, 0] } as Cam,
};
const TRAMOS: Tramo[] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2], [T[3], T[4], C.techo, C.techo2], [T[4], T[5], C.gancho_c, C.gancho_c2],
  [T[5], T[6], C.flo, C.flo2], [T[6], T[7], C.dos2, C.dos], [T[7], T[8], C.flo2, C.flo], [T[8], T[9], C.viga, C.viga2], [T[9], T[10], C.viga2, C.viga],
  [T[10], T[11], C.eslabon, C.eslabon], [T[11], T[12], C.floS, C.floS2], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const CAE = 0.75;
const { camEn, pantalla } = hacerCamara(TRAMOS, (t) => (t >= CAE && t < CAE + 0.4 ? 0.05 : 0) + (t < 0.3 ? 0.03 : 0));

/** estado del columpio: puntos de cuelgue, vaivén (rad) y caída del lado derecho */
const columpio = (t: number) => {
  const bien = t >= T[8] + 0.4;
  const pts = bien ? BIEN : MAL;
  let vai = 0.12 * Math.sin(t * 2.6), cae = 0, suelta = 0;
  if (t < T[1]) { cae = rebote(pr(t, CAE, CAE + 0.5)); suelta = pr(t, CAE - 0.1, CAE + 0.1); vai = t < CAE ? 0.18 * Math.sin(t * 5) : 0; }
  if (t >= T[6] && t < T[7]) vai = 0.3 * Math.sin((t - T[6]) * 3.2);
  if (t >= T[4] && t < T[5]) vai = 0.15 * Math.sin((t - T[4]) * 3);
  return { pts, vai, cae, suelta, bien };
};

const Cadena: React.FC<{ a: V3; b: V3 }> = ({ a, b }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), n = Math.max(2, Math.floor(l / 0.06));
  return <group>{[...Array(n)].map((_, i) => { const u = (i + 0.5) / n; return (
    <mesh key={i} position={[lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]} rotation={[i % 2 ? Math.PI / 2 : 0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
      <torusGeometry args={[0.022, 0.007, 6, 10]} /><meshLambertMaterial color="#8d969e" /></mesh>); })}</group>;
};

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const s = columpio(t);
  const brillaTabla = t >= T[3] && t < T[5];
  const sacaRosca = t >= T[4] && t < T[5] ? 0.04 * pr(t, T[4] + 0.5, T[5] - 0.3) : 0;
  const tuerca = t >= T[9] ? rebote(pr(t, T[9] + 0.3, T[9] + 0.9)) : 0;
  const eslabon = t >= T[10] ? pr(t, T[10] + 0.2, T[10] + 0.6) : 0;
  const z = 0.34; // plano del columpio, justo delante del corte del techo (z = 0.32)
  // asiento: los dos extremos cuelgan de los ganchos; el vaivén mueve todo hacia los lados
  const ox = L * Math.sin(s.vai), oy = CY - L * Math.cos(s.vai);
  const A: V3 = [s.pts[0] + ox, oy, z], B0: V3 = [s.pts[1] + ox, oy, z];
  const B: V3 = s.cae > 0 ? [lerp(B0[0], A[0] + 0.62, s.cae), lerp(B0[1], 0.05, s.cae), z] : B0;
  const ang = Math.atan2(B[1] - A[1], B[0] - A[0]), largo = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const fH = habla(t, 1), nH = habla(t, 0);
  const flo = t < T[3] || (t >= T[4] && t < T[8]);
  const fp: V3 = flo ? [lerp(A[0], B[0], 0.5) - 0.05, lerp(A[1], B[1], 0.5) + 0.03, z + 0.15] : [-1.25, 0.08, 0.6];
  const fCae = t < T[1] ? s.cae * 0.9 : 0;
  const nBrazo = (t >= T[3] && t < T[5]) || (t >= T[8] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  const ganchoMal = (x: number, suelto: number) => <group position={[x, CY - 0.06 - suelto * 1.6 + sacaRosca, z - 0.05]} rotation={[0, 0, suelto * 2]}>
    <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.012, 0.012, 0.12, 8]} /><meshLambertMaterial color="#9aa3ab" /></mesh>
    <mesh position={[0.02, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.03, 0.009, 6, 14, Math.PI * 1.5]} /><meshLambertMaterial color="#9aa3ab" /></mesh></group>;
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} huecos={[[X0, X1]]} />
      {/* piso del porche, pared de la casa, postes */}
      <Caja p={[(X0 + X1) / 2, 0.04, -0.58]} s={[X1 - X0, 0.08, 1.8]} c="#c99a5c" />
      <Caja p={[(X0 + X1) / 2, CY / 2, -1.5]} s={[X1 - X0, CY, 0.08]} c="#f2e3c6" />
      <Caja p={[-0.95, 1.0, -1.44]} s={[0.55, 1.9, 0.03]} c="#7a4a26" sombra={false} />
      <Caja p={[0.55, 1.35, -1.44]} s={[0.6, 0.6, 0.03]} c="#9fd8ff" sombra={false} />
      {[X0 + 0.06, X1 - 0.06].map((x) => <Caja key={x} p={[x, CY / 2, 0.26]} s={[0.12, CY, 0.12]} c="#f4f0e8" />)}
      {/* techo: tablas y vigas cortadas en z = 0 */}
      <Caja p={[(X0 + X1) / 2, CY + 0.015, -0.58]} s={[X1 - X0, 0.03, 1.8]} c={brillaTabla ? "#ff8a8a" : "#e9dcc4"} />
      {JOISTS.map((x) => <Caja key={x} p={[x, CY + 0.18, -0.58]} s={[0.07, 0.3, 1.8]} c={brillaTabla ? "#6fe07a" : "#b98c50"} />)}
      <Caja p={[(X0 + X1) / 2, CY + 0.36, -0.58]} s={[X1 - X0, 0.04, 1.8]} c="#8a6a4a" />
      {/* lo que sostiene el columpio */}
      {!s.bien && <>{ganchoMal(MAL[0], 0)}{ganchoMal(MAL[1], s.suelta)}
        {s.suelta > 0 && <Caja p={[MAL[1] + 0.05 * s.cae, CY - 1.4 * s.cae, z - 0.05]} s={[0.12, 0.02, 0.06]} c="#e9dcc4" />}</>}
      {s.bien && BIEN.map((x) => <group key={x}>
        <mesh position={[x, CY + 0.2, z]}><cylinderGeometry args={[0.014, 0.014, 0.5, 8]} /><meshLambertMaterial color="#5d6a75" /></mesh>
        <mesh position={[x, CY - 0.07, z - 0.05]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.035, 0.011, 8, 16]} /><meshLambertMaterial color="#5d6a75" /></mesh>
        {tuerca > 0 && <group position={[x, CY + 0.42, z]} scale={tuerca}><Caja p={[0, 0, 0]} s={[0.12, 0.012, 0.12]} c="#c9d1d9" /><Caja p={[0, 0.03, 0]} s={[0.06, 0.04, 0.06]} c="#9aa3ab" /></group>}
        {eslabon > 0 && <mesh position={[x + ox * 0.05, CY - 0.17, z - 0.05]} scale={[1, 1.6, 1]}><torusGeometry args={[0.03, 0.008, 6, 14]} /><meshLambertMaterial color="#ffd23f" /></mesh>}
      </group>)}
      {/* cadenas y asiento */}
      <Cadena a={[s.pts[0], CY - 0.1, z]} b={A} />
      {s.suelta < 1 ? <Cadena a={[s.pts[1], CY - 0.1, z]} b={B} /> : <Cadena a={B} b={[B[0] + 0.1, B[1] + 0.5, z]} />}
      <group position={[(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, z]} rotation={[0, 0, ang]}>
        <Caja p={[0, 0, 0]} s={[largo + 0.12, 0.06, 0.4]} c="#ffffff" /><Caja p={[0, 0.2, -0.18]} s={[largo + 0.12, 0.34, 0.05]} c="#ffffff" />
      </group>
      {t >= T[7] && t < T[8] && <Preguntas t={t} a={T[7]} p={[fp[0] + 0.1, fp[1] + 1.0, fp[2]]} />}
      <Flo p={fp} t={t} habla={fH} cae={fCae} giro={0.3} ala={t < T[1] ? 1 : t >= T[11] && t < T[12] ? 0.6 : fH * 0.7} s={flo ? 0.8 : 1} />
      <Norm p={[XN, 0.08 + nSalto, 0.62]} t={t} giro={-0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [tx, ty] = pantalla(t, [MAL[0], CY, 0.34]), [jx, jy] = pantalla(t, [JOISTS[1], CY + 0.18, 0.34]);
  const [nx, ny] = pantalla(t, [BIEN[0], CY + 0.42, 0.34]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="DON'T HANG" abajo="A SWING LIKE THIS" color="#ff4a1a" tamAbajo={84} />
      <Grande s="5 MINUTES!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={120} />
      <Etiqueta s="BOARD ✗" x={tx} y={ty + 110} o={v(T[3] + 0.4, T[4])} col="#ff2a2a" tam={64} />
      <Etiqueta s="JOIST ✓" x={jx} y={jy - 110} o={v(T[3] + 0.9, T[4])} col="#27c24c" tam={64} />
      <Grande s="CEILING BOARDS ≠ STRUCTURE" o={v(T[3] + 0.3, T[4])} col="#fff" borde="#14321f" tam={60} />
      <Grande s="ONLY THE THREADS" o={v(T[4] + 0.4, T[5])} col="#ff2a2a" borde="#fff" tam={96} />
      <Grande s="IT HELD ME!" o={v(T[5] + 0.05, T[6])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="SWINGING = MORE FORCE" o={v(T[6] + 0.3, T[7])} col="#fff" borde="#14321f" tam={74} />
      <Grande s="THE RIGHT WAY?" o={v(T[7] + 0.05, T[8])} col="#ff4f9a" borde="#fff" tam={110} />
      <Grande s="THROUGH THE JOIST" o={v(T[8] + 0.5, T[9])} col="#27c24c" borde="#fff" tam={96} />
      <Grande s="WASHER + NUT" o={v(T[9] + 0.3, T[10])} col="#27c24c" borde="#fff" tam={110} />
      <Etiqueta s="NUT" x={nx + 150} y={ny} o={v(T[9] + 0.9, T[10])} col="#ffd23f" borde="#14321f" tam={64} />
      <Grande s="CLOSED LINKS ✓" o={v(T[10] + 0.3, T[11])} col="#27c24c" borde="#fff" tam={100} />
      <Sello t={t} a={T[11] + 0.5} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="HOOKS" der="BOLTS" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR TREEHOUSE IS KILLING THE TREE" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const SwingVideo: React.FC = () => {
  const t = useCurrentFrame() / SWI_FPS;
  return <Marco t={t} seg={SWI_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} />;
};
