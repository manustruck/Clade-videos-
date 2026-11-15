// «Your shed is sinking» — capítulo 5 del canal en inglés (vertical 1080x1920, 30 cps, three.js).
// El suelo se ve cortado en z = 0; el cobertizo está detrás de ese corte: cuando se hunde, su esquina desaparece en la tierra.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { cl, pr, lerp, azar, rebote, Caja, Norm } from "../fence-01/Fence";
import { Subtitulos, Palabra } from "../comun/Subtitulos";
import tiempos from "./tiempos.json";

export const SHED_FPS = 30, SHED_SEG = Math.round((tiempos.total + 1.1) * 10) / 10, SHED_CUADROS = Math.round(SHED_FPS * SHED_SEG);
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3 };
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const CLAVES = ["shed", "sink", "grass", "rains", "soil", "lean", "door", "jams", "rots", "floor", "crushed", "stone", "inches", "level", "solid", "base", "water", "drains", "follow", "whoops", "dig", "pack"];
const PIVX = 1.05, ZS = -0.1, PIT_A = 0.02, PIT_B = -0.15; // pivote del cobertizo, su z, y techo/fondo del foso (6 pulgadas = 0.15 m)

const C = {
  gancho: { pos: [0.1, 1.0, 8.4], look: [0.0, 0.85, 0] } as Cam, gancho2: { pos: [0.0, 0.9, 7.4], look: [0.0, 0.8, 0] } as Cam,
  ancho: { pos: [0.0, 1.0, 8.4], look: [0.0, 0.9, 0] } as Cam, ancho2: { pos: [0.0, 0.95, 7.6], look: [0.0, 0.85, 0] } as Cam,
  lava: { pos: [-0.6, 0.5, 4.8], look: [-0.5, 0.12, 0] } as Cam, lava2: { pos: [-0.5, 0.45, 4.0], look: [-0.45, 0.05, 0] } as Cam,
  puerta: { pos: [0.3, 0.95, 5.8], look: [0.2, 0.8, 0] } as Cam, puerta2: { pos: [0.3, 0.9, 5.0], look: [0.2, 0.75, 0] } as Cam,
  ups: { pos: [0.0, 1.0, 8.2], look: [0.0, 0.9, 0] } as Cam, ups2: { pos: [0.0, 0.95, 7.4], look: [0.0, 0.85, 0] } as Cam,
  suelo: { pos: [0.0, 0.7, 8.0], look: [0.0, 0.55, 0] } as Cam, suelo2: { pos: [0.1, 0.5, 7.0], look: [0.1, 0.3, 0] } as Cam,
  foso: { pos: [0.1, 0.45, 6.6], look: [0.1, 0.1, 0] } as Cam, foso2: { pos: [0.1, 0.4, 6.0], look: [0.1, 0.05, 0] } as Cam,
  nivel: { pos: [0.1, 0.5, 6.4], look: [0.1, 0.2, 0] } as Cam, nivel2: { pos: [0.0, 0.5, 5.4], look: [0.0, 0.18, 0] } as Cam,
  firme: { pos: [0.0, 1.0, 8.4], look: [0.0, 0.9, 0] } as Cam, firme2: { pos: [0.0, 0.95, 7.8], look: [0.0, 0.85, 0] } as Cam,
  fiesta: { pos: [0.3, 1.0, 6.8], look: [0.2, 0.8, 0] } as Cam, fiesta2: { pos: [0.2, 0.95, 6.2], look: [0.15, 0.8, 0] } as Cam,
  fin: { pos: [0.0, 1.4, 8.4], look: [0.0, 1.6, 0] } as Cam, fin2: { pos: [0.0, 1.35, 8.0], look: [0.0, 1.55, 0] } as Cam,
};
const CAMS: [number, number, Cam, Cam][] = [
  [0, T[2], C.gancho, C.gancho2], [T[2], T[3], C.ancho, C.ancho2], [T[3], T[5], C.ancho2, C.ancho], [T[5], T[6], C.lava, C.lava2], [T[6], T[7], C.puerta, C.puerta2],
  [T[7], T[8], C.ups, C.ups2], [T[8], T[9], C.suelo, C.suelo2], [T[9], T[10], C.foso, C.foso2], [T[10], T[11], C.nivel, C.nivel2], [T[11], T[12], C.firme, C.firme2],
  [T[12], T[13], C.fiesta, C.fiesta2], [T[13], 99, C.fin, C.fin2],
];
const camEn = (t: number): Cam => {
  const s = CAMS.find((x) => t >= x[0] && t < x[1]) ?? CAMS[CAMS.length - 1], u = cl((t - s[0]) / (s[1] - s[0])), k = u * u * (3 - 2 * u);
  const m = (a: V3, b: V3): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  return { pos: m(s[2].pos, s[3].pos), look: m(s[2].look, s[3].look) };
};
const FOV = 34;
const GABLE = (() => { const sh = new THREE.Shape(); sh.moveTo(-1.0, 0); sh.lineTo(1.0, 0); sh.lineTo(0, 0.55); sh.closePath(); return sh; })();

