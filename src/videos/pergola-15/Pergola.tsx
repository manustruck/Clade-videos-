// «Your pergola will wobble» — capítulo 15 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// Una pérgola de 4 postes: sin riostras se deforma (el cuadrado se vuelve rombo, «racking»); con riostras a 45° en
// los dos sentidos y los postes anclados queda firme.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, rebote, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, Tramo, hacerCamara, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const PER_FPS = 30, PER_SEG = duracion(tiempos), PER_CUADROS = Math.round(PER_FPS * PER_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["pergola", "wobble", "jelly", "solid", "posts", "sideways", "diamond", "racking", "wind", "bigger", "triangles", "forty", "five", "knee", "brace", "both", "direction", "anchor", "ground", "bolted", "math", "team", "follow", "like"];
const PX = [-0.85, 0.55], PZ = [0.05, -1.3], PH = 1.9, LADO = 0.12, BR = 0.45; // postes, alto, riostra
const XF = -1.25, XN = 0.95;

const C = {
  gancho: { pos: [-0.2, 1.35, 6.4], look: [-0.2, 1.1, 0] } as Cam, gancho2: { pos: [-0.2, 1.3, 5.7], look: [-0.2, 1.05, 0] } as Cam,
  dos: { pos: [-0.15, 1.45, 7.6], look: [-0.15, 1.2, 0] } as Cam, dos2: { pos: [-0.15, 1.4, 7.0], look: [-0.15, 1.15, 0] } as Cam,
  flo: { pos: [XF, 0.85, 2.7], look: [XF, 0.7, 0] } as Cam, flo2: { pos: [XF, 0.85, 2.3], look: [XF, 0.72, 0] } as Cam,
  norm: { pos: [XN, 0.55, 3.0], look: [XN, 0.42, 0] } as Cam, norm2: { pos: [XN, 0.52, 2.7], look: [XN, 0.4, 0] } as Cam,
  frente: { pos: [-0.15, 1.3, 6.6], look: [-0.15, 1.1, 0] } as Cam,
  esquina: { pos: [PX[0] + 0.3, PH - 0.15, 2.0], look: [PX[0] + 0.3, PH - 0.2, 0] } as Cam, esquina2: { pos: [PX[0] + 0.3, PH - 0.15, 1.7], look: [PX[0] + 0.3, PH - 0.2, 0] } as Cam,
  lado: { pos: [3.6, 1.7, 0.6], look: [-0.15, 1.15, -0.6] } as Cam, lado2: { pos: [3.2, 1.6, -0.2], look: [-0.15, 1.15, -0.6] } as Cam,
  base: { pos: [PX[0], 0.05, 2.4], look: [PX[0], -0.3, 0] } as Cam, base2: { pos: [PX[0], 0.05, 2.0], look: [PX[0], -0.3, 0] } as Cam,
  equipo: { pos: [-0.15, 1.3, 5.0], look: [-0.15, 1.55, 0] } as Cam, fin: { pos: [-0.15, 1.3, 6.2], look: [-0.15, 1.75, 0] } as Cam,
};
const TRAMOS: Tramo[] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2], [T[3], T[4], C.frente, C.dos2], [T[4], T[5], C.dos2, C.frente],
  [T[5], T[6], C.flo, C.flo2], [T[6], T[7], C.norm, C.norm2], [T[7], T[8], C.esquina, C.esquina2], [T[8], T[9], C.lado, C.lado2], [T[9], T[10], C.flo2, C.flo],
  [T[10], T[11], C.base, C.base2], [T[11], T[12], C.flo, C.flo2], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const { camEn, pantalla } = hacerCamara(TRAMOS, (t) => (t < 0.4 ? 0.04 : 0) + (t >= T[3] + 0.3 && t < T[3] + 0.6 ? 0.03 : 0));

/** inclinación (rad) de la pérgola: positiva = la parte de arriba se va a la derecha */
const racking = (t: number) => {
  if (t < T[1]) return 0.15 * Math.sin(t * 8) * (0.6 + 0.4 * pr(t, 0, 0.5));
  if (t >= T[3] && t < T[4]) return 0.2 * pr(t, T[3] + 0.3, T[3] + 1.1) * (1 - pr(t, T[4] - 0.4, T[4]));
  if (t >= T[4] && t < T[5]) return 0.11 * Math.sin((t - T[4]) * 6.5);
  if (t >= T[8] && t < T[9]) return 0.008 * Math.sin((t - T[8]) * 20);   // con riostras apenas vibra
  return 0;
};

