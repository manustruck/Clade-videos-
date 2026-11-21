// «Your gate will sag» — capítulo 4 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Vista de frente.
// Una puerta de cerca es un rectángulo que se deforma (paralelogramo) cuando el peso tira de la esquina del pestillo;
// la diagonal que va de abajo (lado de las bisagras) a arriba (lado del pestillo) trabaja a compresión y lo evita.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { cl, pr, lerp, azar, rebote, Caja, Norm } from "../fence-01/Fence";
import { Subtitulos, Palabra } from "../comun/Subtitulos";
import tiempos from "./tiempos.json";

export const GATE_FPS = 30, GATE_SEG = Math.round((tiempos.total + 1.1) * 10) / 10, GATE_CUADROS = Math.round(GATE_FPS * GATE_SEG);
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3 };
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const CLAVES = ["gate", "sag", "heavy", "diagonal", "brace", "hinge", "hinges", "latch", "ground", "square", "lean", "weight", "post", "swing", "follow", "whoops", "fail"];
const GW = 1.84, G0 = 0.3, G1 = 1.25, HX = -0.92; // ancho de la puerta, bajo y alto, x de la bisagra

const C = {
  gancho: { pos: [-0.1, 0.95, 7.8], look: [-0.2, 0.62, 0] } as Cam, gancho2: { pos: [0.0, 0.85, 6.8], look: [-0.1, 0.55, 0] } as Cam,
  hecho: { pos: [-0.1, 0.95, 7.4], look: [-0.15, 0.7, 0] } as Cam, hecho2: { pos: [0.0, 0.95, 6.6], look: [-0.1, 0.7, 0] } as Cam,
  pesa: { pos: [0.7, 0.8, 4.6], look: [0.5, 0.65, 0] } as Cam, pesa2: { pos: [0.6, 0.75, 4.1], look: [0.5, 0.6, 0] } as Cam,
  gira: { pos: [0.3, 0.9, 6.0], look: [0.0, 0.7, 0] } as Cam, gira2: { pos: [0.5, 0.8, 5.2], look: [0.1, 0.6, 0] } as Cam,
  roza: { pos: [0.8, 0.55, 3.9], look: [0.75, 0.3, 0] } as Cam, roza2: { pos: [0.85, 0.45, 3.4], look: [0.8, 0.2, 0] } as Cam,
  ups: { pos: [-0.2, 0.95, 5.8], look: [-0.4, 0.7, 0] } as Cam, ups2: { pos: [-0.3, 0.9, 5.2], look: [-0.5, 0.65, 0] } as Cam,
  arreglo: { pos: [-0.1, 0.95, 7.2], look: [-0.15, 0.7, 0] } as Cam, brace: { pos: [0.1, 0.9, 5.0], look: [0.0, 0.75, 0] } as Cam, brace2: { pos: [0.1, 0.85, 4.5], look: [0.0, 0.75, 0] } as Cam,
  ruta: { pos: [-0.1, 0.8, 4.6], look: [-0.4, 0.6, 0] } as Cam, ruta2: { pos: [-0.2, 0.7, 4.2], look: [-0.6, 0.5, 0] } as Cam,
  fiesta: { pos: [-0.1, 1.0, 7.8], look: [-0.15, 0.8, 0] } as Cam, fiesta2: { pos: [-0.1, 0.95, 7.2], look: [-0.15, 0.8, 0] } as Cam,
  fin: { pos: [-0.1, 1.3, 7.8], look: [-0.2, 1.5, 0] } as Cam, fin2: { pos: [-0.1, 1.25, 7.4], look: [-0.2, 1.45, 0] } as Cam,
};
const CAMS: [number, number, Cam, Cam][] = [
  [0, T[2], C.gancho, C.gancho2], [T[2], T[3], C.hecho, C.hecho2], [T[3], T[4], C.hecho2, C.hecho], [T[4], T[5], C.pesa, C.pesa2], [T[5], T[6], C.gira, C.gira2],
  [T[6], T[7], C.roza, C.roza2], [T[7], T[8], C.ups, C.ups2], [T[8], T[9], C.arreglo, C.arreglo], [T[9], T[10], C.brace, C.brace2], [T[10], T[11], C.brace2, C.brace],
  [T[11], T[12], C.ruta, C.ruta2], [T[12], T[13], C.fiesta, C.fiesta2], [T[13], 99, C.fin, C.fin2],
];
const camEn = (t: number): Cam => {
  const s = CAMS.find((x) => t >= x[0] && t < x[1]) ?? CAMS[CAMS.length - 1], u = cl((t - s[0]) / (s[1] - s[0])), k = u * u * (3 - 2 * u);
  const m = (a: V3, b: V3): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  return { pos: m(s[2].pos, s[3].pos), look: m(s[2].look, s[3].look) };
};
const FOV = 34;

