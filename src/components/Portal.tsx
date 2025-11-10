import { OBJLoader } from "three/examples/jsm/Addons.js";
import { useLoader } from "@react-three/fiber";
import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { folder, useControls } from "leva";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import vertexShader from "../shaders/portal/vert.glsl?raw";
import fragmentShader from "../shaders/portal/frag.glsl?raw";
import { useFrame } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";

interface MaterialTexture {
  map: string;
  metallicMap?: string;
  normalMap?: string;
  aoMap?: string;
  roughnessMap?: string;
  alphaMap?: string;
}

interface ModelProps {
  url: string;
  textures: MaterialTexture;
}

const Model = ({ url, textures }: ModelProps)=> {
  const obj = useLoader(OBJLoader, url);

  // Defensively filter out any undefined texture paths before calling the hook
  const texturePaths = {
    map: textures.map,
    metalnessMap: textures.metallicMap,
    normalMap: textures.normalMap,
    aoMap: textures.aoMap,
    roughnessMap: textures.roughnessMap,
    alphaMap: textures.alphaMap,
  };

  const definedTexturePaths = Object.fromEntries(
    Object.entries(texturePaths).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;

  const loadedTextures = useTexture(definedTexturePaths);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      ...loadedTextures,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
    });
  }, [loadedTextures]);

  const processedObj = useMemo(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.castShadow = true;
      }
    });
    return obj;
  }, [obj, material]);

  return <primitive object={processedObj} />;
};

const Portal = () => {
  const grassTexture: MaterialTexture = {
    map: "portal/Grass_Base_color.png",
    metallicMap: "portal/Grass_Metallic.png",
    normalMap: "portal/Grass_Normal_OpenGL.png",
    aoMap: undefined,
    roughnessMap: "portal/Grass_Roughness.png",
    alphaMap: "portal/Grass_Opacity.png",
  };

  const leavesTexture: MaterialTexture = {
    map: "portal/Leaves_Base_color.png",
    metallicMap: undefined,
    normalMap: "portal/Leaves_Normal_OpenGL.png",
    aoMap: undefined,
    roughnessMap: "portal/Leaves_Roughness.png",
    alphaMap: "portal/Leaves_Opacity.png",
  };

  const portalTexture: MaterialTexture = {
    map: "portal/Portal_Base_color.png",
    metallicMap: undefined,
    normalMap: "portal/Portal_Normal_OpenGL.png",
    aoMap: "portal/Portal_Mixed_AO.png",
    roughnessMap: "portal/Portal_Roughness.png",
    alphaMap: undefined,
  };

  const { portalInnerColor, portalOuterColor } = useControls({
    PortalSetting: folder({
      portalInnerColor: "#a164ad",
      portalOuterColor: "#1c98c1",
    }),
  });

  const portalShaderMaterial = useMemo(() => {
    return new CustomShaderMaterial({
      baseMaterial: THREE.MeshStandardMaterial,
      side: THREE.DoubleSide,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      uniforms: {
        uTime: { value: 0.0 },
        uColorStart: { value: new THREE.Color(portalInnerColor) },
        uColorEnd: { value: new THREE.Color(portalOuterColor) },
      },
      transparent: true,
      emissive:new THREE.Color(portalInnerColor),
      emissiveIntensity:2
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
    <group position={[1.3,0,8]}>
      <Model url={"portal/model_0.obj"} textures={grassTexture} />
      <Model url={"portal/model_1.obj"} textures={leavesTexture} />
      <Model url={"portal/model_2.obj"} textures={grassTexture} />
      <Model url={"portal/model_3.obj"} textures={portalTexture} />
      <Model url={"portal/model_4.obj"} textures={leavesTexture} />
      <Model url={"portal/model_5.obj"} textures={grassTexture} />
      <Select enabled>
        <mesh position={[-0.2, 2, 0]} material={portalShaderMaterial}>
          <circleGeometry args={[2.2]} />
        </mesh>
      </Select>
    </group>
  );
};

export default Portal;
