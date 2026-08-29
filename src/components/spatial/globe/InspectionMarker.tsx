"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface InspectionMarkerProps {
  latitude: number;
  longitude: number;
  radius?: number;
  active?: boolean;
}

/**
 * 3D SPATIAL INSPECTION MARKER
 *
 * Pinned to the Earth's surface at the exact latitude/longitude.
 * Features:
 *   - Amber targeting bead & crosshair reticle
 *   - Continuous expanding radar pulse wave
 *   - Perpendicular elevation stem
 *   - Locked into Earth coordinate space (orbits with planetary rotation)
 */
export function InspectionMarker({
  latitude,
  longitude,
  radius = 2.015,
  active = true,
}: InspectionMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const pulseRing2Ref = useRef<THREE.Mesh>(null);

  // Compute exact 3D Cartesian position on the sphere
  const { position, quaternion } = useMemo(() => {
    const latRad = latitude * (Math.PI / 180);
    const lonRad = longitude * (Math.PI / 180);

    const cosLat = radius * Math.cos(latRad);
    const x = cosLat * Math.cos(lonRad);
    const y = radius * Math.sin(latRad);
    const z = -cosLat * Math.sin(lonRad);

    const pos = new THREE.Vector3(x, y, z);
    const normal = pos.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    return { position: pos, quaternion: q };
  }, [latitude, longitude, radius]);

  // Animated radar wave pulsation
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // First pulse wave (period: 1.8s)
    if (pulseRingRef.current) {
      const cycle = (elapsed % 1.8) / 1.8; // 0 to 1
      const scale = 0.5 + cycle * 2.2;
      pulseRingRef.current.scale.set(scale, scale, 1);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, (1 - cycle) * 0.85);
      }
    }

    // Second offset pulse wave
    if (pulseRing2Ref.current) {
      const cycle = ((elapsed + 0.9) % 1.8) / 1.8;
      const scale = 0.5 + cycle * 2.2;
      pulseRing2Ref.current.scale.set(scale, scale, 1);
      const mat = pulseRing2Ref.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, (1 - cycle) * 0.85);
      }
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      {/* 1. Center Solid Targeting Bead */}
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.015, 32]} />
        <meshBasicMaterial color="#f59e0b" depthTest={false} transparent />
      </mesh>

      {/* 2. Primary Targeting Ring */}
      <mesh position={[0, 0, 0.004]}>
        <ringGeometry args={[0.032, 0.038, 32]} />
        <meshBasicMaterial color="#f59e0b" depthTest={false} transparent opacity={0.95} />
      </mesh>

      {/* 3. Outer Reticle Brackets */}
      <mesh position={[0, 0, 0.003]}>
        <ringGeometry args={[0.065, 0.070, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color="#fbbf24" depthTest={false} transparent opacity={0.7} />
      </mesh>

      {/* 4. Animated Expanding Radar Wave 1 */}
      <mesh ref={pulseRingRef} position={[0, 0, 0.002]}>
        <ringGeometry args={[0.04, 0.046, 32]} />
        <meshBasicMaterial color="#f59e0b" depthTest={false} transparent opacity={0.8} />
      </mesh>

      {/* 5. Animated Expanding Radar Wave 2 (Offset) */}
      <mesh ref={pulseRing2Ref} position={[0, 0, 0.001]}>
        <ringGeometry args={[0.04, 0.046, 32]} />
        <meshBasicMaterial color="#fbbf24" depthTest={false} transparent opacity={0.8} />
      </mesh>

      {/* 6. Perpendicular Elevation Pin / Stem */}
      <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0015, 0.0015, 0.08, 8]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.75} depthTest={false} />
      </mesh>

      {/* 7. Floating Pinhead on top of Stem */}
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshBasicMaterial color="#fbbf24" depthTest={false} />
      </mesh>
    </group>
  );
}
