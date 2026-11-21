// «Your deck will pull away from your house» — capítulo 3 del canal en inglés (vertical 1080x1920, 30 cps, three.js).
// Corte transversal en z = 0: casa a la izquierda, larguero (ledger) clavado, la terraza hacia la derecha sobre un poste.
// Los tiempos salen de tiempos.json (una entrada por frase de la voz).
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { cl, pr, lerp, azar, mezcla, rebote, Caja, Norm } from "../fence-01/Fence";
import tiempos from "./tiempos.json";

export const DECK_FPS = 30, DECK_SEG = Math.round((tiempos.total + 1.1) * 10) / 10, DECK_CUADROS = Math.round(DECK_FPS * DECK_SEG);
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3 };
const T = tiempos.frases.map((f) => f.a), TE = tiempos.frases.map((f) => f.b);
const PROF = 4.5, PX = 2.6, PY = 0.78, ARRIBA = 1.0; // pivote de la terraza y altura de la cubierta
const FALLA0 = T[8] + 0.75; // el larguero cede

const C = {
  gancho: { pos: [1.7, 1.2, 8.2], look: [0.9, 0.75, 0] } as Cam, gancho2: { pos: [1.5, 1.1, 7.4], look: [0.8, 0.7, 0] } as Cam,
  pared: { pos: [0.6, 1.0, 4.2], look: [0.05, 0.9, 0] } as Cam, pared2: { pos: [0.9, 1.05, 5.6], look: [0.4, 0.95, 0] } as Cam,
  ancho: { pos: [1.6, 1.4, 8.0], look: [1.0, 1.0, 0] } as Cam, ancho2: { pos: [1.5, 1.35, 7.4], look: [1.0, 1.0, 0] } as Cam,
  clavos: { pos: [0.55, 0.95, 3.0], look: [0.0, 0.9, 0] } as Cam, clavos2: { pos: [0.45, 0.93, 2.7], look: [-0.02, 0.9, 0] } as Cam,
  lluvia: { pos: [0.7, 1.25, 3.4], look: [-0.1, 1.05, 0] } as Cam, lluvia2: { pos: [0.55, 1.2, 3.0], look: [-0.12, 1.02, 0] } as Cam,
  cae: { pos: [1.5, 1.1, 7.6], look: [0.9, 0.85, 0] } as Cam, cae2: { pos: [1.3, 1.0, 7.0], look: [0.8, 0.8, 0] } as Cam,
  arreglo: { pos: [1.0, 1.0, 5.4], look: [0.2, 0.9, 0] } as Cam, arreglo2: { pos: [0.8, 1.0, 4.6], look: [0.1, 0.92, 0] } as Cam,
  flash: { pos: [0.5, 1.15, 3.0], look: [-0.15, 1.05, 0] } as Cam, flash2: { pos: [0.4, 1.12, 2.7], look: [-0.17, 1.03, 0] } as Cam,
  pernos: { pos: [0.4, 0.95, 2.8], look: [-0.3, 0.88, 0] } as Cam, pernos2: { pos: [0.3, 0.93, 2.5], look: [-0.3, 0.88, 0] } as Cam,
  fiesta: { pos: [1.6, 1.3, 8.2], look: [1.0, 1.0, 0] } as Cam, fiesta2: { pos: [1.5, 1.25, 7.6], look: [1.0, 1.0, 0] } as Cam,
  fin: { pos: [1.5, 1.6, 7.8], look: [1.0, 1.7, 0] } as Cam, fin2: { pos: [1.4, 1.55, 7.4], look: [1.0, 1.65, 0] } as Cam,
};
const CAMS: [number, number, Cam, Cam][] = [
  [0, T[2], C.gancho, C.gancho2], [T[2], T[3], C.pared, C.pared2], [T[3], T[4], C.ancho, C.ancho2], [T[4], T[6], C.ancho2, C.ancho], [T[6], T[7], C.clavos, C.clavos2],
  [T[7], T[8], C.lluvia, C.lluvia2], [T[8], T[10], C.cae, C.cae2], [T[10], T[11], C.arreglo, C.arreglo2], [T[11], T[12], C.flash, C.flash2],
  [T[12], T[14], C.pernos, C.pernos2], [T[14], T[15], C.fiesta, C.fiesta2], [T[15], 99, C.fin, C.fin2],
];
const camEn = (t: number): Cam => {
  const s = CAMS.find((x) => t >= x[0] && t < x[1]) ?? CAMS[CAMS.length - 1], u = cl((t - s[0]) / (s[1] - s[0])), k = u * u * (3 - 2 * u);
  const m = (a: V3, b: V3): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  return { pos: m(s[2].pos, s[3].pos), look: m(s[2].look, s[3].look) };
};
const FOV = 34;
const L = (x: number, y: number): [number, number] => [x - PX, y - PY]; // mundo -> local de la terraza

