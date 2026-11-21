// «Your gutters overflow and they're not clogged» — capítulo 24 del canal en inglés (vertical 1080x1920, 30 cps, three.js). Debate Flo vs Norm.
// Una canaleta perfectamente nivelada: el agua se queda, se llena y se derrama por el frente sobre las flores y junto a
// los cimientos. Arreglo: pendiente hacia la bajante (~1/4 de pulgada cada 10 pies), cordel y, si hace falta, más bajantes.
import React from "react";
import { useCurrentFrame } from "remotion";
import { pr, lerp, azar, rebote, Caja, Norm } from "../fence-01/Fence";
import { Flo } from "../comun/Flo";
import { Palabra } from "../comun/Subtitulos";
import { PideSeguir } from "../comun/PideSeguir";
import { Sello, Equipos, CierreFollow } from "../comun/Tarjetas";
import { Cam, TramoVivo, hacerCamaraViva, golpesDe, PonerCamara, Patio, Preguntas, ventana, Grande, Etiqueta, Titulo, Marco, hablaDe, duracion } from "../comun/Escena";
import tiempos from "./tiempos.json";

export const GP_FPS = 30, GP_SEG = duracion(tiempos), GP_CUADROS = Math.round(GP_FPS * GP_SEG);
const T = tiempos.frases.map((f) => f.a);
const PAL = tiempos.palabras as Palabra[];
const habla = hablaDe(tiempos);
const CLAVES = ["gutters", "overflowing", "clogged", "straight", "level", "ruler", "sits", "fills", "spills", "front", "flower", "beds", "foundation", "tilt", "crooked", "quarter", "inch", "drop", "ten", "feet", "downspout", "string", "line", "brackets", "overflows", "downspouts", "thirty", "forty", "purpose", "sloped", "spout", "team", "follow", "like"];
const X0 = -1.35, X1 = 1.35, GY = 1.95, GZ = 0.12; // canaleta: de X0 a X1, altura y profundidad (sale de la pared z = 0)
const XN = -0.45, XF = 0.6;

const C = {
  gancho: { pos: [0.0, 1.5, 5.0], look: [0.0, 1.25, 0] } as Cam, gancho2: { pos: [0.0, 2.2, 3.2], look: [0.0, 1.7, 0] } as Cam,
  dos: { pos: [0.0, 1.3, 6.6], look: [0.0, 1.1, 0] } as Cam, dos2: { pos: [0.0, 1.25, 6.0], look: [0.0, 1.05, 0] } as Cam,
  flo: { pos: [XF, 0.9, 2.8], look: [XF, 0.72, 0] } as Cam, flo2: { pos: [XF, 0.88, 2.35], look: [XF, 0.72, 0] } as Cam,
  canal: { pos: [-0.2, 2.9, 1.1], look: [0.0, GY, 0] } as Cam, canal2: { pos: [0.1, 2.8, 0.9], look: [0.1, GY, 0] } as Cam,
  flores: { pos: [0.0, 0.5, 2.4], look: [0.0, 0.25, 0] } as Cam, flores2: { pos: [0.1, 0.4, 2.0], look: [0.1, 0.2, 0] } as Cam,
  norm: { pos: [XN, 0.55, 3.0], look: [XN, 0.42, 0] } as Cam, norm2: { pos: [XN, 0.52, 2.55], look: [XN, 0.4, 0] } as Cam,
  pendiente: { pos: [0.0, 2.8, 2.6], look: [0.0, 1.85, 0] } as Cam, pendiente2: { pos: [0.3, 2.7, 2.2], look: [0.4, 1.85, 0] } as Cam,
  bajante: { pos: [1.6, 1.4, 2.4], look: [1.3, 1.1, 0] } as Cam, bajante2: { pos: [1.5, 1.2, 2.0], look: [1.3, 0.9, 0] } as Cam,
  equipo: { pos: [0.0, 1.3, 5.0], look: [0.0, 1.55, 0] } as Cam, fin: { pos: [0.0, 1.3, 6.2], look: [0.0, 1.75, 0] } as Cam,
};
const TRAMOS: TramoVivo[] = [
  [0, T[1], C.gancho, C.gancho2, { ease: "expo", dolly: 0.3, roll: -0.06 }], [T[1], T[2], C.dos, C.dos2], [T[2], T[3], C.flo, C.flo2, { orbita: 0.25 }],
  [T[3], T[4], C.canal, C.canal2, { orbita: -0.25 }], [T[4], T[5], C.flores, C.flores2, { ease: "expo", roll: 0.05 }], [T[5], T[6], C.flo2, C.flo, { orbita: -0.25 }],
  [T[6], T[7], C.pendiente, C.pendiente2, { ease: "expo" }], [T[7], T[8], C.bajante, C.bajante2, { orbita: 0.25 }], [T[8], T[9], C.pendiente2, C.pendiente, { orbita: -0.2 }], [T[9], T[10], C.flo, C.flo2, { orbita: 0.2 }],
  [T[10], T[11], C.dos2, C.dos, { orbita: -0.2 }], [T[11], T[12], C.flo2, C.flo, { roll: 0.05 }], [T[12], T[13], C.equipo, C.equipo, { orbita: 0.2 }], [T[13], 99, C.fin, C.fin, { orbita: 0.15 }],
];
const { camEn, pantalla, desenfoque } = hacerCamaraViva(TRAMOS, { sacude: (t) => (t < 0.45 ? 0.03 : 0), golpes: golpesDe(PAL, ["overflowing", "level", "spills", "foundation", "quarter", "downspout", "string", "thirty"]) });

