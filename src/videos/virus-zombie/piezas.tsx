// Piezas del short «El virus zombi»: animación 2D en SVG (sin WebGL, para que renderice rápido sin GPU).
// Personajes planos con cabeza de frijol, ojos de punto, extremidades de palito y contorno ciruela.
import React from "react";

export const W = 1080, H = 1920, FPS = 30;
export const CIRUELA = "#241726", TINTA = "#101014";

export const cl = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const u = cl(x); return u * u * (3 - 2 * u); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** avance 0..1 entre los segundos a y b, suavizado */
export const pr = (t: number, a: number, b: number) => sm((t - a) / (b - a));
/** aparece en a y se va en b (segundos), con entrada y salida de `d` */
export const ventana = (t: number, a: number, b: number, d = 0.2) => Math.min(pr(t, a, a + d), 1 - pr(t, b - d, b));
export const azar = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mezcla = (a: string, b: string, t: number) => {
  const p = hex(a), q = hex(b);
  return `rgb(${p.map((v, i) => Math.round(lerp(v, q[i], cl(t)))).join(",")})`;
};

/** mancha cerrada y suave que se mueve con `fase` */
export const mancha = (cx: number, cy: number, r: number, n: number, amp: number, fase: number, estira = 1) => {
  const p: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(a * 3 + fase) + amp * 0.5 * Math.sin(a * 5 - fase * 1.3));
    p.push([cx + Math.cos(a) * rr * estira, cy + Math.sin(a) * rr]);
  }
  const m = (i: number) => [(p[i % n][0] + p[(i + 1) % n][0]) / 2, (p[i % n][1] + p[(i + 1) % n][1]) / 2];
  let d = `M${m(0)[0].toFixed(1)} ${m(0)[1].toFixed(1)}`;
  for (let i = 1; i <= n; i++) d += `Q${p[i % n][0].toFixed(1)} ${p[i % n][1].toFixed(1)} ${m(i)[0].toFixed(1)} ${m(i)[1].toFixed(1)}`;
  return d + "Z";
};

/** cámara: centra (cx, cy) del mundo en la pantalla con zoom y giro */
export const Camara: React.FC<{ cx: number; cy: number; zoom?: number; giro?: number; children: React.ReactNode }> = ({ cx, cy, zoom = 1, giro = 0, children }) => (
  <g transform={`translate(${W / 2} ${H / 2}) rotate(${giro}) scale(${zoom}) translate(${-cx} ${-cy})`}>{children}</g>
);

/** cifra discreta arriba del cuadro (regla del estilo: sin tapar a nadie) */
export const Cifra: React.FC<{ texto: string; sub?: string; o: number; color?: string }> = ({ texto, sub, o, color = "#fff" }) => o <= 0 ? null : (
  <g opacity={o} transform={`translate(540 285) scale(${0.85 + 0.15 * o})`} fontFamily="DejaVu Sans, Arial, sans-serif" fontWeight={800} textAnchor="middle"
    stroke="#1a1010" strokeLinejoin="round" paintOrder="stroke">
    <text y={0} fontSize={96} fill={color} strokeWidth={16}>{texto}</text>
    {sub && <text y={62} fontSize={44} fill="#fff" strokeWidth={12}>{sub}</text>}
  </g>
);

