import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import vertexShader from "../shaders/grass/vert.glsl?raw";
import fragmentShader from "../shaders/grass/frag.glsl?raw";
import { useFrame } from "@react-three/fiber";
import { folder, useControls } from "leva";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import Flowers from "./Flowers";

interface props {
  platform_width: number;
  platform_depth: number;
}

const Grass: React.FC<props> = ({ platform_depth, platform_width }) => {
  const { BLADE_COUNT, bladeBaseColor, bladeTipColor } = useControls({
    BladeSetting: folder({
      BLADE_COUNT: {
        value: 100010,
        min: 10000,
        max: 1000000,
        step: 100,
        label: "bladeCount",
      },
      bladeBaseColor: {
        value: "#096c13",
      },
      bladeTipColor: {
        value: "#baba28",
      },
    }),
  });

  const [grassGeometry, grassMaterial] = useMemo(() => {
    const mat: CustomShaderMaterial = new CustomShaderMaterial({
      baseMaterial: THREE.MeshPhysicalMaterial,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0.0 },
        uBladeTipColor: { value: new THREE.Color("#096c13") },
        uBladeBaseColor: { value: new THREE.Color("#baba28") },
      },
      shadowSide: THREE.FrontSide,
      transmission: 0.6,
      thickness: 0.1,
      roughness: 0.7,
      metalness: 0.1,
    });

    const geo: THREE.PlaneGeometry = new THREE.PlaneGeometry(0.2, 3, 6, 10);
    return [geo, mat];
  }, []);

  // Update material uniforms when colors change
  useEffect(() => {
    grassMaterial.uniforms.uBladeTipColor.value=new THREE.Color(bladeTipColor);
    grassMaterial.uniforms.uBladeBaseColor.value=new THREE.Color(bladeBaseColor);
  }, [bladeBaseColor, bladeTipColor, grassMaterial]);

  useFrame((state) => {
    grassMaterial.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    if (meshRef.current==null) return;
    for (let i = 0; i < BLADE_COUNT; i++) {
      dummy.position.set(
        THREE.MathUtils.randFloatSpread(platform_width / 2),
        1.5,
        THREE.MathUtils.randFloatSpread(platform_depth / 2),
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.castShadow = true;
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [
    platform_depth,
    platform_width,
    BLADE_COUNT,
    dummy,
    grassMaterial.uniforms,
  ]);

  return (
    <>
      <instancedMesh
        key={BLADE_COUNT}
        ref={meshRef}
        args={[grassGeometry, grassMaterial, BLADE_COUNT]}
      />
      <Flowers/>
    </>
  );
};

export default Grass;
