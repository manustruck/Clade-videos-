// Las 7 escenas de «El virus zombi». `t` es el tiempo global en segundos (voz en public/virus-zombie/voz.mp3).
// La cámara nunca se queda quieta: cada escena lleva un acercamiento lento además de sus movimientos.
import React from "react";
import { W, H, TINTA, CIRUELA, cl, pr, lerp, ventana, azar, mezcla, mancha, Camara, Cifra, Virus, Cientifica, Ameba, Reno, Hielo, Nieve, OjosOscuros } from "./piezas";

type E = React.FC<{ t: number }>;
const F = "DejaVu Sans, Arial, sans-serif";

// ------------------------------------------------ 1 · gancho: el virus despierta (0–8.7 s)
export const E1: E = ({ t }) => {
  const lab = pr(t, 5.65, 6.1), grietas = pr(t, 1.2, 4.4), derrite = pr(t, 4.0, 5.9), abre = pr(t, 5.2, 5.45);
  const tiembla = t > 5.2 && t < 5.6 ? Math.sin(t * 95) * 9 * (1 - (t - 5.2) / 0.4) : 0;
  return (
    <g>
      <rect width={W} height={H} fill="#0b1622" />
      {lab < 1 && <g opacity={1 - lab}>
        <Camara cx={540 + tiembla} cy={960} zoom={lerp(1, 1.16, t / 5.7)}>
          <defs><clipPath id="lente"><circle cx={540} cy={960} r={470} /></clipPath></defs>
          <circle cx={540} cy={960} r={505} fill="#16283a" stroke={TINTA} strokeWidth={22} />
          <g clipPath="url(#lente)">
            <circle cx={540} cy={960} r={470} fill="#bfe4f2" />
            {[...Array(14)].map((_, i) => <circle key={i} cx={120 + azar(i) * 840} cy={560 + ((azar(i + 20) * 800 - t * 30 * (0.5 + azar(i + 7))) % 800 + 800) % 800} r={8 + 16 * azar(i + 4)} fill="#e6f7fd" stroke="#8cc3d8" strokeWidth={4} />)}
            <Hielo x={540} y={960} lado={470} derrite={derrite} grietas={grietas}>
              <Virus x={0} y={10} s={1.3} ojos={abre} frio={1 - 0.85 * derrite} boca={abre > 0.5 ? "bostezo" : "cosida"} />
            </Hielo>
          </g>
          <path d="M210 700 A440 440 0 0 1 420 540" fill="none" stroke="#fff" strokeWidth={16} strokeLinecap="round" opacity={0.55} />
        </Camara>
      </g>}
      {lab > 0 && <g opacity={lab}>
        <Camara cx={lerp(560, 600, pr(t, 5.6, 8.9))} cy={980} zoom={lerp(1.0, 1.13, pr(t, 5.6, 8.9))}>
          <rect x={-200} y={-200} width={1500} height={2400} fill="#27485c" />
          <rect x={80} y={300} width={420} height={500} rx={18} fill="#dcecf5" stroke={TINTA} strokeWidth={12} />
          <path d="M80 660 Q200 600 300 650 T500 620 V800 H80Z" fill="#fff" />
          <line x1={290} y1={300} x2={290} y2={800} stroke={TINTA} strokeWidth={10} />
          <g transform="translate(80 300)"><Nieve t={t} n={18} alto={500} /></g>
          <rect x={-200} y={1400} width={1500} height={900} fill="#7a5237" stroke={TINTA} strokeWidth={12} />
          <g stroke={TINTA} strokeWidth={10} strokeLinejoin="round">
            <rect x={150} y={1330} width={300} height={70} rx={14} fill="#39424e" />
            <path d="M210 1330 V1050 H330" fill="none" strokeWidth={34} /><path d="M210 1330 V1050 H330" fill="none" strokeWidth={16} stroke="#5d6b7a" />
            <rect x={300} y={1010} width={70} height={190} rx={12} fill="#5d6b7a" />
            <ellipse cx={335} cy={1300} rx={110} ry={26} fill="#dff4fb" />
          </g>
          <Virus x={335} y={1250} s={0.42} ojos={1} boca="risa" giro={8 * Math.sin(t * 5)} mira={[1, -0.4]} />
          <Cientifica x={740} y={1000} s={1.22} boca="risa" brazo={pr(t, 6.1, 6.7)} frasco cierra={t > 7.6 && t < 7.8} />
        </Camara>
      </g>}
      <Cifra texto="48,500 años" sub="congelado" o={ventana(t, 2.2, 5.5)} color="#ffd23f" />
    </g>
  );
};

