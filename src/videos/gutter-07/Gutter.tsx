// «Your gutter is flooding your basement» — capítulo 7 del canal en inglés (vertical 1080x1920, 30 cps, three.js).
// Corte transversal en z = 0: casa con sótano, canaleta y bajante a la derecha, el suelo mojado, la grieta y el sótano que se inunda.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { cl, pr, lerp, azar, Caja, Norm } from "../fence-01/Fence";
import { Subtitulos, Palabra } from "../comun/Subtitulos";
import tiempos from "./tiempos.json";

export const GUT_FPS = 30, GUT_SEG = Math.round((tiempos.total + 1.1) * 10) / 10, GUT_CUADROS = Math.round(GUT_FPS * GUT_SEG);
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3 };
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const CLAVES = ["gutter", "flooding", "basement", "downspout", "house", "soil", "wall", "crack", "pool", "extension", "feet", "slope", "dry", "rain", "follow", "whoops", "sponge", "water", "comments"];
const PROF = 4.5, NIVEL_MAX = 1.55, SUELO = -1.8;
const WEDGE = (() => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(3.4, 0); sh.lineTo(0, 0.18); sh.closePath(); return sh; })();
const wedgeY = (x: number, s: number) => 0.02 + 0.18 * Math.max(0, 1 - x / 3.4) * s;

