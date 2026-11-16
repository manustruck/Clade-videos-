// Botones animados de LIKE y FOLLOW con una mano que los toca: va justo después del gancho (a los ~2 s).
// `a`..`b` = segundos en que se ve. Se dibuja en un <svg> de 1080x1920.
import React from "react";

const F = "DejaVu Sans, Arial, sans-serif";
const cl = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const u = cl(x); return u * u * (3 - 2 * u); };
const atras = (u: number) => { const c1 = 1.70158, c3 = c1 + 1, x = cl(u) - 1; return 1 + c3 * x * x * x + c1 * x * x; };

const Pulgar: React.FC = () => (
  <g fill="#fff">
    <path d="M-38 -6 h20 v52 h-20 z" />
    <path d="M-12 -6 Q4 -14 10 -40 Q14 -58 24 -52 Q34 -46 28 -20 L26 -10 H52 Q64 -10 62 2 L56 38 Q54 48 42 48 H-12 Z" />
  </g>
);
const Mano: React.FC<{ x: number; y: number; toca: number }> = ({ x, y, toca }) => (
  <g transform={`translate(${x} ${y}) scale(${1 - 0.12 * toca}) rotate(-18)`}>
    <path d="M0 0 C-6 -40 22 -44 24 -4 L26 30 L36 26 Q50 22 52 36 L54 52 Q66 46 70 60 L72 74 Q84 70 86 84 L88 130 Q86 172 46 176 L10 176 Q-14 172 -22 140 L-42 74 Q-48 54 -30 52 Q-16 52 -8 70 Z" fill="#ffe0c7" stroke="#14321f" strokeWidth={8} strokeLinejoin="round" />
  </g>
);

export const PideSeguir: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  if (t < a || t > b) return null;
  const u = (t - a) / (b - a), entra = atras((t - a) / 0.3), sale = 1 - sm((t - (b - 0.25)) / 0.25);
  const tocaLike = t > a + 0.45 && t < a + 0.65 ? 1 : 0, likeOn = t >= a + 0.55, tocaFol = t > a + 1.05 && t < a + 1.25 ? 1 : 0, folOn = t >= a + 1.15;
  const manoX = u < 0.3 ? 330 : u < 0.5 ? 330 + (720 - 330) * sm((t - a - 0.7) / 0.35) : 720, manoY = 830 + 40 * (tocaLike + tocaFol);
  const estallido = (cx: number, cy: number, t0: number, col: string) => t > t0 && t < t0 + 0.5 && <g>{[...Array(10)].map((_, i) => {
    const k = (t - t0) / 0.5, ang = (i / 10) * Math.PI * 2;
    return <line key={i} x1={cx + Math.cos(ang) * (90 + 60 * k)} y1={cy + Math.sin(ang) * (90 + 60 * k)} x2={cx + Math.cos(ang) * (110 + 110 * k)} y2={cy + Math.sin(ang) * (110 + 110 * k)} stroke={col} strokeWidth={12 * (1 - k)} strokeLinecap="round" />;
  })}</g>;
  return (
    <g opacity={sale} fontFamily={F} fontWeight={800} textAnchor="middle">
      <g transform={`translate(330 700) scale(${entra * (likeOn ? 1 + 0.15 * Math.exp(-(t - a - 0.55) * 8) : 1)})`}>
        <circle r={95} fill={likeOn ? "#2f86ff" : "#7d8a96"} stroke="#fff" strokeWidth={10} />
        <g transform="translate(-6 -4) scale(1.15)"><Pulgar /></g>
      </g>
      {estallido(330, 700, a + 0.55, "#2f86ff")}
      {likeOn && <text x={330} y={700 - 120 - 60 * sm((t - a - 0.55) / 0.5)} opacity={1 - sm((t - a - 0.9) / 0.4)} fontSize={64} fill="#2f86ff" stroke="#fff" strokeWidth={12} paintOrder="stroke">+1</text>}
      <g transform={`translate(720 700) scale(${entra * (folOn ? 1 + 0.15 * Math.exp(-(t - a - 1.15) * 8) : 1)})`}>
        <rect x={-190} y={-75} width={380} height={150} rx={75} fill={folOn ? "#27c24c" : "#ff2a2a"} stroke="#fff" strokeWidth={10} />
        <text y={24} fontSize={folOn ? 54 : 74} fill="#fff">{folOn ? "FOLLOWING" : "FOLLOW"}</text>
      </g>
      {estallido(720, 700, a + 1.15, "#27c24c")}
      <Mano x={manoX} y={manoY} toca={tocaLike + tocaFol} />
    </g>
  );
};
