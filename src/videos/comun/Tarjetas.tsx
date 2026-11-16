// Tarjetas compartidas de los shorts en inglés: sello UP TO NORM, votación entre equipos y cierre FOLLOW. Van en un <svg> 1080x1920.
import React from "react";

const F = "DejaVu Sans, Arial, sans-serif";
const cl = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const u = cl(x); return u * u * (3 - 2 * u); };
const atras = (u: number) => { const c1 = 1.70158, c3 = c1 + 1, x = cl(u) - 1; return 1 + c3 * x * x * x + c1 * x * x; };
const ventana = (t: number, a: number, b: number, d = 0.25) => Math.min(sm((t - a) / d), 1 - sm((t - (b - d)) / d));

export const Sello: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  const o = ventana(t, a, b, 0.22); if (o <= 0) return null;
  return <g transform={`translate(540 440) rotate(-8) scale(${2.2 - 1.2 * sm((t - a) / 0.22)})`} opacity={o} fontFamily={F} fontWeight={800} textAnchor="middle">
    <rect x={-250} y={-74} width={500} height={148} rx={22} fill="#27c24c" stroke="#fff" strokeWidth={10} /><text y={24} fontSize={62} fill="#fff">UP TO NORM</text></g>;
};

/** «TEAM A vs TEAM B»: dos botones con contadores que suben y burbujas de comentarios */
export const Equipos: React.FC<{ t: number; a: number; b: number; izq: string; der: string; colIzq?: string; colDer?: string }> = ({ t, a, b, izq, der, colIzq = "#27c24c", colDer = "#ff4f9a" }) => {
  const o = ventana(t, a, b, 0.2); if (o <= 0) return null;
  const u = cl((t - a) / (b - a)), e1 = atras((t - a) / 0.35), e2 = atras((t - a - 0.15) / 0.35);
  const n1 = Math.floor(1200 * sm(u * 1.3) + 37 * Math.sin(t * 3)), n2 = Math.floor(1100 * sm(u * 1.25) + 41 * Math.cos(t * 3.3));
  const k = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(Math.max(0, n)));
  const boton = (x: number, txt: string, col: string, esc: number, n: number) => (
    <g transform={`translate(${x} 470) scale(${esc})`}>
      <rect x={-235} y={-120} width={470} height={240} rx={40} fill={col} stroke="#fff" strokeWidth={10} />
      <text y={-20} fontSize={txt.length >= 8 ? 56 : 66} fill="#fff">TEAM</text>
      <text y={50} fontSize={txt.length >= 8 ? 52 : 66} fill="#fff">{txt}</text>
      <text y={180} fontSize={60} fill={col} stroke="#fff" strokeWidth={12} paintOrder="stroke">{k(n)} 💬</text>
    </g>);
  return (
    <g opacity={o} fontFamily={F} fontWeight={800} textAnchor="middle">
      {boton(285, izq, colIzq, e1, n1)}{boton(795, der, colDer, e2, n2)}
      <g transform={`translate(540 470) scale(${1 + 0.1 * Math.sin(t * 12)})`}><circle r={78} fill="#14321f" stroke="#ffd23f" strokeWidth={10} /><text y={26} fontSize={70} fill="#ffd23f">VS</text></g>
      {[...Array(8)].map((_, i) => { const v = ((t - a) * 0.8 + i / 8) % 1; const x = 120 + ((i * 137) % 840); return (
        <g key={i} transform={`translate(${x} ${1350 - 600 * v}) scale(${0.8 + 0.4 * Math.sin(i)})`} opacity={Math.sin(Math.PI * v)}>
          <rect x={-50} y={-34} width={100} height={60} rx={20} fill="#fff" /><path d="M-20 24 l-14 26 l34 -26z" fill="#fff" />
          <circle cx={-22} cy={-4} r={7} fill="#9aa5b1" /><circle cx={0} cy={-4} r={7} fill="#9aa5b1" /><circle cx={22} cy={-4} r={7} fill="#9aa5b1" /></g>); })}
    </g>
  );
};

export const CierreFollow: React.FC<{ t: number; a: number; siguiente: string }> = ({ t, a, siguiente }) => {
  const fin = sm((t - (a - 0.05)) / 0.35); if (fin <= 0) return null;
  return (
    <g opacity={fin} transform={`translate(0 ${-40 * (1 - fin)})`} fontFamily={F} fontWeight={800} textAnchor="middle">
      <rect x={70} y={120} width={940} height={640} rx={48} fill="#14321f" opacity={0.93} stroke="#fff" strokeWidth={8} />
      <g transform={`translate(540 300) scale(${1 + 0.04 * Math.sin(t * 6)})`}><rect x={-290} y={-100} width={580} height={190} rx={95} fill="#ff7a1a" stroke="#fff" strokeWidth={10} /><text y={42} fontSize={118} fill="#fff">FOLLOW</text></g>
      <text x={540} y={500} fontSize={58} fill="#fff">for more backyard builds</text><text x={540} y={570} fontSize={58} fill="#ffd23f">that won't fail!</text>
      <text x={540} y={690} fontSize={siguiente.length > 30 ? 38 : 46} fill="#bfeaff">{siguiente}</text>
    </g>
  );
};
