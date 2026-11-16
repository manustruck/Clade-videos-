// «Can river rocks explode in a fire pit?» — capítulo 11 del canal en inglés (vertical 1080x1920, 30 cps, three.js).
// Diálogo Flo vs Norm. Una fogata con piedras de río; una lupa muestra el agua atrapada dentro de una piedra, que se
// vuelve vapor, la agrieta y la revienta. La solución: ladrillo refractario en el anillo y las piedras de río al jardín.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, azar, rebote, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, Tramo, V3, hacerCamara, PonerCamara, Patio, Preguntas, ventana, Grande, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const FIRE_FPS = 30, FIRE_SEG = duracion(tiempos), FIRE_CUADROS = Math.round(FIRE_FPS * FIRE_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["rock", "river", "blow", "fire", "pit", "myth", "explode", "water", "trapped", "steam", "cracks", "pops", "dry", "rain", "brick", "dense", "stone", "flames", "garden", "danger", "team", "follow", "like"];
const CX = -0.25, CZ = -0.45, R = 0.48, N = 14; // anillo de la fogata
const XN = -1.1, XF = 0.6, JX = 1.3; // Norm, Flo y el borde de jardín
const POP1 = 0.9, POP2 = (PAL.find((p) => p.a > T[5] && /pops/i.test(p.p))?.a ?? T[6] - 1) + 0.15;
const HERO: V3 = [CX, 0.06, CZ + R];

const C = {
  gancho: { pos: [CX, 0.55, 2.6], look: [CX, 0.2, -0.2] } as Cam, gancho2: { pos: [CX, 0.5, 2.2], look: [CX, 0.18, -0.2] } as Cam,
  dos: { pos: [-0.2, 0.65, 6.4], look: [-0.2, 0.5, 0] } as Cam, dos2: { pos: [-0.2, 0.6, 5.9], look: [-0.25, 0.48, 0] } as Cam,
  flo: { pos: [XF, 0.85, 2.7], look: [XF, 0.7, 0] } as Cam, flo2: { pos: [XF, 0.85, 2.3], look: [XF, 0.72, 0] } as Cam,
  piedra: { pos: [CX, 0.35, 1.5], look: [CX, 0.1, 0] } as Cam, piedra2: { pos: [CX, 0.3, 1.15], look: [CX, 0.09, 0] } as Cam,
  fuego: { pos: [CX, 0.7, 2.6], look: [CX, 0.25, -0.45] } as Cam, fuego2: { pos: [CX, 0.6, 2.2], look: [CX, 0.22, -0.45] } as Cam,
  lluvia: { pos: [CX, 0.9, 3.6], look: [CX, 0.4, -0.3] } as Cam, lluvia2: { pos: [CX, 0.8, 3.1], look: [CX, 0.35, -0.3] } as Cam,
  ancho: { pos: [0.1, 0.8, 6.6], look: [0.1, 0.45, 0] } as Cam, ancho2: { pos: [0.1, 0.75, 6.0], look: [0.1, 0.42, 0] } as Cam,
  jardin: { pos: [JX - 0.2, 0.6, 2.8], look: [JX - 0.2, 0.25, -0.2] } as Cam, jardin2: { pos: [JX - 0.2, 0.55, 2.4], look: [JX - 0.2, 0.25, -0.2] } as Cam,
  equipo: { pos: [-0.1, 0.8, 5.0], look: [-0.1, 1.05, 0] } as Cam, fin: { pos: [0.1, 0.8, 6.2], look: [0.1, 1.25, 0] } as Cam,
};
const TRAMOS: Tramo[] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2], [T[3], T[4], C.piedra, C.piedra2], [T[4], T[5], C.fuego, C.fuego2],
  [T[5], T[6], C.piedra2, C.piedra], [T[6], T[7], C.flo, C.flo2], [T[7], T[8], C.lluvia, C.lluvia2], [T[8], T[9], C.flo2, C.flo], [T[9], T[10], C.fuego, C.ancho2],
  [T[10], T[11], C.jardin, C.jardin2], [T[11], T[12], C.flo2, C.flo], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const golpe = (t: number, a: number) => (t >= a && t < a + 0.35 ? 0.05 : 0);
const { camEn, pantalla } = hacerCamara(TRAMOS, (t) => golpe(t, POP1) + golpe(t, POP2));

const angulo = (i: number) => Math.PI / 2 + (i / N) * Math.PI * 2;
const PIEDRAS = [...Array(N)].map((_, i) => ({ x: CX + R * Math.cos(angulo(i)), z: CZ + R * Math.sin(angulo(i)), s: 0.085 + 0.02 * azar(i + 3), c: ["#8d9aa6", "#a7a39a", "#7f8c8a", "#b3aca0"][i % 4], g: azar(i + 9) * 3 }));