const C = {
  gancho: { pos: [-1.4, -0.9, 6.0], look: [-1.4, -0.95, 0] } as Cam, gancho2: { pos: [-1.3, -0.8, 6.8], look: [-1.3, -0.9, 0] } as Cam,
  bajante: { pos: [0.1, 1.0, 6.4], look: [0.0, 0.9, 0] } as Cam, bajante2: { pos: [0.15, 0.9, 5.6], look: [0.05, 0.6, 0] } as Cam,
  ancho: { pos: [-0.2, 0.7, 9.2], look: [-0.2, 0.3, 0] } as Cam, ancho2: { pos: [-0.2, 0.6, 8.4], look: [-0.2, 0.2, 0] } as Cam,
  suelo: { pos: [0.5, -0.4, 5.2], look: [0.4, -0.5, 0] } as Cam, suelo2: { pos: [0.4, -0.5, 4.5], look: [0.3, -0.6, 0] } as Cam,
  grieta: { pos: [-0.3, -0.8, 5.2], look: [-0.4, -0.9, 0] } as Cam, grieta2: { pos: [-0.5, -0.85, 5.8], look: [-0.7, -0.95, 0] } as Cam,
  piscina: { pos: [-1.4, -0.9, 6.2], look: [-1.4, -0.95, 0] } as Cam, piscina2: { pos: [-1.4, -0.9, 5.4], look: [-1.4, -0.95, 0] } as Cam,
  ups: { pos: [-1.4, -0.9, 5.4], look: [-1.4, -0.95, 0] } as Cam, ups2: { pos: [-1.4, -0.85, 4.8], look: [-1.4, -0.9, 0] } as Cam,
  arreglo: { pos: [0.2, 0.8, 9.2], look: [0.0, 0.4, 0] } as Cam,
  ext: { pos: [1.1, 0.5, 5.8], look: [1.0, 0.25, 0] } as Cam, ext2: { pos: [1.3, 0.45, 5.4], look: [1.2, 0.2, 0] } as Cam,
  pend: { pos: [1.6, 0.35, 6.2], look: [1.5, 0.12, 0] } as Cam, pend2: { pos: [1.7, 0.3, 5.6], look: [1.6, 0.1, 0] } as Cam,
  seco: { pos: [-0.2, 0.7, 9.2], look: [-0.2, 0.3, 0] } as Cam, seco2: { pos: [-0.2, 0.6, 8.4], look: [-0.2, 0.2, 0] } as Cam,
  calcetas: { pos: [-1.4, -0.9, 6.2], look: [-1.4, -0.95, 0] } as Cam, calcetas2: { pos: [-1.4, -0.9, 5.4], look: [-1.4, -0.95, 0] } as Cam,
  fin: { pos: [-1.0, -0.2, 8.8], look: [-1.0, 0.2, 0] } as Cam, fin2: { pos: [-1.0, -0.25, 8.4], look: [-1.0, 0.15, 0] } as Cam,
};
const CAMS: [number, number, Cam, Cam][] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.gancho2, C.gancho], [T[2], T[3], C.bajante, C.bajante2], [T[3], T[4], C.ancho, C.ancho2], [T[4], T[5], C.suelo, C.suelo2],
  [T[5], T[6], C.grieta, C.grieta2], [T[6], T[7], C.piscina, C.piscina2], [T[7], T[8], C.ups, C.ups2], [T[8], T[9], C.arreglo, C.arreglo], [T[9], T[10], C.ext, C.ext2],
  [T[10], T[11], C.pend, C.pend2], [T[11], T[12], C.seco, C.seco2], [T[12], T[13], C.calcetas, C.calcetas2], [T[13], T[14], C.calcetas2, C.calcetas], [T[14], 99, C.fin, C.fin2],
];
const sacude = (t: number) => (t < 0.4 ? 0.06 : 0) + (t >= T[7] && t < T[7] + 0.45 ? 0.07 : 0);
const camEn = (t: number): Cam => {
  const s = CAMS.find((x) => t >= x[0] && t < x[1]) ?? CAMS[CAMS.length - 1], u = cl((t - s[0]) / (s[1] - s[0])), k = u * u * (3 - 2 * u), a = sacude(t);
  const m = (p: V3, q: V3, o: V3): V3 => [lerp(p[0], q[0], k) + o[0], lerp(p[1], q[1], k) + o[1], lerp(p[2], q[2], k) + o[2]];
  return { pos: m(s[2].pos, s[3].pos, [Math.sin(t * 61) * a, Math.cos(t * 73) * a, 0]), look: m(s[2].look, s[3].look, [0, 0, 0]) };
};
const FOV = 34;

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = camEn(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  const gancho = t < T[2], fix = t >= T[8] + 0.1, malo = !gancho && !fix;
  const lluvia = (malo && t > T[2] + 0.8) || (fix && t > T[9] + 0.4 && t < T[12] + 0.8);
  const hayAgua = lluvia;
  // ---- estado del daño
  const mojado = gancho ? 1 : malo ? pr(t, T[3] + 0.5, T[4] + 2.0) : 0;
  const grieta = gancho ? 1 : malo ? pr(t, T[5] + 0.8, T[5] + 1.4) : 0;
  const nivel = gancho ? NIVEL_MAX : malo ? NIVEL_MAX * pr(t, T[5] + 1.8, T[6] + 2.0) : 0;
  const chorro = (gancho || (malo && t > T[5] + 1.2)) && nivel < NIVEL_MAX - 0.02 || (gancho && t < T[2] - 0.1);
  // ---- arreglo
  const ext = fix ? pr(t, T[9] + 0.4, T[9] + 1.6) : 0, pend = fix ? pr(t, T[10] + 0.4, T[10] + 1.8) : 0;
  const largo = 1.9 * ext, xe = 0.4 + largo, ye0 = 0.09, ye = 0.09 + (wedgeY(xe, pend) - 0.02), y0 = 0.09 + (wedgeY(0.4, pend) - 0.02);
  const ang = Math.atan2(ye - y0, Math.max(0.01, largo)), cxp = 0.4 + largo / 2, cyp = (y0 + ye) / 2, lp = Math.hypot(largo, ye - y0);
  const confeti = fix && t > T[12] && t < T[13] + 0.6;
  // ---- Norm
  let nx = 0, ny = 0, nVis = true, aro = false, nBrazo = 0, nSalto = 0;
  if (gancho) { nx = -1.4; ny = SUELO + nivel - 0.28; aro = true; nBrazo = 0.6 + 0.4 * Math.sin(t * 8); }
  else if (malo && t < T[5] - 0.05) { nx = 0.95; ny = 0.02; nBrazo = t >= T[3] && t < T[4] ? pr(t, T[3], T[3] + 0.5) : 0; }
  else if (malo) { nx = -1.2; ny = Math.max(SUELO, SUELO + nivel - 0.28); aro = nivel > 0.35; nBrazo = nivel > 0.3 ? 0.6 + 0.4 * Math.sin(t * 8) : 0; }
  else if (t < T[12]) { nx = 2.7; ny = 0.02; nBrazo = t >= T[11] ? 0.5 + 0.4 * Math.sin(t * 7) : 0; }
  else { nx = -1.2; ny = SUELO; nBrazo = t < T[14] ? pr(t, T[12], T[12] + 0.4) : 0.55 + 0.45 * Math.sin(t * 7); nSalto = t < T[13] ? 0.07 * Math.abs(Math.sin(t * 6)) : 0; }
  const hatU = gancho ? (t > 0.7 ? cl((t - 0.7) / 1.1) : 0) : malo && t >= T[7] ? cl((t - T[7]) / 1.1) : 0;
  const gorro: V3 = hatU > 0 ? [0.25 * hatU, Math.sin(Math.PI * hatU) * 0.75, 0] : [0, 0, 0];
  const pata = (u: number, a: number, b: number) => lerp(a, b, u);
  return (
    <group>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 6]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
      <mesh position={[-7, 9, -22]}><sphereGeometry args={[1.5, 24, 16]} /><meshBasicMaterial color={hayAgua ? "#cfd8df" : "#ffe14d"} /></mesh>
      {[[-9, 6, -20, 1.6], [4, 8.5, -24, 2.0], [10, 5.5, -22, 1.4], [-2, 11, -26, 1.8]].map(([x, y, z, s], i) => <group key={i} position={[x + Math.sin(t * 0.15 + i) * 0.6, y, z]} scale={s}>
        {[[-0.9, 0, 0.8], [0, 0.25, 1.1], [0.9, 0, 0.85]].map(([dx, dy, r], j) => <mesh key={j} position={[dx, dy, 0]} scale={[1, 0.7, 1]}><sphereGeometry args={[r, 16, 12]} /><meshBasicMaterial color={hayAgua ? "#9fb0bd" : "#ffffff"} /></mesh>)}
      </group>)}
      {/* terreno: a la derecha de la cimentación, a la izquierda de la casa y bajo el sótano */}
      {[[4.5, 9], [-6, 6]].map(([x, w], k) => <group key={k}>
        <Caja p={[x, -0.02, -4.5]} s={[w, 0.08, 9]} c="#5cc24a" sombra={false} /><Caja p={[x, -0.55, -4.5]} s={[w, 1.0, 9]} c="#8a5a33" sombra={false} />
        <Caja p={[x, -1.4, -4.5]} s={[w, 0.7, 9]} c="#6e4426" sombra={false} /><Caja p={[x, -2.1, -4.5]} s={[w, 0.7, 9]} c="#56331c" sombra={false} /></group>)}
      <Caja p={[-1.65, -2.15, -4.5]} s={[2.7, 0.7, 9]} c="#56331c" sombra={false} />
      {[...Array(24)].map((_, i) => <mesh key={i} position={[0.2 + azar(i + 40) * 5, -0.3 - azar(i + 50) * 1.7, 0.0]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.04 + 0.07 * azar(i + 60), 10, 8]} /><meshLambertMaterial color={i % 2 ? "#9a8f82" : "#70675c"} /></mesh>)}
      {[...Array(60)].map((_, i) => { const x = 0.45 + azar(i + 90) * 4.8; return <mesh key={i} position={[x, wedgeY(x, fix ? pend : 0) + 0.03, -0.02 - azar(i + 91) * 0.2]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.025, 0.14 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>; })}
      {fix && pend > 0 && <mesh position={[0, 0.02, -9]} scale={[1, pend, 1]}><extrudeGeometry args={[WEDGE, { depth: 9, bevelEnabled: false }]} /><meshLambertMaterial color="#5cc24a" /></mesh>}
      {/* la casa: sótano, planta baja, muro, techo */}
      <Caja p={[-1.65, -0.9, -PROF / 2 - 0.02]} s={[2.7, 1.8, PROF]} c="#e3d7b8" sombra={false} />
      <Caja p={[-1.65, -1.85, -PROF / 2 + 0.002]} s={[2.7, 0.1, PROF]} c="#8d97a2" sombra={false} />
      <Caja p={[-1.65, 1.2, -PROF / 2 - 0.02]} s={[2.7, 2.4, PROF]} c="#fff0d0" sombra={false} />
      <Caja p={[-1.65, 0.0, -PROF / 2 + 0.002]} s={[2.7, 0.1, PROF]} c="#c9a27a" sombra={false} />
      <Caja p={[-0.15, -0.9, -PROF / 2 + 0.004]} s={[0.3, 1.9, PROF]} c="#aeb4b8" sombra={false} />
      <Caja p={[-0.15, 1.3, -PROF / 2 + 0.004]} s={[0.3, 2.5, PROF]} c="#5aa9d6" sombra={false} />
      {[...Array(10)].map((_, i) => <Caja key={i} p={[0.003, 0.2 + i * 0.25, -PROF / 2 + 0.006]} s={[0.006, 0.012, PROF]} c="#3f86b0" sombra={false} />)}
      <Caja p={[-1.2, 1.3, 0.0]} s={[0.7, 0.7, 0.03]} c="#bfe6ff" sombra={false} />
      <Caja p={[-1.2, 1.3, 0.02]} s={[0.74, 0.05, 0.02]} c="#ffffff" sombra={false} />
      <mesh position={[-1.5, 2.56, -PROF / 2]} rotation={[0, 0, -0.06]} castShadow><boxGeometry args={[3.6, 0.1, PROF + 0.4]} /><meshLambertMaterial color="#d9482b" /></mesh>
      {/* sótano: sofá, lavadora y cajas */}
      <Caja p={[-2.4, -1.55, 0.3]} s={[0.9, 0.4, 0.5]} c="#8e5bd1" /><Caja p={[-2.4, -1.25, 0.15]} s={[0.9, 0.35, 0.2]} c="#7a49bb" />
      <Caja p={[-0.8, -1.4, 0.3]} s={[0.5, 0.8, 0.5]} c="#ffffff" /><mesh position={[-0.8, -1.4, 0.56]}><circleGeometry args={[0.16, 18]} /><meshBasicMaterial color="#4f9be0" /></mesh>
      <Caja p={[-1.95, -1.68, 0.25]} s={[0.35, 0.24, 0.35]} c="#c98a4b" /><Caja p={[-0.4, -1.72, 0.3]} s={[0.3, 0.16, 0.3]} c="#d9a066" />
      {fix && t >= T[12] && <group>
        <mesh position={[-1.5, -0.55, 0.02]}><boxGeometry args={[2.2, 0.015, 0.01]} /><meshBasicMaterial color="#8a5a33" /></mesh>
        {[[-2.1, "#ff7a1a"], [-1.7, "#27c24c"], [-1.3, "#ff4f7b"]].map(([x, c], i) => <group key={i} position={[x as number, -0.55, 0.03]} rotation={[0, 0, 0.12 * Math.sin(t * 3 + i)]}>
          <mesh position={[0, -0.12, 0]}><boxGeometry args={[0.1, 0.22, 0.02]} /><meshLambertMaterial color={c as string} /></mesh><mesh position={[0.06, -0.24, 0]}><boxGeometry args={[0.15, 0.1, 0.02]} /><meshLambertMaterial color={c as string} /></mesh></group>)}
      </group>}
      {/* canaleta y bajante */}
      <Caja p={[0.22, 2.46, -PROF / 2]} s={[0.4, 0.04, PROF]} c="#cfd8df" /><Caja p={[0.4, 2.54, -PROF / 2]} s={[0.03, 0.16, PROF]} c="#cfd8df" />
      {lluvia && <Caja p={[0.22, 2.5, 0.02]} s={[0.34, 0.06, 0.02]} c="#2f9bff" sombra={false} />}
      <mesh position={[0.2, 1.4, 0.06]}><cylinderGeometry args={[0.05, 0.05, 2.2, 12]} /><meshLambertMaterial color="#d7dde3" /></mesh>
      <mesh position={[0.29, 0.25, 0.06]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 0.22, 12]} /><meshLambertMaterial color="#d7dde3" /></mesh>
      {[0.8, 1.8].map((y) => <Caja key={y} p={[0.1, y, 0.04]} s={[0.12, 0.04, 0.04]} c="#8a96a3" sombra={false} />)}
      {lluvia && [...Array(10)].map((_, i) => { const u = (t * 0.9 + i / 10) % 1; return <mesh key={i} position={[0.2, lerp(2.4, 0.3, u), 0.11]} scale={[1, 1.6, 1]}><sphereGeometry args={[0.022, 8, 6]} /><meshBasicMaterial color="#2f9bff" /></mesh>; })}
      {/* BIEN: extensión de 6 a 10 pies y pendiente */}
      {fix && ext > 0 && <>
        <mesh position={[cxp, cyp + 0.0, 0.06]} rotation={[0, 0, Math.PI / 2 + ang]}><cylinderGeometry args={[0.05, 0.05, lp, 12]} /><meshLambertMaterial color="#e8b04a" /></mesh>
        <mesh position={[xe, ye, 0.06]} rotation={[0, 0, Math.PI / 2 + ang]}><cylinderGeometry args={[0.062, 0.062, 0.05, 12]} /><meshLambertMaterial color="#c9922f" /></mesh>
      </>}
      {fix && lluvia && ext > 0.9 && [...Array(12)].map((_, i) => { const u = (t * 1.1 + i / 12) % 1; return <mesh key={i} position={[xe + 0.05 + 1.1 * u, ye - 0.02 - 0.12 * u * u - (wedgeY(xe, pend) - wedgeY(xe + 1.1 * u, pend)) * 0 , 0.08]} scale={[1, 1.4, 1]}><sphereGeometry args={[0.022, 8, 6]} /><meshBasicMaterial color="#2f9bff" transparent opacity={1 - 0.6 * u} /></mesh>; })}
      {/* MAL: salpicadura al pie del muro, tierra empapada, grieta y chorro */}
      {malo && lluvia && [...Array(8)].map((_, i) => { const u = (t * 1.3 + i / 8) % 1; return <mesh key={i} position={[0.3 + 0.28 * (azar(i) - 0.2) * u + 0.1 * u, 0.04 + 0.2 * Math.sin(Math.PI * u), 0.1]} scale={[1, 1.3, 1]}><sphereGeometry args={[0.02, 8, 6]} /><meshBasicMaterial color="#2f9bff" /></mesh>; })}
      {(malo || gancho) && mojado > 0 && <Caja p={[0.15 + 0.55 * mojado, -0.95, 0.008]} s={[1.1 * mojado + 0.3, 1.9, 0.01]} c="#3a2412" o={0.55} sombra={false} recibe={false} />}
      {(malo || gancho) && mojado > 0 && mojado < 1 && [...Array(14)].map((_, i) => { const u = (t * 0.6 + i / 14) % 1; return <mesh key={i} position={[0.15 + 0.9 * azar(i + 3) * mojado, lerp(0.0, -1.4, u), 0.03]} scale={[1, 1.4, 1]}><sphereGeometry args={[0.016, 8, 6]} /><meshBasicMaterial color="#2f9bff" transparent opacity={1 - u * 0.5} /></mesh>; })}
      {grieta > 0 && <group position={[-0.15, -0.95, 0.012]}>
        {[[0.0, 0.1, 0.34, 0.3], [-0.05, -0.0, 0.3, -0.5], [0.04, -0.12, 0.26, 0.4]].map(([x, y, w, r], i) => <mesh key={i} position={[x, y, 0]} rotation={[0, 0, r]} scale={[grieta, 1, 1]}><boxGeometry args={[w * 0.5, 0.025, 0.01]} /><meshBasicMaterial color="#1a120c" /></mesh>)}
      </group>}
      {malo && chorro && grieta > 0.6 && [...Array(16)].map((_, i) => { const u = (t * 1.2 + i / 16) % 1; return <mesh key={i} position={[-0.3 - 0.75 * u, -0.95 - 0.55 * u * u + 0.05 * Math.sin(i), 0.4]} scale={[1.4, 1, 1]}><sphereGeometry args={[0.022, 8, 6]} /><meshBasicMaterial color="#2f9bff" /></mesh>; })}
      {gancho && t < T[2] && [...Array(14)].map((_, i) => { const u = (t * 1.2 + i / 14) % 1; return <mesh key={i} position={[-0.3 - 0.75 * u, -0.95 - 0.55 * u * u, 0.4]} scale={[1.4, 1, 1]}><sphereGeometry args={[0.022, 8, 6]} /><meshBasicMaterial color="#2f9bff" /></mesh>; })}
      {nivel > 0 && <>
        <Caja p={[-1.65, SUELO + nivel / 2, 0.6]} s={[2.7, nivel, 0.012]} c="#2f9bff" o={0.5} sombra={false} recibe={false} />
        {[...Array(12)].map((_, i) => <mesh key={i} position={[-2.95 + i * 0.22, SUELO + nivel + 0.015 * Math.sin(t * 3 + i), 0.61]}><sphereGeometry args={[0.05, 8, 6]} /><meshBasicMaterial color="#bfe3ff" /></mesh>)}
      </>}
      {lluvia && [...Array(130)].map((_, i) => { const u = (t * (1.6 + azar(i)) + azar(i + 200)) % 1; return <mesh key={i} position={[-1.8 + azar(i + 210) * 4.4, lerp(3.4, 0.0, u), 0.7 - azar(i + 220) * 2.8]} scale={[1, 5, 1]}><sphereGeometry args={[0.008, 6, 4]} /><meshBasicMaterial color="#bfe3ff" /></mesh>; })}
      {confeti && [...Array(60)].map((_, i) => { const u = ((t - T[12]) * (0.35 + 0.2 * azar(i)) + azar(i + 5)) % 1; return <mesh key={i} position={[-2.4 + azar(i + 11) * 2.2 + 0.1 * Math.sin(t * 3 + i), lerp(0.0, -1.7, u), 0.5 - azar(i + 21) * 1.0]} rotation={[t * 3 + i, t * 2 + i, 0]}><boxGeometry args={[0.05, 0.02, 0.05]} /><meshBasicMaterial color={["#ff4f7b", "#ffd23f", "#35c9c9", "#c56bff", "#ff7a1a"][i % 5]} /></mesh>; })}
      {nVis && <group position={[nx, ny + nSalto, 0.3]}>
        <Norm p={[0, 0, 0]} t={t} giro={-0.3} gorro={gorro} grieta={gancho || t >= T[7] || fix} brazo={nBrazo} salto={0} />
        {aro && <mesh position={[0, 0.27, 0.0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.23, 0.06, 10, 24]} /><meshLambertMaterial color="#ffd23f" /></mesh>}
      </group>}
    </group>
  );
};

