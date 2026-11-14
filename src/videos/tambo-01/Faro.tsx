// Capítulo 1 de Tambo: «Sobreviví 1 año en un faro» (1920x1080, 24 cps). La línea de tiempo viene de capitulo.json
// (capitulos/01-faro/armar.py); el audio final (voz + ambiente) se une después con ffmpeg.
import React from "react";
import { AbsoluteFill, useCurrentFrame, getInputProps } from "remotion";
import { W, H, F, cl, pr } from "./base";
import { TOMAS } from "./tomas";
import { Tarjeta } from "./interiores";
import cap from "./capitulo.json";

export const FARO_FPS = cap.fps, FARO_CUADROS = cap.cuadros;
type Palabra = { p: string; a: number; b: number; n: number };
const PAL = cap.palabras as Palabra[];
const CLAVE = /^(regla|reglas|luz|faro|chispa|oeste|huellas|cuaderno|mar|isla|radio|voz|día|agua|nadie|alguien|miro|yo|tres|puerta|diez|nueve|ocho|siete|seis)$/i;
const limpia = (w: string) => w.replace(/[.,:;¿?¡!…]/g, "");

// subtítulos: grupos de hasta 4 palabras (corte en puntuación); la palabra que suena va en amarillo y más grande
type Grupo = { a: number; b: number; ws: Palabra[] };
const GRUPOS: Grupo[] = (() => {
  const g: Grupo[] = []; let act: Palabra[] = [];
  PAL.forEach((w, i) => {
    act.push(w);
    const sig = PAL[i + 1], largo = act.map((x) => x.p).join(" ").length;
    if (act.length === 4 || largo > 22 || !sig || sig.n !== w.n || /[.,:;?!…]$/.test(w.p)) {
      g.push({ a: act[0].a, b: sig && sig.n === w.n ? Math.min(sig.a, w.b + 0.6) : w.b + 0.45, ws: act }); act = [];
    }
  });
  return g;
})();

export const Subtitulo: React.FC<{ t: number; x?: number; y?: number; tam?: number }> = ({ t, x = W / 2, y = 968, tam = 66 }) => {
  const g = GRUPOS.find((x) => t >= x.a - 0.04 && t < x.b);
  if (!g) return null;
  const pop = 0.92 + 0.08 * pr(t, g.a - 0.04, g.a + 0.08);
  return (
    <g transform={`translate(${x} ${y}) scale(${pop})`} fontFamily={F} fontWeight={800} fontSize={tam} textAnchor="middle" stroke="#120a12" strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">
      <text>{g.ws.map((w, i) => {
        const activa = t >= w.a - 0.03 && t < w.b + 0.06, clave = CLAVE.test(limpia(w.p));
        return <tspan key={i} fill={activa ? "#ffd23f" : clave ? "#ffe9a6" : "#fff"} fontSize={activa ? tam * 1.15 : tam}>{(i ? " " : "") + (activa ? w.p.toUpperCase() : w.p)}</tspan>;
      })}</text>
    </g>
  );
};

/** la escena del capítulo en el segundo t (sin subtítulos) */
export const escenaEn = (t: number): React.ReactElement => {
  const tr = cap.tramos.find((x) => t >= x.a && t < x.b) ?? cap.tramos[cap.tramos.length - 1];
  const u = cl((t - tr.a) / (tr.b - tr.a));
  if (tr.tipo === "tarjeta") return <Tarjeta texto={String(tr.id)} u={u} t={t} />;
  const lista = TOMAS[tr.tipo === "voz" ? `v${tr.id}` : tr.tipo === "pausa" ? `p:${tr.id}` : "titulo"];
  if (!lista) return <rect width={W} height={H} fill="#300" />;
  const total = lista.reduce((s, x) => s + x[0], 0);
  let acc = 0;
  for (const [peso, dib] of lista) {
    const a = acc / total, b = (acc + peso) / total; acc += peso;
    if (u >= a && (u < b || b >= 1)) return dib({ u: cl((u - a) / (b - a)), t });
  }
  return lista[lista.length - 1][1]({ u: 1, t });
};

export const FaroCap1: React.FC = () => {
  const f = useCurrentFrame(), t = f / cap.fps;
  const props = getInputProps() as { sinSubtitulos?: boolean };
  const escena = escenaEn(t);
  const negro = Math.max(1 - pr(t, 0, 0.6), pr(t, cap.total - 1.2, cap.total - 0.1));
  return (
    <AbsoluteFill style={{ background: "#05060c" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {escena}
        {!props.sinSubtitulos && <Subtitulo t={t} />}
        {negro > 0 && <rect width={W} height={H} fill="#000" opacity={negro} />}
      </svg>
    </AbsoluteFill>
  );
};
