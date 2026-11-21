// Imágenes fijas del capítulo 1: miniatura horizontal para YouTube y fondo del flyer vertical.
import React from "react";
import { F } from "./base";
import { Exterior } from "./exterior";
import { Tambo, Chispa } from "../../personaje/Tambo";

export const MiniaturaFaro: React.FC = () => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080">
    <Exterior t={3} hora="noche" haz="isla" figura={1} cam={[1300, 640, 1.0]} />
    <rect width={1920} height={1080} fill="#05060f" opacity={0.18} />
    <circle cx={1500} cy={760} r={520} fill="#ffcf6a" opacity={0.12} />
    <Chispa x={1010} y={1130} s={1.25} alerta voltea cola={-0.5} />
    <Tambo x={1500} y={1560} s={1.32} gesto="miedo" brazo={0.75} mira={[-1, 0.2]} />
    <g fontFamily={F} fontWeight={800} stroke="#0c0810" strokeLinejoin="round" paintOrder="stroke">
      <text x={70} y={250} fontSize={250} fill="#fff" strokeWidth={34}>1 AÑO</text>
      <text x={78} y={360} fontSize={86} fill="#ffd23f" strokeWidth={20}>EN UN FARO</text>
    </g>
  </svg>
);

export const FondoFlyerFaro: React.FC = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920">
    <g transform="translate(-1500 0) scale(1.7778)"><Exterior t={3} hora="noche" haz="isla" figura={1} cam={[1560, 560, 1.0]} /></g>
    <rect width={1080} height={1920} fill="#05060f" opacity={0.15} />
    <circle cx={620} cy={1500} r={560} fill="#ffcf6a" opacity={0.12} />
    <Chispa x={150} y={1940} s={1.15} alerta cola={-0.5} />
    <Tambo x={660} y={2260} s={1.3} gesto="miedo" brazo={0.75} mira={[-1, -0.3]} />
  </svg>
);
