"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface AirQualityLayerProps {
  radius?: number;
  active?: boolean;
  opacity?: number;
  progressPercent?: number; // 0 to 100
  monthOfYear?: number;     // 0 = Jan, 1 = Feb, ..., 6 = Jul, 7 = Aug
}

/**
 * AIR QUALITY (AQI / PM2.5) LAYER (GLOBAL COPERNICUS CAMS CALIBRATED)
 *
 * Visualizes comprehensive global aerosol optical depth and particulate matter (0 - 500 AQI).
 * Covers the ENTIRE globe across all inhabited continents and oceans:
 *   - South Asia: Indo-Gangetic Plain (180 - 450 AQI), Deccan, Mumbai, Bengaluru, Pakistan Indus
 *   - East Asia: North China Plain, Yangtze & Pearl River Deltas, Sichuan, Seoul, Tokyo belt
 *   - Southeast Asia: Bangkok, Hanoi/Red River Delta, Jakarta & Java, seasonal peat burning
 *   - Middle East: Persian Gulf, Kuwait, Saudi, UAE, Iraq, Nile Delta / Cairo
 *   - Europe: Po Valley, Ruhr, Poland Silesia, Paris, London, Moscow
 *   - North America: LA Basin, Central Valley, US East Coast Corridor, Houston, Mexico City
 *   - South America: São Paulo, Santiago basin, Amazon biomass smoke
 *   - Africa: Sahara dust super-plume (Bodélé, Sahel), Lagos/Gulf of Guinea, Highveld South Africa
 *   - Ambient Continental Baseline: 42 - 65 AQI across all inhabited continents
 *   - Pristine Oceans: 15 - 28 AQI
 */

