"use client";

import React, { useEffect, useState } from "react";
import * as THREE from "three";

export interface CountryBordersLayerProps {
  radius?: number;
  color?: string;
  opacity?: number;
}

interface GeoJsonFeature {
  type: string;
  properties: { name: string };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

/**
 * 3D COUNTRY BORDERS & GEOGRAPHIC BOUNDARIES LAYER
 *
 * Renders crisp, hairline international country borders directly on the 3D globe.
 * Powered by public-domain Natural Earth vector geography.
 * Mounted at R x 1.0025 so boundaries sit perfectly above terrain and night lights.
 */
let cachedBorderGeometry: THREE.BufferGeometry | null = null;

export function CountryBordersLayer({
  radius = 2,
  color = "#ffffff",
  opacity = 0.32,
}: CountryBordersLayerProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(cachedBorderGeometry);
  const borderRadius = radius * 1.0025;

  useEffect(() => {
    if (cachedBorderGeometry) {
      setGeometry(cachedBorderGeometry);
      return;
    }

    let isMounted = true;

    fetch("/data/world-countries.json")
      .then((res) => res.json())
      .then((data: GeoJsonData) => {
        if (!isMounted) return;

        const linePoints: number[] = [];

        const addPolygonLines = (ring: number[][]) => {
          for (let i = 0; i < ring.length - 1; i++) {
            const p1 = ring[i];
            const p2 = ring[i + 1];
            if (!p1 || !p2) continue;

            const lon1 = p1[0] ?? 0;
            const lat1 = p1[1] ?? 0;
            const lon2 = p2[0] ?? 0;
            const lat2 = p2[1] ?? 0;

            // Skip antimeridian wrapping jumps
            if (Math.abs(lon1 - lon2) > 180) continue;

            const latRad1 = (lat1 * Math.PI) / 180;
            const lonRad1 = (lon1 * Math.PI) / 180;
            const cosLat1 = borderRadius * Math.cos(latRad1);
            const x1 = cosLat1 * Math.cos(lonRad1);
            const y1 = borderRadius * Math.sin(latRad1);
            const z1 = -cosLat1 * Math.sin(lonRad1);

            const latRad2 = (lat2 * Math.PI) / 180;
            const lonRad2 = (lon2 * Math.PI) / 180;
            const cosLat2 = borderRadius * Math.cos(latRad2);
            const x2 = cosLat2 * Math.cos(lonRad2);
            const y2 = borderRadius * Math.sin(latRad2);
            const z2 = -cosLat2 * Math.sin(lonRad2);

            linePoints.push(x1, y1, z1, x2, y2, z2);
          }
        };

        for (const feature of data.features) {
          const geom = feature.geometry;
          if (geom.type === "Polygon") {
            const rings = geom.coordinates as number[][][];
            for (const ring of rings) {
              addPolygonLines(ring);
            }
          } else if (geom.type === "MultiPolygon") {
            const multiRings = geom.coordinates as number[][][][];
            for (const poly of multiRings) {
              for (const ring of poly) {
                addPolygonLines(ring);
              }
            }
          }
        }

        const bg = new THREE.BufferGeometry();
        bg.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(linePoints, 3)
        );
        cachedBorderGeometry = bg;
        setGeometry(bg);
      })
      .catch((err) => {
        console.warn("Failed to load country borders GeoJSON:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [borderRadius]);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent={true}
        opacity={opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}
