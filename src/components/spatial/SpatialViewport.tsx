import React from "react";
import type { GeoCoordinate, ProjectionType } from "@/types/spatial";

export interface SpatialViewportProps {
  center?: GeoCoordinate;
  zoom?: number;
  projection?: ProjectionType;
  className?: string;
  children?: React.ReactNode;
}

export function SpatialViewport({
  center = { longitude: 0, latitude: 20 },
  zoom = 1.0,
  projection = "globe-3d",
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
      {/* 
        WebGL Spatial Engine Mount Point (Phase 3)
        Will mount Three.js / React Three Fiber Canvas here.
      */}
      <div
        id="aether-spatial-engine"
        className="absolute inset-0 z-globe flex items-center justify-center pointer-events-auto"
      >
        {children || (
          <div className="relative flex flex-col items-center justify-center pointer-events-none opacity-40">
            {/* Minimal Instrument Reticle */}
            <div className="w-64 h-64 border border-dashed border-aether-border rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border border-aether-border-subtle rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-aether-accent opacity-60" />
              </div>
            </div>
            <div className="mt-4 font-mono text-[11px] tracking-widest text-aether-fg-muted uppercase">
              Spatial Engine [Mount: {projection}]
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
