// Piezas comunes de los shorts de debate (desde el video 10): cámara por tramos, fondo de patio, rótulos y el marco
// con subtítulos, barra de progreso y fundido. Cada video pone su propio mundo 3D y sus rótulos.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { cl, pr, lerp, azar, Caja } from "../fence-01/Fence";
import { Subtitulos, Palabra, Hablante } from "./Subtitulos";

export type V3 = [number, number, number];
export type Cam = { pos: V3; look: V3 };
export type Tramo = [number, number, Cam, Cam];
export const FOV = 34;
export const F = "DejaVu Sans, Arial, sans-serif";
export const HABLA: Hablante[] = [{ nombre: "NORM", color: "#ffd23f", fondo: "#1f7a4a" }, { nombre: "FLO", color: "#ff8fcf", fondo: "#e94f98" }];

type Tiempos = { total: number; frases: { a: number; b: number; h: number }[] };
/** quién habla en el segundo t (1 si es el personaje h) */
export const hablaDe = (tiempos: Tiempos) => (t: number, h: number) => { const f = tiempos.frases.find((x) => t >= x.a && t < x.b); return f && f.h === h ? 1 : 0; };
export const duracion = (tiempos: Tiempos) => Math.round((tiempos.total + 1.1) * 10) / 10;

/** cámara que va de un encuadre a otro dentro de cada tramo, con sacudida opcional; y su proyección a pantalla */
export const hacerCamara = (tramos: Tramo[], sacude: (t: number) => number = () => 0) => {
  const camEn = (t: number): Cam => {
    const s = tramos.find((x) => t >= x[0] && t < x[1]) ?? tramos[tramos.length - 1], u = cl((t - s[0]) / (s[1] - s[0])), k = u * u * (3 - 2 * u), a = sacude(t);
    const m = (p: V3, q: V3, o: V3): V3 => [lerp(p[0], q[0], k) + o[0], lerp(p[1], q[1], k) + o[1], lerp(p[2], q[2], k) + o[2]];
    return { pos: m(s[2].pos, s[3].pos, [Math.sin(t * 61) * a, Math.cos(t * 73) * a, 0]), look: m(s[2].look, s[3].look, [0, 0, 0]) };
  };
  const pc = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80), v = new THREE.Vector3();
  const pantalla = (t: number, p: V3): [number, number] => { const c = camEn(t); pc.position.set(...c.pos); pc.lookAt(...c.look); pc.updateMatrixWorld(); v.set(...p).project(pc); return [(v.x + 1) * 540, (1 - v.y) * 960]; };
  return { camEn, pantalla };
};

export const PonerCamara: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree(), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  return null;
};

/** luz, sol, nubes, suelo cortado en z = 0, piedras en la tierra, un árbol y pasto (sin pasto en los `huecos` de x) */
export const Patio: React.FC<{ t: number; huecos?: [number, number][]; zPasto?: number }> = ({ t, huecos = [], zPasto = 0 }) => (
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
    {[...Array(24)].map((_, i) => <mesh key={i} position={[(azar(i + 40) - 0.5) * 9, -0.3 - azar(i + 50) * 1.25, 0.0]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.04 + 0.07 * azar(i + 60), 10, 8]} /><meshLambertMaterial color={i % 2 ? "#9a8f82" : "#70675c"} /></mesh>)}
    {[...Array(50)].map((_, i) => { const x = (azar(i + 90) - 0.5) * 8; return huecos.some(([a, b]) => x > a && x < b) ? null : <mesh key={i} position={[x, 0.05, zPasto - 0.02 - azar(i + 91) * 0.2]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.025, 0.14 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>; })}
    <group position={[-2.6, 0, -4.5]}><mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.16, 0.22, 2.0, 10]} /><meshLambertMaterial color="#7a4a26" /></mesh>
      {[[0, 2.5, 0, 1.1], [-0.7, 2.1, 0.2, 0.75], [0.7, 2.2, -0.1, 0.8]].map(([x, yy, z, rr], i) => <mesh key={i} position={[x, yy, z]}><sphereGeometry args={[rr, 16, 12]} /><meshLambertMaterial color={i ? "#3aa84f" : "#2f9a4a"} /></mesh>)}</group>
  </group>
);

