// Interiores y primeros planos del capítulo 1. Cada escenario es un mundo de 1920 x 1080 (la escalera, más alto).
import React from "react";
import { W, H, TINTA, CIRUELA, F, Cam, Camara, Hora, CIELO, MAR, Degradado, Halo, Penumbra, azar, lerp, cl, pr } from "./base";
import { Tambo, Chispa, Gesto, PALETA } from "../../personaje/Tambo";

export const REGLAS = [
  "La luz no se apaga.", "El agua se hierve.", "Chispa duerme adentro.", "Nunca tomes más de lo que juntaste.", "Si parece regalo, no lo toques.",
  "Si Chispa mira, yo no bajo.", "No le contestes al radio.", "No cuentes las huellas.", "No mires cuando la luz gire.", "Si eres tú quien toca, no te abras.",
];
const MANO = "DejaVu Sans, Arial, sans-serif";
const esNoche = (h: Hora) => h === "noche";

// ------------------------------------------------------------------ la sala
export type SalaP = {
  cam: Cam; t: number; hora: Hora; reglas?: number; tambo?: { x: number; gesto?: Gesto; voltea?: boolean; s?: number; brazo?: number }; enCama?: "dormido" | "despierto";
  chispa?: { x: number; estado?: "dormida" | "alerta" | "normal"; voltea?: boolean; cola?: number }; silla?: boolean; tabla?: boolean; golpes?: number; olla?: boolean; fuego?: number; lata?: boolean; haz?: boolean; tiembla?: number;
};
const ChispaDormida: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={CIRUELA} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-150 0 Q-170 -110 -40 -120 Q110 -126 150 -50 Q170 0 120 0Z" fill={PALETA.chispa} />
    <path d="M-60 -116 Q-70 -60 -30 -8 Q30 -4 60 -20 Q30 -70 40 -118Z" fill={PALETA.chaqueta} strokeWidth={8} />
    <path d="M60 -30 Q70 -96 140 -84 Q190 -60 170 -8 Q120 6 60 0Z" fill={PALETA.chispa} /><path d="M80 -84 Q60 -40 96 -30 Q112 -60 110 -90Z" fill="#9c6630" strokeWidth={7} />
    <path d="M124 -48 q14 8 28 0" fill="none" strokeWidth={7} /><ellipse cx={170} cy={-22} rx={12} ry={9} fill={CIRUELA} stroke="none" />
    <path d="M-150 -10 Q-200 -30 -170 -70" fill="none" strokeWidth={18} /><path d="M-150 -10 Q-200 -30 -170 -70" fill="none" strokeWidth={7} stroke={PALETA.chispa} />
  </g>
);
export const Sala: React.FC<SalaP> = (p) => {
  const { cam, t, hora, reglas = 0 } = p, noche = esNoche(hora), g = p.golpes ?? 0;
  const pared = noche ? "#3c4152" : "#b9b3a6", piso = noche ? "#3a2c26" : "#8a6444";
  return (
    <g>
      <defs><Degradado id="sv" a={CIELO[hora][0]} b={CIELO[hora][1]} /><Halo id="sf" color="#ffb347" /></defs>
      <Camara cam={cam} tiembla={p.tiembla} t={t}>
        <rect x={-400} y={-300} width={2720} height={1700} fill={pared} />
        {[...Array(26)].map((_, i) => <path key={i} d={`M${-300 + azar(i) * 2500} ${azar(i + 9) * 800} h${70 + 90 * azar(i + 3)} v${34} h${-(70 + 90 * azar(i + 3))}Z`} fill="none" stroke={TINTA} strokeWidth={4} opacity={0.16} />)}
        <rect x={-400} y={860} width={2720} height={600} fill={piso} stroke={TINTA} strokeWidth={9} />
        {[...Array(12)].map((_, i) => <line key={i} x1={-300 + i * 230} y1={864} x2={-420 + i * 250} y2={1300} stroke={TINTA} strokeWidth={4} opacity={0.35} />)}
        {/* la pared blanca de las reglas */}
        <rect x={320} y={170} width={590} height={560} fill={noche ? "#aaa79f" : "#efeadd"} stroke={TINTA} strokeWidth={7} />
        {REGLAS.slice(0, reglas).map((r, i) => <text key={i} x={346} y={228 + i * 50} fontFamily={MANO} fontStyle="italic" fontWeight={700} fontSize={25} fill="#26221f">{i + 1}. {r}</text>)}
        {/* cocina */}
        <g stroke={TINTA} strokeWidth={8} strokeLinejoin="round">
          <rect x={70} y={640} width={200} height={220} rx={10} fill="#6b7480" /><rect x={90} y={700} width={160} height={110} rx={8} fill="#2a2f3a" /><rect x={60} y={622} width={220} height={24} rx={6} fill="#33333c" />
          <rect x={50} y={300} width={230} height={22} fill="#6b4a35" /><rect x={70} y={236} width={50} height={64} rx={6} fill="#c0392b" /><rect x={132} y={250} width={44} height={50} rx={6} fill="#4f8a55" /><rect x={190} y={230} width={56} height={70} rx={6} fill="#d9c08a" />
          {p.olla && <g><path d="M112 622 v-70 h116 v70Z" fill="#9aa3ad" /><path d="M100 560 h140" strokeWidth={10} />
            {[...Array(5)].map((_, i) => { const u = (t * 0.6 + i / 5) % 1; return <path key={i} d={`M${130 + i * 20} ${540 - u * 150} q14 -18 0 -36 q-14 -18 0 -36`} fill="none" stroke="#fff" strokeWidth={6} opacity={0.6 * (1 - u)} />; })}
            <path d={`M118 632 q10 ${-10 - 6 * Math.sin(t * 18)} 20 0 q10 ${-12 - 6 * Math.cos(t * 15)} 20 0 q10 ${-10 - 5 * Math.sin(t * 20)} 20 0 q10 -12 20 0 q10 -10 20 0`} fill="#4f9be0" stroke="none" /></g>}
          {p.fuego ? <g><circle cx={170} cy={590} r={150 * p.fuego} fill="url(#sf)" opacity={0.8} /><path d={`M140 622 Q${130 + 10 * Math.sin(t * 14)} 560 170 ${520 - 30 * p.fuego} Q${210 + 8 * Math.cos(t * 12)} 560 200 622Z`} fill="#ff8a2a" strokeWidth={6} /><path d="M158 622 Q160 590 172 572 Q186 592 184 622Z" fill="#ffe27a" stroke="none" /></g> : null}
        </g>
        {/* ventana */}
        <g stroke={TINTA} strokeWidth={9}>
          <rect x={990} y={190} width={240} height={290} rx={14} fill="url(#sv)" />
          {noche && [...Array(9)].map((_, i) => <circle key={i} cx={1010 + azar(i) * 200} cy={210 + azar(i + 4) * 150} r={3} fill="#fff" stroke="none" />)}
          <rect x={990} y={400} width={240} height={80} fill={MAR[hora][0]} strokeWidth={0} />
          {p.haz && <path d={`M990 ${250 + 60 * Math.sin(t * 0.52)} L1230 ${230 + 60 * Math.sin(t * 0.52)} L1230 ${300 + 60 * Math.sin(t * 0.52)}Z`} fill="#fff3b0" opacity={0.5} stroke="none" />}
          <rect x={990} y={190} width={240} height={290} rx={14} fill="none" /><line x1={1110} y1={190} x2={1110} y2={480} strokeWidth={7} /><line x1={990} y1={335} x2={1230} y2={335} strokeWidth={7} />
          <rect x={972} y={480} width={276} height={20} rx={5} fill="#6b4a35" strokeWidth={7} />
        </g>
        {/* mesa con el radio y el farol */}
        <g stroke={TINTA} strokeWidth={8} strokeLinejoin="round">
          <rect x={950} y={650} width={320} height={26} rx={6} fill="#7a5237" /><line x1={980} y1={676} x2={980} y2={860} /><line x1={1240} y1={676} x2={1240} y2={860} />
          <rect x={980} y={580} width={120} height={70} rx={10} fill="#3d4654" /><circle cx={1012} cy={615} r={18} fill="#22272f" strokeWidth={5} /><line x1={1086} y1={580} x2={1110} y2={510} strokeWidth={5} /><circle cx={1070} cy={604} r={6} fill="#ff6b4a" stroke="none" />
          {p.lata && <g><rect x={1196} y={592} width={46} height={58} rx={6} fill="#c9ced6" /><rect x={1196} y={606} width={46} height={26} fill="#e2622b" strokeWidth={4} /><text x={1219} y={626} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={17} fill="#fff" stroke="none">365</text></g>}
          <g transform="translate(1150 566)"><path d="M-16 14 Q0 -8 16 14" fill="none" strokeWidth={5} /><rect x={-20} y={14} width={40} height={12} rx={4} fill="#4a4a52" strokeWidth={5} /><rect x={-17} y={26} width={34} height={46} rx={8} fill="#ffd35a" strokeWidth={5} /><path d="M-22 72 h44 l-4 12 h-36Z" fill="#c9a227" strokeWidth={5} /></g>
        </g>
        {/* puerta */}
        <g transform={`translate(${g * 7 * Math.sin(t * 60)} 0)`} stroke={TINTA} strokeWidth={9} strokeLinejoin="round">
          <rect x={1340} y={330} width={210} height={530} rx={10} fill={noche ? "#4a3226" : "#7a5237"} /><path d="M1364 360 h162 v200 h-162Z M1364 600 h162 v230 h-162Z" fill="none" strokeWidth={5} opacity={0.6} />
          <circle cx={1512} cy={610} r={13} fill="#c9a227" strokeWidth={6} /><rect x={1396} y={500} width={98} height={22} rx={6} fill="#33333c" strokeWidth={6} />
        </g>
        {p.silla && <g stroke={TINTA} strokeWidth={9} strokeLinejoin="round" transform="rotate(-9 1400 860)"><path d="M1370 860 V620 M1470 860 V720 M1370 720 H1474 M1370 640 H1420 M1370 680 H1420" fill="none" strokeWidth={14} stroke={TINTA} /><path d="M1370 860 V620 M1470 860 V720 M1370 720 H1474" fill="none" strokeWidth={7} stroke="#b08050" /></g>}
        {/* cama */}
        <g stroke={TINTA} strokeWidth={9} strokeLinejoin="round">
          <rect x={1590} y={700} width={420} height={120} rx={14} fill="#5d7f93" /><rect x={1580} y={640} width={26} height={220} rx={6} fill="#6b4a35" /><path d="M1590 720 Q1800 660 2010 720 V790 H1590Z" fill="#b8322a" /><path d="M1600 760 Q1800 716 2000 760" fill="none" stroke="#f3e6c8" strokeWidth={7} strokeDasharray="20 14" />
          <ellipse cx={1680} cy={690} rx={74} ry={30} fill="#f3e6c8" />
        </g>
        {p.enCama && <g transform="translate(1672 668) rotate(-80)"><Tambo x={0} y={250} s={0.36} soloCabeza gesto={p.enCama === "dormido" ? "alivio" : "miedo"} /></g>}
        {p.tabla && <g stroke={TINTA} strokeWidth={7}><path d="M610 930 h190 l-18 70 h-190Z" fill="#0d0b12" /><path d="M560 900 h190 l-16 44 h-190Z" fill="#a07a50" transform="rotate(-10 650 920)" /><rect x={650} y={944} width={96} height={44} rx={6} fill="#6b4a35" transform="rotate(6 698 966)" /></g>}
        {p.tambo && <Tambo x={p.tambo.x} y={872} s={p.tambo.s ?? 0.54} gesto={p.tambo.gesto} voltea={p.tambo.voltea} brazo={p.tambo.brazo} luz={noche ? 1 : 0} />}
        {p.chispa && (p.chispa.estado === "dormida" ? <ChispaDormida x={p.chispa.x} y={872} s={0.62} />
          : <Chispa x={p.chispa.x} y={872} s={0.5} alerta={p.chispa.estado === "alerta"} voltea={p.chispa.voltea} cola={p.chispa.cola ?? (p.chispa.estado === "alerta" ? -0.6 : Math.sin(t * 7))} />)}
        {noche && <Penumbra id="sp" x={p.tambo ? p.tambo.x + (p.tambo.voltea ? -120 : 120) : 1150} y={p.tambo ? 640 : 600} r={980} ancho={1920} alto={1080} />}
      </Camara>
    </g>
  );
};

