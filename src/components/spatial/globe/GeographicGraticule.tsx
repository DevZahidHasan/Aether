"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

export interface GeographicGraticuleProps {
  radius?: number;
}

export function GeographicGraticule({ radius = 2 }: GeographicGraticuleProps) {
  const graticuleRadius = radius * 1.007;

  // Standard graticule lines
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 72;

    // 1. Latitude parallels (every 30 degrees, excluding poles)
    const latitudes = [-60, -30, 0, 30, 60];
    for (const latDeg of latitudes) {
      const phi = THREE.MathUtils.degToRad(90 - latDeg);
      const rAtLat = graticuleRadius * Math.sin(phi);
      const yAtLat = graticuleRadius * Math.cos(phi);

      for (let i = 0; i < segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;

        points.push(
          new THREE.Vector3(rAtLat * Math.sin(theta1), yAtLat, rAtLat * Math.cos(theta1)),
          new THREE.Vector3(rAtLat * Math.sin(theta2), yAtLat, rAtLat * Math.cos(theta2))
        );
      }
    }

    // 2. Longitude meridians (every 30 degrees)
    for (let lonDeg = 0; lonDeg < 360; lonDeg += 30) {
      const theta = THREE.MathUtils.degToRad(lonDeg);
      for (let i = 0; i < segments; i++) {
        const phi1 = (i / segments) * Math.PI;
        const phi2 = ((i + 1) / segments) * Math.PI;

        points.push(
          new THREE.Vector3(
            graticuleRadius * Math.sin(phi1) * Math.sin(theta),
            graticuleRadius * Math.cos(phi1),
            graticuleRadius * Math.sin(phi1) * Math.cos(theta)
          ),
          new THREE.Vector3(
            graticuleRadius * Math.sin(phi2) * Math.sin(theta),
            graticuleRadius * Math.cos(phi2),
            graticuleRadius * Math.sin(phi2) * Math.cos(theta)
          )
        );
      }
    }

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [graticuleRadius]);

  // Equator highlight geometry
  const equatorGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i < segments; i++) {
      const theta1 = (i / segments) * Math.PI * 2;
      const theta2 = ((i + 1) / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(graticuleRadius * Math.sin(theta1), 0, graticuleRadius * Math.cos(theta1)),
        new THREE.Vector3(graticuleRadius * Math.sin(theta2), 0, graticuleRadius * Math.cos(theta2))
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [graticuleRadius]);

  return (
    <group>
      {/* Standard Graticule Grid */}
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#e8e6e3" transparent opacity={0.06} />
      </lineSegments>

      {/* Equator Line Highlight */}
      <lineSegments geometry={equatorGeometry}>
        <lineBasicMaterial color="#e8e6e3" transparent opacity={0.16} />
      </lineSegments>
    </group>
  );
}
