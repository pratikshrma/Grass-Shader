const Lights = () => {
  return (
    <>
      <ambientLight intensity={1} color={"white"} />
      <directionalLight
        castShadow
        position={[10, 10, 10]}
        intensity={1}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-15}
        shadow-camera-far={40}
        />
    </>
  );
};

export default Lights;
