// «Your fence post will rot» — piloto del canal en inglés (vertical 1080x1920, 30 cps, 3D con three.js).
// El suelo está cortado en z = 0: el poste protagonista queda justo en el corte para ver el hoyo por dentro.
// La cerca corre hacia el fondo (eje z). Unidades en metros.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";

export const FENCE_FPS = 30, FENCE_SEG = 43, FENCE_CUADROS = FENCE_FPS * FENCE_SEG;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const u = cl(x); return u * u * (3 - 2 * u); };
const pr = (t: number, a: number, b: number) => sm((t - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const azar = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mezcla = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), cl(t));
const rebote = (u: number) => u >= 1 ? 1 : 1 - Math.abs(Math.cos(u * Math.PI * 2.5)) * (1 - u); // caída con rebote

type V3 = [number, number, number];
type Cam = { pos: V3; look: V3 };
const C = {
  gancho: { pos: [3.6, 1.3, 5.0], look: [0, 0.6, -0.9] } as Cam, gancho2: { pos: [3.2, 1.1, 4.5], look: [0, 0.5, -0.8] } as Cam,
  obra: { pos: [3.0, 1.0, 4.6], look: [0, 0.3, -0.5] } as Cam, corte: { pos: [1.5, -0.15, 3.5], look: [0, -0.38, 0] } as Cam, corte2: { pos: [1.2, -0.2, 3.1], look: [0, -0.42, 0] } as Cam,
  ancho: { pos: [4.0, 1.6, 5.4], look: [0.2, 0.45, -0.7] } as Cam, ancho2: { pos: [3.6, 1.4, 5.0], look: [0.2, 0.45, -0.7] } as Cam,
  ras: { pos: [1.0, 0.3, 2.3], look: [0, -0.08, 0] } as Cam, ras2: { pos: [0.8, 0.22, 2.0], look: [0, -0.06, 0] } as Cam,
  arreglo: { pos: [1.5, 0.0, 3.4], look: [0, -0.4, 0] } as Cam, arreglo2: { pos: [1.2, -0.1, 3.0], look: [0, -0.45, 0] } as Cam, domo: { pos: [1.0, 0.45, 2.3], look: [0, 0.0, 0] } as Cam,
  compara: { pos: [0.6, 1.0, 7.6], look: [-0.68, 0.25, -0.3] } as Cam, compara2: { pos: [0.5, 0.9, 7.0], look: [-0.68, 0.25, -0.3] } as Cam,
};
// [desde, hasta, cámara inicial, cámara final]: un cambio de tramo sin transición es un corte
const CAMS: [number, number, Cam, Cam][] = [
  [0, 4.5, C.gancho, C.gancho2], [4.5, 7.3, C.obra, C.obra], [7.3, 8.7, C.obra, C.corte], [8.7, 10.2, C.corte, C.corte2],
  [10.2, 12.1, C.ancho, C.ancho2], [12.1, 14.7, C.corte, C.corte2], [14.7, 17.1, C.corte2, C.ras], [17.1, 21.2, C.ras, C.ras2],
  [21.2, 25.3, C.ancho, C.ancho2], [25.3, 33.7, C.arreglo, C.arreglo2], [33.7, 34.6, C.arreglo2, C.domo], [34.6, 37.1, C.domo, C.domo],
  [37.1, 43.1, C.compara, C.compara2],
];
const camEn = (t: number): Cam => {
  const s = CAMS.find((x) => t >= x[0] && t < x[1]) ?? CAMS[CAMS.length - 1], u = sm((t - s[0]) / (s[1] - s[0]));
  const m = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  return { pos: m(s[2].pos, s[3].pos), look: m(s[2].look, s[3].look) };
};
const FOV = 34;

