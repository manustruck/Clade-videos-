// «Your raised bed will burst» — capítulo 18 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// Una cama elevada alta y larga: la tierra mojada empuja las paredes y el centro del lado largo se abomba hasta reventar.
// Arreglo: un amarre de lado a lado en el medio (dos si pasa de 8 pies) y postes de esquina atornillados y enterrados.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, azar, rebote, mezcla, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, Tramo, hacerCamara, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const RB_FPS = 30, RB_SEG = duracion(tiempos), RB_CUADROS = Math.round(RB_FPS * RB_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["raised", "bed", "burst", "top", "tall", "boards", "soil", "perfect", "wet", "heavy", "pushes", "wall", "middle", "bows", "thicker", "tie", "threaded", "rod", "walls", "eight", "feet", "two", "ties", "corners", "posts", "screwed", "nailed", "ground", "belt", "team", "follow", "like"];
const L = 2.0, ZF = -0.02, ZB = -0.92, HB = 0.55, N = 10; // largo, pared de adelante y de atrás, alto, tramos de la pared
const XN = -1.5, XF = 1.45;

const C = {
  gancho: { pos: [0, 1.6, 2.9], look: [0, 0.25, -0.45] } as Cam, gancho2: { pos: [0, 1.5, 2.5], look: [0, 0.25, -0.45] } as Cam,
  dos: { pos: [0, 1.5, 5.2], look: [0, 0.6, -0.3] } as Cam, dos2: { pos: [0, 1.45, 4.7], look: [0, 0.6, -0.3] } as Cam,
  flo: { pos: [XF, 0.85, 3.0], look: [XF, 0.7, 0] } as Cam, flo2: { pos: [XF, 0.85, 2.6], look: [XF, 0.72, 0] } as Cam,
  arriba: { pos: [0, 2.6, 1.4], look: [0, 0.3, -0.5] } as Cam, arriba2: { pos: [0, 2.4, 1.2], look: [0, 0.3, -0.5] } as Cam,
  medio: { pos: [0, 0.9, 1.5], look: [0, 0.3, -0.1] } as Cam, medio2: { pos: [0, 0.85, 1.25], look: [0, 0.3, -0.1] } as Cam,
  norm: { pos: [XN, 0.55, 3.0], look: [XN, 0.42, 0] } as Cam, norm2: { pos: [XN, 0.52, 2.7], look: [XN, 0.4, 0] } as Cam,
  esquina: { pos: [-L / 2 + 0.1, 0.2, 1.4], look: [-L / 2, 0.05, 0] } as Cam, esquina2: { pos: [-L / 2 + 0.1, 0.2, 1.15], look: [-L / 2, 0.05, 0] } as Cam,
  equipo: { pos: [0, 1.3, 4.8], look: [0, 1.55, 0] } as Cam, fin: { pos: [0, 1.3, 6.0], look: [0, 1.75, 0] } as Cam,
};
const TRAMOS: Tramo[] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2], [T[3], T[4], C.arriba, C.arriba2], [T[4], T[5], C.medio, C.medio2],
  [T[5], T[6], C.flo, C.flo2], [T[6], T[7], C.norm, C.norm2], [T[7], T[8], C.arriba2, C.arriba], [T[8], T[9], C.arriba, C.arriba2], [T[9], T[10], C.flo2, C.flo],
  [T[10], T[11], C.esquina, C.esquina2], [T[11], T[12], C.flo, C.flo2], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const { camEn, pantalla } = hacerCamara(TRAMOS, (t) => (t >= 0.9 && t < 1.3 ? 0.05 : 0));

