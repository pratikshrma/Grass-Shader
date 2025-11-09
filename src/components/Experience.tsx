import Portal from "./Portal";
import * as THREE from "three";
import vertexShader from "../shaders/portal/vert.glsl?raw";
import fragmentShader from "../shaders/portal/frag.glsl?raw";
import { useFrame } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect, useMemo } from "react";
import Grass from "./Grass";
import Lights from "./Lights";
import { Sparkles } from "@react-three/drei";

const Experience = () => {
  const { portalInnerColor, portalOuterColor } = useControls({
    PortalSetting: folder({
      portalInnerColor: "#4b0082",
      portalOuterColor: "#008080",
    }),
  });

  const { platformWidth, platformDepth } = useControls({
    PlatformSetting: folder({
      platformWidth: {
        value: 100,
        min: 10,
        max: 3000,
        step: 1,
      },
      platformDepth: {
        value: 100,
        min: 10,
        max: 3000,
        step: 1,
      },
    }),
  });
  const portalShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      uniforms: {
        uTime: { value: 0.0 },
        uColorStart: { value: new THREE.Color(portalInnerColor) },
        uColorEnd: { value: new THREE.Color(portalOuterColor) },
      },
    });
  }, [portalInnerColor, portalOuterColor]);

  useEffect(() => {
    portalShaderMaterial.uniforms.uColorStart.value.set(portalInnerColor);
  }, [portalInnerColor, portalShaderMaterial]);

  useEffect(() => {
    portalShaderMaterial.uniforms.uColorEnd.value.set(portalOuterColor);
  }, [portalOuterColor, portalShaderMaterial]);

  useFrame((state) => {
    portalShaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group>
      <Lights />
      <Portal />
      <mesh receiveShadow rotation-x={Math.PI / 2} position-y={-0.5}>
        <boxGeometry args={[platformWidth / 2 + 3, platformDepth / 2 + 3]} />
        <meshStandardMaterial color={"#052108"} />
      </mesh>
      <mesh position={[-0.2, 2, 0]} material={portalShaderMaterial}>
        <circleGeometry args={[2.2]} />
      </mesh>
      <Grass platform_width={platformWidth} platform_depth={platformDepth} />
      <Sparkles
        position={[0, 7, 0]}
        count={3000}
        size={3}
        scale={[platformWidth / 2, 15, platformDepth / 2]}
      />
    </group>
  );
};

export default Experience;