// ---------------------------------------------------------------- rótulos
const F = "DejaVu Sans, Arial, sans-serif";
const pcam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80), vv = new THREE.Vector3();
const pantalla = (t: number, p: V3): [number, number] => { const c = camEn(t); pcam.position.set(...c.pos); pcam.lookAt(...c.look); pcam.updateMatrixWorld(); vv.set(...p).project(pcam); return [(vv.x + 1) * 540, (1 - vv.y) * 960]; };
const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const titulo = Math.min(pr(t, 0.12, 0.4), 1 - pr(t, T[1] - 0.25, T[1] - 0.02));
  const ahora = Math.min(pr(t, T[1] + 0.05, T[1] + 0.3), 1 - pr(t, T[1] + 1.0, T[1] + 1.2)), nover = Math.min(pr(t, T[1] + 1.25, T[1] + 1.5), 1 - pr(t, T[2] - 0.2, T[2]));
  const pared = Math.min(pr(t, T[2] + 1.8, T[2] + 2.1), 1 - pr(t, T[3] - 0.1, T[3] + 0.1));
  const espon = Math.min(pr(t, T[4] + 0.9, T[4] + 1.2), 1 - pr(t, T[5] - 0.1, T[5] + 0.1));
  const grieta = Math.min(pr(t, T[5] + 1.2, T[5] + 1.5), 1 - pr(t, T[5] + 3.0, T[5] + 3.3));
  const piscina = Math.min(pr(t, T[6] + 0.4, T[6] + 0.7), 1 - pr(t, T[7] - 0.05, T[7] + 0.1));
  const ext = Math.min(pr(t, T[9] + 0.7, T[9] + 1.0), 1 - pr(t, T[9] + 1.8, T[9] + 2.0));
  const [x0, y0] = pantalla(t, [0.0, 0.62, 0.1]), [x1] = pantalla(t, [2.0, 0.62, 0.1]);
  const medida = Math.min(pr(t, T[9] + 1.9, T[9] + 2.2), 1 - pr(t, T[10] - 0.1, T[10] + 0.1));
  const pend = Math.min(pr(t, T[10] + 0.5, T[10] + 0.8), 1 - pr(t, T[10] + 2.0, T[10] + 2.3)), [sx, sy0] = pantalla(t, [0.0, 0.02, 0.1]), [, sy1] = pantalla(t, [0.0, 0.2, 0.1]);
  const drop = Math.min(pr(t, T[10] + 2.2, T[10] + 2.5), 1 - pr(t, T[11] - 0.05, T[11] + 0.05));
  const seco = Math.min(pr(t, T[11] + 0.5, T[11] + 0.8), 1 - pr(t, T[12] - 0.1, T[12] + 0.05));
  const sello = Math.min(pr(t, T[12] + 1.8, T[12] + 2.05), 1 - pr(t, T[13] - 0.2, T[13] + 0.05));
  const pregunta = Math.min(pr(t, T[13] + 0.05, T[13] + 0.4), 1 - pr(t, T[14] - 0.2, T[14] + 0.05)), fin = pr(t, T[14] - 0.05, T[14] + 0.3);
  const big = (s: string, o: number, col: string, line: string, tam = 100, y = 300) => <text x={540} y={y} opacity={o} fontSize={tam} fill={col} stroke={line} strokeWidth={tam * 0.2} strokeLinejoin="round" paintOrder="stroke">{s}</text>;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">
      {titulo > 0 && <g opacity={titulo} transform={`translate(540 ${250 - 20 * (1 - titulo)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
        <text fontSize={96} fill="#fff" strokeWidth={20}>YOUR BASEMENT</text><text y={130} fontSize={138} fill="#ff7a1a" strokeWidth={26}>WILL FLOOD</text></g>}
      {ahora > 0 && big("RIGHT NOW!", ahora, "#ff2a2a", "#fff", 130)}
      {nover > 0 && big("YOU CAN'T SEE IT", nover, "#fff", "#14321f", 92)}
      {pared > 0 && big("DUMPS AT THE WALL", pared, "#ff2a2a", "#fff", 84)}
      {espon > 0 && big("LIKE A SPONGE", espon, "#fff", "#14321f", 100)}
      {grieta > 0 && big("TINY CRACK", grieta, "#ff2a2a", "#fff", 120)}
      {piscina > 0 && big("SWIMMING POOL!", piscina, "#fff", "#14321f", 96)}
      {ext > 0 && big("EXTENSION", ext, "#fff", "#14321f", 120)}
      {medida > 0 && <g opacity={medida} stroke="#14321f" strokeWidth={8} strokeLinecap="round">
        <line x1={x0} y1={y0} x2={x1} y2={y0} /><line x1={x0} y1={y0 - 22} x2={x0} y2={y0 + 22} /><line x1={x1} y1={y0 - 22} x2={x1} y2={y0 + 22} />
        <text x={(x0 + x1) / 2} y={y0 - 40} fontSize={100} fill="#fff" strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">6–10 ft</text></g>}
      {pend > 0 && big("SLOPE AWAY", pend, "#fff", "#14321f", 120)}
      {drop > 0 && <g opacity={drop} stroke="#14321f" strokeWidth={8} strokeLinecap="round">
        <line x1={sx - 30} y1={sy0} x2={sx - 30} y2={sy1} /><line x1={sx - 54} y1={sy0} x2={sx - 6} y2={sy0} /><line x1={sx - 54} y1={sy1} x2={sx - 6} y2={sy1} />
        <text x={Math.min(Math.max(sx + 30, 120), 480)} y={(sy0 + sy1) / 2 - 20} textAnchor="start" fontSize={84} fill="#fff" strokeWidth={16} strokeLinejoin="round" paintOrder="stroke">6 in / 10 ft</text></g>}
      {seco > 0 && big("DRY!", seco, "#27c24c", "#fff", 170)}
      {sello > 0 && <g transform={`translate(540 440) rotate(-8) scale(${lerp(2.2, 1, sello)})`} opacity={sello}>
        <rect x={-250} y={-74} width={500} height={148} rx={22} fill="#27c24c" stroke="#fff" strokeWidth={10} /><text y={24} fontSize={62} fill="#fff">UP TO NORM</text></g>}
      {pregunta > 0 && <g opacity={pregunta} transform={`translate(540 ${300 - 12 * (1 - pregunta)})`}>
        <text fontSize={76} fill="#fff" stroke="#14321f" strokeWidth={17} strokeLinejoin="round" paintOrder="stroke">DOES YOUR DOWNSPOUT</text>
        <text y={105} fontSize={92} fill="#ffd23f" stroke="#14321f" strokeWidth={19} strokeLinejoin="round" paintOrder="stroke">DUMP AT THE WALL?</text></g>}
      {fin > 0 && <g opacity={fin} transform={`translate(0 ${-40 * (1 - fin)})`}>
        <rect x={70} y={120} width={940} height={640} rx={48} fill="#14321f" opacity={0.93} stroke="#fff" strokeWidth={8} />
        <g transform={`translate(540 300) scale(${1 + 0.04 * Math.sin(t * 6)})`}><rect x={-290} y={-100} width={580} height={190} rx={95} fill="#ff7a1a" stroke="#fff" strokeWidth={10} /><text y={42} fontSize={118} fill="#fff">FOLLOW</text></g>
        <text x={540} y={500} fontSize={58} fill="#fff">for more backyard builds</text><text x={540} y={570} fontSize={58} fill="#ffd23f">that won't fail!</text>
        <text x={540} y={690} fontSize={46} fill="#bfeaff">NEXT: YOUR STAIRS WILL TRIP YOU</text></g>}
    </svg>
  );
};

export const GutterVideo: React.FC = () => {
  const f = useCurrentFrame(), t = f / GUT_FPS;
  const destello = t >= T[8] - 0.2 && t < T[8] + 0.4 ? (t < T[8] ? pr(t, T[8] - 0.2, T[8]) : 1 - pr(t, T[8], T[8] + 0.4)) : 0;
  const negro = Math.max(1 - pr(t, 0, 0.25), pr(t, GUT_SEG - 0.5, GUT_SEG));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#55b8ff 0%, #bfeaff 62%, #e9fbff 100%)" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: FOV, near: 0.1, far: 80 }} gl={{ antialias: true }}><Mundo t={t} /></ThreeCanvas>
      <Rotulos t={t} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Subtitulos palabras={PAL} t={t} claves={CLAVES} y={1560} ocultoDesde={T[14] - 0.05} />
        <rect x={0} y={0} width={1080 * (t / GUT_SEG)} height={14} fill="#ffd23f" opacity={0.95} />
      </svg>
      {destello > 0 && <AbsoluteFill style={{ background: "#fff", opacity: destello }} />}
      {negro > 0 && <AbsoluteFill style={{ background: "#fff", opacity: negro }} />}
    </AbsoluteFill>
  );
};