// ------------------------------------------------ 2 · Siberia: bajo el lago (8.7–17.9 s)
const CAPAS = ["#5d7f93", "#4b6c82", "#6a8fa3", "#3f5f75", "#56788d", "#476880", "#5f8499", "#3b5a70", "#52748a", "#44657c"];
const Hueso: React.FC<{ x: number; y: number; g: number; s?: number }> = ({ x, y, g, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${g}) scale(${s})`} stroke={TINTA} strokeWidth={6} fill="#ece6d4">
    <rect x={-50} y={-9} width={100} height={18} rx={9} /><circle cx={-54} cy={-10} r={13} /><circle cx={-54} cy={10} r={13} /><circle cx={54} cy={-10} r={13} /><circle cx={54} cy={10} r={13} />
  </g>
);
export const E2: E = ({ t }) => {
  const baja = pr(t, 10.2, 16.3), sube = pr(t, 17.25, 17.95) * 520;
  const cy = lerp(930, 3900, baja) - 30 * pr(t, 8.7, 10.2) - sube * 0.5;
  const broca = lerp(2700, 3740, pr(t, 16.3, 17.2)) - sube;
  return (
    <g>
      <rect width={W} height={H} fill="#cfe6f2" />
      <Camara cx={540} cy={cy} zoom={lerp(1, 1.06, pr(t, 8.7, 10.2)) + 0.08 * pr(t, 15.5, 17.9)}>
        <rect x={-200} y={-400} width={1500} height={1300} fill="#cfe6f2" />
        <circle cx={820} cy={470} r={120} fill="#ffb45a" stroke={TINTA} strokeWidth={10} />
        <path d="M-200 700 Q100 560 360 660 T800 640 T1300 690 V900 H-200Z" fill="#eef5f8" stroke={TINTA} strokeWidth={8} />
        <rect x={-200} y={760} width={1500} height={250} fill="#f7fbfd" />
        <g stroke={TINTA} strokeWidth={8} fill="none" strokeLinejoin="round">
          <path d="M860 760 L905 560 L950 760 M875 700 H935 M888 640 H922" /><line x1={905} y1={560} x2={905} y2={520} />
        </g>
        {[[760, 0], [1010, 1]].map(([x, i]) => <g key={i} stroke={CIRUELA} strokeWidth={7} strokeLinecap="round">
          <line x1={x} y1={730} x2={x} y2={770} /><path d={`M${x - 16} 730 q16 -34 32 0Z`} fill={i ? "#f08a24" : "#3f8fd2"} /><circle cx={x} cy={694} r={15} fill="#f6c9a0" />
        </g>)}
        <rect x={-200} y={900} width={1500} height={700} fill="#7a5a44" />
        <path d="M160 860 Q540 780 920 860 V1380 Q540 1560 160 1380Z" fill="#3d8cc4" stroke={TINTA} strokeWidth={10} />
        <ellipse cx={540} cy={860} rx={380} ry={62} fill="#6dbbe6" stroke={TINTA} strokeWidth={8} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${300 + i * 150} ${1000 + i * 90} q30 -20 60 0 t60 0`} fill="none" stroke="#bfe6fa" strokeWidth={7} strokeLinecap="round" />)}
        {CAPAS.map((c, i) => <path key={i} d={`M-200 ${1560 + i * 300} Q160 ${1520 + i * 300 + 40 * azar(i)} 540 ${1565 + i * 300} T1300 ${1550 + i * 300} V${1900 + i * 300} H-200Z`} fill={c} stroke={TINTA} strokeWidth={7} />)}
        {[...Array(26)].map((_, i) => <path key={i} d={`M${azar(i) * 1000 + 20} ${1650 + azar(i + 30) * 2700} l${30 + 40 * azar(i + 5)} ${-14 + 28 * azar(i + 8)}`} stroke="#cfeaf5" strokeWidth={6} strokeLinecap="round" opacity={0.5} />)}
        <Hueso x={230} y={1840} g={-20} /><Hueso x={860} y={2050} g={35} s={0.8} /><Hueso x={180} y={3350} g={12} s={0.9} /><Hueso x={900} y={3560} g={-40} />
        {/* mamut atrapado en el hielo */}
        <g transform="translate(520 2450)" stroke={TINTA} strokeWidth={9} strokeLinejoin="round" opacity={0.92}>
          <rect x={-190} y={60} width={64} height={190} rx={22} fill="#6d4c3a" /><rect x={90} y={60} width={64} height={190} rx={22} fill="#6d4c3a" />
          <ellipse cx={-20} cy={20} rx={250} ry={170} fill="#8a6248" />
          <circle cx={200} cy={-70} r={120} fill="#8a6248" />
          <path d="M270 -20 Q330 120 250 210 Q230 170 262 110 Q250 40 220 10Z" fill="#8a6248" />
          <path d="M210 10 Q360 80 380 -40" fill="none" stroke="#f1ead6" strokeWidth={22} strokeLinecap="round" />
          <path d="M228 -100 l14 14 M242 -100 l-14 14" strokeWidth={7} fill="none" />
          <path d="M-250 -60 q-20 60 10 120 M-150 -130 q-30 40 -20 100 M-40 -148 q-20 50 0 110" fill="none" stroke="#5c3f2e" strokeWidth={8} />
        </g>
        <rect x={150} y={2180} width={760} height={560} rx={60} fill="#bfe9fb" fillOpacity={0.3} stroke="#e8f8ff" strokeWidth={8} />
        {/* neandertal y la huella de su mano */}
        <g transform="translate(560 3130)" stroke={TINTA} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" opacity={0.92}>
          <line x1={-30} y1={150} x2={-40} y2={250} /><line x1={30} y1={150} x2={40} y2={250} />
          <path d="M-80 10 Q-96 150 -60 160 H60 Q96 150 80 10Z" fill="#a8703f" />
          <path d="M80 30 Q150 0 170 -90" fill="none" /><rect x={150} y={-200} width={36} height={130} rx={16} fill="#6b4a35" transform="rotate(14 168 -130)" />
          <ellipse cx={0} cy={-70} rx={104} ry={96} fill="#d9a26f" />
          <path d="M-100 -96 Q0 -200 100 -96 Q0 -128 -100 -96Z" fill="#3a2a22" /><path d="M-62 -86 H62" strokeWidth={12} />
          <path d="M-46 -62 l12 12 M-34 -62 l-12 12 M34 -62 l12 12 M46 -62 l-12 12" strokeWidth={6} fill="none" />
          <path d="M-70 -20 Q0 60 70 -20 Q0 20 -70 -20Z" fill="#3a2a22" />
        </g>
        <rect x={250} y={2920} width={620} height={500} rx={60} fill="#bfe9fb" fillOpacity={0.3} stroke="#e8f8ff" strokeWidth={8} />
        {/* la broca y el virus dormido */}
        {t > 16.25 && <g>
          <rect x={518} y={1600} width={44} height={broca - 1600} fill="#8b97a3" stroke={TINTA} strokeWidth={8} />
          <path d={`M500 ${broca} h80 l-40 70Z`} fill="#c9d2da" stroke={TINTA} strokeWidth={8} />
        </g>}
        <g transform={`translate(0 ${-sube})`}>
          <Hielo x={540} y={3950} lado={400}>
            <Virus x={0} y={6} s={1.05} ojos={0} frio={1} giro={3 * Math.sin(t * 2)} />
          </Hielo>
          {[0, 1, 2].map((i) => { const u = ((t * 0.5 + i / 3) % 1); return <text key={i} x={700 + 50 * u} y={3830 - 150 * u} fontFamily={F} fontWeight={800} fontSize={40 + 30 * u} fill="#fff" stroke={TINTA} strokeWidth={8} paintOrder="stroke" opacity={Math.sin(u * Math.PI)}>z</text>; })}
        </g>
      </Camara>
      <Cifra texto="Siberia" sub="bajo un lago" o={ventana(t, 8.9, 11.6)} />
    </g>
  );
};