// ------------------------------------------------------------------ la pared de reglas (primer plano)
export const Pared: React.FC<{ cam: Cam; t: number; n: number; escribe?: number; resalta?: number; noche?: boolean; tiembla?: number; mancha?: boolean }> = ({ cam, t, n, escribe, resalta, noche, tiembla = 0, mancha }) => (
  <g>
    <Camara cam={cam} t={t}>
      <rect x={-500} y={-400} width={2920} height={1900} fill="#e9e4d6" />
      {[...Array(30)].map((_, i) => <ellipse key={i} cx={azar(i) * 2400 - 240} cy={azar(i + 20) * 1400 - 160} rx={60 + 150 * azar(i + 3)} ry={20 + 50 * azar(i + 4)} fill="#d9d2c0" opacity={0.6} />)}
      {[...Array(14)].map((_, i) => <path key={i} d={`M${azar(i + 50) * 2200 - 150} ${azar(i + 60) * 1200 - 60} l${40 + 80 * azar(i)} ${10 - 20 * azar(i + 1)} l${20 + 40 * azar(i + 2)} ${30 * azar(i + 5)}`} fill="none" stroke="#b9b2a0" strokeWidth={4} />)}
      {mancha && <ellipse cx={980} cy={812} rx={330} ry={34} fill="#a9a294" opacity={0.6} />}
      {REGLAS.slice(0, n).map((r, i) => {
        const ult = i === n - 1 && escribe !== undefined, txt = `${i + 1}. ${r}`, vis = ult ? txt.slice(0, Math.round(txt.length * cl(escribe!))) : txt;
        const dx = ult ? tiembla * Math.sin(t * 40) : 0;
        return <g key={i} transform={`translate(${200 + dx} ${150 + i * 88}) rotate(${-0.8 + 1.6 * azar(i + 7)})`}>
          {resalta === i + 1 && <rect x={-30} y={-62} width={1560} height={84} fill="#ffd23f" opacity={0.25 + 0.12 * Math.sin(t * 5)} />}
          <text fontFamily={MANO} fontStyle="italic" fontWeight={700} fontSize={60} fill="#25211e">{vis}</text>
          <text x={3} y={2} fontFamily={MANO} fontStyle="italic" fontWeight={700} fontSize={60} fill="#25211e" opacity={0.25}>{vis}</text>
          {ult && escribe! < 1 && <g transform={`translate(${vis.length * 31.5 + 10} -14)`} stroke={CIRUELA} strokeWidth={9} strokeLinejoin="round">
            <rect x={-8} y={-30} width={18} height={70} rx={6} fill="#1a1a1e" transform="rotate(24)" /><circle cx={34} cy={54} r={52} fill={PALETA.zapato} /><path d="M-2 46 q16 -22 40 -16" stroke={PALETA.piel} strokeWidth={22} fill="none" strokeLinecap="round" />
            <path d="M60 96 q60 40 90 150" stroke={CIRUELA} strokeWidth={130} fill="none" /><path d="M60 96 q60 40 90 150" stroke={PALETA.chaqueta} strokeWidth={108} fill="none" />
          </g>}
        </g>;
      })}
      {noche && <Penumbra id="pp" x={760} y={150 + (n - 1) * 88} r={1200} ancho={1920} alto={1080} o={0.7} />}
    </Camara>
  </g>
);

