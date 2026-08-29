"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GlobeScene } from "./GlobeScene";
import type { GeoCoordinate, PlaybackState } from "@/types/spatial";

export interface GlobeCanvasProps {
  zoom?: number;
  resetOrientationTrigger?: number;
  playbackState?: PlaybackState;
  playbackSpeed?: number;
  isTemperatureActive?: boolean;
  temperatureOpacity?: number;
  isPrecipitationActive?: boolean;
  precipitationOpacity?: number;
  isWindActive?: boolean;
  windOpacity?: number;
  isAirQualityActive?: boolean;
  airQualityOpacity?: number;
  progressPercent?: number;
  monthOfYear?: number;
  mode?: "explore" | "inspect";
  inspectedPoint?: { lat: number; lon: number } | null;
  flyToCoord?: { lat: number; lon: number; timestamp: number } | null;
  onSelectPoint?: (point: { lat: number; lon: number }) => void;
  onCoordinateChange?: (coord: GeoCoordinate) => void;
  onZoomChange?: (zoom: number) => void;
}

function GlobeLoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
      <div className="w-48 h-48 border border-dashed border-aether-accent/40 rounded-full animate-spin flex items-center justify-center" style={{ animationDuration: "8s" }}>
        <div className="w-32 h-32 border border-aether-border rounded-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-aether-accent animate-pulse" />
        </div>
      </div>
      <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-aether-fg-muted">
        STREAMING NASA BLUE MARBLE...
      </div>
    </div>
  );
}

export function GlobeCanvas({
  zoom = 1.0,
  resetOrientationTrigger = 0,
  playbackState = "paused",
  playbackSpeed = 1,
  isTemperatureActive = true,
  temperatureOpacity = 0.75,
  isPrecipitationActive = false,
  precipitationOpacity = 0.65,
  isWindActive = false,
  windOpacity = 0.8,
  isAirQualityActive = false,
  airQualityOpacity = 0.7,
  progressPercent = 85,
  monthOfYear = 1.0,
  mode = "explore",
  inspectedPoint = null,
  flyToCoord = null,
  onSelectPoint,
  onCoordinateChange,
  onZoomChange,
}: GlobeCanvasProps) {
  const cursorStyle = mode === "inspect" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing";

  return (
    <div className="relative w-full h-full">
      <Suspense fallback={<GlobeLoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0, 4.8], fov: 45 }}
          dpr={[1, 2]}
          performance={{ min: 0.6 }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
          }}
          className={`w-full h-full ${cursorStyle}`}
        >
          <GlobeScene
            zoom={zoom}
            resetOrientationTrigger={resetOrientationTrigger}
            playbackState={playbackState}
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
            mode={mode}
            inspectedPoint={inspectedPoint}
            flyToCoord={flyToCoord}
            onSelectPoint={onSelectPoint}
            onCoordinateChange={onCoordinateChange}
            onZoomChange={onZoomChange}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
