// «Your new fence post is already leaning» — capítulo 21 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// Corte del suelo: un poste enterrado solo 1 pie; el viento empuja la cerca como una vela y el hielo lo levanta cada
// invierno. Bien hecho: ~1/3 del poste enterrado, bajo la línea de helada, relleno apisonado por capas. Usa la cámara viva.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, azar, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, TramoVivo, hacerCamaraViva, golpesDe, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const PL_FPS = 30, PL_SEG = duracion(tiempos), PL_CUADROS = Math.round(PL_FPS * PL_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["fence", "post", "leaning", "minutes", "hole", "foot", "deep", "plenty", "shallow", "wind", "sail", "tips", "freezes", "frozen", "swells", "lifts", "winter", "third", "eight", "three", "feet", "frost", "line", "gravel", "tamp", "layer", "hard", "arms", "team", "follow", "like"];
const PX = 0.0, PIE = 0.3, LARGO = 2.4, HEL = -0.75; // poste, 1 pie, largo del poste (8 ft), línea de helada
const XN = 1.25, XF = -1.25;

const C = {
  gancho: { pos: [0.4, 0.9, 3.4], look: [0.15, 0.7, 0] } as Cam, gancho2: { pos: [0.6, 0.7, 2.7], look: [0.2, 0.55, 0] } as Cam,
  dos: { pos: [0.0, 0.8, 6.4], look: [0.0, 0.45, 0] } as Cam, dos2: { pos: [0.0, 0.75, 5.8], look: [0.0, 0.4, 0] } as Cam,
  flo: { pos: [XF, 0.9, 2.8], look: [XF, 0.72, 0] } as Cam, flo2: { pos: [XF, 0.88, 2.35], look: [XF, 0.72, 0] } as Cam,
  hoyo: { pos: [0.1, -0.05, 2.4], look: [0.0, -0.2, 0] } as Cam, hoyo2: { pos: [0.2, -0.1, 2.0], look: [0.0, -0.22, 0] } as Cam,
  viento: { pos: [1.6, 1.3, 4.6], look: [0.1, 0.7, 0] } as Cam, viento2: { pos: [1.2, 1.1, 3.9], look: [0.1, 0.6, 0] } as Cam,
  hielo: { pos: [0.0, -0.3, 2.6], look: [0.0, -0.4, 0] } as Cam, hielo2: { pos: [0.0, -0.35, 2.15], look: [0.0, -0.42, 0] } as Cam,
  norm: { pos: [XN, 0.55, 3.0], look: [XN, 0.42, 0] } as Cam, norm2: { pos: [XN, 0.52, 2.55], look: [XN, 0.4, 0] } as Cam,
  profundo: { pos: [0.3, -0.1, 4.6], look: [0.0, -0.1, 0] } as Cam, profundo2: { pos: [0.4, -0.25, 3.9], look: [0.0, -0.25, 0] } as Cam,
  pison: { pos: [0.2, -0.2, 2.3], look: [0.0, -0.35, 0] } as Cam, pison2: { pos: [0.15, -0.25, 1.95], look: [0.0, -0.38, 0] } as Cam,
  equipo: { pos: [0.0, 1.2, 5.0], look: [0.0, 1.45, 0] } as Cam, fin: { pos: [0.0, 1.2, 6.2], look: [0.0, 1.65, 0] } as Cam,
};
const TRAMOS: TramoVivo[] = [
  [0, T[1], C.gancho, C.gancho2, { ease: "expo", dolly: 0.3, roll: -0.08 }], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2, { orbita: 0.25 }],
  [T[3], T[4], C.viento, C.viento2, { orbita: -0.2, roll: 0.04 }], [T[4], T[5], C.hielo, C.hielo2, { ease: "expo" }], [T[5], T[6], C.flo2, C.flo, { orbita: -0.25 }],
  [T[6], T[7], C.norm, C.norm2, { ease: "expo" }], [T[7], T[8], C.profundo, C.profundo2, { orbita: 0.2 }], [T[8], T[9], C.profundo2, C.profundo, { orbita: -0.2 }], [T[9], T[10], C.flo, C.flo2, { orbita: 0.2 }],
  [T[10], T[11], C.pison, C.pison2, { orbita: 0.25 }], [T[11], T[12], C.flo2, C.flo, { roll: 0.05 }], [T[12], T[13], C.equipo, C.equipo, { orbita: 0.2 }], [T[13], 99, C.fin, C.fin, { orbita: 0.15 }],
];
const pisa = (t: number) => (t >= T[10] ? Math.abs(Math.sin((t - T[10]) * 9)) : 0);
const { camEn, pantalla, desenfoque } = hacerCamaraViva(TRAMOS, { sacude: (t) => (t < 0.5 ? 0.04 : 0) + (t >= T[10] && t < T[11] && pisa(t) < 0.15 ? 0.012 : 0), golpes: golpesDe(PAL, ["leaning", "shallow", "tips", "lifts", "third", "three", "frost", "hard"]) });

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const bien = t >= T[6] + 0.3;
  const prof = bien ? lerp(PIE, LARGO / 3, pr(t, T[6] + 0.3, T[7] + 1.2)) : PIE;
  const viento = t < T[1] || (t >= T[3] && t < T[4]);
  const incl = bien ? 0.02 * (1 - pr(t, T[6] + 0.3, T[6] + 1.0)) : t < T[1] ? 0.32 * pr(t, 0.25, 1.1) : t >= T[3] && t < T[4] ? 0.06 + 0.12 * pr(t, T[3] + 0.4, T[4] - 0.3) + 0.03 * Math.sin(t * 7) : t >= T[4] ? 0.18 : 0.04;
  const hielo = !bien && t >= T[4] ? pr(t, T[4] + 0.3, T[4] + 1.6) : 0;
  const sube = !bien && t >= T[4] ? 0.06 * (0.5 + 0.5 * Math.sin((t - T[4]) * 2.4)) * hielo : 0;
  const capas = bien && t >= T[10] ? Math.floor(pr(t, T[10] + 0.2, T[11] - 0.2) * 5) : bien ? 5 : 0;
  const linea = t >= T[8] ? pr(t, T[8] + 0.2, T[8] + 0.8) : 0;
  const fH = habla(t, 1), nH = habla(t, 0);
  const nBrazo = (t >= T[3] && t < T[5]) || (t >= T[6] && t < T[9]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  const pb = -prof + sube; // pie del poste
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} />
      {/* hoyo (cortado en z = 0) con relleno */}
      <Caja p={[PX, -prof / 2, 0.006]} s={[0.36, prof, 0.01]} c={bien ? "#a7a196" : "#9a6a40"} sombra={false} recibe={false} />
      {bien && [...Array(5)].map((_, i) => i < capas && <Caja key={i} p={[PX, -prof + (i + 0.5) * prof / 5, 0.012]} s={[0.36, 0.006, 0.006]} c="#6f6a60" sombra={false} recibe={false} />)}
      {bien && [...Array(30)].map((_, i) => <mesh key={i} position={[PX + (azar(i) - 0.5) * 0.32, -azar(i + 3) * prof, 0.016]}><sphereGeometry args={[0.012 + 0.008 * azar(i + 4), 6, 5]} /><meshLambertMaterial color={i % 2 ? "#8f897c" : "#d6d0c2"} /></mesh>)}
      {/* línea de helada */}
      {(hielo > 0 || linea > 0) && <group>
        {[...Array(14)].map((_, i) => <Caja key={i} p={[-1.3 + i * 0.2, HEL, 0.02]} s={[0.12, 0.012, 0.004]} c="#7fd3ff" sombra={false} recibe={false} />)}
        {hielo > 0 && [...Array(40)].map((_, i) => <mesh key={`h${i}`} position={[(azar(i) - 0.5) * 2.6, -0.05 - azar(i + 7) * (0.6 * hielo), 0.02]} scale={hielo}><octahedronGeometry args={[0.02 + 0.015 * azar(i + 9), 0]} /><meshBasicMaterial color="#bfefff" /></mesh>)}
      </group>}
      {/* poste y tramo de cerca, que giran desde la base */}
      <group position={[PX, pb, 0.0]} rotation={[0, 0, -incl]}>
        <Caja p={[0, LARGO * 0.75 / 2 + prof / 2 - PIE / 2, 0]} s={[0.1, LARGO * 0.62 + prof, 0.1]} c="#b98c50" />
        <group position={[-0.62, prof + 0.15, -0.05]}>
          {[0.3, 1.1].map((y) => <Caja key={y} p={[0, y, 0]} s={[1.2, 0.07, 0.05]} c="#a8783f" />)}
          {[...Array(8)].map((_, i) => <Caja key={i} p={[-0.52 + i * 0.15, 0.7, 0.04]} s={[0.12, 1.35, 0.03]} c="#d9b577" />)}
        </group>
      </group>
      {/* el otro poste (ya firme) a la izquierda */}
      <Caja p={[PX - 1.24, 0.75, -0.05]} s={[0.1, 1.5, 0.1]} c="#b98c50" />
      {/* viento */}
      {viento && [...Array(9)].map((_, i) => { const u = ((t * 1.3 + i / 9) % 1); return <mesh key={i} position={[-2.2 + 4.0 * u, 0.4 + i * 0.13, 0.4]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.008, 0.008, 0.45, 4]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.8 * Math.sin(Math.PI * u)} /></mesh>; })}
      {/* pisón que apisona las capas */}
      {t >= T[10] && t < T[11] + 0.2 && <group position={[PX + 0.13, 0.2 + 0.18 * pisa(t), 0.15]}>
        <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.015, 0.015, 0.7, 8]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        <Caja p={[0, 0, 0]} s={[0.1, 0.03, 0.1]} c="#5d6a75" />
      </group>}
      {(t >= T[5] && t < T[6]) || (t >= T[9] && t < T[10]) ? <Preguntas t={t} a={t >= T[9] ? T[9] : T[5]} p={[XF + 0.1, 1.2, 0.5]} /> : null}
      <Flo p={[XF, 0, 0.5]} t={t} habla={fH} giro={0.4} ala={t < T[1] ? 1 : t >= T[11] && t < T[12] ? 0.8 : fH * 0.7} />
      <Norm p={[XN, nSalto, 0.55]} t={t} giro={-0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [hx, hy] = pantalla(t, [PX + 0.25, -PIE / 2, 0.05]);
  const [lx, ly] = pantalla(t, [0.9, HEL, 0.05]);
  const [dx, dy] = pantalla(t, [PX + 0.25, -LARGO / 6, 0.05]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR NEW POST" abajo="IS LEANING" color="#ff4a1a" tamAbajo={120} />
      <Grande s="1 FOOT IS PLENTY!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={104} />
      <Grande s="THE FENCE = A SAIL" o={v(T[3] + 0.3, T[4])} col="#fff" borde="#14321f" tam={96} />
      <Etiqueta s="1 FT" x={hx + 90} y={hy} o={v(T[3] + 0.5, T[4])} col="#ff2a2a" tam={64} />
      <Grande s="FROST HEAVE" o={v(T[4] + 0.5, T[5])} col="#7fd3ff" borde="#14321f" tam={130} />
      <Grande s="HOW DEEP?" o={v(T[5] + 0.05, T[6])} col="#ff4f9a" borde="#fff" tam={130} />
      <Grande s="BURY ~1/3 OF THE POST" o={v(T[6] + 0.3, T[7])} col="#27c24c" borde="#fff" tam={90} />
      <Grande s="8 FT POST ≈ 3 FT DEEP" o={v(T[7] + 0.3, T[8])} col="#27c24c" borde="#fff" tam={90} />
      <Etiqueta s="≈ 3 FT" x={dx + 100} y={dy} o={v(T[7] + 0.9, T[9])} col="#ffd23f" borde="#14321f" tam={64} />
      <Grande s="BELOW THE FROST LINE" o={v(T[8] + 0.3, T[9])} col="#27c24c" borde="#fff" tam={84} />
      <Etiqueta s="FROST LINE" x={lx} y={ly - 50} o={v(T[8] + 0.7, T[9])} col="#7fd3ff" borde="#14321f" tam={56} />
      <Grande s="PACK IT WITH WHAT?" o={v(T[9] + 0.05, T[10])} col="#ff4f9a" borde="#fff" tam={96} />
      <Grande s="TAMP EVERY LAYER" o={v(T[10] + 0.3, T[11])} col="#27c24c" borde="#fff" tam={100} />
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="1 FOOT" der="1/3 DEEP" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR DECK BOARDS WILL CUP" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const PostLeanVideo: React.FC = () => {
  const t = useCurrentFrame() / PL_FPS;
  return <Marco t={t} seg={PL_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} blur={desenfoque(t)} />;
};
