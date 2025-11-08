import Portal from "./Portal";
import * as THREE from "three";
import vertexShader from "../shaders/portal/vert.glsl?raw";
import fragmentShader from "../shaders/portal/frag.glsl?raw";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo } from "react";
import Grass from "./Grass";
import Lights from "./Lights";

const Experience = () => {
  const { colorStart, colorEnd } = useControls({
    colorStart: "#ff0000",
    colorEnd: "#0000ff"
  });

  const portalShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      uniforms: {
        uTime: { value: 0.0 },
        uColorStart: { value: new THREE.Color(colorStart) },
        uColorEnd: { value: new THREE.Color(colorEnd) },
      },
    });
  }, []);

  useEffect(() => {
    portalShaderMaterial.uniforms.uColorStart.value.set(colorStart);
  }, [colorStart, portalShaderMaterial]);

  useEffect(() => {
    portalShaderMaterial.uniforms.uColorEnd.value.set(colorEnd);
  }, [colorEnd, portalShaderMaterial]);

  useFrame((state) => {
    portalShaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group>
      <Lights />
      <Portal />
      <mesh receiveShadow rotation-x={Math.PI / 2} position-y={-0.5}>
        <boxGeometry args={[30, 30]} />
        <meshStandardMaterial />
      </mesh>
      <mesh position={[-0.2, 2, 0]} material={portalShaderMaterial}>
        <circleGeometry args={[2.2]} />
      </mesh>
      <Grass platform_width={100} platform_depth={100}/>
    </group>
  );
};

export default Experience;