const Mundo: React.FC<{ t: number }> = ({ t }) => {
  const bien = t >= T[6] + 0.3;
  const inc = bien ? pr(t, T[6] + 0.3, T[6] + 1.2) : 0;
  const ang = 0.05 * inc; // pendiente exagerada para que se vea
  const nivel = bien ? 0.01 : t < T[1] ? 0.06 * pr(t, 0, 0.9) : t >= T[3] ? 0.06 * pr(t, T[3] + 0.2, T[3] + 1.5) : 0.03;
  const derrama = !bien && (t < T[1] ? t > 0.8 : t >= T[3] + 1.3);
  const lluvia = t < T[6] + 2.5 || (t >= T[7] && t < T[9]);
  const cordel = t >= T[8] ? pr(t, T[8] + 0.3, T[8] + 1.0) : 0;
  const otra = t >= T[10] ? rebote(pr(t, T[10] + 0.3, T[10] + 1.0)) : 0;
  const charco = !bien ? (t < T[1] ? pr(t, 0.9, 1.6) : t >= T[4] ? pr(t, T[4] + 0.2, T[4] + 1.5) : 0) : 1 - pr(t, T[6] + 0.3, T[6] + 2.0);
  const yG = (x: number) => GY - (x - X0) * Math.tan(ang);
  const fH = habla(t, 1), nH = habla(t, 0);
  const nBrazo = (t >= T[3] && t < T[5]) || (t >= T[6] && t < T[9]) || (t >= T[10] && t < T[11]) ? 1 : t >= T[13] ? 0.55 + 0.45 * Math.sin(t * 7) : nH ? 0.25 + 0.2 * Math.sin(t * 5) : 0;
  const nSalto = nH ? 0.025 * Math.abs(Math.sin(t * 9)) : 0;
  return (
    <group>
      <PonerCamara cam={camEn(t)} />
      <Patio t={t} huecos={[[X0 - 0.2, X1 + 0.2]]} />
      {/* frente de la casa, techo que asoma, puerta y ventanas */}
      <Caja p={[0, GY / 2 + 0.05, -0.6]} s={[X1 - X0 + 0.3, GY + 0.1, 1.2]} c="#f2e3c6" />
      <Caja p={[0, GY + 0.1, -0.35]} s={[X1 - X0 + 0.5, 0.06, 0.95]} c="#7a4a3a" />
      <Caja p={[-0.75, 0.6, 0.005]} s={[0.5, 1.1, 0.01]} c="#7a4a26" />
      {[0.2, 0.85].map((x) => <Caja key={x} p={[x, 1.25, 0.005]} s={[0.45, 0.45, 0.01]} c="#9fd8ff" />)}
      {/* cantero de flores contra los cimientos */}
      <Caja p={[0, 0.02, 0.25]} s={[X1 - X0, 0.04, 0.4]} c="#5a3a1f" />
      {[...Array(9)].map((_, i) => <group key={i} position={[X0 + 0.2 + i * 0.3, 0.04, 0.25]} rotation={[0, 0, charco > 0.5 ? 0.5 * Math.sin(i) : 0]}>
        <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.008, 0.008, 0.2, 5]} /><meshLambertMaterial color="#2e8a36" /></mesh>
        <mesh position={[0, 0.21, 0]}><sphereGeometry args={[0.04, 8, 6]} /><meshLambertMaterial color={["#ff4f7b", "#ffd23f", "#c56bff"][i % 3]} /></mesh></group>)}
      {charco > 0 && <mesh position={[0, 0.05, 0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={[charco * 2.4, charco * 0.5, 1]}><circleGeometry args={[0.5, 24]} /><meshBasicMaterial color="#5aa8ff" transparent opacity={0.75} /></mesh>}
      {/* la canaleta (gira con la pendiente) con el agua dentro */}
      <group position={[X0, GY, GZ]} rotation={[0, 0, -ang]}>
        <Caja p={[(X1 - X0) / 2, -0.06, 0]} s={[X1 - X0, 0.012, 0.13]} c="#e8e8ec" />
        <Caja p={[(X1 - X0) / 2, 0, 0.065]} s={[X1 - X0, 0.13, 0.012]} c="#f4f4f8" />
        <Caja p={[(X1 - X0) / 2, 0, -0.065]} s={[X1 - X0, 0.13, 0.012]} c="#d9d9de" />
        <Caja p={[(X1 - X0) / 2, -0.055 + nivel / 2, 0]} s={[X1 - X0 - 0.02, nivel, 0.11]} c="#3d8cff" />
      </group>
      {/* soportes en el cordel */}
      {[...Array(5)].map((_, i) => { const x = X0 + 0.2 + i * 0.6; return <Caja key={i} p={[x, yG(x) + 0.02, GZ - 0.03]} s={[0.03, 0.15, 0.16]} c="#9aa3ab" />; })}
      {/* bajante a la derecha (y otra a la izquierda al final) */}
      {[...[X1 - 0.06], ...(otra > 0 ? [X0 + 0.06] : [])].map((x, k) => <group key={x} scale={k ? [1, otra, 1] : 1} position={[0, k ? GY * (1 - otra) : 0, 0]}>
        <Caja p={[x, yG(x) / 2, GZ]} s={[0.08, yG(x), 0.08]} c="#e8e8ec" />
        <Caja p={[x + (k ? -0.12 : 0.12), 0.05, GZ + 0.05]} s={[0.25, 0.06, 0.08]} c="#e8e8ec" />
      </group>)}
      {/* agua: se derrama por el frente o baja por la bajante */}
      {derrama && <Caja p={[0, GY + 0.04, GZ + 0.075]} s={[X1 - X0 - 0.3, 0.025, 0.02]} c="#3d8cff" sombra={false} />}
      {derrama && [...Array(40)].map((_, i) => { const u = (t * 1.6 + azar(i)) % 1, x = X0 + 0.3 + azar(i + 2) * (X1 - X0 - 0.6); return <mesh key={i} position={[x, GY + 0.05 - 1.9 * u, GZ + 0.1]}><cylinderGeometry args={[0.022, 0.022, 0.16, 6]} /><meshBasicMaterial color="#3d8cff" /></mesh>; })}
      {bien && [...Array(14)].map((_, i) => { const u = (t * 0.7 + i / 14) % 1; const x = lerp(X0 + 0.1, X1 - 0.1, u); return <mesh key={i} position={[x, yG(x) - 0.04, GZ]}><sphereGeometry args={[0.02, 6, 5]} /><meshBasicMaterial color="#3d8cff" /></mesh>; })}
      {bien && [...Array(8)].map((_, i) => { const u = (t * 1.5 + i / 8) % 1; return <mesh key={`b${i}`} position={[X1 + 0.06 + 0.25 * (u > 0.85 ? (u - 0.85) / 0.15 : 0), yG(X1) * (1 - Math.min(1, u / 0.85)) + 0.05, GZ + 0.07]}><sphereGeometry args={[0.02, 6, 5]} /><meshBasicMaterial color="#3d8cff" /></mesh>; })}
      {lluvia && [...Array(46)].map((_, i) => { const u = (t * 1.6 + azar(i)) % 1; return <mesh key={i} position={[(azar(i + 2) - 0.5) * 3.6, 3.2 - 3.1 * u, -0.6 + azar(i + 6) * 1.3]}><cylinderGeometry args={[0.005, 0.005, 0.12, 4]} /><meshBasicMaterial color="#4fb3ff" /></mesh>; })}
      {/* cordel de un extremo al otro */}
      {cordel > 0 && <mesh position={[(X0 + X1) / 2, (yG(X0) + yG(X1)) / 2 + 0.1, GZ + 0.09]} rotation={[0, 0, -ang + Math.PI / 2]} scale={[1, cordel, 1]}><cylinderGeometry args={[0.005, 0.005, X1 - X0, 4]} /><meshBasicMaterial color="#ff2f6e" /></mesh>}
      {(t >= T[5] && t < T[6]) || (t >= T[9] && t < T[10]) ? <Preguntas t={t} a={t >= T[9] ? T[9] : T[5]} p={[XF + 0.1, 1.2, 0.6]} /> : null}
      <Flo p={[XF, 0, 0.6]} t={t} habla={fH} giro={-0.3} ala={t < T[1] ? 1 : t >= T[11] && t < T[12] ? 0.5 : fH * 0.7} />
      <Norm p={[XN, nSalto, 0.65]} t={t} giro={0.4} grieta brazo={nBrazo} />
    </group>
  );
};

