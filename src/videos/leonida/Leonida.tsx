// «THE LEONIDA FILES»: serie de 5 shorts de teorías de GTA 6 (vertical 1080x1920, 30 cps, dibujo 2D en SVG).
// Gráficos propios en estilo neón (sin imágenes ni logos de Rockstar). Cada frase de la voz tiene un rótulo arriba y
// una escena en el centro; subtítulos llamativos abajo. El último bloque es la votación y el «PART X →».
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Subtitulos, Palabra } from "../comun/Subtitulos";
import t1 from "./t1.json";
import t2 from "./t2.json";
import t3 from "./t3.json";
import t4 from "./t4.json";
import t5 from "./t5.json";

export const LEO_FPS = 30;
const F = "DejaVu Sans, Arial, sans-serif";
const ROSA = "#ff3fa4", CIAN = "#3fe0ff", ORO = "#ffb53f", MORADO = "#2a0a4a", OSCURO = "#12052b", ROJO = "#ff2f4f", VERDE = "#3fff9a";
const cl = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const u = cl(x); return u * u * (3 - 2 * u); };
const atras = (u: number) => { const c1 = 1.70158, c3 = c1 + 1, x = cl(u) - 1; return 1 + c3 * x * x * x + c1 * x * x; };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const azar = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const neon = (col: string, w = 8) => ({ stroke: col, strokeWidth: w, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, filter: "url(#brillo)" });

type Tiempos = { total: number; frases: { a: number; b: number }[]; palabras: Palabra[] };
/** d = segundos desde que empezó la frase, dur = lo que dura la frase */
type Escena = (d: number, dur: number, t: number) => React.ReactNode;
type Bloque = { txt: string; num?: number; esc: Escena };
type Parte = { n: number; tiempos: Tiempos; bloques: Bloque[]; claves: string[]; equipos: [string, string]; siguiente: string };

// ------------------------------------------------------------------ fondo y marco
const Fondo: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c0320" /><stop offset="0.55" stopColor="#3b0b5a" /><stop offset="0.68" stopColor="#a8236f" /><stop offset="0.7" stopColor={OSCURO} /><stop offset="1" stopColor="#080114" /></linearGradient>
      <linearGradient id="sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe14d" /><stop offset="1" stopColor={ROSA} /></linearGradient>
      <filter id="brillo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="borroso"><feGaussianBlur stdDeviation="14" /></filter>
      <clipPath id="solc"><circle cx={540} cy={1250} r={300} /></clipPath>
    </defs>
    <rect width={1080} height={1920} fill="url(#cielo)" />
    {[...Array(40)].map((_, i) => <circle key={i} cx={azar(i) * 1080} cy={azar(i + 50) * 900} r={1.5 + 2 * azar(i + 9)} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />)}
    <g clipPath="url(#solc)" opacity={0.85}><rect x={240} y={950} width={600} height={300} fill="url(#sol)" />
      {[...Array(7)].map((_, i) => <rect key={i} x={240} y={1090 + i * 24 + ((t * 20) % 24)} width={600} height={4 + i * 2} fill="#3b0b5a" />)}</g>
    {/* ciudad de neón en el horizonte */}
    {[...Array(16)].map((_, i) => { const w = 40 + 50 * azar(i + 3), h = 80 + 260 * azar(i + 7), x = i * 70 - 20; return <g key={i}><rect x={x} y={1344 - h} width={w} height={h} fill="#1a0533" stroke={i % 3 ? "#6b2a9a" : ROSA} strokeWidth={2} />
      {[...Array(Math.floor(h / 40))].map((_, j) => <rect key={j} x={x + 8} y={1344 - h + 14 + j * 40} width={w - 16} height={6} fill={azar(i * 9 + j) > 0.5 ? ORO : "#6b2a9a"} opacity={0.6} />)}</g>; })}
    <rect x={0} y={1344} width={1080} height={576} fill="#0a0219" />
    {/* piso de cuadrícula en perspectiva */}
    {[...Array(12)].map((_, i) => { const u = ((i + (t * 0.8) % 1) / 12), y = 1344 + 576 * u * u; return <line key={i} x1={0} y1={y} x2={1080} y2={y} stroke={ROSA} strokeWidth={1 + 3 * u} opacity={0.25 + 0.5 * u} />; })}
    {[...Array(15)].map((_, i) => <line key={`v${i}`} x1={540 + (i - 7) * 30} y1={1344} x2={540 + (i - 7) * 260} y2={1920} stroke={ROSA} strokeWidth={2} opacity={0.4} />)}
    {/* palmeras */}
    {[[60, 1400, 1], [1010, 1420, -1]].map(([x, y, s], k) => <g key={k} transform={`translate(${x} ${y}) scale(${s} 1)`} fill="#05010d">
      <path d={`M0 0 Q30 -260 10 -520 L28 -520 Q50 -260 26 0 Z`} />
      {[...Array(6)].map((_, i) => <path key={i} transform={`translate(18 -520) rotate(${-150 + i * 50 + 4 * Math.sin(t * 1.5 + i)})`} d="M0 0 Q90 -40 200 10 Q100 -10 0 12 Z" />)}
    </g>)}
  </g>
);

/** rótulo de arriba: palabras entre *asteriscos* en rosa; número de pista opcional en una insignia */
const Rotulo: React.FC<{ txt: string; num?: number; d: number }> = ({ txt, num, d }) => {
  const e = atras(d / 0.28), partes = txt.split("*");
  const tam = Math.min(108, 960 / (txt.replace(/\*/g, "").length * 0.72));
  return (
    <g transform={`translate(540 360) scale(${0.6 + 0.4 * e}) rotate(${-2 * (1 - cl(d / 0.3))})`} fontFamily={F} fontWeight={900} textAnchor="middle" opacity={cl(d / 0.12)}>
      <text fontSize={tam} fill="#fff" stroke={OSCURO} strokeWidth={tam * 0.24} strokeLinejoin="round" paintOrder="stroke">
        {partes.map((p, i) => <tspan key={i} fill={i % 2 ? ROSA : "#fff"}>{p}</tspan>)}</text>
      {num !== undefined && <g transform={`translate(0 ${-tam - 40})`}><circle r={52} fill={OSCURO} stroke={ORO} strokeWidth={8} filter="url(#brillo)" /><text y={22} fontSize={64} fill={ORO}>{num}</text></g>}
    </g>
  );
};