// ------------------------------------------------ 3 · el laboratorio: despierta e infecta (17.9–27.7 s)
export const E3: E = ({ t }) => {
  const derrite = pr(t, 18.6, 21.5), abre = pr(t, 21.55, 21.85), salto = pr(t, 23.7, 24.45), verde = pr(t, 24.4, 25.0);
  const vx = lerp(560, 770, salto), vy = 1130 - 190 * Math.sin(Math.PI * salto), vs = 0.95 * (1 - pr(t, 24.25, 24.5));
  const ax = lerp(1150, 770, pr(t, 22.5, 23.2)) + (t > 23.2 && t < 24.4 ? 6 * Math.sin(t * 60) : 0);
  const prensa = pr(t, 25.1, 25.6);
  return (
    <g>
      <rect width={W} height={H} fill="#2c4f63" />
      <Camara cx={lerp(520, 590, pr(t, 17.9, 25))} cy={lerp(1000, 1080, pr(t, 17.9, 22))} zoom={lerp(1, 1.16, pr(t, 17.9, 25.2))}>
        <rect x={-300} y={-300} width={1700} height={2600} fill="#2c4f63" />
        <rect x={640} y={250} width={360} height={440} rx={18} fill="#bfe0f2" stroke={TINTA} strokeWidth={12} />
        <path d="M820 300 L800 520 Q790 600 760 690 H880 Q850 600 840 520Z M786 560 H854 M776 620 H864" fill="none" stroke="#35566b" strokeWidth={9} strokeLinejoin="round" />
        <rect x={-300} y={1500} width={1700} height={900} fill="#7a5237" stroke={TINTA} strokeWidth={12} />
        <Cientifica x={170} y={1010} s={1.05} boca={t > 21.5 ? "o" : "sonrisa"} brazo={0.55} cierra={t > 19.6 && t < 19.8} />
        <defs><clipPath id="caja"><circle cx={640} cy={1130} r={350} /></clipPath></defs>
        <circle cx={640} cy={1130} r={372} fill="#16283a" stroke={TINTA} strokeWidth={16} />
        <g clipPath="url(#caja)">
          <circle cx={640} cy={1130} r={350} fill="#dff4fb" />
          {[...Array(9)].map((_, i) => <circle key={i} cx={330 + azar(i) * 620} cy={830 + azar(i + 11) * 600} r={10 + 14 * azar(i + 2)} fill="#eefaff" stroke="#a9d6e6" strokeWidth={4} />)}
          <Ameba x={ax} y={1130} s={1.05} t={t} verde={verde} susto={t > 23 && t < 24.5} />
          {vs > 0.02 && <Hielo x={vx} y={vy} lado={330} derrite={derrite} grietas={pr(t, 18.2, 19.6)}>
            <Virus x={0} y={0} s={vs} ojos={abre} frio={1 - derrite} boca={t > 22.6 ? "risa" : abre > 0.5 ? "bostezo" : "cosida"} mira={[t > 22.6 ? 1 : 0, 0]} giro={t > 21.9 && t < 23.6 ? 7 * Math.sin(t * 9) : 0} />
          </Hielo>}
        </g>
        <path d="M400 900 A340 340 0 0 1 540 800" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.6} />
      </Camara>
      {prensa > 0 && <g>
        <rect width={W} height={H} fill="#0b1622" opacity={0.6 * prensa} />
        {[[-9, 0.0], [7, 0.12], [-2, 0.26]].map(([ang, ret], i) => {
          const p = pr(t, 25.1 + ret, 25.65 + ret);
          return p <= 0 ? null : (
            <g key={i} transform={`translate(540 ${940 + i * 14}) rotate(${ang + (1 - p) * 540}) scale(${p * (1 + 0.05 * pr(t, 25.6, 27.9))})`}>
              <rect x={-390} y={-520} width={780} height={1040} fill="#f3ecd9" stroke={TINTA} strokeWidth={12} />
              {i === 2 && <g>
                <text x={0} y={-370} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={92} fill={TINTA}>¡VIRUS ZOMBI!</text>
                <line x1={-340} y1={-320} x2={340} y2={-320} stroke={TINTA} strokeWidth={8} />
                <rect x={-340} y={-280} width={420} height={470} fill="#cfe6f2" stroke={TINTA} strokeWidth={8} />
                <Virus x={-130} y={-40} s={1.25} ojos={1} boca="risa" giro={6 * Math.sin(t * 6)} />
                {[...Array(9)].map((_, k) => <line key={k} x1={120} y1={-260 + k * 52} x2={340 - 60 * azar(k)} y2={-260 + k * 52} stroke="#8d8573" strokeWidth={14} strokeLinecap="round" />)}
                {[...Array(5)].map((_, k) => <line key={k} x1={-340} y1={250 + k * 52} x2={340 - 120 * azar(k + 9)} y2={250 + k * 52} stroke="#8d8573" strokeWidth={14} strokeLinecap="round" />)}
              </g>}
            </g>
          );
        })}
      </g>}
    </g>
  );
};

