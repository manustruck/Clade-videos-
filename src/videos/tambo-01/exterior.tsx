// Escenario principal: la isla y el faro. Mundo de 3200 x 1800; el faro está en x = 2050 y las rocas del oeste en x ≈ 800.
import React from "react";
import { W, H, TINTA, Cam, Camara, Hora, CIELO, MAR, Degradado, Halo, Lluvia, Niebla, azar, lerp, cl } from "./base";
import { Tambo, Chispa, Gesto } from "../../personaje/Tambo";

const ROCA: Record<Hora, [string, string]> = { dia: ["#75604f", "#9a8468"], tarde: ["#3a2c44", "#5a4460"], noche: ["#171629", "#262742"], niebla: ["#5a6067", "#72797f"], amanecer: ["#574957", "#7a6670"] };
export type Pj = { x: number; y: number; s?: number; gesto?: Gesto; voltea?: boolean; brazo?: number; luz?: number };
export type Perra = { x: number; y: number; s?: number; alerta?: boolean; voltea?: boolean; cola?: number };
export type ExtP = {
  cam: Cam; t: number; hora: Hora; haz?: "mar" | "isla" | "off" | "gira"; g?: number; lancha?: number; tambo?: Pj; chispa?: Perra;
  figura?: number; saluda?: number; huellas?: number; rayas?: boolean; raya?: boolean; lluvia?: boolean; niebla?: number; mallas?: boolean; lonas?: boolean; sombra?: number; tiembla?: number;
};
const LX = 2050, LY = 212; // la lámpara