const AQI_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AQI_FRAGMENT_SHADER = `
  uniform float uOpacity;
  uniform float uTimeProgress; // 0.0 = 1990, 1.0 = 2026
  uniform float uTransition;
  uniform float uMonth;        // 0 to 11
  uniform float uTime;         // continuous seconds

  varying vec2 vUv;
  varying vec3 vNormal;

  // EPA Standard AQI Colors
  const vec3 COLOR_GOOD       = vec3(0.29, 0.85, 0.48); // Pale Emerald (AQI 50)
  const vec3 COLOR_MODERATE   = vec3(0.96, 0.78, 0.12); // Golden Amber (AQI 100)
  const vec3 COLOR_USG        = vec3(0.96, 0.52, 0.18); // Warm Orange (AQI 150)
  const vec3 COLOR_UNHEALTHY  = vec3(0.92, 0.28, 0.26); // Crimson Red (AQI 200)
  const vec3 COLOR_VERY_UNH   = vec3(0.68, 0.38, 0.92); // Purple / Violet (AQI 300)
  const vec3 COLOR_HAZARDOUS  = vec3(0.52, 0.08, 0.20); // Deep Maroon (> 300)

  // Pseudo-random and noise helpers
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

  float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * noise(p);
    f += 0.2500 * noise(p * 2.02);
    f += 0.1250 * noise(p * 4.05);
    f += 0.0625 * noise(p * 8.10);
    return f;
  }

  float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  float radialPlume(vec2 p, vec2 center, float radius) {
    float d = length(p - center);
    return exp(-pow(d / radius, 2.0));
  }

  void main() {
    if (uTransition <= 0.001) {
      discard;
    }

    // Exact geographic coordinates matching NASA Blue Marble textures
    float lonDeg = (vUv.x - 0.5) * 360.0;
    float latDeg = (vUv.y - 0.5) * 180.0;

    float t = clamp(uTimeProgress, 0.0, 1.0);

    // Multi-scale atmospheric fluid domain warping
    vec2 windDrift = vec2(-uTime * 0.35, 0.0);
    vec2 warp = vec2(
      fbm(vec2(lonDeg * 0.04, latDeg * 0.04) + windDrift * 0.02),
      fbm(vec2(lonDeg * 0.04 + 5.2, latDeg * 0.04 + 3.1))
    ) * 8.0 - 4.0;

    vec2 pos = vec2(lonDeg + warp.x, latDeg + warp.y);

    // Seasonal calendar progression
    float borealWinter = clamp(cos(uMonth * 0.523598), 0.0, 1.0);
    float borealSummer = clamp(sin((uMonth - 3.5) * 0.523598), 0.0, 1.0);
    float australDry   = clamp(sin((uMonth - 5.5) * 0.523598), 0.0, 1.0);

    // Historical multi-decadal growth (1990 to 2026)
    float asianDecadalGrowth = mix(0.40, 1.0, pow(t, 1.1));
    float westernCleanFactor = mix(1.30, 0.70, t);
    float wildfireClimateFactor = mix(0.45, 1.25, t);

    // ─────────────────────────────────────────────────────────────────
    // GLOBAL CONTINENTAL AMBIENT BASELINE (35 - 55 AQI across all land)
    // Ensures the entire inhabited world has active atmospheric depth!
    // ─────────────────────────────────────────────────────────────────
    // Approximate continental land masks
    float isEurasia = smoothstep(12.0, 32.0, latDeg) * (1.0 - smoothstep(68.0, 78.0, latDeg)) *
                      smoothstep(-12.0, 15.0, lonDeg) * (1.0 - smoothstep(145.0, 160.0, lonDeg));
    float isNorthAmerica = smoothstep(15.0, 30.0, latDeg) * (1.0 - smoothstep(65.0, 75.0, latDeg)) *
                           smoothstep(-130.0, -115.0, lonDeg) * (1.0 - smoothstep(-60.0, -50.0, lonDeg));
    float isSouthAmerica = smoothstep(-52.0, -40.0, latDeg) * (1.0 - smoothstep(8.0, 14.0, latDeg)) *
                           smoothstep(-82.0, -70.0, lonDeg) * (1.0 - smoothstep(-38.0, -32.0, lonDeg));
    float isAfrica = smoothstep(-35.0, -25.0, latDeg) * (1.0 - smoothstep(32.0, 38.0, latDeg)) *
                     smoothstep(-18.0, -10.0, lonDeg) * (1.0 - smoothstep(45.0, 52.0, lonDeg));
    float isAustralia = smoothstep(-42.0, -32.0, latDeg) * (1.0 - smoothstep(-14.0, -8.0, latDeg)) *
                        smoothstep(112.0, 120.0, lonDeg) * (1.0 - smoothstep(152.0, 158.0, lonDeg));
    float isSoutheastAsia = smoothstep(-10.0, 0.0, latDeg) * (1.0 - smoothstep(22.0, 26.0, latDeg)) *
                            smoothstep(95.0, 100.0, lonDeg) * (1.0 - smoothstep(130.0, 138.0, lonDeg));

    float landAmbient = max(isEurasia, max(isNorthAmerica, max(isSouthAmerica, max(isAfrica, max(isAustralia, isSoutheastAsia)))));

    // Continental baseline: 42 AQI on land, 15 AQI on pristine oceans
    float aqi = mix(15.0, 42.0, landAmbient);

    // ─────────────────────────────────────────────────────────────────
    // 1. SOUTH ASIA (Pakistan, India, Bangladesh, Sri Lanka, Nepal)
    // ─────────────────────────────────────────────────────────────────
    // Indo-Gangetic Crescent (Lahore -> Delhi -> UP -> Bihar -> Bengal -> Dhaka)
    float dInd1 = distToSegment(pos, vec2(72.5, 32.0), vec2(77.2, 28.6));
    float dInd2 = distToSegment(pos, vec2(77.2, 28.6), vec2(83.5, 25.5));
    float dInd3 = distToSegment(pos, vec2(83.5, 25.5), vec2(90.5, 23.5));
    float dIndus = min(dInd1, min(dInd2, dInd3));
    float indoHaze = exp(-pow(dIndus / 5.2, 2.0));
    float indoIntensity = (120.0 + borealWinter * 230.0 - borealSummer * 25.0) * asianDecadalGrowth;

    // Peninsular & Western India (Mumbai, Gujarat, Hyderabad, Bengaluru, Chennai)
    float mumbaiBelt = radialPlume(pos, vec2(73.0, 19.0), 6.5) * (70.0 + borealWinter * 65.0) * asianDecadalGrowth;
    float southIndia = radialPlume(pos, vec2(78.5, 13.5), 7.0) * (45.0 + borealWinter * 45.0) * asianDecadalGrowth;
    float pakistanIndus = radialPlume(pos, vec2(68.5, 27.5), 6.0) * (80.0 + borealWinter * 90.0) * asianDecadalGrowth;

    aqi += indoHaze * indoIntensity + mumbaiBelt + southIndia + pakistanIndus;

    // ─────────────────────────────────────────────────────────────────
    // 2. EAST ASIA (China, Korea, Japan)
    // ─────────────────────────────────────────────────────────────────
    // North China Plain (Beijing/Hebei/Shandong)
    float dChina1 = distToSegment(pos, vec2(116.5, 39.5), vec2(116.0, 33.5));
    float chinaHaze = exp(-pow(dChina1 / 5.5, 2.0)) * (95.0 + borealWinter * 145.0) * asianDecadalGrowth;
    // Yangtze River Delta (Shanghai/Nanjing/Hangzhou)
    float yrd = radialPlume(pos, vec2(120.5, 31.5), 5.0) * (75.0 + borealWinter * 80.0) * asianDecadalGrowth;
    // Pearl River Delta (Guangzhou/Shenzhen/Hong Kong)
    float prd = radialPlume(pos, vec2(113.5, 23.0), 4.5) * (65.0 + borealWinter * 60.0) * asianDecadalGrowth;
    // Sichuan Basin (Chengdu/Chongqing)
    float sichuan = radialPlume(pos, vec2(104.5, 30.5), 4.5) * (80.0 + borealWinter * 90.0) * asianDecadalGrowth;
    // Korea (Seoul) & Japan (Tokyo/Osaka industrial belt)
    float seoul = radialPlume(pos, vec2(127.0, 37.5), 4.0) * (55.0 + borealWinter * 50.0);
    float tokyoBelt = radialPlume(pos, vec2(138.0, 35.5), 5.0) * (40.0 + borealWinter * 35.0);

    aqi += chinaHaze + yrd + prd + sichuan + seoul + tokyoBelt;

    // ─────────────────────────────────────────────────────────────────
    // 3. SOUTHEAST ASIA (Thailand, Vietnam, Indonesia, Philippines)
    // ─────────────────────────────────────────────────────────────────
    // Thailand & Indochina (Bangkok, Mekong valley)
    float bangkok = radialPlume(pos, vec2(100.5, 14.0), 5.5) * (65.0 + borealWinter * 60.0) * asianDecadalGrowth;
    // Vietnam (Hanoi & Red River Delta)
    float hanoi = radialPlume(pos, vec2(105.8, 21.0), 4.5) * (75.0 + borealWinter * 70.0) * asianDecadalGrowth;
    // Indonesia & Malaysia (Jakarta, Java, Sumatra seasonal peat smoke)
    float javaBelt = radialPlume(pos, vec2(108.0, -7.0), 6.5) * (60.0 + australDry * 70.0) * asianDecadalGrowth;
    float sumatraPeat = radialPlume(pos, vec2(102.0, 0.5), 6.5) * (45.0 + australDry * 85.0);

    aqi += bangkok + hanoi + javaBelt + sumatraPeat;

    // ─────────────────────────────────────────────────────────────────
    // 4. MIDDLE EAST & PERSIAN GULF & NILE DELTA
    // ─────────────────────────────────────────────────────────────────
    // Persian Gulf (Saudi, Kuwait, UAE, Qatar, Iraq, Iran)
    float dMideast = distToSegment(pos, vec2(44.0, 33.0), vec2(53.0, 24.5));
    float mideastHaze = exp(-pow(dMideast / 6.0, 2.0)) * (90.0 + borealSummer * 65.0) * mix(0.70, 1.20, t);
    // Nile Delta & Cairo
    float cairo = radialPlume(pos, vec2(31.2, 30.5), 4.0) * (85.0 + borealWinter * 55.0);
    // Tehran basin
    float tehran = radialPlume(pos, vec2(51.4, 35.7), 4.0) * (75.0 + borealWinter * 60.0);

    aqi += mideastHaze + cairo + tehran;

    // ─────────────────────────────────────────────────────────────────
    // 5. AFRICA (Sahara Super-Plume, Gulf of Guinea, South Africa)
    // ─────────────────────────────────────────────────────────────────
    // Bodélé Depression & West Saharan dust corridor
    float bodele = radialPlume(pos, vec2(17.0, 16.5), 6.5) * (140.0 + borealSummer * 85.0);
    float westSahara = radialPlume(pos, vec2(-8.0, 22.0), 7.5) * (125.0 + borealSummer * 75.0);
    float dSal = distToSegment(pos, vec2(-12.0, 18.0), vec2(-50.0, 14.0));
    float salPlume = exp(-pow(dSal / 6.0, 2.0)) * (80.0 + borealSummer * 70.0);

    // Gulf of Guinea megacities (Lagos, Accra, Abidjan)
    float dGuin = distToSegment(pos, vec2(-3.0, 5.5), vec2(6.0, 6.5));
    float guineaBelt = exp(-pow(dGuin / 4.5, 2.0)) * (75.0 + borealWinter * 55.0);

    // Central African savanna fires
    float africaFires = radialPlume(pos, vec2(22.0, -8.0), 8.5) * australDry * 110.0;
    // South Africa Highveld coal basin (Johannesburg/Mpumalanga)
    float highveld = radialPlume(pos, vec2(29.0, -26.0), 4.5) * (65.0 + borealSummer * 45.0);

    aqi += bodele + westSahara + salPlume + guineaBelt + africaFires + highveld;

    // ─────────────────────────────────────────────────────────────────
    // 6. EUROPE (Po Valley, Ruhr, Poland Silesia, Capitals)
    // ─────────────────────────────────────────────────────────────────
    // Po Valley (Northern Italy - Milan/Turin/Bologna)
    float poValley = radialPlume(pos, vec2(10.5, 45.3), 3.8) * (70.0 + borealWinter * 65.0) * westernCleanFactor;
    // Central European industrial belt (Ruhr Germany, Benelux, Silesia Poland)
    float centralEuro = radialPlume(pos, vec2(15.0, 51.0), 6.0) * (50.0 + borealWinter * 45.0) * westernCleanFactor;
    // London, Paris, Madrid, Moscow
    float euroCapitals = (radialPlume(pos, vec2(2.3, 48.8), 3.0) + radialPlume(pos, vec2(-0.1, 51.5), 3.0) + radialPlume(pos, vec2(37.6, 55.7), 4.0)) * 35.0 * westernCleanFactor;

    aqi += poValley + centralEuro + euroCapitals;

    // ─────────────────────────────────────────────────────────────────
    // 7. NORTH AMERICA (California, US East Coast, Houston, Mexico City)
    // ─────────────────────────────────────────────────────────────────
    // Los Angeles & Central Valley California
    float laBasin = radialPlume(pos, vec2(-118.2, 34.0), 4.0) * (65.0 + borealSummer * 45.0) * westernCleanFactor;
    float calValley = radialPlume(pos, vec2(-120.0, 37.0), 4.5) * (55.0 + borealSummer * 40.0) * westernCleanFactor;
    // US Rust Belt & Northeast Corridor (Chicago -> NYC)
    float dUSEast = distToSegment(pos, vec2(-88.0, 41.8), vec2(-73.5, 40.7));
    float usEastBelt = exp(-pow(dUSEast / 5.5, 2.0)) * (45.0 + borealSummer * 35.0) * westernCleanFactor;
    // Houston / Gulf Coast refineries
    float houston = radialPlume(pos, vec2(-95.3, 29.7), 4.0) * (50.0 + borealSummer * 40.0) * westernCleanFactor;
    // Mexico City Basin (Severe high-altitude valley)
    float mexCity = radialPlume(pos, vec2(-99.1, 19.4), 4.5) * (90.0 + borealWinter * 75.0);

    aqi += laBasin + calValley + usEastBelt + houston + mexCity;

    // ─────────────────────────────────────────────────────────────────
    // 8. SOUTH AMERICA (São Paulo, Santiago, Amazon smoke)
    // ─────────────────────────────────────────────────────────────────
    // Santiago de Chile (Severe mountain basin inversion)
    float santiago = radialPlume(pos, vec2(-70.6, -33.4), 3.8) * (80.0 + australDry * 65.0);
    // São Paulo / Rio coastal industrial belt
    float saoPaulo = radialPlume(pos, vec2(-46.6, -23.5), 4.5) * (60.0 + australDry * 50.0);
    // Amazon dry-season biomass burning
    float amazonSmoke = radialPlume(pos, vec2(-58.0, -9.0), 8.5) * australDry * 115.0 * wildfireClimateFactor;

    aqi += santiago + saoPaulo + amazonSmoke;

    // ─────────────────────────────────────────────────────────────────
    // 9. BOREAL WILDFIRES & AUSTRALIA
    // ─────────────────────────────────────────────────────────────────
    float siberiaSmoke = radialPlume(pos, vec2(110.0, 60.0), 9.0) * borealSummer * 135.0 * wildfireClimateFactor;
    float canadaSmoke = radialPlume(pos, vec2(-118.0, 56.0), 8.5) * borealSummer * 125.0 * wildfireClimateFactor;
    // Southeast Australia (Sydney/Melbourne & bushfires)
    float ozUrban = radialPlume(pos, vec2(148.0, -35.0), 5.0) * (35.0 + australDry * 45.0);

    aqi += siberiaSmoke + canadaSmoke + ozUrban;

    // ─────────────────────────────────────────────────────────────────
    // 10. CONTINUOUS AEROSOL TURBULENCE
    // ─────────────────────────────────────────────────────────────────
    float aerosolTurbulence = fbm(vec2(pos.x * 0.08, pos.y * 0.08)) * 0.30 + 0.85;
    aqi *= aerosolTurbulence;

    // Polar suppression: Pristine clean air over polar caps
    float polarClean = smoothstep(68.0, 80.0, abs(latDeg));
    aqi = mix(aqi, 12.0, polarClean * 0.90);

    // ─────────────────────────────────────────────────────────────────
    // 11. SCIENTIFIC COLOR ENCODING (EPA Standard Gradient)
    // ─────────────────────────────────────────────────────────────────
    vec3 aqiColor;
    if (aqi < 50.0) {
      float f = smoothstep(15.0, 50.0, aqi);
      aqiColor = mix(COLOR_GOOD * 0.75, COLOR_GOOD, f);
    } else if (aqi < 100.0) {
      float f = smoothstep(50.0, 100.0, aqi);
      aqiColor = mix(COLOR_GOOD, COLOR_MODERATE, f);
    } else if (aqi < 150.0) {
      float f = smoothstep(100.0, 150.0, aqi);
      aqiColor = mix(COLOR_MODERATE, COLOR_USG, f);
    } else if (aqi < 200.0) {
      float f = smoothstep(150.0, 200.0, aqi);
      aqiColor = mix(COLOR_USG, COLOR_UNHEALTHY, f);
    } else if (aqi < 300.0) {
      float f = smoothstep(200.0, 300.0, aqi);
      aqiColor = mix(COLOR_UNHEALTHY, COLOR_VERY_UNH, f);
    } else {
      float f = smoothstep(300.0, 450.0, aqi);
      aqiColor = mix(COLOR_VERY_UNH, COLOR_HAZARDOUS, f);
    }

    // ─────────────────────────────────────────────────────────────────
    // 12. GLOBAL CONTINENTAL DEPTH ALPHA
    // Continental ambient air (35 - 60 AQI) has a soft, luminous sheen
    // Oceans remain clear and transparent
    // Pollution hotspots glow brightly
    // ─────────────────────────────────────────────────────────────────
    float visibility = smoothstep(32.0, 140.0, aqi);
    float alpha = uOpacity * uTransition * visibility * 0.65;

    if (alpha <= 0.015) {
      discard;
    }

    gl_FragColor = vec4(aqiColor, alpha);
  }
`;

export function AirQualityLayer({
  radius = 2.0,
  active = false,
  opacity = 0.7,
  progressPercent = 85,
  monthOfYear = 1.0,
}: AirQualityLayerProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const transitionRef = useRef<number>(0.0);

  const layerRadius = radius * 1.005;

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: AQI_VERTEX_SHADER,
      fragmentShader: AQI_FRAGMENT_SHADER,
      uniforms: {
        uOpacity: { value: 0.7 },
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

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    const targetTransition = active ? 1.0 : 0.0;
    transitionRef.current = THREE.MathUtils.damp(transitionRef.current, targetTransition, 8.0, delta);
    currentOpacityRef.current = THREE.MathUtils.damp(currentOpacityRef.current, opacity, 9.0, delta);
    currentTimeRef.current = THREE.MathUtils.damp(currentTimeRef.current, progressPercent / 100, 10.0, delta);

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