const Riostra: React.FC<{ x: number; z: number; dir: 1 | -1; eje: "x" | "z"; e: number }> = ({ x, z, dir, eje, e }) => e <= 0 ? null : (
  <group position={[x + (eje === "x" ? dir * BR / 2 : 0), PH - BR / 2, z + (eje === "z" ? dir * BR / 2 : 0)]} scale={e}>
    <group rotation={eje === "x" ? [0, 0, -dir * Math.PI / 4] : [dir * Math.PI / 4, 0, 0]}><Caja p={[0, 0, 0]} s={eje === "x" ? [0.07, BR * 1.414 + 0.05, 0.07] : [0.07, BR * 1.414 + 0.05, 0.07]} c="#3fbf5a" /></group>
  </group>
);

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const th = racking(t), dx = PH * Math.sin(th), dy = PH * (Math.cos(th) - 1);
  const frente = t >= T[7] ? rebote(pr(t, T[7] + 0.3, T[7] + 0.9)) : 0;
  const lado = t >= T[8] ? rebote(pr(t, T[8] + 0.3, T[8] + 0.9)) : 0;
  const zapata = t >= T[10] ? pr(t, T[10] + 0.3, T[10] + 1.0) : 0;
  const fH = habla(t, 1), nH = habla(t, 0);
  const empuja = (t >= T[3] && t < T[4]) || t < T[1];
  const fx = empuja ? PX[0] - 0.36 + 0.05 * Math.sin(t * 9) : XF;
  const fAla = empuja ? 1 : t >= T[11] && t < T[12] ? 0.6 : fH * 0.7;
  const nBrazo = (t >= T[6] && t < T[9]) || (t >= T[10] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  const madera = "#b98c50", viga = "#a8783f";
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} huecos={[[PX[0] - 0.2, PX[1] + 0.2]]} />
      {/* piso de pavimento bajo la pérgola */}
      <Caja p={[(PX[0] + PX[1]) / 2, 0.012, -0.62]} s={[1.9, 0.02, 1.9]} c="#d6c9b0" sombra={false} />
      {/* zapatas de concreto (cortadas en z = 0) */}
      {zapata > 0 && PX.map((x) => <Caja key={x} p={[x, -0.45 * zapata, 0.01]} s={[0.36, 0.9 * zapata, 0.02]} c="#a7a196" sombra={false} recibe={false} />)}
      {zapata > 0 && PX.map((x) => <Caja key={`b${x}`} p={[x, -0.4, 0.03]} s={[LADO, 0.8 * zapata, 0.02]} c={madera} sombra={false} recibe={false} />)}
      {/* postes inclinados por el racking */}
      {PX.map((x) => PZ.map((z) => <group key={`${x}${z}`} position={[x, 0, z]} rotation={[0, 0, -th]}><Caja p={[0, PH / 2, 0]} s={[LADO, PH, LADO]} c={madera} /></group>))}
      {/* vigas, travesaños laterales y listones que se mueven con la parte de arriba */}
      <group position={[dx, dy, 0]}>
        {PZ.map((z) => <Caja key={z} p={[(PX[0] + PX[1]) / 2, PH + 0.08, z]} s={[2.0, 0.16, 0.09]} c={viga} />)}
        {PX.map((x) => <Caja key={`l${x}`} p={[x, PH + 0.08, (PZ[0] + PZ[1]) / 2]} s={[0.09, 0.16, 1.7]} c={viga} />)}
        {[...Array(8)].map((_, i) => <Caja key={`r${i}`} p={[PX[0] - 0.12 + i * 0.235, PH + 0.2, (PZ[0] + PZ[1]) / 2]} s={[0.06, 0.1, 1.95]} c="#c99a5c" />)}
        {/* riostras a 45°: al frente (x) y a los lados (z) */}
        {PZ.map((z) => <group key={`f${z}`}><Riostra x={PX[0]} z={z} dir={1} eje="x" e={frente} /><Riostra x={PX[1]} z={z} dir={-1} eje="x" e={frente} /></group>)}
        {PX.map((x) => <group key={`s${x}`}><Riostra x={x} z={PZ[0]} dir={-1} eje="z" e={lado} /><Riostra x={x} z={PZ[1]} dir={1} eje="z" e={lado} /></group>)}
      </group>
      {t >= T[5] && t < T[6] && <Preguntas t={t} a={T[5]} p={[XF + 0.1, 1.2, 0.4]} />}
      {t >= T[9] && t < T[10] && <Preguntas t={t} a={T[9]} p={[XF + 0.1, 1.2, 0.4]} />}
      <Flo p={[fx, 0, 0.45]} t={t} habla={fH} giro={empuja ? 0.9 : 0.4} ala={fAla} />
      <Norm p={[XN, nSalto, 0.45]} t={t} giro={-0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [bx, by] = pantalla(t, [PX[0] + BR / 2, PH - BR / 2, 0.1]);
  const [zx, zy] = pantalla(t, [PX[0], -0.45, 0.05]);
  const viento = v(T[4] + 0.1, T[5]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR PERGOLA" abajo="WILL WOBBLE" color="#ff6a1a" tamAbajo={116} />
      <Grande s="ROCK SOLID!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={120} />
      {v(T[3] + 0.6, T[4]) > 0 && <g opacity={v(T[3] + 0.6, T[4])}>
        <rect x={250} y={300} width={170} height={170} fill="none" stroke="#fff" strokeWidth={14} />
        <text x={540} y={420} fontSize={110} fill="#ffd23f" stroke="#14321f" strokeWidth={18} paintOrder="stroke">→</text>
        <path d="M680 300 L850 300 L800 470 L630 470 Z" fill="none" stroke="#ff2a2a" strokeWidth={14} /></g>}
      <Grande s="RACKING" o={viento} col="#ff2a2a" borde="#fff" tam={130} />
      {viento > 0 && [...Array(6)].map((_, i) => { const u = ((t * 1.4 + i / 6) % 1); return <path key={i} d={`M${-200 + u * 1500} ${700 + i * 90} q60 -30 120 0 t120 0`} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.7 * viento * Math.sin(Math.PI * u)} />; })}
      <Grande s="BIGGER POSTS?" o={v(T[5] + 0.1, T[6])} col="#ff4f9a" borde="#fff" tam={110} />
      {v(T[6] + 0.1, T[7]) > 0 && <g opacity={v(T[6] + 0.1, T[7])}><Grande s="TRIANGLES!" o={1} col="#27c24c" borde="#fff" tam={130} />
        <path d="M440 400 L640 400 L440 560 Z" fill="#27c24c" stroke="#fff" strokeWidth={10} transform={`translate(0 ${10 * Math.sin(t * 6)})`} /></g>}
      <Grande s="45° KNEE BRACE" o={v(T[7] + 0.4, T[8])} col="#27c24c" borde="#fff" tam={104} />
      <Etiqueta s="45°" x={bx + 120} y={by - 40} o={v(T[7] + 0.9, T[8])} col="#ffd23f" borde="#14321f" tam={84} />
      <Grande s="BOTH DIRECTIONS" o={v(T[8] + 0.3, T[9])} col="#27c24c" borde="#fff" tam={100} />
      <Grande s="AND THE BOTTOM?" o={v(T[9] + 0.05, T[10])} col="#ff4f9a" borde="#fff" tam={104} />
      <Grande s="ANCHOR THE POSTS" o={v(T[10] + 0.3, T[11])} col="#27c24c" borde="#fff" tam={96} />
      <Etiqueta s="FOOTING" x={zx + 200} y={zy} o={v(T[10] + 0.9, T[11])} col="#ffd23f" borde="#14321f" tam={64} />
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="BIG POSTS" der="BRACES" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: DON'T HANG A SWING LIKE THIS" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const PergolaVideo: React.FC = () => {
  const t = useCurrentFrame() / PER_FPS;
  return <Marco t={t} seg={PER_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} />;
};