export const Exterior: React.FC<ExtP> = (p) => {
  const { cam, t, hora, haz = "off", g = 0 } = p;
  const noche = hora === "noche", [r0, r1] = ROCA[hora];
  // el haz: de lado se ve como una cuña que se acorta al girar hacia la cámara
  let dir = 1, largo = 0, incl = 4, destello = 0;
  if (haz === "mar") { largo = 2300 * (0.6 + 0.4 * Math.abs(Math.sin(t * Math.PI / 12))); }
  if (haz === "isla") { dir = -1; largo = 1750; incl = 31; }
  if (haz === "gira") { const c = Math.cos(Math.PI * cl(g)); dir = c >= 0 ? 1 : -1; largo = Math.max(140, 2300 * Math.abs(c) * (dir > 0 ? 1 : 0.76)); incl = lerp(4, 31, cl(g)); destello = Math.sin(Math.PI * cl(g)); }
  const ang = (d: number) => [LX + dir * largo * Math.cos((incl + d) * Math.PI / 180), LY + largo * Math.sin((incl + d) * Math.PI / 180)];
  const [h1, h2] = [ang(-5), ang(6)];
  return (
    <g>
      <defs>
        <Degradado id="xc" a={CIELO[hora][0]} b={CIELO[hora][1]} /><Degradado id="xm" a={MAR[hora][0]} b={MAR[hora][1]} />
        <Halo id="xl" color="#fff3b0" /><Halo id="xn" color="#dfe8ff" o={0.5} />
      </defs>
      <Camara cam={cam} tiembla={p.tiembla} t={t}>
        <rect x={-900} y={-900} width={5000} height={2000} fill="url(#xc)" />
        {noche && [...Array(90)].map((_, i) => <circle key={i} cx={azar(i) * 4200 - 500} cy={azar(i + 200) * 950 - 300} r={2 + 4 * azar(i + 9)} fill="#fff" opacity={0.45 + 0.5 * Math.sin(t * 1.6 + i)} />)}
        {noche && <g><circle cx={2620} cy={250} r={330} fill="url(#xn)" /><circle cx={2620} cy={250} r={112} fill="#f0efe2" stroke={TINTA} strokeWidth={6} />
          <circle cx={2580} cy={220} r={24} fill="#d8d7c8" /><circle cx={2660} cy={280} r={16} fill="#d8d7c8" /><circle cx={2640} cy={200} r={10} fill="#d8d7c8" /></g>}
        {hora === "dia" && <circle cx={620} cy={170} r={92} fill="#ffe27a" stroke="#f0a83a" strokeWidth={10} />}
        {(hora === "tarde" || hora === "amanecer") && <circle cx={hora === "tarde" ? 760 : 2760} cy={1010} r={150} fill={hora === "tarde" ? "#ffb35a" : "#ffd9a0"} />}
        {[...Array(6)].map((_, i) => <ellipse key={i} cx={((azar(i + 60) * 4000 + t * (6 + 5 * azar(i))) % 4400) - 600} cy={120 + azar(i + 70) * 420} rx={230 + 160 * azar(i + 3)} ry={46 + 30 * azar(i + 4)} fill={noche ? "#25305a" : hora === "tarde" ? "#7a5a8a" : "#fff"} opacity={noche ? 0.7 : 0.75} />)}
        <path d="M-300 1052 L-120 1000 L40 1052Z M3050 1052 L3260 980 L3500 1052Z" fill={r0} opacity={0.7} />
        <rect x={-900} y={1050} width={5000} height={1300} fill="url(#xm)" />
        {noche && <path d="M2540 1056 h160 l60 420 h-280Z" fill="#dfe8ff" opacity={0.13} />}
        {[...Array(46)].map((_, i) => { const y = 1075 + azar(i) * 620, x = ((azar(i + 30) * 4400 + t * (26 + 30 * azar(i + 5)) * (i % 2 ? 1 : -1)) % 4400 + 4400) % 4400 - 600, k = 0.5 + (y - 1050) / 500; return <path key={i} d={`M${x} ${y} q${30 * k} ${-12 * k} ${60 * k} 0 t${60 * k} 0`} fill="none" stroke={noche ? "#3b56a0" : "#d8f0ff"} strokeWidth={4 * k} strokeLinecap="round" opacity={0.55} />; })}
        {/* la isla */}
        <path d="M340 1130 Q500 1010 690 1000 Q760 936 860 958 Q980 928 1100 950 Q1300 900 1500 905 Q1700 880 1850 832 Q1950 800 2060 800 Q2200 800 2320 830 Q2500 870 2640 960 Q2770 1040 2880 1130 L2880 1230 L340 1230Z" fill={r0} stroke={TINTA} strokeWidth={9} strokeLinejoin="round" />
        <path d="M1500 905 Q1700 880 1850 832 Q1950 800 2060 800 Q2200 800 2320 830 Q2440 856 2560 920 Q2300 880 2060 876 Q1800 880 1500 905Z" fill={r1} />
        <path d="M720 1006 Q860 968 1090 962 Q900 1000 760 1040Z M1150 962 Q1330 920 1480 920 Q1320 950 1200 990Z" fill={r1} opacity={0.8} />
        {[...Array(18)].map((_, i) => <path key={i} d={`M${460 + azar(i) * 2300} ${1010 + azar(i + 11) * 150} l${30 + 50 * azar(i + 2)} ${-10 + 26 * azar(i + 3)}`} stroke={TINTA} strokeWidth={5} strokeLinecap="round" opacity={0.45} />)}
        <path d="M330 1140 q60 -22 120 0 t120 0 M2700 1140 q60 -22 120 0 t110 0" fill="none" stroke="#eaf6ff" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
        {/* rocas del oeste */}
        <g stroke={TINTA} strokeWidth={8} strokeLinejoin="round">
          <path d="M610 1040 Q600 950 690 930 Q770 920 800 1000 L810 1050Z" fill={r1} /><path d="M790 1050 Q800 960 880 950 Q960 950 980 1050Z" fill={r0} /><path d="M930 1055 Q950 1000 1010 1000 Q1060 1010 1070 1058Z" fill={r1} />
        </g>
        {p.rayas && <g stroke="#15131a" strokeWidth={5} strokeLinecap="round">
          {[...Array(34)].map((_, i) => <line key={i} x1={640 + (i % 17) * 9 + Math.floor((i % 17) / 5) * 8} y1={960 + Math.floor(i / 17) * 34} x2={636 + (i % 17) * 9 + Math.floor((i % 17) / 5) * 8} y2={984 + Math.floor(i / 17) * 34} />)}
          {[...Array(20)].map((_, i) => <line key={i} x1={826 + (i % 10) * 10} y1={980 + Math.floor(i / 10) * 30} x2={822 + (i % 10) * 10} y2={1002 + Math.floor(i / 10) * 30} />)}
        </g>}
        {p.raya && <line x1={1150} y1={940} x2={1170} y2={1060} stroke="#f3e6c8" strokeWidth={7} strokeDasharray="16 12" opacity={0.85} />}
        {/* manzanillo */}
        <g stroke={TINTA} strokeWidth={7} strokeLinejoin="round">
          <path d="M1294 912 q-6 -50 10 -86 q14 40 8 86Z" fill="#5a4030" />
          <path d="M1220 836 Q1190 770 1250 742 Q1290 700 1346 734 Q1410 740 1404 800 Q1420 850 1360 856 Q1300 880 1250 858 Q1216 860 1220 836Z" fill={noche ? "#1f3b34" : "#3f8a4a"} />
          {[[1256, 800], [1316, 772], [1366, 814], [1300, 834]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={noche ? "#5d7a45" : "#b9d94a"} strokeWidth={4} />)}
        </g>
        {p.mallas && <g stroke={TINTA} strokeWidth={7}>
          <line x1={1500} y1={905} x2={1500} y2={770} /><line x1={1660} y1={898} x2={1660} y2={764} />
          <rect x={1500} y={780} width={160} height={96} fill="#2a2f3a" fillOpacity={0.35} strokeWidth={5} />
          {[...Array(7)].map((_, i) => <line key={i} x1={1520 + i * 20} y1={780} x2={1520 + i * 20} y2={876} strokeWidth={2} />)}
          {[...Array(4)].map((_, i) => <line key={i} x1={1500} y1={798 + i * 20} x2={1660} y2={798 + i * 20} strokeWidth={2} />)}
          {[...Array(8)].map((_, i) => <circle key={i} cx={1512 + azar(i) * 140} cy={790 + ((azar(i + 5) * 90 + t * 20) % 90)} r={4} fill="#bfe9fb" stroke="none" />)}
          <path d="M1500 880 h160 l-10 22 h-140Z" fill="#6b7480" strokeWidth={5} />
        </g>}
        {/* tanque y lonas para la lluvia */}
        <g stroke={TINTA} strokeWidth={7} strokeLinejoin="round">
          <rect x={2270} y={750} width={110} height={84} rx={12} fill="#5d7f93" /><ellipse cx={2325} cy={752} rx={55} ry={13} fill="#7fa3b6" />
          {p.lonas && <><path d="M2160 640 L2400 700 L2330 748 L2168 700Z" fill="#2f6fb0" /><line x1={2400} y1={700} x2={2400} y2={826} /><path d="M2330 748 v10" stroke="#bfe9fb" strokeWidth={6} /></>}
        </g>
        {/* el faro */}
        <g stroke={TINTA} strokeWidth={9} strokeLinejoin="round">
          <path d="M1940 822 L1976 270 H2124 L2160 822Z" fill="#ebe5d6" />
          <path d="M1966 420 H2134 L2139 500 H1961Z M1953 620 H2147 L2152 700 H1948Z" fill="#b8322a" strokeWidth={6} />
          <rect x={2036} y={330} width={28} height={44} rx={10} fill="#27384a" strokeWidth={6} /><rect x={2036} y={540} width={28} height={44} rx={10} fill="#27384a" strokeWidth={6} />
          <path d="M2024 822 V760 Q2024 738 2050 738 Q2076 738 2076 760 V822Z" fill="#5a3a26" />
          {noche && <path d="M1940 822 L1976 270 H2124 L2160 822Z" fill="#0a1030" opacity={0.5} stroke="none" />}
          <rect x={1948} y={248} width={204} height={24} rx={6} fill="#33333c" />
          {[...Array(9)].map((_, i) => <line key={i} x1={1956 + i * 23.5} y1={248} x2={1956 + i * 23.5} y2={214} strokeWidth={4} />)}<line x1={1950} y1={214} x2={2150} y2={214} strokeWidth={5} />
          <rect x={1992} y={170} width={116} height={80} fill={haz === "off" ? "#bfe0ee" : "#fff3b0"} />
          <path d="M2021 170 v80 M2050 170 v80 M2079 170 v80" strokeWidth={5} />
          <path d="M1980 172 Q2050 84 2120 172Z" fill="#8a221c" /><line x1={2050} y1={128} x2={2050} y2={92} strokeWidth={6} /><circle cx={2050} cy={88} r={9} fill="#8a221c" strokeWidth={5} />
        </g>
        {p.huellas !== undefined && [...Array(15)].map((_, i) => {
          const u = i / 14, x = lerp(2046, 1736, u) + (i % 2 ? 9 : -9), y = lerp(832, 1056, Math.pow(u, 0.8));
          return i / 15 > p.huellas! ? null : <ellipse key={i} cx={x} cy={y} rx={8} ry={5} fill="#1c3550" opacity={0.85} transform={`rotate(-30 ${x} ${y})`} />;
        })}
        {p.lancha !== undefined && <g transform={`translate(${p.lancha} ${1082 + 6 * Math.sin(t * 2.2)}) rotate(${2 * Math.sin(t * 2.2)})`} stroke={TINTA} strokeWidth={7} strokeLinejoin="round">
          <path d="M-150 -20 H150 L120 34 H-116Z" fill="#e9e4d6" /><path d="M-150 -20 H150 L143 -6 H-144Z" fill="#b8322a" strokeWidth={5} />
          <rect x={150} y={-34} width={30} height={56} rx={8} fill="#33333c" />
          <path d="M40 -22 V-84 Q40 -112 66 -112 Q92 -112 92 -84 V-22Z" fill="#3f6fa8" /><circle cx={66} cy={-128} r={26} fill="#d9a26f" /><path d="M38 -134 Q66 -170 96 -134 L112 -128 H38Z" fill="#2a2f3a" strokeWidth={5} />
          <path d={`M176 30 q40 ${-8 - 6 * Math.sin(t * 9)} 90 0 M176 44 q60 ${-10} 130 4`} fill="none" stroke="#eaf6ff" strokeWidth={6} />
        </g>}
        {p.tambo && <g style={noche ? { filter: "brightness(0.8)" } : undefined}><Tambo x={p.tambo.x} y={p.tambo.y} s={p.tambo.s ?? 0.125} gesto={p.tambo.gesto} voltea={p.tambo.voltea} brazo={p.tambo.brazo} luz={p.tambo.luz ?? (noche ? 1 : 0)} /></g>}
        {p.chispa && <g style={noche ? { filter: "brightness(0.8)" } : undefined}><Chispa x={p.chispa.x} y={p.chispa.y} s={p.chispa.s ?? 0.105} alerta={p.chispa.alerta} voltea={p.chispa.voltea} cola={p.chispa.cola ?? Math.sin(t * 6)} /></g>}
        {/* el haz */}
        {largo > 0 && <path d={`M${LX} ${LY} L${h1[0]} ${h1[1]} L${h2[0]} ${h2[1]}Z`} fill="#fff3b0" opacity={noche ? 0.3 : hora === "niebla" ? 0.42 : 0.14} />}
        {p.sombra ? <g opacity={0.6 * p.sombra} fill="#0a0d18"><circle cx={LX + 470} cy={LY + 4} r={30} /><path d={`M${LX + 428} ${LY + 150} Q${LX + 430} ${LY + 36} ${LX + 470} ${LY + 36} Q${LX + 510} ${LY + 36} ${LX + 512} ${LY + 150}Z`} /></g> : null}
        {haz !== "off" && <circle cx={LX} cy={LY} r={150 + 520 * destello} fill="url(#xl)" opacity={0.9} />}
        {p.figura ? <g opacity={p.figura} style={{ filter: "brightness(0.5) saturate(0.7)" }}><Tambo x={770} y={1004} s={0.125} gesto="neutral" luz={0} brazo={0.2 + 0.9 * (p.saluda ?? 0)} voltea /></g> : null}
        {p.niebla ? <><rect x={-900} y={-900} width={5000} height={3200} fill="#aeb9be" opacity={0.3 * p.niebla} /><Niebla t={t} o={0.75 * p.niebla} /></> : null}
      </Camara>
      {p.lluvia && <Lluvia t={t} />}
    </g>
  );
};
export const _dim = [W, H];
