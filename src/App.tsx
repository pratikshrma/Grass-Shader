import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Experience from "./components/Experience";
import Lights from "./components/Lights";
import { Suspense } from "react";
import { Perf } from "r3f-perf";
const App = () => {
  return (
    <Canvas
      shadows={true}
      gl={{ antialias: true }}
      camera={{ position: [3, 3, 10] }}
    >
      <color attach="background" args={["#080808"]}/>
      <Perf position="top-left" />
      <OrbitControls />
      <Lights />
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
  );
};

export default App;
