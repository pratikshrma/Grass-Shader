import { useThree } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect, useRef } from "react";
import * as THREE from "three";
const Lights = () => {
  const { scene } = useThree();
  const { lightPos, lightColor, lightIntensity, lightHelper } = useControls({
    lightSetting: folder({
      lightPos: {
        value: [-7, 10, 10],
      },
      lightColor: {
        value: "#36454f",
      },
      lightIntensity: {
        value: 3,
        min: 0,
        max: 10,
        step: 0.01,
      },
      lightHelper: {
        value:false
      },
    }),
  });

  const lightRef = useRef(null);
  useEffect(() => {
    if (!lightRef.current) return;

    const helper = new THREE.DirectionalLightHelper(lightRef.current, 2);
    if (lightHelper) {
      scene.add(helper);
    }

    return ()=>{scene.remove(helper)}
  }, [lightRef, scene,lightHelper]);

  return (
    <>
      <ambientLight intensity={0} color={"white"} />
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
