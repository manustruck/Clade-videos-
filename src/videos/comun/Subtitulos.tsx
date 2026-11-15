// Subtítulos animados para los shorts en inglés (estilo viral): mayúsculas gruesas, cada palabra APARECE con rebote justo
// cuando suena, la palabra activa va en amarillo y más grande, las palabras clave en naranja con un pequeño temblor,
// y cada grupo (2 a 3 palabras) cambia de inclinación. Los tiempos vienen de tiempos.json.
import React, { useMemo } from "react";

export type Palabra = { p: string; a: number; b: number; i: number };
type Grupo = { a: number; b: number; ws: Palabra[] };
const F = "DejaVu Sans, Arial, sans-serif";
const lim = (s: string) => s.toLowerCase().replace(/[^a-z']/g, "");
const sm = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
const atrasOut = (u: number) => { const c1 = 1.70158, c3 = c1 + 1, x = Math.max(0, Math.min(1, u)) - 1; return 1 + c3 * x * x * x + c1 * x * x; };
// ancho aproximado de cada letra (en «em») de DejaVu Sans Bold en mayúsculas
const ANCHO: Record<string, number> = { A: 0.77, B: 0.76, C: 0.73, D: 0.83, E: 0.68, F: 0.65, G: 0.82, H: 0.84, I: 0.37, J: 0.37, K: 0.78, L: 0.64, M: 0.99, N: 0.84, O: 0.85, P: 0.73, Q: 0.85, R: 0.77, S: 0.72, T: 0.68, U: 0.81, V: 0.77, W: 1.1, X: 0.77, Y: 0.73, Z: 0.72, " ": 0.35, ",": 0.38, ".": 0.38, "!": 0.42, "?": 0.7, "'": 0.3, "-": 0.42, "–": 0.6, "·": 0.4 };
const anchoDe = (s: string) => [...s].reduce((a, c) => a + (ANCHO[c] ?? (/\d/.test(c) ? 0.7 : 0.8)), 0);

export const agrupar = (palabras: Palabra[], maxChars = 16): Grupo[] => {
  const g: Grupo[] = []; let act: Palabra[] = [];
  palabras.forEach((w, i) => {
    act.push(w);
    const sig = palabras[i + 1], largo = act.map((x) => x.p).join(" ").length;
    const corta = /[.,;:?!…]$/.test(w.p) || !sig || sig.i !== w.i || act.length >= 3 || (sig && largo + sig.p.length + 1 > maxChars);
    if (corta) { g.push({ a: act[0].a, b: sig && sig.i === w.i ? sig.a : w.b + 0.35, ws: act }); act = []; }
  });
  return g;
};

export const Subtitulos: React.FC<{ palabras: Palabra[]; t: number; claves?: string[]; y?: number; tam?: number; ocultoDesde?: number }> = ({ palabras, t, claves = [], y = 1560, tam = 86, ocultoDesde = 1e9 }) => {
  const grupos = useMemo(() => agrupar(palabras), [palabras]);
  const set = useMemo(() => new Set(claves.map(lim)), [claves]);
  if (t >= ocultoDesde) return null;
  const idx = grupos.findIndex((x) => t >= x.a - 0.05 && t < x.b);
  if (idx < 0) return null;
  const g = grupos[idx], tilt = (idx % 2 ? 1 : -1) * 1.8;
  const textos = g.ws.map((w) => w.p.replace(/[.,;:]+$/, "").toUpperCase());
  const anchos = textos.map((s) => anchoDe(s) * tam), esp = 0.42 * tam;
  const total = anchos.reduce((a, b) => a + b, 0) + esp * (textos.length - 1), ajuste = Math.min(1, 980 / total);
  let x0 = -total / 2;
  const palabrasDib = g.ws.map((w, i) => {
    const cx = x0 + anchos[i] / 2; x0 += anchos[i] + esp;
    const visible = t >= w.a - 0.04, u = (t - (w.a - 0.04)) / 0.2;
    const activa = t >= w.a - 0.02 && t < w.b + 0.12, clave = set.has(lim(w.p));
    const esc = !visible ? 0 : (0.45 + 0.55 * atrasOut(u)) * (activa ? 1.09 + 0.04 * Math.sin((t - w.a) * 22) : 1);
    const rot = clave && visible ? 2.5 * Math.sin(t * 26 + i) * Math.exp(-(t - w.a) * 2) : 0;
    const col = activa ? "#ffd23f" : clave ? "#ff8a2a" : "#ffffff";
    return { cx, esc, rot, col, txt: textos[i], visible, activa };
  });
  return (
    <g transform={`translate(540 ${y}) rotate(${tilt}) scale(${ajuste * (1 + 0.04 * (1 - sm((t - g.a) / 0.12)))})`} fontFamily={F} fontWeight={800} fontSize={tam} textAnchor="middle" strokeLinejoin="round" paintOrder="stroke">
      {palabrasDib.map((w, i) => w.visible && (
        <g key={i} transform={`translate(${w.cx} 0) rotate(${w.rot}) scale(${w.esc})`}>
          <text y={12} fill="#0b1a10" stroke="#0b1a10" strokeWidth={36}>{w.txt}</text>
          <text fill={w.col} stroke={w.activa ? "#14321f" : "#14321f"} strokeWidth={22}>{w.txt}</text>
        </g>
      ))}
    </g>
  );
};