// ------------------------------------------------------------------ el cuaderno del otro cuidador
const LETRA = "Bitstream Charter, DejaVu Serif, serif";
export type ModoCuaderno = "cerrado" | "reglas" | "sigue" | "dia211" | "regla7" | "quemada" | "intacta";
export const Cuaderno: React.FC<{ cam: Cam; t: number; modo: ModoCuaderno; noche?: boolean }> = ({ cam, t, modo, noche = true }) => {
  const linea = (x: number, y: number, s: string, o = 1, tam = 40) => <text x={x} y={y} fontFamily={LETRA} fontStyle="italic" fontSize={tam} fill="#1f2a44" opacity={o}>{s}</text>;
  const garabato = (x: number, y: number, k: number) => <path d={`M${x} ${y}` + [...Array(14)].map((_, i) => `q${12 + 8 * azar(k + i)} ${-14 + 28 * azar(k + i + 3)} ${26} 0`).join("")} fill="none" stroke="#1f2a44" strokeWidth={5} opacity={0.5} />;
  return (
    <g>
      <Camara cam={cam} t={t}>
        <rect x={-400} y={-300} width={2720} height={1700} fill="#6b4a35" />
        {[...Array(9)].map((_, i) => <line key={i} x1={-400} y1={-200 + i * 190} x2={2320} y2={-180 + i * 190} stroke={TINTA} strokeWidth={5} opacity={0.35} />)}
        {modo === "cerrado" ? <g stroke={TINTA} strokeWidth={10} strokeLinejoin="round" transform="rotate(-6 960 540)">
          <rect x={620} y={200} width={680} height={700} rx={18} fill="#3f5a48" /><rect x={620} y={200} width={70} height={700} fill="#2c4034" /><rect x={760} y={330} width={400} height={130} rx={8} fill="#e9e1cc" strokeWidth={6} />
          <text x={960} y={410} textAnchor="middle" fontFamily={LETRA} fontStyle="italic" fontSize={56} fill="#1f2a44" stroke="none">Bitácora</text>
          <path d="M600 180 h720 v740 h-720Z" fill="#dff1f7" opacity={0.22} strokeWidth={5} /><path d="M660 240 l140 -40 M1100 880 l160 -60" stroke="#fff" strokeWidth={10} opacity={0.6} />
        </g> : <g stroke={TINTA} strokeWidth={9} strokeLinejoin="round">
          <path d="M250 130 H960 V950 H250Z" fill="#efe6cf" /><path d="M960 130 H1670 V950 H960Z" fill="#f4ecd8" /><line x1={960} y1={130} x2={960} y2={950} strokeWidth={12} />
          {[...Array(13)].map((_, i) => <line key={i} x1={280} y1={230 + i * 54} x2={1640} y2={230 + i * 54} stroke="#9bb0c8" strokeWidth={3} />)}
          <g stroke="none">
            {modo === "reglas" && <>{linea(300, 222, "Regla 1: La luz no se apaga.")}{linea(300, 330, "Regla 2: El agua se hierve.")}{linea(300, 438, "Regla 3: El perro duerme adentro.")}{garabato(1000, 222, 1)}{garabato(1000, 330, 9)}</>}
            {modo === "sigue" && <>{linea(300, 222, "Regla 4: ")}{garabato(480, 216, 2)}{linea(300, 330, "Regla 5: ")}{garabato(480, 324, 5)}{linea(300, 438, "Regla 6: ")}{garabato(480, 432, 8)}
              {linea(1000, 222, "Regla 7: ")}{garabato(1180, 216, 11)}{linea(1000, 330, "Regla 8: ")}{garabato(1180, 324, 14)}{linea(1000, 438, "Regla 9: ")}{garabato(1180, 432, 17)}</>}
            {(modo === "dia211" || modo === "intacta") && <>{garabato(300, 222, 3)}{garabato(300, 330, 6)}{garabato(300, 438, 12)}{linea(1000, 240, "Día 211", 1, 84)}</>}
            {modo === "regla7" && <>{linea(300, 222, "Regla 6: Si el perro mira, yo no bajo.", 0.8, 34)}{linea(1000, 240, "Regla 7:", 1, 60)}{linea(1000, 348, "No le contestes al radio.", 1, 50)}</>}
            {modo === "quemada" && <>{garabato(300, 222, 3)}{garabato(300, 330, 6)}<path d="M960 130 H1300 Q1260 300 1340 420 Q1240 560 1320 700 Q1230 820 1290 950 H960Z" fill="#f4ecd8" stroke={TINTA} strokeWidth={8} /><path d="M1300 130 Q1260 300 1340 420 Q1240 560 1320 700 Q1230 820 1290 950" fill="none" stroke="#3a2418" strokeWidth={16} /></>}
          </g>
        </g>}
        {noche && <Penumbra id="cp" x={960} y={500} r={1150} ancho={1920} alto={1080} o={0.72} />}
      </Camara>
    </g>
  );
};