/** pedazos que salen volando cuando la piedra revienta */
const Pedazos: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const d = t - a; if (d < 0 || d > 1.3) return null;
  return <group>
    {[...Array(10)].map((_, i) => { const an = azar(i + 70) * Math.PI * 2, v = 1.2 + azar(i + 71); return (
      <mesh key={i} position={[HERO[0] + Math.cos(an) * v * d * 0.6, HERO[1] + 1.6 * d - 2.4 * d * d + 0.05, HERO[2] + Math.abs(Math.sin(an)) * v * d * 0.5]} rotation={[d * 9 + i, d * 7, 0]}>
        <dodecahedronGeometry args={[0.025 + 0.015 * azar(i + 72), 0]} /><meshLambertMaterial color="#8d9aa6" /></mesh>); })}
    {[...Array(6)].map((_, i) => <mesh key={`v${i}`} position={[HERO[0] + (azar(i + 80) - 0.5) * 0.3, HERO[1] + 0.1 + 0.5 * d, HERO[2]]} scale={0.5 + 2.5 * d}><sphereGeometry args={[0.06, 10, 8]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.7 * (1 - d / 1.3)} /></mesh>)}
    {d < 0.15 && <mesh position={HERO}><sphereGeometry args={[0.14 * (1 - d / 0.15) + 0.03, 12, 10]} /><meshBasicMaterial color="#fff3a0" transparent opacity={0.9} /></mesh>}
  </group>;
};

