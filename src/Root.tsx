import React from "react";
import { Composition, Still } from "remotion";
import { ZombiShort, ZOMBI_CUADROS } from "./videos/virus-zombie/Zombi";
import { HojaTambo } from "./personaje/Tambo";
import { FencePost, FENCE_CUADROS, FENCE_FPS } from "./videos/fence-01/Fence";
import { RetainingWall, WALL_CUADROS, WALL_FPS } from "./videos/wall-02/Wall";
import { DeckVideo, DECK_CUADROS, DECK_FPS } from "./videos/deck-03/Deck";
import { GateVideo, GATE_CUADROS, GATE_FPS } from "./videos/gate-04/Gate";
import { ShedVideo, SHED_CUADROS, SHED_FPS } from "./videos/shed-05/Shed";
import { PaversVideo, PAV_CUADROS, PAV_FPS } from "./videos/pavers-06/Pavers";
import { GutterVideo, GUT_CUADROS, GUT_FPS } from "./videos/gutter-07/Gutter";
import { StairsVideo, STA_CUADROS, STA_FPS } from "./videos/stairs-08/Stairs";
import { FabricVideo, FAB_CUADROS, FAB_FPS } from "./videos/fabric-09/Fabric";
import { TreatedVideo, TRE_CUADROS, TRE_FPS } from "./videos/treated-10/Treated";
import { FirePitVideo, FIRE_CUADROS, FIRE_FPS } from "./videos/firepit-11/FirePit";
import { SlabVideo, SLAB_CUADROS, SLAB_FPS } from "./videos/slab-12/Slab";
import { RailingVideo, RAIL_CUADROS, RAIL_FPS } from "./videos/railing-13/Railing";
import { LadderVideo, LAD_CUADROS, LAD_FPS } from "./videos/ladder-14/Ladder";
import { LeonidaFiles, leoCuadros, LEO_FPS } from "./videos/leonida/Leonida";
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
    <Composition id="FencePost" component={FencePost} durationInFrames={FENCE_CUADROS} fps={FENCE_FPS} width={1080} height={1920} />
    <Composition id="RetainingWall" component={RetainingWall} durationInFrames={WALL_CUADROS} fps={WALL_FPS} width={1080} height={1920} />
    <Composition id="DeckVideo" component={DeckVideo} durationInFrames={DECK_CUADROS} fps={DECK_FPS} width={1080} height={1920} />
    <Composition id="GateVideo" component={GateVideo} durationInFrames={GATE_CUADROS} fps={GATE_FPS} width={1080} height={1920} />
    <Composition id="ShedVideo" component={ShedVideo} durationInFrames={SHED_CUADROS} fps={SHED_FPS} width={1080} height={1920} />
    <Composition id="PaversVideo" component={PaversVideo} durationInFrames={PAV_CUADROS} fps={PAV_FPS} width={1080} height={1920} />
    <Composition id="GutterVideo" component={GutterVideo} durationInFrames={GUT_CUADROS} fps={GUT_FPS} width={1080} height={1920} />
    <Composition id="StairsVideo" component={StairsVideo} durationInFrames={STA_CUADROS} fps={STA_FPS} width={1080} height={1920} />
    <Composition id="FabricVideo" component={FabricVideo} durationInFrames={FAB_CUADROS} fps={FAB_FPS} width={1080} height={1920} />
    <Composition id="TreatedWood" component={TreatedVideo} durationInFrames={TRE_CUADROS} fps={TRE_FPS} width={1080} height={1920} />
    <Composition id="FirePit" component={FirePitVideo} durationInFrames={FIRE_CUADROS} fps={FIRE_FPS} width={1080} height={1920} />
    <Composition id="ConcreteSlab" component={SlabVideo} durationInFrames={SLAB_CUADROS} fps={SLAB_FPS} width={1080} height={1920} />
    <Composition id="DeckRailing" component={RailingVideo} durationInFrames={RAIL_CUADROS} fps={RAIL_FPS} width={1080} height={1920} />
    <Composition id="LadderAngle" component={LadderVideo} durationInFrames={LAD_CUADROS} fps={LAD_FPS} width={1080} height={1920} />
    {[1, 2, 3, 4, 5].map((n) => <Composition key={n} id={`Leonida${n}`} component={LeonidaFiles} durationInFrames={leoCuadros(n)} fps={LEO_FPS} width={1080} height={1920} defaultProps={{ parte: n }} />)}
    <Still id="MiniaturaFaro" component={MiniaturaFaro} width={1920} height={1080} />
    <Still id="FondoFlyerFaro" component={FondoFlyerFaro} width={1080} height={1920} />
    <Still id="HojaTambo" component={HojaTambo} width={1080} height={1920} />
  </>
);