// ------------------------------------------------------------------ la sala del lente
export const Lente: React.FC<{ cam: Cam; t: number; hora: Hora; tambo?: { x: number; gesto?: Gesto; voltea?: boolean; brazo?: number }; chispa?: number; giro?: number; quieto?: boolean; tiembla?: number }> = ({ cam, t, hora, tambo, chispa, giro, quieto, tiembla }) => {
  const fase = giro !== undefined ? giro * Math.PI : quieto ? 0.4 : t * Math.PI / 6;
  return (
    <g>
      <defs><Degradado id="lv" a={CIELO[hora][0]} b={CIELO[hora][1]} /><Halo id="lh" color="#fff3b0" /></defs>
      <Camara cam={cam} t={t} tiembla={tiembla}>
        <rect x={-400} y={-300} width={2720} height={1700} fill="#23262f" />
        {[0, 1, 2, 3, 4, 5].map((i) => <g key={i} stroke={TINTA} strokeWidth={10}>
          <rect x={60 + i * 310} y={120} width={250} height={600} fill="url(#lv)" /><rect x={60 + i * 310} y={560} width={250} height={160} fill={MAR[hora][0]} strokeWidth={0} /><rect x={60 + i * 310} y={120} width={250} height={600} fill="none" />
        </g>)}
        {esNoche(hora) && [...Array(30)].map((_, i) => <circle key={i} cx={70 + azar(i) * 1780} cy={140 + azar(i + 8) * 380} r={3} fill="#fff" opacity={0.7} />)}
        <path d={`M960 440 L${960 + 1500 * Math.cos(fase)} ${360} L${960 + 1500 * Math.cos(fase)} ${520}Z`} fill="#fff3b0" opacity={0.28 * Math.abs(Math.cos(fase)) + 0.05} />
        <rect x={-400} y={720} width={2720} height={700} fill="#3a3d48" stroke={TINTA} strokeWidth={9} />
        <g stroke={TINTA} strokeWidth={10} strokeLinejoin="round">
          <rect x={800} y={800} width={320} height={130} rx={14} fill="#4b4f5e" /><rect x={840} y={760} width={240} height={44} rx={8} fill="#6b7480" /><circle cx={1070} cy={866} r={30} fill="#c9a227" strokeWidth={7} /><line x1={1070} y1={866} x2={1070 + 26 * Math.cos(fase * 6)} y2={866 + 26 * Math.sin(fase * 6)} strokeWidth={6} />
          <circle cx={960} cy={450} r={420} fill="url(#lh)" stroke="none" opacity={0.7} />
          <ellipse cx={960} cy={450} rx={230} ry={320} fill="#cdeef8" fillOpacity={0.55} />
          {[0.84, 0.68, 0.52, 0.36].map((k) => <ellipse key={k} cx={960} cy={450} rx={230 * k} ry={320 * k} fill="none" strokeWidth={6} />)}
          {[-250, -170, -90, 90, 170, 250].map((dy) => <path key={dy} d={`M${960 - 230 * Math.sqrt(1 - (dy / 320) ** 2)} ${450 + dy} H${960 + 230 * Math.sqrt(1 - (dy / 320) ** 2)}`} strokeWidth={5} opacity={0.7} />)}
          <ellipse cx={960} cy={450} rx={44} ry={64} fill="#fff8d0" strokeWidth={6} />
          <rect x={940 + 200 * Math.sin(fase)} y={170} width={36} height={560} rx={18} fill="#fff" opacity={0.35} stroke="none" />
        </g>
        {tambo && <Tambo x={tambo.x} y={1010} s={0.6} gesto={tambo.gesto} voltea={tambo.voltea} brazo={tambo.brazo} luz={0} farol={false} />}
        {chispa !== undefined && <Chispa x={chispa} y={1010} s={0.52} voltea cola={Math.sin(t * 6)} />}
        {esNoche(hora) && <rect x={-400} y={-300} width={2720} height={1700} fill="#060818" opacity={0.3} />}
      </Camara>
    </g>
  );
};

// ------------------------------------------------------------------ la escalera (mundo alto)
export const Escalera: React.FC<{ cam: Cam; t: number; sube: number }> = ({ cam, t, sube }) => (
  <g>
    <Camara cam={cam} t={t}>
      <rect x={-400} y={-400} width={2720} height={4400} fill="#3c4152" />
      <rect x={520} y={-400} width={880} height={4400} fill="#565c70" stroke={TINTA} strokeWidth={10} />
      {[...Array(40)].map((_, i) => <path key={i} d={`M${540 + azar(i) * 760} ${-300 + azar(i + 5) * 4100} h${80 + 60 * azar(i + 2)} v40 h${-(80 + 60 * azar(i + 2))}Z`} fill="none" stroke={TINTA} strokeWidth={4} opacity={0.25} />)}
      {[...Array(26)].map((_, i) => { const y = 3500 - i * 130, izq = i % 2 === 0; return <path key={i} d={izq ? `M520 ${y} h430 l-40 46 h-390Z` : `M1400 ${y} h-430 l40 46 h390Z`} fill="#8a8f9e" stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />; })}
      {[700, 1900, 3000].map((y, i) => <rect key={i} x={i % 2 ? 1250 : 590} y={y} width={70} height={110} rx={30} fill="#bfe0ee" stroke={TINTA} strokeWidth={8} />)}
      <Chispa x={lerp(700, 1180, (sube * 6) % 1 < 0.5 ? (sube * 12) % 1 : 1 - ((sube * 12) % 1))} y={3500 - sube * 2600 - 420} s={0.42} cola={Math.sin(t * 9)} voltea={(sube * 6) % 1 >= 0.5} />
      <Tambo x={lerp(1150, 760, (sube * 5) % 1 < 0.5 ? (sube * 10) % 1 : 1 - ((sube * 10) % 1))} y={3500 - sube * 2500 + Math.abs(Math.sin(t * 7)) * -10} s={0.42} gesto="neutral" brazo={0.6} />
      <rect x={-400} y={-400} width={2720} height={4400} fill="#0a0d1c" opacity={0.28} />
    </Camara>
  </g>
);