// ------------------------------------------------ 4 · por suerte / por desgracia (27.7–33.6 s)
const DORMIDOS = [[230, 2560, 1.0], [800, 2700, 1.3], [470, 2960, 0.8], [160, 3180, 1.2], [860, 3260, 0.9], [560, 3420, 1.5], [300, 3640, 1.0], [780, 3760, 1.1], [520, 3900, 0.9]];
export const E4: E = ({ t }) => {
  const baja = pr(t, 30.2, 32.3);
  return (
    <g>
      <rect width={W} height={H} fill="#dff4fb" />
      <Camara cx={540} cy={lerp(960, 3080, baja)} zoom={lerp(1, 1.08, pr(t, 27.7, 30.2)) + 0.1 * pr(t, 31.5, 33.8)}>
        <rect x={-200} y={-300} width={1500} height={2300} fill="#dff4fb" />
        {[...Array(12)].map((_, i) => <circle key={i} cx={azar(i) * 1080} cy={200 + azar(i + 13) * 1500} r={14 + 22 * azar(i + 5)} fill="#eefaff" stroke="#a9d6e6" strokeWidth={5} />)}
        <Ameba x={540} y={860} s={2.3} t={t} verde={1} />
        <Cientifica x={250} y={1500} s={0.85} boca="sonrisa" brazo={0.9} cierra />
        <rect x={-200} y={1960} width={1500} height={90} fill="#7a5237" stroke={TINTA} strokeWidth={12} />
        <rect x={-200} y={2050} width={1500} height={2600} fill="#0c2233" />
        {[...Array(8)].map((_, i) => <path key={i} d={`M-200 ${2300 + i * 260} Q200 ${2260 + i * 260 + 60 * azar(i)} 540 ${2310 + i * 260} T1300 ${2290 + i * 260}`} fill="none" stroke="#163a52" strokeWidth={10} />)}
        {DORMIDOS.map(([x, y, s], i) => <g key={i}>
          <path d={mancha(x, y, 120 * s, 10, 0.16, i * 2.1)} fill="#123048" stroke="#1d4a66" strokeWidth={7} />
          <OjosOscuros x={x} y={y - 10} s={s} abre={0.05 + 0.55 * pr(t, 31.6 + i * 0.16, 33.3 + i * 0.05)} />
        </g>)}
      </Camara>
      <Cifra texto="Solo amebas" sub="no infecta personas" o={ventana(t, 28.3, 30.3)} color="#b8ff5a" />
    </g>
  );
};

