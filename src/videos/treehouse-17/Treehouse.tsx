// «Your treehouse is killing the tree» — capítulo 17 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// Un árbol con su casita: cientos de clavos (cada uno una herida que se pudre) y una cuerda que estrangula el tronco al
// crecer. Arreglo: pocos pernos grandes para casitas de árbol, nada que rodee el tronco y espacio para crecer y mecerse.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, azar, rebote, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, Tramo, hacerCamara, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const TRE17_FPS = 30, TRE17_SEG = duracion(tiempos), TRE17_CUADROS = Math.round(TRE17_FPS * TRE17_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["treehouse", "killing", "tree", "nails", "rope", "trunk", "wound", "holes", "dead", "wood", "grows", "strangles", "bark", "hurting", "big", "bolt", "dozen", "bolts", "heals", "wrap", "grow", "sway", "diet", "team", "follow", "like"];
const TX = -0.15, TR = 0.22, PY = 1.55, CUERDA = 1.12; // tronco, radio, piso de la casita, altura de la cuerda
const XN = 1.0, XF = -1.15;
const CLAVOS = [...Array(34)].map((_, i) => ({ y: 0.45 + azar(i) * 0.95 + (azar(i + 5) > 0.6 ? 1.25 : 0), a: (azar(i + 9) - 0.5) * 2.2 }));

