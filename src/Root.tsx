import React from "react";
import { Composition, Still } from "remotion";
import { ZombiShort, ZOMBI_CUADROS } from "./videos/virus-zombie/Zombi";
import { HojaTambo } from "./personaje/Tambo";
import { ReelHuellas, ReelRadio, reelCuadros } from "./videos/tambo-01/Reels";
import { MiniaturaFaro, FondoFlyerFaro } from "./videos/tambo-01/portadas";
import { FaroCap1, FARO_CUADROS, FARO_FPS } from "./videos/tambo-01/Faro";
// Registra cada short nuevo aquí, con su propio id.
export const Root: React.FC = () => (
  <>
    <Composition id="VirusZombi" component={ZombiShort} durationInFrames={ZOMBI_CUADROS} fps={30} width={1080} height={1920} />
    <Composition id="FaroCap1" component={FaroCap1} durationInFrames={FARO_CUADROS} fps={FARO_FPS} width={1920} height={1080} />
    <Composition id="ReelHuellas" component={ReelHuellas} durationInFrames={reelCuadros("huellas")} fps={FARO_FPS} width={1080} height={1920} />
    <Composition id="ReelRadio" component={ReelRadio} durationInFrames={reelCuadros("radio")} fps={FARO_FPS} width={1080} height={1920} />
    <Still id="MiniaturaFaro" component={MiniaturaFaro} width={1920} height={1080} />
    <Still id="FondoFlyerFaro" component={FondoFlyerFaro} width={1080} height={1920} />
    <Still id="HojaTambo" component={HojaTambo} width={1080} height={1920} />
  </>
);
