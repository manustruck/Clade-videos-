import React from "react";
import { Composition } from "remotion";
import { ZombiShort, ZOMBI_CUADROS } from "./videos/virus-zombie/Zombi";
// Registra cada short nuevo aquí, con su propio id.
export const Root: React.FC = () => (
  <>
    <Composition id="VirusZombi" component={ZombiShort} durationInFrames={ZOMBI_CUADROS} fps={30} width={1080} height={1920} />
  </>
);
