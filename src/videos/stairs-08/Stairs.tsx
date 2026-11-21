// «Your stairs will trip you» — capítulo 8 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Diálogo Norm vs Flo.
// Escalera vista de lado (corte en z = 0) que baja de una terraza a la izquierda al pasto a la derecha. Un escalón es 1 in más alto.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { cl, pr, lerp, azar, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Subtitulos, Palabra, Hablante } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import tiempos from "./tiempos.json";

export const STA_FPS = 30, STA_SEG = Math.round((tiempos.total + 1.1) * 10) / 10, STA_CUADROS = Math.round(STA_FPS * STA_SEG);
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3 };
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const HABLA: Hablante[] = [{ nombre: "NORM", color: "#ffd23f", fondo: "#1f7a4a" }, { nombre: "FLO", color: "#ff8fcf", fondo: "#e94f98" }];
const CLAVES = ["inch", "taller", "fall", "trips", "feet", "step", "steps", "toe", "notice", "edge", "code", "eighths", "riser", "same", "boring", "ankle", "team", "follow", "comments", "like"];
const PROF = 4.5, TR = 0.28, NORMAL = 0.178, ALTO = 0.203, MALO = 4;
const H = NORMAL * 6 + ALTO, IGUAL = H / 7;
const habla = (t: number, h: number) => { const f = tiempos.frases.find((x) => t >= x.a && t < x.b); return f && f.h === h ? 1 : 0; };