// ------------------------------------------------------------------ la orilla: pesca y lobos marinos
export const Orilla: React.FC<{ cam: Cam; t: number; hora: Hora; pesca?: boolean; tambo?: boolean }> = ({ cam, t, hora, pesca, tambo = true }) => (
  <g>
    <defs><Degradado id="oc" a={CIELO[hora][0]} b={CIELO[hora][1]} /><Degradado id="om" a={MAR[hora][0]} b={MAR[hora][1]} /></defs>
    <Camara cam={cam} t={t}>
      <rect x={-400} y={-300} width={2720} height={900} fill="url(#oc)" />
      <circle cx={1500} cy={560} r={130} fill="#ffe0a8" />
      <rect x={-400} y={560} width={2720} height={900} fill="url(#om)" />
      {[...Array(30)].map((_, i) => { const y = 590 + azar(i) * 300, x = ((azar(i + 9) * 2600 + t * 40 * (i % 2 ? 1 : -1)) % 2600 + 2600) % 2600 - 300; return <path key={i} d={`M${x} ${y} q30 -12 60 0 t60 0`} fill="none" stroke="#eaf6ff" strokeWidth={5} opacity={0.6} strokeLinecap="round" />; })}
      <path d="M-400 900 Q200 780 700 840 Q1000 790 1300 860 Q1700 820 2320 900 V1400 H-400Z" fill="#5a4a52" stroke={TINTA} strokeWidth={10} />
      <path d="M-400 960 Q300 880 800 930 Q1300 900 2320 980 V1400 H-400Z" fill="#473a44" />
      {/* lobos marinos */}
      {[[1380, 850, 1], [1590, 880, -0.86]].map(([x, y, k], i) => <g key={i} transform={`translate(${x} ${y}) scale(${k} ${Math.abs(k)})`} stroke={CIRUELA} strokeWidth={9} strokeLinejoin="round">
        <path d="M-150 0 Q-130 -70 -20 -70 Q40 -80 60 -150 Q70 -200 120 -196 Q170 -186 160 -130 Q150 -60 110 0Z" fill="#6b5a52" /><path d="M-150 0 q-40 -6 -50 -34 q40 4 60 20" fill="#6b5a52" />
        <circle cx={128} cy={-158} r={7} fill={CIRUELA} stroke="none" /><ellipse cx={162} cy={-140} rx={9} ry={7} fill={CIRUELA} stroke="none" /><path d="M150 -128 l26 6 M150 -122 l24 14" strokeWidth={3} />
        <path d="M40 -10 q30 14 50 6" fill="none" strokeWidth={7} />
      </g>)}
      {/* iguana marina */}
      <g transform="translate(360 880)" stroke={CIRUELA} strokeWidth={8} strokeLinejoin="round"><path d="M-120 0 Q-60 -40 40 -34 Q90 -50 120 -30 Q110 -8 80 -6 L40 0Z" fill="#3b4038" /><path d="M-120 0 q-70 4 -110 26" fill="none" strokeWidth={10} /><path d="M-40 -34 l8 -16 l8 14 l8 -16 l8 14 l8 -14 l8 14" fill="none" strokeWidth={5} /><circle cx={98} cy={-32} r={5} fill="#f3e6c8" stroke="none" /></g>
      {tambo && <Tambo x={860} y={900} s={0.5} gesto="neutral" brazo={0.8} farol={false} />}
      {pesca && <g stroke={CIRUELA}><path d="M984 610 Q1120 420 1250 520" fill="none" strokeWidth={8} /><path d={`M1250 520 V${640 + 10 * Math.sin(t * 3)}`} strokeWidth={3} /><circle cx={1250} cy={646 + 10 * Math.sin(t * 3)} r={9} fill="#e2622b" strokeWidth={4} /></g>}
      <Chispa x={600} y={905} s={0.42} cola={Math.sin(t * 7)} />
    </Camara>
  </g>
);

// ------------------------------------------------------------------ el radio
export const Radio: React.FC<{ cam: Cam; t: number; on: number; bateria?: boolean; noche?: boolean }> = ({ cam, t, on, bateria = true, noche = true }) => (
  <g>
    <Camara cam={cam} t={t}>
      <rect x={-400} y={-300} width={2720} height={1700} fill="#3c4152" />
      <rect x={-400} y={760} width={2720} height={700} fill="#7a5237" stroke={TINTA} strokeWidth={10} />
      <g stroke={TINTA} strokeWidth={12} strokeLinejoin="round">
        <line x1={1280} y1={330} x2={1420} y2={70} strokeWidth={9} /><circle cx={1422} cy={66} r={12} fill="#c9ced6" strokeWidth={6} />
        <rect x={520} y={330} width={880} height={440} rx={34} fill="#3d4654" />
        <circle cx={760} cy={550} r={170} fill="#22272f" />{[40, 80, 120].map((r) => <circle key={r} cx={760} cy={550} r={r} fill="none" strokeWidth={5} opacity={0.5} />)}
        <rect x={1010} y={400} width={320} height={130} rx={14} fill={on > 0 ? "#bff2c8" : "#8fa39a"} />
        {[...Array(17)].map((_, i) => { const a = on * (20 + 80 * Math.abs(Math.sin(t * (9 + i * 1.7) + i * 2.1))); return <line key={i} x1={1030 + i * 17.5} y1={465 - a / 2} x2={1030 + i * 17.5} y2={465 + a / 2} stroke="#1f5a2c" strokeWidth={8} strokeLinecap="round" />; })}
        <circle cx={1070} cy={640} r={44} fill="#c9a227" /><line x1={1070} y1={640} x2={1096} y2={612} strokeWidth={8} /><circle cx={1220} cy={640} r={44} fill="#6b7480" />
        <circle cx={1330} cy={372} r={13} fill={on > 0 ? "#ff5a3c" : "#5a2a22"} strokeWidth={6} />
        {!bateria && <g><rect x={1500} y={640} width={220} height={110} rx={16} fill="#2a2f3a" /><rect x={1720} y={672} width={22} height={46} rx={6} fill="#c9ced6" strokeWidth={7} /><path d="M1560 680 h60 M1590 660 v40" stroke="#ffd23f" strokeWidth={10} /><path d="M1400 700 q50 30 100 0" fill="none" strokeWidth={7} strokeDasharray="14 12" /></g>}
      </g>
      {on > 0 && [...Array(3)].map((_, i) => { const u = (t * 0.9 + i / 3) % 1; return <circle key={i} cx={760} cy={550} r={180 + 260 * u} fill="none" stroke="#fff" strokeWidth={8} opacity={0.4 * on * (1 - u)} />; })}
      {noche && <Penumbra id="rp" x={960} y={520} r={1200} ancho={1920} alto={1080} o={0.66} />}
    </Camara>
  </g>
);