const C = {
  gancho: { pos: [TX, 1.6, 5.4], look: [TX, 1.45, 0] } as Cam, gancho2: { pos: [TX, 1.5, 4.8], look: [TX, 1.35, 0] } as Cam,
  dos: { pos: [-0.05, 1.7, 7.4], look: [-0.05, 1.5, 0] } as Cam, dos2: { pos: [-0.05, 1.65, 6.8], look: [-0.05, 1.45, 0] } as Cam,
  flo: { pos: [XF, 0.85, 2.8], look: [XF, 0.7, 0] } as Cam, flo2: { pos: [XF, 0.85, 2.4], look: [XF, 0.72, 0] } as Cam,
  clavos: { pos: [TX, 1.0, 1.9], look: [TX, 0.95, 0] } as Cam, clavos2: { pos: [TX, 0.98, 1.6], look: [TX, 0.95, 0] } as Cam,
  cuerda: { pos: [TX, CUERDA, 1.5], look: [TX, CUERDA, 0] } as Cam, cuerda2: { pos: [TX, CUERDA, 1.25], look: [TX, CUERDA, 0] } as Cam,
  perno: { pos: [TX + 0.1, PY - 0.1, 1.7], look: [TX + 0.1, PY - 0.12, 0] } as Cam, perno2: { pos: [TX + 0.1, PY - 0.1, 1.45], look: [TX + 0.1, PY - 0.12, 0] } as Cam,
  norm: { pos: [XN, 0.55, 3.0], look: [XN, 0.42, 0] } as Cam, norm2: { pos: [XN, 0.52, 2.7], look: [XN, 0.4, 0] } as Cam,
  equipo: { pos: [-0.05, 1.6, 5.4], look: [-0.05, 1.85, 0] } as Cam, fin: { pos: [-0.05, 1.6, 6.4], look: [-0.05, 2.05, 0] } as Cam,
};
const TRAMOS: Tramo[] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2], [T[3], T[4], C.clavos, C.clavos2], [T[4], T[5], C.cuerda, C.cuerda2],
  [T[5], T[6], C.flo, C.flo2], [T[6], T[7], C.norm, C.norm2], [T[7], T[8], C.perno, C.perno2], [T[8], T[10], C.cuerda2, C.cuerda], [T[10], T[11], C.dos2, C.dos],
  [T[11], T[12], C.flo, C.flo2], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const { camEn, pantalla } = hacerCamara(TRAMOS, (t) => (t < 0.4 ? 0.04 : 0));

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const arreglo = t >= T[7] + 0.3;
  const sinClavos = arreglo ? pr(t, T[7] + 0.3, T[7] + 0.9) : 0;
  const pernos = arreglo ? rebote(pr(t, T[7] + 0.6, T[7] + 1.3)) : 0;
  const heridas = t < T[1] ? 1 : t >= T[3] ? pr(t, T[3] + 0.4, T[3] + 2.5) : 0.3;
  const sinCuerda = t >= T[9] ? pr(t, T[9] + 0.2, T[9] + 0.9) : 0;
  const crece = t >= T[4] && t < T[9] ? pr(t, T[4] + 0.4, T[4] + 2.6) : t < T[1] ? 1 : 0;
  const triste = t < T[1] || (t >= T[3] && t < T[7]);
  const vaiven = t >= T[10] && t < T[11] ? 0.035 * Math.sin((t - T[10]) * 3.2) : 0.006 * Math.sin(t * 1.3);
  const fH = habla(t, 1), nH = habla(t, 0);
  const nBrazo = (t >= T[3] && t < T[5]) || (t >= T[6] && t < T[8]) || (t >= T[9] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  const rArriba = TR + 0.05 * crece; // arriba de la cuerda el tronco engorda; en la cuerda queda ahorcado
  const copa = triste ? "#7aa63a" : "#3aa84f";
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} />
      <group position={[TX, 0, 0]} rotation={[0, 0, vaiven]}>
        {/* tronco: abajo, la zona de la cuerda y arriba */}
        <mesh position={[0, CUERDA / 2, 0]}><cylinderGeometry args={[TR + 0.02 * crece, TR + 0.06, CUERDA, 20]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        <mesh position={[0, CUERDA, 0]}><cylinderGeometry args={[TR - 0.02 * crece * (1 - sinCuerda), TR - 0.02 * crece * (1 - sinCuerda), 0.08, 20]} /><meshLambertMaterial color="#6b3d1e" /></mesh>
        <mesh position={[0, CUERDA + 1.45, 0]}><cylinderGeometry args={[TR * 0.8, rArriba, 2.85, 20]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        {crece > 0 && sinCuerda < 1 && <mesh position={[0, CUERDA + 0.08, 0]}><cylinderGeometry args={[rArriba + 0.015, TR, 0.08, 20]} /><meshLambertMaterial color="#8a5a33" /></mesh>}
        {[[-0.6, 2.9, 0.75], [0.5, 3.0, 0.8], [0, 3.5, 0.9], [-0.25, 2.6, 0.6], [0.35, 2.55, 0.6]].map(([x, y, r], i) => <mesh key={i} position={[x, y, -0.25]}><sphereGeometry args={[r, 18, 14]} /><meshLambertMaterial color={i % 2 ? copa : triste ? "#8aa63a" : "#2f9a4a"} /></mesh>)}
        {/* hojas que caen cuando el árbol sufre */}
        {triste && [...Array(8)].map((_, i) => { const u = ((t * 0.35 + azar(i)) % 1); return <mesh key={i} position={[(azar(i + 3) - 0.5) * 1.6 + 0.15 * Math.sin(t * 2 + i), 2.6 - 2.5 * u, 0.3 + azar(i + 4) * 0.4]} rotation={[t * 2 + i, t, 0]}><boxGeometry args={[0.07, 0.01, 0.05]} /><meshLambertMaterial color="#b9a03a" /></mesh>; })}
        {/* heridas y clavos */}
        {CLAVOS.map((c, i) => { const x = Math.sin(c.a) * (TR + 0.003), z = Math.cos(c.a) * (TR + 0.003); return <group key={i}>
          {heridas > 0 && <mesh position={[x, c.y, z]} rotation={[0, c.a, 0]}><circleGeometry args={[0.022 + 0.03 * heridas * azar(i + 2), 10]} /><meshBasicMaterial color="#2e1a0c" /></mesh>}
          {sinClavos < 1 && <mesh position={[Math.sin(c.a) * (TR + 0.03), c.y, Math.cos(c.a) * (TR + 0.03)]} rotation={[Math.PI / 2, 0, -c.a]} scale={1 - sinClavos}><cylinderGeometry args={[0.008, 0.008, 0.07, 6]} /><meshLambertMaterial color="#b9c1c9" /></mesh>}
        </group>; })}
        {/* la cuerda */}
        {sinCuerda < 1 && <mesh position={[0, CUERDA + 0.6 * sinCuerda, 0.0]} rotation={[Math.PI / 2, 0, 0]} scale={1 + 0.5 * sinCuerda}><torusGeometry args={[TR + 0.012, 0.022, 8, 28]} /><meshLambertMaterial color="#d9c39a" /></mesh>}
        {/* pernos grandes para casitas de árbol */}
        {pernos > 0 && [-0.1, 0.1].map((dx) => <group key={dx}>
          <mesh position={[dx, PY - 0.12, TR + 0.06 * pernos]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.16, 12]} /><meshLambertMaterial color="#c9d1d9" /></mesh>
          <Caja p={[dx, PY - 0.12, TR + 0.13]} s={[0.12, 0.12, 0.02]} c="#8d969e" />
        </group>)}
      </group>
      {/* la casita: piso, paredes y techo (se apoya en los pernos) */}
      <group position={[TX, PY, 0]}>
        <Caja p={[0, 0, -0.1]} s={[1.6, 0.08, 1.1]} c="#b98c50" />
        {[-0.75, 0.75].map((x) => <Caja key={x} p={[x, -0.75, 0.3]} s={[0.08, 1.5, 0.08]} c="#a8783f" />)}
        <Caja p={[-0.45, 0.45, -0.55]} s={[0.7, 0.85, 0.06]} c="#d98a4a" /><Caja p={[0.45, 0.45, -0.55]} s={[0.7, 0.85, 0.06]} c="#d98a4a" />
        <Caja p={[0, 0.95, -0.3]} s={[1.75, 0.08, 0.7]} c="#c0392b" />
        {[-0.7, -0.35, 0.35, 0.7].map((x) => <Caja key={x} p={[x, 0.2, 0.4]} s={[0.05, 0.34, 0.05]} c="#a8783f" />)}
        <Caja p={[0, 0.38, 0.4]} s={[1.55, 0.05, 0.05]} c="#a8783f" />
      </group>
      {t >= T[5] && t < T[6] && <Preguntas t={t} a={T[5]} p={[XF + 0.1, 1.2, 0.4]} />}
      {t >= T[8] && t < T[9] && <Preguntas t={t} a={T[8]} p={[XF + 0.1, 1.2, 0.4]} />}
      <Flo p={[XF, 0, 0.5]} t={t} habla={fH} giro={0.4} ala={t < T[1] ? 1 : t >= T[11] && t < T[12] ? 0.5 : fH * 0.7} />
      <Norm p={[XN, nSalto, 0.55]} t={t} giro={-0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [rx, ry] = pantalla(t, [TX, CUERDA, TR + 0.05]);
  const [bx, by] = pantalla(t, [TX + 0.1, PY - 0.12, TR + 0.1]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR TREEHOUSE" abajo="IS KILLING IT" color="#ff4a1a" tamAbajo={116} />
      <Grande s="200 NAILS!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={130} />
      <Grande s="EVERY NAIL = A WOUND" o={v(T[3] + 0.3, T[4])} col="#ff2a2a" borde="#fff" tam={80} />
      <Grande s="THE ROPE STRANGLES" o={v(T[4] + 0.6, T[5])} col="#ff2a2a" borde="#fff" tam={84} />
      {v(T[4] + 0.6, T[5]) > 0 && <g opacity={v(T[4] + 0.6, T[5])}><circle cx={rx} cy={ry} r={90 + 10 * Math.sin(t * 8)} fill="none" stroke="#ff2a2a" strokeWidth={12} /></g>}
      <Grande s="I'M HURTING IT?!" o={v(T[5] + 0.05, T[6])} col="#ff4f9a" borde="#fff" tam={110} />
      <Grande s="1 BIG BOLT > 12 NAILS" o={v(T[6] + 0.2, T[7])} col="#27c24c" borde="#fff" tam={86} />
      <Grande s="TREEHOUSE BOLTS ✓" o={v(T[7] + 0.6, T[8])} col="#27c24c" borde="#fff" tam={96} />
      <Etiqueta s="FEW + BIG" x={bx + 210} y={by - 60} o={v(T[7] + 1.2, T[8])} col="#ffd23f" borde="#14321f" tam={64} />
      <Grande s="AND THE ROPE?" o={v(T[8] + 0.02, T[9])} col="#ff4f9a" borde="#fff" tam={110} />
      <Grande s="NOTHING AROUND THE TRUNK" o={v(T[9] + 0.3, T[10])} col="#27c24c" borde="#fff" tam={70} />
      <Grande s="ROOM TO GROW + SWAY" o={v(T[10] + 0.2, T[11])} col="#27c24c" borde="#fff" tam={86} />
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="NAILS" der="BIG BOLTS" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR RAISED BED WILL BURST" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const TreehouseVideo: React.FC = () => {
  const t = useCurrentFrame() / TRE17_FPS;
  return <Marco t={t} seg={TRE17_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} />;
};