const C = {
  caida: { pos: [0.85, 1.0, 5.2], look: [0.85, 0.65, 0] } as Cam, caida2: { pos: [0.95, 0.9, 4.8], look: [0.95, 0.55, 0] } as Cam,
  dos: { pos: [2.3, 0.65, 4.4], look: [2.3, 0.5, 0] } as Cam, dos2: { pos: [2.3, 0.6, 4.0], look: [2.3, 0.48, 0] } as Cam,
  flo: { pos: [1.95, 0.85, 3.0], look: [1.95, 0.7, 0] } as Cam, flo2: { pos: [1.95, 0.85, 2.6], look: [1.95, 0.72, 0] } as Cam,
  norm: { pos: [2.65, 0.5, 2.8], look: [2.65, 0.42, 0] } as Cam, norm2: { pos: [2.65, 0.48, 2.4], look: [2.65, 0.4, 0] } as Cam,
  pies: { pos: [1.0, 0.75, 3.3], look: [1.0, 0.62, 0] } as Cam, pies2: { pos: [1.1, 0.7, 2.9], look: [1.12, 0.6, 0] } as Cam,
  ancho: { pos: [1.0, 1.0, 6.4], look: [1.0, 0.65, 0] } as Cam, ancho2: { pos: [1.1, 0.95, 5.8], look: [1.1, 0.6, 0] } as Cam,
  codigo: { pos: [1.15, 0.75, 2.9], look: [1.15, 0.65, 0] } as Cam, codigo2: { pos: [1.15, 0.72, 2.5], look: [1.15, 0.63, 0] } as Cam,
  equipo: { pos: [2.3, 0.9, 5.4], look: [2.3, 1.15, 0] } as Cam, fin: { pos: [1.6, 0.9, 6.6], look: [1.6, 1.35, 0] } as Cam,
};
const CAMS: [number, number, Cam, Cam][] = [
  [0, T[1], C.caida, C.caida2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2], [T[3], T[4], C.norm, C.norm2], [T[4], T[5], C.pies, C.pies2],
  [T[5], T[6], C.flo2, C.flo], [T[6], T[7], C.ancho, C.ancho2], [T[7], T[8], C.pies2, C.pies], [T[8], T[9], C.codigo, C.codigo2], [T[9], T[10], C.ancho, C.ancho2],
  [T[10], T[11], C.flo, C.flo2], [T[11], T[12], C.ancho2, C.ancho], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const sacude = (t: number) => (t < 0.35 ? 0.05 : 0) + (t >= T[6] + 1.55 && t < T[6] + 1.95 ? 0.06 : 0);
const camEn = (t: number): Cam => {
  const s = CAMS.find((x) => t >= x[0] && t < x[1]) ?? CAMS[CAMS.length - 1], u = cl((t - s[0]) / (s[1] - s[0])), k = u * u * (3 - 2 * u), a = sacude(t);
  const m = (p: V3, q: V3, o: V3): V3 => [lerp(p[0], q[0], k) + o[0], lerp(p[1], q[1], k) + o[1], lerp(p[2], q[2], k) + o[2]];
  return { pos: m(s[2].pos, s[3].pos, [Math.sin(t * 61) * a, Math.cos(t * 73) * a, 0]), look: m(s[2].look, s[3].look, [0, 0, 0]) };
};
const FOV = 34;

/** alturas de los escalones (de arriba abajo); `arreglo` 0..1 las iguala */
const risers = (arreglo: number) => [...Array(7)].map((_, j) => lerp(j === MALO ? ALTO : NORMAL, IGUAL, arreglo));
const topes = (r: number[]) => { const y: number[] = []; let acc = H; for (let k = 0; k < 6; k++) { acc -= r[k]; y.push(acc); } return y; };

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = camEn(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  const arreglo = t >= T[9] ? pr(t, T[9] + 0.3, T[9] + 1.2) : 0;
  const r = risers(arreglo), y = topes(r);
  const malo = arreglo < 1;
  // ---- Norm: rueda por la escalera en el gancho, luego abajo a la derecha
  let nx = 2.65, ny = 0.02, nIncl = 0, nBrazo = 0, nSalto = 0;
  if (t < T[1] - 0.3) {
    const u = cl((t - 0.15) / 1.6), k = Math.min(5.999, u * 7);
    nx = lerp(-0.2, 2.1, u); ny = u < 0.98 ? (k < 6 ? y[Math.floor(k)] : 0.02) + 0.08 * Math.abs(Math.sin(u * 22)) : 0.02;
    nIncl = u < 1 ? -u * 9 : -1.45;
  } else if (t < T[1] + 0.4) { nx = 2.4; ny = 0.02; nIncl = -1.45 * (1 - pr(t, T[1] - 0.3, T[1] + 0.3)); }
  const nHabla = habla(t, 0);
  nSalto = nHabla ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  nBrazo = t >= T[11] && t < T[12] ? pr(t, T[11], T[11] + 0.4) : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nHabla ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const hatU = t < T[1] ? cl((t - 0.5) / 1.1) : 0;
  const gorro: V3 = hatU > 0 && hatU < 1 ? [0.25 * hatU, Math.sin(Math.PI * hatU) * 0.75, 0] : [0, 0, 0];
  // ---- Flo: sube y tropieza con el escalón alto; en T11 sube bien
  let fx = 2.05, fy = 0.02, fCae = 0, fGiro = 2.6;
  const sube = (a: number, d: number, malo2: boolean) => {
    const u = cl((t - a) / d), pasos = [2.05, 1.54, 1.26, 0.98, 0.7, 0.42, 0.14, -0.25];
    const alt = [0.02, y[5], y[4], y[3], y[2], y[1], y[0], H];
    const k = Math.min(6.999, u * 7), i0 = Math.floor(k), f = k - i0;
    fx = lerp(pasos[i0], pasos[i0 + 1], f); fy = lerp(alt[i0], alt[i0 + 1], f) + 0.06 * Math.sin(Math.PI * f);
    fGiro = 3.14 - 0.4;
    if (malo2 && k >= 2.6) { fx = lerp(pasos[2], pasos[3], 0.6); fy = y[4] + 0.02; fCae = pr(t, a + d * (2.6 / 7), a + d * (2.6 / 7) + 0.4); }
  };
  if (t >= T[6] + 0.15 && t < T[9]) sube(T[6] + 0.15, 4.0, true);
  if (t >= T[11] && t < T[12]) sube(T[11], 1.9, false);
  if (t >= T[12] && t < T[13]) { fx = 2.0; fy = 0.02; }
  if (t >= T[13]) { fx = 1.9; fy = 0.02; }
  const fHabla = habla(t, 1);
  const pie = t >= T[4] + 0.3 && t < T[5];
  const marea = t >= T[7] && t < T[8] + 0.5 ? 1 : 0;
  const confeti = t > T[11] + 0.9 && t < T[12] + 0.4;
  return (
    <group>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 6]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
      <mesh position={[7, 9, -22]}><sphereGeometry args={[1.5, 24, 16]} /><meshBasicMaterial color="#ffe14d" /></mesh>
      {[[-9, 6, -20, 1.6], [4, 8.5, -24, 2.0], [10, 5.5, -22, 1.4], [-2, 11, -26, 1.8]].map(([x, yy, z, s], i) => <group key={i} position={[x + Math.sin(t * 0.15 + i) * 0.6, yy, z]} scale={s}>
        {[[-0.9, 0, 0.8], [0, 0.25, 1.1], [0.9, 0, 0.85]].map(([dx, dy, rr], j) => <mesh key={j} position={[dx, dy, 0]} scale={[1, 0.7, 1]}><sphereGeometry args={[rr, 16, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      </group>)}
      <Caja p={[0, -0.02, -4.5]} s={[18, 0.08, 9]} c="#5cc24a" sombra={false} />
      <Caja p={[0, -0.55, -4.5]} s={[18, 1.0, 9]} c="#8a5a33" sombra={false} />
      <Caja p={[0, -1.4, -4.5]} s={[18, 0.7, 9]} c="#6e4426" sombra={false} />
      {[...Array(20)].map((_, i) => <mesh key={i} position={[(azar(i + 40) - 0.5) * 9, -0.25 - azar(i + 50) * 1.4, 0.0]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.04 + 0.07 * azar(i + 60), 10, 8]} /><meshLambertMaterial color={i % 2 ? "#9a8f82" : "#70675c"} /></mesh>)}
      {[...Array(70)].map((_, i) => { const x = 1.75 + azar(i + 90) * 3.5; return <mesh key={i} position={[x, 0.05, -0.02 - azar(i + 91) * 0.2]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.025, 0.14 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>; })}
      {[...Array(12)].map((_, i) => { const x = 2.0 + azar(i + 120) * 3, z = -0.8 - azar(i + 121) * 4; return <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.012, 0.012, 0.22, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
        <mesh position={[0, 0.24, 0]}><sphereGeometry args={[0.06, 10, 8]} /><meshLambertMaterial color={["#ff4f7b", "#ffd23f", "#ff8a2a", "#c56bff", "#ffffff"][i % 5]} /></mesh></group>; })}
      <group position={[4.0, 0, -5.5]}><mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.16, 0.22, 2.0, 10]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        {[[0, 2.5, 0, 1.1], [-0.7, 2.1, 0.2, 0.75], [0.7, 2.2, -0.1, 0.8]].map(([x, yy, z, rr], i) => <mesh key={i} position={[x, yy, z]}><sphereGeometry args={[rr, 16, 12]} /><meshLambertMaterial color={i ? "#3aa84f" : "#2f9a4a"} /></mesh>)}</group>
      {/* casa, terraza y escalera */}
      <Caja p={[-2.6, 1.6, -PROF / 2]} s={[1.0, 3.2, PROF]} c="#5aa9d6" sombra={false} />
      <Caja p={[-1.05, H - 0.04, -PROF / 2 + 0.002]} s={[2.1, 0.08, PROF]} c="#e8b36b" />
      <Caja p={[-1.05, H - 0.17, -PROF / 2 + 0.002]} s={[2.1, 0.18, PROF]} c="#c98a4b" />
      {[-1.9, -0.15].map((x) => <Caja key={x} p={[x, (H - 0.26) / 2, -0.3]} s={[0.12, H - 0.26, 0.12]} c="#c98a4b" />)}
      {[...Array(6)].map((_, k) => <group key={k}>
        <Caja p={[(k + 0.5) * TR, y[k] / 2, -PROF / 2 + 0.004]} s={[TR, y[k], PROF]} c={k % 2 ? "#d9a066" : "#cf9558"} />
        <Caja p={[(k + 0.5) * TR + 0.01, y[k] - 0.015, -PROF / 2 + 0.006]} s={[TR + 0.02, 0.03, PROF]} c="#e8b36b" />
      </group>)}
      {/* el escalón alto, resaltado */}
      {malo && t >= T[2] && t < T[9] + 0.6 && <mesh position={[MALO * TR - 0.003, (y[MALO - 1] + y[MALO]) / 2, 0.03]}><planeGeometry args={[0.03, r[MALO] + 0.01]} /><meshBasicMaterial color="#ff2a2a" transparent opacity={0.6 + 0.35 * Math.sin(t * 10)} /></mesh>}
      {/* trayectoria del pie: verde sobre los normales, roja en el alto */}
      {pie && [...Array(6)].map((_, k) => { const x0 = (k + 0.25) * TR + TR, ya = k < 5 ? y[k + 1] : 0.02; const bad = k + 1 === MALO; const u0 = cl((t - T[4] - 0.3 - k * 0.45) / 0.45);
        return [...Array(9)].map((__, j) => { const v = j / 8; if (v > u0) return null; const xx = lerp(x0, x0 - TR, v), yy = lerp(ya, y[k], v) + (bad ? 0.075 : 0.11) * Math.sin(Math.PI * v);
          return <mesh key={k * 10 + j} position={[xx, yy + 0.02, 0.2]}><sphereGeometry args={[0.012, 8, 6]} /><meshBasicMaterial color={bad ? "#ff2a2a" : "#27c24c"} /></mesh>; }); })}
      {/* estrellitas de mareo */}
      {marea > 0 && [...Array(5)].map((_, i) => { const a = t * 4 + (i / 5) * Math.PI * 2; return <mesh key={i} position={[fx + 0.25 + 0.16 * Math.cos(a), fy + 0.35 + 0.05 * Math.sin(a * 2), 0.3 + 0.16 * Math.sin(a)]}><octahedronGeometry args={[0.035]} /><meshBasicMaterial color="#ffd23f" /></mesh>; })}
      {confeti && [...Array(60)].map((_, i) => { const u = ((t - T[11]) * (0.35 + 0.2 * azar(i)) + azar(i + 5)) % 1; return <mesh key={i} position={[-0.2 + azar(i + 11) * 3.2 + 0.1 * Math.sin(t * 3 + i), lerp(2.6, 0.1, u), 0.5 - azar(i + 21) * 1.2]} rotation={[t * 3 + i, t * 2 + i, 0]}><boxGeometry args={[0.05, 0.02, 0.05]} /><meshBasicMaterial color={["#ff4f7b", "#ffd23f", "#35c9c9", "#c56bff", "#ff7a1a"][i % 5]} /></mesh>; })}
      <Flo p={[fx, fy, 0.3]} t={t} habla={fHabla} cae={fCae} giro={fGiro} ala={fHabla * 0.6} bostezo={t >= T[10] + 1.0 && t < T[11] - 0.1 ? 1 : 0} />
      <Norm p={[nx, ny + nSalto, 0.35]} t={t} giro={-0.6} gorro={gorro} grieta brazo={nBrazo} salto={0} inclina={nIncl} />
    </group>
  );
};

// ---------------------------------------------------------------- rótulos
const F = "DejaVu Sans, Arial, sans-serif";
const pcam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80), vv = new THREE.Vector3();
const pantalla = (t: number, p: V3): [number, number] => { const c = camEn(t); pcam.position.set(...c.pos); pcam.lookAt(...c.look); pcam.updateMatrixWorld(); vv.set(...p).project(pcam); return [(vv.x + 1) * 540, (1 - vv.y) * 960]; };
const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const titulo = Math.min(pr(t, 0.12, 0.35), 1 - pr(t, T[1] - 0.2, T[1] - 0.02));
  const v = (a: number, b: number) => Math.min(pr(t, a, a + 0.22), 1 - pr(t, b - 0.18, b));
  const big = (s: string, o: number, col: string, line: string, tam = 100, yy = 300) => o > 0 && <text x={540} y={yy} opacity={o} fontSize={tam} fill={col} stroke={line} strokeWidth={tam * 0.2} strokeLinejoin="round" paintOrder="stroke">{s}</text>;
  const y = topes(risers(0));
  const [ax, ay0] = pantalla(t, [MALO * TR + 0.02, y[MALO], 0.1]), [, ay1] = pantalla(t, [MALO * TR + 0.02, y[MALO - 1], 0.1]);
  const [bx, by0] = pantalla(t, [(MALO - 1) * TR + 0.02, y[MALO - 1], 0.1]), [, by1] = pantalla(t, [(MALO - 1) * TR + 0.02, y[MALO - 2], 0.1]);
  const cotas = v(T[8] + 0.4, T[9]);
  const cota = (x: number, y0: number, y1: number, s: string, col: string) => <g stroke="#14321f" strokeWidth={7} strokeLinecap="round">
    <line x1={x} y1={y0} x2={x} y2={y1} /><line x1={x - 20} y1={y0} x2={x + 20} y2={y0} /><line x1={x - 20} y1={y1} x2={x + 20} y2={y1} />
    <text x={x + 34} y={(y0 + y1) / 2 + 22} textAnchor="start" fontSize={64} fill={col} strokeWidth={14} strokeLinejoin="round" paintOrder="stroke">{s}</text></g>;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">
      {titulo > 0 && <g opacity={titulo} transform={`translate(540 ${250 - 20 * (1 - titulo)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
        <text fontSize={96} fill="#fff" strokeWidth={20}>YOUR STAIRS</text><text y={125} fontSize={116} fill="#ff7a1a" strokeWidth={24}>WILL TRIP YOU</text></g>}
      {big("1 INCH?", v(T[2] + 0.3, T[3]), "#ff8fcf", "#fff", 140)}
      {big("YOU DON'T NOTICE", v(T[4] + 0.2, T[4] + 2.2), "#fff", "#14321f", 88)}
      {big("TOE TOO LOW!", v(T[4] + 2.3, T[5]), "#ff2a2a", "#fff", 120)}
      {big("CAUGHT!", v(T[6] + 1.5, T[7]), "#ff2a2a", "#fff", 150)}
      {big("MAX 3/8 in", v(T[8] + 0.2, T[9]), "#27c24c", "#fff", 130)}
      {cotas > 0 && <g opacity={cotas}>{cota(bx, by0, by1, "7 in", "#fff")}{cota(ax, ay0, ay1, "8 in!", "#ff4a4a")}</g>}
      {big("ALL THE SAME", v(T[9] + 1.2, T[10]), "#27c24c", "#fff", 110)}
      {big("BORING?", v(T[10] + 0.3, T[11]), "#ff8fcf", "#fff", 140)}
      <Sello t={t} a={T[11] + 0.9} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="NORM" der="FLO" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: IS LANDSCAPE FABRIC A SCAM?" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </svg>
  );
};

export const StairsVideo: React.FC = () => {
  const f = useCurrentFrame(), t = f / STA_FPS;
  const destello = t >= T[9] - 0.15 && t < T[9] + 0.3 ? (t < T[9] ? pr(t, T[9] - 0.15, T[9]) : 1 - pr(t, T[9], T[9] + 0.3)) : 0;
  const negro = Math.max(1 - pr(t, 0, 0.2), pr(t, STA_SEG - 0.5, STA_SEG));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#55b8ff 0%, #bfeaff 62%, #e9fbff 100%)" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: FOV, near: 0.1, far: 80 }} gl={{ antialias: true }}><Mundo t={t} /></ThreeCanvas>
      <Rotulos t={t} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Subtitulos palabras={PAL} t={t} claves={CLAVES} y={1580} hablantes={HABLA} ocultoDesde={T[13] - 0.05} />
        <rect x={0} y={0} width={1080 * (t / STA_SEG)} height={14} fill="#ffd23f" opacity={0.95} />
      </svg>
      {destello > 0 && <AbsoluteFill style={{ background: "#fff", opacity: destello * 0.8 }} />}
      {negro > 0 && <AbsoluteFill style={{ background: "#fff", opacity: negro }} />}
    </AbsoluteFill>
  );
};
