// Tambo y Chispa: los personajes fijos del canal. Ver personaje/BIBLIA_TAMBO.md.
// Dibujo 2D en SVG. El origen (0, 0) está entre los pies; Tambo mide unas 880 unidades de alto.
import React from "react";

export const PALETA = {
  contorno: "#241726", piel: "#f7e3c8", chullo: "#b8322a", crema: "#f3e6c8", poncho: "#1f8a8a", ponchoSombra: "#176b6e",
  botas: "#1c1c22", farol: "#ffd35a", pelo: "#3a2a22", chispa: "#c98b4b", chispaClaro: "#f1dcc0", panuelo: "#d9482b",
};
export type Gesto = "neutral" | "miedo" | "decidido" | "alivio" | "sorpresa";
const C = PALETA;

const Cara: React.FC<{ gesto: Gesto; mira?: [number, number] }> = ({ gesto, mira = [0, 0] }) => {
  const [mx, my] = [mira[0] * 8, mira[1] * 8];
  const grande = gesto === "miedo" || gesto === "sorpresa";
  return (
    <g stroke={C.contorno} strokeLinecap="round" strokeLinejoin="round" transform="translate(0 30)">
      {gesto === "alivio"
        ? <path d="M-74 -690 q22 -22 44 0 M30 -690 q22 -22 44 0" fill="none" strokeWidth={9} />
        : <>
          <ellipse cx={-52 + mx} cy={-694 + my} rx={grande ? 17 : 13} ry={grande ? 23 : 18} fill={C.contorno} stroke="none" />
          <ellipse cx={52 + mx} cy={-694 + my} rx={grande ? 17 : 13} ry={grande ? 23 : 18} fill={C.contorno} stroke="none" />
          <circle cx={-47 + mx} cy={-701 + my} r={5} fill="#fff" stroke="none" /><circle cx={57 + mx} cy={-701 + my} r={5} fill="#fff" stroke="none" />
        </>}
      {gesto === "neutral" && <path d="M-80 -732 h46 M34 -732 h46" strokeWidth={9} fill="none" />}
      {gesto === "miedo" && <path d="M-84 -730 l44 -18 M40 -748 l44 18" strokeWidth={9} fill="none" />}
      {gesto === "decidido" && <path d="M-84 -748 l46 20 M38 -728 l46 -20" strokeWidth={10} fill="none" />}
      {gesto === "alivio" && <path d="M-82 -736 q24 -10 46 0 M36 -736 q24 -10 46 0" strokeWidth={8} fill="none" />}
      {gesto === "sorpresa" && <path d="M-82 -752 q24 -14 46 0 M36 -752 q24 -14 46 0" strokeWidth={8} fill="none" />}
      {gesto === "neutral" && <path d="M-20 -628 h40" strokeWidth={9} fill="none" />}
      {gesto === "miedo" && <path d="M-30 -622 q10 -14 20 0 t20 0 t20 0" strokeWidth={8} fill="none" />}
      {gesto === "decidido" && <path d="M-26 -624 q26 -10 52 0" strokeWidth={9} fill="none" />}
      {gesto === "alivio" && <path d="M-30 -636 q30 30 60 0" strokeWidth={9} fill="none" />}
      {gesto === "sorpresa" && <ellipse cx={0} cy={-624} rx={15} ry={20} fill="#7a2230" strokeWidth={7} />}
      {/* la curita: su marca */}
      <g transform="rotate(-24 -98 -642)" strokeWidth={5}>
        <rect x={-126} y={-654} width={56} height={24} rx={11} fill="#f0b79a" /><rect x={-108} y={-654} width={20} height={24} fill="#f7d3bd" stroke="none" />
      </g>
    </g>
  );
};

