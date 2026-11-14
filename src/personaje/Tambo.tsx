// Tambo y Chispa: los personajes fijos del canal. Ver personaje/BIBLIA_TAMBO.md.
// Versión 2 (2026): ropa oversize actual y más detalle. Dibujo 2D en SVG.
// El origen (0, 0) está entre los pies; Tambo mide unas 960 unidades de alto.
import React from "react";

export const PALETA = {
  contorno: "#241726", piel: "#f7e3c8", chullo: "#b8322a", chulloSombra: "#8a221c", crema: "#f3e6c8", chaqueta: "#1f8a8a", chaquetaSombra: "#176b6e",
  pantalon: "#3a3d4a", pantalonClaro: "#4b4f5e", zapato: "#22222a", bolso: "#e2622b", farol: "#ffd35a", pelo: "#3a2a22",
  chispa: "#c98b4b", chispaClaro: "#f1dcc0", panuelo: "#d9482b",
};
export type Gesto = "neutral" | "miedo" | "decidido" | "alivio" | "sorpresa";
const C = PALETA;

/** tubo con contorno: mangas y correas anchas */
const Tubo: React.FC<{ d: string; w: number; c: string; borde?: number }> = ({ d, w, c, borde = 22 }) => (
  <><path d={d} fill="none" stroke={C.contorno} strokeWidth={w + borde} /><path d={d} fill="none" stroke={c} strokeWidth={w} /></>
);

const Cara: React.FC<{ gesto: Gesto; mira?: [number, number] }> = ({ gesto, mira = [0, 0] }) => {
  const [mx, my] = [mira[0] * 8, mira[1] * 8];
  const grande = gesto === "miedo" || gesto === "sorpresa";
  return (
    <g stroke={C.contorno} strokeLinecap="round" strokeLinejoin="round" transform="translate(0 30)">
      <ellipse cx={-84} cy={-662} rx={24} ry={13} fill="#f2a08c" opacity={0.45} stroke="none" /><ellipse cx={84} cy={-662} rx={24} ry={13} fill="#f2a08c" opacity={0.45} stroke="none" />
      {gesto === "alivio"
        ? <path d="M-74 -690 q22 -22 44 0 M30 -690 q22 -22 44 0" fill="none" strokeWidth={9} />
        : <>
          <ellipse cx={-52 + mx} cy={-694 + my} rx={grande ? 17 : 13} ry={grande ? 23 : 18} fill={C.contorno} stroke="none" />
          <ellipse cx={52 + mx} cy={-694 + my} rx={grande ? 17 : 13} ry={grande ? 23 : 18} fill={C.contorno} stroke="none" />
          <circle cx={-47 + mx} cy={-701 + my} r={5} fill="#fff" stroke="none" /><circle cx={57 + mx} cy={-701 + my} r={5} fill="#fff" stroke="none" />
        </>}
      {gesto === "neutral" && <path d="M-80 -732 h46 M34 -732 h46" strokeWidth={10} fill="none" />}
      {gesto === "miedo" && <path d="M-84 -730 l44 -18 M40 -748 l44 18" strokeWidth={10} fill="none" />}
      {gesto === "decidido" && <path d="M-84 -748 l46 20 M38 -728 l46 -20" strokeWidth={11} fill="none" />}
      {gesto === "alivio" && <path d="M-82 -736 q24 -10 46 0 M36 -736 q24 -10 46 0" strokeWidth={9} fill="none" />}
      {gesto === "sorpresa" && <path d="M-82 -752 q24 -14 46 0 M36 -752 q24 -14 46 0" strokeWidth={9} fill="none" />}
      {/* ceja partida: detalle actual */}
      <line x1={64} y1={-760} x2={72} y2={-716} stroke={C.piel} strokeWidth={7} />
      {gesto === "neutral" && <path d="M-20 -628 h40" strokeWidth={9} fill="none" />}
      {gesto === "miedo" && <path d="M-30 -622 q10 -14 20 0 t20 0 t20 0" strokeWidth={8} fill="none" />}
      {gesto === "decidido" && <path d="M-26 -624 q26 -10 52 0" strokeWidth={9} fill="none" />}
      {gesto === "alivio" && <path d="M-30 -636 q30 30 60 0" strokeWidth={9} fill="none" />}
      {gesto === "sorpresa" && <ellipse cx={0} cy={-624} rx={15} ry={20} fill="#7a2230" strokeWidth={7} />}
      {/* la curita: su marca */}
      <g transform="rotate(-24 -98 -642)" strokeWidth={5}>
        <rect x={-126} y={-654} width={56} height={24} rx={11} fill="#f0b79a" /><rect x={-108} y={-654} width={20} height={24} fill="#f7d3bd" stroke="none" />
        <path d="M-102 -646 v8 M-94 -646 v8" strokeWidth={3} />
      </g>
    </g>
  );
};