const Insignia: React.FC<{ n: number }> = ({ n }) => (
  <g fontFamily={F} fontWeight={900}>
    <rect x={40} y={60} width={520} height={78} rx={39} fill={OSCURO} stroke={ROSA} strokeWidth={5} opacity={0.92} />
    <text x={74} y={112} fontSize={38} fill="#fff">LEONIDA FILES</text>
    <rect x={430} y={72} width={110} height={54} rx={27} fill={ROSA} /><text x={485} y={112} fontSize={38} fill="#fff" textAnchor="middle">{n}/5</text>
  </g>
);

// ------------------------------------------------------------------ piezas de las escenas
const Persona: React.FC<{ x: number; y: number; s?: number; col: string; pelo?: boolean; gorra?: boolean; o?: number }> = ({ x, y, s = 1, col, pelo, gorra, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {pelo && <path d="M-70 -300 Q-90 -190 -60 -150 L60 -150 Q90 -190 70 -300 Q0 -360 -70 -300Z" fill={col} opacity={0.5} />}
    <circle cx={0} cy={-260} r={62} {...neon(col, 7)} fill={OSCURO} />
    {gorra && <path d="M-64 -280 Q0 -350 64 -280 L110 -272" {...neon(col, 9)} />}
    <path d="M-110 0 L-90 -150 Q0 -190 90 -150 L110 0 Z" {...neon(col, 7)} fill={OSCURO} />
  </g>
);
const Pistola: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0 h90 v24 h-50 l-10 40 h-24 l8 -40 h-14 z" fill="#d9d9e8" stroke={OSCURO} strokeWidth={5} /></g>
);
const Flecha: React.FC<{ x: number; y: number; ang: number; col?: string }> = ({ x, y, ang, col = ROJO }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}><path d="M0 0 l-60 -40 v24 h-110 v32 h110 v24 z" fill={col} stroke="#fff" strokeWidth={6} /></g>
);
const Pulso: React.FC<{ x: number; y: number; t: number; col?: string; r?: number }> = ({ x, y, t, col = ROJO, r = 70 }) => (
  <g>{[0, 0.5].map((k) => { const u = (t * 1.4 + k) % 1; return <circle key={k} cx={x} cy={y} r={r * (0.6 + u)} {...neon(col, 6)} opacity={1 - u} />; })}</g>
);

/** el abrazo de Lucia (rosa) y Jason (cian); `arma` resalta la pistola, `sep` los separa, `rojo` pinta a Jason de rojo */
const Abrazo: React.FC<{ d: number; t: number; arma?: number; sep?: number; rojo?: number; zoom?: number }> = ({ d, t, arma = 0, sep = 0, rojo = 0, zoom = 0 }) => {
  const z = 1 + 0.25 * zoom * sm(d / 1.5);
  return (
    <g transform={`translate(540 1180) scale(${z}) translate(-540 -1180)`}>
      <Persona x={480 - 140 * sep} y={1260} col={ROSA} pelo />
      <Persona x={620 + 140 * sep} y={1260} col={rojo > 0 ? ROJO : CIAN} gorra />
      {rojo > 0 && <g opacity={0.5}><Persona x={620 + 140 * sep + 10 * Math.sin(t * 40)} y={1260} col={CIAN} gorra o={0.4} /></g>}
      {sep < 0.5 && <path d="M400 1120 Q540 1060 690 1120" {...neon(ROSA, 10)} />}
      {arma > 0 && <g opacity={arma}><Pistola x={318 - 140 * sep} y={1150} s={1.1} /><Pulso x={360 - 140 * sep} y={1170} t={t} /><Flecha x={280 - 140 * sep} y={1170} ang={0} /></g>}
    </g>
  );
};