// ---------------------------------------------------------------- piezas
const Caja: React.FC<{ p: V3; s: V3; c: THREE.ColorRepresentation; o?: number; sombra?: boolean; recibe?: boolean }> = ({ p, s, c, o = 1, sombra = true, recibe = true }) => (
  <mesh position={p} castShadow={sombra} receiveShadow={recibe}><boxGeometry args={s} /><meshLambertMaterial color={c} transparent={o < 1} opacity={o} /></mesh>
);
const HOYO = { ancho: 0.46, fondo: -0.9, prof: 0.32 }, POSTE = { lado: 0.13, pie: -0.75, alto: 1.5 }, GRAVA = 0.15;

// cuña del remate inclinado, vista en el corte: alta junto al poste, a ras en el borde
const CUNA = (() => { const sh = new THREE.Shape(); sh.moveTo(POSTE.lado / 2, 0); sh.lineTo(POSTE.lado / 2, 0.1); sh.lineTo(HOYO.ancho / 2 + 0.06, 0.012); sh.lineTo(HOYO.ancho / 2 + 0.06, 0); sh.closePath(); return sh; })();

/** Norm, el gnomo de jardín */
const Norm: React.FC<{ p: V3; t: number; brazo?: number; gorro?: V3; grieta?: boolean; giro?: number; salto?: number; inclina?: number }> = ({ p, t, brazo = 0, gorro = [0, 0, 0], grieta, giro = -0.5, salto = 0, inclina = 0 }) => (
  <group position={[p[0], p[1] + salto, p[2]]} rotation={[0, giro, inclina]} scale={1.15}>
    {[-0.07, 0.07].map((x) => <mesh key={x} position={[x, 0.04, 0.03]} castShadow scale={[1, 0.6, 1.4]}><sphereGeometry args={[0.07, 16, 12]} /><meshLambertMaterial color="#6b4423" /></mesh>)}
    <mesh position={[0, 0.22, 0]} castShadow><cylinderGeometry args={[0.1, 0.17, 0.32, 20]} /><meshLambertMaterial color="#1f7a4a" /></mesh>
    <mesh position={[0, 0.2, 0.0]} castShadow><cylinderGeometry args={[0.172, 0.172, 0.04, 20]} /><meshLambertMaterial color="#3a2a1a" /></mesh>
    {grieta && [[0.02, 0.3, 0.3], [-0.03, 0.24, -0.4], [0.02, 0.18, 0.35], [-0.02, 0.12, -0.3]].map(([x, y, r], i) => <mesh key={i} position={[x, y, 0.135 + (0.3 - y) * 0.2]} rotation={[0, 0, r]}><boxGeometry args={[0.09, 0.016, 0.01]} /><meshBasicMaterial color="#1a120c" /></mesh>)}
    {[-1, 1].map((k) => <group key={k} position={[0.13 * k, 0.33, 0]} rotation={[0, 0, k * (0.5 + (k > 0 ? brazo * 2.3 : 0))]}>
      <mesh position={[0, -0.09, 0]} castShadow><cylinderGeometry args={[0.035, 0.035, 0.18, 12]} /><meshLambertMaterial color="#1f7a4a" /></mesh>
      <mesh position={[0, -0.2, 0]}><sphereGeometry args={[0.042, 12, 10]} /><meshLambertMaterial color="#f2c7a0" /></mesh>
    </group>)}
    <mesh position={[0, 0.46, 0]} castShadow><sphereGeometry args={[0.115, 20, 16]} /><meshLambertMaterial color="#f2c7a0" /></mesh>
    <mesh position={[0, 0.37, 0.07]} rotation={[Math.PI, 0, 0]} castShadow><coneGeometry args={[0.105, 0.24, 18]} /><meshLambertMaterial color="#ffffff" /></mesh>
    <mesh position={[0, 0.45, 0.12]}><sphereGeometry args={[0.032, 12, 10]} /><meshLambertMaterial color="#f08a8a" /></mesh>
    {[-0.045, 0.045].map((x) => <mesh key={x} position={[x, 0.49, 0.1]}><sphereGeometry args={[0.017, 10, 8]} /><meshBasicMaterial color="#1a1a1a" /></mesh>)}
    <group position={[gorro[0], 0.66 + gorro[1], gorro[2]]} rotation={[0, 0, gorro[1] * 2.2 + 0.06 * Math.sin(t * 3)]}>
      <mesh castShadow><coneGeometry args={[0.13, 0.36, 20]} /><meshLambertMaterial color="#ff7a1a" /></mesh>
    </group>
  </group>
);

