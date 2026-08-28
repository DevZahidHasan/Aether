"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

export interface AtmosphereGlowProps {
  radius?: number;
  color?: string; // hex or rgb
}

export function AtmosphereGlow({
  radius = 2,
  color = "#4ba3ff",
}: AtmosphereGlowProps) {
  const atmosphereMaterial = useMemo(() => {
    const vertexShader = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      varying vec3 vNormal;
      void main() {
        // Fresnel factor: high at the grazing edges, zero at center
        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
        gl_FragColor = vec4(color, intensity * 0.75);
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        color: { value: new THREE.Color(color) },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, [color]);

  return (
    <mesh material={atmosphereMaterial}>
      <sphereGeometry args={[radius * 1.12, 64, 64]} />
    </mesh>
  );
}