const Zigzag: React.FC<{ x: number; y: number; n: number; paso: number; alto: number; color: string; w?: number }> = ({ x, y, n, paso, alto, color, w = 7 }) => (
  <path d={`M${x} ${y}` + [...Array(n)].map((_, i) => `l${paso} ${i % 2 ? alto : -alto}`).join("")} fill="none" stroke={color} strokeWidth={w} />
);

export const Tambo: React.FC<{ x: number; y: number; s?: number; gesto?: Gesto; farol?: boolean; luz?: number; brazo?: number; voltea?: boolean; soloCabeza?: boolean; mira?: [number, number] }> =
  ({ x, y, s = 1, gesto = "neutral", farol = true, luz = 1, brazo = 0.35, voltea = false, soloCabeza = false, mira }) => {
    const mx = 214 + 26 * brazo, my = -336 - 170 * brazo; // mano del farol
    return (
      <g transform={`translate(${x} ${y}) scale(${voltea ? -s : s} ${s})`} stroke={C.contorno} strokeWidth={11} strokeLinejoin="round" strokeLinecap="round">
        {!soloCabeza && <>
          {farol && luz > 0 && <circle cx={mx} cy={my + 92} r={230} fill={C.farol} opacity={0.2 * luz} stroke="none" />}
          {/* zapatillas de suela gruesa */}
          {[-1, 1].map((k) => <g key={k} transform={`scale(${k} 1)`}>
            <path d="M14 -26 V-52 Q14 -82 46 -82 H96 Q140 -78 146 -26Z" fill={C.zapato} />
            <path d="M8 0 V-28 H150 Q156 -28 156 -18 V0Z" fill={C.crema} />
            <path d="M34 -28 v28 M66 -28 v28 M98 -28 v28 M128 -28 v28" strokeWidth={5} opacity={0.6} />
            <path d="M60 -72 l40 20 M84 -78 l34 22" stroke={C.chaqueta} strokeWidth={8} />
          </g>)}
          {/* pantalón cargo ancho, arrugado en el tobillo */}
          <path d="M-116 -350 L-142 -104 Q-146 -66 -110 -66 H-22 Q-4 -66 -4 -90 L0 -292 L4 -90 Q4 -66 22 -66 H110 Q146 -66 142 -104 L116 -350Z" fill={C.pantalon} />
          <path d="M0 -300 V-210" strokeWidth={7} />
          <path d="M-136 -128 q46 22 120 4 M-132 -100 q40 14 96 6 M136 -128 q-46 22 -120 4 M132 -100 q-40 14 -96 6" fill="none" strokeWidth={6} opacity={0.7} />
          {[-1, 1].map((k) => <g key={k} transform={`scale(${k} 1)`} strokeWidth={7}>
            <rect x={78} y={-262} width={56} height={84} rx={9} fill={C.pantalonClaro} /><path d="M78 -236 h56" /><circle cx={106} cy={-246} r={5} fill={C.crema} strokeWidth={4} />
          </g>)}
          {/* sudadera larga que asoma bajo la chaqueta */}
          <path d="M-166 -392 Q0 -356 166 -392 L160 -326 Q0 -292 -160 -326Z" fill={C.crema} />
          <path d="M-150 -344 Q0 -312 150 -344" fill="none" strokeWidth={5} opacity={0.5} />
          {/* manga izquierda, caída y ancha */}
          <Tubo d="M-158 -520 Q-240 -452 -214 -336" w={70} c={C.chaqueta} />
          <path d="M-244 -438 q30 -2 56 14 M-248 -388 q30 -4 58 10" fill="none" strokeWidth={6} opacity={0.55} />
          <path d="M-246 -326 q32 14 64 2" stroke={C.crema} strokeWidth={16} /><circle cx={-212} cy={-292} r={22} fill={C.piel} />
          <path d="M-232 -300 q20 12 40 2" stroke={C.zapato} strokeWidth={12} fill="none" />
          {/* chaqueta acolchada oversize */}
          <path d="M-100 -582 Q-186 -556 -198 -470 L-186 -384 Q0 -346 186 -384 L198 -470 Q186 -556 100 -582 Q0 -606 -100 -582Z" fill={C.chaqueta} />
          <path d="M-190 -420 Q0 -384 190 -420 L186 -384 Q0 -346 -186 -384Z" fill={C.chaquetaSombra} stroke="none" />
          <path d="M-196 -478 Q0 -446 196 -478 M-192 -424 Q0 -390 192 -424 M-170 -534 Q0 -506 170 -534" fill="none" strokeWidth={6} opacity={0.55} />
          <path d="M0 -596 V-362" strokeWidth={8} /><rect x={-9} y={-470} width={18} height={30} rx={6} fill={C.crema} strokeWidth={5} />
          <path d="M-128 -452 l24 46 M128 -452 l-24 46" strokeWidth={8} />
          <rect x={56} y={-548} width={66} height={38} rx={7} fill={C.crema} strokeWidth={6} /><Zigzag x={64} y={-524} n={5} paso={10} alto={10} color={C.chullo} w={5} />
          {/* capucha de la sudadera y cordones */}
          <path d="M-108 -572 Q-160 -612 -126 -652 Q0 -596 126 -652 Q160 -612 108 -572 Q0 -534 -108 -572Z" fill={C.crema} />
          <path d="M-36 -560 q-6 50 0 96 M36 -560 q8 44 2 84" fill="none" stroke={C.contorno} strokeWidth={15} /><path d="M-36 -560 q-6 50 0 96 M36 -560 q8 44 2 84" fill="none" stroke={C.crema} strokeWidth={7} />
          {/* bolso cruzado */}
          <path d="M124 -566 L-150 -404" stroke={C.contorno} strokeWidth={28} /><path d="M124 -566 L-150 -404" stroke={C.bolso} strokeWidth={14} />
          <g transform="rotate(-28 -128 -404)">
            <rect x={-196} y={-448} width={136} height={86} rx={24} fill={C.bolso} /><path d="M-180 -420 h104" strokeWidth={6} /><rect x={-150} y={-428} width={22} height={16} rx={4} fill={C.crema} strokeWidth={4} />
            <rect x={-176} y={-400} width={44} height={24} rx={6} fill="#b84a1c" strokeWidth={5} />
          </g>
          {/* manga derecha con el farol */}
          <Tubo d={`M158 -520 Q${244} ${-478 - 40 * brazo} ${mx} ${my + 10}`} w={70} c={C.chaqueta} />
          <path d={`M${mx - 36} ${my - 2} q36 -14 72 2`} stroke={C.crema} strokeWidth={16} fill="none" />
          <circle cx={mx} cy={my + 30} r={22} fill={C.piel} /><path d={`M${mx - 20} ${my + 22} q20 -12 40 0`} stroke={C.zapato} strokeWidth={12} fill="none" />
          {farol && <g transform={`translate(${mx} ${my + 30})`}>
            <path d="M-20 34 Q0 2 20 34" fill="none" strokeWidth={8} />
            <rect x={-36} y={32} width={72} height={24} rx={8} fill="#3d3d47" strokeWidth={8} />
            <rect x={-30} y={56} width={60} height={86} rx={16} fill={luz > 0 ? C.farol : "#7d8590"} strokeWidth={8} />
            <path d="M-30 78 h60 M-30 100 h60 M-30 122 h60" strokeWidth={4} opacity={0.5} />
            <rect x={-38} y={140} width={76} height={26} rx={8} fill="#3d3d47" strokeWidth={8} /><circle cx={0} cy={153} r={5} fill={C.chaqueta} stroke="none" />
          </g>}
        </>}
        {/* cabeza de frijol */}
        <ellipse cx={0} cy={-690} rx={152} ry={140} fill={C.piel} />
        <path d="M-124 -736 Q-96 -712 -64 -740 Q-30 -714 0 -742 Q34 -716 66 -742 Q98 -716 124 -736 L116 -790 H-116Z" fill={C.pelo} strokeWidth={8} />
        {/* gorro de punto oversize con orejeras: su silueta */}
        <path d="M-162 -724 Q-176 -900 -30 -916 Q150 -924 164 -724 Q0 -772 -162 -724Z" fill={C.chullo} />
        {[-104, -54, -4, 46, 96].map((u) => <path key={u} d={`M${u} -800 Q${u * 0.86} -860 ${u * 0.5 - 12} -906`} fill="none" stroke={C.chulloSombra} strokeWidth={6} />)}
        <path d="M-166 -716 Q0 -766 166 -716 L160 -796 Q0 -846 -160 -796Z" fill={C.crema} strokeWidth={10} />
        <Zigzag x={-146} y={-748} n={12} paso={24} alto={17} color={C.chullo} w={8} />
        <rect x={98} y={-790} width={40} height={26} rx={5} fill={C.chaqueta} strokeWidth={5} transform="rotate(14 118 -777)" />
        <path d="M-162 -724 Q-192 -640 -152 -566 Q-128 -636 -130 -712Z" fill={C.chullo} /><path d="M162 -724 Q192 -640 152 -566 Q128 -636 130 -712Z" fill={C.chullo} />
        <path d="M-166 -690 q10 6 26 2 M-170 -650 q12 8 30 4 M166 -690 q-10 6 -26 2 M170 -650 q-12 8 -30 4" fill="none" stroke={C.chulloSombra} strokeWidth={5} />
        {[-1, 1].map((k) => <g key={k} transform={`scale(${k} 1)`}>
          <path d="M152 -566 q8 50 -4 92" fill="none" stroke={C.contorno} strokeWidth={16} /><path d="M152 -566 q8 50 -4 92" fill="none" stroke={C.crema} strokeWidth={8} strokeDasharray="12 7" />
          <path d="M136 -474 l10 34 l12 -34Z" fill={C.chullo} strokeWidth={6} />
        </g>)}
        <circle cx={-18} cy={-936} r={36} fill={C.crema} /><path d="M-40 -950 l10 12 M-14 -958 l2 14 M2 -944 l-10 10 M-30 -924 l12 -6" strokeWidth={4} opacity={0.5} />
        <Cara gesto={gesto} mira={mira} />
      </g>
    );
  };