/** el poste protagonista con su hoyo, visto en el corte. `tipo` cambia el relleno del hoyo */
const Hoyo: React.FC<{ x: number; t: number; tipo: "taza" | "bien"; concreto: number; grava: number; poste: number; agua: number; podrido: number; domo: number; tocon?: boolean; drena?: number; fuera?: number }> =
  ({ x, t, tipo, concreto, grava, poste, agua, podrido, domo, tocon, drena = 0, fuera = 0 }) => {
    const a = HOYO.ancho, piso = HOYO.fondo, pie = tipo === "bien" ? HOYO.fondo + GRAVA : POSTE.pie;
    const madera = mezcla("#c98a4b", "#3d2a1c", podrido), py = pie + lerp(1.6, 0, rebote(poste));
    const nivel = lerp(piso, 0, concreto), tope = tocon ? 0.14 : POSTE.alto;
    return (
      <group position={[x, 0, 0]}>
        {/* la cavidad */}
        <Caja p={[0, piso / 2, -HOYO.prof / 2 + 0.002]} s={[a, -piso, HOYO.prof]} c="#3b2616" sombra={false} />
        {/* grava: 15 cm = 6 pulgadas */}
        {tipo === "bien" && grava > 0 && <group>
          <Caja p={[0, piso + GRAVA * grava / 2, -HOYO.prof / 2 + 0.006]} s={[a - 0.01, GRAVA * grava, HOYO.prof]} c="#b9b3a6" sombra={false} />
          {[...Array(34)].map((_, i) => azar(i + 7) < grava ? <mesh key={i} position={[(azar(i) - 0.5) * (a - 0.06), piso + 0.02 + azar(i + 3) * (GRAVA - 0.04) * grava, 0.008]}><sphereGeometry args={[0.018 + 0.014 * azar(i + 5), 8, 6]} /><meshLambertMaterial color={i % 3 ? "#8f897c" : "#d6d0c2"} /></mesh> : null)}
        </group>}
        {/* concreto: taza completa (también por debajo) o collar a los lados */}
        {concreto > 0 && tipo === "taza" && <Caja p={[0, (piso + nivel) / 2, -HOYO.prof / 2 + 0.006]} s={[a - 0.01, nivel - piso, HOYO.prof]} c="#aeb4b8" sombra={false} />}
        {concreto > 0 && tipo === "bien" && [-1, 1].map((k) => { const h = (0 - pie) * concreto; return <Caja key={k} p={[k * (a / 4 + POSTE.lado / 4), pie + h / 2, -HOYO.prof / 2 + 0.006]} s={[a / 2 - POSTE.lado / 2 - 0.005, h, HOYO.prof]} c="#aeb4b8" sombra={false} />; })}
        {/* el poste */}
        {poste > 0 && <group position={[0, py, -POSTE.lado / 2]}>
          <Caja p={[0, (tope - pie) / 2, 0.012]} s={[POSTE.lado, tope - pie, POSTE.lado]} c="#c98a4b" />
          <Caja p={[0, -pie, 0.013]} s={[POSTE.lado + 0.004, 0.3, POSTE.lado + 0.004]} c={madera} />
          {podrido > 0.3 && [[-0.03, 0.05], [0.035, -0.04], [0, -0.1], [-0.02, 0.11]].map(([dx, dy], i) => <mesh key={i} position={[dx, -pie + dy, POSTE.lado / 2 + 0.016]}><circleGeometry args={[0.022 + 0.01 * i, 10]} /><meshBasicMaterial color="#1f150d" transparent opacity={podrido * 0.8} /></mesh>)}
          {tocon && [-0.04, 0, 0.04].map((dx, i) => <mesh key={i} position={[dx, tope - pie + 0.03, 0.012]} rotation={[0, 0, dx * 4]}><coneGeometry args={[0.03, 0.1, 5]} /><meshLambertMaterial color="#3d2a1c" /></mesh>)}
        </group>}
        {/* agua atrapada entre la madera y el concreto (la taza) */}
        {agua > 0 && tipo === "taza" && <group>
          {[-1, 1].map((k) => <Caja key={k} p={[k * (POSTE.lado / 2 + 0.014), lerp(POSTE.pie, -0.02, agua) / 2 + POSTE.pie / 2, 0.012]} s={[0.022, (lerp(POSTE.pie, -0.02, agua) - POSTE.pie), 0.02]} c="#2f9bff" sombra={false} />)}
          <Caja p={[0, POSTE.pie - 0.012, 0.012]} s={[POSTE.lado + 0.05, 0.024, 0.02]} c="#2f9bff" sombra={false} />
        </group>}
        {/* agua que escurre por la grava */}
        {drena > 0 && [...Array(10)].map((_, i) => { const u = (t * 0.9 + i / 10) % 1; return <mesh key={i} position={[(azar(i + 20) - 0.5) * 0.3, lerp(pie, piso - 0.12, u), 0.02]} scale={[1, 1.6, 1]}><sphereGeometry args={[0.014, 8, 6]} /><meshBasicMaterial color="#2f9bff" transparent opacity={drena * (1 - u * 0.6)} /></mesh>; })}
        {/* remate inclinado: medio domo sobre el nivel del suelo */}
        {domo > 0 && <group position={[0, 0.004, 0]} scale={[1, domo, 1]}>
          <mesh position={[0, 0.05, -0.001]}><cylinderGeometry args={[POSTE.lado * 0.8, a / 2 + 0.06, 0.1, 28, 1, false, Math.PI / 2, Math.PI]} /><meshLambertMaterial color="#c3c8cc" /></mesh>
          {[-1, 1].map((k) => <mesh key={k} position={[0, 0, 0.004]} scale={[k, 1, 1]}><shapeGeometry args={[CUNA]} /><meshLambertMaterial color="#d3d8dc" side={THREE.DoubleSide} /></mesh>)}
        </group>}
        {fuera > 0 && [...Array(8)].map((_, i) => { const u = (t * 1.3 + i / 8) % 1, k = i % 2 ? 1 : -1; return <mesh key={i} position={[k * lerp(0.08, 0.36, u), lerp(0.1, 0.0, u * u), 0.03]}><sphereGeometry args={[0.016, 8, 6]} /><meshBasicMaterial color="#2f9bff" transparent opacity={fuera} /></mesh>; })}
      </group>
    );
  };

