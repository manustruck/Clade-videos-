// «Your drain is running uphill» — capítulo 19 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// Corte del suelo con un tubo de drenaje: con una panza en el medio el agua se queda y se tapa con tierra; bien hecho
// baja parejo (1/8 de pulgada por pie como mínimo) hasta salir al aire libre en el punto más bajo. Usa la cámara viva.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, azar, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, TramoVivo, V3, hacerCamaraViva, golpesDe, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const DRA_FPS = 30, DRA_SEG = duracion(tiempos), DRA_CUADROS = Math.round(DRA_FPS * DRA_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["drain", "uphill", "level", "pipe", "trench", "downhill", "dip", "middle", "low", "spot", "dirt", "clogged", "deeper", "steady", "fall", "dips", "eighth", "inch", "foot", "eight", "feet", "string", "line", "lowest", "open", "daylight", "weekend", "slope", "team", "follow", "like"];
const X0 = -1.5, X1 = 1.7, N = 18, R = 0.06;
const XN = 0.05, XF = 1.05;
const malo = (u: number) => lerp(-0.3, -0.36, u) - 0.24 * Math.sin(Math.PI * u);   // con panza: la salida queda más alta que el medio
const bueno = (u: number) => lerp(-0.22, -0.52, u);                                 // baja parejo
const enX = (u: number) => lerp(X0, X1, u);

const C = {
  gancho: { pos: [-1.0, 0.45, 2.9], look: [-0.9, -0.15, 0] } as Cam, gancho2: { pos: [-0.75, 0.25, 2.3], look: [-0.6, -0.25, 0] } as Cam,
  dos: { pos: [0.1, 0.7, 5.6], look: [0.1, 0.05, 0] } as Cam, dos2: { pos: [0.1, 0.6, 5.0], look: [0.1, 0.0, 0] } as Cam,
  flo: { pos: [XF, 0.9, 2.8], look: [XF, 0.72, 0] } as Cam, flo2: { pos: [XF, 0.88, 2.35], look: [XF, 0.72, 0] } as Cam,
  tubo: { pos: [0.1, -0.15, 4.2], look: [0.1, -0.32, 0] } as Cam, tubo2: { pos: [0.1, -0.2, 3.6], look: [0.1, -0.34, 0] } as Cam,
  panza: { pos: [0.1, -0.35, 2.0], look: [0.1, -0.5, 0] } as Cam, panza2: { pos: [0.1, -0.42, 1.6], look: [0.1, -0.52, 0] } as Cam,
  norm: { pos: [XN, 0.55, 3.0], look: [XN, 0.42, 0] } as Cam, norm2: { pos: [XN, 0.5, 2.5], look: [XN, 0.4, 0] } as Cam,
  regla: { pos: [0.1, 0.45, 4.2], look: [0.1, 0.0, 0] } as Cam, regla2: { pos: [0.1, 0.4, 3.6], look: [0.1, -0.05, 0] } as Cam,
  salida: { pos: [2.4, 0.1, 2.6], look: [1.75, -0.45, 0.3] } as Cam, salida2: { pos: [2.2, -0.05, 2.1], look: [1.75, -0.5, 0.3] } as Cam,
  equipo: { pos: [0.1, 1.2, 5.0], look: [0.1, 1.45, 0] } as Cam, fin: { pos: [0.1, 1.2, 6.2], look: [0.1, 1.65, 0] } as Cam,
};
const TRAMOS: TramoVivo[] = [
  [0, T[1], C.gancho, C.gancho2, { ease: "expo", dolly: 0.3, roll: -0.07 }], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2, { orbita: 0.25 }],
  [T[3], T[4], C.tubo, C.tubo2, { orbita: 0.25 }], [T[4], T[5], C.panza, C.panza2, { ease: "expo", roll: 0.05 }], [T[5], T[6], C.flo2, C.flo, { orbita: -0.25 }],
  [T[6], T[7], C.norm, C.norm2, { ease: "expo" }], [T[7], T[8], C.tubo2, C.tubo, { orbita: -0.3 }], [T[8], T[9], C.regla, C.regla2], [T[9], T[10], C.flo, C.flo2, { orbita: 0.2 }],
  [T[10], T[11], C.salida, C.salida2, { orbita: 0.3 }], [T[11], T[12], C.flo2, C.flo, { roll: 0.05 }], [T[12], T[13], C.equipo, C.equipo, { orbita: 0.2 }], [T[13], 99, C.fin, C.fin, { orbita: 0.15 }],
];
const { camEn, pantalla, desenfoque } = hacerCamaraViva(TRAMOS, { sacude: (t) => (t < 0.45 ? 0.04 : 0), golpes: golpesDe(PAL, ["uphill", "dip", "clogged", "dips", "eighth", "level", "daylight"]) });