const COL_AMIGOS = ["#ff4f7b", "#ffd23f", "#c56bff", "#35c9c9"];
const Amigo: React.FC<{ p: V3; c: string; t: number; baila?: number; giro?: number }> = ({ p, c, t, baila = 0, giro = 0 }) => {
  const sal = baila * Math.abs(Math.sin(t * 6 + p[0] * 3)) * 0.07;
  return (
    <group position={[p[0], p[1] + sal, p[2]]} rotation={[0, giro, 0]}>
      <mesh position={[0, 0.18, 0]} castShadow><cylinderGeometry args={[0.085, 0.1, 0.3, 14]} /><meshLambertMaterial color={c} /></mesh>
      <mesh position={[0, 0.4, 0]} castShadow><sphereGeometry args={[0.1, 16, 12]} /><meshLambertMaterial color="#f2c7a0" /></mesh>
      {[-0.04, 0.04].map((x) => <mesh key={x} position={[x, 0.42, 0.085]}><sphereGeometry args={[0.014, 8, 6]} /><meshBasicMaterial color="#1a1a1a" /></mesh>)}
      <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.085, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshLambertMaterial color={c} /></mesh>
      {[-1, 1].map((k) => <mesh key={k} position={[0.1 * k, 0.24 + baila * 0.08 * Math.abs(Math.sin(t * 6)), 0]} rotation={[0, 0, k * (0.5 + baila * 1.2)]}><cylinderGeometry args={[0.022, 0.022, 0.2, 8]} /><meshLambertMaterial color={c} /></mesh>)}
    </group>
  );
};

