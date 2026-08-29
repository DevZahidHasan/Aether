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
    const t = Math.max(0, Math.min(1, progressPercent / 100));
    const globalTrend = 0.15 + (0.85 - 0.15) * Math.pow(t, 1.15);

    const lonRad = (lon * Math.PI) / 180;
    const wave4 = Math.sin(lonRad * 4.0 + t * Math.PI) * 0.85;
    const wave6 = Math.cos(lonRad * 6.0 - t * 2.0) * 0.45;
    const jetFactor = Math.max(0, Math.min(1, (lat - 30) / 28)) * (1 - Math.max(0, Math.min(1, (lat - 76) / 12)));
    const jetStreamWaves = (wave4 + wave6) * jetFactor;

    const arcticFactor = Math.max(0, Math.min(1, (lat - 52) / 23)) * (1 - Math.max(0, Math.min(1, (lat - 84) / 6)) * 0.35);
    const arcticAnomaly = arcticFactor * ((0.6 + 1.8 * t) + jetStreamWaves * 0.75);

    const eurasiaLat = Math.exp(-Math.pow((lat - 48) / 14, 2));
    const eurasiaLon = Math.exp(-Math.pow((lon - 38) / 30, 2));
    const eurasiaHeat = eurasiaLat * eurasiaLon * (0.4 + 1.9 * t);

    const naLat = Math.exp(-Math.pow((lat - 45) / 15, 2));
    const naLon = Math.exp(-Math.pow((lon + 98) / 28, 2));
    const naHeat = naLat * naLon * (0.3 + 1.7 * t);

    const ensoLat = Math.exp(-Math.pow(lat / 9, 2));
    const ensoLon = Math.exp(-Math.pow((lon + 130) / 40, 2));
    const ensoWave = Math.sin(t * 18.8495 + 1.2) * 1.5;
    const ensoAnomaly = ensoLat * ensoLon * ensoWave;

    const coldLat = Math.exp(-Math.pow((lat - 54) / 9, 2));
    const coldLon = Math.exp(-Math.pow((lon + 32) / 18, 2));
    const southCold = Math.max(0, Math.min(1, (-lat - 45) / 23)) * 0.8;
    const coldAnomaly = (coldLat * coldLon * 1.3 + southCold) * -1.0;

    const deltaT = globalTrend + arcticAnomaly + eurasiaHeat + naHeat + ensoAnomaly + coldAnomaly;
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
    return readouts;
  }, [centerAnomalyValue, centerPrecipitationValue, centerWindValue]);

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
      {(isTemperatureActive || isPrecipitationActive || isWindActive) && (
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