// ------------------------------------------------ 5 · 2016: el reno y el ántrax (33.6–44 s)
export const E5: E = ({ t }) => {
  const derrite = pr(t, 34.0, 38.8), pan = pr(t, 39.2, 41.2);
  const yNieve = lerp(1060, 1475, derrite);
  return (
    <g>
      <rect width={W} height={H} fill="#ffb25e" />
      <Camara cx={lerp(540, 1560, pan)} cy={lerp(1000, 1080, pr(t, 33.6, 39))} zoom={lerp(1, 1.14, pr(t, 33.6, 39.2)) - 0.1 * pan + 0.06 * pr(t, 41.2, 44.2)}>
        <rect x={-400} y={-400} width={3200} height={1700} fill="#ffb25e" />
        <rect x={-400} y={-400} width={3200} height={700} fill="#ff8f4a" opacity={0.5} />
        <g transform="translate(560 520)">
          {[...Array(12)].map((_, i) => <line key={i} x1={0} y1={-230} x2={0} y2={-300 - 30 * Math.sin(t * 4 + i)} stroke="#fff1a8" strokeWidth={22} strokeLinecap="round" transform={`rotate(${i * 30 + t * 12})`} />)}
          <circle r={190 + 8 * Math.sin(t * 5)} fill="#fff1a8" stroke="#f08a24" strokeWidth={16} />
        </g>
        <path d="M-400 1080 Q0 900 420 1040 T1200 1000 T2000 1050 T2800 1010 V1300 H-400Z" fill="#e58a4a" stroke={TINTA} strokeWidth={8} />
        <rect x={-400} y={1200} width={3200} height={1100} fill="#6f5038" />
        <g transform="translate(470 1290)"><Reno x={0} y={0} s={1.45} helado caido={1} /></g>
        <path d={`M-400 ${yNieve} Q100 ${yNieve - 40 * (1 - derrite)} 540 ${yNieve} T1500 ${yNieve - 10} T2800 ${yNieve} V1480 H-400Z`} fill="#eaf7fd" stroke={TINTA} strokeWidth={9} />
        <rect x={-400} y={1478} width={3200} height={900} fill="#6f5038" /><line x1={-400} y1={1480} x2={2800} y2={1480} stroke={TINTA} strokeWidth={9} />
        {[...Array(7)].map((_, i) => { const p = pr(t, 34.6 + i * 0.5, 36 + i * 0.5); return <ellipse key={i} cx={-100 + i * 420 + 200 * azar(i)} cy={1560 + 160 * azar(i + 3)} rx={110 * p} ry={22 * p} fill="#7fc4e8" stroke={TINTA} strokeWidth={6} />; })}
        {[...Array(10)].map((_, i) => { const u = (t * 1.3 + azar(i)) % 1; return derrite < 0.98 ? <ellipse key={i} cx={-200 + azar(i + 40) * 2600} cy={yNieve + 20 + u * (1470 - yNieve)} rx={7} ry={13} fill="#7fc4e8" /> : null; })}
        {t > 37.6 && [...Array(7)].map((_, i) => <circle key={i} cx={520 + 170 * Math.sin(t * (3 + azar(i) * 2) + i * 2)} cy={1300 + 90 * Math.cos(t * (4 + azar(i + 5)) + i)} r={7} fill={TINTA} />)}
        {/* esporas del ántrax hacia el rebaño */}
        {[...Array(44)].map((_, i) => {
          const u = cl((t - 39.0 - azar(i) * 1.6) / 2.4);
          return u <= 0 || u >= 1 ? null : <circle key={i} cx={lerp(540, 1250 + azar(i + 60) * 760, u)} cy={1290 - 170 * Math.sin(u * Math.PI) - 60 * azar(i + 70) + 26 * Math.sin(t * 5 + i)} r={8 + 9 * azar(i + 80)} fill="#8ee05a" stroke={CIRUELA} strokeWidth={4} opacity={Math.sin(u * Math.PI)} />;
        })}
        {/* carpa de los pastores */}
        <g stroke={TINTA} strokeWidth={10} strokeLinejoin="round">
          <path d="M1980 1010 L1790 1480 H2170Z" fill="#c96a3a" /><path d="M1980 1010 L1930 1480 H2030Z" fill="#3a2418" /><path d="M1960 1010 l20 -50 l20 50" fill="none" />
        </g>
        {[[2230, 1.0, "#3f6fa8"], [2320, 0.62, "#c0392b"]].map(([x, s, c], i) => <g key={i} transform={`translate(${x} ${1480 - 230 * (s as number)}) scale(${s})`} stroke={CIRUELA} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
          <line x1={-22} y1={150} x2={-24} y2={228} /><line x1={22} y1={150} x2={24} y2={228} />
          <path d="M-58 20 Q-70 150 -44 160 H44 Q70 150 58 20Z" fill={c as string} />
          <circle cx={0} cy={-40} r={70} fill="#e9d6bd" /><circle cx={0} cy={-34} r={50} fill="#f6c9a0" />
          <circle cx={-18} cy={-38} r={6} fill={CIRUELA} stroke="none" /><circle cx={18} cy={-38} r={6} fill={CIRUELA} stroke="none" /><ellipse cx={0} cy={-12} rx={8} ry={10} fill="#7a2230" strokeWidth={5} />
        </g>)}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const g = pr(t, 40.9 + i * 0.36, 41.5 + i * 0.36), c = pr(t, 41.2 + i * 0.36, 41.9 + i * 0.36);
          return <Reno key={i} x={1220 + i * 118 + 30 * azar(i)} y={1250 + (i % 2) * 70} s={0.72} gris={g} caido={c} paso={c > 0 ? 0 : t * 4 + i} voltea={i % 3 === 1} />;
        })}
      </Camara>
      <Cifra texto="2016" sub="ola de calor en Siberia" o={ventana(t, 33.9, 38.9)} />
      <Cifra texto="+2,000 renos" sub="y un niño" o={ventana(t, 41.3, 43.9)} color="#ffd23f" />
    </g>
  );
};

