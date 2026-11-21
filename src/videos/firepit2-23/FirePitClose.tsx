// «Your fire pit is too close to your house» — capítulo 23 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// La fogata junto a la pared de madera y bajo una rama: las chispas suben y el revestimiento se pone naranja. Arreglo:
// al menos 10 pies de la casa y de lo que arde, nada de ramas encima ni porche techado, y manguera o extintor a mano.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, azar, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, TramoVivo, V3, hacerCamaraViva, golpesDe, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const FC_FPS = 30, FC_SEG = duracion(tiempos), FC_CUADROS = Math.round(FC_FPS * FC_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["fire", "pit", "close", "house", "door", "cozy", "snacks", "sparks", "drift", "siding", "deck", "branch", "catch", "tree", "heat", "leaves", "far", "ten", "feet", "burns", "twenty", "five", "rules", "branches", "porch", "hose", "extinguisher", "alone", "steps", "team", "follow", "like"];
const XW = -1.5, CERCA = -0.95, LEJOS = 1.55; // pared de la casa, fogata cerca y lejos (≈ 10 ft = 2.5 unidades)
const XN = 0.4, XF = -0.35;

const C = {
  gancho: { pos: [-0.6, 0.9, 2.9], look: [-1.1, 0.6, -0.3] } as Cam, gancho2: { pos: [-0.8, 0.6, 2.2], look: [-1.15, 0.45, -0.3] } as Cam,
  dos: { pos: [0.0, 1.3, 6.4], look: [0.0, 0.8, 0] } as Cam, dos2: { pos: [0.0, 1.2, 5.8], look: [0.0, 0.75, 0] } as Cam,
  flo: { pos: [XF, 0.9, 2.8], look: [XF, 0.72, 0] } as Cam, flo2: { pos: [XF, 0.88, 2.35], look: [XF, 0.72, 0] } as Cam,
  chispas: { pos: [-0.6, 1.1, 2.6], look: [-1.2, 1.0, -0.4] } as Cam, chispas2: { pos: [-0.75, 1.3, 2.1], look: [-1.25, 1.2, -0.4] } as Cam,
  rama: { pos: [-0.4, 0.6, 2.4], look: [-0.9, 1.6, -0.5] } as Cam, rama2: { pos: [-0.55, 0.5, 2.0], look: [-0.95, 1.7, -0.5] } as Cam,
  norm: { pos: [XN, 0.55, 3.0], look: [XN, 0.42, 0] } as Cam, norm2: { pos: [XN, 0.52, 2.55], look: [XN, 0.4, 0] } as Cam,
  distancia: { pos: [0.1, 1.6, 5.6], look: [0.1, 0.3, -0.3] } as Cam, distancia2: { pos: [0.1, 1.4, 5.0], look: [0.1, 0.3, -0.3] } as Cam,
  lejos: { pos: [LEJOS + 0.4, 0.8, 2.6], look: [LEJOS, 0.35, -0.3] } as Cam, lejos2: { pos: [LEJOS + 0.2, 0.7, 2.2], look: [LEJOS, 0.35, -0.3] } as Cam,
  equipo: { pos: [0.1, 1.4, 5.0], look: [0.1, 1.65, 0] } as Cam, fin: { pos: [0.1, 1.4, 6.2], look: [0.1, 1.85, 0] } as Cam,
};
const TRAMOS: TramoVivo[] = [
  [0, T[1], C.gancho, C.gancho2, { ease: "expo", dolly: 0.3, roll: 0.07 }], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2, { orbita: 0.25 }],
  [T[3], T[4], C.chispas, C.chispas2, { orbita: -0.25 }], [T[4], T[5], C.rama, C.rama2, { ease: "expo", roll: -0.05 }], [T[5], T[6], C.flo2, C.flo, { orbita: -0.25 }],
  [T[6], T[7], C.distancia, C.distancia2, { ease: "expo" }], [T[7], T[8], C.norm, C.norm2, { orbita: 0.25 }], [T[8], T[9], C.lejos, C.lejos2, { orbita: -0.25 }], [T[9], T[10], C.flo, C.flo2, { orbita: 0.2 }],
  [T[10], T[11], C.norm2, C.norm, { orbita: -0.2 }], [T[11], T[12], C.flo2, C.flo, { roll: 0.05 }], [T[12], T[13], C.equipo, C.equipo, { orbita: 0.2 }], [T[13], 99, C.fin, C.fin, { orbita: 0.15 }],
];
const { camEn, pantalla, desenfoque } = hacerCamaraViva(TRAMOS, { sacude: (t) => (t < 0.45 ? 0.03 : 0), golpes: golpesDe(PAL, ["close", "sparks", "catch", "leaves", "ten", "twenty", "porch", "alone"]) });