const Puerta: React.FC<{ D: number; fix: boolean; brace: number; abre: number; t: number; resalta: number }> = ({ D, fix, brace, abre, t, resalta }) => {
  const m = new THREE.Matrix4().set(1, 0, 0, 0, -D / GW, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  const ang = Math.atan2(0.65, 1.64), len = Math.hypot(1.64, 0.65);
  return (
    <group position={[HX, 0, 0.05]} rotation={[0, abre, 0]}>
      <group matrixAutoUpdate={false} matrix={m}>
        {[...Array(11)].map((_, i) => <Caja key={i} p={[0.09 + i * 0.165, (G0 + G1) / 2, 0.03]} s={[0.13, G1 - G0, 0.03]} c="#35c9c9" />)}
        {[0.42, 1.1].map((y) => <Caja key={y} p={[GW / 2, y, 0.0]} s={[GW, 0.12, 0.035]} c="#1f8a8a" />)}
        {[0.05, GW - 0.05].map((x) => <Caja key={x} p={[x, (G0 + G1) / 2, 0.0]} s={[0.1, G1 - G0, 0.035]} c="#1f8a8a" />)}
        {[0.35, 1.05].map((y) => <Caja key={y} p={[0.03, y, 0.08]} s={[0.22, 0.05, 0.02]} c="#2a2a30" />)}
        <Caja p={[GW - 0.12, 0.74, 0.08]} s={[0.05, 0.14, 0.03]} c="#2a2a30" />
        {brace > 0 && <group position={[0.92, 0.775 + lerp(0.7, 0, rebote(brace)), 0.085]} rotation={[0, 0, ang]}>
          <mesh castShadow><boxGeometry args={[len, 0.1, 0.045]} /><meshLambertMaterial color={resalta > 0 ? "#6fe08a" : "#d9a066"} emissive={resalta > 0 ? "#1f9a3a" : "#000000"} emissiveIntensity={0.6 * resalta * (0.6 + 0.4 * Math.sin(t * 9))} /></mesh>
        </group>}
      </group>
    </group>
  );
};

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = camEn(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  const gancho = t < T[2], fix = t >= T[8] + 0.1;
  // hundimiento
  const D = gancho ? 0.3 * rebote(cl((t - 0.2) / 0.8)) : fix ? 0 : t < T[5] ? 0 : t < T[6] ? 0.15 * pr(t, T[5] + 0.5, T[6] - 0.3) : 0.15 + 0.15 * pr(t, T[6] + 0.2, T[6] + 3.0);
  const colgada = gancho || fix || t >= T[2] + 1.9 ? 1 : 0, caePuerta = !gancho && !fix && t < T[2] + 1.9 ? lerp(0.9, 0, rebote(pr(t, T[2] + 0.9, T[2] + 1.9))) : 0;
  const brace = fix && t >= T[9] + 0.15 ? cl((t - T[9] - 0.15) / 0.7) : 0, resalta = fix && t >= T[10] && t < T[11] ? 1 : 0;
  const swing = fix && t >= T[12] ? Math.sin(Math.PI * cl((t - T[12] - 0.2) / 2.6)) ** 2 * 1.0 : 0;
  const lean = (D / 0.3) * 0.05;
  const hatU = fix ? 0 : (gancho && t > 0.9) ? cl((t - 0.9) / 1.1) : t >= T[7] ? cl((t - T[7]) / 1.1) : 0;
  const gorro: V3 = hatU > 0 ? [0.25 * hatU, Math.sin(Math.PI * hatU) * 0.75, 0] : [0, 0, 0];
  const brazo = t >= T[3] && t < T[4] ? pr(t, T[3], T[3] + 0.5) : !fix && t >= T[7] - 0.2 && t < T[8] ? 0.5 + 0.4 * Math.sin(t * 14) : t >= T[12] && t < T[13] ? pr(t, T[12], T[12] + 0.4) : t >= T[13] + 0.1 ? 0.55 + 0.45 * Math.sin(t * 7) : 0;
  const lluvia = false;
  const confeti = fix && t > T[12] && t < T[13] + 0.5;
  const roza = D > 0.2 && !fix;
  const flechaPeso = !fix && t >= T[4] + 0.3 && t < T[6];
  return (
    <group>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 6]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
      <mesh position={[-7, 9, -22]}><sphereGeometry args={[1.5, 24, 16]} /><meshBasicMaterial color="#ffe14d" /></mesh>
      {[[-9, 6, -20, 1.6], [4, 8.5, -24, 2.0], [10, 5.5, -22, 1.4], [-2, 11, -26, 1.8]].map(([x, y, z, s], i) => <group key={i} position={[x + Math.sin(t * 0.15 + i) * 0.6, y, z]} scale={s}>
        {[[-0.9, 0, 0.8], [0, 0.25, 1.1], [0.9, 0, 0.85]].map(([dx, dy, r], j) => <mesh key={j} position={[dx, dy, 0]} scale={[1, 0.7, 1]}><sphereGeometry args={[r, 16, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      </group>)}
      {/* suelo (sin corte: vista de frente) */}
      <Caja p={[0, -0.04, -4]} s={[24, 0.08, 14]} c="#5cc24a" sombra={false} />
      <Caja p={[0, -0.6, 2.5]} s={[24, 1.0, 2.2]} c="#5cc24a" sombra={false} />
      {[...Array(120)].map((_, i) => <mesh key={i} position={[(azar(i + 90) - 0.5) * 12, 0.06, 0.2 + azar(i + 91) * 3.5]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.03, 0.12 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>)}
      {[[-4.2, -2.4, 0.7], [4.4, -3.1, 0.8], [-2.9, -4.6, 0.6], [3.2, -4.9, 0.6]].map(([x, z, r], i) => <mesh key={i} position={[x, r * 0.7, z]} scale={[1, 0.8, 1]} castShadow><sphereGeometry args={[r, 18, 14]} /><meshLambertMaterial color={i % 2 ? "#2f9a4a" : "#43b85c"} /></mesh>)}
      {[...Array(20)].map((_, i) => { const x = (azar(i + 120) - 0.5) * 9, z = 0.6 + azar(i + 121) * 3; return Math.abs(x) < 1.3 && z < 1.4 ? null : <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.012, 0.012, 0.22, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
        <mesh position={[0, 0.24, 0]} castShadow><sphereGeometry args={[0.06, 10, 8]} /><meshLambertMaterial color={["#ff4f7b", "#ffd23f", "#ff8a2a", "#c56bff", "#ffffff"][i % 5]} /></mesh>
      </group>; })}
      <group position={[5.6, 0, -6]}><mesh position={[0, 1.0, 0]} castShadow><cylinderGeometry args={[0.16, 0.22, 2.0, 10]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        {[[0, 2.5, 0, 1.1], [-0.7, 2.1, 0.2, 0.75], [0.7, 2.2, -0.1, 0.8]].map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]} castShadow><sphereGeometry args={[r, 16, 12]} /><meshLambertMaterial color={i ? "#3aa84f" : "#2f9a4a"} /></mesh>)}</group>
      {/* cerca a ambos lados y postes */}
      {[-1, 1].map((k) => <group key={k}>
        {[...Array(24)].map((_, i) => <group key={i} position={[k * (1.2 + i * 0.145), 0, 0]}><Caja p={[0, 0.65, 0.03]} s={[0.11, 1.2, 0.03]} c="#fffaf0" /><mesh position={[0, 1.27, 0.03]} castShadow><coneGeometry args={[0.06, 0.1, 4]} /><meshLambertMaterial color="#fffaf0" /></mesh></group>)}
        {[0.42, 1.1].map((y) => <Caja key={y} p={[k * 2.9, y, -0.005]} s={[3.6, 0.1, 0.035]} c="#b97a3e" />)}
      </group>)}
      <group position={[-1.0, 0, -0.1]} rotation={[0, 0, -lean]}><Caja p={[0, 0.8, 0]} s={[0.16, 1.6, 0.16]} c="#c98a4b" />
        {[0.35, 1.05].map((y) => <Caja key={y} p={[0.1, y, 0.1]} s={[0.1, 0.06, 0.05]} c="#2a2a30" />)}</group>
      <Caja p={[1.0, 0.8, -0.1]} s={[0.16, 1.6, 0.16]} c="#c98a4b" />
      {colgada > 0 && <group position={[0, caePuerta, 0]}><Puerta D={D} fix={fix} brace={brace} abre={swing} t={t} resalta={resalta} /></group>}
      {/* el cuadrado original (fantasma) para ver cómo se deforma */}
      {!fix && t >= T[5] && t < T[7] && <group position={[HX, 0, 0.12]}>
        {[[GW / 2, G0, GW, 0.02], [GW / 2, G1, GW, 0.02], [0, (G0 + G1) / 2, 0.02, G1 - G0], [GW, (G0 + G1) / 2, 0.02, G1 - G0]].map(([x, y, w, h], i) => <mesh key={i} position={[x, y, 0]}><boxGeometry args={[w, h, 0.01]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.85} /></mesh>)}
      </group>}
      {/* flecha del peso */}
      {flechaPeso && <group position={[HX + GW - 0.08, 1.52, 0.2]}>
        <mesh position={[0, -0.1 - 0.05 * Math.abs(Math.sin(t * 6)), 0]}><boxGeometry args={[0.07, 0.4, 0.03]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
        <mesh position={[0, -0.36 - 0.05 * Math.abs(Math.sin(t * 6)), 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.12, 0.18, 3]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
      </group>}
      {/* polvo al rozar */}
      {roza && [...Array(8)].map((_, i) => { const u = (t * 0.9 + i / 8) % 1; return <mesh key={i} position={[0.9 + 0.2 * azar(i) + u * 0.4, 0.06 + 0.2 * u, 0.3]}><sphereGeometry args={[0.05 + 0.08 * u, 8, 6]} /><meshBasicMaterial color="#bda37a" transparent opacity={0.8 * (1 - u)} /></mesh>; })}
      {D > 0.2 && !fix && <mesh position={[0.4, 0.012, 0.3]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.1, 0.1]} /><meshBasicMaterial color="#6b4a2a" /></mesh>}
      {/* flechas verdes: el peso baja por la diagonal y entra al poste */}
      {fix && t >= T[11] && t < T[12] && [0, 1, 2, 3].map((i) => { const u = ((t - T[11]) * 0.55 + i / 4) % 1; const px = u < 0.8 ? lerp(HX + 1.84, HX + 0.1, u / 0.8) : HX - 0.05, py = u < 0.8 ? lerp(1.12, 0.46, u / 0.8) : lerp(0.46, 0.05, (u - 0.8) / 0.2);
        return <mesh key={i} position={[px, py, 0.18]} rotation={[0, 0, u < 0.8 ? ang0 + Math.PI : -Math.PI / 2]}><coneGeometry args={[0.09, 0.2, 3]} /><meshBasicMaterial color="#27c24c" /></mesh>; })}
      {confeti && [...Array(70)].map((_, i) => { const u = ((t - T[12]) * (0.35 + 0.2 * azar(i)) + azar(i + 5)) % 1; return <mesh key={i} position={[-2 + azar(i + 11) * 4 + 0.1 * Math.sin(t * 3 + i), lerp(3.2, 0.1, u), 0.6 - azar(i + 21) * 1.6]} rotation={[t * 3 + i, t * 2 + i, 0]}><boxGeometry args={[0.05, 0.02, 0.05]} /><meshBasicMaterial color={["#ff4f7b", "#ffd23f", "#35c9c9", "#c56bff", "#ff7a1a"][i % 5]} /></mesh>; })}
      {lluvia && null}
      <Norm p={[-1.3, 0, 0.5]} t={t} giro={0.5} gorro={gorro} grieta={fix || gancho || t >= T[7]} brazo={brazo} salto={t >= T[12] && t < T[13] ? 0.08 * Math.abs(Math.sin(t * 6)) : 0} />
    </group>
  );
};
const ang0 = Math.atan2(0.65, 1.64);

// ---------------------------------------------------------------- rótulos y cierre
const F = "DejaVu Sans, Arial, sans-serif";
const pcam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80), vv = new THREE.Vector3();
const pantalla = (t: number, p: V3): [number, number] => { const c = camEn(t); pcam.position.set(...c.pos); pcam.lookAt(...c.look); pcam.updateMatrixWorld(); vv.set(...p).project(pcam); return [(vv.x + 1) * 540, (1 - vv.y) * 960]; };
const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const titulo = Math.min(pr(t, 0.15, 0.5), 1 - pr(t, T[2] - 0.5, T[2] - 0.05));
  const pesado = Math.min(pr(t, T[4] + 0.2, T[4] + 0.5), 1 - pr(t, T[5] - 0.2, T[5]));
  const [hx, hy] = pantalla(t, [HX + 0.1, 0.46, 0.2]), [lx, ly] = pantalla(t, [HX + 1.74, 1.1, 0.2]);
  const brace = Math.min(pr(t, T[9] + 0.7, T[9] + 1.0), 1 - pr(t, T[10] - 0.1, T[10]));
  const ends = Math.min(pr(t, T[10] + 0.5, T[10] + 0.8), 1 - pr(t, T[11] - 0.2, T[11]));
  const comp = Math.min(pr(t, T[11] + 0.3, T[11] + 0.6), 1 - pr(t, T[12] - 0.2, T[12]));
  const sello = Math.min(pr(t, T[12] + 1.6, T[12] + 1.85), 1 - pr(t, T[13] - 0.2, T[13] + 0.05));
  const fin = pr(t, T[13] - 0.05, T[13] + 0.3);
  const marca = (px: number, py: number, s: string, o: number) => <g opacity={o}><circle cx={px} cy={py} r={20} fill="#27c24c" stroke="#fff" strokeWidth={8} />
    <text x={Math.min(840, Math.max(240, px))} y={py - 50} fontSize={64} fill="#fff" stroke="#14321f" strokeWidth={14} strokeLinejoin="round" paintOrder="stroke">{s}</text></g>;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">
      {titulo > 0 && <g opacity={titulo} transform={`translate(540 ${250 - 20 * (1 - titulo)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
        <text fontSize={98} fill="#fff" strokeWidth={20}>YOUR GATE WILL</text><text y={130} fontSize={150} fill="#ff7a1a" strokeWidth={26}>SAG</text></g>}
      {pesado > 0 && <text x={540} y={300} opacity={pesado} fontSize={130} fill="#ff2a2a" stroke="#fff" strokeWidth={22} strokeLinejoin="round" paintOrder="stroke">HEAVY!</text>}
      {brace > 0 && <text x={540} y={300} opacity={brace} fontSize={84} fill="#fff" stroke="#14321f" strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">1 DIAGONAL BRACE</text>}
      {ends > 0 && <>{marca(hx, hy, "HINGE SIDE", ends)}{marca(lx, ly, "LATCH SIDE", ends)}</>}
      {comp > 0 && <text x={540} y={300} opacity={comp} fontSize={84} fill="#27c24c" stroke="#fff" strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">PUSHES, NOT PULLS</text>}
      {sello > 0 && <g transform={`translate(540 440) rotate(-8) scale(${lerp(2.2, 1, sello)})`} opacity={sello}>
        <rect x={-250} y={-74} width={500} height={148} rx={22} fill="#27c24c" stroke="#fff" strokeWidth={10} /><text y={24} fontSize={62} fill="#fff">UP TO NORM</text></g>}
      {fin > 0 && <g opacity={fin} transform={`translate(0 ${-40 * (1 - fin)})`}>
        <rect x={70} y={120} width={940} height={640} rx={48} fill="#14321f" opacity={0.93} stroke="#fff" strokeWidth={8} />
        <g transform={`translate(540 300) scale(${1 + 0.04 * Math.sin(t * 6)})`}><rect x={-290} y={-100} width={580} height={190} rx={95} fill="#ff7a1a" stroke="#fff" strokeWidth={10} /><text y={42} fontSize={118} fill="#fff">FOLLOW</text></g>
        <text x={540} y={500} fontSize={58} fill="#fff">for more backyard builds</text><text x={540} y={570} fontSize={58} fill="#ffd23f">that won't fail!</text>
        <text x={540} y={690} fontSize={46} fill="#bfeaff">NEXT: YOUR SHED IS SINKING</text></g>}
    </svg>
  );
};

export const GateVideo: React.FC = () => {
  const f = useCurrentFrame(), t = f / GATE_FPS;
  const destello = t >= T[8] - 0.2 && t < T[8] + 0.4 ? (t < T[8] ? pr(t, T[8] - 0.2, T[8]) : 1 - pr(t, T[8], T[8] + 0.4)) : 0;
  const negro = Math.max(1 - pr(t, 0, 0.3), pr(t, GATE_SEG - 0.5, GATE_SEG));
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