type Estado = { fix: boolean; theta: number; delta: number; rot: number; ledger: number; clavos: number[]; joist: number; tablas: number; fiesta: number; guest: number; hundido: number; flashing: number; pernos: number[]; sombraCarga: number };
const Terraza: React.FC<{ e: Estado; t: number }> = ({ e, t }) => {
  const madera = mezcla("#c98a4b", "#4a3320", e.rot).getStyle(), larguero = mezcla("#d9a566", "#4a3320", e.rot).getStyle();
  const W_J = 2.93 * e.joist;
  return (
    <group>
      {/* la casa: interior, muro y revestimiento azul */}
      <Caja p={[-1.9, 1.7, -PROF / 2]} s={[2.65, 3.4, PROF]} c="#fff0d0" sombra={false} />
      <Caja p={[-1.9, 0.05, -PROF / 2 + 0.002]} s={[2.65, 0.1, PROF]} c="#c9a27a" sombra={false} />
      <Caja p={[-0.4, 1.7, -PROF / 2]} s={[0.3, 3.4, PROF]} c="#e8dcc0" sombra={false} />
      <Caja p={[-0.265, 1.7, -PROF / 2 + 0.002]} s={[0.03, 3.4, PROF]} c="#5aa9d6" sombra={false} />
      {[...Array(14)].map((_, i) => <Caja key={i} p={[-0.249, 0.15 + i * 0.25, -PROF / 2 + 0.003]} s={[0.006, 0.012, PROF]} c="#3f86b0" sombra={false} />)}
      <Caja p={[-0.415, ARRIBA - 0.13, -PROF / 2 + 0.003]} s={[0.27, 0.26, PROF]} c={larguero} sombra={false} />
      {/* poste y zapata */}
      <Caja p={[PX, 0.36, -0.2]} s={[0.12, 0.72, 0.4]} c="#c98a4b" sombra={false} />
      <Caja p={[PX, -0.18, -0.2 + 0.004]} s={[0.4, 0.36, 0.4]} c="#aeb4b8" sombra={false} />
      {/* la terraza: gira sobre el poste cuando el larguero cede */}
      <group position={[PX + e.delta, PY, 0]} rotation={[0, 0, e.theta]}>
        {e.ledger > 0 && <Caja p={[...L(-0.19, 0.88 + lerp(0.7, 0, e.ledger)), -PROF / 2 + 0.004]} s={[0.12, 0.2, PROF]} c={madera} />}
        {e.rot > 0.3 && [[-0.02, 0.05], [0.03, -0.04], [0, 0.0]].map(([dx, dy], i) => { const [lx, ly] = L(-0.125, 0.88 + dy * 1.2); return <mesh key={i} position={[lx, ly, 0.012]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.018 + 0.008 * i, 10]} /><meshBasicMaterial color="#1f150d" transparent opacity={e.rot * 0.85} /></mesh>; })}
        {e.joist > 0 && <Caja p={[...L(-0.13 + W_J / 2, 0.875), -PROF / 2 + 0.006]} s={[W_J, 0.19, PROF]} c="#c98a4b" />}
        {e.tablas > 0 && <Caja p={[...L(1.4, ARRIBA - 0.015 + lerp(0.5, 0, e.tablas)), -PROF / 2 + 0.006]} s={[3.05, 0.03, PROF]} c="#e8b36b" />}
        {/* clavos: delgados y cortos; con la falla se quedan medio fuera */}
        {!e.fix && [0.82, 0.88, 0.94].map((y, i) => e.clavos[i] > 0 && <group key={i} position={[...L(-0.31 + lerp(0.2, 0, e.clavos[i]), y), 0.03]}>
          <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.009, 0.009, 0.4, 6]} /><meshBasicMaterial color="#6b7480" /></mesh>
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.022, 0.022, 0.012, 10]} /><meshBasicMaterial color="#6b7480" /></mesh>
        </group>)}
        {/* cooler y parrilla */}
        {e.fiesta > 0 && <>
          <group position={[...L(2.15, ARRIBA), -0.9]}><mesh position={[0, 0.11, 0]} castShadow><boxGeometry args={[0.36, 0.22, 0.24]} /><meshLambertMaterial color="#2f9bff" /></mesh><mesh position={[0, 0.235, 0]}><boxGeometry args={[0.38, 0.03, 0.26]} /><meshLambertMaterial color="#ffffff" /></mesh></group>
          <group position={[...L(0.75, ARRIBA), -1.1]}><mesh position={[0, 0.22, 0]} castShadow scale={[1, 0.65, 1]}><sphereGeometry args={[0.15, 16, 12]} /><meshLambertMaterial color="#e63946" /></mesh>
            {[-0.08, 0.08].map((x) => <mesh key={x} position={[x, 0.08, 0]}><cylinderGeometry args={[0.012, 0.012, 0.16, 6]} /><meshLambertMaterial color="#333" /></mesh>)}
            {[-0.04, 0.05].map((x, i) => <mesh key={i} position={[x, 0.34, 0.02]}><cylinderGeometry args={[0.035, 0.035, 0.018, 12]} /><meshLambertMaterial color="#8a4b2a" /></mesh>)}</group>
          {[0, 1, 2].map((i) => <group key={i}><mesh position={[...L(2.86, 1.62 + 0.2 * i + 0.04 * Math.sin(t * 2 + i)), -0.4 - 0.1 * i]} castShadow scale={[1, 1.15, 1]}><sphereGeometry args={[0.11, 14, 10]} /><meshLambertMaterial color={["#ff4f7b", "#ffd23f", "#35c9c9"][i]} /></mesh>
            <mesh position={[...L(2.86, 1.25 + 0.1 * i), -0.4 - 0.1 * i]}><cylinderGeometry args={[0.004, 0.004, 0.62 + 0.2 * i, 4]} /><meshBasicMaterial color="#ffffff" /></mesh></group>)}
        </>}
        {/* amigos: llegan bailando; el cuarto salta desde la derecha */}
        {e.fiesta > 0 && [[0.62, 0], [1.75, 1], [2.35, 2]].map(([x, i], k) => <Amigo key={k} p={[...L(x - (k === 1 ? 0.35 * e.hundido : 0), ARRIBA + lerp(0.5, 0, e.fiesta)), -1.3 + 0.35 * k]} c={COL_AMIGOS[i]} t={t} baila={e.guest > 0 || e.fix ? 0 : 1} giro={-0.4} />)}
        {e.guest > 0 && <Amigo p={[...L(lerp(3.5, 2.05, e.guest), ARRIBA + 0.7 * Math.sin(Math.PI * e.guest)), -0.4]} c={COL_AMIGOS[3]} t={t} giro={-0.4} />}
      </group>
      {/* los clavos de la falla se quedan en la pared */}
    </group>
  );
};

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = camEn(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  const gancho = t < T[2], fix = t >= T[10] + 0.1;
  const lluvia = (t > T[7] && t < T[9]) || (t > T[11] - 0.2 && t < T[12] + 1.0);
  // construcción (frase 2) y estado del daño
  const arma = gancho ? 9 : t < T[2] + 3 ? t - T[2] : 9;
  const clavos = [0, 1, 2].map((i) => gancho || t >= T[2] + 3 || fix ? (fix ? 0 : 1) : pr(arma, 0.9 + i * 0.3, 1.1 + i * 0.3));
  const ledger = gancho || fix || t >= T[2] + 3 ? 1 : pr(arma, 0.15, 0.7);
  const joist = gancho || t >= T[2] + 3 ? 1 : pr(arma, 1.5, 2.3);
  const tablas = gancho || t >= T[2] + 3 ? 1 : pr(arma, 2.2, 2.8);
  const fiesta = gancho ? 0 : fix ? (t >= T[14] ? pr(t, T[14], T[14] + 0.4) : 0) : pr(t, T[4] + 0.1, T[4] + 0.7);
  const guest = !fix && t >= T[8] + 0.1 && t < FALLA0 + 0.3 ? cl((t - (T[8] + 0.1)) / 0.7) : 0;
  const colapso = gancho ? cl((t - 0.9) / 0.9) : !fix && t >= FALLA0 ? cl((t - FALLA0) / 0.9) : 0;
  const theta = 0.28 * rebote(colapso), delta = gancho ? 0.12 * pr(t, 0.8, 1.2) : !fix && t >= FALLA0 - 0.4 ? 0.12 * pr(t, FALLA0 - 0.4, FALLA0 + 0.2) : 0;
  const rot = gancho ? 0.8 : fix ? 0 : pr(t, T[7], T[7] + 2.4);
  const hundido = gancho ? pr(t, 1.0, 1.7) : !fix ? pr(t, FALLA0, FALLA0 + 0.6) : 0;
  const e: Estado = { fix, theta, delta, rot, ledger, clavos, joist, tablas, fiesta: gancho ? 0 : fiesta, guest, hundido, flashing: 0, pernos: [0, 0], sombraCarga: 0 };
  // Norm: se desliza hacia la casa cuando cede
  const nx = lerp(1.3, 0.55, hundido), norm_y = ARRIBA, hatU = gancho ? cl((t - 1.2) / 1.1) : !fix && t >= FALLA0 + 0.2 ? cl((t - FALLA0 - 0.2) / 1.1) : 0;
  const gorro: V3 = hatU > 0 ? [0.25 * pr(hatU, 0, 1), Math.sin(Math.PI * hatU) * 0.75, 0] : [0, 0, 0];
  const brazo = t >= T[3] && t < T[4] ? pr(t, T[3], T[3] + 0.5) : t >= T[14] && t < T[15] ? pr(t, T[14], T[14] + 0.4) : t >= T[15] + 0.1 ? 0.55 + 0.45 * Math.sin(t * 7) : 0;
  const salto = (!fix && t >= T[6] && t < T[7]) ? 0.09 * Math.abs(Math.sin((t - T[6]) * 7)) : (t >= T[14] && t < T[15] ? 0.08 * Math.abs(Math.sin(t * 6)) : 0);
  const normPos: V3 = [nx - PX, norm_y - PY + salto, -0.5];
  const ang = theta, cx = Math.cos(ang), sx = Math.sin(ang);
  // posición mundial de Norm dentro del grupo girado
  const nw: V3 = [PX + delta + normPos[0] * cx - normPos[1] * sx, PY + normPos[0] * sx + normPos[1] * cx, normPos[2]];
  const flashY = fix ? lerp(0.8, 0, rebote(pr(t, T[11] + 0.15, T[11] + 0.85))) : 0, flashOn = fix && t >= T[11] + 0.15;
  const gotas = fix && t > T[11] + 0.9 && t < T[12] + 0.5;
  const tuerca = (i: number) => (fix && t >= T[12] + 0.25 + i * 0.35) ? lerp(0.6, 0, pr(t, T[12] + 0.25 + i * 0.35, T[12] + 0.75 + i * 0.35)) : -1;
  const polvo = !fix && t >= FALLA0 + 0.6 && t < FALLA0 + 1.8 ? cl((t - FALLA0 - 0.6) / 1.2) : 0;
  const confeti = fix && t > T[14] && t < T[15] + 0.5;
  return (
    <group>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 5]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
      <mesh position={[8, 10, -22]}><sphereGeometry args={[1.5, 24, 16]} /><meshBasicMaterial color="#ffe14d" /></mesh>
      {[[-6, 6, -20, 1.6], [4, 8.5, -24, 2.0], [10, 5.5, -22, 1.4], [-2, 11, -26, 1.8]].map(([x, y, z, s], i) => <group key={i} position={[x + Math.sin(t * 0.15 + i) * 0.6, y, z]} scale={s}>
        {[[-0.9, 0, 0.8], [0, 0.25, 1.1], [0.9, 0, 0.85]].map(([dx, dy, r], j) => <mesh key={j} position={[dx, dy, 0]} scale={[1, 0.7, 1]}><sphereGeometry args={[r, 16, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      </group>)}
      <Caja p={[0, -0.02, -4.5]} s={[18, 0.08, 9]} c="#5cc24a" sombra={false} />
      <Caja p={[0, -0.55, -4.5]} s={[18, 1.0, 9]} c="#8a5a33" sombra={false} />
      <Caja p={[0, -1.4, -4.5]} s={[18, 0.7, 9]} c="#6e4426" sombra={false} />
      <Caja p={[0, -1.95, -4.5]} s={[18, 0.4, 9]} c="#56331c" sombra={false} />
      {[...Array(30)].map((_, i) => <mesh key={i} position={[(azar(i + 40) - 0.5) * 12, -0.15 - azar(i + 50) * 1.8, 0.0]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.04 + 0.07 * azar(i + 60), 10, 8]} /><meshLambertMaterial color={i % 2 ? "#9a8f82" : "#70675c"} /></mesh>)}
      {[...Array(70)].map((_, i) => { const x = -0.2 + azar(i + 90) * 5; return <mesh key={i} position={[x, 0.05, -0.02 - azar(i + 91) * 0.2]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.025, 0.14 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>; })}
      {[[3.6, -2.2, 0.55], [4.6, -3.4, 0.7], [3.0, -4.6, 0.6]].map(([x, z, r], i) => <mesh key={i} position={[x, r * 0.7, z]} scale={[1, 0.8, 1]} castShadow><sphereGeometry args={[r, 18, 14]} /><meshLambertMaterial color={i % 2 ? "#2f9a4a" : "#43b85c"} /></mesh>)}
      {[...Array(18)].map((_, i) => { const x = 0.4 + azar(i + 120) * 4.6, z = -0.8 - azar(i + 121) * 5; return <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.012, 0.012, 0.22, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
        <mesh position={[0, 0.24, 0]} castShadow><sphereGeometry args={[0.06, 10, 8]} /><meshLambertMaterial color={["#ff4f7b", "#ffd23f", "#ff8a2a", "#c56bff", "#ffffff"][i % 5]} /></mesh>
      </group>; })}
      <Terraza e={e} t={t} />
      {/* flashing: lámina de metal que sube detrás del revestimiento y cubre el larguero */}
      {flashOn && <group position={[0, flashY, 0.03]}>
        <mesh position={[-0.255, 1.12, 0]}><boxGeometry args={[0.022, 0.32, 0.01]} /><meshLambertMaterial color="#d3dbe2" /></mesh>
        <mesh position={[-0.16, 0.99, 0]}><boxGeometry args={[0.2, 0.022, 0.01]} /><meshLambertMaterial color="#d3dbe2" /></mesh>
        <mesh position={[-0.072, 0.965, 0]}><boxGeometry args={[0.018, 0.06, 0.01]} /><meshLambertMaterial color="#d3dbe2" /></mesh>
      </group>}
      {gotas && [...Array(12)].map((_, i) => { const u = (t * 0.8 + i / 12) % 1; const y = u < 0.45 ? lerp(1.75, 1.0, u / 0.45) : u < 0.75 ? 1.0 : lerp(0.95, 0.4, ((u - 0.75) / 0.25) ** 1.5); const x = u < 0.45 ? -0.24 : u < 0.75 ? lerp(-0.24, -0.07, (u - 0.45) / 0.3) : -0.065 + 0.04 * (u - 0.75); return <mesh key={i} position={[x, y, 0.045]} scale={[1, 1.5, 1]}><sphereGeometry args={[0.014, 8, 6]} /><meshBasicMaterial color="#2f9bff" /></mesh>; })}
      {/* pernos pasantes con arandela y tuerca */}
      {[0.82, 0.94].map((y, i) => { const o = tuerca(i); return o < 0 ? null : (
        <group key={i} position={[o, y, 0.05]}>
          <mesh position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.022, 0.022, 0.46, 10]} /><meshLambertMaterial color="#8a96a3" /></mesh>
          <mesh position={[-0.095, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 0.05, 6]} /><meshLambertMaterial color="#5f6975" /></mesh>
          <mesh position={[-0.135, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.065, 0.065, 0.012, 16]} /><meshLambertMaterial color="#c9d2da" /></mesh>
          <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 0.04, 6]} /><meshLambertMaterial color="#5f6975" /></mesh>
          <mesh position={[-0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.065, 0.065, 0.012, 16]} /><meshLambertMaterial color="#c9d2da" /></mesh>
        </group>); })}
      {/* polvo al caer */}
      {polvo > 0 && [...Array(10)].map((_, i) => <mesh key={i} position={[0.1 + azar(i) * 0.5 + polvo * (azar(i + 4) - 0.3) * 0.6, 0.12 + polvo * 0.3 * azar(i + 8), 0.1]}><sphereGeometry args={[0.08 + 0.1 * polvo, 10, 8]} /><meshBasicMaterial color="#efe6d2" transparent opacity={0.8 * (1 - polvo)} /></mesh>)}
      {/* flechas rojas: cada paso tira de los clavos */}
      {!fix && t >= T[6] && t < T[7] + 0.2 && [0.82, 0.88, 0.94].map((y, i) => { const Ln = (0.1 + 0.18 * pr(t, T[6], T[6] + 1.2)) * (1 + 0.1 * Math.sin(t * 10 + i)); return (
        <group key={i} position={[-0.02, y, 0.07]}>
          <mesh position={[Ln / 2, 0, 0]}><boxGeometry args={[Ln, 0.022, 0.02]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
          <mesh position={[Ln + 0.03, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.04, 0.07, 3]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
        </group>); })}
      {/* lluvia y agua que se cuela detrás del larguero */}
      {lluvia && [...Array(140)].map((_, i) => { const u = (t * (1.6 + azar(i)) + azar(i + 200)) % 1; return <mesh key={i} position={[-0.8 + azar(i + 210) * 4.6, lerp(3.4, 0.0, u), 0.7 - azar(i + 220) * 3.0]} scale={[1, 5, 1]}><sphereGeometry args={[0.008, 6, 4]} /><meshBasicMaterial color="#bfe3ff" /></mesh>; })}
      {!fix && t > T[7] + 0.3 && t < T[9] && [...Array(8)].map((_, i) => { const u = (t * 0.7 + i / 8) % 1; return <mesh key={i} position={[-0.238, lerp(1.7, 1.0, u), 0.04]} scale={[1, 1.5, 1]}><sphereGeometry args={[0.014, 8, 6]} /><meshBasicMaterial color="#2f9bff" /></mesh>; })}
      {!fix && rot > 0.2 && t < T[9] && <mesh position={[-0.2, 1.012, 0.03]}><boxGeometry args={[0.12, 0.024 * rot * 2, 0.02]} /><meshBasicMaterial color="#2f9bff" transparent opacity={0.8} /></mesh>}
      {confeti && [...Array(70)].map((_, i) => { const u = ((t - T[14]) * (0.35 + 0.2 * azar(i)) + azar(i + 5)) % 1; return <mesh key={i} position={[0.2 + azar(i + 11) * 2.8 + 0.1 * Math.sin(t * 3 + i), lerp(3.2, 1.05, u), -0.2 - azar(i + 21) * 1.2]} rotation={[t * 3 + i, t * 2 + i, 0]}><boxGeometry args={[0.05, 0.02, 0.05]} /><meshBasicMaterial color={["#ff4f7b", "#ffd23f", "#35c9c9", "#c56bff", "#ff7a1a"][i % 5]} /></mesh>; })}
      <group position={nw} rotation={[0, 0, ang]}><Norm p={[0, 0, 0]} t={t} giro={-0.55} gorro={gorro} grieta={(!fix && t >= FALLA0 + 0.2) || fix || gancho} brazo={brazo} salto={0} /></group>
    </group>
  );
};

// ---------------------------------------------------------------- rótulos y cierre
const F = "DejaVu Sans, Arial, sans-serif";
const pcam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80), vv = new THREE.Vector3();
const pantalla = (t: number, p: V3): [number, number] => { const c = camEn(t); pcam.position.set(...c.pos); pcam.lookAt(...c.look); pcam.updateMatrixWorld(); vv.set(...p).project(pcam); return [(vv.x + 1) * 540, (1 - vv.y) * 960]; };
const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const titulo = Math.min(pr(t, 0.15, 0.5), 1 - pr(t, T[2] - 0.5, T[2] - 0.05));
  const [fx, fy] = pantalla(t, [-0.1, 1.0, 0.05]), [bx, by] = pantalla(t, [-0.12, 0.88, 0.05]);
  const flash = Math.min(pr(t, T[11] + 0.9, T[11] + 1.2), 1 - pr(t, T[12] - 0.2, T[12]));
  const pernos = Math.min(pr(t, T[12] + 1.2, T[12] + 1.5), 1 - pr(t, T[13] - 0.1, T[13] + 0.1));
  const clavos = Math.min(pr(t, T[13], T[13] + 0.2), 1 - pr(t, T[13] + 0.5, T[13] + 0.6)), bol = pr(t, T[13] + 0.62, T[13] + 0.85) * (1 - pr(t, T[14] - 0.1, T[14] + 0.2));
  const sello = Math.min(pr(t, T[14] + 1.5, T[14] + 1.75), 1 - pr(t, T[15] - 0.2, T[15] + 0.05));
  const fin = pr(t, T[15] - 0.05, T[15] + 0.3);
  const lab = (px: number, py: number, s: string, o: number, tam: number) => <g opacity={o}>
    <line x1={px} y1={py} x2={Math.min(px + 150, 500)} y2={py - 130} stroke="#14321f" strokeWidth={8} strokeLinecap="round" />
    <text x={Math.min(px + 150, 500)} y={py - 150} textAnchor="start" fontSize={tam} fill="#fff" stroke="#14321f" strokeWidth={16} strokeLinejoin="round" paintOrder="stroke">{s}</text></g>;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">
      {titulo > 0 && <g opacity={titulo} transform={`translate(540 ${250 - 20 * (1 - titulo)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
        <text fontSize={98} fill="#fff" strokeWidth={20}>YOUR DECK WILL</text>
        <text y={130} fontSize={132} fill="#ff7a1a" strokeWidth={24}>PULL AWAY</text>
      </g>}
      {flash > 0 && lab(fx, fy, "FLASHING", flash, 80)}
      {pernos > 0 && lab(bx, by, "½ IN BOLTS", pernos, 76)}
      {clavos > 0 && <g opacity={clavos} transform="translate(540 420)">
        <text fontSize={130} fill="#fff" stroke="#14321f" strokeWidth={22} strokeLinejoin="round" paintOrder="stroke">NAILS</text>
        <path d="M-230 -140 L230 40 M230 -140 L-230 40" stroke="#ff2a2a" strokeWidth={26} strokeLinecap="round" /></g>}
      {bol > 0 && <g opacity={bol} transform={`translate(540 420) scale(${lerp(1.3, 1, bol)})`}>
        <text fontSize={150} fill="#27c24c" stroke="#fff" strokeWidth={24} strokeLinejoin="round" paintOrder="stroke">BOLTS</text>
        <path d="M-300 -60 l60 60 l120 -130" stroke="#27c24c" strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-150 -20)" /></g>}
      {sello > 0 && <g transform={`translate(540 440) rotate(-8) scale(${lerp(2.2, 1, sello)})`} opacity={sello}>
        <rect x={-250} y={-74} width={500} height={148} rx={22} fill="#27c24c" stroke="#fff" strokeWidth={10} /><text y={24} fontSize={62} fill="#fff">UP TO NORM</text></g>}
      {fin > 0 && <g opacity={fin} transform={`translate(0 ${-40 * (1 - fin)})`}>
        <rect x={70} y={120} width={940} height={640} rx={48} fill="#14321f" opacity={0.93} stroke="#fff" strokeWidth={8} />
        <g transform={`translate(540 300) scale(${1 + 0.04 * Math.sin(t * 6)})`}>
          <rect x={-290} y={-100} width={580} height={190} rx={95} fill="#ff7a1a" stroke="#fff" strokeWidth={10} />
          <text y={42} fontSize={118} fill="#fff">FOLLOW</text>
        </g>
        <text x={540} y={500} fontSize={58} fill="#fff">for more backyard builds</text>
        <text x={540} y={570} fontSize={58} fill="#ffd23f">that won't fail!</text>
        <text x={540} y={690} fontSize={46} fill="#bfeaff">NEXT: YOUR GATE WILL SAG</text>
      </g>}
    </svg>
  );
};

export const DeckVideo: React.FC = () => {
  const f = useCurrentFrame(), t = f / DECK_FPS;
  const destello = t >= T[10] - 0.2 && t < T[10] + 0.4 ? (t < T[10] ? pr(t, T[10] - 0.2, T[10]) : 1 - pr(t, T[10], T[10] + 0.4)) : 0;
  const negro = Math.max(1 - pr(t, 0, 0.3), pr(t, DECK_SEG - 0.5, DECK_SEG));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#55b8ff 0%, #bfeaff 62%, #e9fbff 100%)" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: FOV, near: 0.1, far: 80 }} gl={{ antialias: true }}>
        <Mundo t={t} />
      </ThreeCanvas>
      <Rotulos t={t} />
      {destello > 0 && <AbsoluteFill style={{ background: "#fff", opacity: destello }} />}
      {negro > 0 && <AbsoluteFill style={{ background: "#fff", opacity: negro }} />}
    </AbsoluteFill>
  );
};
