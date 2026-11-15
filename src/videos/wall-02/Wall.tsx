// «Your retaining wall will tip» — capítulo 2 del canal en inglés (vertical 1080x1920, 30 cps, 3D con three.js).
// El muro se ve en corte transversal (plano z = 0): bloques a la izquierda, tierra detrás, agua, grava y tubo de drenaje.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { cl, pr, lerp, azar, mezcla, rebote, Caja, Norm } from "../fence-01/Fence";

export const WALL_FPS = 30, WALL_SEG = 41.5, WALL_CUADROS = Math.round(WALL_FPS * WALL_SEG);
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3 };
const ALTO = 1.2, FILAS = 8, FH = ALTO / FILAS, GROSOR = 0.3, PROF = 4.5, GRAVA_W = 0.3, PIPE_Y = 0.1;
const C = {
  gancho: { pos: [0.9, 1.1, 4.9], look: [-0.3, 0.65, 0] } as Cam, gancho2: { pos: [0.6, 1.0, 4.4], look: [-0.4, 0.62, 0] } as Cam,
  obra: { pos: [1.3, 1.0, 5.2], look: [0.3, 0.65, 0] } as Cam, obra2: { pos: [1.1, 0.95, 4.7], look: [0.25, 0.65, 0] } as Cam,
  ancho: { pos: [1.7, 1.25, 6.6], look: [0.55, 0.65, 0] } as Cam, ancho2: { pos: [1.5, 1.15, 6.0], look: [0.5, 0.65, 0] } as Cam,
  agua: { pos: [1.5, 0.9, 4.8], look: [0.6, 0.6, 0] } as Cam, agua2: { pos: [1.3, 0.85, 4.3], look: [0.5, 0.6, 0] } as Cam,
  flechas: { pos: [1.3, 0.95, 4.3], look: [0.4, 0.65, 0] } as Cam, flechas2: { pos: [1.1, 0.9, 3.9], look: [0.3, 0.65, 0] } as Cam,
  cae: { pos: [1.2, 1.0, 5.2], look: [-0.15, 0.7, 0] } as Cam, cae2: { pos: [0.9, 1.0, 4.8], look: [-0.3, 0.65, 0] } as Cam,
  arreglo: { pos: [1.0, 1.0, 6.8], look: [-0.15, 0.62, 0] } as Cam, grava: { pos: [0.8, 0.75, 3.7], look: [0.2, 0.55, 0] } as Cam, grava2: { pos: [0.7, 0.7, 3.3], look: [0.18, 0.5, 0] } as Cam,
  tubo: { pos: [0.55, 0.3, 2.6], look: [0.15, 0.14, 0] } as Cam, tubo2: { pos: [0.45, 0.25, 2.2], look: [0.15, 0.1, 0] } as Cam,
  salida: { pos: [0.45, 0.35, 2.5], look: [0.15, 0.0, 0] } as Cam, salida2: { pos: [0.4, 0.3, 2.2], look: [0.15, -0.05, 0] } as Cam,
  drena: { pos: [1.2, 0.9, 4.8], look: [0.4, 0.55, 0] } as Cam, drena2: { pos: [1.0, 0.85, 4.3], look: [0.3, 0.55, 0] } as Cam,
  final: { pos: [1.0, 1.2, 6.8], look: [-0.3, 0.7, 0] } as Cam, final2: { pos: [0.8, 1.1, 6.2], look: [-0.35, 0.7, 0] } as Cam,
};
const CAMS: [number, number, Cam, Cam][] = [
  [0, 3.77, C.gancho, C.gancho2], [3.77, 8.09, C.obra, C.obra2], [8.09, 11.62, C.ancho, C.ancho2], [11.62, 14.53, C.agua, C.agua2],
  [14.53, 18.04, C.flechas, C.flechas2], [18.04, 22.81, C.cae, C.cae2], [22.81, 24.59, C.arreglo, C.arreglo], [24.59, 27.43, C.grava, C.grava2],
  [27.43, 30.4, C.tubo, C.tubo2], [30.4, 32.46, C.salida, C.salida2], [32.46, 35.95, C.drena, C.drena2], [35.95, 42, C.final, C.final2],
];
const camEn = (t: number): Cam => {
  const s = CAMS.find((x) => t >= x[0] && t < x[1]) ?? CAMS[CAMS.length - 1], u = cl((t - s[0]) / (s[1] - s[0])), k = u * u * (3 - 2 * u);
  const m = (a: V3, b: V3): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  return { pos: m(s[2].pos, s[3].pos), look: m(s[2].look, s[3].look) };
};
const FOV = 34;