export const Tambo: React.FC<{ x: number; y: number; s?: number; gesto?: Gesto; farol?: boolean; luz?: number; brazo?: number; voltea?: boolean; soloCabeza?: boolean; mira?: [number, number] }> =
  ({ x, y, s = 1, gesto = "neutral", farol = true, luz = 1, brazo = 0.35, voltea = false, soloCabeza = false, mira }) => {
    const mx = 190 + 30 * brazo, my = -330 - 190 * brazo; // mano del farol
    return (
      <g transform={`translate(${x} ${y}) scale(${voltea ? -s : s} ${s})`} stroke={C.contorno} strokeWidth={11} strokeLinejoin="round" strokeLinecap="round">
        {!soloCabeza && <>
          {farol && luz > 0 && <circle cx={mx} cy={my + 78} r={210} fill={C.farol} opacity={0.2 * luz} stroke="none" />}
          <line x1={-44} y1={-270} x2={-48} y2={-70} strokeWidth={14} /><line x1={44} y1={-270} x2={48} y2={-70} strokeWidth={14} />
          <path d="M-86 0 V-78 Q-86 -96 -68 -96 H-30 Q-14 -96 -14 -78 V-22 Q-14 0 -36 0Z" fill={C.botas} />
          <path d="M86 0 V-78 Q86 -96 68 -96 H30 Q14 -96 14 -78 V-22 Q14 0 36 0Z" fill={C.botas} />
          <path d="M-86 -66 h72 M14 -66 h72" stroke="#55555f" strokeWidth={7} />
          <path d="M-150 -330 Q-190 -300 -176 -250" fill="none" strokeWidth={13} />
          <path d={`M150 -330 Q190 ${-330 - 60 * brazo} ${mx} ${my}`} fill="none" strokeWidth={13} />
          {/* poncho de aguas, con su franja en zigzag */}
          <path d="M-70 -560 Q-190 -470 -214 -262 Q0 -214 214 -262 Q190 -470 70 -560 Q0 -590 -70 -560Z" fill={C.poncho} />
          <path d="M-206 -306 Q0 -262 206 -306 L214 -262 Q0 -214 -214 -262Z" fill={C.ponchoSombra} stroke="none" />
          <path d="M-196 -316 l28 22 l28 -16 l28 20 l28 -14 l28 18 l28 -14 l28 16 l28 -16 l28 16 l28 -18 l28 16 l28 -20 l28 16 l28 -22" fill="none" stroke={C.crema} strokeWidth={8} />
          <path d="M-70 -560 Q0 -500 70 -560" fill="none" strokeWidth={9} />
          <circle cx={-176} cy={-244} r={20} fill={C.piel} /><circle cx={mx} cy={my} r={20} fill={C.piel} />
          {farol && <g transform={`translate(${mx} ${my})`}>
            <path d="M-26 34 Q0 2 26 34" fill="none" strokeWidth={8} />
            <rect x={-36} y={34} width={72} height={20} rx={6} fill="#3d3d47" strokeWidth={8} />
            <rect x={-30} y={54} width={60} height={70} rx={10} fill={luz > 0 ? C.farol : "#7d8590"} strokeWidth={8} />
            <line x1={0} y1={54} x2={0} y2={124} strokeWidth={6} />
            <rect x={-38} y={124} width={76} height={18} rx={6} fill="#3d3d47" strokeWidth={8} />
          </g>}
        </>}
        {/* cabeza de frijol y chullo */}
        <ellipse cx={0} cy={-690} rx={152} ry={140} fill={C.piel} />
        <path d="M-120 -738 Q-70 -716 -30 -742 Q0 -716 40 -744 Q80 -720 120 -738 L112 -790 H-112Z" fill={C.pelo} strokeWidth={8} />
        <path d="M-158 -724 Q-150 -880 0 -880 Q150 -880 158 -724 Q0 -770 -158 -724Z" fill={C.chullo} />
        <path d="M-158 -724 Q0 -770 158 -724 L152 -768 Q0 -812 -152 -768Z" fill={C.crema} strokeWidth={9} />
        <path d="M-140 -742 l24 -20 l24 14 l24 -18 l24 14 l24 -18 l24 16 l24 -16 l24 18 l24 -14 l24 18 l24 -14" fill="none" stroke={C.chullo} strokeWidth={8} />
        <path d="M-158 -728 Q-186 -650 -150 -580 Q-128 -640 -128 -716Z" fill={C.chullo} /><path d="M158 -728 Q186 -650 150 -580 Q128 -640 128 -716Z" fill={C.chullo} />
        <path d="M-150 -580 q-6 44 6 80 M150 -580 q6 44 -6 80" fill="none" stroke={C.crema} strokeWidth={8} />
        <circle cx={0} cy={-896} r={30} fill={C.crema} />
        <Cara gesto={gesto} mira={mira} />
      </g>
    );
  };