const Fuego: React.FC<{ t: number; f: number }> = ({ t, f }) => f <= 0 ? null : (
  <group position={[CX, 0.02, CZ]}>
    {[[-0.12, 0.4], [0.12, -0.4], [0, 1.2]].map(([dx, rot], i) => <mesh key={i} position={[dx * 0.5, 0.04, 0]} rotation={[0, rot, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.035, 0.42, 8]} /><meshLambertMaterial color="#6b3d1e" /></mesh>)}
    {[...Array(7)].map((_, i) => { const fl = 0.75 + 0.25 * Math.sin(t * 13 + i * 2.1) + 0.1 * Math.sin(t * 29 + i); return (
      <mesh key={i} position={[(azar(i + 30) - 0.5) * 0.25, 0.1 + 0.12 * f * fl, (azar(i + 31) - 0.5) * 0.2]} scale={[f, f * fl, f]}>
        <coneGeometry args={[0.07 - 0.005 * i, 0.32 - 0.02 * i, 8]} /><meshBasicMaterial color={i % 3 === 0 ? "#ffd23f" : i % 3 === 1 ? "#ff8a1a" : "#ff4a1a"} transparent opacity={0.92} /></mesh>); })}
    <pointLight position={[0, 0.35, 0.1]} color="#ff9a3a" intensity={1.6 * f} distance={2.5} />
  </group>
);

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const gancho = t < T[1];
  const fuego = gancho ? 1 : t < T[4] ? 0.35 : pr(t, T[4] + 0.1, T[4] + 1.0) * 0.7 + 0.3;
  const heroVisible = !(t >= POP1 && t < T[1]) && !(t >= POP2 && t < T[9]);
  const heroRojo = t >= T[4] + 0.6 && t < POP2 ? pr(t, T[4] + 0.6, POP2) : 0;
  const tiembla = (t >= POP2 - 1.4 && t < POP2) || (t >= 0.3 && t < POP1) ? 0.01 * Math.sin(t * 80) : 0;
  const saleRio = t >= T[9] ? pr(t, T[9] + 0.3, T[9] + 0.9) : 0;
  const ladrillo = t >= T[9] ? rebote(pr(t, T[9] + 0.7, T[9] + 1.5)) : 0;
  const jardin = t >= T[10] ? pr(t, T[10] + 0.1, T[10] + 1.6) : 0;
  const lluvia = t >= T[7] && t < T[8] + 0.3;
  const fH = habla(t, 1), nH = habla(t, 0);
  const susto = (d: number) => (d >= 0 && d < 0.6 ? Math.sin((d / 0.6) * Math.PI) * 0.18 : 0);
  const fSalto = susto(t - POP1) + susto(t - POP2);
  const fAla = gancho || (t >= POP2 && t < POP2 + 0.8) ? 1 : t >= T[11] && t < T[12] ? 0.7 : fH * 0.7;
  const nBrazo = (t >= T[9] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} huecos={[[CX - R - 0.15, CX + R + 0.15]]} />
      <mesh position={[CX, 0.012, CZ]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[R + 0.05, 32]} /><meshLambertMaterial color="#3b2a1c" /></mesh>
      {PIEDRAS.map((p, i) => i === 0 ? null : saleRio < 1 && <mesh key={i} position={[p.x, p.s * 0.6, p.z]} rotation={[0, p.g, 0]} scale={[1.25 * (1 - saleRio), 0.7 * (1 - saleRio), 1 * (1 - saleRio)]} castShadow>
        <sphereGeometry args={[p.s, 16, 12]} /><meshLambertMaterial color={p.c} /></mesh>)}
      {heroVisible && saleRio < 1 && <mesh position={[HERO[0] + tiembla, HERO[1], HERO[2]]} scale={[1.3 * (1 - saleRio), 0.75 * (1 - saleRio), 1.05 * (1 - saleRio)]} castShadow>
        <sphereGeometry args={[0.09, 18, 14]} /><meshLambertMaterial color={`rgb(${Math.round(lerp(141, 230, heroRojo))}, ${Math.round(lerp(154, 90, heroRojo))}, ${Math.round(lerp(166, 60, heroRojo))})`} /></mesh>}
      <Pedazos t={t} a={POP1} /><Pedazos t={t} a={POP2} />
      {ladrillo > 0 && [...Array(12)].map((_, i) => { const an = Math.PI / 2 + (i / 12) * Math.PI * 2; return (
        <group key={i} position={[CX + R * Math.cos(an), 0.06 + 0.8 * (1 - ladrillo), CZ + R * Math.sin(an)]} rotation={[0, -an + Math.PI / 2, 0]}>
          <Caja p={[0, 0, 0]} s={[0.24, 0.11, 0.1]} c="#b5482a" /><Caja p={[0, 0.056, 0]} s={[0.24, 0.004, 0.1]} c="#d9785a" sombra={false} />
        </group>); })}
      <Fuego t={t} f={fuego} />
      {lluvia && [...Array(40)].map((_, i) => { const u = (t * 1.6 + azar(i + 5)) % 1; return <mesh key={i} position={[CX + (azar(i + 6) - 0.5) * 2.2, 2.0 - 2.0 * u, -0.9 + azar(i + 7) * 1.2]}><cylinderGeometry args={[0.005, 0.005, 0.12, 4]} /><meshBasicMaterial color="#4fb3ff" /></mesh>; })}
      {/* borde de jardín con las piedras de río, lejos del fuego */}
      {jardin > 0 && <group>
        <Caja p={[JX, 0.012, -0.35]} s={[0.9, 0.02, 0.7]} c="#4a3220" sombra={false} />
        {[...Array(9)].map((_, i) => { const s = pr(jardin, i / 12, i / 12 + 0.25); return s > 0 && <mesh key={i} position={[JX - 0.4 + (i % 5) * 0.2, 0.05, -0.05 - Math.floor(i / 5) * 0.55]} scale={[1.25 * s, 0.7 * s, s]} castShadow><sphereGeometry args={[0.08, 14, 10]} /><meshLambertMaterial color={PIEDRAS[i].c} /></mesh>; })}
        {[-0.2, 0.15].map((dx, i) => <group key={i} position={[JX + dx, 0, -0.35]} scale={jardin}>
          <mesh position={[0, 0.17, 0]}><cylinderGeometry args={[0.01, 0.01, 0.34, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
          {[...Array(5)].map((_, j) => <mesh key={j} position={[0.04 * Math.cos(j * 1.3), 0.35 + 0.04 * Math.sin(j * 1.3), 0]}><sphereGeometry args={[0.03, 8, 6]} /><meshLambertMaterial color={i ? "#ffd23f" : "#c56bff"} /></mesh>)}
        </group>)}
      </group>}
      {t >= T[8] && t < T[9] && <Preguntas t={t} a={T[8]} p={[XF + 0.1, 1.2, 0.4]} />}
      <Flo p={[XF, fSalto, 0.35]} t={t} habla={fH} giro={-0.4} ala={fAla} />
      <Norm p={[XN, nSalto, 0.4]} t={t} giro={0.5} grieta brazo={nBrazo} />
    </group>
  );
};

