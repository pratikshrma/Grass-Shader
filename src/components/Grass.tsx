import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import vertexShader from "../shaders/grass/vert.glsl?raw";
import fragmentShader from "../shaders/grass/frag.glsl?raw";
import { useFrame } from "@react-three/fiber";

interface props {
  platform_width: number;
  platform_depth: number;
}

const Grass: React.FC<props> = ({ platform_depth, platform_width }) => {
  const [grassGeometry, grassMaterial] = useMemo(() => {
    const mat: THREE.ShaderMaterial = new THREE.ShaderMaterial({
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0.0 },
      },
      shadowSide: THREE.FrontSide,
    });

    const geo: THREE.PlaneGeometry = new THREE.PlaneGeometry(0.2, 3, 6, 10);
    console.log("Attributes ", geo.attributes);
    return [geo, mat];
  }, []);

  useFrame((state) => {
    grassMaterial.uniforms.uTime.value = state.clock.elapsedTime;
  });

  //lets just first generate a lot of grassCoords

  const BLADE_COUNT = 100000;

  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    if (!meshRef.current) return;

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

    meshRef.current.customDepthMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: `
      #include <common>
      #include <packing>
      #include <logdepthbuf_pars_fragment>
      #include <clipping_planes_pars_fragment>
      
      void main() {
        #include <clipping_planes_fragment>
        #include <logdepthbuf_fragment>
        
        gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
      }
    `,
      uniforms: {
        uTime: grassMaterial.uniforms.uTime,
      },
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[grassGeometry, grassMaterial, BLADE_COUNT]}
      />
    </>
  );
};

export default Grass;
