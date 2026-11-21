// «Is treated wood safe for raised garden beds?» — capítulo 10 del canal en inglés (vertical 1080x1920, 30 cps, three.js).
// Diálogo Flo vs Norm. Una cama elevada cortada en z = 0: tablas, tierra y dos tomateras. Las tablas viejas (arsénico)
// se cambian por nuevas (cobre); una franja naranja muestra que el cobre extra queda a 1 pulgada de la tabla.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, azar, rebote, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, Tramo, hacerCamara, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const TRE_FPS = 30, TRE_SEG = duracion(tiempos), TRE_CUADROS = Math.round(TRE_FPS * TRE_SEG);
const T = tiempos.frases.map((f) => f.a);
const habla = hablaDe(tiempos);
const CLAVES = ["treated", "wood", "raised", "poison", "arsenic", "chemicals", "tomatoes", "old", "2003", "copper", "oregon", "soil", "years", "inch", "boards", "vegetables", "buildup", "catch", "never", "2004", "inches", "live", "safe", "team", "follow", "like"];
const X0 = -0.75, X1 = 0.25, W = 0.07, H = 0.46, ZB = -1.3, TIERRA = 0.4; // la cama elevada
const XN = -1.1, XF = 0.65; // Norm a la izquierda, Flo a la derecha

const C = {
  gancho: { pos: [0.15, 0.62, 3.5], look: [0.15, 0.45, 0] } as Cam, gancho2: { pos: [0.15, 0.58, 3.1], look: [0.15, 0.45, 0] } as Cam,
  dos: { pos: [-0.22, 0.65, 5.7], look: [-0.22, 0.5, 0] } as Cam, dos2: { pos: [-0.22, 0.6, 5.2], look: [-0.22, 0.48, 0] } as Cam,
  cama: { pos: [-0.25, 0.45, 3.0], look: [-0.25, 0.3, 0] } as Cam, cama2: { pos: [-0.25, 0.42, 2.6], look: [-0.25, 0.28, 0] } as Cam,
  norm: { pos: [XN + 0.1, 0.5, 2.3], look: [XN + 0.1, 0.4, 0] } as Cam, norm2: { pos: [XN + 0.1, 0.48, 2.0], look: [XN + 0.1, 0.38, 0] } as Cam,
  flo: { pos: [XF, 0.85, 2.7], look: [XF, 0.7, 0] } as Cam, flo2: { pos: [XF, 0.85, 2.3], look: [XF, 0.72, 0] } as Cam,
  borde: { pos: [0.08, 0.3, 1.9], look: [0.08, 0.2, 0] } as Cam, borde2: { pos: [0.08, 0.28, 1.6], look: [0.08, 0.2, 0] } as Cam,
  tomate: { pos: [-0.02, 0.9, 1.4], look: [-0.02, 0.74, -0.5] } as Cam, tomate2: { pos: [-0.02, 0.88, 1.15], look: [-0.02, 0.74, -0.5] } as Cam,
  ancho: { pos: [-0.1, 0.75, 6.8], look: [-0.1, 0.45, 0] } as Cam, ancho2: { pos: [-0.1, 0.7, 6.2], look: [-0.1, 0.42, 0] } as Cam,
  equipo: { pos: [-0.22, 0.8, 5.0], look: [-0.22, 1.05, 0] } as Cam, fin: { pos: [-0.2, 0.8, 6.2], look: [-0.2, 1.25, 0] } as Cam,
};
const TRAMOS: Tramo[] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.cama, C.cama2], [T[3], T[3] + 1.6, C.norm, C.norm2], [T[3] + 1.6, T[4], C.dos2, C.dos],
  [T[4], T[5], C.flo, C.flo2], [T[5], T[6], C.cama, C.cama2], [T[6], T[7], C.ancho2, C.cama], [T[7], T[8], C.borde, C.borde2], [T[8], T[9], C.tomate, C.tomate2],
  [T[9], T[10], C.flo, C.flo2], [T[10], T[11], C.ancho, C.ancho2], [T[11], T[12], C.flo2, C.flo], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const { camEn, pantalla } = hacerCamara(TRAMOS, (t) => (t < 0.4 ? 0.05 : 0) + (t >= T[3] + 2.6 && t < T[3] + 2.9 ? 0.04 : 0));