/** la lupa: el interior de la piedra con agua atrapada, que se vuelve vapor, la agrieta y la revienta */
const Interior: React.FC<{ t: number }> = ({ t }) => {
  const o = Math.min(pr(t, T[3] + 0.3, T[3] + 0.6), 1 - pr(t, POP2 + 0.2, POP2 + 0.6), t < T[6] ? 1 : 0) || (t >= T[7] + 0.3 && t < T[8] ? ventana(t, T[7] + 0.3, T[8]) : 0);
  if (o <= 0) return null;
  const lluvia = t >= T[7];
  const vapor = lluvia ? 0 : t >= T[4] + 0.5 ? pr(t, T[4] + 0.5, T[4] + 1.5) : 0;
  const grieta = lluvia ? 0 : t >= T[5] + 0.4 ? pr(t, T[5] + 0.4, POP2 - 0.2) : 0;
  const boom = lluvia ? 0 : t >= POP2 ? pr(t, POP2, POP2 + 0.35) : 0;
  const poros = [...Array(16)].map((_, i) => [(azar(i + 100) - 0.5) * 260, (azar(i + 101) - 0.5) * 170, 9 + 7 * azar(i + 102)]);
  return (
    <g opacity={o} transform="translate(540 680) scale(1.2)">
      <text y={-235} fontSize={56} fill="#fff" stroke="#14321f" strokeWidth={12} paintOrder="stroke">INSIDE THE ROCK</text>
      <circle r={200} fill="#cfe9ff" stroke="#14321f" strokeWidth={14} />
      <g transform={`scale(${1 + 0.15 * boom})`} opacity={1 - boom}>
        <ellipse rx={165} ry={115} fill="#8d9aa6" stroke="#5f6b75" strokeWidth={8} />
        {poros.map(([x, y, r], i) => { const w = vapor * (0.6 + 0.4 * Math.sin(t * 10 + i)); return <circle key={i} cx={x} cy={y} r={r * (1 + 0.5 * w)} fill={w > 0.3 ? "#ffffff" : "#2f8bff"} stroke={w > 0.3 ? "#cfd8e3" : "#1a5fc0"} strokeWidth={3} />; })}
        {grieta > 0 && <path d="M-160 -10 L-90 10 L-40 -25 L10 15 L60 -10 L110 20 L160 0" fill="none" stroke="#14321f" strokeWidth={8} strokeDasharray={420} strokeDashoffset={420 * (1 - grieta)} />}
      </g>
      {boom > 0 && <text y={30} fontSize={120} fill="#ff4a1a" stroke="#fff" strokeWidth={20} paintOrder="stroke" opacity={1 - 0.5 * boom}>POP!</text>}
    </g>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [hx, hy] = pantalla(t, HERO);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="CAN ROCKS" abajo="EXPLODE?" color="#ff6a1a" />
      {t >= POP1 && t < POP1 + 0.6 && <text x={hx} y={hy - 120} fontSize={150} fill="#ffd23f" stroke="#ff4a1a" strokeWidth={22} paintOrder="stroke" opacity={1 - (t - POP1) / 0.6}>POP!</text>}
      <Grande s="IT'S A MYTH!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="WATER TRAPPED INSIDE" o={v(T[3] + 0.6, T[4])} col="#2f8bff" borde="#fff" tam={66} y={1000} />
      <Grande s="WATER → STEAM" o={v(T[4] + 0.6, T[5])} col="#fff" borde="#14321f" tam={84} y={1000} />
      <Grande s="NOWHERE TO GO" o={v(T[5] + 0.2, POP2)} col="#ff4a1a" borde="#fff" tam={84} y={1000} />
      <Grande s="MINE ARE DRY!" o={v(T[6] + 0.1, T[7])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="DRY OUTSIDE ≠ DRY INSIDE" o={v(T[7] + 0.3, T[8])} col="#fff" borde="#14321f" tam={64} y={1000} />
      <Grande s="SO… NOTHING?" o={v(T[8] + 0.1, T[9])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="FIRE BRICK ✓" o={v(T[9] + 0.9, T[10])} col="#27c24c" borde="#fff" tam={120} />
      <Grande s="OR DENSE FIRE-PIT STONE" o={v(T[9] + 0.9, T[10])} col="#fff" borde="#14321f" tam={58} y={400} />
      <Grande s="RIVER ROCK: GARDEN ONLY" o={v(T[10] + 0.3, T[11])} col="#2f8bff" borde="#fff" tam={64} />
      <Interior t={t} />
      <Sello t={t} a={T[11] + 0.5} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="MYTH" der="DANGER" colIzq="#ff4f9a" colDer="#ff6a1a" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: WHY YOUR CONCRETE CRACKS" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const FirePitVideo: React.FC = () => {
  const t = useCurrentFrame() / FIRE_FPS;
  return <Marco t={t} seg={FIRE_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} />;
};
