// «Is landscape fabric a scam?» — capítulo 9 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Diálogo Flo vs Norm.
// Corte del suelo en z = 0: a la izquierda un cantero (tierra, tela negra, mantillo, flores); a la derecha dos caminos de grava,
// uno sin tela (las piedras se hunden en el barro) y otro con tela (se quedan arriba).
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

export const FAB_FPS = 30, FAB_SEG = Math.round((tiempos.total + 1.1) * 10) / 10, FAB_CUADROS = Math.round(FAB_FPS * FAB_SEG);
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3 };
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const HABLA: Hablante[] = [{ nombre: "NORM", color: "#ffd23f", fondo: "#1f7a4a" }, { nombre: "FLO", color: "#ff8fcf", fondo: "#e94f98" }];
const CLAVES = ["fabric", "scam", "weeds", "mulch", "soil", "seeds", "roots", "useless", "gravel", "hero", "stones", "mud", "depends", "beds", "skip", "keep", "team", "war", "follow", "like", "comments", "right"];
const PROF = 4.5, B0 = -1.6, B1 = 0.15, TELA = 0.03, MANT = 0.11; // cantero de x B0 a B1; tela y mantillo
const habla = (t: number, h: number) => { const f = tiempos.frases.find((x) => t >= x.a && t < x.b); return f && f.h === h ? 1 : 0; };

const C = {
  gancho: { pos: [-0.75, 0.45, 3.4], look: [-0.75, 0.3, 0] } as Cam, gancho2: { pos: [-0.7, 0.4, 3.0], look: [-0.7, 0.28, 0] } as Cam,
  dos: { pos: [-0.1, 0.55, 4.6], look: [-0.1, 0.45, 0] } as Cam, dos2: { pos: [-0.1, 0.5, 4.2], look: [-0.1, 0.42, 0] } as Cam,
  cantero: { pos: [-0.75, 0.25, 3.5], look: [-0.75, 0.08, 0] } as Cam, cantero2: { pos: [-0.75, 0.2, 3.0], look: [-0.75, 0.06, 0] } as Cam,
  norm: { pos: [0.35, 0.5, 2.6], look: [0.35, 0.42, 0] } as Cam, norm2: { pos: [0.35, 0.48, 2.3], look: [0.35, 0.4, 0] } as Cam,
  raiz: { pos: [-0.9, 0.05, 2.6], look: [-0.9, -0.02, 0] } as Cam, raiz2: { pos: [-0.85, 0.05, 2.2], look: [-0.85, -0.02, 0] } as Cam,
  flo: { pos: [-0.55, 0.85, 3.0], look: [-0.55, 0.7, 0] } as Cam, flo2: { pos: [-0.55, 0.85, 2.6], look: [-0.55, 0.72, 0] } as Cam,
  arranca: { pos: [-0.7, 0.6, 4.4], look: [-0.7, 0.4, 0] } as Cam,
  camino: { pos: [1.5, 0.4, 4.4], look: [1.5, 0.15, 0] } as Cam, camino2: { pos: [1.5, 0.3, 3.8], look: [1.5, 0.05, 0] } as Cam,
  ancho: { pos: [0.4, 0.6, 6.8], look: [0.4, 0.35, 0] } as Cam, ancho2: { pos: [0.4, 0.55, 6.2], look: [0.4, 0.3, 0] } as Cam,
  equipo: { pos: [-0.1, 0.8, 5.0], look: [-0.1, 1.05, 0] } as Cam, fin: { pos: [0.2, 0.8, 6.2], look: [0.2, 1.25, 0] } as Cam,
};
const CAMS: [number, number, Cam, Cam][] = [
  [0, T[1], C.gancho, C.gancho2], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.cantero, C.cantero2], [T[3], T[3] + 1.4, C.norm, C.norm2], [T[3] + 1.4, T[4], C.cantero2, C.cantero],
  [T[4], T[5], C.raiz, C.raiz2], [T[5], T[6], C.arranca, C.arranca], [T[6], T[7], C.norm2, C.norm], [T[7], T[9], C.camino, C.camino2], [T[9], T[10], C.flo, C.flo2],
  [T[10], T[11], C.ancho, C.ancho2], [T[11], T[12], C.flo2, C.flo], [T[12], T[13], C.equipo, C.equipo], [T[13], 99, C.fin, C.fin],
];
const sacude = (t: number) => (t < 0.4 ? 0.05 : 0) + (t >= T[5] + 0.6 && t < T[5] + 1.0 ? 0.05 : 0) + (t >= T[6] && t < T[6] + 0.3 ? 0.04 : 0);
const camEn = (t: number): Cam => {
  const s = CAMS.find((x) => t >= x[0] && t < x[1]) ?? CAMS[CAMS.length - 1], u = cl((t - s[0]) / (s[1] - s[0])), k = u * u * (3 - 2 * u), a = sacude(t);
  const m = (p: V3, q: V3, o: V3): V3 => [lerp(p[0], q[0], k) + o[0], lerp(p[1], q[1], k) + o[1], lerp(p[2], q[2], k) + o[2]];
  return { pos: m(s[2].pos, s[3].pos, [Math.sin(t * 61) * a, Math.cos(t * 73) * a, 0]), look: m(s[2].look, s[3].look, [0, 0, 0]) };
};
const FOV = 34;

