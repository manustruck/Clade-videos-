// Flo: flamenco rosado de jardín (de plástico, con gafas de sol). La vecina de Norm que siempre opina lo contrario.
// Origen entre las patas; mide ~1 m. `habla` 0..1 abre el pico; `cae` 0..1 la tumba hacia adelante.
import React, { useMemo } from "react";
import * as THREE from "three";

const ROSA = "#ff6fb5", ROSA2 = "#e94f98";
export const Flo: React.FC<{ p: [number, number, number]; t: number; habla?: number; cae?: number; giro?: number; ala?: number; s?: number; bostezo?: number }> = ({ p, t, habla = 0, cae = 0, giro = 0.4, ala = 0, s = 1, bostezo = 0 }) => {
  const cuello = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, 0.6, 0), new THREE.Vector3(0.2, 0.72, 0), new THREE.Vector3(0.1, 0.82, 0), new THREE.Vector3(0.04, 0.92, 0), new THREE.Vector3(0.1, 1.0, 0),
  ]), 24, 0.035, 10, false), []);
  const pico = 0.25 * habla * Math.abs(Math.sin(t * 18)) + 0.5 * bostezo;
  const bota = 0.02 * habla * Math.abs(Math.sin(t * 9));
  return (
    <group position={[p[0], p[1] + bota, p[2]]} rotation={[0, giro, -1.35 * cae]} scale={s}>
      {[-0.05, 0.05].map((z, i) => <mesh key={i} position={[i ? 0.02 : -0.01, 0.24, z]} rotation={[0, 0, i ? 0.08 : -0.04]}><cylinderGeometry args={[0.011, 0.011, 0.48, 6]} /><meshLambertMaterial color="#c9405f" /></mesh>)}
      {[-0.05, 0.05].map((z, i) => <mesh key={i} position={[i ? 0.05 : 0.02, 0.01, z]} scale={[1.6, 0.35, 1]}><sphereGeometry args={[0.03, 8, 6]} /><meshLambertMaterial color="#c9405f" /></mesh>)}
      <mesh position={[0, 0.56, 0]} scale={[1.35, 0.82, 0.8]} castShadow><sphereGeometry args={[0.16, 20, 16]} /><meshLambertMaterial color={ROSA} /></mesh>
      <mesh position={[-0.2, 0.6, 0]} rotation={[0, 0, 0.5]} scale={[1, 0.5, 0.7]}><coneGeometry args={[0.07, 0.14, 10]} /><meshLambertMaterial color={ROSA2} /></mesh>
      <group position={[-0.02, 0.6, 0.11]} rotation={[0.2 * ala * Math.sin(t * 14), 0, 0.3 + 0.5 * ala * Math.abs(Math.sin(t * 14))]}>
        <mesh position={[-0.05, 0, 0]} scale={[1.4, 0.55, 0.3]}><sphereGeometry args={[0.1, 14, 10]} /><meshLambertMaterial color={ROSA2} /></mesh>
      </group>
      <mesh geometry={cuello} castShadow><meshLambertMaterial color={ROSA} /></mesh>
      <mesh position={[0.1, 1.02, 0]} castShadow><sphereGeometry args={[0.07, 18, 14]} /><meshLambertMaterial color={ROSA} /></mesh>
      {/* pico: arriba y abajo, con la punta negra */}
      <group position={[0.16, 1.01, 0]} rotation={[0, 0, -0.5]}>
        <mesh position={[0.04, 0.012, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.028, 0.1, 10]} /><meshLambertMaterial color="#fff3e0" /></mesh>
        <mesh position={[0.092, 0.012, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.012, 0.035, 8]} /><meshLambertMaterial color="#1a1a1a" /></mesh>
        <group rotation={[0, 0, -pico]}><mesh position={[0.035, -0.012, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.7, 1, 0.7]}><coneGeometry args={[0.022, 0.085, 10]} /><meshLambertMaterial color="#ffe0c7" /></mesh></group>
      </group>
      {/* gafas de sol y pestañas */}
      <group position={[0.13, 1.045, 0]}>
        {[-0.045, 0.045].map((z) => <mesh key={z} position={[0.0, 0, z]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.03, 16]} /><meshBasicMaterial color="#1b1b2a" side={THREE.DoubleSide} /></mesh>)}
        <mesh position={[0.0, 0.012, 0]}><boxGeometry args={[0.012, 0.012, 0.13]} /><meshBasicMaterial color="#1b1b2a" /></mesh>
        {[-0.045, 0.045].map((z) => <mesh key={z} position={[0.004, 0.012, z + 0.008]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.008, 8]} /><meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} /></mesh>)}
      </group>
    </group>
  );
};
