// Subtítulos llamativos para los shorts en inglés: mayúsculas gruesas, 2 a 3 palabras por pantalla, la palabra que suena
// en amarillo, palabras clave en naranja y un «pop» cada vez que cambia la palabra. Los tiempos vienen de tiempos.json.
import React, { useMemo } from "react";

export type Palabra = { p: string; a: number; b: number; i: number };
type Grupo = { a: number; b: number; ws: Palabra[] };
const F = "DejaVu Sans, Arial, sans-serif";
const lim = (s: string) => s.toLowerCase().replace(/[^a-z']/g, "");
const sm = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };

export const agrupar = (palabras: Palabra[], maxChars = 17): Grupo[] => {
  const g: Grupo[] = []; let act: Palabra[] = [];
  palabras.forEach((w, i) => {
    act.push(w);
    const sig = palabras[i + 1], largo = act.map((x) => x.p).join(" ").length;
    const corta = /[.,;:?!…]$/.test(w.p) || !sig || sig.i !== w.i || act.length >= 3 || (sig && largo + sig.p.length + 1 > maxChars);
    if (corta) { g.push({ a: act[0].a, b: sig && sig.i === w.i ? sig.a : w.b + 0.35, ws: act }); act = []; }
  });
  return g;
};

export const Subtitulos: React.FC<{ palabras: Palabra[]; t: number; claves?: string[]; y?: number; tam?: number; ocultoDesde?: number }> = ({ palabras, t, claves = [], y = 1560, tam = 84, ocultoDesde = 1e9 }) => {
  const grupos = useMemo(() => agrupar(palabras), [palabras]);
  const set = useMemo(() => new Set(claves.map(lim)), [claves]);
  if (t >= ocultoDesde) return null;
  const idx = grupos.findIndex((x) => t >= x.a - 0.04 && t < x.b);
  if (idx < 0) return null;
  const g = grupos[idx], act = g.ws.findIndex((w) => t >= w.a - 0.02 && t < w.b + 0.1), w0 = act >= 0 ? g.ws[act] : g.ws[0];
  const pop = 1 + 0.13 * Math.exp(-(t - w0.a) * 14) * (act >= 0 ? 1 : 0.3) + 0.05 * (1 - sm((t - g.a) / 0.12));
  const tilt = (idx % 2 ? 1 : -1) * 1.6;
  const texto = (dx: number, dy: number, relleno: (w: Palabra, i: number) => string, trazo: number, col?: string) => (
    <text x={dx} y={dy} fontFamily={F} fontWeight={800} fontSize={tam} textAnchor="middle" stroke={col ?? "#14321f"} strokeWidth={trazo} strokeLinejoin="round" paintOrder="stroke">
      {g.ws.map((w, i) => <tspan key={i} fill={relleno(w, i)}>{(i ? " " : "") + w.p.replace(/[.,;:]+$/, "").toUpperCase()}</tspan>)}
    </text>
  );
  return (
    <g transform={`translate(540 ${y}) rotate(${tilt}) scale(${pop})`}>
      {texto(0, 12, () => "#0b1a10", 34, "#0b1a10")}
      {texto(0, 0, (w, i) => (i === act ? "#ffd23f" : set.has(lim(w.p)) ? "#ff8a2a" : "#ffffff"), 22)}
    </g>
  );
};