// ------------------------------------------------------------------ primer plano de un personaje
const FONDO: Record<string, [string, string]> = { sala: ["#4a4f62", "#2c3040"], dia: ["#7fc4ea", "#d6eef8"], noche: ["#0a1030", "#1d2c5a"], niebla: ["#8f9ea6", "#b9c4c8"], amanecer: ["#4a5a9a", "#f7b98a"], oscuro: ["#05070f", "#10142a"] };
export const Plano: React.FC<{ t: number; u: number; quien?: "tambo" | "chispa" | "doble"; gesto?: Gesto; fondo?: string; zoom?: [number, number]; mira?: [number, number]; saluda?: number; ladra?: boolean; tiembla?: number; farol?: boolean; lado?: number }> =
  ({ t, u, quien = "tambo", gesto = "neutral", fondo = "sala", zoom = [1, 1.12], mira, saluda = 0, ladra, tiembla = 0, farol = true, lado = 0 }) => {
    const z = lerp(zoom[0], zoom[1], u), [a, b] = FONDO[fondo] ?? FONDO.sala, oscuro = fondo === "noche" || fondo === "oscuro" || fondo === "sala";
    return (
      <g>
        <defs><Degradado id="pf" a={a} b={b} /></defs>
        <rect width={W} height={H} fill="url(#pf)" />
        {[...Array(7)].map((_, i) => <ellipse key={i} cx={azar(i) * W} cy={azar(i + 5) * H} rx={260 + 200 * azar(i + 2)} ry={120 + 90 * azar(i + 3)} fill="#fff" opacity={0.05} />)}
        <g transform={`translate(${W / 2 + lado + tiembla * Math.sin(t * 67)} ${H / 2 + tiembla * Math.cos(t * 79)}) scale(${z}) translate(${-W / 2} ${-H / 2})`}>
          {quien === "chispa"
            ? <g transform={`translate(0 ${ladra ? -14 * Math.abs(Math.sin(t * 16)) : 0})`}><Chispa x={560} y={1150} s={2.6} alerta cola={-0.4} />
              {ladra && <g stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 16)}><path d="M1340 420 l120 -50 M1370 520 l140 0 M1340 620 l120 60" /></g>}</g>
            : <g style={quien === "doble" ? { filter: "brightness(0.42) saturate(0.6)" } : undefined}><Tambo x={960} y={1620} s={1.5} gesto={gesto} mira={mira} brazo={quien === "doble" ? 0.2 + saluda : 0.55} luz={quien === "doble" ? 0 : oscuro ? 1 : 0} farol={farol} /></g>}
        </g>
        {oscuro && quien !== "doble" && <Penumbra id="plp" x={quien === "chispa" ? 900 : 1300} y={700} r={1300} ancho={W} alto={H} o={0.62} />}
        {quien === "doble" && <rect width={W} height={H} fill="#fff3b0" opacity={0.08 + 0.05 * Math.sin(t * 3)} />}
      </g>
    );
  };

// ------------------------------------------------------------------ huellas mojadas en la entrada
export const Huellas: React.FC<{ cam: Cam; t: number; hora: Hora; n?: number; zapatos?: boolean; cascabel?: boolean; coincide?: number }> = ({ cam, t, hora, n = 1, zapatos, cascabel, coincide }) => {
  const huella = (x: number, y: number, k: number, key: number, o = 0.8) => <g key={key} transform={`translate(${x} ${y}) rotate(${k > 0 ? 8 : -8}) scale(${1 - (780 - y) / 1400})`} fill="#24405e" opacity={o}>
    <path d="M-26 40 Q-34 -20 -20 -56 Q0 -76 22 -56 Q36 -10 24 40 Q0 62 -26 40Z" />{[-22, -10, 3, 15, 26].map((d, i) => <circle key={i} cx={d} cy={-78 - 6 * Math.sin(i * 1.3)} r={9 - Math.abs(i - 1.5) * 1.2} />)}
  </g>;
  return (
    <g>
      <defs><Degradado id="hm" a={MAR[hora][0]} b={MAR[hora][1]} /></defs>
      <Camara cam={cam} t={t}>
        <rect x={-400} y={-300} width={2720} height={500} fill="url(#hm)" />
        <path d="M-400 190 q120 -30 240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0 t240 0" fill="none" stroke="#eaf6ff" strokeWidth={12} opacity={0.8} />
        <rect x={-400} y={200} width={2720} height={1200} fill={hora === "noche" ? "#3a3d48" : "#8a8478"} />
        {[...Array(9)].map((_, i) => <path key={i} d={`M${-300 + i * 300} 200 l${-60 + 30 * azar(i)} 1200`} stroke={TINTA} strokeWidth={6} opacity={0.4} />)}
        {[330, 520, 760].map((y, i) => <path key={i} d={`M-400 ${y} q700 ${20 - 40 * azar(i)} 1400 0 t1400 0`} fill="none" stroke={TINTA} strokeWidth={6} opacity={0.4} />)}
        {[...Array(9)].map((_, i) => i / 9 < n ? huella(960 + (i % 2 ? 62 : -62) - i * 6, 940 - i * 84, i % 2 ? 1 : -1, i) : null)}
        {coincide !== undefined && <g transform={`translate(${1022} ${lerp(1200, 944, coincide)})`} stroke={CIRUELA} strokeWidth={10} strokeLinejoin="round"><path d="M-44 60 V-50 Q-44 -92 0 -92 Q44 -92 44 -50 V60Z" fill={PALETA.zapato} /><path d="M-52 60 h104 v26 h-104Z" fill={PALETA.crema} /></g>}
        {zapatos && <g stroke={CIRUELA} strokeWidth={11} strokeLinejoin="round">
          {[820, 1010].map((x) => <g key={x} transform={`translate(${x} 960)`}><path d="M-60 -10 V-250 H70 V-10Z" fill={PALETA.pantalon} /><path d="M-66 80 V-20 Q-66 -70 0 -70 Q70 -70 74 -20 V80Z" fill={PALETA.zapato} /><path d="M-76 80 h160 v34 h-160Z" fill={PALETA.crema} /></g>)}
          {cascabel && <g transform={`translate(1100 890) rotate(${6 * Math.sin(t * 3)})`}><path d="M-70 -30 h80" stroke="#b8322a" strokeWidth={9} /><circle cx={20} cy={-10} r={30} fill="#ffd35a" /><path d="M2 -6 h36 M20 -6 v20" strokeWidth={6} /></g>}
        </g>}
        {hora === "noche" && <rect x={-400} y={-300} width={2720} height={1700} fill="#060818" opacity={0.4} />}
      </Camara>
    </g>
  );
};

