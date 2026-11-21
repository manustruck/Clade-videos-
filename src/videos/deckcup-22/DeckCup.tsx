// «Your deck boards are cupping» — capítulo 22 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// Una terraza baja cortada en z = 0: las tablas se ven de punta y se curvan (cupping) porque abajo la tierra húmeda las
// moja y arriba el sol las seca. El «lado de la corteza» ayuda poco; el arreglo es ventilar abajo y poner grava sobre
// una tela en el suelo. Usa la cámara viva.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, azar, rebote, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, TramoVivo, hacerCamaraViva, golpesDe, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const DC_FPS = 30, DC_SEG = duracion(tiempos), DC_CUADROS = Math.round(DC_FPS * DC_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["deck", "boards", "curling", "potato", "chips", "bark", "cup", "cups", "real", "problem", "wet", "dirt", "damp", "sun", "swells", "shrinks", "myth", "moisture", "breathe", "air", "flow", "underneath", "gravel", "ground", "cover", "breeze", "airflow", "team", "follow", "like"];
const X0 = -1.2, NB = 8, BW = 0.29, TOP = 0.3, ZB = -1.6;
const XN = -1.65, XF = 0.55;

const C = {
  gancho: { pos: [-0.2, 0.6, 2.2], look: [-0.3, 0.28, 0] } as Cam, gancho2: { pos: [-0.3, 0.45, 1.6], look: [-0.35, 0.28, 0] } as Cam,
  dos: { pos: [-0.3, 1.1, 5.4], look: [-0.3, 0.5, 0] } as Cam, dos2: { pos: [-0.3, 1.0, 4.8], look: [-0.3, 0.45, 0] } as Cam,
  flo: { pos: [XF, 1.2, 2.9], look: [XF, 1.0, 0] } as Cam, flo2: { pos: [XF, 1.18, 2.45], look: [XF, 1.0, 0] } as Cam,
  tabla: { pos: [-0.35, 0.35, 1.3], look: [-0.35, 0.28, 0] } as Cam, tabla2: { pos: [-0.35, 0.32, 1.05], look: [-0.35, 0.27, 0] } as Cam,
  bajo: { pos: [-0.3, 0.12, 2.6], look: [-0.3, 0.12, 0] } as Cam, bajo2: { pos: [-0.3, 0.1, 2.1], look: [-0.3, 0.1, 0] } as Cam,
  norm: { pos: [XN + 0.1, 0.55, 3.0], look: [XN + 0.1, 0.42, 0] } as Cam, norm2: { pos: [XN + 0.1, 0.52, 2.55], look: [XN + 0.1, 0.4, 0] } as Cam,
  lado: { pos: [2.6, 0.5, 2.0], look: [0, 0.15, -0.8] } as Cam, lado2: { pos: [2.2, 0.35, 1.6], look: [0, 0.12, -0.8] } as Cam,
  equipo: { pos: [-0.3, 1.3, 5.0], look: [-0.3, 1.55, 0] } as Cam, fin: { pos: [-0.3, 1.3, 6.2], look: [-0.3, 1.75, 0] } as Cam,
};
const TRAMOS: TramoVivo[] = [
  [0, T[1], C.gancho, C.gancho2, { ease: "expo", dolly: 0.3, roll: -0.07 }], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2, { orbita: 0.25 }],
  [T[3], T[4], C.tabla, C.tabla2, { orbita: -0.25 }], [T[4], T[5], C.bajo, C.bajo2, { ease: "expo", roll: 0.04 }], [T[5], T[6], C.tabla2, C.tabla, { orbita: 0.3 }],
  [T[6], T[7], C.flo2, C.flo, { orbita: -0.25 }], [T[7], T[8], C.norm, C.norm2, { ease: "expo" }], [T[8], T[9], C.lado, C.lado2, { orbita: 0.25 }], [T[9], T[10], C.bajo2, C.bajo, { orbita: -0.2 }],
  [T[10], T[11], C.flo, C.flo2, { roll: 0.05 }], [T[11], T[12], C.equipo, C.equipo, { orbita: 0.2 }], [T[12], 99, C.fin, C.fin, { orbita: 0.15 }],
];
const { camEn, pantalla, desenfoque } = hacerCamaraViva(TRAMOS, { sacude: (t) => (t < 0.45 ? 0.03 : 0), golpes: golpesDe(PAL, ["chips", "bark", "damp", "cups", "myth", "breathe", "gravel"]) });

