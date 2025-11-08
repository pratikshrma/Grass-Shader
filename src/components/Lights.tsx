import { useThree } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect, useRef } from "react";
import * as THREE from "three";
const Lights = () => {
  const { scene } = useThree();
  const { lightPos, lightColor, lightIntensity } = useControls({
    lightSetting: folder({
      lightPos: {
        value: [10, 10, 10],
      },
      lightColor: {
        value: "#ffd700",
      },
      lightIntensity: {
        value: 1,
        min: 1,
        max: 10,
        step: 1,
      },
    }),
  });

  const lightRef = useRef(null);
  useEffect(() => {
    if (!lightRef.current) return;

    const helper = new THREE.DirectionalLightHelper(lightRef.current, 2);
    scene.add(helper);
  }, [lightRef, scene]);

  return (
    <>
      <ambientLight intensity={1} color={"white"} />
      <directionalLight
        ref={lightRef}
        castShadow
        position={lightPos}
        intensity={lightIntensity}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-15}
        shadow-camera-far={40}
        color={lightColor}
      />
    </>
  );
};

export default Lights;
