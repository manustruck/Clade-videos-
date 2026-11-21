// Base del capítulo 1 de Tambo (horizontal 1920x1080, 24 cuadros por segundo): utilidades, cámara y textos.
import React from "react";

export const W = 1920, H = 1080;
export const TINTA = "#14121a", CIRUELA = "#241726";
export const F = "DejaVu Sans, Arial, sans-serif";

export const cl = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const u = cl(x); return u * u * (3 - 2 * u); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const pr = (t: number, a: number, b: number) => sm((t - a) / (b - a));
export const azar = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** [x, y, zoom] del centro de la cámara en el mundo del escenario */
export type Cam = [number, number, number];
export const camEntre = (a: Cam, b: Cam, u: number): Cam => { const s = sm(u); return [lerp(a[0], b[0], s), lerp(a[1], b[1], s), lerp(a[2], b[2], s)]; };
export const Camara: React.FC<{ cam: Cam; tiembla?: number; t?: number; children: React.ReactNode }> = ({ cam, tiembla = 0, t = 0, children }) => (
  <g transform={`translate(${W / 2 + tiembla * Math.sin(t * 71)} ${H / 2 + tiembla * Math.cos(t * 83)}) scale(${cam[2]}) translate(${-cam[0]} ${-cam[1]})`}>{children}</g>
);

export type Hora = "dia" | "tarde" | "noche" | "niebla" | "amanecer";
export const CIELO: Record<Hora, [string, string]> = {
  dia: ["#5fb2e6", "#cdeaf7"], tarde: ["#3d3a78", "#f39a55"], noche: ["#070b22", "#1d2c5a"], niebla: ["#8f9ea6", "#b9c4c8"], amanecer: ["#4a5a9a", "#f7b98a"],
};
export const MAR: Record<Hora, [string, string]> = {
  dia: ["#2f86c4", "#1d5f96"], tarde: ["#54508c", "#2a2a5c"], noche: ["#10204a", "#081230"], niebla: ["#7b8b93", "#5f7078"], amanecer: ["#5a78b0", "#2f4a80"],
};

/** degradados compartidos; ids únicos por `k` */
export const Degradado: React.FC<{ id: string; a: string; b: string; vertical?: boolean }> = ({ id, a, b, vertical = true }) => (
  <linearGradient id={id} x1="0" y1="0" x2={vertical ? "0" : "1"} y2={vertical ? "1" : "0"}><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
);
export const Halo: React.FC<{ id: string; color: string; o?: number }> = ({ id, color, o = 1 }) => (
  <radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity={o} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient>
);
/** oscuridad con un hueco de luz (el farol): la única luz cálida de las escenas de noche */
export const Penumbra: React.FC<{ id: string; x: number; y: number; r: number; o?: number; ancho?: number; alto?: number }> = ({ id, x, y, r, o = 0.78, ancho = 4000, alto = 2400 }) => (
  <g>
    <defs><radialGradient id={id} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={r}>
      <stop offset="0" stopColor="#ffcf6a" stopOpacity={0.16} /><stop offset="0.35" stopColor="#1a1430" stopOpacity={o * 0.25} /><stop offset="1" stopColor="#060818" stopOpacity={o} />
    </radialGradient></defs>
    <rect x={-800} y={-600} width={ancho + 1600} height={alto + 1200} fill={`url(#${id})`} />
  </g>
);

/** cifra o rótulo discreto arriba del cuadro */
export const Rotulo: React.FC<{ texto: string; sub?: string; o: number; color?: string }> = ({ texto, sub, o, color = "#fff" }) => o <= 0 ? null : (
  <g opacity={o} transform={`translate(${W / 2} 150) scale(${0.9 + 0.1 * o})`} fontFamily={F} fontWeight={800} textAnchor="middle" stroke="#120c14" strokeLinejoin="round" paintOrder="stroke">
    <text fontSize={84} fill={color} strokeWidth={16}>{texto}</text>
    {sub && <text y={56} fontSize={38} fill="#fff" strokeWidth={11}>{sub}</text>}
  </g>
);

export const Lluvia: React.FC<{ t: number; n?: number; ancho?: number; alto?: number; o?: number }> = ({ t, n = 90, ancho = W, alto = H, o = 0.55 }) => (
  <g stroke="#cfe6f5" strokeWidth={4} strokeLinecap="round" opacity={o}>
    {[...Array(n)].map((_, i) => { const x = azar(i) * (ancho + 300) - 150, y = ((azar(i + 40) * alto + t * (900 + 500 * azar(i + 7))) % (alto + 100)) - 50; return <line key={i} x1={x} y1={y} x2={x - 16} y2={y + 46} />; })}
  </g>
);
export const Niebla: React.FC<{ t: number; o?: number; ancho?: number; y0?: number; alto?: number }> = ({ t, o = 0.5, ancho = 3400, y0 = 300, alto = 1300 }) => (
  <g opacity={o}>
    {[...Array(9)].map((_, i) => <ellipse key={i} cx={((azar(i) * ancho + t * (18 + 22 * azar(i + 3))) % (ancho + 800)) - 400} cy={y0 + azar(i + 9) * alto} rx={520 + 380 * azar(i + 5)} ry={110 + 90 * azar(i + 6)} fill="#d9e2e6" opacity={0.5} />)}
  </g>
);