/** Chispa, la perra runa: siempre nota el peligro antes que Tambo */
export const Chispa: React.FC<{ x: number; y: number; s?: number; alerta?: boolean; voltea?: boolean; cola?: number }> = ({ x, y, s = 1, alerta = false, voltea = false, cola = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${voltea ? -s : s} ${s})`} stroke={C.contorno} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round">
    <path d={`M-118 -150 Q-170 ${-200 - 30 * cola} -150 ${-250 - 20 * cola}`} fill="none" strokeWidth={22} /><path d={`M-118 -150 Q-170 ${-200 - 30 * cola} -150 ${-250 - 20 * cola}`} fill="none" strokeWidth={8} stroke={C.chispa} />
    {[[-84, -88], [-40, -40], [50, 52], [92, 98]].map(([a, b], i) => <g key={i}>
      <line x1={a} y1={-90} x2={b} y2={-8} strokeWidth={13} /><ellipse cx={b + 6} cy={-8} rx={17} ry={10} fill={C.chispaClaro} strokeWidth={6} />
    </g>)}
    <ellipse cx={0} cy={-128} rx={132} ry={70} fill={C.chispa} />
    <path d="M60 -80 Q110 -66 124 -120 Q110 -150 76 -150Z" fill={C.chispaClaro} stroke="none" />
    <path d="M-70 -186 q30 -10 56 4 M-96 -150 q24 -6 40 6" fill="none" stroke="#9c6630" strokeWidth={6} />
    {/* arnés reflectivo con luz */}
    <path d="M22 -196 Q14 -128 30 -62" fill="none" stroke={C.contorno} strokeWidth={30} /><path d="M22 -196 Q14 -128 30 -62" fill="none" stroke={C.chaqueta} strokeWidth={16} />
    <path d="M20 -160 l6 34" stroke={C.crema} strokeWidth={8} /><circle cx={26} cy={-200} r={11} fill={C.farol} strokeWidth={5} />
    <circle cx={142} cy={-218} r={84} fill={C.chispa} />
    <path d={alerta ? "M96 -280 L84 -372 L150 -300Z" : "M96 -280 L60 -340 L140 -306Z"} fill={C.chispa} />
    <path d="M176 -292 Q232 -300 226 -238 Q200 -262 170 -262Z" fill="#9c6630" />
    <ellipse cx={206} cy={-196} rx={46} ry={34} fill={C.chispaClaro} />
    <ellipse cx={232} cy={-212} rx={15} ry={12} fill={C.contorno} stroke="none" />
    <circle cx={150} cy={-240} r={alerta ? 13 : 10} fill={C.contorno} stroke="none" /><circle cx={154} cy={-245} r={4} fill="#fff" stroke="none" />
    <path d="M132 -262 q16 -10 34 -2" fill="none" strokeWidth={6} />
    {alerta ? <path d="M196 -180 q14 12 30 2" fill="none" strokeWidth={7} /> : <path d="M194 -182 q16 20 34 4" fill="none" strokeWidth={7} />}
    <path d="M74 -168 Q110 -128 168 -146 L150 -110 Q100 -100 70 -140Z" fill={C.panuelo} strokeWidth={8} />
  </g>
);

// ---------------------------------------------------------------- hoja de personaje (una sola imagen)
const F = "DejaVu Sans, Arial, sans-serif";
const GESTOS: [Gesto, string][] = [["neutral", "Neutral"], ["miedo", "Miedo"], ["decidido", "Decidido"], ["alivio", "Alivio"], ["sorpresa", "Sorpresa"]];
const MUESTRAS: [string, string][] = [["Gorro", C.chullo], ["Chaqueta", C.chaqueta], ["Sudadera", C.crema], ["Pantalón", C.pantalon], ["Bolso", C.bolso], ["Farol", C.farol]];
const NOTAS: [number, number, number, number, string][] = [
  [610, 320, 470, 330, "Gorro de punto con orejeras"], [640, 560, 560, 640, "Chaqueta oversize"], [640, 650, 430, 660, "Bolso cruzado"],
  [640, 800, 500, 840, "Sudadera larga"], [640, 890, 480, 960, "Cargo ancho"],
];
export const HojaTambo: React.FC = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ background: "#f4efe4" }}>
    <rect width={1080} height={1920} fill="#f4efe4" />
    <text x={60} y={130} fontFamily={F} fontWeight={800} fontSize={104} fill={C.contorno}>TAMBO</text>
    <text x={64} y={186} fontFamily={F} fontWeight={700} fontSize={36} fill="#6d5f66">y Chispa · hoja de personaje · v2</text>
    <line x1={60} y1={214} x2={1020} y2={214} stroke={C.contorno} strokeWidth={6} />
    <ellipse cx={520} cy={1188} rx={470} ry={34} fill="#e4dccb" />
    <Tambo x={330} y={1180} s={0.94} gesto="neutral" brazo={0.4} />
    <Chispa x={800} y={1180} s={0.8} cola={0.6} />
    {NOTAS.map(([tx, ty, px, py, n], i) => <g key={i}>
      <line x1={tx - 10} y1={ty - 10} x2={px} y2={py} stroke="#6d5f66" strokeWidth={4} />
      <circle cx={px} cy={py} r={7} fill="#6d5f66" />
      <text x={tx} y={ty} fontFamily={F} fontWeight={700} fontSize={27} fill="#6d5f66">{n}</text>
    </g>)}
    <text x={800} y={1262} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={30} fill="#6d5f66">Chispa · arnés con luz</text>
    <text x={330} y={1262} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={30} fill="#6d5f66">Tambo · 3 cabezas de alto</text>
    <text x={60} y={1345} fontFamily={F} fontWeight={800} fontSize={40} fill={C.contorno}>Gestos</text>
    {GESTOS.map(([g, n], i) => <g key={g}>
      <Tambo x={130 + i * 205} y={1862} s={0.5} gesto={g} soloCabeza />
      <text x={130 + i * 205} y={1668} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={28} fill="#6d5f66">{n}</text>
    </g>)}
    <text x={60} y={1732} fontFamily={F} fontWeight={800} fontSize={40} fill={C.contorno}>Paleta</text>
    {MUESTRAS.map(([n, c], i) => <g key={n}>
      <rect x={60 + i * 165} y={1750} width={140} height={66} rx={14} fill={c} stroke={C.contorno} strokeWidth={6} />
      <text x={130 + i * 165} y={1852} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={26} fill={C.contorno}>{n}</text>
      <text x={130 + i * 165} y={1886} textAnchor="middle" fontFamily={F} fontSize={24} fill="#6d5f66">{c}</text>
    </g>)}
  </svg>
);