/** cuánto se abomba el centro de la pared larga (m) y si reventó */
const bombeo = (t: number) => {
  if (t < T[1]) return { b: 0.06 + 0.2 * pr(t, 0.2, 0.95), revienta: pr(t, 0.95, 1.5) };
  if (t >= T[3] && t < T[4]) return { b: 0.07 * pr(t, T[3] + 0.6, T[4]), revienta: 0 };
  if (t >= T[4] && t < T[6]) return { b: 0.07 + 0.06 * pr(t, T[4], T[4] + 1.5), revienta: 0 };
  if (t >= T[6] && t < T[7]) return { b: 0.13 * (1 - pr(t, T[6] + 1.0, T[6] + 2.0)), revienta: 0 };
  return { b: 0, revienta: 0 };
};

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { b, revienta } = bombeo(t);
  const mojada = t >= T[3] && t < T[6] ? pr(t, T[3] + 0.2, T[3] + 1.2) : t < T[1] ? 1 : 0;
  const amarre = t >= T[6] + 1.0 ? rebote(pr(t, T[6] + 1.0, T[6] + 1.6)) : 0;
  const varilla = t >= T[7] ? pr(t, T[7] + 0.8, T[7] + 1.3) : 0;
  const dos = t >= T[8] ? rebote(pr(t, T[8] + 0.4, T[8] + 1.0)) : 0;
  const entierra = t >= T[10] ? pr(t, T[10] + 1.6, T[10] + 2.6) : 0;
  const tornillos = t >= T[10] ? pr(t, T[10] + 0.4, T[10] + 1.2) : 0;
  const tierra = mezcla("#7a5234", "#3f2814", mojada);
  const fH = habla(t, 1), nH = habla(t, 0);
  const nBrazo = (t >= T[3] && t < T[5]) || (t >= T[6] && t < T[9]) || (t >= T[10] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  const tramo = (i: number, lado: 1 | -1) => {
    const u = (i + 0.5) / N, x = -L / 2 + u * L, off = b * Math.sin(Math.PI * u);
    const roto = lado === 1 && revienta > 0 && i >= 3 && i <= 6;
    const z = (lado === 1 ? ZF : ZB) + lado * off + (roto ? 0.5 * revienta : 0);
    const y = roto ? HB / 2 - (HB / 2 - 0.03) * revienta : HB / 2;
    return <group key={`${lado}${i}`} position={[x, y, z]} rotation={[roto ? 1.45 * revienta : 0, 0, 0]}>
      <Caja p={[0, 0, 0]} s={[L / N + 0.005, HB, 0.05]} c={roto ? "#a8783f" : "#b98c50"} />
      {[0.14, 0.28].map((dy) => <Caja key={dy} p={[0, dy - HB / 2 + 0.06, lado * 0.026]} s={[L / N, 0.006, 0.004]} c="#8a6a3a" sombra={false} recibe={false} />)}
    </group>;
  };
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} huecos={[[-L / 2 - 0.1, L / 2 + 0.1]]} />
      {/* tierra dentro de la cama, plantas encima */}
      <Caja p={[0, (HB - 0.06) / 2, (ZF + ZB) / 2]} s={[L - 0.08, HB - 0.06, ZF - ZB - 0.06 + b]} c={tierra} />
      {[...Array(9)].map((_, i) => { const x = -0.8 + (i % 5) * 0.4 + (i >= 5 ? 0.2 : 0), z = i >= 5 ? -0.7 : -0.25; return <group key={i} position={[x, HB - 0.06, z]}>
        <mesh position={[0, 0.07, 0]}><sphereGeometry args={[0.08, 10, 8]} /><meshLambertMaterial color={i % 2 ? "#3fa637" : "#5cc24a"} /></mesh>
        {i % 3 === 0 && <mesh position={[0.04, 0.12, 0.05]}><sphereGeometry args={[0.03, 8, 6]} /><meshLambertMaterial color="#e8312a" /></mesh>}</group>; })}
      {/* paredes largas en tramos (se abomban) y paredes cortas */}
      {[...Array(N)].map((_, i) => tramo(i, 1))}{[...Array(N)].map((_, i) => tramo(i, -1))}
      {[-L / 2, L / 2].map((x) => <Caja key={x} p={[x, HB / 2, (ZF + ZB) / 2]} s={[0.05, HB, ZF - ZB]} c="#b98c50" />)}
      {/* postes de esquina (se entierran al final) */}
      {[-L / 2, L / 2].map((x) => [ZF, ZB].map((z) => <Caja key={`${x}${z}`} p={[x, (HB - 0.3 * entierra) / 2, z]} s={[0.09, HB + 0.3 * entierra, 0.09]} c="#a8783f" />))}
      {entierra > 0 && [-L / 2, L / 2].map((x) => <Caja key={`e${x}`} p={[x, -0.15 * entierra, 0.012]} s={[0.09, 0.3 * entierra, 0.02]} c="#a8783f" sombra={false} recibe={false} />)}
      {tornillos > 0 && [-L / 2, L / 2].map((x) => [0.15, 0.4].map((y) => <mesh key={`${x}${y}`} position={[x + (x < 0 ? 0.08 : -0.08), y, ZF + 0.03]} scale={tornillos} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 0.02, 8]} /><meshLambertMaterial color="#5d6a75" /></mesh>))}
      {/* tierra que se sale al reventar */}
      {revienta > 0 && [...Array(18)].map((_, i) => <mesh key={i} position={[(azar(i) - 0.5) * 0.8, 0.05 + 0.25 * (1 - revienta) * azar(i + 3), ZF + 0.1 + 0.6 * revienta * azar(i + 5)]}><sphereGeometry args={[0.05 + 0.04 * azar(i + 7), 8, 6]} /><meshLambertMaterial color="#3f2814" /></mesh>)}
      {/* lluvia de la regadera */}
      {t >= T[3] && t < T[4] && [...Array(30)].map((_, i) => { const u = (t * 1.5 + azar(i)) % 1; return <mesh key={i} position={[(azar(i + 2) - 0.5) * 1.8, 1.4 - 1.0 * u, -0.9 + azar(i + 6) * 0.85]}><cylinderGeometry args={[0.006, 0.006, 0.08, 4]} /><meshBasicMaterial color="#4fb3ff" /></mesh>; })}
      {/* amarres de lado a lado */}
      {amarre > 0 && dos < 1 && <Caja p={[0, HB - 0.05 + 0.4 * (1 - amarre), (ZF + ZB) / 2]} s={[0.07, 0.04, ZF - ZB + 0.06]} c="#3fbf5a" />}
      {dos > 0 && [-0.45, 0.45].map((x) => <Caja key={x} p={[x, HB - 0.05 + 0.4 * (1 - dos), (ZF + ZB) / 2]} s={[0.07, 0.04, ZF - ZB + 0.06]} c="#3fbf5a" />)}
      {varilla > 0 && <group>{[ZF + 0.05, ZB - 0.05].map((z) => <mesh key={z} position={[0.0, HB - 0.2, z]} rotation={[Math.PI / 2, 0, 0]} scale={varilla}><cylinderGeometry args={[0.04, 0.04, 0.012, 14]} /><meshLambertMaterial color="#c9d1d9" /></mesh>)}
        <mesh position={[0, HB - 0.2, (ZF + ZB) / 2]} rotation={[Math.PI / 2, 0, 0]} scale={[1, varilla, 1]}><cylinderGeometry args={[0.01, 0.01, ZF - ZB + 0.12, 8]} /><meshLambertMaterial color="#8d969e" /></mesh></group>}
      {t >= T[5] && t < T[6] && <Preguntas t={t} a={T[5]} p={[XF + 0.1, 1.2, 0.4]} />}
      <Flo p={[XF, 0, 0.45]} t={t} habla={fH} giro={-0.4} ala={t < T[1] ? 1 : t >= T[9] && t < T[10] ? 0.9 : t >= T[11] && t < T[12] ? 0.5 : fH * 0.7} />
      <Norm p={[XN, nSalto, 0.5]} t={t} giro={0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [cx, cy] = pantalla(t, [0, HB / 2, (ZF + ZB) / 2]);
  const [mx, my] = pantalla(t, [0, HB / 2, ZF + 0.1]);
  const [px, py] = pantalla(t, [-L / 2, -0.15, 0.02]);
  const empuje = v(T[3] + 0.8, T[5]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR RAISED BED" abajo="WILL BURST" color="#ff4a1a" tamAbajo={120} />
      <Grande s="FILLED TO THE TOP!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={104} />
      <Grande s="WET SOIL = HEAVY" o={v(T[3] + 0.3, T[4])} col="#fff" borde="#14321f" tam={100} />
      {empuje > 0 && <g opacity={empuje}>
        {[-1, 1].map((d) => <g key={d} transform={`translate(${cx + d * 60} ${cy}) rotate(${d > 0 ? 0 : 180})`}><path d="M0 -18 h90 v-24 l60 42 l-60 42 v-24 h-90z" fill="#ff2a2a" stroke="#fff" strokeWidth={6} /></g>)}
        <g transform={`translate(${mx} ${my + 30}) rotate(90)`}><path d="M0 -18 h90 v-24 l60 42 l-60 42 v-24 h-90z" fill="#ff2a2a" stroke="#fff" strokeWidth={6} /></g></g>}
      <Grande s="THE MIDDLE BOWS FIRST" o={v(T[4] + 0.3, T[5])} col="#ff2a2a" borde="#fff" tam={76} />
      <Grande s="THICKER BOARDS?" o={v(T[5] + 0.1, T[6])} col="#ff4f9a" borde="#fff" tam={110} />
      <Grande s="TIE ACROSS THE MIDDLE" o={v(T[6] + 1.0, T[7])} col="#27c24c" borde="#fff" tam={80} />
      <Grande s="BOARD OR THREADED ROD" o={v(T[7] + 0.3, T[8])} col="#27c24c" borde="#fff" tam={76} />
      <Grande s="8 FT+ = 2 TIES" o={v(T[8] + 0.3, T[9])} col="#27c24c" borde="#fff" tam={110} />
      <Grande s="THE CORNERS MOVE!" o={v(T[9] + 0.05, T[10])} col="#ff4f9a" borde="#fff" tam={100} />
      <Grande s="SCREWED, NOT NAILED" o={v(T[10] + 0.4, T[10] + 1.7)} col="#27c24c" borde="#fff" tam={86} />
      <Grande s="POSTS IN THE GROUND" o={v(T[10] + 1.7, T[11])} col="#27c24c" borde="#fff" tam={86} />
      <Etiqueta s="SUNK IN" x={px + 170} y={py + 20} o={v(T[10] + 2.2, T[11])} col="#ffd23f" borde="#14321f" tam={64} />
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="THICK BOARDS" der="CROSS TIE" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR DRAIN IS RUNNING UPHILL" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const RaisedBedVideo: React.FC = () => {
  const t = useCurrentFrame() / RB_FPS;
  return <Marco t={t} seg={RB_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} />;
};
