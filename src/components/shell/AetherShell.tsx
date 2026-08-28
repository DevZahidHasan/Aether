"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/navigation/TopBar";
import { LayerPanel, type LayerItemConfig } from "@/components/data/LayerPanel";
import { SearchOverlay } from "@/components/navigation/SearchOverlay";
import { SpatialViewport } from "@/components/spatial/SpatialViewport";
import { ZoomControls } from "@/components/controls/ZoomControls";
import { CoordinateDisplay } from "@/components/controls/CoordinateDisplay";
import { ScaleBar } from "@/components/controls/ScaleBar";
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
  const [coordinate, setCoordinate] = useState<GeoCoordinate>({
    longitude: 2.1,
    latitude: 45.2,
  });

  // Climate Layers State
  const [layers, setLayers] = useState<LayerItemConfig[]>(INITIAL_LAYERS);

  // Temporal State
  const [playback, setPlayback] = useState<PlaybackState>("paused");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(85);

  // Active layer name for TopBar indicator
  const activeLayer = layers.find((l) => l.active);

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-aether-bg">
      {/* Pinned Top Navigation Bar (48px) */}
      <TopBar
        currentMode={mode}
        onModeChange={setMode}
        isLayerPanelOpen={isLayerPanelOpen}
        onToggleLayerPanel={() => setIsLayerPanelOpen((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        activeLayerName={activeLayer ? activeLayer.name : null}
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
      <SpatialViewport center={coordinate} zoom={zoom} />

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
        <CoordinateDisplay coordinate={coordinate} />
      </div>

      {/* Calibrated Distance Scale Bar (Bottom-Right above timeline) */}
      <div className="fixed bottom-[72px] right-4 z-controls">
        <ScaleBar zoom={zoom} />
      </div>

      {/* Pinned Bottom Timeline Navigation Bar (56px) */}
      <TemporalRegion
        currentDate="AUGUST 2026"
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
