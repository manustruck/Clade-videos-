// Reels verticales (1080x1920) sacados del capítulo 1: los ganchos más fuertes, con la misma animación y voz.
// La escena horizontal va en una ventana al centro, con una copia ampliada y oscura de fondo, título arriba y
// subtítulos grandes abajo.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { F, pr } from "./base";
import { escenaEn, Subtitulo } from "./Faro";
import cap from "./capitulo.json";

const tramo = (tipo: string, id: string | number, recorte = 0) => { const x = cap.tramos.find((q) => q.tipo === tipo && String(q.id) === String(id))!; return { a: x.a, b: x.b - recorte }; };
export const REELS = {
  huellas: { dia: "DÍA 58", titulo: ["HUELLAS QUE SALEN", "DE MI PUERTA"], pregunta: "¿De quién son?", segs: [tramo("voz", 18), tramo("voz", 19), tramo("voz", 20)], cierre: tramo("tarjeta", "DÍA 77") },
  radio: { dia: "DÍA 120", titulo: ["ALGUIEN CONTESTÓ", "MI RADIO"], pregunta: "¿Quién habla?", segs: [tramo("voz", 25, 1.2), tramo("voz", 26, 1.0), tramo("voz", 27, 1.8), tramo("voz", 51, 0.8)], cierre: tramo("tarjeta", "DÍA 150") },
};
export type ReelId = keyof typeof REELS;
export const reelSegundos = (id: ReelId) => REELS[id].segs.reduce((s, x) => s + x.b - x.a, 0) + (REELS[id].cierre.b - REELS[id].cierre.a);
export const reelCuadros = (id: ReelId) => Math.round(reelSegundos(id) * cap.fps);

const VW = 0.8, VY = 1010, ALTO = 1080 * VW; // ventana de la escena
export const Reel: React.FC<{ id: ReelId }> = ({ id }) => {
  const r = REELS[id], f = useCurrentFrame(), tau = f / cap.fps;
  let t = -1, acc = 0;
  for (const s of r.segs) { const d = s.b - s.a; if (tau < acc + d) { t = s.a + (tau - acc); break; } acc += d; }
  const fin = t < 0, uf = fin ? (tau - acc) / (r.cierre.b - r.cierre.a) : 0;
  const escena = fin ? null : escenaEn(t);
  return (
    <AbsoluteFill style={{ background: "#05060c" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs><clipPath id="rv"><rect x={0} y={VY - ALTO / 2} width={1080} height={ALTO} rx={0} /></clipPath></defs>
        {!fin && <>
          <g transform="translate(540 960) scale(1.9) translate(-960 -540)">{escena}</g>
          <rect width={1080} height={1920} fill="#05060c" opacity={0.78} />
          <g clipPath="url(#rv)"><g transform={`translate(540 ${VY}) scale(${VW}) translate(-960 -540)`}>{escena}</g></g>
          <rect x={-10} y={VY - ALTO / 2} width={1100} height={ALTO} fill="none" stroke="#f3e6c8" strokeWidth={6} />
          <g fontFamily={F} fontWeight={800} textAnchor="middle" stroke="#0c0810" strokeLinejoin="round" paintOrder="stroke" opacity={pr(tau, 0, 0.35)}>
            <rect x={380} y={96} width={320} height={74} rx={37} fill="#b8322a" stroke="none" />
            <text x={540} y={150} fontSize={46} fill="#fff" stroke="none" letterSpacing={3}>{r.dia}</text>
            <text x={540} y={300} fontSize={78} fill="#fff" strokeWidth={18}>{r.titulo[0]}</text>
            <text x={540} y={400} fontSize={78} fill="#ffd23f" strokeWidth={18}>{r.titulo[1]}</text>
            <text x={540} y={480} fontSize={38} fill="#f3e6c8" strokeWidth={10} letterSpacing={2}>TAMBO · 1 AÑO EN UN FARO</text>
          </g>
          <Subtitulo t={t} x={540} y={1620} tam={74} />
          <rect x={0} y={1908} width={1080 * (tau / reelSegundos(id))} height={12} fill="#ffd23f" />
        </>}
        {fin && <g fontFamily={F} fontWeight={800} textAnchor="middle" opacity={Math.min(pr(uf, 0, 0.2), 1)} transform={`translate(540 960) scale(${0.96 + 0.06 * uf})`}>
          <text y={-150} fontSize={110} fill="#f3e6c8">{r.pregunta}</text>
          <line x1={-240 * pr(uf, 0.05, 0.5)} y1={-90} x2={240 * pr(uf, 0.05, 0.5)} y2={-90} stroke="#b8322a" strokeWidth={12} strokeLinecap="round" />
          <text y={40} fontSize={60} fill="#fff">Capítulo completo</text>
          <text y={120} fontSize={60} fill="#fff">en YouTube</text>
          <text y={250} fontSize={64} fill="#ffd23f">Sígueme para la parte 2</text>
        </g>}
      </svg>
    </AbsoluteFill>
  );
};
export const ReelHuellas: React.FC = () => <Reel id="huellas" />;
export const ReelRadio: React.FC = () => <Reel id="radio" />;