/** signos de pregunta que suben sobre una cabeza */
export const Preguntas: React.FC<{ t: number; a: number; p: V3 }> = ({ t, a, p }) => <>{[0, 1, 2].map((i) => {
  const u = ((t - a) * 0.9 + i / 3) % 1;
  return <mesh key={i} position={[p[0] + 0.12 * i, p[1] + 0.3 * u, p[2]]} scale={1 - u * 0.4}><torusGeometry args={[0.035, 0.012, 6, 12, Math.PI * 1.3]} /><meshBasicMaterial color="#ffffff" /></mesh>;
})}</>;

/** aparece en a y se va en b */
export const ventana = (t: number, a: number, b: number) => Math.min(pr(t, a, a + 0.22), 1 - pr(t, b - 0.18, b));

/** texto grande centrado con borde */
export const Grande: React.FC<{ s: string; o: number; col: string; borde: string; tam?: number; y?: number }> = ({ s, o, col, borde, tam = 100, y = 300 }) => {
  if (o <= 0) return null;
  const t = Math.min(tam, 990 / (s.length * 0.68));   // que nunca se salga del cuadro
  return <text x={540} y={y - 15 * (1 - o)} opacity={o} fontSize={t} fill={col} stroke={borde} strokeWidth={t * 0.2} strokeLinejoin="round" paintOrder="stroke">{s}</text>;
};

/** etiqueta pequeña con borde, en cualquier punto de la pantalla (se mantiene dentro del cuadro) */
export const Etiqueta: React.FC<{ s: string; x: number; y: number; o: number; col: string; borde?: string; tam?: number }> = ({ s, x, y, o, col, borde = "#fff", tam = 60 }) => {
  if (o <= 0) return null;
  const media = s.length * tam * 0.36;
  return <text x={Math.max(40 + media, Math.min(1040 - media, x))} y={Math.max(380, Math.min(1400, y))} opacity={o} fontSize={tam} fill={col} stroke={borde} strokeWidth={tam * 0.2} strokeLinejoin="round" paintOrder="stroke">{s}</text>;
};

/** título del gancho: línea blanca arriba y línea de color grande abajo */
export const Titulo: React.FC<{ t: number; fin: number; arriba: string; abajo: string; color: string; tamAbajo?: number }> = ({ t, fin, arriba, abajo, color, tamAbajo = 130 }) => {
  const o = Math.min(pr(t, 0.12, 0.35), 1 - pr(t, fin - 0.2, fin - 0.02));
  return o <= 0 ? null : <g opacity={o} transform={`translate(540 ${250 - 20 * (1 - o)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
    <text fontSize={88} fill="#fff" strokeWidth={20}>{arriba}</text><text y={135} fontSize={tamAbajo} fill={color} strokeWidth={26}>{abajo}</text></g>;
};

/** el cuadro completo: mundo 3D, rótulos SVG, subtítulos, barra de progreso y fundido de entrada y salida */
export const Marco: React.FC<{ t: number; seg: number; mundo: React.ReactNode; rotulos: React.ReactNode; palabras: Palabra[]; claves: string[]; ocultoDesde: number }> = ({ t, seg, mundo, rotulos, palabras, claves, ocultoDesde }) => {
  const blanco = Math.max(1 - pr(t, 0, 0.2), pr(t, seg - 0.5, seg));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#55b8ff 0%, #bfeaff 62%, #e9fbff 100%)" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: FOV, near: 0.1, far: 80 }} gl={{ antialias: true }}>{mundo}</ThreeCanvas>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">{rotulos}</svg>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Subtitulos palabras={palabras} t={t} claves={claves} y={1580} hablantes={HABLA} ocultoDesde={ocultoDesde} />
        <rect x={0} y={0} width={1080 * (t / seg)} height={14} fill="#ffd23f" opacity={0.95} />
      </svg>
      {blanco > 0 && <AbsoluteFill style={{ background: "#fff", opacity: blanco }} />}
    </AbsoluteFill>
  );
};
