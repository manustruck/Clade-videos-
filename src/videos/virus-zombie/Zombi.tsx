// «El virus zombi»: short vertical 2D de 60 s. Escenas en escenas.tsx; voz y tiempos por palabra de ElevenLabs.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import { W, H, FPS, pr } from "./piezas";
import { ESCENAS } from "./escenas";
import palabras from "./palabras.json";

export const ZOMBI_CUADROS = 60 * FPS;
const XFADE = 0.2; // fundido de 6 cuadros al cambiar de lugar
const CLAVE = new Set(["congelado", "propósito", "siberia", "gigante", "mamuts", "neandertales", "despertó", "zombi", "amebas", "desgracia",
  "dieciséis", "ántrax", "renos", "congelador", "pausa", "cuatro", "luz", "adentro"]);
const limpia = (w: string) => w.toLowerCase().replace(/[.,:;¿?¡!]/g, "");

// subtítulos: hasta 3 palabras, cortando en la puntuación
type Grupo = { a: number; b: number; ws: string[] };
const GRUPOS: Grupo[] = (() => {
  const g: Grupo[] = []; let act: typeof palabras = [];
  palabras.forEach((w, i) => {
    act.push(w);
    const sig = palabras[i + 1];
    if (act.length === 3 || !sig || /[.,:;?!]$/.test(w.palabra)) {
      g.push({ a: act[0].inicio, b: sig ? Math.min(sig.inicio, w.fin + 0.5) : w.fin + 0.3, ws: act.map((x) => x.palabra.replace(/[.,:;]$/, "")) });
      act = [];
    }
  });
  return g;
})();

const Subtitulo: React.FC<{ t: number }> = ({ t }) => {
  const g = GRUPOS.find((x) => t >= x.a - 0.03 && t < x.b);
  if (!g) return null;
  const pop = 0.9 + 0.1 * pr(t, g.a - 0.03, g.a + 0.09);
  return (
    <g transform={`translate(540 1500) scale(${pop})`} fontFamily="DejaVu Sans, Arial, sans-serif" fontWeight={800} fontSize={g.ws.join(" ").length > 20 ? 68 : 80}
      textAnchor="middle" stroke="#150c12" strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">
      <text>{g.ws.map((w, i) => <tspan key={i} fill={CLAVE.has(limpia(w)) ? "#ffd23f" : "#fff"}>{(i ? " " : "") + (CLAVE.has(limpia(w)) ? w.toUpperCase() : w)}</tspan>)}</text>
    </g>
  );
};

export const ZombiShort: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const props = getInputProps() as { mute?: boolean; sinSubtitulos?: boolean };
  return (
    <AbsoluteFill style={{ background: "#0b1622" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {ESCENAS.map((e, i) => {
          const fin = i + 1 < ESCENAS.length ? ESCENAS[i + 1].a + XFADE : 61;
          if (t < e.a || t >= fin) return null;
          return <g key={i} opacity={i === 0 ? 1 : pr(t, e.a, e.a + XFADE)}><e.C t={t} /></g>;
        })}
        {!props.sinSubtitulos && <Subtitulo t={t} />}
      </svg>
      {!props.mute && <Audio src={staticFile("virus-zombie/voz.mp3")} />}
    </AbsoluteFill>
  );
};
