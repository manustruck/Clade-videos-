// «This deck railing won't hold you» — capítulo 13 del canal en inglés (vertical 1080x1920, 30 cps, three.js).
// Diálogo Flo vs Norm. Una terraza cortada en z = 0: la viga de borde (rim), una vigueta, el poste del barandal atornillado
// solo a la viga de borde. Al empujar arriba, el poste hace palanca y arranca la viga. Arreglo: bloqueo, pernos pasantes y
// un anclaje metálico que lleva la carga a las viguetas.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, rebote, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, Tramo, hacerCamara, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const RAIL_FPS = 30, RAIL_SEG = duracion(tiempos), RAIL_CUADROS = Math.round(RAIL_FPS * RAIL_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["railing", "hold", "leaning", "screwed", "solid", "one", "board", "rim", "crowbar", "pries", "lean", "code", "two", "hundred", "pounds", "quarter", "virginia", "fix", "joists", "blocking", "bolts", "hold", "down", "whole", "deck", "carefully", "safe", "fall", "team", "follow", "like"];
const X0 = -1.35, X1 = 0.2, DY = 0.78, VIGA = 0.22, TABLA = 0.035; // terraza de X0 a X1, piso arriba en DY
const PH = 0.85, PX = X1 + 0.045, PB = DY - VIGA; // poste: alto sobre el piso, x, base
const XN = -0.95, XF = -0.22;

const C = {
  gancho: { pos: [0.1, 1.25, 4.0], look: [0.1, 1.05, 0] } as Cam, gancho2: { pos: [0.15, 1.2, 3.6], look: [0.15, 1.0, 0] } as Cam,
  dos: { pos: [-0.45, 1.15, 6.6], look: [-0.45, 0.95, 0] } as Cam, dos2: { pos: [-0.45, 1.1, 6.1], look: [-0.45, 0.92, 0] } as Cam,
  flo: { pos: [XF, 1.65, 2.8], look: [XF, 1.5, 0] } as Cam, flo2: { pos: [XF, 1.65, 2.4], look: [XF, 1.52, 0] } as Cam,
  rim: { pos: [X1, 0.75, 1.6], look: [X1, 0.68, 0] } as Cam, rim2: { pos: [X1, 0.72, 1.3], look: [X1, 0.67, 0] } as Cam,
  poste: { pos: [X1, 1.15, 3.2], look: [X1, 1.0, 0] } as Cam, poste2: { pos: [X1, 1.1, 2.8], look: [X1, 0.98, 0] } as Cam,
  arreglo: { pos: [X1 - 0.15, 0.7, 2.0], look: [X1 - 0.15, 0.66, 0] } as Cam, arreglo2: { pos: [X1 - 0.15, 0.7, 1.7], look: [X1 - 0.15, 0.66, 0] } as Cam,
  ancho: { pos: [-0.45, 1.2, 5.6], look: [-0.45, 0.85, 0] } as Cam,
  equipo: { pos: [-0.4, 1.3, 5.0], look: [-0.4, 1.55, 0] } as Cam, fin: { pos: [-0.4, 1.3, 6.2], look: [-0.4, 1.75, 0] } as Cam,
};
const TRAMOS: Tramo[] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2], [T[3], T[4], C.rim, C.rim2], [T[4], T[5], C.poste, C.poste2],
  [T[5], T[6], C.flo, C.flo2], [T[6], T[8], C.poste2, C.poste], [T[8], T[9], C.flo2, C.flo], [T[9], T[10], C.arreglo, C.arreglo2], [T[10], T[11], C.ancho, C.ancho],
  [T[11], T[12], C.flo, C.flo2], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const { camEn, pantalla } = hacerCamara(TRAMOS, (t) => (t >= 0.75 && t < 1.15 ? 0.05 : 0));

