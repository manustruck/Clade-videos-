// «Your pavers will wave» — capítulo 6 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Corte del suelo en z = 0.
// Mal: adoquines sobre tierra; con lluvia y helada la tierra se mueve y el patio ondula. Bien: piedra compactada, arena, adoquines y bordes.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { cl, pr, lerp, azar, rebote, Caja, Norm } from "../fence-01/Fence";
import { Subtitulos, Palabra } from "../comun/Subtitulos";
import tiempos from "./tiempos.json";

export const PAV_FPS = 30, PAV_SEG = Math.round((tiempos.total + 1.1) * 10) / 10, PAV_CUADROS = Math.round(PAV_FPS * PAV_SEG);
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3 };
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const CLAVES = ["pavers", "patio", "waves", "wave", "base", "crushed", "stone", "sand", "edges", "rains", "winter", "sink", "trips", "layers", "dirt", "follow", "whoops", "fault", "under", "comments"];
const PROF = 4.5, NP = 11, PW = 0.3, PH = 0.06, TOPE = 0.025, FONDO = -0.215, ARENA_A = -0.065, ARENA_B = -0.04;
const px = (i: number) => -1.5 + i * PW;

const C = {
  gancho: { pos: [0.25, 0.3, 5.4], look: [0.25, 0.12, 0] } as Cam, gancho2: { pos: [0.3, 0.25, 4.8], look: [0.3, 0.1, 0] } as Cam,
  causa: { pos: [0.0, 0.3, 5.2], look: [0.0, -0.02, 0] } as Cam, causa2: { pos: [0.0, 0.15, 4.6], look: [0.0, -0.08, 0] } as Cam,
  coloca: { pos: [0.0, 0.3, 6.0], look: [0.0, 0.08, 0] } as Cam, coloca2: { pos: [0.0, 0.25, 5.4], look: [0.0, 0.05, 0] } as Cam,
  ancho: { pos: [0.0, 0.35, 6.8], look: [0.0, 0.1, 0] } as Cam, ancho2: { pos: [0.0, 0.3, 6.2], look: [0.0, 0.08, 0] } as Cam,
  ondas: { pos: [-0.2, 0.25, 4.6], look: [0.0, 0.0, 0] } as Cam, ondas2: { pos: [0.2, 0.2, 4.0], look: [0.1, -0.03, 0] } as Cam,
  trip: { pos: [0.0, 0.35, 6.2], look: [0.0, 0.12, 0] } as Cam, trip2: { pos: [0.1, 0.3, 5.2], look: [0.2, 0.12, 0] } as Cam,
  ups: { pos: [0.4, 0.3, 4.6], look: [0.4, 0.1, 0] } as Cam, ups2: { pos: [0.4, 0.25, 4.0], look: [0.4, 0.08, 0] } as Cam,
  capas: { pos: [0.0, 0.2, 6.2], look: [0.0, -0.08, 0] } as Cam, capas2: { pos: [0.0, 0.1, 5.4], look: [0.0, -0.1, 0] } as Cam,
  piedra: { pos: [0.3, 0.15, 5.2], look: [0.2, -0.12, 0] } as Cam, piedra2: { pos: [0.1, 0.1, 4.6], look: [0.0, -0.12, 0] } as Cam,
  arena: { pos: [0.0, 0.15, 4.8], look: [0.0, -0.1, 0] } as Cam, arena2: { pos: [0.0, 0.1, 4.3], look: [0.0, -0.08, 0] } as Cam,
  bordes: { pos: [0.0, 0.3, 6.4], look: [0.0, 0.0, 0] } as Cam, bordes2: { pos: [0.0, 0.25, 5.6], look: [0.0, -0.03, 0] } as Cam,
  fiesta: { pos: [0.0, 0.45, 7.0], look: [0.0, 0.25, 0] } as Cam, fiesta2: { pos: [0.0, 0.4, 6.4], look: [0.0, 0.22, 0] } as Cam,
  fin: { pos: [0.0, 1.0, 7.8], look: [0.0, 1.25, 0] } as Cam, fin2: { pos: [0.0, 0.95, 7.4], look: [0.0, 1.2, 0] } as Cam,
};
const CAMS: [number, number, Cam, Cam][] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.causa, C.causa2], [T[2], T[3], C.coloca, C.coloca2], [T[3], T[4], C.ancho, C.ancho2], [T[4], T[5], C.ancho2, C.ancho],
  [T[5], T[6], C.ondas, C.ondas2], [T[6], T[7], C.trip, C.trip2], [T[7], T[8], C.ups, C.ups2], [T[8], T[9], C.capas, C.capas2], [T[9], T[10], C.piedra, C.piedra2],
  [T[10], T[11], C.arena, C.arena2], [T[11], T[12], C.bordes, C.bordes2], [T[12], T[13], C.fiesta, C.fiesta2], [T[13], T[14], C.fiesta2, C.fiesta], [T[14], 99, C.fin, C.fin2],
];
const sacude = (t: number) => (t < 0.4 ? 0.06 : 0) + (t >= T[7] && t < T[7] + 0.45 ? 0.07 : 0) + (t >= T[6] + 1.6 && t < T[6] + 1.9 ? 0.04 : 0);
const camEn = (t: number): Cam => {
  const s = CAMS.find((x) => t >= x[0] && t < x[1]) ?? CAMS[CAMS.length - 1], u = cl((t - s[0]) / (s[1] - s[0])), k = u * u * (3 - 2 * u), a = sacude(t) * Math.max(0, 1 - ((t % 3) * 0)), sh: V3 = [Math.sin(t * 61) * a, Math.cos(t * 73) * a, 0];
  const m = (p: V3, q: V3, o: V3): V3 => [lerp(p[0], q[0], k) + o[0], lerp(p[1], q[1], k) + o[1], lerp(p[2], q[2], k) + o[2]];
  return { pos: m(s[2].pos, s[3].pos, sh), look: m(s[2].look, s[3].look, [0, 0, 0]) };
};
const FOV = 34;
const COL = ["#d9784a", "#e8c27a", "#9aa5b1", "#c0603a", "#b8c0c8", "#e2a15a"];

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = camEn(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  const gancho = t < T[2], fix = t >= T[8] + 0.1;
  // ---- ondas
  const amp = gancho ? 0.1 : fix ? 0 : t < T[5] ? 0 : 0.1 * pr(t, T[5] + 0.3, T[5] + 3.8);
  const off = (i: number) => amp * Math.sin(i * 0.95 + 0.6) - amp * 0.35 * Math.sin(i * 2.1);
  const sup = (x: number) => { const f = (x + 1.5) / PW, i0 = Math.max(0, Math.min(NP - 1, Math.floor(f))), i1 = Math.min(NP - 1, i0 + 1), u = Math.max(0, Math.min(1, f - i0)); return TOPE + PH + lerp(off(i0), off(i1), u); };
  // ---- adoquines malos: caen uno a uno sobre la tierra
  const caida = (i: number) => (gancho || fix || t >= T[2] + 2.3) ? 1 : cl((t - (T[2] + 0.3 + i * 0.16)) / 0.25);
  // ---- arreglo
  const foso = fix ? pr(t, T[8] + 0.1, T[8] + 1.3) : 0;
  const lift1 = fix ? pr(t, T[9] + 0.1, T[9] + 0.8) : 0, comp1 = fix ? pr(t, T[9] + 0.8, T[9] + 1.5) : 0, lift2 = fix ? pr(t, T[9] + 1.5, T[9] + 2.1) : 0, comp2 = fix ? pr(t, T[9] + 2.1, T[9] + 3.0) : 0;
  const piedraTop = lift2 > 0 ? lerp(-0.14, ARENA_A, lift2) - 0.008 * comp2 - 0.012 * comp1 * 0 : lerp(FONDO, -0.14, lift1) - 0.008 * comp1;
  const arena = fix ? pr(t, T[10] + 0.1, T[10] + 0.4) : 0, rasero = fix ? pr(t, T[10] + 0.6, T[10] + 1.7) : 0;
  const mal = (i: number) => (!fix ? 0 : cl((t - (T[10] + 1.9 + i * 0.12)) / 0.22));
  const bordes = fix ? pr(t, T[11] + 0.7, T[11] + 1.3) : 0, clavos = fix ? pr(t, T[11] + 0.9, T[11] + 1.5) : 0;
  const compactadorX = fix && t >= T[9] + 0.8 && t < T[9] + 3.0 ? (t < T[9] + 1.5 ? lerp(-1.5, 1.5, comp1) : t < T[9] + 2.1 ? 1.5 : lerp(1.5, -1.5, comp2)) : 99;
  const lluvia = (t > T[4] && t < T[4] + 1.9) || (t > T[5] && t < T[5] + 1.5);
  const nieve = t > T[4] + 1.6 && t < T[6] + 0.8;
  const confeti = fix && t > T[12] && t < T[13] + 0.6;
  // ---- Norm
  const camina = !fix && !gancho && t >= T[6] + 0.2;
  const xTrip = lerp(-1.0, 0.25, pr(t, T[6] + 0.2, T[6] + 1.65));
  const cae = camina ? pr(t, T[6] + 1.65, T[6] + 2.15) : 0;
  let nx = 0, ny = 0, incl = 0, nBrazo = 0, nSalto = 0, nVis = true;
  if (gancho) { nx = 0.45; ny = sup(0.45) + 0.02; incl = -1.45; nSalto = 0; }
  else if (!fix) {
    if (t < T[6] + 0.2) { nx = -1.0; ny = 0.025; nVis = t >= T[2] + 0.6; nBrazo = t >= T[3] && t < T[4] ? pr(t, T[3], T[3] + 0.5) : 0; }
    else { nx = xTrip + 0.35 * cae; ny = sup(xTrip) + (cae > 0 ? -0.04 : 0); incl = -1.45 * cae; nSalto = cae > 0 ? 0 : 0.05 * Math.abs(Math.sin(t * 9)); }
  } else {
    if (t < T[12]) { nx = -1.9; ny = 0.025; }
    else { const u = (t - T[12]) / (T[13] - T[12]); nx = lerp(-1.3, 1.3, (u * 2) % 1 < 1 ? Math.abs(((u * 1.6) % 2) - 1) : 0); ny = TOPE + PH; nSalto = 0.07 * Math.abs(Math.sin(t * 7)); nBrazo = 0.5 + 0.4 * Math.sin(t * 10); }
    if (t >= T[13]) { nx = 0; ny = TOPE + PH; nSalto = 0; nBrazo = 0.3; }
  }
  const hatU = gancho ? (t > 0.7 ? cl((t - 0.7) / 1.1) : 0) : !fix && t >= T[7] ? cl((t - T[7]) / 1.1) : 0;
  const gorro: V3 = hatU > 0 ? [0.25 * hatU, Math.sin(Math.PI * hatU) * 0.75, 0] : [0, 0, 0];
  const polvo = (gancho && t > 0.7 && t < 1.8) ? cl((t - 0.7) / 1.1) : !fix && t >= T[6] + 2.1 && t < T[6] + 3.1 ? cl((t - T[6] - 2.1)) : 0;
  const lodo = !fix && !gancho && t >= T[5] ? pr(t, T[5] + 0.2, T[5] + 3.0) : gancho ? 1 : 0;
  return (
    <group>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 6]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
      <mesh position={[-7, 9, -22]}><sphereGeometry args={[1.5, 24, 16]} /><meshBasicMaterial color="#ffe14d" /></mesh>
      {[[-9, 6, -20, 1.6], [4, 8.5, -24, 2.0], [10, 5.5, -22, 1.4], [-2, 11, -26, 1.8]].map(([x, y, z, s], i) => <group key={i} position={[x + Math.sin(t * 0.15 + i) * 0.6, y, z]} scale={s}>
        {[[-0.9, 0, 0.8], [0, 0.25, 1.1], [0.9, 0, 0.85]].map(([dx, dy, r], j) => <mesh key={j} position={[dx, dy, 0]} scale={[1, 0.7, 1]}><sphereGeometry args={[r, 16, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      </group>)}
      {/* terreno */}
      <Caja p={[0, -0.02, -4.5]} s={[18, 0.08, 9]} c="#5cc24a" sombra={false} />
      <Caja p={[0, -0.55, -4.5]} s={[18, 1.0, 9]} c="#8a5a33" sombra={false} />
      <Caja p={[0, -1.4, -4.5]} s={[18, 0.7, 9]} c="#6e4426" sombra={false} />
      <Caja p={[0, -1.95, -4.5]} s={[18, 0.4, 9]} c="#56331c" sombra={false} />
      {[...Array(30)].map((_, i) => { const x = (azar(i + 40) - 0.5) * 12; return Math.abs(x) < 1.7 && fix && foso > 0.5 ? null : <mesh key={i} position={[x, -0.3 - azar(i + 50) * 1.5, 0.0]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.04 + 0.07 * azar(i + 60), 10, 8]} /><meshLambertMaterial color={i % 2 ? "#9a8f82" : "#70675c"} /></mesh>; })}
      {[...Array(90)].map((_, i) => { const x = (azar(i + 90) - 0.5) * 8.8; return Math.abs(x) < 1.78 ? null : <mesh key={i} position={[x, 0.05, -0.02 - azar(i + 91) * 0.2]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.025, 0.14 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>; })}
      {[[-3.4, -2.2, 0.6], [3.5, -3.4, 0.7], [-2.6, -4.6, 0.6]].map(([x, z, r], i) => <mesh key={i} position={[x, r * 0.7, z]} scale={[1, 0.8, 1]} castShadow><sphereGeometry args={[r, 16, 12]} /><meshLambertMaterial color={i % 2 ? "#2f9a4a" : "#43b85c"} /></mesh>)}
      {[...Array(14)].map((_, i) => { const x = (azar(i + 120) - 0.5) * 8, z = -0.8 - azar(i + 121) * 5; return Math.abs(x) < 1.9 ? null : <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.012, 0.012, 0.22, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
        <mesh position={[0, 0.24, 0]} castShadow><sphereGeometry args={[0.06, 10, 8]} /><meshLambertMaterial color={["#ff4f7b", "#ffd23f", "#ff8a2a", "#c56bff", "#ffffff"][i % 5]} /></mesh>
      </group>; })}
      {/* MAL: tierra desnuda y adoquines encima */}
      {!fix && <Caja p={[0, 0.0, 0.004]} s={[3.6, 0.05, PROF]} c="#8a5a33" sombra={false} recibe={false} />}
      {!fix && [...Array(NP)].map((_, i) => caida(i) > 0 && <mesh key={i} position={[px(i), TOPE + PH / 2 + off(i) + lerp(0.7, 0, rebote(caida(i))), 0.006]} rotation={[0, 0, (off(Math.min(NP - 1, i + 1)) - off(Math.max(0, i - 1))) * 0.9]} castShadow receiveShadow>
        <boxGeometry args={[PW - 0.014, PH, PROF]} /><meshLambertMaterial color={COL[i % COL.length]} /></mesh>)}
      {!fix && lodo > 0 && [...Array(8)].map((_, i) => <mesh key={i} position={[-1.4 + i * 0.4, 0.0 - 0.012 * lodo, 0.012]} scale={[1, 0.25 + 0.3 * lodo, 1]}><sphereGeometry args={[0.16 * lodo, 12, 8]} /><meshLambertMaterial color="#3b2616" /></mesh>)}
      {!fix && !gancho && t >= T[5] && t < T[6] && [...Array(10)].map((_, i) => { const u = (t * 0.8 + i / 10) % 1; return <mesh key={i} position={[-1.5 + 3 * azar(i + 7), 0.02 + 0.12 * u, 0.05]}><sphereGeometry args={[0.02 + 0.015 * u, 8, 6]} /><meshBasicMaterial color="#7a5a3a" transparent opacity={1 - u} /></mesh>; })}
      {/* BIEN: foso, piedra compactada, arena con rasero, adoquines y bordes */}
      {fix && foso > 0 && <Caja p={[0, (TOPE + FONDO) / 2, 0.006]} s={[3.5 * foso, TOPE - FONDO, 0.01]} c="#3b2616" sombra={false} recibe={false} />}
      {fix && foso > 0 && foso < 1 && [...Array(10)].map((_, i) => { const u = (t * 1.4 + i / 10) % 1; return <mesh key={i} position={[(azar(i) - 0.5) * 2.6 * foso + (azar(i + 4) - 0.5) * u, 0.05 + 0.4 * Math.sin(Math.PI * u), 0.3 + 0.3 * u]}><sphereGeometry args={[0.04, 8, 6]} /><meshLambertMaterial color="#8a5a33" /></mesh>; })}
      {fix && lift1 > 0 && <group>
        <Caja p={[0, (FONDO + piedraTop) / 2, 0.01]} s={[3.48, piedraTop - FONDO, 0.01]} c="#b9b3a6" sombra={false} recibe={false} />
        {[...Array(110)].map((_, i) => { const y = FONDO + 0.01 + azar(i + 3) * (piedraTop - FONDO - 0.02); return y > piedraTop ? null : <mesh key={i} position={[-1.72 + azar(i) * 3.44, y, 0.022]}><sphereGeometry args={[0.014 + 0.012 * azar(i + 5), 8, 6]} /><meshLambertMaterial color={i % 3 ? "#8f897c" : "#d6d0c2"} /></mesh>; })}
      </group>}
      {fix && compactadorX < 90 && <group position={[compactadorX, piedraTop + 0.05 + 0.012 * Math.sin(t * 70), 0.5]}>
        <mesh><boxGeometry args={[0.5, 0.06, 0.4]} /><meshLambertMaterial color="#6b7480" /></mesh>
        <mesh position={[0, 0.17, 0]}><boxGeometry args={[0.34, 0.22, 0.3]} /><meshLambertMaterial color="#e63946" /></mesh>
        <mesh position={[0.28, 0.5, 0.1]} rotation={[0, 0, -0.9]}><cylinderGeometry args={[0.02, 0.02, 0.7, 8]} /><meshLambertMaterial color="#2a2a30" /></mesh>
        {[...Array(6)].map((_, i) => <mesh key={i} position={[(azar(i) - 0.5) * 0.7, 0.04 + 0.1 * ((t * 4 + i * 0.3) % 1), 0.25]}><sphereGeometry args={[0.04 + 0.04 * ((t * 4 + i * 0.3) % 1), 8, 6]} /><meshBasicMaterial color="#d9d2c2" transparent opacity={0.7 - 0.7 * ((t * 4 + i * 0.3) % 1)} /></mesh>)}
      </group>}
      {fix && arena > 0 && <group>
        <Caja p={[0, (ARENA_A + ARENA_B) / 2, 0.014]} s={[3.44, ARENA_B - ARENA_A, 0.01]} c="#e8c27a" sombra={false} recibe={false} />
        {[...Array(26)].map((_, i) => { const x = -1.7 + i * 0.13 + 0.03 * azar(i); const sx = -1.8 + 3.6 * rasero; return x < sx ? null : <mesh key={i} position={[x, ARENA_B, 0.018]} scale={[1, 0.5, 0.5]}><sphereGeometry args={[0.05 + 0.03 * azar(i + 2), 10, 8]} /><meshLambertMaterial color="#d9b36a" /></mesh>; })}
        {rasero > 0 && rasero < 1 && <mesh position={[-1.8 + 3.6 * rasero, ARENA_B + 0.04, 0.08]}><boxGeometry args={[0.07, 0.07, 0.3]} /><meshLambertMaterial color="#8a5a33" /></mesh>}
      </group>}
      {fix && [...Array(NP)].map((_, i) => mal(i) > 0 && <mesh key={i} position={[px(i), ARENA_B + PH / 2 + lerp(0.7, 0, rebote(mal(i))), 0.03]} castShadow receiveShadow>
        <boxGeometry args={[PW - 0.014, PH, PROF]} /><meshLambertMaterial color={COL[i % COL.length]} /></mesh>)}
      {fix && bordes > 0 && [-1, 1].map((k) => <group key={k}>
        <Caja p={[k * 1.7, 0.0 + lerp(0.5, 0, rebote(bordes)), 0.04]} s={[0.07, 0.22, PROF]} c="#8d97a2" />
        {clavos > 0 && <mesh position={[k * 1.7, lerp(0.35, -0.12, clavos), 0.09]}><boxGeometry args={[0.025, 0.3, 0.02]} /><meshBasicMaterial color="#ff7a1a" /></mesh>}
      </group>)}
      {/* lluvia y nieve */}
      {lluvia && [...Array(150)].map((_, i) => { const u = (t * (1.6 + azar(i)) + azar(i + 200)) % 1; return <mesh key={i} position={[-2.4 + azar(i + 210) * 4.8, lerp(3.4, 0.0, u), 0.7 - azar(i + 220) * 3.0]} scale={[1, 5, 1]}><sphereGeometry args={[0.008, 6, 4]} /><meshBasicMaterial color="#bfe3ff" /></mesh>; })}
      {nieve && [...Array(90)].map((_, i) => { const u = (t * (0.18 + 0.1 * azar(i)) + azar(i + 300)) % 1; return <mesh key={i} position={[-2.4 + azar(i + 310) * 4.8 + 0.1 * Math.sin(t * 2 + i), lerp(3.2, 0.0, u), 0.7 - azar(i + 320) * 3.0]}><sphereGeometry args={[0.022, 6, 4]} /><meshBasicMaterial color="#ffffff" /></mesh>; })}
      {polvo > 0 && [...Array(8)].map((_, i) => <mesh key={i} position={[(gancho ? 0.45 : xTrip + 0.35) + (azar(i) - 0.5) * 0.5 * polvo, 0.1 + 0.25 * polvo * azar(i + 4), 0.2]}><sphereGeometry args={[0.07 + 0.1 * polvo, 10, 8]} /><meshBasicMaterial color="#efe6d2" transparent opacity={0.8 * (1 - polvo)} /></mesh>)}
      {confeti && [...Array(70)].map((_, i) => { const u = ((t - T[12]) * (0.35 + 0.2 * azar(i)) + azar(i + 5)) % 1; return <mesh key={i} position={[-1.8 + azar(i + 11) * 3.6 + 0.1 * Math.sin(t * 3 + i), lerp(3.0, 0.1, u), 0.4 - azar(i + 21) * 1.4]} rotation={[t * 3 + i, t * 2 + i, 0]}><boxGeometry args={[0.05, 0.02, 0.05]} /><meshBasicMaterial color={["#ff4f7b", "#ffd23f", "#35c9c9", "#c56bff", "#ff7a1a"][i % 5]} /></mesh>; })}
      {nVis && <Norm p={[nx, ny, 0.5]} t={t} giro={-0.2} gorro={gorro} grieta={fix || gancho || t >= T[7]} brazo={nBrazo} salto={nSalto} inclina={incl} />}
    </group>
  );
};

// ---------------------------------------------------------------- rótulos
const F = "DejaVu Sans, Arial, sans-serif";
const pcam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80), vv = new THREE.Vector3();
const pantalla = (t: number, p: V3): [number, number] => { const c = camEn(t); pcam.position.set(...c.pos); pcam.lookAt(...c.look); pcam.updateMatrixWorld(); vv.set(...p).project(pcam); return [(vv.x + 1) * 540, (1 - vv.y) * 960]; };
const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const titulo = Math.min(pr(t, 0.12, 0.4), 1 - pr(t, T[1] - 0.25, T[1] - 0.02));
  const noEs = Math.min(pr(t, T[1] + 0.1, T[1] + 0.35), 1 - pr(t, T[1] + 1.3, T[1] + 1.5)), debajo = Math.min(pr(t, T[1] + 1.5, T[1] + 1.75), 1 - pr(t, T[2] - 0.2, T[2]));
  const suave = Math.min(pr(t, T[5] + 0.3, T[5] + 0.6), 1 - pr(t, T[5] + 2.2, T[5] + 2.5)), onda = Math.min(pr(t, T[5] + 2.6, T[5] + 2.9), 1 - pr(t, T[6] - 0.1, T[6] + 0.1));
  const [dx, dy0] = pantalla(t, [1.78, FONDO, 0.06]), [, dy1] = pantalla(t, [1.78, ARENA_A, 0.06]);
  const piedra = Math.min(pr(t, T[9] + 0.05, T[9] + 0.3), 1 - pr(t, T[9] + 1.3, T[9] + 1.5)), comp = Math.min(pr(t, T[9] + 1.55, T[9] + 1.8), 1 - pr(t, T[9] + 2.0, T[9] + 2.2));
  const medida = Math.min(pr(t, T[9] + 2.35, T[9] + 2.6), 1 - pr(t, T[10] - 0.1, T[10] + 0.1));
  const arenaT = Math.min(pr(t, T[10] + 0.15, T[10] + 0.4), 1 - pr(t, T[10] + 1.0, T[10] + 1.2)), plana = Math.min(pr(t, T[10] + 1.2, T[10] + 1.45), 1 - pr(t, T[11] - 0.1, T[11] + 0.1));
  const bord = Math.min(pr(t, T[11] + 0.5, T[11] + 0.8), 1 - pr(t, T[12] - 0.15, T[12]));
  const sello = Math.min(pr(t, T[12] + 1.8, T[12] + 2.05), 1 - pr(t, T[13] - 0.2, T[13] + 0.05));
  const pregunta = Math.min(pr(t, T[13] + 0.05, T[13] + 0.4), 1 - pr(t, T[14] - 0.2, T[14] + 0.05)), fin = pr(t, T[14] - 0.05, T[14] + 0.3);
  const big = (s: string, o: number, col: string, line: string, tam = 100, y = 300) => <text x={540} y={y} opacity={o} fontSize={tam} fill={col} stroke={line} strokeWidth={tam * 0.2} strokeLinejoin="round" paintOrder="stroke">{s}</text>;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">
      {titulo > 0 && <g opacity={titulo} transform={`translate(540 ${250 - 20 * (1 - titulo)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
        <text fontSize={98} fill="#fff" strokeWidth={20}>YOUR PATIO WILL</text><text y={140} fontSize={170} fill="#ff7a1a" strokeWidth={28}>WAVE</text></g>}
      {noEs > 0 && <g opacity={noEs}>{big("NOT THE PAVERS!", 1, "#fff", "#14321f", 96)}<path d="M-330 -60 L330 80 M330 -60 L-330 80" stroke="#ff2a2a" strokeWidth={0} /></g>}
      {debajo > 0 && big("IT'S UNDER THEM", debajo, "#ff7a1a", "#fff", 100)}
      {suave > 0 && big("SOFT SOIL SHIFTS", suave, "#fff", "#14321f", 92)}
      {onda > 0 && big("WAVES!", onda, "#ff2a2a", "#fff", 150)}
      {piedra > 0 && big("CRUSHED STONE", piedra, "#fff", "#14321f", 96)}
      {comp > 0 && big("COMPACT IT", comp, "#fff", "#14321f", 130)}
      {medida > 0 && <g opacity={medida} stroke="#14321f" strokeWidth={8} strokeLinecap="round">
        <line x1={dx} y1={dy0} x2={dx} y2={dy1} /><line x1={dx - 24} y1={dy0} x2={dx + 24} y2={dy0} /><line x1={dx - 24} y1={dy1} x2={dx + 24} y2={dy1} />
        <text x={Math.min(dx + 20, 760)} y={(dy0 + dy1) / 2 - 70} textAnchor="start" fontSize={96} fill="#fff" strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">4–6 in</text></g>}
      {arenaT > 0 && big("1 in OF SAND", arenaT, "#fff", "#14321f", 100)}
      {plana > 0 && big("SMOOTH & FLAT", plana, "#27c24c", "#fff", 100)}
      {bord > 0 && big("LOCK THE EDGES", bord, "#fff", "#14321f", 96)}
      {sello > 0 && <g transform={`translate(540 440) rotate(-8) scale(${lerp(2.2, 1, sello)})`} opacity={sello}>
        <rect x={-250} y={-74} width={500} height={148} rx={22} fill="#27c24c" stroke="#fff" strokeWidth={10} /><text y={24} fontSize={62} fill="#fff">UP TO NORM</text></g>}
      {pregunta > 0 && <g opacity={pregunta} transform={`translate(540 ${330 - 12 * (1 - pregunta)})`}>
        <text fontSize={110} fill="#fff" stroke="#14321f" strokeWidth={22} strokeLinejoin="round" paintOrder="stroke">DID YOU SKIP</text>
        <text y={125} fontSize={130} fill="#ffd23f" stroke="#14321f" strokeWidth={24} strokeLinejoin="round" paintOrder="stroke">THE BASE?</text></g>}
      {fin > 0 && <g opacity={fin} transform={`translate(0 ${-40 * (1 - fin)})`}>
        <rect x={70} y={120} width={940} height={640} rx={48} fill="#14321f" opacity={0.93} stroke="#fff" strokeWidth={8} />
        <g transform={`translate(540 300) scale(${1 + 0.04 * Math.sin(t * 6)})`}><rect x={-290} y={-100} width={580} height={190} rx={95} fill="#ff7a1a" stroke="#fff" strokeWidth={10} /><text y={42} fontSize={118} fill="#fff">FOLLOW</text></g>
        <text x={540} y={500} fontSize={58} fill="#fff">for more backyard builds</text><text x={540} y={570} fontSize={58} fill="#ffd23f">that won't fail!</text>
        <text x={540} y={690} fontSize={38} fill="#bfeaff">NEXT: GUTTER FLOODS YOUR BASEMENT</text></g>}
    </svg>
  );
};

export const PaversVideo: React.FC = () => {
  const f = useCurrentFrame(), t = f / PAV_FPS;
  const destello = t >= T[8] - 0.2 && t < T[8] + 0.4 ? (t < T[8] ? pr(t, T[8] - 0.2, T[8]) : 1 - pr(t, T[8], T[8] + 0.4)) : 0;
  const negro = Math.max(1 - pr(t, 0, 0.25), pr(t, PAV_SEG - 0.5, PAV_SEG));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#55b8ff 0%, #bfeaff 62%, #e9fbff 100%)" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: FOV, near: 0.1, far: 80 }} gl={{ antialias: true }}><Mundo t={t} /></ThreeCanvas>
      <Rotulos t={t} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Subtitulos palabras={PAL} t={t} claves={CLAVES} y={1560} ocultoDesde={T[14] - 0.05} />
        <rect x={0} y={0} width={1080 * (t / PAV_SEG)} height={14} fill="#ffd23f" opacity={0.95} />
      </svg>
      {destello > 0 && <AbsoluteFill style={{ background: "#fff", opacity: destello }} />}
      {negro > 0 && <AbsoluteFill style={{ background: "#fff", opacity: negro }} />}
    </AbsoluteFill>
  );
};