/** tramo de cerca: postes al fondo, largueros y tablas. Gira sobre el ras del suelo cuando el poste se rompe */
const Cerca: React.FC<{ caida: number; escala: number; color?: string }> = ({ caida, escala, color = "#fffaf0" }) => (
  <group rotation={[0, 0, caida * 1.45]} scale={[1, escala, 1]}>
    {[-1.5, -3.0].map((z) => <Caja key={z} p={[0, 0.75, z]} s={[POSTE.lado, 1.5, POSTE.lado]} c="#c98a4b" />)}
    {[0.42, 1.12].map((y) => <Caja key={y} p={[-0.02, y, -1.5]} s={[0.05, 0.09, 3.1]} c="#b97a3e" />)}
    {[...Array(21)].map((_, i) => <group key={i} position={[0.045, 0, -0.1 - i * 0.145]}>
      <Caja p={[0, 0.7, 0]} s={[0.025, 1.3, 0.1]} c={color} />
      <mesh position={[0, 1.39, 0]} rotation={[0, 0, 0]} castShadow><coneGeometry args={[0.058, 0.1, 4]} /><meshLambertMaterial color={color} /></mesh>
    </group>)}
  </group>
);

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = camEn(t), pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...cam.pos); pc.fov = FOV; pc.near = 0.1; pc.far = 80; pc.updateProjectionMatrix(); pc.lookAt(...cam.look);
  // --- estados de la historia
  const gancho = t < 4.5, obra = t >= 4.5 && t < 21.2, anios = t >= 21.2 && t < 25.3, arreglo = t >= 25.3 && t < 37.1, compara = t >= 37.1;
  const caida = gancho ? rebote(cl((t - 1.0) / 0.9)) : anios ? rebote(cl((t - 24.45) / 0.8)) : 0;
  const posteMalo = gancho || anios ? 1 : obra ? cl((t - 5.45) / 0.7) : 0;
  const concretoMalo = gancho || anios ? 1 : obra ? pr(t, 6.2, 7.5) : 0;
  const agua = obra ? pr(t, 15.2, 17.6) : anios ? 1 : 0, podrido = gancho || anios ? 1 : obra ? pr(t, 19.0, 21.1) : 0;
  const lluvia = (t > 14.6 && t < 21.3) || (t > 35.2 && t < 37.2);
  const cercaEsc = gancho || anios ? 1 : obra ? pr(t, 9.9, 10.4) : arreglo ? pr(t, 36.2, 36.8) : 1;
  const grava = pr(t, 26.9, 28.1), posteBien = arreglo ? cl((t - 28.15) / 0.7) : 1, collar = pr(t, 30.5, 32.2), domo = pr(t, 34.0, 35.0);
  const anioU = anios ? cl((t - 21.2) / 2.0) : 0; // las estaciones pasan rápido
  const cesped = anios && t < 23.2 ? mezcla("#5cc24a", ["#d8b23a", "#f1f5f7", "#5cc24a"][Math.min(2, Math.floor(anioU * 3))], Math.sin(Math.PI * ((anioU * 3) % 1))) : new THREE.Color("#5cc24a");
  const empuja = anios ? pr(t, 23.1, 24.4) : 0;
  const gorroVuela: V3 = gancho ? [0.25 * pr(t, 1.2, 2.2), Math.sin(Math.PI * cl((t - 1.2) / 1.1)) * 0.75, 0] : [0, 0, 0];
  const normX = anios ? lerp(1.15, 0.42, empuja) : 1.15;
  return (
    <group>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 7, 5]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      {/* sol y nubes */}
      <mesh position={[-7, 9, -22]}><sphereGeometry args={[1.5, 24, 16]} /><meshBasicMaterial color="#ffe14d" /></mesh>
      {[[-9, 6, -20, 1.6], [4, 8.5, -24, 2.0], [10, 5.5, -22, 1.4], [-2, 11, -26, 1.8]].map(([x, y, z, s], i) => <group key={i} position={[x + Math.sin(t * 0.15 + i) * 0.6, y, z]} scale={s}>
        {[[-0.9, 0, 0.8], [0, 0.25, 1.1], [0.9, 0, 0.85]].map(([dx, dy, r], j) => <mesh key={j} position={[dx, dy, 0]} scale={[1, 0.7, 1]}><sphereGeometry args={[r, 16, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
      </group>)}
      {/* terreno cortado: césped arriba, tierra por capas, el corte en z = 0 */}
      <Caja p={[0, -0.02, -4.5]} s={[9, 0.08, 9]} c={cesped} sombra={false} />
      <Caja p={[0, -0.55, -4.5]} s={[9, 1.0, 9]} c="#8a5a33" sombra={false} />
      <Caja p={[0, -1.4, -4.5]} s={[9, 0.7, 9]} c="#6e4426" sombra={false} />
      <Caja p={[0, -1.95, -4.5]} s={[9, 0.4, 9]} c="#56331c" sombra={false} />
      {[...Array(26)].map((_, i) => <mesh key={i} position={[(azar(i + 40) - 0.5) * 8.4, -0.15 - azar(i + 50) * 1.8, 0.0]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.04 + 0.07 * azar(i + 60), 10, 8]} /><meshLambertMaterial color={i % 2 ? "#9a8f82" : "#70675c"} /></mesh>)}
      {[...Array(60)].map((_, i) => <mesh key={i} position={[(azar(i + 90) - 0.5) * 8.6, 0.05, -0.02 - azar(i + 91) * 0.2]} rotation={[0, 0, (azar(i + 92) - 0.5) * 0.5]}><coneGeometry args={[0.025, 0.14 + 0.1 * azar(i + 93), 5]} /><meshLambertMaterial color={i % 3 ? "#3fa637" : "#74d95f"} /></mesh>)}
      {/* jardín: arbustos, flores y un árbol */}
      {[[-2.6, -2.2, 0.55], [2.9, -3.4, 0.7], [-3.4, -4.6, 0.6], [2.2, -1.3, 0.4]].map(([x, z, r], i) => <mesh key={i} position={[x, r * 0.7, z]} scale={[1, 0.8, 1]} castShadow><sphereGeometry args={[r, 18, 14]} /><meshLambertMaterial color={i % 2 ? "#2f9a4a" : "#43b85c"} /></mesh>)}
      {[...Array(22)].map((_, i) => { const x = (azar(i + 120) - 0.5) * 7.6, z = -0.5 - azar(i + 121) * 5; return Math.abs(x) < 0.5 ? null : <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[0.012, 0.012, 0.22, 6]} /><meshLambertMaterial color="#2e8a36" /></mesh>
        <mesh position={[0, 0.24, 0]} castShadow><sphereGeometry args={[0.06, 10, 8]} /><meshLambertMaterial color={["#ff4f7b", "#ffd23f", "#ff8a2a", "#c56bff", "#ffffff"][i % 5]} /></mesh>
      </group>; })}
      <group position={[-3.0, 0, -6.2]}><mesh position={[0, 1.0, 0]} castShadow><cylinderGeometry args={[0.16, 0.22, 2.0, 10]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        {[[0, 2.5, 0, 1.1], [-0.7, 2.1, 0.2, 0.75], [0.7, 2.2, -0.1, 0.8]].map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]} castShadow><sphereGeometry args={[r, 16, 12]} /><meshLambertMaterial color={i ? "#3aa84f" : "#2f9a4a"} /></mesh>)}</group>
      {/* el hoyo malo (taza) y, en el arreglo, el bueno */}
      {!arreglo && !compara && <Hoyo x={0} t={t} tipo="taza" concreto={concretoMalo} grava={0} poste={posteMalo} agua={agua} podrido={podrido} domo={0} tocon={caida > 0.02} />}
      {!arreglo && !compara && posteMalo >= 1 && <group position={[0, 0, 0]}>
        <group rotation={[0, 0, caida * 1.45]}>{caida > 0.02 && <Caja p={[0, 0.82, -POSTE.lado / 2 + 0.012]} s={[POSTE.lado, 1.36, POSTE.lado]} c="#c98a4b" />}</group>
        <Cerca caida={caida} escala={cercaEsc} />
      </group>}
      {(arreglo || compara) && <Hoyo x={0} t={t} tipo="bien" concreto={arreglo ? collar : 1} grava={arreglo ? grava : 1} poste={posteBien} agua={0} podrido={0} domo={arreglo ? domo : 1}
        drena={arreglo && t > 28.8 && t < 30.4 ? 1 : 0} fuera={arreglo && t > 35.3 ? 1 : 0} />}
      {(arreglo || compara) && <Cerca caida={0} escala={arreglo ? cercaEsc : 1} />}
      {compara && <Hoyo x={-1.35} t={t} tipo="taza" concreto={1} grava={0} poste={1} agua={1} podrido={1} domo={0} tocon />}
      {/* señales rojas: debajo del poste y al ras del suelo; contorno naranja de la taza */}
      {t > 8.8 && t < 10.2 && <mesh position={[0, (POSTE.pie + HOYO.fondo) / 2, 0.03]}><planeGeometry args={[HOYO.ancho - 0.04, POSTE.pie - HOYO.fondo - 0.02]} /><meshBasicMaterial color="#ff2a2a" transparent opacity={0.35 + 0.3 * Math.sin(t * 12)} /></mesh>}
      {t > 12.9 && t < 14.7 && [[-HOYO.ancho / 2, -0.45, 0.03, 0.9], [HOYO.ancho / 2, -0.45, 0.03, 0.9], [0, HOYO.fondo, HOYO.ancho + 0.03, 0.03]].map(([x, y, w, h], i) => <mesh key={i} position={[x, y, 0.04]}><planeGeometry args={[w, h]} /><meshBasicMaterial color="#ff7a1a" transparent opacity={0.6 + 0.4 * Math.sin(t * 10)} /></mesh>)}
      {t > 17.2 && t < 21.2 && <group position={[0, 0, 0.05]}>
        <mesh rotation={[0, 0, 0]}><ringGeometry args={[0.17 + 0.02 * Math.sin(t * 8), 0.2 + 0.02 * Math.sin(t * 8), 40]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
        <group position={[0.44 - 0.04 * Math.abs(Math.sin(t * 5)), 0.2, 0]} rotation={[0, 0, 2.03]}>
          <mesh position={[0, 0.16, 0]}><planeGeometry args={[0.05, 0.3]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
          <mesh position={[0, -0.03, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.09, 0.14, 3]} /><meshBasicMaterial color="#ff2a2a" /></mesh>
        </group>
      </group>}
      {arreglo && t > 32.5 && t < 33.8 && <mesh position={[0, HOYO.fondo + GRAVA / 2, 0.04]}><planeGeometry args={[POSTE.lado + 0.06, GRAVA - 0.02]} /><meshBasicMaterial color="#27c24c" transparent opacity={0.3 + 0.3 * Math.sin(t * 12)} /></mesh>}
      {/* lluvia */}
      {lluvia && [...Array(140)].map((_, i) => { const u = (t * (1.6 + azar(i)) + azar(i + 200)) % 1; return <mesh key={i} position={[(azar(i + 210) - 0.5) * 5, lerp(3.2, 0.0, u), 0.6 - azar(i + 220) * 3.2]} scale={[1, 5, 1]}><sphereGeometry args={[0.008, 6, 4]} /><meshBasicMaterial color="#bfe3ff" /></mesh>; })}
      {lluvia && t < 21.3 && [...Array(6)].map((_, i) => { const u = (t * 0.8 + i / 6) % 1; return <mesh key={i} position={[(i % 3 - 1) * 0.035, lerp(1.45, 0.02, u), 0.014]} scale={[1, 3, 1]}><sphereGeometry args={[0.012, 8, 6]} /><meshBasicMaterial color="#2f9bff" /></mesh>; })}
      {/* Norm */}
      <Norm p={[normX, 0, -0.55]} t={t} giro={anios ? -1.2 : -0.55} gorro={gorroVuela} grieta={(anios && t > 24.7) || arreglo || compara} inclina={anios ? 0.18 * empuja : 0}
        brazo={obra && t > 10.2 && t < 12.1 ? pr(t, 10.3, 10.8) : anios ? empuja * 0.6 : compara ? pr(t, 40.4, 40.9) : 0}
        salto={gancho ? 0.12 * Math.abs(Math.sin(cl((t - 1.0) / 0.6) * Math.PI)) : t > 24.6 && t < 25.2 ? 0.1 * Math.abs(Math.sin((t - 24.6) * 9)) : 0} />
    </group>
  );
};