// ------------------------------------------------ 6 · fíjate: el congelador (44–50 s)
export const E6: E = ({ t }) => {
  const abre = pr(t, 44.25, 45.3), pausa = ventana(t, 47.5, 50.3, 0.18);
  return (
    <g>
      <rect width={W} height={H} fill="#2a8c8c" />
      <Camara cx={540} cy={lerp(980, 700, pr(t, 44, 49))} zoom={lerp(1, 1.42, pr(t, 44, 50.2))}>
        <rect x={-300} y={-300} width={1700} height={2500} fill="#2a8c8c" />
        {[...Array(9)].map((_, i) => <line key={i} x1={-300} y1={i * 190} x2={1400} y2={i * 190} stroke="#237878" strokeWidth={6} />)}
        {[...Array(9)].map((_, i) => <line key={i} x1={-200 + i * 190} y1={-300} x2={-200 + i * 190} y2={1560} stroke="#237878" strokeWidth={6} />)}
        <rect x={-300} y={1560} width={1700} height={700} fill="#c9a27a" stroke={TINTA} strokeWidth={12} />
        <rect x={250} y={330} width={580} height={1240} rx={34} fill="#e3eaee" stroke={TINTA} strokeWidth={14} />
        <rect x={278} y={372} width={524} height={540} rx={18} fill="#123044" stroke={TINTA} strokeWidth={10} />
        <line x1={278} y1={730} x2={802} y2={730} stroke="#2c5d7a" strokeWidth={10} />
        <g stroke={TINTA} strokeWidth={8} strokeLinejoin="round">
          <rect x={300} y={760} width={150} height={130} rx={18} fill="#4fae4a" />
          {[[340, 800], [380, 840], [410, 795], [350, 855]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill="#b8ff5a" strokeWidth={4} />)}
          <path d="M640 890 V790 Q710 730 780 790 V890Z" fill="#ff9ec4" /><rect x={630} y={770} width={160} height={30} rx={10} fill="#fff" />
          {[[470, 850], [530, 870], [585, 845]].map(([x, y], i) => <rect key={i} x={x} y={y} width={44} height={40} rx={8} fill="#bfe9fb" />)}
        </g>
        <Hielo x={540} y={560} lado={300}><Virus x={0} y={0} s={0.82} ojos={0.12} frio={1} boca="bostezo" /></Hielo>
        {[...Array(8)].map((_, i) => { const u = (t * 0.35 + azar(i)) % 1; return abre > 0.4 ? <ellipse key={i} cx={320 + azar(i + 4) * 440} cy={900 + u * 320} rx={80 + 60 * u} ry={26 + 20 * u} fill="#fff" opacity={0.35 * (1 - u) * abre} /> : null; })}
        <rect x={278} y={952} width={524} height={580} rx={18} fill="#f4f8fa" stroke={TINTA} strokeWidth={10} /><rect x={740} y={1010} width={26} height={170} rx={13} fill="#9fb2bd" stroke={TINTA} strokeWidth={7} />
        <g transform={`translate(278 0) scale(${lerp(1, -0.5, abre)} 1)`}>
          <rect x={0} y={372} width={524} height={540} rx={18} fill={abre > 0.55 ? "#cfd9de" : "#f4f8fa"} stroke={TINTA} strokeWidth={10} />
          <rect x={462} y={560} width={26} height={170} rx={13} fill="#9fb2bd" stroke={TINTA} strokeWidth={7} />
        </g>
        {pausa > 0 && <g transform={`translate(540 560) scale(${0.7 + 0.3 * pausa})`} opacity={pausa} stroke={TINTA} strokeWidth={12} fill="#fff">
          <rect x={-78} y={-88} width={54} height={176} rx={14} /><rect x={24} y={-88} width={54} height={176} rx={14} />
        </g>}
      </Camara>
    </g>
  );
};