/** la cama elevada: dos laterales y el fondo, con la cara del corte al frente */
const Tablas: React.FC<{ c: string; dy: number; giro: number; o?: number }> = ({ c, dy, giro, o = 1 }) => (
  <group position={[0, dy, 0]} rotation={[0, 0, giro]}>
    {[X0 + W / 2, X1 - W / 2].map((x) => <group key={x}>
      <Caja p={[x, H / 2, ZB / 2]} s={[W, H, -ZB]} c={c} o={o} />
      {[0.15, 0.3].map((y) => <Caja key={y} p={[x, y, 0.003]} s={[W, 0.006, 0.004]} c="#6f6248" sombra={false} recibe={false} />)}
    </group>)}
    <Caja p={[(X0 + X1) / 2, H / 2, ZB + W / 2]} s={[X1 - X0, H, W]} c={c} o={o} />
  </group>
);

const Tomatera: React.FC<{ x: number; t: number; s: number }> = ({ x, t, s }) => (
  <group position={[x, TIERRA, -0.5]} scale={s} rotation={[0, 0, 0.04 * Math.sin(t * 2 + x * 5)]}>
    <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.014, 0.018, 0.5, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
    {[[-0.08, 0.2], [0.09, 0.28], [-0.07, 0.38], [0.08, 0.46], [0, 0.52]].map(([dx, dy], i) => <mesh key={i} position={[dx, dy, 0]} scale={[1.3, 0.55, 1]}><sphereGeometry args={[0.065, 10, 8]} /><meshLambertMaterial color={i % 2 ? "#3fa637" : "#2f9a3a"} /></mesh>)}
    {[[-0.06, 0.28, 0.06], [0.07, 0.36, 0.05], [-0.02, 0.44, 0.07]].map(([dx, dy, dz], i) => <mesh key={i} position={[dx, dy, dz]} castShadow><sphereGeometry args={[0.045, 14, 10]} /><meshLambertMaterial color="#e8312a" /></mesh>)}
  </group>
);

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const gancho = t < T[1];
  const fuera = pr(t, T[3] + 1.9, T[3] + 2.5), entra = rebote(pr(t, T[3] + 2.4, T[3] + 3.1) * 1.0);
  const nuevas = t >= T[3] + 2.4;
  const humo = gancho || (t >= T[2] && t < T[3] + 2.0);
  const sondas = t >= T[6] ? pr(t, T[6] + 0.3, T[6] + 1.3) : 0;
  const cobre = Math.min(t >= T[7] ? pr(t, T[7] + 0.2, T[7] + 0.9) : 0, 1 - pr(t, T[9], T[9] + 0.4));
  const vieja = t >= T[10] && t < T[11] + 0.3 ? pr(t, T[10] + 0.1, T[10] + 0.6) : 0;
  const linea = t >= T[10] + 1.8 && t < T[12] ? pr(t, T[10] + 1.8, T[10] + 2.4) : 0;
  const fH = habla(t, 1), nH = habla(t, 0);
  const fAla = gancho ? 1 : t >= T[11] && t < T[12] ? 0.8 + 0.2 * Math.sin(t * 9) : fH * 0.7;
  const nBrazo = (t >= T[5] && t < T[6]) || (t >= T[10] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} huecos={[[X0 - 0.05, X1 + 0.05]]} />
      {/* tierra de la cama: cara del corte y superficie */}
      <Caja p={[(X0 + X1) / 2, TIERRA / 2, ZB / 2]} s={[X1 - X0 - 2 * W, TIERRA, -ZB - W]} c="#5a3a1f" sombra={false} />
      {[...Array(26)].map((_, i) => <mesh key={i} position={[X0 + W + 0.03 + azar(i + 3) * (X1 - X0 - 2 * W - 0.06), 0.03 + azar(i + 7) * (TIERRA - 0.06), 0.006]} scale={[1, 0.6, 0.3]}><sphereGeometry args={[0.012 + 0.012 * azar(i), 6, 5]} /><meshLambertMaterial color={i % 2 ? "#7a5234" : "#3f2814"} /></mesh>)}
      {/* tablas viejas (grises verdosas, arsénico) que se van, y nuevas (miel, cobre) que caen */}
      {!nuevas || fuera < 1 ? <Tablas c="#8f9e8c" dy={1.4 * fuera} giro={0.4 * fuera} o={1 - 0.6 * fuera} /> : null}
      {nuevas && <Tablas c="#c9a15e" dy={1.4 * (1 - entra)} giro={0} />}
      {humo && [...Array(12)].map((_, i) => { const u = ((t * 0.5 + azar(i)) % 1); const x = i % 2 ? X0 + W / 2 : X1 - W / 2; return (
        <mesh key={i} position={[x + 0.08 * Math.sin(t * 2 + i), H + 0.6 * u, -0.2 - azar(i + 20) * 0.8]} scale={0.6 + 0.8 * u}><sphereGeometry args={[0.04, 10, 8]} /><meshBasicMaterial color="#7dff4f" transparent opacity={0.55 * (1 - u)} /></mesh>); })}
      {/* el cobre extra: solo una franja de 1 pulgada junto a cada tabla */}
      {cobre > 0 && [X0 + W, X1 - W - 0.05].map((x) => <group key={x}>
        <Caja p={[x + 0.025, TIERRA / 2, 0.008]} s={[0.05, TIERRA, 0.004]} c="#ff8a2a" o={0.8 * cobre} sombra={false} recibe={false} />
        <Caja p={[x + 0.025, TIERRA + 0.003, ZB / 2]} s={[0.05, 0.004, -ZB - W]} c="#ff8a2a" o={0.7 * cobre} sombra={false} recibe={false} />
      </group>)}
      {/* sondas del estudio que entran en la tierra */}
      {sondas > 0 && t < T[7] && [-0.6, -0.33, -0.08, 0.14].map((x, i) => <group key={i} position={[x, lerp(1.0, 0.18, sondas), 0.03]}>
        <mesh><cylinderGeometry args={[0.008, 0.008, 0.45, 8]} /><meshLambertMaterial color="#d8dde3" /></mesh>
        <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.025, 0.025, 0.06, 10]} /><meshLambertMaterial color={i % 2 ? "#2f7bff" : "#ffd23f"} /></mesh>
      </group>)}
      <Tomatera x={-0.47} t={t} s={1} /><Tomatera x={-0.02} t={t} s={0.92} />
      {/* línea verde: sembrar unos centímetros adentro */}
      {linea > 0 && [X0 + W + 0.13, X1 - W - 0.13].map((x) => [...Array(8)].map((_, i) => <Caja key={`${x}${i}`} p={[x, TIERRA + 0.008, -0.08 - i * 0.15]} s={[0.018, 0.01, 0.08 * linea]} c="#27e24c" sombra={false} recibe={false} />))}
      {/* una tabla vieja de antes de 2004, apoyada en el pasto */}
      {vieja > 0 && <group position={[XF + 0.3, 0.0, -0.3]} rotation={[0, 0, 0.35]} scale={vieja}><Caja p={[0, 0.3, 0]} s={[0.07, 0.6, 0.2]} c="#8f9e8c" /></group>}
      {t >= T[9] && t < T[10] && <Preguntas t={t} a={T[9]} p={[XF + 0.1, 1.2, 0.4]} />}
      <Flo p={[XF, 0, 0.35]} t={t} habla={fH} giro={-0.4} ala={fAla} />
      <Norm p={[XN, nSalto, 0.4]} t={t} giro={0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Calavera: React.FC<{ x: number; y: number; o: number; s: number }> = ({ x, y, o, s }) => o <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={78} fill="#fff" stroke="#14321f" strokeWidth={10} /><rect x={-42} y={50} width={84} height={46} rx={12} fill="#fff" stroke="#14321f" strokeWidth={10} />
    <circle cx={-28} cy={0} r={20} fill="#14321f" /><circle cx={28} cy={0} r={20} fill="#14321f" /><path d="M0 22 l-10 20 h20z" fill="#14321f" />
    {[-20, 0, 20].map((d) => <line key={d} x1={d} y1={58} x2={d} y2={92} stroke="#14321f" strokeWidth={6} />)}
  </g>
);

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [bx, by] = pantalla(t, [X1 - W, TIERRA + 0.05, 0]);
  const [tx, ty] = pantalla(t, [-0.02, 0.74, -0.45]);
  const [vx, vy] = pantalla(t, [XF + 0.3, 0.45, -0.3]);
  const anio = t < T[3] + 1.9 ? "2003" : "2004";
  const lupa = v(T[8] + 0.1, T[9]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="TREATED WOOD" abajo="POISON?" color="#7dff4f" />
      <Calavera x={540} y={620} o={Math.min(pr(t, 0.3, 0.55), 1 - pr(t, T[1] - 0.2, T[1]))} s={1 + 0.06 * Math.sin(t * 14)} />
      <Grande s="ARSENIC?!" o={v(T[2] + 0.3, T[3])} col="#7dff4f" borde="#14321f" tam={130} />
      {v(T[3] + 0.3, T[4]) > 0 && <g opacity={v(T[3] + 0.3, T[4])} transform="translate(540 330)">
        <rect x={-190} y={-120} width={380} height={230} rx={26} fill="#fff" stroke="#14321f" strokeWidth={10} />
        <rect x={-190} y={-120} width={380} height={70} rx={26} fill="#e8312a" /><text y={-68} fontSize={48} fill="#fff">END OF</text>
        <text y={70} fontSize={110} fill={anio === "2003" ? "#14321f" : "#27c24c"}>{anio}</text></g>}
      <Grande s="NO MORE ARSENIC" o={v(T[3] + 2.5, T[4])} col="#fff" borde="#14321f" tam={84} y={640} />
      <Grande s="TOTALLY CLEAN?" o={v(T[4] + 0.1, T[5])} col="#ff4f9a" borde="#fff" tam={110} />
      <Grande s="NOW: COPPER" o={v(T[5] + 0.3, T[6])} col="#ff8a2a" borde="#fff" tam={120} />
      <Grande s="YEARS OF TESTS" o={v(T[6] + 0.3, T[7])} col="#fff" borde="#14321f" tam={104} />
      <Grande s="OREGON STATE STUDY" o={v(T[6] + 0.3, T[7])} col="#ffd23f" borde="#14321f" tam={62} y={400} />
      {v(T[7] + 0.5, T[8]) > 0 && <g opacity={v(T[7] + 0.5, T[8])}>
        <line x1={bx - 170} y1={by - 60} x2={bx} y2={by - 60} stroke="#fff" strokeWidth={14} /><line x1={bx - 170} y1={by - 60} x2={bx} y2={by - 60} stroke="#14321f" strokeWidth={6} />
        {[bx - 170, bx].map((x) => <line key={x} x1={x} y1={by - 95} x2={x} y2={by - 25} stroke="#14321f" strokeWidth={8} />)}
        <Etiqueta s="~1 INCH" x={bx - 85} y={by - 90} o={1} col="#ff8a2a" tam={76} />
      </g>}
      <Grande s="STAYS BY THE BOARD" o={v(T[7] + 0.5, T[8])} col="#fff" borde="#14321f" tam={74} y={1300} />
      {lupa > 0 && <g opacity={lupa} transform={`translate(${tx} ${ty}) scale(${0.8 + 0.2 * lupa})`}>
        <circle r={150} fill="#ffffff22" stroke="#14321f" strokeWidth={22} /><circle r={150} fill="none" stroke="#fff" strokeWidth={8} />
        <line x1={105} y1={105} x2={210} y2={210} stroke="#14321f" strokeWidth={34} strokeLinecap="round" /></g>}
      <Grande s="NO COPPER BUILDUP ✓" o={lupa} col="#27c24c" borde="#fff" tam={78} />
      <Grande s="THE CATCH?" o={v(T[9] + 0.1, T[10])} col="#ff4f9a" borde="#fff" tam={120} />
      {v(T[10] + 0.4, T[10] + 1.8) > 0 && <g opacity={v(T[10] + 0.4, T[10] + 1.8)}>
        <g transform={`translate(${Math.min(980, vx)} ${vy})`} stroke="#ff2a2a" strokeWidth={22} strokeLinecap="round"><line x1={-60} y1={-60} x2={60} y2={60} /><line x1={60} y1={-60} x2={-60} y2={60} /></g>
        <Grande s="OLD BOARDS (PRE-2004) ✗" o={1} col="#ff2a2a" borde="#fff" tam={66} /></g>}
      <Grande s="PLANT A FEW INCHES IN ✓" o={v(T[10] + 1.8, T[11])} col="#27c24c" borde="#fff" tam={66} />
      <Sello t={t} a={T[11] + 0.5} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="SAFE" der="POISON" colIzq="#27c24c" colDer="#ff4f9a" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: CAN ROCKS EXPLODE IN A FIRE PIT?" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const TreatedVideo: React.FC = () => {
  const t = useCurrentFrame() / TRE_FPS;
  return <Marco t={t} seg={TRE_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={tiempos.palabras as Palabra[]} claves={CLAVES} ocultoDesde={T[13] - 0.05} />;
};
