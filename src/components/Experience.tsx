import Portal from "./Portal";
import { folder, useControls } from "leva";
import Grass from "./Grass";
import Lights from "./Lights";
import { Sparkles } from "@react-three/drei";

const Experience = () => {
  const { platformWidth, platformDepth } = useControls({
    PlatformSetting: folder({
      platformWidth: {
        value: 60,
        min: 10,
        max: 3000,
        step: 1,
      },
      platformDepth: {
        value: 60,
        min: 10,
        max: 3000,
        step: 1,
      },
    }),
  });

  return (
    <group>
      <Lights />
      <Portal/>
      <mesh receiveShadow rotation-x={Math.PI / 2} position-y={-0.5}>
        <boxGeometry args={[platformWidth / 2 + 3, platformDepth / 2 + 3]} />
        <meshStandardMaterial color={"#052108"} />
      </mesh>
      <Grass platform_width={platformWidth} platform_depth={platformDepth} />
        <Sparkles
          position={[0, 7, 0]}
          count={700}
          size={3}
          scale={[platformWidth / 2, 15, platformDepth / 2]}
          opacity={0.3}
        />
    </group>
  );
};

export default Experience;
