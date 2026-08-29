"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

export interface EarthSphereProps {
  radius?: number;
}

const EARTH_NORMAL_SCALE = new THREE.Vector2(0.8, 0.8);
const EARTH_EMISSIVE_COLOR = new THREE.Color("#ffd480");

export function EarthSphere({ radius = 2 }: EarthSphereProps) {
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load high-resolution NASA satellite textures
  const textures = useTexture({
    map: "/textures/earth/earth-day.jpg",
    roughnessMap: "/textures/earth/earth-specular.jpg",
    normalMap: "/textures/earth/earth-normal.jpg",
    emissiveMap: "/textures/earth/earth-night.png",
    cloudsMap: "/textures/earth/earth-clouds.png",
  });

  // Set proper color space encoding
  textures.map.colorSpace = THREE.SRGBColorSpace;
  textures.emissiveMap.colorSpace = THREE.SRGBColorSpace;
  textures.cloudsMap.colorSpace = THREE.SRGBColorSpace;

  // Subtle planetary cloud drift animation
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <group>
      {/* 1. Core Earth Planetary Sphere */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={textures.map}
          normalMap={textures.normalMap}
          normalScale={EARTH_NORMAL_SCALE}
          roughnessMap={textures.roughnessMap}
          roughness={0.65}
          metalnessMap={textures.roughnessMap}
          metalness={0.15}
          emissiveMap={textures.emissiveMap}
          emissive={EARTH_EMISSIVE_COLOR}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 2. Concentric Volumetric Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[radius * 1.008, 64, 64]} />
        <meshStandardMaterial
          map={textures.cloudsMap}
          transparent={true}
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
