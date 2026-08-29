"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface PrecipitationLayerProps {
  radius?: number;
  active?: boolean;
  opacity?: number;
  progressPercent?: number; // 0 to 100
  monthOfYear?: number;     // 0 = Jan, 1 = Feb, ..., 6 = Jul, 7 = Aug
}

/**
 * PRECIPITATION & ATMOSPHERIC MOISTURE LAYER
 *
 * Visualizes planetary precipitation rate in mm/day (GPCP / TRMM specification).
 * Uses a sequential scientific color scale:
 *   - Arid / Dry (< 1.0 mm/day): Fully transparent
 *   - Light Rain (1.0 - 3.0 mm/day): Pale Cyan (oklch(92% 0.01 260))
 *   - Moderate Rain (3.0 - 6.0 mm/day): Sky Blue (oklch(70% 0.08 240))
 *   - Heavy Rain (6.0 - 12.0 mm/day): Deep Ocean Blue (oklch(52% 0.12 250))
 *   - Torrential / Tropical Convection (> 12.0 mm/day): Saturated Indigo (oklch(38% 0.16 260))
 *
 * Stratified at R * 1.006 (2.012 units) above the temperature layer (R * 1.004)
 * and below the cloud layer (R * 1.008).
 */

// Vertex Shader: Pass through spherical normal and position
const PRECIP_VERTEX_SHADER = `
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

// Fragment Shader: Simulates atmospheric moisture corridors and the ITCZ
const PRECIP_FRAGMENT_SHADER = `
  uniform float uOpacity;
  uniform float uTimeProgress;
  uniform float uTransition;
  uniform float uMonth; // 0.0 = Jan, 1.0 = Feb, ..., 6.0 = Jul, 7.0 = Aug, 11.0 = Dec

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // Sequential Scientific Colors for Precipitation:
  const vec3 COLOR_LIGHT = vec3(0.70, 0.88, 0.98);      // Pale Mist Cyan (~1 - 3 mm/day)
  const vec3 COLOR_MODERATE = vec3(0.25, 0.72, 0.96);   // Sky Blue (~3 - 6 mm/day)
  const vec3 COLOR_HEAVY = vec3(0.08, 0.45, 0.92);      // Vibrant Ocean Blue (~6 - 12 mm/day)
  const vec3 COLOR_TORRENTIAL = vec3(0.18, 0.40, 0.98); // Luminous Deep Royal Blue (> 12 mm/day)

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

  // Organic Gaussian Plume (Euclidean distance decay, mathematically impossible to produce square edges)
  float gaussianPlume(vec2 pos, vec2 center, vec2 scale, float radius) {
    vec2 d = (pos - center) * scale;
    float distSq = dot(d, d);
    return exp(-distSq / (2.0 * radius * radius));
  }

  // Smooth Desert Evaporation Well (smooth inverse gradient with zero sharp edges)
  float desertWell(vec2 pos, vec2 center, vec2 scale, float radius) {
    vec2 d = (pos - center) * scale;
    float dist = length(d);
    return smoothstep(radius * 0.35, radius, dist);
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

    // Atmospheric wind shear domain warping (tears and stretches clouds organically)
    vec2 warp = vec2(
      noise(vec2(lonDeg * 0.05 + t * 0.2, latDeg * 0.05)),
      noise(vec2(lonDeg * 0.05 + 5.3, latDeg * 0.05 - t * 0.2))
    ) * 10.0 - 5.0;
    vec2 wPos = vec2(lonDeg + warp.x, latDeg + warp.y);

    // Multi-scale procedural atmospheric turbulence
    vec2 p1 = vec2(wPos.x * 0.06, wPos.y * 0.06);
    vec2 p2 = vec2(wPos.x * 0.14 - t * 0.3, wPos.y * 0.14);
    float n1 = noise(p1);
    float n2 = noise(p2);
    float cloudNoise = (n1 * 0.65 + n2 * 0.35); // 0.0 to 1.0

    // Calendar-accurate seasonal factors:
    // Boreal Summer (June-August, peaks at month 6.5)
    float borealSummer = clamp(sin((uMonth - 3.5) * 0.523598), 0.0, 1.0);
    // Austral Summer (December-February, peaks at month 0.5/12.5)
    float australSummer = clamp(sin((uMonth - 9.5) * 0.523598), 0.0, 1.0);

    // 1. Global Intertropical Convergence Zone (ITCZ)
    // Continuous planetary sinusoidal wave wrapping around the globe
    float seasonalShift = mix(-3.5, 7.0, borealSummer);
    float itczLatTarget = 2.0 + seasonalShift + sin(lon * 3.5 + t * 1.5) * 2.5 + cos(lon * 7.0 - t) * 1.2;
    float itczDist = abs(wPos.y - itczLatTarget);
    float itczRain = smoothstep(5.5, 0.0, itczDist) * pow(cloudNoise, 1.2) * 14.0;

    // 2. Tropical Rainforest Plumes (smooth Gaussian plumes — zero square corners)
    // Amazon Basin
    float amazonRain = gaussianPlume(wPos, vec2(-60.0, -4.0), vec2(0.8, 1.0), 20.0) * (11.0 + australSummer * 5.5) * (cloudNoise * 0.6 + 0.6);

    // Congo Basin
    float congoRain = gaussianPlume(wPos, vec2(22.0, 0.0), vec2(0.9, 1.0), 16.0) * 12.0 * (cloudNoise * 0.6 + 0.6);

    // Southeast Asia & Maritime Continent (Indonesia, Malaysia, Philippines, Thailand)
    float seAsiaRain = gaussianPlume(wPos, vec2(114.0, 5.0), vec2(0.8, 1.2), 22.0) * (11.0 + borealSummer * 5.0) * (cloudNoise * 0.6 + 0.6);

    // 3. Monsoonal Systems
    // South Asian Monsoon (India, Bangladesh, Sri Lanka, Nepal)
    float indiaRain = gaussianPlume(wPos, vec2(80.0, 18.0), vec2(0.9, 1.1), 15.0) * (pow(borealSummer, 1.2) * 16.0 + 0.8) * (cloudNoise * 0.6 + 0.6);

    // East Asian Monsoon (Eastern China, Japan, Korea, Taiwan)
    float eastAsiaRain = gaussianPlume(wPos, vec2(122.0, 31.0), vec2(0.8, 1.1), 17.0) * (4.5 + borealSummer * 7.5) * (cloudNoise * 0.6 + 0.6);

    // 4. North America
    // Pacific Northwest & Western Canada (rainforests of Washington, BC, Alaska)
    float pnwRain = gaussianPlume(wPos, vec2(-130.0, 52.0), vec2(0.7, 1.4), 14.0) * (8.5 + (1.0 - borealSummer) * 4.0) * (cloudNoise * 0.6 + 0.6);

    // Eastern USA & Atlantic Canada (Gulf Coast, Florida, Carolinas, Ontario, Quebec)
    float eastUSRain = gaussianPlume(wPos, vec2(-82.0, 36.0), vec2(0.9, 1.0), 16.0) * (4.5 + borealSummer * 2.5) * (cloudNoise * 0.6 + 0.6);

    // Central America & Caribbean
    float centAmRain = gaussianPlume(wPos, vec2(-82.0, 14.0), vec2(0.9, 1.2), 14.0) * (7.0 + borealSummer * 6.0) * (cloudNoise * 0.6 + 0.6);

    // 5. Europe & Mediterranean
    // Atlantic Western & Central Europe (UK, Ireland, France, Germany, Scandinavia)
    float europeRain = gaussianPlume(wPos, vec2(8.0, 52.0), vec2(0.8, 1.2), 15.0) * (4.5 + (1.0 - borealSummer * 0.3) * 3.0) * (cloudNoise * 0.6 + 0.6);

    // Mediterranean
    float medRain = gaussianPlume(wPos, vec2(15.0, 38.0), vec2(0.6, 1.3), 12.0) * ((1.0 - borealSummer) * 3.5 + 0.3) * (cloudNoise * 0.6 + 0.6);

    // 6. Australia & Oceania
    // Tropical Northern Australia (Darwin, Cape York)
    float ausNorthRain = gaussianPlume(wPos, vec2(134.0, -15.0), vec2(0.8, 1.3), 13.0) * (australSummer * 11.0 + 0.4) * (cloudNoise * 0.6 + 0.6);

    // Eastern Australia & New Zealand (Sydney, Brisbane, New Zealand)
    float ausEastRain = gaussianPlume(wPos, vec2(152.0, -32.0), vec2(0.9, 1.0), 15.0) * 5.5 * (cloudNoise * 0.6 + 0.6);

    // 7. Mid-Latitude Oceanic Storm Fronts (North Atlantic, North Pacific, Southern Ocean)
    float stormNorth = smoothstep(38.0, 48.0, wPos.y) * (1.0 - smoothstep(60.0, 68.0, wPos.y)) * pow(cloudNoise, 1.4) * 8.0;
    float stormSouth = smoothstep(-36.0, -44.0, wPos.y) * (1.0 - smoothstep(-60.0, -68.0, wPos.y)) * pow(cloudNoise, 1.3) * 9.5;

    // 8. Organic Desert Suppression Wells (smooth circular/elliptical fade — NO rectangular boxes)
    float saharaWell = desertWell(wPos, vec2(14.0, 24.0), vec2(0.6, 1.2), 24.0);
    float arabiaWell = desertWell(wPos, vec2(46.0, 24.0), vec2(0.8, 1.0), 15.0);
    float iranWell = desertWell(wPos, vec2(60.0, 33.0), vec2(0.9, 1.2), 13.0);
    float gobiWell = desertWell(wPos, vec2(92.0, 42.0), vec2(0.6, 1.3), 16.0);
    float ausOutbackWell = desertWell(wPos, vec2(128.0, -25.0), vec2(0.8, 1.1), 16.0);
    float atacamaWell = desertWell(wPos, vec2(-70.0, -22.0), vec2(1.5, 0.7), 12.0);
    float namibWell = desertWell(wPos, vec2(18.0, -24.0), vec2(1.1, 0.9), 12.0);
    float usSouthwestWell = desertWell(wPos, vec2(-112.0, 32.0), vec2(0.9, 1.0), 12.0);

    float desertFactor = min(min(min(saharaWell, arabiaWell), min(iranWell, gobiWell)), min(min(ausOutbackWell, atacamaWell), min(namibWell, usSouthwestWell)));

    // Polar deserts (smooth polar dryness)
    float polarSuppression = (1.0 - smoothstep(72.0, 88.0, abs(wPos.y)) * 0.85);

    float totalPrecip = (itczRain + amazonRain + congoRain + seAsiaRain + indiaRain + eastAsiaRain + pnwRain + eastUSRain + centAmRain + europeRain + medRain + ausNorthRain + ausEastRain + stormNorth + stormSouth) * desertFactor * polarSuppression;
    float precipRate = max(0.0, totalPrecip);

    // Sequential Scientific Color Mapping:
    vec3 precipColor;
    if (precipRate < 3.0) {
      float f = smoothstep(0.8, 3.0, precipRate);
      precipColor = mix(COLOR_LIGHT, COLOR_MODERATE, f);
    } else if (precipRate < 6.0) {
      float f = smoothstep(3.0, 6.0, precipRate);
      precipColor = mix(COLOR_MODERATE, COLOR_HEAVY, f);
    } else {
      float f = smoothstep(6.0, 14.0, precipRate);
      precipColor = mix(COLOR_HEAVY, COLOR_TORRENTIAL, f);
    }

    // Alpha Curve:
    // Dry areas (< 1.0 mm/day) are fully transparent.
    // Convective storm clusters glow softly (alpha 0.20 to 0.60) without blocking satellite textures.
    float moistureAlpha = smoothstep(1.0, 12.0, precipRate);
    float alpha = uOpacity * uTransition * mix(0.0, 0.60, moistureAlpha);

    if (alpha <= 0.005) {
      discard;
    }

    gl_FragColor = vec4(precipColor, alpha);
  }
`;

export function PrecipitationLayer({
  radius = 2.0,
  active = true,
  opacity = 0.65,
  progressPercent = 85,
  monthOfYear = 1.0,
}: PrecipitationLayerProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const transitionRef = useRef<number>(active ? 1.0 : 0.0);

  // Concentric sphere radius: R * 1.006 (sits cleanly above temperature R * 1.004)
  const layerRadius = radius * 1.006;

  // Material setup: constant default initial uniforms to avoid useMemo closure dependency warnings
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: PRECIP_VERTEX_SHADER,
      fragmentShader: PRECIP_FRAGMENT_SHADER,
      uniforms: {
        uOpacity: { value: 0.65 },
        uTimeProgress: { value: 0.85 },
        uTransition: { value: 1.0 },
        uMonth: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, []);

  const currentOpacityRef = useRef<number>(opacity);
  const currentTimeRef = useRef<number>(progressPercent / 100);

  // Frame animation loop: smooth layer breathing transition & uniforms update
  useFrame((_, delta) => {
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
  });

  return (
    <mesh>
      <sphereGeometry args={[layerRadius, 64, 64]} />
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}