/** el poste del barandal con su baranda; gira alrededor de su base (palanca hacia afuera) */
const Barandal: React.FC<{ giro: number; brillo: number }> = ({ giro, brillo }) => (
  <group position={[PX, PB, 0]} rotation={[0, 0, -giro]}>
    <Caja p={[0, (PH + VIGA) / 2, 0.02]} s={[0.09, PH + VIGA, 0.09]} c="#c9a15e" />
    <Caja p={[-0.1, PH + VIGA + 0.02, -0.6]} s={[0.24, 0.04, 1.3]} c="#c9a15e" />
    {[...Array(6)].map((_, i) => <Caja key={i} p={[-0.02, VIGA + 0.06 + (PH - 0.1) / 2, -0.2 - i * 0.2]} s={[0.04, PH - 0.1, 0.04]} c="#d8b577" />)}
    {[0.07, 0.15].map((y) => <mesh key={y} position={[-0.06, y, 0.06]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.012, 0.012, 0.2, 8]} /><meshBasicMaterial color={brillo > 0 ? `rgb(255, ${Math.round(lerp(200, 230, brillo))}, 60)` : "#9aa3ab"} /></mesh>)}
  </group>
);

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const gancho = t < T[1];
  const cae = gancho ? pr(t, 0.4, 1.0) : 0;
  const fijo = t >= T[9] + 0.4;
  const palanca = gancho ? 0.55 * cae : t >= T[4] && t < T[5] ? 0.08 + 0.06 * Math.sin((t - T[4]) * 5) : 0;
  const giro = fijo ? 0 : palanca;
  const brillo = t >= T[3] && t < T[4] ? 0.5 + 0.5 * Math.sin(t * 10) : 0;
  const rimSale = fijo ? 0 : giro * 0.6; // la viga de borde se despega junto con el poste
  const bloqueo = t >= T[9] ? rebote(pr(t, T[9] + 0.4, T[9] + 1.0)) : 0;
  const pernos = t >= T[9] ? pr(t, T[9] + 1.5, T[9] + 2.0) : 0;
  const anclaje = t >= T[9] ? rebote(pr(t, T[9] + 2.6, T[9] + 3.2)) : 0;
  const verde = t >= T[10] && t < T[11] ? 0.5 + 0.5 * Math.sin((t - T[10]) * 6) : 0;
  const fH = habla(t, 1), nH = habla(t, 0);
  // Flo se apoya en la baranda; en el gancho cae por encima hacia el pasto
  const apoyo = (t >= T[2] && t < T[3]) || (t >= T[11] && t < T[12]) || t < 0.4 ? 1 : 0;
  const caida = gancho ? pr(t, 0.6, 1.5) : 0;
  const fx = lerp(XF, X1 + 0.8, caida), fy = gancho ? lerp(DY, 0, rebote(pr(t, 0.7, 1.5))) : DY;
  const fCae = gancho ? Math.min(1, cae * 1.4) : apoyo * 0.18 * (t >= T[11] ? 0.6 : 1);
  const fAla = gancho ? 1 : t >= T[11] && t < T[12] ? 0.4 : fH * 0.7;
  const nBrazo = (t >= T[3] && t < T[5]) || (t >= T[9] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  const madera = verde > 0 ? `rgb(${Math.round(lerp(185, 80, verde))}, ${Math.round(lerp(140, 210, verde))}, ${Math.round(lerp(80, 90, verde))})` : "#b98c50";
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} />
      {/* pilares, vigueta (vista en el corte) y piso */}
      {[X0 + 0.15, X1 - 0.2].map((x) => <Caja key={x} p={[x, (DY - VIGA) / 2, -0.05]} s={[0.1, DY - VIGA, 0.1]} c="#a87b45" />)}
      <Caja p={[(X0 + X1) / 2 - 0.03, DY - VIGA / 2, 0.0]} s={[X1 - X0 - 0.06, VIGA, 0.05]} c={madera} />
      <Caja p={[(X0 + X1) / 2, DY + TABLA / 2, -0.7]} s={[X1 - X0, TABLA, 1.5]} c="#c9a15e" />
      {[...Array(9)].map((_, i) => <Caja key={i} p={[X0 + 0.085 + i * 0.172, DY + TABLA + 0.001, -0.7]} s={[0.006, 0.002, 1.5]} c="#9c7a44" sombra={false} recibe={false} />)}
      {/* viga de borde (rim): gira con el poste mientras no esté amarrada */}
      <group position={[X1, PB, 0]} rotation={[0, 0, -rimSale]}><Caja p={[-0.025, VIGA / 2, -0.7]} s={[0.05, VIGA, 1.5]} c={brillo > 0 ? "#ffcf6a" : "#b98c50"} /></group>
      {/* el arreglo: bloque entre viguetas, pernos pasantes y anclaje metálico */}
      {bloqueo > 0 && <Caja p={[X1 - 0.12, DY - VIGA / 2 + 0.6 * (1 - bloqueo), 0.03]} s={[0.17, VIGA - 0.02, 0.05]} c="#e0b46a" />}
      {pernos > 0 && [0.06, 0.15].map((y) => <mesh key={y} position={[X1 - 0.12 * pernos + 0.06, PB + y, 0.065]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.012, 0.012, 0.36 * pernos, 8]} /><meshLambertMaterial color="#5d6a75" /></mesh>)}
      {anclaje > 0 && <group position={[X1 - 0.23, PB + 0.11, 0.07]} scale={anclaje}><Caja p={[0, 0, 0]} s={[0.05, 0.18, 0.02]} c="#9aa7b2" /><Caja p={[0.04, -0.08, 0]} s={[0.1, 0.03, 0.02]} c="#9aa7b2" /></group>}
      <Barandal giro={giro} brillo={brillo} />
      {t >= T[8] && t < T[9] && <Preguntas t={t} a={T[8]} p={[XF + 0.1, DY + 1.2, 0.4]} />}
      {t >= T[5] && t < T[6] && <Preguntas t={t} a={T[5]} p={[XF + 0.1, DY + 1.2, 0.4]} />}
      <Flo p={[fx, fy, 0.3]} t={t} habla={fH} cae={fCae} giro={0.3} ala={fAla} />
      <Norm p={[XN, DY + TABLA + nSalto, 0.35]} t={t} giro={0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [tx, ty] = pantalla(t, [PX, DY + PH, 0.05]);
  const [rx, ry] = pantalla(t, [X1, PB + VIGA / 2, 0.05]);
  const [bx, by] = pantalla(t, [PX, PB + 0.02, 0.05]);
  const fuerza = v(T[6] + 0.2, T[7]);
  const cuarto = v(T[7] + 0.3, T[8]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="THIS RAILING" abajo="WON'T HOLD" color="#ff4a1a" tamAbajo={120} />
      <Grande s="IT'S SOLID!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="ONE BOARD ONLY" o={v(T[3] + 0.3, T[4])} col="#ff2a2a" borde="#fff" tam={96} />
      <Etiqueta s="RIM" x={rx - 150} y={ry + 10} o={v(T[3] + 0.6, T[4])} col="#ffd23f" borde="#14321f" tam={70} />
      <Grande s="= CROWBAR" o={v(T[4] + 0.3, T[5])} col="#ff2a2a" borde="#fff" tam={120} />
      {v(T[4] + 0.3, T[5]) > 0 && <g opacity={v(T[4] + 0.3, T[5])}>
        <path d={`M${tx - 230} ${ty} h150 v-30 l70 50 l-70 50 v-30 h-150z`} fill="#ff2a2a" stroke="#fff" strokeWidth={8} />
        <circle cx={bx} cy={by} r={26} fill="none" stroke="#ffd23f" strokeWidth={10} /></g>}
      <Grande s="JUST ONE LEAN?" o={v(T[5] + 0.1, T[6])} col="#ff4f9a" borde="#fff" tam={110} />
      {fuerza > 0 && <g opacity={fuerza}>
        <path d={`M${tx - 300} ${ty - 40} h190 v-34 l80 56 l-80 56 v-34 h-190z`} fill="#ffd23f" stroke="#14321f" strokeWidth={8} />
</g>}
      <Grande s="CODE: 200 LB" o={v(T[6] + 0.2, T[7])} col="#fff" borde="#14321f" tam={110} />
      {cuarto > 0 && <g opacity={cuarto} transform="translate(540 420)">
        <text y={-70} fontSize={56} fill="#fff" stroke="#14321f" strokeWidth={12} paintOrder="stroke">VIRGINIA TECH TESTS</text>
        <rect x={-400} y={-30} width={800} height={70} rx={20} fill="#ffffff" stroke="#14321f" strokeWidth={8} />
        <rect x={-396} y={-26} width={792 * 0.25 * pr(t, T[7] + 0.5, T[7] + 1.4)} height={62} rx={16} fill="#ff2a2a" />
        <text x={-400} y={110} textAnchor="start" fontSize={50} fill="#ff2a2a" stroke="#fff" strokeWidth={10} paintOrder="stroke">~¼</text>
        <text x={400} y={110} textAnchor="end" fontSize={50} fill="#27c24c" stroke="#fff" strokeWidth={10} paintOrder="stroke">200 LB</text></g>}
      <Grande s="HOW DO I FIX IT?" o={v(T[8] + 0.05, T[9])} col="#ff4f9a" borde="#fff" tam={100} />
      <Grande s="BLOCKING" o={v(T[9] + 0.5, T[10])} col="#27c24c" borde="#fff" tam={90} y={290} />
      <Grande s="THROUGH BOLTS" o={v(T[9] + 1.6, T[10])} col="#27c24c" borde="#fff" tam={90} y={390} />
      <Grande s="METAL HOLD-DOWN" o={v(T[9] + 2.7, T[10])} col="#27c24c" borde="#fff" tam={90} y={490} />
      <Grande s="INTO THE WHOLE DECK ✓" o={v(T[10] + 0.2, T[11])} col="#27c24c" borde="#fff" tam={76} />
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="SAFE" der="FALL" colIzq="#27c24c" colDer="#ff4f9a" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR LADDER ANGLE IS WRONG" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const RailingVideo: React.FC = () => {
  const t = useCurrentFrame() / RAIL_FPS;
  return <Marco t={t} seg={RAIL_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} />;
};
