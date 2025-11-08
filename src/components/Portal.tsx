import { OBJLoader } from "three/examples/jsm/Addons.js";
import { useLoader } from "@react-three/fiber";
import { useMemo, type JSX } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

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

const Model = ({ url, textures }: ModelProps): JSX.Element => {
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
    Object.entries(texturePaths).filter(([, value]) => value !== undefined)
  ) as Record<string, string>;

  const loadedTextures = useTexture(definedTexturePaths);


  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      ...loadedTextures,
      transparent: true,
      alphaTest: 0.3,
      side:THREE.DoubleSide
    });
  }, [loadedTextures]);

  const processedObj = useMemo(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.castShadow=true
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
    alphaMap:  "portal/Grass_Opacity.png",
  };

  const leavesTexture:MaterialTexture={
    map: "portal/Leaves_Base_color.png",
    metallicMap:undefined,
    normalMap: "portal/Leaves_Normal_OpenGL.png",
    aoMap: undefined,
    roughnessMap: "portal/Leaves_Roughness.png",
    alphaMap:  "portal/Leaves_Opacity.png",
  }

  const portalTexture:MaterialTexture={
    map: "portal/Portal_Base_color.png",
    metallicMap:undefined,
    normalMap: "portal/Portal_Normal_OpenGL.png",
    aoMap:  "portal/Portal_Mixed_AO.png",
    roughnessMap: "portal/Portal_Roughness.png",
    alphaMap:  undefined,
  }

  return (
    <group>
      <Model url={"portal/model_0.obj"} textures={grassTexture} />
      <Model url={"portal/model_1.obj"} textures={leavesTexture} />
      <Model url={"portal/model_2.obj"} textures={grassTexture} />
      <Model url={"portal/model_3.obj"} textures={portalTexture} />
      <Model url={"portal/model_4.obj"} textures={leavesTexture} />
      <Model url={"portal/model_5.obj"} textures={grassTexture} />
    </group>
  );
};

export default Portal;