const Rotulos: React.FC<{ t: number }> = ({ t }) => {
  const v = (a: number, b: number) => ventana(t, a, b);
  const [dx, dy] = pantalla(t, [X1 - 0.06, 1.0, GZ]);
  return (
    <g>
      <Titulo t={t} fin={T[1]} arriba="YOUR GUTTERS" abajo="OVERFLOW" color="#2f8bff" tamAbajo={130} />
      <Grande s="STRAIGHT AS A RULER!" o={v(T[2] + 0.2, T[3])} col="#ff4f9a" borde="#fff" tam={96} />
      <Grande s="LEVEL = WATER SITS" o={v(T[3] + 0.3, T[4])} col="#2f8bff" borde="#fff" tam={96} />
      <Grande s="SPILLS ON THE FOUNDATION" o={v(T[4] + 0.3, T[5])} col="#ff2a2a" borde="#fff" tam={76} />
      <Grande s="CROOKED?!" o={v(T[5] + 0.05, T[6])} col="#ff4f9a" borde="#fff" tam={140} />
      <Grande s="≈ 1/4 INCH PER 10 FEET" o={v(T[6] + 0.3, T[7])} col="#27c24c" borde="#fff" tam={90} />
      <Grande s="TOWARD THE DOWNSPOUT" o={v(T[7] + 0.2, T[8])} col="#27c24c" borde="#fff" tam={86} />
      <Etiqueta s="DOWNSPOUT" x={dx - 150} y={dy} o={v(T[7] + 0.5, T[8])} col="#ffd23f" borde="#14321f" tam={58} />
      <Grande s="SNAP A STRING LINE" o={v(T[8] + 0.3, T[9])} col="#27c24c" borde="#fff" tam={96} />
      <Grande s="STILL OVERFLOWS?" o={v(T[9] + 0.05, T[10])} col="#ff4f9a" borde="#fff" tam={110} />
      <Grande s="1 DOWNSPOUT / 30–40 FT" o={v(T[10] + 0.3, T[11])} col="#27c24c" borde="#fff" tam={86} />
      <Sello t={t} a={T[11] + 0.6} b={T[12]} />
      <Equipos t={t} a={T[12]} b={T[13]} izq="LEVEL" der="SLOPED" colIzq="#ff4f9a" colDer="#27c24c" />
      <CierreFollow t={t} a={T[13]} siguiente="NEXT: YOUR SHED DOOR WILL STICK" />
      <PideSeguir t={t} a={T[1]} b={T[2] - 0.05} />
    </g>
  );
};

export const GutterPitchVideo: React.FC = () => {
  const t = useCurrentFrame() / GP_FPS;
  return <Marco t={t} seg={GP_SEG} mundo={<Mundo t={t} />} rotulos={<Rotulos t={t} />} palabras={PAL} claves={CLAVES} ocultoDesde={T[13] - 0.05} blur={desenfoque(t)} />;
};
