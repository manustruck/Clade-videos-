// «Your patio is pouring rain into your house» — capítulo 20 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// Corte de la casa con sótano y un patio junto a la pared: plano, la lluvia se junta y corre hacia la pared y entra al
// sótano; con pendiente de ~1/4 de pulgada por pie hacia afuera, el agua se va. Usa la cámara viva.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, azar, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, TramoVivo, hacerCamaraViva, golpesDe, PonerCamara, Patio as Fondo, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const PAT_FPS = 30, PAT_SEG = duracion(tiempos), PAT_CUADROS = Math.round(PAT_FPS * PAT_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["patio", "pouring", "rain", "house", "flat", "level", "nowhere", "wall", "puddles", "door", "foundation", "wet", "basement", "crooked", "sloped", "away", "quarter", "inch", "foot", "ten", "two", "half", "four", "lower", "chairs", "slide", "feel", "tilt", "team", "follow", "like"];
const XW = -1.35, X1 = 1.25, ALTO = 0.1; // pared de la casa, borde del patio, alto del patio junto a la casa
const XN = 1.6, XF = 0.35;

const C = {
  gancho: { pos: [-0.2, 0.9, 3.8], look: [-0.9, -0.05, 0] } as Cam, gancho2: { pos: [-0.5, 0.55, 3.0], look: [-1.0, -0.25, 0] } as Cam,
  dos: { pos: [0.1, 1.1, 5.8], look: [0.1, 0.55, 0] } as Cam, dos2: { pos: [0.1, 1.0, 5.2], look: [0.1, 0.5, 0] } as Cam,
  flo: { pos: [XF, 1.0, 2.8], look: [XF, 0.8, 0] } as Cam, flo2: { pos: [XF, 0.98, 2.35], look: [XF, 0.8, 0] } as Cam,
  patio: { pos: [0.0, 0.55, 3.3], look: [-0.1, 0.05, 0] } as Cam, patio2: { pos: [-0.3, 0.45, 2.7], look: [-0.5, 0.0, 0] } as Cam,
  sotano: { pos: [-1.0, -0.3, 2.4], look: [-1.25, -0.55, 0] } as Cam, sotano2: { pos: [-1.0, -0.4, 1.9], look: [-1.3, -0.6, 0] } as Cam,
  norm: { pos: [XN - 0.1, 0.6, 3.0], look: [XN - 0.1, 0.48, 0] } as Cam, norm2: { pos: [XN - 0.1, 0.56, 2.55], look: [XN - 0.1, 0.45, 0] } as Cam,
  nivel: { pos: [0.0, 0.35, 1.9], look: [0.0, 0.12, 0] } as Cam, nivel2: { pos: [0.0, 0.3, 1.55], look: [0.0, 0.1, 0] } as Cam,
  equipo: { pos: [0.1, 1.3, 5.0], look: [0.1, 1.55, 0] } as Cam, fin: { pos: [0.1, 1.3, 6.2], look: [0.1, 1.75, 0] } as Cam,
};
const TRAMOS: TramoVivo[] = [
  [0, T[1], C.gancho, C.gancho2, { ease: "expo", dolly: 0.3, roll: 0.06 }], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2, { orbita: 0.25 }],
  [T[3], T[4], C.patio, C.patio2, { orbita: -0.2 }], [T[4], T[5], C.sotano, C.sotano2, { ease: "expo", roll: -0.05 }], [T[5], T[6], C.flo2, C.flo, { orbita: -0.25 }],
  [T[6], T[7], C.norm, C.norm2, { ease: "expo" }], [T[7], T[8], C.patio2, C.patio, { orbita: 0.2 }], [T[8], T[9], C.nivel, C.nivel2], [T[9], T[10], C.flo, C.flo2, { orbita: 0.2 }],
  [T[10], T[11], C.dos2, C.dos, { orbita: -0.2 }], [T[11], T[12], C.flo2, C.flo, { roll: 0.05 }], [T[12], T[13], C.equipo, C.equipo, { orbita: 0.2 }], [T[13], 99, C.fin, C.fin, { orbita: 0.15 }],
];
const { camEn, pantalla, desenfoque } = hacerCamaraViva(TRAMOS, { sacude: (t) => (t < 0.45 ? 0.035 : 0), golpes: golpesDe(PAL, ["house", "flat", "basement", "sloped", "quarter", "inch", "feel"]) });

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const bien = t >= T[6] + 0.4;
  const inc = bien ? pr(t, T[6] + 0.4, T[6] + 1.2) : 0;                 // 0 = plano, 1 = con pendiente
  const caida = 0.09 * inc, ang = Math.atan2(caida, X1 - XW);
  const lluvia = t < T[5] || (t >= T[7] && t < T[11]);
  const charco = !bien ? (t < T[1] ? pr(t, 0, 1.4) : t >= T[3] ? pr(t, T[3] + 0.3, T[3] + 2.0) : 0.3) : 0;
  const filtra = !bien && (t < T[1] || t >= T[4]) ? (t < T[1] ? pr(t, 0.4, 1.8) : pr(t, T[4] + 0.2, T[4] + 2.5)) : 0;
  const nivel = t >= T[8] ? pr(t, T[8] + 0.2, T[8] + 0.8) : 0;
  const yP = (x: number) => ALTO - caida * (x - XW) / (X1 - XW);
  const fH = habla(t, 1), nH = habla(t, 0);
  const nBrazo = (t >= T[3] && t < T[5]) || (t >= T[6] && t < T[9]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Fondo t={t} huecos={[[XW - 1.5, X1 + 0.05]]} />
      {/* la casa: pared, puerta, ventana, techo y el sótano bajo tierra (cortado en z = 0) */}
      <Caja p={[XW - 0.8, 1.15, -0.6]} s={[1.6, 2.3, 1.4]} c="#f2e3c6" />
      <Caja p={[XW + 0.005, 0.65, -0.3]} s={[0.02, 1.1, 0.5]} c="#7a4a26" />
      <Caja p={[XW + 0.005, 1.55, -0.9]} s={[0.02, 0.45, 0.5]} c="#9fd8ff" />
      <Caja p={[XW - 0.8, 2.35, -0.6]} s={[1.8, 0.1, 1.6]} c="#7a4a3a" />
      <Caja p={[XW - 0.8, -0.6, 0.004]} s={[1.6, 1.1, 0.01]} c="#cfc8bc" sombra={false} />
      <Caja p={[XW - 0.8, -0.6, 0.006]} s={[1.4, 0.95, 0.01]} c="#e9e3d6" sombra={false} />
      <Caja p={[XW, -0.6, 0.008]} s={[0.1, 1.15, 0.012]} c="#9a958c" sombra={false} />
      {filtra > 0 && <group>
        <mesh position={[XW - 0.25, -0.35 - 0.3 * filtra, 0.012]}><circleGeometry args={[0.12 + 0.15 * filtra, 20]} /><meshBasicMaterial color="#5a7fa8" transparent opacity={0.55} /></mesh>
        <Caja p={[XW - 0.7, -1.12, 0.012]} s={[1.0 * filtra, 0.04, 0.004]} c="#3d8cff" sombra={false} recibe={false} />
        {[...Array(5)].map((_, i) => { const u = ((t * 1.2 + i / 5) % 1); return <mesh key={i} position={[XW - 0.06, -0.15 - 0.9 * u, 0.02]}><sphereGeometry args={[0.018, 8, 6]} /><meshBasicMaterial color="#3d8cff" /></mesh>; })}
      </group>}
      {/* el patio: base de grava y adoquines (inclinado si está bien) */}
      <group position={[XW, ALTO, 0]} rotation={[0, 0, -ang]}>
        <Caja p={[(X1 - XW) / 2, -0.08, -0.6]} s={[X1 - XW, 0.12, 1.3]} c="#a7a196" />
        <Caja p={[(X1 - XW) / 2, -0.01, -0.6]} s={[X1 - XW, 0.04, 1.3]} c="#c77a5a" />
        {[...Array(13)].map((_, i) => <Caja key={i} p={[0.1 + i * 0.2, 0.012, -0.6]} s={[0.006, 0.004, 1.3]} c="#8a4a3a" sombra={false} recibe={false} />)}
      </group>
      {/* sillas de Flo */}
      <group position={[0.6, yP(0.6) + 0.02, -0.75]} rotation={[0, 0, -ang]}>
        <Caja p={[0, 0.22, 0]} s={[0.36, 0.04, 0.36]} c="#ffd23f" /><Caja p={[0, 0.42, -0.17]} s={[0.36, 0.4, 0.04]} c="#ffd23f" />
        {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z]) => <Caja key={`${x}${z}`} p={[x, 0.1, z]} s={[0.03, 0.22, 0.03]} c="#d9a520" />)}
      </group>
      {/* charco junto a la pared o agua que se escurre hacia afuera */}
      {charco > 0 && <mesh position={[XW + 0.55, yP(XW + 0.55) + 0.006, -0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[charco * 1.1, charco * 0.7, 1]}><circleGeometry args={[0.5, 28]} /><meshBasicMaterial color="#5aa8ff" transparent opacity={0.8} /></mesh>}
      {!bien && t >= T[3] && [...Array(10)].map((_, i) => { const u = ((t * 0.5 + azar(i)) % 1); return <mesh key={i} position={[lerp(0.6, XW + 0.05, u), ALTO + 0.02, 0.05 + azar(i + 2) * 0.1]}><sphereGeometry args={[0.025, 8, 6]} /><meshBasicMaterial color="#3d8cff" /></mesh>; })}
      {bien && [...Array(14)].map((_, i) => { const u = ((t * 0.6 + azar(i)) % 1), x = lerp(XW + 0.2, X1 + 0.25, u); return <mesh key={i} position={[x, (x < X1 ? yP(x) + 0.02 : yP(X1) - (x - X1) * 1.5), 0.05 + azar(i + 2) * 0.1]}><sphereGeometry args={[0.025, 8, 6]} /><meshBasicMaterial color="#3d8cff" /></mesh>; })}
      {lluvia && [...Array(46)].map((_, i) => { const u = (t * 1.6 + azar(i)) % 1; return <mesh key={i} position={[(azar(i + 2) - 0.5) * 4.4, 2.6 - 2.5 * u, -0.6 + azar(i + 6) * 1.2]}><cylinderGeometry args={[0.005, 0.005, 0.12, 4]} /><meshBasicMaterial color="#4fb3ff" /></mesh>; })}
      {/* nivel de 4 pies con la burbuja */}
      {nivel > 0 && <group position={[0.0, yP(0.0) + 0.05, 0.12]} rotation={[0, 0, -ang]} scale={nivel}>
        <Caja p={[0, 0, 0]} s={[1.0, 0.06, 0.06]} c="#ffd23f" />
        <mesh position={[-0.02 * inc, 0.0, 0.035]}><sphereGeometry args={[0.018, 10, 8]} /><meshBasicMaterial color="#7dff4f" /></mesh>
      </group>}
      {(t >= T[5] && t < T[6]) || (t >= T[9] && t < T[10]) ? <Preguntas t={t} a={t >= T[9] ? T[9] : T[5]} p={[XF + 0.1, 1.25, 0.5]} /> : null}
      <Flo p={[XF, yP(XF), 0.45]} t={t} habla={fH} giro={-0.3} ala={t < T[1] ? 1 : t >= T[11] && t < T[12] ? 0.5 : fH * 0.7} />
      <Norm p={[XN, nSalto, 0.5]} t={t} giro={-0.5} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [wx, wy] = pantalla(t, [XW - 0.3, -0.5, 0.05]);
  const [nx, ny] = pantalla(t, [0.5, 0.15, 0.12]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR PATIO FLOODS" abajo="YOUR HOUSE" color="#2f8bff" tamAbajo={120} />
      <Grande s="PERFECTLY FLAT!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={110} />
      <Grande s="WATER HAS NOWHERE TO GO" o={v(T[3] + 0.3, T[4])} col="#fff" borde="#14321f" tam={80} />
      <Grande s="WET BASEMENT" o={v(T[4] + 0.6, T[5])} col="#2f8bff" borde="#fff" tam={120} />
      <Etiqueta s="FOUNDATION" x={wx} y={wy - 160} o={v(T[4] + 0.9, T[5])} col="#ffd23f" borde="#14321f" tam={58} />
      <Grande s="CROOKED?!" o={v(T[5] + 0.05, T[6])} col="#ff4f9a" borde="#fff" tam={130} />
      <Grande s="SLOPED AWAY ✓" o={v(T[6] + 0.3, T[7])} col="#27c24c" borde="#fff" tam={110} />
      <Grande s="≈ 1/4 INCH PER FOOT" o={v(T[7] + 0.3, T[8])} col="#27c24c" borde="#fff" tam={96} />
      <Grande s="10 FT PATIO ≈ 2½ IN DROP" o={v(T[7] + 0.3, T[8])} col="#fff" borde="#14321f" tam={64} y={400} />
      <Grande s="4 FT LEVEL ≈ 1 INCH" o={v(T[8] + 0.4, T[9])} col="#27c24c" borde="#fff" tam={96} />
      <Etiqueta s="1 IN" x={nx + 140} y={ny} o={v(T[8] + 0.9, T[9])} col="#ffd23f" borde="#14321f" tam={64} />
      <Grande s="MY CHAIRS?!" o={v(T[9] + 0.05, T[10])} col="#ff4f9a" borde="#fff" tam={120} />
      <Grande s="YOU WON'T FEEL IT" o={v(T[10] + 0.3, T[11])} col="#27c24c" borde="#fff" tam={100} />
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="FLAT" der="SLOPED" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR NEW FENCE POST IS LEANING" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const PatioVideo: React.FC = () => {
  const t = useCurrentFrame() / PAT_FPS;
  return <Marco t={t} seg={PAT_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} blur={desenfoque(t)} />;
};