const Tarjeta: React.FC<{ x: number; y: number; w?: number; h?: number; col: string; e: number; children: React.ReactNode }> = ({ x, y, w = 260, h = 300, col, e, children }) => e <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${e})`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} {...neon(col, 6)} fill={OSCURO} />{children}</g>
);
const IconoNota: React.FC<{ col?: string }> = ({ col = CIAN }) => <g><ellipse cx={-30} cy={50} rx={30} ry={22} fill={col} /><ellipse cx={50} cy={30} rx={30} ry={22} fill={col} /><path d="M0 50 V-60 L80 -80 V30" {...neon(col, 10)} /></g>;
const IconoSello: React.FC<{ col?: string; t?: number }> = ({ col = ORO, t = 0 }) => <g transform={`rotate(${t * 20})`}><circle r={80} {...neon(col, 7)} /><circle r={58} {...neon(col, 4)} />{[...Array(8)].map((_, i) => <circle key={i} cx={69 * Math.cos(i * 0.785)} cy={69 * Math.sin(i * 0.785)} r={5} fill={col} />)}<path d="M-25 15 L0 -35 L25 15 Z" fill={col} /></g>;

const Ecualizador: React.FC<{ t: number; roto?: number }> = ({ t, roto = 0 }) => (
  <g transform="translate(540 1050)">
    {[...Array(13)].map((_, i) => { const h = 60 + 220 * Math.abs(Math.sin(t * (3 + i * 0.37) + i)); return <rect key={i} x={-390 + i * 60} y={-h / 2} width={40} height={h} rx={12} fill={i % 2 ? ROSA : CIAN} opacity={0.9} />; })}
    <g transform="translate(0 -300) scale(1.2)"><IconoNota col="#fff" /></g>
    {roto > 0 && <g transform={`translate(0 260) scale(${atras(roto)})`}><path d="M0 60 C-130 -40 -90 -150 0 -80 C90 -150 130 -40 0 60Z" fill={ROJO} stroke="#fff" strokeWidth={6} /><path d="M0 -80 L-20 -30 L15 0 L-10 50" stroke={OSCURO} strokeWidth={10} fill="none" /></g>}
  </g>
);

const Sello: React.FC<{ t: number; d: number; lupa?: number }> = ({ t, d, lupa = 0 }) => (
  <g transform="translate(540 1040)">
    <g transform={`scale(${2.6 + 0.4 * lupa * sm(d / 1.2)})`}><IconoSello t={t} /></g>
    <text y={300} fontFamily={F} fontWeight={900} fontSize={52} fill={ORO} textAnchor="middle" stroke={OSCURO} strokeWidth={10} paintOrder="stroke">STATE OF LEONIDA</text>
    <g transform={`translate(${160 * Math.sin(t * 1.6)} ${-60 + 80 * Math.cos(t * 1.3)})`}><circle r={110} {...neon("#fff", 10)} fill="#ffffff22" /><line x1={78} y1={78} x2={170} y2={170} stroke="#fff" strokeWidth={24} strokeLinecap="round" /></g>
    {lupa > 0 && [...Array(4)].map((_, i) => <text key={i} x={-300 + i * 200} y={-260 + 30 * Math.sin(t * 4 + i)} fontFamily={F} fontWeight={900} fontSize={90} fill={ROSA} textAnchor="middle" opacity={sm(d / 0.4)}>?</text>)}
  </g>
);

const Glitch: React.FC<{ t: number; txt: string }> = ({ t, txt }) => (
  <g fontFamily={F} fontWeight={900} textAnchor="middle" fontSize={260}>
    <rect x={0} y={560} width={1080} height={800} fill="#000" opacity={0.35} />
    {[...Array(14)].map((_, i) => <rect key={i} x={0} y={600 + i * 55 + ((t * 300) % 55)} width={1080} height={4} fill="#fff" opacity={0.08} />)}
    <text x={540 - 12 + 8 * Math.sin(t * 50)} y={1050} fill={CIAN} opacity={0.8}>{txt}</text>
    <text x={540 + 12 - 8 * Math.sin(t * 50)} y={1050} fill={ROSA} opacity={0.8}>{txt}</text>
    <text x={540} y={1050} fill="#fff">{txt}</text>
  </g>
);

const Placa: React.FC<{ t: number; d: number; borrosa?: boolean; grieta?: number }> = ({ t, d, borrosa, grieta = 0 }) => {
  const puntas = [...Array(7)].map((_, i) => { const a = -Math.PI / 2 + i * (Math.PI * 2 / 7); return `${Math.cos(a) * 230},${Math.sin(a) * 230} ${Math.cos(a + 0.45) * 120},${Math.sin(a + 0.45) * 120}`; }).join(" ");
  return (
    <g transform={`translate(540 1050) rotate(${10 * Math.sin(t * 2)}) scale(${0.8 + 0.2 * atras(d / 0.4)})`} filter={borrosa ? "url(#borroso)" : undefined}>
      <polygon points={puntas} fill={ORO} stroke="#fff" strokeWidth={8} /><circle r={90} fill={OSCURO} stroke="#fff" strokeWidth={6} />
      <text y={22} fontFamily={F} fontWeight={900} fontSize={60} fill={ORO} textAnchor="middle">VCPD</text>
      {grieta > 0 && <path d="M-40 -230 L10 -120 L-30 -40 L30 40 L-10 130 L20 230" fill="none" stroke={OSCURO} strokeWidth={14} strokeDasharray={600} strokeDashoffset={600 * (1 - grieta)} />}
    </g>
  );
};

const Reja: React.FC<{ d: number; t: number }> = ({ d, t }) => {
  const abre = sm((d - 0.4) / 1.4);
  return (
    <g>
      <rect x={190} y={640} width={700} height={720} fill="#000" opacity={0.5} />
      <rect x={190 + 350 * 0} y={640} width={700} height={720} {...neon("#9aa7ff", 8)} fill="none" />
      <circle cx={540} cy={1000} r={260} fill={ORO} opacity={0.15 + 0.15 * abre} />
      <Persona x={540} y={1340} col={ROSA} pelo s={0.9} o={0.3 + 0.7 * abre} />
      {[...Array(9)].map((_, i) => <rect key={i} x={215 + i * 75 - abre * 700} y={640} width={18} height={720} fill="#c9cde8" />)}
      <text x={540} y={620} fontFamily={F} fontWeight={900} fontSize={48} fill="#c9cde8" textAnchor="middle" opacity={0.8 + 0.2 * Math.sin(t * 6)}>LEONIDA CORRECTIONAL</text>
    </g>
  );
};

const Bocadillo: React.FC<{ d: number; t: number; txt: string; pregunta?: boolean }> = ({ d, t, txt, pregunta }) => (
  <g>
    <Persona x={330} y={1380} col={CIAN} gorra s={0.9} />
    <g transform={`translate(640 860) scale(${atras(d / 0.35)})`} fontFamily={F} fontWeight={900} textAnchor="middle">
      <rect x={-330} y={-130} width={660} height={240} rx={60} fill="#fff" /><path d="M-220 100 L-300 230 L-140 108 Z" fill="#fff" />
      <text y={0} fontSize={56} fill={OSCURO}>{txt}</text><text y={70} fontSize={56} fill={OSCURO}>…</text>
    </g>
    {pregunta && [0, 1, 2].map((i) => <text key={i} x={780 + i * 90} y={1250 - 30 * Math.abs(Math.sin(t * 5 + i))} fontFamily={F} fontWeight={900} fontSize={150} fill={ROSA} textAnchor="middle" stroke="#fff" strokeWidth={8} paintOrder="stroke">?</text>)}
  </g>
);

const Camara: React.FC<{ t: number; d: number; tipo: string }> = ({ t, d, tipo }) => (
  <g>
    <rect x={130} y={660} width={820} height={680} fill="#0d2233" opacity={0.85} />
    {[...Array(30)].map((_, i) => <rect key={i} x={130} y={660 + i * 23} width={820} height={3} fill="#fff" opacity={0.05} />)}
    <rect x={130} y={660} width={820} height={680} fill="none" stroke="#fff" strokeWidth={6} />
    {[[150, 680, 1, 1], [930, 680, -1, 1], [150, 1320, 1, -1], [930, 1320, -1, -1]].map(([x, y, sx, sy], i) => <path key={i} d={`M${x} ${y + 60 * sy} V${y} H${x + 60 * sx}`} stroke="#fff" strokeWidth={10} fill="none" />)}
    {Math.floor(t * 2) % 2 === 0 && <circle cx={200} cy={740} r={20} fill={ROJO} />}
    <text x={240} y={756} fontFamily={F} fontWeight={900} fontSize={44} fill="#fff">REC  {tipo}</text>
    <text x={900} y={1300} fontFamily="DejaVu Sans Mono, monospace" fontSize={40} fill="#fff" textAnchor="end">{`11:4${Math.floor(d) % 10}:${String(Math.floor((d * 30) % 60)).padStart(2, "0")} PM`}</text>
    <circle cx={540} cy={1000} r={90} {...neon("#fff", 4)} /><line x1={540} y1={880} x2={540} y2={1120} stroke="#fff" strokeWidth={3} /><line x1={420} y1={1000} x2={660} y2={1000} stroke="#fff" strokeWidth={3} />
    <g transform={`translate(${540 + 40 * Math.sin(t)} 1260)`}><Persona x={0} y={0} col={ROSA} pelo s={0.45} /><Persona x={110} y={0} col={CIAN} gorra s={0.45} /></g>
  </g>
);

const Medidor: React.FC<{ t: number; d: number; borroso?: boolean; aguja?: number; titulo?: string }> = ({ t, d, borroso, aguja, titulo = "PERSONALITY" }) => {
  const pos = aguja ?? 0.5 + 0.45 * Math.sin(t * 2.4);
  return (
    <g transform="translate(540 1030)" filter={borroso ? "url(#borroso)" : undefined} fontFamily={F} fontWeight={900}>
      <rect x={-430} y={-170} width={860} height={340} rx={36} {...neon(ROSA, 6)} fill={OSCURO} />
      <text x={-390} y={-95} fontSize={46} fill="#fff">{titulo}</text>
      <defs><linearGradient id="barra"><stop offset="0" stopColor={CIAN} /><stop offset="1" stopColor={ROJO} /></linearGradient></defs>
      <rect x={-390} y={-40} width={780} height={60} rx={30} fill="url(#barra)" />
      <circle cx={-390 + 780 * pos} cy={-10} r={44} fill="#fff" stroke={OSCURO} strokeWidth={8} />
      <text x={-390} y={110} fontSize={44} fill={CIAN}>CALM</text><text x={390} y={110} fontSize={44} fill={ROJO} textAnchor="end">RECKLESS</text>
      {d < 0 && null}
    </g>
  );
};

const Rejilla: React.FC<{ d: number; dur: number; sello?: boolean }> = ({ d, dur, sello }) => {
  const n = sello ? 90 : Math.floor(90 * cl(d / Math.max(0.8, dur - 0.3)));
  return (
    <g>
      {[...Array(90)].map((_, i) => i < n && <rect key={i} x={150 + (i % 10) * 80} y={650 + Math.floor(i / 10) * 62} width={70} height={52} rx={8} fill={["#5b2a8a", "#8a2a6a", "#2a5a8a"][i % 3]} stroke={ROSA} strokeWidth={2} />)}
      <text x={540} y={1300} fontFamily={F} fontWeight={900} fontSize={110} fill={ORO} textAnchor="middle" stroke={OSCURO} strokeWidth={18} paintOrder="stroke">{n} VIDEOS</text>
      {sello && <g transform={`translate(540 960) rotate(-12) scale(${2.2 - 1.2 * sm(d / 0.25)})`} opacity={sm(d / 0.2)} fontFamily={F} fontWeight={900} textAnchor="middle">
        <rect x={-330} y={-80} width={660} height={160} rx={20} fill="none" stroke={VERDE} strokeWidth={16} /><text y={36} fontSize={92} fill={VERDE}>CONFIRMED</text></g>}
    </g>
  );
};

const Debug: React.FC<{ d: number }> = ({ d }) => {
  const filas = ["POLICE RECORD", "NPC MEMORY", "WITNESSES", "GANG TURF"];
  return (
    <g fontFamily="DejaVu Sans Mono, monospace" fontWeight={700}>
      <rect x={140} y={660} width={800} height={620} rx={16} fill="#06120a" stroke={VERDE} strokeWidth={6} />
      <rect x={140} y={660} width={800} height={80} rx={16} fill={VERDE} /><text x={180} y={715} fontSize={44} fill="#06120a">AI_DEBUG.exe</text>
      {filas.map((f, i) => { const v = d > 0.3 + i * 0.45; return <g key={i} opacity={v ? 1 : 0.25}><text x={190} y={830 + i * 110} fontSize={50} fill={VERDE}>{"> " + f}</text>
        {v && <text x={880} y={830 + i * 110} fontSize={56} fill={i < 2 ? VERDE : ORO} textAnchor="end">{i < 2 ? "✓" : "?"}</text>}</g>; })}
    </g>
  );
};

const Finales: React.FC<{ d: number; t: number }> = ({ d, t }) => {
  const der = sm((d - 1.4) / 0.4);
  return (
    <g fontFamily={F} fontWeight={900} textAnchor="middle">
      <rect x={60} y={640} width={460} height={700} rx={30} {...neon(CIAN, 6)} fill="#06202a" />
      <rect x={560} y={640} width={460} height={700} rx={30} {...neon(ROJO, 6)} fill="#2a0610" opacity={0.3 + 0.7 * der} />
      <text x={290} y={720} fontSize={60} fill={CIAN}>CALM</text><text x={790} y={720} fontSize={60} fill={ROJO} opacity={0.3 + 0.7 * der}>RECKLESS</text>
      <Persona x={230} y={1250} col={ROSA} pelo s={0.55} /><Persona x={350} y={1250} col={CIAN} gorra s={0.55} />
      <g opacity={der}><Persona x={730} y={1250} col={CIAN} gorra s={0.55} /><text x={860} y={1180} fontSize={160} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 6)}>?</text></g>
    </g>
  );
};

const SelloTexto: React.FC<{ d: number; txt: string; col?: string; fondo?: boolean }> = ({ d, txt, col = ROJO, fondo = true }) => (
  <g>
    {fondo && <g filter="url(#borroso)" opacity={0.7}>{[...Array(12)].map((_, i) => <rect key={i} x={150 + (i % 4) * 200} y={700 + Math.floor(i / 4) * 200} width={180} height={170} rx={16} fill={["#5b2a8a", "#8a2a6a", "#2a5a8a"][i % 3]} />)}</g>}
    <g transform={`translate(540 1000) rotate(-10) scale(${2.4 - 1.4 * sm(d / 0.25)})`} opacity={sm(d / 0.2)} fontFamily={F} fontWeight={900} textAnchor="middle">
      <rect x={-380} y={-90} width={760} height={180} rx={24} fill="#00000055" stroke={col} strokeWidth={18} /><text y={36} fontSize={100} fill={col}>{txt}</text></g>
  </g>
);

const Tele: React.FC<{ t: number; d: number; marca?: "x" | "ok"; estatica?: boolean }> = ({ t, d, marca, estatica }) => (
  <g transform="translate(540 1020)">
    <rect x={-380} y={-300} width={760} height={560} rx={60} fill="#3a2414" stroke="#1a0d05" strokeWidth={12} />
    <rect x={-330} y={-250} width={560} height={460} rx={40} fill="#0f1a1f" />
    {estatica ? [...Array(60)].map((_, i) => <rect key={i} x={-330 + azar(i + Math.floor(t * 20)) * 540} y={-250 + azar(i * 3 + Math.floor(t * 20)) * 440} width={30} height={6} fill="#fff" opacity={0.6} />)
      : <g><circle cx={-50} cy={-60} r={60} {...neon(ORO, 6)} fill={OSCURO} /><path d="M-160 210 L-140 30 Q-50 -10 40 30 L60 210" {...neon(ORO, 6)} fill={OSCURO} />
          <path d="M-140 50 L-230 150" {...neon(ORO, 14)} /><path d="M40 50 L130 150" {...neon(ORO, 14)} /></g>}
    {[...Array(3)].map((_, i) => <circle key={i} cx={300} cy={-180 + i * 110} r={26} fill="#1a0d05" stroke="#7a5a3a" strokeWidth={5} />)}
    <line x1={-120} y1={-300} x2={-220} y2={-420} stroke="#888" strokeWidth={8} /><line x1={80} y1={-300} x2={180} y2={-420} stroke="#888" strokeWidth={8} />
    {marca && <g transform={`translate(240 -260) scale(${atras((d - 0.6) / 0.35)})`}><circle r={80} fill={marca === "x" ? ROJO : VERDE} stroke="#fff" strokeWidth={8} />
      <text y={36} fontFamily={F} fontWeight={900} fontSize={100} fill="#fff" textAnchor="middle">{marca === "x" ? "✗" : "✓"}</text></g>}
  </g>
);

const Linea: React.FC<{ d: number; rompe?: number; a?: string; b?: string }> = ({ d, rompe = 0, a = "VICE CITY", b = "GTA 6" }) => (
  <g fontFamily={F} fontWeight={900} textAnchor="middle">
    <line x1={140} y1={1000} x2={940} y2={1000} {...neon(CIAN, 12)} strokeDasharray={800} strokeDashoffset={800 * (1 - sm(d / 0.6))} />
    {[[200, a], [880, b]].map(([x, s], i) => <g key={i}><circle cx={x as number} cy={1000} r={36} {...neon(i ? ROSA : ORO, 8)} fill={OSCURO} /><text x={x as number} y={1110} fontSize={50} fill="#fff">{s}</text></g>)}
    {rompe > 0 && <g><path d={`M540 880 L510 960 L570 1000 L520 1060 L560 1130`} fill="none" stroke={ROJO} strokeWidth={16} strokeDasharray={300} strokeDashoffset={300 * (1 - rompe)} /><text x={540} y={840} fontSize={80} fill={ROJO} opacity={rompe}>???</text></g>}
  </g>
);

const DosTarjetas: React.FC<{ d: number; t: number; lado: 0 | 1 }> = ({ d, t, lado }) => (
  <g fontFamily={F} fontWeight={900} textAnchor="middle">
    {[["HIS SON", 290, ORO], ["MOVIES", 790, CIAN]].map(([s, x, col], i) => { const on = i === lado, e = on ? atras(d / 0.35) : 0.85; return (
      <g key={i} opacity={on ? 1 : 0.35}><Tarjeta x={x as number} y={1020} w={420} h={560} col={col as string} e={e}>
        {i === 0 ? <g><Persona x={-60} y={150} col={ORO} s={0.55} /><Persona x={90} y={190} col={ORO} s={0.38} /></g>
          : <g transform={`rotate(${t * 60})`}><circle r={130} {...neon(CIAN, 10)} />{[...Array(6)].map((_, j) => <circle key={j} cx={80 * Math.cos(j * 1.047)} cy={80 * Math.sin(j * 1.047)} r={26} fill={CIAN} />)}</g>}
        <text y={-200} fontSize={64} fill={col as string}>{s}</text></Tarjeta></g>); })}
  </g>
);

const REGIONES: { n: string; x: number; y: number; ic: string }[] = [
  { n: "VICE CITY", x: 650, y: 1150, ic: "🏙" }, { n: "LEONIDA KEYS", x: 500, y: 1330, ic: "🏝" }, { n: "GRASSRIVERS", x: 470, y: 1110, ic: "🐊" },
  { n: "PORT GELLHORN", x: 330, y: 780, ic: "⚓" }, { n: "AMBROSIA", x: 560, y: 860, ic: "🏭" }, { n: "MOUNT KALAGA", x: 620, y: 690, ic: "⛰" },
];
const Mapa: React.FC<{ t: number; d: number; encendidas: number; foco?: number; niebla?: number; tiembla?: number }> = ({ t, d, encendidas, foco, niebla = 0, tiembla = 0 }) => {
  const sx = tiembla ? 6 * Math.sin(t * 40) : 0;
  return (
    <g transform={`translate(${sx} 0)`} fontFamily={F} fontWeight={900}>
      <path d="M210 640 L820 620 L790 760 Q720 900 720 1060 Q730 1200 650 1290 L560 1340 Q500 1260 520 1180 Q420 1080 400 940 Q330 830 210 760 Z" {...neon(CIAN, 6)} fill="#1b0838" />
      {[...Array(8)].map((_, i) => <circle key={i} cx={520 + i * 40} cy={1360 + 18 * Math.sin(i)} r={10 + 4 * azar(i)} fill="#1b0838" stroke={CIAN} strokeWidth={4} />)}
      {REGIONES.map((r, i) => { const on = i < encendidas, f = foco === i; const e = on ? (f ? 1 + 0.12 * Math.sin(t * 8) : 1) : 0;
        return <g key={i} transform={`translate(${r.x} ${r.y})`}>
          <circle r={f ? 70 : 52} fill={on ? (f ? ROSA : "#5b2a8a") : "#2a1448"} opacity={on ? 0.9 : 0.4} filter={on ? "url(#brillo)" : undefined} />
          {on && <text y={20} fontSize={54} textAnchor="middle" transform={`scale(${e})`}>{r.ic}</text>}
          {on && <text y={f ? 120 : 98} fontSize={f ? 46 : 30} fill="#fff" textAnchor="middle" stroke={OSCURO} strokeWidth={8} paintOrder="stroke">{r.n}</text>}
        </g>; })}
      {niebla > 0 && <g opacity={niebla}>{[...Array(10)].map((_, i) => <ellipse key={i} cx={azar(i) * 1080 + 40 * Math.sin(t + i)} cy={600 + azar(i + 4) * 800} rx={240} ry={90} fill="#c9b8ff" opacity={0.18} filter="url(#borroso)" />)}</g>}
      {d < 0 && null}
    </g>
  );
};

const Cinco: React.FC<{ t: number; d: number; gira?: boolean }> = ({ t, d, gira }) => {
  const ic = ["🔫", "🚔", "📊", "📺", "🗺"];
  return (
    <g fontFamily={F} fontWeight={900} textAnchor="middle">
      {ic.map((s, i) => { const e = atras((d - i * 0.15) / 0.3), x = 140 + i * 200, y = 1000 + (i % 2) * 120; return e > 0 && (
        <g key={i} transform={`translate(${x} ${y}) scale(${e * (gira ? Math.cos(t * 3 + i) : 1)} ${e})`}>
          <rect x={-85} y={-130} width={170} height={260} rx={22} {...neon([ROSA, CIAN, ORO, VERDE, ROSA][i], 6)} fill={OSCURO} />
          <text y={-60} fontSize={44} fill="#fff">{i + 1}</text><text y={30} fontSize={70}>{s}</text>
          <text y={110} fontSize={64} fill={ORO} opacity={0.6 + 0.4 * Math.sin(t * 5 + i)}>?</text>
        </g>); })}
    </g>
  );
};

const Seguir: React.FC<{ d: number; n: number }> = ({ d, n }) => {
  const toca = d > 0.6, e = atras(d / 0.3);
  return (
    <g transform={`translate(540 1000) scale(${e})`} fontFamily={F} fontWeight={900} textAnchor="middle">
      <circle cy={-220} r={110} {...neon(ROSA, 8)} fill={OSCURO} />
      <g transform="translate(0 -200)" fill={VERDE}><path d="M-6 60 Q0 -10 -2 -60 L6 -60 Q10 -10 8 60Z" />{[...Array(5)].map((_, i) => <path key={i} transform={`translate(2 -60) rotate(${-160 + i * 35})`} d="M0 0 Q40 -18 80 6 Q40 -4 0 6Z" />)}</g>
      <rect x={-300} y={-40} width={600} height={140} rx={70} fill={toca ? VERDE : ROSA} stroke="#fff" strokeWidth={8} />
      <text y={54} fontSize={72} fill={toca ? OSCURO : "#fff"}>{toca ? "FOLLOWING ✓" : "FOLLOW"}</text>
      <text y={200} fontSize={56} fill="#fff" stroke={OSCURO} strokeWidth={12} paintOrder="stroke">PART {n} OF 5</text>
      <text y={280} fontSize={48} fill={ORO} stroke={OSCURO} strokeWidth={10} paintOrder="stroke">LAUNCH · NOV 19</text>
      <g transform={`translate(200 ${80 + (toca ? 0 : 30)}) rotate(-15) scale(${d > 0.5 && d < 0.75 ? 0.9 : 1})`}><path d="M0 0 C-6 -40 22 -44 24 -4 L26 30 L36 26 Q50 22 52 36 L54 52 Q66 46 70 60 L72 74 Q84 70 86 84 L88 130 Q86 172 46 176 L10 176 Q-14 172 -22 140 L-42 74 Q-48 54 -30 52 Q-16 52 -8 70 Z" fill="#ffe0c7" stroke={OSCURO} strokeWidth={8} /></g>
    </g>
  );
};

const Cierre: React.FC<{ d: number; t: number; eq: [string, string]; sig: string }> = ({ d, t, eq, sig }) => {
  const e1 = atras(d / 0.3), e2 = atras((d - 0.15) / 0.3), nx = sm((d - 1.0) / 0.4);
  return (
    <g fontFamily={F} fontWeight={900} textAnchor="middle">
      {[[285, eq[0], CIAN, e1], [795, eq[1], ROSA, e2]].map(([x, s, col, e], i) => <g key={i} transform={`translate(${x} 760) scale(${e as number})`}>
        <rect x={-230} y={-110} width={460} height={220} rx={40} fill={col as string} stroke="#fff" strokeWidth={8} />
        <text y={-15} fontSize={48} fill={OSCURO}>TEAM</text><text y={60} fontSize={(s as string).length > 7 ? 54 : 66} fill={OSCURO}>{s as string}</text></g>)}
      <g transform={`translate(540 760) scale(${1 + 0.1 * Math.sin(t * 12)})`}><circle r={74} fill={OSCURO} stroke={ORO} strokeWidth={10} /><text y={26} fontSize={66} fill={ORO}>VS</text></g>
      <text x={540} y={960} fontSize={50} fill="#fff" stroke={OSCURO} strokeWidth={10} paintOrder="stroke">COMMENT YOUR TEAM 👇</text>
      {nx > 0 && <g transform={`translate(540 1180) scale(${0.8 + 0.2 * nx})`} opacity={nx}>
        <rect x={-400} y={-120} width={800} height={240} rx={36} {...neon(ORO, 8)} fill={OSCURO} />
        <text y={-20} fontSize={50} fill="#fff" filter="url(#borroso)" opacity={0.8}>{sig}</text>
        <text y={70} fontSize={70} fill={ORO}>{sig.startsWith("FOLLOW") ? "FOLLOW ✓" : `${sig.split("·")[0].trim()} →`}</text></g>}
    </g>
  );
};

// ------------------------------------------------------------------ las 5 partes
const P1: Parte = { n: 1, tiempos: t1 as Tiempos, equipos: ["LUCIA", "JASON"], siguiente: "PART 2 · IS JASON A COP?",
  claves: ["lucia", "jason", "gun", "betrays", "clues", "follow", "song", "petty", "trust", "seal", "florida", "traitor", "problem", "hiding", "team", "comment"],
  bloques: [
    { txt: "SHE'S HIDING A *GUN*", esc: (d, _u, t) => <Abrazo d={d} t={t} arma={sm((d - 0.6) / 0.3)} zoom={1} /> },
    { txt: "*BETRAYAL?*", num: 1, esc: (d, _u, t) => <g><Abrazo d={d} t={t} arma={1} sep={sm(d / 1.2) * 0.7} /></g> },
    { txt: "DON'T MISS *PART 2*", esc: (d) => <Seguir d={d} n={1} /> },
    { txt: "THE *SONG*", num: 2, esc: (_d, _u, t) => <Ecualizador t={t} /> },
    { txt: "TRUST *ISSUES?*", esc: (d, _u, t) => <Ecualizador t={t} roto={d / 0.4} /> },
    { txt: "THE STATE *SEAL*", num: 3, esc: (d, _u, t) => <Sello t={t} d={d} /> },
    { txt: "A HIDDEN *MESSAGE?*", esc: (d, _u, t) => <Sello t={t} d={d} lupa={1} /> },
    { txt: "", esc: (_d, _u, t) => <Glitch t={t} txt="BUT…" /> },
    { txt: "NOT *LUCIA?*", esc: (d, _u, t) => <Abrazo d={d} t={t} sep={0.8} rojo={sm(d / 0.4)} /> },
    { txt: "IS JASON A *COP?*", esc: (d, _u, t) => <Placa t={t} d={d} borrosa /> },
    { txt: "WHO *BETRAYS* WHO?", esc: () => null },
  ] };
const P2: Parte = { n: 2, tiempos: t2 as Tiempos, equipos: ["COP", "CRIMINAL"], siguiente: "PART 3 · THE LEAKED METER",
  claves: ["jason", "lucia", "prison", "line", "guard", "before", "free", "bodycams", "dashcams", "rare", "undercover", "betrays", "ending", "leak", "hidden", "cop", "criminal"],
  bloques: [
    { txt: "JASON'S *SECRET*", esc: (d, _u, t) => <Reja d={d} t={t} /> },
    { txt: "DON'T MISS *PART 3*", esc: (d) => <Seguir d={d} n={2} /> },
    { txt: "BEEN HERE *BEFORE?*", num: 1, esc: (d, _u, t) => <Bocadillo d={d} t={t} txt="BEEN HERE BEFORE" /> },
    { txt: "*WHY?*", esc: (d, _u, t) => <Bocadillo d={d + 1} t={t} txt="BEEN HERE BEFORE" pregunta /> },
    { txt: "POLICE *CAMERAS*", num: 2, esc: (d, _u, t) => <Camara t={t} d={d} tipo="BODYCAM 04" /> },
    { txt: "RARE FOR *GTA*", esc: (d, _u, t) => <Camara t={t} d={d + 3} tipo="DASHCAM 11" /> },
    { txt: "*UNDERCOVER?*", num: 3, esc: (d, _u, t) => <Placa t={t} d={d} /> },
    { txt: "THE *TRAITOR?*", esc: (d, _u, t) => <Abrazo d={d} t={t} sep={0.8} rojo={sm(d / 0.4)} /> },
    { txt: "", esc: (_d, _u, t) => <Glitch t={t} txt="BUT…" /> },
    { txt: "THE *2022 LEAK*", esc: (d, _u, t) => <Medidor t={t} d={d} borroso /> },
    { txt: "COP OR *CRIMINAL?*", esc: () => null },
  ] };
const P3: Parte = { n: 3, tiempos: t3 as Tiempos, equipos: ["CALM", "RECKLESS"], siguiente: "PART 4 · THE TV CLUE",
  claves: ["leaked", "ending", "control", "ninety", "videos", "leaked", "rockstar", "confirmed", "debug", "police", "record", "remember", "meter", "calm", "reckless", "survives", "early", "build", "four", "timeline"],
  bloques: [
    { txt: "YOU PICK THE *ENDING?*", esc: (d, _u, t) => <Medidor t={t} d={d} /> },
    { txt: "DON'T MISS *PART 4*", esc: (d) => <Seguir d={d} n={3} /> },
    { txt: "*90* LEAKED VIDEOS", num: 1, esc: (d, u) => <Rejilla d={d} dur={u} /> },
    { txt: "ROCKSTAR *CONFIRMED*", esc: (d, u) => <Rejilla d={d} dur={u} sello /> },
    { txt: "THE *DEBUG* MENU", num: 2, esc: (d) => <Debug d={d} /> },
    { txt: "THE *METER*", num: 3, esc: (d, _u, t) => <Medidor t={t} d={d} /> },
    { txt: "CALM VS *RECKLESS*", esc: (d, _u, t) => <Finales d={d} t={t} /> },
    { txt: "", esc: (_d, _u, t) => <Glitch t={t} txt="BUT…" /> },
    { txt: "EARLY *BUILD*", esc: (d) => <SelloTexto d={d} txt="EARLY BUILD" col={ORO} /> },
    { txt: "WHAT'S ON THE *TV?*", esc: (d, _u, t) => <Tele t={t} d={d} estatica /> },
    { txt: "HOW WILL YOU *PLAY?*", esc: () => null },
  ] };
const P4: Parte = { n: 4, tiempos: t4 as Tiempos, equipos: ["SON", "MOVIE"], siguiente: "PART 5 · THE REAL MAP",
  claves: ["vice", "city", "shouldn't", "phil", "cassidy", "tv", "arms", "arm", "whole", "son", "movies", "tech", "real", "leonida", "map", "bigger", "movie"],
  bloques: [
    { txt: "HE SHOULDN'T *EXIST*", esc: (d, _u, t) => <Tele t={t} d={d} marca="x" /> },
    { txt: "DON'T MISS *PART 5*", esc: (d) => <Seguir d={d} n={4} /> },
    { txt: "PHIL ON *TV*", num: 1, esc: (d, _u, t) => <Tele t={t} d={d} marca="ok" /> },
    { txt: "LOST AN *ARM?*", num: 2, esc: (d) => <Linea d={d} rompe={sm((d - 1.2) / 0.6)} /> },
    { txt: "THEORY: HIS *SON*", esc: (d, _u, t) => <DosTarjetas d={d} t={t} lado={0} /> },
    { txt: "THEORY: *MOVIES*", esc: (d, _u, t) => <DosTarjetas d={d} t={t} lado={1} /> },
    { txt: "NOT THE *SAME* CITY", num: 3, esc: (d) => <Linea d={d} rompe={1} a="1986" b="TODAY" /> },
    { txt: "", esc: (_d, _u, t) => <Glitch t={t} txt="BUT…" /> },
    { txt: "THE *MAP*", esc: (d, _u, t) => <Mapa t={t} d={d} encendidas={1} niebla={1} /> },
    { txt: "SON OR *MOVIE?*", esc: () => null },
  ] };
const P5: Parte = { n: 5, tiempos: t5 as Tiempos, equipos: ["1 · 2", "3 · 4 · 5"], siguiente: "FOLLOW FOR THE ANSWERS",
  claves: ["vice", "city", "six", "regions", "test", "launch", "keys", "story", "grassrivers", "swamp", "gellhorn", "ambrosia", "kalaga", "map", "november", "nineteenth", "five", "true", "follow"],
  bloques: [
    { txt: "NOT JUST *VICE CITY*", esc: (d, _u, t) => <Mapa t={t} d={d} encendidas={d < 1.2 ? 1 : 6} foco={0} niebla={d < 1.2 ? 0.8 : 0.3} /> },
    { txt: "WE TEST IT AT *LAUNCH*", esc: (d) => <Seguir d={d} n={5} /> },
    ...[0, 1, 2, 3, 4, 5].map((i) => ({ txt: `*${REGIONES[i].n}*`, num: i + 1, esc: ((d: number, _u: number, t: number) => <Mapa t={t} d={d} encendidas={i + 1} foco={i} />) as Escena })),
    { txt: "EVEN *BIGGER?*", esc: (d, _u, t) => <Mapa t={t} d={d} encendidas={6} niebla={1} tiembla={1} /> },
    { txt: "LAUNCH: *NOV 19*", esc: (d, _u, t) => <Cinco t={t} d={d} /> },
    { txt: "WHICH ONE IS *TRUE?*", esc: (d, _u, t) => <Cinco t={t} d={d} gira /> },
  ] };
export const PARTES = [P1, P2, P3, P4, P5];
export const leoCuadros = (n: number) => Math.round((PARTES[n - 1].tiempos.total + 0.9) * LEO_FPS);

export const LeonidaFiles: React.FC<{ parte: number; limpio?: boolean }> = ({ parte, limpio }) => {
  const P = PARTES[parte - 1], T = P.tiempos.frases, t = useCurrentFrame() / LEO_FPS, seg = P.tiempos.total + 0.9;
  let i = T.findIndex((f, k) => t >= f.a - 0.05 && (k === T.length - 1 || t < T[k + 1].a - 0.05));
  if (i < 0) i = 0;
  const ini = i === 0 ? 0 : T[i].a - 0.05, dur = (i + 1 < T.length ? T[i + 1].a : seg) - ini, d = t - ini, b = P.bloques[i];
  const ultimo = i === T.length - 1 && parte < 5;
  const sacude = t < 0.35 ? 10 * Math.sin(t * 90) : d < 0.12 ? 6 * Math.sin(t * 120) : 0;
  const destello = Math.max(1 - cl(t / 0.18), d < 0.08 && i > 0 ? 0.35 * (1 - d / 0.08) : 0);
  return (
    <AbsoluteFill style={{ background: OSCURO }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Fondo t={t} />
        <g transform={`translate(${sacude} 0)`}>
          {ultimo || (i === T.length - 1 && parte === 5) ? (parte < 5 ? <Cierre d={d} t={t} eq={P.equipos} sig={P.siguiente} /> : b.esc(d, dur, t)) : b.esc(d, dur, t)}
          {b.txt && !limpio && <Rotulo txt={b.txt} num={b.num} d={d} />}
        </g>
        {!limpio && <><Insignia n={parte} />
        <rect x={0} y={0} width={1080 * (t / seg)} height={14} fill={ROSA} />
        <Subtitulos palabras={P.tiempos.palabras} t={t} claves={P.claves} y={1600} tam={84} colActiva={ORO} colClave={ROSA} borde={OSCURO} sombra="#000" /></>}
        {destello > 0 && <rect width={1080} height={1920} fill="#fff" opacity={destello} />}
        {t > seg - 0.4 && <rect width={1080} height={1920} fill="#000" opacity={cl((t - (seg - 0.4)) / 0.4)} />}
      </svg>
    </AbsoluteFill>
  );
};
