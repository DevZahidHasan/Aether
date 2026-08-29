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

interface CameraFlightState {
  active: boolean;
  startTime: number;
  duration: number;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startDist: number;
  targetDist: number;
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
  const lastTelemetryEmitRef = useRef<number>(0);

  // Smooth Zoom target tracking
  const targetDistanceRef = useRef<number>(4.8 / Math.max(0.1, zoom));
  const isZoomingExternal = useRef<boolean>(false);

  // Cinematic 3D Spherical Flight state
  const flightRef = useRef<CameraFlightState>({
    active: false,
    startTime: 0,
    duration: 1250,
    startPos: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
    startDist: 4.8,
    targetDist: 3.3,
  });

  // Vestibular Accessibility: detect system prefers-reduced-motion
  const prefersReducedMotionRef = useRef<boolean>(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Handle external zoom changes from ZoomControls (+ / -) with smooth easing
  useEffect(() => {
    const baseDistance = 4.8;
    const targetDistance = Math.max(2.10, Math.min(8.0, baseDistance / zoom));
    targetDistanceRef.current = targetDistance;
    isZoomingExternal.current = true;
  }, [zoom]);

  // Handle North orientation reset trigger ('N' button) with smooth slerp
  useEffect(() => {
    if (resetOrientationTrigger > 0 && controlsRef.current) {
      const startPos = camera.position.clone();
      const targetPos = new THREE.Vector3(0, 0, Math.max(3.2, camera.position.length()));
      const isReduced = prefersReducedMotionRef.current;

      flightRef.current = {
        active: true,
        startTime: performance.now(),
        duration: isReduced ? 50 : 900,
        startPos,
        targetPos,
        startDist: startPos.length(),
        targetDist: targetPos.length(),
      };

      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.set(0, 0, 0);
      }
    }
  }, [resetOrientationTrigger, camera]);

  // Handle "Fly to Location" cinematic 3D great-circle arc flight
  useEffect(() => {
    if (flyToCoord && earthGroupRef.current) {
      const earthRotY = earthGroupRef.current.rotation.y;
      const latRad = flyToCoord.lat * (Math.PI / 180);
      const lonRad = (flyToCoord.lon * (Math.PI / 180)) + earthRotY;
      const targetDist = 3.3; // Focus altitude for point interrogation

      const cosLat = targetDist * Math.cos(latRad);
      const targetX = cosLat * Math.cos(lonRad);
      const targetY = targetDist * Math.sin(latRad);
      const targetZ = -cosLat * Math.sin(lonRad);
      const targetPos = new THREE.Vector3(targetX, targetY, targetZ);
      const startPos = camera.position.clone();
      const isReduced = prefersReducedMotionRef.current;

      flightRef.current = {
        active: true,
        startTime: performance.now(),
        duration: isReduced ? 50 : 1250, // Instant 50ms transition if user prefers reduced motion
        startPos,
        targetPos,
        startDist: startPos.length(),
        targetDist,
      };
    }
  }, [flyToCoord, camera]);

  // Animation frame loop: Earth rotation + flight slerp + zoom telemetry + coordinates
  useFrame((_, delta) => {
    // 1. Rotate the Earth gently when playback is active (paused if reduced motion is requested)
    if (playbackState === "playing" && earthGroupRef.current && !prefersReducedMotionRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.05 * playbackSpeed;
    }

    // 2. Cinematic 3D Spherical Arc Camera Flight Interpolation
    if (flightRef.current.active) {
      const flight = flightRef.current;
      const elapsed = performance.now() - flight.startTime;
      const rawProgress = Math.min(1, elapsed / flight.duration);

      // easeOutCubic: 1 - (1 - t)^3
      const t = prefersReducedMotionRef.current ? rawProgress : (1 - Math.pow(1 - rawProgress, 3));

      // Spherical direction interpolation (great-circle slerp)
      const startDir = flight.startPos.clone().normalize();
      const targetDir = flight.targetPos.clone().normalize();
      const qStart = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), startDir);
      const qTarget = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), targetDir);
      const qCurrent = new THREE.Quaternion().copy(qStart).slerp(qTarget, t);
      const currentDir = new THREE.Vector3(0, 0, 1).applyQuaternion(qCurrent);

      // Parabolic altitude arc: rises at midpoint to clear the horizon (skipped if reduced motion)
      const arcAltitudePeak = prefersReducedMotionRef.current ? 0.0 : 0.45;
      const altitudeBump = Math.sin(rawProgress * Math.PI) * arcAltitudePeak;
      const currentDist = THREE.MathUtils.lerp(flight.startDist, flight.targetDist, t) + altitudeBump;

      camera.position.copy(currentDir.multiplyScalar(currentDist));
      camera.lookAt(0, 0, 0);

      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

      if (rawProgress >= 1) {
        flight.active = false;
      }
    } else if (isZoomingExternal.current) {
      // 3. Smooth continuous zoom easing for external + / - buttons
      const currentDist = camera.position.length();
      const diff = targetDistanceRef.current - currentDist;

      if (Math.abs(diff) > 0.02) {
        const newDist = THREE.MathUtils.damp(currentDist, targetDistanceRef.current, 7.5, delta);
        const currentDir = camera.position.clone().normalize();
        camera.position.copy(currentDir.multiplyScalar(newDist));
        if (controlsRef.current) controlsRef.current.update();
      } else {
        isZoomingExternal.current = false;
      }
    }

    // 4. Dynamic Zoom & Coordinate telemetry (throttled to 20Hz / 50ms gate to avoid React re-render thrashing)
    const now = performance.now();
    const canEmitTelemetry = now - lastTelemetryEmitRef.current > 50;

    if (onZoomChange && canEmitTelemetry) {
      const currentDist = camera.position.length();
      const currentZoom = 4.8 / Math.max(currentDist, 0.1);
      if (Math.abs(currentZoom - lastEmittedZoom.current) > 0.04) {
        lastEmittedZoom.current = currentZoom;
        onZoomChange(parseFloat(currentZoom.toFixed(2)));
      }
    }

    if (!onCoordinateChange) return;

    // 5. Vector pointing from globe center to camera
    const dir = camera.position.clone().normalize();
    const earthRotationY = earthGroupRef.current ? earthGroupRef.current.rotation.y : 0;

    // Compute latitude and longitude in degrees matching Three.js UV texture space
    const lat = Math.asin(Math.max(-1, Math.min(1, dir.y))) * (180 / Math.PI);
    let lon = (Math.atan2(-dir.z, dir.x) - earthRotationY) * (180 / Math.PI);
    lon = ((lon + 180) % 360 + 360) % 360 - 180;

    if (
      canEmitTelemetry &&
      (Math.abs(lat - lastEmittedCoord.current.lat) > 0.06 ||
       Math.abs(lon - lastEmittedCoord.current.lon) > 0.06)
    ) {
      lastTelemetryEmitRef.current = now;
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

      {/* Physics-based Orbital Controls (Calibrated planetary inertia) */}
      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.038}
        rotateSpeed={0.65}
        minDistance={2.10}
        maxDistance={8.0}
        enablePan={false}
        autoRotate={false}
      />
    </>
  );
}