const Tabla: React.FC<{ i: number; cup: number; bark: boolean }> = ({ i, cup, bark }) => {
  const x = X0 + BW / 2 + i * (BW + 0.01);
  return <group position={[x, TOP, ZB / 2]}>
    {[-1, 1].map((s) => <group key={s} position={[s * 0.002, 0, 0]} rotation={[0, 0, -s * cup]}>
      <Caja p={[s * BW / 4, 0, 0]} s={[BW / 2, 0.045, -ZB]} c={i % 2 ? "#c99a5c" : "#c28f52"} />
    </group>)}
    {bark && [0.06, 0.1].map((r) => <mesh key={r} position={[0, -0.07, -ZB / 2 + 0.003]}><ringGeometry args={[r, r + 0.006, 24, 1, Math.PI * 0.3, Math.PI * 0.4]} /><meshBasicMaterial color="#7a4a26" /></mesh>)}
  </group>;
};

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const bien = t >= T[8] + 0.3;
  const cup = bien ? 0.16 * (1 - pr(t, T[9], T[10] - 0.3)) : t < T[1] ? 0.2 * pr(t, 0.15, 1.2) : t >= T[4] ? 0.06 + 0.12 * pr(t, T[4] + 1.0, T[6]) : 0.06;
  const humedad = !bien && (t < T[1] || (t >= T[4] && t < T[8])) ? 1 : bien ? 1 - pr(t, T[8] + 0.3, T[9] + 1.5) : 0;
  const sol = t < T[1] || (t >= T[4] && t < T[6]);
  const rejillas = bien ? rebote(pr(t, T[8] + 0.3, T[8] + 1.0)) : 0;
  const grava = t >= T[9] ? pr(t, T[9] + 0.3, T[9] + 1.3) : 0;
  const aire = bien && t >= T[8] + 0.6 && t < T[10];
  const fH = habla(t, 1), nH = habla(t, 0);
  const nBrazo = (t >= T[3] && t < T[6]) || (t >= T[7] && t < T[10]) ? 1 : t >= T[12] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  const x1 = X0 + NB * (BW + 0.01);
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} huecos={[[X0, x1]]} />
      {/* suelo bajo la terraza: tierra húmeda, luego tela y grava */}
      <Caja p={[(X0 + x1) / 2, 0.01, ZB / 2]} s={[x1 - X0, 0.02, -ZB]} c={humedad > 0.5 ? "#4a3018" : "#6e4a2a"} sombra={false} />
      {grava > 0 && <><Caja p={[(X0 + x1) / 2, 0.026, ZB / 2]} s={[x1 - X0, 0.008, -ZB]} c="#202024" sombra={false} />
        {[...Array(60)].map((_, i) => <mesh key={i} position={[X0 + azar(i) * (x1 - X0), 0.04, -azar(i + 3) * -ZB * grava]}><sphereGeometry args={[0.018 + 0.01 * azar(i + 5), 6, 5]} /><meshLambertMaterial color={i % 2 ? "#8f897c" : "#d6d0c2"} /></mesh>)}</>}
      {/* vigas y postes */}
      {[...Array(5)].map((_, i) => <Caja key={i} p={[X0 + 0.15 + i * 0.53, TOP - 0.1, ZB / 2]} s={[0.06, 0.15, -ZB]} c="#a8783f" />)}
      {[X0 + 0.05, x1 - 0.05].map((x) => <Caja key={x} p={[x, TOP / 2 - 0.05, -0.05]} s={[0.08, TOP - 0.1, 0.08]} c="#9a6a36" />)}
      {[...Array(NB)].map((_, i) => <Tabla key={i} i={i} cup={cup} bark={t >= T[2] && t < T[4]} />)}
      {/* faldón: cerrado (malo) o con rejilla abierta (bien) */}
      {!bien && <Caja p={[(X0 + x1) / 2, TOP / 2 - 0.04, ZB]} s={[x1 - X0, TOP - 0.08, 0.03]} c="#9a6a36" />}
      {rejillas > 0 && [...Array(14)].map((_, i) => <Caja key={i} p={[X0 + 0.1 + i * 0.17, (TOP / 2 - 0.04) * rejillas, ZB]} s={[0.04, (TOP - 0.08) * rejillas, 0.03]} c="#9a6a36" />)}
      {/* vapor que sube de la tierra y moja la tabla por abajo */}
      {humedad > 0 && [...Array(16)].map((_, i) => { const u = (t * 0.6 + azar(i)) % 1; return <mesh key={i} position={[X0 + azar(i + 2) * (x1 - X0), 0.03 + (TOP - 0.06) * u, 0.05 - azar(i + 5) * 0.4]} scale={humedad}><sphereGeometry args={[0.018, 8, 6]} /><meshBasicMaterial color="#4fb3ff" transparent opacity={0.8 * (1 - u)} /></mesh>; })}
      {/* sol pegando arriba */}
      {sol && [...Array(6)].map((_, i) => <mesh key={i} position={[X0 + 0.3 + i * 0.42, TOP + 0.4 - ((t * 0.8 + i / 6) % 1) * 0.35, 0.05]}><cylinderGeometry args={[0.006, 0.006, 0.14, 4]} /><meshBasicMaterial color="#ffd23f" /></mesh>)}
      {/* aire que cruza por debajo */}
      {aire && [...Array(8)].map((_, i) => { const u = ((t * 0.9 + i / 8) % 1); return <mesh key={i} position={[X0 - 0.3 + (x1 - X0 + 0.6) * u, 0.12 + (i % 3) * 0.05, -0.2 - (i % 4) * 0.35]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.006, 0.006, 0.3, 4]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.85 * Math.sin(Math.PI * u)} /></mesh>; })}
      {(t >= T[6] && t < T[7]) && <Preguntas t={t} a={T[6]} p={[XF + 0.1, TOP + 1.2, 0.3]} />}
      <Flo p={[XF, TOP + 0.03, -0.25]} t={t} habla={fH} giro={-0.3} ala={t < T[1] ? 1 : t >= T[10] && t < T[11] ? 0.6 : fH * 0.7} />
      <Norm p={[XN, nSalto, 0.4]} t={t} giro={0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [bx, by] = pantalla(t, [X0 + BW * 3.5, TOP - 0.03, 0.02]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR DECK BOARDS" abajo="ARE CUPPING" color="#ff4a1a" tamAbajo={116} />
      <Grande s="BARK SIDE UP!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="HELPS… A LITTLE" o={v(T[3] + 0.2, T[4])} col="#fff" borde="#14321f" tam={104} />
      <Grande s="WET BOTTOM · DRY TOP" o={v(T[4] + 0.4, T[5])} col="#2f8bff" borde="#fff" tam={90} />
      <Etiqueta s="SWELLS" x={bx} y={by + 90} o={v(T[5] + 0.3, T[6])} col="#2f8bff" tam={58} />
      <Etiqueta s="SHRINKS" x={bx} y={by - 90} o={v(T[5] + 0.8, T[6])} col="#ff8a1a" tam={58} />
      <Grande s="A MYTH?" o={v(T[6] + 0.05, T[7])} col="#ff4f9a" borde="#fff" tam={140} />
      <Grande s="MOISTURE MATTERS MORE" o={v(T[7] + 0.3, T[8])} col="#27c24c" borde="#fff" tam={86} />
      <Grande s="LET IT BREATHE ✓" o={v(T[8] + 0.4, T[9])} col="#27c24c" borde="#fff" tam={110} />
      <Grande s="GRAVEL + GROUND COVER" o={v(T[9] + 0.4, T[10])} col="#27c24c" borde="#fff" tam={84} />
      <Sello t={t} a={T[10] + 0.6} b={T[11]} />
      <Equipos t={t} a={T[11]} b={T[12]} izq="BARK UP" der="AIRFLOW" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[12]} siguiente="NEXT: YOUR FIRE PIT IS TOO CLOSE" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const DeckCupVideo: React.FC = () => {
  const t = useCurrentFrame() / DC_FPS;
  return <Marco t={t} seg={DC_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[12] - 0.05} blur={desenfoque(t)} />;
};