const Cobertizo: React.FC<{ puerta: number; interior: boolean }> = ({ puerta, interior }) => (
  <group position={[-PIVX, 0, 0]}>
    <Caja p={[0, 0.06, -0.9]} s={[2.1, 0.12, 1.8]} c="#8a5a33" />
    <Caja p={[0, 0.82, -0.9]} s={[2.0, 1.4, 1.8]} c="#ffcf70" />
    {[...Array(9)].map((_, i) => <Caja key={i} p={[-0.88 + i * 0.22, 0.82, 0.004]} s={[0.012, 1.38, 0.004]} c="#e8b04a" sombra={false} />)}
    <mesh position={[0, 1.52, -0.02]} castShadow><extrudeGeometry args={[GABLE, { depth: 0.04, bevelEnabled: false }]} /><meshLambertMaterial color="#ffcf70" /></mesh>
    {[-1, 1].map((k) => <mesh key={k} position={[k * 0.55, 1.52 + 0.275 + 0.04, -0.9]} rotation={[0, 0, -k * 0.464]} castShadow><boxGeometry args={[1.36, 0.07, 2.0]} /><meshLambertMaterial color="#d9482b" /></mesh>)}
    {interior && <Caja p={[0.15, 0.82, 0.0]} s={[0.75, 1.2, 0.02]} c="#2b2230" sombra={false} />}
    {interior && <><mesh position={[0.3, 0.45, 0.02]}><torusGeometry args={[0.2, 0.04, 8, 20]} /><meshLambertMaterial color="#e63946" /></mesh><Caja p={[0.0, 0.9, 0.02]} s={[0.35, 0.05, 0.02]} c="#8a5a33" sombra={false} /></>}
    <group position={[-0.225, 0.82, 0.03]} rotation={[0, puerta, 0]}>
      <Caja p={[0.375, 0, 0]} s={[0.75, 1.2, 0.04]} c="#2f86c4" />
      {[0.2, 0.55].map((x) => <Caja key={x} p={[x, 0, 0.022]} s={[0.012, 1.1, 0.004]} c="#1d6aa5" sombra={false} />)}
      <mesh position={[0.62, -0.05, 0.05]}><sphereGeometry args={[0.04, 10, 8]} /><meshLambertMaterial color="#ffd23f" /></mesh>
    </group>
    <Caja p={[-0.6, 1.0, 0.02]} s={[0.5, 0.45, 0.03]} c="#bfe6ff" />
    {[[0, 0.25, 0.54, 0.04], [0, -0.25, 0.54, 0.04], [-0.27, 0, 0.04, 0.5], [0.27, 0, 0.04, 0.5], [0, 0, 0.03, 0.46]].map(([x, y, w, h], i) => <Caja key={i} p={[-0.6 + x, 1.0 + y, 0.04]} s={[w, h, 0.02]} c="#ffffff" sombra={false} />)}
  </group>
);

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = camEn(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  const gancho = t < T[2], fix = t >= T[8] + 0.1, malo = !fix;
  const lluvia = (t > T[4] && t < T[8]) || (t > T[11] + 1.0 && t < T[12] + 0.8);
  // ---- estado del cobertizo
  const cav = gancho ? 1 : malo ? pr(t, T[5], T[5] + 3.0) : 0;
  const theta = gancho ? 0.14 * rebote(cl((t - 0.3) / 0.9)) : malo ? 0.14 * pr(t, T[5] + 0.8, T[6] + 0.2) : 0;
  const caeMalo = !gancho && malo ? lerp(2.2, 0, rebote(pr(t, T[2] + 0.6, T[2] + 1.6))) : 0;
  const caeBien = fix && t >= T[11] ? lerp(2.2, 0, rebote(pr(t, T[11] + 0.15, T[11] + 1.05))) : 0;
  const verCob = gancho || (malo && t >= T[2] + 0.6) || (fix && t >= T[11] + 0.15);
  const sacude = malo && t >= T[6] + 0.2 && t < T[7] ? 0.04 * Math.sin(t * 28) : 0;
  const puerta = fix ? -1.3 * pr(t, T[12] + 0.3, T[12] + 1.4) : gancho ? 0.03 * Math.sin(t * 20) * pr(t, 1.2, 1.5) : sacude;
  const setas = gancho ? 1 : malo ? pr(t, T[6] + 0.6, T[6] + 1.6) : 0;
  const charco = gancho ? 1 : malo && t > T[4] ? pr(t, T[4], T[5] + 2) : 0;
  // foso, piedra, compactado y nivel (arreglo)
  const foso = fix ? pr(t, T[9] + 0.1, T[9] + 1.4) : 0, piedra = fix ? pr(t, T[9] + 2.0, T[9] + 3.4) : 0;
  const prensa = fix && t >= T[10] && t < T[10] + 1.9 ? 1 : 0, comp = fix ? pr(t, T[10], T[10] + 1.9) : 0;
  const nivel = fix ? (t >= T[10] + 2.1 && t < T[11] + 0.1 ? pr(t, T[10] + 2.1, T[10] + 2.5) : 0) : 0;
  const sobraGrava = piedra * (1 - 0.1 * comp);
  const confeti = fix && t > T[12] && t < T[13] + 0.5;
  const hatU = fix ? 0 : gancho ? (t > 1.0 ? cl((t - 1.0) / 1.1) : 0) : t >= T[7] ? cl((t - T[7]) / 1.1) : 0;
  const gorro: V3 = hatU > 0 ? [0.25 * hatU, Math.sin(Math.PI * hatU) * 0.75, 0] : [0, 0, 0];
  const brazo = t >= T[3] && t < T[4] ? pr(t, T[3], T[3] + 0.5) : malo && t >= T[6] && t < T[8] ? 0.5 + 0.4 * Math.sin(t * 12) : t >= T[12] && t < T[13] ? pr(t, T[12], T[12] + 0.4) : t >= T[13] + 0.1 ? 0.55 + 0.45 * Math.sin(t * 7) : 0;
  const normX = 0.95;
  return (
    <group>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 6]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
      <mesh position={[-7, 9, -22]}><sphereGeometry args={[1.5, 24, 16]} /><meshBasicMaterial color="#ffe14d" /></mesh>
      {[[-9, 6, -20, 1.6], [4, 8.5, -24, 2.0], [10, 5.5, -22, 1.4], [-2, 11, -26, 1.8]].map(([x, y, z, s], i) => <group key={i} position={[x + Math.sin(t * 0.15 + i) * 0.6, y, z]} scale={s}>
        {[[-0.9, 0, 0.8], [0, 0.25, 1.1], [0.9, 0, 0.85]].map(([dx, dy, r], j) => <mesh key={j} position={[dx, dy, 0]} scale={[1, 0.7, 1]}><sphereGeometry args={[r, 16, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      </group>)}
      {/* terreno cortado en z = 0 */}
      <Caja p={[0, -0.02, -4.5]} s={[18, 0.08, 9]} c="#5cc24a" sombra={false} />
      <Caja p={[0, -0.55, -4.5]} s={[18, 1.0, 9]} c="#8a5a33" sombra={false} />
      <Caja p={[0, -1.4, -4.5]} s={[18, 0.7, 9]} c="#6e4426" sombra={false} />
      <Caja p={[0, -1.95, -4.5]} s={[18, 0.4, 9]} c="#56331c" sombra={false} />
      {[...Array(30)].map((_, i) => { const x = (azar(i + 40) - 0.5) * 12; return Math.abs(x) < 1.45 && fix && foso > 0.5 ? null : <mesh key={i} position={[x, -0.2 - azar(i + 50) * 1.6, 0.0]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.04 + 0.07 * azar(i + 60), 10, 8]} /><meshLambertMaterial color={i % 2 ? "#9a8f82" : "#70675c"} /></mesh>; })}
      {[...Array(80)].map((_, i) => { const x = (azar(i + 90) - 0.5) * 8.6; return fix && Math.abs(x) < 1.4 * foso ? null : <mesh key={i} position={[x, 0.05, -0.02 - azar(i + 91) * 0.2]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.025, 0.14 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>; })}
      {[[-3.4, -2.2, 0.6], [3.5, -3.4, 0.7], [-2.6, -4.6, 0.6]].map(([x, z, r], i) => <mesh key={i} position={[x, r * 0.7, z]} scale={[1, 0.8, 1]} castShadow><sphereGeometry args={[r, 18, 14]} /><meshLambertMaterial color={i % 2 ? "#2f9a4a" : "#43b85c"} /></mesh>)}
      {[...Array(16)].map((_, i) => { const x = (azar(i + 120) - 0.5) * 8, z = -0.8 - azar(i + 121) * 5; return Math.abs(x) < 1.5 ? null : <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.012, 0.012, 0.22, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
        <mesh position={[0, 0.24, 0]} castShadow><sphereGeometry args={[0.06, 10, 8]} /><meshLambertMaterial color={["#ff4f7b", "#ffd23f", "#ff8a2a", "#c56bff", "#ffffff"][i % 5]} /></mesh>
      </group>; })}
      {/* foso de 6 pulgadas, piedra triturada y compactado */}
      {fix && foso > 0 && <Caja p={[0, (PIT_A + PIT_B) / 2, 0.006]} s={[2.7 * foso, PIT_A - PIT_B, 0.01]} c="#3b2616" sombra={false} recibe={false} />}
      {fix && piedra > 0 && <group>
        <Caja p={[0, PIT_B + (PIT_A - PIT_B) * sobraGrava / 2, 0.01]} s={[2.68, (PIT_A - PIT_B) * sobraGrava, 0.01]} c="#b9b3a6" sombra={false} recibe={false} />
        {[...Array(90)].map((_, i) => { const y = PIT_B + 0.012 + azar(i + 3) * (PIT_A - PIT_B - 0.03) * sobraGrava; return <mesh key={i} position={[-1.3 + azar(i) * 2.6, y, 0.022]}><sphereGeometry args={[0.014 + 0.012 * azar(i + 5), 8, 6]} /><meshLambertMaterial color={i % 3 ? "#8f897c" : "#d6d0c2"} /></mesh>; })}
      </group>}
      {fix && foso > 0 && foso < 1 && <group position={[1.5 * (foso - 0.5), 0.25, 0.6]}>
        <mesh rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.02, 0.02, 0.9, 6]} /><meshLambertMaterial color="#8a5a33" /></mesh>
        <mesh position={[0.2 * Math.sin(t * 10), -0.45, 0.02]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.16, 0.22, 0.02]} /><meshLambertMaterial color="#aab4be" /></mesh>
      </group>}
      {fix && foso > 0 && foso < 1 && [...Array(10)].map((_, i) => { const u = (t * 1.4 + i / 10) % 1; return <mesh key={i} position={[(azar(i) - 0.5) * 2.2 * foso + (azar(i + 4) - 0.5) * u, 0.05 + 0.5 * Math.sin(Math.PI * u), 0.3 + 0.3 * u]}><sphereGeometry args={[0.04, 8, 6]} /><meshLambertMaterial color="#8a5a33" /></mesh>; })}
      {prensa > 0 && <group position={[lerp(-1.1, 1.1, (comp * 2.6) % 1), 0, 0.3]}>
        <mesh position={[0, 0.7 + 0.35 * Math.max(0, Math.sin(t * 9)), 0]}><cylinderGeometry args={[0.03, 0.03, 1.1, 8]} /><meshLambertMaterial color="#8a5a33" /></mesh>
        <mesh position={[0, 0.12 + 0.35 * Math.max(0, Math.sin(t * 9)), 0]}><boxGeometry args={[0.4, 0.07, 0.35]} /><meshLambertMaterial color="#6b7480" /></mesh>
        {[...Array(5)].map((_, i) => <mesh key={i} position={[(azar(i) - 0.5) * 0.5, 0.05 + 0.1 * ((t * 3 + i) % 1), 0.2]}><sphereGeometry args={[0.04 + 0.03 * ((t * 3 + i) % 1), 8, 6]} /><meshBasicMaterial color="#d9d2c2" transparent opacity={Math.max(0, 0.7 - 0.7 * ((t * 3 + i) % 1))} /></mesh>)}
      </group>}
      {nivel > 0 && <group position={[0, PIT_A + 0.04 + lerp(0.6, 0, rebote(nivel)), 0.35]}>
        <mesh><boxGeometry args={[2.8, 0.06, 0.07]} /><meshLambertMaterial color="#ffd23f" /></mesh>
        <mesh position={[0, 0.045, 0]}><boxGeometry args={[0.3, 0.04, 0.075]} /><meshLambertMaterial color="#bff2c8" /></mesh>
        <mesh position={[0.07 * (1 - nivel) * Math.sin(t * 8) * (1 - cl((t - T[10] - 2.5) / 0.6)), 0.046, 0.04]}><sphereGeometry args={[0.018, 10, 8]} /><meshBasicMaterial color="#27c24c" /></mesh>
      </group>}
      {/* la grieta de lodo que se come la tierra bajo el cobertizo */}
      {malo && cav > 0 && <Caja p={[-0.8, -0.17 * cav, 0.012]} s={[1.0 * (0.4 + 0.6 * cav), 0.34 * cav, 0.01]} c="#3b2616" sombra={false} recibe={false} />}
      {malo && charco > 0 && <Caja p={[-1.45, 0.03, 0.35]} s={[1.5 * charco, 0.04, 0.7]} c="#7a5a3a" o={0.9} sombra={false} recibe={false} />}
      {malo && cav > 0 && cav < 1 && [...Array(8)].map((_, i) => { const u = (t * 0.9 + i / 8) % 1; return <mesh key={i} position={[-0.5 - 0.9 * u, -0.05 + 0.2 * Math.sin(Math.PI * u), 0.05]} scale={[1, 1.3, 1]}><sphereGeometry args={[0.035, 8, 6]} /><meshBasicMaterial color="#6b4a2a" /></mesh>; })}
      {/* el cobertizo */}
      {verCob && <group position={[PIVX, caeMalo + caeBien, ZS]} rotation={[0, 0, theta]}><Cobertizo puerta={puerta} interior={fix && t >= T[12] + 0.3} /></group>}
      {/* hongos: la madera se pudre */}
      {setas > 0 && malo && [[-0.9, 0.14], [-0.6, 0.14], [-0.35, 0.13], [-0.15, 0.12]].map(([x, y], i) => <group key={i} position={[x - 0.02 * theta * 5, y - 0.03 * (1 - i / 4) * cav, 0.04]} scale={setas * (0.7 + 0.3 * (i % 2))}>
        <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.015, 0.02, 0.08, 8]} /><meshLambertMaterial color="#f3e6c8" /></mesh>
        <mesh position={[0, 0.09, 0]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.055, 12, 8]} /><meshLambertMaterial color="#e63946" /></mesh></group>)}
      {/* gotas del techo y lluvia */}
      {lluvia && [...Array(150)].map((_, i) => { const u = (t * (1.6 + azar(i)) + azar(i + 200)) % 1; return <mesh key={i} position={[-2.0 + azar(i + 210) * 4.4, lerp(3.4, 0.0, u), 0.7 - azar(i + 220) * 3.0]} scale={[1, 5, 1]}><sphereGeometry args={[0.008, 6, 4]} /><meshBasicMaterial color="#bfe3ff" /></mesh>; })}
      {fix && t > T[11] + 1.0 && t < T[12] + 0.8 && [...Array(14)].map((_, i) => { const u = (t * 0.8 + i / 14) % 1; const x = (i % 2 ? 1 : -1) * (1.15 + 0.12 * azar(i)); return <mesh key={i} position={[x, lerp(1.1, 0.02, u * u), 0.05]} scale={[1, 1.5, 1]}><sphereGeometry args={[0.014, 8, 6]} /><meshBasicMaterial color="#2f9bff" transparent opacity={u < 0.95 ? 1 : 0} /></mesh>; })}
      {fix && t > T[11] + 1.2 && t < T[12] + 0.8 && [...Array(10)].map((_, i) => { const u = (t * 0.6 + i / 10) % 1; const sx = i % 2 ? 1 : -1; return <mesh key={i} position={[sx * lerp(0.9, 1.7, u), lerp(0.0, PIT_B + 0.03, Math.min(1, u * 2)), 0.03]}><sphereGeometry args={[0.015, 8, 6]} /><meshBasicMaterial color="#2f9bff" transparent opacity={1 - u * 0.8} /></mesh>; })}
      {confeti && [...Array(70)].map((_, i) => { const u = ((t - T[12]) * (0.35 + 0.2 * azar(i)) + azar(i + 5)) % 1; return <mesh key={i} position={[-1.8 + azar(i + 11) * 3.6 + 0.1 * Math.sin(t * 3 + i), lerp(3.2, 0.1, u), 0.4 - azar(i + 21) * 1.4]} rotation={[t * 3 + i, t * 2 + i, 0]}><boxGeometry args={[0.05, 0.02, 0.05]} /><meshBasicMaterial color={["#ff4f7b", "#ffd23f", "#35c9c9", "#c56bff", "#ff7a1a"][i % 5]} /></mesh>; })}
      <Norm p={[normX, 0, 0.6]} t={t} giro={0.5} gorro={gorro} grieta={fix || gancho || t >= T[7]} brazo={brazo} salto={t >= T[12] && t < T[13] ? 0.08 * Math.abs(Math.sin(t * 6)) : 0} />
    </group>
  );
};