const Tubo: React.FC<{ y: (u: number) => number; c: string }> = ({ y, c }) => <group>{[...Array(N)].map((_, i) => {
  const u0 = i / N, u1 = (i + 1) / N, a: V3 = [enX(u0), y(u0), 0.06], b: V3 = [enX(u1), y(u1), 0.06];
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return <mesh key={i} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.06]} rotation={[0, 0, ang - Math.PI / 2]}><cylinderGeometry args={[R, R, l + 0.005, 14]} /><meshLambertMaterial color={c} /></mesh>;
})}</group>;

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const bien = t >= T[6] + 0.3;
  const forma = bien ? bueno : malo;
  const charco = t < T[1] ? pr(t, 0.2, 1.3) : t >= T[3] && !bien ? 0.6 : 0;
  const lodo = !bien && t >= T[4] ? pr(t, T[4] + 0.4, T[4] + 2.8) : 0;
  const lluvia = t < T[1] || (t >= T[2] && t < T[3]);
  const regla = t >= T[8] ? pr(t, T[8] + 0.2, T[8] + 0.9) : 0;
  const sale = bien;
  const fH = habla(t, 1), nH = habla(t, 0);
  const nBrazo = (t >= T[3] && t < T[5]) || (t >= T[6] && t < T[9]) || (t >= T[10] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  const susto = t < T[1] ? Math.max(0, Math.sin(Math.PI * pr(t, 0.6, 1.2))) * 0.15 : 0;
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} />
      {/* zanja con grava (cortada en z = 0) y el tubo */}
      {[...Array(N)].map((_, i) => { const u = (i + 0.5) / N; return <Caja key={i} p={[enX(u), (forma(u) - R - 0.04) / 2, 0.01]} s={[(X1 - X0) / N + 0.01, -(forma(u) - R - 0.04), 0.012]} c="#a7a196" sombra={false} recibe={false} />; })}
      {[...Array(60)].map((_, i) => { const u = azar(i); return <mesh key={i} position={[enX(u), forma(u) + (azar(i + 3) - 0.3) * 0.3, 0.02]}><sphereGeometry args={[0.014 + 0.01 * azar(i + 5), 6, 5]} /><meshLambertMaterial color={i % 2 ? "#8f897c" : "#d6d0c2"} /></mesh>; })}
      <Tubo y={forma} c={bien ? "#3fbf5a" : "#2f2f35"} />
      {/* agua quieta y lodo en la panza */}
      {!bien && t >= T[3] && [...Array(7)].map((_, i) => { const u = 0.32 + i * 0.06; return <mesh key={i} position={[enX(u), malo(u) - 0.01, 0.13]}><sphereGeometry args={[0.045, 10, 8]} /><meshBasicMaterial color="#3d8cff" /></mesh>; })}
      {lodo > 0 && [...Array(7)].map((_, i) => { const u = 0.34 + i * 0.054; return <Caja key={`l${i}`} p={[enX(u), malo(u) - R + 0.02 * lodo, 0.14]} s={[0.11, 0.04 * lodo, 0.02]} c="#5a3a1a" sombra={false} recibe={false} />; })}
      {/* agua que corre cuando está bien */}
      {sale && [...Array(14)].map((_, i) => { const u = ((t * 0.45 + i / 14) % 1); return <mesh key={i} position={[enX(u), bueno(u), 0.13]}><sphereGeometry args={[0.03, 8, 6]} /><meshBasicMaterial color="#3d8cff" /></mesh>; })}
      {/* entrada (rejilla) y charco */}
      <Caja p={[X0, 0.0, 0.0]} s={[0.26, 0.04, 0.26]} c="#3a3f47" />
      {[...Array(4)].map((_, i) => <Caja key={i} p={[X0 - 0.09 + i * 0.06, 0.023, 0.0]} s={[0.02, 0.01, 0.24]} c="#1a1d22" sombra={false} />)}
      {charco > 0 && <mesh position={[X0 + 0.25, 0.03, 0.15]} rotation={[-Math.PI / 2, 0, 0]} scale={[charco, charco * 0.6, 1]}><circleGeometry args={[0.5, 24]} /><meshBasicMaterial color="#5aa8ff" transparent opacity={0.75} /></mesh>}
      {lluvia && [...Array(40)].map((_, i) => { const u = (t * 1.6 + azar(i)) % 1; return <mesh key={i} position={[(azar(i + 2) - 0.5) * 4, 2.2 - 2.2 * u, -0.6 + azar(i + 6) * 1.2]}><cylinderGeometry args={[0.005, 0.005, 0.12, 4]} /><meshBasicMaterial color="#4fb3ff" /></mesh>; })}
      {/* terreno más bajo a la derecha (la salida al aire libre) */}
      <Caja p={[2.4, -0.62, 0.75]} s={[1.6, 0.08, 1.5]} c="#5cc24a" />
      <Caja p={[2.4, -1.0, 0.75]} s={[1.6, 0.7, 1.5]} c="#8a5a33" sombra={false} />
      {[...Array(6)].map((_, i) => <mesh key={i} position={[X1 + 0.15 + (i % 3) * 0.1, -0.56, 0.2 + Math.floor(i / 3) * 0.1]}><sphereGeometry args={[0.05, 8, 6]} /><meshLambertMaterial color="#9aa3ab" /></mesh>)}
      {sale && [...Array(10)].map((_, i) => { const u = ((t * 1.2 + i / 10) % 1); return <mesh key={i} position={[X1 + 0.05 + 0.25 * u, bueno(1) - 0.05 - 0.05 * u - 0.1 * u * u, 0.12 + 0.1 * u]}><sphereGeometry args={[0.025, 6, 5]} /><meshBasicMaterial color="#3d8cff" /></mesh>; })}
      {/* estacas, cordel y nivel */}
      {regla > 0 && <group>
        {[X0 + 0.1, X1 - 0.1].map((x, i) => <Caja key={x} p={[x, 0.3, 0.05]} s={[0.035, 0.6, 0.035]} c="#c99a5c" />)}
        <mesh position={[(X0 + X1) / 2, lerp(0.5, 0.42, 0.5), 0.07]} rotation={[0, 0, Math.atan2(0.42 - 0.5, X1 - X0 - 0.2)]} scale={[regla, 1, 1]}><boxGeometry args={[X1 - X0 - 0.2, 0.008, 0.008]} /><meshBasicMaterial color="#ff2f6e" /></mesh>
        <group position={[0.1, 0.06, 0.25]} scale={regla}><Caja p={[0, 0, 0]} s={[0.7, 0.06, 0.06]} c="#ffd23f" /><mesh position={[0.02, 0.0, 0.035]}><sphereGeometry args={[0.018, 10, 8]} /><meshBasicMaterial color="#7dff4f" /></mesh></group>
      </group>}
      {t >= T[5] && t < T[6] && <Preguntas t={t} a={T[5]} p={[XF + 0.1, 1.2, 0.5]} />}
      {t >= T[9] && t < T[10] && <Preguntas t={t} a={T[9]} p={[XF + 0.1, 1.2, 0.5]} />}
      <Flo p={[XF, susto, 0.5]} t={t} habla={fH} giro={-0.4} ala={t < T[1] ? 1 : t >= T[11] && t < T[12] ? 0.5 : fH * 0.7} />
      <Norm p={[XN, nSalto, 0.55]} t={t} giro={0.4} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [px, py] = pantalla(t, [enX(0.5), malo(0.5), 0.1]);
  const [sx, sy] = pantalla(t, [X1 + 0.2, -0.55, 0.3]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR DRAIN" abajo="RUNS UPHILL" color="#ff4a1a" tamAbajo={120} />
      <Grande s="IN AND OUT. DONE!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={100} />
      <Grande s="WATER ONLY FLOWS DOWNHILL" o={v(T[3] + 0.2, T[4])} col="#fff" borde="#14321f" tam={80} />
      {v(T[3] + 1.4, T[5]) > 0 && <g opacity={v(T[3] + 1.4, T[5])}><circle cx={px} cy={py} r={110 + 10 * Math.sin(t * 8)} fill="none" stroke="#ff2a2a" strokeWidth={12} /></g>}
      <Etiqueta s="DIP ✗" x={px} y={py - 150} o={v(T[3] + 1.4, T[4])} col="#ff2a2a" tam={70} />
      <Grande s="IT CLOGS" o={v(T[4] + 1.2, T[5])} col="#ff2a2a" borde="#fff" tam={140} />
      <Grande s="DIG DEEPER?" o={v(T[5] + 0.05, T[6])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="STEADY FALL. NO DIPS" o={v(T[6] + 0.3, T[7])} col="#27c24c" borde="#fff" tam={90} />
      <Grande s="≥ 1/8 INCH PER FOOT" o={v(T[7] + 0.3, T[8])} col="#27c24c" borde="#fff" tam={96} />
      <Grande s="≈ 1 INCH EVERY 8 FT" o={v(T[7] + 0.3, T[8])} col="#fff" borde="#14321f" tam={64} y={400} />
      <Grande s="STRING LINE + LEVEL" o={v(T[8] + 0.4, T[9])} col="#27c24c" borde="#fff" tam={96} />
      <Grande s="WHERE DOES IT GO?" o={v(T[9] + 0.05, T[10])} col="#ff4f9a" borde="#fff" tam={100} />
      <Grande s="DAYLIGHT ✓" o={v(T[10] + 0.4, T[11])} col="#27c24c" borde="#fff" tam={130} />
      <Etiqueta s="LOWEST POINT" x={sx} y={sy + 120} o={v(T[10] + 0.9, T[11])} col="#ffd23f" borde="#14321f" tam={60} />
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="JUST DIG IT" der="SLOPE IT" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR PATIO IS POURING INTO YOUR HOUSE" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const DrainVideo: React.FC = () => {
  const t = useCurrentFrame() / DRA_FPS;
  return <Marco t={t} seg={DRA_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} blur={desenfoque(t)} />;
};