/** maleza: hojas en abanico + raíces que corren sobre la tela y (si `atraviesa`) la cruzan */
const Maleza: React.FC<{ x: number; y: number; s: number; atraviesa: number; t: number }> = ({ x, y, s, atraviesa, t }) => s <= 0 ? null : (
  <group position={[x, y, 0.06]}>
    <group scale={s} rotation={[0, 0, 0.05 * Math.sin(t * 3 + x * 7)]}>
      {[-0.7, -0.35, 0, 0.35, 0.7].map((a, i) => <mesh key={i} position={[Math.sin(a) * 0.05, 0.08, 0]} rotation={[0, 0, -a]}><coneGeometry args={[0.025, 0.17 + 0.04 * (i % 2), 5]} /><meshLambertMaterial color={i % 2 ? "#3fa637" : "#62c94a"} /></mesh>)}
    </group>
    {[-1, 1].map((k) => <mesh key={k} position={[k * 0.06 * s, TELA - y + 0.012, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.005, 0.005, 0.12 * s, 5]} /><meshLambertMaterial color="#e8d7b0" /></mesh>)}
    {atraviesa > 0 && <mesh position={[0.01, TELA - y - 0.08 * atraviesa, 0]}><cylinderGeometry args={[0.006, 0.003, 0.18 * atraviesa, 5]} /><meshLambertMaterial color="#e8d7b0" /></mesh>}
  </group>
);

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = camEn(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  const gancho = t < T[1];
  // ---- el cantero
  const tela = gancho ? 1 : t < T[2] ? 1 : pr(t, T[2] + 0.05, T[2] + 0.8);
  const mantillo = gancho || t < T[2] ? 1 : pr(t, T[2] + 0.8, T[2] + 1.6);
  const tresAnios = gancho ? 1 : t >= T[2] + 2.6 ? pr(t, T[2] + 2.6, T[2] + 3.6) : 0;
  const malezas = gancho ? pr(t, 0.1, 0.9) : t >= T[2] + 3.4 ? pr(t, T[2] + 3.4, T[2] + 4.2) : 0;
  const atraviesa = gancho ? 1 : t >= T[4] ? pr(t, T[4] + 0.2, T[4] + 1.6) : 0;
  const arranca = t >= T[5] + 0.5 ? pr(t, T[5] + 0.5, T[5] + 1.6) : 0;
  const semillas = t >= T[3] + 1.5 && t < T[4];
  // ---- caminos de grava
  const hunde = t >= T[8] ? pr(t, T[8] + 0.2, T[8] + 2.2) : 0;
  // ---- personajes
  const fH = habla(t, 1), nH = habla(t, 0);
  let fx = -0.55, fy = MANT, fCae = 0, fAla = fH * 0.7;
  if (gancho) { fAla = 1; }
  if (arranca > 0 && arranca < 1) { fx = lerp(-0.55, -1.0, arranca); fAla = 1; }
  if (t >= T[5] + 0.5) { fy = TELA * (1 - arranca) + 0.02; }
  if (t >= T[9] && t < T[10]) fAla = 0.3;
  const nx = 0.35, ny = 0.02, nBrazo = t >= T[6] && t < T[7] ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  const pregunta = t >= T[9] && t < T[10];
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
      {[...Array(24)].map((_, i) => <mesh key={i} position={[(azar(i + 40) - 0.5) * 9, -0.25 - azar(i + 50) * 1.3, 0.0]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.04 + 0.07 * azar(i + 60), 10, 8]} /><meshLambertMaterial color={i % 2 ? "#9a8f82" : "#70675c"} /></mesh>)}
      {[...Array(50)].map((_, i) => { const x = (azar(i + 90) - 0.5) * 8; return (x > B0 - 0.05 && x < B1 + 0.05) || (x > 0.55 && x < 2.55) ? null : <mesh key={i} position={[x, 0.05, -0.02 - azar(i + 91) * 0.2]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.025, 0.14 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>; })}
      <group position={[-2.6, 0, -4.5]}><mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.16, 0.22, 2.0, 10]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        {[[0, 2.5, 0, 1.1], [-0.7, 2.1, 0.2, 0.75], [0.7, 2.2, -0.1, 0.8]].map(([x, yy, z, rr], i) => <mesh key={i} position={[x, yy, z]}><sphereGeometry args={[rr, 16, 12]} /><meshLambertMaterial color={i ? "#3aa84f" : "#2f9a4a"} /></mesh>)}</group>
      {/* el cantero: tierra a la vista, tela negra, mantillo y la capa de tierra nueva que se forma encima */}
      <Caja p={[(B0 + B1) / 2, 0.0, 0.004]} s={[B1 - B0, 0.05, PROF]} c="#6e4426" sombra={false} recibe={false} />
      {tela > 0 && (arranca < 1) && <group position={[0, 0.3 * arranca, 0.4 * arranca]} rotation={[0, 0, 0.5 * arranca]}>
        <Caja p={[B0 + (B1 - B0) * tela / 2, TELA, 0.012]} s={[(B1 - B0) * tela, 0.014, 0.02]} c="#141418" sombra={false} recibe={false} />
      </group>}
      {mantillo > 0 && arranca < 0.6 && <group>
        <Caja p={[(B0 + B1) / 2, TELA + 0.008 + (MANT - TELA) * mantillo / 2, 0.012]} s={[B1 - B0, (MANT - TELA) * mantillo, 0.02]} c="#b5651d" sombra={false} recibe={false} />
        {[...Array(40)].map((_, i) => <mesh key={i} position={[B0 + 0.04 + azar(i) * (B1 - B0 - 0.08), TELA + 0.015 + azar(i + 4) * (MANT - TELA - 0.02) * mantillo, 0.024]} rotation={[0, 0, azar(i + 8) * 3]}><boxGeometry args={[0.04, 0.012, 0.01]} /><meshLambertMaterial color={i % 3 ? "#8a4b1d" : "#d98a3a"} /></mesh>)}
        {tresAnios > 0 && <Caja p={[(B0 + B1) / 2, TELA + 0.008 + 0.022 * tresAnios, 0.026]} s={[B1 - B0, 0.044 * tresAnios, 0.01]} c="#3b2616" sombra={false} recibe={false} />}
      </group>}
      {arranca > 0 && [...Array(14)].map((_, i) => <mesh key={i} position={[B0 + azar(i) * (B1 - B0), MANT + 0.5 * arranca * azar(i + 3) + 0.2 * Math.sin(Math.PI * arranca), 0.1 + 0.3 * arranca]} rotation={[t * 4 + i, 0, i]}><boxGeometry args={[0.04, 0.012, 0.01]} /><meshLambertMaterial color="#8a4b1d" /></mesh>)}
      {/* flores plantadas por agujeros de la tela */}
      {[-1.25, -0.2].map((x, i) => <group key={i} position={[x, 0, 0.05]}>
        <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.012, 0.012, 0.42, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
        <mesh position={[0.05, 0.2, 0]} rotation={[0, 0, -0.9]} scale={[1, 0.4, 0.4]}><sphereGeometry args={[0.05, 8, 6]} /><meshLambertMaterial color="#3fa637" /></mesh>
        {[...Array(6)].map((_, j) => <mesh key={j} position={[0.05 * Math.cos(j), 0.45 + 0.05 * Math.sin(j), 0]}><sphereGeometry args={[0.035, 10, 8]} /><meshLambertMaterial color={i ? "#ff4f7b" : "#c56bff"} /></mesh>)}
        <mesh position={[0, 0.45, 0.02]}><sphereGeometry args={[0.03, 10, 8]} /><meshLambertMaterial color="#ffd23f" /></mesh>
        <mesh position={[0, -0.06, 0]}><cylinderGeometry args={[0.008, 0.003, 0.14, 5]} /><meshLambertMaterial color="#e8d7b0" /></mesh>
      </group>)}
      {[-1.45, -0.95, -0.7, -0.45, 0.0].map((x, i) => <Maleza key={i} x={x} y={TELA + 0.008 + 0.044 * tresAnios + (arranca > 0.5 ? -0.02 : 0)} s={malezas * (0.9 + 0.4 * azar(i)) * (gancho ? 1 + 0.15 * Math.sin(t * 9 + i) : 1)} atraviesa={atraviesa} t={t} />)}
      {semillas && [...Array(10)].map((_, i) => { const u = ((t - T[3] - 1.5) * 0.7 + azar(i)) % 1; return <mesh key={i} position={[B0 + 0.1 + azar(i + 30) * 1.5 + 0.05 * Math.sin(t * 3 + i), lerp(0.9, TELA + 0.06, u), 0.1]}><sphereGeometry args={[0.012, 6, 4]} /><meshBasicMaterial color="#5a3a1a" /></mesh>; })}
      {/* dos caminos de grava: sin tela (las piedras se hunden en el barro) y con tela (se quedan arriba) */}
      {[[0.6, 1.45, false], [1.65, 2.5, true]].map(([a, b, conTela], k) => { const x0 = a as number, x1 = b as number, ct = conTela as boolean; const h = ct ? 0 : hunde; return (
        <group key={k}>
          <Caja p={[(x0 + x1) / 2, -0.06, 0.004]} s={[x1 - x0, 0.17, 0.01]} c="#6b4a2a" sombra={false} recibe={false} />
          {ct && <Caja p={[(x0 + x1) / 2, -0.115, 0.012]} s={[x1 - x0, 0.012, 0.012]} c="#141418" sombra={false} recibe={false} />}
          <Caja p={[(x0 + x1) / 2, -0.05 - 0.09 * h, 0.008]} s={[x1 - x0, 0.12, 0.01]} c="#a7a196" sombra={false} recibe={false} />
          {[...Array(30)].map((_, i) => <mesh key={i} position={[x0 + 0.03 + azar(i + k * 40) * (x1 - x0 - 0.06), -0.1 + azar(i + 7 + k * 40) * 0.11 - 0.11 * h * (0.4 + 0.6 * azar(i + 9)), 0.02]}><sphereGeometry args={[0.018 + 0.012 * azar(i + 5), 8, 6]} /><meshLambertMaterial color={i % 3 ? "#8f897c" : "#d6d0c2"} /></mesh>)}
          {!ct && h > 0 && <Caja p={[(x0 + x1) / 2, 0.005 - 0.03 * (1 - h), 0.03]} s={[x1 - x0, 0.05 * h, 0.01]} c="#5a3a1a" sombra={false} recibe={false} />}
          {!ct && h > 0 && [...Array(10)].map((_, i) => <mesh key={i} position={[x0 + 0.06 + azar(i + 50) * (x1 - x0 - 0.12), 0.03 * h, 0.035]} scale={[1, 0.5, 0.5]}><sphereGeometry args={[0.05 * h, 10, 8]} /><meshLambertMaterial color="#5a3a1a" /></mesh>)}
        </group>); })}
      {pregunta && [0, 1, 2].map((i) => { const u = ((t - T[9]) * 0.9 + i / 3) % 1; return <mesh key={i} position={[fx + 0.15 + 0.12 * i, fy + 1.15 + 0.3 * u, 0.4]} scale={1 - u * 0.4}><torusGeometry args={[0.035, 0.012, 6, 12, Math.PI * 1.3]} /><meshBasicMaterial color="#ffffff" /></mesh>; })}
      <Flo p={[fx, fy, 0.35]} t={t} habla={fH} cae={fCae} giro={0.35} ala={fAla} />
      <Norm p={[nx, ny + nSalto, 0.4]} t={t} giro={-0.5} grieta brazo={nBrazo} salto={0} />
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
  const [ax] = pantalla(t, [1.03, 0.2, 0.1]), [bx] = pantalla(t, [2.08, 0.2, 0.1]), [, cy] = pantalla(t, [1.5, 0.25, 0.1]);
  const etiquetas = v(T[8] + 0.1, T[9]);
  const veredicto = v(T[10] + 0.3, T[11]);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">
      {titulo > 0 && <g opacity={titulo} transform={`translate(540 ${250 - 20 * (1 - titulo)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
        <text fontSize={92} fill="#fff" strokeWidth={20}>LANDSCAPE FABRIC</text><text y={135} fontSize={140} fill="#ff4f9a" strokeWidth={26}>IS A SCAM?</text></g>}
      {big("3 YEARS LATER…", v(T[2] + 2.5, T[3]), "#fff", "#14321f", 96)}
      {big("MULCH → SOIL", v(T[3] + 1.4, T[3] + 3.3), "#fff", "#14321f", 100)}
      {big("SEEDS LOVE IT", v(T[3] + 3.3, T[4]), "#27c24c", "#fff", 100)}
      {big("ROOTS GO THROUGH", v(T[4] + 0.4, T[5]), "#ff2a2a", "#fff", 84)}
      {big("RIP IT OUT!", v(T[5] + 0.2, T[6]), "#ff4f9a", "#fff", 130)}
      {big("NOT SO FAST!", v(T[6], T[7]), "#ffd23f", "#14321f", 120)}
      {big("GRAVEL PATH", v(T[7] + 0.1, T[8]), "#fff", "#14321f", 120)}
      {etiquetas > 0 && <g opacity={etiquetas}>
        <text x={Math.max(240, ax)} y={Math.max(420, cy - 180)} fontSize={64} fill="#ff4a4a" stroke="#fff" strokeWidth={13} strokeLinejoin="round" paintOrder="stroke">NO FABRIC</text>
        <text x={Math.min(860, bx)} y={Math.max(420, cy - 180)} fontSize={64} fill="#27c24c" stroke="#fff" strokeWidth={13} strokeLinejoin="round" paintOrder="stroke">FABRIC</text>
        <text x={Math.max(240, ax)} y={Math.max(420, cy - 180) + 70} fontSize={54} fill="#fff" stroke="#14321f" strokeWidth={12} strokeLinejoin="round" paintOrder="stroke">SINKS ✗</text>
        <text x={Math.min(860, bx)} y={Math.max(420, cy - 180) + 70} fontSize={54} fill="#fff" stroke="#14321f" strokeWidth={12} strokeLinejoin="round" paintOrder="stroke">STAYS ✓</text></g>}
      {big("IT DEPENDS?!", v(T[9] + 0.2, T[10]), "#ff4f9a", "#fff", 130)}
      {veredicto > 0 && <g opacity={veredicto} transform={`translate(540 ${330 - 15 * (1 - veredicto)})`}>
        <rect x={-460} y={-110} width={920} height={300} rx={36} fill="#14321f" opacity={0.9} stroke="#fff" strokeWidth={8} />
        <text x={-420} y={-25} textAnchor="start" fontSize={50} fill="#fff">FLOWER BEDS:</text><text x={420} y={-25} textAnchor="end" fontSize={52} fill="#ff4a4a">SKIP IT ✗</text>
        <text x={-420} y={40} textAnchor="start" fontSize={40} fill="#ffd23f">use thick mulch instead</text>
        <text x={-420} y={130} textAnchor="start" fontSize={50} fill="#fff">UNDER GRAVEL:</text><text x={420} y={130} textAnchor="end" fontSize={52} fill="#27c24c">KEEP IT ✓</text></g>}
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="FABRIC" der="NO FABRIC" colIzq="#27c24c" colDer="#ff4f9a" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: TREATED WOOD IN YOUR GARDEN?" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </svg>
  );
};

export const FabricVideo: React.FC = () => {
  const f = useCurrentFrame(), t = f / FAB_FPS;
  const negro = Math.max(1 - pr(t, 0, 0.2), pr(t, FAB_SEG - 0.5, FAB_SEG));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#55b8ff 0%, #bfeaff 62%, #e9fbff 100%)" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: FOV, near: 0.1, far: 80 }} gl={{ antialias: true }}><Mundo t={t} /></ThreeCanvas>
      <Rotulos t={t} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Subtitulos palabras={PAL} t={t} claves={CLAVES} y={1580} hablantes={HABLA} ocultoDesde={T[13] - 0.05} />
        <rect x={0} y={0} width={1080 * (t / FAB_SEG)} height={14} fill="#ffd23f" opacity={0.95} />
      </svg>
      {negro > 0 && <AbsoluteFill style={{ background: "#fff", opacity: negro }} />}
    </AbsoluteFill>
  );
};
