"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/navigation/TopBar";
import { LayerPanel, type LayerItemConfig } from "@/components/data/LayerPanel";
import { SearchOverlay } from "@/components/navigation/SearchOverlay";
import { SpatialViewport } from "@/components/spatial/SpatialViewport";
import { ZoomControls } from "@/components/controls/ZoomControls";
import { CoordinateDisplay } from "@/components/controls/CoordinateDisplay";
import { ScaleBar } from "@/components/controls/ScaleBar";
import { ClimateLegend } from "@/components/data/ClimateLegend";
import { PrecipitationLegend } from "@/components/data/PrecipitationLegend";
import { WindLegend } from "@/components/data/WindLegend";
import { AirQualityLegend } from "@/components/data/AirQualityLegend";
import { TemporalRegion } from "@/components/temporal/TemporalRegion";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { ApplicationMode, GeoCoordinate, PlaybackState } from "@/types/spatial";
import type { ClimateLayerId } from "@/types/climate";

const INITIAL_LAYERS: LayerItemConfig[] = [
  {
    id: "temperature-anomaly",
    name: "Temperature Anomaly",
    unit: "°C",
    source: "ECMWF ERA5",
    active: true,
    opacity: 0.75,
  },
  {
    id: "precipitation",
    name: "Precipitation",
    unit: "mm/day",
    source: "GPCP",
    active: false,
    opacity: 0.65,
  },
  {
    id: "wind",
    name: "Wind Vectors",
    unit: "m/s",
    source: "ERA5 Reanalysis",
    active: false,
    opacity: 0.8,
  },
  {
    id: "air-quality",
    name: "Air Quality (AQI / PM2.5)",
    unit: "AQI",
    source: "Copernicus CAMS",
    active: false,
    opacity: 0.7,
  },
];

