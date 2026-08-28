"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface TemperatureLayerProps {
  radius?: number;
  active?: boolean;
  opacity?: number; // 0.0 to 1.0
  progressPercent?: number; // 0 to 100
}

export function TemperatureLayer({
  radius = 2,
  active = true,
  opacity = 0.75,
  progressPercent = 85,
}: TemperatureLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentTransitionRef = useRef<number>(active ? 1.0 : 0.0);

  // Custom GLSL Diverging Temperature Anomaly Shader
  const material = useMemo(() => {
    const vertexShader = `
      varying vec3 vPosition;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vPosition = normalize(position);
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec3 vPosition;
      varying vec2 vUv;
      varying vec3 vNormal;

      uniform float uOpacity;
      uniform float uTimeProgress; // 0.0 to 1.0
      uniform float uTransition;   // 0.0 to 1.0 (smooth activation fade)

      // Diverging color scale based on AETHER tokens (OKLCH mapping)
      // Negative anomaly: Cold Blue & Cyan
      const vec3 COLOR_NEG_DEEP = vec3(0.12, 0.32, 0.78);  // -2.5°C
      const vec3 COLOR_NEG_MILD = vec3(0.24, 0.65, 0.88);  // -1.0°C
      // Neutral baseline
      const vec3 COLOR_ZERO     = vec3(0.85, 0.88, 0.90);  //  0.0°C
      // Positive anomaly: Amber & Deep Red
      const vec3 COLOR_POS_MILD = vec3(0.92, 0.55, 0.15);  // +1.0°C
      const vec3 COLOR_POS_DEEP = vec3(0.85, 0.14, 0.14);  // +2.0°C
      const vec3 COLOR_POS_EXT  = vec3(0.60, 0.05, 0.12);  // +3.5°C+

      // Pseudo-noise helper for natural atmospheric field continuity
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      void main() {
        if (uTransition <= 0.001) {
          discard;
        }

        // Exact geographic coordinates matching NASA texture maps
        float lonDeg = (vUv.x - 0.5) * 360.0;
        float latDeg = (vUv.y - 0.5) * 180.0;
        float lon = lonDeg * 0.01745329;
        float lat = latDeg * 0.01745329;

        // Temporal progression factor (1990 = 0.0, 2026 = 1.0)
        float t = clamp(uTimeProgress, 0.0, 1.0);

        // 1. Global Mean Continental Differential (land warms faster than oceans)
        float globalTrend = mix(0.15, 0.85, pow(t, 1.15));

        // 2. Atmospheric Rossby Planetary Waves (wavy jet stream meanders around 45°N to 75°N)
        float wave4 = sin(lon * 4.0 + t * 3.1415) * 0.85;
        float wave6 = cos(lon * 6.0 - t * 2.0) * 0.45;
        float jetStreamWaves = (wave4 + wave6) * smoothstep(30.0, 58.0, latDeg) * (1.0 - smoothstep(76.0, 88.0, latDeg));

        // 3. Arctic Amplification (concentrated in marine sectors, with Rossby wave lobes)
        float arcticFactor = smoothstep(52.0, 75.0, latDeg) * (1.0 - smoothstep(84.0, 90.0, latDeg) * 0.35);
        float arcticAnomaly = arcticFactor * (mix(0.6, 2.4, t) + jetStreamWaves * 0.75);

        // 4. Eurasian / Mediterranean Heat Wave Plume
        float eurasiaLat = exp(-pow((latDeg - 48.0) / 14.0, 2.0));
        float eurasiaLon = exp(-pow((lonDeg - 38.0) / 30.0, 2.0));
        float eurasiaHeat = eurasiaLat * eurasiaLon * mix(0.4, 2.3, t);

        // 5. North American Heat Dome
        float naLat = exp(-pow((latDeg - 45.0) / 15.0, 2.0));
        float naLon = exp(-pow((lonDeg + 98.0) / 28.0, 2.0));
        float naHeat = naLat * naLon * mix(0.3, 2.0, t);

        // 6. Equatorial Pacific El Niño / La Niña Oscillation
        float ensoLat = exp(-pow(latDeg / 9.0, 2.0));
        float ensoLon = exp(-pow((lonDeg + 130.0) / 40.0, 2.0));
        float ensoWave = sin(t * 18.8495 + 1.2) * 1.5; // ~3 cycles over 36 years
        float ensoAnomaly = ensoLat * ensoLon * ensoWave;

        // 7. Subpolar Atlantic Cold Hole & Southern Ocean Cold Anomaly
        float coldLat = exp(-pow((latDeg - 54.0) / 9.0, 2.0));
        float coldLon = exp(-pow((lonDeg + 32.0) / 18.0, 2.0));
        float southCold = smoothstep(-45.0, -68.0, latDeg) * 0.8;
        float coldAnomaly = (coldLat * coldLon * 1.3 + southCold) * -1.0;

        // 8. Natural atmospheric turbulent noise
        vec2 noiseCoord = vec2(lonDeg * 0.05, latDeg * 0.05);
        float microNoise = (noise(noiseCoord) - 0.5) * 0.75;

        // Total Temperature Anomaly in degrees Celsius (ΔT)
        float deltaT = globalTrend + arcticAnomaly + eurasiaHeat + naHeat + ensoAnomaly + coldAnomaly + microNoise;

        // Map ΔT through Diverging Color Scale:
        vec3 anomalyColor;
        if (deltaT < -1.0) {
          float f = smoothstep(-2.5, -1.0, deltaT);
          anomalyColor = mix(COLOR_NEG_DEEP, COLOR_NEG_MILD, f);
        } else if (deltaT < 0.0) {
          float f = smoothstep(-1.0, 0.0, deltaT);
          anomalyColor = mix(COLOR_NEG_MILD, COLOR_ZERO, f);
        } else if (deltaT < 1.0) {
          float f = smoothstep(0.0, 1.0, deltaT);
          anomalyColor = mix(COLOR_ZERO, COLOR_POS_MILD, f);
        } else if (deltaT < 2.0) {
          float f = smoothstep(1.0, 2.0, deltaT);
          anomalyColor = mix(COLOR_POS_MILD, COLOR_POS_DEEP, f);
        } else {
          float f = smoothstep(2.0, 3.5, deltaT);
          anomalyColor = mix(COLOR_POS_DEEP, COLOR_POS_EXT, f);
        }

        // Calibrated Alpha:
        // Near-baseline deviations under 0.35°C are transparent to let NASA terrain show through.
        // Pronounced anomalies reach a calibrated max opacity (0.60) so ice, terrain, and coastlines remain visible.
        float anomalyMagnitude = abs(deltaT);
        float anomalyAlphaCurve = smoothstep(0.35, 2.6, anomalyMagnitude);
        float alpha = uOpacity * uTransition * mix(0.04, 0.60, anomalyAlphaCurve);

        gl_FragColor = vec4(anomalyColor, alpha);
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uOpacity: { value: 0.75 },
        uTimeProgress: { value: 0.85 },
        uTransition: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, []);

  // Update uniforms and handle "layer breathing" smooth transitions
  useFrame((_, delta) => {
    const targetTransition = active ? 1.0 : 0.0;
    // Smooth exponential approach: ~250ms transition
    currentTransitionRef.current = THREE.MathUtils.damp(
      currentTransitionRef.current,
      targetTransition,
      8.0,
      delta
    );

    if (material.uniforms.uTransition) {
      material.uniforms.uTransition.value = currentTransitionRef.current;
    }
    if (material.uniforms.uOpacity) {
      material.uniforms.uOpacity.value = opacity;
    }
    if (material.uniforms.uTimeProgress) {
      material.uniforms.uTimeProgress.value = progressPercent / 100;
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      {/* Concentric sphere registered at R * 1.004 */}
      <sphereGeometry args={[radius * 1.004, 64, 64]} />
    </mesh>
  );
}
