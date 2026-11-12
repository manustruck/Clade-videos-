// Configuración de la línea de comandos de Remotion (npx remotion render / studio).
// "swangle" dibuja por software y funciona sin GPU (nube); con GPU usa REMOTION_GL=angle, que es más rápido.
import { Config } from "@remotion/cli/config";

type Gl = "swangle" | "angle" | "egl" | "swiftshader" | "vulkan" | "angle-egl";
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as Gl | undefined) ?? "swangle");
// Por software el primer cuadro tarda bastante más que los 30 s por defecto.
Config.setDelayRenderTimeoutInMilliseconds(240000);