// ---------------------------------------------------------------- rótulos (pocos y sencillos: sin subtítulos)
const F = "DejaVu Sans, Arial, sans-serif";
const pcam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80), v = new THREE.Vector3();
const pantalla = (t: number, p: V3): [number, number] => { const c = camEn(t); pcam.position.set(...c.pos); pcam.lookAt(...c.look); pcam.updateMatrixWorld(); v.set(...p).project(pcam); return [(v.x + 1) * 540, (1 - v.y) * 960]; };
const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const titulo = Math.min(pr(t, 0.15, 0.5), 1 - pr(t, 3.9, 4.4));
  const [gx0, gy0] = pantalla(t, [0.36, HOYO.fondo, 0.05]), [, gy1] = pantalla(t, [0.36, HOYO.fondo + GRAVA, 0.05]);
  const seis = Math.min(pr(t, 27.6, 28.0), 1 - pr(t, 30.0, 30.4));
  const [mx, my] = pantalla(t, [-1.35, 0.75, 0]), [bx, by] = pantalla(t, [0.0, 1.95, -0.2]);
  const sello = pr(t, 40.15, 40.4);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} fontFamily={F} fontWeight={800} textAnchor="middle">
      {titulo > 0 && <g opacity={titulo} transform={`translate(540 ${250 - 20 * (1 - titulo)})`} stroke="#14321f" strokeLinejoin="round" paintOrder="stroke">
        <text fontSize={98} fill="#fff" strokeWidth={20}>YOUR FENCE POST</text>
        <text y={128} fontSize={132} fill="#ff7a1a" strokeWidth={24}>WILL ROT</text>
      </g>}
      {seis > 0 && <g opacity={seis} stroke="#14321f" strokeWidth={8} strokeLinecap="round">
        <line x1={gx0} y1={gy0} x2={gx0} y2={gy1} /><line x1={gx0 - 22} y1={gy0} x2={gx0 + 22} y2={gy0} /><line x1={gx0 - 22} y1={gy1} x2={gx0 + 22} y2={gy1} />
        <text x={gx0 + 150} y={(gy0 + gy1) / 2 + 30} fontSize={88} fill="#fff" strokeWidth={16} strokeLinejoin="round" paintOrder="stroke">6 in</text>
      </g>}
      {t > 37.3 && <g opacity={pr(t, 37.3, 37.7)}>
        <g transform={`translate(${mx} ${my})`} stroke="#ff2a2a" strokeWidth={26} strokeLinecap="round"><path d="M-58 -58 L58 58 M58 -58 L-58 58" /></g>
      </g>}
      {sello > 0 && <g transform={`translate(${Math.min(740, Math.max(300, bx))} ${Math.max(330, by - 60)}) rotate(-8) scale(${lerp(2.2, 1, sello)})`} opacity={sello}>
        <rect x={-250} y={-74} width={500} height={148} rx={22} fill="#27c24c" stroke="#fff" strokeWidth={10} />
        <text y={24} fontSize={62} fill="#fff">UP TO NORM</text>
      </g>}
    </svg>
  );
};