type Estado = { malo: boolean; theta: number; dy: number[]; suelo: number; mojado: number; agua: number; flechas: number; gravaH: number; tubo: number; tela: number; drena: number; salida: number };

/** muro, tierra, agua y drenaje en un solo corte. `malo` = tierra pegada al muro; si no, grava + tubo */
const Muro: React.FC<{ e: Estado; t: number }> = ({ e, t }) => {
  const x0 = e.malo ? 0 : GRAVA_W, w = 8 - x0, tierra = mezcla("#9a6a3c", "#4b2f17", e.mojado).getStyle();
  return (
    <group>
      {/* bloques: giran sobre su arista de abajo-adelante */}
      <group position={[-GROSOR, 0, 0]} rotation={[0, 0, e.theta]}>
        {e.dy.map((dy, i) => dy < 0 ? null : <Caja key={i} p={[GROSOR / 2, FH * (i + 0.5) + dy, -PROF / 2 + 0.001]} s={[GROSOR - 0.012, FH - 0.012, PROF]} c={i % 2 ? "#cfc8ba" : "#bdb5a6"} />)}
      </group>
      {/* tierra de relleno con su césped */}
      {e.suelo > 0 && <>
        <Caja p={[x0 + w / 2, (ALTO * e.suelo) / 2, -PROF / 2]} s={[w, ALTO * e.suelo, PROF]} c={tierra} sombra={false} />
        {e.suelo > 0.98 && <Caja p={[x0 + w / 2, ALTO + 0.02, -PROF / 2]} s={[w, 0.06, PROF]} c="#5cc24a" sombra={false} />}
      </>}
      {!e.malo && <>
        <Caja p={[GRAVA_W / 2, ALTO / 2, -PROF / 2 + 0.002]} s={[GRAVA_W, ALTO, PROF]} c="#3b2616" sombra={false} />
        {e.gravaH > 0 && <group>
          <Caja p={[GRAVA_W / 2, (ALTO * e.gravaH) / 2, -PROF / 2 + 0.004]} s={[GRAVA_W - 0.004, ALTO * e.gravaH, PROF]} c="#b9b3a6" sombra={false} />
          {[...Array(70)].map((_, i) => { const y = 0.02 + azar(i + 3) * (ALTO - 0.04); return y > ALTO * e.gravaH ? null : <mesh key={i} position={[0.02 + azar(i) * (GRAVA_W - 0.04), y, 0.01]}><sphereGeometry args={[0.014 + 0.012 * azar(i + 5), 8, 6]} /><meshLambertMaterial color={i % 3 ? "#8f897c" : "#d6d0c2"} /></mesh>; })}
        </group>}
      </>}
      {/* el agua atrapada */}
      {e.agua > 0 && <Caja p={[1.5, e.agua / 2, -PROF / 2 + 0.008]} s={[3, e.agua, PROF]} c="#2f9bff" o={0.55} sombra={false} recibe={false} />}
      {/* flechas rojas: la presión empuja el muro */}
      {e.flechas > 0 && [0.28, 0.6, 0.92].map((y, i) => { const L = (0.14 + 0.34 * e.flechas) * (1 + 0.08 * Math.sin(t * 9 + i)); return (
        <group key={i} position={[0.12 + L, y, 0.03]}>
          <mesh position={[-L / 2 + 0.04, 0, 0]}><boxGeometry args={[L - 0.08, 0.05, 0.03]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
          <mesh position={[-L + 0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.07, 0.12, 3]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
        </group>); })}
      {/* tubo perforado con tela */}
      {e.tubo > 0 && <group position={[GRAVA_W / 2, PIPE_Y + lerp(0.8, 0, rebote(e.tubo)), 0.02]}>
        <mesh><circleGeometry args={[0.075, 24]} /><meshLambertMaterial color="#2c2c34" /></mesh>
        {[...Array(8)].map((_, i) => <mesh key={i} position={[Math.cos(i * 0.785) * 0.05, Math.sin(i * 0.785) * 0.05, 0.003]}><circleGeometry args={[0.009, 8]} /><meshBasicMaterial color="#f2f2f2" /></mesh>)}
        {e.tela > 0 && <mesh position={[0, 0, 0.004]}><ringGeometry args={[0.078, 0.078 + 0.03 * e.tela, 28]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.9} /></mesh>}
      </group>}
      {/* agua que baja por la grava y sale por el tubo */}
      {e.drena > 0 && [...Array(14)].map((_, i) => { const u = (t * 0.7 + i / 14) % 1; return <mesh key={i} position={[0.03 + azar(i + 30) * (GRAVA_W - 0.06), lerp(ALTO - 0.05, PIPE_Y, u), 0.03]} scale={[1, 1.6, 1]}><sphereGeometry args={[0.014, 8, 6]} /><meshBasicMaterial color="#2f9bff" transparent opacity={e.drena * (1 - u * 0.3)} /></mesh>; })}
      {e.salida > 0 && [...Array(10)].map((_, i) => { const u = (t * 1.1 + i / 10) % 1; return <mesh key={i} position={[GRAVA_W / 2 + (azar(i + 50) - 0.5) * 0.04, PIPE_Y - 0.5 * u * u - 0.01, 0.05 + 0.55 * u]} scale={[1, 1.4, 1]}><sphereGeometry args={[0.016, 8, 6]} /><meshBasicMaterial color="#2f9bff" transparent opacity={e.salida * (1 - 0.4 * u)} /></mesh>; })}
    </group>
  );
};

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = camEn(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  const malo = t < 22.81, gancho = t < 3.77;
  const lluvia = (t > 9.83 && t < 22.8) || (t > 32.0 && t < 35.95);
  // estado del muro
  let theta = 0;
  if (malo) {
    if (gancho) theta = 0.45 * rebote(cl((t - 1.0) / 0.9));
    else if (t >= 18.04 && t < 21.55) theta = 0.012 * Math.sin(t * 8) * pr(t, 18.04, 19.4) + 0.12 * pr(t, 19.4, 21.5);
    else if (t >= 21.55) theta = 0.12 + 0.34 * rebote(cl((t - 21.55) / 0.9));
  }
  const dy = [...Array(FILAS)].map((_, i) => { if (!malo || gancho || t >= 8.09) return 0; const a = 3.9 + i * 0.26; return t < a ? -1 : lerp(0.9, 0, pr(t, a, a + 0.26)); });
  const suelo = !malo || gancho || t >= 7.7 ? 1 : t < 6.2 ? 0 : pr(t, 6.2, 7.7);
  const mojado = malo && !gancho ? pr(t, 11.6, 14.0) : 0;
  const agua = malo && t >= 11.8 ? (t < 14.53 ? 0.5 * pr(t, 11.8, 14.5) : 0.5 + 0.55 * pr(t, 14.53, 18.0)) : 0;
  const flechas = malo && t >= 14.53 && t < 21.6 ? pr(t, 14.53, 18.0) * 0.9 + 0.1 : 0;
  const bien = !malo;
  const gravaH = bien ? pr(t, 25.0, 26.7) : 0, tubo = bien && t >= 27.6 ? cl((t - 27.6) / 0.7) : 0, tela = bien ? pr(t, 29.0, 29.8) : 0;
  const drena = bien && t > 32.5 && t < 35.9 ? 1 : 0, salida = bien && t > 30.7 && t < 36.2 ? 1 : 0;
  const e: Estado = { malo, theta, dy, suelo, mojado, agua, flechas, gravaH, tubo, tela, drena, salida };
  // Norm
  const hatU = gancho ? cl((t - 1.2) / 1.1) : 0, gorro: V3 = gancho ? [0.25 * pr(t, 1.2, 2.2), Math.sin(Math.PI * hatU) * 0.75, 0] : (t >= 21.6 && t < 22.8 ? [0.25 * pr(t, 21.7, 22.7), Math.sin(Math.PI * cl((t - 21.7) / 1.0)) * 0.75, 0] : [0, 0, 0]);
  const brazo = t >= 8.2 && t < 9.6 ? pr(t, 8.2, 8.7) : t >= 33.0 && t < 35.9 ? pr(t, 33.0, 33.5) : t >= 38.9 ? pr(t, 38.9, 39.4) : 0;
  const salto = gancho ? 0.12 * Math.abs(Math.sin(cl((t - 1.0) / 0.6) * Math.PI)) : t > 21.6 && t < 22.2 ? 0.1 * Math.abs(Math.sin((t - 21.6) * 9)) : 0;
  return (
    <group>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 5]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <mesh position={[-7, 9, -22]}><sphereGeometry args={[1.5, 24, 16]} /><meshBasicMaterial color="#ffe14d" /></mesh>
      {[[-9, 6, -20, 1.6], [4, 8.5, -24, 2.0], [10, 5.5, -22, 1.4], [-2, 11, -26, 1.8]].map(([x, y, z, s], i) => <group key={i} position={[x + Math.sin(t * 0.15 + i) * 0.6, y, z]} scale={s}>
        {[[-0.9, 0, 0.8], [0, 0.25, 1.1], [0.9, 0, 0.85]].map(([dx, dy2, r], j) => <mesh key={j} position={[dx, dy2, 0]} scale={[1, 0.7, 1]}><sphereGeometry args={[r, 16, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      </group>)}
      {/* terreno cortado en z = 0 */}
      <Caja p={[0, -0.02, -4.5]} s={[18, 0.08, 9]} c="#5cc24a" sombra={false} />
      <Caja p={[0, -0.55, -4.5]} s={[18, 1.0, 9]} c="#8a5a33" sombra={false} />
      <Caja p={[0, -1.4, -4.5]} s={[18, 0.7, 9]} c="#6e4426" sombra={false} />
      <Caja p={[0, -1.95, -4.5]} s={[18, 0.4, 9]} c="#56331c" sombra={false} />
      {[...Array(30)].map((_, i) => <mesh key={i} position={[(azar(i + 40) - 0.5) * 12, -0.15 - azar(i + 50) * 1.8, 0.0]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.04 + 0.07 * azar(i + 60), 10, 8]} /><meshLambertMaterial color={i % 2 ? "#9a8f82" : "#70675c"} /></mesh>)}
      {[...Array(50)].map((_, i) => { const x = -4 + azar(i + 90) * 3.6; return <mesh key={i} position={[x, 0.05, -0.02 - azar(i + 91) * 0.2]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.025, 0.14 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>; })}
      {[[-2.6, -2.2, 0.55], [-3.6, -3.4, 0.7], [-1.9, -4.6, 0.6]].map(([x, z, r], i) => <mesh key={i} position={[x, r * 0.7, z]} scale={[1, 0.8, 1]} castShadow><sphereGeometry args={[r, 18, 14]} /><meshLambertMaterial color={i % 2 ? "#2f9a4a" : "#43b85c"} /></mesh>)}
      {[...Array(16)].map((_, i) => { const x = -4 + azar(i + 120) * 3.2, z = -0.5 - azar(i + 121) * 5; return <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.012, 0.012, 0.22, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
        <mesh position={[0, 0.24, 0]} castShadow><sphereGeometry args={[0.06, 10, 8]} /><meshLambertMaterial color={["#ff4f7b", "#ffd23f", "#ff8a2a", "#c56bff", "#ffffff"][i % 5]} /></mesh>
      </group>; })}
      <group position={[4.2, 1.2, -6.2]}><mesh position={[0, 1.0, 0]} castShadow><cylinderGeometry args={[0.16, 0.22, 2.0, 10]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        {[[0, 2.5, 0, 1.1], [-0.7, 2.1, 0.2, 0.75], [0.7, 2.2, -0.1, 0.8]].map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]} castShadow><sphereGeometry args={[r, 16, 12]} /><meshLambertMaterial color={i ? "#3aa84f" : "#2f9a4a"} /></mesh>)}</group>
      <Muro e={e} t={t} />
      {lluvia && [...Array(150)].map((_, i) => { const u = (t * (1.6 + azar(i)) + azar(i + 200)) % 1; return <mesh key={i} position={[-1.6 + azar(i + 210) * 4.2, lerp(3.4, 0.0, u), 0.7 - azar(i + 220) * 3.0]} scale={[1, 5, 1]}><sphereGeometry args={[0.008, 6, 4]} /><meshBasicMaterial color="#bfe3ff" /></mesh>; })}
      <Norm p={[-1.1, 0, -0.5]} t={t} giro={-0.55} gorro={gorro} grieta={t >= 21.7} brazo={brazo} salto={salto} />
    </group>
  );
};

// ---------------------------------------------------------------- rótulos
const F = "DejaVu Sans, Arial, sans-serif";
const pcam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80), v = new THREE.Vector3();
const pantalla = (t: number, p: V3): [number, number] => { const c = camEn(t); pcam.position.set(...c.pos); pcam.lookAt(...c.look); pcam.updateMatrixWorld(); v.set(...p).project(pcam); return [(v.x + 1) * 540, (1 - v.y) * 960]; };
const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const titulo = Math.min(pr(t, 0.15, 0.5), 1 - pr(t, 3.5, 4.0));
  const [dx0, dy0] = pantalla(t, [0, ALTO + 0.12, 0.05]), [dx1] = pantalla(t, [GRAVA_W, ALTO + 0.12, 0.05]);
  const doce = Math.min(pr(t, 26.5, 26.9), 1 - pr(t, 27.1, 27.4));
  const [tx, ty] = pantalla(t, [GRAVA_W / 2, PIPE_Y, 0.05]);
  const tubo = Math.min(pr(t, 28.3, 28.7), 1 - pr(t, 30.1, 30.4)), salida = Math.min(pr(t, 30.6, 30.9), 1 - pr(t, 32.1, 32.4));
  const sello = pr(t, 38.96, 39.2);
  const lab = (x: number, y: number, s: string, o: number, tam = 58) => <g opacity={o}>
    <line x1={tx} y1={ty} x2={Math.min(x, 520)} y2={y + 10} stroke="#14321f" strokeWidth={8} strokeLinecap="round" />
    <text x={Math.min(x, 520)} y={y} textAnchor="start" fontSize={tam} fill="#fff" stroke="#14321f" strokeWidth={16} strokeLinejoin="round" paintOrder="stroke">{s}</text>
  </g>;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">
      {titulo > 0 && <g opacity={titulo} transform={`translate(540 ${250 - 20 * (1 - titulo)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
        <text fontSize={92} fill="#fff" strokeWidth={20}>YOUR RETAINING</text>
        <text y={122} fontSize={112} fill="#ff7a1a" strokeWidth={24}>WALL WILL TIP</text>
      </g>}
      {doce > 0 && <g opacity={doce} stroke="#14321f" strokeWidth={8} strokeLinecap="round">
        <line x1={dx0} y1={dy0} x2={dx1} y2={dy0} /><line x1={dx0} y1={dy0 - 22} x2={dx0} y2={dy0 + 22} /><line x1={dx1} y1={dy0 - 22} x2={dx1} y2={dy0 + 22} />
        <text x={(dx0 + dx1) / 2} y={dy0 - 40} fontSize={96} fill="#fff" strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">12 in</text>
      </g>}
      {tubo > 0 && lab(tx + 90, ty - 150, "PIPE + FABRIC", tubo, 52)}
      {salida > 0 && lab(tx + 90, ty - 150, "OUTLET", salida, 76)}
      {sello > 0 && <g transform={`translate(540 440) rotate(-8) scale(${lerp(2.2, 1, sello)})`} opacity={sello}>
        <rect x={-250} y={-74} width={500} height={148} rx={22} fill="#27c24c" stroke="#fff" strokeWidth={10} />
        <text y={24} fontSize={62} fill="#fff">UP TO NORM</text>
      </g>}
    </svg>
  );
};

export const RetainingWall: React.FC = () => {
  const f = useCurrentFrame(), t = f / WALL_FPS;
  const destello = t >= 22.6 && t < 23.4 ? (t < 22.81 ? pr(t, 22.6, 22.81) : 1 - pr(t, 22.81, 23.4)) : 0;
  const negro = Math.max(1 - pr(t, 0, 0.3), pr(t, WALL_SEG - 0.6, WALL_SEG));
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
