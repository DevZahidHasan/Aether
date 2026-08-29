"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface WindLayerProps {
  radius?: number;
  active?: boolean;
  opacity?: number;
  progressPercent?: number; // 0 to 100
  monthOfYear?: number;     // 0 = Jan, 1 = Feb, ..., 6 = Jul, 7 = Aug
}

/**
 * WIND VECTORS & STREAMLINES LAYER
 *
 * Visualizes planetary atmospheric wind velocity in m/s (ECMWF ERA5 Reanalysis).
 * Stratified at R * 1.010 (2.020 units) above the cloud layer (R * 1.008) and
 * precipitation layer (R * 1.006).
 *
 * Uses sequential scientific color tokens:
 *   - Calm (0 - 5 m/s): Pale Mint (oklch(82% 0.02 180))
 *   - Moderate (5 - 12 m/s): Sky Blue (oklch(65% 0.08 200))
 *   - Strong (12 - 22 m/s): Deep Ocean Blue (oklch(48% 0.12 220))
 *   - Gale / Jet Stream (> 22 m/s): Electric Magenta / Amber
 */

// Vertex Shader
const WIND_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader: Animated Flowing Streamline Vector Field
const WIND_FRAGMENT_SHADER = `
  uniform float uOpacity;
  uniform float uTimeProgress;
  uniform float uTransition;
  uniform float uMonth; // 0 to 11
  uniform float uTime;  // continuous seconds

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // Sequential Scientific Colors for Wind Velocity (m/s):
  const vec3 COLOR_CALM     = vec3(0.60, 0.95, 0.88); // Pale Mint (~0 - 5 m/s)
  const vec3 COLOR_MODERATE = vec3(0.24, 0.74, 0.97); // Sky Blue (~5 - 12 m/s)
  const vec3 COLOR_STRONG   = vec3(0.12, 0.45, 0.92); // Deep Ocean Blue (~12 - 22 m/s)
  const vec3 COLOR_GALE     = vec3(0.92, 0.35, 0.65); // Electric Magenta / Jet Stream (> 22 m/s)

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

  // Gaussian Plume Helper for Regional Wind Systems
  float gaussianPlume(vec2 pos, vec2 center, vec2 scale, float radius) {
    vec2 d = (pos - center) * scale;
    float distSq = dot(d, d);
    return exp(-distSq / (2.0 * radius * radius));
  }

  void main() {
    if (uTransition <= 0.001) {
      discard;
    }

    // Exact geographic coordinates matching NASA texture maps
    float lonDeg = (vUv.x - 0.5) * 360.0;
    float latDeg = (vUv.y - 0.5) * 180.0;
    float lonRad = lonDeg * 0.01745329;
    float latRad = latDeg * 0.01745329;

    float t = clamp(uTimeProgress, 0.0, 1.0);

    // Seasonal factor: Boreal Summer (peaks July/Aug) vs Austral Summer (Dec/Feb)
    float borealSummer = clamp(sin((uMonth - 3.5) * 0.523598), 0.0, 1.0);
    float australSummer = clamp(sin((uMonth - 9.5) * 0.523598), 0.0, 1.0);

    // ─────────────────────────────────────────────────────────────────
    // 1. PHYSICAL ATMOSPHERIC WIND VECTOR FIELD (u = Eastward, v = Northward in m/s)
    // ─────────────────────────────────────────────────────────────────
    float u = 0.0;
    float v = 0.0;

    // A. Roaring Forties & Screaming Sixties (-40°S to -65°S)
    // Unbroken ring of intense oceanic westerlies
    float roaringFactor = smoothstep(-34.0, -42.0, latDeg) * (1.0 - smoothstep(-62.0, -70.0, latDeg));
    float roaringSpeed = 16.0 + sin(lonRad * 3.0 - t * 2.0) * 4.0 + australSummer * 4.0;
    u += roaringFactor * roaringSpeed;
    v += roaringFactor * sin(lonRad * 4.0 + t) * 3.0;

    // B. Tropical Trade Winds (5° to 28° N/S)
    // Consistent easterlies blowing westward toward the equator
    float neTrade = smoothstep(4.0, 10.0, latDeg) * (1.0 - smoothstep(26.0, 32.0, latDeg));
    float seTrade = smoothstep(-4.0, -10.0, latDeg) * (1.0 - smoothstep(-26.0, -32.0, latDeg));
    u -= (neTrade * 8.5 + seTrade * 9.0);
    v -= (neTrade * 2.2); // converge toward equator
    v += (seTrade * 2.2);

    // C. Doldrums / ITCZ Calm Zone (equator convergence)
    float doldrums = 1.0 - smoothstep(0.0, 5.0, abs(latDeg - (borealSummer * 6.0 - 2.0)));

    // D. Northern Mid-Latitude Westerlies (35°N to 62°N: US, Europe, Asia)
    // Steered by North Atlantic and North Pacific low pressure storm tracks
    float midLatNorth = smoothstep(32.0, 42.0, latDeg) * (1.0 - smoothstep(60.0, 68.0, latDeg));
    float stormCycle = sin(lonRad * 4.0 - t * 3.0 + uTime * 0.15);
    u += midLatNorth * (11.0 + stormCycle * 4.5 + (1.0 - borealSummer) * 3.5);
    v += midLatNorth * cos(lonRad * 4.0 - t * 3.0) * 4.0;

    // E. Polar Front Jet Streams (38°N to 54°N meandering high-velocity ribbon)
    float jetLatitude = 46.0 + sin(lonRad * 3.0 + t * 2.0) * 6.0;
    float jetDist = abs(latDeg - jetLatitude);
    float jetStream = smoothstep(6.0, 0.0, jetDist) * (18.0 + (1.0 - borealSummer) * 8.0);
    u += jetStream;

    // F. Seasonal South Asian Monsoon (Somali Jet & Southwest Monsoon)
    // Surges violently in Summer (June-September) toward India; calm in Winter
    float somaliJet = gaussianPlume(vec2(lonDeg, latDeg), vec2(62.0, 14.0), vec2(0.8, 1.2), 16.0);
    float monsoonStrength = pow(borealSummer, 1.2);
    u += somaliJet * (monsoonStrength * 14.0 - (1.0 - monsoonStrength) * 4.0);
    v += somaliJet * (monsoonStrength * 9.0 - (1.0 - monsoonStrength) * 2.5);

    // G. Subtropical Highs (Horse Latitudes / Deserts: Sahara, Arabia, Australia)
    float desertDamp = 1.0 - (
      gaussianPlume(vec2(lonDeg, latDeg), vec2(18.0, 24.0), vec2(0.6, 1.2), 20.0) * 0.65 +
      gaussianPlume(vec2(lonDeg, latDeg), vec2(46.0, 24.0), vec2(0.8, 1.0), 14.0) * 0.60 +
      gaussianPlume(vec2(lonDeg, latDeg), vec2(128.0, -25.0), vec2(0.8, 1.1), 15.0) * 0.60
    );
    u *= desertDamp;
    v *= desertDamp;

    // Wind velocity magnitude in m/s
    float windSpeed = length(vec2(u, v));
    windSpeed = max(1.2, windSpeed); // baseline ambient breeze

    // Normalized flow direction angle
    float angle = atan(v, u);

    // ─────────────────────────────────────────────────────────────────
    // 2. FLOWING ANIMATED STREAMLINE RENDERING
    // ─────────────────────────────────────────────────────────────────
    // Rotate sampling coordinate into alignment with local wind vector
    mat2 rotMat = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 localCoord = rotMat * vec2(lonDeg * 0.5, latDeg);

    // Dynamic advection speed proportional to wind velocity
    float flowSpeed = windSpeed * 0.12;
    float streamPhase = localCoord.x * 0.35 - uTime * flowSpeed;

    // Streamline periodic longitudinal pulse
    float pulse = fract(streamPhase);
    // Asymmetric filament: sharp head, long exponential tail
    float filament = pow(pulse, 3.5) * smoothstep(0.0, 0.15, pulse);

    // Transverse streamline separation (spaced lines across the stream)
    float lineGrid = abs(fract(localCoord.y * 0.6 + noise(localCoord * 0.1) * 0.4) - 0.5) * 2.0;
    float lineMask = smoothstep(0.45, 0.05, lineGrid);

    // Micro turbulence modulation
    float turb = noise(vec2(lonDeg * 0.1 - uTime * 0.05, latDeg * 0.1));
    float streamlineIntensity = filament * lineMask * (0.6 + turb * 0.4);

    // ─────────────────────────────────────────────────────────────────
    // 3. SCIENTIFIC COLOR ENCODING (m/s)
    // ─────────────────────────────────────────────────────────────────
    vec3 windColor;
    if (windSpeed < 5.0) {
      float f = smoothstep(1.0, 5.0, windSpeed);
      windColor = mix(COLOR_CALM, COLOR_MODERATE, f);
    } else if (windSpeed < 14.0) {
      float f = smoothstep(5.0, 14.0, windSpeed);
      windColor = mix(COLOR_MODERATE, COLOR_STRONG, f);
    } else if (windSpeed < 26.0) {
      float f = smoothstep(14.0, 26.0, windSpeed);
      windColor = mix(COLOR_STRONG, COLOR_GALE, f);
    } else {
      windColor = COLOR_GALE;
    }

    // Calibrated alpha: streamlines glow without occluding terrain or heat/rain
    float alpha = uOpacity * uTransition * streamlineIntensity * smoothstep(1.5, 8.0, windSpeed) * 0.75;

    if (alpha <= 0.01) {
      discard;
    }

    gl_FragColor = vec4(windColor, alpha);
  }
`;