// ---------------------------------------------------------------- el virus
export const Virus: React.FC<{ x: number; y: number; s?: number; ojos?: number; frio?: number; boca?: "cosida" | "risa" | "bostezo"; giro?: number; mira?: [number, number] }> =
  ({ x, y, s = 1, ojos = 1, frio = 0, boca = "cosida", giro = 0, mira = [0, 0] }) => {
    const cuerpo = mezcla("#7ac943", "#a9d8d0", frio), sombra = mezcla("#4f9a2a", "#7fb9b8", frio);
    const ry = 3 + 27 * cl(ojos);
    return (
      <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${s})`} stroke={CIRUELA} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round">
        {[...Array(9)].map((_, i) => { // pelitos del virus
          const a = (i / 9) * Math.PI * 2 + 0.3;
          return <line key={i} x1={Math.cos(a) * 86} y1={Math.sin(a) * 118} x2={Math.cos(a) * 112} y2={Math.sin(a) * 148} strokeWidth={8} />;
        })}
        <ellipse cx={0} cy={0} rx={92} ry={124} fill={cuerpo} />
        <path d="M-70 62 Q0 128 70 62 Q40 112 0 114 Q-40 112 -70 62Z" fill={sombra} stroke="none" />
        <ellipse cx={0} cy={-122} rx={34} ry={15} fill={sombra} />
        <ellipse cx={-36} cy={-22} rx={26} ry={ry} fill="#fff" />
        <ellipse cx={36} cy={-22} rx={26} ry={ry} fill="#fff" />
        {ojos > 0.25 && <>
          <circle cx={-36 + mira[0] * 9} cy={-22 + mira[1] * 9} r={10} fill={CIRUELA} stroke="none" />
          <circle cx={36 + mira[0] * 9} cy={-22 + mira[1] * 9} r={10} fill={CIRUELA} stroke="none" />
        </>}
        {boca === "cosida" && <>
          <path d="M-34 46 Q0 58 34 46" fill="none" strokeWidth={7} />
          {[-22, -8, 8, 22].map((u) => <line key={u} x1={u} y1={42} x2={u} y2={60} strokeWidth={5} />)}
        </>}
        {boca === "risa" && <path d="M-40 38 Q0 92 40 38 Q0 54 -40 38Z" fill="#3a1030" strokeWidth={7} />}
        {boca === "bostezo" && <ellipse cx={0} cy={52} rx={20} ry={26} fill="#3a1030" strokeWidth={7} />}
        {frio > 0.3 && <g stroke="#fff" strokeWidth={6} opacity={frio}>
          <path d="M-58 -78 l14 -14 M-52 -92 l2 20 M50 70 l16 -10 M56 76 l-2 -20 M-70 20 l14 6" fill="none" />
        </g>}
      </g>
    );
  };

// ---------------------------------------------------------------- la científica
export const Cientifica: React.FC<{ x: number; y: number; s?: number; boca?: "sonrisa" | "o" | "risa"; brazo?: number; cierra?: boolean; voltea?: boolean; frasco?: boolean }> =
  ({ x, y, s = 1, boca = "sonrisa", brazo = 0, cierra = false, voltea = false, frasco = false }) => {
    const mx = 150 + 20 * brazo, my = 190 - 190 * brazo; // mano derecha
    return (
      <g transform={`translate(${x} ${y}) scale(${voltea ? -s : s} ${s})`} stroke={CIRUELA} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round">
        <line x1={-38} y1={270} x2={-44} y2={430} /><line x1={38} y1={270} x2={44} y2={430} />
        <path d="M-70 430 h34 M36 430 h34" strokeWidth={16} />
        <path d="M-100 64 Q-118 270 -86 290 L86 290 Q118 270 100 64 Q0 22 -100 64Z" fill="#f08a24" />
        <path d="M-100 64 Q-118 270 -86 290 L-24 290 L-12 60Z" fill="#fff" />
        <path d="M100 64 Q118 270 86 290 L24 290 L12 60Z" fill="#fff" />
        <path d="M-96 96 Q-168 170 -136 244" fill="none" />
        <path d={`M96 96 Q${150} ${130 - 40 * brazo} ${mx} ${my}`} fill="none" />
        <circle cx={-136} cy={248} r={17} fill="#3f8fd2" /><circle cx={mx} cy={my} r={17} fill="#3f8fd2" />
        {frasco && <g transform={`translate(${mx} ${my - 46})`}>
          <rect x={-20} y={-44} width={40} height={74} rx={10} fill="#d6f1fb" /><rect x={-24} y={-58} width={48} height={18} rx={5} fill="#7aa7b8" />
        </g>}
        <ellipse cx={0} cy={-44} rx={124} ry={116} fill="#f6c9a0" />
        <path d="M-122 -62 Q-112 -176 0 -166 Q112 -176 122 -62 Q70 -112 0 -108 Q-70 -112 -122 -62Z" fill="#b9bcc6" />
        <circle cx={-50} cy={-42} r={38} fill="#e6f6ff" /><circle cx={50} cy={-42} r={38} fill="#e6f6ff" />
        <line x1={-12} y1={-42} x2={12} y2={-42} />
        {cierra
          ? <path d="M-64 -40 h28 M36 -40 h28" strokeWidth={8} fill="none" />
          : <><circle cx={-50} cy={-40} r={9} fill={CIRUELA} stroke="none" /><circle cx={50} cy={-40} r={9} fill={CIRUELA} stroke="none" /></>}
        {boca === "sonrisa" && <path d="M-30 22 Q0 46 30 22" fill="none" strokeWidth={8} />}
        {boca === "risa" && <path d="M-36 16 Q0 66 36 16 Q0 30 -36 16Z" fill="#7a2230" strokeWidth={7} />}
        {boca === "o" && <ellipse cx={0} cy={30} rx={15} ry={20} fill="#7a2230" strokeWidth={7} />}
      </g>
    );
  };

// ---------------------------------------------------------------- la ameba
export const Ameba: React.FC<{ x: number; y: number; s?: number; t: number; verde?: number; susto?: boolean }> = ({ x, y, s = 1, t, verde = 0, susto = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={CIRUELA} strokeWidth={9} strokeLinejoin="round">
    <path d={mancha(0, 0, 120, 14, 0.13, t * 3, 1.15)} fill={mezcla("#8fd3ff", "#8ee05a", verde)} fillOpacity={0.9} />
    <circle cx={-52} cy={44} r={18} fill={mezcla("#5fb4ee", "#5cae2e", verde)} stroke="none" />
    <circle cx={60} cy={-52} r={12} fill={mezcla("#5fb4ee", "#5cae2e", verde)} stroke="none" />
    <circle cx={-30} cy={-16} r={susto ? 20 : 15} fill="#fff" strokeWidth={6} /><circle cx={30} cy={-16} r={susto ? 20 : 15} fill="#fff" strokeWidth={6} />
    <circle cx={-30} cy={-16} r={7} fill={verde > 0.5 ? "#2d6b12" : CIRUELA} stroke="none" /><circle cx={30} cy={-16} r={7} fill={verde > 0.5 ? "#2d6b12" : CIRUELA} stroke="none" />
    {susto ? <ellipse cx={0} cy={30} rx={12} ry={16} fill="#3a1030" strokeWidth={6} /> : <path d="M-18 26 Q0 40 18 26" fill="none" strokeWidth={7} />}
  </g>
);

// ---------------------------------------------------------------- el reno
export const Reno: React.FC<{ x: number; y: number; s?: number; gris?: number; caido?: number; helado?: boolean; paso?: number; voltea?: boolean }> =
  ({ x, y, s = 1, gris = 0, caido = 0, helado = false, paso = 0, voltea = false }) => {
    const pelo = helado ? "#9cc6d6" : mezcla("#9a6b45", "#8a8a8e", gris), claro = helado ? "#c9e6ef" : mezcla("#e9d6bd", "#b5b5b8", gris);
    const p = Math.sin(paso) * 12;
    return (
      <g transform={`translate(${x} ${y}) scale(${voltea ? -s : s} ${s}) rotate(${-88 * caido} 0 150)`} stroke={CIRUELA} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round">
        <line x1={-70} y1={60} x2={-70 + p} y2={170} /><line x1={-34} y1={66} x2={-34 - p} y2={170} />
        <line x1={46} y1={66} x2={46 + p} y2={170} /><line x1={80} y1={60} x2={80 - p} y2={170} />
        <ellipse cx={0} cy={30} rx={112} ry={62} fill={pelo} />
        <path d="M-30 78 Q0 96 50 76 Q10 70 -30 78Z" fill={claro} stroke="none" />
        <path d="M92 6 Q120 -60 150 -78" fill="none" strokeWidth={34} stroke={CIRUELA} /><path d="M92 6 Q120 -60 150 -78" fill="none" strokeWidth={18} stroke={pelo} />
        <ellipse cx={170} cy={-92} rx={46} ry={34} fill={pelo} />
        <ellipse cx={204} cy={-84} rx={15} ry={12} fill={CIRUELA} stroke="none" />
        {caido > 0.5 || helado
          ? <path d="M160 -108 l14 14 M174 -108 l-14 14" strokeWidth={6} fill="none" />
          : <circle cx={168} cy={-102} r={7} fill={CIRUELA} stroke="none" />}
        <path d="M150 -120 Q140 -190 100 -210 M134 -170 Q160 -196 168 -226 M118 -196 Q96 -214 92 -244 M176 -122 Q196 -176 236 -186 M204 -158 Q204 -190 224 -214" fill="none" strokeWidth={8} stroke={helado ? "#5d8696" : "#5a3d28"} />
        <path d="M-108 14 q-18 -10 -14 -28" fill="none" />
      </g>
    );
  };

// ---------------------------------------------------------------- cosas del mundo
export const Hielo: React.FC<{ x: number; y: number; lado: number; derrite?: number; grietas?: number; children?: React.ReactNode }> = ({ x, y, lado, derrite = 0, grietas = 0, children }) => {
  const a = lado * (1 - 0.35 * derrite), b = lado * (1 - 0.55 * derrite);
  const largo = 520;
  return (
    <g transform={`translate(${x} ${y})`}>
      {children}
      <rect x={-a / 2} y={-b / 2 + lado * 0.2 * derrite} width={a} height={b} rx={lado * (0.1 + 0.25 * derrite)} fill="#bfe9fb" fillOpacity={0.62 * (1 - 0.75 * derrite)} stroke={TINTA} strokeWidth={8} strokeOpacity={1 - 0.6 * derrite} />
      <path d={`M${-a * 0.38} ${-b * 0.3} l${a * 0.16} ${-b * 0.08} M${-a * 0.38} ${-b * 0.16} l${a * 0.07} ${-b * 0.04}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" fill="none" opacity={1 - derrite} />
      {grietas > 0 && <g fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={largo} strokeDashoffset={largo * (1 - grietas)} opacity={1 - 0.8 * derrite}>
        <path d={`M${a * 0.1} ${-b / 2} l-30 70 l44 50 l-60 80 l30 60`} />
        <path d={`M${-a / 2} ${b * 0.1} l80 -20 l50 46 l70 -30`} />
        <path d={`M${a / 2} ${-b * 0.12} l-70 30 l-20 60`} />
      </g>}
      {derrite > 0.05 && <ellipse cx={0} cy={lado * 0.5} rx={lado * (0.3 + 0.5 * derrite)} ry={lado * 0.07 * (0.4 + derrite)} fill="#9fdcf5" fillOpacity={0.8} stroke={TINTA} strokeWidth={6} />}
    </g>
  );
};

export const Nieve: React.FC<{ t: number; n?: number; alto?: number; o?: number }> = ({ t, n = 40, alto = H, o = 0.9 }) => (
  <g fill="#fff" opacity={o}>
    {[...Array(n)].map((_, i) => {
      const x = (azar(i) * W + 60 * Math.sin(t * 0.8 + i)) % W, y = (azar(i + 50) * alto + t * (60 + 80 * azar(i + 9))) % alto;
      return <circle key={i} cx={x} cy={y} r={3 + 5 * azar(i + 3)} />;
    })}
  </g>
);

/** par de ojos dormidos en la oscuridad que se abren con `abre` */
export const OjosOscuros: React.FC<{ x: number; y: number; s?: number; abre: number; color?: string }> = ({ x, y, s = 1, abre, color = "#b8ff5a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-34, 34].map((u) => <g key={u}>
      <ellipse cx={u} cy={0} rx={24} ry={2 + 20 * cl(abre)} fill={color} />
      {abre > 0.4 && <circle cx={u} cy={0} r={7} fill="#06100a" />}
    </g>)}
  </g>
);