export function AetherShell() {
  // Application Mode
  const [mode, setMode] = useState<ApplicationMode>("explore");

  // Navigation & Flyouts
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Spatial State
  const [zoom, setZoom] = useState<number>(1.0);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [coordinate, setCoordinate] = useState<GeoCoordinate>({
    longitude: 0,
    latitude: 20,
  });

  // Climate Layers State
  const [layers, setLayers] = useState<LayerItemConfig[]>(INITIAL_LAYERS);

  // Temporal State
  const [playback, setPlayback] = useState<PlaybackState>("paused");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(85);

  // Active layers for TopBar indicator
  const activeLayers = layers.filter((l) => l.active);
  const activeLayerName =
    activeLayers.length === 1
      ? activeLayers[0]?.name
      : activeLayers.length > 1
        ? activeLayers.map((l) => l.name.split(" ")[0]).join(" + ")
        : null;

  // Active Temperature Anomaly Layer State
  const tempLayer = layers.find((l) => l.id === "temperature-anomaly");
  const isTemperatureActive = tempLayer?.active ?? false;
  const temperatureOpacity = tempLayer?.opacity ?? 0.75;

  // Active Precipitation Layer State
  const precipLayer = layers.find((l) => l.id === "precipitation");
  const isPrecipitationActive = precipLayer?.active ?? false;
  const precipitationOpacity = precipLayer?.opacity ?? 0.65;

  // Active Wind Vectors Layer State
  const windLayer = layers.find((l) => l.id === "wind");
  const isWindActive = windLayer?.active ?? false;
  const windOpacity = windLayer?.opacity ?? 0.8;

  // Active Air Quality Layer State
  const aqiLayer = layers.find((l) => l.id === "air-quality");
  const isAirQualityActive = aqiLayer?.active ?? false;
  const airQualityOpacity = aqiLayer?.opacity ?? 0.7;

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onToggleSearch: () => setIsSearchOpen((prev) => !prev),
    onToggleInspect: () =>
      setMode((prev) => (prev === "inspect" ? "explore" : "inspect")),
    onCloseOverlays: () => {
      setIsSearchOpen(false);
      setIsLayerPanelOpen(false);
    },
    onTogglePlayback: () =>
      setPlayback((prev) => (prev === "playing" ? "paused" : "playing")),
  });

  // Zoom Handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.3, 10.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.3, 0.5));
  };

  const handleResetOrientation = () => {
    setZoom(1.0);
    setCoordinate({ longitude: 0, latitude: 20 });
    setResetTrigger((prev) => prev + 1);
  };

  // Layer Handlers
  const handleToggleLayer = (id: ClimateLayerId) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, active: !layer.active } : layer
      )
    );
  };

  const handleChangeOpacity = (id: ClimateLayerId, opacity: number) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, opacity } : layer))
    );
  };

  // Temporal Handlers
  const handleTogglePlayback = () => {
    setPlayback((prev) => (prev === "playing" ? "paused" : "playing"));
  };

  const handleStepBack = () => {
    setProgressPercent((prev) => Math.max(0, prev - 5));
  };

  const handleStepForward = () => {
    setProgressPercent((prev) => Math.min(100, prev + 5));
  };

  const handleChangeSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 5 : 1));
  };

  const handleSeek = (percent: number) => {
    setProgressPercent(percent);
  };

  // Active Playback Timer (smooth 60fps playhead animation when Play is active)
  React.useEffect(() => {
    if (playback !== "playing") return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const frameStep = (now: number) => {
      const deltaSec = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      setProgressPercent((prev) => {
        // Speed multiplier: 1x advances ~0.3% per second (~800ms per calendar month), 2x advances ~0.7%, 5x advances ~1.5%
        const rate = playbackSpeed === 5 ? 1.5 : playbackSpeed === 2 ? 0.7 : 0.3;
        const next = prev + rate * deltaSec;
        return next >= 100 ? 0 : next;
      });

      animationFrameId = requestAnimationFrame(frameStep);
    };

    animationFrameId = requestAnimationFrame(frameStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [playback, playbackSpeed]);

  // Dynamic Date calculation from 1990 to 2026 based on progressPercent
  const startYear = 1990;
  const totalMonths = (2026 - startYear) * 12 + 7; // up to August 2026
  const currentMonthIndex = Math.min(
    totalMonths,
    Math.max(0, Math.floor((progressPercent / 100) * totalMonths))
  );
  const currentYear = startYear + Math.floor(currentMonthIndex / 12);
  const monthOfYear = currentMonthIndex % 12;
  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
  ];
  const currentMonthName = monthNames[monthOfYear] ?? "JANUARY";
  const currentDateDisplay = `${currentMonthName} ${currentYear}`;

  // Real-time Temperature Anomaly readout at center coordinate
  const centerAnomalyValue = React.useMemo(() => {
    if (!isTemperatureActive) return null;
    const lat = coordinate.latitude;
    const lon = coordinate.longitude;
    const lonRad = (lon * Math.PI) / 180;
    const latRad = (lat * Math.PI) / 180;
    const polarDamp = Math.cos(latRad);
    const t = Math.max(0, Math.min(1, progressPercent / 100));

    const globalBaseline = 0.18 + (0.85 - 0.18) * Math.pow(t, 1.15);

    const midLatEnvelope = Math.max(0, Math.min(1, (Math.abs(lat) - 22) / 16)) * (1 - Math.max(0, Math.min(1, (Math.abs(lat) - 62) / 16)));
    const wave3 = Math.sin(lonRad * 3.0 + t * 2.2) * 0.70;
    const wave4 = Math.cos(lonRad * 4.0 - t * 1.5 + 1.2) * 0.45;
    const rossbyWaves = (wave3 + wave4) * midLatEnvelope * polarDamp * (0.5 + 0.6 * t);

    // North Atlantic cold hole
    const dCold = Math.hypot((lon + 34.0) * 0.8, (lat - 52.0) * 1.2);
    const coldHole = Math.exp(-Math.pow(dCold / 12.0, 2.0)) * -1.35;

    // Arctic Amplification
    const arcticShelf = Math.max(0, Math.min(1, (lat - 64.0) / 12.0)) * (1 - Math.max(0, Math.min(1, (lat - 82.0) / 7.0)) * 0.4);
    const arcticAnomaly = arcticShelf * (0.5 + 1.3 * t);

    // Regional Heat Domes
    const dUS = Math.hypot((lon + 115.0) * 0.9, (lat - 45.0) * 1.1);
    const usHeat = Math.exp(-Math.pow(dUS / 14.0, 2.0)) * (0.3 + 1.1 * t);

    const dMed = Math.hypot((lon - 18.0) * 0.8, (lat - 38.0) * 1.1);
    const medHeat = Math.exp(-Math.pow(dMed / 13.0, 2.0)) * (0.3 + 1.2 * t);

    const dSiberia = Math.hypot((lon - 90.0) * 0.7, (lat - 58.0) * 1.1);
    const siberiaHeat = Math.exp(-Math.pow(dSiberia / 16.0, 2.0)) * (0.3 + 1.2 * t);

    // ENSO
    const dEnso = Math.hypot((lon + 130.0) * 0.4, lat * 1.6);
    const ensoCycle = Math.sin(t * 18.8495 + 1.2);
    const ensoAnomaly = Math.exp(-Math.pow(dEnso / 18.0, 2.0)) * ensoCycle * 1.2;

    // Southern Ocean
    const southCold = Math.max(0, Math.min(1, (-lat - 48.0) / 14.0)) * (1 - Math.max(0, Math.min(1, (-lat - 74.0) / 12.0))) * -0.55;

    const deltaT = globalBaseline + rossbyWaves + coldHole + arcticAnomaly + usHeat + medHeat + siberiaHeat + ensoAnomaly + southCold;

    const sign = deltaT >= 0 ? "+" : "";
    return `${sign}${deltaT.toFixed(1)}°C`;
  }, [isTemperatureActive, coordinate.latitude, coordinate.longitude, progressPercent]);

  // Real-time Precipitation Rate readout at center coordinate
  const centerPrecipitationValue = React.useMemo(() => {
    if (!isPrecipitationActive) return null;
    const lat = coordinate.latitude;
    const lon = coordinate.longitude;
    const t = Math.max(0, Math.min(1, progressPercent / 100));

    const gaussianPlume = (cLon: number, cLat: number, sLon: number, sLat: number, radius: number) => {
      const dx = (lon - cLon) * sLon;
      const dy = (lat - cLat) * sLat;
      return Math.exp(-(dx * dx + dy * dy) / (2.0 * radius * radius));
    };

    const desertWell = (cLon: number, cLat: number, sLon: number, sLat: number, radius: number) => {
      const dist = Math.hypot((lon - cLon) * sLon, (lat - cLat) * sLat);
      const rMin = radius * 0.35;
      if (dist <= rMin) return 0.0;
      if (dist >= radius) return 1.0;
      const f = (dist - rMin) / (radius - rMin);
      return f * f * (3 - 2 * f);
    };

    // Seasonal factors
    const borealSummer = Math.max(0, Math.min(1, Math.sin((monthOfYear - 3.5) * 0.523598)));
    const australSummer = Math.max(0, Math.min(1, Math.sin((monthOfYear - 9.5) * 0.523598)));
    const lonRad = (lon * Math.PI) / 180;

    // 1. Global ITCZ
    const seasonalShift = -3.5 + borealSummer * 10.5;
    const itczLatTarget = 2.0 + seasonalShift + Math.sin(lonRad * 3.5 + t * 1.5) * 2.5;
    const itczDist = Math.abs(lat - itczLatTarget);
    const itczRain = Math.max(0, (5.5 - itczDist) / 5.5) * 13.0;

    // 2. Tropical Rainforest Plumes (Gaussian)
    const amazonRain = gaussianPlume(-60.0, -4.0, 0.8, 1.0, 20.0) * (11.0 + australSummer * 5.5);
    const congoRain = gaussianPlume(22.0, 0.0, 0.9, 1.0, 16.0) * 12.0;
    const seAsiaRain = gaussianPlume(114.0, 5.0, 0.8, 1.2, 22.0) * (11.0 + borealSummer * 5.0);

    // 3. Monsoonal Systems
    const indiaRain = gaussianPlume(80.0, 18.0, 0.9, 1.1, 15.0) * (Math.pow(borealSummer, 1.2) * 16.0 + 0.8);
    const eastAsiaRain = gaussianPlume(122.0, 31.0, 0.8, 1.1, 17.0) * (4.5 + borealSummer * 7.5);

    // 4. North America
    const pnwRain = gaussianPlume(-130.0, 52.0, 0.7, 1.4, 14.0) * (8.5 + (1.0 - borealSummer) * 4.0);
    const eastUSRain = gaussianPlume(-82.0, 36.0, 0.9, 1.0, 16.0) * (4.5 + borealSummer * 2.5);
    const centAmRain = gaussianPlume(-82.0, 14.0, 0.9, 1.2, 14.0) * (7.0 + borealSummer * 6.0);

    // 5. Europe & Mediterranean
    const europeRain = gaussianPlume(8.0, 52.0, 0.8, 1.2, 15.0) * (4.5 + (1.0 - borealSummer * 0.3) * 3.0);
    const medRain = gaussianPlume(15.0, 38.0, 0.6, 1.3, 12.0) * ((1.0 - borealSummer) * 3.5 + 0.3);

    // 6. Australia & Oceania
    const ausNorthRain = gaussianPlume(134.0, -15.0, 0.8, 1.3, 13.0) * (australSummer * 11.0 + 0.4);
    const ausEastRain = gaussianPlume(152.0, -32.0, 0.9, 1.0, 15.0) * 5.5;

    // 7. Storm Fronts
    const midLatNorth = Math.max(0, Math.min(1, (lat - 38) / 10)) * (1 - Math.max(0, Math.min(1, (lat - 60) / 8)));
    const stormNorth = midLatNorth * (Math.sin(lonRad * 3.0 - t * 4.0) * 1.5 + 4.5);

    const midLatSouth = Math.max(0, Math.min(1, (-lat - 36) / 8)) * (1 - Math.max(0, Math.min(1, (-lat - 60) / 8)));
    const stormSouth = midLatSouth * (Math.cos(lonRad * 4.0 - t * 3.0) * 1.5 + 5.0);

    // 8. Desert Wells (smooth non-rectangular evaporation)
    const saharaWell = desertWell(14.0, 24.0, 0.6, 1.2, 24.0);
    const arabiaWell = desertWell(46.0, 24.0, 0.8, 1.0, 15.0);
    const iranWell = desertWell(60.0, 33.0, 0.9, 1.2, 13.0);
    const gobiWell = desertWell(92.0, 42.0, 0.6, 1.3, 16.0);
    const ausOutbackWell = desertWell(128.0, -25.0, 0.8, 1.1, 16.0);
    const atacamaWell = desertWell(-70.0, -22.0, 1.5, 0.7, 12.0);
    const namibWell = desertWell(18.0, -24.0, 1.1, 0.9, 12.0);
    const usSouthwestWell = desertWell(-112.0, 32.0, 0.9, 1.0, 12.0);

    const desertFactor = Math.min(saharaWell, arabiaWell, iranWell, gobiWell, ausOutbackWell, atacamaWell, namibWell, usSouthwestWell);

    // Polar suppression
    const polarFactor = 1 - Math.max(0, Math.min(1, (Math.abs(lat) - 72) / 16)) * 0.85;

    const total = (itczRain + amazonRain + congoRain + seAsiaRain + indiaRain + eastAsiaRain + pnwRain + eastUSRain + centAmRain + europeRain + medRain + ausNorthRain + ausEastRain + stormNorth + stormSouth) * desertFactor * polarFactor;
    return `${Math.max(0, total).toFixed(1)} mm/d`;
  }, [isPrecipitationActive, coordinate.latitude, coordinate.longitude, progressPercent, monthOfYear]);

  // Real-time Wind Velocity readout at center coordinate (m/s)
  const centerWindValue = React.useMemo(() => {
    if (!isWindActive) return null;
    const lat = coordinate.latitude;
    const lon = coordinate.longitude;
    const t = Math.max(0, Math.min(1, progressPercent / 100));

    const borealSummer = Math.max(0, Math.min(1, Math.sin((monthOfYear - 3.5) * 0.523598)));
    const australSummer = Math.max(0, Math.min(1, Math.sin((monthOfYear - 9.5) * 0.523598)));
    const lonRad = (lon * Math.PI) / 180;

    let u = 0.0;
    let v = 0.0;

    // A. Roaring Forties & Screaming Sixties (-40°S to -65°S)
    const roaringFactor = Math.max(0, Math.min(1, (-lat - 34) / 8)) * (1 - Math.max(0, Math.min(1, (-lat - 62) / 8)));
    const roaringSpeed = 16.0 + Math.sin(lonRad * 3.0 - t * 2.0) * 4.0 + australSummer * 4.0;
    u += roaringFactor * roaringSpeed;
    v += roaringFactor * Math.sin(lonRad * 4.0 + t) * 3.0;

    // B. Tropical Trade Winds (5° to 28° N/S)
    const neTrade = Math.max(0, Math.min(1, (lat - 4) / 6)) * (1 - Math.max(0, Math.min(1, (lat - 26) / 6)));
    const seTrade = Math.max(0, Math.min(1, (-lat - 4) / 6)) * (1 - Math.max(0, Math.min(1, (-lat - 26) / 6)));
    u -= (neTrade * 8.5 + seTrade * 9.0);
    v -= (neTrade * 2.2);
    v += (seTrade * 2.2);

    // C. Northern Mid-Latitude Westerlies (35°N to 62°N: US, Europe, Asia)
    const midLatNorth = Math.max(0, Math.min(1, (lat - 32) / 10)) * (1 - Math.max(0, Math.min(1, (lat - 60) / 8)));
    const stormCycle = Math.sin(lonRad * 4.0 - t * 3.0);
    u += midLatNorth * (11.0 + stormCycle * 4.5 + (1.0 - borealSummer) * 3.5);
    v += midLatNorth * Math.cos(lonRad * 4.0 - t * 3.0) * 4.0;

    // D. Polar Front Jet Stream
    const jetLatitude = 46.0 + Math.sin(lonRad * 3.0 + t * 2.0) * 6.0;
    const jetDist = Math.abs(lat - jetLatitude);
    const jetStream = Math.max(0, (6.0 - jetDist) / 6.0) * (18.0 + (1.0 - borealSummer) * 8.0);
    u += jetStream;

    // E. Somali Jet & South Asian Monsoon
    const dx = (lon - 62.0) * 0.8;
    const dy = (lat - 14.0) * 1.2;
    const somaliJet = Math.exp(-(dx * dx + dy * dy) / (2.0 * 16.0 * 16.0));
    const monsoonStrength = Math.pow(borealSummer, 1.2);
    u += somaliJet * (monsoonStrength * 14.0 - (1.0 - monsoonStrength) * 4.0);
    v += somaliJet * (monsoonStrength * 9.0 - (1.0 - monsoonStrength) * 2.5);

    // F. Subtropical Deserts damping
    const dxSahara = (lon - 18.0) * 0.6;
    const dySahara = (lat - 24.0) * 1.2;
    const sahara = Math.exp(-(dxSahara * dxSahara + dySahara * dySahara) / (2.0 * 20.0 * 20.0));
    const desertDamp = 1.0 - Math.min(0.65, sahara * 0.65);
    u *= desertDamp;
    v *= desertDamp;

    const speed = Math.max(1.8, Math.hypot(u, v));
    return `${speed.toFixed(1)} m/s`;
  }, [isWindActive, coordinate.latitude, coordinate.longitude, progressPercent, monthOfYear]);

  // Real-time Air Quality Index (AQI) readout at center coordinate
  const centerAqiValue = React.useMemo(() => {
    if (!isAirQualityActive) return null;
    const lat = coordinate.latitude;
    const lon = coordinate.longitude;
    const t = Math.max(0, Math.min(1, progressPercent / 100));

    const distToSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
      const pax = px - ax;
      const pay = py - ay;
      const bax = bx - ax;
      const bay = by - ay;
      const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
      return Math.hypot(pax - bax * h, pay - bay * h);
    };

    const borealWinter = Math.max(0, Math.min(1, Math.cos(monthOfYear * 0.523598)));
    const borealSummer = Math.max(0, Math.min(1, Math.sin((monthOfYear - 3.5) * 0.523598)));
    const australDry = Math.max(0, Math.min(1, Math.sin((monthOfYear - 5.5) * 0.523598)));

    const asianDecadalGrowth = 0.38 + (1.0 - 0.38) * Math.pow(t, 1.1);
    const westernCleanAirFactor = 1.35 + (0.65 - 1.35) * t;
    const wildfireClimateFactor = 0.45 + (1.25 - 0.45) * t;

    const radialPlume = (px: number, py: number, cx: number, cy: number, r: number) => {
      return Math.exp(-Math.pow(Math.hypot(px - cx, py - cy) / r, 2.0));
    };

    // Continental land ambient baseline (42 AQI across inhabited land)
    const isEurasia = Math.max(0, Math.min(1, (lat - 12.0) / 20.0)) * (1 - Math.max(0, Math.min(1, (lat - 68.0) / 10.0))) *
                      Math.max(0, Math.min(1, (lon + 12.0) / 27.0)) * (1 - Math.max(0, Math.min(1, (lon - 145.0) / 15.0)));
    const isNorthAmerica = Math.max(0, Math.min(1, (lat - 15.0) / 15.0)) * (1 - Math.max(0, Math.min(1, (lat - 65.0) / 10.0))) *
                           Math.max(0, Math.min(1, (lon + 130.0) / 15.0)) * (1 - Math.max(0, Math.min(1, (lon + 60.0) / 10.0)));
    const isSouthAmerica = Math.max(0, Math.min(1, (lat + 52.0) / 12.0)) * (1 - Math.max(0, Math.min(1, (lat - 8.0) / 6.0))) *
                           Math.max(0, Math.min(1, (lon + 82.0) / 12.0)) * (1 - Math.max(0, Math.min(1, (lon + 38.0) / 6.0)));
    const isAfrica = Math.max(0, Math.min(1, (lat + 35.0) / 10.0)) * (1 - Math.max(0, Math.min(1, (lat - 32.0) / 6.0))) *
                     Math.max(0, Math.min(1, (lon + 18.0) / 8.0)) * (1 - Math.max(0, Math.min(1, (lon - 45.0) / 7.0)));
    const isAustralia = Math.max(0, Math.min(1, (lat + 42.0) / 10.0)) * (1 - Math.max(0, Math.min(1, (lat + 14.0) / 6.0))) *
                        Math.max(0, Math.min(1, (lon - 112.0) / 8.0)) * (1 - Math.max(0, Math.min(1, (lon - 152.0) / 6.0)));
    const isSoutheastAsia = Math.max(0, Math.min(1, (lat + 10.0) / 10.0)) * (1 - Math.max(0, Math.min(1, (lat - 22.0) / 4.0))) *
                            Math.max(0, Math.min(1, (lon - 95.0) / 5.0)) * (1 - Math.max(0, Math.min(1, (lon - 130.0) / 8.0)));

    const landAmbient = Math.max(isEurasia, Math.max(isNorthAmerica, Math.max(isSouthAmerica, Math.max(isAfrica, Math.max(isAustralia, isSoutheastAsia)))));
    let aqi = 15.0 + landAmbient * 27.0; // 15 ocean, 42 continental land

    // 1. South Asia
    const dInd1 = distToSegment(lon, lat, 72.5, 32.0, 77.2, 28.6);
    const dInd2 = distToSegment(lon, lat, 77.2, 28.6, 83.5, 25.5);
    const dInd3 = distToSegment(lon, lat, 83.5, 25.5, 90.5, 23.5);
    const dIndus = Math.min(dInd1, Math.min(dInd2, dInd3));
    const indoHaze = Math.exp(-Math.pow(dIndus / 5.2, 2.0));
    const indoIntensity = (120.0 + borealWinter * 230.0 - borealSummer * 25.0) * asianDecadalGrowth;
    const mumbaiBelt = radialPlume(lon, lat, 73.0, 19.0, 6.5) * (70.0 + borealWinter * 65.0) * asianDecadalGrowth;
    const southIndia = radialPlume(lon, lat, 78.5, 13.5, 7.0) * (45.0 + borealWinter * 45.0) * asianDecadalGrowth;
    const pakistanIndus = radialPlume(lon, lat, 68.5, 27.5, 6.0) * (80.0 + borealWinter * 90.0) * asianDecadalGrowth;
    aqi += (indoHaze * indoIntensity + mumbaiBelt + southIndia + pakistanIndus);

    // 2. East & Southeast Asia
    const dChina1 = distToSegment(lon, lat, 116.5, 39.5, 116.0, 33.5);
    const chinaHaze = Math.exp(-Math.pow(dChina1 / 5.5, 2.0)) * (95.0 + borealWinter * 145.0) * asianDecadalGrowth;
    const yrd = radialPlume(lon, lat, 120.5, 31.5, 5.0) * (75.0 + borealWinter * 80.0) * asianDecadalGrowth;
    const prd = radialPlume(lon, lat, 113.5, 23.0, 4.5) * (65.0 + borealWinter * 60.0) * asianDecadalGrowth;
    const sichuan = radialPlume(lon, lat, 104.5, 30.5, 4.5) * (80.0 + borealWinter * 90.0) * asianDecadalGrowth;
    const seoul = radialPlume(lon, lat, 127.0, 37.5, 4.0) * (55.0 + borealWinter * 50.0);
    const tokyoBelt = radialPlume(lon, lat, 138.0, 35.5, 5.0) * (40.0 + borealWinter * 35.0);
    const bangkok = radialPlume(lon, lat, 100.5, 14.0, 5.5) * (65.0 + borealWinter * 60.0) * asianDecadalGrowth;
    const hanoi = radialPlume(lon, lat, 105.8, 21.0, 4.5) * (75.0 + borealWinter * 70.0) * asianDecadalGrowth;
    const javaBelt = radialPlume(lon, lat, 108.0, -7.0, 6.5) * (60.0 + australDry * 70.0) * asianDecadalGrowth;
    aqi += (chinaHaze + yrd + prd + sichuan + seoul + tokyoBelt + bangkok + hanoi + javaBelt);

    // 3. Middle East & Persian Gulf
    const dMideast = distToSegment(lon, lat, 44.0, 33.0, 53.0, 24.5);
    const mideastHaze = Math.exp(-Math.pow(dMideast / 6.0, 2.0)) * (90.0 + borealSummer * 65.0) * (0.70 + 0.50 * t);
    const cairo = radialPlume(lon, lat, 31.2, 30.5, 4.0) * (85.0 + borealWinter * 55.0);
    aqi += (mideastHaze + cairo);

    // 4. Africa
    const bodele = radialPlume(lon, lat, 17.0, 16.5, 6.5) * (140.0 + borealSummer * 85.0);
    const westSahara = radialPlume(lon, lat, -8.0, 22.0, 7.5) * (125.0 + borealSummer * 75.0);
    const dSal = distToSegment(lon, lat, -12.0, 18.0, -50.0, 14.0);
    const salPlume = Math.exp(-Math.pow(dSal / 6.0, 2.0)) * (80.0 + borealSummer * 70.0);
    const dGuin = distToSegment(lon, lat, -3.0, 5.5, 6.0, 6.5);
    const guineaBelt = Math.exp(-Math.pow(dGuin / 4.5, 2.0)) * (75.0 + borealWinter * 55.0);
    aqi += (bodele + westSahara + salPlume + guineaBelt);

    // 5. Europe & Americas
    const poValley = radialPlume(lon, lat, 10.5, 45.3, 3.8) * (70.0 + borealWinter * 65.0) * westernCleanAirFactor;
    const centralEuro = radialPlume(lon, lat, 15.0, 51.0, 6.0) * (50.0 + borealWinter * 45.0) * westernCleanAirFactor;
    const laBasin = radialPlume(lon, lat, -118.2, 34.0, 4.0) * (65.0 + borealSummer * 45.0) * westernCleanAirFactor;
    const mexCity = radialPlume(lon, lat, -99.1, 19.4, 4.5) * (90.0 + borealWinter * 75.0);
    const santiago = radialPlume(lon, lat, -70.6, -33.4, 3.8) * (80.0 + australDry * 65.0);
    const saoPaulo = radialPlume(lon, lat, -46.6, -23.5, 4.5) * (60.0 + australDry * 50.0);
    aqi += (poValley + centralEuro + laBasin + mexCity + santiago + saoPaulo);

    // 6. Wildfires & Australia
    const siberiaSmoke = radialPlume(lon, lat, 110.0, 60.0, 9.0) * borealSummer * 135.0 * wildfireClimateFactor;
    const canadaSmoke = radialPlume(lon, lat, -118.0, 56.0, 8.5) * borealSummer * 125.0 * wildfireClimateFactor;
    const amazonSmoke = radialPlume(lon, lat, -58.0, -9.0, 8.5) * australDry * 115.0 * wildfireClimateFactor;
    const ozUrban = radialPlume(lon, lat, 148.0, -35.0, 5.0) * (35.0 + australDry * 45.0);
    aqi += (siberiaSmoke + canadaSmoke + amazonSmoke + ozUrban);

    const polarClean = Math.max(0, Math.min(1, (Math.abs(lat) - 68.0) / 12.0));
    aqi = aqi * (1.0 - polarClean * 0.90) + 12.0 * (polarClean * 0.90);

    return `${Math.round(aqi)} AQI`;
  }, [isAirQualityActive, coordinate.latitude, coordinate.longitude, progressPercent, monthOfYear]);

  // Combined Active Layer Readouts for CoordinateDisplay
  const activeLayerReadouts = React.useMemo(() => {
    const readouts: { value: string; colorClass?: string }[] = [];
    if (centerAnomalyValue) {
      readouts.push({ value: centerAnomalyValue, colorClass: "text-aether-accent" });
    }
    if (centerPrecipitationValue) {
      readouts.push({ value: centerPrecipitationValue, colorClass: "text-sky-400" });
    }
    if (centerWindValue) {
      readouts.push({ value: centerWindValue, colorClass: "text-emerald-400" });
    }
    if (centerAqiValue) {
      readouts.push({ value: centerAqiValue, colorClass: "text-amber-400" });
    }
    return readouts;
  }, [centerAnomalyValue, centerPrecipitationValue, centerWindValue, centerAqiValue]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-aether-bg">
      {/* Pinned Top Navigation Bar (48px) */}
      <TopBar
        currentMode={mode}
        onModeChange={setMode}
        isLayerPanelOpen={isLayerPanelOpen}
        onToggleLayerPanel={() => setIsLayerPanelOpen((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        activeLayerName={activeLayerName}
      />

      {/* Slide-in Layer Panel (Left) */}
      <LayerPanel
        isOpen={isLayerPanelOpen}
        onClose={() => setIsLayerPanelOpen(false)}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        onChangeOpacity={handleChangeOpacity}
      />

      {/* Geographic Search Command Palette Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={(query) => {
          if (query.toLowerCase().includes("arctic")) {
            setCoordinate({ longitude: 0, latitude: 75.0 });
          } else {
            setCoordinate({ longitude: 2.1, latitude: 45.2 });
          }
        }}
      />

      {/* Persistent Spatial Canvas Container */}
      <SpatialViewport
        center={coordinate}
        zoom={zoom}
        resetOrientationTrigger={resetTrigger}
        playbackState={playback}
        playbackSpeed={playbackSpeed}
        isTemperatureActive={isTemperatureActive}
        temperatureOpacity={temperatureOpacity}
        isPrecipitationActive={isPrecipitationActive}
        precipitationOpacity={precipitationOpacity}
        isWindActive={isWindActive}
        windOpacity={windOpacity}
        isAirQualityActive={isAirQualityActive}
        airQualityOpacity={airQualityOpacity}
        progressPercent={progressPercent}
        monthOfYear={monthOfYear}
        onCoordinateChange={setCoordinate}
        onZoomChange={setZoom}
      />

      {/* Spatial Controls Stack (Bottom-Left above timeline) */}
      <div className="fixed bottom-[72px] left-4 z-controls">
        <ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetOrientation={handleResetOrientation}
        />
      </div>

      {/* Center Coordinates Readout Pill (Bottom-Center above timeline) */}
      <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-controls">
        <CoordinateDisplay
          coordinate={coordinate}
          activeLayerReadouts={activeLayerReadouts}
        />
      </div>

      {/* Calibrated Distance Scale Bar (Bottom-Right above timeline) */}
      <div className="fixed bottom-[72px] right-4 z-controls">
        <ScaleBar zoom={zoom} />
      </div>

      {/* Scientific Legends Stack (Top-Right below TopBar) */}
      {(isTemperatureActive || isPrecipitationActive || isWindActive || isAirQualityActive) && (
        <div className="fixed top-14 right-4 z-controls flex flex-col gap-2.5 items-end animate-in fade-in duration-300">
          {isTemperatureActive && (
            <ClimateLegend
              active={isTemperatureActive}
              opacity={temperatureOpacity}
              progressPercent={progressPercent}
            />
          )}
          {isPrecipitationActive && (
            <PrecipitationLegend
              active={isPrecipitationActive}
              opacity={precipitationOpacity}
              progressPercent={progressPercent}
            />
          )}
          {isWindActive && (
            <WindLegend
              active={isWindActive}
              opacity={windOpacity}
              progressPercent={progressPercent}
            />
          )}
          {isAirQualityActive && (
            <AirQualityLegend
              active={isAirQualityActive}
              opacity={airQualityOpacity}
              progressPercent={progressPercent}
            />
          )}
        </div>
      )}

      {/* Pinned Bottom Timeline Navigation Bar (56px) */}
      <TemporalRegion
        currentDate={currentDateDisplay}
        baselinePeriod="1991–2020 BASELINE"
        playbackState={playback}
        playbackSpeed={playbackSpeed}
        progressPercent={progressPercent}
        onTogglePlayback={handleTogglePlayback}
        onStepBack={handleStepBack}
        onStepForward={handleStepForward}
        onChangeSpeed={handleChangeSpeed}
        onSeek={handleSeek}
      />
    </div>
  );
}