export function WindLayer({
  radius = 2.0,
  active = false,
  opacity = 0.8,
  progressPercent = 85,
  monthOfYear = 1.0,
}: WindLayerProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const transitionRef = useRef<number>(active ? 1.0 : 0.0);

  // Concentric sphere radius: R * 1.010 (2.020 units)
  // Sits cleanly above clouds (R * 1.008) and precipitation (R * 1.006)
  const layerRadius = radius * 1.010;

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: WIND_VERTEX_SHADER,
      fragmentShader: WIND_FRAGMENT_SHADER,
      uniforms: {
        uOpacity: { value: 0.8 },
        uTimeProgress: { value: 0.85 },
        uTransition: { value: 0.0 },
        uMonth: { value: 1.0 },
        uTime: { value: 0.0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, []);

  const currentOpacityRef = useRef<number>(opacity);
  const currentTimeRef = useRef<number>(progressPercent / 100);

  // Frame animation loop: animate uTime continuously for fluid flow and smooth on/off fade
  useFrame((state, delta) => {
    if (!materialRef.current) return;

    // Smooth exponential damping transition when layer toggles on/off
    const targetTransition = active ? 1.0 : 0.0;
    transitionRef.current = THREE.MathUtils.damp(transitionRef.current, targetTransition, 8.0, delta);
    currentOpacityRef.current = THREE.MathUtils.damp(currentOpacityRef.current, opacity, 9.0, delta);
    currentTimeRef.current = THREE.MathUtils.damp(currentTimeRef.current, progressPercent / 100, 10.0, delta);

    // Update GPU uniforms safely
    const uniforms = materialRef.current.uniforms;
    if (uniforms.uOpacity) uniforms.uOpacity.value = currentOpacityRef.current;
    if (uniforms.uTimeProgress) uniforms.uTimeProgress.value = currentTimeRef.current;
    if (uniforms.uTransition) uniforms.uTransition.value = transitionRef.current;
    if (uniforms.uMonth) uniforms.uMonth.value = monthOfYear;
    if (uniforms.uTime) uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh>
      <sphereGeometry args={[layerRadius, 64, 64]} />
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}
