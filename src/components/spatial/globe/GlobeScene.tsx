import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { EarthSphere } from "./EarthSphere";
import { TemperatureLayer } from "./TemperatureLayer";
import { AirQualityLayer } from "./AirQualityLayer";
import { PrecipitationLayer } from "./PrecipitationLayer";
import { WindLayer } from "./WindLayer";
import { AtmosphereGlow } from "./AtmosphereGlow";
import { GeographicGraticule } from "./GeographicGraticule";
import { CountryBordersLayer } from "./CountryBordersLayer";
import { InspectionMarker } from "./InspectionMarker";
import type { GeoCoordinate, PlaybackState } from "@/types/spatial";

export interface GlobeSceneProps {
  zoom?: number;
  resetOrientationTrigger?: number;
  playbackState?: PlaybackState;
  playbackSpeed?: number;
  isTemperatureActive?: boolean;
  temperatureOpacity?: number;
  isPrecipitationActive?: boolean;
  precipitationOpacity?: number;
  isWindActive?: boolean;
  windOpacity?: number;
  isAirQualityActive?: boolean;
  airQualityOpacity?: number;
  progressPercent?: number;
  monthOfYear?: number;
  mode?: "explore" | "inspect";
  inspectedPoint?: { lat: number; lon: number } | null;
  flyToCoord?: { lat: number; lon: number; timestamp: number } | null;
  onSelectPoint?: (point: { lat: number; lon: number }) => void;
  onCoordinateChange?: (coord: GeoCoordinate) => void;
  onZoomChange?: (zoom: number) => void;
}

export function GlobeScene({
  zoom = 1.0,
  resetOrientationTrigger = 0,
  playbackState = "paused",
  playbackSpeed = 1,
  isTemperatureActive = true,
  temperatureOpacity = 0.75,
  isPrecipitationActive = false,
  precipitationOpacity = 0.65,
  isWindActive = false,
  windOpacity = 0.8,
  isAirQualityActive = false,
  airQualityOpacity = 0.7,
  progressPercent = 85,
  monthOfYear = 1.0,
  mode = "explore",
  inspectedPoint = null,
  flyToCoord = null,
  onSelectPoint,
  onCoordinateChange,
  onZoomChange,
}: GlobeSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const earthGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const lastEmittedCoord = useRef<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
  const lastEmittedZoom = useRef<number>(zoom);

  // Handle external zoom changes from ZoomControls (+ / -)
  useEffect(() => {
    if (!controlsRef.current) return;
    const baseDistance = 4.8;
    const targetDistance = Math.max(2.10, Math.min(8.0, baseDistance / zoom));
    const currentDist = camera.position.length();

    if (Math.abs(currentDist - targetDistance) > 0.12) {
      const currentDir = camera.position.clone().normalize();
      camera.position.copy(currentDir.multiplyScalar(targetDistance));
      controlsRef.current.update();
    }
  }, [zoom, camera]);

  // Handle North orientation reset trigger ('N' button)
  useEffect(() => {
    if (resetOrientationTrigger > 0 && controlsRef.current) {
      camera.position.set(0, 0, 4.8);
      camera.up.set(0, 1, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.set(0, 0, 0);
      }
    }
  }, [resetOrientationTrigger, camera]);

  // Handle "Fly to Location" camera centering
  useEffect(() => {
    if (flyToCoord && controlsRef.current && earthGroupRef.current) {
      const earthRotY = earthGroupRef.current.rotation.y;
      const latRad = flyToCoord.lat * (Math.PI / 180);
      const lonRad = (flyToCoord.lon * (Math.PI / 180)) + earthRotY;
      const dist = Math.max(3.2, camera.position.length());
      const cosLat = dist * Math.cos(latRad);
      const targetX = cosLat * Math.cos(lonRad);
      const targetY = dist * Math.sin(latRad);
      const targetZ = -cosLat * Math.sin(lonRad);

      camera.position.set(targetX, targetY, targetZ);
      camera.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [flyToCoord, camera]);

  // Animation frame loop: Earth rotation + zoom telemetry + coordinate calculation
  useFrame((_, delta) => {
    // 1. Rotate the Earth gently when playback is active
    if (playbackState === "playing" && earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.05 * playbackSpeed;
    }

    // 2. Dynamic Zoom telemetry from mouse wheel / touch gestures
    if (onZoomChange) {
      const currentDist = camera.position.length();
      const currentZoom = 4.8 / Math.max(currentDist, 0.1);
      if (Math.abs(currentZoom - lastEmittedZoom.current) > 0.04) {
        lastEmittedZoom.current = currentZoom;
        onZoomChange(parseFloat(currentZoom.toFixed(2)));
      }
    }

    if (!onCoordinateChange) return;

    // Vector pointing from globe center to camera
    const dir = camera.position.clone().normalize();
    const earthRotationY = earthGroupRef.current ? earthGroupRef.current.rotation.y : 0;

    // Compute latitude and longitude in degrees matching Three.js UV texture space
    const lat = Math.asin(Math.max(-1, Math.min(1, dir.y))) * (180 / Math.PI);
    let lon = (Math.atan2(-dir.z, dir.x) - earthRotationY) * (180 / Math.PI);
    lon = ((lon + 180) % 360 + 360) % 360 - 180;

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
      <group ref={earthGroupRef}>
        <EarthSphere radius={2} />
        <TemperatureLayer
          radius={2}
          active={isTemperatureActive}
          opacity={temperatureOpacity}
          progressPercent={progressPercent}
        />
        <AirQualityLayer
          radius={2}
          active={isAirQualityActive}
          opacity={airQualityOpacity}
          progressPercent={progressPercent}
          monthOfYear={monthOfYear}
        />
        <PrecipitationLayer
          radius={2}
          active={isPrecipitationActive}
          opacity={precipitationOpacity}
          progressPercent={progressPercent}
          monthOfYear={monthOfYear}
        />
        <WindLayer
          radius={2}
          active={isWindActive}
          opacity={windOpacity}
          progressPercent={progressPercent}
          monthOfYear={monthOfYear}
        />
        <CountryBordersLayer radius={2} opacity={0.32} color="#ffffff" />
        <GeographicGraticule radius={2} />

        {/* 3D Spatial Inspection Marker (anchored to globe surface) */}
        {inspectedPoint && (
          <InspectionMarker
            latitude={inspectedPoint.lat}
            longitude={inspectedPoint.lon}
            radius={2.018}
          />
        )}

        {/* Invisible Click-to-Inspect Interaction Shell (ONLY active when in Inspect Mode) */}
        {mode === "inspect" && (
          <mesh
            visible={false}
            onClick={(e) => {
              e.stopPropagation();
              if (!earthGroupRef.current || !onSelectPoint) return;
              // Convert intersection point from world to Earth local space
              const local = earthGroupRef.current.worldToLocal(e.point.clone()).normalize();
              const lat = Math.asin(Math.max(-1, Math.min(1, local.y))) * (180 / Math.PI);
              let lon = Math.atan2(-local.z, local.x) * (180 / Math.PI);
              lon = ((lon + 180) % 360 + 360) % 360 - 180;
              onSelectPoint({
                lat: parseFloat(lat.toFixed(4)),
                lon: parseFloat(lon.toFixed(4)),
              });
            }}
          >
            <sphereGeometry args={[2.022, 64, 64]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}
      </group>
      <AtmosphereGlow radius={2} color="#52a0ff" />

      {/* Physics-based Orbital Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.7}
        minDistance={2.10}
        maxDistance={8.0}
        enablePan={false}
        autoRotate={false}
      />
    </>
  );
}