/** Chispa, la perra runa: siempre nota el peligro antes que Tambo */
export const Chispa: React.FC<{ x: number; y: number; s?: number; alerta?: boolean; voltea?: boolean; cola?: number }> = ({ x, y, s = 1, alerta = false, voltea = false, cola = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${voltea ? -s : s} ${s})`} stroke={C.contorno} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round">
    <path d={`M-118 -150 Q-170 ${-200 - 30 * cola} -150 ${-250 - 20 * cola}`} fill="none" strokeWidth={22} /><path d={`M-118 -150 Q-170 ${-200 - 30 * cola} -150 ${-250 - 20 * cola}`} fill="none" strokeWidth={8} stroke={C.chispa} />
    <line x1={-84} y1={-90} x2={-88} y2={-6} strokeWidth={13} /><line x1={-40} y1={-86} x2={-40} y2={-6} strokeWidth={13} />
    <line x1={50} y1={-86} x2={52} y2={-6} strokeWidth={13} /><line x1={92} y1={-92} x2={98} y2={-6} strokeWidth={13} />
    <ellipse cx={0} cy={-128} rx={132} ry={70} fill={C.chispa} />
    <path d="M60 -80 Q110 -66 124 -120 Q110 -150 76 -150Z" fill={C.chispaClaro} stroke="none" />
    <circle cx={142} cy={-218} r={84} fill={C.chispa} />
    <path d={alerta ? "M96 -280 L84 -372 L150 -300Z" : "M96 -280 L60 -340 L140 -306Z"} fill={C.chispa} />
    <path d="M176 -292 Q232 -300 226 -238 Q200 -262 170 -262Z" fill="#9c6630" />
    <ellipse cx={206} cy={-196} rx={46} ry={34} fill={C.chispaClaro} />
    <ellipse cx={232} cy={-212} rx={15} ry={12} fill={C.contorno} stroke="none" />
    <circle cx={150} cy={-240} r={alerta ? 13 : 10} fill={C.contorno} stroke="none" /><circle cx={154} cy={-245} r={4} fill="#fff" stroke="none" />
    {alerta ? <path d="M196 -180 q14 12 30 2" fill="none" strokeWidth={7} /> : <path d="M194 -182 q16 20 34 4" fill="none" strokeWidth={7} />}
    <path d="M74 -168 Q110 -128 168 -146 L150 -110 Q100 -100 70 -140Z" fill={C.panuelo} strokeWidth={8} />
  </g>
);

// ---------------------------------------------------------------- hoja de personaje (una sola imagen)
const F = "DejaVu Sans, Arial, sans-serif";
const GESTOS: [Gesto, string][] = [["neutral", "Neutral"], ["miedo", "Miedo"], ["decidido", "Decidido"], ["alivio", "Alivio"], ["sorpresa", "Sorpresa"]];
const MUESTRAS: [string, string][] = [["Chullo", C.chullo], ["Poncho", C.poncho], ["Piel", C.piel], ["Farol", C.farol], ["Contorno", C.contorno], ["Chispa", C.chispa]];
export const HojaTambo: React.FC = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ background: "#f4efe4" }}>
    <rect width={1080} height={1920} fill="#f4efe4" />
    <text x={60} y={130} fontFamily={F} fontWeight={800} fontSize={104} fill={C.contorno}>TAMBO</text>
    <text x={64} y={186} fontFamily={F} fontWeight={700} fontSize={36} fill="#6d5f66">y Chispa · hoja de personaje</text>
    <line x1={60} y1={214} x2={1020} y2={214} stroke={C.contorno} strokeWidth={6} />
    <ellipse cx={540} cy={1188} rx={440} ry={34} fill="#e4dccb" />
    <Tambo x={350} y={1180} s={0.98} gesto="neutral" brazo={0.4} />
    <Chispa x={770} y={1180} s={0.95} cola={0.6} />
    <text x={350} y={1262} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={30} fill="#6d5f66">Tambo · 3 cabezas de alto</text>
    <text x={790} y={1262} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={30} fill="#6d5f66">Chispa, perra runa</text>
    <text x={60} y={1345} fontFamily={F} fontWeight={800} fontSize={40} fill={C.contorno}>Gestos</text>
    {GESTOS.map(([g, n], i) => <g key={g}>
      <Tambo x={130 + i * 205} y={1885} s={0.52} gesto={g} soloCabeza />
      <text x={130 + i * 205} y={1640} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={30} fill="#6d5f66">{n}</text>
    </g>)}
    <text x={60} y={1716} fontFamily={F} fontWeight={800} fontSize={40} fill={C.contorno}>Paleta</text>
    {MUESTRAS.map(([n, c], i) => <g key={n}>
      <rect x={60 + i * 165} y={1738} width={140} height={76} rx={14} fill={c} stroke={C.contorno} strokeWidth={6} />
      <text x={130 + i * 165} y={1852} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={26} fill={C.contorno}>{n}</text>
      <text x={130 + i * 165} y={1886} textAnchor="middle" fontFamily={F} fontSize={24} fill="#6d5f66">{c}</text>
    </g>)}
  </svg>
);
