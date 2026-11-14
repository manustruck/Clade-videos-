import React from "react";
import { Composition, Still } from "remotion";
import { ZombiShort, ZOMBI_CUADROS } from "./videos/virus-zombie/Zombi";
import { HojaTambo } from "./personaje/Tambo";
// Registra cada short nuevo aquí, con su propio id.
export const Root: React.FC = () => (
  <>
    <Composition id="VirusZombi" component={ZombiShort} durationInFrames={ZOMBI_CUADROS} fps={30} width={1080} height={1920} />
    <Still id="HojaTambo" component={HojaTambo} width={1080} height={1920} />
  </>
);