// ------------------------------------------------------------------ detalles
export const Tanque: React.FC<{ t: number; u: number; nivel: number; lluvia?: boolean }> = ({ t, u, nivel, lluvia }) => (
  <g>
    <rect width={W} height={H} fill={lluvia ? "#6f8494" : "#9cc7e0"} />
    <g transform={`translate(${W / 2} ${H / 2}) scale(${lerp(1, 1.1, u)}) translate(${-W / 2} ${-H / 2})`} stroke={TINTA} strokeWidth={12} strokeLinejoin="round">
      <path d="M300 120 L1300 330 L1120 470 L330 300Z" fill="#2f6fb0" /><path d="M1120 470 v60" stroke="#bfe9fb" strokeWidth={14} />
      <rect x={880} y={500} width={560} height={480} rx={30} fill="#5d7f93" /><ellipse cx={1160} cy={505} rx={280} ry={52} fill="#7fa3b6" />
      <rect x={910} y={980 - 420 * nivel} width={500} height={420 * nivel - 10} rx={18} fill="#4f9be0" opacity={0.75} stroke="none" />
      {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={1380} y1={980 - 420 * k} x2={1430} y2={980 - 420 * k} strokeWidth={8} />)}
      <g stroke="#15131a" strokeWidth={9} strokeLinecap="round">{[...Array(12)].map((_, i) => <line key={i} x1={300 + i * 30 + Math.floor(i / 5) * 24} y1={620} x2={292 + i * 30 + Math.floor(i / 5) * 24} y2={700} opacity={i / 12 < u + 0.3 ? 1 : 0} />)}</g>
    </g>
    {lluvia && [...Array(70)].map((_, i) => { const x = azar(i) * 2100 - 100, y = ((azar(i + 40) * H + t * (900 + 500 * azar(i + 7))) % (H + 100)) - 50; return <line key={i} x1={x} y1={y} x2={x - 16} y2={y + 46} stroke="#dff1fb" strokeWidth={4} strokeLinecap="round" opacity={0.6} />; })}
  </g>
);
export const Arbol: React.FC<{ t: number; u: number }> = ({ t, u }) => (
  <g>
    <rect width={W} height={H} fill="#9cd0ee" /><rect y={820} width={W} height={260} fill="#75604f" stroke={TINTA} strokeWidth={10} />
    <g transform={`translate(${W / 2} ${H / 2}) scale(${lerp(1, 1.14, u)}) translate(${-W / 2} ${-H / 2})`} stroke={TINTA} strokeWidth={12} strokeLinejoin="round">
      <path d="M900 860 q-30 -240 40 -420 q70 200 50 420Z" fill="#5a4030" />
      <path d="M520 470 Q400 250 620 150 Q760 10 960 110 Q1200 60 1310 240 Q1500 360 1380 520 Q1300 640 1080 600 Q900 690 700 610 Q520 620 520 470Z" fill="#3f8a4a" />
      {[[640, 420], [820, 300], [1010, 480], [1190, 360], [940, 200], [1260, 500], [720, 560]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y + 8 * Math.sin(t * 2 + i)})`}><circle r={44} fill="#b9d94a" strokeWidth={8} /><path d="M0 -44 q6 -22 22 -26" fill="none" strokeWidth={6} /><circle cx={-14} cy={-12} r={9} fill="#e6f5a0" stroke="none" /></g>)}
      <g transform="translate(1480 700)"><path d="M0 -110 L120 100 H-120Z" fill="#ffd23f" /><rect x={-10} y={-50} width={20} height={80} rx={8} fill={TINTA} stroke="none" /><circle cx={0} cy={62} r={12} fill={TINTA} stroke="none" /></g>
    </g>
  </g>
);
export const Lata: React.FC<{ t: number; u: number; noche?: boolean }> = ({ t, u, noche }) => (
  <g>
    <rect width={W} height={H} fill={noche ? "#2c3040" : "#b9b3a6"} /><rect y={800} width={W} height={280} fill="#7a5237" stroke={TINTA} strokeWidth={10} />
    <g transform={`translate(${W / 2} ${H / 2}) scale(${lerp(1, 1.16, u)}) translate(${-W / 2} ${-H / 2})`} stroke={TINTA} strokeWidth={12} strokeLinejoin="round">
      {[430, 620].map((x) => <g key={x}><rect x={x} y={560} width={150} height={240} rx={16} fill="#c9ced6" /><rect x={x} y={620} width={150} height={110} fill="#3f8fd2" strokeWidth={6} /></g>)}
      <rect x={860} y={420} width={260} height={380} rx={22} fill="#c9ced6" /><ellipse cx={990} cy={424} rx={130} ry={26} fill="#e4e8ee" /><rect x={860} y={510} width={260} height={190} fill="#e2622b" strokeWidth={8} />
      <text x={990} y={646} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={104} fill="#fff" stroke={TINTA} strokeWidth={10} paintOrder="stroke">365</text>
      <path d="M1250 800 q40 -150 180 -150 q120 0 150 150Z" fill="#f3e6c8" />{[...Array(12)].map((_, i) => <circle key={i} cx={1290 + azar(i) * 250} cy={700 + azar(i + 4) * 80} r={7} fill="#fff" stroke="none" />)}
    </g>
    {noche && <Penumbra id="lp" x={990} y={600} r={1100} ancho={W} alto={H} o={0.6} />}
    <g opacity={0}>{t}</g>
  </g>
);
export const Olla: React.FC<{ t: number; u: number; papel?: number }> = ({ t, u, papel }) => (
  <g>
    <rect width={W} height={H} fill="#2c3040" /><defs><Halo id="of" color="#ff9a3a" /></defs>
    <g transform={`translate(${W / 2} ${H / 2}) scale(${lerp(1, 1.12, u)}) translate(${-W / 2} ${-H / 2})`} stroke={TINTA} strokeWidth={12} strokeLinejoin="round">
      <rect x={380} y={760} width={1160} height={400} rx={20} fill="#6b7480" /><rect x={340} y={720} width={1240} height={56} rx={12} fill="#33333c" />
      <circle cx={960} cy={700} r={420} fill="url(#of)" stroke="none" opacity={0.8} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${720 + i * 60} 720 q${14 * Math.sin(t * 13 + i)} -50 ${30} ${-80 - 26 * Math.sin(t * 9 + i * 2)} q20 40 30 80Z`} fill={i % 2 ? "#ffb347" : "#4f9be0"} strokeWidth={5} />)}
      {papel === undefined ? <g><path d="M640 640 V380 H1280 V640 Q960 700 640 640Z" fill="#9aa3ad" /><path d="M560 400 h800" strokeWidth={20} /><ellipse cx={960} cy={392} rx={320} ry={36} fill="#4f9be0" />
        {[...Array(12)].map((_, i) => { const k = (t * 1.4 + azar(i)) % 1; return <circle key={i} cx={700 + azar(i + 3) * 520} cy={400 - 12 * Math.sin(k * Math.PI)} r={10 + 16 * k} fill="#bfe9fb" strokeWidth={5} opacity={1 - k} />; })}
        {[...Array(6)].map((_, i) => { const k = (t * 0.5 + i / 6) % 1; return <path key={i} d={`M${760 + i * 80} ${360 - k * 300} q30 -40 0 -80 q-30 -40 0 -80`} fill="none" stroke="#fff" strokeWidth={12} opacity={0.6 * (1 - k)} />; })}</g>
        : <g transform={`translate(960 ${560 - 40 * papel}) rotate(${-8 + 6 * Math.sin(t * 2)})`}><path d={`M-200 -150 H200 V${150 - 240 * papel} Q100 ${190 - 240 * papel} 0 ${150 - 240 * papel} Q-100 ${110 - 240 * papel} -200 ${150 - 240 * papel}Z`} fill="#f4ecd8" /><text x={0} y={-60} textAnchor="middle" fontFamily={LETRA} fontStyle="italic" fontSize={70} fill="#1f2a44" stroke="none">Día 211</text>
          <path d={`M-200 ${150 - 240 * papel} Q-100 ${110 - 240 * papel} 0 ${150 - 240 * papel} Q100 ${190 - 240 * papel} 200 ${150 - 240 * papel}`} fill="none" stroke="#ff8a2a" strokeWidth={22} /></g>}
    </g>
  </g>
);
export const Mallas: React.FC<{ t: number; u: number }> = ({ t, u }) => (
  <g>
    <rect width={W} height={H} fill="#a9b6bc" />
    <g transform={`translate(${W / 2} ${H / 2}) scale(${lerp(1, 1.12, u)}) translate(${-W / 2} ${-H / 2})`} stroke={TINTA} strokeLinejoin="round">
      <line x1={360} y1={1100} x2={360} y2={120} strokeWidth={26} /><line x1={1560} y1={1100} x2={1560} y2={120} strokeWidth={26} />
      <rect x={360} y={170} width={1200} height={620} fill="#2a2f3a" fillOpacity={0.28} strokeWidth={10} />
      {[...Array(23)].map((_, i) => <line key={i} x1={410 + i * 50} y1={170} x2={410 + i * 50} y2={790} strokeWidth={3} />)}{[...Array(11)].map((_, i) => <line key={i} x1={360} y1={222 + i * 52} x2={1560} y2={222 + i * 52} strokeWidth={3} />)}
      {[...Array(40)].map((_, i) => { const k = (t * (0.12 + 0.2 * azar(i)) + azar(i + 4)) % 1; return <ellipse key={i} cx={390 + azar(i + 9) * 1140} cy={190 + k * 600} rx={8} ry={10 + 8 * k} fill="#dff4fb" strokeWidth={3} />; })}
      <path d="M340 800 h1240 l-40 80 h-1160Z" fill="#6b7480" strokeWidth={12} /><path d="M940 880 v90" stroke="#4f9be0" strokeWidth={16} /><rect x={830} y={960} width={220} height={140} rx={16} fill="#5d7f93" strokeWidth={12} />
    </g>
    {[...Array(8)].map((_, i) => <ellipse key={i} cx={((azar(i) * 2400 + t * (30 + 30 * azar(i + 3))) % 2700) - 400} cy={150 + azar(i + 9) * 800} rx={520} ry={130} fill="#e3eaed" opacity={0.42} />)}
  </g>
);

/** tarjeta de día sobre negro */
export const Tarjeta: React.FC<{ texto: string; u: number; t: number }> = ({ texto, u, t }) => {
  const o = Math.min(pr(u, 0, 0.18), 1 - pr(u, 0.86, 1));
  return (
    <g>
      <rect width={W} height={H} fill="#06070d" />
      <g opacity={o} transform={`translate(${W / 2} ${H / 2}) scale(${0.96 + 0.08 * u})`} fontFamily={F} fontWeight={800} textAnchor="middle">
        <text y={40} fontSize={210} fill="#f3e6c8" letterSpacing={8}>{texto}</text>
        <line x1={-260 * pr(u, 0.05, 0.4)} y1={96} x2={260 * pr(u, 0.05, 0.4)} y2={96} stroke="#b8322a" strokeWidth={12} strokeLinecap="round" />
        <circle cx={0} cy={-190} r={14 + 3 * Math.sin(t * 6)} fill="#ffd35a" />
      </g>
    </g>
  );
};
export const _h = H;
