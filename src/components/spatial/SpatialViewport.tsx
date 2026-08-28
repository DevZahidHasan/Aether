"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { GeoCoordinate, PlaybackState, ProjectionType } from "@/types/spatial";

// Client-only dynamic mount for Three.js WebGL canvas
const GlobeCanvas = dynamic(
  () => import("./globe/GlobeCanvas").then((mod) => mod.GlobeCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="w-48 h-48 border border-dashed border-aether-accent/30 rounded-full animate-spin flex items-center justify-center" style={{ animationDuration: "10s" }}>
          <div className="w-24 h-24 border border-aether-border rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-aether-accent animate-pulse" />
          </div>
        </div>
        <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-aether-fg-muted">
          INITIALIZING SPATIAL ENGINE...
        </div>
      </div>
    ),
  }
);

export interface SpatialViewportProps {
  center?: GeoCoordinate;
  zoom?: number;
  projection?: ProjectionType;
  resetOrientationTrigger?: number;
  playbackState?: PlaybackState;
  playbackSpeed?: number;
  isTemperatureActive?: boolean;
  temperatureOpacity?: number;
  isPrecipitationActive?: boolean;
  precipitationOpacity?: number;
  progressPercent?: number;
  monthOfYear?: number;
  onCoordinateChange?: (coord: GeoCoordinate) => void;
  onZoomChange?: (zoom: number) => void;
  className?: string;
  children?: React.ReactNode;
}

export function SpatialViewport({
  center = { longitude: 0, latitude: 20 },
  zoom = 1.0,
  projection = "globe-3d",
  resetOrientationTrigger = 0,
  playbackState = "paused",
  playbackSpeed = 1,
  isTemperatureActive = true,
  temperatureOpacity = 0.75,
  isPrecipitationActive = false,
  precipitationOpacity = 0.65,
  progressPercent = 85,
  monthOfYear = 1.0,
  onCoordinateChange,
  onZoomChange,
  className = "",
  children,
}: SpatialViewportProps) {
  return (
    <main
      role="region"
      aria-label={`Planetary spatial viewport, projection: ${projection}, center: ${center.latitude}° lat, ${center.longitude}° lon, scale: ${zoom}x`}
      data-projection={projection}
      data-zoom={zoom}
      data-lat={center.latitude}
      data-lon={center.longitude}
      className={`relative w-full h-full overflow-hidden bg-aether-bg select-none ${className}`}
    >
      {/* WebGL Spatial Engine Canvas Container */}
      <div
        id="aether-spatial-engine"
        className="absolute inset-0 z-globe"
      >
        {children || (
          <GlobeCanvas
            zoom={zoom}
            resetOrientationTrigger={resetOrientationTrigger}
            playbackState={playbackState}
            playbackSpeed={playbackSpeed}
            isTemperatureActive={isTemperatureActive}
            temperatureOpacity={temperatureOpacity}
            isPrecipitationActive={isPrecipitationActive}
            precipitationOpacity={precipitationOpacity}
            progressPercent={progressPercent}
            monthOfYear={monthOfYear}
            onCoordinateChange={onCoordinateChange}
            onZoomChange={onZoomChange}
          />
        )}
      </div>
    </main>
  );
}