const Fuego: React.FC<{ t: number; p: V3 }> = ({ t, p }) => (
  <group position={p}>
    {[...Array(10)].map((_, i) => { const a = (i / 10) * Math.PI * 2; return <mesh key={i} position={[0.3 * Math.cos(a), 0.06, 0.3 * Math.sin(a)]} scale={[1.2, 0.8, 1]}><sphereGeometry args={[0.08, 10, 8]} /><meshLambertMaterial color={["#8d9aa6", "#a7a39a"][i % 2]} /></mesh>; })}
    {[...Array(6)].map((_, i) => { const fl = 0.75 + 0.25 * Math.sin(t * 13 + i * 2.1); return <mesh key={i} position={[(azar(i) - 0.5) * 0.2, 0.15 * fl, (azar(i + 1) - 0.5) * 0.15]} scale={[1, fl, 1]}><coneGeometry args={[0.07, 0.34, 8]} /><meshBasicMaterial color={["#ffd23f", "#ff8a1a", "#ff4a1a"][i % 3]} /></mesh>; })}
    <pointLight position={[0, 0.4, 0.1]} color="#ff9a3a" intensity={1.6} distance={2.5} />
  </group>
);

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const bien = t >= T[6] + 0.3;
  const px = bien ? lerp(CERCA, LEJOS, pr(t, T[6] + 0.3, T[6] + 1.5)) : CERCA;
  const brasa = !bien && (t < T[1] || (t >= T[3] && t < T[6])) ? (t < T[1] ? pr(t, 0.3, 1.5) : pr(t, T[3] + 0.6, T[4] + 0.5)) : 0;
  const hojas = !bien && t >= T[4] ? pr(t, T[4] + 0.3, T[5]) : 0;
  const regla = t >= T[6] + 1.5 && t < T[9] ? pr(t, T[6] + 1.5, T[6] + 2.0) : 0;
  const manguera = t >= T[10] ? pr(t, T[10] + 0.2, T[10] + 0.8) : 0;
  const fH = habla(t, 1), nH = habla(t, 0);
  const nBrazo = (t >= T[3] && t < T[5]) || (t >= T[6] && t < T[9]) || (t >= T[10] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} />
      {/* la casa: revestimiento de madera, puerta, ventana y techo */}
      <Caja p={[XW - 0.9, 1.25, -0.7]} s={[1.8, 2.5, 1.6]} c={brasa > 0 ? `rgb(${Math.round(lerp(217, 255, brasa))}, ${Math.round(lerp(196, 140, brasa))}, ${Math.round(lerp(150, 60, brasa))})` : "#d9c496"} />
      {[...Array(12)].map((_, i) => <Caja key={i} p={[XW + 0.003, 0.1 + i * 0.2, -0.7]} s={[0.006, 0.012, 1.6]} c="#a8925e" sombra={false} recibe={false} />)}
      <Caja p={[XW + 0.008, 0.6, -0.15]} s={[0.012, 1.15, 0.55]} c="#7a4a26" />
      <Caja p={[XW + 0.008, 1.55, -1.05]} s={[0.012, 0.5, 0.5]} c="#9fd8ff" />
      <Caja p={[XW - 0.9, 2.55, -0.7]} s={[2.0, 0.12, 1.8]} c="#7a4a3a" />
      {/* árbol con una rama encima de la fogata cercana */}
      <group position={[-0.65, 0, -1.2]}>
        <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.1, 0.14, 2.2, 10]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        <mesh position={[-0.2, 1.75, 0.6]} rotation={[0.9, 0, 0.3]}><cylinderGeometry args={[0.04, 0.06, 1.3, 8]} /><meshLambertMaterial color="#7a4a26" /></mesh>
        {[[0, 2.4, 0, 0.6], [-0.3, 1.95, 0.95, 0.45], [0.4, 2.2, 0.3, 0.45]].map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]}><sphereGeometry args={[r, 16, 12]} /><meshLambertMaterial color={hojas > 0.5 && i === 1 ? "#c9802a" : i ? "#3aa84f" : "#2f9a4a"} /></mesh>)}
      </group>
      <Fuego t={t} p={[px, 0, -0.25]} />
      {/* chispas que suben y se van hacia la pared y la rama */}
      {[...Array(22)].map((_, i) => { const u = (t * 0.55 + azar(i)) % 1; const hacia = bien ? 0.2 : -0.45; return <mesh key={i} position={[px + (azar(i + 3) - 0.5) * 0.3 + hacia * u, 0.3 + 1.6 * u, -0.25 + (azar(i + 4) - 0.5) * 0.3]}><sphereGeometry args={[0.012, 6, 5]} /><meshBasicMaterial color={u < 0.5 ? "#ffd23f" : "#ff6a1a"} transparent opacity={1 - u} /></mesh>; })}
      {/* cinta de distancia de 10 pies */}
      {regla > 0 && <group>
        <mesh position={[(XW + LEJOS) / 2, 0.04, 0.35]} rotation={[0, 0, Math.PI / 2]} scale={[1, regla, 1]}><cylinderGeometry args={[0.012, 0.012, LEJOS - XW, 6]} /><meshBasicMaterial color="#ffd23f" /></mesh>
        {[...Array(10)].map((_, i) => <Caja key={i} p={[XW + (i + 1) * (LEJOS - XW) / 10, 0.05, 0.35]} s={[0.01, 0.05 * regla, 0.04]} c="#14321f" sombra={false} />)}
      </group>}
      {/* manguera y extintor */}
      {manguera > 0 && <group scale={manguera}>
        <group position={[XN + 0.45, 0, 0.3]}><mesh position={[0, 0.17, 0]}><cylinderGeometry args={[0.07, 0.07, 0.34, 14]} /><meshLambertMaterial color="#e8283a" /></mesh><mesh position={[0, 0.37, 0]}><cylinderGeometry args={[0.025, 0.035, 0.06, 8]} /><meshLambertMaterial color="#222" /></mesh></group>
        <mesh position={[XN + 0.85, 0.05, 0.25]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.15, 0.025, 8, 24]} /><meshLambertMaterial color="#27c24c" /></mesh>
      </group>}
      {(t >= T[5] && t < T[6]) || (t >= T[9] && t < T[10]) ? <Preguntas t={t} a={t >= T[9] ? T[9] : T[5]} p={[XF + 0.1, 1.2, 0.5]} /> : null}
      <Flo p={[XF, 0, 0.45]} t={t} habla={fH} giro={0.3} ala={t < T[1] ? 1 : t >= T[11] && t < T[12] ? 0.5 : fH * 0.7} />
      <Norm p={[XN, nSalto, 0.5]} t={t} giro={-0.4} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [mx, my] = pantalla(t, [(XW + LEJOS) / 2, 0.05, 0.35]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR FIRE PIT IS" abajo="TOO CLOSE" color="#ff4a1a" tamAbajo={130} />
      <Grande s="IT'S COZY!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={130} />
      <Grande s="SPARKS DRIFT" o={v(T[3] + 0.3, T[4])} col="#ff6a1a" borde="#fff" tam={120} />
      <Grande s="HEAT RISES INTO THE TREE" o={v(T[4] + 0.3, T[5])} col="#ff6a1a" borde="#fff" tam={78} />
      <Grande s="HOW FAR?" o={v(T[5] + 0.05, T[6])} col="#ff4f9a" borde="#fff" tam={140} />
      <Grande s="AT LEAST 10 FEET" o={v(T[6] + 0.3, T[7])} col="#27c24c" borde="#fff" tam={110} />
      <Etiqueta s="10 FT" x={mx} y={my - 70} o={v(T[6] + 1.8, T[9])} col="#ffd23f" borde="#14321f" tam={80} />
      <Grande s="SOME TOWNS: 25 FT" o={v(T[7] + 0.3, T[8])} col="#fff" borde="#14321f" tam={96} />
      <Grande s="NO BRANCHES · NO PORCH ROOF" o={v(T[8] + 0.3, T[9])} col="#27c24c" borde="#fff" tam={70} />
      <Grande s="OUT OF HAND?" o={v(T[9] + 0.05, T[10])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="HOSE + EXTINGUISHER" o={v(T[10] + 0.3, T[11])} col="#27c24c" borde="#fff" tam={90} />
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="COZY" der="10 FEET" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR GUTTERS OVERFLOW" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const FirePitCloseVideo: React.FC = () => {
  const t = useCurrentFrame() / FC_FPS;
  return <Marco t={t} seg={FC_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} blur={desenfoque(t)} />;
};