// ------------------------------------------------ 7 · el congelador del mundo se apaga (50–60 s)
const FINALES = [[220, 420], [840, 520], [400, 760], [760, 880], [180, 1100], [900, 1240], [330, 1400], [700, 1560], [520, 300]];
export const E7: E = ({ t }) => {
  const sube = pr(t, 50.4, 54.3), tira = pr(t, 55.5, 56.5);
  const apagado = t < 55.9 ? 0 : t < 57.0 ? (Math.sin(t * 46) > 0 ? 0.35 : 0.95) : 1;
  const negro = pr(t, 57.25, 57.85), px = lerp(934, 800, tira), py = lerp(1150, 1060, tira);
  return (
    <g>
      <rect width={W} height={H} fill="#0a1030" />
      <Camara cx={540} cy={lerp(960, 820, pr(t, 54.6, 57.8))} zoom={lerp(1, 1.1, pr(t, 50, 54.6)) + 0.5 * pr(t, 56.2, 57.9)}>
        <rect x={-300} y={-300} width={1700} height={2600} fill="#0a1030" />
        {[...Array(40)].map((_, i) => <circle key={i} cx={azar(i) * 1300 - 100} cy={azar(i + 90) * 1100 - 100} r={2 + 4 * azar(i + 7)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 2 + i)} />)}
        <circle cx={540} cy={1700} r={800} fill="#2f7fc4" stroke={TINTA} strokeWidth={14} />
        <path d={mancha(330, 1330, 190, 10, 0.2, 1)} fill="#5cae4a" stroke={TINTA} strokeWidth={9} />
        <path d={mancha(800, 1420, 150, 10, 0.22, 3)} fill="#5cae4a" stroke={TINTA} strokeWidth={9} />
        <path d={mancha(560, 1650, 230, 12, 0.18, 5)} fill="#5cae4a" stroke={TINTA} strokeWidth={9} />
        <path d="M250 950 Q540 800 830 950 Q700 1010 540 1000 Q380 1010 250 950Z" fill="#f4fbff" stroke={TINTA} strokeWidth={10} />
        {/* cable, enchufe y toma */}
        <path d={`M740 880 Q900 900 ${px - 20} ${py + 110} Q${px - 40} ${py + 40} ${px} ${py}`} fill="none" stroke={TINTA} strokeWidth={16} strokeLinecap="round" />
        <rect x={900} y={1100} width={130} height={150} rx={20} fill="#e3eaee" stroke={TINTA} strokeWidth={10} />
        <path d="M940 1150 v50 M990 1150 v50" stroke={TINTA} strokeWidth={12} strokeLinecap="round" />
        <g transform={`translate(${px} ${py})`} stroke={TINTA} strokeWidth={9}>
          <rect x={-34} y={-30} width={68} height={60} rx={14} fill="#f08a24" /><path d="M20 -12 h30 M20 12 h30" strokeWidth={10} strokeLinecap="round" transform="rotate(38)" />
        </g>
        {t > 55.5 && t < 56.3 && [...Array(6)].map((_, i) => <line key={i} x1={950} y1={1160} x2={950 - 70 * Math.cos(i * 1.1) * (t - 55.4)} y2={1160 - 90 * Math.sin(i * 1.1 + 0.4) * (t - 55.4) * 1.6} stroke="#ffd23f" strokeWidth={9} strokeLinecap="round" />)}
        {/* el congelador sobre el Ártico */}
        <rect x={330} y={600} width={420} height={340} rx={30} fill="#eef4f7" stroke={TINTA} strokeWidth={14} />
        <rect x={364} y={636} width={352} height={236} rx={16} fill={mezcla("#bdf0ff", "#0b1a26", apagado)} stroke={TINTA} strokeWidth={10} />
        <g opacity={1 - apagado} stroke="#fff" strokeWidth={10} strokeLinecap="round">
          {[0, 60, 120].map((a) => <line key={a} x1={540 - 70} y1={754} x2={540 + 70} y2={754} transform={`rotate(${a} 540 754)`} />)}
        </g>
        {apagado > 0.9 && [[450, 750, 0.7], [610, 770, 0.9]].map(([x, y, s], i) => <OjosOscuros key={i} x={x} y={y} s={s} abre={pr(t, 56.7 + i * 0.3, 57.2 + i * 0.3)} />)}
        <rect x={500} y={892} width={80} height={22} rx={11} fill="#9fb2bd" stroke={TINTA} strokeWidth={7} />
        {[380, 470, 600, 690].map((x, i) => <path key={i} d={`M${x} 940 l14 ${50 + 20 * azar(i)} l14 ${-50 - 20 * azar(i)}Z`} fill="#bfe9fb" stroke={TINTA} strokeWidth={6} />)}
        {t > 55.9 && [...Array(9)].map((_, i) => { const u = (t * 0.9 + azar(i)) % 1; return <ellipse key={i} cx={360 + azar(i + 30) * 360} cy={950 + u * 240} rx={8} ry={15} fill="#7fc4e8" opacity={1 - u} />; })}
        {/* termómetro */}
        <g stroke={TINTA} strokeWidth={10}>
          <rect x={120} y={520} width={64} height={420} rx={32} fill="#f4f8fa" />
          <rect x={136} y={900 - 340 * lerp(0.2, 1, sube)} width={32} height={340 * lerp(0.2, 1, sube) + 20} rx={16} fill="#ff5a3c" stroke="none" />
          <circle cx={152} cy={960} r={56} fill="#ff5a3c" />
        </g>
      </Camara>
      <Cifra texto="×4" sub="más rápido que el planeta" o={ventana(t, 51.4, 54.7)} color="#ff6b4a" />
      {negro > 0 && <g>
        <rect width={W} height={H} fill="#03070b" opacity={negro} />
        <g transform={`translate(540 960) scale(${1 + 0.07 * pr(t, 57.6, 60)}) translate(-540 -960)`}>
          {FINALES.map(([x, y], i) => <OjosOscuros key={i} x={x} y={y} s={0.9 + 0.5 * azar(i)} abre={pr(t, 57.8 + i * 0.15, 58.05 + i * 0.15)} />)}
          <OjosOscuros x={540} y={1040} s={3.4} abre={pr(t, 59.15, 59.4)} />
        </g>
      </g>}
    </g>
  );
};

export const ESCENAS: { a: number; C: E }[] = [
  { a: 0, C: E1 }, { a: 8.7, C: E2 }, { a: 17.9, C: E3 }, { a: 27.7, C: E4 }, { a: 33.6, C: E5 }, { a: 44.0, C: E6 }, { a: 50.0, C: E7 },
];