export const FencePost: React.FC = () => {
  const f = useCurrentFrame(), t = f / FENCE_FPS;
  const anioU = t >= 21.2 && t < 23.2 ? (t - 21.2) / 2 : 0;
  const cielo = useMemo(() => ["#55b8ff", "#ffb35a", "#b9c7d6", "#55b8ff"], []);
  const c1 = anioU > 0 ? mezcla("#55b8ff", cielo[Math.min(3, 1 + Math.floor(anioU * 3))], Math.sin(Math.PI * ((anioU * 3) % 1))).getStyle() : "#55b8ff";
  const destello = Math.max(1 - pr(t, 25.3, 25.7), 0) * (t >= 25.3 ? 1 : 0) + (t > 25.1 && t < 25.3 ? pr(t, 25.1, 25.3) : 0);
  const negro = Math.max(1 - pr(t, 0, 0.3), pr(t, FENCE_SEG - 0.6, FENCE_SEG));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${c1} 0%, #bfeaff 62%, #e9fbff 100%)` }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: FOV, near: 0.1, far: 80 }} gl={{ antialias: true }}>
        <Mundo t={t} />
      </ThreeCanvas>
      <Rotulos t={t} />
      {destello > 0 && <AbsoluteFill style={{ background: "#fff", opacity: destello }} />}
      {negro > 0 && <AbsoluteFill style={{ background: "#fff", opacity: negro }} />}
    </AbsoluteFill>
  );
};
