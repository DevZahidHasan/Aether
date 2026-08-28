"use client";

import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { EarthSphere } from "./EarthSphere";
import { AtmosphereGlow } from "./AtmosphereGlow";
import { GeographicGraticule } from "./GeographicGraticule";
import type { GeoCoordinate } from "@/types/spatial";

export interface GlobeSceneProps {
  zoom?: number;
  resetOrientationTrigger?: number;
  onCoordinateChange?: (coord: GeoCoordinate) => void;
}

export function GlobeScene({
  zoom = 1.0,
  resetOrientationTrigger = 0,
  onCoordinateChange,
}: GlobeSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const lastEmittedCoord = useRef<{ lat: number; lon: number }>({ lat: 0, lon: 0 });

  // Handle external zoom changes from ZoomControls (+ / -)
  useEffect(() => {
    if (!controlsRef.current) return;
    // Map zoom multiplier (0.5 to 10.0) to camera distance (from 6.5 down to 2.4)
    const baseDistance = 4.8;
    const targetDistance = Math.max(2.4, Math.min(7.5, baseDistance / zoom));

    // Smoothly adjust camera distance
    const currentDir = camera.position.clone().normalize();
    camera.position.copy(currentDir.multiplyScalar(targetDistance));
    controlsRef.current.update();
  }, [zoom, camera]);

  // Handle North orientation reset trigger ('N' button)
  useEffect(() => {
    if (resetOrientationTrigger > 0 && controlsRef.current) {
      camera.position.set(0, 0, 4.8);
      camera.up.set(0, 1, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [resetOrientationTrigger, camera]);

  // Calculate center geographic coordinates on each frame
  useFrame(() => {
    if (!onCoordinateChange) return;

    // Vector pointing from globe center to camera
    const dir = camera.position.clone().normalize();

    // Compute latitude and longitude in degrees
    const lat = Math.asin(Math.max(-1, Math.min(1, dir.y))) * (180 / Math.PI);
    // In Three.js SphereGeometry, (x=0, z=1) corresponds to 0° longitude
    let lon = Math.atan2(dir.x, dir.z) * (180 / Math.PI);
    if (lon > 180) lon -= 360;
    if (lon < -180) lon += 360;

    // Emit only if changed by at least 0.05 degrees to minimize React state updates
    if (
      Math.abs(lat - lastEmittedCoord.current.lat) > 0.05 ||
      Math.abs(lon - lastEmittedCoord.current.lon) > 0.05
    ) {
      lastEmittedCoord.current = { lat, lon };
      onCoordinateChange({
        latitude: parseFloat(lat.toFixed(2)),
        longitude: parseFloat(lon.toFixed(2)),
      });
    }
  });

  return (
    <>
      {/* Directional Solar Lighting */}
      <directionalLight position={[10, 4, 8]} intensity={2.2} color="#ffffff" />
      {/* Soft Atmospheric Fill Light */}
      <ambientLight intensity={0.4} color="#556075" />

      {/* 3D Planetary Systems */}
      <group>
        <EarthSphere radius={2} />
        <GeographicGraticule radius={2} />
        <AtmosphereGlow radius={2} color="#52a0ff" />
      </group>

      {/* Physics-based Orbital Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.7}
        minDistance={2.4}
        maxDistance={7.5}
        enablePan={false}
        autoRotate={false}
      />
    </>
  );
}