// ---------------------------------------------------------------- rótulos y cierre
const F = "DejaVu Sans, Arial, sans-serif";
const pcam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80), vv = new THREE.Vector3();
const pantalla = (t: number, p: V3): [number, number] => { const c = camEn(t); pcam.position.set(...c.pos); pcam.lookAt(...c.look); pcam.updateMatrixWorld(); vv.set(...p).project(pcam); return [(vv.x + 1) * 540, (1 - vv.y) * 960]; };
const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const titulo = Math.min(pr(t, 0.15, 0.5), 1 - pr(t, T[2] - 0.5, T[2] - 0.05));
  const lava = Math.min(pr(t, T[5] + 0.3, T[5] + 0.6), 1 - pr(t, T[6] - 0.2, T[6]));
  const atasca = Math.min(pr(t, T[6] + 0.1, T[6] + 0.4), 1 - pr(t, T[6] + 1.5, T[6] + 1.8)), pudre = Math.min(pr(t, T[6] + 1.8, T[6] + 2.1), 1 - pr(t, T[7] - 0.1, T[7]));
  const [dx, dy0] = pantalla(t, [1.5, PIT_B, 0.06]), [, dy1] = pantalla(t, [1.5, PIT_A, 0.06]);
  const medida = Math.min(pr(t, T[9] + 3.2, T[9] + 3.5), 1 - pr(t, T[10] - 0.1, T[10] + 0.1)), piedra = Math.min(pr(t, T[9] + 2.2, T[9] + 2.5), 1 - pr(t, T[9] + 3.3, T[9] + 3.6));
  const prensa = Math.min(pr(t, T[10] + 0.1, T[10] + 0.4), 1 - pr(t, T[10] + 1.8, T[10] + 2.1)), nivel = Math.min(pr(t, T[10] + 2.6, T[10] + 2.9), 1 - pr(t, T[11] + 0.1, T[11] + 0.3));
  const drena = Math.min(pr(t, T[11] + 1.2, T[11] + 1.5), 1 - pr(t, T[12] - 0.1, T[12]));
  const sello = Math.min(pr(t, T[12] + 1.5, T[12] + 1.75), 1 - pr(t, T[13] - 0.2, T[13] + 0.05)), fin = pr(t, T[13] - 0.05, T[13] + 0.3);
  const big = (s: string, o: number, col: string, line: string, tam = 110, y = 300) => <text x={540} y={y} opacity={o} fontSize={tam} fill={col} stroke={line} strokeWidth={tam * 0.2} strokeLinejoin="round" paintOrder="stroke">{s}</text>;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">
      {titulo > 0 && <g opacity={titulo} transform={`translate(540 ${250 - 20 * (1 - titulo)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
        <text fontSize={98} fill="#fff" strokeWidth={20}>YOUR SHED WILL</text><text y={130} fontSize={150} fill="#ff7a1a" strokeWidth={26}>SINK</text></g>}
      {lava > 0 && big("SOIL WASHES OUT", lava, "#fff", "#14321f", 84)}
      {atasca > 0 && big("JAMMED!", atasca, "#ff2a2a", "#fff", 130)}
      {pudre > 0 && big("ROTTING!", pudre, "#ff2a2a", "#fff", 130)}
      {piedra > 0 && big("CRUSHED STONE", piedra, "#fff", "#14321f", 84)}
      {medida > 0 && <g opacity={medida} stroke="#14321f" strokeWidth={8} strokeLinecap="round">
        <line x1={dx} y1={dy0} x2={dx} y2={dy1} /><line x1={dx - 24} y1={dy0} x2={dx + 24} y2={dy0} /><line x1={dx - 24} y1={dy1} x2={dx + 24} y2={dy1} />
        <text x={Math.min(dx + 20, 700)} y={(dy0 + dy1) / 2 - 70} textAnchor="start" fontSize={100} fill="#fff" strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">4–6 in</text></g>}
      {prensa > 0 && big("PACK IT TIGHT", prensa, "#fff", "#14321f", 92)}
      {nivel > 0 && <g opacity={nivel}>{big("LEVEL", 1, "#27c24c", "#fff", 140)}<path d="M-330 -60 l60 60 l120 -130" stroke="#27c24c" strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(460 330) scale(1.1)" /></g>}
      {drena > 0 && big("WATER DRAINS", drena, "#27c24c", "#fff", 92)}
      {sello > 0 && <g transform={`translate(540 440) rotate(-8) scale(${lerp(2.2, 1, sello)})`} opacity={sello}>
        <rect x={-250} y={-74} width={500} height={148} rx={22} fill="#27c24c" stroke="#fff" strokeWidth={10} /><text y={24} fontSize={62} fill="#fff">UP TO NORM</text></g>}
      {fin > 0 && <g opacity={fin} transform={`translate(0 ${-40 * (1 - fin)})`}>
        <rect x={70} y={120} width={940} height={640} rx={48} fill="#14321f" opacity={0.93} stroke="#fff" strokeWidth={8} />
        <g transform={`translate(540 300) scale(${1 + 0.04 * Math.sin(t * 6)})`}><rect x={-290} y={-100} width={580} height={190} rx={95} fill="#ff7a1a" stroke="#fff" strokeWidth={10} /><text y={42} fontSize={118} fill="#fff">FOLLOW</text></g>
        <text x={540} y={500} fontSize={58} fill="#fff">for more backyard builds</text><text x={540} y={570} fontSize={58} fill="#ffd23f">that won't fail!</text>
        <text x={540} y={690} fontSize={46} fill="#bfeaff">NEXT: YOUR PAVERS WILL WAVE</text></g>}
    </svg>
  );
};

export const ShedVideo: React.FC = () => {
  const f = useCurrentFrame(), t = f / SHED_FPS;
  const destello = t >= T[8] - 0.2 && t < T[8] + 0.4 ? (t < T[8] ? pr(t, T[8] - 0.2, T[8]) : 1 - pr(t, T[8], T[8] + 0.4)) : 0;
  const negro = Math.max(1 - pr(t, 0, 0.3), pr(t, SHED_SEG - 0.5, SHED_SEG));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#55b8ff 0%, #bfeaff 62%, #e9fbff 100%)" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: FOV, near: 0.1, far: 80 }} gl={{ antialias: true }}><Mundo t={t} /></ThreeCanvas>
      <Rotulos t={t} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><Subtitulos palabras={PAL} t={t} claves={CLAVES} y={1560} ocultoDesde={T[13] - 0.05} /></svg>
      {destello > 0 && <AbsoluteFill style={{ background: "#fff", opacity: destello }} />}
      {negro > 0 && <AbsoluteFill style={{ background: "#fff", opacity: negro }} />}
    </AbsoluteFill>
  );
};
